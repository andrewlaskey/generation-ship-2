import React, { useEffect, useRef } from 'react';
import { GraphsView } from '@/vanilla-ts/views/GraphsView';

interface ScoreComparisonProps {
  score: number;
  allScores: number[];
}

const ScoreComparison: React.FC<ScoreComparisonProps> = ({ score, allScores }) => {
  const containerRef = useRef(null);
  const graphs = new GraphsView(document);

  useEffect(() => {
    if (containerRef.current) {
      graphs.appendHistogram(containerRef.current, allScores, score);
    }
  }, []);

  return <div ref={containerRef}></div>;
};

export default ScoreComparison;
