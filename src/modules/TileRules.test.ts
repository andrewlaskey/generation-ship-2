import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import {
  evaluateRules,
  treeRules,
  TileRuleConfig,
  executeTileBoardUpdate,
  TileRuleAction,
  TileActionResult,
} from './TileRules';
import { Tile, TileState, TileType } from './Tile';
import { BoardSpace } from './BoardSpace';

describe('TileRules', () => {
  it('should return "thriving" if thriving conditions are met', () => {
    // Arrange
    const neighborCounts = {
      [TileType.Tree]: 3,
    };

    // Act
    const result = evaluateRules(neighborCounts, treeRules);

    // Assert
    expect(result).toBe('thriving');
  });

  it('should return "struggling" if struggling conditions are met', () => {
    // Arrange
    const neighborCounts = {
      [TileType.Tree]: 0,
    };

    // Act
    const result = evaluateRules(neighborCounts, treeRules);

    // Assert
    expect(result).toBe('struggling');
  });

  it('should prioritize rules if multiple conditions are met', () => {
    // Arrange
    const neighborCounts = {
      [TileType.Tree]: 3, // Tree thriving condition
      [TileType.Power]: 3, // Tree struggling condition
    };

    // Act
    const result = evaluateRules(neighborCounts, treeRules);

    // Assert
    expect(result).toBe('struggling');
  });

  it('should handle multiple conditions for same tile type', () => {
    // Arrange
    const peopleTooFew = {
      [TileType.People]: 0,
    };
    const peopleJustRight = {
      [TileType.People]: 3,
    };
    const peopleTooMany = {
      [TileType.People]: 5,
    };
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
              evaluation: 'gt',
            },
            {
              kind: 'single',
              type: TileType.People,
              count: 4,
              evaluation: 'lteq',
            },
          ],
        },
      ],
      results: [],
    };

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
      [TileType.Farm]: 2,
    };
    const negativeEvalCounts = {
      [TileType.People]: 3,
      [TileType.Farm]: 2,
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
              evaluation: 'gteq',
            },
          ],
        },
      ],
      results: [],
    };

    // Act
    const positiveResult = evaluateRules(positiveEvalCounts, rules);
    const negativeResult = evaluateRules(negativeEvalCounts, rules);

    // Assert
    expect(positiveResult).toBe('struggling');
    expect(negativeResult).toBeNull();
  });

  describe('executeTileBoardUpdate', () => {
    let mockTile: Tile;
    let mockBoardSpace: BoardSpace;

    beforeEach(() => {
      vi.clearAllMocks();

      mockTile = {
        upgrade: vi.fn(),
        downgrade: vi.fn(),
        setState: vi.fn(),
      } as unknown as Tile;
      mockBoardSpace = {
        placeTile: vi.fn(),
        removeTile: vi.fn(),
      } as unknown as BoardSpace;
    });

    it('should not do anything if no matching result config for action', () => {
      // Arrange
      const action: TileRuleAction = 'struggling';

      // Act
      executeTileBoardUpdate(action, mockTile, mockBoardSpace, []);

      // Assert
      expect(mockTile.upgrade).not.toHaveBeenCalled();
      expect(mockTile.downgrade).not.toHaveBeenCalled();
      expect(mockTile.setState).not.toHaveBeenCalled();
      expect(mockBoardSpace.placeTile).not.toHaveBeenCalled();
      expect(mockBoardSpace.removeTile).not.toHaveBeenCalled();
    });

    it('should handle removing a tile', () => {
      // Arrange
      const action: TileRuleAction = 'struggling';
      const config = [
        {
          name: 'struggling',
          remove: true,
        },
      ] as TileActionResult[];

      // Act
      executeTileBoardUpdate(action, mockTile, mockBoardSpace, config);

      // Assert
      expect(mockBoardSpace.removeTile).toHaveBeenCalled();
    });

    it('should handle updating a tile state', () => {
      // Arrange
      const action: TileRuleAction = 'thriving';
      const config = [
        {
          name: 'thriving',
          updateState: {
            unhealthy: TileState.Neutral,
            neutral: TileState.Healthy,
            healthy: TileState.Healthy,
          },
        },
      ] as TileActionResult[];
      mockTile.state = TileState.Neutral;

      // Act
      executeTileBoardUpdate(action, mockTile, mockBoardSpace, config);

      // Assert
      expect(mockTile.setState).toHaveBeenCalledWith(TileState.Healthy);
    });

    describe('when upgrading', () => {
      it('should handle upgrading a tile when status conditions are met', () => {
        // Arrange
        const action: TileRuleAction = 'thriving';
        const config = [
          {
            name: 'thriving',
            upgrade: {
              conditions: {
                status: TileState.Healthy,
              },
            },
          },
        ] as TileActionResult[];
        mockTile.state = TileState.Healthy;

        // Act
        executeTileBoardUpdate(action, mockTile, mockBoardSpace, config);

        // Assert
        expect(mockTile.upgrade).toHaveBeenCalled();
      });

      it('should handle update when at max upgrade', () => {
        // Arrange
        const action: TileRuleAction = 'thriving';
        const config = [
          {
            name: 'thriving',
            upgrade: {
              conditions: {
                status: TileState.Healthy,
              },
              atMax: {
                status: TileState.Healthy,
              },
            },
          },
        ] as TileActionResult[];
        mockTile.state = TileState.Healthy;
        (mockTile.upgrade as Mock).mockReturnValue(false);

        // Act
        executeTileBoardUpdate(action, mockTile, mockBoardSpace, config);

        // Assert
        expect(mockTile.upgrade).toHaveBeenCalled();
        expect(mockTile.setState).toHaveBeenCalledWith(TileState.Healthy);
      });
    });

    describe('when downgrading', () => {
      it('should handle downgrading a tile when status conditions are met', () => {
        // Arrange
        const action: TileRuleAction = 'struggling';
        const config = [
          {
            name: 'struggling',
            downgrade: {
              conditions: {
                status: TileState.Unhealthy,
              },
            },
          },
        ] as TileActionResult[];
        mockTile.state = TileState.Unhealthy;

        // Act
        executeTileBoardUpdate(action, mockTile, mockBoardSpace, config);

        // Assert
        expect(mockTile.downgrade).toHaveBeenCalled();
      });

      it('should handle update when at min downgrade', () => {
        // Arrange
        const action: TileRuleAction = 'struggling';
        const config = [
          {
            name: 'struggling',
            downgrade: {
              conditions: {
                status: TileState.Unhealthy,
              },
              atMin: {
                status: TileState.Unhealthy,
              },
            },
          },
        ] as TileActionResult[];
        mockTile.state = TileState.Unhealthy;
        (mockTile.downgrade as Mock).mockReturnValue(false);

        // Act
        executeTileBoardUpdate(action, mockTile, mockBoardSpace, config);

        // Assert
        expect(mockTile.downgrade).toHaveBeenCalled();
        expect(mockTile.setState).toHaveBeenCalledWith(TileState.Unhealthy);
      });

      it('should remove a tile if rule for min downgrade', () => {
        // Arrange
        const action: TileRuleAction = 'struggling';
        const config = [
          {
            name: 'struggling',
            downgrade: {
              conditions: {
                status: TileState.Unhealthy,
              },
              atMin: {
                remove: true,
              },
            },
          },
        ] as TileActionResult[];
        mockTile.state = TileState.Unhealthy;
        (mockTile.downgrade as Mock).mockReturnValue(false);

        // Act
        executeTileBoardUpdate(action, mockTile, mockBoardSpace, config);

        // Assert
        expect(mockTile.downgrade).toHaveBeenCalled();
        expect(mockBoardSpace.removeTile).toHaveBeenCalled();
      });
    });
  });
});
