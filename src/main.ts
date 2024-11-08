import './style.css';
import { GameManager } from './modules/GameManager'; 
import { HtmlGameView } from './views/HtmlGameView';
import { HtmlGameController } from './controllers/HtmlGameController';
import { ThreeJSGameView } from './views/ThreeJSGameView';
import { ThreeJSGameController } from './controllers/ThreeJSGameController';
import { GameView } from './types/GameViewInterface';


// Base UI Elements
const appSelectDropdown = document.querySelector<HTMLSelectElement>('#app-type')!;
const appLoadButton = document.querySelector<HTMLButtonElement>('#init-app')!;

// Initialize the game board
const gameSize = 12;  // Size of the grid (e.g., 5x5)
const gameManager = new GameManager({
    size: gameSize,
    initialDeckSize: 40,
    maxHandSize: 3
});


function loadGame(gameManager: GameManager, gameView: GameView) {
    gameManager.resetGame();
    gameView.updateGrid();
}


appLoadButton.addEventListener('click', () => {
    console.log('loading...')
    const appType = appSelectDropdown.value;
    let controller;
    let view: GameView;

    switch(appType) {
        case 'three':
            view = new ThreeJSGameView(gameManager, document);    
            loadGame(gameManager, view);
            controller = new ThreeJSGameController(gameManager, view as ThreeJSGameView);
            break;
        default:
            view = new HtmlGameView(gameManager, document);
            loadGame(gameManager, view);
            controller = new HtmlGameController(gameManager, view as HtmlGameView);
    }
})