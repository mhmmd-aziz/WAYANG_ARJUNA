import { Hand, Sparkles } from 'lucide-react';
import type { GestureState } from '../../types';

interface GestureStatusPanelProps {
  handDetected: boolean;
  gesture: GestureState;
}

export function GestureStatusPanel({
  handDetected,
  gesture,
}: GestureStatusPanelProps) {
  const fingers = [
    { name: 'Jempol', curl: gesture.fingerCurl.thumb },
    { name: 'Telunjuk', curl: gesture.fingerCurl.index },
    { name: 'Tengah', curl: gesture.fingerCurl.middle },
    { name: 'Manis', curl: gesture.fingerCurl.ring },
    { name: 'Kelingking', curl: gesture.fingerCurl.pinky },
  ];

  return (
    <div className="rounded-3xl border-2 border-wayang-gold/35 bg-white p-4 shadow-card">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
              handDetected
                ? 'bg-wayang-sage/15 text-wayang-sage'
                : 'bg-wayang-cream-dark text-wayang-brown/60'
            }`}
          >
            <Hand className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-wayang-brown-light">
              Gestur Terdeteksi
            </p>
            <h3 className="font-display text-lg font-bold text-wayang-brown">
              {handDetected ? gesture.label : 'Menunggu Tangan...'}
            </h3>
          </div>
        </div>

        {handDetected && (
          <span className="flex items-center gap-1 rounded-full bg-wayang-gold-soft px-3 py-1 text-xs font-bold text-wayang-brown">
            <Sparkles className="h-3.5 w-3.5 text-wayang-terracotta" />
            {Math.round(gesture.confidence * 100)}%
          </span>
        )}
      </div>

      <p className="mt-2 rounded-2xl bg-wayang-cream px-3 py-2 text-xs font-medium text-wayang-charcoal/85">
        {handDetected
          ? gesture.description
          : 'Posisikan 1 atau 2 tangan di depan kamera dengan jarak sekitar 40-60 cm dan cahaya cukup.'}
      </p>

      {handDetected && gesture.handCount >= 2 && gesture.leftHand && gesture.rightHand && (
        <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-2xl bg-wayang-sage/10 px-3 py-2">
            <span className="block text-[10px] font-bold uppercase text-wayang-sage">
              Tangan Kiri Wayang
            </span>
            <span className="font-bold text-wayang-brown">
              {gesture.leftHand.label}
            </span>
          </div>
          <div className="rounded-2xl bg-wayang-terracotta/10 px-3 py-2">
            <span className="block text-[10px] font-bold uppercase text-wayang-terracotta">
              Tangan Kanan Wayang
            </span>
            <span className="font-bold text-wayang-brown">
              {gesture.rightHand.label}
            </span>
          </div>
        </div>
      )}

      {/* Finger extension indicator bars */}
      <div className="mt-3 grid grid-cols-5 gap-2">
        {fingers.map((f) => {
          const openness = handDetected
            ? Math.round((1 - f.curl) * 100)
            : 0;
          return (
            <div key={f.name} className="text-center">
              <div className="mx-auto h-10 w-3 overflow-hidden rounded-full bg-wayang-cream-dark">
                <div
                  className="w-full rounded-full bg-wayang-terracotta transition-all duration-150"
                  style={{
                    height: `${openness}%`,
                    marginTop: `${100 - openness}%`,
                  }}
                />
              </div>
              <span className="mt-1 block text-[10px] font-semibold text-wayang-brown-light">
                {f.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

