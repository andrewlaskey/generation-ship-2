import { AutoPlayer } from '../../modules/AutoPlayer';
import { GameManager, GameState } from '../../modules/GameManager';
import { Tile, TileState, TileType } from '../../modules/Tile';
import { TileRuleConfig } from '../../modules/TileRules';
import { ViewController } from '../../types/ViewControllerInterface';
import { GridView } from '../views/GridView';

export class VisualAutoPlayerController implements ViewController {
  private gameManager: GameManager;
  private gridView: GridView;
  private autoPlayer: AutoPlayer;
  private numTrees: number;
  private updateIntervalSeconds = 1;
  private interval: NodeJS.Timeout | null;

  constructor(
    document: Document,
    selector: string,
    size: number,
    numTrees: number = 12,
    ruleConfig: Map<string, TileRuleConfig>
  ) {
    this.gameManager = new GameManager({
      size,
      maxHandSize: 1,
      infiniteDeck: true,
      ruleConfigs: ruleConfig,
    });
    this.gridView = new GridView(document, selector, this.gameManager.gameBoard);
    this.autoPlayer = new AutoPlayer(this.gameManager);
    this.numTrees = numTrees;
    this.interval = null;
  }

  init(startGame?: boolean): void {
    if (startGame) {
      this.setup();

      this.interval = setInterval(() => {
        this.update();
      }, 1000 * this.updateIntervalSeconds);
    }
  }

  update(): void {
    this.autoPlayer.nextMove();
    this.gridView.updateGrid();

    if (
      this.gameManager.state == GameState.Complete ||
      this.gameManager.state == GameState.GameOver
    ) {
      this.setup();
    }
  }

  setup(): void {
    this.autoPlayer.startNewGame();
    this.placeTrees(this.numTrees);
    this.gridView.updateGrid();
  }

  placeTrees(numTrees: number): void {
    const size = this.gameManager.options.size;

    for (let i = 0; i < numTrees; i++) {
      const x = Math.floor(Math.random() * size);
      const y = Math.floor(Math.random() * size);

      this.gameManager.gameBoard.placeTileAt(x, y, new Tile(TileType.Tree, 1, TileState.Neutral));
    }
  }

  stop(): void {
    this.autoPlayer.stop();
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}
