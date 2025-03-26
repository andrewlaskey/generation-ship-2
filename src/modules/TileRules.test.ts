import { describe, expect, it } from "vitest";
import { evaluateRules, treeRules, farmRules, TileRuleConfig } from "./TileRules";
import { TileType } from "./Tile";

describe('TileRules', () => {
    it('should return "thriving" if thriving conditions are met', () => {
        // Arrange
        const neighborCounts = {
            [TileType.Tree]: 3
        }

        // Act
        const result = evaluateRules(neighborCounts, treeRules);

        // Assert
        expect(result).toBe('thriving');
    });

    it('should return "struggling" if struggling conditions are met', () => {
        // Arrange
        const neighborCounts = {
            [TileType.Tree]: 0
        }

        // Act
        const result = evaluateRules(neighborCounts, treeRules);

        // Assert
        expect(result).toBe('struggling');
    });

    it('should prioritize rules if multiple conditions are met', () => {
        // Arrange
        const neighborCounts = {
            [TileType.Tree]: 3, // Tree thriving condition
            [TileType.Power]: 3 // Tree struggling condition
        }

        // Act
        const result = evaluateRules(neighborCounts, treeRules);

        // Assert
        expect(result).toBe('struggling');
    });

    it('should handle multiple conditions for same tile type', () => {
        // Arrange
        const peopleTooFew = {
            [TileType.People]: 0,
        }
        const peopleJustRight = {
            [TileType.People]: 3,
        }
        const peopleTooMany = {
            [TileType.People]: 5,
        }
        const rules: TileRuleConfig = {
            type: TileType.Farm,
            rules: [
                {
                    result: 'thriving',
                    combineConditions: 'AND',
                    priority: 1,
                    conditions: [
                        {
                            kind: 'single',
                            type: TileType.People,
                            count: 1,
                            evaluation: 'gt'
                        },
                        {
                            kind: 'single',
                            type: TileType.People,
                            count: 4,
                            evaluation: 'lteq'
                        },
                    ]
                }
            ]
        }

        // Act
        const tooFew = evaluateRules(peopleTooFew, rules);
        const tooMany = evaluateRules(peopleTooMany, rules);
        const justRight = evaluateRules(peopleJustRight, rules);

        // Assert
        expect(tooFew).toBeNull();
        expect(tooMany).toBeNull();
        expect(justRight).toBe('thriving');
    });

    it('should handle comparison conditions', () => {
        // Arrange
        const positiveEvalCounts = {
            [TileType.People]: 5,
            [TileType.Farm]: 2
        };
        const negativeEvalCounts = {
            [TileType.People]: 3,
            [TileType.Farm]: 2
        };

        const rules: TileRuleConfig = {
            type: TileType.Farm,
            rules: [
                {
                    result: 'struggling',
                    combineConditions: 'AND',
                    priority: 1,
                    conditions: [
                        {
                            kind: 'comparison',
                            leftType: TileType.People,
                            rightType: TileType.Farm,
                            difference: 2,
                            evaluation: 'gteq'
                        }
                    ]
                }
            ]
        }

        // Act
        const positiveResult = evaluateRules(positiveEvalCounts, rules);
        const negativeResult = evaluateRules(negativeEvalCounts, rules);

        // Assert
        expect(positiveResult).toBe('struggling');
        expect(negativeResult).toBeNull();
    });
})