// Import necessary classes
import { GameBoard } from './GameBoard';
import { TileState, TileType } from './Tile';
import { BoardSpace } from './BoardSpace';
import { TileHandlerRegistry } from './TileHandlerRegistry';
import { PlayerHand, HandItem } from './PlayerHand';
import { Deck } from './Deck';
import { TileBlock } from './TileBlock';
import { ScoreObject } from './ScoreObject';
import { ConsoleLogLevel } from '../types/ConsoleLogLevels';
import { SpaceUpdate } from './TileHandler';

export type GameManagerOptions = {
 size: number;
 initialDeckSize: number;
 maxHandSize: number;
 seed?: string;
 infiniteDeck?: boolean;
 randomTileStates?: boolean;
 freeplay?: boolean;
 logging?: boolean;
}

export enum GameState {
    Ready = 'ready',
    Playing = 'playing',
    GameOver = 'game over',
    Complete = 'complete'
}

export class GameManager {
    gameBoard: GameBoard;
    tileHandlerRegistry: TileHandlerRegistry;
    playerHand: PlayerHand;  // Player's hand
    deck: Deck;  // Deck for drawing HandItems
    playerScore: Record<string, ScoreObject>;
    options: GameManagerOptions;
    state: GameState;
    readonly optionDefaults: GameManagerOptions = {
        size: 9,
        initialDeckSize: 40,
        maxHandSize: 3,
        infiniteDeck: false,
        freeplay: false,
        logging: false
    }
    gameStartTime: number = Date.now();
    gameEndTime: number = Date.now();
    
    // private timeScoreFactor: number = 10;

    constructor(options?: Partial<GameManagerOptions>) {
        this.options = {
            ...this.optionDefaults,
            ...options
        }
        this.gameBoard = new GameBoard(this.options.size);
        this.tileHandlerRegistry = new TileHandlerRegistry();
        this.playerHand = new PlayerHand(this.options.maxHandSize);  // Initialize the player's hand
        this.deck = new Deck(this.options.seed, this.options.infiniteDeck, undefined, this.options.randomTileStates);  // Initialize the deck with seed and infinite options
        this.deck.fillInitialDeck(this.options.initialDeckSize);  // Fill the deck with initial items
        this.playerScore = {
            ecology: new ScoreObject('ecology', 0),
            population: new ScoreObject('population', 0)
        }
        this.state = GameState.Ready;
    }

    configGame(options: Partial<GameManagerOptions>) {
        this.options = {
            ...this.options,
            ...options
        }

        this.gameBoard = new GameBoard(this.options.size);
        this.tileHandlerRegistry = new TileHandlerRegistry();
        this.playerHand = new PlayerHand(this.options.maxHandSize);  // Initialize the player's hand
        this.deck = new Deck(this.options.seed, this.options.infiniteDeck, undefined, this.options.randomTileStates);  // Initialize the deck with seed and infinite options
        this.deck.fillInitialDeck(this.options.initialDeckSize);  // Fill the deck with initial items
        this.playerScore = {
            ecology: new ScoreObject('ecology', 0),
            population: new ScoreObject('population', 0)
        }
        this.state = GameState.Ready;
    }

    // Draw a new item from the deck into the player's hand
    drawItemToHand(): boolean {
        if (!this.playerHand.isFull()) {
            const item = this.deck.drawItem();
            if (item) {
                return this.playerHand.addItem(item);  // Add the item to the hand if there's room
            }
        }
        return false;
    }

    fillHand(): boolean {
        let handWasFilled = true;
    
        while (!this.playerHand.isFull()) {
            if (!this.tryToAddItemToHand()) {
                handWasFilled = false;
                break;
            }
        }
    
        return handWasFilled;
    }
    
    private tryToAddItemToHand(): boolean {
        const item = this.deck.drawItem();
    
        if (!item) {
            this.log('warn', "Deck is empty, cannot fill hand completely.");
            return false;  // No more items in the deck
        }
    
        const success = this.playerHand.addItem(item);
        if (!success) {
            this.log('error', "Failed to add item to player hand.");
            return false;
        }
    
        return true;
    }
    

    // Place a TileBlock from the player's hand onto the board
    placeTileBlock(x: number, y: number, handIndex: number): boolean {
        const handItem = this.playerHand.getItems()[handIndex];
        if (handItem instanceof TileBlock) {
            const tileBlock = handItem as TileBlock;
            try {
                tileBlock.placeOnGrid(x, y, this.gameBoard);  // Place the TileBlock on the game board
                this.playerHand.removeItem(handIndex);  // Remove the placed item from the hand
                return true;
            } catch (e) {
                this.log('error', e);  // Log the error and return false
                return false;
            }
        }
        return false;  // Return false if the hand item is not a TileBlock
    }

    addBoardHighlight(x: number, y: number, ): void {
        this.gameBoard.toggleSpaceHighlight(x, y, true);
    }
    
    removeBoardHighlight(x: number, y: number): void {
        this.gameBoard.toggleSpaceHighlight(x, y, false);
    }
    // Get the current state of the player's hand
    getPlayerHand(): HandItem[] {
        return this.playerHand.getItems();  // Return the items in the player's hand
    }


    // API for views to display the deck count (number of items remaining)
    getDeckItemCount(): number {
        return this.deck.getItemCount();
    }

    // Update the entire board (existing logic)
    updateBoard(): void {
        const updates: { x: number, y: number, update: SpaceUpdate }[] = [];
        const size = this.gameBoard.size;

        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                const result = this.getUpdateSpace(x, y);

                if (result) {
                    updates.push({
                        x,
                        y,
                        update: result
                    })
                }
            }
        }

        updates.forEach((updateAction) => {
            this.gameBoard.executeSpaceUpate(updateAction.x, updateAction.y, updateAction.update);
        });
    }

    // Start a new game
    startGame(): void {
        this.updateBoard();
        this.fillHand();
        this.gameBoard.setStartingCondition();
        this.updatePlayerScore();
        this.state = GameState.Playing;
        this.gameStartTime = Date.now();
    }

    resetGame(): void {
        this.gameBoard.clearBoard();
        this.playerHand.clearHand();
        this.deck.reset();
        this.deck.fillInitialDeck(this.options.initialDeckSize);  // Fill the deck with initial items
        this.playerScore = {
            ecology: new ScoreObject('ecology', 0),
            population: new ScoreObject('population', 0)
        }
        this.updatePlayerScore();
        this.state = GameState.Ready;

    }

    advanceTurn(): void {
        this.updateBoard();
        this.updatePlayerScore();
        this.fillHand();
        this.checkWinLossConditions();
    }

    checkWinLossConditions(): void {
        // Skip checking conditions if in freeplay mode
        if (this.options.freeplay) {
            return;
        }

        // Lose if population is zero
        const pop = this.getPlayerScore('population');

        if (pop <= 0) {
            this.state = GameState.GameOver;
            return; // skip other conditions;
        }

        // Game ends when player runs out of tiles to play
        const numTilesInHand = this.getPlayerHand().length;

        if (numTilesInHand <= 0) {
            this.state = GameState.Complete;
            return; // skip other conditions
        }

        if ([GameState.Complete, GameState.GameOver].includes(this.state)) {
            this.gameEndTime = Date.now();
        }
    }

    getPlayerScore(name: string): number {
        if (Object(this.playerScore).hasOwnProperty(name)) {
            return this.playerScore[name].value;
        }
        this.log('error', `No player score of ${name} exists`);
        return 0;
    }

    getPlayerScoreObj(name: string): ScoreObject | undefined {
        return this.playerScore[name];
    }

    updatePlayerScore(): void {
        const tileTypeCounts = this.gameBoard.countTileTypes(true);
        const peopleScoreMultiplier = 5;

        if (tileTypeCounts.hasOwnProperty('tree')) {
            this.playerScore.ecology.update(tileTypeCounts['tree'])
        } else {
            this.playerScore.ecology.update(0);
        }

        if (tileTypeCounts.hasOwnProperty('people')) {
            this.playerScore.population.update(tileTypeCounts['people'] * peopleScoreMultiplier)
        } else {
            this.playerScore.population.update(0);
        }
    }

    // Helper method to count specific types of neighbors
    countNeighbors(space: BoardSpace, types: string[], includeLevelInCount = false): number {
        const { x, y } = space;
        const neighbors = this.getNeighbors(x, y);
        return neighbors.reduce((count, neighborSpace) => {
            if (
                neighborSpace.tile && 
                types.includes(neighborSpace.tile.type) &&
                neighborSpace.tile.state != TileState.Dead
            ) {
                count += includeLevelInCount ? neighborSpace.tile.level : 1;
            }

            return count;
        }, 0);
    }

    // Method to update space based on the tile type
    getUpdateSpace(x: number, y: number): SpaceUpdate | null {
        const space = this.gameBoard.getSpace(x, y);

        if (space) {
            if (space.tile) {
                const handler = this.tileHandlerRegistry.getHandler(space.tile.type);
                
                if (handler) {
                    return handler.updateState(space, this);  // Let the handler update the space based on the tile's type
                }
            } else {
                const emptyHandler = this.tileHandlerRegistry.getHandler('empty');

                if (emptyHandler) {
                    return emptyHandler.updateState(space, this);
                }
            }
        }

        return null
    }

    // Method to get all neighboring spaces of a given space on the gameboard
    getNeighbors(x: number, y: number): BoardSpace[] {
        const neighbors: BoardSpace[] = [];
        const directions = [
            [-1, 0], [1, 0], [0, -1], [0, 1], // Cardinal directions (N, S, W, E)
            [-1, -1], [1, 1], [-1, 1], [1, -1] // Diagonal directions
        ];

        directions.forEach(([dx, dy]) => {
            const neighbor = this.gameBoard.getSpace(x + dx, y + dy);
            if (neighbor) {
                neighbors.push(neighbor);
            }
        });

        return neighbors;
    }

    selectItemFromHand(index: number): void {
        this.playerHand.selectItem(index)
    }

    getSelectedItemIndex(): number {
        return this.playerHand.getSelectedItemIndex();
    }

    rotateSelectedItem(): void {
        this.playerHand.rotateSelected();
    }

    getFinalPlayerScoreElements(): Map<string, number> {
        const scoreElements = new Map<string, number>();
        const eco = this.getPlayerScore('ecology');
        const pop = this.getPlayerScore('population');
        const tileTypeCounts = this.gameBoard.countTileTypes();
        const baseScoreMultiplier = 100;
        const wastePenaltyMultiplier = -10;
        const ecoRatioMultiplier = 1000;
        const ecoRatioNoPopBase = 100;

        scoreElements.set('Base', baseScoreMultiplier * (eco + pop));

        scoreElements.set(
            'Ecology ratio bonus',
            pop > 0 ? Math.round(ecoRatioMultiplier * (eco / pop)) : ecoRatioNoPopBase
        );

        scoreElements.set('Remaining deck penalty', this.getDeckItemCount() * -1);

        if (tileTypeCounts.hasOwnProperty(TileType.Waste)) {
            const wasteCount = tileTypeCounts[TileType.Waste];

            scoreElements.set('Waste tiles penalty', wasteCount * wastePenaltyMultiplier);
        }

        return scoreElements;
    }

    getCalculatedPlayerScore(): number {
        let score = 0;
        const elements = this.getFinalPlayerScoreElements();
        
        for (const num of elements.values()) {
            score += num;
        }

        return score;
    }

    getGameDurationMs(): number {
        if (this.state == GameState.Playing) {
            return this.gameStartTime - Date.now();
        }

        return this.gameStartTime - this.gameEndTime;
    }

    log(logLevel: ConsoleLogLevel, msg: string | unknown): void {
        if (this.options.logging) {
            console[logLevel](msg);
        }
    }
}
