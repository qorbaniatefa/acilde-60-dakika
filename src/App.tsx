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
import { CollectionPanel } from './components/CollectionPanel';
import { ParityScreen } from './components/ParityScreen';
import type { DecisionRecord } from './ml/behavior';

export default function App() {
  const [gameState, setGameState] = useState(createInitialGameState);
  const [consent, setConsent] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [records, setRecords] = useState<DecisionRecord[]>([]);
  const [draft, setDraft] = useState<DecisionRecord[]>([]);
  const [hintRequests, setHintRequests] = useState(0);

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
    setSessionId(crypto.randomUUID());
    setDraft([]);
    setHintRequests(0);
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
    setConsent(false);
    setDraft([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentDecision = DECISIONS[gameState.currentDecisionId];
  if (new URLSearchParams(window.location.search).has('parite')) {
    return <div className="min-h-screen bg-[#0a1323]"><ParityScreen /></div>;
  }

  const handleRecord = (row: DecisionRecord) => {
    const next = [...draft, row];
    setDraft(next);
    if (next.length === 3) {setRecords(prev => [...prev, ...next]); setDraft([]);}
  };

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
        <CollectionPanel consent={consent} onConsent={setConsent} records={records}
          canChange={gameState.screen === 'profile'} onClear={() => setRecords([])} />
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
            collectionConsent={consent}
            sessionId={sessionId}
            onRecord={handleRecord}
            hintRequests={hintRequests}
            onTutorRequest={() => setHintRequests(n => n + 1)}
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
