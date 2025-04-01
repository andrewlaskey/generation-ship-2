import { BoardSpace } from "./BoardSpace";
import { Tile, TileState, TileType } from "./Tile";

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
    result: TileRuleAction;
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

export interface TileActionResult {
    name: TileRuleAction;
    updateState?: StatusTransition;
    upgrade?: UpgradeConfig;
    downgrade?: DowngradeConfig;
    remove?: boolean;
}

export interface TileRuleConfig {
    type: TileType;
    rules: TileRule[];
    results: TileActionResult[];
}

// Default configurations for each tile type
export const treeRules: TileRuleConfig = {
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
                    evaluation: 'gteq'
                }
            ]
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
                    evaluation: 'eq'
                },
                {
                    kind: 'single',
                    type: TileType.People,
                    count: 5,
                    evaluation: 'gteq'
                },
                {
                    kind: 'single',
                    type: TileType.Power,
                    count: 3,
                    evaluation: 'gteq'
                },
                {
                    kind: 'single',
                    type: TileType.Tree,
                    count: 5,
                    evaluation: 'gteq'
                }
            ]
        }
    ],
    results: [
        {
            name: 'thriving',
            updateState: {
                neutral: TileState.Healthy,
                unhealthy: TileState.Neutral,
                healthy: TileState.Healthy
            },
            upgrade: {
                conditions: {
                    status: TileState.Healthy
                },
                atMax: {
                    status: TileState.Healthy
                }
            }
        },
        {
            name: 'struggling',
            updateState: {
                neutral: TileState.Unhealthy,
                unhealthy: TileState.Unhealthy,
                healthy: TileState.Neutral
            },
            downgrade: {
                conditions: {
                    status: TileState.Unhealthy
                },
                atMin: {
                    remove: true
                }
            }
        }
    ]
};

export const peopleRules: TileRuleConfig = {
    type: TileType.People,
    rules: [
        {
            result: 'thriving',
            combineConditions: 'AND',
            priority: 1,
            conditions: [
                {
                    kind: 'single',
                    type: TileType.Power,
                    count: 1,
                    evaluation: 'gteq'
                },
                {
                    kind: 'single',
                    type: TileType.Farm,
                    count: 1,
                    evaluation: 'gteq'
                }
            ]
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
                    evaluation: 'eq'
                },
                {
                    kind: 'single',
                    type: TileType.Farm,
                    count: 0,
                    evaluation: 'eq'
                }
            ]
        }
    ],
    results: [
        {
            name: 'thriving',
            updateState: {
                neutral: TileState.Healthy,
                unhealthy: TileState.Neutral,
                healthy: TileState.Healthy
            },
            upgrade: {
                conditions: {
                    status: TileState.Healthy
                },
                atMax: {
                    status: TileState.Healthy
                }
            }
        },
        {
            name: 'struggling',
            updateState: {
                neutral: TileState.Unhealthy,
                unhealthy: TileState.Unhealthy,
                healthy: TileState.Neutral
            },
            downgrade: {
                conditions: {
                    status: TileState.Unhealthy
                },
                atMin: {
                    remove: true
                }
            }
        }
    ]
};

export const farmRules: TileRuleConfig = {
    type: TileType.Farm,
    rules: [
        {
            result: 'thriving',
            combineConditions: 'AND',
            priority: 2,
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
                {
                    kind: 'single',
                    type: TileType.Tree,
                    count: 3,
                    evaluation: 'lteq'
                }
            ]
        },
        {
            result: 'struggling',
            combineConditions: 'OR',
            priority: 1,
            conditions: [
                {
                    kind: 'single',
                    type: TileType.People,
                    count: 0,
                    evaluation: 'eq'
                }
            ]
        }
    ],
    results: [
        {
            name: 'thriving',
            updateState: {
                neutral: TileState.Healthy,
                unhealthy: TileState.Neutral,
                healthy: TileState.Healthy
            },
            upgrade: {
                conditions: {
                    status: TileState.Healthy
                },
                atMax: {
                    status: TileState.Healthy
                }
            }
        },
        {
            name: 'struggling',
            updateState: {
                neutral: TileState.Unhealthy,
                unhealthy: TileState.Unhealthy,
                healthy: TileState.Neutral
            },
            downgrade: {
                conditions: {
                    status: TileState.Unhealthy
                },
                atMin: {
                    remove: true
                }
            }
        }
    ]
};

export const powerRules: TileRuleConfig = {
    type: TileType.Power,
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
                    evaluation: 'gteq'
                }
            ]
        },
        {
            result: 'struggling',
            combineConditions: 'OR',
            priority: 2,
            conditions: [
                {
                    kind: 'single',
                    type: TileType.People,
                    count: 0,
                    evaluation: 'eq'
                }
            ]
        }
    ],
    results: [
        {
            name: 'thriving',
            updateState: {
                neutral: TileState.Healthy,
                unhealthy: TileState.Healthy
            }
        },
        {
            name: 'struggling',
            updateState: {
                neutral: TileState.Unhealthy,
                unhealthy: TileState.Dead,
                healthy: TileState.Unhealthy
            }
        }
    ]
};

export const wasteRules: TileRuleConfig = {
    type: TileType.Waste,
    rules: [
        {
            result: 'struggling',
            combineConditions: 'OR',
            priority: 1,
            conditions: [
                {
                    kind: 'single',
                    type: TileType.Tree,
                    count: 4,
                    evaluation: 'gteq'
                }
            ]
        }
    ],
    results: [
        {
            name: 'struggling',
            remove: true
        }
    ]
};

export function evaluateRules(neighborCounts: NeighborCounts, ruleConfig: TileRuleConfig): TileRuleAction | null {
    const sortedRules = [...ruleConfig.rules].sort((a, b) => b.priority - a.priority);
    
    for (const rule of sortedRules) {
        let ruleResult = false;
        
        const conditionResults = rule.conditions.map(condition => {
            if (condition.kind === 'single') {
                const actualCount = neighborCounts[condition.type] ?? 0;
                
                switch (condition.evaluation) {
                    case 'eq': return actualCount === condition.count;
                    case 'lt': return actualCount < condition.count;
                    case 'lteq': return actualCount <= condition.count;
                    case 'gt': return actualCount > condition.count;
                    case 'gteq': return actualCount >= condition.count;
                    default: return false;
                }
            } else if (condition.kind === 'comparison') {
                const leftCount = neighborCounts[condition.leftType] ?? 0;
                const rightCount = neighborCounts[condition.rightType] ?? 0;
                const actualDifference = leftCount - rightCount;
                
                switch (condition.evaluation) {
                    case 'eq': return actualDifference === condition.difference;
                    case 'lt': return actualDifference < condition.difference;
                    case 'lteq': return actualDifference <= condition.difference;
                    case 'gt': return actualDifference > condition.difference;
                    case 'gteq': return actualDifference >= condition.difference;
                    default: return false;
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
    action: TileRuleAction,
    tile: Tile,
    space: BoardSpace,
    actionConfig: TileActionResult[]
): void {
    const selectedConfig = actionConfig.find(({ name }) => name === action);

    if (selectedConfig) {
        const { remove, updateState, upgrade, downgrade } = selectedConfig;

        if (remove) {
            space.removeTile();
        }

        if (updateState) {
            const newState = updateState[tile.state];

            tile.setState(newState);
        }

        if (upgrade) {
            const { conditions, atMax } = upgrade;

            if (conditions.status) {
                if (tile.state === conditions.status) {
                    const upgradeResult = tile.upgrade();

                    if (!upgradeResult && atMax) {
                        if (atMax.status) {
                            tile.setState(atMax.status);
                        }
                    }
                }
            }
        }

        if (downgrade) {
            const { conditions, atMin } = downgrade;

            if (conditions.status) {
                if (tile.state === conditions.status) {
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
    }
}