// tile.ts

export type TileType = 'tree' | 'farm' | 'people' | 'power';
export type TileState = 'neutral' | 'healthy' | 'unhealthy';


export class Tile {
    static readonly validTypes = ['tree', 'farm', 'people', 'power'] as const;
    static readonly validStates = ['neutral', 'healthy', 'unhealthy'] as const;
    static readonly minLevel = 1;
    static readonly maxLevel = 3;

    type: typeof Tile.validTypes[number];
    level: number;
    state: typeof Tile.validStates[number];

    constructor(type: typeof Tile.validTypes[number], level: number, state: typeof Tile.validStates[number]) {
        if (!Tile.validTypes.includes(type)) {
            throw new Error('Invalid tile type');
        }
        if (level < Tile.minLevel || level > Tile.maxLevel) {
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
    setState(newState: typeof Tile.validStates[number]): void {
        if (!Tile.validStates.includes(newState)) {
            throw new Error('Invalid tile state');
        }
        this.state = newState;
    }

    // Method to upgrade the level
    upgrade(): void {
        if (this.level < Tile.maxLevel) {
            this.level++;
        }
    }

    // Method to downgrade the level
    downgrade(): void {
        if (this.level > Tile.minLevel) {
            this.level--;
        }
    }
}
