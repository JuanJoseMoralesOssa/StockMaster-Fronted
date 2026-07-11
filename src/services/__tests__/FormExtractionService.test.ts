// @vitest-environment jsdom
import MockAdapter from "axios-mock-adapter";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  EXTRACTION_BACKEND_BUDGET_MS,
  EXTRACTION_HTTP_TIMEOUT_MS,
  formExtractionService,
} from "../FormExtractionService";
import { httpClient } from "../httpClient";
import { optimizeScanImageWithMetadata } from "../scanImagePreprocessor";

vi.mock("../scanImagePreprocessor", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../scanImagePreprocessor")>();
  return {
    ...actual,
    optimizeScanImageWithMetadata: vi.fn(),
  };
});

describe("FormExtractionService", () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(httpClient);
  });

  afterEach(() => {
    mock.restore();
    vi.clearAllMocks();
  });

  it("sends the optimized image as multipart without forcing Content-Type", async () => {
    const original = new File(["original"], "receipt.png", {
      type: "image/png",
    });
    const optimized = new File(["optimized"], "receipt.jpg", {
      type: "image/jpeg",
    });
    vi.mocked(optimizeScanImageWithMetadata).mockResolvedValue({
      file: optimized,
      metadata: {
        original: { width: 100, height: 80, sizeBytes: 8, type: "image/png" },
        cropRect: { x: 0, y: 0, width: 100, height: 80 },
        output: {
          width: 100,
          height: 80,
          sizeBytes: 9,
          type: "image/jpeg",
          quality: 0.82,
        },
      },
    });

    mock.onPost(/purchases\/extract$/).reply((config) => {
      expect(config.data).toBeInstanceOf(FormData);
      expect((config.data as FormData).get("image")).toBe(optimized);
      expect((config.data as FormData).get("optimizedSizeBytes")).toBe("9");
      expect((config.data as FormData).get("optimizedWidth")).toBe("100");
      expect((config.data as FormData).get("optimizedHeight")).toBe("80");
      expect((config.data as FormData).get("cropX")).toBe("0");
      expect((config.data as FormData).get("cropY")).toBe("0");
      expect((config.data as FormData).get("cropWidth")).toBe("100");
      expect((config.data as FormData).get("cropHeight")).toBe("80");
      expect(config.headers?.["Content-Type"]).toBe(false);

      return [
        200,
        {
          date: { value: null, confidence: 0, needsReview: true },
          librasTotal: { value: null, confidence: 0 },
          supplier: {
            rawName: null,
            confidence: 0,
            needsReview: true,
            candidates: [],
          },
          details: [],
          totalWeightCheck: { passed: false, formTotalLb: null, sumLb: 0 },
          needsReview: true,
          reviewReasons: [],
        },
      ];
    });

    await formExtractionService.extractFromImage(original);

    expect(optimizeScanImageWithMetadata).toHaveBeenCalledWith(original, {});
  });

  it("passes crop options to the image optimizer", async () => {
    const original = new File(["original"], "receipt.png", {
      type: "image/png",
    });
    const optimized = new File(["optimized"], "receipt.jpg", {
      type: "image/jpeg",
    });
    const crop = { left: 0.1, top: 0.2, right: 0.1, bottom: 0.3 };
    vi.mocked(optimizeScanImageWithMetadata).mockResolvedValue({
      file: optimized,
      metadata: {
        original: { width: 100, height: 80, sizeBytes: 8, type: "image/png" },
        cropRect: { x: 10, y: 16, width: 80, height: 40 },
        output: {
          width: 80,
          height: 40,
          sizeBytes: 9,
          type: "image/jpeg",
          quality: 0.82,
        },
      },
    });

    mock.onPost(/purchases\/extract$/).reply(200, {
      date: { value: null, confidence: 0, needsReview: true },
      librasTotal: { value: null, confidence: 0 },
      supplier: {
        rawName: null,
        confidence: 0,
        needsReview: true,
        candidates: [],
      },
      details: [],
      totalWeightCheck: { passed: false, formTotalLb: null, sumLb: 0 },
      needsReview: true,
      reviewReasons: [],
    });

    await formExtractionService.extractFromImage(original, { crop });

    expect(optimizeScanImageWithMetadata).toHaveBeenCalledWith(original, {
      crop,
    });
  });

  it("passes the abort signal through to the HTTP request", async () => {
    const original = new File(["original"], "receipt.png", {
      type: "image/png",
    });
    const optimized = new File(["optimized"], "receipt.jpg", {
      type: "image/jpeg",
    });
    vi.mocked(optimizeScanImageWithMetadata).mockResolvedValue({
      file: optimized,
      metadata: {
        original: { width: 100, height: 80, sizeBytes: 8, type: "image/png" },
        cropRect: { x: 0, y: 0, width: 100, height: 80 },
        output: {
          width: 100,
          height: 80,
          sizeBytes: 9,
          type: "image/jpeg",
          quality: 0.82,
        },
      },
    });

    const controller = new AbortController();
    mock.onPost(/purchases\/extract$/).reply((config) => {
      expect(config.signal).toBe(controller.signal);
      return [
        200,
        {
          date: { value: null, confidence: 0, needsReview: true },
          librasTotal: { value: null, confidence: 0 },
          supplier: {
            rawName: null,
            confidence: 0,
            needsReview: true,
            candidates: [],
          },
          details: [],
          totalWeightCheck: { passed: false, formTotalLb: null, sumLb: 0 },
          needsReview: true,
          reviewReasons: [],
        },
      ];
    });

    await formExtractionService.extractFromImage(original, {
      signal: controller.signal,
    });

    // The signal must not leak into the image-optimizer options.
    expect(optimizeScanImageWithMetadata).toHaveBeenCalledWith(original, {});
  });
});

// El backend prueba varios modelos de visión en cadena y Gemini le factura cada
// intento. Cortar antes de que agote su presupuesto paga la cadena entera y tira
// el resultado: la relación entre los dos timeouts es la que evita ese gasto.
describe("presupuesto de extracción", () => {
  it("espera más de lo que el backend tarda en agotar su cadena de modelos", () => {
    expect(EXTRACTION_HTTP_TIMEOUT_MS).toBeGreaterThan(
      EXTRACTION_BACKEND_BUDGET_MS,
    );
  });
});
