// @ts-nocheck
// Currently not in use
import { GameManager } from '../modules/GameManager';
import { SwitchViewFn } from '../types/SwitchViewFn';
import { ThreeJSGameView } from '../views/ThreeJSGameView';

export class ThreeJSGameController {
    private gameManager: GameManager;
    private gameView: ThreeJSGameView;
    private isDragging: boolean = false;
    private previousMousePosition: { x: number; y: number } = { x: 0, y: 0 };
    private switchViewFn: SwitchViewFn;

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

        canvas.addEventListener('mousedown', (event) => {
            this.isDragging = true;
            this.previousMousePosition = { x: event.clientX, y: event.clientY };
        });

        canvas.addEventListener('mousemove', (event) => {
            if (!this.isDragging) return;

            const deltaX = event.clientX - this.previousMousePosition.x;
            const deltaY = event.clientY - this.previousMousePosition.y;

            this.previousMousePosition = { x: event.clientX, y: event.clientY };

            // Rotate the camera based on mouse movement
            this.gameView.moveCamera(deltaX, deltaY);
        });

        canvas.addEventListener('mouseup', () => {
            this.isDragging = false;
        });

        canvas.addEventListener('mouseleave', () => {
            this.isDragging = false;
        });
    }
}
