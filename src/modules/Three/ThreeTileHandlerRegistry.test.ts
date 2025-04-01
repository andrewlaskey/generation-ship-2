import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ThreeTileHandlerRegistry } from './ThreeTileHandlerRegistry';
import {
  ThreeFarmTileHandler,
  ThreePeopleTileHandler,
  ThreePowerTileHandler,
  ThreeTileHandler,
  ThreeTreeTileHandler,
} from './ThreeTileHandler';
import { ThreeInstanceManager } from './ThreeInstanceManager';

describe('ThreeTileHandlerRegistry', () => {
  let registry: ThreeTileHandlerRegistry;
  const manager = new ThreeInstanceManager();

  beforeEach(() => {
    // Initialize a new registry for each test
    registry = new ThreeTileHandlerRegistry(6, manager);
  });

  it('should return the correct handler for "tree" tile type', () => {
    const handler = registry.getHandler('tree');
    expect(handler).toBeInstanceOf(ThreeTreeTileHandler);
  });

  it('should return the correct handler for "farm" tile type', () => {
    const handler = registry.getHandler('farm');
    expect(handler).toBeInstanceOf(ThreeFarmTileHandler);
  });

  it('should return the correct handler for "people" tile type', () => {
    const handler = registry.getHandler('people');
    expect(handler).toBeInstanceOf(ThreePeopleTileHandler);
  });

  it('should return the correct handler for "power" tile type', () => {
    const handler = registry.getHandler('power');
    expect(handler).toBeInstanceOf(ThreePowerTileHandler);
  });

  it('should return undefined for an unregistered tile type', () => {
    const handler = registry.getHandler('unknown');
    expect(handler).toBeUndefined();
  });

  it('should allow registering a new handler and retrieve it', () => {
    // Mock a new handler
    const mockHandler: ThreeTileHandler = {
      updateScene: vi.fn(() => Promise.resolve()),
    };

    registry.registerHandler('customTile', mockHandler);
    const handler = registry.getHandler('customTile');
    expect(handler).toBe(mockHandler);
  });

  it('should override an existing handler when registering a new one', () => {
    // Create a new mock handler for 'tree'
    const mockTreeHandler: ThreeTileHandler = {
      updateScene: vi.fn(() => Promise.resolve()),
    };

    // Register the new handler
    registry.registerHandler('tree', mockTreeHandler);

    // Retrieve the handler and ensure it is the new mock handler
    const handler = registry.getHandler('tree');
    expect(handler).toBe(mockTreeHandler);
  });
});
