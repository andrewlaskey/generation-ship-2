import React, { useState, useEffect } from 'react';
import { GameManager } from '@/modules/GameManager';
import { ABOUT_HTML } from '@/utils/constants';

interface MainMenuProps {
  gameManager: GameManager;
  onSwitchView: (view: string, gameType?: 'daily' | 'custom') => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ gameManager, onSwitchView }) => {
  const [isMeditationMode, setIsMeditationMode] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [customGameSettings, setCustomGameSettings] = useState({
    gridSize: 9,
    handSize: 3,
    deckSize: 40,
    seed: '',
  });
  const [warningNotice, setWarningNotice] = useState('');

  const toggleMeditationMode = () => {
    setIsMeditationMode(!isMeditationMode);
  };

  const handleOpenSubmenu = (menu: string) => {
    setActiveSubmenu(menu);
  };

  const handleCloseSubmenu = () => {
    setActiveSubmenu(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    switch (id) {
      case 'gridSizeInput':
        setCustomGameSettings(prev => ({ ...prev, gridSize: parseInt(value) || 9 }));
        break;
      case 'handSizeInput':
        setCustomGameSettings(prev => ({ ...prev, handSize: parseInt(value) || 3 }));
        break;
      case 'deckSizeInput':
        setCustomGameSettings(prev => ({ ...prev, deckSize: parseInt(value) || 40 }));
        break;
      case 'seedInputStr':
        setCustomGameSettings(prev => ({ ...prev, seed: value }));
        break;
    }
  };

  const handleStartGame = (gameType: 'daily' | 'custom') => {
    if (gameType === 'daily') {
      gameManager.configGame({
        ...gameManager.optionDefaults,
        seed: new Date().toISOString().split('T')[0], // Current date as seed
      });
      onSwitchView(gameType, gameType);
    } else {
      // Validate custom game settings
      const gridSizeValidation = { min: 5, max: 15 };
      const handSizeValidation = { min: 1, max: 3 };
      const deckSizeValidation = { min: 10, max: 100 };

      if (
        customGameSettings.gridSize < gridSizeValidation.min ||
        customGameSettings.gridSize > gridSizeValidation.max
      ) {
        setWarningNotice(
          `Grid size must be between ${gridSizeValidation.min} and ${gridSizeValidation.max}`
        );
        return;
      }

      if (
        customGameSettings.handSize < handSizeValidation.min ||
        customGameSettings.handSize > handSizeValidation.max
      ) {
        setWarningNotice(
          `Hand size must be between ${handSizeValidation.min} and ${handSizeValidation.max}`
        );
        return;
      }

      if (
        customGameSettings.deckSize < deckSizeValidation.min ||
        customGameSettings.deckSize > deckSizeValidation.max
      ) {
        setWarningNotice(
          `Deck size must be between ${deckSizeValidation.min} and ${deckSizeValidation.max}`
        );
        return;
      }

      // Apply settings and start game
      gameManager.configGame({
        seed: customGameSettings.seed || undefined,
        size: customGameSettings.gridSize,
        maxHandSize: customGameSettings.handSize,
        initialDeckSize: customGameSettings.deckSize,
      });
      onSwitchView(gameType, gameType);
    }
  };

  return (
    <div className="main-menu-container">
      <div className={`main-menu ${isMeditationMode ? 'hidden' : ''}`}>
        <h1 className="title">Generation Ship 2</h1>

        <ul className="main-menu-options">
          <li>
            <button className="button" onClick={() => handleStartGame('daily')}>
              Daily Challenge
            </button>
          </li>
          <li>
            <button className="button" onClick={() => handleOpenSubmenu('customGameOptions')}>
              Custom Game
            </button>
          </li>
          <li>
            <button className="button" onClick={() => handleOpenSubmenu('about')}>
              About
            </button>
          </li>
        </ul>

        {/* Custom Game Options Submenu */}
        <div
          className={`submenu ${activeSubmenu === 'customGameOptions' ? '' : 'hidden'}`}
          id="customGameOptions"
        >
          <h3>Select Options</h3>

          <div className="input">
            <p>Grid size:</p>
            <input
              id="gridSizeInput"
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              value={customGameSettings.gridSize}
              min="5"
              max="15"
              step="1"
              onChange={handleInputChange}
            />
          </div>

          <div className="input">
            <p>Hand size:</p>
            <input
              id="handSizeInput"
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              value={customGameSettings.handSize}
              min="1"
              max="3"
              step="1"
              onChange={handleInputChange}
            />
          </div>

          <div className="input">
            <p>Deck size:</p>
            <input
              id="deckSizeInput"
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              value={customGameSettings.deckSize}
              min="10"
              max="100"
              step="1"
              onChange={handleInputChange}
            />
          </div>

          <div className="input">
            <p>Seed:</p>
            <input
              type="text"
              id="seedInputStr"
              placeholder="Optional String"
              value={customGameSettings.seed}
              onChange={handleInputChange}
            />
          </div>

          <button className="button" onClick={handleCloseSubmenu}>
            ←
          </button>
          <button className="button" onClick={() => handleStartGame('custom')}>
            Start
          </button>

          <p className="warning" id="warningNotice">
            {warningNotice}
          </p>
        </div>

        {/* About Submenu */}
        <div className={`submenu ${activeSubmenu === 'about' ? '' : 'hidden'}`} id="about">
          <div dangerouslySetInnerHTML={{ __html: ABOUT_HTML }} />
          <button className="button" onClick={handleCloseSubmenu}>
            ✓
          </button>
          <p>
            vALPHA (frequent, possibly breaking changes)
            <br />
            Support the development of this game on{' '}
            <a href="https://ko-fi.com/timbertales" target="_blank">
              ☕️ Ko-fi
            </a>
            <br />
            Follow the development progress on{' '}
            <a href="https://bsky.app/profile/andrewlaskey.bsky.social" target="_blank">
              🦋 Bluesky
            </a>
          </p>
        </div>

        <div className="main-menu-footer">
          <button className="button small" onClick={toggleMeditationMode}>
            Meditation Mode
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
