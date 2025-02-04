import { GameManager, GameState } from '../modules/GameManager';  // Import the GameManager class
import { HandItem } from '../modules/PlayerHand';  // Assuming HandItem is the base interface for items in the hand
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

    public gameType: 'daily' |'custom';
    private isShowingPlayerAction: boolean;
    private inspectModeEnabled = false;
    private inspectTileDetails: Tile | null = null;
    private isShowingScoreGraph = false;

    private graphs: GraphsView;

    constructor(gameManager: GameManager, document: Document, gameType: 'daily' |'custom') {
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
                            <button class="button warn" id="quitButton">⬅</button>
                            <button class="button" id="helpButton">⚙️</button>
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
    <button class="button ${this.inspectModeEnabled ? 'enabled' : '' }" id="inspectMode">🔎</button>
    <button class="button" id="flying">🚀</button>
    <button class="button ${this.isShowingScoreGraph ? 'enabled' : '' }" id="openScoreGraph">📈</button>
</div>
        `

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
`

        const histogramHtml = `
<div class="histogram-wrapper hidden">
    <h3>Score Comparison</h3>
</div>
`
        insertHtml(inspectModeHtml, this.dynamicDisplayDiv);
        insertHtml(scoreHistoryHtml, this.dynamicDisplayDiv);
        insertHtml(playerCardsHtml, this.dynamicDisplayDiv);
        insertHtml(histogramHtml, this.dynamicDisplayDiv);
    }

    private buildScoreBoard(): void {
        const html = `
<div class="score">🌲 ${this.gameManager.getPlayerScore('ecology')}</div>
<div class="score">👤 ${this.gameManager.getPlayerScore('population')}</div>
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
        const isShowingScoreGraphButton = this.toolbarDiv.querySelector<HTMLButtonElement>('#openScoreGraph');

        inspectButton?.classList.toggle('enabled', this.inspectModeEnabled);
        isShowingScoreGraphButton?.classList.toggle('enabled', this.isShowingScoreGraph);

        const hideToolbar = (this.gameManager.state == GameState.Complete || this.gameManager.state == GameState.GameOver);
        this.toolbarDiv.classList.toggle('hidden', hideToolbar);
    }

    private updateDynamicDisplay(): void {
        const inspectWrapper = this.dynamicDisplayDiv.querySelector<HTMLDivElement>('.inspect-window');
        const scoreWrapper = this.dynamicDisplayDiv.querySelector<HTMLDivElement>('.score-history-wrapper');
        const playerCardsWrapper = this.dynamicDisplayDiv.querySelector<HTMLDivElement>('.card-display');

        inspectWrapper?.classList.toggle('hidden', !this.inspectModeEnabled);

        if (this.inspectModeEnabled) {
            const details = inspectWrapper?.querySelector<HTMLDivElement>('.cell-details');

            if (details) {
                clearElementChildren(details);
                insertHtml(this.getTileDetailsHtml(this.inspectTileDetails), details);
            }
        }

        const showScoreGraph = (
            scoreWrapper && (
                this.isShowingScoreGraph ||
                this.gameManager.state == GameState.Complete ||
                this.gameManager.state == GameState.GameOver
            )
        );

        scoreWrapper?.classList.toggle('hidden', !showScoreGraph);
        
        if (showScoreGraph) {
            this.renderScoreGraph(scoreWrapper);
        }

        const hideCardsDisplay = (
            this.gameManager.state == GameState.Complete ||
            this.gameManager.state == GameState.GameOver ||
            this.isShowingScoreGraph ||
            this.inspectModeEnabled
        ); 
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
            let handHtml = '<div class="hand-grid">';  // Add a container for the hand items
            handItems.forEach((item, index) => {
                if (item instanceof TileBlock) {
                    const selectedClass = index === selectedIndex ? 'selected' : '';
                    const layout = item.getLayout();  // Assuming TileBlock has a getLayout() method
                    
                    handHtml += `
<div class="hand-item ${selectedClass}" data-index="${index}">
    <div class="hand-row">
        <div class="${getTileCellClassList(layout.tiles[0])}"></div>
        <div class="${getTileCellClassList(layout.tiles[1])}"></div>
    </div>
</div>
`;  // End of hand-item
                }
            });
            handHtml += '</div>';  // End of hand-grid

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
        const scoreDivs = this.scoreBoard.querySelectorAll<HTMLDivElement>('.score');
        const scores = [
            `🌲 ${this.gameManager.getPlayerScore('ecology')}`,
            `👤 ${this.gameManager.getPlayerScore('population')}`
        ]

        scoreDivs.forEach((div, index) => {
            div.textContent = scores[index]
        });
    }

    private updatePlayerNotice(): void {
        let html: string;

        switch(this.gameManager.state) {
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
            html += `<dt>${key}</dt><dd>${val}</dd>`
        });
        
        html += `
        <dt>Total</dt><dd>${this.gameManager.getCalculatedPlayerScore()}
        </dl>`;

        return html;
    }

    private updatePlayerActions(): void {
        let html: string;

        if (this.isShowingPlayerAction) {
            switch(this.gameManager.state) {
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

                    html += '<a href="https://ko-fi.com/timbertales" class="button" target="_blank">Support the Game</a>';
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
                    this.placePreview.style.top =  `${position.top}px`;
                    this.placePreview.style.left =  `${position.left}px`;
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
        
        const layout: TileBlockLayout = selectedItem.getLayout();  // Assuming TileBlock has a getLayout() method
        const rotation: number = selectedItem.getRotation();
                    
        return `
        <div class="preview-item">
                <div class="preview-item-inner ${layout.orientation} rotate-${rotation}">
                    ${this.getTileBlockHtml(layout, 'preview-item')}
                </div>
        </div>`
    }

    private getTileBlockHtml(layout: TileBlockLayout, className: string): string {
        if (layout.orientation == 'horizontal') {
            return `
    <div class="${className}-row">
        <div class="${getTileCellClassList(layout.tiles[0])}"></div>
        <div class="${getTileCellClassList(layout.tiles[1])}"></div>
    </div>
`
        }

            return `
    <div class="${className}-row">
        <div class="${getTileCellClassList(layout.tiles[0])}"></div>
    </div>
    <div class="${className}-row">
        <div class="${getTileCellClassList(layout.tiles[1])}"></div>
    </div>
`
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
        return 'Empty'
    }

    private renderScoreGraph(el: HTMLDivElement): void {
        const popScore = this.gameManager.getPlayerScoreObj('population');
        const ecoScore = this.gameManager.getPlayerScoreObj('ecology');

        const lines: ScoreGraphLines[] = []

        if (popScore) {
            lines.push({
                score: popScore,
                color: 'steelblue'
            });
        }

        if (ecoScore) {
            lines.push({
                score: ecoScore,
                color: '#1b9416'
            })
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
                caption.textContent = 'Not enough data to display graph.<br>Keep playing the daily challenge to see how you compare to past games.'
            } else {
                caption.textContent = `Today\'s score compared to your ${allScores.length} previous games.`
            }
        } else {
            caption.textContent = `${allScores.length} random games with these settings.`
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
