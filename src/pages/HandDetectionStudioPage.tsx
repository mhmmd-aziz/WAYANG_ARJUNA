import { useCallback, useMemo, useRef, useState } from 'react';
import { Eye, EyeOff, Hand, Users } from 'lucide-react';
import { WAYANG_CHARACTERS } from '../assets/wayangCharacters';
import { WebcamFeed } from '../components/camera/WebcamFeed';
import { GestureStatusPanel } from '../components/hand-tracking/GestureStatusPanel';
import { WayangStageCanvas } from '../components/puppet/WayangStageCanvas';
import { GestureVectorIcon } from '../components/ui/WayangIcons';
import { useCamera } from '../hooks/useCamera';
import { useHandTracking } from '../hooks/useHandTracking';
import { PuppetController } from '../puppet-engine/PuppetController';
import type {
  GestureState,
  GestureType,
  HandTrackingResult,
  PuppetCharacterId,
} from '../types';

interface HandDetectionStudioPageProps {
  selectedCharacterId: PuppetCharacterId;
  onSelectCharacter: (id: PuppetCharacterId) => void;
}

type StudioPuppetMode = 'two_puppets' | 'one_puppet';

const GESTURE_GUIDE: Array<{
  id: string;
  title: string;
  effect: string;
  gestureIcon?: GestureType;
  modeIcon?: 'two' | 'hands';
}> = [
  {
    id: 'mode-two',
    title: 'Mode 2 Wayang (Default)',
    effect:
      'Tangan kiri menggerakkan Wayang Kiri, tangan kanan menggerakkan Wayang Kanan.',
    modeIcon: 'two',
  },
  {
    id: 'mode-one',
    title: 'Mode 1 Wayang (2 Lengan)',
    effect: 'Kedua tangan menggerakkan lengan kiri dan kanan 1 tokoh wayang.',
    modeIcon: 'hands',
  },
  {
    id: 'open-palm',
    title: 'Telapak Terbuka',
    effect: 'Aktifkan dan kendalikan gerakan wayang dengan bebas.',
    gestureIcon: 'open_palm',
  },
  {
    id: 'closed-fist',
    title: 'Tangan Mengepal',
    effect: 'Istirahatkan atau hentikan gerakan wayang dengan tenang.',
    gestureIcon: 'closed_fist',
  },
  {
    id: 'index-up',
    title: 'Telunjuk ke Atas',
    effect: 'Angkat wayang dan arahkan lengan utama ke atas.',
    gestureIcon: 'index_up',
  },
  {
    id: 'pinch',
    title: 'Gerakan Jepit (Pinch)',
    effect: 'Aktifkan pusaka atau panah khusus milik tokoh wayang.',
    gestureIcon: 'pinch',
  },
];

export function HandDetectionStudioPage({
  selectedCharacterId,
  onSelectCharacter,
}: HandDetectionStudioPageProps) {
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [showIndices, setShowIndices] = useState(false);
  const [stageMode, setStageMode] = useState<StudioPuppetMode>('two_puppets');
  const [leftCharacterId, setLeftCharacterId] = useState<PuppetCharacterId>(() =>
    selectedCharacterId === 'gatotkaca' ? 'arjuna' : 'gatotkaca'
  );

  const stageModeRef = useRef(stageMode);
  stageModeRef.current = stageMode;

  const rightController = useMemo(
    () =>
      new PuppetController(selectedCharacterId, {
        x: 0.72,
        y: 0.57,
        facing: -1,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const leftController = useMemo(
    () =>
      new PuppetController(leftCharacterId, {
        x: 0.28,
        y: 0.57,
        facing: 1,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  if (rightController.getCharacter().id !== selectedCharacterId) {
    rightController.setCharacter(selectedCharacterId);
  }
  if (leftController.getCharacter().id !== leftCharacterId) {
    leftController.setCharacter(leftCharacterId);
  }

  const {
    videoRef,
    status: cameraStatus,
    errorMessage: cameraError,
    startCamera,
    stopCamera,
  } = useCamera(false);

  const handleTrackingFrame = useCallback(
    (
      tracking: HandTrackingResult,
      gestureState: GestureState,
      dtSec: number
    ) => {
      if (stageModeRef.current === 'one_puppet') {
        rightController.updateFromTracking(tracking, gestureState, dtSec);
        return;
      }

      const hands = tracking.hands ?? [];
      if (hands.length >= 2) {
        const leftHand = hands[0];
        const rightHand = hands[1];
        const leftSingleGesture = gestureState.leftHand ?? gestureState;
        const rightSingleGesture = gestureState.rightHand ?? gestureState;

        const leftFacesRight =
          leftHand.screenWristX <= rightHand.screenWristX ? 1 : -1;
        leftController.updateFromSingleHand(
          leftHand,
          leftSingleGesture,
          dtSec,
          leftFacesRight
        );
        rightController.updateFromSingleHand(
          rightHand,
          rightSingleGesture,
          dtSec,
          (leftFacesRight * -1) as 1 | -1
        );
      } else if (hands.length === 1) {
        leftController.updateIdle(dtSec, 0.27, 0.57, 1);
        rightController.updateFromSingleHand(
          hands[0],
          gestureState.rightHand ?? gestureState,
          dtSec,
          -1
        );
      } else {
        leftController.updateIdle(dtSec, 0.28, 0.57, 1);
        rightController.updateIdle(dtSec, 0.72, 0.57, -1);
      }
    },
    [leftController, rightController]
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
    showLandmarkIndices: showIndices,
    onTrackingFrame: handleTrackingFrame,
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-wayang-brown sm:text-3xl">
            Panggung Wayang Interaktif
          </h1>
        </div>

        {/* Mode toggle: 2 Wayang vs 1 Wayang */}
        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-wayang-cream p-1.5">
          <button
            type="button"
            onClick={() => setStageMode('two_puppets')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition ${
              stageMode === 'two_puppets'
                ? 'bg-wayang-terracotta text-white shadow-sm'
                : 'text-wayang-brown hover:bg-wayang-gold-soft/60'
            }`}
          >
            <Users className="h-4 w-4" />
            2 Wayang (Kiri & Kanan)
          </button>
          <button
            type="button"
            onClick={() => setStageMode('one_puppet')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition ${
              stageMode === 'one_puppet'
                ? 'bg-wayang-terracotta text-white shadow-sm'
                : 'text-wayang-brown hover:bg-wayang-gold-soft/60'
            }`}
          >
            <Hand className="h-4 w-4" />
            1 Wayang (2 Lengan)
          </button>
        </div>
      </div>

      {/* Character Selectors */}
      <div className="grid gap-3 sm:grid-cols-2">
        {stageMode === 'two_puppets' && (
          <div className="rounded-xl border border-wayang-sage/35 bg-white p-4 shadow-sm">
            <span className="mb-2.5 block text-sm font-semibold text-wayang-sage">
              Wayang Kiri (Dikendalikan Tangan Kiri)
            </span>
            <div className="flex flex-wrap gap-2">
              {WAYANG_CHARACTERS.map((char) => (
                <button
                  key={`left-${char.id}`}
                  type="button"
                  onClick={() => setLeftCharacterId(char.id)}
                  className={`rounded-lg px-3.5 py-1.5 text-sm font-bold transition ${
                    char.id === leftCharacterId
                      ? 'bg-wayang-sage text-white shadow-sm'
                      : 'bg-wayang-cream text-wayang-brown hover:bg-wayang-gold-soft'
                  }`}
                >
                  {char.name
                    .replace('Raden ', '')
                    .replace('Dewi ', '')
                    .replace('Ki Lurah ', '')}
                </button>
              ))}
            </div>
          </div>
        )}

        <div
          className={`rounded-xl border border-wayang-terracotta/35 bg-white p-4 shadow-sm ${
            stageMode === 'one_puppet' ? 'sm:col-span-2' : ''
          }`}
        >
          <span className="mb-2.5 block text-sm font-semibold text-wayang-terracotta">
            {stageMode === 'two_puppets'
              ? 'Wayang Kanan (Dikendalikan Tangan Kanan)'
              : 'Tokoh Wayang Aktif'}
          </span>
          <div className="flex flex-wrap gap-2">
            {WAYANG_CHARACTERS.map((char) => (
              <button
                key={`right-${char.id}`}
                type="button"
                onClick={() => onSelectCharacter(char.id)}
                className={`rounded-lg px-3.5 py-1.5 text-sm font-bold transition ${
                  char.id === selectedCharacterId
                    ? 'bg-wayang-brown text-wayang-gold shadow-sm'
                    : 'bg-wayang-cream text-wayang-brown hover:bg-wayang-gold-soft'
                }`}
              >
                {char.name
                  .replace('Raden ', '')
                  .replace('Dewi ', '')
                  .replace('Ki Lurah ', '')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Live Puppet Stage */}
        <div className="space-y-4 lg:col-span-7">
          <WayangStageCanvas
            controller={rightController}
            secondaryController={
              stageMode === 'two_puppets' ? leftController : null
            }
            isTrackingActive={cameraStatus === 'active' && handDetected}
            isTrackingLoopRunning={
              cameraStatus === 'active' && modelStatus === 'ready'
            }
            statusBanner={
              cameraStatus === 'active' && !handDetected
                ? 'Arahkan 1 atau 2 tanganmu ke kamera untuk memainkan wayang!'
                : cameraStatus === 'active' &&
                    stageMode === 'two_puppets' &&
                    handCount === 1
                  ? '1 tangan terdeteksi! Angkat kedua tanganmu untuk menggerakkan kedua wayang!'
                  : null
            }
          />

          <div className="rounded-xl border border-wayang-gold/35 bg-white p-5">
            <h3 className="font-display text-base font-bold text-wayang-brown">
              Panduan Cepat Gestur Dalang
            </h3>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
              {GESTURE_GUIDE.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 py-1.5 text-sm"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-wayang-cream text-wayang-brown">
                    {item.gestureIcon ? (
                      <GestureVectorIcon
                        gesture={item.gestureIcon}
                        className="h-6 w-6"
                      />
                    ) : item.modeIcon === 'two' ? (
                      <Users className="h-4 w-4 text-wayang-terracotta" />
                    ) : (
                      <Hand className="h-4 w-4 text-wayang-sage" />
                    )}
                  </div>
                  <div>
                    <span className="block font-bold text-wayang-brown">
                      {item.title}
                    </span>
                    <span className="text-wayang-charcoal/80">
                      {item.effect}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Webcam 21/42 Landmarks + Gesture Status */}
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

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowIndices((prev) => !prev)}
              className="flex items-center gap-2 rounded-lg border border-wayang-gold/50 bg-white px-4 py-2 text-sm font-bold text-wayang-brown shadow-sm transition hover:bg-wayang-gold-soft"
            >
              {showIndices ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              {showIndices
                ? 'Sembunyikan Nomor Titik (0-20)'
                : 'Tampilkan Nomor Titik (0-20)'}
            </button>
          </div>

          <GestureStatusPanel handDetected={handDetected} gesture={gesture} />
        </div>
      </div>
    </div>
  );
}
