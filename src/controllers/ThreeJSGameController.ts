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

    constructor(gameManager: GameManager, gameView: ThreeJSGameView, fn: SwitchViewFn) {
        this.gameManager = gameManager;
        this.gameView = gameView;
        this.switchViewFn = fn;
    }

    init(startGame?: boolean) {
        console.log('Init', startGame);
        // Set up any input listeners
        this.initInputListeners();

        // Start the game
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
        })
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

        canvas.addEventListener('mousedown', () => {
            this.isDragging = true;
        });

        canvas.addEventListener('mouseup', () => {
            this.isDragging = false;
        });

        document.addEventListener('mousemove', (event) => {
            if (this.isDragging) {
                this.mouseMoveDeltaX = event.movementX * this.mouseSensitivity;
                this.mouseMoveDeltaY = event.movementY * this.mouseSensitivity;
            } else {
                this.mouseMoveDeltaX = 0;
                this.mouseMoveDeltaY = 0;
            }
        });

        document.addEventListener('keydown', (event) => {
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

        document.addEventListener('keyup', (event) => {
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

        this.gameView.moveCamera(
            direction,
            this.movementSpeed * delta,
            this.mouseMoveDeltaX,
            this.mouseMoveDeltaY
        );

        requestAnimationFrame(this.loop);
    }
}
