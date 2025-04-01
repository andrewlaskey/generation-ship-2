import { describe, it, expect } from 'vitest';
import { AutoPlayer } from './AutoPlayer';
import { GameManager, GameState } from './GameManager';

describe('AutoPlayer', () => {
  it('should start the game', () => {
    const gameManager = new GameManager();
    const autoPlayer = new AutoPlayer(gameManager);

    autoPlayer.startNewGame();

    expect(autoPlayer.gameManager.state).toBe(GameState.Playing);
  });

  it('should make a player move', () => {
    const gameManager = new GameManager();
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
    });
    const autoPlayer = new AutoPlayer(gameManager);

    const results = autoPlayer.repeat(5);

    expect(results.length).toBe(5);
  });
});
