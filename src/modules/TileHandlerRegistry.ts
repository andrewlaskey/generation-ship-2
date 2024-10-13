import { TileHandler, FarmTileHandler, PeopleTileHandler, PowerTileHandler, TreeTileHandler } from "./TileHandler";

export class TileHandlerRegistry {
    private handlers: Map<string, TileHandler> = new Map();

    constructor() {
        // Register default handlers
        this.handlers.set('tree', new TreeTileHandler());
        this.handlers.set('farm', new FarmTileHandler());
        this.handlers.set('people', new PeopleTileHandler());
        this.handlers.set('power', new PowerTileHandler());
    }

    // Get the appropriate handler for the given tile type
    getHandler(tileType: string): TileHandler | undefined {
        return this.handlers.get(tileType);
    }

    // Register a new tile handler
    registerHandler(tileType: string, handler: TileHandler): void {
        this.handlers.set(tileType, handler);
    }
}
