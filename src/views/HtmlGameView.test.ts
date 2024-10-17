import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameManager } from '../modules/GameManager';
import { HtmlGameView } from './HtmlGameView';
import { JSDOM } from 'jsdom';

// Create a mock GameManager for testing
const createMockGameManager = (gameSize: number) => {
    return {
        gameBoard: {
            size: gameSize,
            getSpace: vi.fn((x, y) => {
                // Return mock spaces with different tile types for testing
                return {
                    tile: { 
                        type: (x + y) % 2 === 0 ? 'tree' : 'people', 
                        level: 2, 
                        state: 'neutral'
                    }
                };
            })
        },
        updateBoard: vi.fn(), // Mock updateBoard method,
        getPlayerHand: vi.fn(() => {
            return []
        }),
        getDeckItemCount: vi.fn(() => 52),
        getSelectedItemIndex: vi.fn(() => 0),
        rotateSelectedItem: vi.fn(),
        startGame: vi.fn()
    };
};

describe('HtmlGameView', () => {
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
        htmlGameView = new HtmlGameView(gameManager, document);

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
        expect(rows.length).toBe(5);  // 5 rows for a 5x5 grid

        const cells = appDiv!.querySelectorAll('.cell');
        expect(cells.length).toBe(25);  // 25 cells for a 5x5 grid

        // Verify that the first cell has the correct class based on the mocked GameManager
        const firstCell = cells[0];
        expect(firstCell.classList.contains('tree')).toBe(true);  // Based on the mock logic
        expect(firstCell.classList.contains('neutral')).toBe(true);  // Default state
    });

    it('should render different tile types and levels based on game state', () => {
        // Call updateGrid to render the grid
        htmlGameView.updateGrid();

        // Verify that cells alternate between "tree" and "people" based on the mock
        const cells = document.querySelectorAll('.cell');

        expect(cells[0].classList.contains('tree')).toBe(true);  // First tile is a tree
        expect(cells[1].classList.contains('people')).toBe(true);  // Second tile is people

        // Verify that tile levels are correctly applied
        expect(cells[0].classList.contains('l2')).toBe(true);  // First tile level is 2
        expect(cells[1].classList.contains('l2')).toBe(true);  // Second tile level is 2
    });
});
