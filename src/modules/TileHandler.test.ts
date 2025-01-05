import { describe, it, expect, vi } from 'vitest';
import { TreeTileHandler, FarmTileHandler, PeopleTileHandler, PowerTileHandler, EmptyTileHandler, SpaceChange, WasteTileHandler } from './TileHandler';
import { GameManager } from './GameManager';
import { BoardSpace } from './BoardSpace';
import { Tile, TileState, TileType } from './Tile';  // Assuming you have a Tile class in your system

// Mock the GameManager and BoardSpace
const createMockGameManager = () => ({
    countNeighbors: vi.fn(),
    handleTileState: vi.fn()
});

const createMockBoardSpace = (tileType: TileType, level: number, state: TileState) => ({
    tile: new Tile(tileType, level, state),
    removeTile: vi.fn()
});


describe('TileHandler Tests', () => {
    describe('TreeTileHandler', () => {
        it('should set tile to healthy if thriving condition is met', () => {
            const treeTileHandler = new TreeTileHandler();
            const gameManager = createMockGameManager();
            const space = createMockBoardSpace(TileType.Tree, 1, TileState.Neutral);

            // @ts-ignore `space` not needed for mocking
            gameManager.countNeighbors.mockImplementation((space, types) => {
                if (types.includes(TileType.Tree)) return 3;
                if (types.includes(TileType.People)) return 0;
                return 0;
            });

            const result = treeTileHandler.updateState(space as unknown as BoardSpace, gameManager as unknown as GameManager);

            expect(result).toStrictEqual({
                change: SpaceChange.ChangeState,
                newState: TileState.Healthy
            });
        });

        it('should set tile to unhealthy if too many people struggling condition is met', () => {
            const treeTileHandler = new TreeTileHandler();
            const gameManager = createMockGameManager();
            const space = createMockBoardSpace(TileType.Tree, 1, TileState.Neutral);

            // @ts-ignore `space` not needed for mocking
            gameManager.countNeighbors.mockImplementation((space, types) => {
                if (types.includes(TileType.People)) return 5;
                return 0;
            });

            const result = treeTileHandler.updateState(space as unknown as BoardSpace, gameManager as unknown as GameManager);

            expect(result).toStrictEqual({
                change: SpaceChange.ChangeState,
                newState: TileState.Unhealthy
            });
        });

        it('should meet struggling condition if too many trees', () => {
            const treeTileHandler = new TreeTileHandler();
            const gameManager = createMockGameManager();
            const space = createMockBoardSpace(TileType.Tree, 1, TileState.Neutral);

            // @ts-ignore `space` not needed for mocking
            gameManager.countNeighbors.mockImplementation((space, types) => {
                if (types.includes(TileType.Tree)) return 5;
                return 0;
            });

            const result = treeTileHandler.updateState(space as unknown as BoardSpace, gameManager as unknown as GameManager);

            expect(result).toStrictEqual({
                change: SpaceChange.ChangeState,
                newState: TileState.Unhealthy
            });
        });

        it('should meet struggling condition if too much power', () => {
            const treeTileHandler = new TreeTileHandler();
            const gameManager = createMockGameManager();
            const space = createMockBoardSpace(TileType.Tree, 1, TileState.Neutral);

            // @ts-ignore `space` not needed for mocking
            gameManager.countNeighbors.mockImplementation((space, types) => {
                if (types.includes(TileType.Power)) return 3;
                return 0;
            });

            const result = treeTileHandler.updateState(space as unknown as BoardSpace, gameManager as unknown as GameManager);

            expect(result).toStrictEqual({
                change: SpaceChange.ChangeState,
                newState: TileState.Unhealthy
            });
        });

        it('should return a remove tile change if meets struggling condition and currently unhealthy', () => {
            const treeTileHandler = new TreeTileHandler();
            const gameManager = createMockGameManager();
            const space = createMockBoardSpace(TileType.Tree, 1, TileState.Unhealthy);

            // @ts-ignore `space` not needed for mocking
            gameManager.countNeighbors.mockImplementation((space, types) => {
                if (types.includes(TileType.Tree)) return 0;
                if (types.includes(TileType.People)) return 5;
                if (types.includes(TileType.Power)) return 2;
                return 0;
            });

            const result = treeTileHandler.updateState(space as unknown as BoardSpace, gameManager as unknown as GameManager);

            expect(result).toStrictEqual({
                change: SpaceChange.Remove
            });
        });
    });

    describe('FarmTileHandler', () => {
        it('should set tile to healthy if thriving condition is met', () => {
            const farmTileHandler = new FarmTileHandler();
            const gameManager = createMockGameManager();
            const space = createMockBoardSpace(TileType.Farm, 1, TileState.Neutral);

            // @ts-ignore `space` not needed for mocking
            gameManager.countNeighbors.mockImplementation((space, types) => {
                if (types.includes(TileType.People)) return 2;
                return 0;
            });

            const result = farmTileHandler.updateState(space as unknown as BoardSpace, gameManager as unknown as GameManager);
            
            expect(result).toStrictEqual({
                change: SpaceChange.ChangeState,
                newState: TileState.Healthy
            });
        });

        it('should not change to healthy from neutral if only one people neighbor', () => {
            const farmTileHandler = new FarmTileHandler();
            const gameManager = createMockGameManager();
            const space = createMockBoardSpace(TileType.Farm, 1, TileState.Neutral);

            // @ts-ignore `space` not needed for mocking
            gameManager.countNeighbors.mockImplementation((space, types) => {
                if (types.includes(TileType.People)) return 1;
                return 0;
            });

            const result = farmTileHandler.updateState(space as unknown as BoardSpace, gameManager as unknown as GameManager);
            
            expect(result).toStrictEqual({
                change: SpaceChange.ChangeState,
                newState: TileState.Neutral
            });
        });

        it('should set tile to unhealthy if too many people and not enough farm neighbors', () => {
            const farmTileHandler = new FarmTileHandler();
            const gameManager = createMockGameManager();
            const space = createMockBoardSpace(TileType.Farm, 1, TileState.Neutral);

            // @ts-ignore `space` not needed for mocking
            gameManager.countNeighbors.mockImplementation((space, types) => {
                if (types.includes(TileType.People)) return 5;
                return 0;
            });

            const result = farmTileHandler.updateState(space as unknown as BoardSpace, gameManager as unknown as GameManager);

            expect(result).toStrictEqual({
                change: SpaceChange.ChangeState,
                newState: TileState.Unhealthy
            });
        });

        it('should not change state to unhealthy if too many people but enough farm neighbors', () => {
            const farmTileHandler = new FarmTileHandler();
            const gameManager = createMockGameManager();
            const space = createMockBoardSpace(TileType.Farm, 1, TileState.Neutral);

            // @ts-ignore `space` not needed for mocking
            gameManager.countNeighbors.mockImplementation((space, types) => {
                if (types.includes(TileType.People)) return 5;
                if (types.includes(TileType.Farm)) return 1;
                return 0;
            });

            const result = farmTileHandler.updateState(space as unknown as BoardSpace, gameManager as unknown as GameManager);

            expect(result).toStrictEqual({
                change: SpaceChange.ChangeState,
                newState: TileState.Neutral
            });
        });

        it('should set tile to neutral if thriving condition is met and unhealthy', () => {
            const farmTileHandler = new FarmTileHandler();
            const gameManager = createMockGameManager();
            const space = createMockBoardSpace(TileType.Farm, 1, TileState.Unhealthy);

            // @ts-ignore `space` not needed for mocking
            gameManager.countNeighbors.mockImplementation((space, types) => {
                if (types.includes(TileType.Tree)) return 2;
                if (types.includes(TileType.People)) return 1;
                return 0;
            });

            const result = farmTileHandler.updateState(space as unknown as BoardSpace, gameManager as unknown as GameManager);

            expect(result).toStrictEqual({
                change: SpaceChange.ChangeState,
                newState: TileState.Neutral
            });
        });

        it('should set tile to unhealthy if struggling condition is met', () => {
            const farmTileHandler = new FarmTileHandler();
            const gameManager = createMockGameManager();
            const space = createMockBoardSpace(TileType.Farm, 1, TileState.Neutral);

            // @ts-ignore `space` not needed for mocking
            gameManager.countNeighbors.mockImplementation((space, types) => {
                if (types.includes(TileType.Tree)) return 5;
                if (types.includes(TileType.People)) return 0;
                return 0;
            });

            const result = farmTileHandler.updateState(space as unknown as BoardSpace, gameManager as unknown as GameManager);

            expect(result).toStrictEqual({
                change: SpaceChange.ChangeState,
                newState: TileState.Unhealthy
            });
        });

        it('should set tile to neutral if struggling condition is met and healthy', () => {
            const farmTileHandler = new FarmTileHandler();
            const gameManager = createMockGameManager();
            const space = createMockBoardSpace(TileType.Farm, 1, TileState.Healthy);

            // @ts-ignore `space` not needed for mocking
            gameManager.countNeighbors.mockImplementation((space, types) => {
                if (types.includes(TileType.Tree)) return 5;
                if (types.includes(TileType.People)) return 0;
                return 0;
            });

            const result = farmTileHandler.updateState(space as unknown as BoardSpace, gameManager as unknown as GameManager);

            expect(result).toStrictEqual({
                change: SpaceChange.ChangeState,
                newState: TileState.Neutral 
            });
        });

        it('should replace the tile with a waste tile if it dies', () => {
            const farmTileHandler = new FarmTileHandler();
            const gameManager = createMockGameManager();
            const space: Partial<BoardSpace> = {
                tile: new Tile(TileType.Farm, 1, TileState.Unhealthy),
                placeTile: vi.fn(),
                removeTile: vi.fn()
            };

            // @ts-ignore `space` not needed for mocking
            gameManager.countNeighbors.mockImplementation(() => {
                return 0;
            });

            const result = farmTileHandler.updateState(space as unknown as BoardSpace, gameManager as unknown as GameManager);

            expect(result).toStrictEqual({
                change: SpaceChange.Replace,
                replaceTile: new Tile(TileType.Waste, 1, TileState.Neutral)
            });
        })
    });

    describe('PeopleTileHandler', () => {
        it('should set tile to healthy if thriving condition is met', () => {
            const peopleTileHandler = new PeopleTileHandler();
            const gameManager = createMockGameManager();
            const space = createMockBoardSpace(TileType.People, 1, TileState.Neutral);

            // @ts-ignore `space` not needed for mocking
            gameManager.countNeighbors.mockImplementation((space, types) => {
                if (types.includes(TileType.Farm)) return 1;
                if (types.includes(TileType.Power)) return 1;
                if (types.includes(TileType.Tree)) return 1;
                return 0;
            });

            const result = peopleTileHandler.updateState(space as unknown as BoardSpace, gameManager as unknown as GameManager);

            expect(result).toStrictEqual({
                change: SpaceChange.ChangeState,
                newState: TileState.Healthy
            });
        });

        it('should set tile to unhealthy if struggling condition is met', () => {
            const peopleTileHandler = new PeopleTileHandler();
            const gameManager = createMockGameManager();
            const space = createMockBoardSpace(TileType.People, 1, TileState.Neutral);

            // @ts-ignore `space` not needed for mocking
            gameManager.countNeighbors.mockImplementation((space, types) => {
                if (types.includes(TileType.Tree)) return 0;
                if (types.includes(TileType.Farm)) return 0;
                return 0;
            });

            const result = peopleTileHandler.updateState(space as unknown as BoardSpace, gameManager as unknown as GameManager);

            expect(result).toStrictEqual({
                change: SpaceChange.ChangeState,
                newState: TileState.Unhealthy
            });
        });
    });

    describe('PowerTileHandler', () => {
        it('should set tile to healthy if thriving condition is met', () => {
            const powerTileHandler = new PowerTileHandler();
            const gameManager = createMockGameManager();
            const space = createMockBoardSpace(TileType.Power, 1, TileState.Neutral);

            // @ts-ignore `space` not needed for mocking
            gameManager.countNeighbors.mockImplementation((space, types) => {
                if (types.includes(TileType.People)) return 1;
                if (types.includes(TileType.Power)) return 2;
                return 0;
            });

            const result = powerTileHandler.updateState(space as unknown as BoardSpace, gameManager as unknown as GameManager);

            expect(result).toStrictEqual({
                change: SpaceChange.ChangeState,
                newState: TileState.Healthy
            });
        });

        it('should set tile to unhealthy if too much power struggling condition is met', () => {
            const powerTileHandler = new PowerTileHandler();
            const gameManager = createMockGameManager();
            const space = createMockBoardSpace(TileType.Power, 1, TileState.Neutral);

            // @ts-ignore `space` not needed for mocking
            gameManager.countNeighbors.mockImplementation((space, types) => {
                if (types.includes(TileType.Power)) return 4;
                if (types.includes(TileType.People)) return 1;
                return 0;
            });

            const result = powerTileHandler.updateState(space as unknown as BoardSpace, gameManager as unknown as GameManager);

            expect(result).toStrictEqual({
                change: SpaceChange.ChangeState,
                newState: TileState.Unhealthy
            });
        });

        it('should set tile to unhealthy if too few people struggling condition is met', () => {
            const powerTileHandler = new PowerTileHandler();
            const gameManager = createMockGameManager();
            const space = createMockBoardSpace(TileType.Power, 1, TileState.Neutral);

            // @ts-ignore `space` not needed for mocking
            gameManager.countNeighbors.mockImplementation((space, types) => {
                return 0;
            });

            const result = powerTileHandler.updateState(space as unknown as BoardSpace, gameManager as unknown as GameManager);

            expect(result).toStrictEqual({
                change: SpaceChange.ChangeState,
                newState: TileState.Unhealthy
            });
        });

        it('should set tile to unhealthy if too many people', () => {
            const powerTileHandler = new PowerTileHandler();
            const gameManager = createMockGameManager();
            const space = createMockBoardSpace(TileType.Power, 1, TileState.Neutral);

            // @ts-ignore `space` not needed for mocking
            gameManager.countNeighbors.mockImplementation((space, types) => {
                if (types.includes(TileType.People)) return 5;
                return 0;
            });

            const result = powerTileHandler.updateState(space as unknown as BoardSpace, gameManager as unknown as GameManager);

            expect(result).toStrictEqual({
                change: SpaceChange.ChangeState,
                newState: TileState.Unhealthy
            });
        });

        it('should set tile to dead if no people and current state is unhealthy', () => {
            const powerTileHandler = new PowerTileHandler();
            const gameManager = createMockGameManager();
            const space = createMockBoardSpace(TileType.Power, 1, TileState.Unhealthy);

            // @ts-ignore `space` not needed for mocking
            gameManager.countNeighbors.mockImplementation((space, types) => {
                if (types.includes(TileType.People)) return 0;
                return 0;
            });

            const result = powerTileHandler.updateState(space as unknown as BoardSpace, gameManager as unknown as GameManager);

            expect(result).toStrictEqual({
                change: SpaceChange.ChangeState,
                newState: TileState.Dead
            });
        });

        it('should stay dead even if thriving conditions are met', () => {
            const powerTileHandler = new PowerTileHandler();
            const gameManager = createMockGameManager();
            const space = createMockBoardSpace(TileType.Power, 1, TileState.Dead);

            // @ts-ignore `space` not needed for mocking
            gameManager.countNeighbors.mockImplementation((space, types) => {
                if (types.includes(TileType.People)) return 1;
                if (types.includes(TileType.Power)) return 2;
                return 0;
            });

            const result = powerTileHandler.updateState(space as unknown as BoardSpace, gameManager as unknown as GameManager);

            expect(result).toBeNull();
        });
    });

    describe('EmptyTileHandler', () => {
        it('should create a tree tile if tree growing conditions are met', () => {
            const emptyTileHandler = new EmptyTileHandler();
            const gameManager = createMockGameManager();
            const space: Partial<BoardSpace> = {
                tile: null,
                placeTile: vi.fn(),
                removeTile: vi.fn()
            };

            // @ts-ignore `space` not needed for mocking
            gameManager.countNeighbors.mockImplementation((space, types) => {
                if (types.includes(TileType.Tree)) return 4;
                return 0;
            });

            const result = emptyTileHandler.updateState(space as unknown as BoardSpace, gameManager as unknown as GameManager);

            expect(result).toStrictEqual({
                change: SpaceChange.Replace,
                replaceTile: new Tile(TileType.Tree, 1, TileState.Neutral)
            });
        })

        it('should create a people tile if people growing conditions are met', () => {
            const emptyTileHandler = new EmptyTileHandler();
            const gameManager = createMockGameManager();
            const space: Partial<BoardSpace> = {
                tile: null,
                placeTile: vi.fn(),
                removeTile: vi.fn()
            };

            // @ts-ignore `space` not needed for mocking
            gameManager.countNeighbors.mockImplementation((space, types) => {
                if (types.includes(TileType.People)) return 1;
                if (types.includes(TileType.Power)) return 1;
                if (types.includes(TileType.Farm)) return 2;
                return 0;
            });

            const result = emptyTileHandler.updateState(space as unknown as BoardSpace, gameManager as unknown as GameManager);

            expect(result).toStrictEqual({
                change: SpaceChange.Replace,
                replaceTile: new Tile(TileType.People, 1, TileState.Neutral)
            });
        });

        it('should create a waste tile if waste growing conditions are met', () => {
            const emptyTileHandler = new EmptyTileHandler();
            const gameManager = createMockGameManager();
            const space: Partial<BoardSpace> = {
                tile: null,
                placeTile: vi.fn(),
                removeTile: vi.fn()
            };

            // @ts-ignore `space` not needed for mocking
            gameManager.countNeighbors.mockImplementation((space, types) => {
                if (types.includes(TileType.Waste)) return 3;
                return 0;
            });

            const result = emptyTileHandler.updateState(space as unknown as BoardSpace, gameManager as unknown as GameManager);

            expect(result).toStrictEqual({
                change: SpaceChange.Replace,
                replaceTile: new Tile(TileType.Waste, 1, TileState.Neutral)
            });
        })
    })

    describe('WasteTileHandler', () => {
        it('should be removed if there are enough tree neighbors', () => {
            const wasteTileHandler = new WasteTileHandler();
            const gameManager = createMockGameManager();
            const space = createMockBoardSpace(TileType.Waste, 1, TileState.Neutral);

            // @ts-ignore `space` not needed for mocking
            gameManager.countNeighbors.mockImplementation((space, types) => {
                if (types.includes(TileType.Tree)) return 4;
                return 0;
            });

            const result = wasteTileHandler.updateState(space as unknown as BoardSpace, gameManager as unknown as GameManager);

            expect(result).toStrictEqual({
                change: SpaceChange.Remove,
            });
        })
    })
});
