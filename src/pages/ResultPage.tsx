import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Award, Home, RotateCcw, Star, Trophy } from 'lucide-react';
import { PARCHMENT_BACKDROP } from '../assets/kitImages';
import { getCharacterById } from '../assets/wayangCharacters';
import { CharacterPortrait } from '../components/puppet/CharacterPortrait';
import type { ChallengeResult, LevelId, PuppetCharacterId } from '../types';

interface ResultPageProps {
  result: ChallengeResult;
  characterId: PuppetCharacterId;
  onRetry: (levelId: LevelId) => void;
  onNextLevel: (levelId: LevelId) => void;
  onBackToDashboard: () => void;
}

export function ResultPage({
  result,
  characterId,
  onRetry,
  onNextLevel,
  onBackToDashboard,
}: ResultPageProps) {
  const reduceMotion = useReducedMotion();
  const hasNextLevel = result.passed && result.levelId < 10;
  const nextLevelId = (result.levelId + 1) as LevelId;
  const character = getCharacterById(characterId);

  const stats = [
    { label: 'Skor', value: String(result.score), tone: 'text-wayang-terracotta' },
    { label: 'Akurasi', value: `${result.accuracy}%`, tone: 'text-wayang-sage' },
    {
      label: 'Tantangan',
      value: `${result.completedSteps}/${result.totalSteps}`,
      tone: 'text-wayang-brown',
    },
    { label: 'Durasi', value: `${result.durationSec} dtk`, tone: 'text-wayang-brown' },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="overflow-hidden rounded-xl border border-wayang-gold bg-white bg-cover bg-center"
        style={{ backgroundImage: `url(${PARCHMENT_BACKDROP})` }}
      >
        <div className="grid gap-6 bg-wayang-cream/60 p-6 sm:p-12 md:grid-cols-[minmax(0,15rem)_1fr] md:items-center">
          {/* The character the learner played with */}
          <div className="mx-auto w-48 md:w-full">
            <CharacterPortrait characterId={characterId} heightClass="h-64 md:h-80" />
            <p className="mt-2 text-center text-sm text-wayang-brown-light">
              Bermain bersama {character.name}
            </p>
          </div>

          <div className="text-center md:text-left">
            <div
              className="flex justify-center gap-2 md:justify-start"
              aria-label={`${result.stars} dari 3 bintang`}
            >
              {[1, 2, 3].map((s) => {
                const lit = s <= result.stars;
                return (
                  <motion.span
                    key={s}
                    initial={reduceMotion || !lit ? false : { scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.25 + s * 0.2, type: 'spring', stiffness: 260, damping: 14 }}
                  >
                    <Star
                      className={`h-10 w-10 ${
                        lit
                          ? 'fill-wayang-gold text-wayang-gold drop-shadow-sm'
                          : 'text-wayang-brown/15'
                      }`}
                    />
                  </motion.span>
                );
              })}
            </div>

            <p className="mt-4 text-sm font-semibold text-wayang-terracotta">
              Level {result.levelId}: {result.levelTitle}
            </p>
            <h1 className="font-display mt-1 text-3xl font-bold text-wayang-brown sm:text-4xl">
              {result.passed ? 'Tantangan Berhasil!' : 'Waktu Habis, Coba Lagi'}
            </h1>
            <p className="mt-2 max-w-lg text-base leading-relaxed text-wayang-charcoal/85 md:max-w-none">
              {result.feedbackSummary}
            </p>

            <dl className="mt-6 grid grid-cols-2 gap-y-4 border-y border-wayang-gold/40 py-4 sm:grid-cols-4">
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  className={`px-3 text-center ${i % 2 === 1 ? 'border-l border-wayang-gold/40' : ''} ${
                    i > 0 ? 'sm:border-l sm:border-wayang-gold/40' : ''
                  }`}
                >
                  <dt className="text-xs font-semibold text-wayang-brown-light">{stat.label}</dt>
                  <dd className={`font-display mt-0.5 text-2xl font-bold ${stat.tone}`}>
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>

            {result.earnedBadge && (
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className={`mt-5 flex items-center gap-4 rounded-xl p-4 text-left ${
                  result.newlyEarned
                    ? 'border border-wayang-gold bg-wayang-gold-soft/70 ring-4 ring-wayang-gold/20'
                    : 'border border-wayang-gold/40 bg-white/70'
                }`}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-wayang-brown text-wayang-gold">
                  {result.earnedBadge.isTrophy ? (
                    <Trophy className="h-6 w-6" />
                  ) : (
                    <Award className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-wayang-terracotta">
                    {result.newlyEarned ? 'Lencana baru diraih' : 'Lencana sudah dimiliki'}
                  </p>
                  <h2 className="font-display text-lg font-bold text-wayang-brown">
                    {result.earnedBadge.name}
                  </h2>
                  <p className="text-sm text-wayang-charcoal/85">
                    {result.earnedBadge.description}
                  </p>
                </div>
              </motion.div>
            )}

            <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
              {hasNextLevel && (
                <button
                  type="button"
                  onClick={() => onNextLevel(nextLevelId)}
                  className="btn btn-lg btn-primary"
                >
                  Lanjut ke Level {nextLevelId}
                  <ArrowRight className="h-5 w-5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => onRetry(result.levelId)}
                className={`btn btn-lg ${hasNextLevel ? 'btn-secondary' : 'btn-primary'}`}
              >
                <RotateCcw className="h-4 w-4" />
                Main Lagi
              </button>
              <button
                type="button"
                onClick={onBackToDashboard}
                className="btn btn-lg btn-ghost"
              >
                <Home className="h-4 w-4" />
                Jalur Belajar
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
