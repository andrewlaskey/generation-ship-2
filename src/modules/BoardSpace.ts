// Importing Tile class from wherever it's defined
import { Tile } from './Tile';

export interface BoardSpaceHistoryEntry {
    action: string;     // Either 'placed' or 'removed'
    timestamp: Date;    // When the action occurred
    tileType?: string;  // The type of tile placed, if applicable
}

export class BoardSpace {
    tile: Tile | null = null;
    history: BoardSpaceHistoryEntry[] = [];  // Array to keep track of the history of tile placements and removals
    isHighlighted: boolean = false;

    constructor(public x: number, public y: number) {}

    // Method to place a tile on the board space
    placeTile(tile: Tile): void {
        this.tile = tile;
        this.logHistory('placed', tile.type);
    }

    // Method to remove a tile from the board space
    removeTile(): void {
        if (this.tile) {
            this.logHistory('removed', this.tile.type);
            this.tile = null;   
        }
    }

    // Check if the board space is occupied
    isOccupied(): boolean {
        return this.tile !== null;
    }

   // Private method to log history whenever a tile is placed or removed
   private logHistory(action: string, tileType?: string): void {
    const entry: BoardSpaceHistoryEntry = {
        action: action,
        timestamp: new Date(),  // Log the current timestamp
        tileType: tileType
    };
    this.history.push(entry);
}

// Get the history of the board space
getHistory(): BoardSpaceHistoryEntry[] {
    return this.history;
}
}