import { describe, it, expect, beforeEach } from "vitest";
import { JSDOM } from 'jsdom';
import { GridView } from "./GridView";
import { GameBoard } from "../modules/GameBoard";
import { Tile, TileState, TileType } from "../modules/Tile";

describe('GridView', () => {
    let gridSize = 4;
    let dom: JSDOM;
    let document: Document;
    let gridView: GridView;
    let gameBoard: GameBoard;

    beforeEach(() => {
        // Create a mock document using JSDOM
        dom = new JSDOM('<!DOCTYPE html><div id="app"></div>');
        document = dom.window.document;

        gameBoard = new GameBoard(gridSize);

        gridView = new GridView(document, '#app', gameBoard);

        // Replace document.querySelector with the one from the mock DOM
        global.document = document;
    });

    it('should render the game grid correctly on initialization', () => {
        // Verify that the grid has been rendered inside the #app div
        const appDiv = document.querySelector('#app');
        expect(appDiv).not.toBeNull();
        
        // Verify that the correct number of rows and cells have been rendered
        const rows = appDiv!.querySelectorAll('.row');
        expect(rows.length).toBe(gridSize);

        const cells = appDiv!.querySelectorAll('.cell');
        expect(cells.length).toBe(gridSize * gridSize);

    });
    
    it('should render different tile types and levels based on game state', () => {
        // Update the board with a specific tile
        gameBoard.placeTileAt(0, 0, new Tile(TileType.Tree, 2, TileState.Healthy));

        // Call updateGrid to render the grid
        gridView.updateGrid();

        const cell = document.querySelector('.cell[data-x="0"][data-y="0"]');

        // Verify that cells type correctly applied
        expect(cell?.classList.contains('tree')).toBe(true);  // First tile is a tree

        // Verify that tile levels are correctly applied
        expect(cell?.classList.contains('l2')).toBe(true);  // First tile level is 2

        // Verify that cells tile status correctly applied
        expect(cell?.classList.contains('healthy')).toBe(true);
    });

    it('should render folk spans for people tiles', () => {
         // Update the board with a specific tile
         gameBoard.placeTileAt(0, 0, new Tile(TileType.People, 1, TileState.Healthy));

         // Call updateGrid to render the grid
         gridView.updateGrid();
 
         const spans = document.querySelectorAll('.cell span');

         expect(spans.length).toBe(2);
    });

    it('should remove all folk spans if tile changes to non people tile', () => {
        // Update the board with a specific tile
        gameBoard.placeTileAt(0, 0, new Tile(TileType.People, 1, TileState.Healthy));
        gridView.updateGrid();

        // Replace the tile with a non-people tile
        gameBoard.placeTileAt(0, 0, new Tile(TileType.Tree, 1, TileState.Healthy));
        gridView.updateGrid();

        const cell = document.querySelector('.cell[data-x="0"][data-y="0"]');
        const spans = cell?.querySelectorAll('.cell span');

         expect(spans?.length).toBe(0);
    });

    it('should render tiles in the correct cell in grid', () => {
         // Update the board with a specific tile
         gameBoard.placeTileAt(1, 0, new Tile(TileType.People, 1, TileState.Healthy));
         gridView.updateGrid();

         const cell = document.querySelector('.cell[data-x="1"][data-y="0"]');

         expect(cell).not.toBeNull();
         expect(cell?.classList.contains('people'));
    });

    it('should adjust the folk spans by removing extras', () => {
        // Update the board with a specific tile
        gameBoard.placeTileAt(0, 0, new Tile(TileType.People, 2, TileState.Healthy));
        gridView.updateGrid();

        // Replace the tile with a non-people tile
        gameBoard.placeTileAt(0, 0, new Tile(TileType.People, 1, TileState.Healthy));
        gridView.updateGrid();

        const cell = document.querySelector('.cell[data-x="0"][data-y="0"]');
        const spans = cell?.querySelectorAll('.cell span');

         expect(spans?.length).toBe(2);
    });
})