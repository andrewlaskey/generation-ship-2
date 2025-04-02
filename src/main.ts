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
import { LoadingIcon } from './modules/LoadingIcon';
import { ThreeTextureLibrary } from './modules/Three/ThreeTextureLibrary';
import { clearElementChildren } from './utils/htmlUtils';
import { TileConfigLoader } from './modules/TileConfigLoader';

let gameType: 'daily' | 'custom' = 'daily';

const localStorage = new LocalStorage(window.localStorage);
const userScoreHistory = new UserScoreHistory(localStorage);

const modelLibrary = new ThreeModelLibrary();
const textureLibrary = new ThreeTextureLibrary();
const tileRuleLoader = new TileConfigLoader();

const hasLoadedData = (): boolean =>
  modelLibrary.hasLoadedModels &&
  textureLibrary.hasLoadedTextures &&
  tileRuleLoader.configsLoaded();

const gameManager = new GameManager({ ruleConfigs: tileRuleLoader.getRules() });

const switchView: SwitchViewFn = async (
  viewName: string,
  newGametype?: 'daily' | 'custom'
): Promise<void> => {
  switch (viewName) {
    case 'menu': {
      const menuView = new MainMenuView(document, tileRuleLoader.getRules());
      const mainMenuController = new MainMenuController(menuView, gameManager, switchView);
      mainMenuController.init();
      break;
    }
    case 'three': {
      const threeJSView = new ThreeJSGameView(gameManager, document, modelLibrary, textureLibrary, {
        debug: false,
        fpsOn: false,
      });
      const threeJSController = new ThreeJSGameController(gameManager, threeJSView, switchView);
      threeJSController.init();
      break;
    }
    case 'flying': {
      const flyingView = new FlyingGameView(gameManager, document);
      const flyingController = new FlyingGameController(gameManager, flyingView, switchView);
      flyingController.init();
      break;
    }
    default: {
      let gameTypeUpdated = false;

      if (!hasLoadedData()) {
        console.log('Loading data');

        try {
          const appDiv = document.querySelector<HTMLDivElement>('#app')!;
          clearElementChildren(appDiv);
          const loading = new LoadingIcon(document, '#loading');

          await modelLibrary.loadModels();
          await textureLibrary.loadTextures();

          loading.remove();
        } catch (e) {
          console.error('Failed to load models and textures', e);
        }
      }

      if (newGametype) {
        gameType = newGametype;
        gameTypeUpdated = true;
        gameManager.resetGame();
      }

      const htmlView = new HtmlGameView(gameManager, document, gameType);
      htmlView.updateGrid();

      const htmlGameController = new HtmlGameController(
        gameManager,
        htmlView,
        switchView,
        userScoreHistory
      );
      htmlGameController.init(gameTypeUpdated);
      break;
    }
  }
};

async function start() {
  await tileRuleLoader.load();
}

start()
  .then(() => {
    switchView('menu');
  })
  .catch(error => {
    console.error(error);
  });
