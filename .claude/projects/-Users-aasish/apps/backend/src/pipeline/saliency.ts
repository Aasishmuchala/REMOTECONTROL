import { predictSaliency as deepgazePredict } from '../lib/deepgaze';
import { predictSaliency as u2netPredict } from '../lib/u2net';

export type SaliencyModel = 'deepgaze' | 'u2net' | 'fallback';

export interface HeatmapResult {
  heatmap: Float32Array;
  width: number;
  height: number;
  model: SaliencyModel;
  modelFailed: boolean;
}

/**
 * Resize a flat Float32Array to target dimensions using bilinear interpolation.
 */
function resizeHeatmap(data: Float32Array, srcW: number, srcH: number, dstW: number, dstH: number): Float32Array {
  const result = new Float32Array(dstW * dstH);
  const xRatio = srcW / dstW;
  const yRatio = srcH / dstH;

  for (let dy = 0; dy < dstH; dy++) {
    for (let dx = 0; dx < dstW; dx++) {
      const sx = dx * xRatio;
      const sy = dy * yRatio;
      const x0 = Math.floor(sx);
      const y0 = Math.floor(sy);
      const x1 = Math.min(x0 + 1, srcW - 1);
      const y1 = Math.min(y0 + 1, srcH - 1);
      const fx = sx - x0;
      const fy = sy - y0;

      const v00 = data[y0 * srcW + x0];
      const v10 = data[y0 * srcW + x1];
      const v01 = data[y1 * srcW + x0];
      const v11 = data[y1 * srcW + x1];

      const top = v00 * (1 - fx) + v10 * fx;
      const bottom = v01 * (1 - fx) + v11 * fx;
      result[dy * dstW + dx] = top * (1 - fy) + bottom * fy;
    }
  }
  return result;
}

/**
 * Normalize Float32Array to 0-1 range.
 */
function normalize(data: Float32Array): Float32Array {
  let min = Infinity;
  let max = -Infinity;
  for (const v of data) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const range = max - min || 1;
  return Float32Array.from(data, (v) => (v - min) / range);
}

/**
 * Generate saliency heatmap from a screenshot PNG buffer.
 * GPU-first: DeepGaze III -> U2-Net CPU fallback -> uniform fallback.
 * Never throws; returns modelFailed=true if models are unavailable.
 */
export async function generateHeatmap(screenshot: Buffer): Promise<HeatmapResult> {
  const TARGET_SIZE = 384;
  let saliencyData: Float32Array | null = null;
  let saliencyShape = [TARGET_SIZE, TARGET_SIZE];
  let modelUsed: SaliencyModel = 'deepgaze';
  let modelFailed = false;

  // Step 1: Try DeepGaze III (GPU)
  try {
    const result = await deepgazePredict(screenshot);
    if (result && result.data && result.data.length > 0) {
      saliencyData = normalize(result.data);
      saliencyShape = result.shape;
      modelUsed = 'deepgaze';
    }
  } catch (err) {
    console.warn('[Saliency] DeepGaze III failed, trying U2-Net:', err);
    modelFailed = true;
  }

  // Step 2: U2-Net CPU fallback
  if (!saliencyData) {
    try {
      const result = await u2netPredict(screenshot);
      if (result && result.data && result.data.length > 0) {
        saliencyData = normalize(result.data);
        saliencyShape = result.shape;
        modelUsed = 'u2net';
      }
    } catch (err) {
      console.warn('[Saliency] U2-Net also failed, using uniform fallback:', err);
      modelFailed = true;
    }
  }

  // Step 3: Fallback-only mode
  if (!saliencyData) {
    const size = TARGET_SIZE * TARGET_SIZE;
    saliencyData = new Float32Array(size).fill(0.5);
    saliencyShape = [TARGET_SIZE, TARGET_SIZE];
    modelUsed = 'fallback';
    console.error('[Saliency] All models unavailable — returning uniform heatmap');
  }

  // Resize to 384x384 canonical output
  const resized = resizeHeatmap(saliencyData, saliencyShape[1], saliencyShape[0], TARGET_SIZE, TARGET_SIZE);

  return {
    heatmap: resized,
    width: TARGET_SIZE,
    height: TARGET_SIZE,
    model: modelUsed,
    modelFailed,
  };
}

/**
 * Alias for backward compatibility.
 */
export { generateHeatmap as generateHeatmapWithFallback };
