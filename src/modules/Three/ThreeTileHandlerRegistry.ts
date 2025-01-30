import { ThreeInstanceManager } from "./ThreeInstanceManager";
import {
    ThreeFarmTileHandler,
    ThreePeopleTileHandler,
    ThreePowerTileHandler,
    ThreeTileHandler,
    ThreeTreeTileHandler,
    ThreeWasteTileHandler
} from "./ThreeTileHandler";

export class ThreeTileHandlerRegistry {
    private handlers: Map<string, ThreeTileHandler> = new Map();

    constructor(tileSize: number, manager: ThreeInstanceManager) {
        // Register default handlers
        this.handlers.set('tree', new ThreeTreeTileHandler(tileSize, manager));
        this.handlers.set('farm', new ThreeFarmTileHandler(tileSize, manager));
        this.handlers.set('people', new ThreePeopleTileHandler(tileSize, manager));
        this.handlers.set('power', new ThreePowerTileHandler(tileSize, manager));
        this.handlers.set('waste', new ThreeWasteTileHandler(tileSize, manager));
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
