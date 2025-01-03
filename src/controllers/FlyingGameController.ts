import { GameManager } from '../modules/GameManager';
import { FlyingGameView } from '../views/FlyingGameView';
import { ViewController } from '../types/ViewControllerInterface';

export class FlyingGameController implements ViewController{
    private gameManager: GameManager;
    private gameView: FlyingGameView;
    private isRunning: boolean;
    private lastTimestamp: number;
    private accumulatedTime: number;
    private readonly interval: number;
    private readonly prob: number

    constructor(gameManager: GameManager, gameView: FlyingGameView) {
        this.gameManager = gameManager;
        this.gameView = gameView;
        this.isRunning = true;
        this.lastTimestamp = 0;
        this.accumulatedTime = 0;

        const intervalInSeconds = 4;
        this.interval = intervalInSeconds * 1000; // Convert seconds to milliseconds
        this.prob = 0.8;
    }

    init() {
        this.initEventListeners();

        this.gameManager.fillHand();
        this.gameView.updateGrid();

        // Start the animation loop
        this.loop();
    }

    private initEventListeners(): void {
        const appDiv = this.gameView.document.querySelector<HTMLDivElement>('#app');
        
        appDiv?.addEventListener('click', () => this.togglePlay());
    }

    private loop(): void {
        if (this.isRunning) {
            requestAnimationFrame((timestamp) => this.update(timestamp));
        }
    }

    private update(timestamp: number): void {
        if (this.lastTimestamp === 0) this.lastTimestamp = timestamp;
        
        // Calculate the time difference since the last frame
        const deltaTime = timestamp - this.lastTimestamp;
        this.accumulatedTime += deltaTime;
        this.lastTimestamp = timestamp;

        // Execute action every `t` seconds
        if (this.accumulatedTime >= this.interval) {
            this.executeAction();
            this.accumulatedTime = 0; // Reset the accumulator
        }

        this.gameView.updateGrid();

        // Continue the animation loop
        this.loop();
    }

    private executeAction(): void {
        const rand = Math.random();

        if (rand <= this.prob) {
            this.gameManager.playerHand.removeItem(0)
            this.gameManager.drawItemToHand();
        }
    }

    public togglePlay(): void {
        const currentlyRunning = this.isRunning;
        this.isRunning = !this.isRunning;

        if (!currentlyRunning) {
            this.loop();
        }
    }


    public stop(): void {
        this.isRunning = false;
    }
}
