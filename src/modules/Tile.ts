// tile.ts

export enum TileType {
  Tree = 'tree',
  Farm = 'farm',
  People = 'people',
  Power = 'power',
  Waste = 'waste',
}

export enum TileState {
  Dead = 'dead',
  Neutral = 'neutral',
  Healthy = 'healthy',
  Unhealthy = 'unhealthy',
}

export class Tile {
  static readonly validTypes = ['tree', 'farm', 'people', 'power', 'waste'] as const;
  static readonly validStates = ['neutral', 'healthy', 'unhealthy', 'dead'] as const;
  readonly minLevel = 1;
  readonly maxLevel = 3;

  type: (typeof Tile.validTypes)[number];
  level: number;
  state: (typeof Tile.validStates)[number];

  constructor(
    type: (typeof Tile.validTypes)[number],
    level: number,
    state: (typeof Tile.validStates)[number]
  ) {
    if (!Tile.validTypes.includes(type)) {
      throw new Error('Invalid tile type');
    }
    if (level < this.minLevel || level > this.maxLevel) {
      throw new Error('Invalid tile level');
    }
    if (!Tile.validStates.includes(state)) {
      throw new Error('Invalid tile state');
    }

    this.type = type;
    this.level = level;
    this.state = state;
  }

  // Method to update the state of the tile
  setState(newState: (typeof Tile.validStates)[number]): void {
    if (!Tile.validStates.includes(newState)) {
      throw new Error(`Invalid tile state: ${newState}`);
    }
    this.state = newState;
  }

  // Method to upgrade the level
  upgrade(preview = false): boolean {
    if (this.state != TileState.Dead && this.level < this.maxLevel) {
      if (!preview) {
        this.level++;
      }
      return true;
    }

    return false;
  }

  // Method to downgrade the level
  downgrade(preview = false): boolean {
    if (this.state != TileState.Dead && this.level > this.minLevel) {
      if (!preview) {
        this.level--;
      }
      return true;
    }

    return false;
  }
}
