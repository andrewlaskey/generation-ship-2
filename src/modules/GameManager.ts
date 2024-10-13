// Import necessary classes
import { GameBoard } from './GameBoard';
import { Tile } from './Tile';
import { BoardSpace } from './BoardSpace';
import { TileHandlerRegistry } from './TileHandlerRegistry';

export class GameManager {
    gameBoard: GameBoard;
    tileHandlerRegistry: TileHandlerRegistry;

    constructor(size: number) {
        this.gameBoard = new GameBoard(size);
        this.tileHandlerRegistry = new TileHandlerRegistry();
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

    // Method to update space based on the tile type
    updateSpace(x: number, y: number): void {
        const space = this.gameBoard.getSpace(x, y);
        if (!space || !space.tile) return;

        const handler = this.tileHandlerRegistry.getHandler(space.tile.type);
        if (handler) {
            handler.updateState(space, this);  // Let the handler update the space based on the tile's type
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

        if (treeCount >= 3) {
            space.placeTile(new Tile('tree', 1, 'neutral'));  // A tree starts growing
        } else if (peopleCount >= 1 && powerCount >= 1 && farmCount >= 2) {
            space.placeTile(new Tile('people', 1, 'healthy'));  // A settlement starts
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

    // Method to update the entire board
    updateBoard(): void {
        const size = this.gameBoard.size;
        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                this.updateSpace(x, y);
            }
        }
    }
}