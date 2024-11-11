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
    private objectsDiv!: HTMLDivElement;

    constructor(gameManager: GameManager, document: Document) {
        this.gameManager = gameManager;
        this.document = document;
        this.appDiv = this.document.querySelector<HTMLDivElement>('#app')!;


        this.initializeView();
    }

    public updateGrid(): void {
        this.objectsDiv.innerHTML = this.renderHand();
    }

    private initializeView(): void {
        this.appDiv.innerHTML = `
            <div class="flying-view-wrapper">
                <div class="sky"></div>
                <div id="gridContainer" class="grid">
                    <div class="grid-fade"></div>
                    <div class="grid-lines"></div>
                </div>
                <div id="objects" class="grid-objects"></div>
            </div>
        `

        this.gridContainer = this.document.querySelector<HTMLDivElement>('#gridContainer')!;
        this.objectsDiv = this.document.querySelector<HTMLDivElement>('#objects')!;

        this.objectsDiv.innerHTML = this.renderHand();
    }

    private renderHand(): string {
        let html = '';
        const handItems: HandItem[] = this.gameManager.getPlayerHand();

        for (const item of handItems) {
            const tiles = (item as TileBlock).getTiles();
            html += tiles.reduce((str, tile) => {
                if (tile) {
                    str += `<div class="tile ${tile?.type} l${tile?.level}"></div>`
                }
                return str
            }, '')
        }

        return html;
    }
}