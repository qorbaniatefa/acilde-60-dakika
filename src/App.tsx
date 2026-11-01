/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import type { UserProfile, ChoiceOption } from './types';
import { DECISIONS } from './game/storyData';
import {
  createInitialGameState,
  canStartShift,
  getNextDecisionState,
  advanceToNextStep,
  evaluateEnding,
} from './game/engine';
import { Header } from './components/Header';
import { ProfileScreen } from './components/ProfileScreen';
import { SceneScreen } from './components/SceneScreen';
import { EndingScreen } from './components/EndingScreen';

export default function App() {
  const [gameState, setGameState] = useState(createInitialGameState);

  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    setGameState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        ...updated,
      },
    }));
  };

  const handleStartShift = () => {
    if (!canStartShift(gameState.profile)) return;
    setGameState((prev) => ({
      ...prev,
      screen: 'scene',
      currentDecisionId: 1,
      choices: {},
      isChoiceLocked: false,
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMakeChoice = (choice: ChoiceOption) => {
    setGameState((prev) => getNextDecisionState(prev, choice));
  };

  const handleContinue = () => {
    setGameState((prev) => advanceToNextStep(prev));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRestart = () => {
    setGameState(createInitialGameState());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentDecision = DECISIONS[gameState.currentDecisionId];

  return (
    <div className="min-h-screen bg-[#0a1323] text-[#dae2f9] flex flex-col font-sans selection:bg-[#ffb454]/30 selection:text-[#ffd8af]">
      {/* Top Header */}
      <Header
        isScene={gameState.screen === 'scene'}
        currentDecisionId={gameState.currentDecisionId}
        totalDecisions={3}
        title={gameState.screen === 'scene' ? currentDecision?.title : undefined}
      />

      {/* Screen Routing */}
      <div className="flex-1 pb-10">
        {gameState.screen === 'profile' && (
          <ProfileScreen
            profile={gameState.profile}
            onUpdateProfile={handleUpdateProfile}
            onStartShift={handleStartShift}
          />
        )}

        {gameState.screen === 'scene' && currentDecision && (
          <SceneScreen
            key={currentDecision.id}
            decision={currentDecision}
            profile={gameState.profile}
            choices={gameState.choices}
            isChoiceLocked={gameState.isChoiceLocked}
            onMakeChoice={handleMakeChoice}
            onContinue={handleContinue}
          />
        )}

        {gameState.screen === 'ending' && (
          <EndingScreen
            ending={evaluateEnding(gameState.choices)}
            onRestart={handleRestart}
          />
        )}
      </div>
    </div>
  );
}
