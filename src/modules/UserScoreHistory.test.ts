import { beforeEach, describe, vi, it, Mock, expect, afterEach } from 'vitest';
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
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-15'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should save the user's results to storage", () => {
    (mockStorage.get as Mock)
      .mockReturnValueOnce([20, 30]) // scores
      .mockReturnValueOnce({ wins: 3, losses: 5 }) // winLossRecord
      .mockReturnValueOnce(null) // lastPlayedDate (for same-day check)
      .mockReturnValueOnce(null); // lastPlayedDate (for calculateNewStreak)

    const result: GameResults = {
      result: GameState.Complete,
      score: 10,
    };

    userHistory.saveGameResult(result);

    expect(mockStorage.get).toHaveBeenNthCalledWith(1, 'scores');
    expect(mockStorage.set).toHaveBeenNthCalledWith(1, 'scores', [20, 30, 10]);

    expect(mockStorage.get).toHaveBeenNthCalledWith(2, 'winLossRecord');
    expect(mockStorage.set).toHaveBeenNthCalledWith(2, 'winLossRecord', { wins: 4, losses: 5 });

    // First time playing - streak set to 1
    expect(mockStorage.get).toHaveBeenNthCalledWith(3, 'lastPlayedDate');
    expect(mockStorage.get).toHaveBeenNthCalledWith(4, 'lastPlayedDate'); // calculateNewStreak
    expect(mockStorage.set).toHaveBeenNthCalledWith(3, 'lastPlayedDate', '2025-01-15');
    expect(mockStorage.set).toHaveBeenNthCalledWith(4, 'streak', 1);
  });

  it('should continue streak when played yesterday', () => {
    (mockStorage.get as Mock)
      .mockReturnValueOnce([20, 30]) // scores
      .mockReturnValueOnce({ wins: 3, losses: 5 }) // winLossRecord
      .mockReturnValueOnce('2025-01-14') // lastPlayedDate (for same-day check)
      .mockReturnValueOnce('2025-01-14') // lastPlayedDate (for calculateNewStreak)
      .mockReturnValueOnce(5); // current streak

    const result: GameResults = {
      result: GameState.Complete,
      score: 10,
    };

    userHistory.saveGameResult(result);

    expect(mockStorage.set).toHaveBeenNthCalledWith(3, 'lastPlayedDate', '2025-01-15');
    expect(mockStorage.set).toHaveBeenNthCalledWith(4, 'streak', 6);
  });

  it('should reset streak to 1 when more than one day since last played', () => {
    (mockStorage.get as Mock)
      .mockReturnValueOnce([20, 30]) // scores
      .mockReturnValueOnce({ wins: 3, losses: 5 }) // winLossRecord
      .mockReturnValueOnce('2025-01-10') // lastPlayedDate (for same-day check)
      .mockReturnValueOnce('2025-01-10'); // lastPlayedDate (for calculateNewStreak)

    const result: GameResults = {
      result: GameState.Complete,
      score: 10,
    };

    userHistory.saveGameResult(result);

    expect(mockStorage.set).toHaveBeenNthCalledWith(3, 'lastPlayedDate', '2025-01-15');
    expect(mockStorage.set).toHaveBeenNthCalledWith(4, 'streak', 1);
  });

  it('should not update streak when playing same day', () => {
    (mockStorage.get as Mock)
      .mockReturnValueOnce([20, 30]) // scores
      .mockReturnValueOnce({ wins: 3, losses: 5 }) // winLossRecord
      .mockReturnValueOnce('2025-01-15'); // lastPlayedDate (today)

    const result: GameResults = {
      result: GameState.Complete,
      score: 10,
    };

    userHistory.saveGameResult(result);

    // Only 2 set calls for scores and winLossRecord, no streak/lastPlayedDate updates
    expect(mockStorage.set).toHaveBeenCalledTimes(2);
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

  it('should use game type key for storage keys when provided', () => {
    const gameTypeKey = 'mini';
    userHistory = new UserScoreHistory(mockStorage, gameTypeKey);
    (mockStorage.get as Mock)
      .mockReturnValueOnce([15, 25]) // scores
      .mockReturnValueOnce({ wins: 2, losses: 3 }) // winLossRecord
      .mockReturnValueOnce('2025-01-14') // lastPlayedDate (for same-day check)
      .mockReturnValueOnce('2025-01-14') // lastPlayedDate (for calculateNewStreak)
      .mockReturnValueOnce(5); // current streak

    const result: GameResults = {
      result: GameState.GameOver,
      score: 5,
    };

    userHistory.saveGameResult(result);

    expect(mockStorage.get).toHaveBeenNthCalledWith(1, 'scores_mini');
    expect(mockStorage.set).toHaveBeenNthCalledWith(1, 'scores_mini', [15, 25, 5]);

    expect(mockStorage.get).toHaveBeenNthCalledWith(2, 'winLossRecord_mini');
    expect(mockStorage.set).toHaveBeenNthCalledWith(2, 'winLossRecord_mini', {
      wins: 2,
      losses: 4,
    });

    expect(mockStorage.get).toHaveBeenNthCalledWith(3, 'lastPlayedDate_mini');
    expect(mockStorage.get).toHaveBeenNthCalledWith(4, 'lastPlayedDate_mini'); // calculateNewStreak
    expect(mockStorage.get).toHaveBeenNthCalledWith(5, 'streak_mini');
    expect(mockStorage.set).toHaveBeenNthCalledWith(3, 'lastPlayedDate_mini', '2025-01-15');
    expect(mockStorage.set).toHaveBeenNthCalledWith(4, 'streak_mini', 6);
  });

  it('should return the streak', () => {
    (mockStorage.get as Mock).mockReturnValueOnce(7);

    const streak = userHistory.getStreak();

    expect(mockStorage.get).toHaveBeenCalledWith('streak');
    expect(streak).toBe(7);
  });

  it('should return 0 when streak is not set', () => {
    (mockStorage.get as Mock).mockReturnValueOnce(undefined);

    const streak = userHistory.getStreak();

    expect(streak).toBe(0);
  });

  it('should return the last played date', () => {
    (mockStorage.get as Mock).mockReturnValueOnce('2025-01-10');

    const lastPlayedDate = userHistory.getLastPlayedDate();

    expect(mockStorage.get).toHaveBeenCalledWith('lastPlayedDate');
    expect(lastPlayedDate).toBe('2025-01-10');
  });

  it('should return null when last played date is not set', () => {
    (mockStorage.get as Mock).mockReturnValueOnce(undefined);

    const lastPlayedDate = userHistory.getLastPlayedDate();

    expect(lastPlayedDate).toBeNull();
  });

  describe('calculateNewStreak', () => {
    it('should return 1 for first time playing', () => {
      (mockStorage.get as Mock).mockReturnValueOnce(null); // lastPlayedDate

      const newStreak = userHistory.calculateNewStreak();

      expect(newStreak).toBe(1);
    });

    it('should return current streak + 1 when played yesterday', () => {
      (mockStorage.get as Mock)
        .mockReturnValueOnce('2025-01-14') // lastPlayedDate (yesterday)
        .mockReturnValueOnce(5); // current streak

      const newStreak = userHistory.calculateNewStreak();

      expect(newStreak).toBe(6);
    });

    it('should return 1 when more than 1 day gap', () => {
      (mockStorage.get as Mock).mockReturnValueOnce('2025-01-10'); // lastPlayedDate (5 days ago)

      const newStreak = userHistory.calculateNewStreak();

      expect(newStreak).toBe(1);
    });

    it('should return current streak when same day', () => {
      (mockStorage.get as Mock)
        .mockReturnValueOnce('2025-01-15') // lastPlayedDate (today)
        .mockReturnValueOnce(3); // current streak

      const newStreak = userHistory.calculateNewStreak();

      expect(newStreak).toBe(3);
    });
  });
});
