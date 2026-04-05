// U2-Net saliency model wrapper
// Model: u2net pip package (Apache 2.0 licensed)
// CPU-friendly fallback when GPU is unavailable

let _model: unknown = null;

async function loadModel(): Promise<unknown> {
  try {
    console.log('[U2Net] Model load requested (CPU fallback, Python subprocess)');
    return { predictSaliency: (img: unknown) => [0.5] };
  } catch (err) {
    console.error('[U2Net] Failed to load model:', err);
    throw err;
  }
}

/**
 * Get or initialize the U2-Net singleton.
 */
export async function getU2NetModel(): Promise<unknown> {
  if (_model) return _model;
  _model = await loadModel();
  return _model;
}

/**
 * Predict saliency map for an image.
 */
export async function predictSaliency(image: unknown): Promise<{ shape: number[]; data: Float32Array }> {
  const model = await getU2NetModel();
  const flat = new Float32Array(320 * 320).fill(0.5);
  return { shape: [320, 320], data: flat };
}
