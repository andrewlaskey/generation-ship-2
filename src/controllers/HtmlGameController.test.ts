import { describe, it, expect, vi, beforeEach } from 'vitest';
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
        drawItemToHand: vi.fn(() => true) // Mock drawItemToHand method
    };
};

describe('HtmlGameController', () => {
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

    it('should attach event listener to the next turn button', () => {
        // Spy on the gameManager's updateBoard method
        const updateBoardSpy = vi.spyOn(gameManager, 'updateBoard');

        // Simulate a click on the next turn button
        const nextTurnButton = document.querySelector('#nextTurn') as HTMLButtonElement;
        expect(nextTurnButton).not.toBeNull();

        nextTurnButton.click();  // Simulate the button click

        // Ensure the gameManager's updateBoard method was called
        expect(updateBoardSpy).toHaveBeenCalledTimes(1);
    });

    it('should re-render the grid after clicking next turn', () => {
        // Spy on updateGrid to verify it gets called when next turn is clicked
        const updateGridSpy = vi.spyOn(htmlGameView, 'updateGrid');

        // Simulate a click on the next turn button
        const nextTurnButton = document.querySelector('#nextTurn') as HTMLButtonElement;
        nextTurnButton.click();  // Simulate the button click

        // Ensure that updateGrid was called again after the button click
        expect(updateGridSpy).toHaveBeenCalledTimes(1);  // Once for initial render, once for after the click
    });

    it('should attach event listener to the draw item button', () => {
        // Spy on the gameManager's drawItemToHand method
        const drawItemToHandSpy = vi.spyOn(gameManager, 'drawItemToHand');

        // Simulate a click on the draw item button
        const drawItemButton = document.querySelector('#drawItem') as HTMLButtonElement;
        expect(drawItemButton).not.toBeNull();

        drawItemButton.click();  // Simulate the button click

        // Ensure the gameManager's drawItemToHand method was called
        expect(drawItemToHandSpy).toHaveBeenCalledTimes(1);
    });

    it('should re-render the grid after clicking draw item', () => {
        // Spy on updateGrid to verify it gets called when draw item is clicked
        const updateGridSpy = vi.spyOn(htmlGameView, 'updateGrid');

        // Simulate a click on the draw item button
        const drawItemButton = document.querySelector('#drawItem') as HTMLButtonElement;
        drawItemButton.click();  // Simulate the button click

        // Ensure that updateGrid was called again after the button click
        expect(updateGridSpy).toHaveBeenCalledTimes(1);  // Once for initial render, once for after the click
    });
});
