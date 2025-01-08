import { describe, it, expect, beforeEach } from 'vitest';
import { Deck, TileProbability } from './Deck';
import { TileBlock } from './TileBlock';
import { Tile, TileType, TileState } from './Tile';

function getActualTileCounts(deck: Deck): { [key in keyof TileProbability]: number } {
    // Counters for each tile type
    const counts = {
        tree: 0,
        farm: 0,
        people: 0,
        power: 0,
        waste: 0,
        null: 0
    };

    const tileBlocks = deck.getItems() as TileBlock[];

    for (const tileBlock of tileBlocks) {
        const tiles = tileBlock.getTiles();
        
        tiles.forEach(tile => {
            if (tile === null) {
                counts.null++;
            } else {
                counts[tile.type]++;
            }
        });
    }

    return counts;
}

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
        const tiles = drawnTileBlock.getTiles();
        
        tiles.forEach(tile => {
            expect(tile).not.toBeNull();
            expect(tile?.level).toBe(1);
            expect(tile?.state).toBe(TileState.Neutral);
        });
    });

    it('should generate tiles at the correct default probabilities', () => {
        // Define custom probabilities for testing
        const testProbabilities: TileProbability = {
            tree: 0.3,
            farm: 0.2,
            people: 0.2,
            power: 0.2,
            null: 0.1 // Default probability for null (empty space)
        };
    
        // Pass the custom probabilities to the Deck
        const deck = new Deck(null, false);
    
        // Number of samples to generate for testing
        const sampleSize = 100000;
        const tolerance = 0.02; // Tolerance for the test, allowing a 2% deviation
    
        // Fill the deck with TileBlocks
        deck.fillInitialDeck(sampleSize);
    
        // Get actual tile counts from the generated TileBlocks
        const counts = getActualTileCounts(deck);
    
        // Calculate the observed probabilities
        const totalTiles = sampleSize * 2; // Each TileBlock contains 2 positions
        const observedProbabilities: TileProbability = {
            tree: counts.tree / totalTiles,
            farm: counts.farm / totalTiles,
            people: counts.people / totalTiles,
            power: counts.power / totalTiles,
            null: counts.null / totalTiles
        };
    
        // Assert that each observed probability is within the specified tolerance of the expected probability
        for (const key in testProbabilities) {
            const expected = testProbabilities[key as keyof TileProbability];
            const observed = observedProbabilities[key as keyof TileProbability];
            expect(observed, `Probability for ${key}`).toBeGreaterThanOrEqual(expected - tolerance);
            expect(observed, `Probability for ${key}`).toBeLessThanOrEqual(expected + tolerance);
        }
    });
    
    it('should generate tiles at the correct probabilities', () => {
        // Define custom probabilities for testing
        const testProbabilities: TileProbability = {
            tree: 0.4,
            farm: 0.3,
            people: 0.2,
            power: 0.05,
            null: 0.05
        };
    
        // Pass the custom probabilities to the Deck
        const deck = new Deck(null, false, testProbabilities);
    
        // Number of samples to generate for testing
        const sampleSize = 100000;
        const tolerance = 0.02; // Tolerance for the test, allowing a 2% deviation
    
        // Fill the deck with TileBlocks
        deck.fillInitialDeck(sampleSize);
    
        // Get actual tile counts from the generated TileBlocks
        const counts = getActualTileCounts(deck);
    
        // Calculate the observed probabilities
        const totalTiles = sampleSize * 2; // Each TileBlock contains 2 positions
        const observedProbabilities: TileProbability = {
            tree: counts.tree / totalTiles,
            farm: counts.farm / totalTiles,
            people: counts.people / totalTiles,
            power: counts.power / totalTiles,
            null: counts.null / totalTiles
        };
    
        // Assert that each observed probability is within the specified tolerance of the expected probability
        for (const key in testProbabilities) {
            const expected = testProbabilities[key as keyof TileProbability];
            const observed = observedProbabilities[key as keyof TileProbability];
            expect(observed, `Probability for ${key}`).toBeGreaterThanOrEqual(expected - tolerance);
            expect(observed, `Probability for ${key}`).toBeLessThanOrEqual(expected + tolerance);
        }
    });
    
    
});
