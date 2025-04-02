import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import {
  evaluateRules,
  TileRuleConfig,
  executeTileBoardUpdate,
  TileRuleAction,
  TileActionResult,
} from './TileRules';
import { Tile, TileState, TileType } from './Tile';
import { BoardSpace } from './BoardSpace';

describe('TileRules', () => {
  const mockTreeRules: TileRuleConfig = {
    type: TileType.Tree,
    rules: [
      {
        result: 'thriving',
        combineConditions: 'AND',
        priority: 1,
        conditions: [
          {
            kind: 'single',
            type: TileType.Tree,
            count: 3,
            evaluation: 'gteq',
          },
        ],
      },
      {
        result: 'struggling',
        combineConditions: 'OR',
        priority: 2,
        conditions: [
          {
            kind: 'single',
            type: TileType.Tree,
            count: 0,
            evaluation: 'eq',
          },
          {
            kind: 'single',
            type: TileType.People,
            count: 5,
            evaluation: 'gteq',
          },
          {
            kind: 'single',
            type: TileType.Power,
            count: 3,
            evaluation: 'gteq',
          },
          {
            kind: 'single',
            type: TileType.Tree,
            count: 5,
            evaluation: 'gteq',
          },
        ],
      },
    ],
    results: [],
  };
  it('should return "thriving" if thriving conditions are met', () => {
    // Arrange
    const neighborCounts = {
      [TileType.Tree]: {
        raw: 3,
        calculated: 3,
      },
    };

    // Act
    const result = evaluateRules(neighborCounts, mockTreeRules);

    // Assert
    expect(result).toBe('thriving');
  });

  it('should return "struggling" if struggling conditions are met', () => {
    // Arrange
    const neighborCounts = {
      [TileType.Tree]: {
        raw: 0,
        calculated: 0,
      },
    };

    // Act
    const result = evaluateRules(neighborCounts, mockTreeRules);

    // Assert
    expect(result).toBe('struggling');
  });

  it('should prioritize rules if multiple conditions are met', () => {
    // Arrange
    const neighborCounts = {
      [TileType.Tree]: { raw: 3, calculated: 3 }, // Tree thriving condition
      [TileType.Power]: { raw: 3, calculated: 3 }, // Tree struggling condition
    };

    // Act
    const result = evaluateRules(neighborCounts, mockTreeRules);

    // Assert
    expect(result).toBe('struggling');
  });

  it('should handle multiple conditions for same tile type', () => {
    // Arrange
    const peopleTooFew = {
      [TileType.People]: { raw: 0, calculated: 0 },
    };
    const peopleJustRight = {
      [TileType.People]: { raw: 3, calculated: 3 },
    };
    const peopleTooMany = {
      [TileType.People]: { raw: 5, calculated: 5 },
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
      [TileType.People]: { raw: 5, calculated: 5 },
      [TileType.Farm]: { raw: 2, calculated: 2 },
    };
    const negativeEvalCounts = {
      [TileType.People]: { raw: 3, calculated: 3 },
      [TileType.Farm]: { raw: 2, calculated: 2 },
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

  it('should handle checking calculated counts', () => {
    // Arrange
    const mockRules: TileRuleConfig = {
      type: TileType.Tree,
      rules: [
        {
          result: 'thriving',
          combineConditions: 'AND',
          priority: 1,
          conditions: [
            {
              kind: 'single',
              type: TileType.Tree,
              count: 3,
              evaluation: 'gteq',
              useCalculated: true,
            },
          ],
        },
      ],
      results: [],
    };
    const neighborCounts = {
      [TileType.Tree]: {
        raw: 1,
        calculated: 3,
      },
    };

    // Act
    const result = evaluateRules(neighborCounts, mockRules);

    // Assert
    expect(result).toBe('thriving');
  });

  it('should handle checking calculated counts on combined rules', () => {
    // Arrange
    const mockRules: TileRuleConfig = {
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
              difference: 5,
              evaluation: 'gteq',
              useCalculated: true,
            },
          ],
        },
      ],
      results: [],
    };
    const neighborCounts = {
      [TileType.People]: {
        raw: 1,
        calculated: 8,
      },
      [TileType.Farm]: {
        raw: 1,
        calculated: 2,
      },
    };

    // Act
    const result = evaluateRules(neighborCounts, mockRules);

    // Assert
    expect(result).toBe('struggling');
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
        isOccupied: vi.fn(),
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

    it('should use default action if action is null', () => {
      // Arrange
      const action = null;
      const config = [
        {
          name: 'struggling',
          remove: true,
        },
        {
          name: 'default',
          updateState: {
            unhealthy: TileState.Dead,
            neutral: TileState.Unhealthy,
            healthy: TileState.Neutral,
          },
        },
      ] as TileActionResult[];
      mockTile.state = TileState.Healthy;

      // Act
      executeTileBoardUpdate(action, mockTile, mockBoardSpace, config);

      // Assert
      expect(mockTile.upgrade).not.toHaveBeenCalled();
      expect(mockTile.downgrade).not.toHaveBeenCalled();
      expect(mockBoardSpace.placeTile).not.toHaveBeenCalled();
      expect(mockBoardSpace.removeTile).not.toHaveBeenCalled();

      expect(mockTile.setState).toHaveBeenCalled();
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

      it('should only remove tile if currently at min, not due to downgrade', () => {
        // Arrange
        const action: TileRuleAction = 'struggling';
        const config = [
          {
            name: 'struggling',
            updateState: {
              neutral: 'unhealthy',
              unhealthy: 'unhealthy',
              healthy: 'neutral',
            },
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
        const tile = new Tile(TileType.Tree, 1, TileState.Neutral);

        // Act
        executeTileBoardUpdate(action, tile, mockBoardSpace, config);

        // Assert
        expect(tile.state).toBe(TileState.Unhealthy);
        expect(mockBoardSpace.removeTile).not.toHaveBeenCalled();
      });

      it('should replace a tile if atMin.replace option exists', () => {
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
                replace: {
                  type: TileType.Waste,
                  level: 1,
                  state: TileState.Neutral,
                },
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
        expect(mockBoardSpace.placeTile).toHaveBeenCalled();
      });
    });

    it('should spawn a new tile', () => {
      // Arrange
      const action = 'spawn tree';
      const config = [
        {
          name: 'spawn tree',
          spawnTile: {
            type: 'tree',
            state: 'neutral',
            level: 1,
          },
        },
      ] as TileActionResult[];
      mockTile.state = TileState.Unhealthy;
      (mockBoardSpace.isOccupied as Mock).mockReturnValue(false);

      // Act
      executeTileBoardUpdate(action, mockTile, mockBoardSpace, config);

      // Assert
      expect(mockBoardSpace.isOccupied).toHaveBeenCalled();
      expect(mockBoardSpace.placeTile).toHaveBeenCalled();
    });

    it('should replace a tile with new tile if tile exists on space already', () => {
      // Arrange
      const action = 'spawn tree';
      const config = [
        {
          name: 'spawn tree',
          spawnTile: {
            type: 'tree',
            state: 'neutral',
            level: 1,
          },
        },
      ] as TileActionResult[];
      mockTile.state = TileState.Unhealthy;
      (mockBoardSpace.isOccupied as Mock).mockReturnValue(true);

      // Act
      executeTileBoardUpdate(action, mockTile, mockBoardSpace, config);

      // Assert
      expect(mockBoardSpace.isOccupied).toHaveBeenCalled();
      expect(mockBoardSpace.removeTile).toHaveBeenCalled();
      expect(mockBoardSpace.placeTile).toHaveBeenCalled();
    });
  });
});
