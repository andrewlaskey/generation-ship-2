import React, { useState } from 'react';
import { GameManager } from '@/modules/GameManager';
import { ViewTypes } from '../../App';
import AboutModal from '../AboutModal';
import BackgroundPlayer from '../BackgroundPlayer/BackgroundPlayer';

interface MainMenuProps {
  gameManager: GameManager;
  onSwitchView: (view: ViewTypes, newGame: boolean) => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ gameManager, onSwitchView }) => {
  const [isMeditationMode, setIsMeditationMode] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [customGameSettings, setCustomGameSettings] = useState({
    gridSize: '9',
    handSize: '3',
    deckSize: '40',
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
        setCustomGameSettings(prev => ({
          ...prev,
          gridSize: value === '' ? '' : value || prev.gridSize,
        }));
        break;
      case 'handSizeInput':
        setCustomGameSettings(prev => ({
          ...prev,
          handSize: value === '' ? '' : value || prev.handSize,
        }));
        break;
      case 'deckSizeInput':
        setCustomGameSettings(prev => ({
          ...prev,
          deckSize: value === '' ? '' : value || prev.deckSize,
        }));
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
      onSwitchView(gameType, true);
    } else {
      // Validate custom game settings
      const gridSizeValidation = { min: 5, max: 15 };
      const handSizeValidation = { min: 1, max: 3 };
      const deckSizeValidation = { min: 10, max: 100 };

      const gridSizeInt = parseInt(customGameSettings.gridSize, 10);
      const handSizeInt = parseInt(customGameSettings.handSize, 10);
      const deckSizeInt = parseInt(customGameSettings.deckSize, 10);

      if (gridSizeInt < gridSizeValidation.min || gridSizeInt > gridSizeValidation.max) {
        setWarningNotice(
          `Grid size must be between ${gridSizeValidation.min} and ${gridSizeValidation.max}`
        );
        return;
      }

      if (handSizeInt < handSizeValidation.min || handSizeInt > handSizeValidation.max) {
        setWarningNotice(
          `Hand size must be between ${handSizeValidation.min} and ${handSizeValidation.max}`
        );
        return;
      }

      if (deckSizeInt < deckSizeValidation.min || deckSizeInt > deckSizeValidation.max) {
        setWarningNotice(
          `Deck size must be between ${deckSizeValidation.min} and ${deckSizeValidation.max}`
        );
        return;
      }

      // Apply settings and start game
      gameManager.configGame({
        seed: customGameSettings.seed || undefined,
        size: gridSizeInt,
        maxHandSize: handSizeInt,
        initialDeckSize: deckSizeInt,
      });
      onSwitchView(gameType, true);
    }
  };

  return (
    <div className="main-menu-container">
      <BackgroundPlayer isActive={isMeditationMode} handleToggleClick={toggleMeditationMode} />
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

          <div className="custom-actions">
            <button className="button" onClick={handleCloseSubmenu}>
              ←
            </button>
            <button className="button" onClick={() => handleStartGame('custom')}>
              Start
            </button>
          </div>

          <p className="warning" id="warningNotice">
            {warningNotice}
          </p>
        </div>

        <div className="main-menu-footer">
          <button className="button small" onClick={toggleMeditationMode}>
            Meditation Mode
          </button>
        </div>

        {/* About Submenu */}
        <AboutModal isShowing={activeSubmenu === 'about'} handleClose={handleCloseSubmenu}>
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
        </AboutModal>
      </div>
    </div>
  );
};

export default MainMenu;
