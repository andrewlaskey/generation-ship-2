import { describe, it, expect, beforeEach } from 'vitest';
import { TileHandlerRegistry } from './TileHandlerRegistry';
import { TileHandler } from './TileHandler';
import { FarmTileHandler, PeopleTileHandler, PowerTileHandler, TreeTileHandler } from './TileHandler';

describe('TileHandlerRegistry', () => {
    let registry: TileHandlerRegistry;

    beforeEach(() => {
        // Initialize a new registry for each test
        registry = new TileHandlerRegistry();
    });

    it('should return the correct handler for "tree" tile type', () => {
        const handler = registry.getHandler('tree');
        expect(handler).toBeInstanceOf(TreeTileHandler);
    });

    it('should return the correct handler for "farm" tile type', () => {
        const handler = registry.getHandler('farm');
        expect(handler).toBeInstanceOf(FarmTileHandler);
    });

    it('should return the correct handler for "people" tile type', () => {
        const handler = registry.getHandler('people');
        expect(handler).toBeInstanceOf(PeopleTileHandler);
    });

    it('should return the correct handler for "power" tile type', () => {
        const handler = registry.getHandler('power');
        expect(handler).toBeInstanceOf(PowerTileHandler);
    });

    it('should return undefined for an unregistered tile type', () => {
        const handler = registry.getHandler('unknown');
        expect(handler).toBeUndefined();
    });

    it('should allow registering a new handler and retrieve it', () => {
        // Mock a new handler
        const mockHandler: TileHandler = {
            updateState: () => {}
        };

        registry.registerHandler('customTile', mockHandler);
        const handler = registry.getHandler('customTile');
        expect(handler).toBe(mockHandler);
    });

    it('should override an existing handler when registering a new one', () => {
        // Create a new mock handler for 'tree'
        const mockTreeHandler: TileHandler = {
            updateState: () => {}
        };

        // Register the new handler
        registry.registerHandler('tree', mockTreeHandler);

        // Retrieve the handler and ensure it is the new mock handler
        const handler = registry.getHandler('tree');
        expect(handler).toBe(mockTreeHandler);
    });
});
