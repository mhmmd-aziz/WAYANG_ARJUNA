import { useCallback, useRef, useState } from 'react';
import {
  GestureRecognizer,
  getEmptyGestureState,
} from '../computer-vision/gestureRecognition';
import type { DetectedHand, GestureState, HandLandmarks } from '../types';

export interface UseGestureResult {
  gesture: GestureState;
  gestureRef: React.MutableRefObject<GestureState>;
  evaluateHands: (
    hands: DetectedHand[] | HandLandmarks | null,
    timestampMs: number
  ) => GestureState;
  resetGesture: () => void;
}

/**
 * Evaluates gestures for 1 or 2 hands at full tracking FPS via ref while
 * throttling React state updates to avoid re-render overhead.
 */
export function useGesture(): UseGestureResult {
  const recognizerRef = useRef<GestureRecognizer>(new GestureRecognizer());
  const gestureRef = useRef<GestureState>(getEmptyGestureState());
  const lastUiSyncRef = useRef<number>(0);
  const [gesture, setGesture] = useState<GestureState>(getEmptyGestureState);

  const evaluateHands = useCallback(
    (
      hands: DetectedHand[] | HandLandmarks | null,
      timestampMs: number
    ): GestureState => {
      const next = recognizerRef.current.recognize(hands, timestampMs);
      const prev = gestureRef.current;
      gestureRef.current = next;

      const primaryChanged = next.primary !== prev.primary;
      const staticChanged = next.staticGesture !== prev.staticGesture;
      const countChanged = next.handCount !== prev.handCount;
      const elapsedSinceSync = timestampMs - lastUiSyncRef.current;

      if (
        primaryChanged ||
        staticChanged ||
        countChanged ||
        elapsedSinceSync > 180
      ) {
        lastUiSyncRef.current = timestampMs;
        setGesture(next);
      }

      return next;
    },
    []
  );

  const resetGesture = useCallback(() => {
    recognizerRef.current.reset();
    const empty = getEmptyGestureState();
    gestureRef.current = empty;
    setGesture(empty);
  }, []);

  return {
    gesture,
    gestureRef,
    evaluateHands,
    resetGesture,
  };
}
