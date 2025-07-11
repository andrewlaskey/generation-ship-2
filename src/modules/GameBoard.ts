import { Tile, TileState, TileType } from './Tile';
import { BoardSpace } from './BoardSpace';
import { evaluateRules, executeTileBoardUpdate, NeighborCounts, TileRuleConfig } from './TileRules';

export type GameBoardRenderFn<T> = (space: BoardSpace) => T;

export type BoardSpaceAction = {
  x: number;
  y: number;
  action: string | null;
  config: TileRuleConfig;
};

export type TileWithCoordinates = { x: number; y: number; tile: Tile };

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

  clearHighlights(): void {
    this.grid.forEach(space => {
      space.isHighlighted = false;
    });
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

  public updateBoard(ruleConfigs: Map<string, TileRuleConfig>): void {
    const actions: BoardSpaceAction[] = [];
    for (let x = 0; x < this.gridSize; x++) {
      for (let y = 0; y < this.gridSize; y++) {
        // Increase evert tile's age
        const space = this.getSpace(x, y);

        if (space && space.tile) {
          space.tile.ageUp();
        }

        // Evaluate rules and determine action for each space
        const action = this.getSpaceAction(x, y, ruleConfigs);

        if (action) {
          actions.push(action);
        }
      }
    }

    for (const action of actions) {
      const space = this.getSpace(action.x, action.y);

      if (space) {
        const tile = space.tile;

        executeTileBoardUpdate(action.action, tile, space, action.config.results);
      }
    }
  }

  public getSpaceAction(
    x: number,
    y: number,
    ruleConfigs: Map<string, TileRuleConfig>
  ): BoardSpaceAction | null {
    const space = this.getSpace(x, y);

    if (space) {
      const tile = space.tile;
      const config = tile ? ruleConfigs.get(tile.type) : ruleConfigs.get('empty');

      if (config) {
        const neighborCounts = this.getNeighborCounts(x, y);
        const action = evaluateRules(neighborCounts, config);

        return {
          x,
          y,
          action,
          config,
        };
      }
    }

    return null;
  }

  public getNeighborCounts(x: number, y: number): NeighborCounts {
    const neighbors: Tile[] = this.getNeighbors(x, y);

    return neighbors.reduce((counts, tile) => {
      if (tile.state != TileState.Dead) {
        const currentTypeCounts = counts[tile.type];

        if (currentTypeCounts !== undefined) {
          currentTypeCounts.calculated += tile.level;
          currentTypeCounts.raw += 1;
        } else {
          counts[tile.type] = {
            calculated: tile.level,
            raw: 1,
          };
        }
      }
      return counts;
    }, {} as NeighborCounts);
  }

  private getNeighbors(x: number, y: number): Tile[] {
    const neighborTiles: Tile[] = [];
    const directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1], // Cardinal directions (N, S, W, E)
      [-1, -1],
      [1, 1],
      [-1, 1],
      [1, -1], // Diagonal directions
    ];

    directions.forEach(([dx, dy]) => {
      const neighbor = this.getSpace(x + dx, y + dy);
      if (neighbor && neighbor.tile) {
        neighborTiles.push(neighbor.tile);
      }
    });

    return neighborTiles;
  }

  public getNeighborsWithCoords(x: number, y: number): TileWithCoordinates[] {
    const neighborTiles: TileWithCoordinates[] = [];
    const directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1], // Cardinal directions (N, S, W, E)
      [-1, -1],
      [1, 1],
      [-1, 1],
      [1, -1], // Diagonal directions
    ];

    directions.forEach(([dx, dy]) => {
      const neighbor = this.getSpace(x + dx, y + dy);
      if (neighbor && neighbor.tile) {
        neighborTiles.push({
          x: x + dx,
          y: y + dy,
          tile: neighbor.tile,
        });
      }
    });

    return neighborTiles;
  }

  public getHabitatAges(): number[] {
    const ages: number[] = [];

    for (let x = 0; x < this.gridSize; x++) {
      for (let y = 0; y < this.gridSize; y++) {
        const space = this.getSpace(x, y);

        if (space && space.tile && space.tile.type === TileType.People) {
          ages.push(space.tile.age);
        }
      }
    }

    return ages;
  }

  public getOldestTree(): number {
    let oldestAge = 0;

    for (let x = 0; x < this.gridSize; x++) {
      for (let y = 0; y < this.gridSize; y++) {
        const space = this.getSpace(x, y);

        if (space && space.tile && space.tile.type === TileType.Tree) {
          if (space.tile.age > oldestAge) {
            oldestAge = space.tile.age;
          }
        }
      }
    }

    return oldestAge;
  }
}
