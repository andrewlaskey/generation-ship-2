import { GameStorage } from '../types/GameStorage';
import { EndGameResult, GameResults } from './AutoPlayer';
import { GameState } from './GameManager';

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

  getFinalScoreHistory(): number[] {
    return this.storage.get(this.storageKey('scores')) ?? [];
  }

  getWinLossRecord(): WinLossRecord {
    return this.storage.get(this.storageKey('winLossRecord')) ?? { wins: 0, losses: 0 };
  }

  saveGameResult(result: GameResults): void {
    this.saveScoreResult(result.score);
    this.updateWinLossRecord(result.result);
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
