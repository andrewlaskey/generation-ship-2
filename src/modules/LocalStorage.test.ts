import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { LocalStorage } from './LocalStorage';

describe('LocalStorage', () => {
  let mockLocalStorage: Storage;
  let storage: LocalStorage;

  beforeEach(() => {
    // Create a mock implementation of localStorage
    mockLocalStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      key: vi.fn(),
      length: 0,
    };

    // Instantiate your LocalStorage class with the mock
    storage = new LocalStorage(mockLocalStorage);
  });

  it('should set a key-value pair', () => {
    const result = storage.set('key', 'value');

    // Assertions
    expect(result).toBe(true);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('key', '"value"');
  });

  it('should get a value by key', () => {
    // Mock the return value of getItem
    (mockLocalStorage.getItem as Mock).mockReturnValue('"value"');

    const value = storage.get('key');

    // Assertions
    expect(value).toBe('value');
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('key');
  });

  it('should serialize an array value', () => {
    const result = storage.set('key', ['foo', 'bar']);

    // Assertions
    expect(result).toBe(true);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('key', '["foo","bar"]');
  });

  it('should return a deserialized array', () => {
    // Mock the return value of getItem
    (mockLocalStorage.getItem as Mock).mockReturnValue('["foo","bar"]');

    const value = storage.get<string[]>('key');

    // Assertions
    expect(value).toStrictEqual(['foo', 'bar']);
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('key');
  });
});
