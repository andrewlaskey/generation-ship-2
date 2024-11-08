import { Tile } from "./Tile";
import { HandItem } from "./PlayerHand";
import { GameBoard } from "./GameBoard";


export class TileBlock implements HandItem {
    private layout: (Tile | null)[][];  // Layout of the TileBlock
    private rotation: number;  // Rotation state (0, 90, 180, 270 degrees)

    constructor(tiles: (Tile | null)[]) {
        if (tiles.length !== 2) {
            throw new Error("A TileBlock must have exactly 2 spaces (Tile or empty).");
        }
        this.layout = [tiles];
        this.rotation = 0;
    }

    getName(): string {
        return 'TileBlock'
    }

    // Return the two tiles in a 1D array regardless of the rotation
    getTiles(): (Tile | null)[] {
        switch (this.rotation) {
            case 0:
                return [this.layout[0][0], this.layout[0][1]]; // Horizontal layout
            case 90:
                return [this.layout[0][0], this.layout[1][0]]; // Vertical layout (rotated 90 degrees)
            case 180:
                return [this.layout[0][1], this.layout[0][0]]; // Horizontal layout (flipped)
            case 270:
                return [this.layout[1][0], this.layout[0][0]]; // Vertical layout (rotated 270 degrees)
            default:
                throw new Error("Invalid rotation value.");
        }
    }

    // Get the current layout (1x2 or 2x1)
    getLayout(): (Tile | null)[][] {
        return this.layout;
    }

    // Get the current rotation
    getRotation(): number {
        return this.rotation;
    }

    // Rotate the block
    rotate(): void {
        this.rotation = (this.rotation + 90) % 360;
    
        if (this.rotation === 90) {
            // 90 degrees: Vertical layout with tree on top, house below
            this.layout = [
                [this.layout[0][0]],  // Top (tree)
                [this.layout[0][1]]   // Bottom (house)
            ];
        } else if (this.rotation === 180) {
            // 180 degrees: Reverse horizontal layout with house on left, tree on right
            this.layout = [
                [this.layout[1][0], this.layout[0][0]]  // Reverse the tiles horizontally
            ];
        } else if (this.rotation === 270) {
            // 270 degrees: Vertical layout with house on top, tree below
            this.layout = [
                [this.layout[0][0]],  // Top (house)
                [this.layout[0][1]]   // Bottom (tree)
            ];
        } else {
            // 0 degrees: Horizontal layout with tree on left, house on right
            this.layout = [
                [this.layout[1][0], this.layout[0][0]]  // Default layout
            ];
        }
    }    

    // Place the TileBlock on the grid at a given (x, y) position
    placeOnGrid(x: number, y: number, gameBoard: GameBoard): void {
        // Ensure valid placement (within bounds of the game board)
        const size = gameBoard.size;  // Assuming GameBoard has a size property
        if (this.rotation === 0 || this.rotation === 180) {
            if (x < 0 || x >= size || y + 1 >= size) {
                throw new Error("Invalid placement: out of bounds");
            }
            // Place tiles or remove them horizontally
            this.placeOrRemoveTile(x, y, gameBoard, this.layout[0][0]);
            this.placeOrRemoveTile(x, y + 1, gameBoard, this.layout[0][1]);
        } else {
            if (x + 1 >= size || y >= size) {
                throw new Error("Invalid placement: out of bounds");
            }
            // Place tiles or remove them vertically
            this.placeOrRemoveTile(x, y, gameBoard, this.layout[0][0]);
            this.placeOrRemoveTile(x + 1, y, gameBoard, this.layout[1][0]);
        }
    }

    // Helper function to place or remove a tile based on whether it's null or a Tile object
    private placeOrRemoveTile(x: number, y: number, gameBoard: GameBoard, tile: Tile | null): void {
        const space = gameBoard.getSpace(x, y);  // Use getSpace() to retrieve the BoardSpace
        if (space) {
            if (tile) {
                space.placeTile(tile); // Place the tile if it's not null
            } else {
                space.removeTile(); // Remove the tile if it's null (empty space)
            }
        } else {
            throw new Error("Invalid placement: no valid space found");
        }
    }
}

