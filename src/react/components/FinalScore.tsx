import React from 'react';

interface FinalScoreProps {
  scoreElements: Map<string, number>;
  finalScore: number;
}

const FinalScore: React.FC<FinalScoreProps> = ({ scoreElements, finalScore }) => {
  return (
    <ul className="final-score-table">
      {[...scoreElements].map(([key, value]) => (
        <li key={key}>
          <span>{key}</span>
          <span>{value.toLocaleString()}</span>
        </li>
      ))}
      <li>
        <span>Total</span>
        <span>{finalScore.toLocaleString()}</span>
      </li>
    </ul>
  );
};

export default FinalScore;
