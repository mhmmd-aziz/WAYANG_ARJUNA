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
    name: 'Paket Pemula (Freemium B2C)',
    badge: 'Gratis',
    target: 'Pelajar & Pengguna Umum',
    pricingNote: 'Akses Gratis Permanen',
    highlights: [
      'Akses penuh Tutorial Gerakan & Studio 1–2 Wayang',
      'Level 1–5 dasar pengenalan gestur & kendali kelir',
      'Cerita Rakyat gratis: Pusaka Amarta & Pitutur Semar',
    ],
    icon: BookOpen,
  },
  {
    id: 'lakon_pack',
    name: 'Paket Lakon Nusantara (Simulasi B2C)',
    badge: 'Ekspansi Cerita',
    target: 'Keluarga & Peminat Budaya',
    pricingNote: 'Simulasi Paket Episode (Skema Harga Uji Pasar)',
    highlights: [
      'Semua fitur Gratis + Level Cerita Rakyat 6–8',
      'Cerita rakyat bersuara: Timun Mas & Roro Jonggrang',
      'Draf antawacana & pengayaan nilai budaya daerah',
    ],
    icon: Crown,
  },
  {
    id: 'institutional',
    name: 'Lisensi Sekolah & Sanggar (Simulasi B2B)',
    badge: 'Institusional',
    target: 'Sekolah, Sanggar Wayang & Komunitas',
    pricingNote: 'Simulasi Lisensi Lembaga + Royalti Kontributor',
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
      <div className="grid gap-4 rounded-3xl border-2 border-wayang-gold/40 bg-white p-6 shadow-card md:grid-cols-12">
        <div className="space-y-2 md:col-span-7">
          <h1 className="font-display text-3xl font-bold text-wayang-brown">
            Latihan Sabetan, Cerita Rakyat & Lencana
          </h1>
          <p className="text-sm text-wayang-charcoal/80">
            Tokoh aktif: <strong>{activeCharacter.name}</strong>. Progres disimpan
            lokal di browser (tanpa backend). Selesaikan Level 1–5 secara gratis,
            lalu jelajahi Level Cerita Rakyat 6–10 lewat simulasi paket di bawah!
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="button"
              onClick={() => onNavigate('stories')}
              className="flex items-center gap-2 rounded-2xl bg-wayang-terracotta px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-wayang-terracotta-dark"
            >
              <BookOpenText className="h-4 w-4" />
              Buka Menu Cerita Bersuara
            </button>
            <button
              type="button"
              onClick={() => onNavigate('tutorial')}
              className="flex items-center gap-2 rounded-2xl bg-wayang-cream-dark px-4 py-2.5 text-sm font-bold text-wayang-brown transition hover:bg-wayang-gold-soft"
            >
              <BookOpen className="h-4 w-4" />
              {progress.tutorialCompleted
                ? 'Ulangi Latihan Dasar'
                : 'Ikuti Latihan Dasar'}
            </button>
            <button
              type="button"
              onClick={onResetProgress}
              className="flex items-center gap-1.5 rounded-2xl border border-wayang-brown/15 px-3.5 py-2.5 text-xs font-semibold text-wayang-brown/75 transition hover:bg-wayang-cream"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Progres
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 md:col-span-5">
          <div className="flex flex-col justify-center rounded-2xl bg-wayang-cream p-4 text-center">
            <span className="font-display text-2xl font-bold text-wayang-terracotta">
              {completedCount}/{GAME_LEVELS.length}
            </span>
            <span className="mt-1 text-xs font-semibold text-wayang-brown">
              Level Selesai
            </span>
          </div>
          <div className="flex flex-col justify-center rounded-2xl bg-wayang-cream p-4 text-center">
            <span className="font-display text-2xl font-bold text-wayang-brown">
              {progress.totalScore}
            </span>
            <span className="mt-1 text-xs font-semibold text-wayang-brown">
              Total Skor
            </span>
          </div>
          <div className="flex flex-col justify-center rounded-2xl bg-wayang-cream p-4 text-center">
            <span className="font-display text-2xl font-bold text-wayang-sage">
              {progress.earnedBadgeIds.length}/{BADGES.length}
            </span>
            <span className="mt-1 text-xs font-semibold text-wayang-brown">
              Lencana
            </span>
          </div>
        </div>
      </div>

      {/* Commercialization Simulator (Frontend B2C / B2B Preview) */}
      <section className="rounded-[2rem] border-2 border-wayang-gold/45 bg-white p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-wayang-terracotta">
              Model Bisnis & Komersialisasi ARJUNA (Simulasi Frontend)
            </span>
            <h2 className="font-display mt-1 text-2xl font-bold text-wayang-brown">
              Pilih Skema Akses Pembelajaran & Ekosistem Sanggar
            </h2>
          </div>
          <span className="rounded-full bg-wayang-cream px-3.5 py-1.5 text-xs font-semibold text-wayang-brown">
            Paket Aktif Saat Ini:{' '}
            <strong>
              {COMMERCIAL_PLANS.find((p) => p.id === activePlan)?.name}
            </strong>
          </span>
        </div>

        <p className="mt-2 text-xs leading-relaxed text-wayang-charcoal/80 sm:text-sm">
          Sesuai peta jalan komersialisasi ARJUNA (Freemium B2C, Paket Cerita Premium B2C,
          dan Lisensi Institusional B2B untuk sekolah/sanggar), Anda dapat mencoba pratinjau
          akses tiap paket secara lokal di bawah ini.{' '}
          <em>
            Catatan: Penetapan harga final dan skema royalti dalang/penulis naskah
            masih dalam tahap validasi tim dan kesepakatan tertulis.
          </em>
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {COMMERCIAL_PLANS.map((plan) => {
            const Icon = plan.icon;
            const isActive = activePlan === plan.id;
            return (
              <div
                key={plan.id}
                className={`flex flex-col justify-between rounded-3xl border-2 p-5 transition ${
                  isActive
                    ? 'border-wayang-terracotta bg-wayang-cream/65 shadow-sm'
                    : 'border-wayang-gold/30 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-wayang-gold-soft px-3 py-1 text-[11px] font-bold text-wayang-brown">
                      <Icon className="h-3.5 w-3.5 text-wayang-terracotta" />
                      {plan.badge}
                    </span>
                    {isActive && (
                      <span className="flex items-center gap-1 text-xs font-bold text-wayang-sage">
                        <CheckCircle2 className="h-4 w-4" />
                        Aktif (Demo)
                      </span>
                    )}
                  </div>

                  <h3 className="font-display mt-3 text-lg font-bold text-wayang-brown">
                    {plan.name}
                  </h3>
                  <p className="text-xs font-semibold text-wayang-terracotta">
                    {plan.target}
                  </p>
                  <p className="mt-1 rounded-xl bg-wayang-cream-dark/60 px-2.5 py-1 text-[11px] font-semibold text-wayang-brown">
                    {plan.pricingNote}
                  </p>

                  <ul className="mt-3 space-y-1.5 text-xs leading-relaxed text-wayang-charcoal/85">
                    {plan.highlights.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectPlan(plan.id)}
                  className={`mt-4 w-full rounded-2xl py-2.5 text-xs font-bold transition sm:text-sm ${
                    isActive
                      ? 'bg-wayang-sage text-white'
                      : 'bg-wayang-brown text-wayang-cream hover:bg-wayang-brown-light'
                  }`}
                >
                  {isActive
                    ? 'Sedang Digunakan'
                    : 'Aktifkan Pratinjau Paket Ini'}
                </button>
              </div>
            );
          })}
        </div>
      </section>

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
                className={`rounded-2xl px-3.5 py-1.5 text-xs font-bold transition ${
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
                className={`flex flex-col justify-between rounded-3xl border-2 p-5 transition ${
                  unlocked
                    ? 'border-wayang-gold/45 bg-white shadow-card'
                    : 'border-wayang-brown/10 bg-wayang-cream-dark/60 opacity-85'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-wayang-gold-soft px-3 py-1 text-xs font-bold text-wayang-brown">
                      {level.subtitle}
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
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        tier === 'free'
                          ? 'bg-wayang-sage/15 text-wayang-sage'
                          : tier === 'episode_pack'
                            ? 'bg-wayang-terracotta/15 text-wayang-terracotta'
                            : 'bg-wayang-brown text-wayang-gold'
                      }`}
                    >
                      {level.packLabel ?? 'Gratis (Freemium)'}
                    </span>
                    {level.culturalRegion && (
                      <span className="rounded-full bg-wayang-cream px-2.5 py-0.5 text-[10px] font-semibold text-wayang-brown-light">
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
                      <span>Skor Terbaik: {lvlState.bestScore}</span>
                      <span>•</span>
                      <span>Akurasi: {lvlState.bestAccuracy}%</span>
                    </div>
                  )}
                </div>

                {unlocked ? (
                  <button
                    type="button"
                    onClick={() => onStartLevel(level.id)}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-wayang-terracotta py-3 text-sm font-bold text-white shadow-sm transition hover:bg-wayang-terracotta-dark active:scale-95"
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
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-wayang-gold bg-white py-3 text-xs font-bold text-wayang-brown transition hover:bg-wayang-gold-soft"
                  >
                    Buka Pratinjau {level.packLabel}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="mt-5 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-2xl bg-wayang-brown/15 py-3 text-sm font-bold text-wayang-brown/50"
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
    </div>
  );
}
