import { AlertTriangle, Camera, CameraOff, Loader2, RefreshCw } from 'lucide-react';
import type { CameraStatus } from '../../hooks/useCamera';
import type { ModelStatus } from '../../hooks/useHandTracking';

interface WebcamFeedProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  overlayCanvasRef: React.RefObject<HTMLCanvasElement>;
  cameraStatus: CameraStatus;
  cameraError: string | null;
  modelStatus: ModelStatus;
  modelError: string | null;
  handDetected: boolean;
  handCount?: number;
  landmarkCount: number;
  fps: number;
  onStartCamera: () => void;
  onStopCamera: () => void;
  compact?: boolean;
}

export function WebcamFeed({
  videoRef,
  overlayCanvasRef,
  cameraStatus,
  cameraError,
  modelStatus,
  modelError,
  handDetected,
  handCount = 0,
  landmarkCount,
  fps,
  onStartCamera,
  onStopCamera,
  compact = false,
}: WebcamFeedProps) {
  const isActive = cameraStatus === 'active';
  const hasError =
    cameraStatus === 'denied' ||
    cameraStatus === 'unavailable' ||
    cameraStatus === 'error' ||
    modelStatus === 'error';

  return (
    <div className="overflow-hidden rounded-3xl border-2 border-wayang-gold/40 bg-wayang-charcoal shadow-card">
      <div
        className={`relative w-full overflow-hidden bg-wayang-charcoal ${
          compact ? 'aspect-[4/3]' : 'aspect-[4/3]'
        }`}
      >
        {/* Mirrored webcam video */}
        <video
          ref={videoRef}
          playsInline
          muted
          className={`h-full w-full -scale-x-100 object-cover ${
            isActive ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* 21 Hand Landmark Canvas Overlay */}
        <canvas
          ref={overlayCanvasRef}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />

        {/* Top status pills */}
        <div className="absolute left-3 right-3 top-3 flex flex-wrap items-center justify-between gap-2">
          <div
            className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold backdrop-blur-md ${
              handDetected
                ? 'bg-wayang-sage/90 text-white'
                : isActive
                  ? 'bg-wayang-brown/85 text-wayang-cream'
                  : 'bg-black/60 text-wayang-cream'
            }`}
          >
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                handDetected
                  ? 'animate-pulse bg-emerald-300'
                  : isActive
                    ? 'bg-wayang-gold'
                    : 'bg-neutral-400'
              }`}
            />
            {handDetected
              ? `${handCount >= 2 ? '2 Tangan (Mode Dalang)' : '1 Tangan Terdeteksi'} • ${landmarkCount} Titik`
              : isActive
                ? 'Tunjukkan 1 atau 2 Tangan ke Kamera'
                : 'Kamera Belum Aktif'}
          </div>

          {isActive && (
            <div className="rounded-full bg-black/65 px-2.5 py-1 text-xs font-semibold text-wayang-gold-soft backdrop-blur-md">
              {fps > 0 ? `${fps} FPS` : 'Memulai...'}
            </div>
          )}
        </div>

        {/* Loading / Idle / Error overlays */}
        {!isActive && !hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-wayang-brown/90 p-6 text-center text-wayang-cream">
            {cameraStatus === 'requesting' || modelStatus === 'loading' ? (
              <>
                <Loader2 className="h-10 w-10 animate-spin text-wayang-gold" />
                <p className="font-display text-lg font-semibold">
                  Menyiapkan Kamera & Pelacak Tangan...
                </p>
                <p className="max-w-xs text-xs text-wayang-cream/80">
                  Mohon tunggu sebentar dan klik "Izinkan" jika browser meminta
                  izin kamera.
                </p>
              </>
            ) : (
              <>
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-wayang-gold/20 text-wayang-gold">
                  <Camera className="h-8 w-8" />
                </div>
                <h3 className="font-display text-xl font-bold">
                  Panduan Sebelum Mengaktifkan Kamera
                </h3>
                <p className="max-w-xs text-xs leading-relaxed text-wayang-cream/90 sm:text-sm">
                  Posisikan 1 atau 2 telapak tangan berjarak 40–60 cm di depan webcam
                  dengan pencahayaan cukup dan latar belakang rapi agar seluruh jari terlihat.
                </p>
                <p className="max-w-xs rounded-xl bg-black/25 px-3 py-1.5 text-[11px] text-wayang-gold-soft">
                  Privasi terjaga: pemrosesan dilakukan lokal di browser Anda, tanpa
                  merekam atau mengunggah video ke server.
                </p>
                <button
                  type="button"
                  onClick={onStartCamera}
                  className="mt-1 flex items-center gap-2 rounded-2xl bg-wayang-gold px-6 py-3 text-base font-bold text-wayang-charcoal shadow-md transition hover:bg-wayang-gold-soft active:scale-95"
                >
                  <Camera className="h-5 w-5" />
                  Izinkan & Aktifkan Kamera
                </button>
              </>
            )}
          </div>
        )}

        {isActive && modelStatus === 'ready' && !handDetected && (
          <div className="pointer-events-none absolute inset-x-3 bottom-3 rounded-2xl bg-black/70 px-3 py-2 text-center text-[11px] font-medium text-wayang-cream backdrop-blur-sm">
            Tangan belum terlihat — pastikan ruangan cukup terang, jarak 40–60 cm,
            dan seluruh telapak tidak terpotong tepi kamera.
          </div>
        )}

        {isActive && modelStatus === 'loading' && (
          <div className="absolute inset-x-3 bottom-3 flex items-center justify-center gap-2 rounded-2xl bg-wayang-brown/90 px-3 py-2 text-xs font-semibold text-wayang-gold-soft">
            <Loader2 className="h-4 w-4 animate-spin" />
            Memuat model MediaPipe Hand Landmarker...
          </div>
        )}

        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-wayang-brown/95 p-6 text-center text-wayang-cream">
            <AlertTriangle className="h-10 w-10 text-wayang-gold" />
            <p className="font-display text-lg font-bold">
              Ups, Kamera Perlu Bantuan
            </p>
            <p className="max-w-sm text-sm text-wayang-cream/90">
              {cameraError ?? modelError}
            </p>
            <button
              type="button"
              onClick={onStartCamera}
              className="mt-1 flex items-center gap-2 rounded-2xl bg-wayang-terracotta px-5 py-2.5 text-sm font-bold text-white transition hover:bg-wayang-terracotta-dark"
            >
              <RefreshCw className="h-4 w-4" />
              Coba Lagi
            </button>
          </div>
        )}
      </div>

      {/* Bottom quick control bar */}
      <div className="flex items-center justify-between gap-2 bg-wayang-brown px-4 py-2.5 text-xs text-wayang-cream">
        <span className="font-medium text-wayang-gold-soft">
          MediaPipe Pelacak 1 & 2 Tangan (hingga 42 Titik)
        </span>
        {isActive ? (
          <button
            type="button"
            onClick={onStopCamera}
            className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 font-semibold text-wayang-cream transition hover:bg-white/20"
          >
            <CameraOff className="h-3.5 w-3.5" />
            Matikan Kamera
          </button>
        ) : (
          <button
            type="button"
            onClick={onStartCamera}
            className="flex items-center gap-1.5 rounded-xl bg-wayang-gold px-3 py-1.5 font-bold text-wayang-charcoal transition hover:bg-wayang-gold-soft"
          >
            <Camera className="h-3.5 w-3.5" />
            Nyalakan
          </button>
        )}
      </div>
    </div>
  );
}

