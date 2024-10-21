import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TileBlock } from './TileBlock';
import { Tile, TileType, TileState } from './Tile';
import { GameBoard } from './GameBoard';
import { BoardSpace } from './BoardSpace';

// Mocking the BoardSpace class
const createMockBoardSpace = (): Partial<BoardSpace> => ({
    tile: null,
    history: [],
    x: 0,
    y: 0,
    placeTile: vi.fn(),
    removeTile: vi.fn(),
    isOccupied: vi.fn().mockReturnValue(false),
    getHistory: vi.fn().mockReturnValue([]),  // Assuming this method returns the history
});

// Mocking the GameBoard class with BoardSpaces
const createMockGameBoard = (size: number): Partial<GameBoard> => {
    const spaces: BoardSpace[][] = Array.from({ length: size }, () =>
        Array.from({ length: size }, () => createMockBoardSpace() as unknown as BoardSpace)
    );

    return {
        size,
        getSpace: vi.fn((x: number, y: number) => (spaces[x] && spaces[x][y]) ? spaces[x][y] : null),
    };
};

describe('TileBlock', () => {
    let gameBoard: Partial<GameBoard>;

    beforeEach(() => {
        gameBoard = createMockGameBoard(5); // Creating a mock GameBoard of size 5x5
    });

    it('should place TileBlock tiles horizontally by default (0 rotation)', () => {
        const tile1 = new Tile(TileType.Tree, 1, TileState.Neutral);
        const tile2 = new Tile(TileType.Farm, 1, TileState.Neutral);
        const tileBlock = new TileBlock([tile1, tile2]);

        tileBlock.placeOnGrid(0, 0, gameBoard as GameBoard);

        const space1 = gameBoard.getSpace!(0, 0) as BoardSpace;
        const space2 = gameBoard.getSpace!(0, 1) as BoardSpace;

        expect(space1.placeTile).toHaveBeenCalledWith(tile1);
        expect(space2.placeTile).toHaveBeenCalledWith(tile2);
    });

    it('should place TileBlock tiles vertically after rotation (90 degrees)', () => {
        const tile1 = new Tile(TileType.Tree, 1, TileState.Neutral);
        const tile2 = new Tile(TileType.Farm, 1, TileState.Neutral);
        const tileBlock = new TileBlock([tile1, tile2]);

        tileBlock.rotate(); // Rotate 90 degrees to vertical
        tileBlock.placeOnGrid(0, 0, gameBoard as GameBoard);

        const space1 = gameBoard.getSpace!(0, 0) as BoardSpace;
        const space2 = gameBoard.getSpace!(1, 0) as BoardSpace;

        expect(space1.placeTile).toHaveBeenCalledWith(tile1);
        expect(space2.placeTile).toHaveBeenCalledWith(tile2);
    });

    it('should remove tiles if TileBlock contains null', () => {
        const tile1 = new Tile(TileType.Tree, 1, TileState.Neutral);
        const tileBlock = new TileBlock([tile1, null]);

        tileBlock.placeOnGrid(0, 0, gameBoard as GameBoard);

        const space1 = gameBoard.getSpace!(0, 0) as BoardSpace;
        const space2 = gameBoard.getSpace!(0, 1) as BoardSpace;

        expect(space1.placeTile).toHaveBeenCalledWith(tile1);  // Tile placed in the first space
        expect(space2.removeTile).toHaveBeenCalled();  // Null causes removal of tile in the second space
    });

    it('should throw an error if placed out of bounds horizontally', () => {
        const tile1 = new Tile(TileType.Tree, 1, TileState.Neutral);
        const tile2 = new Tile(TileType.Farm, 1, TileState.Neutral);
        const tileBlock = new TileBlock([tile1, tile2]);

        expect(() => {
            tileBlock.placeOnGrid(0, 4, gameBoard as GameBoard);  // Out of bounds on the right
        }).toThrowError('Invalid placement: out of bounds');
    });

    it('should throw an error if placed out of bounds vertically after rotation', () => {
        const tile1 = new Tile(TileType.Tree, 1, TileState.Neutral);
        const tile2 = new Tile(TileType.Farm, 1, TileState.Neutral);
        const tileBlock = new TileBlock([tile1, tile2]);

        tileBlock.rotate(); // Rotate 90 degrees to vertical

        expect(() => {
            tileBlock.placeOnGrid(4, 0, gameBoard as GameBoard);  // Out of bounds vertically
        }).toThrowError('Invalid placement: out of bounds');
    });

    it('should rotate the TileBlock and change its layout', () => {
        const tile1 = new Tile(TileType.Tree, 1, TileState.Neutral);
        const tile2 = new Tile(TileType.Farm, 1, TileState.Neutral);
        const tileBlock = new TileBlock([tile1, tile2]);

        tileBlock.rotate();  // Rotate 90 degrees to vertical layout
        tileBlock.placeOnGrid(0, 0, gameBoard as GameBoard);

        const space1 = gameBoard.getSpace!(0, 0) as BoardSpace;
        const space2 = gameBoard.getSpace!(1, 0) as BoardSpace;

        expect(space1.placeTile).toHaveBeenCalledWith(tile1);
        expect(space2.placeTile).toHaveBeenCalledWith(tile2);
    });

    it('should rotate TileBlock correctly in all four directions', () => {
        const treeTile = new Tile(TileType.Tree, 1, TileState.Neutral);
        const houseTile = new Tile(TileType.People, 1, TileState.Neutral);
        const tileBlock = new TileBlock([treeTile, houseTile]);

        // Initial rotation (0 degrees): "🌳🏠"
        tileBlock.placeOnGrid(0, 0, gameBoard as GameBoard);
        let space1 = gameBoard.getSpace!(0, 0) as BoardSpace;
        let space2 = gameBoard.getSpace!(0, 1) as BoardSpace;

        expect(space1.placeTile).toHaveBeenCalledWith(treeTile);  // 🌳
        expect(space2.placeTile).toHaveBeenCalledWith(houseTile);  // 🏠

        // First rotation (90 degrees): "🌳🏠" becomes "🌳 🏠"
        tileBlock.rotate();
        tileBlock.placeOnGrid(0, 0, gameBoard as GameBoard);
        space1 = gameBoard.getSpace!(0, 0) as BoardSpace;
        space2 = gameBoard.getSpace!(1, 0) as BoardSpace;

        expect(space1.placeTile).toHaveBeenCalledWith(treeTile);  // 🌳
        expect(space2.placeTile).toHaveBeenCalledWith(houseTile);  // 🏠

        // // Second rotation (180 degrees): "🌳 🏠" becomes "🏠🌳"
        tileBlock.rotate();
        tileBlock.placeOnGrid(0, 0, gameBoard as GameBoard);
        space1 = gameBoard.getSpace!(0, 0) as BoardSpace;
        space2 = gameBoard.getSpace!(0, 1) as BoardSpace;

        expect(space1.placeTile).toHaveBeenCalledWith(houseTile);  // 🏠
        expect(space2.placeTile).toHaveBeenCalledWith(treeTile);  // 🌳

        // Third rotation (270 degrees): "🏠🌳" becomes "🏠 🌳"
        tileBlock.rotate();
        tileBlock.placeOnGrid(0, 0, gameBoard as GameBoard);
        space1 = gameBoard.getSpace!(0, 0) as BoardSpace;
        space2 = gameBoard.getSpace!(1, 0) as BoardSpace;

        expect(space1.placeTile).toHaveBeenCalledWith(houseTile);  // 🏠
        expect(space2.placeTile).toHaveBeenCalledWith(treeTile);  // 🌳
    });

    it('should return the two tiles regardless of orientation', () => {
        const treeTile = new Tile(TileType.Tree, 1, TileState.Neutral);
        const houseTile = new Tile(TileType.People, 1, TileState.Neutral);
        const tileBlock = new TileBlock([treeTile, houseTile]);


        const tiles: (Tile | null)[] = tileBlock.getTiles()

        expect(tiles).toStrictEqual([treeTile, houseTile])
    })
});


