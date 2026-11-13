import { Award, BookOpen, Lock, Play, RotateCcw, Star } from 'lucide-react';
import { getCharacterById } from '../assets/wayangCharacters';
import { BadgeCard } from '../components/ui/BadgeCard';
import { BADGES } from '../game/achievementManager';
import { GAME_LEVELS } from '../game/levelManager';
import type { AppPage, LevelId, PlayerProgressState } from '../types';

interface LearningDashboardPageProps {
  progress: PlayerProgressState;
  onStartLevel: (levelId: LevelId) => void;
  onNavigate: (page: AppPage) => void;
  onResetProgress: () => void;
}

export function LearningDashboardPage({
  progress,
  onStartLevel,
  onNavigate,
  onResetProgress,
}: LearningDashboardPageProps) {
  const completedCount = Object.values(progress.levels).filter(
    (l) => l.completed
  ).length;
  const activeCharacter = getCharacterById(progress.selectedCharacterId);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
      {/* Top Progress Summary */}
      <div className="grid gap-4 rounded-3xl border-2 border-wayang-gold/40 bg-white p-6 shadow-card md:grid-cols-12">
        <div className="space-y-2 md:col-span-7">
          <span className="inline-block rounded-full bg-wayang-gold-soft px-3 py-1 text-xs font-bold text-wayang-brown">
            Dasbor Pembelajaran ARJUNA
          </span>
          <h1 className="font-display text-3xl font-bold text-wayang-brown">
            Latihan Sabetan & Level Pembelajaran
          </h1>
          <p className="text-sm text-wayang-charcoal/80">
            Tokoh aktif: <strong>{activeCharacter.name}</strong>. Progres disimpan
            lokal di browser (tanpa backend). Selesaikan 5 level dasar untuk melatih
            pengenalan gestur, kendali posisi kelir, dan alur cerita awal.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="button"
              onClick={() => onNavigate('tutorial')}
              className="flex items-center gap-2 rounded-2xl bg-wayang-cream-dark px-4 py-2.5 text-sm font-bold text-wayang-brown transition hover:bg-wayang-gold-soft"
            >
              <BookOpen className="h-4 w-4" />
              {progress.tutorialCompleted
                ? 'Ulangi Tutorial Gerakan'
                : 'Ikuti Tutorial Dulu'}
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
              {completedCount}/5
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
              {progress.earnedBadgeIds.length}/5
            </span>
            <span className="mt-1 text-xs font-semibold text-wayang-brown">
              Lencana
            </span>
          </div>
        </div>
      </div>

      {/* Five Progressive Levels */}
      <section className="space-y-4">
        <h2 className="font-display text-2xl font-bold text-wayang-brown">
          5 Level Tantangan Progresif
        </h2>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {GAME_LEVELS.map((level) => {
            const lvlState = progress.levels[level.id];
            const unlocked = lvlState.unlocked;

            return (
              <div
                key={level.id}
                className={`flex flex-col justify-between rounded-3xl border-2 p-5 transition ${
                  unlocked
                    ? 'border-wayang-gold/45 bg-white shadow-card'
                    : 'border-wayang-brown/10 bg-wayang-cream-dark/60 opacity-80'
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

                  <h3 className="font-display mt-3 text-xl font-bold text-wayang-brown">
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

                <button
                  type="button"
                  disabled={!unlocked}
                  onClick={() => onStartLevel(level.id)}
                  className={`mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold transition ${
                    unlocked
                      ? 'bg-wayang-terracotta text-white shadow-sm hover:bg-wayang-terracotta-dark active:scale-95'
                      : 'cursor-not-allowed bg-wayang-brown/15 text-wayang-brown/50'
                  }`}
                >
                  {unlocked ? (
                    <>
                      <Play className="h-4 w-4" />
                      {lvlState.completed ? 'Mainkan Lagi' : 'Mulai Tantangan'}
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Selesaikan Level {level.id - 1} Dulu
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Honest Roadmap Notice for Upcoming Scene & Antawacana Modules */}
      <section className="rounded-3xl border border-wayang-gold/40 bg-wayang-gold-soft/30 p-5">
        <span className="inline-block rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-wayang-terracotta">
          Rencana Tahap Menengah (Belum Aktif)
        </span>
        <h2 className="font-display mt-2 text-lg font-bold text-wayang-brown">
          Modul Rangkaian Scene Cerita & Audio Dialog (Antawacana)
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-wayang-charcoal/85 sm:text-sm">
          Pada tahap pengembangan berikutnya, level latihan dasar ini akan diperluas
          menjadi rangkaian <em>scene</em> cerita pewayangan utuh lengkap dengan narasi dan
          audio karakter (<em>antawacana</em>) yang berjalan selaras tanpa mengambil alih
          kendali gerak tangan pengguna, serta divalidasi bersama dalang dan sanggar budaya.
        </p>
      </section>

      {/* Achievement Badges */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Award className="h-6 w-6 text-wayang-terracotta" />
          <h2 className="font-display text-2xl font-bold text-wayang-brown">
            Koleksi Lencana & Piala
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

