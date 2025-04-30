import React, { useRef, useEffect } from 'react';
import { GraphsView, ScoreGraphLines } from '@/vanilla-ts/views/GraphsView';

interface ScoreHistoryProps {
  lines: ScoreGraphLines[];
}

const ScoreHistory: React.FC<ScoreHistoryProps> = ({ lines }) => {
  const containerRef = useRef(null);
  const graphsView = new GraphsView(document);

  useEffect(() => {
    if (containerRef.current) {
      graphsView.appendScoreGraph(containerRef.current, lines);
    }
  }, [lines]);

  return <div ref={containerRef}></div>;
};

export default ScoreHistory;
