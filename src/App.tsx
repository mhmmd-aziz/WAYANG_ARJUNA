import { useCallback, useState } from 'react';
import { Navbar } from './components/ui/Navbar';
import { Footer } from './components/ui/Footer';
import {
  createInitialProgress,
  loadPlayerProgress,
  recordLevelCompletion,
  savePlayerProgress,
  switchCommercialPlan,
} from './game/achievementManager';
import { CharacterSelectionPage } from './pages/CharacterSelectionPage';
import { GamificationChallengePage } from './pages/GamificationChallengePage';
import { HandDetectionStudioPage } from './pages/HandDetectionStudioPage';
import { LandingPage } from './pages/LandingPage';
import { LearningDashboardPage } from './pages/LearningDashboardPage';
import { ResultPage } from './pages/ResultPage';
import { StoryTheatrePage } from './pages/StoryTheatrePage';
import { TutorialModePage } from './pages/TutorialModePage';
import { WayangBattlePage } from './pages/WayangBattlePage';
import type {
  AppPage,
  ChallengeResult,
  CommercialPlanId,
  LevelId,
  PlayerProgressState,
  PuppetCharacterId,
} from './types';
import { soundEffects } from './utils/sound';
import { storyAudio } from './utils/storyAudio';

export function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('landing');
  const [activeLevelId, setActiveLevelId] = useState<LevelId>(1);
  const [lastResult, setLastResult] = useState<ChallengeResult | null>(null);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState<PlayerProgressState>(() =>
    loadPlayerProgress()
  );

  const handleNavigate = useCallback((page: AppPage) => {
    soundEffects.playSelect();
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSelectCharacter = useCallback((id: PuppetCharacterId) => {
    soundEffects.playSelect();
    setProgress((prev) => {
      const next = { ...prev, selectedCharacterId: id };
      savePlayerProgress(next);
      return next;
    });
  }, []);

  const handleStartLevel = useCallback((levelId: LevelId) => {
    soundEffects.playSelect();
    setActiveLevelId(levelId);
    setCurrentPage('challenge');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleTutorialComplete = useCallback(() => {
    setProgress((prev) => {
      const next = { ...prev, tutorialCompleted: true };
      savePlayerProgress(next);
      return next;
    });
  }, []);

  const handleCompleteLevel = useCallback(
    (
      rawResult: Omit<ChallengeResult, 'newlyEarned'>,
      badgeId: string | null
    ) => {
      setProgress((prev) => {
        const { nextState, newlyEarnedBadge } = recordLevelCompletion(
          prev,
          rawResult.levelId,
          rawResult.score,
          rawResult.accuracy,
          rawResult.stars,
          rawResult.passed,
          badgeId
        );
        setLastResult({
          ...rawResult,
          newlyEarned: newlyEarnedBadge,
        });
        return nextState;
      });
      setCurrentPage('result');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    []
  );

  const handleResetProgress = useCallback(() => {
    const fresh = createInitialProgress();
    savePlayerProgress(fresh);
    setProgress(fresh);
  }, []);

  const handleSelectPlan = useCallback((planId: CommercialPlanId) => {
    soundEffects.playSelect();
    setProgress((prev) => switchCommercialPlan(prev, planId));
  }, []);

  const handleToggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      soundEffects.setMuted(next);
      if (next) {
        storyAudio.stop();
      }
      return next;
    });
  }, []);

  return (
    <div className="min-h-screen bg-wayang-cream text-wayang-charcoal">
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        muted={muted}
        onToggleMute={handleToggleMute}
        overlay={currentPage === 'landing'}
      />

      <main>
        {currentPage === 'landing' && (
          <LandingPage
            selectedCharacterId={progress.selectedCharacterId}
            onSelectCharacter={handleSelectCharacter}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'characters' && (
          <CharacterSelectionPage
            selectedCharacterId={progress.selectedCharacterId}
            onSelectCharacter={handleSelectCharacter}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'dashboard' && (
          <LearningDashboardPage
            progress={progress}
            onStartLevel={handleStartLevel}
            onNavigate={handleNavigate}
            onSelectPlan={handleSelectPlan}
            onResetProgress={handleResetProgress}
          />
        )}

        {currentPage === 'stories' && (
          <StoryTheatrePage
            selectedCharacterId={progress.selectedCharacterId}
            activePlan={progress.activePlan ?? 'freemium'}
            onSelectPlan={handleSelectPlan}
            onSelectCharacter={handleSelectCharacter}
          />
        )}

        {currentPage === 'studio' && (
          <HandDetectionStudioPage
            selectedCharacterId={progress.selectedCharacterId}
            onSelectCharacter={handleSelectCharacter}
          />
        )}

        {currentPage === 'battle' && (
          <WayangBattlePage
            selectedCharacterId={progress.selectedCharacterId}
            onSelectCharacter={handleSelectCharacter}
          />
        )}

        {currentPage === 'tutorial' && (
          <TutorialModePage
            selectedCharacterId={progress.selectedCharacterId}
            onTutorialComplete={handleTutorialComplete}
            onStartLevel={handleStartLevel}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'challenge' && (
          <GamificationChallengePage
            levelId={activeLevelId}
            selectedCharacterId={progress.selectedCharacterId}
            onCompleteLevel={handleCompleteLevel}
            onExitToDashboard={() => handleNavigate('dashboard')}
          />
        )}

        {currentPage === 'result' && lastResult && (
          <ResultPage
            result={lastResult}
            characterId={progress.selectedCharacterId}
            onRetry={handleStartLevel}
            onNextLevel={handleStartLevel}
            onBackToDashboard={() => handleNavigate('dashboard')}
          />
        )}
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default App;

