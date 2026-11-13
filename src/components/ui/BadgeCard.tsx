import { Award, Lock, Trophy } from 'lucide-react';
import type { BadgeDefinition } from '../../types';

interface BadgeCardProps {
  badge: BadgeDefinition;
  earned: boolean;
}

export function BadgeCard({ badge, earned }: BadgeCardProps) {
  const Icon = badge.isTrophy ? Trophy : Award;

  return (
    <div
      className={`flex items-start gap-3.5 rounded-xl border p-4 transition ${
        earned
          ? 'border-wayang-gold bg-white'
          : 'border-wayang-brown/10 bg-wayang-cream-dark/50 opacity-75'
      }`}
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${
          earned
            ? 'bg-wayang-gold-soft text-wayang-brown'
            : 'bg-wayang-brown/10 text-wayang-brown/40'
        }`}
      >
        {earned ? <Icon className="h-6 w-6" /> : <Lock className="h-5 w-5" />}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-display text-base font-bold text-wayang-brown">
            {badge.name}
          </h4>
        </div>
        <p className="mt-0.5 text-sm leading-relaxed text-wayang-charcoal/80">
          {badge.description}
        </p>
        <span
          className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
            earned
              ? 'bg-wayang-sage/15 text-wayang-sage'
              : 'bg-wayang-brown/10 text-wayang-brown/60'
          }`}
        >
          {earned ? 'Sudah diraih' : `Selesaikan Level ${badge.levelId}`}
        </span>
      </div>
    </div>
  );
}

