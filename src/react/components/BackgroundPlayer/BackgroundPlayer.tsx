import React from 'react';
import AutoPlayerView from '../AutoPlayerView/AutoPlayerView';
import styles from './BackgroundPlayer.module.scss';

interface BackgroundPlayerProps {
  isActive: boolean;
  handleToggleClick: () => void;
}

const BackgroundPlayer: React.FC<BackgroundPlayerProps> = ({ isActive, handleToggleClick }) => {
  return (
    <div className={`${styles.backgroundPlayerWrapper} ${isActive ? styles.enabled : ''}`}>
      <div className={styles.backgroundPlayer}>
        <AutoPlayerView showControls={isActive} />
      </div>
      <button
        className={`button ${styles.backgroundPlayerButton} ${isActive ? styles.backgroundPlayerButtonEnabled : ''}`}
        onClick={handleToggleClick}
      >
        <svg id="icon-arrow_back_ios" viewBox="0 0 24 24">
          <path d="M11.672 3.891l-8.109 8.109 8.109 8.109-1.781 1.781-9.891-9.891 9.891-9.891z"></path>
        </svg>
      </button>
    </div>
  );
};

export default BackgroundPlayer;
