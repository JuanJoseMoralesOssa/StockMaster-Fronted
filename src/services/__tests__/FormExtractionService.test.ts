// @vitest-environment jsdom
import MockAdapter from "axios-mock-adapter";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formExtractionService } from "../FormExtractionService";
import { httpClient } from "../httpClient";
import { optimizeScanImage } from "../scanImagePreprocessor";

vi.mock("../scanImagePreprocessor", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../scanImagePreprocessor")>();
  return {
    ...actual,
    optimizeScanImage: vi.fn(),
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
    vi.mocked(optimizeScanImage).mockResolvedValue(optimized);

    mock.onPost(/purchases\/extract$/).reply((config) => {
      expect(config.data).toBeInstanceOf(FormData);
      expect((config.data as FormData).get("image")).toBe(optimized);
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

    expect(optimizeScanImage).toHaveBeenCalledWith(original, {});
  });

  it("passes crop options to the image optimizer", async () => {
    const original = new File(["original"], "receipt.png", {
      type: "image/png",
    });
    const optimized = new File(["optimized"], "receipt.jpg", {
      type: "image/jpeg",
    });
    const crop = { left: 0.1, top: 0.2, right: 0.1, bottom: 0.3 };
    vi.mocked(optimizeScanImage).mockResolvedValue(optimized);

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

    expect(optimizeScanImage).toHaveBeenCalledWith(original, { crop });
  });
});
