import React, { useState, useEffect } from 'react';
import { useConfig } from '../hooks/TileConfig';
import { GameManager, GameState } from '@/modules/GameManager';
import GameBoardGrid from './GameBoardGrid';
import { AutoPlayer } from '@/modules/AutoPlayer';
import { Tile, TileState, TileType } from '@/modules/Tile';
import { GameBoard } from '@/modules/GameBoard';

const AutoPlayerView: React.FC = () => {
  const { config, loading: configLoading } = useConfig();
  const [gameManager, setGameManager] = useState<GameManager | null>(null);
  const [gameBoard, setGameBoard] = useState<GameBoard | null>(null);
  const [forceUpdate, setForceUpdate] = useState(0);

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
      for (let i = 0; i < numTrees; i++) {
        const x = Math.floor(Math.random() * gridSize);
        const y = Math.floor(Math.random() * gridSize);

        gameManager.gameBoard.placeTileAt(x, y, new Tile(TileType.Tree, 1, TileState.Neutral));
      }
    };

    setup();

    const interval = setInterval(() => {
      autoPlayer.nextMove();
      placeTrees();

      if (gameManager.state == GameState.Complete || gameManager.state == GameState.GameOver) {
        setup();
      }

      setForceUpdate(prev => prev + 1);
      setGameBoard(gameManager.gameBoard);
    }, 1000 * updateIntervalSeconds);

    return () => {
      clearInterval(interval);
    };
  }, [gameManager, gameBoard]);

  const handleCellClick = () => {};

  if (!gameManager || !gameBoard) {
    return <div></div>;
  }

  return (
    <div>
      <GameBoardGrid
        gameBoard={gameBoard}
        handleCellClick={handleCellClick}
        forceUpdate={forceUpdate}
      />
    </div>
  );
};

export default AutoPlayerView;
