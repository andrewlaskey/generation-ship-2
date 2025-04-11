import React, { useEffect, useState, useRef, useCallback } from 'react';
import * as THREE from 'three';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const { textureLibrary, loading: textureLoading } = useTextures();
  const { modelLibrary, loading: modelLoading } = useModels();
  const [worldManager, setWorldManager] = useState<ThreeWorldManager | null>(null);

  // Use refs to store movement state
  const movementStateRef = useRef({
    isDragging: false,
    movingLeft: false,
    movingRight: false,
    movingForward: false,
    movingBackward: false,
    mouseMoveDeltaX: 0,
    mouseMoveDeltaY: 0,
    lastTouchX: 0,
    lastTouchY: 0,
  });
  const [activeButtons, setActiveButtons] = useState({
    left: false,
    right: false,
    forward: false,
    backward: false,
  });

  const clockRef = useRef(new THREE.Clock());
  const mouseSensitivity = 0.01;
  const movementSpeed = 5;

  const isLoading = textureLoading || modelLoading;

  // Movement control functions using refs
  const startMovingLeft = useCallback(() => {
    movementStateRef.current.movingLeft = true;
    setActiveButtons(prev => ({ ...prev, left: true }));
  }, []);

  const stopMovingLeft = useCallback(() => {
    movementStateRef.current.movingLeft = false;
    setActiveButtons(prev => ({ ...prev, left: false }));
  }, []);

  const startMovingRight = useCallback(() => {
    movementStateRef.current.movingRight = true;
    setActiveButtons(prev => ({ ...prev, right: true }));
  }, []);

  const stopMovingRight = useCallback(() => {
    movementStateRef.current.movingRight = false;
    setActiveButtons(prev => ({ ...prev, right: false }));
  }, []);

  const startMovingForward = useCallback(() => {
    movementStateRef.current.movingForward = true;
    setActiveButtons(prev => ({ ...prev, forward: true }));
  }, []);

  const stopMovingForward = useCallback(() => {
    movementStateRef.current.movingForward = false;
    setActiveButtons(prev => ({ ...prev, forward: false }));
  }, []);

  const startMovingBackward = useCallback(() => {
    movementStateRef.current.movingBackward = true;
    setActiveButtons(prev => ({ ...prev, backward: true }));
  }, []);

  const stopMovingBackward = useCallback(() => {
    movementStateRef.current.movingBackward = false;
    setActiveButtons(prev => ({ ...prev, backward: false }));
  }, []);

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          movementStateRef.current.movingForward = true;
          setActiveButtons(prev => ({ ...prev, forward: true }));
          break;
        case 'ArrowDown':
        case 'KeyS':
          movementStateRef.current.movingBackward = true;
          setActiveButtons(prev => ({ ...prev, backward: true }));
          break;
        case 'ArrowLeft':
        case 'KeyA':
          movementStateRef.current.movingLeft = true;
          setActiveButtons(prev => ({ ...prev, left: true }));
          break;
        case 'ArrowRight':
        case 'KeyD':
          movementStateRef.current.movingRight = true;
          setActiveButtons(prev => ({ ...prev, right: true }));
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          movementStateRef.current.movingForward = false;
          setActiveButtons(prev => ({ ...prev, forward: false }));
          break;
        case 'ArrowDown':
        case 'KeyS':
          movementStateRef.current.movingBackward = false;
          setActiveButtons(prev => ({ ...prev, backward: false }));
          break;
        case 'ArrowLeft':
        case 'KeyA':
          movementStateRef.current.movingLeft = false;
          setActiveButtons(prev => ({ ...prev, left: false }));
          break;
        case 'ArrowRight':
        case 'KeyD':
          movementStateRef.current.movingRight = false;
          setActiveButtons(prev => ({ ...prev, right: false }));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

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

      // Set up mouse and touch controls for the container
      const canvas = containerRef.current.querySelector('canvas');

      if (canvas) {
        // Mouse controls
        const handleMouseDown = () => {
          movementStateRef.current.isDragging = true;
        };

        const handleMouseUp = () => {
          movementStateRef.current.isDragging = false;
          movementStateRef.current.mouseMoveDeltaX = 0;
          movementStateRef.current.mouseMoveDeltaY = 0;
        };

        const handleMouseMove = (event: MouseEvent) => {
          if (movementStateRef.current.isDragging) {
            movementStateRef.current.mouseMoveDeltaX = event.movementX * mouseSensitivity;
            movementStateRef.current.mouseMoveDeltaY = event.movementY * mouseSensitivity;
          }
        };

        // Touch controls
        const handleTouchStart = (event: TouchEvent) => {
          movementStateRef.current.isDragging = true;
          const touch = event.touches[0];
          movementStateRef.current.lastTouchX = touch.clientX;
          movementStateRef.current.lastTouchY = touch.clientY;
          event.preventDefault();
        };

        const handleTouchEnd = () => {
          movementStateRef.current.isDragging = false;
          movementStateRef.current.mouseMoveDeltaX = 0;
          movementStateRef.current.mouseMoveDeltaY = 0;
        };

        const handleTouchMove = (event: TouchEvent) => {
          if (movementStateRef.current.isDragging) {
            const touch = event.touches[0];
            const deltaX = touch.clientX - movementStateRef.current.lastTouchX;
            const deltaY = touch.clientY - movementStateRef.current.lastTouchY;

            movementStateRef.current.mouseMoveDeltaX = deltaX * mouseSensitivity;
            movementStateRef.current.mouseMoveDeltaY = deltaY * mouseSensitivity;

            movementStateRef.current.lastTouchX = touch.clientX;
            movementStateRef.current.lastTouchY = touch.clientY;
            event.preventDefault();
          }
        };

        // Add event listeners
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('mouseleave', handleMouseUp);
        document.addEventListener('mousemove', handleMouseMove);

        canvas.addEventListener('touchstart', handleTouchStart);
        canvas.addEventListener('touchend', handleTouchEnd);
        canvas.addEventListener('touchcancel', handleTouchEnd);
        canvas.addEventListener('touchmove', handleTouchMove);

        let animationFrameId: number;

        const animate = () => {
          const delta = clockRef.current.getDelta();
          const direction = new THREE.Vector3();
          const state = movementStateRef.current;

          // Forward/Backward movement
          if (state.movingForward) direction.z += 1;
          if (state.movingBackward) direction.z -= 1;

          // Left/Right movement
          if (state.movingLeft) direction.x += 1;
          if (state.movingRight) direction.x -= 1;

          // Apply camera movement
          manager.moveCamera(
            direction,
            movementSpeed * delta,
            state.mouseMoveDeltaX,
            state.mouseMoveDeltaY
          );

          // Reset mouse movement deltas after each frame
          state.mouseMoveDeltaX = 0;
          state.mouseMoveDeltaY = 0;

          manager.render();
          animationFrameId = requestAnimationFrame(animate);
        };

        // Start the animation loop
        animate();

        // Clean up function to cancel animation frame and remove event listeners when component unmounts
        return () => {
          cancelAnimationFrame(animationFrameId);

          canvas.removeEventListener('mousedown', handleMouseDown);
          canvas.removeEventListener('mouseup', handleMouseUp);
          canvas.removeEventListener('mouseleave', handleMouseUp);
          document.removeEventListener('mousemove', handleMouseMove);

          canvas.removeEventListener('touchstart', handleTouchStart);
          canvas.removeEventListener('touchend', handleTouchEnd);
          canvas.removeEventListener('touchcancel', handleTouchEnd);
          canvas.removeEventListener('touchmove', handleTouchMove);
        };
      }
    }
  }, [isLoading, textureLibrary, modelLibrary, gameManager]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="explore-view">
      <div className="explore-view-canvas-wrapper" ref={containerRef}></div>
      <div className="threejs-header">
        <button className="button" onClick={() => setActiveTool('default')}>
          <svg id="icon-arrow_back_ios" viewBox="0 0 24 24">
            <path d="M11.672 3.891l-8.109 8.109 8.109 8.109-1.781 1.781-9.891-9.891 9.891-9.891z"></path>
          </svg>
        </button>
      </div>
      <div className="threejs-footer">
        <div className="threejs-controls">
          <button
            className={`button left ${activeButtons.left ? 'active' : ''}`}
            onPointerDown={startMovingLeft}
            onPointerUp={stopMovingLeft}
            onPointerLeave={stopMovingLeft}
          >
            ⏴
          </button>
          <button
            className={`button forward ${activeButtons.forward ? 'active' : ''}`}
            onPointerDown={startMovingForward}
            onPointerUp={stopMovingForward}
            onPointerLeave={stopMovingForward}
          >
            ⏶
          </button>
          <button
            className={`button backward ${activeButtons.backward ? 'active' : ''}`}
            onPointerDown={startMovingBackward}
            onPointerUp={stopMovingBackward}
            onPointerLeave={stopMovingBackward}
          >
            ⏷
          </button>
          <button
            className={`button right ${activeButtons.right ? 'active' : ''}`}
            onPointerDown={startMovingRight}
            onPointerUp={stopMovingRight}
            onPointerLeave={stopMovingRight}
          >
            ⏵
          </button>
        </div>
        <p className="threejs-info-text">⚠️ Warning! 3D Mode is a work in progress ⚠️</p>
      </div>
    </div>
  );
};

export default ThreeDView;
