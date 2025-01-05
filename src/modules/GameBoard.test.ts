// gameboard.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameBoard, GameBoardRenderFn } from './GameBoard';
import { Tile, TileState, TileType } from './Tile';
import { BoardSpace } from './BoardSpace';

describe('GameBoard', () => {
    let board: GameBoard;
    let tile1: Tile;
    let tile2: Tile;

    beforeEach(() => {
        board = new GameBoard(5); // Initialize a 5x5 board
        tile1 = new Tile("power", 1, 'neutral');
        tile2 = new Tile("farm", 2, 'healthy');
    });

    it('should create a game board of the correct size', () => {
        expect(board.getSpace(0, 0)).toBeInstanceOf(BoardSpace);
        expect(board.getSpace(4, 4)).toBeInstanceOf(BoardSpace);
        expect(board.getSpace(5, 5)).toBeNull(); // Out of bounds
    });

    it('should place a tile on the board at valid coordinates', () => {
        const result = board.placeTileAt(2, 2, tile1);
        expect(result).toBe(true); // Tile should be placed successfully
        const space = board.getSpace(2, 2);
        expect(space?.tile).toBe(tile1); // BoardSpace should hold the tile
    });

    it('should be able to place a tile on an occupied space', () => {
        board.placeTileAt(2, 2, tile1);
        const result = board.placeTileAt(2, 2, tile2);
        expect(result).toBe(true); // Second tile placement should fail
    });

    it('should return null for invalid coordinates', () => {
        expect(board.getSpace(-1, -1)).toBeNull(); // Invalid negative coordinates
        expect(board.getSpace(10, 10)).toBeNull(); // Out of bounds coordinates
    });

    it('should remove a tile from the board at valid coordinates', () => {
        board.placeTileAt(2, 2, tile1);
        const removeResult = board.removeTileAt(2, 2);
        expect(removeResult).toBe(true); // Tile should be removed
        const space = board.getSpace(2, 2);
        expect(space?.tile).toBeNull(); // BoardSpace should be empty
    });

    it('should not remove a tile from an empty space', () => {
        const result = board.removeTileAt(2, 2);
        expect(result).toBe(false); // No tile to remove
    });

    it('should return correct occupied state for a space', () => {
        const space = board.getSpace(3, 3);
        expect(space?.isOccupied()).toBe(false); // Initially empty
        board.placeTileAt(3, 3, tile1);
        expect(space?.isOccupied()).toBe(true); // Now occupied
    });

    it('should correctly display the board state', () => {
        board.placeTileAt(2, 2, tile1);
        board.placeTileAt(3, 3, tile2);
        const consoleSpy = vi.spyOn(console, 'log'); // Spy on console.log to verify display
        board.displayBoard();
        expect(consoleSpy).toHaveBeenCalled(); // Ensure display method logs something
        consoleSpy.mockRestore(); // Restore console.log after the test
    });

    it('should highlight board space at coordinates', () => {
        board.toggleSpaceHighlight(2, 2);
        const space = board.getSpace(2, 2);
        expect(space?.isHighlighted).toBe(true);
    })

    it('should remove highlight if board space already highlighted', () => {
        // toggle once
        board.toggleSpaceHighlight(2, 2);

        // toggle again
        board.toggleSpaceHighlight(2, 2);
        
        const space = board.getSpace(2, 2);
        expect(space?.isHighlighted).toBe(false);
    })

    it('should set the board space to correct value', () => {
        const space = board.getSpace(2, 2);

        // set true
        board.toggleSpaceHighlight(2, 2, true);
        expect(space?.isHighlighted).toBe(true);

        // manual set true
        board.toggleSpaceHighlight(2, 2, true);
        expect(space?.isHighlighted).toBe(true);
        
        // and set false
        board.toggleSpaceHighlight(2, 2, false);
        expect(space?.isHighlighted).toBe(false);
    })

    it('should return a count of the tile types', () => {
        board.placeTileAt(2, 2, tile1);
        board.placeTileAt(1, 1, tile2);
        expect(board.countTileTypes()).toStrictEqual({
            farm: 1,
            power: 1
        })
    })

    it('should return an adjusted count of tile types', () => {
        const highLevelTile = new Tile(TileType.Tree, 3, TileState.Neutral);
        board.placeTileAt(1,1, highLevelTile);
        expect(board.countTileTypes(true)).toStrictEqual({
            tree: 3
        })
    })

    it('should set the default starting condition', () => {
        board.setStartingCondition()
        
        const treeSpace = board.getSpace(2, 2);
        expect(treeSpace?.tile?.type).toBe('tree')

        const farmSpace = board.getSpace(2, 1);
        expect(farmSpace?.tile?.type).toBe('farm')

        const peopleSpace = board.getSpace(1, 2);
        expect(peopleSpace?.tile?.type).toBe('people')
    })

    it('should clear the board', () => {
        board.placeTileAt(2, 2, tile1);
        board.placeTileAt(1, 1, tile2);

        board.clearBoard();

        const powerSpace = board.getSpace(2, 2);
        expect(powerSpace?.isOccupied()).toBe(false); // should be empty

        const farmSpace = board.getSpace(1, 1);
        expect(farmSpace?.isOccupied()).toBe(false); // should be empty

        expect(board.countTileTypes()).toStrictEqual({})
    })

    describe('getGrid', () => {
        it('should return the grid as determined by the renderFn', () => {
            board = new GameBoard(2);
            board.placeTileAt(1, 1, tile1);
            board.placeTileAt(0, 0, tile2);


            const renderFn: GameBoardRenderFn<string> = (row: number, col: number, space: BoardSpace): string => {
                return `${row}x${col} - ${space.isOccupied() ? 'X' : 'O'}`; 
            }

            const result = board.getGrid(renderFn);

            expect(result).toStrictEqual(['0x0 - X', '0x1 - O', '1x0 - O', '1x1 - X']);
        })
    })
});
