import React, { useState } from 'react';
import { GameManager, GameState } from '@/modules/GameManager';
import Scoreboard from './Scoreboard';
import PlayerControls from './PlayerControls/PlayerControls';
import { ViewTypes } from '../App';
import GameBoardGrid from './GameBoardGrid/GameBoardGrid';
import { Tile } from '@/modules/Tile';
import { HandItem } from '@/modules/PlayerHand';
import { UserScoreHistory } from '@/modules/UserScoreHistory';
import EndGameRecap from './EndGameRecap';
import ThreeDView from './ThreedView';
import AboutModal from './AboutModal';

export type ControlViewOption = 'default' | 'inspect' | '3d' | 'graph';
export interface GridCell {
  x: number;
  y: number;
}
interface GameViewProps {
  gameManager: GameManager;
  onSwitchView: (view: ViewTypes, newGame: boolean) => void;
  userScoreHistory?: UserScoreHistory;
  gameType: 'daily' | 'custom';
}

const GameView: React.FC<GameViewProps> = ({
  gameManager,
  onSwitchView,
  userScoreHistory,
  gameType,
}) => {
  const [showHelp, setShowHelp] = useState(false);
  const [activeTool, setActiveTool] = useState<ControlViewOption>('default');
  const [selectedGridCell, setSelectedGridCell] = useState<GridCell | null>(null);
  const [selectedHandItem, setSelectedHandItem] = useState<HandItem | null>(null);
  const [inspectTile, setInspectTile] = useState<Tile | null>(null);
  const [showPlayerActions, setShowPlayerActions] = useState(false);
  const [gameState, setGameState] = useState<GameState>(gameManager.state);

  const ecoScore = gameManager.getPlayerScore('ecology');
  const popScore = gameManager.getPlayerScore('population');

  const resetSelected = () => {
    if (selectedGridCell) {
      gameManager.removeBoardHighlight(selectedGridCell.x, selectedGridCell.y);
    }
    setSelectedHandItem(null);
    setShowPlayerActions(false);
  };

  const handleOpenHelp = () => {
    setShowHelp(true);
  };

  const handleCloseHelp = () => {
    setShowHelp(false);
  };

  const handleQuit = () => {
    onSwitchView('menu', false);
  };

  const handleToolChangeClick = (newTool: ControlViewOption) => {
    resetSelected();
    setActiveTool(prev => {
      if (prev === newTool) {
        return 'default';
      }

      return newTool;
    });
  };

  const handleCellClick = (x: number, y: number) => {
    if (activeTool === 'inspect') {
      if (selectedGridCell) {
        gameManager.removeBoardHighlight(selectedGridCell.x, selectedGridCell.y);
      }

      const space = gameManager.gameBoard.getSpace(x, y);

      if (space) {
        // console.log(this.gameManager.gameBoard.getNeighborCounts(x, y));
        gameManager.addBoardHighlight(x, y);
        setInspectTile(space.tile);
      } else {
        setInspectTile(null);
      }
    } else {
      const shouldRotatePlacedTile =
        selectedGridCell && x == selectedGridCell.x && y == selectedGridCell.y;

      if (shouldRotatePlacedTile) {
        gameManager.rotateSelectedItem();
      } else {
        if (selectedGridCell) {
          // remove existing highlight before adding new one
          gameManager.removeBoardHighlight(selectedGridCell.x, selectedGridCell.y);
        }

        gameManager.addBoardHighlight(x, y);
        //   this.gameView.showPlayerActions();
      }

      setSelectedHandItem(gameManager.getSelectedItem());
      setShowPlayerActions(true);
    }

    setSelectedGridCell({ x, y });
  };

  const handleConfirmPlaceCell = () => {
    if (selectedGridCell) {
      const selectedHandIndex = gameManager.getSelectedItemIndex(); // Get selected item index from hand
      const success = gameManager.placeTileBlock(
        selectedGridCell.x,
        selectedGridCell.y,
        selectedHandIndex
      );

      resetSelected();

      if (!success) {
        console.error(
          `Failed to place tile block at (${selectedGridCell.x}, ${selectedGridCell.y}). Invalid placement or non-tile item.`
        );
      } else {
        // Advance the players turn after making a placement
        advanceTurn();
      }
    }
  };

  const handleDeclinePlaceCell = () => {
    resetSelected();
  };

  const handlePlayAgainClick = () => {
    gameManager.resetGame();
    gameManager.startGame();
    setGameState(gameManager.state);
  };

  const advanceTurn = () => {
    gameManager.advanceTurn();

    if (gameManager.state === GameState.Complete || gameManager.state === GameState.GameOver) {
      if (gameType == 'daily' && userScoreHistory) {
        const finalScore = gameManager.getCalculatedPlayerScore();
        userScoreHistory.saveGameResult({
          score: finalScore,
          result: gameManager.state,
        });
      }
    }

    setGameState(gameManager.state);
  };

  return (
    <div className="game-view">
      {activeTool !== '3d' && (
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
              <Scoreboard ecology={ecoScore} population={popScore} />
            </div>
            <GameBoardGrid
              gameBoard={gameManager.gameBoard}
              handleCellClick={handleCellClick}
              selectedHandItem={selectedHandItem}
              selectedGridCell={selectedGridCell}
            />
            {gameState === GameState.Playing && (
              <PlayerControls
                gameManager={gameManager}
                activeTool={activeTool}
                setActiveTool={handleToolChangeClick}
                inspectTile={inspectTile}
                showPlayerActions={showPlayerActions}
                confirmPlacement={handleConfirmPlaceCell}
                declinePlacement={handleDeclinePlaceCell}
                selectedGridCell={selectedGridCell}
              />
            )}
            {(gameState === GameState.Complete || gameState === GameState.GameOver) && (
              <EndGameRecap
                gameManager={gameManager}
                gameState={gameState}
                handlePlayAgainClick={handlePlayAgainClick}
                userScoreHistory={userScoreHistory}
              />
            )}
            <AboutModal isShowing={showHelp} handleClose={handleCloseHelp} />
          </div>
        </div>
      )}
      {activeTool === '3d' && (
        <ThreeDView gameManager={gameManager} setActiveTool={handleToolChangeClick} />
      )}
    </div>
  );
};

export default GameView;
