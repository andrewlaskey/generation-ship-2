import { GameStorage } from '../types/GameStorage';
import { EndGameResult, GameResults } from './AutoPlayer';
import { GameState } from './GameManager';

export type WinLossRecord = {
  wins: number;
  losses: number;
};

export class UserScoreHistory {
  private storage: GameStorage;

  constructor(storage: GameStorage) {
    this.storage = storage;
  }

  getFinalScoreHistory(): number[] {
    return this.storage.get('scores') ?? [];
  }

  getWinLossRecord(): WinLossRecord {
    return this.storage.get('winLossRecord') ?? { wins: 0, losses: 0 };
  }

  saveGameResult(result: GameResults): void {
    this.saveScoreResult(result.score);
    this.updateWinLossRecord(result.result);
  }

  private saveScoreResult(score: number): void {
    const allScores = this.storage.get<number[]>('scores') ?? [];

    allScores?.push(score);

    this.storage.set('scores', allScores);
  }

  private updateWinLossRecord(gameStateFinal: EndGameResult): void {
    const record = this.storage.get<WinLossRecord>('winLossRecord') ?? { wins: 0, losses: 0 };

    if (gameStateFinal == GameState.Complete) {
      record.wins++;
    } else {
      record.losses++;
    }

    this.storage.set('winLossRecord', record);
  }
}
