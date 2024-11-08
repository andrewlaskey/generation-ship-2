// Import necessary classes
import { GameBoard } from './GameBoard';
import { Tile } from './Tile';
import { BoardSpace } from './BoardSpace';
import { TileHandlerRegistry } from './TileHandlerRegistry';
import { PlayerHand, HandItem } from './PlayerHand';
import { Deck } from './Deck';
import { TileBlock } from './TileBlock';
import { ScoreObject } from './ScoreObject';

export type GameManagerOptions = {
 size: number;
 initialDeckSize: number;
 maxHandSize: number;
 seed?: string;
 infiniteDeck?: boolean;
}
export class GameManager {
    gameBoard: GameBoard;
    tileHandlerRegistry: TileHandlerRegistry;
    playerHand: PlayerHand;  // Player's hand
    deck: Deck;  // Deck for drawing HandItems
    playerScore: Record<string, ScoreObject>;
    options: GameManagerOptions;

    constructor(options: GameManagerOptions) {
        this.options = {
            infiniteDeck: false,
            ...options
        }
        this.gameBoard = new GameBoard(this.options.size);
        this.tileHandlerRegistry = new TileHandlerRegistry();
        this.playerHand = new PlayerHand(this.options.maxHandSize);  // Initialize the player's hand
        this.deck = new Deck(this.options.seed, this.options.infiniteDeck);  // Initialize the deck with seed and infinite options
        this.deck.fillInitialDeck(this.options.initialDeckSize);  // Fill the deck with initial items
        this.playerScore = {
            ecology: new ScoreObject('ecology', 0),
            population: new ScoreObject('population', 10)
        }
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
            console.warn("Deck is empty, cannot fill hand completely.");
            return false;  // No more items in the deck
        }
    
        const success = this.playerHand.addItem(item);
        if (!success) {
            console.error("Failed to add item to player hand.");
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
                console.error(e);  // Log the error and return false
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
        const size = this.gameBoard.size;
        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                this.updateSpace(x, y);
            }
        }
    }

    // Start a new game
    startGame(): void {
        this.updateBoard();
        this.fillHand();
        this.gameBoard.setStartingCondition();
    }

    resetGame(): void {
        this.gameBoard.clearBoard();
        this.playerHand.clearHand();
        this.deck.setItems([]);
        this.deck.fillInitialDeck(this.options.initialDeckSize);  // Fill the deck with initial items
        this.playerScore = {
            ecology: new ScoreObject('ecology', 0),
            population: new ScoreObject('population', 10)
        }
    }

    getPlayerScore(name: string): number {
        if (Object(this.playerScore).hasOwnProperty(name)) {
            return this.playerScore[name].value;
        }
        console.error(`No player score of ${name} exists`)
        return 0;
    }

    updatePlayerScore(): void {
        const tileTypeCounts = this.gameBoard.countTileTypes();

        if (tileTypeCounts.hasOwnProperty('tree')) {
            this.playerScore.ecology.update(tileTypeCounts['tree'])
        } else {
            this.playerScore.ecology.update(0);
        }

        if (tileTypeCounts.hasOwnProperty('people')) {
            this.playerScore.population.update(tileTypeCounts['people'])
        } else {
            this.playerScore.population.update(0);
        }
    }

    // Helper method to count specific types of neighbors
    countNeighbors(space: BoardSpace, types: string[]): number {
        const { x, y } = space;
        const neighbors = this.getNeighbors(x, y);
        return neighbors.reduce((count, neighborSpace) => {
            if (neighborSpace.tile && types.includes(neighborSpace.tile.type)) {
                count++;
            }
            return count;
        }, 0);
    }

    // Generic method to handle tile state transitions
    handleTileState(space: BoardSpace, thrivingCondition: boolean, strugglingCondition: boolean) {
        const tile = space.tile;

        if (!tile) return;

        // Going up a level if thriving
        if (thrivingCondition) {
            if (tile.state === 'neutral') {
                tile.state = 'healthy';  // Thriving: Change to healthy first
            } else if (tile.state === 'healthy') {
                tile.level = Math.min(3, tile.level + 1);  // After being healthy, go up a level
                tile.state = 'neutral';  // Reset to neutral after leveling up
            }
        }
        // Going down a level if struggling
        else if (strugglingCondition) {
            if (tile.state === 'neutral') {
                tile.state = 'unhealthy';  // Struggling: Change to unhealthy first
            } else if (tile.state === 'unhealthy') {
                if (tile.level > 1) {
                    tile.level -= 1;  // After being unhealthy, go down a level
                } else {
                    space.removeTile();  // If at level 1, the tile is removed
                }
                tile.state = 'neutral';  // Reset to neutral after going down or being removed
            }
        } else {
            tile.state = 'neutral';  // Stay neutral if no condition is met
        }
    }

    // Method to update space based on the tile type
    updateSpace(x: number, y: number): void {
        const space = this.gameBoard.getSpace(x, y);
        if (!space) return;

        if (space.tile) {
            const handler = this.tileHandlerRegistry.getHandler(space.tile.type);
            if (handler) {
                handler.updateState(space, this);  // Let the handler update the space based on the tile's type
            }
        } else {
            this.handleEmpty(space);  // Default behavior for empty spaces or unrecognized tile types
        }
    }

    // Method to handle logic for an empty space
    handleEmpty(space: BoardSpace): void {
        const treeCount = this.countNeighbors(space, ['tree']);
        const peopleCount = this.countNeighbors(space, ['people']);
        const powerCount = this.countNeighbors(space, ['power']);
        const farmCount = this.countNeighbors(space, ['farm']);

        if (treeCount >= 4) {
            space.placeTile(new Tile('tree', 1, 'neutral'));  // A tree starts growing
        } else if (peopleCount >= 1 && powerCount >= 1 && farmCount >= 2) {
            space.placeTile(new Tile('people', 1, 'neutral'));  // A settlement starts
        } else {
            // Keep the space empty
            space.removeTile()
        }
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
}
