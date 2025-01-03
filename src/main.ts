import './style.css';
import { GameManager } from './modules/GameManager'; 
import { HtmlGameView } from './views/HtmlGameView';
import { HtmlGameController } from './controllers/HtmlGameController';
import { ThreeJSGameView } from './views/ThreeJSGameView';
import { ThreeJSGameController } from './controllers/ThreeJSGameController';
import { GameView } from './types/GameViewInterface';
import { FlyingGameView } from './views/FlyingGameView';
import { FlyingGameController } from './controllers/FlyingGameController';
import { MainMenuView } from './views/MainMenuView';
import { MainMenuController } from './controllers/MainMenuController';


let gameManager = new GameManager();

function loadGame(gameManager: GameManager, gameView: GameView) {
    gameManager.resetGame();
    gameView.updateGrid();
}

function switchView(appType: string) {
    console.log('loading...')
    let controller;
    let view: GameView;

    switch(appType) {
        case 'three':
            view = new ThreeJSGameView(gameManager, document);    
            loadGame(gameManager, view);
            controller = new ThreeJSGameController(gameManager, view as ThreeJSGameView);
            break;
        case 'flying':
            gameManager = new GameManager({
                initialDeckSize: 50,
                maxHandSize: 9,
                infiniteDeck: true,
                randomTileStates: true
            });
            view = new FlyingGameView(gameManager, document);
            loadGame(gameManager, view);
            controller = new FlyingGameController(gameManager, view as FlyingGameView);
            break;
        case 'daily':
            view = new HtmlGameView(gameManager, document);
            loadGame(gameManager, view);
            controller = new HtmlGameController(gameManager, view as HtmlGameView);
            break;
        default:
            view = new HtmlGameView(gameManager, document);
            loadGame(gameManager, view);
            controller = new HtmlGameController(gameManager, view as HtmlGameView);
    }
}

const mainMenu = new MainMenuView(document);
const mainMenuController = new MainMenuController(mainMenu, gameManager, switchView);