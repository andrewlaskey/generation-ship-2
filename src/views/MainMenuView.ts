import { VisualAutoPlayerController } from "../controllers/VisualAutoPlayerController";
import { View } from "../types/ViewInterface";
import { ABOUT_HTML } from "../utils/constants";

export class MainMenuView implements View {
    public document: Document;
    private appDiv: HTMLDivElement;
    private backgroundGame: VisualAutoPlayerController;
    private mainMenuDiv: HTMLDivElement | null;
    private backgroundGameDiv: HTMLDivElement | null;

    constructor(document: Document) {
        this.document = document;
        this.appDiv = this.document.querySelector<HTMLDivElement>('#app')!;

        this.initializeView();

        this.mainMenuDiv = this.appDiv.querySelector<HTMLDivElement>('.main-menu');
        this.backgroundGameDiv = this.appDiv.querySelector<HTMLDivElement>('.background-player-wrapper');

        this.backgroundGame = new VisualAutoPlayerController(document, '#backgroundPlayer', 30, 40);
        this.backgroundGame.init(true);
    }

    public toggleMeditationMode(): void {
        this.mainMenuDiv?.classList.toggle('hidden');
        this.backgroundGameDiv?.classList.toggle('enabled');
    }

    private initializeView() {
        this.appDiv.innerHTML = `
            <div class="background-player-wrapper">
                <div class="background-player" id="backgroundPlayer"></div>
                <button class="button" id="closeMeditation" data-action="toggleMeditation">⬅</button>
            </div>
            <div class="main-menu">
                <h1 class="title">Generation Ship 2</h1>
                <ul class="main-menu-options">
                    <li><button class="button" id="startGame" data-game-type="daily">Daily Challenge</button></li>
                    <li><button class="button" id="openSubMenu" data-menu="customGameOptions">Custom Game</button></li>
                    <li><button class="button" id="openSubMenu" data-menu="about">About</button></li>
                </ul>
                <div class="submenu hidden" id="customGameOptions">
                    <h3>Select Options</h3>
                    <div class="input">
                        <p>Grid size:</p>
                        <input type="number" id="gridSizeInput" value="9" min="5" max="15"/>
                    </div>
                    <div class="input">
                        <p>Hand size:<p>
                        <input type="number" id="handSizeInput" value="3" min="1" max="3"/>
                    </div>
                    <div class="input">
                        <p>Deck size:<p>
                        <input type="number" id="deckSizeInput" value="40" min="10" max="100"/>
                    </div>
                    <div class="input">
                        <p>Seed:</p>
                        <input type="text" id="seedInputStr" placeholder="Optional String" />
                    </div>
                    <button class="button" id="closeSubmenu">←</button>
                    <button class="button" id="startGame" data-game-type="custom">Start</button>
                </div>
                <div class="submenu hidden" id="about">
                    ${ABOUT_HTML}
                    <button class="button" id="closeSubmenu">✓</button>
                </div>
                <div class="main-menu-footer">
                    <button class="button small" data-action="toggleMeditation">Meditation Mode</button>
                </div>
            </div>
        `;
    }
}