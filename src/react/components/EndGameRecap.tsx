import { GameManager, GameState } from '@/modules/GameManager';
import { getCurrentDate } from '@/utils/getCurrentDate';
import React, { useState } from 'react';
import ScoreHistory from './ScoreHistory';
import { ScoreGraphLines } from '@/views/GraphsView';
import ScoreComparison from './ScoreComparison';
import { UserScoreHistory } from '@/modules/UserScoreHistory';
import FinalScore from './FinalScore';

interface EndGameRecapProps {
  gameManager: GameManager;
  gameState: GameState;
  handlePlayAgainClick: () => void;
  userScoreHistory?: UserScoreHistory;
}

const EndGameRecap: React.FC<EndGameRecapProps> = ({
  gameManager,
  gameState,
  handlePlayAgainClick,
  userScoreHistory,
}) => {
  const [showPopup, setShowPopup] = useState(false);

  const popScore = gameManager.getPlayerScoreObj('population');
  const ecoScore = gameManager.getPlayerScoreObj('ecology');
  const finalScore = gameManager.getCalculatedPlayerScore();
  const allScores: number[] = userScoreHistory?.getFinalScoreHistory() ?? [];
  const scoreElements = gameManager.getFinalPlayerScoreElements();

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

  const handleShareScoreClick = async () => {
    const popupDisplayDurationMs = 3 * 1000;

    try {
      const text = `Generation Ship 2 - Daily Challenge ${getCurrentDate()}
        🌲 ${ecoScore?.value.toLocaleString() ?? 0}
        👤 ${popScore?.value.toLocaleString() ?? 0}
        🧮 ${finalScore.toLocaleString()}`;

      await navigator.clipboard.writeText(text);

      setShowPopup(true);

      setTimeout(() => {
        setShowPopup(false);
      }, popupDisplayDurationMs);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="endgame-controls">
      {gameState === GameState.GameOver && (
        <div className="player-notice">
          <h3>Game Over</h3>
          <p>
            The ship's population has died.&nbsp;It will continue to drift through space empty for
            eons.
          </p>
        </div>
      )}
      {gameState === GameState.Complete && (
        <div className="player-notice">
          <h3>Success!</h3>
          <p>
            After centuries traveling through space the ship has reached a suitable planet for
            permanent colonization.
          </p>
        </div>
      )}
      <FinalScore scoreElements={scoreElements} finalScore={finalScore} />
      <div className="player-actions">
        <button className="button" onClick={handlePlayAgainClick}>
          Play Again
        </button>
        {gameState === GameState.Complete && (
          <button className="button" onClick={handleShareScoreClick}>
            <span>Share Score</span>
            <span className={`popup ${showPopup ? 'active' : ''}`}>Copied to clipboard!</span>
          </button>
        )}
        <a href="https://ko-fi.com/timbertales" className="button" target="_blank">
          Support the Game
        </a>
      </div>
      <div className="endgame-graphs">
        <h3>History</h3>
        <ScoreHistory lines={lines} />
        <h3>Comparison</h3>
        <ScoreComparison score={finalScore} allScores={allScores} />
      </div>
    </div>
  );
};

export default EndGameRecap;
