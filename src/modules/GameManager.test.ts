import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { GameManager } from './GameManager';
import { TileBlock } from './TileBlock';
import { Tile } from './Tile';
import { GameBoard } from './GameBoard';
import { PlayerHand } from './PlayerHand';
import { Deck } from './Deck';
import { BoardSpace } from './BoardSpace';

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
        getSpace: vi.fn((x: number, y: number) => spaces[x] && spaces[x][y] ? spaces[x][y] : null),
    };
};

const createMockDeck = (): Partial<Deck> => ({
    drawItem: vi.fn(),
    getItemCount: vi.fn(() => 10),
    fillInitialDeck: vi.fn(),
});

const createMockPlayerHand = (): Partial<PlayerHand> => ({
    addItem: vi.fn(),
    isFull: vi.fn(() => false),
    getItems: vi.fn(() => []),
    removeItem: vi.fn(),
    selectItem: vi.fn(),
    getSelectedItemIndex: vi.fn(() => 0),
    rotateSelected: vi.fn(),
});

describe('GameManager', () => {
    let gameManager: GameManager;
    let gameBoard: Partial<GameBoard>;
    let deck: Partial<Deck>;
    let playerHand: Partial<PlayerHand>;

    beforeEach(() => {
        gameBoard = createMockGameBoard(5);
        deck = createMockDeck();
        playerHand = createMockPlayerHand();
        gameManager = new GameManager(5, 10, 5);

        gameManager.gameBoard = gameBoard as GameBoard;
        gameManager.deck = deck as Deck;
        gameManager.playerHand = playerHand as PlayerHand;
    });

    it('should fill the player hand from the deck', () => {
        // Mock `isFull` to return `false` initially, then `true` after one item is added
        (playerHand.isFull as Mock)
            .mockReturnValueOnce(false)  // Hand is not full initially
            .mockReturnValueOnce(false)  // Still not full after one item
            .mockReturnValueOnce(true);  // Hand is full after two items
    
        // Mock `drawItem` to return a TileBlock the first two times, then null (deck is empty)
        (deck.drawItem as Mock)
            .mockReturnValueOnce(new TileBlock([new Tile('tree', 1, 'neutral'), null]))  // First draw
            .mockReturnValueOnce(new TileBlock([new Tile('farm', 1, 'neutral'), null]))  // Second draw
            .mockReturnValueOnce(null);  // Deck runs out
    
        // Mock `addItem` to simulate successfully adding items to the hand
        (playerHand.addItem as Mock).mockReturnValue(true);
    
        const result = gameManager.fillHand();
    
        expect(result).toBe(true);  // Hand should be filled successfully
        expect(deck.drawItem).toHaveBeenCalledTimes(2);  // Ensure we only draw twice
        expect(playerHand.addItem).toHaveBeenCalledTimes(2);  // Ensure two items were added
    });
    

    it('should stop filling the hand if the deck is empty', () => {
        (deck.drawItem as Mock).mockReturnValueOnce(null);
        
        const result = gameManager.fillHand();

        expect(result).toBe(false);
        expect(deck.drawItem).toHaveBeenCalled();
        expect(playerHand.addItem).not.toHaveBeenCalled();
    });

    it('should place a TileBlock from the player hand on the board', () => {
        const tileBlock = new TileBlock([new Tile('tree', 1, 'neutral'), new Tile('farm', 1, 'neutral')]);
        (playerHand.getItems as Mock).mockReturnValue([tileBlock]);

        const result = gameManager.placeTileBlock(0, 0, 0);

        expect(result).toBe(true);
        const space = gameBoard.getSpace!(0, 0) as BoardSpace;
        expect(space.placeTile).toHaveBeenCalledWith(expect.any(Tile));
        expect(playerHand.removeItem).toHaveBeenCalledWith(0);
    });

    it('should handle invalid placement when placing a TileBlock', () => {
        const tileBlock = new TileBlock([new Tile('tree', 1, 'neutral'), new Tile('farm', 1, 'neutral')]);
        (playerHand.getItems as Mock).mockReturnValue([tileBlock]);

        (gameBoard.getSpace as Mock).mockReturnValueOnce(null); // Invalid placement

        const result = gameManager.placeTileBlock(10, 10, 0);

        expect(result).toBe(false);
        expect(playerHand.removeItem).not.toHaveBeenCalled();
    });

    it('should update the board', () => {
        gameManager.updateBoard();

        expect(gameBoard.getSpace).toHaveBeenCalledTimes(25);  // 5x5 grid
    });

    it('should get the current player hand', () => {
        gameManager.getPlayerHand();
        expect(playerHand.getItems).toHaveBeenCalled();
    });

    it('should get the remaining deck size', () => {
        const deckSize = gameManager.getDeckItemCount();
        expect(deckSize).toBe(10);
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
});
