import { useState } from 'react';
import MainMenu from '@/react/components/MainMenu';
import { GameManager } from '@/modules/GameManager';
import { UserScoreHistory } from '@/modules/UserScoreHistory';
import { LocalStorage } from '@/modules/LocalStorage';
import { useConfig } from '@/react/hooks/TileConfig';

// Initialize the game services
const localStorage = new LocalStorage(window.localStorage);
const userScoreHistory = new UserScoreHistory(localStorage);

function App() {
  const { config } = useConfig();
  const [currentView, setCurrentView] = useState('menu');
  const [gameType, setGameType] = useState<'daily' | 'custom'>('daily');

  const gameManager = new GameManager({ ruleConfigs: config });

  const switchView = (viewName: string, newGameType?: 'daily' | 'custom') => {
    setCurrentView(viewName);

    if (newGameType) {
      setGameType(newGameType);
      gameManager.resetGame();
    }
  };

  return (
    <div className="app">
      {currentView === 'menu' && <MainMenu gameManager={gameManager} onSwitchView={switchView} />}

      {(currentView === 'daily' || currentView === 'custom') && <div>Game View</div>}
    </div>
  );
}

export default App;
