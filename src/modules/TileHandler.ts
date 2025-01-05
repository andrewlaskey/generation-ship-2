import { GameManager } from "./GameManager";
import { BoardSpace } from "./BoardSpace";
import { Tile, TileState, TileType } from "./Tile";

export enum SpaceChange {
    Upgrade = 'upgrade',
    Downgrade  = 'downgrade',
    ChangeState = 'change state',
    Remove = 'remove',
    Replace = 'replace'
}

export interface SpaceUpdate {
    change: SpaceChange;
    newState?: TileState;
    replaceTile?: Tile;
}
export interface TileHandler {
    updateState(space: BoardSpace, gameManager: GameManager): SpaceUpdate | null;
}

export class TreeTileHandler implements TileHandler {
    updateState(space: BoardSpace, gameManager: GameManager): SpaceUpdate | null {
        const treeCount = gameManager.countNeighbors(space, [TileType.Tree]);
        const peopleCount = gameManager.countNeighbors(space, [TileType.People]);
        const powerCount = gameManager.countNeighbors(space, [TileType.Power])

        const maxPeople = 5;
        const maxPower = 3;
        const maxTrees = 5;

        const strugglingCondition = 
            treeCount === 0 || 
            peopleCount >= maxPeople || 
            powerCount >= maxPower ||
            treeCount >= maxTrees;

        // Only check thriving condition if not struggling
        const thrivingCondition = !strugglingCondition && treeCount >= 3;

        return handleTileState(space, thrivingCondition, strugglingCondition);
    }
}

export class FarmTileHandler implements TileHandler {
    updateState(space: BoardSpace, gameManager: GameManager): SpaceUpdate | null {
        const treeCount = gameManager.countNeighbors(space, [TileType.Tree]);
        const peopleCount = gameManager.countNeighbors(space, [TileType.People], true);
        const farmCount = gameManager.countNeighbors(space, [TileType.Farm], true);

        const peopleFarmDiff = peopleCount - farmCount;

        // Farms do well with some people and few trees
        const thrivingCondition =
            peopleCount > 1 &&
            peopleCount <= 4 &&
            treeCount <= 3;
         
        // Farms struggle without people or too many trees
        const strugglingCondition =
            peopleCount === 0 ||
            peopleFarmDiff >= 5 ||
            treeCount >= 5;

        const update = handleTileState(space, thrivingCondition, strugglingCondition);

        if (update?.change == SpaceChange.Remove) {
            return {
                change: SpaceChange.Replace,
                replaceTile: new Tile(TileType.Waste, 1, TileState.Neutral)
            }
        }

        return update;
    }
}

export class PeopleTileHandler implements TileHandler {
    updateState(space: BoardSpace, gameManager: GameManager): SpaceUpdate | null {
        const treeCount = gameManager.countNeighbors(space, [TileType.Tree]);
        const farmCount = gameManager.countNeighbors(space, [TileType.Farm]);
        const powerCount = gameManager.countNeighbors(space, [TileType.Power]);

        // Prioritize struggling condition: If a struggling condition is true, do not thrive
        const strugglingCondition = treeCount === 0 || farmCount === 0;  // People struggle without trees or farms
        
        // Only check thriving condition if the tile is not struggling
        const thrivingCondition = !strugglingCondition && farmCount >= 1 && powerCount >= 1;  // People thrive with farms and power
        
        const update = handleTileState(space, thrivingCondition, strugglingCondition);

        if (update?.change == SpaceChange.Remove) {
            return {
                change: SpaceChange.Replace,
                replaceTile: new Tile(TileType.Waste, 1, TileState.Neutral)
            }
        }

        return update;
    }
}


export class PowerTileHandler implements TileHandler {
    // For now power stations have a single level (power output)
    // When a power station "dies" rather than being removed from the board it will stay
    updateState(space: BoardSpace, gameManager: GameManager): SpaceUpdate | null {
        const peopleCount = gameManager.countNeighbors(space, [TileType.People], true);
        const powerCount = gameManager.countNeighbors(space, [TileType.Power]);

        const minPeople = 1;
        const maxPeople = 4;
        const maxPower = 3;

        // Power stations thrive with people and moderate power
        const thrivingCondition =
            peopleCount >= minPeople &&
            peopleCount <= maxPeople &&
            powerCount <= maxPower;

        // Power stations struggle without people or too much power
        const strugglingCondition =
            peopleCount < minPeople ||
            peopleCount > maxPeople ||
            powerCount > maxPower; 

        const tile = space.tile;

        if (!tile) return null;

        if (tile.state == TileState.Dead) return null;

        const update: SpaceUpdate = {
            change: SpaceChange.ChangeState,
            newState: TileState.Neutral
        }

        if (thrivingCondition) {
            update.newState = TileState.Healthy;
        }

        if (strugglingCondition) {
            if (tile.state == TileState.Unhealthy) {
                update.newState = TileState.Dead;
            } else {
                update.newState = TileState.Unhealthy;
            }
        }

        return update;
    }
}

export class EmptyTileHandler implements TileHandler {
    updateState(space: BoardSpace, gameManager: GameManager): SpaceUpdate | null {
        const treeCount = gameManager.countNeighbors(space, [TileType.Tree], true);
        const peopleCount = gameManager.countNeighbors(space, [TileType.People], true);
        const powerCount = gameManager.countNeighbors(space, [TileType.Power]);
        const farmCount = gameManager.countNeighbors(space, [TileType.Farm], true);
        const wasteCount = gameManager.countNeighbors(space, [TileType.Waste]);

        if (treeCount >= 4) {
            // A tree starts growing
            return {
                change: SpaceChange.Replace,
                replaceTile: new Tile(TileType.Tree, 1, TileState.Neutral)
            }
        } else if (peopleCount >= 1 && powerCount >= 1 && farmCount >= 2) {
            // A settlement starts when there is adjacent people, power, and farms
            // This is simulating a growing population that is overflowing into neighbor spaces
            // Critically this happens with or without nearby trees which are essential to survival
            // Settlements like these will die if no trees
            return {
                change: SpaceChange.Replace,
                replaceTile: new Tile(TileType.People, 1, TileState.Neutral)
            }
        } else if (wasteCount >= 3) {
            // Waste/Pollution easily propagates
            return {
                change: SpaceChange.Replace,
                replaceTile: new Tile(TileType.Waste, 1, TileState.Neutral)
            }
        }

        return null;
    }
}

export class WasteTileHandler implements TileHandler {
    updateState(space: BoardSpace, gameManager: GameManager): SpaceUpdate | null {
        const treeCount = gameManager.countNeighbors(space, [TileType.Tree], true);

        if (treeCount >= 4) {
            return {
                change: SpaceChange.Remove
            };
        }

        return null
    }
}

// Generic method to handle tile state transitions.
// Power Tiles have custom logic.
function handleTileState(space: BoardSpace, thrivingCondition: boolean, strugglingCondition: boolean): SpaceUpdate | null {
    const tile = space.tile;
    const result: SpaceUpdate = {
        change: SpaceChange.ChangeState
    } 

    if (!tile) return null;

    // Going up a level if thriving
    if (thrivingCondition) {
        switch(tile.state) {
            case TileState.Neutral:
                result.newState = TileState.Healthy;
                break;
            case TileState.Unhealthy:
                result.newState = TileState.Neutral;
                break;
            case TileState.Healthy:
                const upgradeSuccess = tile.upgrade(true);

                if (upgradeSuccess) {
                    result.change = SpaceChange.Upgrade;
                    result.newState = TileState.Neutral;
                } else {
                    return null;
                }
                break;
        }
    }
    // Going down a level if struggling
    else if (strugglingCondition) {
        switch(tile.state) {
            case TileState.Neutral:
                result.newState = TileState.Unhealthy;
                break;
            case TileState.Healthy:
                result.newState = TileState.Neutral;
                break;
            case TileState.Unhealthy:
                const downgradeSuccess = tile.downgrade(true); // Preview change

                if (downgradeSuccess) {
                    tile.setState(TileState.Neutral); // Reset to neutral after going down
                    result.change = SpaceChange.Downgrade;
                    result.newState = TileState.Neutral;
                } else {
                    result.change = SpaceChange.Remove;
                }
                break;
        }
    } else {
        result.newState = TileState.Neutral;
    }

    return result;
}