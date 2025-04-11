import React, { useEffect, useState, useRef } from 'react';
import { ThreeWorldManager } from '@/modules/Three/ThreeWorldManager';
import { useTextures } from '../hooks/Textures';
import { useModels } from '../hooks/Models';
import { GameManager } from '@/modules/GameManager';
import { ControlViewOption } from './GameView';

export interface ThreeDViewProps {
  gameManager: GameManager;
  setActiveTool: (newTool: ControlViewOption) => void;
}

const ThreeDView: React.FC<ThreeDViewProps> = ({ gameManager, setActiveTool }) => {
  const containerRef = useRef(null);
  const { textureLibrary, loading: textureLoading } = useTextures();
  const { modelLibrary, loading: modelLoading } = useModels();
  const [worldManager, setWorldManager] = useState<ThreeWorldManager | null>(null);

  const isLoading = textureLoading || modelLoading;

  useEffect(() => {
    if (!isLoading && modelLibrary && textureLibrary && containerRef.current) {
      const manager = new ThreeWorldManager(
        containerRef.current,
        modelLibrary,
        textureLibrary,
        gameManager
      );

      manager.init();
      setWorldManager(manager);

      let animationFrameId: number;

      const animate = () => {
        manager.render();
        animationFrameId = requestAnimationFrame(animate);
      };

      // Start the animation loop
      animate();

      // Clean up function to cancel animation frame when component unmounts
      return () => {
        cancelAnimationFrame(animationFrameId);
      };
    }
  }, [isLoading, textureLibrary, modelLibrary]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="explore-view">
      <button className="button" onClick={() => setActiveTool('default')}>
        <svg id="icon-arrow_back_ios" viewBox="0 0 24 24">
          <path d="M11.672 3.891l-8.109 8.109 8.109 8.109-1.781 1.781-9.891-9.891 9.891-9.891z"></path>
        </svg>
      </button>
      <div className="explore-view-canvas-wrapper" ref={containerRef}></div>
    </div>
  );
};

export default ThreeDView;
