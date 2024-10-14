// Base interface for all items that can be held in the player's hand
export interface HandItem {
    getName(): string;  // Each item should have a name or identifier
    getRotation(): number;
    rotate(): void;
}

// Example of a special item class
export class SpecialItemExample implements HandItem {
    constructor(private name: string) {}

    getName(): string {
        return this.name;
    }

    getRotation(): number {
        return 0
    }

    rotate(): void {
        // do nothing
    }
}

// PlayerHand class can now hold both TileBlocks and SpecialItems
export class PlayerHand {
    private items: HandItem[];  // Array to store both TileBlocks and special items
    private maxItems: number;   // Maximum number of items allowed in the hand
    private selectedIndex: number;

    constructor(maxItems: number) {
        this.maxItems = maxItems;
        this.items = [];
        this.selectedIndex = 0;
    }

    // Get the current items in the hand
    getItems(): HandItem[] {
        return this.items;
    }

    // Get the maximum number of items allowed in the hand
    getMaxItems(): number {
        return this.maxItems;
    }

    // Set a new maximum number of items allowed in the hand
    setMaxItems(newMax: number): void {
        this.maxItems = newMax;

        // If the current number of items exceeds the new max, remove extras
        if (this.items.length > newMax) {
            this.items = this.items.slice(0, newMax);
        }
    }

    // Add a new item to the hand if space is available
    addItem(item: HandItem): boolean {
        if (this.items.length < this.maxItems) {
            this.items.push(item);
            return true;
        }
        return false;  // Cannot add if hand is full
    }

    // Remove an item from the hand by index
    removeItem(index: number): boolean {
        if (index >= 0 && index < this.items.length) {
            this.items.splice(index, 1);
            return true;
        }
        return false;  // Invalid index
    }

    // Check if the hand is full
    isFull(): boolean {
        return this.items.length >= this.maxItems;
    }

    getSelectedItemIndex(): number {
        return this.selectedIndex
    }

    selectItem(index: number): boolean {
        if (index >= 0 && index < this.items.length) {
            this.selectedIndex = index;
            return true;
        }
        return false; // Invalid index
    }

    rotateSelected(): void {
        this.items[this.selectedIndex].rotate();
    }
}
