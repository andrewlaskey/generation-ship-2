import { HandItem } from './PlayerHand';
import { TileBlock } from './TileBlock';
import { Tile, TileType, TileState } from './Tile';
import seedrandom from 'seedrandom';

// Tile probability configuration type
export type TileProbability = {
  [key in Exclude<TileType, TileType.Waste> | 'null']: number;
};

export class Deck {
  private items: HandItem[];
  private infinite: boolean;
  private randomFn = Math.random; // Random function (either seeded or default)
  private tileProbability: TileProbability;
  private randomTileState: boolean;
  private seed: string | null;

  constructor(
    seed: string | null = null,
    infinite: boolean = false,
    probabilityConfig?: TileProbability,
    randomTileState?: boolean
  ) {
    this.items = [];
    this.infinite = infinite;
    // Default probability configuration
    this.tileProbability = probabilityConfig ?? {
      tree: 0.3,
      farm: 0.2,
      people: 0.2,
      power: 0.2,
      null: 0.1, // Default probability for null (empty space)
    };
    this.randomTileState = randomTileState ?? false;
    this.seed = seed;

    this.setRandomFn();
  }

  reset(): void {
    this.setItems([]);
    this.setRandomFn();
  }

  setRandomFn(): void {
    this.randomFn = this.seed ? seedrandom(this.seed) : Math.random;
  }

  getItems(): HandItem[] {
    return this.items;
  }

  // Method to manually set items for testing
  setItems(items: HandItem[]): void {
    this.items = [...items]; // Clone the array to avoid mutation
  }

  // Shuffle the items in the deck and guarantee a different order
  shuffle(): void {
    const originalOrder = [...this.items]; // Copy of the original order

    do {
      for (let i = this.items.length - 1; i > 0; i--) {
        const j = Math.floor(this.randomFn() * (i + 1));
        [this.items[i], this.items[j]] = [this.items[j], this.items[i]];
      }
    } while (this.isSameOrder(originalOrder, this.items)); // Keep shuffling if the order is the same
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

  // Generate a random TileBlock with configurable probabilities
  private generateRandomTileBlock(): TileBlock {
    // Randomly choose tiles for the TileBlock based on the probabilities
    const tile1 = this.randomTileOrNull();
    const tile2 = this.randomTileOrNull();

    return new TileBlock([tile1, tile2]);
  }

  // Generate a random tile or null based on the probabilities
  private randomTileOrNull(): Tile | null {
    let rand = this.randomFn();
    for (const key in this.tileProbability) {
      const prob = this.tileProbability[key as keyof TileProbability];
      if (rand < prob) {
        return key === 'null' ? null : this.createRandomTile(key as TileType);
      }
      rand -= prob;
    }
    return null; // Fallback if none match (shouldn't happen with normalized probabilities)
  }

  // Updated createRandomTile to accept a TileType argument
  private createRandomTile(tileType: TileType): Tile {
    if (this.randomTileState) {
      const levels = [1, 2, 3];
      const states = [TileState.Healthy, TileState.Neutral, TileState.Unhealthy];
      const randomLevel = levels[Math.floor(Math.random() * levels.length)];
      const randomState = states[Math.floor(Math.random() * states.length)];
      return new Tile(tileType, randomLevel, randomState);
    }
    return new Tile(tileType, 1, TileState.Neutral); // Default to Level 1 and Neutral state
  }

  // // Choose a tile type based on the configured probabilities
  // private chooseTileType(): keyof TileProbability {
  //     let rand = this.random();
  //     for (const key in this.tileProbability) {
  //         const prob = this.tileProbability[key as keyof TileProbability];
  //         //console.log(key, rand, prob);
  //         if (rand < prob) {
  //             return key as keyof TileProbability;
  //         }
  //         rand -= prob;
  //     }
  //     return 'null'; // Fallback if none match (shouldn't happen with normalized probabilities)
  // }

  // Get the current number of items in the deck
  getItemCount(): number {
    return this.items.length;
  }

  // Check if the deck is infinite
  isInfinite(): boolean {
    return this.infinite;
  }
}
