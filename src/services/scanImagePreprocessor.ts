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
) {
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
