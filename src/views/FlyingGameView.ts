import { GameView } from "../types/GameViewInterface";
import { GameManager } from "../modules/GameManager";
import { HandItem } from "../modules/PlayerHand";
import { TileBlock } from "../modules/TileBlock";
import { Tile } from "../modules/Tile";

export class FlyingGameView implements GameView{
    private gameManager: GameManager;
    public document: Document;  // Make document public for the controller to access
    private appDiv: HTMLDivElement;
    private gridContainer!: HTMLDivElement;
    private tiles!: NodeListOf<HTMLDivElement>;

    constructor(gameManager: GameManager, document: Document) {
        this.gameManager = gameManager;
        this.document = document;
        this.appDiv = this.document.querySelector<HTMLDivElement>('#app')!;


        this.initializeView();
    }

    public updateGrid(): void {
        this.renderHand();
    }

    private initializeView(): void {
        this.appDiv.innerHTML = `
            <div class="flying-view-wrapper">
                <div class="sky"></div>
                <div id="gridContainer" class="grid">
                    <div class="grid-fade"></div>
                    <div class="grid-lines"></div>
                </div>
                <div id="objects" class="grid-objects">
                    <div class="tile"></div>
                    <div class="tile"></div>
                    <div class="tile"></div>
                    <div class="tile"></div>
                    <div class="tile"></div>
                    <div class="tile"></div>
                    <div class="tile"></div>
                    <div class="tile"></div>
                    <div class="tile"></div>
                </div>
            </div>
        `

        this.gridContainer = this.document.querySelector<HTMLDivElement>('#gridContainer')!;
        this.tiles = this.document.querySelectorAll<HTMLDivElement>('#objects .tile')!;

        this.renderHand();
    }

    private renderHand(): void {
        const handItems: HandItem[] = this.gameManager.getPlayerHand();
        const allTiles = handItems.reduce((acc, item) => {
            const tiles = (item as TileBlock).getTiles();

            return acc.concat(tiles)
        },[] as (Tile | null)[]);

        this.tiles.forEach((div, index) => {
            if (index < allTiles.length) {
                const tile = allTiles[index];
                const tileType = tile ? tile.type : 'empty';
                const tileLevel = tile ? tile.level : 0;
                const tileState = tile ? tile.state : 'neutral';
                            
                div.className =`tile ${tileType} ${tileState} l${tileLevel}`
            }
        });
    }
}