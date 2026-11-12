import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

export interface HandLandmarkerLoadState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage?: string;
}

const LOCAL_WASM_PATH = '/mediapipe/wasm';
const CDN_WASM_PATH =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.20/wasm';

const LOCAL_MODEL_PATH = '/models/hand_landmarker.task';
const CDN_MODEL_PATH =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

let landmarkerInstance: HandLandmarker | null = null;
let loadingPromise: Promise<HandLandmarker> | null = null;

async function assetExists(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    const contentType = res.headers.get('content-type') ?? '';
    return res.ok && !contentType.includes('text/html');
  } catch {
    return false;
  }
}

async function resolveWasmRoot(): Promise<string> {
  const hasLocalWasm = await assetExists(
    `${LOCAL_WASM_PATH}/vision_wasm_internal.js`
  );
  return hasLocalWasm ? LOCAL_WASM_PATH : CDN_WASM_PATH;
}

async function resolveModelPath(): Promise<string> {
  const hasLocalModel = await assetExists(LOCAL_MODEL_PATH);
  return hasLocalModel ? LOCAL_MODEL_PATH : CDN_MODEL_PATH;
}

/**
 * Initializes and caches the MediaPipe HandLandmarker singleton.
 * Attempts GPU delegate first and falls back to CPU if WebGL is unavailable.
 */
export async function getHandLandmarker(): Promise<HandLandmarker> {
  if (landmarkerInstance) {
    return landmarkerInstance;
  }
  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = (async () => {
    const [wasmRoot, modelAssetPath] = await Promise.all([
      resolveWasmRoot(),
      resolveModelPath(),
    ]);

    const vision = await FilesetResolver.forVisionTasks(wasmRoot);

    try {
      landmarkerInstance = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath,
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 2,
        minHandDetectionConfidence: 0.55,
        minHandPresenceConfidence: 0.55,
        minTrackingConfidence: 0.5,
      });
    } catch {
      landmarkerInstance = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath,
          delegate: 'CPU',
        },
        runningMode: 'VIDEO',
        numHands: 2,
        minHandDetectionConfidence: 0.55,
        minHandPresenceConfidence: 0.55,
        minTrackingConfidence: 0.5,
      });
    }

    return landmarkerInstance;
  })();

  try {
    return await loadingPromise;
  } catch (err) {
    loadingPromise = null;
    throw err;
  }
}

export function disposeHandLandmarker(): void {
  if (landmarkerInstance) {
    landmarkerInstance.close();
    landmarkerInstance = null;
  }
  loadingPromise = null;
}

