import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';
import { getCharacterById } from '../assets/wayangCharacters';
import { WebcamFeed } from '../components/camera/WebcamFeed';
import { GestureInstructorDemo } from '../components/game/GestureInstructorDemo';
import { GestureStatusPanel } from '../components/hand-tracking/GestureStatusPanel';
import { WayangStageCanvas } from '../components/puppet/WayangStageCanvas';
import { ChallengeEvaluator } from '../game/challengeManager';
import { useCamera } from '../hooks/useCamera';
import { useHandTracking } from '../hooks/useHandTracking';
import { PuppetController } from '../puppet-engine/PuppetController';
import type {
  AppPage,
  GestureState,
  GestureType,
  HandTrackingResult,
  LevelDefinition,
  LevelId,
  PuppetCharacterId,
} from '../types';
import { soundEffects } from '../utils/sound';

interface TutorialModePageProps {
  selectedCharacterId: PuppetCharacterId;
  onTutorialComplete: () => void;
  onStartLevel: (levelId: LevelId) => void;
  onNavigate: (page: AppPage) => void;
}

const TUTORIAL_LEVEL: LevelDefinition = {
  id: 1,
  title: 'Latihan Dasar Dalang Cilik',
  subtitle: 'Mode Tutorial',
  difficulty: 'Pemula',
  description: 'Belajar langkah demi langkah bersama instruktur wayang.',
  badgeId: 'first_wayang',
  timeLimitSec: 999,
  steps: [
    {
      id: 'tut-1',
      type: 'detect_hand',
      title: 'Langkah 1: Sapa Kamera',
      instruction:
        'Angkat tanganmu ke depan kamera sampai 21 titik tangan terlihat!',
      encouragement: 'Hebat! Tangan kamu berhasil terdeteksi!',
      holdDurationMs: 1000,
    },
    {
      id: 'tut-2',
      type: 'perform_gesture',
      title: 'Langkah 2: Telapak Tangan Terbuka',
      instruction:
        'Buka kelima jarimu lebar-lebar untuk mengaktifkan tokoh wayang!',
      encouragement: 'Bagus! Wayang aktif dan siap mengikuti tanganmu!',
      requiredGesture: 'open_palm',
      holdDurationMs: 1000,
    },
    {
      id: 'tut-3',
      type: 'move_zone',
      title: 'Langkah 3: Gerakkan ke Kanan',
      instruction:
        'Geser tanganmu ke sebelah kanan untuk mengarahkan wayang ke bintang emas!',
      encouragement: 'Bagus! Wayang berhasil bergerak ke kanan!',
      targetZone: {
        x: 0.74,
        y: 0.54,
        radius: 0.16,
        label: 'Arah Kanan',
        icon: 'right',
      },
      holdDurationMs: 750,
    },
    {
      id: 'tut-4',
      type: 'perform_gesture',
      title: 'Langkah 4: Angkat Jari Telunjuk',
      instruction:
        'Coba angkat hanya jari telunjukmu ke atas sambil menekuk jari lain!',
      encouragement: 'Keren! Telunjukmu mengarahkan lengan wayang ke atas!',
      requiredGesture: 'index_up',
      holdDurationMs: 950,
    },
    {
      id: 'tut-5',
      type: 'perform_gesture',
      title: 'Langkah 5: Kepalan Tangan (Istirahat)',
      instruction:
        'Kepalkan jarimu agar wayang berhenti dengan tenang di panggung!',
      encouragement: 'Luar biasa! Kamu sudah siap bermain Level Tantangan!',
      requiredGesture: 'closed_fist',
      holdDurationMs: 950,
    },
  ],
};

const STEP_DEMO_TIPS: Record<
  string,
  { gesture: GestureType; title: string; tip: string }
> = {
  'tut-1': {
    gesture: 'open_palm',
    title: 'Perlihatkan Tanganmu',
    tip: 'Posisikan satu tangan sekitar 40-60 cm di depan kamera dengan cahaya terang.',
  },
  'tut-2': {
    gesture: 'open_palm',
    title: 'Telapak Tangan Terbuka',
    tip: 'Rentangkan kelima jari menghadap kamera tanpa ditekuk.',
  },
  'tut-3': {
    gesture: 'move_right',
    title: 'Geser Tangan ke Kanan',
    tip: 'Pertahankan telapak terbuka lalu geser pergelangan tanganmu ke kanan.',
  },
  'tut-4': {
    gesture: 'index_up',
    title: 'Angkat Jari Telunjuk',
    tip: 'Tegakkan jari telunjuk ke atas dan lipat jari tengah, manis, serta kelingking.',
  },
  'tut-5': {
    gesture: 'closed_fist',
    title: 'Kepalan Tangan',
    tip: 'Tutup semua jari membentuk kepalan untuk mengistirahatkan wayang.',
  },
};

export function TutorialModePage({
  selectedCharacterId,
  onTutorialComplete,
  onStartLevel,
  onNavigate,
}: TutorialModePageProps) {
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const controller = useMemo(
    () => new PuppetController(selectedCharacterId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  if (controller.getCharacter().id !== selectedCharacterId) {
    controller.setCharacter(selectedCharacterId);
  }

  const evaluatorRef = useRef(new ChallengeEvaluator(TUTORIAL_LEVEL));
  const tutorialDoneRef = useRef(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [holdProgress, setHoldProgress] = useState(0);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);
  const [liveHint, setLiveHint] = useState<string | null>(null);
  const [tutorialDone, setTutorialDone] = useState(false);

  const lastUiUpdateRef = useRef(0);
  const bannerTimerRef = useRef<number | null>(null);

  const {
    videoRef,
    status: cameraStatus,
    errorMessage: cameraError,
    startCamera,
    stopCamera,
  } = useCamera(false);

  useEffect(() => {
    return () => {
      if (bannerTimerRef.current) window.clearTimeout(bannerTimerRef.current);
    };
  }, []);

  const showBanner = useCallback((msg: string) => {
    setFeedbackBanner(msg);
    if (bannerTimerRef.current) window.clearTimeout(bannerTimerRef.current);
    bannerTimerRef.current = window.setTimeout(() => {
      setFeedbackBanner(null);
    }, 2600);
  }, []);

  const handleTrackingFrame = useCallback(
    (tracking: HandTrackingResult, gestureState: GestureState, dtSec: number) => {
      const pose = controller.updateFromTracking(tracking, gestureState, dtSec);
      const result = evaluatorRef.current.update(
        dtSec * 1000,
        Boolean(tracking.landmarks),
        pose,
        gestureState
      );

      if (result.stepJustCompleted) {
        soundEffects.playStepSuccess();
        controller.triggerCelebration(1.1);
        if (result.completedBannerText) {
          showBanner(result.completedBannerText);
        }
        setStepIdx(result.stepIndex);
        setHoldProgress(0);
        setLiveHint(null);
      } else if (performance.now() - lastUiUpdateRef.current > 80) {
        lastUiUpdateRef.current = performance.now();
        setHoldProgress(result.holdProgress);
        setLiveHint(result.hintText);
      }

      if (result.levelFinished && result.passed && !tutorialDoneRef.current) {
        tutorialDoneRef.current = true;
        soundEffects.playLevelComplete();
        setTutorialDone(true);
        onTutorialComplete();
      }
    },
    [controller, onTutorialComplete, showBanner]
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

  const handleRestartTutorial = () => {
    evaluatorRef.current.reset(TUTORIAL_LEVEL);
    tutorialDoneRef.current = false;
    setStepIdx(0);
    setHoldProgress(0);
    setTutorialDone(false);
    setFeedbackBanner(null);
    setLiveHint(null);
  };

  const currentStep =
    TUTORIAL_LEVEL.steps[stepIdx] ??
    TUTORIAL_LEVEL.steps[TUTORIAL_LEVEL.steps.length - 1];
  const demoInfo =
    STEP_DEMO_TIPS[currentStep.id] ?? STEP_DEMO_TIPS['tut-1'];
  const character = getCharacterById(selectedCharacterId);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
      {/* Header & Step Progress */}
      <div className="rounded-3xl border-2 border-wayang-gold/40 bg-white p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-wayang-gold-soft px-3 py-1 text-xs font-bold text-wayang-brown">
              <Sparkles className="h-3.5 w-3.5 text-wayang-terracotta" />
              Mode Belajar & Demonstrasi • {character.name}
            </span>
            <h1 className="font-display mt-1.5 text-2xl font-bold text-wayang-brown sm:text-3xl">
              {tutorialDone
                ? 'Selamat! Tutorial Selesai!'
                : currentStep.title}
            </h1>
          </div>

          <button
            type="button"
            onClick={handleRestartTutorial}
            className="flex items-center gap-1.5 rounded-2xl border border-wayang-brown/20 px-4 py-2 text-xs font-bold text-wayang-brown transition hover:bg-wayang-cream"
          >
            <RotateCcw className="h-4 w-4" />
            Ulangi Tutorial
          </button>
        </div>

        {/* Step indicators */}
        <div className="mt-4 grid grid-cols-5 gap-2">
          {TUTORIAL_LEVEL.steps.map((step, idx) => {
            const done = tutorialDone || idx < stepIdx;
            const active = !tutorialDone && idx === stepIdx;
            return (
              <div
                key={step.id}
                className={`h-2.5 rounded-full transition-all ${
                  done
                    ? 'bg-wayang-sage'
                    : active
                      ? 'bg-wayang-terracotta'
                      : 'bg-wayang-cream-dark'
                }`}
              />
            );
          })}
        </div>
      </div>

      {tutorialDone ? (
        <div className="rounded-[2rem] border-2 border-wayang-sage bg-white p-8 text-center shadow-card">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-wayang-sage/15 text-wayang-sage">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="font-display mt-4 text-3xl font-bold text-wayang-brown">
            Luar Biasa! Kamu Siap Jadi Dalang Cilik!
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-base text-wayang-charcoal/80">
            Kamu sudah menguasai deteksi tangan, telapak terbuka, gerak kanan,
            telunjuk atas, dan kepalan istirahat. Sekarang saatnya menaklukkan
            5 Level Tantangan!
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => onStartLevel(1)}
              className="flex items-center gap-2 rounded-2xl bg-wayang-terracotta px-7 py-3.5 text-base font-bold text-white shadow-md transition hover:bg-wayang-terracotta-dark"
            >
              Mulai Level 1: Kenalan dengan Wayang
              <ArrowRight className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="rounded-2xl border-2 border-wayang-gold bg-wayang-cream px-6 py-3.5 text-base font-bold text-wayang-brown transition hover:bg-wayang-gold-soft"
            >
              Ke Dasbor Level
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left: Instructor & Practice Stage */}
          <div className="space-y-4 lg:col-span-7">
            <GestureInstructorDemo
              gestureType={demoInfo.gesture}
              title={demoInfo.title}
              tip={demoInfo.tip}
            />

            {/* Instruction & Hold Progress Bar */}
            <div className="rounded-3xl border-2 border-wayang-terracotta/35 bg-white p-4 shadow-card">
              <div className="flex items-center justify-between gap-2">
                <p className="text-base font-bold text-wayang-brown">
                  {currentStep.instruction}
                </p>
                <span className="shrink-0 rounded-full bg-wayang-cream-dark px-3 py-1 text-xs font-bold text-wayang-terracotta">
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
              statusBanner={feedbackBanner}
            />
          </div>

          {/* Right: Webcam & Live Status */}
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

            <GestureStatusPanel handDetected={handDetected} gesture={gesture} />
          </div>
        </div>
      )}
    </div>
  );
}

