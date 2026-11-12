import { useEffect, useRef, useState } from 'react';
import type { HandLandmarker } from '@mediapipe/tasks-vision';
import {
  drawHandLandmarks,
  HandDetectionProcessor,
} from '../computer-vision/handDetection';
import { getHandLandmarker } from '../computer-vision/handLandmarker';
import type { GestureState, HandTrackingResult } from '../types';
import type { CameraStatus } from './useCamera';
import { useGesture } from './useGesture';

export type ModelStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface UseHandTrackingOptions {
  videoRef: React.RefObject<HTMLVideoElement>;
  overlayCanvasRef: React.RefObject<HTMLCanvasElement>;
  cameraStatus: CameraStatus;
  enabled?: boolean;
  showLandmarkIndices?: boolean;
  onTrackingFrame?: (
    tracking: HandTrackingResult,
    gesture: GestureState,
    dtSec: number
  ) => void;
}

export interface UseHandTrackingResult {
  modelStatus: ModelStatus;
  modelError: string | null;
  handDetected: boolean;
  handCount: number;
  landmarkCount: number;
  fps: number;
  gesture: GestureState;
}

export function useHandTracking({
  videoRef,
  overlayCanvasRef,
  cameraStatus,
  enabled = true,
  showLandmarkIndices = false,
  onTrackingFrame,
}: UseHandTrackingOptions): UseHandTrackingResult {
  const [modelStatus, setModelStatus] = useState<ModelStatus>('idle');
  const [modelError, setModelError] = useState<string | null>(null);
  const [handDetected, setHandDetected] = useState(false);
  const [handCount, setHandCount] = useState(0);
  const [landmarkCount, setLandmarkCount] = useState(0);
  const [fps, setFps] = useState(0);

  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const processorRef = useRef<HandDetectionProcessor>(
    new HandDetectionProcessor()
  );
  const onFrameRef = useRef(onTrackingFrame);
  onFrameRef.current = onTrackingFrame;

  const showIndicesRef = useRef(showLandmarkIndices);
  showIndicesRef.current = showLandmarkIndices;

  const { gesture, evaluateHands, resetGesture } = useGesture();

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    setModelStatus('loading');
    setModelError(null);

    getHandLandmarker()
      .then((instance) => {
        if (cancelled) return;
        landmarkerRef.current = instance;
        setModelStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        setModelStatus('error');
        setModelError(
          err instanceof Error
            ? `Model pelacak tangan gagal dimuat: ${err.message}`
            : 'Model pelacak tangan gagal dimuat.'
        );
      });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || cameraStatus !== 'active' || modelStatus !== 'ready') {
      processorRef.current.reset();
      resetGesture();
      setHandDetected(false);
      setHandCount(0);
      setLandmarkCount(0);
      setFps(0);

      const canvas = overlayCanvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    let rafId = 0;
    let lastTickMs = performance.now();
    let lastStatusSyncMs = 0;
    let lastCountUi = 0;

    const loop = (nowMs: number) => {
      const dtSec = Math.min(0.1, Math.max(0.001, (nowMs - lastTickMs) / 1000));
      lastTickMs = nowMs;

      const video = videoRef.current;
      const canvas = overlayCanvasRef.current;
      const landmarker = landmarkerRef.current;

      if (video && landmarker && video.readyState >= 2) {
        const tracking = processorRef.current.processVideoFrame(
          landmarker,
          video,
          nowMs
        );
        const currentGesture = evaluateHands(tracking.hands, nowMs);

        if (canvas) {
          if (
            canvas.width !== video.videoWidth ||
            canvas.height !== video.videoHeight
          ) {
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
          }
          const ctx = canvas.getContext('2d');
          if (ctx) {
            drawHandLandmarks(
              ctx,
              tracking.hands,
              canvas.width,
              canvas.height,
              {
                mirrorX: true,
                showIndices: showIndicesRef.current,
              }
            );
          }
        }

        onFrameRef.current?.(tracking, currentGesture, dtSec);

        const count = tracking.hands.length;
        const totalPoints = tracking.hands.reduce(
          (sum, h) => sum + h.landmarks.length,
          0
        );
        if (count !== lastCountUi || nowMs - lastStatusSyncMs > 300) {
          lastCountUi = count;
          lastStatusSyncMs = nowMs;
          setHandDetected(count > 0);
          setHandCount(count);
          setLandmarkCount(totalPoints);
          setFps(tracking.fps);
        }
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [
    enabled,
    cameraStatus,
    modelStatus,
    videoRef,
    overlayCanvasRef,
    evaluateHands,
    resetGesture,
  ]);

  return {
    modelStatus,
    modelError,
    handDetected,
    handCount,
    landmarkCount,
    fps,
    gesture,
  };
}
