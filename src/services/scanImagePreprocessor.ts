export const SCAN_IMAGE_MAX_DIMENSION = 1800;
export const SCAN_IMAGE_JPEG_QUALITY = 0.82;
export const SCAN_IMAGE_OUTPUT_TYPE = "image/jpeg";

export interface ScanImageCrop {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface ScanImagePreprocessOptions {
  crop?: ScanImageCrop;
}

export interface ScanImageOptimizationMetadata {
  original: {
    width: number;
    height: number;
    sizeBytes: number;
    type: string;
  };
  cropRect: CropRect;
  output: {
    width: number;
    height: number;
    sizeBytes: number;
    type: string;
    quality: number;
  };
}

export interface ScanImageOptimizationResult {
  file: File;
  metadata: ScanImageOptimizationMetadata;
}

export interface ScanImageCropDiagnostics {
  blueDetected: boolean;
  paperDetected: boolean;
  valid: boolean;
  reason: string;
  bluePixelsInside: number;
}

export interface ScanImageCropAnalysis {
  crop: ScanImageCrop | null;
  diagnostics: ScanImageCropDiagnostics;
}

interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

type Rgb = readonly [number, number, number];

const JAAG_PAPER_COLORS: Rgb[] = [
  [0xf1, 0xef, 0xe3],
  [0xf6, 0xf6, 0xea],
  [0xea, 0xea, 0xdc],
  [0xf2, 0xf2, 0xe6],
  [0xcf, 0xc5, 0xb8],
  [0xce, 0xc8, 0xba],
  [0xd0, 0xc9, 0xb9],
];

const JAAG_FORM_BLUE_COLORS: Rgb[] = [
  [0x37, 0x4c, 0x7d],
  [0x45, 0x5a, 0x82],
  [0x60, 0x6f, 0x88],
  [0x86, 0x92, 0xa2],
  [0x84, 0x89, 0x91],
  [0x89, 0x8f, 0x93],
  [0x9f, 0xab, 0xb8],
];

function getOutputFilename(filename: string): string {
  const base = filename.replace(/\.[^.]*$/, "") || "scan";
  return `${base}.jpg`;
}

function calculateSize(width: number, height: number, maxDimension: number) {
  const longestSide = Math.max(width, height);
  if (longestSide <= maxDimension) return { width, height };

  const scale = maxDimension / longestSide;
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

function clampCropSide(value: number): number {
  return Math.min(0.85, Math.max(0, Number.isFinite(value) ? value : 0));
}

export function normalizeScanImageCrop(
  crop?: Partial<ScanImageCrop>,
): ScanImageCrop {
  let left = clampCropSide(crop?.left ?? 0);
  let right = clampCropSide(crop?.right ?? 0);
  let top = clampCropSide(crop?.top ?? 0);
  let bottom = clampCropSide(crop?.bottom ?? 0);

  const horizontal = left + right;
  if (horizontal > 0.9) {
    const scale = 0.9 / horizontal;
    left *= scale;
    right *= scale;
  }

  const vertical = top + bottom;
  if (vertical > 0.9) {
    const scale = 0.9 / vertical;
    top *= scale;
    bottom *= scale;
  }

  return { left, top, right, bottom };
}

function calculateCropRect(
  width: number,
  height: number,
  crop?: ScanImageCrop,
): CropRect {
  const normalized = normalizeScanImageCrop(crop);
  const x = Math.round(width * normalized.left);
  const y = Math.round(height * normalized.top);
  const cropWidth = Math.max(
    1,
    Math.round(width * (1 - normalized.left - normalized.right)),
  );
  const cropHeight = Math.max(
    1,
    Math.round(height * (1 - normalized.top - normalized.bottom)),
  );

  return { x, y, width: cropWidth, height: cropHeight };
}

function rectToCrop(
  rect: CropRect,
  width: number,
  height: number,
): ScanImageCrop {
  return normalizeScanImageCrop({
    left: rect.x / width,
    top: rect.y / height,
    right: (width - rect.x - rect.width) / width,
    bottom: (height - rect.y - rect.height) / height,
  });
}

function smoothScores(scores: number[]): number[] {
  return scores.map((score, index) => {
    const previous = scores[index - 1] ?? 0;
    const next = scores[index + 1] ?? 0;
    return previous * 0.25 + score * 0.5 + next * 0.25;
  });
}

function colorDistanceSquared(
  red: number,
  green: number,
  blue: number,
  target: Rgb,
) {
  return (
    Math.pow(red - target[0], 2) +
    Math.pow(green - target[1], 2) +
    Math.pow(blue - target[2], 2)
  );
}

function isNearAnyPaletteColor(
  red: number,
  green: number,
  blue: number,
  palette: Rgb[],
  maxDistance: number,
): boolean {
  const maxDistanceSquared = maxDistance * maxDistance;
  return palette.some(
    (color) =>
      colorDistanceSquared(red, green, blue, color) <= maxDistanceSquared,
  );
}

function looksLikeJaagPaper(red: number, green: number, blue: number): boolean {
  const brightness = (red + green + blue) / 3;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const saturation = max - min;
  const warmNeutral =
    red >= blue - 8 &&
    green >= blue - 20 &&
    red >= green - 18 &&
    Math.abs(red - green) <= 34;

  return (
    brightness >= 145 &&
    brightness <= 252 &&
    saturation <= 62 &&
    warmNeutral &&
    (isNearAnyPaletteColor(red, green, blue, JAAG_PAPER_COLORS, 52) ||
      brightness >= 182)
  );
}

function looksLikeJaagFormBlue(
  red: number,
  green: number,
  blue: number,
): boolean {
  const brightness = (red + green + blue) / 3;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const saturation = max - min;
  const neutralBlueGray = blue >= red + 4 && blue >= green - 8;

  return (
    brightness >= 45 &&
    brightness <= 205 &&
    saturation >= 8 &&
    saturation <= 95 &&
    neutralBlueGray &&
    isNearAnyPaletteColor(red, green, blue, JAAG_FORM_BLUE_COLORS, 58)
  );
}

function getBoundsFromScores(
  scores: number[],
  threshold: number,
): { start: number; end: number } | null {
  const smoothed = smoothScores(scores);
  let start = -1;
  let end = -1;

  for (let index = 0; index < smoothed.length; index += 1) {
    if (smoothed[index] >= threshold) {
      if (start === -1) start = index;
      end = index;
    }
  }

  return start === -1 ? null : { start, end };
}

function buildCropAnalysis(
  crop: ScanImageCrop | null,
  diagnostics: Omit<ScanImageCropDiagnostics, "valid"> & { valid?: boolean },
): ScanImageCropAnalysis {
  return {
    crop,
    diagnostics: {
      ...diagnostics,
      valid: diagnostics.valid ?? Boolean(crop),
    },
  };
}

export function analyzeScanImageCropFromPixels(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
): ScanImageCropAnalysis {
  const blueRowScores = new Array<number>(height).fill(0);
  const blueColScores = new Array<number>(width).fill(0);
  const paperRowScores = new Array<number>(height).fill(0);
  const paperColScores = new Array<number>(width).fill(0);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 4;
      const red = pixels[offset];
      const green = pixels[offset + 1];
      const blue = pixels[offset + 2];

      if (looksLikeJaagFormBlue(red, green, blue)) {
        blueRowScores[y] += 1;
        blueColScores[x] += 1;
      }

      if (looksLikeJaagPaper(red, green, blue)) {
        paperRowScores[y] += 1;
        paperColScores[x] += 1;
      }
    }
  }

  const blueRowBand =
    getBoundsFromScores(blueRowScores, Math.max(2, width * 0.012)) ??
    getBoundsFromScores(blueRowScores, Math.max(1, width * 0.006));
  if (!blueRowBand) {
    return buildCropAnalysis(null, {
      blueDetected: false,
      paperDetected: false,
      reason: "No se detecto el borde azul horizontal del formulario",
      bluePixelsInside: 0,
    });
  }

  const blueColBand =
    getBoundsFromScores(blueColScores, Math.max(2, height * 0.006)) ??
    getBoundsFromScores(blueColScores, Math.max(1, height * 0.003));
  if (!blueColBand) {
    return buildCropAnalysis(null, {
      blueDetected: false,
      paperDetected: false,
      reason: "No se detecto el borde azul vertical del formulario",
      bluePixelsInside: 0,
    });
  }

  const paperColScoresInBlueArea = new Array<number>(width).fill(0);
  const paperRowScoresInBlueArea = new Array<number>(height).fill(0);
  const xStart = Math.max(0, blueColBand.start - Math.round(width * 0.08));
  const xEnd = Math.min(width - 1, blueColBand.end + Math.round(width * 0.08));
  const yStart = Math.max(0, blueRowBand.start - Math.round(height * 0.08));
  const yEnd = Math.min(
    height - 1,
    blueRowBand.end + Math.round(height * 0.08),
  );

  for (let y = yStart; y <= yEnd; y += 1) {
    for (let x = xStart; x <= xEnd; x += 1) {
      const offset = (y * width + x) * 4;
      if (
        looksLikeJaagPaper(
          pixels[offset],
          pixels[offset + 1],
          pixels[offset + 2],
        )
      ) {
        paperColScoresInBlueArea[x] += 1;
        paperRowScoresInBlueArea[y] += 1;
      }
    }
  }

  const paperRowBand =
    getBoundsFromScores(paperRowScoresInBlueArea, Math.max(2, width * 0.16)) ??
    getBoundsFromScores(paperRowScores, Math.max(2, width * 0.14));
  const paperColBand =
    getBoundsFromScores(
      paperColScoresInBlueArea,
      Math.max(2, (yEnd - yStart) * 0.2),
    ) ?? getBoundsFromScores(paperColScores, Math.max(2, height * 0.08));
  if (!paperRowBand || !paperColBand) {
    return buildCropAnalysis(null, {
      blueDetected: true,
      paperDetected: false,
      reason:
        "No se detecto suficiente papel del formulario alrededor del azul",
      bluePixelsInside: 0,
    });
  }

  const horizontalPadding = Math.round(width * 0.015);
  const verticalPadding = Math.round(height * 0.015);
  const maxExpectedPaperAboveBlue = Math.round(height * 0.06);
  const blueAnchoredTop = Math.max(
    0,
    blueRowBand.start - Math.round(height * 0.04),
  );
  const paperStartsTooFarAboveBlue =
    blueRowBand.start - paperRowBand.start > maxExpectedPaperAboveBlue;
  const x = Math.max(0, paperColBand.start - horizontalPadding);
  const y = Math.max(
    0,
    (paperStartsTooFarAboveBlue ? blueAnchoredTop : paperRowBand.start) -
      verticalPadding,
  );
  const right = Math.min(width - 1, paperColBand.end + horizontalPadding);
  const bottom = Math.min(height - 1, paperRowBand.end + verticalPadding);
  let bluePixelsInside = 0;
  for (let row = y; row <= bottom; row += 1) {
    for (let col = x; col <= right; col += 1) {
      const offset = (row * width + col) * 4;
      if (
        looksLikeJaagFormBlue(
          pixels[offset],
          pixels[offset + 1],
          pixels[offset + 2],
        )
      ) {
        bluePixelsInside += 1;
      }
    }
  }
  if (bluePixelsInside < Math.max(24, width * height * 0.001)) {
    return buildCropAnalysis(null, {
      blueDetected: true,
      paperDetected: true,
      reason: "El azul detectado no alcanza para validar el formulario",
      bluePixelsInside,
    });
  }

  const rect = {
    x,
    y,
    width: Math.max(1, right - x + 1),
    height: Math.max(1, bottom - y + 1),
  };

  const crop = rectToCrop(rect, width, height);
  const visibleCrop = Object.values(crop).some((value) => value > 0.02)
    ? crop
    : null;

  return buildCropAnalysis(visibleCrop, {
    blueDetected: true,
    paperDetected: true,
    valid: Boolean(visibleCrop),
    reason: visibleCrop
      ? "Formulario detectado"
      : "El formulario ocupa casi toda la imagen; no se aplico recorte",
    bluePixelsInside,
  });
}

export function suggestScanImageCropFromPixels(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
): ScanImageCrop | null {
  return analyzeScanImageCropFromPixels(pixels, width, height).crop;
}

function blobToFile(blob: Blob, originalFile: File): File {
  return new File([blob], getOutputFilename(originalFile.name), {
    type: SCAN_IMAGE_OUTPUT_TYPE,
    lastModified: originalFile.lastModified,
  });
}

async function decodeWithImageElement(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.decoding = "async";
    image.src = url;
    await image.decode();
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function decodeImage(
  file: File,
): Promise<ImageBitmap | HTMLImageElement> {
  if ("createImageBitmap" in window) {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      // Some browsers expose createImageBitmap but reject specific camera
      // encodings. The image element decoder can still handle many of them.
    }
  }

  return decodeWithImageElement(file);
}

export async function suggestScanImageCrop(
  file: File,
): Promise<ScanImageCrop | null> {
  return (await analyzeScanImageCrop(file)).crop;
}

export async function analyzeScanImageCrop(
  file: File,
): Promise<ScanImageCropAnalysis> {
  const image = await decodeImage(file);
  const sourceWidth =
    "naturalWidth" in image ? image.naturalWidth : image.width;
  const sourceHeight =
    "naturalHeight" in image ? image.naturalHeight : image.height;
  const { width, height } = calculateSize(sourceWidth, sourceHeight, 420);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    if ("close" in image) image.close();
    return buildCropAnalysis(null, {
      blueDetected: false,
      paperDetected: false,
      reason: "No se pudo leer la imagen para calcular el recorte",
      bluePixelsInside: 0,
    });
  }

  context.drawImage(image, 0, 0, width, height);
  if ("close" in image) image.close();

  const imageData = context.getImageData(0, 0, width, height);
  return analyzeScanImageCropFromPixels(imageData.data, width, height);
}

export async function optimizeScanImage(
  file: File,
  options: ScanImagePreprocessOptions = {},
): Promise<File> {
  return (await optimizeScanImageWithMetadata(file, options)).file;
}

export async function optimizeScanImageWithMetadata(
  file: File,
  options: ScanImagePreprocessOptions = {},
): Promise<ScanImageOptimizationResult> {
  const image = await decodeImage(file);
  const sourceWidth =
    "naturalWidth" in image ? image.naturalWidth : image.width;
  const sourceHeight =
    "naturalHeight" in image ? image.naturalHeight : image.height;
  const cropRect = calculateCropRect(sourceWidth, sourceHeight, options.crop);
  const { width, height } = calculateSize(
    cropRect.width,
    cropRect.height,
    SCAN_IMAGE_MAX_DIMENSION,
  );

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context)
    throw new Error("No se pudo preparar la imagen para el escaneo");

  context.drawImage(
    image,
    cropRect.x,
    cropRect.y,
    cropRect.width,
    cropRect.height,
    0,
    0,
    width,
    height,
  );
  if ("close" in image) image.close();

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (output) => {
        if (!output)
          reject(new Error("No se pudo convertir la imagen optimizada"));
        else resolve(output);
      },
      SCAN_IMAGE_OUTPUT_TYPE,
      SCAN_IMAGE_JPEG_QUALITY,
    );
  });

  const optimizedFile = blobToFile(blob, file);
  return {
    file: optimizedFile,
    metadata: {
      original: {
        width: sourceWidth,
        height: sourceHeight,
        sizeBytes: file.size,
        type: file.type,
      },
      cropRect,
      output: {
        width,
        height,
        sizeBytes: optimizedFile.size,
        type: optimizedFile.type,
        quality: SCAN_IMAGE_JPEG_QUALITY,
      },
    },
  };
}
