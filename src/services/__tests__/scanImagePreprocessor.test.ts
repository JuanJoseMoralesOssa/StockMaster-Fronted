// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  optimizeScanImage,
  SCAN_IMAGE_JPEG_QUALITY,
  SCAN_IMAGE_MAX_DIMENSION,
  SCAN_IMAGE_OUTPUT_TYPE,
} from "../scanImagePreprocessor";

const originalCreateElement = document.createElement.bind(document);

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
});
