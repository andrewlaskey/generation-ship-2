import { BoardSpace } from './BoardSpace';
import { Tile, TileState, TileType } from './Tile';

export type EvalOp = 'eq' | 'lt' | 'lteq' | 'gt' | 'gteq';

export type ConditionCombineOp = 'OR' | 'AND';

export type NeighborCounts = Partial<Record<TileType, number>>;

export type TileRuleAction = 'thriving' | 'struggling';

export interface SingleTypeCondition {
  kind: 'single';
  type: TileType;
  count: number;
  evaluation: EvalOp;
}

// A new condition type for comparing two different tile counts
export interface ComparisonCondition {
  kind: 'comparison';
  leftType: TileType;
  rightType: TileType;
  difference: number; // The value to compare with (leftCount - rightCount)
  evaluation: EvalOp;
}

// Union type for all possible conditions
export type TileRuleCondition = SingleTypeCondition | ComparisonCondition;

export interface TileRule {
  result: TileRuleAction | string; // maybe revisit
  conditions: TileRuleCondition[];
  combineConditions: ConditionCombineOp;
  priority: number;
}

export interface StatusTransition {
  [currentStatus: string]: TileState;
}

export interface UpgradeConfig {
  conditions: {
    status?: TileState;
  };
  atMax?: {
    status?: TileState;
  };
}

export interface DowngradeConfig {
  conditions: {
    status?: TileState;
  };
  atMin?: {
    remove?: boolean;
    status?: TileState;
  };
}

export interface SpawnTileConfig {
  type: TileType;
  state: TileState;
  level: number;
}

export interface TileActionResult {
  name: TileRuleAction | string;
  updateState?: StatusTransition;
  upgrade?: UpgradeConfig;
  downgrade?: DowngradeConfig;
  remove?: boolean;
  spawnTile?: SpawnTileConfig;
}

export interface TileRuleConfig {
  type: TileType | 'empty';
  rules: TileRule[];
  results: TileActionResult[];
}

export function evaluateRules(
  neighborCounts: NeighborCounts,
  ruleConfig: TileRuleConfig
): string | null {
  const sortedRules = [...ruleConfig.rules].sort((a, b) => b.priority - a.priority);

  for (const rule of sortedRules) {
    let ruleResult = false;

    const conditionResults = rule.conditions.map(condition => {
      if (condition.kind === 'single') {
        const actualCount = neighborCounts[condition.type] ?? 0;

        switch (condition.evaluation) {
          case 'eq':
            return actualCount === condition.count;
          case 'lt':
            return actualCount < condition.count;
          case 'lteq':
            return actualCount <= condition.count;
          case 'gt':
            return actualCount > condition.count;
          case 'gteq':
            return actualCount >= condition.count;
          default:
            return false;
        }
      } else if (condition.kind === 'comparison') {
        const leftCount = neighborCounts[condition.leftType] ?? 0;
        const rightCount = neighborCounts[condition.rightType] ?? 0;
        const actualDifference = leftCount - rightCount;

        switch (condition.evaluation) {
          case 'eq':
            return actualDifference === condition.difference;
          case 'lt':
            return actualDifference < condition.difference;
          case 'lteq':
            return actualDifference <= condition.difference;
          case 'gt':
            return actualDifference > condition.difference;
          case 'gteq':
            return actualDifference >= condition.difference;
          default:
            return false;
        }
      }

      return false;
    });

    if (rule.combineConditions === 'AND') {
      ruleResult = conditionResults.every(result => result);
    } else if (rule.combineConditions === 'OR') {
      ruleResult = conditionResults.some(result => result);
    }

    if (ruleResult) {
      return rule.result;
    }
  }

  return null;
}

export function executeTileBoardUpdate(
  action: string,
  tile: Tile | null,
  space: BoardSpace,
  actionConfig: TileActionResult[]
): void {
  const selectedConfig = actionConfig.find(({ name }) => name === action);

  if (selectedConfig) {
    const { remove, updateState, upgrade, downgrade, spawnTile } = selectedConfig;
    const currentState = tile ? tile.state : null;

    if (remove) {
      space.removeTile();
    }

    if (updateState && tile && currentState) {
      const newState = updateState[currentState];

      if (newState) {
        tile.setState(newState);
      }
    }

    if (upgrade && tile && currentState) {
      const { conditions, atMax } = upgrade;

      if (conditions.status) {
        if (currentState === conditions.status) {
          const upgradeResult = tile.upgrade();

          if (!upgradeResult && atMax) {
            if (atMax.status) {
              tile.setState(atMax.status);
            }
          }
        }
      }
    }

    if (downgrade && tile && currentState) {
      const { conditions, atMin } = downgrade;

      if (conditions.status) {
        if (currentState === conditions.status) {
          const downgradeResult = tile.downgrade();

          if (!downgradeResult && atMin) {
            if (atMin.status) {
              tile.setState(atMin.status);
            }

            if (atMin.remove) {
              space.removeTile();
            }
          }
        }
      }
    }

    if (spawnTile) {
      const tileExists = space.isOccupied();
      const newTile = new Tile(spawnTile.type, spawnTile.level, spawnTile.state);

      if (tileExists) {
        space.removeTile();
      }

      space.placeTile(newTile);
    }
  }
}
