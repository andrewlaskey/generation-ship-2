import './style.css';
import { GameManager } from './modules/GameManager';  // Import your GameManager class
import { Tile } from './modules/Tile';

// Initialize the game board
const gameSize = 5;  // Size of the grid (e.g., 5x5)
const gameManager = new GameManager(gameSize);

// Available tile types to randomly assign
const tileTypes: Array<'tree' | 'farm' | 'people' | 'power'> = ['tree', 'farm', 'people', 'power'];

// Function to generate a random integer between min and max (inclusive)
function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to initialize the game board with random tiles
function initializeRandomTiles(gameManager: GameManager, gameSize: number): void {
    for (let x = 0; x < gameSize; x++) {
        for (let y = 0; y < gameSize; y++) {
            const randomTileType = tileTypes[getRandomInt(0, tileTypes.length - 1)];
            const randomLevel = 1;
            const randomState = 'neutral'; // Start all tiles as neutral

            // Place the random tile on the board
            gameManager.gameBoard.placeTileAt(x, y, new Tile(randomTileType, randomLevel, randomState));
        }
    }
}

// Initialize the game board with random tiles
initializeRandomTiles(gameManager, gameSize);

// Function to create the grid HTML representation
function renderGrid(gameManager: GameManager): string {
    let gridHtml = '<div class="grid">';
    for (let x = 0; x < gameSize; x++) {
        gridHtml += '<div class="row">';
        for (let y = 0; y < gameSize; y++) {
          const space = gameManager.gameBoard.getSpace(x, y);
          const tile = space ? space.tile : undefined;
          const tileType = tile ? tile.type : 'empty';  // Fallback to 'empty' if there's no tile
          const tileLevel = tile ? tile.level : 0;      // Show level if tile exists
          const tileState = tile ? tile.state : 'neutral'; // Get the state (neutral, healthy, unhealthy)

          // Add tileType and state class to the div
          gridHtml += `<div class="cell ${tileType} ${tileState} l${tileLevel}" data-x="${x}" data-y="${y}"></div>`;
      }
        gridHtml += '</div>';
    }
    gridHtml += '</div>';
    return gridHtml;
}

// Function to update the grid
function updateGrid(): void {
    const appDiv = document.querySelector<HTMLDivElement>('#app')!;
    appDiv.innerHTML = `
        <h1>Game Grid</h1>
        ${renderGrid(gameManager)}
        <button id="nextTurn" type="button">Next Turn</button>
    `;

    // Add event listener to advance the game
    const nextTurnButton = document.querySelector<HTMLButtonElement>('#nextTurn');
    nextTurnButton?.addEventListener('click', () => {
        gameManager.updateBoard();  // Update the game board
        updateGrid();  // Re-render the updated grid
    });
}

// Initial render
updateGrid();
