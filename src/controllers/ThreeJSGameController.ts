import * as THREE from 'three';
import { GameManager } from '../modules/GameManager';
import { SwitchViewFn } from '../types/SwitchViewFn';
import { ThreeJSGameView } from '../views/ThreeJSGameView';

export class ThreeJSGameController {
  private gameManager: GameManager;
  private gameView: ThreeJSGameView;
  private isDragging: boolean = false;
  private switchViewFn: SwitchViewFn;
  private mouseSensitivity = 0.01;
  private moveForward = false;
  private moveBackward = false;
  private moveLeft = false;
  private moveRight = false;
  private clock = new THREE.Clock();
  private movementSpeed = 5;
  private mouseMoveDeltaX = 0;
  private mouseMoveDeltaY = 0;
  private lastTouchX = 0;
  private lastTouchY = 0;

  constructor(gameManager: GameManager, gameView: ThreeJSGameView, fn: SwitchViewFn) {
    this.gameManager = gameManager;
    this.gameView = gameView;
    this.switchViewFn = fn;
  }

  init(startGame?: boolean) {
    this.initInputListeners();

    if (startGame) {
      this.gameManager.startGame();
    }

    this.updateView();
    this.loop();
  }

  // Initialize event listeners for user input
  private initInputListeners(): void {
    this.initCameraControls();

    const exitButton = this.gameView.document.querySelector<HTMLButtonElement>('#exit');

    exitButton?.addEventListener('click', () => {
      this.switchViewFn('prevHtmlGameView');
    });
  }

  // Update the view and re-initialize listeners
  private updateView(): void {
    this.gameView.updateGrid();
  }

  // Handle advancing the turn
  public advanceTurn(): void {
    this.gameManager.updateBoard();
    this.gameManager.updatePlayerScore();
    this.gameManager.fillHand();
    this.updateView();
  }

  public rotateItem(): void {
    this.gameManager.rotateSelectedItem();
    this.updateView();
  }

  // Initialize camera controls for mouse dragging
  private initCameraControls(): void {
    const canvas = this.gameView.getCanvas();
    const document = this.gameView.document;
    const moveLeftBtn = document.querySelector<HTMLButtonElement>('#left');
    const moveForwardBtn = document.querySelector<HTMLButtonElement>('#forward');
    const moveBackwardBtn = document.querySelector<HTMLButtonElement>('#backward');
    const moveRightBtn = document.querySelector<HTMLButtonElement>('#right');

    canvas.addEventListener('mousedown', () => {
      this.isDragging = true;
    });

    canvas.addEventListener('mouseup', () => {
      this.isDragging = false;
      this.mouseMoveDeltaX = 0; // Reset X movement
      this.mouseMoveDeltaY = 0; // Reset Y movement
    });

    document.addEventListener('mousemove', event => {
      if (this.isDragging) {
        this.mouseMoveDeltaX = event.movementX * this.mouseSensitivity;
        this.mouseMoveDeltaY = event.movementY * this.mouseSensitivity;
      }
    });

    canvas.addEventListener('touchstart', event => {
      this.isDragging = true;

      const touch = event.touches[0];
      this.lastTouchX = touch.clientX;
      this.lastTouchY = touch.clientY;

      event.preventDefault();
    });

    canvas.addEventListener('touchend', () => {
      this.isDragging = false;
      this.mouseMoveDeltaX = 0;
      this.mouseMoveDeltaY = 0;
    });

    canvas.addEventListener('touchmove', event => {
      if (this.isDragging) {
        const touch = event.touches[0];
        // Calculate the movement delta
        const deltaX = touch.clientX - this.lastTouchX;
        const deltaY = touch.clientY - this.lastTouchY;

        this.mouseMoveDeltaX = deltaX * this.mouseSensitivity;
        this.mouseMoveDeltaY = deltaY * this.mouseSensitivity;

        // Update last position
        this.lastTouchX = touch.clientX;
        this.lastTouchY = touch.clientY;

        event.preventDefault();
      }
    });

    document.addEventListener('keydown', event => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          this.moveForward = true;
          break;
        case 'ArrowDown':
        case 'KeyS':
          this.moveBackward = true;
          break;
        case 'ArrowLeft':
        case 'KeyA':
          this.moveLeft = true;
          break;
        case 'ArrowRight':
        case 'KeyD':
          this.moveRight = true;
          break;
      }
    });

    document.addEventListener('keyup', event => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          this.moveForward = false;
          break;
        case 'ArrowDown':
        case 'KeyS':
          this.moveBackward = false;
          break;
        case 'ArrowLeft':
        case 'KeyA':
          this.moveLeft = false;
          break;
        case 'ArrowRight':
        case 'KeyD':
          this.moveRight = false;
          break;
      }
    });

    moveLeftBtn?.addEventListener('pointerdown', event => {
      this.moveLeft = true;
      event.preventDefault();
    });

    moveLeftBtn?.addEventListener('pointerup', event => {
      this.moveLeft = false;
      event.preventDefault();
    });

    moveRightBtn?.addEventListener('pointerdown', event => {
      this.moveRight = true;
      event.preventDefault();
    });

    moveRightBtn?.addEventListener('pointerup', event => {
      this.moveRight = false;
      event.preventDefault();
    });

    moveForwardBtn?.addEventListener('pointerdown', event => {
      this.moveForward = true;
      event.preventDefault();
    });

    moveForwardBtn?.addEventListener('pointerup', event => {
      this.moveForward = false;
      event.preventDefault();
    });

    moveBackwardBtn?.addEventListener('pointerdown', event => {
      this.moveBackward = true;
      event.preventDefault();
    });

    moveBackwardBtn?.addEventListener('pointerup', event => {
      this.moveBackward = false;
      event.preventDefault();
    });
  }

  private loop = () => {
    const delta = this.clock.getDelta();
    const direction = new THREE.Vector3();

    // Forward/Backward movement
    if (this.moveForward) direction.z += 1;
    if (this.moveBackward) direction.z -= 1;

    // Left/Right movement
    if (this.moveLeft) direction.x += 1;
    if (this.moveRight) direction.x -= 1;

    // Apply camera movement
    this.gameView.moveCamera(
      direction,
      this.movementSpeed * delta,
      this.mouseMoveDeltaX,
      this.mouseMoveDeltaY
    );

    // Reset mouse movement deltas after each frame
    this.mouseMoveDeltaX = 0;
    this.mouseMoveDeltaY = 0;

    requestAnimationFrame(this.loop);
  };
}
