import { describe, it, expect, beforeEach } from 'vitest';
import { Deck } from './Deck';
import { TileBlock } from './TileBlock';
import { Tile, TileType, TileState } from './Tile';

describe('Deck', () => {
    let deck: Deck;
    
    beforeEach(() => {
        // Reinitialize the deck before each test
        deck = new Deck(null, false);  // Finite deck without seed
    });

    it('should initialize with an empty deck', () => {
        expect(deck.getItemCount()).toBe(0);
    });

    it('should fill the deck with the specified number of items', () => {
        deck.fillInitialDeck(5);
        expect(deck.getItemCount()).toBe(5);
    });

    it('should add a new item to the deck', () => {
        const tileBlock = new TileBlock([new Tile(TileType.Tree, 1, TileState.Neutral), null]);
        deck.addItem(tileBlock);
        expect(deck.getItemCount()).toBe(1);
    });

    it('should draw an item from the deck', () => {
        const tileBlock = new TileBlock([new Tile(TileType.Tree, 1, TileState.Neutral), null]);
        deck.addItem(tileBlock);
        const drawnItem = deck.drawItem();
        expect(drawnItem).toBe(tileBlock);
        expect(deck.getItemCount()).toBe(0);  // After drawing, the deck should be empty
    });

    it('should return null when drawing from an empty finite deck', () => {
        const drawnItem = deck.drawItem();
        expect(drawnItem).toBeNull();
    });

    it('should generate a new item when drawing from an infinite deck', () => {
        const infiniteDeck = new Deck(null, true);  // Infinite deck
        const drawnItem = infiniteDeck.drawItem();
        expect(drawnItem).not.toBeNull();  // Should generate a new item
        expect(infiniteDeck.getItemCount()).toBe(0);  // Deck should stay empty in infinite mode
    });

    it('should shuffle the deck', () => {
        const tileBlock1 = new TileBlock([new Tile(TileType.Tree, 1, TileState.Neutral), null]);
        const tileBlock2 = new TileBlock([new Tile(TileType.People, 1, TileState.Neutral), null]);
        const tileBlock3 = new TileBlock([new Tile(TileType.Farm, 1, TileState.Neutral), null]);
        
        deck.addItem(tileBlock1);
        deck.addItem(tileBlock2);
        deck.addItem(tileBlock3);

        const originalOrder = [...deck.getItems()];  // Copy original order of items

        deck.shuffle();  // Shuffle the deck

        expect(deck.getItems()).not.toEqual(originalOrder);  // Items should be in a different order
    });

    it('should shuffle using a seed and maintain reproducibility', () => {
        const seedDeck1 = new Deck('test-seed', false);  // Seeded deck
        const seedDeck2 = new Deck('test-seed', false);  // Another deck with the same seed

        const tileBlock1 = new TileBlock([new Tile(TileType.Tree, 1, TileState.Neutral), null]);
        const tileBlock2 = new TileBlock([new Tile(TileType.People, 1, TileState.Neutral), null]);
        
        seedDeck1.addItem(tileBlock1);
        seedDeck1.addItem(tileBlock2);
        seedDeck1.shuffle();

        seedDeck2.addItem(tileBlock1);
        seedDeck2.addItem(tileBlock2);
        seedDeck2.shuffle();

        expect(seedDeck1.getItems()).toEqual(seedDeck2.getItems());  // Both decks should have the same order
    });

    it('should generate random TileBlocks in fillInitialDeck()', () => {
        deck.fillInitialDeck(3);
        const items = deck.getItems();

        expect(items.length).toBe(3);
        items.forEach(item => {
            expect(item).toBeInstanceOf(TileBlock);
        });
    });

    it('should generate random TileBlocks when drawing from an infinite deck', () => {
        const infiniteDeck = new Deck(null, true);  // Infinite deck
        const generatedItem = infiniteDeck.drawItem();
        expect(generatedItem).toBeInstanceOf(TileBlock);  // Should generate a TileBlock
    });

    it('should generate TileBlocks with level 1 and neutral state', () => {
        const tile1 = new Tile(TileType.Tree, 1, TileState.Neutral);
        const tile2 = new Tile(TileType.Farm, 1, TileState.Neutral);
        const tileBlock = new TileBlock([tile1, tile2]);
    
        deck.setItems([tileBlock]);  // Manually set the deck items
    
        const drawnTileBlock = deck.drawItem() as TileBlock;
        const layout = drawnTileBlock.getLayout();
    
        layout.forEach(row => {
            row.forEach(tile => {
                if (tile !== null) {
                    expect(tile.level).toBe(1);
                    expect(tile.state).toBe(TileState.Neutral);
                }
            });
        });
    });
    
});
