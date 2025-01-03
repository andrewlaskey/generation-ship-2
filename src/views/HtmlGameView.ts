import { GameManager, GameState } from '../modules/GameManager';  // Import the GameManager class
import { HandItem } from '../modules/PlayerHand';  // Assuming HandItem is the base interface for items in the hand
import { TileBlock } from '../modules/TileBlock';
import { GameView } from '../types/GameViewInterface';
export class HtmlGameView implements GameView {
    private gameManager: GameManager;
    public document: Document;  // Make document public for the controller to access
    private appDiv: HTMLDivElement;
    private gridContainer!: HTMLDivElement;
    private handContainer!: HTMLDivElement;
    private deckCounterContainer!: HTMLDivElement;
    private scoreBoard!: HTMLDivElement;
    private playerNotice!: HTMLDivElement;
    private playerActions!: HTMLDivElement;
    private aboutScreen!: HTMLDivElement;
    private placePreview!: HTMLDivElement;
    private isShowingPlayerAction: boolean;
    private gameType: 'daily' |'custom';

    constructor(gameManager: GameManager, document: Document, gameType: 'daily' |'custom') {
        this.gameManager = gameManager;
        this.document = document;
        this.appDiv = this.document.querySelector<HTMLDivElement>('#app')!;
        this.isShowingPlayerAction = false;
        this.gameType = gameType;

        // Render static elements (like buttons) once during initialization
        this.initializeView();

        this.animateFolksWalking();
        setInterval(this.animateFolksWalking, 1000 * 2);
    }

    // Method to initialize the static parts of the UI (buttons, containers, etc.)
    private initializeView(): void {
        this.appDiv.innerHTML = `
            <div class="html-game-view-wrapper">
                <div class="info-bar">
                    <div class="help">
                        <button id="quitButton">⬅</button>
                        <button id="helpButton">⚙️</button>
                    </div>
                    <div id="scoreboard" class="scoreboard"></div>
                </div>
                <div class="grid-wrapper">
                    <div class="grid-inner-wrap">
                        <div id="gridContainer" class="grid"></div>
                        <div id="placementPreview" class="tile-preview"></div>
                    </div>
                </div>
                <div class="game-updates">
                    <div id="playerNotice"></div>
                    <div id="playerActions" class="player-actions"></div>
                </div>
                <div class="card-display">
                    <div id="handContainer" class="hand"></div>
                    <div id="deckCounterContainer" class="deck-counter"></div>
                </div>
                <div id="about" class="about">
                    <h3>Goal</h3>
                    <p>For hundreds, possibly thousands of years, this ship will travel at sub-light speeds to a star system with a habitable world.</p>
                    <p>Your goal is to sustain a viable population and ecology that will be able to colonize the planet.</p>
                    <p>Place tiles on the grid to build the generation ship's resources. If the ship's population drops to zero, that is game over. Survive until there are no more tiles in the deck.<p>
                    <h3>Tiles</h3>
                    <dl>
                        <dt><span style="color: #1b9416; filter: saturate(300%);">ᚫ</span><dt>
                        <dd>Trees represent the natural ecology you want to transport to the destination world. They thrive when next to each other, but will die from overcrowding or too many people nearby.</dd>
                        <dt><span style="color: #7c4e10; filter: saturate(300%);">ᨊ</span><dt>
                        <dd>Habitats are where the human population lives. People require a balance of nature, farms, and power in order to grow.</dd>
                        <dt><span style="color: #ffd522; filter: saturate(300%);">፠</span><dt>
                        <dd>Farms are required to feed your population, and also depend on people to be maintained or improve. Farms can also suffer from overwilding if surrounded by too many trees.</dd>
                        <dt><span style="color: #3800ff; filter: saturate(300%);">ᚢ</span><dt>
                        <dd>Fusion reactor power stations allow your population centers to grow. They need people to maintain them and they can suffer if the grid is overloaded with too much nearby power.</dd>
                    </dl>
                    <button id="closeHelp">✓</button>
                </div>
            </div>
        `;

        // Cache the containers for dynamic updates
        this.gridContainer = this.document.querySelector<HTMLDivElement>('#gridContainer')!;
        this.handContainer = this.document.querySelector<HTMLDivElement>('#handContainer')!;
        this.deckCounterContainer = this.document.querySelector<HTMLDivElement>('#deckCounterContainer')!;
        this.scoreBoard = this.document.querySelector<HTMLDivElement>('#scoreboard')!;
        this.playerNotice = this.document.querySelector<HTMLDivElement>('#playerNotice')!;
        this.playerActions = this.document.querySelector<HTMLDivElement>('#playerActions')!;
        this.aboutScreen = this.document.querySelector<HTMLDivElement>('#about')!;
        this.placePreview = this.document.querySelector<HTMLDivElement>('#placementPreview')!;

        this.gridContainer.innerHTML = this.initializeGridView();
    }

    // Method to create the grid HTML representation
    private initializeGridView(): string {
        const gameSize = this.gameManager.gameBoard.size;
        let gridHtml = '';

        for (let x = 0; x < gameSize; x++) {
            gridHtml += '<div class="row">';
            for (let y = 0; y < gameSize; y++) {
                const space = this.gameManager.gameBoard.getSpace(x, y);
                const tile = space ? space.tile : undefined;
                const tileType = tile ? tile.type : 'empty';
                const tileLevel = tile ? tile.level : 0;
                const tileState = tile ? tile.state : 'neutral';
                const highlight = space && space.isHighlighted ? 'highlight' : '';

                gridHtml += `<div class="cell ${tileType} ${tileState} l${tileLevel} ${highlight}" data-x="${x}" data-y="${y}"></div>`;
            }
            gridHtml += '</div>';
        }
        return gridHtml;
    }

    private renderGrid(): void {
        const gameSize = this.gameManager.gameBoard.size;
    
        // Loop over each cell in the game board
        for (let x = 0; x < gameSize; x++) {
            for (let y = 0; y < gameSize; y++) {
                const space = this.gameManager.gameBoard.getSpace(x, y);
                const tile = space ? space.tile : undefined;
                const tileType = tile ? tile.type : 'empty';
                const tileLevel = tile ? `l${tile.level}` : 'l0';
                const tileState = tile ? tile.state : 'neutral';
                const isHighlighted = space && space.isHighlighted;
    
                // Find the cell element in the DOM
                const cell = this.document.querySelector<HTMLDivElement>(`.cell[data-x="${x}"][data-y="${y}"]`);
    
                if (cell) {
                    // Clean up any lingering people
                    cell.innerHTML = '';

                    // Update the class names based on the current state
                    cell.className = `cell ${tileType} ${tileState} ${tileLevel}`;

                    if (tile && tileType == 'people') {
                        const folkSpanHtml = '<span>⫯</span>';
                        cell.innerHTML = folkSpanHtml.repeat(tile.level * 2);
                    }
    
                    // Toggle the 'highlight' class based on the space's isHighlighted property
                    if (isHighlighted) {
                        cell.classList.add('highlight');
                        this.setPreviewTile(x, y);
                    } else {
                        cell.classList.remove('highlight');
                    }
                }
            }
        }
    }

    private animateFolksWalking() {
        const folkSpans = this.document.querySelectorAll<HTMLSpanElement>('.cell.people span');

        for (const span of folkSpans) {
            const x = Math.random() * 600 - 300; // Random x between -100 and 100
            const y = Math.random() * 200 - 100; // Random y between -100 and 100

            span.style.transform = `translate(${x}%, ${y}%)`;
        }
    }

    private setPreviewTile(row: number, col: number): void {
        this.placePreview.style.top = `calc(${row} * (3rem + 2px))`;
        this.placePreview.style.left = `calc(${col} * (3rem + 2px))`;
    }

    private renderPreviewTile(): string {
        if (!this.isShowingPlayerAction) {
            return '';
        }

        const handItems: HandItem[] = this.gameManager.getPlayerHand();
        const selectedIndex = this.gameManager.getSelectedItemIndex();
        const selectedItem = handItems[selectedIndex];

        if (!(selectedItem instanceof TileBlock)) {
            return '';
        }

        let previewHtml = '<div class="preview-item">';
        
        const layout = selectedItem.getLayout();  // Assuming TileBlock has a getLayout() method
                    
        // Render each tile in the TileBlock
        layout.forEach(row => {
            previewHtml += '<div class="preview-item-row">';
            row.forEach(tile => {
                const tileType = tile ? tile.type : 'empty';
                const tileLevel = tile ? tile.level : 0;
                const tileState = tile ? tile.state : 'neutral';
                
                previewHtml += `<div class="cell ${tileType} ${tileState} l${tileLevel}"></div>`;
            });
            previewHtml += '</div>';  // End of row
        });

        previewHtml += '</div>' // End of preview item

        return previewHtml;
    }
    

    // Method to create the HTML representation of the player's hand
    private renderHand(): string {
        if (this.gameManager.state != GameState.Playing) {
            return '';
        }

        const handItems: HandItem[] = this.gameManager.getPlayerHand();
        const selectedIndex = this.gameManager.getSelectedItemIndex();
        let handHtml = '';

        if (handItems.length === 0) {
            handHtml += '<p>No items in hand</p>';
        } else {
            handHtml += '<div class="hand-grid">';  // Add a container for the hand items
            handItems.forEach((item, index) => {
                if (item instanceof TileBlock) {
                    const selectedClass = index === selectedIndex ? 'selected' : '';
                    handHtml += `<div class="hand-item ${selectedClass}" data-index="${index}">`;  // Wrap each hand item
                    const layout = item.getLayout();  // Assuming TileBlock has a getLayout() method
                    
                    // Render each tile in the TileBlock
                    layout.forEach(row => {
                        handHtml += '<div class="hand-row">';
                        row.forEach(tile => {
                            const tileType = tile ? tile.type : 'empty';
                            const tileLevel = tile ? tile.level : 0;
                            const tileState = tile ? tile.state : 'neutral';
                            
                            handHtml += `<div class="cell ${tileType} ${tileState} l${tileLevel}"></div>`;
                        });
                        handHtml += '</div>';  // End of row
                    });

                    handHtml += '</div>';  // End of hand-item
                }
            });
            handHtml += '</div>';  // End of hand-grid
        }

        return handHtml;
    }


    // Method to display the total number of items left in the deck
    private renderDeckCounter(): string {
        if (this.gameManager.state != GameState.Playing) {
            return '';
        }

        const deckCount = this.gameManager.getDeckItemCount();
        let classString = 'deck';

        if (deckCount === 0) {
            classString += ' is-empty';
        }
        return `<div class="${classString}">${deckCount}</div>`;
    }

    private renderScoreBoard(): string {
        const ecoScore = `<div class="score">🌲 ${this.gameManager.getPlayerScore('ecology')}</div>`;
        const popScore = `<div class="score">👤 ${this.gameManager.getPlayerScore('population')}</div>`;
        return ecoScore + popScore;
    }

    private renderPlayerUpdates(): void {
        switch(this.gameManager.state) {
            case GameState.GameOver:
                this.playerNotice.innerHTML = `
<h3>Game Over</h3>
<p>The ship's population has died.<br>It will continue to drift through space empty for eons.</p>
<p>Final score: ${this.gameManager.getCalculatedPlayerScore()}</p>
`;
                this.showPlayerActions();
                break;
            case GameState.Complete:
                const ecoScore = this.gameManager.getPlayerScore('ecology');
                const popScore = this.gameManager.getPlayerScore('population');
                this.playerNotice.innerHTML = `
                <h3>Success!</h3>
                <p>After centuries traveling through space the ship has reached a suitable planet for permanent colonization.</p>
                <p>The colony will be seeded with ecological score of ${ecoScore} and a population of ${popScore}.</p>
                <p>Total score: ${this.gameManager.getCalculatedPlayerScore()}</p>
                `;
                this.showPlayerActions();
                break;
            default:
                this.playerNotice.innerHTML = '';
        }
    }

    private renderPlayerActions(): void {
        if (this.isShowingPlayerAction) {
            switch(this.gameManager.state) {
                case GameState.GameOver:
                    this.playerActions.innerHTML = `
                <button id="restartGame">Restart</button>
                `;
                    break;
                case GameState.Complete:
                    this.playerActions.innerHTML = `
                <button id="restartGame">Play Again</button>
                ${this.gameType == 'daily' ? `<button id="shareScore">Share Score</button>` : ''}
                `;
                    break;
                default:
                    this.playerActions.innerHTML = `
            <div class="prompt">Confirm placement?</div>
            <button id="player-action-affirmative" class="btn-player-action">Yes</button>
            <span>/</span>
            <button id="player-action-negative" class="btn-player-action">No</button>
            `
            }
            
        } else {
            this.playerActions.innerHTML = '';
        }
    }

    // Method to update the dynamic parts of the UI (grid, hand, deck counter)
    public updateGrid(): void {
        // Only update the dynamic parts, not the entire app container
        this.renderGrid();
        this.animateFolksWalking();
        this.scoreBoard.innerHTML = this.renderScoreBoard();
        this.renderPlayerUpdates();
        this.renderPlayerActions();
        this.placePreview.innerHTML = this.renderPreviewTile();
        this.handContainer.innerHTML = this.renderHand();
        this.deckCounterContainer.innerHTML = this.renderDeckCounter();
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
}
