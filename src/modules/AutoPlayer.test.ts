import { describe, it, expect } from 'vitest';
import { AutoPlayer } from './AutoPlayer';
import { GameManager, GameState } from './GameManager';
import { TileType, TileState } from './Tile';

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

describe('AutoPlayer', () => {
  it('should start the game', () => {
    const gameManager = new GameManager({ ruleConfigs: configMap });
    const autoPlayer = new AutoPlayer(gameManager);

    autoPlayer.startNewGame();

    expect(autoPlayer.gameManager.state).toBe(GameState.Playing);
  });

  it('should make a player move', () => {
    const gameManager = new GameManager({ ruleConfigs: configMap });
    const autoPlayer = new AutoPlayer(gameManager);

    autoPlayer.startNewGame();

    const cardsRemainingInDeck = autoPlayer.gameManager.deck.getItemCount();

    autoPlayer.nextMove();

    const deckTest = autoPlayer.gameManager.deck.getItemCount();

    expect(deckTest).toBeLessThan(cardsRemainingInDeck);
  });

  it('should play game until game over or complete', () => {
    const gameManager = new GameManager({
      size: 6,
      initialDeckSize: 4,
      maxHandSize: 1,
      seed: 'test-1',
      ruleConfigs: configMap,
    });
    const autoPlayer = new AutoPlayer(gameManager);
    const results = [];

    for (let i = 0; i < 10000; i++) {
      autoPlayer.startNewGame();
      const gameResult = autoPlayer.auto();
      results.push(gameResult);
    }

    const endStates = results.map(result => result.result);

    expect(endStates).toContain(GameState.Complete);
    expect(endStates).toContain(GameState.GameOver);
  });

  it('should play multiple games', () => {
    const gameManager = new GameManager({
      size: 6,
      initialDeckSize: 4,
      maxHandSize: 1,
      seed: 'test-1',
      ruleConfigs: configMap,
    });
    const autoPlayer = new AutoPlayer(gameManager);

    const results = autoPlayer.repeat(5);

    expect(results.length).toBe(5);
  });
});
