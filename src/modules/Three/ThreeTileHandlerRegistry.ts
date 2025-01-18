import {
    ThreeFarmTileHandler,
    ThreePeopleTileHandler,
    ThreePowerTileHandler,
    ThreeTileHandler,
    ThreeTreeTileHandler
} from "./ThreeTileHandler";

export class ThreeTileHandlerRegistry {
    private handlers: Map<string, ThreeTileHandler> = new Map();

    constructor(tileSize: number) {
        // Register default handlers
        this.handlers.set('tree', new ThreeTreeTileHandler());
        this.handlers.set('farm', new ThreeFarmTileHandler(tileSize));
        this.handlers.set('people', new ThreePeopleTileHandler(tileSize));
        this.handlers.set('power', new ThreePowerTileHandler(tileSize));
    }

    // Get the appropriate handler for the given tile type
    getHandler(tileType: string): ThreeTileHandler | undefined {
        return this.handlers.get(tileType);
    }

    // Register a new tile handler
    registerHandler(tileType: string, handler: ThreeTileHandler): void {
        this.handlers.set(tileType, handler);
    }
}
