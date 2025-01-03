// @ts-nocheck
// Currently not in use
import { GameManager } from '../modules/GameManager';
import { ThreeJSGameView } from '../views/ThreeJSGameView';

export class ThreeJSGameController {
    private gameManager: GameManager;
    private gameView: ThreeJSGameView;
    private isDragging: boolean = false;
    private previousMousePosition: { x: number; y: number } = { x: 0, y: 0 };

    constructor(gameManager: GameManager, gameView: ThreeJSGameView) {
        this.gameManager = gameManager;
        this.gameView = gameView;

        // Set up input listeners
        this.initInputListeners();

        // Start the game
        this.gameManager.startGame();
        this.updateView();

        // Enable camera controls
        // this.initCameraControls();
    }

    // Initialize event listeners for user input
    private initInputListeners(): void {
        const rotateItemButton = this.gameView.document.querySelector<HTMLButtonElement>('#rotateItem');

        // Add an event listener for the "Rotate" button
        rotateItemButton?.addEventListener('click', () => this.rotateItem());

        // Initialize 3D grid and hand item listeners
        this.initGridListeners();
        this.initHandItemListeners();
    }

    // Initialize listeners for 3D grid interactions
    private initGridListeners(): void {
        const gameSize = this.gameManager.gameBoard.size;

        // Add click listeners for each mesh in the grid
        for (let x = 0; x < gameSize; x++) {
            for (let y = 0; y < gameSize; y++) {
                const meshes = this.gameView.getMeshes();
                const mesh = meshes[x][y];
                mesh.userData = { x, y };  // Store grid coordinates in the mesh's userData

                mesh.addEventListener('click', (event: MouseEvent) => {
                    const { x, y } = mesh.userData;
                    this.handleCellClick(x, y);
                });
                mesh.addEventListener('mouseover', (event: MouseEvent) => {
                    const { x, y } = mesh.userData;
                    this.handleCellHover(true, x, y);
                });
                mesh.addEventListener('mouseout', (event: MouseEvent) => {
                    const { x, y } = mesh.userData;
                    this.handleCellHover(false, x, y);
                });
            }
        }
    }

    // Initialize listeners for hand item clicks
    private initHandItemListeners(): void {
        const handItems = this.gameView.document.querySelectorAll<HTMLDivElement>('.hand-item');
        handItems.forEach((item, index) => {
            item.addEventListener('click', () => this.handleHandItemClick(index));
        });
    }

    // Handle a click on a grid cell
    private handleCellClick(x: number, y: number): void {
        const selectedHandIndex = this.gameManager.getSelectedItemIndex();
        const success = this.gameManager.placeTileBlock(x, y, selectedHandIndex);

        if (!success) {
            console.error(`Failed to place tile block at (${x}, ${y}). Invalid placement or non-tile item.`);
        }

        this.advanceTurn();
    }

    // Handle hovering over a cell
    private handleCellHover(enter: boolean, x: number, y: number): void {
        if (enter) {
            this.gameManager.addBoardHighlight(x, y);
        } else {
            this.gameManager.removeBoardHighlight(x, y);
        }
        this.updateView();
    }

    // Handle a click on a hand item
    private handleHandItemClick(index: number): void {
        this.gameManager.selectItemFromHand(index);
        this.updateView();
    }

    // Update the view and re-initialize listeners
    private updateView(): void {
        this.gameView.updateGrid();
        this.initHandItemListeners();
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
