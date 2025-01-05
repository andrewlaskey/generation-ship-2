import { Tile, TileType } from "./Tile";
import { BoardSpace } from "./BoardSpace";
import { SpaceChange, SpaceUpdate } from "./TileHandler";

export type GameBoardRenderFn<T> = (col: number, row: number, space: BoardSpace) => T;

// Class to represent the GameBoard
export class GameBoard {
    private grid: BoardSpace[][];
    private gridSize: number

    constructor(public size: number) {
        this.gridSize = size;
        this.grid = this.createBoard(this.gridSize);
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

    clearBoard(): void {
        for (let x = 0; x < this.gridSize; x++) {
            for (let y = 0; y < this.gridSize; y++) {
                this.removeTileAt(x, y);
            }
        }
    }

    setStartingCondition(): void {
        const centerX = Math.floor(this.size / 2);
        const centerY = Math.floor(this.size / 2);

        this.clearBoard();
    
        // Place a tree tile at the center
        this.placeTileAt(centerX, centerY, new Tile('tree', 1, 'neutral'));
    
        // Place a farm tile one cell north, if within bounds
        if (this.isValidCoordinate(centerX, centerY - 1)) {
            this.placeTileAt(centerX, centerY - 1, new Tile('farm', 1, 'neutral'));
        }
    
        // Place a people tile one cell west, if within bounds
        if (this.isValidCoordinate(centerX - 1, centerY)) {
            this.placeTileAt(centerX - 1, centerY, new Tile('people', 1, 'neutral'));
        }
    }

    // Method to get a specific space by coordinates
    getSpace(x: number, y: number): BoardSpace | null {
        if (this.isValidCoordinate(x, y)) {
            return this.grid[x][y];
        }
        return null;
    }

    getGrid<T>(renderFn: GameBoardRenderFn<T>): T[] {
        const spaces: T[] = [];

        for (let col = 0; col < this.gridSize; col++) {
            for (let row = 0; row < this.gridSize; row++) {
                const space = this.grid[col][row];
                const renderResult = renderFn(col, row, space);
                spaces.push(renderResult);
            }
        }

        return spaces;
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

    executeSpaceUpate(col: number, row: number, update: SpaceUpdate): void {
        const space = this.getSpace(col, row);
        let tile: Tile | null;

        if (!space) return;

        switch(update.change) {
            case SpaceChange.ChangeState:
                tile = space.tile;

                if (!update.newState) {
                    console.error(space.tile, update);
                    throw new Error('Space update for change state missing new state!');
                }

                if (tile) {
                    tile.setState(update.newState);
                }
                break;
            case SpaceChange.Upgrade:
                tile = space.tile;

                if (tile) {
                    tile.upgrade();
                }
                break;
            case SpaceChange.Downgrade:
                tile = space.tile;

                if (tile) {
                    tile.downgrade();
                }
                break;
            case SpaceChange.Remove:
                space.removeTile();
                break;
            case SpaceChange.Replace:
                space.removeTile();

                if (!update.replaceTile) {
                    console.error(space.tile, update);
                    throw new Error('No replacement tile to replace current tile!');
                }

                space.placeTile(update.replaceTile)
                break;
        }
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

    countTileTypes(isAdjustedCount = false): Record<string, number> {
        return this.grid.reduce((counts, row) => {
            const rowCounts = row.reduce((rowCounts, value) => {
                const tile = value.tile;

                if (tile) {
                    const type = tile.type as TileType;
                    const pointValue = isAdjustedCount ? tile.level : 1;

                    if (rowCounts.hasOwnProperty(type)) {
                        rowCounts[type] += pointValue;
                    } else {
                        rowCounts[type] = pointValue
                    }
                }

                return rowCounts;
            }, {} as Record<TileType, number>);

            Object.entries(rowCounts).forEach(([key, value]) => {
                const typedKey = key as keyof typeof counts;
                if (counts.hasOwnProperty(key)) {
                    counts[typedKey] += value;
                } else {
                    counts[typedKey] = value
                }
            });
            
            return counts;
        }, {} as Record<TileType, number>);
    }
}
