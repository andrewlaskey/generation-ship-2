import { useEffect, useState } from 'react';
import MainMenu from '@/react/components/MainMenu/MainMenu';
import { GameManager } from '@/modules/GameManager';
import { UserScoreHistory } from '@/modules/UserScoreHistory';
import { LocalStorage } from '@/modules/LocalStorage';
import { useConfig } from '@/react/hooks/TileConfig';
import GameView from '@/react/components/GameView';
import Loading from './components/Loading/Loading';

export type ViewTypes = 'menu' | 'daily' | 'custom' | 'mini';
type GameViewTypes = Exclude<ViewTypes, 'menu'>;

const isGameViewType = (view: ViewTypes): view is GameViewTypes => {
  return view === 'daily' || view === 'custom' || view === 'mini';
};

// Initialize the game services
const localStorage = new LocalStorage(window.localStorage);
let userScoreHistory = new UserScoreHistory(localStorage);

function App() {
  const { config, loading: configLoading } = useConfig();
  const [currentView, setCurrentView] = useState<ViewTypes>('menu');
  const [gameManager, setGameManager] = useState<GameManager | null>(null);

  const isLoading = configLoading;

  useEffect(() => {
    if (!isLoading && config.size > 0) {
      if (gameManager) {
        gameManager.tileRuleConfigs = config;
        console.log('Updated game manager with rules:', config.size);
      } else {
        // Create a new game manager with the loaded rules
        const newGameManager = new GameManager({ ruleConfigs: config });
        setGameManager(newGameManager);
        console.log('Created new game manager with rules:', config.size);
      }
    }
  }, [isLoading, config]);

  const switchView = (viewName: ViewTypes, newGame: boolean) => {
    setCurrentView(viewName);

    if (newGame && gameManager) {
      gameManager.resetGame();
      gameManager.startGame();
    }

    if (viewName !== 'daily') {
      userScoreHistory = new UserScoreHistory(localStorage, viewName);
    } else {
      userScoreHistory = new UserScoreHistory(localStorage);
    }
  };

  if (isLoading || !gameManager) {
    return (
      <div className="app">
        <Loading isLoading={isLoading} />
      </div>
    );
  }

  return (
    <div className="app">
      {currentView === 'menu' && <MainMenu gameManager={gameManager} onSwitchView={switchView} />}

      {isGameViewType(currentView) && (
        <GameView
          gameManager={gameManager}
          onSwitchView={switchView}
          userScoreHistory={userScoreHistory}
          gameType={currentView}
        />
      )}
    </div>
  );
}

export default App;
