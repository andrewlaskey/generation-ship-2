import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TileBlock } from './TileBlock';
import { Tile, TileType, TileState } from './Tile';
import { GameBoard } from './GameBoard';
import { BoardSpace } from './BoardSpace';

// Mocking the BoardSpace class
const createMockBoardSpace = (x: number, y: number): Partial<BoardSpace> => ({
  tile: null,
  history: [],
  x,
  y,
  placeTile: vi.fn(),
  removeTile: vi.fn(),
  isOccupied: vi.fn().mockReturnValue(false),
  getHistory: vi.fn().mockReturnValue([]), // Assuming this method returns the history
});

// Mocking the GameBoard class with BoardSpaces
const createMockGameBoard = (size: number): Partial<GameBoard> => {
  const spaces: BoardSpace[] = [];

  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      spaces.push(createMockBoardSpace(x, y) as BoardSpace);
    }
  }

  return {
    size,
    getSpace: vi.fn((x: number, y: number) => {
      const space = spaces.find(space => space.x == x && space.y == y);

      if (space) {
        return space as BoardSpace;
      }

      return null;
    }),
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
    const space2 = gameBoard.getSpace!(1, 0) as BoardSpace;

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
    const space2 = gameBoard.getSpace!(0, 1) as BoardSpace;

    expect(space1.placeTile).toHaveBeenCalledWith(tile1);
    expect(space2.placeTile).toHaveBeenCalledWith(tile2);
  });

  it('should remove tiles if TileBlock contains null', () => {
    const tile1 = new Tile(TileType.Tree, 1, TileState.Neutral);
    const tileBlock = new TileBlock([tile1, null]);

    tileBlock.placeOnGrid(0, 0, gameBoard as GameBoard);

    const space1 = gameBoard.getSpace!(0, 0) as BoardSpace;
    const space2 = gameBoard.getSpace!(1, 0) as BoardSpace;

    expect(space1.placeTile).toHaveBeenCalledWith(tile1); // Tile placed in the first space
    expect(space2.removeTile).toHaveBeenCalled(); // Null causes removal of tile in the second space
  });

  it('should throw an error if placed out of bounds horizontally', () => {
    const tile1 = new Tile(TileType.Tree, 1, TileState.Neutral);
    const tile2 = new Tile(TileType.Farm, 1, TileState.Neutral);
    const tileBlock = new TileBlock([tile1, tile2]);

    expect(() => {
      tileBlock.placeOnGrid(4, 0, gameBoard as GameBoard); // Out of bounds on the right
    }).toThrowError('Invalid placement: out of bounds');
  });

  it('should throw an error if placed out of bounds vertically after rotation', () => {
    const tile1 = new Tile(TileType.Tree, 1, TileState.Neutral);
    const tile2 = new Tile(TileType.Farm, 1, TileState.Neutral);
    const tileBlock = new TileBlock([tile1, tile2]);

    tileBlock.rotate(); // Rotate 90 degrees to vertical

    expect(() => {
      tileBlock.placeOnGrid(0, 4, gameBoard as GameBoard); // Out of bounds vertically
    }).toThrowError('Invalid placement: out of bounds');
  });

  it('should rotate TileBlock correctly in all four directions', () => {
    const treeTile = new Tile(TileType.Tree, 1, TileState.Neutral);
    const houseTile = new Tile(TileType.People, 1, TileState.Neutral);
    const tileBlock = new TileBlock([treeTile, houseTile]);
    gameBoard = createMockGameBoard(3);

    const x = 1;
    const y = 1;

    // Initial rotation (0 degrees)
    // 0️⃣0️⃣0️⃣
    // 0️⃣🌳🏠
    // 0️⃣0️⃣0️⃣
    tileBlock.placeOnGrid(x, y, gameBoard as GameBoard);
    let space1 = gameBoard.getSpace!(x, y) as BoardSpace;
    let space2 = gameBoard.getSpace!(x + 1, y) as BoardSpace;

    expect(space1.placeTile).toHaveBeenCalledWith(treeTile); // 🌳
    expect(space2.placeTile).toHaveBeenCalledWith(houseTile); // 🏠

    // First rotation (90 degrees)
    // 0️⃣0️⃣0️⃣
    // 0️⃣🌳0️⃣
    // 0️⃣🏠0️⃣
    tileBlock.rotate();
    tileBlock.placeOnGrid(x, y, gameBoard as GameBoard);
    space1 = gameBoard.getSpace!(x, y) as BoardSpace;
    space2 = gameBoard.getSpace!(x, y + 1) as BoardSpace;

    expect(space1.placeTile).toHaveBeenCalledWith(treeTile); // 🌳
    expect(space2.placeTile).toHaveBeenCalledWith(houseTile); // 🏠

    // // Second rotation (180 degrees)
    // 0️⃣0️⃣0️⃣
    // 🏠🌳0️⃣
    // 0️⃣0️⃣0️⃣
    tileBlock.rotate();
    tileBlock.placeOnGrid(x, y, gameBoard as GameBoard);
    space1 = gameBoard.getSpace!(x, y) as BoardSpace;
    space2 = gameBoard.getSpace!(x - 1, y) as BoardSpace;

    expect(space1.placeTile).toHaveBeenCalledWith(treeTile); // 🌳
    expect(space2.placeTile).toHaveBeenCalledWith(houseTile); // 🏠

    // Third rotation (270 degrees):
    // 0️⃣🏠0️⃣
    // 0️⃣🌳0️⃣
    // 0️⃣0️⃣0️⃣
    tileBlock.rotate();
    tileBlock.placeOnGrid(x, y, gameBoard as GameBoard);
    space1 = gameBoard.getSpace!(x, y) as BoardSpace;
    space2 = gameBoard.getSpace!(x, y - 1) as BoardSpace;

    expect(space1.placeTile).toHaveBeenCalledWith(treeTile); // 🌳
    expect(space2.placeTile).toHaveBeenCalledWith(houseTile); // 🏠
  });

  it('should return the two tiles regardless of orientation', () => {
    const treeTile = new Tile(TileType.Tree, 1, TileState.Neutral);
    const houseTile = new Tile(TileType.People, 1, TileState.Neutral);
    const tileBlock = new TileBlock([treeTile, houseTile]);

    const tiles: (Tile | null)[] = tileBlock.getTiles();

    expect(tiles).toStrictEqual([treeTile, houseTile]);
  });

  it('should be able to place horizontal tile on last grid row', () => {
    const treeTile = new Tile(TileType.Tree, 1, TileState.Neutral);
    const houseTile = new Tile(TileType.People, 1, TileState.Neutral);
    const tileBlock = new TileBlock([treeTile, houseTile]);
    gameBoard = createMockGameBoard(3);

    const x = 1;
    const y = (gameBoard.size as number) - 1;

    expect(() => {
      tileBlock.placeOnGrid(x, y, gameBoard as GameBoard);
    }).not.toThrow();
  });

  it('should not be able to place a downward facing tile block on last grid row', () => {
    const treeTile = new Tile(TileType.Tree, 1, TileState.Neutral);
    const houseTile = new Tile(TileType.People, 1, TileState.Neutral);
    const tileBlock = new TileBlock([treeTile, houseTile]);
    gameBoard = createMockGameBoard(3);

    const x = 1;
    const y = (gameBoard.size as number) - 1;

    tileBlock.rotate();
    expect(() => {
      tileBlock.placeOnGrid(x, y, gameBoard as GameBoard);
    }).toThrowError('Invalid placement: out of bounds');
  });
});
