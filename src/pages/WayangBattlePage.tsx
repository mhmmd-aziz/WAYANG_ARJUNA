import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Bot,
  Clock,
  Heart,
  RotateCcw,
  Shield,
  Swords,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import { getCharacterById, WAYANG_CHARACTERS } from '../assets/wayangCharacters';
import { WebcamFeed } from '../components/camera/WebcamFeed';
import { WayangStageCanvas } from '../components/puppet/WayangStageCanvas';
import { GestureVectorIcon } from '../components/ui/WayangIcons';
import {
  type BattleControlMode,
  type BattleSnapshot,
  type BattleSoundEvent,
  WayangBattleEngine,
} from '../game/battleEngine';
import { getEmptyGestureState } from '../computer-vision/gestureRecognition';
import { useCamera } from '../hooks/useCamera';
import { useHandTracking } from '../hooks/useHandTracking';
import { PuppetController } from '../puppet-engine/PuppetController';
import type {
  DetectedHand,
  GestureState,
  HandTrackingResult,
  PuppetCharacterId,
  SingleHandGesture,
} from '../types';
import { soundEffects } from '../utils/sound';

interface WayangBattlePageProps {
  selectedCharacterId: PuppetCharacterId;
  onSelectCharacter: (id: PuppetCharacterId) => void;
}

function triggerBattleSounds(events: BattleSoundEvent[]): void {
  for (const ev of events) {
    switch (ev.type) {
      case 'whoosh':
        soundEffects.playWhoosh(ev.intensity);
        break;
      case 'slash':
        soundEffects.playAttackSlash();
        break;
      case 'jurus':
        soundEffects.playSpecialJurus();
        break;
      case 'hit':
        soundEffects.playHitImpact(ev.heavy);
        break;
      case 'block':
        soundEffects.playBlockClang();
        break;
      case 'victory':
        soundEffects.playVictoryFanfare();
        break;
    }
  }
}

/**
 * Generates an organic sparring AI hand & gesture for 1-Hand vs AI mode.
 */
function buildAiInput(
  timeSec: number,
  targetX: number,
  targetY: number
): { hand: DetectedHand; gesture: SingleHandGesture } {
  const aiX = 0.28 + Math.sin(timeSec * 1.4) * 0.14;
  const aiY = 0.54 + Math.cos(timeSec * 2.1) * 0.1;
  const vx = Math.cos(timeSec * 1.4) * 0.85;
  const vy = -Math.sin(timeSec * 2.1) * 0.3;

  const isPinching = Math.sin(timeSec * 2.7) > 0.92;
  const isFist = !isPinching && Math.cos(timeSec * 1.9) > 0.72;
  const isOpenPalm = !isPinching && !isFist;

  // Convert back from mirrored stage X to raw camera X
  const rawWristX = 1 - aiX;
  const landmarks = Array.from({ length: 21 }, (_, idx) => ({
    x: rawWristX + (idx === 8 ? (targetX > aiX ? -0.08 : 0.08) : 0),
    y: aiY - (idx === 8 ? 0.16 + (targetY - aiY) * 0.2 : 0.06),
    z: 0,
  }));
  landmarks[0] = { x: rawWristX, y: aiY, z: 0 };
  landmarks[9] = { x: rawWristX, y: aiY - 0.11, z: 0 };

  const base = getEmptyGestureState();
  return {
    hand: {
      landmarks,
      rawLandmarks: landmarks,
      worldLandmarks: null,
      handedness: 'Left',
      confidence: 0.95,
      screenWristX: aiX,
    },
    gesture: {
      ...base,
      primary: isPinching
        ? 'pinch'
        : isFist
          ? 'closed_fist'
          : 'open_palm',
      staticGesture: isPinching
        ? 'pinch'
        : isFist
          ? 'closed_fist'
          : 'open_palm',
      isPinching,
      isFist,
      isOpenPalm,
      velocity: { vx, vy },
      confidence: 0.9,
    },
  };
}

export function WayangBattlePage({
  selectedCharacterId,
  onSelectCharacter,
}: WayangBattlePageProps) {
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [controlMode, setControlMode] =
    useState<BattleControlMode>('two_hands');
  const [leftCharacterId, setLeftCharacterId] = useState<PuppetCharacterId>(() =>
    selectedCharacterId === 'gatotkaca' ? 'arjuna' : 'gatotkaca'
  );

  const controlModeRef = useRef(controlMode);
  controlModeRef.current = controlMode;

  const rightController = useMemo(
    () =>
      new PuppetController(selectedCharacterId, {
        x: 0.74,
        y: 0.56,
        facing: -1,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const leftController = useMemo(
    () =>
      new PuppetController(leftCharacterId, {
        x: 0.26,
        y: 0.56,
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

  const engineRef = useRef(new WayangBattleEngine());
  const snapshotRef = useRef<BattleSnapshot | null>(
    engineRef.current.getSnapshot()
  );
  const [hud, setHud] = useState<BattleSnapshot>(() =>
    engineRef.current.getSnapshot()
  );
  const lastHudSyncRef = useRef(0);

  const {
    videoRef,
    status: cameraStatus,
    errorMessage: cameraError,
    startCamera,
    stopCamera,
  } = useCamera(false);

  const handleRestartBattle = useCallback(() => {
    soundEffects.playSelect();
    engineRef.current.reset();
    const fresh = engineRef.current.getSnapshot();
    snapshotRef.current = fresh;
    setHud(fresh);
  }, []);

  const handleTrackingFrame = useCallback(
    (
      tracking: HandTrackingResult,
      gestureState: GestureState,
      dtSec: number
    ) => {
      const hands = tracking.hands ?? [];
      let leftActive = false;
      let rightActive = false;
      let leftGesture: SingleHandGesture | null = null;
      let rightGesture: SingleHandGesture | null = null;

      if (controlModeRef.current === 'two_hands') {
        if (hands.length >= 2) {
          leftActive = true;
          rightActive = true;
          leftGesture = gestureState.leftHand ?? gestureState;
          rightGesture = gestureState.rightHand ?? gestureState;
          leftController.updateFromSingleHand(
            hands[0],
            leftGesture,
            dtSec,
            1
          );
          rightController.updateFromSingleHand(
            hands[1],
            rightGesture,
            dtSec,
            -1
          );
        } else if (hands.length === 1) {
          // Single detected hand drives whichever side of the screen it is on
          const onLeftSide = hands[0].screenWristX < 0.5;
          if (onLeftSide) {
            leftActive = true;
            leftGesture = gestureState.rightHand ?? gestureState;
            leftController.updateFromSingleHand(
              hands[0],
              leftGesture,
              dtSec,
              1
            );
            rightController.updateIdle(dtSec, 0.74, 0.56, -1);
          } else {
            rightActive = true;
            rightGesture = gestureState.rightHand ?? gestureState;
            rightController.updateFromSingleHand(
              hands[0],
              rightGesture,
              dtSec,
              -1
            );
            leftController.updateIdle(dtSec, 0.26, 0.56, 1);
          }
        } else {
          leftController.updateIdle(dtSec, 0.26, 0.56, 1);
          rightController.updateIdle(dtSec, 0.74, 0.56, -1);
        }
      } else {
        // 1 Hand vs AI sparring opponent
        if (hands.length >= 1) {
          rightActive = true;
          rightGesture = gestureState.rightHand ?? gestureState;
          rightController.updateFromSingleHand(
            hands[hands.length - 1],
            rightGesture,
            dtSec,
            -1
          );
        } else {
          rightController.updateIdle(dtSec, 0.74, 0.56, -1);
        }

        const rightPose = rightController.getPose();
        const ai = buildAiInput(
          performance.now() / 1000,
          rightPose.x,
          rightPose.y
        );
        leftActive = true;
        leftGesture = ai.gesture;
        leftController.updateFromSingleHand(ai.hand, ai.gesture, dtSec, 1);
      }

      const { snapshot, sounds } = engineRef.current.update({
        dtSec,
        leftPose: leftController.getPose(),
        rightPose: rightController.getPose(),
        leftGesture,
        rightGesture,
        leftActive,
        rightActive,
      });

      snapshotRef.current = snapshot;
      triggerBattleSounds(sounds);

      const now = performance.now();
      if (snapshot.finished || now - lastHudSyncRef.current > 70) {
        lastHudSyncRef.current = now;
        setHud(snapshot);
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
  } = useHandTracking({
    videoRef,
    overlayCanvasRef,
    cameraStatus,
    enabled: true,
    onTrackingFrame: handleTrackingFrame,
  });

  const leftChar = getCharacterById(leftCharacterId);
  const rightChar = getCharacterById(selectedCharacterId);
  const winnerName =
    hud.winner === 'left'
      ? leftChar.name
      : hud.winner === 'right'
        ? rightChar.name
        : 'Seri!';

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6">
      {/* Top Title & Mode Switch */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-wayang-brown sm:text-3xl">
            Tanding Jurus Wayang Kulit
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg bg-wayang-cream p-1">
            <button
              type="button"
              onClick={() => {
                setControlMode('two_hands');
                handleRestartBattle();
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-bold transition ${
                controlMode === 'two_hands'
                  ? 'bg-wayang-brown text-wayang-gold shadow-sm'
                  : 'text-wayang-brown hover:bg-wayang-gold-soft/60'
              }`}
            >
              <Users className="h-4 w-4" />
              2 Tangan (Kiri vs Kanan)
            </button>
            <button
              type="button"
              onClick={() => {
                setControlMode('vs_ai');
                handleRestartBattle();
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-bold transition ${
                controlMode === 'vs_ai'
                  ? 'bg-wayang-brown text-wayang-gold shadow-sm'
                  : 'text-wayang-brown hover:bg-wayang-gold-soft/60'
              }`}
            >
              <Bot className="h-4 w-4" />
              1 Tangan vs AI
            </button>
          </div>

          <button
            type="button"
            onClick={handleRestartBattle}
            className="btn btn-primary"
          >
            <RotateCcw className="h-4 w-4" />
            Tanding Ulang
          </button>
        </div>
      </div>

      {/* Health & Energy Bars (Darah Wayang Kiri vs Wayang Kanan) */}
      <div className="grid items-center gap-4 rounded-xl border border-wayang-brown/20 bg-white p-4 md:grid-cols-11">
        {/* Left Fighter HP */}
        <div
          className={`space-y-2 rounded-lg p-3 transition md:col-span-5 ${
            hud.left.hitFlashSec > 0 ? 'bg-red-50' : 'bg-wayang-cream/60'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-xs font-semibold text-wayang-sage">
                {controlMode === 'two_hands' ? 'Tangan Kiri' : 'Lawan AI'}
              </span>
              <h2 className="font-display text-lg font-bold text-wayang-brown">
                {leftChar.name}
              </h2>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold text-wayang-brown shadow-sm">
              <Heart className="h-3.5 w-3.5 fill-wayang-terracotta text-wayang-terracotta" />
              <span>
                {hud.left.hp}/{hud.left.maxHp}
              </span>
            </div>
          </div>

          {/* HP Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-wayang-brown">
              <span>DARAH</span>
              <span>{Math.round((hud.left.hp / hud.left.maxHp) * 100)}%</span>
            </div>
            <div className="h-5 w-full overflow-hidden rounded-full border border-wayang-brown/25 bg-neutral-200">
              <div
                className="h-full rounded-full bg-emerald-600 transition-all duration-150"
                style={{ width: `${(hud.left.hp / hud.left.maxHp) * 100}%` }}
              />
            </div>
          </div>

          {/* Energy & Status */}
          <div className="flex items-center justify-between gap-3 text-xs">
            <div className="flex flex-1 items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-wayang-gold" />
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-wayang-cream-dark">
                <div
                  className="h-full rounded-full bg-wayang-gold transition-all duration-150"
                  style={{ width: `${hud.left.energy}%` }}
                />
              </div>
            </div>
            <span className="font-bold text-wayang-brown-light">
              {hud.left.statusText}
            </span>
          </div>
        </div>

        {/* Center Timer */}
        <div className="flex flex-col items-center justify-center gap-1 text-center md:col-span-1">
          <div className="flex h-14 w-14 flex-col items-center justify-center rounded-lg bg-wayang-brown text-wayang-gold shadow-sm">
            <Clock className="h-3.5 w-3.5" />
            <span className="font-display text-lg font-bold leading-none">
              {hud.remainingSec}
            </span>
          </div>
          <span className="text-xs font-semibold text-wayang-brown-light">
            Detik
          </span>
        </div>

        {/* Right Fighter HP */}
        <div
          className={`space-y-2 rounded-lg p-3 transition md:col-span-5 ${
            hud.right.hitFlashSec > 0 ? 'bg-red-50' : 'bg-wayang-cream/60'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold text-wayang-brown shadow-sm">
              <Heart className="h-3.5 w-3.5 fill-wayang-terracotta text-wayang-terracotta" />
              <span>
                {hud.right.hp}/{hud.right.maxHp}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-wayang-terracotta">
                Tangan Kanan
              </span>
              <h2 className="font-display text-lg font-bold text-wayang-brown">
                {rightChar.name}
              </h2>
            </div>
          </div>

          {/* HP Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-wayang-brown">
              <span>{Math.round((hud.right.hp / hud.right.maxHp) * 100)}%</span>
              <span>DARAH</span>
            </div>
            <div className="h-5 w-full overflow-hidden rounded-full border border-wayang-brown/25 bg-neutral-200">
              <div
                className="ml-auto h-full rounded-full bg-red-600 transition-all duration-150"
                style={{ width: `${(hud.right.hp / hud.right.maxHp) * 100}%` }}
              />
            </div>
          </div>

          {/* Energy & Status */}
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="font-bold text-wayang-brown-light">
              {hud.right.statusText}
            </span>
            <div className="flex flex-1 items-center gap-1.5">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-wayang-cream-dark">
                <div
                  className="ml-auto h-full rounded-full bg-wayang-gold transition-all duration-150"
                  style={{ width: `${hud.right.energy}%` }}
                />
              </div>
              <Zap className="h-3.5 w-3.5 text-wayang-gold" />
            </div>
          </div>
        </div>
      </div>

      {/* Character Quick Switchers */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-wayang-sage/30 bg-white px-4 py-3 shadow-sm">
          <span className="mb-2 block text-xs font-semibold text-wayang-sage">
            Pilih Wayang Kiri
          </span>
          <div className="flex flex-wrap gap-1.5">
            {WAYANG_CHARACTERS.map((char) => (
              <button
                key={`battle-left-${char.id}`}
                type="button"
                onClick={() => setLeftCharacterId(char.id)}
                className={`rounded-lg px-3 py-1.5 text-sm font-bold transition ${
                  char.id === leftCharacterId
                    ? 'bg-wayang-sage text-white'
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

        <div className="rounded-lg border border-wayang-terracotta/30 bg-white px-4 py-3 shadow-sm">
          <span className="mb-2 block text-xs font-semibold text-wayang-terracotta">
            Pilih Wayang Kanan
          </span>
          <div className="flex flex-wrap gap-1.5">
            {WAYANG_CHARACTERS.map((char) => (
              <button
                key={`battle-right-${char.id}`}
                type="button"
                onClick={() => onSelectCharacter(char.id)}
                className={`rounded-lg px-3 py-1.5 text-sm font-bold transition ${
                  char.id === selectedCharacterId
                    ? 'bg-wayang-brown text-wayang-gold'
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

      {/* Stage & Webcam Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-7">
          <div className="relative">
            <WayangStageCanvas
              controller={rightController}
              secondaryController={leftController}
              isTrackingActive={cameraStatus === 'active' && handDetected}
              isTrackingLoopRunning={
                cameraStatus === 'active' && modelStatus === 'ready'
              }
              battleSnapshotRef={snapshotRef}
              statusBanner={
                cameraStatus === 'active' &&
                controlMode === 'two_hands' &&
                handCount === 1
                  ? '1 tangan terdeteksi — angkat tangan satunya agar kedua wayang bertarung!'
                  : null
              }
            />

            {/* Victory Overlay */}
            {hud.finished && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-wayang-charcoal/70 p-6 backdrop-blur-sm">
                <div className="w-full max-w-sm rounded-xl border border-wayang-gold bg-white p-6 text-center shadow-xl">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-wayang-gold-soft text-wayang-brown">
                    <Trophy className="h-8 w-8 text-wayang-terracotta" />
                  </div>
                  <span className="mt-3 inline-block rounded-full bg-wayang-cream px-3 py-1 text-xs font-bold text-wayang-brown">
                    Pertarungan Selesai
                  </span>
                  <h3 className="font-display mt-2 text-2xl font-bold text-wayang-brown">
                    {hud.winner === 'draw'
                      ? 'Pertandingan Seri!'
                      : `Pemenang: ${winnerName}`}
                  </h3>
                  <p className="mt-1 text-sm text-wayang-charcoal/80">
                    Sisa Darah: {leftChar.name} ({hud.left.hp}) vs{' '}
                    {rightChar.name} ({hud.right.hp})
                  </p>
                  <button
                    type="button"
                    onClick={handleRestartBattle}
                    className="btn btn-primary mt-5 w-full"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Tanding Ulang Sekarang
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Battle Controls Guide - Crystal Clear 4 Actions */}
          <div className="rounded-xl border border-wayang-gold/35 bg-white p-4">
            <h3 className="font-display text-base font-bold text-wayang-brown">
              Cara Memukul & Bertarung
            </h3>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
              <div className="flex items-start gap-3 py-1.5 text-sm">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-wayang-cream text-wayang-terracotta">
                  <Swords className="h-4 w-4" />
                </div>
                <div>
                  <span className="block font-bold text-wayang-brown">
                    1. Pukul / Sabetan (Ayun Cepat)
                  </span>
                  <span className="text-wayang-charcoal/80">
                    Ayunkan tanganmu dengan cepat ke kiri/kanan/depan untuk
                    memukul & meluncurkan gelombang tebasan (-10 s/d -12 HP).
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 py-1.5 text-sm">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-wayang-cream text-wayang-brown">
                  <GestureVectorIcon gesture="index_up" className="h-6 w-6" />
                </div>
                <div>
                  <span className="block font-bold text-wayang-brown">
                    2. Tembak Cepat (Angkat Telunjuk)
                  </span>
                  <span className="text-wayang-charcoal/80">
                    Acungkan jari telunjukmu untuk menembakkan panah cahaya ke
                    lawan (-9 HP).
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 py-1.5 text-sm">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-wayang-cream text-wayang-brown">
                  <GestureVectorIcon gesture="pinch" className="h-6 w-6" />
                </div>
                <div>
                  <span className="block font-bold text-wayang-brown">
                    3. Jurus Pamungkas (Jepit / Pinch)
                  </span>
                  <span className="text-wayang-charcoal/80">
                    Temukan jempol & telunjuk untuk menembak Jurus Pusaka besar
                    (-18 HP, butuh energi).
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 py-1.5 text-sm">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-wayang-cream text-wayang-sage">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <span className="block font-bold text-wayang-brown">
                    4. Tangkis (Kepal Tangan Diam)
                  </span>
                  <span className="text-wayang-charcoal/80">
                    Tahan kepalan tangan untuk memunculkan perisai penahan
                    serangan lawan.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Webcam & Audio Hint */}
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

          <div className="rounded-xl border border-wayang-gold/35 bg-white p-4">
            <h3 className="text-sm font-bold text-wayang-brown">
              Tips Pertarungan 2 Tangan
            </h3>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 marker:text-wayang-gold text-sm leading-relaxed text-wayang-charcoal/85">
              <li>
                <strong>Tangan Kiri</strong> di depan kamera mengendalikan{' '}
                <strong>{leftChar.name}</strong> di sisi kiri kelir.
              </li>
              <li>
                <strong>Tangan Kanan</strong> mengendalikan{' '}
                <strong>{rightChar.name}</strong> di sisi kanan kelir.
              </li>
              <li>
                Pastikan speaker menyala untuk mendengar efek suara{' '}
                <em>whoosh</em>, benturan perisai, pukulan <em>kendang</em>, dan
                gong kemenangan!
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

