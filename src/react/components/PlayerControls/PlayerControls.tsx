import React, { useState, useEffect } from 'react';
import { GameManager } from '@/modules/GameManager';
import PlayerHand from '../PlayerHand/PlayerHand';
import { ControlViewOption, GridCell } from '../GameView';
import { Tile } from '@/modules/Tile';
import { toTitleCase } from '@/utils/stringHelpers';
import ScoreHistory from '../ScoreHistory';
import { ScoreGraphLines } from '@/vanilla-ts/views/GraphsView';
import styles from './PlayerControls.module.scss';

interface PlayerControlsProps {
  gameManager: GameManager;
  activeTool: ControlViewOption;
  setActiveTool: (newTool: ControlViewOption) => void;
  inspectTile: Tile | null;
  showPlayerActions: boolean;
  confirmPlacement: () => void;
  declinePlacement: () => void;
  selectedGridCell: GridCell | null;
  forceUpdate?: number;
  gameViewUpdateTrigger: () => void;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({
  gameManager,
  activeTool,
  setActiveTool,
  inspectTile,
  showPlayerActions,
  confirmPlacement,
  declinePlacement,
  selectedGridCell,
  forceUpdate,
  gameViewUpdateTrigger,
}) => {
  const [_handUpdateCounter, setHandUpdateCounter] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(gameManager.getSelectedItemIndex());
  const [handItems, setHandItems] = useState(gameManager.getPlayerHand());
  const [deckCount, setDeckCount] = useState(gameManager.getDeckItemCount());
  const [scoreLines, setScoreLines] = useState<ScoreGraphLines[]>([]);

  useEffect(() => {
    const popScore = gameManager.getPlayerScoreObj('population');
    const ecoScore = gameManager.getPlayerScoreObj('ecology');
    const wasteScore = gameManager.getPlayerScoreObj('waste');
    const lines: ScoreGraphLines[] = [];

    if (popScore) {
      lines.push({
        score: popScore,
        color: 'steelblue',
      });
    }

    if (ecoScore) {
      lines.push({
        score: ecoScore,
        color: '#1b9416',
      });
    }

    if (wasteScore) {
      lines.push({
        score: wasteScore,
        color: '#9b9e9e',
      });
    }

    setScoreLines(lines);
    setSelectedIndex(gameManager.getSelectedItemIndex());
    setHandItems(gameManager.getPlayerHand());
    setDeckCount(gameManager.getDeckItemCount());
    setHandUpdateCounter(prev => prev + 1);
  }, [gameManager, forceUpdate]);

  const handleHandItemClick = (index: number) => {
    gameManager.selectItemFromHand(index);

    setHandUpdateCounter(prev => prev + 1);
    gameViewUpdateTrigger();
  };

  return (
    <div className={styles.playerControls}>
      <div className="game-updates">
        <div id="playerNotice"></div>
        {showPlayerActions && (
          <div id="playerActions" className="player-actions">
            <div className="prompt">Confirm placement?</div>
            <button className="button small btn-player-action" onClick={confirmPlacement}>
              Yes
            </button>
            <span>/</span>
            <button className="button small btn-player-action" onClick={declinePlacement}>
              No
            </button>
          </div>
        )}
      </div>
      <div className="dynamic-display">
        <div className={`inspect-window ${activeTool === 'inspect' ? '' : 'hidden'}`}>
          <h3>Inspect Mode</h3>
          <div className="cell-details">
            {!selectedGridCell && !inspectTile && <p>Select a grid cell</p>}
            {selectedGridCell && !inspectTile && <p>Empty cell</p>}
            {inspectTile && (
              <ul>
                <li>
                  <strong>Type:</strong> {toTitleCase(inspectTile.type)}
                </li>
                <li>
                  <strong>Status:</strong> {toTitleCase(inspectTile.state)}
                </li>
                <li>
                  <strong>Level:</strong> {inspectTile.level}
                </li>
                <li>
                  <strong>Age:</strong> {inspectTile.age}
                </li>
              </ul>
            )}
          </div>
        </div>
        <div className={`score-history-wrapper ${activeTool === 'graph' ? '' : 'hidden'}`}>
          <h3>Score History</h3>
          <ScoreHistory lines={scoreLines} />
        </div>
        <div className={activeTool === 'default' ? '' : 'hidden'}>
          <PlayerHand
            items={handItems}
            selectedIndex={selectedIndex}
            deckCount={deckCount}
            handleHandItemClick={handleHandItemClick}
          />
        </div>
      </div>
      <div className="toolbar" id="toolbar">
        <h3>Tools</h3>
        <div className={styles.tools}>
          <button
            className={`button ${styles.toolsButton} ${activeTool === 'inspect' ? 'enabled' : ''}`}
            onClick={() => setActiveTool('inspect')}
          >
            <svg id="icon-search" viewBox="0 0 32 32">
              <path d="M31.715 28.953c0.381 0.381 0.381 0.999 0 1.381l-1.381 1.381c-0.382 0.381-1 0.381-1.381 0l-9.668-9.668c-0.105-0.105-0.175-0.229-0.222-0.361-1.983 1.449-4.418 2.314-7.063 2.314-6.627 0-12-5.373-12-12s5.373-12 12-12c6.627 0 12 5.373 12 12 0 2.645-0.865 5.080-2.314 7.063 0.132 0.047 0.256 0.116 0.361 0.222l9.668 9.668zM12 4c-4.418 0-8 3.582-8 8s3.582 8 8 8 8-3.582 8-8c0-4.418-3.582-8-8-8z"></path>
            </svg>
          </button>
          <button className={`button ${styles.toolsButton}`} onClick={() => setActiveTool('3d')}>
            <svg id="icon-cube" viewBox="0 0 26 28">
              <path d="M14 25.453l10-5.453v-9.938l-10 3.641v11.75zM13 11.937l10.906-3.969-10.906-3.969-10.906 3.969zM26 8v12c0 0.734-0.406 1.406-1.047 1.75l-11 6c-0.297 0.172-0.625 0.25-0.953 0.25s-0.656-0.078-0.953-0.25l-11-6c-0.641-0.344-1.047-1.016-1.047-1.75v-12c0-0.844 0.531-1.594 1.313-1.875l11-4c0.219-0.078 0.453-0.125 0.688-0.125s0.469 0.047 0.688 0.125l11 4c0.781 0.281 1.313 1.031 1.313 1.875z"></path>
            </svg>
          </button>
          <button
            className={`button ${styles.toolsButton} ${activeTool === 'graph' ? 'enabled' : ''}`}
            onClick={() => setActiveTool('graph')}
          >
            <svg viewBox="0 0 20 20">
              <path d="M0.69 11.331l1.363 0.338 1.026-1.611-1.95-0.482c-0.488-0.121-0.981 0.174-1.102 0.66-0.121 0.483 0.175 0.973 0.663 1.095zM18.481 11.592l-4.463 4.016-5.247-4.061c-0.1-0.076-0.215-0.133-0.338-0.162l-0.698-0.174-1.027 1.611 1.1 0.273 5.697 4.408c0.166 0.127 0.362 0.189 0.559 0.189 0.219 0 0.438-0.078 0.609-0.232l5.028-4.527c0.372-0.334 0.401-0.906 0.064-1.277s-0.911-0.4-1.284-0.064zM8.684 7.18l4.887 3.129c0.413 0.264 0.961 0.154 1.24-0.246l5.027-7.242c0.286-0.412 0.183-0.977-0.231-1.26-0.414-0.285-0.979-0.182-1.265 0.23l-4.528 6.521-4.916-3.147c-0.204-0.131-0.451-0.174-0.688-0.123-0.236 0.053-0.442 0.197-0.571 0.4l-7.497 11.767c-0.27 0.422-0.144 0.983 0.28 1.25 0.15 0.096 0.319 0.141 0.486 0.141 0.301 0 0.596-0.149 0.768-0.42l7.008-11z"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerControls;
