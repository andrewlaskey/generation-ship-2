import { GameManager } from "../modules/GameManager";
import { ViewController } from "../types/ViewControllerInterface";
import { View } from "../types/ViewInterface";
import { getCurrentDate } from "../utils/getCurrentDate";

export class MainMenuController implements ViewController {
     private gameManager: GameManager;
     private view: View;
     private switchViewFn: (appType: string) => void;

     constructor(view: View, gameManager: GameManager, fn: (appType: string) => void) {
        this.gameManager = gameManager;
        this.view = view;
        this.switchViewFn = fn;       
     }

     init() {
        this.initSubMenuButtonListeners();
        this.initStartGameButtonListeners();
     }

     private initSubMenuButtonListeners() {
        const openSubMenuButtons = this.view.document.querySelectorAll<HTMLButtonElement>('#openSubMenu');
        const closeSubMenuButtons = this.view.document.querySelectorAll<HTMLButtonElement>('#closeSubmenu');

        openSubMenuButtons.forEach(button => {
            button.addEventListener('click', () => {
                const target = button.dataset.menu;

                if (target) {
                    const targetElement = this.view.document.querySelector<HTMLDivElement>(`#${target}`);

                    if (targetElement) {
                        targetElement.classList.remove('hidden');
                    }
                }
            })
        })

        closeSubMenuButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetElement = button.parentElement;

                if (targetElement) {
                    targetElement.classList.add('hidden');
                }
            })
        })
    }

    private initStartGameButtonListeners() {
        const startGameButtons = this.view.document.querySelectorAll<HTMLButtonElement>('#startGame');

        startGameButtons.forEach(button => {
            button.addEventListener('click', () => {
                const target = button.dataset.gameType;

                switch(target) {
                    case 'daily':
                        this.gameManager.configGame({
                            ...this.gameManager.optionDefaults,
                            seed: getCurrentDate()
                        });
                        this.switchViewFn(target);
                        break;
                    case 'custom':
                        const gridSizeInput = this.view.document.querySelector<HTMLInputElement>('#gridSizeInput');
                        const gridSizeInputValue = gridSizeInput ? parseInt(gridSizeInput.value, 10) : this.gameManager.optionDefaults.size;

                        const handSizeInput = this.view.document.querySelector<HTMLInputElement>('#handSizeInput');
                        const handSizeInputValue = handSizeInput ? parseInt(handSizeInput.value, 10) : this.gameManager.optionDefaults.maxHandSize;

                        const deckSizeInput = this.view.document.querySelector<HTMLInputElement>('#deckSizeInput');
                        const deckSizeInputValue = deckSizeInput ? parseInt(deckSizeInput.value, 10) : this.gameManager.optionDefaults.initialDeckSize;

                        const seedInput = this.view.document.querySelector<HTMLInputElement>('#seedInputStr');
                        const seedInputValue = seedInput && seedInput.value.length ? seedInput.value : undefined

                        this.gameManager.configGame({
                            seed: seedInputValue,
                            size: gridSizeInputValue,
                            maxHandSize: handSizeInputValue,
                            initialDeckSize: deckSizeInputValue
                        });
                        this.switchViewFn(target);
                        break;

                }
            });
        })
    }
}