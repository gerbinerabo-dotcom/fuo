import React, { useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { LearningPath } from './components/learn/LearningPath';
import { LeaguesView } from './components/leagues/LeaguesView';
import { QuestsView } from './components/quests/QuestsView';
import { ShopView } from './components/shop/ShopView';
import { ToolboxView } from './components/toolbox/ToolboxView';
import { ProfileView } from './components/profile/ProfileView';

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabType>('learn');
  const { state } = useGame();

  const unclaimedQuestsCount = state.dailyQuests.filter((q) => q.current >= q.target && !q.claimed).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Navigation (Sidebar on Desktop, Bottom bar on Mobile) */}
      <Navigation
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        unclaimedQuestsCount={unclaimedQuestsCount}
      />

      {/* Main Content Area (offset by desktop sidebar width 256px on lg) */}
      <div className="lg:pl-64 flex-1 flex flex-col min-w-0">
        <Header
          onOpenShop={() => setActiveTab('shop')}
          onOpenLeagues={() => setActiveTab('leagues')}
        />

        <main className="flex-1 w-full" role="main">
          {activeTab === 'learn' && <LearningPath />}
          {activeTab === 'leagues' && <LeaguesView />}
          {activeTab === 'quests' && <QuestsView />}
          {activeTab === 'shop' && <ShopView />}
          {activeTab === 'toolbox' && <ToolboxView />}
          {activeTab === 'profile' && <ProfileView />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

