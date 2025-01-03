import { GameManager } from "./GameManager";
import { BoardSpace } from "./BoardSpace";
import { Tile, TileState, TileType } from "./Tile";

export interface TileHandler {
    updateState(space: BoardSpace, gameManager: GameManager): void;
}

export class TreeTileHandler implements TileHandler {
    updateState(space: BoardSpace, gameManager: GameManager): void {
        const treeCount = gameManager.countNeighbors(space, [TileType.Tree]);
        const peopleCount = gameManager.countNeighbors(space, [TileType.People]);
        const powerCount = gameManager.countNeighbors(space, [TileType.Power])

        const strugglingCondition = 
            treeCount === 0 || 
            peopleCount >= 5 || 
            powerCount >= 2 ||
            treeCount >= 5;

        // Only check thriving condition if not struggling
        const thrivingCondition = !strugglingCondition && treeCount >= 3;

        handleTileState(space, thrivingCondition, strugglingCondition);
    }
}

export class FarmTileHandler implements TileHandler {
    updateState(space: BoardSpace, gameManager: GameManager): void {
        const treeCount = gameManager.countNeighbors(space, [TileType.Tree]);
        const peopleCount = gameManager.countNeighbors(space, [TileType.People]);

        const thrivingCondition = peopleCount >= 1 && treeCount <= 3;  // Farms do well with some people and few trees
        const strugglingCondition = peopleCount === 0 || treeCount >= 5;  // Farms struggle without people or too many trees

        handleTileState(space, thrivingCondition, strugglingCondition);
    }
}

export class PeopleTileHandler implements TileHandler {
    updateState(space: BoardSpace, gameManager: GameManager): void {
        const treeCount = gameManager.countNeighbors(space, [TileType.Tree]);
        const farmCount = gameManager.countNeighbors(space, [TileType.Farm]);
        const powerCount = gameManager.countNeighbors(space, [TileType.Power]);

        // Prioritize struggling condition: If a struggling condition is true, do not thrive
        const strugglingCondition = treeCount === 0 || farmCount === 0;  // People struggle without trees or farms
        
        // Only check thriving condition if the tile is not struggling
        const thrivingCondition = !strugglingCondition && farmCount >= 1 && powerCount >= 1;  // People thrive with farms and power

        handleTileState(space, thrivingCondition, strugglingCondition);
    }
}


export class PowerTileHandler implements TileHandler {
    // For now power stations have a single level (power output)
    // When a power station "dies" rather than being removed from the board it will stay
    updateState(space: BoardSpace, gameManager: GameManager): void {
        const peopleCount = gameManager.countNeighbors(space, [TileType.People]);
        const powerCount = gameManager.countNeighbors(space, [TileType.Power]);

        const thrivingCondition = peopleCount >= 1 && powerCount <= 2;  // Power stations thrive with people and moderate power
        const strugglingCondition = peopleCount < 1 || powerCount > 3;  // Power stations struggle without people or too much power

        const tile = space.tile;

        if (!tile) return;

        if (thrivingCondition && tile.state != TileState.Dead) {
            tile.setState(TileState.Healthy);
        }

        if (strugglingCondition && tile.state != TileState.Dead) {
            if (tile.state == TileState.Unhealthy) {
                tile.setState(TileState.Dead);
            } else {
                tile.setState(TileState.Unhealthy);
            }
        }
    }
}

export class EmptyTileHandler implements TileHandler {
    updateState(space: BoardSpace, gameManager: GameManager): void {
        const treeCount = gameManager.countNeighbors(space, [TileType.Tree]);
        const peopleCount = gameManager.countNeighbors(space, [TileType.People]);
        const powerCount = gameManager.countNeighbors(space, [TileType.Power]);
        const farmCount = gameManager.countNeighbors(space, [TileType.Farm]);

        if (treeCount >= 4) {
            space.removeTile();
            space.placeTile(new Tile(TileType.Tree, 1, TileState.Neutral));  // A tree starts growing
        } else if (peopleCount >= 1 && powerCount >= 1 && farmCount >= 2) {
            // A settlement starts when there is adjacent people, power, and farms
            // This is simulating a growing population that is overflowing into neighbor spaces
            // Critically this happens with or without nearby trees which are essential to survival
            // Settlements like these will die if no trees
            space.removeTile();
            space.placeTile(new Tile(TileType.People, 1, TileState.Neutral));  
        }
    }
}

// Generic method to handle tile state transitions.
// Power Tiles have custom logic.
function handleTileState(space: BoardSpace, thrivingCondition: boolean, strugglingCondition: boolean) {
    const tile = space.tile;

    if (!tile) return;

    // Going up a level if thriving
    if (thrivingCondition) {
        switch(tile.state) {
            case TileState.Neutral:
                tile.setState(TileState.Healthy);
                break;
            case TileState.Unhealthy:
                tile.setState(TileState.Neutral);
                break;
            case TileState.Healthy:
                tile.upgrade();
                tile.setState(TileState.Neutral);
                break;
        }
    }
    // Going down a level if struggling
    else if (strugglingCondition) {
        switch(tile.state) {
            case TileState.Neutral:
                tile.setState(TileState.Unhealthy);
                break;
            case TileState.Unhealthy:
                const downgradeSuccess = tile.downgrade(); // After being unhealthy, go down a level

                if (downgradeSuccess) {
                    tile.setState(TileState.Neutral); // Reset to neutral after going down
                } else {
                    space.removeTile(); // If tile can't downgrade below minLevel, the tile is removed
                }
                break;
            case TileState.Healthy:
                tile.setState(TileState.Neutral);
                break;
        }
            
    } else {
        tile.setState(TileState.Neutral);
    }
}