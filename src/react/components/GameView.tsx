import React, { useState } from 'react';
import { GameManager } from '@/modules/GameManager';
import { ABOUT_HTML } from '@/utils/constants';
import Scoreboard from './Scoreboard';

interface GameViewProps {
  gameManager: GameManager;
  onSwitchView: (view: string, gameType?: 'daily' | 'custom') => void;
}

const GameView: React.FC<GameViewProps> = ({ gameManager, onSwitchView }) => {
  const [showHelp, setShowHelp] = useState(false);

  const handleOpenHelp = () => {
    setShowHelp(true);
  };

  const handleCloseHelp = () => {
    setShowHelp(false);
  };

  const handleQuit = () => {
    onSwitchView('menu');
  };

  return (
    <div className="html-game-view-wrapper">
      <div className="html-game-view-inner">
        <div className="info-bar">
          <div className="help">
            <button className="button warn" onClick={handleQuit}>
              <svg id="icon-arrow_back_ios" viewBox="0 0 24 24">
                <path d="M11.672 3.891l-8.109 8.109 8.109 8.109-1.781 1.781-9.891-9.891 9.891-9.891z"></path>
              </svg>
            </button>
            <button className="button" onClick={handleOpenHelp}>
              <svg id="icon-info" viewBox="0 0 24 24">
                <path d="M12.984 9v-2.016h-1.969v2.016h1.969zM12.984 17.016v-6h-1.969v6h1.969zM12 2.016q4.125 0 7.055 2.93t2.93 7.055-2.93 7.055-7.055 2.93-7.055-2.93-2.93-7.055 2.93-7.055 7.055-2.93z"></path>
              </svg>
            </button>
          </div>
          <Scoreboard
            ecology={gameManager.getPlayerScore('ecology')}
            population={gameManager.getPlayerScore('population')}
          />
        </div>
        <div className="grid-container">
          <div className="grid-border">
            <div className="grid-inner-wrap">
              <div id="gridContainer" className="grid"></div>
              <div id="placementPreview" className="tile-preview"></div>
            </div>
          </div>
        </div>
        <div className="game-updates">
          <div id="playerNotice"></div>
          <div id="playerActions" className="player-actions"></div>
        </div>
        <div className="dynamic-display" id="dynamicDisplay"></div>
        <div className="toolbar" id="toolbar"></div>
        <div id="about" className={`about ${showHelp ? 'is-visible' : ''}`}>
          ${ABOUT_HTML}
          <button className="button" onClick={handleCloseHelp}>
            ✓
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameView;
