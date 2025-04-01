import { describe, it, expect, beforeEach } from 'vitest';
import { PlayerHand, SpecialItemExample as SpecialItem } from './PlayerHand';
import { TileBlock } from './TileBlock';
import { Tile, TileType, TileState } from './Tile';

describe('PlayerHand', () => {
  let playerHand: PlayerHand;
  let tileBlock: TileBlock;
  let specialItem: SpecialItem;

  beforeEach(() => {
    playerHand = new PlayerHand(3); // Initialize with a max of 3 items
    tileBlock = new TileBlock([new Tile(TileType.Tree, 1, TileState.Neutral), null]); // Create a TileBlock
    specialItem = new SpecialItem('Power Boost'); // Create a SpecialItem
  });

  it('should add a TileBlock to the hand', () => {
    const added = playerHand.addItem(tileBlock);
    expect(added).toBe(true); // Should successfully add the TileBlock
    expect(playerHand.getItems()).toContain(tileBlock); // Hand should contain the TileBlock
  });

  it('should add a SpecialItem to the hand', () => {
    const added = playerHand.addItem(specialItem);
    expect(added).toBe(true); // Should successfully add the SpecialItem
    expect(playerHand.getItems()).toContain(specialItem); // Hand should contain the SpecialItem
  });

  it('should not add more items than the maximum allowed', () => {
    playerHand.addItem(tileBlock);
    playerHand.addItem(new TileBlock([new Tile(TileType.Farm, 1, TileState.Healthy), null]));
    playerHand.addItem(specialItem);
    const extraItem = new SpecialItem('Extra Item');
    const added = playerHand.addItem(extraItem);

    expect(added).toBe(false); // Should fail to add the extra item
    expect(playerHand.getItems().length).toBe(3); // Hand should still only have 3 items
    expect(playerHand.getItems()).not.toContain(extraItem); // Extra item should not be in hand
  });

  it('should remove an item from the hand by index', () => {
    playerHand.addItem(tileBlock);
    playerHand.addItem(specialItem);
    const removed = playerHand.removeItem(1);

    expect(removed).toBe(true); // Should successfully remove the item
    expect(playerHand.getItems().length).toBe(1); // Should have only 1 item left
    expect(playerHand.getItems()).not.toContain(specialItem); // SpecialItem should be removed
  });

  it('should return false when trying to remove an item with invalid index', () => {
    playerHand.addItem(tileBlock);
    const removed = playerHand.removeItem(5); // Invalid index

    expect(removed).toBe(false); // Should fail to remove
    expect(playerHand.getItems().length).toBe(1); // Should still have 1 item
  });

  it('should update the max items and remove extra items when max is lowered', () => {
    playerHand.addItem(tileBlock);
    playerHand.addItem(new TileBlock([new Tile(TileType.People, 1, TileState.Neutral), null]));
    playerHand.addItem(specialItem);

    playerHand.setMaxItems(2); // Lower the max to 2
    expect(playerHand.getMaxItems()).toBe(2); // Max items should be updated
    expect(playerHand.getItems().length).toBe(2); // Extra items should be removed
  });

  it('should check if the hand is full', () => {
    playerHand.addItem(tileBlock);
    playerHand.addItem(new TileBlock([new Tile(TileType.Farm, 1, TileState.Healthy), null]));
    playerHand.addItem(specialItem);

    expect(playerHand.isFull()).toBe(true); // Hand should be full
  });

  it('should not be full if there are fewer items than the maximum', () => {
    playerHand.addItem(tileBlock);
    expect(playerHand.isFull()).toBe(false); // Hand should not be full
  });

  it('should return the current selectedItem index', () => {
    expect(playerHand.getSelectedItemIndex()).toBe(0);
  });

  it('should update the selected item index', () => {
    playerHand.addItem(tileBlock);
    playerHand.addItem(new TileBlock([new Tile(TileType.Farm, 1, TileState.Healthy), null]));
    playerHand.selectItem(1);
    expect(playerHand.getSelectedItemIndex()).toBe(1);
  });

  it('should not update the selected item index if select input out of range', () => {
    playerHand.addItem(tileBlock);
    playerHand.addItem(new TileBlock([new Tile(TileType.Farm, 1, TileState.Healthy), null]));
    const overSelectOperation = playerHand.selectItem(100);
    expect(overSelectOperation).toBe(false);
    expect(playerHand.getSelectedItemIndex()).toBe(0);
    const underSelectOperation = playerHand.selectItem(-100);
    expect(underSelectOperation).toBe(false);
    expect(playerHand.getSelectedItemIndex()).toBe(0);
  });

  it('should rotate the selected item', () => {
    playerHand.addItem(tileBlock);
    playerHand.rotateSelected();
    const items = playerHand.getItems();
    const selected = items[playerHand.getSelectedItemIndex()];
    expect(selected.getRotation()).not.toBe(0);
  });

  it('should clear the hand', () => {
    playerHand.addItem(tileBlock);
    playerHand.clearHand();
    const items = playerHand.getItems();

    expect(items.length).toBe(0);
  });
});
