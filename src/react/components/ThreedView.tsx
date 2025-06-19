import React, { useEffect, useState, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { ThreeWorldManager } from '@/modules/Three/ThreeWorldManager';
import { useTextures } from '../hooks/Textures';
import { useModels } from '../hooks/Models';
import { GameManager } from '@/modules/GameManager';
import { ControlViewOption } from './GameView';
import Loading from './Loading/Loading';
import { gsap } from 'gsap/gsap-core';

export interface ThreeDViewProps {
  gameManager: GameManager;
  setActiveTool: (newTool: ControlViewOption) => void;
}

const ThreeDView: React.FC<ThreeDViewProps> = ({ gameManager, setActiveTool }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { textureLibrary, loading: textureLoading } = useTextures();
  const { modelLibrary, loading: modelLoading } = useModels();
  const [isMeditating, setIsMeditating] = useState(false);
  const [_worldManager, setWorldManager] = useState<ThreeWorldManager | null>();

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
    isMovingDisabled: false,
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
    if (!movementStateRef.current.isMovingDisabled) {
      movementStateRef.current.movingLeft = true;
      setActiveButtons(prev => ({ ...prev, left: true }));
    }
  }, []);

  const stopMovingLeft = useCallback(() => {
    if (!movementStateRef.current.isMovingDisabled) {
      movementStateRef.current.movingLeft = false;
      setActiveButtons(prev => ({ ...prev, left: false }));
    }
  }, []);

  const startMovingRight = useCallback(() => {
    if (!movementStateRef.current.isMovingDisabled) {
      movementStateRef.current.movingRight = true;
      setActiveButtons(prev => ({ ...prev, right: true }));
    }
  }, []);

  const stopMovingRight = useCallback(() => {
    if (!movementStateRef.current.isMovingDisabled) {
      movementStateRef.current.movingRight = false;
      setActiveButtons(prev => ({ ...prev, right: false }));
    }
  }, []);

  const startMovingForward = useCallback(() => {
    if (!movementStateRef.current.isMovingDisabled) {
      movementStateRef.current.movingForward = true;
      setActiveButtons(prev => ({ ...prev, forward: true }));
    }
  }, []);

  const stopMovingForward = useCallback(() => {
    if (!movementStateRef.current.isMovingDisabled) {
      movementStateRef.current.movingForward = false;
      setActiveButtons(prev => ({ ...prev, forward: false }));
    }
  }, []);

  const startMovingBackward = useCallback(() => {
    if (!movementStateRef.current.isMovingDisabled) {
      movementStateRef.current.movingBackward = true;
      setActiveButtons(prev => ({ ...prev, backward: true }));
    }
  }, []);

  const stopMovingBackward = useCallback(() => {
    if (!movementStateRef.current.isMovingDisabled) {
      movementStateRef.current.movingBackward = false;
      setActiveButtons(prev => ({ ...prev, backward: false }));
    }
  }, []);

  const stopMeditating = () => {
    setIsMeditating(false);
    movementStateRef.current.isMovingDisabled = false;

    if (_worldManager) {
      _worldManager.meditator.stopMeditating();
    }
  };

  const startMeditating = () => {
    movementStateRef.current.movingBackward = false;
    movementStateRef.current.movingForward = false;
    movementStateRef.current.movingLeft = false;
    movementStateRef.current.movingRight = false;
    movementStateRef.current.isDragging = false;
    movementStateRef.current.mouseMoveDeltaX = 0;
    movementStateRef.current.mouseMoveDeltaY = 0;
    movementStateRef.current.isMovingDisabled = true;
    setIsMeditating(true);
    setActiveButtons({
      left: false,
      right: false,
      forward: false,
      backward: false,
    });
  };

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!movementStateRef.current.isMovingDisabled) {
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
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (!movementStateRef.current.isMovingDisabled) {
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
          if (!movementStateRef.current.isMovingDisabled) {
            movementStateRef.current.isDragging = true;
          }
        };

        const handleMouseUp = () => {
          if (!movementStateRef.current.isMovingDisabled) {
            movementStateRef.current.isDragging = false;
            movementStateRef.current.mouseMoveDeltaX = 0;
            movementStateRef.current.mouseMoveDeltaY = 0;
          }
        };

        const handleMouseMove = (event: MouseEvent) => {
          if (movementStateRef.current.isDragging && !movementStateRef.current.isMovingDisabled) {
            movementStateRef.current.mouseMoveDeltaX = event.movementX * mouseSensitivity;
            movementStateRef.current.mouseMoveDeltaY = event.movementY * mouseSensitivity;
          }
        };

        // Touch controls
        const handleTouchStart = (event: TouchEvent) => {
          if (!movementStateRef.current.isMovingDisabled) {
            movementStateRef.current.isDragging = true;
            const touch = event.touches[0];
            movementStateRef.current.lastTouchX = touch.clientX;
            movementStateRef.current.lastTouchY = touch.clientY;
            event.preventDefault();
          }
        };

        const handleTouchEnd = () => {
          if (!movementStateRef.current.isMovingDisabled) {
            movementStateRef.current.isDragging = false;
            movementStateRef.current.mouseMoveDeltaX = 0;
            movementStateRef.current.mouseMoveDeltaY = 0;
          }
        };

        const handleTouchMove = (event: TouchEvent) => {
          if (movementStateRef.current.isDragging && !movementStateRef.current.isMovingDisabled) {
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
          if (!movementStateRef.current.isMovingDisabled) {
            manager.moveCamera(
              direction,
              movementSpeed * delta,
              state.mouseMoveDeltaX,
              state.mouseMoveDeltaY
            );
          }

          if (manager.meditator.checkCollision(manager.camera.position)) {
            startMeditating();
            manager.meditator.startMeditating(
              manager.scene,
              manager.camera.position,
              manager.dayNightController.sunLight?.position
            );
          }

          // Reset mouse movement deltas after each frame
          state.mouseMoveDeltaX = 0;
          state.mouseMoveDeltaY = 0;

          manager.meditator.update();

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
    return <Loading isLoading={isLoading} />;
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
        {isMeditating && (
          <div className="threejs-meditation-controls">
            <div className="meditation-progress"></div>
            <button className="button" onClick={stopMeditating}>
              END
            </button>
          </div>
        )}
        {!isMeditating && (
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
        )}
      </div>
    </div>
  );
};

export default ThreeDView;
