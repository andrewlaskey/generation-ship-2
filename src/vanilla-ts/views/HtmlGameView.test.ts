import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameManager } from '../../modules/GameManager';
import { HtmlGameView } from './HtmlGameView';
import { JSDOM } from 'jsdom';
import { Tile, TileState, TileType } from '../../modules/Tile';
import { GameBoard } from '../../modules/GameBoard';

// Create a mock GameManager for testing
const createMockGameManager = (gameSize: number) => {
  return {
    gameBoard: new GameBoard(gameSize),
    updateBoard: vi.fn(), // Mock updateBoard method,
    getPlayerHand: vi.fn(() => {
      return [];
    }),
    getDeckItemCount: vi.fn(() => 52),
    getSelectedItemIndex: vi.fn(() => 0),
    rotateSelectedItem: vi.fn(),
    startGame: vi.fn(),
    getPlayerScore: vi.fn(),
  };
};

describe.skip('HtmlGameView', () => {
  let gameManager: GameManager;
  let htmlGameView: HtmlGameView;
  let dom: JSDOM;
  let document: Document;

  beforeEach(() => {
    // Create a mock document using JSDOM
    dom = new JSDOM('<!DOCTYPE html><div id="app"></div>');
    document = dom.window.document;

    // Create a mock game manager with a grid size of 5x5
    gameManager = createMockGameManager(5) as unknown as GameManager;
    htmlGameView = new HtmlGameView(gameManager, document, 'daily');

    // Replace document.querySelector with the one from the mock DOM
    global.document = document;
  });

  it('should render the game grid correctly', () => {
    // Call the renderGrid method (via updateGrid, which calls renderGrid internally)
    htmlGameView.updateGrid();

    // Verify that the grid has been rendered inside the #app div
    const appDiv = document.querySelector('#app');
    expect(appDiv).not.toBeNull();

    // Verify that the correct number of rows and cells have been rendered
    const rows = appDiv!.querySelectorAll('.row');
    expect(rows.length).toBe(5); // 5 rows for a 5x5 grid

    const cells = appDiv!.querySelectorAll('.cell');
    expect(cells.length).toBe(25); // 25 cells for a 5x5 grid
  });

  it('should render different tile types and levels based on game state', () => {
    // Update the board with a specific tile
    gameManager.gameBoard.placeTileAt(0, 0, new Tile(TileType.Tree, 2, TileState.Healthy));

    // Call updateGrid to render the grid
    htmlGameView.updateGrid();

    const cells = document.querySelectorAll('.cell');

    // Verify that cells type correctly applied
    expect(cells[0].classList.contains('tree')).toBe(true); // First tile is a tree

    // Verify that tile levels are correctly applied
    expect(cells[0].classList.contains('l2')).toBe(true); // First tile level is 2

    // Verify that cells tile status correctly applied
    expect(cells[0].classList.contains('healthy')).toBe(true);
  });
});
