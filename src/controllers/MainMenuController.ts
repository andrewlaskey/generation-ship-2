import { GameManager } from '../modules/GameManager';
import { SwitchViewFn } from '../types/SwitchViewFn';
import { ViewController } from '../types/ViewControllerInterface';
import { getCurrentDate } from '../utils/getCurrentDate';
import { MainMenuView } from '../views/MainMenuView';

export interface NumberValidation {
  min: number;
  max: number;
}

export class MainMenuController implements ViewController {
  private gameManager: GameManager;
  private view: MainMenuView;
  private switchViewFn: SwitchViewFn;

  constructor(view: MainMenuView, gameManager: GameManager, fn: SwitchViewFn) {
    this.gameManager = gameManager;
    this.view = view;
    this.switchViewFn = fn;
  }

  init() {
    this.initSubMenuButtonListeners();
    this.initStartGameButtonListeners();
    this.initFooterButtonListeners();
  }

  private initSubMenuButtonListeners() {
    const openSubMenuButtons =
      this.view.document.querySelectorAll<HTMLButtonElement>('#openSubMenu');
    const closeSubMenuButtons =
      this.view.document.querySelectorAll<HTMLButtonElement>('#closeSubmenu');

    openSubMenuButtons.forEach(button => {
      button.addEventListener('click', () => {
        const target = button.dataset.menu;

        if (target) {
          const targetElement = this.view.document.querySelector<HTMLDivElement>(`#${target}`);

          if (targetElement) {
            targetElement.classList.remove('hidden');
          }
        }
      });
    });

    closeSubMenuButtons.forEach(button => {
      button.addEventListener('click', () => {
        const targetElement = button.parentElement;

        if (targetElement) {
          targetElement.classList.add('hidden');
        }
      });
    });
  }

  private initStartGameButtonListeners() {
    const startGameButtons = this.view.document.querySelectorAll<HTMLButtonElement>('#startGame');
    const warningNotice = this.view.document.querySelector<HTMLParagraphElement>('#warningNotice')!;
    warningNotice.textContent = '';

    startGameButtons.forEach(button => {
      button.addEventListener('click', () => {
        const target = button.dataset.gameType;

        switch (target) {
          case 'daily': {
            this.gameManager.configGame({
              ...this.gameManager.optionDefaults,
              seed: getCurrentDate(),
            });
            this.view.stopAutoPlay();
            this.switchViewFn(target, target);
            break;
          }
          case 'custom': {
            const gridSizeValidation: NumberValidation = { min: 5, max: 15 };
            const gridSizeInput =
              this.view.document.querySelector<HTMLInputElement>('#gridSizeInput');
            const gridSizeInputValue =
              gridSizeInput && gridSizeInput.value.length
                ? parseInt(gridSizeInput.value, 10)
                : this.gameManager.optionDefaults.size;

            if (!this.validateInput(gridSizeInputValue, gridSizeValidation)) {
              warningNotice.textContent = `Grid size must be between ${gridSizeValidation.min} and ${gridSizeValidation.max}`;
              break;
            }

            const handSizeValidation: NumberValidation = { min: 1, max: 3 };
            const handSizeInput =
              this.view.document.querySelector<HTMLInputElement>('#handSizeInput');
            const handSizeInputValue =
              handSizeInput && handSizeInput.value.length
                ? parseInt(handSizeInput.value, 10)
                : this.gameManager.optionDefaults.maxHandSize;

            if (!this.validateInput(handSizeInputValue, handSizeValidation)) {
              warningNotice.textContent = `Hand size must be between ${handSizeValidation.min} and ${handSizeValidation.max}`;
              break;
            }

            const deckSizeValidation: NumberValidation = { min: 10, max: 100 };
            const deckSizeInput =
              this.view.document.querySelector<HTMLInputElement>('#deckSizeInput');
            const deckSizeInputValue =
              deckSizeInput && deckSizeInput.value.length
                ? parseInt(deckSizeInput.value, 10)
                : this.gameManager.optionDefaults.initialDeckSize;

            if (!this.validateInput(deckSizeInputValue, deckSizeValidation)) {
              warningNotice.textContent = `Deck size must be between ${deckSizeValidation.min} and ${deckSizeValidation.max}`;
              break;
            }

            const seedInput = this.view.document.querySelector<HTMLInputElement>('#seedInputStr');
            const seedInputValue =
              seedInput && seedInput.value.length ? seedInput.value : undefined;

            this.gameManager.configGame({
              seed: seedInputValue,
              size: gridSizeInputValue,
              maxHandSize: handSizeInputValue,
              initialDeckSize: deckSizeInputValue,
            });
            this.view.stopAutoPlay();
            this.switchViewFn(target, target);
            break;
          }
        }
      });
    });
  }

  private initFooterButtonListeners() {
    const toggleMeditationButtons = this.view.document.querySelectorAll<HTMLButtonElement>(
      '.button[data-action="toggleMeditation"]'
    );

    toggleMeditationButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.view.toggleMeditationMode();
        button.blur();
      });
    });
  }

  private validateInput(val: number, validation: NumberValidation): boolean {
    return val >= validation.min && val <= validation.max;
  }
}
