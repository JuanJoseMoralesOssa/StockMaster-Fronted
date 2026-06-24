// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  optimizeScanImage,
  SCAN_IMAGE_JPEG_QUALITY,
  SCAN_IMAGE_MAX_DIMENSION,
  SCAN_IMAGE_OUTPUT_TYPE,
  suggestScanImageCropFromPixels,
} from "../scanImagePreprocessor";

const originalCreateElement = document.createElement.bind(document);

function buildSyntheticJaagImage(
  paperColor: [number, number, number],
  borderBlue: [number, number, number] = [0x86, 0x92, 0xa2],
) {
  const width = 200;
  const height = 300;
  const pixels = new Uint8ClampedArray(width * height * 4);

  for (let index = 0; index < pixels.length; index += 4) {
    pixels[index] = 185;
    pixels[index + 1] = 165;
    pixels[index + 2] = 135;
    pixels[index + 3] = 255;
  }

  const paintPixel = (
    x: number,
    y: number,
    color: [number, number, number],
  ) => {
    const offset = (y * width + x) * 4;
    pixels[offset] = color[0];
    pixels[offset + 1] = color[1];
    pixels[offset + 2] = color[2];
    pixels[offset + 3] = 255;
  };
  const paintLine = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: [number, number, number],
  ) => {
    for (let y = y1; y <= y2; y += 1) {
      for (let x = x1; x <= x2; x += 1) {
        paintPixel(x, y, color);
      }
    }
  };

  paintLine(6, 38, 192, 140, paperColor);
  paintLine(8, 42, 188, 44, borderBlue);
  paintLine(8, 135, 188, 138, [0x37, 0x4c, 0x7d]);
  paintLine(8, 42, 10, 138, borderBlue);
  paintLine(186, 42, 188, 138, borderBlue);
  paintLine(35, 72, 170, 74, [0x84, 0x89, 0x91]);
  paintLine(45, 92, 180, 94, [0x89, 0x8f, 0x93]);
  paintLine(20, 115, 150, 117, borderBlue);

  // Blue-ish lower distractor, similar to clothing in the sample photo.
  paintLine(0, 230, 35, 260, [30, 45, 95]);

  return { pixels, width, height };
}

describe("optimizeScanImage", () => {
  let drawImage: ReturnType<typeof vi.fn>;
  let close: ReturnType<typeof vi.fn>;
  let toBlobCalls: Array<{ type?: string; quality?: unknown }>;

  beforeEach(() => {
    drawImage = vi.fn();
    close = vi.fn();
    toBlobCalls = [];

    vi.stubGlobal(
      "createImageBitmap",
      vi.fn(async () => ({
        width: 2800,
        height: 1400,
        close,
      })),
    );

    vi.spyOn(document, "createElement").mockImplementation(
      (tagName: string) => {
        if (tagName !== "canvas") return originalCreateElement(tagName);

        const canvas = originalCreateElement("canvas") as HTMLCanvasElement;
        vi.spyOn(canvas, "getContext").mockReturnValue({
          drawImage,
        } as unknown as CanvasRenderingContext2D);
        vi.spyOn(canvas, "toBlob").mockImplementation(
          (callback, type, quality) => {
            toBlobCalls.push({ type, quality });
            callback(
              new Blob(["optimized"], { type: type ?? SCAN_IMAGE_OUTPUT_TYPE }),
            );
          },
        );
        return canvas;
      },
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("reduces a large image to the configured longest side", async () => {
    const original = new File(["original"], "formulario.png", {
      type: "image/png",
      lastModified: 123,
    });

    const optimized = await optimizeScanImage(original);

    expect(drawImage).toHaveBeenCalledWith(
      expect.any(Object),
      0,
      0,
      2800,
      1400,
      0,
      0,
      SCAN_IMAGE_MAX_DIMENSION,
      900,
    );
    expect(optimized.name).toBe("formulario.jpg");
    expect(optimized.type).toBe(SCAN_IMAGE_OUTPUT_TYPE);
    expect(optimized.lastModified).toBe(123);
    expect(toBlobCalls[0]).toEqual({
      type: SCAN_IMAGE_OUTPUT_TYPE,
      quality: SCAN_IMAGE_JPEG_QUALITY,
    });
    expect(close).toHaveBeenCalled();
  });

  it("does not upscale small images", async () => {
    vi.mocked(createImageBitmap).mockResolvedValueOnce({
      width: 900,
      height: 600,
      close,
    } as unknown as ImageBitmap);

    await optimizeScanImage(
      new File(["small"], "small.jpg", { type: "image/jpeg" }),
    );

    expect(drawImage).toHaveBeenCalledWith(
      expect.any(Object),
      0,
      0,
      900,
      600,
      0,
      0,
      900,
      600,
    );
  });

  it("crops before resizing when crop percentages are provided", async () => {
    await optimizeScanImage(
      new File(["cropped"], "cropped.png", { type: "image/png" }),
      {
        crop: { left: 0.1, top: 0.2, right: 0.1, bottom: 0.2 },
      },
    );

    expect(drawImage).toHaveBeenCalledWith(
      expect.any(Object),
      280,
      280,
      2240,
      840,
      0,
      0,
      1800,
      675,
    );
  });

  it("falls back to an image element when createImageBitmap rejects", async () => {
    vi.mocked(createImageBitmap).mockRejectedValueOnce(
      new Error("decode failed"),
    );
    const originalImage = globalThis.Image;
    class FakeImage {
      decoding = "async";
      src = "";
      naturalWidth = 800;
      naturalHeight = 400;
      async decode() {
        return undefined;
      }
    }
    vi.stubGlobal("Image", FakeImage);
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:test"),
      revokeObjectURL: vi.fn(),
    });

    await optimizeScanImage(
      new File(["fallback"], "fallback.png", { type: "image/png" }),
    );

    expect(drawImage).toHaveBeenCalledWith(
      expect.any(FakeImage),
      0,
      0,
      800,
      400,
      0,
      0,
      800,
      400,
    );
    vi.stubGlobal("Image", originalImage);
  });

  it("suggests the J.A.A.G form crop from paper and blue border palettes", () => {
    const litPaper: [number, number, number] = [0xf1, 0xef, 0xe3];
    const shadowPaper: [number, number, number] = [0xd0, 0xc9, 0xb9];
    const sample = buildSyntheticJaagImage(litPaper);
    for (let y = 96; y <= 140; y += 1) {
      for (let x = 6; x <= 192; x += 1) {
        const offset = (y * sample.width + x) * 4;
        sample.pixels[offset] = shadowPaper[0];
        sample.pixels[offset + 1] = shadowPaper[1];
        sample.pixels[offset + 2] = shadowPaper[2];
      }
    }

    const crop = suggestScanImageCropFromPixels(
      sample.pixels,
      sample.width,
      sample.height,
    );

    expect(crop).not.toBeNull();
    expect(crop?.top).toBeLessThan(0.18);
    expect(crop?.bottom).toBeGreaterThan(0.5);
    expect(crop?.left).toBeLessThan(0.08);
    expect(crop?.right).toBeLessThan(0.08);
  });

  it.each([
    ["fully lit paper", [0xf6, 0xf6, 0xea] as [number, number, number]],
    ["fully shadowed paper", [0xce, 0xc8, 0xba] as [number, number, number]],
  ])("suggests crop for %s", (_name, paperColor) => {
    const { pixels, width, height } = buildSyntheticJaagImage(paperColor);

    const crop = suggestScanImageCropFromPixels(pixels, width, height);

    expect(crop).not.toBeNull();
    expect(crop?.top).toBeLessThan(0.18);
    expect(crop?.bottom).toBeGreaterThan(0.5);
  });

  it("suggests crop when the form blue is lit", () => {
    const { pixels, width, height } = buildSyntheticJaagImage(
      [0xf6, 0xf6, 0xea],
      [0x9f, 0xab, 0xb8],
    );

    const crop = suggestScanImageCropFromPixels(pixels, width, height);

    expect(crop).not.toBeNull();
    expect(crop?.top).toBeLessThan(0.18);
    expect(crop?.bottom).toBeGreaterThan(0.5);
  });
});
