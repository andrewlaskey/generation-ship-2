import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { GameManager, GameState } from './GameManager';
import { TileBlock } from './TileBlock';
import { Tile, TileState, TileType } from './Tile';
import { GameBoard } from './GameBoard';
import { PlayerHand } from './PlayerHand';
import { Deck } from './Deck';
import { BoardSpace } from './BoardSpace';
import { ScoreObject } from './ScoreObject';

// Mock necessary classes
const createMockBoardSpace = (): Partial<BoardSpace> => ({
  tile: null,
  history: [],
  placeTile: vi.fn(),
  removeTile: vi.fn(),
});

const createMockGameBoard = (size: number): Partial<GameBoard> => {
  const spaces: BoardSpace[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => createMockBoardSpace() as unknown as BoardSpace)
  );
  return {
    size,
    getSpace: vi.fn((x: number, y: number) => (spaces[x] && spaces[x][y] ? spaces[x][y] : null)),
    countTileTypes: vi.fn(),
    setStartingCondition: vi.fn(),
    clearBoard: vi.fn(),
    updateBoard: vi.fn(),
    getHabitatAges: vi.fn().mockReturnValue([]),
  };
};

const createMockDeck = (): Partial<Deck> => ({
  drawItem: vi.fn(),
  getItemCount: vi.fn(() => 10),
  fillInitialDeck: vi.fn(),
  setItems: vi.fn(),
  reset: vi.fn(),
});

const createMockPlayerHand = (): Partial<PlayerHand> => ({
  addItem: vi.fn(),
  isFull: vi.fn(() => false),
  getItems: vi.fn(() => []),
  removeItem: vi.fn(),
  selectItem: vi.fn(),
  getSelectedItemIndex: vi.fn(() => 0),
  rotateSelected: vi.fn(),
  clearHand: vi.fn(),
});

const mockTreeConfig = {
  type: TileType.Tree,
  rules: [
    {
      result: 'thriving',
      combineConditions: 'AND',
      priority: 1,
      conditions: [
        {
          kind: 'single',
          type: TileType.People,
          count: 1,
          evaluation: 'eq',
        },
      ],
    },
  ],
  results: [
    {
      name: 'thriving',
      updateState: {
        unhealthy: TileState.Neutral,
        neutral: TileState.Healthy,
        healthy: TileState.Healthy,
      },
    },
  ],
};
const configMap = new Map();
configMap.set(TileType.Tree, mockTreeConfig);

describe('GameManager', () => {
  let gameManager: GameManager;
  let gameBoard: Partial<GameBoard>;
  let deck: Partial<Deck>;
  let playerHand: Partial<PlayerHand>;

  const deckSize = 10;

  beforeEach(() => {
    gameBoard = createMockGameBoard(5);
    deck = createMockDeck();
    playerHand = createMockPlayerHand();
    gameManager = new GameManager({
      size: 5,
      initialDeckSize: deckSize,
      maxHandSize: 5,
      ruleConfigs: configMap,
    });

    gameManager.gameBoard = gameBoard as GameBoard;
    gameManager.deck = deck as Deck;
    gameManager.playerHand = playerHand as PlayerHand;
  });

  it('should call both updateBoard and fillHand when starting the game', () => {
    vi.spyOn(gameManager, 'updateBoard').mockImplementation(() => {});
    vi.spyOn(gameManager, 'fillHand').mockImplementation(() => {
      return true;
    });

    (gameBoard.countTileTypes as Mock).mockReturnValue({});

    // Call startGame
    gameManager.startGame();

    // Verify both methods were called once
    expect(gameManager.updateBoard).toHaveBeenCalledTimes(1);
    expect(gameManager.fillHand).toHaveBeenCalledTimes(1);
  });

  it('should fill the player hand from the deck', () => {
    // Mock `isFull` to return `false` initially, then `true` after one item is added
    (playerHand.isFull as Mock)
      .mockReturnValueOnce(false) // Hand is not full initially
      .mockReturnValueOnce(false) // Still not full after one item
      .mockReturnValueOnce(true); // Hand is full after two items

    // Mock `drawItem` to return a TileBlock the first two times, then null (deck is empty)
    (deck.drawItem as Mock)
      .mockReturnValueOnce(new TileBlock([new Tile('tree', 1, 'neutral'), null])) // First draw
      .mockReturnValueOnce(new TileBlock([new Tile('farm', 1, 'neutral'), null])) // Second draw
      .mockReturnValueOnce(null); // Deck runs out

    // Mock `addItem` to simulate successfully adding items to the hand
    (playerHand.addItem as Mock).mockReturnValue(true);

    const result = gameManager.fillHand();

    expect(result).toBe(true); // Hand should be filled successfully
    expect(deck.drawItem).toHaveBeenCalledTimes(2); // Ensure we only draw twice
    expect(playerHand.addItem).toHaveBeenCalledTimes(2); // Ensure two items were added
  });

  it('should stop filling the hand if the deck is empty', () => {
    (deck.drawItem as Mock).mockReturnValueOnce(null);

    const result = gameManager.fillHand();

    expect(result).toBe(false);
    expect(deck.drawItem).toHaveBeenCalled();
    expect(playerHand.addItem).not.toHaveBeenCalled();
  });

  it('should place a TileBlock from the player hand on the board', () => {
    const tileBlock = new TileBlock([
      new Tile('tree', 1, 'neutral'),
      new Tile('farm', 1, 'neutral'),
    ]);
    (playerHand.getItems as Mock).mockReturnValue([tileBlock]);

    const result = gameManager.placeTileBlock(0, 0, 0);

    expect(result).toBe(true);
    const space = gameBoard.getSpace!(0, 0) as BoardSpace;
    expect(space.placeTile).toHaveBeenCalledWith(expect.any(Tile));
    expect(playerHand.removeItem).toHaveBeenCalledWith(0);
  });

  it('should handle invalid placement when placing a TileBlock', () => {
    const tileBlock = new TileBlock([
      new Tile('tree', 1, 'neutral'),
      new Tile('farm', 1, 'neutral'),
    ]);
    (playerHand.getItems as Mock).mockReturnValue([tileBlock]);

    (gameBoard.getSpace as Mock).mockReturnValueOnce(null); // Invalid placement

    const result = gameManager.placeTileBlock(10, 10, 0);

    expect(result).toBe(false);
    expect(playerHand.removeItem).not.toHaveBeenCalled();
  });

  it('should update the board by calling gameboard.updateBoard', () => {
    // Act
    gameManager.updateBoard();

    // Assert
    expect(gameBoard.updateBoard).toHaveBeenCalled();
  });

  it('should get the current player hand', () => {
    gameManager.getPlayerHand();
    expect(playerHand.getItems).toHaveBeenCalled();
  });

  it('should get the remaining deck size', () => {
    const deckSizeResult = gameManager.getDeckItemCount();
    expect(deckSizeResult).toBe(deckSize);
    expect(deck.getItemCount).toHaveBeenCalled();
  });

  it('should select an item from the hand', () => {
    gameManager.selectItemFromHand(2);
    expect(playerHand.selectItem).toHaveBeenCalledWith(2);
  });

  it('should rotate the selected item from the hand', () => {
    gameManager.rotateSelectedItem();
    expect(playerHand.rotateSelected).toHaveBeenCalled();
  });

  describe('Player Score', () => {
    it('should return the default player score', () => {
      expect(gameManager.getPlayerScore('ecology')).toBe(0);
      expect(gameManager.getPlayerScore('population')).toBe(0);
    });

    it('board changes should update the player score', () => {
      // scenario 1
      (gameBoard.countTileTypes as Mock).mockReturnValueOnce({
        tree: 1,
        farm: 2,
      });
      gameManager.updatePlayerScore();
      expect(gameManager.getPlayerScore('ecology')).toBe(1);
      expect(gameManager.getPlayerScore('population')).toBe(0);

      // scenario 2
      (gameBoard.countTileTypes as Mock).mockReturnValueOnce({
        tree: 4,
        people: 3,
      });
      gameManager.updatePlayerScore();
      expect(gameManager.getPlayerScore('ecology')).toBe(4);
      expect(gameManager.getPlayerScore('population')).toBe(15); // 3 * 5
    });

    it('should return a score object', () => {
      (gameBoard.countTileTypes as Mock)
        .mockReturnValueOnce({
          tree: 1,
          farm: 2,
        })
        .mockReturnValue({
          tree: 0,
        });

      gameManager.updatePlayerScore();
      gameManager.updatePlayerScore();

      const scoreObj: ScoreObject | undefined = gameManager.getPlayerScoreObj('ecology');

      expect(scoreObj).toMatchObject({
        name: 'ecology',
        value: 0,
        history: [0, 1],
      });
    });
  });

  it('should reset the game to starting conditions', () => {
    (gameBoard.countTileTypes as Mock).mockReturnValue({});

    gameManager.startGame();
    gameManager.resetGame();

    expect(gameManager.getPlayerScore('ecology')).toBe(0);
    expect(gameManager.getPlayerScore('population')).toBe(0);
    expect(gameManager.state).toBe(GameState.Ready);

    expect(gameBoard.clearBoard).toHaveBeenCalled();
    expect(playerHand.clearHand).toHaveBeenCalled();
    expect(deck.reset).toHaveBeenCalled();
  });

  it('should call necessary updates when advancing turn', () => {
    vi.spyOn(gameManager, 'updateBoard').mockImplementation(() => {});
    vi.spyOn(gameManager, 'updatePlayerScore').mockImplementation(() => {});
    vi.spyOn(gameManager, 'fillHand').mockImplementation(() => true);
    vi.spyOn(gameManager, 'checkWinLossConditions').mockImplementation(() => {});

    gameManager.advanceTurn();

    expect(gameManager.updateBoard).toHaveBeenCalled();
    expect(gameManager.updatePlayerScore).toHaveBeenCalled();
    expect(gameManager.fillHand).toHaveBeenCalled();
    expect(gameManager.checkWinLossConditions).toHaveBeenCalled();
  });

  it('should update state to lose if zero population', () => {
    gameManager.playerScore = {
      ecology: new ScoreObject('ecology', 0),
      population: new ScoreObject('population', 0),
    };

    gameManager.checkWinLossConditions();

    expect(gameManager.state).toBe(GameState.GameOver);
  });

  it('should update state to finished if deck is empty', () => {
    // simulate an empty player hand
    (playerHand.getItems as Mock).mockReturnValue([]);

    gameManager.playerScore = {
      ecology: new ScoreObject('ecology', 0),
      population: new ScoreObject('population', 10),
    };

    gameManager.checkWinLossConditions();

    expect(gameManager.state).toBe(GameState.Complete);
  });

  it('should not update state if in freeplay mode', () => {
    const freeplayGameManager = new GameManager({
      size: 5,
      initialDeckSize: deckSize,
      maxHandSize: 5,
      freeplay: true,
      ruleConfigs: configMap,
    });
    freeplayGameManager.gameBoard = gameBoard as GameBoard;
    freeplayGameManager.deck = deck as Deck;
    freeplayGameManager.playerHand = playerHand as PlayerHand;

    // Set population to zero
    freeplayGameManager.playerScore = {
      ecology: new ScoreObject('ecology', 0),
      population: new ScoreObject('population', 0),
    };

    (gameBoard.countTileTypes as Mock).mockReturnValueOnce({
      tree: 0,
      people: 0,
    });

    // simulate an empty player hand
    (playerHand.getItems as Mock).mockReturnValue([]);

    // Start the game to set state to Playing
    freeplayGameManager.startGame();

    // Method being tested
    freeplayGameManager.checkWinLossConditions();

    expect(freeplayGameManager.state).toBe(GameState.Playing);
  });

  describe('countNeighbors', () => {
    it('should not count dead neighbors', () => {
      const deadTile = new Tile(TileType.Power, 1, TileState.Dead);
      const mockNeighborSpace = {
        ...createMockBoardSpace(),
        tile: deadTile,
      };
      const boardSpace = new BoardSpace(0, 0);
      (gameBoard.getSpace as Mock).mockReturnValue(mockNeighborSpace);

      const result = gameManager.countNeighbors(boardSpace, [TileType.Power]);

      expect(result).toBe(0);
    });

    it('should include tile level in count', () => {
      const tile = new Tile(TileType.Tree, 2, TileState.Healthy);
      const mockNeighborSpace = {
        ...createMockBoardSpace(),
        tile,
      };
      const boardSpace = new BoardSpace(0, 0);
      (gameBoard.getSpace as Mock).mockReturnValueOnce(mockNeighborSpace).mockReturnValue(null);

      const result = gameManager.countNeighbors(boardSpace, [TileType.Tree], true);

      expect(result).toBe(2);
    });
  });

  it('should return the correct calculated base player score', () => {
    (gameBoard.countTileTypes as Mock).mockReturnValue({
      tree: 1,
      people: 2,
    });

    gameManager.updatePlayerScore();
    const result = gameManager.getFinalPlayerScoreElements();

    expect(result.get('Base')).toBe(1100);
  });

  it('should correctly subtract deckSize from calculated player score', () => {
    // One ecology and 2 people = 1 + (2 * 5)
    (gameBoard.countTileTypes as Mock).mockReturnValue({
      tree: 1,
      people: 2,
    });
    // 5 Cards remaining in deck
    (deck.getItemCount as Mock).mockReturnValue(5);

    gameManager.updatePlayerScore();

    const result = gameManager.getFinalPlayerScoreElements();

    // result = (100 * (1 + (2 * 5)) - 5
    expect(result.get('Remaining deck penalty')).toBe(-5);
  });

  it('should return the correct eco ratio score', () => {
    (gameBoard.countTileTypes as Mock).mockReturnValue({
      tree: 1,
      people: 2,
    });

    gameManager.updatePlayerScore();
    const result = gameManager.getFinalPlayerScoreElements();

    expect(result.get('Ecology ratio bonus')).toBe(100);
  });

  it('should return the correct waste penalty', () => {
    (gameBoard.countTileTypes as Mock).mockReturnValue({
      tree: 1,
      people: 2,
      waste: 4,
    });

    gameManager.updatePlayerScore();
    const result = gameManager.getFinalPlayerScoreElements();

    expect(result.get('Waste tiles penalty')).toBe(-40);
  });

  it('should return the correct survival bonus', () => {
    // Arrange
    (gameBoard.countTileTypes as Mock).mockReturnValue({
      tree: 1,
      people: 2,
      waste: 4,
    });
    (gameBoard.getHabitatAges as Mock).mockReturnValue([3, 2]);

    // Act
    const result = gameManager.getFinalPlayerScoreElements();

    // Assert
    expect(result.get('Habitat survival bonus')).toBe(50);
  });

  it.skip('should correctly multiply calculated player score by the time factor', () => {
    // One people tile = 5 points
    (gameBoard.countTileTypes as Mock).mockReturnValue({
      tree: 0,
      people: 1,
    });
    // Empty deck
    (deck.getItemCount as Mock).mockReturnValue(0);

    // 3 minutes
    vi.spyOn(gameManager, 'getGameDurationMs').mockImplementation(() => {
      return 60000 * 3;
    });

    gameManager.updatePlayerScore();
    const result = gameManager.getCalculatedPlayerScore();

    // result = Math.round(((100 * (0 + (1 * 5))) - 0) * (1 + 10/3))
    expect(result).toBe(2167);
  });
});
