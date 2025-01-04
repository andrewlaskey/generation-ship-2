import { View } from "../types/ViewInterface";

export class MainMenuView implements View {
    public document: Document;
    private appDiv: HTMLDivElement;

    constructor(document: Document) {
        this.document = document;
        this.appDiv = this.document.querySelector<HTMLDivElement>('#app')!;

        this.initializeView();
    }

    private initializeView() {
        this.appDiv.innerHTML = `
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
                        <input type="number" id="gridSizeInput" value="9" min="5" max="20"/>
                    </div>
                    <div class="input">
                        <p>Hand size:<p>
                        <input type="number" id="handSizeInput" value="3" min="1" max="3"/>
                    </div>
                    <div class="input">
                        <p>Deck size:<p>
                        <input type="number" id="deckSizeInput" value="40" min="10" max="100"/>
                    </div>
                    <button class="button" id="closeSubmenu">←</button>
                    <button class="button" id="startGame" data-game-type="custom">Start</button>
                </div>
                <div class="submenu hidden" id="about">
                    <h3>Goal</h3>
                    <p>For hundreds, possibly thousands of years, this ship will travel at sub-light speeds to a star system with a habitable world.</p>
                    <p>Your goal is to sustain a viable population and ecology that will be able to colonize the planet.</p>
                    <p>Place tiles on the grid to build the generation ship's resources. If the ship's population drops to zero, that is game over. Survive until there are no more tiles in the deck.<p>
                    <h3>Tiles</h3>
                    <dl>
                        <dt><span style="color: #1b9416; filter: saturate(300%);">ᚫ</span><dt>
                        <dd>Trees represent the natural ecology you want to transport to the destination world. They thrive when next to each other, but will die from overcrowding or too many people nearby.</dd>
                        <dt><span style="color: #7c4e10; filter: saturate(300%);">ᨊ</span><dt>
                        <dd>Habitats are where the human population lives. People require a balance of nature, farms, and power in order to grow.</dd>
                        <dt><span style="color: #ffd522; filter: saturate(300%);">፠</span><dt>
                        <dd>Farms are required to feed your population, and also depend on people to be maintained or improve. Farms can also suffer from overwilding if surrounded by too many trees.</dd>
                        <dt><span style="color: #3800ff; filter: saturate(300%);">ᚢ</span><dt>
                        <dd>Fusion reactor power stations allow your population centers to grow. They need people to maintain them and they can suffer if the grid is overloaded with too much nearby power.</dd>
                    </dl>
                    <button class="button" id="closeSubmenu">✓</button>
                </div>
            </div>
        `;
    }
}