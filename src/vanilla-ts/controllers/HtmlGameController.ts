import { AutoPlayer, GameResults } from '../../modules/AutoPlayer';
import { GameManager, GameState } from '../../modules/GameManager';
import { UserScoreHistory } from '../../modules/UserScoreHistory';
import { SwitchViewFn } from '../../types/SwitchViewFn';
import { ViewController } from '../../types/ViewControllerInterface';
import { getCurrentDate } from '../../utils/getCurrentDate';
import { HtmlGameView } from '../views/HtmlGameView';

export class HtmlGameController implements ViewController {
  private gameManager: GameManager;
  private gameView: HtmlGameView;
  private selectedGridCell: { x: number; y: number } | null;
  private switchViewFn?: SwitchViewFn;
  private autoPlayer: AutoPlayer;
  private userScoreHistory: UserScoreHistory | undefined | null;

  constructor(
    gameManager: GameManager,
    gameView: HtmlGameView,
    fn?: SwitchViewFn,
    userScoreHistory?: UserScoreHistory
  ) {
    this.gameManager = gameManager;
    this.gameView = gameView;
    this.selectedGridCell = { x: 0, y: 0 };
    this.switchViewFn = fn;
    this.autoPlayer = new AutoPlayer(gameManager);
    this.userScoreHistory = userScoreHistory;
  }

  init(startGame?: boolean) {
    // Set up any input listeners
    this.initInputListeners();

    // Misc setup
    this.gameView.hideHistogram();

    // Start the game
    if (startGame) {
      this.gameManager.startGame();
    }

    this.updateView();
  }

  // Initialize event listeners for user input
  private initInputListeners(): void {
    const helpButton = this.gameView.document.querySelector<HTMLButtonElement>('#helpButton');
    const closeHelpButton = this.gameView.document.querySelector<HTMLButtonElement>('#closeHelp');
    const quitButton = this.gameView.document.querySelector<HTMLButtonElement>('#quitButton');

    // If the "Next Turn" button exists, add an event listener
    helpButton?.addEventListener('click', () => {
      this.gameView.showHelp();
    });
    closeHelpButton?.addEventListener('click', () => {
      this.gameView.hideHelp();
    });
    quitButton?.addEventListener('click', () => {
      this.gameManager.resetGame();

      if (this.switchViewFn) {
        this.switchViewFn('menu');
      }
    });

    // Initialize listeners on grid cells and hand items
    this.initGridCellListeners();
    this.initHandItemListeners();
    this.initPlayerActionListeners();
    this.initToolbarListeners();
  }

  private initToolbarListeners(): void {
    const flyingButton = this.gameView.document.querySelector<HTMLButtonElement>('#flying');
    const inspectModeButton =
      this.gameView.document.querySelector<HTMLButtonElement>('#inspectMode');
    const openScoreGraphButton =
      this.gameView.document.querySelector<HTMLButtonElement>('#openScoreGraph');

    flyingButton?.addEventListener('click', () => {
      if (this.switchViewFn) {
        this.switchViewFn('three');
      }
    });

    inspectModeButton?.addEventListener('click', () => {
      this.gameView.toggleScoreGraph(false);
      this.gameView.toggleInspectMode();

      if (this.selectedGridCell) {
        this.gameManager.removeBoardHighlight(this.selectedGridCell.x, this.selectedGridCell.y);
      }

      this.gameView.hidePlayerActions();
      this.updateView();
    });

    openScoreGraphButton?.addEventListener('click', () => {
      this.gameView.toggleInspectMode(false);
      this.gameView.toggleScoreGraph();

      if (this.selectedGridCell) {
        this.gameManager.removeBoardHighlight(this.selectedGridCell.x, this.selectedGridCell.y);
      }
      this.gameView.hidePlayerActions();
      this.updateView();
    });
  }

  // Initialize listeners for grid cell clicks
  private initGridCellListeners(): void {
    const gridCells = this.gameView.document.querySelectorAll<HTMLDivElement>('.grid .cell');
    gridCells.forEach(cell => {
      cell.addEventListener('click', event => {
        const { x, y } = this.getEventCellCoords(event);
        this.handleCellClick(x, y);
      });
      // cell.addEventListener('mouseover', (event) => {
      //     const { x, y } = this.getEventCellCoords(event);
      //     this.handleCellHover(true, x, y);
      // })
      // cell.addEventListener('mouseout', (event) => {
      //     const { x, y } = this.getEventCellCoords(event);
      //     this.handleCellHover(false, x, y);
      // })
    });
  }

  private getEventCellCoords(event: MouseEvent): { x: number; y: number } {
    const x = parseInt((event.currentTarget as HTMLElement).getAttribute('data-x')!);
    const y = parseInt((event.currentTarget as HTMLElement).getAttribute('data-y')!);
    return { x, y };
  }

  // Initialize listeners for hand item clicks
  private initHandItemListeners(): void {
    const handItems = this.gameView.document.querySelectorAll<HTMLDivElement>('.hand-item');
    handItems.forEach((item, index) => {
      item.addEventListener('click', () => this.handleHandItemClick(index));
    });
  }

  private initPlayerActionListeners(): void {
    const restartGameButton =
      this.gameView.document.querySelector<HTMLButtonElement>('#restartGame');
    const shareScoreButton = this.gameView.document.querySelector<HTMLButtonElement>('#shareScore');
    const playerActionAffirmative = this.gameView.document.querySelector<HTMLButtonElement>(
      '#player-action-affirmative'
    );
    const playerActionNegative =
      this.gameView.document.querySelector<HTMLButtonElement>('#player-action-negative');

    if (restartGameButton) {
      restartGameButton.addEventListener('click', () => {
        this.gameManager.resetGame();
        this.gameManager.startGame();
        this.gameView.hideHistogram();
        this.gameView.toggleScoreGraph(false);
        this.gameView.toggleInspectMode(false);
        this.gameView.hidePlayerActions();
        this.updateView();
      });
    }

    if (shareScoreButton) {
      shareScoreButton.addEventListener('click', async () => {
        const ecoScore = this.gameManager.getPlayerScore('ecology');
        const popScore = this.gameManager.getPlayerScore('population');
        const totalScore = this.gameManager.getCalculatedPlayerScore();
        const popup = shareScoreButton.children.namedItem('clipboardCopy');
        const popupDisplayDurationMs = 3 * 1000;

        try {
          const text = `Generation Ship 2 - Daily Challenge ${getCurrentDate()}
🌲 ${ecoScore.toLocaleString()}
👤 ${popScore.toLocaleString()}
🧮 ${totalScore.toLocaleString()}`;
          await navigator.clipboard.writeText(text);

          popup?.classList.add('active');

          setTimeout(() => {
            popup?.classList.remove('active');
          }, popupDisplayDurationMs);
        } catch (err) {
          console.error('Failed to copy text: ', err);
        }
      });
    }

    if (playerActionAffirmative) {
      playerActionAffirmative.addEventListener('click', () => {
        if (this.selectedGridCell) {
          const selectedHandIndex = this.gameManager.getSelectedItemIndex(); // Get selected item index from hand
          const success = this.gameManager.placeTileBlock(
            this.selectedGridCell.x,
            this.selectedGridCell.y,
            selectedHandIndex
          );

          if (!success) {
            console.error(
              `Failed to place tile block at (${this.selectedGridCell.x}, ${this.selectedGridCell.y}). Invalid placement or non-tile item.`
            );
            this.gameManager.removeBoardHighlight(this.selectedGridCell.x, this.selectedGridCell.y);
            this.gameView.hidePlayerActions();
            this.updateView();
          } else {
            this.gameManager.removeBoardHighlight(this.selectedGridCell.x, this.selectedGridCell.y);
            // Advance the players turn after making a placement
            this.advanceTurn();
          }
        }
      });
    }

    if (playerActionNegative) {
      playerActionNegative.addEventListener('click', () => {
        if (this.selectedGridCell) {
          this.gameManager.removeBoardHighlight(this.selectedGridCell.x, this.selectedGridCell.y);
          this.selectedGridCell = null;
        }
        this.gameView.hidePlayerActions();
        this.updateView();
      });
    }
  }

  // Handle a click on a grid cell
  private handleCellClick(x: number, y: number): void {
    if (this.gameView.getInspectMode()) {
      this.handleInspectCell(x, y);
    } else {
      this.handleTileBlockPlacementSelect(x, y);
    }

    this.updateView();
  }

  private handleTileBlockPlacementSelect(x: number, y: number): void {
    const shouldRotatePlacedTile =
      this.selectedGridCell && x == this.selectedGridCell.x && y == this.selectedGridCell.y;

    if (shouldRotatePlacedTile) {
      this.gameManager.rotateSelectedItem();
    } else {
      // place tile
      if (this.selectedGridCell) {
        // remove existing highlight before adding new one
        this.gameManager.removeBoardHighlight(this.selectedGridCell.x, this.selectedGridCell.y);
      }

      this.gameManager.addBoardHighlight(x, y);
      this.gameView.showPlayerActions();
    }

    // Update the selected cell position
    this.selectedGridCell = { x, y };
  }

  private handleInspectCell(x: number, y: number): void {
    if (this.selectedGridCell) {
      this.gameManager.removeBoardHighlight(this.selectedGridCell.x, this.selectedGridCell.y);
    }

    this.selectedGridCell = { x, y };

    const space = this.gameManager.gameBoard.getSpace(x, y);

    if (space) {
      // console.log(this.gameManager.gameBoard.getNeighborCounts(x, y));
      this.gameManager.addBoardHighlight(x, y);
      this.gameView.setInspectTileDetails(space.tile);
    } else {
      this.gameView.setInspectTileDetails(null);
    }
  }

  // Handle a click on a hand item
  private handleHandItemClick(index: number): void {
    const currentIndex = this.gameManager.getSelectedItemIndex();

    if (currentIndex === index) {
      this.gameManager.rotateSelectedItem();
    } else {
      this.gameManager.selectItemFromHand(index); // Select the clicked item from hand
    }

    this.updateView(); // Update the view to show the selected item
  }

  // Update the view and re-initialize listeners
  private updateView(): void {
    this.gameView.updateGrid();
    this.initHandItemListeners();
    this.initPlayerActionListeners();
  }

  // Handle advancing the turn
  public advanceTurn(): void {
    // Update the game state via GameManager
    this.gameManager.advanceTurn();
    this.gameView.hidePlayerActions();

    if (
      this.gameManager.state == GameState.Complete ||
      this.gameManager.state == GameState.GameOver
    ) {
      this.gameView.showPlayerActions();
      const finalScore = this.gameManager.getCalculatedPlayerScore();
      let allScores = [];

      if (this.gameView.gameType == 'daily') {
        allScores = this.userScoreHistory?.getFinalScoreHistory() ?? [];
        this.userScoreHistory?.saveGameResult({
          score: finalScore,
          result: this.gameManager.state,
        });
        this.gameView.showHistogram(allScores, finalScore);
      }
    }

    // Notify the view to re-render the updated game state
    this.updateView();
  }

  public drawItem(): void {
    this.gameManager.fillHand();
    this.updateView();
  }

  public rotateItem(): void {
    this.gameManager.rotateSelectedItem();
    this.updateView();
  }

  public generateHistogram(sampleSize = 10000): GameResults[] {
    const repeateGameManager = new GameManager({
      ...this.gameManager.options,
    });
    this.autoPlayer.updateManager(repeateGameManager);
    const results = this.autoPlayer.repeat(sampleSize);

    return results;
  }
}
