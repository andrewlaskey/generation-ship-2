// tile.test.ts
import { describe, it, expect } from 'vitest';
import { Tile } from './Tile'; // Adjust the import path as necessary

describe('Tile', () => {
    it('should create a tile with valid type, level, and state', () => {
        const tile = new Tile('tree', 1, 'neutral');
        expect(tile.type).toBe('tree');
        expect(tile.level).toBe(1);
        expect(tile.state).toBe('neutral');
    });

    it('should throw an error for invalid type', () => {
        expect(() => new Tile('invalidType', 1, 'neutral')).toThrowError('Invalid tile type');
    });

    it('should throw an error for invalid level', () => {
        expect(() => new Tile('tree', 5, 'neutral')).toThrowError('Invalid tile level');
    });

    it('should throw an error for invalid state', () => {
        expect(() => new Tile('tree', 1, 'invalidState')).toThrowError('Invalid tile state');
    });

    it('should correctly update the state of a tile', () => {
        const tile = new Tile('farm', 2, 'neutral');
        tile.setState('healthy');
        expect(tile.state).toBe('healthy');
    });

    it('should throw an error when updating to an invalid state', () => {
        const tile = new Tile('power', 3, 'neutral');
        expect(() => tile.setState('invalidState')).toThrowError('Invalid tile state');
    });

    it('should correctly upgrade and downgrade levels within valid range', () => {
        const tile = new Tile('people', 1, 'neutral');
        tile.upgrade();
        expect(tile.level).toBe(2);
        tile.downgrade();
        expect(tile.level).toBe(1);
    });

    it('should not upgrade beyond the maximum level', () => {
        const tile = new Tile('power', 3, 'neutral');
        tile.upgrade();
        expect(tile.level).toBe(3); // Level should remain at max
    });

    it('should not downgrade below the minimum level', () => {
        const tile = new Tile('farm', 1, 'neutral');
        tile.downgrade();
        expect(tile.level).toBe(1); // Level should remain at min
    });
});
