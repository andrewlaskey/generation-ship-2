import './style.css';
import { GameManager } from './modules/GameManager'; 
import { HtmlGameView } from './views/HtmlGameView';
import { HtmlGameController } from './controllers/HtmlGameController';

// Initialize the game board
const gameSize = 12;  // Size of the grid (e.g., 5x5)
const gameManager = new GameManager(gameSize, 40, 3, null, false);
const htmlGameView = new HtmlGameView(gameManager, document);

// // Available tile types to randomly assign
// const tileTypes: Array<'tree' | 'farm' | 'people' | 'power'> = ['tree', 'farm', 'people', 'power'];

// // Function to generate a random integer between min and max (inclusive)
// function getRandomInt(min: number, max: number): number {
//     return Math.floor(Math.random() * (max - min + 1)) + min;
// }

// // Function to initialize the game board with random tiles
// function initializeRandomTiles(gameManager: GameManager, gameSize: number): void {
//     for (let x = 0; x < gameSize; x++) {
//         for (let y = 0; y < gameSize; y++) {
//             const randomTileType = tileTypes[getRandomInt(0, tileTypes.length - 1)];
//             const randomLevel = 1;
//             const randomState = 'neutral'; // Start all tiles as neutral

//             // Place the random tile on the board
//             gameManager.gameBoard.placeTileAt(x, y, new Tile(randomTileType, randomLevel, randomState));
//         }
//     }
// }

// Initialize the game board with random tiles
// initializeRandomTiles(gameManager, gameSize);

// Render the initial game grid
htmlGameView.updateGrid();

// Initialize the controller to handle input and interaction
const htmlGameController = new HtmlGameController(gameManager, htmlGameView);