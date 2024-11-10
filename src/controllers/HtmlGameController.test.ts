import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { GameManager } from '../modules/GameManager';
import { HtmlGameView } from '../views/HtmlGameView';
import { HtmlGameController } from './HtmlGameController';
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
        updateBoard: vi.fn(), // Mock updateBoard method
        getPlayerHand: vi.fn(() => {
            return []
        }),
        getDeckItemCount: vi.fn(() => 52),
        drawItemToHand: vi.fn(() => true), // Mock drawItemToHand method
        getSelectedItemIndex: vi.fn(() => 0),
        rotateSelectedItem: vi.fn(),
        fillHand: vi.fn(),
        startGame: vi.fn(),
        updatePlayerScore: vi.fn(),
        getPlayerScore: vi.fn()
    };
};

describe.skip('HtmlGameController', () => {
    let gameManager: GameManager;
    let htmlGameView: HtmlGameView;
    let htmlGameController: HtmlGameController;
    let dom: JSDOM;
    let document: Document;

    beforeEach(() => {
        // Create a mock document using JSDOM
        dom = new JSDOM('<!DOCTYPE html><div id="app"><button id="nextTurn"></button><button id="drawItem"></button></div>');
        document = dom.window.document;

        // Create a mock game manager with a grid size of 5x5
        gameManager = createMockGameManager(5) as unknown as GameManager;
        htmlGameView = new HtmlGameView(gameManager, document);
        htmlGameController = new HtmlGameController(gameManager, htmlGameView);
    });
});
