import { GameStorage } from '../types/GameStorage';

export class LocalStorage implements GameStorage {
  private localStorage: Storage;

  constructor(localStorage: Storage) {
    this.localStorage = localStorage;
  }

  set<T>(key: string, value: T): boolean {
    try {
      // Serialize the value to a JSON string
      const serializedValue = JSON.stringify(value);
      this.localStorage.setItem(key, serializedValue);
      return true;
    } catch (e) {
      console.error('Failed to save item to localStorage:', e);
      return false;
    }
  }

  get<T>(key: string): T | null {
    try {
      // Retrieve and parse the JSON string
      const serializedValue = this.localStorage.getItem(key);
      if (serializedValue === null) {
        return null; // Key does not exist
      }
      return JSON.parse(serializedValue) as T; // Deserialize the value
    } catch (e) {
      console.error('Failed to retrieve or parse item from localStorage:', e);
      return null;
    }
  }
}
