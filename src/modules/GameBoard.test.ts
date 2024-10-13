// gameboard.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameBoard } from './GameBoard';
import { Tile } from './Tile';
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

    it('should not place a tile on an occupied space', () => {
        board.placeTileAt(2, 2, tile1);
        const result = board.placeTileAt(2, 2, tile2);
        expect(result).toBe(false); // Second tile placement should fail
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
});