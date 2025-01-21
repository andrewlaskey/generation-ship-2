import './style.css';
import { GameManager } from './modules/GameManager'; 
import { HtmlGameView } from './views/HtmlGameView';
import { HtmlGameController } from './controllers/HtmlGameController';
import { ThreeJSGameView } from './views/ThreeJSGameView';
import { ThreeJSGameController } from './controllers/ThreeJSGameController';
import { FlyingGameView } from './views/FlyingGameView';
import { FlyingGameController } from './controllers/FlyingGameController';
import { MainMenuView } from './views/MainMenuView';
import { MainMenuController } from './controllers/MainMenuController';
import { SwitchViewFn } from './types/SwitchViewFn';
import { LocalStorage } from './modules/LocalStorage';
import { UserScoreHistory } from './modules/UserScoreHistory';
import { ThreeModelLibrary } from './modules/Three/ThreeModelLibrary';


let gameManager = new GameManager();
let gameType: 'daily' | 'custom' = 'daily';

const localStorage = new LocalStorage(window.localStorage);
const userScoreHistory = new UserScoreHistory(localStorage);

const modelLibrary = new ThreeModelLibrary();

const switchView: SwitchViewFn = (viewName: string, newGametype?: 'daily' | 'custom') => {
    switch(viewName) {
        case 'menu':
            const menuView = new MainMenuView(document);
            const mainMenuController = new MainMenuController(menuView, gameManager, switchView);
            mainMenuController.init();
            break;
        case 'three':
            const threeJSView = new ThreeJSGameView(gameManager, document, modelLibrary, { debug: true });    
            const threeJSController = new ThreeJSGameController(gameManager, threeJSView, switchView);
            threeJSController.init();
            break;
        case 'flying':
            const flyingView = new FlyingGameView(gameManager, document);
            const flyingController = new FlyingGameController(gameManager, flyingView, switchView);
            flyingController.init();
            break;
        default:
            let gameTypeUpdated = false;

            if (newGametype) {
                gameType = newGametype;
                gameTypeUpdated = true;
                gameManager.resetGame();
            }

            let htmlView = new HtmlGameView(gameManager, document, gameType);
            htmlView.updateGrid();

            const htmlGameController = new HtmlGameController(gameManager, htmlView, switchView, userScoreHistory);
            htmlGameController.init(gameTypeUpdated);
    }
}

async function start() {
    try {
        await modelLibrary.loadModels();
        console.log(modelLibrary);
        switchView('menu');
    } catch (e) {
        console.error('Failed to start app', e);
    }
}

start().then(() => {
    console.log('Game Loaded')
})