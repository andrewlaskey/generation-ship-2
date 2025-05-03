import { GameBoard } from './GameBoard';
import { TileState, TileType } from './Tile';
import { BoardSpace } from './BoardSpace';
import { PlayerHand, HandItem } from './PlayerHand';
import { Deck } from './Deck';
import { TileBlock } from './TileBlock';
import { ScoreObject } from './ScoreObject';
import { ConsoleLogLevel } from '../types/ConsoleLogLevels';
import { TileRuleConfig } from './TileRules';

export type GameManagerOptions = {
  size: number;
  initialDeckSize: number;
  maxHandSize: number;
  seed?: string;
  infiniteDeck?: boolean;
  randomTileStates?: boolean;
  freeplay?: boolean;
  logging?: boolean;
  ruleConfigs?: Map<string, TileRuleConfig>;
};

export enum GameState {
  Ready = 'ready',
  Playing = 'playing',
  GameOver = 'game over',
  Complete = 'complete',
}

export class GameManager {
  gameBoard: GameBoard;
  playerHand: PlayerHand; // Player's hand
  deck: Deck; // Deck for drawing HandItems
  playerScore: Record<string, ScoreObject>;
  options: GameManagerOptions;
  state: GameState;
  readonly optionDefaults: GameManagerOptions = {
    size: 9,
    initialDeckSize: 40,
    maxHandSize: 3,
    infiniteDeck: false,
    freeplay: false,
    logging: false,
  };
  gameStartTime: number = Date.now();
  gameEndTime: number = Date.now();
  tileRuleConfigs: Map<string, TileRuleConfig>;

  // private timeScoreFactor: number = 10;

  constructor(options?: Partial<GameManagerOptions>) {
    this.options = {
      ...this.optionDefaults,
      ...options,
    };

    if (!this.options.ruleConfigs) {
      throw new Error('Tile rules missing');
    }

    this.tileRuleConfigs = this.options.ruleConfigs;
    this.gameBoard = new GameBoard(this.options.size);
    this.playerHand = new PlayerHand(this.options.maxHandSize); // Initialize the player's hand
    this.deck = new Deck(
      this.options.seed,
      this.options.infiniteDeck,
      undefined,
      this.options.randomTileStates
    ); // Initialize the deck with seed and infinite options
    this.deck.fillInitialDeck(this.options.initialDeckSize); // Fill the deck with initial items
    this.playerScore = {
      ecology: new ScoreObject('ecology', 0),
      population: new ScoreObject('population', 0),
      waste: new ScoreObject('waste', 0),
    };
    this.state = GameState.Ready;
  }

  configGame(options: Partial<GameManagerOptions>) {
    this.options = {
      ...this.options,
      ...options,
    };

    if (this.options.ruleConfigs) {
      this.tileRuleConfigs = this.options.ruleConfigs;
    }

    this.gameBoard = new GameBoard(this.options.size);
    this.playerHand = new PlayerHand(this.options.maxHandSize); // Initialize the player's hand
    this.deck = new Deck(
      this.options.seed,
      this.options.infiniteDeck,
      undefined,
      this.options.randomTileStates
    ); // Initialize the deck with seed and infinite options
    this.deck.fillInitialDeck(this.options.initialDeckSize); // Fill the deck with initial items
    this.playerScore = {
      ecology: new ScoreObject('ecology', 0),
      population: new ScoreObject('population', 0),
      waste: new ScoreObject('waste', 0),
    };
    this.state = GameState.Ready;
  }

  // Draw a new item from the deck into the player's hand
  drawItemToHand(): boolean {
    if (!this.playerHand.isFull()) {
      const item = this.deck.drawItem();
      if (item) {
        return this.playerHand.addItem(item); // Add the item to the hand if there's room
      }
    }
    return false;
  }

  fillHand(): boolean {
    let handWasFilled = true;

    while (!this.playerHand.isFull()) {
      if (!this.tryToAddItemToHand()) {
        handWasFilled = false;
        break;
      }
    }

    return handWasFilled;
  }

  private tryToAddItemToHand(): boolean {
    const item = this.deck.drawItem();

    if (!item) {
      this.log('warn', 'Deck is empty, cannot fill hand completely.');
      return false; // No more items in the deck
    }

    const success = this.playerHand.addItem(item);
    if (!success) {
      this.log('error', 'Failed to add item to player hand.');
      return false;
    }

    return true;
  }

  // Place a TileBlock from the player's hand onto the board
  placeTileBlock(x: number, y: number, handIndex: number): boolean {
    const handItem = this.playerHand.getItems()[handIndex];
    if (handItem instanceof TileBlock) {
      const tileBlock = handItem as TileBlock;
      try {
        tileBlock.placeOnGrid(x, y, this.gameBoard); // Place the TileBlock on the game board
        this.playerHand.removeItem(handIndex); // Remove the placed item from the hand
        return true;
      } catch (e) {
        this.log('error', e); // Log the error and return false
        return false;
      }
    }
    return false; // Return false if the hand item is not a TileBlock
  }

  addBoardHighlight(x: number, y: number): void {
    this.gameBoard.toggleSpaceHighlight(x, y, true);
  }

  removeBoardHighlight(x: number, y: number): void {
    this.gameBoard.toggleSpaceHighlight(x, y, false);
  }

  clearHighlights(): void {
    this.gameBoard.clearHighlights();
  }

  // Get the current state of the player's hand
  getPlayerHand(): HandItem[] {
    return this.playerHand.getItems(); // Return the items in the player's hand
  }

  // API for views to display the deck count (number of items remaining)
  getDeckItemCount(): number {
    return this.deck.getItemCount();
  }

  // Update the entire board (existing logic)
  updateBoard(): void {
    if (this.tileRuleConfigs.size === 0) {
      throw new Error('No rule configs loaded');
    }

    this.gameBoard.updateBoard(this.tileRuleConfigs);
  }

  // Start a new game
  startGame(): void {
    this.updateBoard();
    this.fillHand();
    this.gameBoard.setStartingCondition();
    this.updatePlayerScore();
    this.state = GameState.Playing;
    this.gameStartTime = Date.now();
  }

  resetGame(): void {
    this.gameBoard.clearBoard();
    this.playerHand.clearHand();
    this.deck.reset();
    this.deck.fillInitialDeck(this.options.initialDeckSize); // Fill the deck with initial items
    this.playerScore = {
      ecology: new ScoreObject('ecology', 0),
      population: new ScoreObject('population', 0),
      waste: new ScoreObject('waste', 0),
    };
    this.updatePlayerScore();
    this.state = GameState.Ready;
  }

  advanceTurn(): void {
    this.updateBoard();
    this.updatePlayerScore();
    this.fillHand();
    this.checkWinLossConditions();
  }

  checkWinLossConditions(): void {
    // Skip checking conditions if in freeplay mode
    if (this.options.freeplay) {
      return;
    }

    // Lose if population is zero
    const pop = this.getPlayerScore('population');

    if (pop <= 0) {
      this.state = GameState.GameOver;
      return; // skip other conditions;
    }

    // Game ends when player runs out of tiles to play
    const numTilesInHand = this.getPlayerHand().length;

    if (numTilesInHand <= 0) {
      this.state = GameState.Complete;
      return; // skip other conditions
    }

    if ([GameState.Complete, GameState.GameOver].includes(this.state)) {
      this.gameEndTime = Date.now();
    }
  }

  getPlayerScore(name: string): number {
    if (Object.hasOwn(this.playerScore, name)) {
      return this.playerScore[name].value;
    }
    this.log('error', `No player score of ${name} exists`);
    return 0;
  }

  getPlayerScoreObj(name: string): ScoreObject | undefined {
    return this.playerScore[name];
  }

  updatePlayerScore(): void {
    const tileTypeCounts = this.gameBoard.countTileTypes(true);
    const peopleScoreMultiplier = 5;

    if (
      Object.hasOwn(tileTypeCounts, TileType.Tree) &&
      Object.hasOwn(this.playerScore, 'ecology')
    ) {
      this.playerScore.ecology.update(tileTypeCounts[TileType.Tree]);
    } else {
      this.playerScore.ecology.update(0);
    }

    if (
      Object.hasOwn(tileTypeCounts, TileType.People) &&
      Object.hasOwn(this.playerScore, 'population')
    ) {
      this.playerScore.population.update(tileTypeCounts[TileType.People] * peopleScoreMultiplier);
    } else {
      this.playerScore.population.update(0);
    }

    if (Object.hasOwn(tileTypeCounts, TileType.Waste) && Object.hasOwn(this.playerScore, 'waste')) {
      this.playerScore.waste.update(tileTypeCounts[TileType.Waste]);
    } else {
      this.playerScore.waste.update(0);
    }
  }

  // Helper method to count specific types of neighbors
  countNeighbors(space: BoardSpace, types: string[], includeLevelInCount = false): number {
    const { x, y } = space;
    const neighbors = this.getNeighbors(x, y);
    return neighbors.reduce((count, neighborSpace) => {
      if (
        neighborSpace.tile &&
        types.includes(neighborSpace.tile.type) &&
        neighborSpace.tile.state != TileState.Dead
      ) {
        count += includeLevelInCount ? neighborSpace.tile.level : 1;
      }

      return count;
    }, 0);
  }

  // Method to get all neighboring spaces of a given space on the gameboard
  getNeighbors(x: number, y: number): BoardSpace[] {
    const neighbors: BoardSpace[] = [];
    const directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1], // Cardinal directions (N, S, W, E)
      [-1, -1],
      [1, 1],
      [-1, 1],
      [1, -1], // Diagonal directions
    ];

    directions.forEach(([dx, dy]) => {
      const neighbor = this.gameBoard.getSpace(x + dx, y + dy);
      if (neighbor) {
        neighbors.push(neighbor);
      }
    });

    return neighbors;
  }

  selectItemFromHand(index: number): void {
    this.playerHand.selectItem(index);
  }

  getSelectedItemIndex(): number {
    return this.playerHand.getSelectedItemIndex();
  }

  getSelectedItem(): HandItem {
    const handItems: HandItem[] = this.getPlayerHand();
    const selectedIndex = this.getSelectedItemIndex();
    return handItems[selectedIndex];
  }

  rotateSelectedItem(): void {
    this.playerHand.rotateSelected();
  }

  getFinalPlayerScoreElements(): Map<string, number> {
    const scoreElements = new Map<string, number>();
    const eco = this.getPlayerScore('ecology');
    const pop = this.getPlayerScore('population');
    const waste = this.getPlayerScore('waste');
    const habitatAges = this.gameBoard.getHabitatAges();
    const oldestTree = this.gameBoard.getOldestTree();
    const baseScoreMultiplier = 100;
    const wastePenaltyMultiplier = -10;
    const ecoRatioMultiplier = 1000;
    const ecoRatioNoPopBase = 100;
    const survivalBonusMultiplier = 10;
    const oldestTreeBonusMultiplier = 10;

    scoreElements.set('Base', baseScoreMultiplier * (eco + pop));

    scoreElements.set(
      'Ecology ratio bonus',
      pop > 0 ? Math.round(ecoRatioMultiplier * (eco / pop)) : ecoRatioNoPopBase
    );

    scoreElements.set('Remaining deck penalty', this.getDeckItemCount() * -1);

    scoreElements.set('Waste tiles penalty', waste * wastePenaltyMultiplier);

    const survivalBonus = habitatAges.reduce((sum, age) => {
      return sum + age * survivalBonusMultiplier;
    }, 0);
    scoreElements.set('Habitat survival bonus', survivalBonus);

    scoreElements.set(
      'Old growth tree bonus',
      oldestTree > 20 ? oldestTree * oldestTreeBonusMultiplier : 0
    );

    return scoreElements;
  }

  getCalculatedPlayerScore(): number {
    let score = 0;
    const elements = this.getFinalPlayerScoreElements();

    for (const num of elements.values()) {
      score += num;
    }

    return score;
  }

  getGameDurationMs(): number {
    if (this.state == GameState.Playing) {
      return this.gameStartTime - Date.now();
    }

    return this.gameStartTime - this.gameEndTime;
  }

  log(logLevel: ConsoleLogLevel, msg: string | unknown): void {
    if (this.options.logging) {
      console[logLevel](msg);
    }
  }
}
