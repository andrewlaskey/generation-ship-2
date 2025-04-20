import React, { useState, useEffect, useRef } from 'react';
import { useConfig } from '../../hooks/TileConfig';
import { GameManager, GameState } from '@/modules/GameManager';
import { AutoPlayer } from '@/modules/AutoPlayer';
import { Tile, TileState, TileType } from '@/modules/Tile';
import { GameBoard } from '@/modules/GameBoard';
import styles from './AutoPlayerView.module.scss';
import InfiniteGameBoard from '../InfiniteGameBoard/InfiniteGameBoard';
import { FARM_GLYPH, PEOPLE_GLYPH, POWER_GLYPH, TREE_GLYPH } from '@/utils/constants';
import { toTitleCase } from '@/utils/stringHelpers';

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
  const hasInteracted = useRef(false);
  const [zoomFactor, setZoomFactor] = useState(1);
  const [inspectToolSelected, setInspectToolSelected] = useState(false);
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);

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
      if (!hasInteracted.current) {
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
    gameManager?.clearHighlights();

    if (inspectToolSelected) {
      const space = gameManager?.gameBoard.getSpace(x, y);
      if (space && space.tile) {
        setSelectedTile(space.tile);
        gameManager?.addBoardHighlight(x, y);
      } else {
        setSelectedTile(null);
      }
    }

    if (paintTile) {
      gameManager?.gameBoard.placeTileAt(x, y, new Tile(paintTile, 1, TileState.Neutral));
      setForceUpdate(prev => prev + 1);

      hasInteracted.current = true;
    }
  };

  const handlePaintSelect = (type: TileType): void => {
    setInspectToolSelected(false);
    gameManager?.clearHighlights();

    if (type === paintTile) {
      setPaintTile(null);
    } else {
      setPaintTile(type);
    }
  };

  const handleZoomInClick = () => {
    setInspectToolSelected(false);
    if (zoomFactor < 1.75) {
      setZoomFactor(zoomFactor + 0.25);
    }
  };
  const handleZoomOutClick = () => {
    setInspectToolSelected(false);
    if (zoomFactor > 0.5) {
      setZoomFactor(zoomFactor - 0.25);
    }
  };

  const handleSelectInspectTool = () => {
    setPaintTile(null);
    setSelectedTile(null);
    gameManager?.clearHighlights();
    setInspectToolSelected(prev => !prev);
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
        zoomFactor={zoomFactor}
      />
      <div
        className={`${styles.menu} ${showControls ? styles.enabled : ''} ${isPausedState ? styles.paused : ''}`}
      >
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
        {isPausedState && (
          <div className={styles.zoomMenu}>
            <button
              className={`button ${styles.paintMenuButton} ${inspectToolSelected ? 'active' : ''}`}
              onClick={handleSelectInspectTool}
            >
              <svg id="icon-search" viewBox="0 0 32 32">
                <path d="M31.715 28.953c0.381 0.381 0.381 0.999 0 1.381l-1.381 1.381c-0.382 0.381-1 0.381-1.381 0l-9.668-9.668c-0.105-0.105-0.175-0.229-0.222-0.361-1.983 1.449-4.418 2.314-7.063 2.314-6.627 0-12-5.373-12-12s5.373-12 12-12c6.627 0 12 5.373 12 12 0 2.645-0.865 5.080-2.314 7.063 0.132 0.047 0.256 0.116 0.361 0.222l9.668 9.668zM12 4c-4.418 0-8 3.582-8 8s3.582 8 8 8 8-3.582 8-8c0-4.418-3.582-8-8-8z"></path>
              </svg>
            </button>
            <button className={`button ${styles.paintMenuButton}`} onClick={handleZoomInClick}>
              <span>+</span>
            </button>
            <button className={`button ${styles.paintMenuButton}`} onClick={handleZoomOutClick}>
              <span>-</span>
            </button>
          </div>
        )}
        {isPausedState && inspectToolSelected && selectedTile && (
          <div className={styles.tileDetails}>
            <ul className={styles.tileDetailsList}>
              <li>
                <strong>Type:</strong> {toTitleCase(selectedTile.type)}
              </li>
              <li>
                <strong>Status:</strong> {toTitleCase(selectedTile.state)}
              </li>
              <li>
                <strong>Level:</strong> {selectedTile.level}
              </li>
              <li>
                <strong>Age:</strong> {selectedTile.age}
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AutoPlayerView;
