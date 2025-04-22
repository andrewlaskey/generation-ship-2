// gameboard.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameBoard, GameBoardRenderFn } from './GameBoard';
import { Tile, TileState, TileType } from './Tile';
import { BoardSpace } from './BoardSpace';
import { TileRuleConfig } from './TileRules';

describe('GameBoard', () => {
  let board: GameBoard;
  let tile1: Tile;
  let tile2: Tile;

  beforeEach(() => {
    board = new GameBoard(5); // Initialize a 5x5 board
    tile1 = new Tile('power', 1, 'neutral');
    tile2 = new Tile('farm', 2, 'healthy');
  });

  it('should create a game board of the correct size', () => {
    expect(board.getSpace(0, 0)).toBeInstanceOf(BoardSpace);
    expect(board.getSpace(4, 4)).toBeInstanceOf(BoardSpace);
    expect(board.getSpace(5, 5)).toBeNull(); // Out of bounds
  });

  it('should place a tile on the board at valid coordinates', () => {
    const result = board.placeTileAt(2, 2, tile1);
    expect(result).toBe(true); // Tile should be placed successfully
    const space = board.getSpace(2, 2);
    expect(space?.tile).toBe(tile1); // BoardSpace should hold the tile
  });

  it('should be able to place a tile on an occupied space', () => {
    board.placeTileAt(2, 2, tile1);
    const result = board.placeTileAt(2, 2, tile2);
    expect(result).toBe(true); // Second tile placement should fail
  });

  it('should return null for invalid coordinates', () => {
    expect(board.getSpace(-1, -1)).toBeNull(); // Invalid negative coordinates
    expect(board.getSpace(10, 10)).toBeNull(); // Out of bounds coordinates
  });

  it('should remove a tile from the board at valid coordinates', () => {
    board.placeTileAt(2, 2, tile1);
    const removeResult = board.removeTileAt(2, 2);
    expect(removeResult).toBe(true); // Tile should be removed
    const space = board.getSpace(2, 2);
    expect(space?.tile).toBeNull(); // BoardSpace should be empty
  });

  it('should not remove a tile from an empty space', () => {
    const result = board.removeTileAt(2, 2);
    expect(result).toBe(false); // No tile to remove
  });

  it('should return correct occupied state for a space', () => {
    const space = board.getSpace(3, 3);
    expect(space?.isOccupied()).toBe(false); // Initially empty
    board.placeTileAt(3, 3, tile1);
    expect(space?.isOccupied()).toBe(true); // Now occupied
  });

  it('should highlight board space at coordinates', () => {
    board.toggleSpaceHighlight(2, 2);
    const space = board.getSpace(2, 2);
    expect(space?.isHighlighted).toBe(true);
  });

  it('should clear all highlights', () => {
    // Arrange
    board.toggleSpaceHighlight(1, 1);

    // Act
    board.clearHighlights();

    // Assert
    const space = board.getSpace(1, 1);
    expect(space?.isHighlighted).toBe(false);
  });

  it('should remove highlight if board space already highlighted', () => {
    // toggle once
    board.toggleSpaceHighlight(2, 2);

    // toggle again
    board.toggleSpaceHighlight(2, 2);

    const space = board.getSpace(2, 2);
    expect(space?.isHighlighted).toBe(false);
  });

  it('should set the board space to correct value', () => {
    const space = board.getSpace(2, 2);

    // set true
    board.toggleSpaceHighlight(2, 2, true);
    expect(space?.isHighlighted).toBe(true);

    // manual set true
    board.toggleSpaceHighlight(2, 2, true);
    expect(space?.isHighlighted).toBe(true);

    // and set false
    board.toggleSpaceHighlight(2, 2, false);
    expect(space?.isHighlighted).toBe(false);
  });

  it('should return a count of the tile types', () => {
    board.placeTileAt(2, 2, tile1);
    board.placeTileAt(1, 1, tile2);
    expect(board.countTileTypes()).toStrictEqual({
      farm: 1,
      power: 1,
    });
  });

  it('should return an adjusted count of tile types', () => {
    const highLevelTile = new Tile(TileType.Tree, 3, TileState.Neutral);
    board.placeTileAt(1, 1, highLevelTile);
    expect(board.countTileTypes(true)).toStrictEqual({
      tree: 3,
    });
  });

  it('should set the default starting condition', () => {
    board.setStartingCondition();

    const treeSpace = board.getSpace(2, 2);
    expect(treeSpace?.tile?.type).toBe('tree');

    const farmSpace = board.getSpace(2, 1);
    expect(farmSpace?.tile?.type).toBe('farm');

    const peopleSpace = board.getSpace(1, 2);
    expect(peopleSpace?.tile?.type).toBe('people');
  });

  it('should clear the board', () => {
    board.placeTileAt(2, 2, tile1);
    board.placeTileAt(1, 1, tile2);

    board.clearBoard();

    const powerSpace = board.getSpace(2, 2);
    expect(powerSpace?.isOccupied()).toBe(false); // should be empty

    const farmSpace = board.getSpace(1, 1);
    expect(farmSpace?.isOccupied()).toBe(false); // should be empty

    expect(board.countTileTypes()).toStrictEqual({});
  });

  describe('getGrid', () => {
    it('should return the grid as determined by the renderFn', () => {
      board = new GameBoard(2);
      board.placeTileAt(1, 1, tile1);
      board.placeTileAt(0, 0, tile2);

      const renderFn: GameBoardRenderFn<string> = (space: BoardSpace): string => {
        return `${space.x}x${space.y} - ${space.isOccupied() ? 'X' : 'O'}`;
      };

      const result = board.getGrid(renderFn);

      expect(result).toStrictEqual(['0x0 - X', '0x1 - O', '1x0 - O', '1x1 - X']);
    });
  });

  describe('getSpaceAction', () => {
    it('should get the correct space by x y', () => {
      // Arrange
      board = new GameBoard(2);
      board.placeTileAt(1, 1, new Tile(TileType.Tree, 2, TileState.Neutral));
      const configMap = new Map();
      const spy = vi.spyOn(board, 'getSpace');

      // Act
      board.getSpaceAction(1, 1, configMap);

      // Assert
      expect(spy).toHaveBeenCalledWith(1, 1);
    });

    it('should return the correct action', () => {
      // Arrange
      board = new GameBoard(2);
      board.placeTileAt(1, 1, new Tile(TileType.Tree, 1, TileState.Neutral));
      board.placeTileAt(0, 0, new Tile(TileType.People, 1, TileState.Neutral));
      const mockTreeConfig: TileRuleConfig = {
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

      // Act
      const result = board.getSpaceAction(1, 1, configMap);

      // Assert
      expect(result).toStrictEqual({
        x: 1,
        y: 1,
        action: 'thriving',
        config: mockTreeConfig,
      });
    });

    it('should use the empty config, if available, if space is empty', () => {
      // Arrange
      board = new GameBoard(2);
      board.placeTileAt(1, 1, new Tile(TileType.Tree, 2, TileState.Neutral));
      const mockEmptyConfig: TileRuleConfig = {
        type: 'empty',
        rules: [
          {
            result: 'spawn tree',
            combineConditions: 'AND',
            priority: 1,
            conditions: [
              {
                kind: 'single',
                type: TileType.Tree,
                count: 1,
                evaluation: 'eq',
              },
            ],
          },
          {
            result: 'spawn people',
            combineConditions: 'AND',
            priority: 1,
            conditions: [
              {
                kind: 'single',
                type: TileType.Farm,
                count: 1,
                evaluation: 'eq',
              },
            ],
          },
        ],
        results: [
          {
            name: 'spawn tree',
            spawnTile: {
              type: TileType.Tree,
              level: 1,
              state: TileState.Neutral,
            },
          },
          {
            name: 'spawn people',
            spawnTile: {
              type: TileType.People,
              level: 1,
              state: TileState.Neutral,
            },
          },
        ],
      };
      const configMap = new Map();
      configMap.set('empty', mockEmptyConfig);

      // Act
      const result = board.getSpaceAction(0, 0, configMap);

      // Assert
      expect(result).toStrictEqual({
        x: 0,
        y: 0,
        action: 'spawn tree',
        config: mockEmptyConfig,
      });
    });

    it('should return null', () => {
      // Arrange
      board = new GameBoard(2);
      board.placeTileAt(1, 1, new Tile(TileType.Tree, 1, TileState.Neutral));
      board.placeTileAt(0, 0, new Tile(TileType.Farm, 1, TileState.Neutral));
      const mockTreeConfig: TileRuleConfig = {
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

      // Act
      const result = board.getSpaceAction(0, 0, configMap);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('getNeighborCounts', () => {
    it('should correctly count neighbors', () => {
      // Arrange
      board = new GameBoard(3);
      board.placeTileAt(0, 0, new Tile(TileType.Tree, 2, TileState.Neutral));
      board.placeTileAt(0, 1, new Tile(TileType.Tree, 2, TileState.Neutral));
      board.placeTileAt(0, 2, new Tile(TileType.Tree, 2, TileState.Neutral));

      board.placeTileAt(1, 0, new Tile(TileType.Power, 2, TileState.Neutral));
      board.placeTileAt(1, 2, new Tile(TileType.People, 2, TileState.Neutral));

      board.placeTileAt(2, 0, new Tile(TileType.Waste, 2, TileState.Neutral));
      board.placeTileAt(2, 1, new Tile(TileType.Waste, 1, TileState.Neutral));
      board.placeTileAt(2, 2, new Tile(TileType.Farm, 3, TileState.Neutral));

      // Act
      const neighborCount = board.getNeighborCounts(1, 1);

      // Assert
      expect(neighborCount).toStrictEqual({
        tree: { raw: 3, calculated: 6 },
        power: { raw: 1, calculated: 2 },
        people: { raw: 1, calculated: 2 },
        waste: { raw: 2, calculated: 3 },
        farm: { raw: 1, calculated: 3 },
      });
    });
  });

  describe('getNeighborsWithCoords', () => {
    it('should return neighbor tiles with coordinates', () => {
      // Arrange
      board = new GameBoard(3);
      const treeTile = new Tile(TileType.Tree, 2, TileState.Neutral);
      const farmTile = new Tile(TileType.Farm, 2, TileState.Neutral);
      board.placeTileAt(0, 0, treeTile);
      board.placeTileAt(0, 1, farmTile);

      // Act
      const neighbors = board.getNeighborsWithCoords(1, 1);

      expect(neighbors).toStrictEqual([
        { x: 0, y: 1, tile: farmTile },
        { x: 0, y: 0, tile: treeTile },
      ]);
    });
  });

  describe('updateBoard', () => {
    it('should update the board', () => {
      // Arrange
      board = new GameBoard(3);
      board.placeTileAt(0, 0, new Tile(TileType.Tree, 1, TileState.Neutral));
      board.placeTileAt(0, 1, new Tile(TileType.People, 2, TileState.Neutral));
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

      // Act
      board.updateBoard(configMap);

      // Assert
      const space = board.getSpace(0, 0);

      expect(space?.tile).toBeDefined();
      expect(space?.tile?.state).toBe(TileState.Healthy);
    });

    it('should age each tile on the board', () => {
      // Arrange
      board = new GameBoard(3);
      board.placeTileAt(0, 0, new Tile(TileType.Tree, 1, TileState.Neutral));
      board.placeTileAt(0, 1, new Tile(TileType.People, 2, TileState.Neutral));
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

      // Act
      board.updateBoard(configMap);

      // Assert
      const space1 = board.getSpace(0, 0);
      const space2 = board.getSpace(0, 1);

      expect(space1?.tile).toBeDefined();
      expect(space1?.tile?.age).toBe(1);

      expect(space2?.tile).toBeDefined();
      expect(space2?.tile?.age).toBe(1);
    });
  });

  describe('getHabitatAges', () => {
    it('should return the ages of habitats', () => {
      // Arrange
      const habitat1 = new Tile(TileType.People, 1, TileState.Neutral);
      const habitat2 = new Tile(TileType.People, 1, TileState.Neutral);
      const tree = new Tile(TileType.Tree, 1, TileState.Neutral);
      habitat1.age = 3;
      habitat2.age = 2;
      board = new GameBoard(2);
      board.placeTileAt(0, 0, habitat1);
      board.placeTileAt(0, 1, habitat2);
      board.placeTileAt(1, 1, tree);

      // Act
      const ages = board.getHabitatAges();

      expect(ages).toStrictEqual([3, 2]);
    });
  });
});
