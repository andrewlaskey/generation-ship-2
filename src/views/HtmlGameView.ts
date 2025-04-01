import { GameManager, GameState } from '../modules/GameManager'; // Import the GameManager class
import { HandItem } from '../modules/PlayerHand'; // Assuming HandItem is the base interface for items in the hand
import { TileBlock, TileBlockLayout } from '../modules/TileBlock';
import { GameView } from '../types/GameViewInterface';
import { ABOUT_HTML } from '../utils/constants';
import { Tile } from '../modules/Tile';
import { GridView } from './GridView';
import { getTileCellClassList } from '../utils/getTileCellClassList';
import { clearElementChildren, getRelativePosition, insertHtml } from '../utils/htmlUtils';
import { GraphsView, ScoreGraphLines } from './GraphsView';

export class HtmlGameView implements GameView {
  private gameManager: GameManager;
  private gridView: GridView;

  public document: Document;
  private appDiv: HTMLDivElement;
  private scoreBoard!: HTMLDivElement;
  private playerNotice!: HTMLDivElement;
  private playerActions!: HTMLDivElement;
  private aboutScreen!: HTMLDivElement;
  private placePreview!: HTMLDivElement;
  private toolbarDiv!: HTMLDivElement;
  private dynamicDisplayDiv!: HTMLDivElement;

  public gameType: 'daily' | 'custom';
  private isShowingPlayerAction: boolean;
  private inspectModeEnabled = false;
  private inspectTileDetails: Tile | null = null;
  private isShowingScoreGraph = false;

  private graphs: GraphsView;

  constructor(gameManager: GameManager, document: Document, gameType: 'daily' | 'custom') {
    this.gameManager = gameManager;
    this.document = document;
    this.appDiv = this.document.querySelector<HTMLDivElement>('#app')!;
    this.isShowingPlayerAction = false;
    this.gameType = gameType;
    this.graphs = new GraphsView(this.document);

    // Render static elements (like buttons) once during initialization
    this.initializeView();

    this.gridView = new GridView(document, '#gridContainer', this.gameManager.gameBoard);
  }

  // Method to initialize the static parts of the UI (buttons, containers, etc.)
  private initializeView(): void {
    this.appDiv.innerHTML = `
            <div class="html-game-view-wrapper">
                <div class="html-game-view-inner">
                    <div class="info-bar">
                        <div class="help">
                            <button class="button warn" id="quitButton">
                                <svg id="icon-arrow_back_ios" viewBox="0 0 24 24">
                                    <path d="M11.672 3.891l-8.109 8.109 8.109 8.109-1.781 1.781-9.891-9.891 9.891-9.891z"></path>
                                </svg>
                            </button>
                            <button class="button" id="helpButton">
                                <svg id="icon-info" viewBox="0 0 24 24">
                                    <path d="M12.984 9v-2.016h-1.969v2.016h1.969zM12.984 17.016v-6h-1.969v6h1.969zM12 2.016q4.125 0 7.055 2.93t2.93 7.055-2.93 7.055-7.055 2.93-7.055-2.93-2.93-7.055 2.93-7.055 7.055-2.93z"></path>
                                </svg>
                            </button>
                        </div>
                        <div id="scoreboard" class="scoreboard"></div>
                    </div>
                    <div class="grid-container">
                        <div class="grid-border">
                            <div class="grid-inner-wrap">
                                <div id="gridContainer" class="grid"></div>
                                <div id="placementPreview" class="tile-preview"></div>
                            </div>
                        </div>
                    </div>
                    <div class="game-updates">
                        <div id="playerNotice"></div>
                        <div id="playerActions" class="player-actions"></div>
                    </div>
                    <div class="dynamic-display" id="dynamicDisplay"></div>
                    <div class="toolbar" id="toolbar"></div>
                    <div id="about" class="about">
                        ${ABOUT_HTML}
                        <button class="button"  id="closeHelp">✓</button>
                    </div>
                </div>
            </div>
        `;

    // Cache the containers for dynamic updates
    this.scoreBoard = this.document.querySelector<HTMLDivElement>('#scoreboard')!;
    this.playerNotice = this.document.querySelector<HTMLDivElement>('#playerNotice')!;
    this.playerActions = this.document.querySelector<HTMLDivElement>('#playerActions')!;
    this.aboutScreen = this.document.querySelector<HTMLDivElement>('#about')!;
    this.placePreview = this.document.querySelector<HTMLDivElement>('#placementPreview')!;
    this.toolbarDiv = this.document.querySelector<HTMLDivElement>('#toolbar')!;
    this.dynamicDisplayDiv = this.document.querySelector<HTMLDivElement>('#dynamicDisplay')!;

    this.buildToolbar();
    this.buildDynamicDisplay();
    this.buildScoreBoard();
  }

  /**
   * Methods to set up the UI components
   */
  private buildToolbar(): void {
    const toolbarHtml = `
<h3>Tools</h3>
<div class="tools">
    <button class="button ${this.inspectModeEnabled ? 'enabled' : ''}" id="inspectMode">
        <svg id="icon-search" viewBox="0 0 32 32">
            <path d="M31.715 28.953c0.381 0.381 0.381 0.999 0 1.381l-1.381 1.381c-0.382 0.381-1 0.381-1.381 0l-9.668-9.668c-0.105-0.105-0.175-0.229-0.222-0.361-1.983 1.449-4.418 2.314-7.063 2.314-6.627 0-12-5.373-12-12s5.373-12 12-12c6.627 0 12 5.373 12 12 0 2.645-0.865 5.080-2.314 7.063 0.132 0.047 0.256 0.116 0.361 0.222l9.668 9.668zM12 4c-4.418 0-8 3.582-8 8s3.582 8 8 8 8-3.582 8-8c0-4.418-3.582-8-8-8z"></path>
        </svg>
    </button>
    <button class="button" id="flying">
        <svg id="icon-cube" viewBox="0 0 26 28">
            <path d="M14 25.453l10-5.453v-9.938l-10 3.641v11.75zM13 11.937l10.906-3.969-10.906-3.969-10.906 3.969zM26 8v12c0 0.734-0.406 1.406-1.047 1.75l-11 6c-0.297 0.172-0.625 0.25-0.953 0.25s-0.656-0.078-0.953-0.25l-11-6c-0.641-0.344-1.047-1.016-1.047-1.75v-12c0-0.844 0.531-1.594 1.313-1.875l11-4c0.219-0.078 0.453-0.125 0.688-0.125s0.469 0.047 0.688 0.125l11 4c0.781 0.281 1.313 1.031 1.313 1.875z"></path>
        </svg>
    </button>
    <button class="button ${this.isShowingScoreGraph ? 'enabled' : ''}" id="openScoreGraph">
        <svg viewBox="0 0 20 20">
            <path d="M0.69 11.331l1.363 0.338 1.026-1.611-1.95-0.482c-0.488-0.121-0.981 0.174-1.102 0.66-0.121 0.483 0.175 0.973 0.663 1.095zM18.481 11.592l-4.463 4.016-5.247-4.061c-0.1-0.076-0.215-0.133-0.338-0.162l-0.698-0.174-1.027 1.611 1.1 0.273 5.697 4.408c0.166 0.127 0.362 0.189 0.559 0.189 0.219 0 0.438-0.078 0.609-0.232l5.028-4.527c0.372-0.334 0.401-0.906 0.064-1.277s-0.911-0.4-1.284-0.064zM8.684 7.18l4.887 3.129c0.413 0.264 0.961 0.154 1.24-0.246l5.027-7.242c0.286-0.412 0.183-0.977-0.231-1.26-0.414-0.285-0.979-0.182-1.265 0.23l-4.528 6.521-4.916-3.147c-0.204-0.131-0.451-0.174-0.688-0.123-0.236 0.053-0.442 0.197-0.571 0.4l-7.497 11.767c-0.27 0.422-0.144 0.983 0.28 1.25 0.15 0.096 0.319 0.141 0.486 0.141 0.301 0 0.596-0.149 0.768-0.42l7.008-11z"></path>
        </svg>
    </button>
</div>
        `;

    insertHtml(toolbarHtml, this.toolbarDiv);
  }

  private buildDynamicDisplay(): void {
    const inspectModeHtml = `
<div class="inspect-window hidden">
    <h3>Inspect Mode</h3>
    <div class="cell-details">
        ${this.getTileDetailsHtml(this.inspectTileDetails)}
    </div>
</div>`;

    const scoreHistoryHtml = `
<div class="score-history-wrapper hidden">
    <h3>Score History</h3>
</div>`;

    const playerCardsHtml = `
<div class="card-display">
    <div id="handContainer" class="hand"></div>
    <div id="deckCounterContainer" class="deck-counter">
        <div class="deck"></div>
    </div>
</div>
`;

    const histogramHtml = `
<div class="histogram-wrapper hidden">
    <h3>Score Comparison</h3>
</div>
`;
    insertHtml(inspectModeHtml, this.dynamicDisplayDiv);
    insertHtml(scoreHistoryHtml, this.dynamicDisplayDiv);
    insertHtml(playerCardsHtml, this.dynamicDisplayDiv);
    insertHtml(histogramHtml, this.dynamicDisplayDiv);
  }

  private buildScoreBoard(): void {
    const html = `
<div class="score">
    <svg class="icon icon-leaf" viewBox="0 0 24 24">
        <path d="M20 11c0-4.9-3.499-9.1-8.32-9.983l-0.18-0.034-0.18 0.033c-4.821 0.884-8.32 5.084-8.32 9.984 0 4.617 3.108 8.61 7.5 9.795v1.205c0 0.553 0.448 1 1 1s1-0.447 1-1v-1.205c4.392-1.185 7.5-5.178 7.5-9.795zM12.5 18.7v-2.993l4.354-4.354c0.195-0.195 0.195-0.512 0-0.707s-0.512-0.195-0.707 0l-3.647 3.647v-3.586l2.354-2.354c0.195-0.195 0.195-0.512 0-0.707s-0.512-0.195-0.707 0l-1.647 1.647v-3.293c0-0.553-0.448-1-1-1s-1 0.447-1 1v3.293l-1.646-1.647c-0.195-0.195-0.512-0.195-0.707 0s-0.195 0.512 0 0.707l2.354 2.354v3.586l-3.646-3.646c-0.195-0.195-0.512-0.195-0.707 0s-0.195 0.512 0 0.707l4.354 4.354v2.992c-3.249-1.116-5.502-4.179-5.502-7.7 0-3.874 2.723-7.201 6.5-7.981 3.777 0.78 6.5 4.107 6.5 7.981 0 3.521-2.253 6.584-5.5 7.7z"></path>
    </svg>
    <span>${this.gameManager.getPlayerScore('ecology')}<span>
</div>
<div class="score">
    <svg class="icon icon-group" viewBox="0 0 24 24">
        <path d="M15.984 12.984q1.313 0 2.859 0.375t2.859 1.219 1.313 1.922v2.484h-6v-2.484q0-2.063-1.969-3.469 0.328-0.047 0.938-0.047zM8.016 12.984q1.313 0 2.859 0.375t2.836 1.219 1.289 1.922v2.484h-14.016v-2.484q0-1.078 1.313-1.922t2.859-1.219 2.859-0.375zM8.016 11.016q-1.219 0-2.109-0.891t-0.891-2.109 0.891-2.109 2.109-0.891 2.086 0.891 0.867 2.109-0.867 2.109-2.086 0.891zM15.984 11.016q-1.219 0-2.109-0.891t-0.891-2.109 0.891-2.109 2.109-0.891 2.109 0.891 0.891 2.109-0.891 2.109-2.109 0.891z"></path>
    </svg>
    <span>${this.gameManager.getPlayerScore('population')}</span>
</div>
`;
    insertHtml(html, this.scoreBoard);
  }

  /**
   * Methods to Update UI Components
   */
  public updateGrid(): void {
    // Only update the dynamic parts, not the entire app container
    this.gridView.updateGrid();

    this.placePreview.innerHTML = this.getPreviewTileHtml();
    this.setPreviewTile();

    this.updateDynamicDisplay();
    this.updateToolbar();
    this.updatePlayerHand();
    this.updateDeckCounter();
    this.updateScoreBoard();
    this.updatePlayerNotice();
    this.updatePlayerActions();
  }

  private updateToolbar(): void {
    const inspectButton = this.toolbarDiv.querySelector<HTMLButtonElement>('#inspectMode');
    const isShowingScoreGraphButton =
      this.toolbarDiv.querySelector<HTMLButtonElement>('#openScoreGraph');

    inspectButton?.classList.toggle('enabled', this.inspectModeEnabled);
    isShowingScoreGraphButton?.classList.toggle('enabled', this.isShowingScoreGraph);

    const hideToolbar =
      this.gameManager.state == GameState.Complete || this.gameManager.state == GameState.GameOver;
    this.toolbarDiv.classList.toggle('hidden', hideToolbar);
  }

  private updateDynamicDisplay(): void {
    const inspectWrapper = this.dynamicDisplayDiv.querySelector<HTMLDivElement>('.inspect-window');
    const scoreWrapper =
      this.dynamicDisplayDiv.querySelector<HTMLDivElement>('.score-history-wrapper');
    const playerCardsWrapper =
      this.dynamicDisplayDiv.querySelector<HTMLDivElement>('.card-display');

    inspectWrapper?.classList.toggle('hidden', !this.inspectModeEnabled);

    if (this.inspectModeEnabled) {
      const details = inspectWrapper?.querySelector<HTMLDivElement>('.cell-details');

      if (details) {
        clearElementChildren(details);
        insertHtml(this.getTileDetailsHtml(this.inspectTileDetails), details);
      }
    }

    const showScoreGraph =
      scoreWrapper &&
      (this.isShowingScoreGraph ||
        this.gameManager.state == GameState.Complete ||
        this.gameManager.state == GameState.GameOver);

    scoreWrapper?.classList.toggle('hidden', !showScoreGraph);

    if (showScoreGraph) {
      this.renderScoreGraph(scoreWrapper);
    }

    const hideCardsDisplay =
      this.gameManager.state == GameState.Complete ||
      this.gameManager.state == GameState.GameOver ||
      this.isShowingScoreGraph ||
      this.inspectModeEnabled;
    playerCardsWrapper?.classList.toggle('hidden', hideCardsDisplay);
  }

  private updatePlayerHand(): void {
    const wrapper = this.dynamicDisplayDiv.querySelector<HTMLDivElement>('#handContainer');

    if (!wrapper) return;

    const handItems: HandItem[] = this.gameManager.getPlayerHand();
    const selectedIndex = this.gameManager.getSelectedItemIndex();

    clearElementChildren(wrapper);

    if (handItems.length === 0) {
      wrapper.textContent = '<p>No items in hand</p>';
    } else {
      let handHtml = '<div class="hand-grid">'; // Add a container for the hand items
      handItems.forEach((item, index) => {
        if (item instanceof TileBlock) {
          const selectedClass = index === selectedIndex ? 'selected' : '';
          const layout = item.getLayout(); // Assuming TileBlock has a getLayout() method

          handHtml += `
<div class="hand-item ${selectedClass}" data-index="${index}">
    <div class="hand-row">
        <div class="${getTileCellClassList(layout.tiles[0])}"></div>
        <div class="${getTileCellClassList(layout.tiles[1])}"></div>
    </div>
</div>
`; // End of hand-item
        }
      });
      handHtml += '</div>'; // End of hand-grid

      insertHtml(handHtml, wrapper);
    }
  }

  // Method to display the total number of items left in the deck
  private updateDeckCounter(): void {
    const wrapper = this.dynamicDisplayDiv.querySelector<HTMLDivElement>('#deckCounterContainer');
    const deck = wrapper?.querySelector<HTMLDivElement>('.deck');

    if (!wrapper || !deck) return;

    const deckCount = this.gameManager.getDeckItemCount();

    deck.classList.toggle('is-empty', deckCount === 0);
    deck.textContent = `${deckCount}`;
  }

  private updateScoreBoard(): void {
    const scoreSpans = this.scoreBoard.querySelectorAll<HTMLDivElement>('.score span');
    const scores = [
      `${this.gameManager.getPlayerScore('ecology')}`,
      `${this.gameManager.getPlayerScore('population')}`,
    ];

    scoreSpans.forEach((span, index) => {
      span.textContent = scores[index];
    });
  }

  private updatePlayerNotice(): void {
    let html: string;

    switch (this.gameManager.state) {
      case GameState.GameOver:
        html = `
<h3>Game Over</h3>
<p>The ship's population has died.<br>It will continue to drift through space empty for eons.</p>
${this.finalPlayerScoreHtml()}
`;

        break;
      case GameState.Complete:
        html = `
                <h3>Success!</h3>
                <p>After centuries traveling through space the ship has reached a suitable planet for permanent colonization.</p>
                ${this.finalPlayerScoreHtml()}
                `;
        break;
      default:
        html = '';
    }

    clearElementChildren(this.playerNotice);
    insertHtml(html, this.playerNotice);
  }

  private finalPlayerScoreHtml(): string {
    const scoreElements = this.gameManager.getFinalPlayerScoreElements();
    let html = `<dl class="final-score-table">`;

    scoreElements.forEach((val, key) => {
      html += `<dt>${key}</dt><dd>${val}</dd>`;
    });

    html += `
        <dt>Total</dt><dd>${this.gameManager.getCalculatedPlayerScore()}
        </dl>`;

    return html;
  }

  private updatePlayerActions(): void {
    let html: string;

    if (this.isShowingPlayerAction) {
      switch (this.gameManager.state) {
        case GameState.GameOver:
          html = `
                <button class="button" id="restartGame">Restart</button>
                <a href="https://ko-fi.com/timbertales" class="button" target="_blank">Support the Game on Ko-fi</a>
                `;
          break;
        case GameState.Complete:
          html = '<button class="button" id="restartGame">Play Again</button>';

          if (this.gameType == 'daily') {
            html += `
                        <button class="button" id="shareScore">
                            <span>Share Score</span>
                            <span class="popup" id="clipboardCopy">Copied to clipboard!</span>
                        </button>
                        `;
          }

          html +=
            '<a href="https://ko-fi.com/timbertales" class="button" target="_blank">Support the Game</a>';
          break;
        default:
          html = `
            <div class="prompt">Confirm placement?</div>
            <button id="player-action-affirmative" class="button small btn-player-action">Yes</button>
            <span>/</span>
            <button id="player-action-negative" class="button small btn-player-action">No</button>
            `;
      }
    } else {
      html = '';
    }

    clearElementChildren(this.playerActions);
    insertHtml(html, this.playerActions);
  }

  /**
   * Misc and unorganized methods
   */
  private setPreviewTile(): void {
    const cells = this.gridView.div?.querySelectorAll<HTMLDivElement>('.cell');

    cells?.forEach(cellDiv => {
      if (this.gridView.div && cellDiv.classList.contains('highlight')) {
        const parent = this.gridView.div.parentElement;

        if (parent) {
          const position = getRelativePosition(cellDiv, parent);
          this.placePreview.style.top = `${position.top}px`;
          this.placePreview.style.left = `${position.left}px`;
        }
      }
    });
  }

  private getPreviewTileHtml(): string {
    if (!this.isShowingPlayerAction) {
      return '';
    }

    const handItems: HandItem[] = this.gameManager.getPlayerHand();
    const selectedIndex = this.gameManager.getSelectedItemIndex();
    const selectedItem = handItems[selectedIndex];

    if (!(selectedItem instanceof TileBlock)) {
      return '';
    }

    const layout: TileBlockLayout = selectedItem.getLayout(); // Assuming TileBlock has a getLayout() method
    const rotation: number = selectedItem.getRotation();

    return `
        <div class="preview-item">
                <div class="preview-item-inner ${layout.orientation} rotate-${rotation}">
                    ${this.getTileBlockHtml(layout, 'preview-item')}
                </div>
        </div>`;
  }

  private getTileBlockHtml(layout: TileBlockLayout, className: string): string {
    if (layout.orientation == 'horizontal') {
      return `
    <div class="${className}-row">
        <div class="${getTileCellClassList(layout.tiles[0])}"></div>
        <div class="${getTileCellClassList(layout.tiles[1])}"></div>
    </div>
`;
    }

    return `
    <div class="${className}-row">
        <div class="${getTileCellClassList(layout.tiles[0])}"></div>
    </div>
    <div class="${className}-row">
        <div class="${getTileCellClassList(layout.tiles[1])}"></div>
    </div>
`;
  }

  private getTileDetailsHtml(tile: Tile | null): string {
    if (tile) {
      return `
<ul>
    <li><strong>Type:</strong> ${tile.type}</li>
    <li><strong>Status:</strong> ${tile.state}</li>
    <li><strong>Level:</strong> ${tile.level}</li>
</ul>
`;
    }
    return 'Empty';
  }

  private renderScoreGraph(el: HTMLDivElement): void {
    const popScore = this.gameManager.getPlayerScoreObj('population');
    const ecoScore = this.gameManager.getPlayerScoreObj('ecology');

    const lines: ScoreGraphLines[] = [];

    if (popScore) {
      lines.push({
        score: popScore,
        color: 'steelblue',
      });
    }

    if (ecoScore) {
      lines.push({
        score: ecoScore,
        color: '#1b9416',
      });
    }

    this.graphs.appendScoreGraph(el, lines);
  }

  public showHelp(): void {
    this.aboutScreen.classList.add('is-visible');
  }

  public hideHelp(): void {
    this.aboutScreen.classList.remove('is-visible');
  }

  public showPlayerActions(): void {
    this.isShowingPlayerAction = true;
  }

  public hidePlayerActions(): void {
    this.isShowingPlayerAction = false;
  }

  public showHistogram(allScores: number[], score: number): void {
    const graph = this.dynamicDisplayDiv.querySelector<HTMLDivElement>('.histogram-wrapper');
    const caption = this.document.createElement('p');

    if (!graph) return;

    if (this.gameType == 'daily') {
      if (allScores.length === 0) {
        caption.textContent =
          'Not enough data to display graph.<br>Keep playing the daily challenge to see how you compare to past games.';
      } else {
        caption.textContent = `Today's score compared to your ${allScores.length} previous games.`;
      }
    } else {
      caption.textContent = `${allScores.length} random games with these settings.`;
    }

    this.graphs.appendHistogram(graph, allScores, score);
    graph.appendChild(caption);
    graph.classList.remove('hidden');
  }

  public hideHistogram(): void {
    const graph = this.dynamicDisplayDiv.querySelector<HTMLDivElement>('.histogram-wrapper');
    const histogram = graph?.querySelector<HTMLDivElement>('#histogram');

    if (graph && histogram) {
      graph.removeChild(histogram);
      graph.classList.add('hidden');
    }
  }

  public toggleInspectMode(optionalValue?: boolean) {
    this.inspectModeEnabled = optionalValue ?? !this.inspectModeEnabled;
  }

  public getInspectMode(): boolean {
    return this.inspectModeEnabled;
  }

  public setInspectTileDetails(tile: Tile | null): void {
    this.inspectTileDetails = tile;
    this.updateDynamicDisplay();
  }

  public toggleScoreGraph(optionalValue?: boolean) {
    this.isShowingScoreGraph = optionalValue ?? !this.isShowingScoreGraph;
  }

  public getScoreGraphVisibility(): boolean {
    return this.isShowingScoreGraph;
  }
}
