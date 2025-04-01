export interface GameStorage {
  set<T>(key: string, value: T): boolean;
  get<T>(key: string): T | null;
}
