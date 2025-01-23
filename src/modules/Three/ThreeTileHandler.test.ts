import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import * as THREE from 'three';
import { ThreeFarmTileHandler, ThreePeopleTileHandler, ThreePowerTileHandler, ThreeTreeTileHandler, ThreeWasteTileHandler } from "./ThreeTileHandler";
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
            expect(mockScene.add).toHaveBeenCalled();
            expect(mockScene.add).toHaveBeenCalledWith(expect.any(THREE.InstancedMesh));
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

        it('should add an instanced mesh', async () => {
            // Mock the position
            const mockPosition = new THREE.Vector3(10, 20, 30);
            const mockObj = new THREE.Object3D();
            const mockMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1));
            mockObj.traverse = vi.fn((callback) => {
                callback(mockMesh); // Simulate traversal of a mesh
            });
            const tile = new Tile(TileType.Tree, 1, TileState.Neutral);
            (mockLibrary.get as Mock).mockReturnValue(mockObj)
    
            // Call the updateScene method
            await handler.updateScene(mockScene, mockPosition, mockLibrary, tile);
    
            // Assert that scene.add was called
            expect(mockScene.add).toHaveBeenCalled();
            expect(mockScene.add).toHaveBeenCalledWith(expect.any(THREE.InstancedMesh));
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

    describe('ThreeWasteTileHandler', () => {
        let mockScene: THREE.Scene;
        let handler: ThreeWasteTileHandler
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
    
            handler = new ThreeWasteTileHandler(6);
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
            expect(mockScene.add).toHaveBeenCalledTimes(3);
            expect(mockScene.add).toHaveBeenCalledWith(mockObj);
        });
    });
})