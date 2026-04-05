// DeepGaze III saliency model wrapper
// Model: deepgaze3 pip package (MIT licensed)
// Uses singleton pattern to cache loaded model

let _model: unknown = null;
let _loading = false;
let _loadPromise: Promise<unknown> | null = null;

interface NumpyArray {
  shape: number[];
  data: Float32Array;
}

async function loadModel(): Promise<unknown> {
  try {
    // dynamic import for deepgaze3 (Python/pip package)
    // In TypeScript we define the interface; actual execution uses Python subprocess
    // For MVP: return a stub that logs the intent
    console.log('[DeepGaze] Model load requested (Python subprocess)');
    return { predictSaliency: (img: unknown) => [0.5] };
  } catch (err) {
    console.error('[DeepGaze] Failed to load model:', err);
    throw err;
  }
}

/**
 * Get or initialize the DeepGaze III singleton.
 */
export async function getDeepGazeModel(): Promise<unknown> {
  if (_model) return _model;
  if (_loading && _loadPromise) return _loadPromise;

  _loading = true;
  _loadPromise = loadModel().finally(() => { _loading = false; });
  _model = await _loadPromise;
  return _model;
}

/**
 * Predict saliency map for an image.
 * Returns numpy-like array with shape [H, W].
 */
export async function predictSaliency(image: unknown): Promise<NumpyArray> {
  const model = await getDeepGazeModel();
  // The actual call is delegated to a Python subprocess via @playwright/test or child_process
  // This stub returns a uniform map; real implementation invokes:
  // python -c "from deepgaze3 import DeepGazeIII; ..."
  const flat = new Float32Array(384 * 384).fill(0.5);
  return { shape: [384, 384], data: flat };
}
