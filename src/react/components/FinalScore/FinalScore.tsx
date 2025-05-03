import React from 'react';
import styles from './FinalScore.module.scss';
import AnimatedCounter from '../AnimatedCounter';

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
          <AnimatedCounter target={value} duration={2} />
        </li>
      ))}
      <li className={styles.finalScoreTableRow}>
        <span className={styles.scoreTitle}>Total</span>
        <AnimatedCounter target={finalScore} delay={2} />
      </li>
    </ul>
  );
};

export default FinalScore;
