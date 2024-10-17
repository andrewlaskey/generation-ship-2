import { Tile } from "./Tile";
import { BoardSpace } from "./BoardSpace";

// Class to represent the GameBoard
export class GameBoard {
    private grid: BoardSpace[][];

    constructor(public size: number) {
        this.grid = this.createBoard(size);
    }

    // Method to create the grid of spaces
    private createBoard(size: number): BoardSpace[][] {
        const board: BoardSpace[][] = [];
        for (let x = 0; x < size; x++) {
            const row: BoardSpace[] = [];
            for (let y = 0; y < size; y++) {
                row.push(new BoardSpace(x, y));
            }
            board.push(row);
        }
        return board;
    }

    // Method to get a specific space by coordinates
    getSpace(x: number, y: number): BoardSpace | null {
        if (this.isValidCoordinate(x, y)) {
            return this.grid[x][y];
        }
        return null;
    }

    toggleSpaceHighlight(x: number, y: number, addHighlight?: boolean): void {
        if (this.isValidCoordinate(x, y)) {
            if (addHighlight !== undefined) {
                // If addHighlight is provided, use its value to set the highlight state
                this.grid[x][y].isHighlighted = addHighlight;
            } else {
                // If addHighlight is not provided, toggle the current state
                this.grid[x][y].isHighlighted = !this.grid[x][y].isHighlighted;
            }
        }
    }
    

    // Method to place a tile at a specific coordinate
    placeTileAt(x: number, y: number, tile: Tile): boolean {
        const space = this.getSpace(x, y);
        if (space) {
            space.placeTile(tile);
            return true;
        }
        return false;
    }

    // Method to remove a tile from a specific coordinate
    removeTileAt(x: number, y: number): boolean {
        const space = this.getSpace(x, y);
        if (space && space.isOccupied()) {
            space.removeTile();
            return true;
        }
        return false;
    }

    // Method to check if the coordinates are valid
    private isValidCoordinate(x: number, y: number): boolean {
        return x >= 0 && x < this.size && y >= 0 && y < this.size;
    }

    // Method to display the board state
    displayBoard(): void {
        for (let row of this.grid) {
            let rowDisplay = row.map(space => (space.isOccupied() ? "T" : "O")).join(" ");
            console.log(rowDisplay);
        }
    }
}
