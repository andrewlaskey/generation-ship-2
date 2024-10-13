// boardSpace.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { BoardSpace } from './BoardSpace';  // Adjust the import path as necessary
import { Tile } from './Tile';  // Adjust the import path for Tile class

describe('BoardSpace', () => {
    let boardSpace: BoardSpace;
    let tile1: Tile;
    let tile2: Tile;

    beforeEach(() => {
        boardSpace = new BoardSpace(0, 0);
        tile1 = new Tile('tree', 1, 'neutral');
        tile2 = new Tile('farm', 2, 'healthy');
    });

    it('should initialize an empty board space with correct coordinates', () => {
        expect(boardSpace.x).toBe(0);
        expect(boardSpace.y).toBe(0);
        expect(boardSpace.isOccupied()).toBe(false);
    });

    it('should place a tile in the board space', () => {
        boardSpace.placeTile(tile1);
        expect(boardSpace.isOccupied()).toBe(true);
        expect(boardSpace.tile).toBe(tile1);
    });

    it('should not allow placing a tile in an already occupied space', () => {
        boardSpace.placeTile(tile1);
        expect(() => boardSpace.placeTile(tile2)).toThrowError('Space already occupied.');
    });

    it('should remove a tile from the board space', () => {
        boardSpace.placeTile(tile1);
        boardSpace.removeTile();
        expect(boardSpace.isOccupied()).toBe(false);
        expect(boardSpace.tile).toBeNull();
    });

    it('should not allow removing a tile from an empty space', () => {
        expect(() => boardSpace.removeTile()).toThrowError('No tile to remove.');
    });

    it('should log history when placing a tile', () => {
        boardSpace.placeTile(tile1);
        const history = boardSpace.getHistory();
        expect(history.length).toBe(1);
        expect(history[0].action).toBe('placed');
        expect(history[0].tileType).toBe('tree');
    });

    it('should log history when removing a tile', () => {
        boardSpace.placeTile(tile1);
        boardSpace.removeTile();
        const history = boardSpace.getHistory();
        expect(history.length).toBe(2);
        expect(history[0].action).toBe('placed');
        expect(history[1].action).toBe('removed');
        expect(history[1].tileType).toBe('tree');
    });

    it('should maintain a history of all actions in the correct order', () => {
        boardSpace.placeTile(tile1);
        boardSpace.removeTile();
        boardSpace.placeTile(tile2);

        const history = boardSpace.getHistory();
        expect(history.length).toBe(3);
        expect(history[0].action).toBe('placed');
        expect(history[0].tileType).toBe('tree');
        expect(history[1].action).toBe('removed');
        expect(history[1].tileType).toBe('tree');
        expect(history[2].action).toBe('placed');
        expect(history[2].tileType).toBe('farm');
    });
});
