import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import * as THREE from 'three';
import { ThreeFarmTileHandler, ThreePeopleTileHandler, ThreePowerTileHandler, ThreeTreeTileHandler } from "./ThreeTileHandler";
import { ThreeModelLibrary } from "./ThreeModelLibrary";
import { TileState, TileType, Tile } from "../Tile";

describe('ThreeTileHandler', () => {
    describe('ThreePowerTileHandler', () => {
        let mockScene: THREE.Scene;
        let mockLibrary: ThreeModelLibrary;
        let handler: ThreePowerTileHandler;
        
        beforeEach(() => {

            mockScene = {
                add: vi.fn(),
                children: [],
                remove: vi.fn(),
                traverse: vi.fn(),
            } as unknown as THREE.Scene;

            mockLibrary = {
                get: vi.fn()
            } as unknown as ThreeModelLibrary;
    
            handler = new ThreePowerTileHandler(6);
        });

        it('should call scene.add with the correct object', async () => {
            // Mock the position
            const mockPosition = new THREE.Vector3(10, 20, 30);
            const mockObj = new THREE.Object3D();
            const tile = new Tile(TileType.Power, 1, TileState.Neutral);
            (mockLibrary.get as Mock).mockReturnValue(mockObj)
    
            // Call the updateScene method
            await handler.updateScene(mockScene, mockPosition, mockLibrary, tile);
    
            // Assert that scene.add was called
            expect(mockScene.add).toHaveBeenCalledOnce();
            expect(mockScene.add).toHaveBeenCalledWith(mockObj);
    
            expect(mockObj.position.x).toBe(mockPosition.x + 3);
            expect(mockObj.position.z).toBe(mockPosition.z + 3);
            expect(mockObj.position.y).toBe(mockPosition.y);
        });
    });

    describe('ThreeFarmTileHandler', () => {
        let mockScene: THREE.Scene;
        let handler: ThreeFarmTileHandler;
        let mockLibrary: ThreeModelLibrary;
        
        beforeEach(() => {

            mockScene = {
                add: vi.fn(),
                children: [],
                remove: vi.fn(),
                traverse: vi.fn(),
            } as unknown as THREE.Scene;

            mockLibrary = {
                get: vi.fn()
            } as unknown as ThreeModelLibrary;
    
            handler = new ThreeFarmTileHandler(6);
        });

        it('should call scene.add with the correct object', async () => {
            // Mock the position
            const mockPosition = new THREE.Vector3(10, 20, 30);
            const mockObj = new THREE.Object3D();
            const tile = new Tile(TileType.Farm, 1, TileState.Neutral);
            (mockLibrary.get as Mock).mockReturnValue(mockObj)
    
            // Call the updateScene method
            await handler.updateScene(mockScene, mockPosition, mockLibrary, tile);
    
            // Assert that scene.add was called
            expect(mockScene.add).toHaveBeenCalledOnce();
            expect(mockScene.add).toHaveBeenCalledWith(mockObj);
    
            expect(mockObj.position.x).toBe(mockPosition.x + 3);
            expect(mockObj.position.z).toBe(mockPosition.z + 3);
            expect(mockObj.position.y).toBe(mockPosition.y);
        });
    });

    describe('ThreeTreeTileHandler', () => {
        let mockScene: THREE.Scene;
        let handler: ThreeTreeTileHandler;
        let mockLibrary: ThreeModelLibrary;
        
        beforeEach(() => {

            mockScene = {
                add: vi.fn(),
                children: [],
                remove: vi.fn(),
                traverse: vi.fn(),
            } as unknown as THREE.Scene;

            mockLibrary = {
                get: vi.fn()
            } as unknown as ThreeModelLibrary;
    
            handler = new ThreeTreeTileHandler(6);
        });

        it('should add a single tree if tile is level 1', async () => {
            // Mock the position
            const mockPosition = new THREE.Vector3(10, 20, 30);
            const mockObj = new THREE.Object3D();
            const tile = new Tile(TileType.Tree, 1, TileState.Neutral);
            (mockLibrary.get as Mock).mockReturnValue(mockObj)
    
            // Call the updateScene method
            await handler.updateScene(mockScene, mockPosition, mockLibrary, tile);
    
            // Assert that scene.add was called
            expect(mockScene.add).toHaveBeenCalledTimes(1);
            expect(mockScene.add).toHaveBeenNthCalledWith(1, expect.any(THREE.Object3D));
    
            expect((mockScene.add as Mock).mock.calls[0][0].position.x).toBeLessThanOrEqual(15);
            expect((mockScene.add as Mock).mock.calls[0][0].position.x).toBeGreaterThanOrEqual(10);
            expect((mockScene.add as Mock).mock.calls[0][0].position.z).toBeLessThanOrEqual(35);
            expect((mockScene.add as Mock).mock.calls[0][0].position.z).toBeGreaterThanOrEqual(30);
        });

        it('should add 3 trees if tile is level 2', async () => {
            // Mock the position
            const mockPosition = new THREE.Vector3(10, 20, 30);
            const mockObj = new THREE.Object3D();
            const tile = new Tile(TileType.Tree, 2, TileState.Neutral);
            (mockLibrary.get as Mock).mockReturnValue(mockObj)
    
            // Call the updateScene method
            await handler.updateScene(mockScene, mockPosition, mockLibrary, tile);
    
            // Assert that scene.add was called
            expect(mockScene.add).toHaveBeenCalledTimes(3);
        });

        it('should add 5 trees if tile is level 3', async () => {
            // Mock the position
            const mockPosition = new THREE.Vector3(10, 20, 30);
            const mockObj = new THREE.Object3D();
            const tile = new Tile(TileType.Tree, 3, TileState.Neutral);
            (mockLibrary.get as Mock).mockReturnValue(mockObj)
    
            // Call the updateScene method
            await handler.updateScene(mockScene, mockPosition, mockLibrary, tile);
    
            // Assert that scene.add was called
            expect(mockScene.add).toHaveBeenCalledTimes(5);
        });
    });

    describe('ThreePeopleTileHandler', () => {
        let mockScene: THREE.Scene;
        let handler: ThreePeopleTileHandler;
        let mockLibrary: ThreeModelLibrary;
        
        beforeEach(() => {

            mockScene = {
                add: vi.fn(),
                children: [],
                remove: vi.fn(),
                traverse: vi.fn(),
            } as unknown as THREE.Scene;

            mockLibrary = {
                get: vi.fn()
            } as unknown as ThreeModelLibrary;
    
            handler = new ThreePeopleTileHandler(6);
        });

        it('should call scene.add with the correct object', async () => {
            // Mock the position
            const mockPosition = new THREE.Vector3(10, 20, 30);
            const mockObj = new THREE.Object3D();
            const tile = new Tile(TileType.People, 1, TileState.Neutral);
            (mockLibrary.get as Mock).mockReturnValue(mockObj);
    
            // Call the updateScene method
            await handler.updateScene(mockScene, mockPosition, mockLibrary, tile);
    
            // Assert that scene.add was called
            expect(mockScene.add).toHaveBeenCalledOnce();
            expect(mockScene.add).toHaveBeenCalledWith(mockObj);
    
            expect(mockObj.position.x).toBe(mockPosition.x + 3);
            expect(mockObj.position.z).toBe(mockPosition.z + 3);
            expect(mockObj.position.y).toBe(mockPosition.y);
        });
    });
})