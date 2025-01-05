import './style.css';
import { GameManager } from './modules/GameManager'; 
import { HtmlGameView } from './views/HtmlGameView';
import { HtmlGameController } from './controllers/HtmlGameController';
// import { ThreeJSGameView } from './views/ThreeJSGameView';
// import { ThreeJSGameController } from './controllers/ThreeJSGameController';
import { GameView } from './types/GameViewInterface';
import { FlyingGameView } from './views/FlyingGameView';
import { FlyingGameController } from './controllers/FlyingGameController';
import { MainMenuView } from './views/MainMenuView';
import { MainMenuController } from './controllers/MainMenuController';
import { ViewController } from './types/ViewControllerInterface';
import { SwitchViewFn } from './types/SwitchViewFn';


let gameManager = new GameManager();
let gameType: 'daily' | 'custom' = 'daily';

const switchView: SwitchViewFn = (viewName: string, newGametype?: 'daily' | 'custom') => {
    console.log('loading...')

    switch(viewName) {
        case 'menu':
            const menuView = new MainMenuView(document);
            const mainMenuController = new MainMenuController(menuView, gameManager, switchView);
            mainMenuController.init();
            break;
        // case 'three':
        //     view = new ThreeJSGameView(gameManager, document);    
        //     loadGame(gameManager, view);
        //     controller = new ThreeJSGameController(gameManager, view as ThreeJSGameView);
        //     break;
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

            const htmlGameController = new HtmlGameController(gameManager, htmlView, switchView);
            htmlGameController.init(gameTypeUpdated);
    }
}

switchView('menu');