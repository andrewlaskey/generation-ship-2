import { HandItem } from './PlayerHand';  
import { TileBlock } from './TileBlock';
import { Tile, TileType, TileState } from './Tile';
import seedrandom from 'seedrandom';

export class Deck {
    private items: HandItem[];
    private infinite: boolean;
    private random: () => number;  // Random function (either seeded or default)
    
    constructor(seed: string | null = null, infinite: boolean = false) {
        this.items = [];
        this.infinite = infinite;
        // Initialize the random function, with or without a seed
        this.random = seed ? seedrandom(seed) : Math.random;
    }

    getItems(): HandItem[] {
        return this.items
    }

    // Method to manually set items for testing
    setItems(items: HandItem[]): void {
        this.items = [...items];  // Clone the array to avoid mutation
    }

    // Shuffle the items in the deck and guarantee a different order
    shuffle(): void {
        let originalOrder = [...this.items];  // Copy of the original order
        
        do {
            for (let i = this.items.length - 1; i > 0; i--) {
                const j = Math.floor(this.random() * (i + 1));
                [this.items[i], this.items[j]] = [this.items[j], this.items[i]];
            }
        } while (this.isSameOrder(originalOrder, this.items));  // Keep shuffling if the order is the same
    }

    // Helper method to check if two arrays have the same order
    private isSameOrder(arr1: any[], arr2: any[]): boolean {
        if (arr1.length !== arr2.length) return false;
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) return false;
        }
        return true;
    }


    // Draw an item from the deck
    drawItem(): HandItem | null {
        if (this.items.length === 0) {
            return this.infinite ? this.generateNewItem() : null;
        }
        return this.items.shift() || null;
    }

    // Fill the deck with a specified number of random TileBlocks
    fillInitialDeck(initialSize: number): void {
        for (let i = 0; i < initialSize; i++) {
            const tileBlock = this.generateRandomTileBlock();
            this.items.push(tileBlock);
        }
    }

    // Add a new item to the deck
    addItem(item: HandItem): void {
        this.items.push(item);
    }

    // Generate a new TileBlock for infinite decks or deck initialization
    private generateNewItem(): HandItem {
        return this.generateRandomTileBlock();
    }

    // Generate a random TileBlock with random tile combinations
    private generateRandomTileBlock(): TileBlock {
        // Randomly choose tiles for the TileBlock (could be null)
        const tile1 = this.random() < 0.5 ? this.createRandomTile() : null;
        const tile2 = this.random() < 0.5 ? this.createRandomTile() : null;

        return new TileBlock([tile1, tile2]);
    }

    // Create a random tile (TileType, Level 1, Neutral State)
    private createRandomTile(): Tile {
        const tileTypes: TileType[] = [TileType.Tree, TileType.Farm, TileType.People, TileType.Power];
        const randomType = tileTypes[Math.floor(this.random() * tileTypes.length)];
        return new Tile(randomType, 1, TileState.Neutral);  // Default to Level 1 and Neutral state
    }

    // Get the current number of items in the deck
    getItemCount(): number {
        return this.items.length;
    }

    // Check if the deck is infinite
    isInfinite(): boolean {
        return this.infinite;
    }
}
