import { motion } from 'framer-motion';
import {
  ArrowRight,
  Award,
  Home,
  RotateCcw,
  Star,
  Trophy,
} from 'lucide-react';
import type { ChallengeResult, LevelId } from '../types';

interface ResultPageProps {
  result: ChallengeResult;
  onRetry: (levelId: LevelId) => void;
  onNextLevel: (levelId: LevelId) => void;
  onBackToDashboard: () => void;
}

export function ResultPage({
  result,
  onRetry,
  onNextLevel,
  onBackToDashboard,
}: ResultPageProps) {
  const hasNextLevel = result.passed && result.levelId < 5;
  const nextLevelId = (result.levelId + 1) as LevelId;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="rounded-[2rem] border-2 border-wayang-gold bg-white p-6 text-center shadow-card sm:p-10"
      >
        {/* Star Rating */}
        <div className="flex justify-center gap-3">
          {[1, 2, 3].map((s) => (
            <Star
              key={s}
              className={`h-11 w-11 ${
                s <= result.stars
                  ? 'fill-wayang-gold text-wayang-gold drop-shadow-sm'
                  : 'text-wayang-brown/15'
              }`}
            />
          ))}
        </div>

        <span className="mt-4 inline-block rounded-full bg-wayang-gold-soft px-4 py-1 text-xs font-bold text-wayang-brown">
          Level {result.levelId} • {result.levelTitle}
        </span>

        <h1 className="font-display mt-2 text-3xl font-bold text-wayang-brown sm:text-4xl">
          {result.passed ? 'Hebat! Tantangan Berhasil!' : 'Waktu Habis, Coba Lagi Yuk!'}
        </h1>

        <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-wayang-charcoal/85 sm:text-base">
          {result.feedbackSummary}
        </p>

        {/* Stats Grid */}
        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl bg-wayang-cream p-4">
            <span className="font-display block text-2xl font-bold text-wayang-terracotta">
              {result.score}
            </span>
            <span className="text-xs font-semibold text-wayang-brown">
              Skor Akhir
            </span>
          </div>
          <div className="rounded-2xl bg-wayang-cream p-4">
            <span className="font-display block text-2xl font-bold text-wayang-sage">
              {result.accuracy}%
            </span>
            <span className="text-xs font-semibold text-wayang-brown">
              Akurasi
            </span>
          </div>
          <div className="rounded-2xl bg-wayang-cream p-4">
            <span className="font-display block text-2xl font-bold text-wayang-brown">
              {result.completedSteps}/{result.totalSteps}
            </span>
            <span className="text-xs font-semibold text-wayang-brown">
              Tantangan Selesai
            </span>
          </div>
          <div className="rounded-2xl bg-wayang-cream p-4">
            <span className="font-display block text-2xl font-bold text-wayang-brown">
              {result.durationSec} dtk
            </span>
            <span className="text-xs font-semibold text-wayang-brown">
              Durasi
            </span>
          </div>
        </div>

        {/* Earned Badge Showcase */}
        {result.earnedBadge && (
          <div className="mt-6 flex items-center justify-center gap-4 rounded-3xl border-2 border-wayang-gold bg-wayang-gold-soft/50 p-5 text-left">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-wayang-brown text-wayang-gold">
              {result.earnedBadge.isTrophy ? (
                <Trophy className="h-8 w-8" />
              ) : (
                <Award className="h-8 w-8" />
              )}
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wide text-wayang-terracotta">
                {result.newlyEarned
                  ? 'Penghargaan Baru Terbuka!'
                  : 'Penghargaan Dimiliki'}
              </span>
              <h2 className="font-display text-xl font-bold text-wayang-brown">
                {result.earnedBadge.name}
              </h2>
              <p className="text-xs text-wayang-charcoal/85">
                {result.earnedBadge.description}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {hasNextLevel && (
            <button
              type="button"
              onClick={() => onNextLevel(nextLevelId)}
              className="flex items-center gap-2 rounded-2xl bg-wayang-terracotta px-7 py-3.5 text-base font-bold text-white shadow-md transition hover:bg-wayang-terracotta-dark"
            >
              Lanjut ke Level {nextLevelId}
              <ArrowRight className="h-5 w-5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => onRetry(result.levelId)}
            className="flex items-center gap-2 rounded-2xl border-2 border-wayang-brown/20 bg-wayang-cream px-6 py-3.5 text-base font-bold text-wayang-brown transition hover:bg-wayang-gold-soft"
          >
            <RotateCcw className="h-4 w-4" />
            Main Lagi
          </button>

          <button
            type="button"
            onClick={onBackToDashboard}
            className="flex items-center gap-2 rounded-2xl bg-wayang-brown px-6 py-3.5 text-base font-bold text-wayang-cream transition hover:bg-wayang-brown-light"
          >
            <Home className="h-4 w-4" />
            Dasbor Level
          </button>
        </div>
      </motion.div>
    </div>
  );
}

