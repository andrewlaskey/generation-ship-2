import { GameManager, GameState } from "./GameManager";

export type EndGameResult = GameState.Complete | GameState.GameOver;

export type GameResults = {
    result: EndGameResult;
    score: number;
}

export class AutoPlayer {
    public gameManager: GameManager;

    constructor(gameManager: GameManager) {
        this.gameManager = gameManager;
    }

    updateManager(gameManager: GameManager): void {
        this.gameManager = gameManager;
    }

    startNewGame(): void {
        this.gameManager.resetGame();
        this.gameManager.startGame();
    }

    nextMove(): void {
        // Pick random grid space
        const gridSize = this.gameManager.gameBoard.size;
        const selectedHandIndex = this.gameManager.getSelectedItemIndex();  // Get selected item index from hand
        let placeTileSuccess = false;
    
        while (!placeTileSuccess) {
            const row = Math.floor(Math.random() * (gridSize - 1));
            const col = Math.floor(Math.random() * gridSize);

            
            placeTileSuccess = this.gameManager.placeTileBlock(col, row, selectedHandIndex);
        }

        this.gameManager.advanceTurn();
    }

    auto(): GameResults {
        while (
            this.gameManager.state !== GameState.Complete && 
            this.gameManager.state !== GameState.GameOver
        ) {
            this.nextMove();
        }

        return {
            result: this.gameManager.state,
            score: this.gameManager.getCalculatedPlayerScore()
        }
    }

    repeat(numRepeat: number): GameResults[] {
        const allResults: GameResults[] = [];

        for (let i = 0; i < numRepeat; i++) {
            this.startNewGame();
            const results = this.auto();

            allResults.push(results);
        }

        return allResults;
    }
}