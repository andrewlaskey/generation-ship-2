import { beforeEach, describe, vi, it, Mock, expect } from 'vitest';
import { GameStorage } from '../types/GameStorage';
import { UserScoreHistory } from './UserScoreHistory';
import { GameResults } from './AutoPlayer';
import { GameState } from './GameManager';

describe('UserScoreHistory', () => {
  let mockStorage: GameStorage;
  let userHistory: UserScoreHistory;

  beforeEach(() => {
    mockStorage = {
      get: vi.fn(),
      set: vi.fn(),
    };

    userHistory = new UserScoreHistory(mockStorage);
  });

  it("should save the user's results to storage", () => {
    (mockStorage.get as Mock)
      .mockReturnValueOnce([20, 30])
      .mockReturnValueOnce({ wins: 3, losses: 5 });

    const result: GameResults = {
      result: GameState.Complete,
      score: 10,
    };

    userHistory.saveGameResult(result);

    expect(mockStorage.get).toHaveBeenNthCalledWith(1, 'scores');
    expect(mockStorage.set).toHaveBeenNthCalledWith(1, 'scores', [20, 30, 10]);

    expect(mockStorage.get).toHaveBeenNthCalledWith(2, 'winLossRecord');
    expect(mockStorage.set).toHaveBeenNthCalledWith(2, 'winLossRecord', { wins: 4, losses: 5 });
  });

  it('should return the final score history', () => {
    (mockStorage.get as Mock).mockReturnValueOnce([20, 30]);

    const test = userHistory.getFinalScoreHistory();

    expect(test).toStrictEqual([20, 30]);
  });

  it('should return the win/loss record', () => {
    (mockStorage.get as Mock).mockReturnValueOnce({ wins: 4, losses: 5 });

    const test = userHistory.getWinLossRecord();

    expect(test).toStrictEqual({ wins: 4, losses: 5 });
  });
});
