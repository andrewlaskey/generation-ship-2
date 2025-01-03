import { GameManager } from '../modules/GameManager';
import { ViewController } from '../types/ViewControllerInterface';
import { getCurrentDate } from '../utils/getCurrentDate';
import { HtmlGameView } from '../views/HtmlGameView';

export class HtmlGameController implements ViewController {
    private gameManager: GameManager;
    private gameView: HtmlGameView;
    private selectedGridCell: { row: number; col: number};
    private switchViewFn?: (appType: string) => void;

    constructor(gameManager: GameManager, gameView: HtmlGameView, fn?: (appType: string) => void) {
        this.gameManager = gameManager;
        this.gameView = gameView;
        this.selectedGridCell = { row: 0, col: 0 };
        this.switchViewFn = fn;
    }

    init() {
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
        const helpButton = this.gameView.document.querySelector<HTMLButtonElement>('#helpButton');
        const closeHelpButton = this.gameView.document.querySelector<HTMLButtonElement>('#closeHelp');
        const quitButton = this.gameView.document.querySelector<HTMLButtonElement>('#quitButton');

        // If the "Next Turn" button exists, add an event listener
        nextTurnButton?.addEventListener('click', () => this.advanceTurn());
        drawItemButton?.addEventListener('click', () => this.drawItem());
        rotateItemButton?.addEventListener('click', () => this.rotateItem());
        helpButton?.addEventListener('click', () => {
            this.gameView.showHelp();
        })
        closeHelpButton?.addEventListener('click', () => {
            this.gameView.hideHelp();
        })
        quitButton?.addEventListener('click', () => {
            this.gameManager.resetGame();
            
            if (this.switchViewFn) {
                this.switchViewFn('menu');
            }
        })

        // Initialize listeners on grid cells and hand items
        this.initGridCellListeners();
        this.initHandItemListeners();
        this.initPlayerActionListeners();
    }

    // Initialize listeners for grid cell clicks
    private initGridCellListeners(): void {
        const gridCells = this.gameView.document.querySelectorAll<HTMLDivElement>('.grid .cell');
        gridCells.forEach(cell => {
            cell.addEventListener('click', (event) => {
                const { x, y } = this.getEventCellCoords(event);
                this.handleCellClick(x, y);
            });
            // cell.addEventListener('mouseover', (event) => {
            //     const { x, y } = this.getEventCellCoords(event);
            //     this.handleCellHover(true, x, y);
            // })
            // cell.addEventListener('mouseout', (event) => {
            //     const { x, y } = this.getEventCellCoords(event);
            //     this.handleCellHover(false, x, y);
            // })
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

    private initPlayerActionListeners(): void {
        const restartGameButton = this.gameView.document.querySelector<HTMLButtonElement>('#restartGame');
        const shareScoreButton = this.gameView.document.querySelector<HTMLButtonElement>('#shareScore');
        const playerActionAffirmative = this.gameView.document.querySelector<HTMLButtonElement>('#player-action-affirmative');
        const playerActionNegative = this.gameView.document.querySelector<HTMLButtonElement>('#player-action-negative');

        if (restartGameButton) {
            restartGameButton.addEventListener('click', () => {
                this.gameManager.resetGame();
                this.gameManager.startGame();
                this.updateView();
            })
        }

        if (shareScoreButton) {
            shareScoreButton.addEventListener('click', async () => {
                const ecoScore = this.gameManager.getPlayerScore('ecology');
                const popScore = this.gameManager.getPlayerScore('population');
                const totalScore = this.gameManager.getCalculatedPlayerScore();
                try {
                    const text = `Generation Ship 2 Daily Challenge ${getCurrentDate()}
🌲 ${ecoScore}
👤 ${popScore}
🧮 ${totalScore}`
                    await navigator.clipboard.writeText(text);
                    alert('Text copied to clipboard!');
                } catch (err) {
                    console.error('Failed to copy text: ', err);
                }
            });
        }

        if (playerActionAffirmative) {
            playerActionAffirmative.addEventListener('click', () => {
                const selectedHandIndex = this.gameManager.getSelectedItemIndex();  // Get selected item index from hand
                const success = this.gameManager.placeTileBlock(this.selectedGridCell.col, this.selectedGridCell.row, selectedHandIndex);
                
                if (!success) {
                    console.error(`Failed to place tile block at (${this.selectedGridCell.col}, ${this.selectedGridCell.row}). Invalid placement or non-tile item.`);
                }

                // Advance the players turn after making a placement
                this.advanceTurn();
            });
        }

        if (playerActionNegative) {
            playerActionNegative.addEventListener('click', () => {
                this.gameView.hidePlayerActions();
                this.updateView();
            })
        }
        
    }

    // Handle a click on a grid cell
    private handleCellClick(x: number, y: number): void {
        if (x == this.selectedGridCell.col && y == this.selectedGridCell.row) {
            this.gameManager.removeBoardHighlight(x, y);
            this.gameView.hidePlayerActions();
        } else {
            this.gameManager.removeBoardHighlight(this.selectedGridCell.col, this.selectedGridCell.row);
            this.gameManager.addBoardHighlight(x, y);
            this.gameView.showPlayerActions();
        }

        this.selectedGridCell.col = x;
        this.selectedGridCell.row = y;

        this.updateView();
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
        this.initPlayerActionListeners();
    }

    // Handle advancing the turn
    public advanceTurn(): void {
        // Update the game state via GameManager
        this.gameManager.advanceTurn();
        this.gameView.hidePlayerActions();
        
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
