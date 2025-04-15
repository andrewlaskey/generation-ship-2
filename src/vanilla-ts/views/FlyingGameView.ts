import { GameView } from '../../types/GameViewInterface';
import { GameManager } from '../../modules/GameManager';
import { BoardSpace } from '../../modules/BoardSpace';

export class FlyingGameView implements GameView {
  private gameManager: GameManager;
  public document: Document; // Make document public for the controller to access
  private appDiv: HTMLDivElement;
  private tiles!: HTMLDivElement;
  private cvs!: HTMLCanvasElement;

  constructor(gameManager: GameManager, document: Document) {
    this.gameManager = gameManager;
    this.document = document;
    this.appDiv = this.document.querySelector<HTMLDivElement>('#app')!;

    this.initializeView();
  }

  public updateGrid(): void {
    this.renderGrid();
  }

  private initializeView(): void {
    this.appDiv.innerHTML = `
            <div class="flying-view-wrapper">
                <div class="flying-view-inner">
                    <canvas id="starfield" class="starfield"></canvas>
                    <div class="planet-a"></div>
                    <div class="planet-b"></div>
                    <div class="sky"></div>
                    <div id="gridContainer" class="grid">
                        <div class="grid-fade"></div>
                        <div class="grid-lines"></div>
                    </div>
                    <div id="objects" class="grid-objects" data-size="${this.gameManager.gameBoard.size}">
                    </div>
                    <button class="button" id="exit">⬅</button>
                </div>
            </div>
        `;

    this.tiles = this.document.querySelector<HTMLDivElement>('#objects')!;
    this.cvs = this.document.querySelector<HTMLCanvasElement>('#starfield')!;

    this.renderGrid();
    this.renderStarField(500);
  }

  private renderTile(space: BoardSpace): string {
    const tile = space.tile;
    if (!tile) return '';

    const tileType = tile.type;
    const tileLevel = tile.level;
    const tileState = tile.state;

    const className = `tile ${tileType} ${tileState} l${tileLevel} x-${space.x} y-${space.y}`;

    const minLeftPos = 25;
    const maxLeftPos = 75;
    const leftPosLerp =
      minLeftPos + (maxLeftPos - minLeftPos) * (space.x / this.gameManager.gameBoard.size);

    const leftStyle = `${leftPosLerp}%`;

    const minDelay = 0;
    const maxDelay = 3;
    const delayLerp =
      minDelay + (maxDelay - minDelay) * (1 - space.y / this.gameManager.gameBoard.size);
    const delayStyle = `${delayLerp}s`;

    const styles = `left: ${leftStyle}; animation-delay: ${delayStyle}`;

    return `<div class="${className}" style="${styles}"></div>`;
  }

  private renderGrid(): void {
    const htmlArr = this.gameManager.gameBoard.getGrid((space: BoardSpace) => {
      return this.renderTile(space);
    });
    this.tiles.innerHTML = htmlArr.join('');
  }

  private renderStarField(n: number): void {
    const ctx = this.cvs.getContext('2d');

    if (ctx) {
      const width = this.appDiv.getBoundingClientRect().width;

      this.cvs.width = width;
      this.cvs.height = width;

      for (let i = 0; i < n; i++) {
        const x = Math.random() * width;
        const y = Math.random() * width;

        ctx.fillStyle = 'white';
        ctx.fillRect(x, y, 2, 2);
      }
    }
  }
}
