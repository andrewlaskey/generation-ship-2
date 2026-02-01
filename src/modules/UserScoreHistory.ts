import { GameStorage } from '../types/GameStorage';
import { EndGameResult, GameResults } from './AutoPlayer';
import { GameState } from './GameManager';
import { differenceInCalendarDays } from 'date-fns';

export type WinLossRecord = {
  wins: number;
  losses: number;
};

export class UserScoreHistory {
  private storage: GameStorage;
  private gameTypeKey?: string;

  constructor(storage: GameStorage, gameTypeKey?: string) {
    this.storage = storage;
    this.gameTypeKey = gameTypeKey;
  }

  storageKey(key: string): string {
    if (this.gameTypeKey) {
      return `${key}_${this.gameTypeKey}`;
    }
    return key;
  }

  getStreak(): number {
    return this.storage.get<number>(this.storageKey('streak')) ?? 0;
  }

  getLastPlayedDate(): string | null {
    return this.storage.get(this.storageKey('lastPlayedDate')) ?? null;
  }

  calculateNewStreak(): number {
    const lastPlayedDateStr = this.getLastPlayedDate();
    const todayStr = new Date().toISOString().split('T')[0];

    if (!lastPlayedDateStr) {
      return 1; // First time playing
    }

    const daysSinceLastPlayed = differenceInCalendarDays(todayStr, lastPlayedDateStr);

    if (daysSinceLastPlayed > 1) {
      return 1; // Streak broken
    } else if (daysSinceLastPlayed === 1) {
      return this.getStreak() + 1; // Continue streak
    }

    return this.getStreak(); // Same day, streak unchanged
  }

  getFinalScoreHistory(): number[] {
    return this.storage.get(this.storageKey('scores')) ?? [];
  }

  getWinLossRecord(): WinLossRecord {
    return this.storage.get(this.storageKey('winLossRecord')) ?? { wins: 0, losses: 0 };
  }

  saveGameResult(result: GameResults): void {
    this.saveScoreResult(result.score);
    this.updateWinLossRecord(result.result);

    const todayStr = new Date().toISOString().split('T')[0];
    const lastPlayedDateStr = this.getLastPlayedDate();

    // Don't update streak if already played today
    if (lastPlayedDateStr === todayStr) {
      return;
    }

    const newStreak = this.calculateNewStreak();
    this.storage.set(this.storageKey('lastPlayedDate'), todayStr);
    this.storage.set(this.storageKey('streak'), newStreak);
  }

  private saveScoreResult(score: number): void {
    const allScores = this.storage.get<number[]>(this.storageKey('scores')) ?? [];

    allScores?.push(score);

    this.storage.set(this.storageKey('scores'), allScores);
  }

  private updateWinLossRecord(gameStateFinal: EndGameResult): void {
    const record = this.storage.get<WinLossRecord>(this.storageKey('winLossRecord')) ?? {
      wins: 0,
      losses: 0,
    };

    if (gameStateFinal == GameState.Complete) {
      record.wins++;
    } else {
      record.losses++;
    }

    this.storage.set(this.storageKey('winLossRecord'), record);
  }
}
