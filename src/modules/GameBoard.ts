import { Tile, TileState, TileType } from './Tile';
import { BoardSpace } from './BoardSpace';
import { SpaceChange, SpaceUpdate } from './TileHandler';

export type GameBoardRenderFn<T> = (space: BoardSpace) => T;

// Class to represent the GameBoard
export class GameBoard {
  private grid: BoardSpace[];
  private gridSize: number;

  constructor(public size: number) {
    this.gridSize = size;
    this.grid = this.createBoard(this.gridSize);
  }

  // Method to create the grid of spaces
  private createBoard(size: number): BoardSpace[] {
    const board: BoardSpace[] = [];

    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        board.push(new BoardSpace(x, y));
      }
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
    this.placeTileAt(centerX, centerY, new Tile(TileType.Tree, 1, TileState.Neutral));

    // Place a farm tile one cell north, if within bounds
    if (this.isValidCoordinate(centerX, centerY - 1)) {
      this.placeTileAt(centerX, centerY - 1, new Tile(TileType.Farm, 1, TileState.Neutral));
    }

    // Place a people tile one cell west, if within bounds
    if (this.isValidCoordinate(centerX - 1, centerY)) {
      this.placeTileAt(centerX - 1, centerY, new Tile(TileType.People, 1, TileState.Neutral));
    }

    // Debugging
    // this.placeTileAt(centerX + 1, centerY + 1, new Tile(TileType.People, 2, TileState.Neutral));
    // this.placeTileAt(centerX, centerY + 2, new Tile(TileType.People, 3, TileState.Neutral));
    // this.placeTileAt(centerX, centerY + 1, new Tile(TileType.Farm, 2, TileState.Neutral));
    // this.placeTileAt(centerX - 1, centerY - 1, new Tile(TileType.Farm, 3, TileState.Neutral));
    // this.placeTileAt(centerX - 2, centerY - 1, new Tile(TileType.Waste, 1, TileState.Neutral));
    // this.placeTileAt(centerX - 2, centerY + 2, new Tile(TileType.Power, 1, TileState.Dead));
  }

  // Method to get a specific space by coordinates
  getSpace(x: number, y: number): BoardSpace | null {
    if (this.isValidCoordinate(x, y)) {
      return this.grid.find(space => space.x == x && space.y == y) ?? null;
    }
    return null;
  }

  getGrid<T>(renderFn: GameBoardRenderFn<T>): T[] {
    const spaceRenderOrUpdateResults: T[] = [];

    this.grid.forEach(space => {
      const renderOrUpdateResult = renderFn(space);
      spaceRenderOrUpdateResults.push(renderOrUpdateResult);
    });

    return spaceRenderOrUpdateResults;
  }

  toggleSpaceHighlight(x: number, y: number, addHighlight?: boolean): void {
    const space = this.getSpace(x, y);

    if (space) {
      if (addHighlight !== undefined) {
        // If addHighlight is provided, use its value to set the highlight state
        space.isHighlighted = addHighlight;
      } else {
        // If addHighlight is not provided, toggle the current state
        space.isHighlighted = !space.isHighlighted;
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

  executeSpaceUpate(x: number, y: number, update: SpaceUpdate): void {
    const space = this.getSpace(x, y);
    let tile: Tile | null;

    if (!space) return;

    switch (update.change) {
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

        space.placeTile(update.replaceTile);
        break;
    }
  }

  // Method to check if the coordinates are valid
  private isValidCoordinate(x: number, y: number): boolean {
    return x >= 0 && x < this.size && y >= 0 && y < this.size;
  }

  public countTileTypes(isAdjustedCount = false): Record<string, number> {
    return this.grid.reduce(
      (counts, space) => {
        const tile = space.tile;

        if (tile) {
          const type = tile.type as TileType;
          const pointValue = isAdjustedCount ? tile.level : 1;

          if (Object.hasOwn(counts, type)) {
            counts[type] += pointValue;
          } else {
            counts[type] = pointValue;
          }
        }

        return counts;
      },
      {} as Record<TileType, number>
    );
  }
}
