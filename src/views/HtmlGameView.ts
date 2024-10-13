// HtmlGameView.ts
import { GameManager } from '../modules/GameManager';  // Import the GameManager class

export class HtmlGameView {
    private gameManager: GameManager;
    public document: Document;  // Make document public for the controller to access
    private appDiv: HTMLDivElement;

    constructor(gameManager: GameManager, document: Document) {
        this.gameManager = gameManager;
        this.document = document;
        this.appDiv = this.document.querySelector<HTMLDivElement>('#app')!;
    }

    // Method to create the grid HTML representation
    private renderGrid(): string {
        const gameSize = this.gameManager.gameBoard.size;
        let gridHtml = '<div class="grid">';

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
        gridHtml += '</div>';
        return gridHtml;
    }

    // Method to update the grid
    public updateGrid(): void {
        this.appDiv.innerHTML = `
            <h1>Game Grid</h1>
            ${this.renderGrid()}
            <button id="nextTurn" type="button">Next Turn</button>
        `;
    }
}
