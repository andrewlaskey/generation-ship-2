import { TileType } from "./Tile";

export type EvalOp = 'eq' | 'lt' | 'lteq' | 'gt' | 'gteq';

export type ConditionCombineOp = 'OR' | 'AND';

export type NeighborCounts = Partial<Record<TileType, number>>;

export type TileRuleAction = 'thriving' | 'struggling' ;

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

export interface TileRuleConfig {
    type: TileType;
    rules: TileRule[],
}


export const treeRules: TileRuleConfig = {
    type: TileType.Tree,
    rules: [
        {
            result: 'thriving',
            combineConditions: 'AND',
            priority: 1, // Lower priority
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
            priority: 2, // Higher priority, will be evaluated first
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
    ]
}

export const peopleRules: TileRuleConfig = {
    type: TileType.People,
    rules: [
        {
            result: 'thriving',
            combineConditions: 'AND',
            priority: 1, // Lower priority
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
            priority: 2, // Higher priority, will be evaluated first
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
            priority: 1, // Higher priority, will be evaluated first
            conditions: [
                {
                    kind: 'single',
                    type: TileType.People,
                    count: 0,
                    evaluation: 'eq'
                }
            ]
        }
    ]
}

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