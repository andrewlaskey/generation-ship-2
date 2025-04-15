import React from 'react';
import styles from './FinalScore.module.scss';

interface FinalScoreProps {
  scoreElements: Map<string, number>;
  finalScore: number;
}

const FinalScore: React.FC<FinalScoreProps> = ({ scoreElements, finalScore }) => {
  return (
    <ul className={styles.finalScoreTable}>
      {[...scoreElements].map(([key, value]) => (
        <li key={key} className={styles.finalScoreTableRow}>
          <span className={styles.scoreTitle}>{key}</span>
          <span>{value.toLocaleString()}</span>
        </li>
      ))}
      <li className={styles.finalScoreTableRow}>
        <span className={styles.scoreTitle}>Total</span>
        <span>{finalScore.toLocaleString()}</span>
      </li>
    </ul>
  );
};

export default FinalScore;
