export interface CompressedUploadResult {
  filename: string;
  mimeType: 'image/webp' | 'image/jpeg';
  dataUrl: string;
  thumbUrl: string;
  sizeBytes: number;
  originalSizeBytes: number;
  width: number;
  height: number;
}

const MAX_FULL_EDGE = 1600;
const MAX_THUMB_EDGE = 420;
const TARGET_MAX_DATAURL_CHARS = 480_000; // ~350 KB binary, well within 1 MiB Firestore doc ceiling

function estimateBase64Bytes(dataUrl: string): number {
  const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
  return Math.ceil((base64.length * 3) / 4);
}

async function decodeImage(
  file: File
): Promise<{ source: ImageBitmap | HTMLImageElement; width: number; height: number; cleanup: () => void }> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file);
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        cleanup: () => bitmap.close(),
      };
    } catch {
      // Fallback to HTMLImageElement if createImageBitmap fails on older mobile browsers
    }
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Could not decode selected image file.'));
      el.src = objectUrl;
    });
    return {
      source: img,
      width: img.naturalWidth || img.width,
      height: img.naturalHeight || img.height,
      cleanup: () => URL.revokeObjectURL(objectUrl),
    };
  } catch (err) {
    URL.revokeObjectURL(objectUrl);
    throw err;
  }
}

function renderCanvas(
  source: ImageBitmap | HTMLImageElement,
  srcW: number,
  srcH: number,
  maxEdge: number,
  mimeType: 'image/webp' | 'image/jpeg',
  quality: number
): { dataUrl: string; outW: number; outH: number; actualMime: 'image/webp' | 'image/jpeg' } {
  const scale = Math.min(1, maxEdge / Math.max(srcW, srcH));
  const outW = Math.max(1, Math.round(srcW * scale));
  const outH = Math.max(1, Math.round(srcH * scale));

  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context is not available in this browser.');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, outW, outH);

  let dataUrl = canvas.toDataURL(mimeType, quality);
  let actualMime: 'image/webp' | 'image/jpeg' = mimeType;

  // Some older browsers ignore 'image/webp' and return 'data:image/png...'
  if (mimeType === 'image/webp' && !dataUrl.startsWith('data:image/webp')) {
    dataUrl = canvas.toDataURL('image/jpeg', quality);
    actualMime = 'image/jpeg';
  }

  return { dataUrl, outW, outH, actualMime };
}

export async function compressImageForFirestore(
  file: File
): Promise<CompressedUploadResult> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files (JPG, PNG, WebP, AVIF) are supported.');
  }
  if (file.size > 40 * 1024 * 1024) {
    throw new Error('Please choose an image smaller than 40 MB.');
  }

  const decoded = await decodeImage(file);
  try {
    const attempts: Array<{ edge: number; quality: number }> = [
      { edge: MAX_FULL_EDGE, quality: 0.84 },
      { edge: MAX_FULL_EDGE, quality: 0.76 },
      { edge: 1400, quality: 0.72 },
      { edge: 1200, quality: 0.66 },
      { edge: 1024, quality: 0.58 },
    ];

    let chosen = renderCanvas(
      decoded.source,
      decoded.width,
      decoded.height,
      attempts[0].edge,
      'image/webp',
      attempts[0].quality
    );

    for (const attempt of attempts) {
      const candidate = renderCanvas(
        decoded.source,
        decoded.width,
        decoded.height,
        attempt.edge,
        'image/webp',
        attempt.quality
      );
      chosen = candidate;
      if (candidate.dataUrl.length <= TARGET_MAX_DATAURL_CHARS) {
        break;
      }
    }

    if (chosen.dataUrl.length > 720_000) {
      throw new Error(
        'Image could not be compressed under the free-tier Firestore limit. Please try another photo.'
      );
    }

    const thumb = renderCanvas(
      decoded.source,
      decoded.width,
      decoded.height,
      MAX_THUMB_EDGE,
      chosen.actualMime,
      0.72
    );

    const ext = chosen.actualMime === 'image/webp' ? '.webp' : '.jpg';
    const stem =
      file.name
        .replace(/\.[^.]+$/, '')
        .toLowerCase()
        .replace(/[^a-z0-9-_]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || 'studio-photo';

    return {
      filename: `${stem}${ext}`,
      mimeType: chosen.actualMime,
      dataUrl: chosen.dataUrl,
      thumbUrl: thumb.dataUrl,
      sizeBytes: estimateBase64Bytes(chosen.dataUrl) + estimateBase64Bytes(thumb.dataUrl),
      originalSizeBytes: file.size,
      width: chosen.outW,
      height: chosen.outH,
    };
  } finally {
    decoded.cleanup();
  }
}
