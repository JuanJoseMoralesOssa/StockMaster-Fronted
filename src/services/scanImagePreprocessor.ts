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

interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

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

function findBestBand(scores: number[], threshold: number) {
  const smoothed = smoothScores(scores);
  let bestStart = -1;
  let bestEnd = -1;
  let bestTotal = 0;
  let start = -1;
  let total = 0;

  for (let index = 0; index <= smoothed.length; index += 1) {
    const active = index < smoothed.length && smoothed[index] >= threshold;
    if (active) {
      if (start === -1) start = index;
      total += smoothed[index];
      continue;
    }

    if (start !== -1) {
      const end = index - 1;
      if (total > bestTotal) {
        bestStart = start;
        bestEnd = end;
        bestTotal = total;
      }
      start = -1;
      total = 0;
    }
  }

  if (bestStart === -1) return null;
  return { start: bestStart, end: bestEnd, total: bestTotal };
}

function looksLikeJaagInk(red: number, green: number, blue: number): boolean {
  const brightness = (red + green + blue) / 3;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const contrast = max - min;
  const blueLeaning = blue >= red + 8 && blue >= green - 8;

  return brightness > 25 && brightness < 185 && contrast > 18 && blueLeaning;
}

export function suggestScanImageCropFromPixels(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
): ScanImageCrop | null {
  const rowScores = new Array<number>(height).fill(0);
  const colScores = new Array<number>(width).fill(0);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 4;
      const red = pixels[offset];
      const green = pixels[offset + 1];
      const blue = pixels[offset + 2];

      if (looksLikeJaagInk(red, green, blue)) {
        rowScores[y] += 1;
        colScores[x] += 1;
      }
    }
  }

  const rowBand =
    findBestBand(rowScores, Math.max(2, width * 0.015)) ??
    findBestBand(rowScores, Math.max(1, width * 0.008));
  if (!rowBand) return null;

  const colScoresInBand = new Array<number>(width).fill(0);
  for (let y = rowBand.start; y <= rowBand.end; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 4;
      if (
        looksLikeJaagInk(pixels[offset], pixels[offset + 1], pixels[offset + 2])
      ) {
        colScoresInBand[x] += 1;
      }
    }
  }

  const colBand =
    findBestBand(colScoresInBand, Math.max(2, height * 0.01)) ??
    findBestBand(colScores, Math.max(1, height * 0.008));
  if (!colBand) return null;

  const horizontalPadding = Math.round(width * 0.035);
  const verticalPadding = Math.round(height * 0.045);
  const x = Math.max(0, colBand.start - horizontalPadding);
  const y = Math.max(0, rowBand.start - verticalPadding);
  const right = Math.min(width - 1, colBand.end + horizontalPadding);
  const bottom = Math.min(height - 1, rowBand.end + verticalPadding);
  const rect = {
    x,
    y,
    width: Math.max(1, right - x + 1),
    height: Math.max(1, bottom - y + 1),
  };

  const crop = rectToCrop(rect, width, height);
  return Object.values(crop).some((value) => value > 0.02) ? crop : null;
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
    return null;
  }

  context.drawImage(image, 0, 0, width, height);
  if ("close" in image) image.close();

  const imageData = context.getImageData(0, 0, width, height);
  return suggestScanImageCropFromPixels(imageData.data, width, height);
}

export async function optimizeScanImage(
  file: File,
  options: ScanImagePreprocessOptions = {},
): Promise<File> {
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

  return blobToFile(blob, file);
}
