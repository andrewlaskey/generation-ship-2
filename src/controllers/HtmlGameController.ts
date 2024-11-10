import { GameManager } from '../modules/GameManager';
import { HtmlGameView } from '../views/HtmlGameView';

export class HtmlGameController {
    private gameManager: GameManager;
    private gameView: HtmlGameView;

    constructor(gameManager: GameManager, gameView: HtmlGameView) {
        this.gameManager = gameManager;
        this.gameView = gameView;

        // Set up any input listeners
        this.initInputListeners();

        // Start the game
        this.gameManager.startGame();
        this.updateView();
    }

    // Initialize event listeners for user input
    private initInputListeners(): void {
        const nextTurnButton = this.gameView.document.querySelector<HTMLButtonElement>('#nextTurn');
        const drawItemButton = this.gameView.document.querySelector<HTMLButtonElement>('#drawItem');
        const rotateItemButton = this.gameView.document.querySelector<HTMLButtonElement>('#rotateItem');
        
        // If the "Next Turn" button exists, add an event listener
        nextTurnButton?.addEventListener('click', () => this.advanceTurn());
        drawItemButton?.addEventListener('click', () => this.drawItem());
        rotateItemButton?.addEventListener('click', () => this.rotateItem());

        // Initialize listeners on grid cells and hand items
        this.initGridCellListeners();
        this.initHandItemListeners();
    }

    // Initialize listeners for grid cell clicks
    private initGridCellListeners(): void {
        const gridCells = this.gameView.document.querySelectorAll<HTMLDivElement>('.grid .cell');
        gridCells.forEach(cell => {
            cell.addEventListener('click', (event) => {
                const { x, y } = this.getEventCellCoords(event);
                this.handleCellClick(x, y);
            });
            cell.addEventListener('mouseover', (event) => {
                const { x, y } = this.getEventCellCoords(event);
                this.handleCellHover(true, x, y);
            })
            cell.addEventListener('mouseout', (event) => {
                const { x, y } = this.getEventCellCoords(event);
                this.handleCellHover(false, x, y);
            })
        });
    }

    private getEventCellCoords(event: MouseEvent): { x: number, y: number } {
        const x = parseInt((event.currentTarget as HTMLElement).getAttribute('data-x')!);
        const y = parseInt((event.currentTarget as HTMLElement).getAttribute('data-y')!);
        return { x, y};
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
        const selectedHandIndex = this.gameManager.getSelectedItemIndex();  // Get selected item index from hand
        const success = this.gameManager.placeTileBlock(x, y, selectedHandIndex);
        
        if (!success) {
            console.error(`Failed to place tile block at (${x}, ${y}). Invalid placement or non-tile item.`);
        }

        // Advance the players turn after making a placement
        this.advanceTurn();
    }

    // Handle a click on a hand item
    private handleHandItemClick(index: number): void {
        const currentIndex = this.gameManager.getSelectedItemIndex();

        if (currentIndex === index) {
            this.gameManager.rotateSelectedItem();
        } else {
            this.gameManager.selectItemFromHand(index);  // Select the clicked item from hand
        }
        
        this.updateView();  // Update the view to show the selected item
    }

    // Update the view and re-initialize listeners
    private updateView(): void {
        this.gameView.updateGrid();
        this.initHandItemListeners();  // Re-initialize the hand item listeners after re-render
    }

    private handleCellHover(enter: boolean, x: number, y: number): void {
        if (enter) {
            this.gameManager.addBoardHighlight(x, y);
        } else {
            this.gameManager.removeBoardHighlight(x, y);
        }
        this.updateView();
    }

    // Handle advancing the turn
    public advanceTurn(): void {
        // Update the game state via GameManager
        this.gameManager.updateBoard();

        // Update the player's score
        this.gameManager.updatePlayerScore();

        // Update the player's hand
        this.gameManager.fillHand();
        
        // Notify the view to re-render the updated game state
        this.updateView();
    }

    public drawItem(): void {
        console.log('draw item click');
        this.gameManager.fillHand();
        this.updateView();
    }

    public rotateItem(): void {
        this.gameManager.rotateSelectedItem();
        this.updateView();
    }
}
