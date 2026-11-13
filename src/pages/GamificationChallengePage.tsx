import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, BookOpenText, Clock, RotateCcw } from 'lucide-react';
import { WebcamFeed } from '../components/camera/WebcamFeed';
import { GestureInstructorDemo } from '../components/game/GestureInstructorDemo';
import { GestureStatusPanel } from '../components/hand-tracking/GestureStatusPanel';
import { WayangStageCanvas } from '../components/puppet/WayangStageCanvas';
import { ChallengeEvaluator } from '../game/challengeManager';
import { getLevelById } from '../game/levelManager';
import { buildChallengeResult } from '../game/scoreManager';
import { useCamera } from '../hooks/useCamera';
import { useHandTracking } from '../hooks/useHandTracking';
import { PuppetController } from '../puppet-engine/PuppetController';
import type {
  ChallengeResult,
  GestureState,
  HandTrackingResult,
  LevelId,
  PuppetCharacterId,
} from '../types';
import { soundEffects } from '../utils/sound';

interface GamificationChallengePageProps {
  levelId: LevelId;
  selectedCharacterId: PuppetCharacterId;
  onCompleteLevel: (
    result: Omit<ChallengeResult, 'newlyEarned'>,
    badgeId: string | null
  ) => void;
  onExitToDashboard: () => void;
}

export function GamificationChallengePage({
  levelId,
  selectedCharacterId,
  onCompleteLevel,
  onExitToDashboard,
}: GamificationChallengePageProps) {
  const level = useMemo(() => getLevelById(levelId), [levelId]);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);

  const controller = useMemo(
    () => new PuppetController(selectedCharacterId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  if (controller.getCharacter().id !== selectedCharacterId) {
    controller.setCharacter(selectedCharacterId);
  }

  const evaluatorRef = useRef(new ChallengeEvaluator(level));
  const completedRef = useRef(false);
  const lastUiSyncRef = useRef(0);
  const bannerTimerRef = useRef<number | null>(null);

  const [stepIdx, setStepIdx] = useState(0);
  const [holdProgress, setHoldProgress] = useState(0);
  const [remainingSec, setRemainingSec] = useState(level.timeLimitSec);
  const [banner, setBanner] = useState<string | null>(null);
  const [liveHint, setLiveHint] = useState<string | null>(null);

  // Reset evaluator when level changes
  useEffect(() => {
    evaluatorRef.current.reset(level);
    completedRef.current = false;
    setStepIdx(0);
    setHoldProgress(0);
    setRemainingSec(level.timeLimitSec);
    setBanner(null);
    setLiveHint(null);
  }, [level]);

  useEffect(() => {
    return () => {
      if (bannerTimerRef.current) window.clearTimeout(bannerTimerRef.current);
    };
  }, []);

  const showBanner = useCallback((msg: string) => {
    setBanner(msg);
    if (bannerTimerRef.current) window.clearTimeout(bannerTimerRef.current);
    bannerTimerRef.current = window.setTimeout(() => setBanner(null), 2400);
  }, []);

  const {
    videoRef,
    status: cameraStatus,
    errorMessage: cameraError,
    startCamera,
    stopCamera,
  } = useCamera(false);

  const handleTrackingFrame = useCallback(
    (tracking: HandTrackingResult, gestureState: GestureState, dtSec: number) => {
      if (completedRef.current) return;

      const pose = controller.updateFromTracking(tracking, gestureState, dtSec);
      const update = evaluatorRef.current.update(
        dtSec * 1000,
        Boolean(tracking.landmarks),
        pose,
        gestureState
      );

      if (update.stepJustCompleted) {
        soundEffects.playStepSuccess();
        controller.triggerCelebration(1.1);
        if (update.completedBannerText) {
          showBanner(update.completedBannerText);
        }
        setStepIdx(update.stepIndex);
        setHoldProgress(0);
        setLiveHint(null);
      } else if (performance.now() - lastUiSyncRef.current > 85) {
        lastUiSyncRef.current = performance.now();
        setHoldProgress(update.holdProgress);
        setRemainingSec(update.remainingSec);
        setLiveHint(update.hintText);
      }

      if (update.levelFinished && !completedRef.current) {
        completedRef.current = true;
        if (update.passed) {
          soundEffects.playLevelComplete();
        } else {
          soundEffects.playTryAgain();
        }

        const result = buildChallengeResult({
          level,
          completedSteps: evaluatorRef.current.getCompletedSteps(),
          activeMatchTimeMs: evaluatorRef.current.getActiveMatchMs(),
          totalElapsedMs: evaluatorRef.current.getElapsedMs(),
          newlyEarned: false,
        });

        // Short pause so child hears chime & sees final feedback before ResultPage
        window.setTimeout(() => {
          onCompleteLevel(result, update.passed ? level.badgeId : null);
        }, 700);
      }
    },
    [controller, level, onCompleteLevel, showBanner]
  );

  const {
    modelStatus,
    modelError,
    handDetected,
    handCount,
    landmarkCount,
    fps,
    gesture,
  } = useHandTracking({
    videoRef,
    overlayCanvasRef,
    cameraStatus,
    enabled: true,
    onTrackingFrame: handleTrackingFrame,
  });

  const handleRestart = () => {
    evaluatorRef.current.reset(level);
    completedRef.current = false;
    setStepIdx(0);
    setHoldProgress(0);
    setRemainingSec(level.timeLimitSec);
    setBanner(null);
    setLiveHint(null);
  };

  const currentStep =
    level.steps[stepIdx] ?? level.steps[level.steps.length - 1];

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6">
      {/* Top Challenge Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border-2 border-wayang-gold/40 bg-white p-5 shadow-card">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onExitToDashboard}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-wayang-cream-dark text-wayang-brown transition hover:bg-wayang-gold-soft"
            title="Kembali ke Dasbor"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-wayang-terracotta">
              {level.subtitle}
            </span>
            <h1 className="font-display text-xl font-bold text-wayang-brown sm:text-2xl">
              {level.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold ${
              remainingSec <= 15
                ? 'bg-wayang-terracotta text-white'
                : 'bg-wayang-cream text-wayang-brown'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>{remainingSec} dtk</span>
          </div>

          <div className="rounded-2xl bg-wayang-gold-soft px-4 py-2 text-sm font-bold text-wayang-brown">
            Langkah {Math.min(stepIdx + 1, level.steps.length)} /{' '}
            {level.steps.length}
          </div>

          <button
            type="button"
            onClick={handleRestart}
            className="flex items-center gap-1.5 rounded-2xl border border-wayang-brown/20 px-3.5 py-2 text-xs font-bold text-wayang-brown transition hover:bg-wayang-cream"
          >
            <RotateCcw className="h-4 w-4" />
            Ulang
          </button>
        </div>
      </div>

      {/* Step progress bar */}
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${level.steps.length}, minmax(0, 1fr))` }}>
        {level.steps.map((s, idx) => (
          <div
            key={s.id}
            className={`h-2.5 rounded-full transition-all ${
              idx < stepIdx
                ? 'bg-wayang-sage'
                : idx === stepIdx
                  ? 'bg-wayang-terracotta'
                  : 'bg-wayang-cream-dark'
            }`}
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Story/Instruction & Puppet Stage */}
        <div className="space-y-4 lg:col-span-7">
          {currentStep.storyNarration && (
            <div className="rounded-3xl border-2 border-wayang-brown/20 bg-wayang-brown p-4 text-wayang-cream shadow-card">
              <div className="flex items-center gap-2 text-xs font-bold text-wayang-gold">
                <BookOpenText className="h-4 w-4" />
                {currentStep.storySpeaker ?? 'Narasi Cerita'}
              </div>
              <p className="mt-1 text-sm leading-relaxed">
                "{currentStep.storyNarration}"
              </p>
            </div>
          )}

          <div className="rounded-3xl border-2 border-wayang-terracotta/40 bg-white p-4 shadow-card">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-wayang-terracotta">
                  {currentStep.title}
                </p>
                <h2 className="font-display text-lg font-bold text-wayang-brown sm:text-xl">
                  {currentStep.instruction}
                </h2>
              </div>
              <span className="shrink-0 rounded-full bg-wayang-cream-dark px-3 py-1 text-xs font-bold text-wayang-brown">
                {Math.round(holdProgress * 100)}%
              </span>
            </div>

            <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-wayang-cream-dark">
              <div
                className="h-full rounded-full bg-wayang-sage transition-all duration-100"
                style={{ width: `${Math.round(holdProgress * 100)}%` }}
              />
            </div>

            {liveHint && (
              <p className="mt-2.5 text-xs font-semibold text-wayang-terracotta">
                {liveHint}
              </p>
            )}
          </div>

          <WayangStageCanvas
            controller={controller}
            isTrackingActive={cameraStatus === 'active' && handDetected}
            isTrackingLoopRunning={
              cameraStatus === 'active' && modelStatus === 'ready'
            }
            targetZone={currentStep.targetZone ?? null}
            holdProgress={holdProgress}
            storyObject={currentStep.storyObject ?? null}
            statusBanner={banner}
          />
        </div>

        {/* Right: Webcam & Gesture Hint */}
        <div className="space-y-4 lg:col-span-5">
          <WebcamFeed
            videoRef={videoRef}
            overlayCanvasRef={overlayCanvasRef}
            cameraStatus={cameraStatus}
            cameraError={cameraError}
            modelStatus={modelStatus}
            modelError={modelError}
            handDetected={handDetected}
            handCount={handCount}
            landmarkCount={landmarkCount}
            fps={fps}
            onStartCamera={() => void startCamera()}
            onStopCamera={stopCamera}
          />

          {currentStep.requiredGesture && (
            <GestureInstructorDemo
              gestureType={currentStep.requiredGesture}
              title="Gerakan yang Diminta"
              tip={currentStep.instruction}
            />
          )}

          <GestureStatusPanel handDetected={handDetected} gesture={gesture} />
        </div>
      </div>
    </div>
  );
}

