import React, { useState, useEffect, useRef } from 'react';
import { useConfig } from '../../hooks/TileConfig';
import { GameManager, GameState } from '@/modules/GameManager';
import { AutoPlayer } from '@/modules/AutoPlayer';
import { Tile, TileState, TileType } from '@/modules/Tile';
import { GameBoard } from '@/modules/GameBoard';
import styles from './AutoPlayerView.module.scss';
import InfiniteGameBoard from '../InfiniteGameBoard/InfiniteGameBoard';
import { FARM_GLYPH, PEOPLE_GLYPH, POWER_GLYPH, TREE_GLYPH } from '@/utils/constants';

interface AutoPlayerViewProps {
  showControls: boolean;
}

const AutoPlayerView: React.FC<AutoPlayerViewProps> = ({ showControls }) => {
  const { config, loading: configLoading } = useConfig();
  const [gameManager, setGameManager] = useState<GameManager | null>(null);
  const [gameBoard, setGameBoard] = useState<GameBoard | null>(null);
  const [forceUpdate, setForceUpdate] = useState(0);
  const isPaused = useRef(false);
  const [isPausedState, setIsPausedState] = useState(false);
  const [paintTile, setPaintTile] = useState<TileType | null>(null);
  const isPainting = useRef(false);

  const isLoading = configLoading;

  const gridSize = 30;
  const numTrees = 40;
  const updateIntervalSeconds = 1;

  useEffect(() => {
    if (!isLoading && config.size > 0) {
      if (gameManager) {
        gameManager.tileRuleConfigs = config;
        setGameBoard(gameManager.gameBoard);
      } else {
        // Create a new game manager with the loaded rules
        const newGameManager = new GameManager({
          size: gridSize,
          maxHandSize: 1,
          infiniteDeck: true,
          ruleConfigs: config,
        });
        setGameManager(newGameManager);
        setGameBoard(newGameManager.gameBoard);
      }
    }
  }, [isLoading, config]);

  useEffect(() => {
    if (!gameManager || !gameBoard) return;

    const autoPlayer = new AutoPlayer(gameManager);

    const setup = (): void => {
      autoPlayer.startNewGame();
      placeTrees();
    };

    const placeTrees = (): void => {
      if (!isPainting.current) {
        for (let i = 0; i < numTrees; i++) {
          const x = Math.floor(Math.random() * gridSize);
          const y = Math.floor(Math.random() * gridSize);

          gameManager.gameBoard.placeTileAt(x, y, new Tile(TileType.Tree, 1, TileState.Neutral));
        }
      }
    };

    setup();

    const interval = setInterval(() => {
      if (!isPaused.current) {
        autoPlayer.nextMove();
        placeTrees();

        if (gameManager.state == GameState.Complete || gameManager.state == GameState.GameOver) {
          setup();
        }

        setForceUpdate(prev => prev + 1);
        setGameBoard(gameManager.gameBoard);
      }
    }, 1000 * updateIntervalSeconds);

    return () => {
      clearInterval(interval);
    };
  }, [gameManager, gameBoard]);

  const handleCellClick = (x: number, y: number) => {
    if (paintTile) {
      gameManager?.gameBoard.placeTileAt(x, y, new Tile(paintTile, 1, TileState.Neutral));
      setForceUpdate(prev => prev + 1);

      isPainting.current = true;
    }
  };

  const handlePaintSelect = (type: TileType): void => {
    if (type === paintTile) {
      setPaintTile(null);
    } else {
      setPaintTile(type);
    }
  };

  const togglePause = () => {
    isPaused.current = !isPaused.current;
    setIsPausedState(prev => !prev);
  };

  if (!gameManager || !gameBoard) {
    return <div></div>;
  }

  return (
    <div className="autoplayer-view">
      <InfiniteGameBoard
        gameBoard={gameBoard}
        handleCellClick={handleCellClick}
        forceUpdate={forceUpdate}
      />
      <div className={`${styles.menu} ${showControls ? styles.enabled : ''}`}>
        <button className="button" onClick={togglePause}>
          {!isPausedState && (
            <svg viewBox="0 0 24 24">
              <path d="M8.016 5.016l10.969 6.984-10.969 6.984v-13.969z"></path>
            </svg>
          )}
          {isPausedState && (
            <svg viewBox="0 0 24 24">
              <path d="M14.016 5.016h3.984v13.969h-3.984v-13.969zM6 18.984v-13.969h3.984v13.969h-3.984z"></path>
            </svg>
          )}
        </button>
        {isPausedState && (
          <div className={styles.paintMenu}>
            <button
              className={`button ${styles.paintMenuButton} ${paintTile === TileType.Tree ? 'active' : ''}`}
              onClick={() => handlePaintSelect(TileType.Tree)}
            >
              <span className="text-tree">{TREE_GLYPH}</span>
            </button>
            <button
              className={`button ${styles.paintMenuButton} ${paintTile === TileType.People ? 'active' : ''}`}
              onClick={() => handlePaintSelect(TileType.People)}
            >
              <span className="text-people">{PEOPLE_GLYPH}</span>
            </button>
            <button
              className={`button ${styles.paintMenuButton} ${paintTile === TileType.Farm ? 'active' : ''}`}
              onClick={() => handlePaintSelect(TileType.Farm)}
            >
              <span className="text-farm">{FARM_GLYPH}</span>
            </button>
            <button
              className={`button ${styles.paintMenuButton} ${paintTile === TileType.Power ? 'active' : ''}`}
              onClick={() => handlePaintSelect(TileType.Power)}
            >
              <span className="text-power">{POWER_GLYPH}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AutoPlayerView;
