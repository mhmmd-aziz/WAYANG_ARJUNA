import { Check, Lock, Play, RotateCcw, Star } from 'lucide-react';
import { isTierIncludedInPlan } from '../../game/achievementManager';
import { GAME_LEVELS } from '../../game/levelManager';
import type {
  CommercialPlanId,
  LevelAccessTier,
  LevelDefinition,
  LevelId,
  PlayerProgressState,
} from '../../types';

interface LevelPathProps {
  progress: PlayerProgressState;
  activePlan: CommercialPlanId;
  onStartLevel: (levelId: LevelId) => void;
  onSelectPlan: (planId: CommercialPlanId) => void;
}

const GROUPS: Array<{
  tier: LevelAccessTier;
  title: string;
  note: string;
  previewPlan?: CommercialPlanId;
}> = [
  { tier: 'free', title: 'Level Dasar', note: 'Gratis' },
  {
    tier: 'episode_pack',
    title: 'Cerita Rakyat Nusantara',
    note: 'Paket Lakon Nusantara',
    previewPlan: 'lakon_pack',
  },
  {
    tier: 'institutional',
    title: 'Sanggar & Sekolah',
    note: 'Lisensi Sekolah & Sanggar',
    previewPlan: 'institutional',
  },
];

type NodeState = 'done' | 'current' | 'locked' | 'plan';

function levelState(level: LevelDefinition, progress: PlayerProgressState, plan: CommercialPlanId) {
  const lvl = progress.levels[level.id];
  const planAllows = isTierIncludedInPlan(level.accessTier ?? 'free', plan);
  const state: NodeState = !planAllows
    ? 'plan'
    : lvl?.completed
      ? 'done'
      : lvl?.unlocked
        ? 'current'
        : 'locked';
  return { state, lvl };
}

/** Levels as a learning path: numbered nodes joined by a line, grouped by access tier. */
export function LevelPath({ progress, activePlan, onStartLevel, onSelectPlan }: LevelPathProps) {
  return (
    <div className="space-y-8">
      {GROUPS.map((group) => {
        const levels = GAME_LEVELS.filter((l) => (l.accessTier ?? 'free') === group.tier);
        const planAllows = isTierIncludedInPlan(group.tier, activePlan);
        return (
          <section key={group.tier} aria-labelledby={`jalur-${group.tier}`}>
            <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
              <div>
                <h3
                  id={`jalur-${group.tier}`}
                  className="font-display text-lg font-bold text-wayang-brown"
                >
                  {group.title}
                </h3>
                <p className="text-sm text-wayang-brown-light">
                  Level {levels[0].id}–{levels[levels.length - 1].id}, {group.note}
                </p>
              </div>
              {!planAllows && group.previewPlan && (
                <button
                  type="button"
                  onClick={() => onSelectPlan(group.previewPlan!)}
                  className="btn btn-sm btn-secondary"
                >
                  Coba pratinjau {group.note}
                </button>
              )}
            </div>

            <ol className="relative">
              {levels.map((level, idx) => {
                const { state, lvl } = levelState(level, progress, activePlan);
                const last = idx === levels.length - 1;
                const open = state === 'done' || state === 'current';
                return (
                  <li key={level.id} className="relative flex gap-4 pb-3 last:pb-0">
                    {!last && (
                      <span
                        aria-hidden="true"
                        className={`absolute left-5 top-10 -bottom-0 w-0.5 -translate-x-1/2 ${
                          state === 'done' ? 'bg-wayang-sage' : 'bg-wayang-brown/15'
                        }`}
                      />
                    )}

                    <span
                      aria-hidden="true"
                      className={`font-display relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-bold ${
                        state === 'done'
                          ? 'bg-wayang-sage text-white'
                          : state === 'current'
                            ? 'bg-wayang-terracotta text-white ring-4 ring-wayang-terracotta/20'
                            : 'border border-wayang-brown/15 bg-wayang-cream-dark text-wayang-brown/45'
                      }`}
                    >
                      {state === 'done' ? (
                        <Check className="h-5 w-5" />
                      ) : state === 'plan' ? (
                        <Lock className="h-4 w-4" />
                      ) : (
                        level.id
                      )}
                    </span>

                    <div
                      className={`flex-1 rounded-xl border px-4 py-3 ${
                        state === 'current'
                          ? 'border-wayang-terracotta bg-white'
                          : state === 'done'
                            ? 'border-wayang-sage/30 bg-white'
                            : 'border-dashed border-wayang-brown/20 bg-white/50'
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                        <div className="min-w-0">
                          <p
                            className={`flex flex-wrap gap-x-3 text-sm ${
                              open ? 'text-wayang-brown-light' : 'text-wayang-brown/50'
                            }`}
                          >
                            <span className="font-semibold">Level {level.id}</span>
                            <span>{level.subtitle}</span>
                            {level.culturalRegion && <span>{level.culturalRegion}</span>}
                          </p>
                          <h4
                            className={`font-display text-lg font-bold ${
                              open ? 'text-wayang-brown' : 'text-wayang-brown/55'
                            }`}
                          >
                            {level.title}
                          </h4>
                        </div>

                        {state === 'done' && (
                          <div className="flex items-center gap-3">
                            <span className="flex" aria-label={`${lvl?.stars ?? 0} dari 3 bintang`}>
                              {[1, 2, 3].map((s) => (
                                <Star
                                  key={s}
                                  className={`h-4 w-4 ${
                                    s <= (lvl?.stars ?? 0)
                                      ? 'fill-wayang-gold text-wayang-gold'
                                      : 'text-wayang-brown/20'
                                  }`}
                                />
                              ))}
                            </span>
                            <button
                              type="button"
                              onClick={() => onStartLevel(level.id)}
                              className="btn btn-sm btn-ghost"
                            >
                              <RotateCcw className="h-4 w-4" />
                              Main lagi
                            </button>
                          </div>
                        )}
                      </div>

                      {state === 'current' && (
                        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
                          <p className="max-w-xl text-sm leading-relaxed text-wayang-charcoal/80">
                            {level.description}
                          </p>
                          <button
                            type="button"
                            onClick={() => onStartLevel(level.id)}
                            className="btn btn-primary"
                          >
                            <Play className="h-4 w-4" />
                            Mulai Tantangan
                          </button>
                        </div>
                      )}

                      {state === 'done' && lvl && (
                        <p className="mt-1 text-sm text-wayang-sage">
                          Skor terbaik {lvl.bestScore}, akurasi {lvl.bestAccuracy}%
                        </p>
                      )}

                      {state === 'locked' && (
                        <p className="mt-0.5 text-sm text-wayang-brown/50">
                          Terbuka setelah Level {level.id - 1} selesai
                        </p>
                      )}
                      {state === 'plan' && (
                        <p className="mt-0.5 text-sm text-wayang-brown/50">
                          Termasuk {level.packLabel ?? group.note}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
