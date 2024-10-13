import { GameManager } from '../modules/GameManager';  // Import the GameManager class
import { HandItem } from '../modules/PlayerHand';  // Assuming HandItem is the base interface for items in the hand
import { TileBlock } from '../modules/TileBlock';
export class HtmlGameView {
    private gameManager: GameManager;
    public document: Document;  // Make document public for the controller to access
    private appDiv: HTMLDivElement;
    private gridContainer!: HTMLDivElement;
    private handContainer!: HTMLDivElement;
    private deckCounterContainer!: HTMLDivElement;

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
            <h1>Game Grid</h1>
            <div id="gridContainer" class="grid"></div>
            <div id="handContainer" class="hand"></div>
            <div id="deckCounterContainer" class="deck-counter"></div>
            <button id="nextTurn" type="button">Next Turn</button>
            <button id="drawItem" type="button">Draw Item</button>
        `;

        // Cache the containers for dynamic updates
        this.gridContainer = this.document.querySelector<HTMLDivElement>('#gridContainer')!;
        this.handContainer = this.document.querySelector<HTMLDivElement>('#handContainer')!;
        this.deckCounterContainer = this.document.querySelector<HTMLDivElement>('#deckCounterContainer')!;
    }

    // Method to create the grid HTML representation
    private renderGrid(): string {
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

                gridHtml += `<div class="cell ${tileType} ${tileState} l${tileLevel}" data-x="${x}" data-y="${y}"></div>`;
            }
            gridHtml += '</div>';
        }
        return gridHtml;
    }

    // Method to create the HTML representation of the player's hand
    private renderHand(): string {
        const handItems: HandItem[] = this.gameManager.getPlayerHand();
        let handHtml = '<h2>Player Hand</h2>';

        if (handItems.length === 0) {
            handHtml += '<p>No items in hand</p>';
        } else {
            handHtml += '<div class="hand-grid">';  // Add a container for the hand items
            handItems.forEach((item, index) => {
                if (item instanceof TileBlock) {
                    handHtml += `<div class="hand-item" data-index="${index}">`;  // Wrap each hand item
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
        return `<h2>Deck Size</h2><p>${deckCount} items left</p>`;
    }

    // Method to update the dynamic parts of the UI (grid, hand, deck counter)
    public updateGrid(): void {
        // Only update the dynamic parts, not the entire app container
        this.gridContainer.innerHTML = this.renderGrid();
        this.handContainer.innerHTML = this.renderHand();
        this.deckCounterContainer.innerHTML = this.renderDeckCounter();
    }
}
