import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Lock,
  Music,
  Play,
  Square,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { GestureInstructorDemo } from '../components/game/GestureInstructorDemo';
import { GestureStatusPanel } from '../components/hand-tracking/GestureStatusPanel';
import { WebcamFeed } from '../components/camera/WebcamFeed';
import { WayangStageCanvas } from '../components/puppet/WayangStageCanvas';
import { isTierIncludedInPlan } from '../game/achievementManager';
import { FOLKLORE_STORIES } from '../game/storyScripts';
import { useCamera } from '../hooks/useCamera';
import { useHandTracking } from '../hooks/useHandTracking';
import { PuppetController } from '../puppet-engine/PuppetController';
import type {
  CommercialPlanId,
  GestureState,
  HandTrackingResult,
  PuppetCharacterId,
} from '../types';
import { clamp, distance2D } from '../utils/math';
import { soundEffects } from '../utils/sound';
import { storyAudio } from '../utils/storyAudio';

interface StoryTheatrePageProps {
  selectedCharacterId: PuppetCharacterId;
  activePlan: CommercialPlanId;
  onSelectPlan: (planId: CommercialPlanId) => void;
  onSelectCharacter: (id: PuppetCharacterId) => void;
}

export function StoryTheatrePage({
  selectedCharacterId,
  activePlan,
  onSelectPlan,
  onSelectCharacter,
}: StoryTheatrePageProps) {
  const [selectedStoryId, setSelectedStoryId] = useState(
    FOLKLORE_STORIES[0].id
  );
  const [sceneIdx, setSceneIdx] = useState(0);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  const [cueCompletedMap, setCueCompletedMap] = useState<
    Record<string, boolean>
  >({});

  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const cueTimerRef = useRef(0);
  const lastCueUiSyncRef = useRef(0);
  const [cueProgress, setCueProgress] = useState(0);

  const selectedStory = useMemo(
    () =>
      FOLKLORE_STORIES.find((s) => s.id === selectedStoryId) ??
      FOLKLORE_STORIES[0],
    [selectedStoryId]
  );

  const currentScene =
    selectedStory.scenes[sceneIdx] ?? selectedStory.scenes[0];
  const isStoryUnlocked = isTierIncludedInPlan(selectedStory.tier, activePlan);

  const controller = useMemo(
    () => new PuppetController(selectedCharacterId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  if (controller.getCharacter().id !== selectedCharacterId) {
    controller.setCharacter(selectedCharacterId);
  }

  useEffect(() => {
    storyAudio.setListener((speaking, speaker) => {
      setIsSpeaking(speaking);
      setActiveSpeaker(speaker);
    });
    return () => {
      storyAudio.setListener(null);
      storyAudio.stop();
    };
  }, []);

  // Automatically trigger Ki Dalang narration & antawacana audio when changing scene (if unlocked & autoSpeak)
  useEffect(() => {
    cueTimerRef.current = 0;
    setCueProgress(0);
    if (!isStoryUnlocked || !autoSpeak) {
      storyAudio.stop();
      return;
    }

    storyAudio.speakScene({
      narration: currentScene.narration,
      speaker: currentScene.speaker,
      dialogue: currentScene.dialogue,
      playSceneCue: true,
    });
  }, [currentScene, isStoryUnlocked, autoSpeak]);

  const handleSelectStory = (storyId: string) => {
    soundEffects.playSelect();
    const target =
      FOLKLORE_STORIES.find((s) => s.id === storyId) ?? FOLKLORE_STORIES[0];
    setSelectedStoryId(target.id);
    setSceneIdx(0);
    onSelectCharacter(target.leadCharacterId);
  };

  const handleReplayAudio = () => {
    storyAudio.speakScene({
      narration: currentScene.narration,
      speaker: currentScene.speaker,
      dialogue: currentScene.dialogue,
      playSceneCue: true,
    });
  };

  const handleTrackingFrame = useCallback(
    (tracking: HandTrackingResult, gestureState: GestureState, dtSec: number) => {
      const pose = controller.updateFromTracking(tracking, gestureState, dtSec);
      if (!isStoryUnlocked || !tracking.landmarks) {
        cueTimerRef.current = Math.max(0, cueTimerRef.current - dtSec * 0.6);
        return;
      }

      const reqGesture = currentScene.recommendedGesture;
      const gestureOk =
        !reqGesture ||
        gestureState.primary === reqGesture ||
        gestureState.staticGesture === reqGesture ||
        (reqGesture === 'open_palm' && gestureState.isOpenPalm) ||
        (reqGesture === 'closed_fist' && gestureState.isFist) ||
        (reqGesture === 'index_up' && gestureState.isIndexUp) ||
        (reqGesture === 'pinch' && gestureState.isPinching);

      let zoneOk = true;
      if (currentScene.targetZone) {
        const closestY = clamp(
          currentScene.targetZone.y,
          pose.y - 0.14,
          pose.y
        );
        const dist = distance2D(
          pose.x,
          closestY,
          currentScene.targetZone.x,
          currentScene.targetZone.y
        );
        zoneOk = dist <= currentScene.targetZone.radius * 1.12;
      }

      if (gestureOk && zoneOk) {
        cueTimerRef.current = Math.min(0.65, cueTimerRef.current + dtSec);
      } else {
        cueTimerRef.current = Math.max(0, cueTimerRef.current - dtSec * 0.4);
      }

      const progress = clamp(cueTimerRef.current / 0.65, 0, 1);
      if (progress >= 1 && !cueCompletedMap[currentScene.id]) {
        soundEffects.playStepSuccess();
        controller.triggerCelebration(1.1);
        setCueCompletedMap((prev) => ({
          ...prev,
          [currentScene.id]: true,
        }));
      }

      if (performance.now() - lastCueUiSyncRef.current > 90) {
        lastCueUiSyncRef.current = performance.now();
        setCueProgress(progress);
      }
    },
    [controller, currentScene, cueCompletedMap, isStoryUnlocked]
  );

  const {
    videoRef,
    status: cameraStatus,
    errorMessage: cameraError,
    startCamera,
    stopCamera,
  } = useCamera(false);

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

  const sceneCompleted = Boolean(cueCompletedMap[currentScene.id]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
      {/* Header & Story Selector */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-wayang-terracotta">
              Panggung Cerita
            </p>
            <h1 className="font-display mt-0.5 text-2xl font-bold text-wayang-brown sm:text-3xl">
              {selectedStory.title}
            </h1>
            <p className="mt-0.5 text-sm text-wayang-charcoal/80 sm:text-sm">
              {selectedStory.region} • {selectedStory.summary}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setAutoSpeak((v) => !v)}
              className={`btn border ${
                autoSpeak
                  ? 'border-wayang-sage bg-wayang-sage/10 text-wayang-sage'
                  : 'border-wayang-brown/20 bg-white text-wayang-brown hover:bg-wayang-gold-soft/50'
              }`}
            >
              {autoSpeak ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
              {autoSpeak ? 'Suara Adegan: Aktif' : 'Suara Adegan: Manual'}
            </button>

            <button
              type="button"
              onClick={() => soundEffects.playGamelanPhrase()}
              className="btn btn-secondary"
            >
              <Music className="h-4 w-4 text-wayang-terracotta" />
              Bunyi Gamelan
            </button>
          </div>
        </div>

        {/* Folklore Story Cards */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {FOLKLORE_STORIES.map((story) => {
            const active = story.id === selectedStory.id;
            const unlocked = isTierIncludedInPlan(story.tier, activePlan);
            return (
              <button
                key={story.id}
                type="button"
                onClick={() => handleSelectStory(story.id)}
                className={`rounded-lg border p-3 text-left transition ${
                  active
                    ? 'border-wayang-terracotta bg-wayang-cream shadow-sm'
                    : 'border-wayang-gold/25 bg-white hover:border-wayang-gold'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      story.tier === 'free'
                        ? 'bg-wayang-sage/15 text-wayang-sage'
                        : 'bg-wayang-gold-soft text-wayang-brown'
                    }`}
                  >
                    {story.tierLabel}
                  </span>
                  {!unlocked && (
                    <Lock className="h-3.5 w-3.5 text-wayang-brown/60" />
                  )}
                </div>
                <p className="font-display mt-2 text-sm font-bold text-wayang-brown">
                  {story.title}
                </p>
                <p className="mt-0.5 text-sm text-wayang-brown-light">
                  {story.region} • {story.durationLabel}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {!isStoryUnlocked && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-wayang-gold bg-wayang-gold-soft/45 p-5">
          <div>
            <span className="text-sm font-semibold text-wayang-terracotta">
              Pratinjau Komersialisasi • Paket Lakon Nusantara
            </span>
            <h2 className="font-display text-lg font-bold text-wayang-brown">
              Cerita Rakyat "{selectedStory.title}" Termasuk Paket Lakon Berbayar
            </h2>
            <p className="mt-0.5 text-sm text-wayang-charcoal/85 sm:text-sm">
              Pada simulasi model bisnis ARJUNA, paket lakon cerita rakyat bersuara dapat dibuka
              untuk pengguna paket episode B2C atau lisensi sanggar/sekolah B2B.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSelectPlan('lakon_pack')}
            className="btn btn-primary"
          >
            Aktifkan Pratinjau Paket Lakon (Demo)
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Kelir Stage & Antawacana Audio Script */}
        <div className="space-y-4 lg:col-span-7">
          <WayangStageCanvas
            controller={controller}
            isTrackingActive={cameraStatus === 'active' && handDetected}
            isTrackingLoopRunning={
              cameraStatus === 'active' && modelStatus === 'ready'
            }
            targetZone={currentScene.targetZone ?? null}
            holdProgress={cueProgress}
            statusBanner={
              sceneCompleted ? 'Gerakan adegan sesuai • Luar biasa!' : null
            }
          />

          {/* Dalang Narration & Antawacana Audio Player Card */}
          <div className="rounded-xl border border-wayang-gold/45 bg-wayang-brown p-5 text-wayang-cream">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-sm font-semibold text-wayang-gold">
                  {currentScene.title} ({sceneIdx + 1}/
                  {selectedStory.scenes.length})
                </span>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      isSpeaking
                        ? 'animate-ping bg-emerald-400'
                        : 'bg-wayang-gold/60'
                    }`}
                  />
                  <span className="text-xs font-semibold text-wayang-gold-soft">
                    {isSpeaking
                      ? `Sedang bersuara: ${activeSpeaker ?? 'Ki Dalang'}`
                      : 'Tekan Putar Suara untuk mendengarkan narasi & antawacana'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isSpeaking ? (
                  <button
                    type="button"
                    onClick={() => storyAudio.stop()}
                    className="btn btn-primary"
                  >
                    <Square className="h-3.5 w-3.5" />
                    Stop Suara
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!isStoryUnlocked}
                    onClick={handleReplayAudio}
                    className="btn btn-accent"
                  >
                    <Play className="h-3.5 w-3.5" />
                    Putar Suara Adegan
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4 space-y-3 rounded-lg bg-black/25 p-4">
              <div>
                <span className="text-xs font-semibold text-wayang-gold">
                  Narasi Ki Dalang
                </span>
                <p className="mt-0.5 text-sm leading-relaxed text-wayang-cream">
                  {currentScene.narration}
                </p>
              </div>
              <div className="border-t border-white/10 pt-2.5">
                <span className="text-xs font-semibold text-emerald-300">
                  Antawacana • {currentScene.speaker}
                </span>
                <p className="mt-0.5 font-display text-base italic text-wayang-gold-soft">
                  "{currentScene.dialogue}"
                </p>
              </div>
            </div>

            {/* Scene Navigation */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                disabled={sceneIdx === 0}
                onClick={() => setSceneIdx((i) => Math.max(0, i - 1))}
                className="btn btn-on-dark"
              >
                <ChevronLeft className="h-4 w-4" />
                Adegan Sebelumnya
              </button>

              <div className="flex items-center gap-1.5">
                {selectedStory.scenes.map((sc, idx) => (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => setSceneIdx(idx)}
                    aria-label={`Pilih ${sc.title}`}
                    className={`h-2.5 rounded-full transition-all ${
                      idx === sceneIdx
                        ? 'w-8 bg-wayang-gold'
                        : 'w-2.5 bg-white/30 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                disabled={sceneIdx >= selectedStory.scenes.length - 1}
                onClick={() =>
                  setSceneIdx((i) =>
                    Math.min(selectedStory.scenes.length - 1, i + 1)
                  )
                }
                className="btn btn-primary"
              >
                Adegan Berikutnya
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <p className="rounded-lg border border-wayang-gold/30 bg-white px-4 py-2.5 text-sm leading-relaxed text-wayang-brown-light">
            <strong>Catatan Teknis & Budaya:</strong> Suara narasi &{' '}
            <em>antawacana</em> disintesis langsung oleh browser (Web Speech API `id-ID`)
            beserta efek gamelan Web Audio sembari tangan Anda tetap mengendalikan wayang.
            Naskah lakon bersifat draf edukasi yang disiapkan untuk validasi dan sulih suara
            bersama dalang serta sanggar budaya.
          </p>
        </div>

        {/* Right: Webcam & Scene Gesture Cue */}
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

          <div className="rounded-xl border border-wayang-terracotta/35 bg-white p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-wayang-terracotta">
                Panduan Gerak Adegan Ini
              </span>
              {sceneCompleted && (
                <span className="flex items-center gap-1 rounded-full bg-wayang-sage/15 px-2.5 py-0.5 text-xs font-bold text-wayang-sage">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Sesuai Adegan
                </span>
              )}
            </div>
            <p className="mt-1 text-sm font-bold text-wayang-brown">
              {currentScene.gestureCueLabel}
            </p>
            <div className="mt-2.5 rounded-lg bg-wayang-cream p-3 text-sm leading-relaxed text-wayang-brown">
              <strong>Konteks Budaya:</strong> {currentScene.culturalNote}
            </div>
            <div className="mt-2.5 rounded-lg bg-wayang-gold-soft/40 p-3 text-sm leading-relaxed text-wayang-brown">
              <strong>Nilai Cerita:</strong> {selectedStory.moralValue}
            </div>
          </div>

          {currentScene.recommendedGesture && (
            <GestureInstructorDemo
              gestureType={currentScene.recommendedGesture}
              title="Contoh Gerakan Tangan"
              tip={currentScene.gestureCueLabel}
            />
          )}

          <GestureStatusPanel handDetected={handDetected} gesture={gesture} />
        </div>
      </div>
    </div>
  );
}

