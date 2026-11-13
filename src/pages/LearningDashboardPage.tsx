import { useState } from 'react';
import {
  Award,
  BookOpen,
  BookOpenText,
  Building2,
  CheckCircle2,
  Crown,
  Lock,
  Play,
  RotateCcw,
  Star,
} from 'lucide-react';
import { getCharacterById } from '../assets/wayangCharacters';
import { BadgeCard } from '../components/ui/BadgeCard';
import {
  BADGES,
  isTierIncludedInPlan,
} from '../game/achievementManager';
import { GAME_LEVELS } from '../game/levelManager';
import type {
  AppPage,
  CommercialPlanId,
  LevelAccessTier,
  LevelId,
  PlayerProgressState,
} from '../types';

interface LearningDashboardPageProps {
  progress: PlayerProgressState;
  onStartLevel: (levelId: LevelId) => void;
  onNavigate: (page: AppPage) => void;
  onSelectPlan: (planId: CommercialPlanId) => void;
  onResetProgress: () => void;
}

const COMMERCIAL_PLANS: Array<{
  id: CommercialPlanId;
  name: string;
  badge: string;
  target: string;
  pricingNote: string;
  highlights: string[];
  icon: typeof Crown;
}> = [
  {
    id: 'freemium',
    name: 'Paket Pemula',
    badge: 'Gratis',
    target: 'Pelajar & Pengguna Umum',
    pricingNote: 'Gratis',
    highlights: [
      'Akses penuh Tutorial Gerakan & Studio 1–2 Wayang',
      'Level 1–5 dasar pengenalan gestur & kendali kelir',
      'Cerita Rakyat gratis: Pusaka Amarta & Pitutur Semar',
    ],
    icon: BookOpen,
  },
  {
    id: 'lakon_pack',
    name: 'Paket Lakon Nusantara',
    badge: 'Ekspansi Cerita',
    target: 'Keluarga & Peminat Budaya',
    pricingNote: 'Paket episode, harga belum ditetapkan',
    highlights: [
      'Semua fitur Gratis + Level Cerita Rakyat 6–8',
      'Cerita rakyat bersuara: Timun Mas & Roro Jonggrang',
      'Draf antawacana & pengayaan nilai budaya daerah',
    ],
    icon: Crown,
  },
  {
    id: 'institutional',
    name: 'Lisensi Sekolah & Sanggar',
    badge: 'Institusional',
    target: 'Sekolah, Sanggar Wayang & Komunitas',
    pricingNote: 'Lisensi lembaga dengan royalti kontributor (draf)',
    highlights: [
      'Akses seluruh Level 1–10 (termasuk Pasopati & Gelar Agung)',
      'Semua cerita rakyat bersuara & modul sabetan lanjutan',
      'Dirancang dengan skema atribusi & royalti dalang/penulis naskah',
    ],
    icon: Building2,
  },
];

type TierFilter = 'all' | LevelAccessTier;

export function LearningDashboardPage({
  progress,
  onStartLevel,
  onNavigate,
  onSelectPlan,
  onResetProgress,
}: LearningDashboardPageProps) {
  const [tierFilter, setTierFilter] = useState<TierFilter>('all');
  const activePlan = progress.activePlan ?? 'freemium';
  const completedCount = Object.values(progress.levels).filter(
    (l) => l.completed
  ).length;
  const activeCharacter = getCharacterById(progress.selectedCharacterId);

  const filteredLevels =
    tierFilter === 'all'
      ? GAME_LEVELS
      : GAME_LEVELS.filter((l) => (l.accessTier ?? 'free') === tierFilter);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
      {/* Top Progress Summary */}
      <div className="grid gap-4 md:grid-cols-12">
        <div className="space-y-2 md:col-span-7">
          <h1 className="font-display text-3xl font-bold text-wayang-brown">
            Latihan Sabetan, Cerita Rakyat & Lencana
          </h1>
          <p className="text-sm text-wayang-charcoal/80">
            Tokoh aktif: <strong>{activeCharacter.name}</strong>. Progres tersimpan di
            browser ini. Level 1–5 terbuka gratis; Level 6–10 dapat dicoba lewat
            pratinjau paket di bagian bawah halaman.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="button"
              onClick={() => onNavigate('stories')}
              className="btn btn-primary"
            >
              <BookOpenText className="h-4 w-4" />
              Buka Menu Cerita Bersuara
            </button>
            <button
              type="button"
              onClick={() => onNavigate('tutorial')}
              className="btn btn-secondary"
            >
              <BookOpen className="h-4 w-4" />
              {progress.tutorialCompleted
                ? 'Ulangi Latihan Dasar'
                : 'Ikuti Latihan Dasar'}
            </button>
            <button
              type="button"
              onClick={onResetProgress}
              className="btn btn-ghost"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Progres
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 md:col-span-5">
          <div className="flex flex-col justify-center rounded-lg bg-wayang-cream p-4 text-center">
            <span className="font-display text-2xl font-bold text-wayang-terracotta">
              {completedCount}/{GAME_LEVELS.length}
            </span>
            <span className="mt-1 text-xs font-semibold text-wayang-brown">
              Level Selesai
            </span>
          </div>
          <div className="flex flex-col justify-center rounded-lg bg-wayang-cream p-4 text-center">
            <span className="font-display text-2xl font-bold text-wayang-brown">
              {progress.totalScore}
            </span>
            <span className="mt-1 text-xs font-semibold text-wayang-brown">
              Total Skor
            </span>
          </div>
          <div className="flex flex-col justify-center rounded-lg bg-wayang-cream p-4 text-center">
            <span className="font-display text-2xl font-bold text-wayang-sage">
              {progress.earnedBadgeIds.length}/{BADGES.length}
            </span>
            <span className="mt-1 text-xs font-semibold text-wayang-brown">
              Lencana
            </span>
          </div>
        </div>
      </div>

      {/* Progressive Levels Section */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-bold text-wayang-brown">
            {GAME_LEVELS.length} Level Tantangan & Cerita Rakyat
          </h2>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all' as const, label: `Semua (${GAME_LEVELS.length})` },
              { id: 'free' as const, label: 'Gratis (1–5)' },
              { id: 'episode_pack' as const, label: 'Cerita Rakyat (6–8)' },
              { id: 'institutional' as const, label: 'Sanggar & Sekolah (9–10)' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTierFilter(tab.id)}
                className={`rounded-lg px-3.5 py-1.5 text-sm font-bold transition ${
                  tierFilter === tab.id
                    ? 'bg-wayang-brown text-wayang-gold shadow-sm'
                    : 'border border-wayang-gold/40 bg-white text-wayang-brown hover:bg-wayang-gold-soft/45'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredLevels.map((level) => {
            const lvlState = progress.levels[level.id] ?? {
              levelId: level.id,
              unlocked: false,
              completed: false,
              bestScore: 0,
              bestAccuracy: 0,
              stars: 0,
              attempts: 0,
            };
            const tier = level.accessTier ?? 'free';
            const planAllows = isTierIncludedInPlan(tier, activePlan);
            const unlocked = planAllows && lvlState.unlocked;

            return (
              <div
                key={level.id}
                className={`flex flex-col justify-between rounded-xl border p-5 transition ${
                  unlocked
                    ? 'border-wayang-gold/45 bg-white'
                    : 'border-wayang-brown/10 bg-wayang-cream-dark/60 opacity-85'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-wayang-gold-soft px-3 py-1 text-xs font-bold text-wayang-brown">
                      Level {level.id}: {level.subtitle}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          className={`h-4 w-4 ${
                            s <= lvlState.stars
                              ? 'fill-wayang-gold text-wayang-gold'
                              : 'text-wayang-brown/20'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        tier === 'free'
                          ? 'bg-wayang-sage/15 text-wayang-sage'
                          : tier === 'episode_pack'
                            ? 'bg-wayang-terracotta/15 text-wayang-terracotta'
                            : 'bg-wayang-brown text-wayang-gold'
                      }`}
                    >
                      {level.packLabel ?? 'Gratis'}
                    </span>
                    {level.culturalRegion && (
                      <span className="rounded-full bg-wayang-cream px-2.5 py-0.5 text-xs font-semibold text-wayang-brown-light">
                        {level.culturalRegion}
                      </span>
                    )}
                  </div>

                  <h3 className="font-display mt-2.5 text-xl font-bold text-wayang-brown">
                    {level.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-wayang-charcoal/80">
                    {level.description}
                  </p>

                  {lvlState.completed && (
                    <div className="mt-3 flex items-center gap-3 text-xs font-bold text-wayang-sage">
                      <span>Skor terbaik {lvlState.bestScore}</span>
                      <span>Akurasi {lvlState.bestAccuracy}%</span>
                    </div>
                  )}
                </div>

                {unlocked ? (
                  <button
                    type="button"
                    onClick={() => onStartLevel(level.id)}
                    className="btn btn-primary mt-5 w-full"
                  >
                    <Play className="h-4 w-4" />
                    {lvlState.completed ? 'Mainkan Lagi' : 'Mulai Tantangan'}
                  </button>
                ) : !planAllows ? (
                  <button
                    type="button"
                    onClick={() =>
                      onSelectPlan(
                        tier === 'episode_pack' ? 'lakon_pack' : 'institutional'
                      )
                    }
                    className="btn btn-secondary mt-5 w-full"
                  >
                    Buka Pratinjau {level.packLabel}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="btn mt-5 w-full cursor-not-allowed bg-wayang-brown/10 text-wayang-brown/50"
                  >
                    <Lock className="h-4 w-4" />
                    Selesaikan Level {level.id - 1} Dulu
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Achievement Badges */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Award className="h-6 w-6 text-wayang-terracotta" />
          <h2 className="font-display text-2xl font-bold text-wayang-brown">
            Koleksi {BADGES.length} Lencana & Piala Agung
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BADGES.map((badge) => (
            <BadgeCard
              key={badge.id}
              badge={badge}
              earned={progress.earnedBadgeIds.includes(badge.id)}
            />
          ))}
        </div>
      </section>

      {/* Access plan preview (local only, no payment) */}
      <section className="border-t border-wayang-gold/40 pt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-sm font-semibold text-wayang-terracotta">
              Pratinjau paket akses
            </span>
            <h2 className="font-display mt-1 text-2xl font-bold text-wayang-brown">
              Paket Akses ARJUNA
            </h2>
          </div>
          <span className="rounded-full bg-wayang-cream px-3.5 py-1.5 text-xs font-semibold text-wayang-brown">
            Paket aktif:{' '}
            <strong>
              {COMMERCIAL_PLANS.find((p) => p.id === activePlan)?.name}
            </strong>
          </span>
        </div>

        <p className="mt-2 text-sm leading-relaxed text-wayang-charcoal/80 sm:text-sm">
          Rencana skema akses untuk tahap pengembangan berikutnya. Di versi ini, pratinjau
          hanya membuka level di browser Anda; tidak ada pembayaran. Harga dan skema royalti
          dalang/penulis naskah masih divalidasi tim.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {COMMERCIAL_PLANS.map((plan) => {
            const Icon = plan.icon;
            const isActive = activePlan === plan.id;
            return (
              <div
                key={plan.id}
                className={`flex flex-col justify-between rounded-xl border p-5 transition ${
                  isActive
                    ? 'border-wayang-terracotta bg-wayang-cream/65 shadow-sm'
                    : 'border-wayang-gold/30 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-wayang-gold-soft px-3 py-1 text-xs font-bold text-wayang-brown">
                      <Icon className="h-3.5 w-3.5 text-wayang-terracotta" />
                      {plan.badge}
                    </span>
                    {isActive && (
                      <span className="flex items-center gap-1 text-xs font-bold text-wayang-sage">
                        <CheckCircle2 className="h-4 w-4" />
                        Aktif
                      </span>
                    )}
                  </div>

                  <h3 className="font-display mt-3 text-lg font-bold text-wayang-brown">
                    {plan.name}
                  </h3>
                  <p className="text-sm font-semibold text-wayang-terracotta">
                    {plan.target}
                  </p>
                  <p className="mt-1 rounded-lg bg-wayang-cream-dark/60 px-2.5 py-1 text-sm font-semibold text-wayang-brown">
                    {plan.pricingNote}
                  </p>

                  <ul className="mt-3 list-disc space-y-1.5 pl-5 marker:text-wayang-gold text-sm leading-relaxed text-wayang-charcoal/85">
                    {plan.highlights.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectPlan(plan.id)}
                  className={`btn mt-4 w-full ${
                    isActive
                      ? 'bg-wayang-sage text-white'
                      : 'btn-secondary'
                  }`}
                >
                  {isActive
                    ? 'Sedang Digunakan'
                    : 'Coba Pratinjau Paket'}
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
