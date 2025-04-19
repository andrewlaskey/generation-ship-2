import { VisualAutoPlayerController } from '../controllers/VisualAutoPlayerController';
import { TileRuleConfig } from '../../modules/TileRules';
import { View } from '../../types/ViewInterface';
import { ABOUT_HTML } from '../../utils/constants';

export class MainMenuView implements View {
  public document: Document;
  private appDiv: HTMLDivElement;
  private backgroundGame: VisualAutoPlayerController;
  private mainMenuDiv: HTMLDivElement | null;
  private backgroundGameDiv: HTMLDivElement | null;

  constructor(document: Document, ruleConfig: Map<string, TileRuleConfig>) {
    this.document = document;
    this.appDiv = this.document.querySelector<HTMLDivElement>('#app')!;

    this.initializeView();

    this.mainMenuDiv = this.appDiv.querySelector<HTMLDivElement>('.main-menu');
    this.backgroundGameDiv = this.appDiv.querySelector<HTMLDivElement>(
      '.background-player-wrapper'
    );

    this.backgroundGame = new VisualAutoPlayerController(
      document,
      '#backgroundPlayer',
      30,
      40,
      ruleConfig
    );
    this.backgroundGame.init(true);
  }

  public stopAutoPlay(): void {
    this.backgroundGame.stop();
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
                        <input
                            id="gridSizeInput"
                            type="number" 
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value="9"
                            min="5"
                            max="15"
                            step="1"
                        />
                    </div>
                    <div class="input">
                        <p>Hand size:<p>
                        <input
                            id="handSizeInput"    
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value="3"
                            min="1"
                            max="3"
                            step="1"
                        />
                    </div>
                    <div class="input">
                        <p>Deck size:<p>
                        <input
                            id="deckSizeInput"
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value="40"
                            min="10"
                            max="100"
                            step="1"
                        />
                    </div>
                    <div class="input">
                        <p>Seed:</p>
                        <input type="text" id="seedInputStr" placeholder="Optional String" />
                    </div>
                    <button class="button" id="closeSubmenu">←</button>
                    <button class="button" id="startGame" data-game-type="custom">Start</button>
                    <p class="warning" id="warningNotice"><p>
                </div>
                <div class="submenu hidden" id="about">
                    ${ABOUT_HTML}
                    <button class="button" id="closeSubmenu">✓</button>
                    <p>vALPHA (frequent, possibly breaking changes)<br>
                    Support the development of this game on <a href="https://ko-fi.com/timbertales" target="_blank">☕️ Ko-fi</a><br>
                    Follow the development progress on <a href="https://bsky.app/profile/andrewlaskey.bsky.social" target="_blank">🦋 Bluesky</a></p>
                </div>
                <div class="main-menu-footer">
                    <button class="button small" data-action="toggleMeditation">Meditation Mode</button>
                </div>
            </div>
        `;
  }
}
