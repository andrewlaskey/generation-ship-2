import { describe, it, expect, beforeEach } from 'vitest';
import { ScoreObject } from './ScoreObject';

describe('ScoreObject', () => {
    let score: ScoreObject;

    beforeEach(() => {
        // Initialize a new ScoreObject before each test
        score = new ScoreObject('Player Score', 10);
    });

    it('should initialize with the correct name and starting value', () => {
        expect(score.name).toBe('Player Score');
        expect(score.value).toBe(10);
        expect(score.history).toEqual([]); // The history should be empty initially
    });

    it('should update the score value and add the previous value to history', () => {
        score.update(20);
        expect(score.value).toBe(20);
        expect(score.history).toEqual([10]); // The original value should be in the history
    });

    it('should track multiple updates in history', () => {
        score.update(15);
        score.update(25);
        score.update(30);

        expect(score.value).toBe(30);
        expect(score.history).toEqual([10, 15, 25]); // The history should include all previous values
    });

    it('should handle updating to the same value', () => {
        score.update(10);
        expect(score.value).toBe(10);
        expect(score.history).toEqual([10]); // Should still add the previous value to history
    });

    it('should handle negative values correctly', () => {
        score.update(-5);
        expect(score.value).toBe(-5);
        expect(score.history).toEqual([10]); // Previous positive value should be in history
    });
});
