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
    }

    // Initialize event listeners for user input
    private initInputListeners(): void {
        const nextTurnButton = this.gameView.document.querySelector<HTMLButtonElement>('#nextTurn');
        const drawItemButton = this.gameView.document.querySelector<HTMLButtonElement>('#drawItem')
        
        // If the "Next Turn" button exists, add an event listener
        nextTurnButton?.addEventListener('click', () => this.advanceTurn());

        drawItemButton?.addEventListener('click', () => this.drawItem())
    }

    // Handle advancing the turn
    public advanceTurn(): void {
        // Update the game state via GameManager
        this.gameManager.updateBoard();
        
        // Notify the view to re-render the updated game state
        this.gameView.updateGrid();
    }

    // You can add more methods to handle other user inputs, like selecting tiles or interacting with the board
    public drawItem(): void {
        console.log('draw item click')
        this.gameManager.drawItemToHand()
        this.gameView.updateGrid()
    }
}
