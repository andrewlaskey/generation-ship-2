import { GameManager } from "./GameManager";
import { BoardSpace } from "./BoardSpace";

export interface TileHandler {
    updateState(space: BoardSpace, gameManager: GameManager): void;
}

export class TreeTileHandler implements TileHandler {
    updateState(space: BoardSpace, gameManager: GameManager): void {
        const treeCount = gameManager.countNeighbors(space, ['tree']);
        const peopleCount = gameManager.countNeighbors(space, ['people']);
        const powerCount = gameManager.countNeighbors(space, ['power'])

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
        const treeCount = gameManager.countNeighbors(space, ['tree']);
        const peopleCount = gameManager.countNeighbors(space, ['people']);

        const thrivingCondition = peopleCount >= 1 && treeCount <= 3;  // Farms do well with some people and few trees
        const strugglingCondition = peopleCount === 0 || treeCount >= 5;  // Farms struggle without people or too many trees

        handleTileState(space, thrivingCondition, strugglingCondition);
    }
}

export class PeopleTileHandler implements TileHandler {
    updateState(space: BoardSpace, gameManager: GameManager): void {
        const treeCount = gameManager.countNeighbors(space, ['tree']);
        const farmCount = gameManager.countNeighbors(space, ['farm']);
        const powerCount = gameManager.countNeighbors(space, ['power']);

        // Prioritize struggling condition: If a struggling condition is true, do not thrive
        const strugglingCondition = treeCount === 0 || farmCount === 0;  // People struggle without trees or farms
        
        // Only check thriving condition if the tile is not struggling
        const thrivingCondition = !strugglingCondition && farmCount >= 1 && powerCount >= 1;  // People thrive with farms and power

        handleTileState(space, thrivingCondition, strugglingCondition);
    }
}


export class PowerTileHandler implements TileHandler {
    updateState(space: BoardSpace, gameManager: GameManager): void {
        const peopleCount = gameManager.countNeighbors(space, ['people']);
        const powerCount = gameManager.countNeighbors(space, ['power']);

        const thrivingCondition = peopleCount >= 1 && powerCount <= 2;  // Power stations thrive with people and moderate power
        const strugglingCondition = peopleCount < 1 || powerCount > 3;  // Power stations struggle without people or too much power

        handleTileState(space, thrivingCondition, strugglingCondition);
    }
}

// Generic method to handle tile state transitions
function handleTileState(space: BoardSpace, thrivingCondition: boolean, strugglingCondition: boolean) {
        const tile = space.tile;

        if (!tile) return;

        // Going up a level if thriving
        if (thrivingCondition) {
            if (tile.state === 'neutral') {
                tile.setState('healthy');  // Thriving: Change to healthy first
            } else if (tile.state === 'healthy') {
                tile.upgrade();
                tile.setState('healthy');
            }
        }
        // Going down a level if struggling
        else if (strugglingCondition) {
            if (tile.state === 'neutral') {
                tile.setState('unhealthy');  // Struggling: Change to unhealthy first
            } else if (tile.state === 'unhealthy') {
                const downgradeSuccess = tile.downgrade(); // After being unhealthy, go down a level

                if (downgradeSuccess) {
                    tile.setState('neutral'); // Reset to neutral after going down
                } else {
                    space.removeTile(); // If tile can't downgrade below minLevel, the tile is removed
                }
        } else {
            tile.setState('neutral');
        }
    }
}