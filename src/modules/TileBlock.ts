import { Tile } from './Tile';
import { HandItem } from './PlayerHand';
import { GameBoard } from './GameBoard';

export type TileBlockOrientation = 'vertical' | 'horizontal';

export type TileBlockLayout = {
  tiles: (Tile | null)[];
  orientation: TileBlockOrientation;
};

export class TileBlock implements HandItem {
  // first and second follow reading rules ➡️ ⬇️
  private firstTile: Tile | null;
  private secondTile: Tile | null;
  private rotation: number; // Rotation state (0, 90, 180, 270 degrees)
  private orientation: TileBlockOrientation;

  constructor(tiles: (Tile | null)[]) {
    if (tiles.length !== 2) {
      throw new Error('A TileBlock must have exactly 2 spaces (Tile or empty).');
    }
    this.firstTile = tiles[0];
    this.secondTile = tiles[1];
    this.orientation = 'horizontal';
    this.rotation = 0;
  }

  getName(): string {
    return 'TileBlock';
  }

  // Return the two tiles in a 1D array regardless of the rotation
  getTiles(): (Tile | null)[] {
    return [this.firstTile, this.secondTile];
  }

  // Get the current layout (1x2 or 2x1)
  getLayout(): TileBlockLayout {
    return {
      tiles: this.getTiles(),
      orientation: this.orientation,
    };
  }

  // Get the current rotation
  getRotation(): number {
    return this.rotation;
  }

  // Rotate the block
  // Tile Block is initialized at rotation 0
  // This is horizontal orientation
  // Example:
  // ---------------
  // | tree | farm |
  // ---------------
  rotate(): void {
    this.rotation = (this.rotation + 90) % 360;
    let tempTile: Tile | null;

    switch (this.rotation) {
      case 90:
        // 90 degrees: Vertical layout with tree on top, house below
        // first and second tiles do not change
        // Example:
        // --------
        // | tree |
        // | farm |
        // --------
        this.orientation = 'vertical';
        break;
      case 180:
        // 180 degrees: Reverse horizontal layout with house on left, tree on right
        // Example:
        // ---------------
        // | farm | tree |
        // ---------------
        this.orientation = 'horizontal';
        tempTile = this.firstTile;
        this.firstTile = this.secondTile;
        this.secondTile = tempTile;
        break;
      case 270:
        // 270 degrees: Vertical layout with house on top, tree below
        // first and second tiles do not change
        // Example:
        // --------
        // | farm |
        // | tree |
        // --------
        this.orientation = 'vertical';
        break;
      default:
        // 0 degrees: Back to starting layout
        // Horizontal layout with tree on left, house on right
        // Example:
        // ---------------
        // | tree | farm |
        // ---------------
        this.orientation = 'horizontal';
        tempTile = this.firstTile;
        this.firstTile = this.secondTile;
        this.secondTile = tempTile;
    }
  }

  // Place the TileBlock on the grid at a given (x, y) position
  placeOnGrid(x: number, y: number, gameBoard: GameBoard): void {
    // Ensure valid placement (within bounds of the game board)
    const size = gameBoard.size; // Assuming GameBoard has a size property

    const right = x + 1;
    const left = x - 1;
    const up = y - 1;
    const down = y + 1;

    switch (this.rotation) {
      case 90:
        if (x < 0 || x >= size || y < 0 || down >= size) {
          throw new Error('Invalid placement: out of bounds');
        }

        this.placeOrRemoveTile(x, y, gameBoard, this.firstTile);
        this.placeOrRemoveTile(x, down, gameBoard, this.secondTile);
        break;
      case 180:
        if (left < 0 || x >= size || y < 0 || y >= size) {
          throw new Error('Invalid placement: out of bounds');
        }

        this.placeOrRemoveTile(x, y, gameBoard, this.secondTile);
        this.placeOrRemoveTile(left, y, gameBoard, this.firstTile);
        break;
      case 270:
        if (x < 0 || x >= size || up < 0 || y >= size) {
          throw new Error('Invalid placement: out of bounds');
        }

        this.placeOrRemoveTile(x, y, gameBoard, this.secondTile);
        this.placeOrRemoveTile(x, up, gameBoard, this.firstTile);
        break;
      default:
        if (x < 0 || right >= size || y < 0 || y >= size) {
          throw new Error('Invalid placement: out of bounds');
        }

        this.placeOrRemoveTile(x, y, gameBoard, this.firstTile);
        this.placeOrRemoveTile(right, y, gameBoard, this.secondTile);
        break;
    }
  }

  // Helper function to place or remove a tile based on whether it's null or a Tile object
  private placeOrRemoveTile(x: number, y: number, gameBoard: GameBoard, tile: Tile | null): void {
    const space = gameBoard.getSpace(x, y); // Use getSpace() to retrieve the BoardSpace
    if (space) {
      if (tile) {
        space.placeTile(tile); // Place the tile if it's not null
      } else {
        space.removeTile(); // Remove the tile if it's null (empty space)
      }
    } else {
      throw new Error('Invalid placement: no valid space found');
    }
  }
}
