import { describe, it, expect, vi } from 'vitest';
import { TreeTileHandler, FarmTileHandler, PeopleTileHandler, PowerTileHandler } from './TileHandler';
import { GameManager } from './GameManager';
import { BoardSpace } from './BoardSpace';
import { Tile, TileState, TileType } from './Tile';  // Assuming you have a Tile class in your system

// Mock the GameManager and BoardSpace
const createMockGameManager = () => ({
    countNeighbors: vi.fn(),
    handleTileState: vi.fn()
});

const createMockBoardSpace = (tileType: TileType, level: number, state: TileState) => ({
    tile: new Tile(tileType, level, state)
});


describe('TileHandler Tests', () => {
    describe('TreeTileHandler', () => {
        it('should set tile to healthy if thriving condition is met', () => {
            const treeTileHandler = new TreeTileHandler();
            const gameManager = createMockGameManager();
            const space = createMockBoardSpace(TileType.Tree, 1, TileState.Neutral);

            gameManager.countNeighbors.mockImplementation((space, types) => {
                if (types.includes('tree')) return 3;
                if (types.includes('people')) return 0;
                return 0;
            });

            treeTileHandler.updateState(space as unknown as BoardSpace, gameManager as unknown as GameManager);

            expect(gameManager.handleTileState).toHaveBeenCalledWith(space, true, false);
        });

        it('should set tile to unhealthy if struggling condition is met', () => {
            const treeTileHandler = new TreeTileHandler();
            const gameManager = createMockGameManager();
            const space = createMockBoardSpace(TileType.Tree, 1, TileState.Neutral);

            gameManager.countNeighbors.mockImplementation((space, types) => {
                if (types.includes('tree')) return 0;
                if (types.includes('people')) return 5;
                if (types.includes('power')) return 2;
                return 0;
            });

            treeTileHandler.updateState(space as unknown as BoardSpace, gameManager as unknown as GameManager);

            expect(gameManager.handleTileState).toHaveBeenCalledWith(space, false, true);
        });
    });

    describe('FarmTileHandler', () => {
        it('should set tile to healthy if thriving condition is met', () => {
            const farmTileHandler = new FarmTileHandler();
            const gameManager = createMockGameManager();
            const space = createMockBoardSpace('farm', 1, 'neutral');

            gameManager.countNeighbors.mockImplementation((space, types) => {
                if (types.includes('tree')) return 2;
                if (types.includes('people')) return 1;
                return 0;
            });

            farmTileHandler.updateState(space as unknown as BoardSpace, gameManager as unknown as GameManager);

            expect(gameManager.handleTileState).toHaveBeenCalledWith(space, true, false);
        });

        it('should set tile to unhealthy if struggling condition is met', () => {
            const farmTileHandler = new FarmTileHandler();
            const gameManager = createMockGameManager();
            const space = createMockBoardSpace('farm', 1, 'neutral');

            gameManager.countNeighbors.mockImplementation((space, types) => {
                if (types.includes('tree')) return 5;
                if (types.includes('people')) return 0;
                return 0;
            });

            farmTileHandler.updateState(space as unknown as BoardSpace, gameManager as unknown as GameManager);

            expect(gameManager.handleTileState).toHaveBeenCalledWith(space, false, true);
        });
    });

    describe('PeopleTileHandler', () => {
        it('should set tile to healthy if thriving condition is met', () => {
            const peopleTileHandler = new PeopleTileHandler();
            const gameManager = createMockGameManager();
            const space = createMockBoardSpace('people', 1, 'neutral');

            gameManager.countNeighbors.mockImplementation((space, types) => {
                if (types.includes('farm')) return 1;
                if (types.includes('power')) return 1;
                if (types.includes('tree')) return 1;
                return 0;
            });

            peopleTileHandler.updateState(space as unknown as BoardSpace, gameManager as unknown as GameManager);

            expect(gameManager.handleTileState).toHaveBeenCalledWith(space, true, false);
        });

        it('should set tile to unhealthy if struggling condition is met', () => {
            const peopleTileHandler = new PeopleTileHandler();
            const gameManager = createMockGameManager();
            const space = createMockBoardSpace('people', 1, 'neutral');

            gameManager.countNeighbors.mockImplementation((space, types) => {
                if (types.includes('tree')) return 0;
                if (types.includes('farm')) return 0;
                return 0;
            });

            peopleTileHandler.updateState(space as unknown as BoardSpace, gameManager as unknown as GameManager);

            expect(gameManager.handleTileState).toHaveBeenCalledWith(space, false, true);
        });
    });

    describe('PowerTileHandler', () => {
        it('should set tile to healthy if thriving condition is met', () => {
            const powerTileHandler = new PowerTileHandler();
            const gameManager = createMockGameManager();
            const space = createMockBoardSpace('power', 1, 'neutral');

            gameManager.countNeighbors.mockImplementation((space, types) => {
                if (types.includes('people')) return 1;
                if (types.includes('power')) return 2;
                return 0;
            });

            powerTileHandler.updateState(space as unknown as BoardSpace, gameManager as unknown as GameManager);

            expect(gameManager.handleTileState).toHaveBeenCalledWith(space, true, false);
        });

        it('should set tile to unhealthy if struggling condition is met', () => {
            const powerTileHandler = new PowerTileHandler();
            const gameManager = createMockGameManager();
            const space = createMockBoardSpace('power', 1, 'neutral');

            gameManager.countNeighbors.mockImplementation((space, types) => {
                if (types.includes('people')) return 0;
                if (types.includes('power')) return 4;
                return 0;
            });

            powerTileHandler.updateState(space as unknown as BoardSpace, gameManager as unknown as GameManager);

            expect(gameManager.handleTileState).toHaveBeenCalledWith(space, false, true);
        });
    });
});
