import { GameManager } from '../modules/GameManager';  // Import the GameManager class
import { HandItem } from '../modules/PlayerHand';  // Assuming HandItem is the base interface for items in the hand
import { TileBlock } from '../modules/TileBlock';
import { GameView } from '../types/GameViewInterface';
export class HtmlGameView implements GameView {
    private gameManager: GameManager;
    public document: Document;  // Make document public for the controller to access
    private appDiv: HTMLDivElement;
    private gridContainer!: HTMLDivElement;
    private handContainer!: HTMLDivElement;
    private deckCounterContainer!: HTMLDivElement;
    private scoreBoard!: HTMLDivElement;

    constructor(gameManager: GameManager, document: Document) {
        this.gameManager = gameManager;
        this.document = document;
        this.appDiv = this.document.querySelector<HTMLDivElement>('#app')!;

        // Render static elements (like buttons) once during initialization
        this.initializeView();
    }

    // Method to initialize the static parts of the UI (buttons, containers, etc.)
    private initializeView(): void {
        this.appDiv.innerHTML = `
            <div id="scoreboard" class="scoreboard"></div>
            <div id="gridContainer" class="grid"></div>
            <div class="card-display">
                <div id="handContainer" class="hand"></div>
                <div id="deckCounterContainer" class="deck-counter"></div>
            </div>
        `;

        // Cache the containers for dynamic updates
        this.gridContainer = this.document.querySelector<HTMLDivElement>('#gridContainer')!;
        this.handContainer = this.document.querySelector<HTMLDivElement>('#handContainer')!;
        this.deckCounterContainer = this.document.querySelector<HTMLDivElement>('#deckCounterContainer')!;
        this.scoreBoard = this.document.querySelector<HTMLDivElement>('#scoreboard')!;

        this.gridContainer.innerHTML = this.initializeGridView();
    }

    // Method to create the grid HTML representation
    private initializeGridView(): string {
        const gameSize = this.gameManager.gameBoard.size;
        let gridHtml = '';

        for (let x = 0; x < gameSize; x++) {
            gridHtml += '<div class="row">';
            for (let y = 0; y < gameSize; y++) {
                const space = this.gameManager.gameBoard.getSpace(x, y);
                const tile = space ? space.tile : undefined;
                const tileType = tile ? tile.type : 'empty';
                const tileLevel = tile ? tile.level : 0;
                const tileState = tile ? tile.state : 'neutral';
                const highlight = space && space.isHighlighted ? 'highlight' : '';

                gridHtml += `<div class="cell ${tileType} ${tileState} l${tileLevel} ${highlight}" data-x="${x}" data-y="${y}"></div>`;
            }
            gridHtml += '</div>';
        }
        return gridHtml;
    }

    private renderGrid(): void {
        const gameSize = this.gameManager.gameBoard.size;
    
        // Loop over each cell in the game board
        for (let x = 0; x < gameSize; x++) {
            for (let y = 0; y < gameSize; y++) {
                const space = this.gameManager.gameBoard.getSpace(x, y);
                const tile = space ? space.tile : undefined;
                const tileType = tile ? tile.type : 'empty';
                const tileLevel = tile ? `l${tile.level}` : 'l0';
                const tileState = tile ? tile.state : 'neutral';
                const isHighlighted = space && space.isHighlighted;
    
                // Find the cell element in the DOM
                const cell = this.document.querySelector<HTMLDivElement>(`.cell[data-x="${x}"][data-y="${y}"]`);
    
                if (cell) {
                    // Update the class names based on the current state
                    cell.className = `cell ${tileType} ${tileState} ${tileLevel}`;
    
                    // Toggle the 'highlight' class based on the space's isHighlighted property
                    if (isHighlighted) {
                        cell.classList.add('highlight');
                    } else {
                        cell.classList.remove('highlight');
                    }
                }
            }
        }
    }
    

    // Method to create the HTML representation of the player's hand
    private renderHand(): string {
        const handItems: HandItem[] = this.gameManager.getPlayerHand();
        const selectedIndex = this.gameManager.getSelectedItemIndex();
        let handHtml = '';

        if (handItems.length === 0) {
            handHtml += '<p>No items in hand</p>';
        } else {
            handHtml += '<div class="hand-grid">';  // Add a container for the hand items
            handItems.forEach((item, index) => {
                if (item instanceof TileBlock) {
                    const selectedClass = index === selectedIndex ? 'selected' : '';
                    handHtml += `<div class="hand-item ${selectedClass}" data-index="${index}">`;  // Wrap each hand item
                    const layout = item.getLayout();  // Assuming TileBlock has a getLayout() method
                    
                    // Render each tile in the TileBlock
                    layout.forEach(row => {
                        handHtml += '<div class="hand-row">';
                        row.forEach(tile => {
                            const tileType = tile ? tile.type : 'empty';
                            const tileLevel = tile ? tile.level : 0;
                            const tileState = tile ? tile.state : 'neutral';
                            
                            handHtml += `<div class="cell ${tileType} ${tileState} l${tileLevel}"></div>`;
                        });
                        handHtml += '</div>';  // End of row
                    });

                    handHtml += '</div>';  // End of hand-item
                }
            });
            handHtml += '</div>';  // End of hand-grid
        }

        return handHtml;
    }


    // Method to display the total number of items left in the deck
    private renderDeckCounter(): string {
        const deckCount = this.gameManager.getDeckItemCount();
        let classString = 'deck';

        if (deckCount === 0) {
            classString += ' is-empty';
        }
        return `<div class="${classString}">${deckCount}</div>`;
    }

    private renderScoreBoard(): string {
        const ecoScore = `<div class="score">🌲 ${this.gameManager.getPlayerScore('ecology')}</div>`;
        const popScore = `<div class="score">👤 ${this.gameManager.getPlayerScore('population')}</div>`;
        return ecoScore + popScore;
    }

    // Method to update the dynamic parts of the UI (grid, hand, deck counter)
    public updateGrid(): void {
        // Only update the dynamic parts, not the entire app container
        this.renderGrid();
        this.handContainer.innerHTML = this.renderHand();
        this.deckCounterContainer.innerHTML = this.renderDeckCounter();
        this.scoreBoard.innerHTML = this.renderScoreBoard();
    }
}
