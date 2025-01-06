import { GameResults } from '../modules/AutoPlayer';
import { GameManager, GameState } from '../modules/GameManager';  // Import the GameManager class
import { HandItem } from '../modules/PlayerHand';  // Assuming HandItem is the base interface for items in the hand
import { TileBlock } from '../modules/TileBlock';
import { GameView } from '../types/GameViewInterface';
import * as d3 from 'd3';
import { ABOUT_HTML } from '../utils/constants';
import { GameBoardRenderFn } from '../modules/GameBoard';
import { BoardSpace } from '../modules/BoardSpace';
import { Tile } from '../modules/Tile';
export class HtmlGameView implements GameView {
    private gameManager: GameManager;

    public document: Document;
    private appDiv: HTMLDivElement;
    private gridContainer!: HTMLDivElement;
    private scoreBoard!: HTMLDivElement;
    private playerNotice!: HTMLDivElement;
    private playerActions!: HTMLDivElement;
    private aboutScreen!: HTMLDivElement;
    private placePreview!: HTMLDivElement;
    private histogramDiv!: HTMLDivElement;
    private toolbarDiv!: HTMLDivElement;
    private dynamicDisplayDiv!: HTMLDivElement;

    public gameType: 'daily' |'custom';
    private isShowingPlayerAction: boolean;
    private  inspectModeEnabled = false;
    private inspectTileDetails: Tile | null = null;
    private showScoreGraph = false;

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
                        <button class="button warn" id="quitButton">⬅</button>
                        <button class="button" id="helpButton">⚙️</button>
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
                    <div class="histogram" id="histogram"></div>
                    <div id="playerActions" class="player-actions"></div>
                </div>
                <div class="dynamic-display" id="dynamicDisplay"></div>
                <div class="toolbar" id="toolbar"></div>
                <div id="about" class="about">
                    ${ABOUT_HTML}
                    <button class="button"  id="closeHelp">✓</button>
                </div>
            </div>
        `;

        // Cache the containers for dynamic updates
        this.gridContainer = this.document.querySelector<HTMLDivElement>('#gridContainer')!;
        this.scoreBoard = this.document.querySelector<HTMLDivElement>('#scoreboard')!;
        this.playerNotice = this.document.querySelector<HTMLDivElement>('#playerNotice')!;
        this.playerActions = this.document.querySelector<HTMLDivElement>('#playerActions')!;
        this.aboutScreen = this.document.querySelector<HTMLDivElement>('#about')!;
        this.placePreview = this.document.querySelector<HTMLDivElement>('#placementPreview')!;
        this.histogramDiv = this.document.querySelector<HTMLDivElement>('#histogram')!;
        this.toolbarDiv = this.document.querySelector<HTMLDivElement>('#toolbar')!;
        this.dynamicDisplayDiv = this.document.querySelector<HTMLDivElement>('#dynamicDisplay')!;

        this.gridContainer.innerHTML = this.initializeGridView();
    }

    private renderCell(row: number, col: number, space: BoardSpace): string {
        const tile = space ? space.tile : undefined;
        const tileType = tile ? tile.type : 'empty';
        const tileLevel = tile ? tile.level : 0;
        const tileState = tile ? tile.state : 'neutral';
        const highlight = space && space.isHighlighted ? 'highlight' : '';

        return `<div class="cell ${tileType} ${tileState} l${tileLevel} ${highlight}" data-x="${row}" data-y="${col}"></div>`;
    }

    // Method to create the grid HTML representation
    private initializeGridView(): string {
        const gameSize = this.gameManager.gameBoard.size;
        let gridHtml = '<div class="row">';
        
        const spaces = this.gameManager.gameBoard.getGrid<string>(this.renderCell);

        for (let i = 0; i < spaces.length; i++) {
            gridHtml += spaces[i];

            if (i + 1 == spaces.length) {
                gridHtml += '</div>';
            } else if ((i + 1) % gameSize == 0) {
                gridHtml += '</div><div class="row">'
            }
        }

        return gridHtml;
    }

    private renderGrid(): void {
        const updateCellFn: GameBoardRenderFn<void> = (row: number, col: number, space: BoardSpace): void => {
            const tile = space ? space.tile : undefined;
                const tileType = tile ? tile.type : 'empty';
                const tileLevel = tile ? `l${tile.level}` : 'l0';
                const tileState = tile ? tile.state : 'neutral';
                const isHighlighted = space && space.isHighlighted;
    
                // Find the cell element in the DOM
                const cell = this.document.querySelector<HTMLDivElement>(`.cell[data-x="${row}"][data-y="${col}"]`);
    
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
                        this.setPreviewTile(row, col);
                    } else {
                        cell.classList.remove('highlight');
                    }
                }
        }
    
        this.gameManager.gameBoard.getGrid(updateCellFn);
    }

    private renderDynamicDisplay(): void {
        this.dynamicDisplayDiv.innerHTML = '';

        if (this.inspectModeEnabled) {
            this.dynamicDisplayDiv.innerHTML = `
<h3>Inspect Mode</h3>
<div class="cell-details">
            ${this.renderTileDetails(this.inspectTileDetails)}
</div>`;
        } else if (this.showScoreGraph) {
            this.dynamicDisplayDiv.innerHTML = `<h3>Score History</h3><div class="score-graph" id="scoreGraph"></div>`;
            this.renderScoreGraph();
        }else {
            this.dynamicDisplayDiv.innerHTML = `
<div class="card-display">
    ${this.renderHand()}
    ${this.renderDeckCounter()}
</div>
`;
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
        let handHtml = '<div id="handContainer" class="hand">';

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

        handHtml += '</div>' // Close parent div

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
        return `<div id="deckCounterContainer" class="deck-counter"><div class="${classString}">${deckCount}</div></div>`;
    }

    private renderTileDetails(tile: Tile | null): string {
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
                <button class="button" id="restartGame">Restart</button>
                `;
                    break;
                case GameState.Complete:
                    this.playerActions.innerHTML = `
                <button class="button" id="restartGame">Play Again</button>
                <button class="button" id="shareScore">Share Score</button>
                ${this.gameType == 'daily' ? `<button class="button" id="shareScore">Share Score</button>` : ''}
                `;
                    break;
                default:
                    this.playerActions.innerHTML = `
            <div class="prompt">Confirm placement?</div>
            <button id="player-action-affirmative" class="button small btn-player-action">Yes</button>
            <span>/</span>
            <button id="player-action-negative" class="button small btn-player-action">No</button>
            `
            }
            
        } else {
            this.playerActions.innerHTML = '';
        }
    }

    private renderToolbar(): void {
        this.toolbarDiv.innerHTML = `
<h3>Tools</h3>
<div class="tools">
    <button class="button ${this.inspectModeEnabled ? 'enabled' : '' }" id="inspectMode">🔎</button>
    <button class="button" id="flying">🚀</button>
    <button class="button ${this.showScoreGraph ? 'enabled' : '' }" id="openScoreGraph">📈</button>
</div>
        `
    }

    private renderScoreGraph(): void {
        const popScore = this.gameManager.getPlayerScoreObj('population');
        const ecoScore = this.gameManager.getPlayerScoreObj('ecology');
        
        const popScoreHistory = popScore ? [...popScore.history, popScore.value] : [];
        const ecoScoreHistory = ecoScore ? [...ecoScore.history, ecoScore.value] : [];

        console.log(popScoreHistory, ecoScoreHistory);

        const minWidth = 320;
        const maxWidth = 420;
        const height = 100;
        const margin = 20;
    
        // Reference the parent container
        const parent = d3.select(`#scoreGraph`)
            .style('width', '100%')
            .style('max-width', `${maxWidth}px`)
            .style('min-width', `${minWidth}px`)
            .style('margin', '0 auto');
        
        const svg = parent.append('svg')
            .attr('viewBox', `0 0 ${maxWidth} ${height + (margin * 2)}`)
            .style('width', '100%') // Fully responsive
            .style('height', `${height + margin}px`) // Adjust height automatically
    
        const width = maxWidth - (margin * 2);

        const g = svg.append('g')
            .attr('transform', `translate(${margin}, ${margin})`);
    
        // Define scales
        const xScale = d3.scaleLinear()
            .domain([0, popScoreHistory.length - 1]) // Index of the array
            .range([0, width]);
    
        const yScale = d3.scaleLinear()
            .domain([
                0,
                d3.max([d3.max(popScoreHistory) as number, d3.max(ecoScoreHistory) as number]) as number ?? 0,
            ]) // Value of the array items
            .range([height, 0]);
    
        // Define line generators
        const line1 = d3.line<number>()
            .x((d, i) => xScale(i))
            .y((d) => yScale(d));
    
        const line2 = d3.line<number>()
            .x((d, i) => xScale(i))
            .y((d) => yScale(d));
    
        // Draw first line
        g.append('path')
            .datum(popScoreHistory)
            .attr('fill', 'none')
            .attr('stroke', 'steelblue')
            .attr('stroke-width', 2)
            .attr('d', line1);
    
        // Draw second line
        g.append('path')
            .datum(ecoScoreHistory)
            .attr('fill', 'none')
            .attr('stroke', '#1b9416')
            .attr('stroke-width', 2)
            .attr('d', line2);
    
        // Add x-axis
        g.append('g')
            .attr('transform', `translate(0, ${height})`)
            .call(d3.axisBottom(xScale).ticks(0))
            .attr('color', '#fff')
            .attr('font-size', '10px');
    
        // Add y-axis
        g.append('g')
            .call(d3.axisLeft(yScale).ticks(5))
            .attr('color', '#fff')
            .attr('font-size', '10px')
            .selectAll('.tick line')
            .remove(); 
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

        this.renderDynamicDisplay();
        this.renderToolbar();
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

    public showHistogram(sampleData: GameResults[], score: number): void {
        const minWidth = 320;
        const maxWidth = 800;
        const aspectRatio = 2; // Width-to-height ratio
        const margin = { top: 20, right: 30, bottom: 40, left: 50 };
        const numBins = 5;
    
        // Reference the parent container
        const parent = d3.select(`#${this.histogramDiv.id}`)
            .style('width', '100%') // Full width within the parent
            .style('max-width', `${maxWidth}px`)
            .style('min-width', `${minWidth}px`)
            .style('margin', '0 auto'); // Center on larger screens
    
        const svg = parent.append('svg')
            .attr('viewBox', `0 0 ${maxWidth} ${maxWidth / aspectRatio}`)
            .attr('preserveAspectRatio', 'xMidYMid meet') // Maintain aspect ratio
            .style('width', '100%') // Fully responsive
            .style('height', 'auto'); // Adjust height automatically
    
        const width = maxWidth - margin.left - margin.right;
        const height = maxWidth / aspectRatio - margin.top - margin.bottom;
    
        const data = sampleData.map(result => result.score);
    
        const g = svg.append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);
    
        const x = d3.scaleLinear()
            .domain([d3.min([...data, score]) as number, d3.max([...data, score]) as number]) // Input domain
            .range([0, width]); // Output range
    
        const histogram = d3.bin()
            .domain(x.domain() as [number, number]) // Set the domain of the histogram
            .thresholds(x.ticks(numBins)); // Number of bins
    
        const bins = histogram(data);
    
        const y = d3.scaleLinear()
            .domain([0, d3.max(bins, d => d.length) ?? 0]) // Set y scale domain
            .range([height, 0]);
    
        // Add bars
        g.selectAll('rect')
            .data(bins)
            .enter().append('rect')
            .attr('x', d => x(d.x0 ?? 0)) // Provide default for x0
            .attr('y', d => y(d.length ?? 0)) // Provide default for length
            .attr('width', d => x(d.x1 ?? 0) - x(d.x0 ?? 0) - 1) // Adjust for spacing
            .attr('height', d => height - y(d.length ?? 0)) // Ensure length is valid
            .attr('stroke', '#fff')
            .attr('stroke-width', 1);
    
        // Add x-axis
        g.append('g')
            .attr('transform', `translate(0, ${height})`)
            .call(d3.axisBottom(x))
            .attr('color', '#fff')
            .attr('font-size', '10px');
    
        // Add y-axis
        g.append('g')
            .call(d3.axisLeft(y))
            .attr('color', '#fff')
            .attr('font-size', '10px');
    
        // Draw a yellow line for the given score
        g.append('line')
            .attr('x1', x(score)) // Position at the score on the x-axis
            .attr('x2', x(score))
            .attr('y1', 0) // Start at the top of the graph
            .attr('y2', height) // End at the bottom of the graph
            .attr('stroke', '#ffbb00')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '4 2'); // Dashed for better visibility
    }

    public hideHistogram(): void {
        this.histogramDiv.innerHTML = '';
    }
    
    public toggleInspectMode(optionalValue?: boolean) {
        this.inspectModeEnabled = optionalValue ?? !this.inspectModeEnabled;
    }

    public setInspectTileDetails(tile: Tile | null): void {
        this.inspectTileDetails = tile;
    }

    public toggleScoreGraph(optionalValue?: boolean) {
        this.showScoreGraph = optionalValue ?? !this.showScoreGraph;
    }
}
