import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import * as THREE from 'three';
import { ThreeFarmTileHandler, ThreePeopleTileHandler, ThreePowerTileHandler, ThreeTreeTileHandler, ThreeWasteTileHandler } from "./ThreeTileHandler";
import { ThreeModelLibrary } from "./ThreeModelLibrary";
import { TileState, TileType, Tile } from "../Tile";
import { ThreeInstanceManager } from "./ThreeInstanceManager";
import { ThreeTextureLibrary } from "./ThreeTextureLibrary";

describe('ThreeTileHandler', () => {
    describe('ThreePowerTileHandler', () => {
        let mockScene: THREE.Scene;
        let mockLibrary: ThreeModelLibrary;
        let handler: ThreePowerTileHandler;
        let mockInstanceManager: ThreeInstanceManager;
        let mockTextureLibrary: ThreeTextureLibrary;
        
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

            mockTextureLibrary = {
                get: vi.fn()
            } as unknown as ThreeTextureLibrary;

            mockInstanceManager = {
                addInstance: vi.fn(),
                addInstanceKind: vi.fn(),
            } as unknown as ThreeInstanceManager;
    
            handler = new ThreePowerTileHandler(6, mockInstanceManager);
        });

        it('should call scene.add with the correct object', async () => {
            // Mock the position
            const mockPosition = new THREE.Vector3(10, 20, 30);
            const mockObj = new THREE.Object3D();
            const geo = new THREE.BoxGeometry(1, 1, 1,);
            const mesh = new THREE.Mesh(geo);
            mockObj.add(mesh);
            const tile = new Tile(TileType.Power, 1, TileState.Neutral);
            (mockLibrary.get as Mock).mockReturnValue(mockObj)
    
            // Call the updateScene method
            await handler.updateScene(mockScene, mockPosition, mockLibrary, mockTextureLibrary, tile);
    
            expect(mockInstanceManager.addInstanceKind).toHaveBeenCalledOnce();
            expect(mockInstanceManager.addInstance).toHaveBeenCalledTimes(1);
        });
    });

    describe('ThreeFarmTileHandler', () => {
        let mockScene: THREE.Scene;
        let handler: ThreeFarmTileHandler;
        let mockLibrary: ThreeModelLibrary;
        let mockInstanceManager: ThreeInstanceManager;
        let mockTextureLibrary: ThreeTextureLibrary;
        
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

            mockTextureLibrary = {
                get: vi.fn()
            } as unknown as ThreeTextureLibrary;

            mockInstanceManager = {
                addInstance: vi.fn(),
                addInstanceKind: vi.fn(),
            } as unknown as ThreeInstanceManager;
    
            handler = new ThreeFarmTileHandler(6, mockInstanceManager);
        });

        it('should call scene.add with the correct object', async () => {
            // Mock the position
            const mockPosition = new THREE.Vector3(10, 20, 30);
            const mockObj = new THREE.Object3D();
            const geo = new THREE.BoxGeometry(1, 1, 1,);
            const mesh = new THREE.Mesh(geo);
            mockObj.add(mesh);
            const tile = new Tile(TileType.Farm, 1, TileState.Neutral);
            (mockLibrary.get as Mock).mockReturnValue(mockObj)
    
            // Call the updateScene method
            await handler.updateScene(mockScene, mockPosition, mockLibrary, mockTextureLibrary, tile);
    
            expect(mockInstanceManager.addInstanceKind).toHaveBeenCalledOnce();
            expect(mockInstanceManager.addInstance).toHaveBeenCalledTimes(1);
        });
    });

    describe('ThreeTreeTileHandler', () => {
        let mockScene: THREE.Scene;
        let handler: ThreeTreeTileHandler;
        let mockLibrary: ThreeModelLibrary;
        let mockInstanceManager: ThreeInstanceManager;
        let mockTextureLibrary: ThreeTextureLibrary;
        
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

            mockTextureLibrary = {
                get: vi.fn()
            } as unknown as ThreeTextureLibrary;

            mockInstanceManager = {
                addInstance: vi.fn(),
                addInstanceKind: vi.fn(),
            } as unknown as ThreeInstanceManager;
    
            handler = new ThreeTreeTileHandler(6, mockInstanceManager);
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
            await handler.updateScene(mockScene, mockPosition, mockLibrary, mockTextureLibrary, tile);
    
            expect(mockInstanceManager.addInstanceKind).toHaveBeenCalledTimes(3); // 3 tree models currently
            expect(mockInstanceManager.addInstance).toHaveBeenCalledTimes(1);
        });        
    });

    describe('ThreePeopleTileHandler', () => {
        let mockScene: THREE.Scene;
        let handler: ThreePeopleTileHandler;
        let mockLibrary: ThreeModelLibrary;
        let mockInstanceManager: ThreeInstanceManager;
        let mockTextureLibrary: ThreeTextureLibrary;
        
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

            mockTextureLibrary = {
                get: vi.fn()
            } as unknown as ThreeTextureLibrary;
            
            mockInstanceManager = {
                addInstance: vi.fn(),
                addInstanceKind: vi.fn(),
            } as unknown as ThreeInstanceManager;
    
            handler = new ThreePeopleTileHandler(6, mockInstanceManager);
        });

        it('should call scene.add with the correct object', async () => {
            // Mock the position
            const mockPosition = new THREE.Vector3(10, 20, 30);
            const mockObj = new THREE.Object3D();
            const mockMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1));
            mockObj.traverse = vi.fn((callback) => {
                callback(mockMesh); // Simulate traversal of a mesh
            });
            const tile = new Tile(TileType.People, 1, TileState.Neutral);
            (mockLibrary.get as Mock).mockReturnValue(mockObj);
    
            // Call the updateScene method
            await handler.updateScene(mockScene, mockPosition, mockLibrary, mockTextureLibrary, tile);
    
            expect(mockInstanceManager.addInstanceKind).toHaveBeenCalledTimes(1);
            expect(mockInstanceManager.addInstance).toHaveBeenCalledTimes(1);
        });
    });

    describe('ThreeWasteTileHandler', () => {
        let mockScene: THREE.Scene;
        let handler: ThreeWasteTileHandler
        let mockLibrary: ThreeModelLibrary;
        let mockInstanceManager: ThreeInstanceManager;
        let mockTextureLibrary: ThreeTextureLibrary;
        
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

            mockTextureLibrary = {
                get: vi.fn()
            } as unknown as ThreeTextureLibrary;

            mockInstanceManager = {
                addInstance: vi.fn(),
                addInstanceKind: vi.fn(),
            } as unknown as ThreeInstanceManager;
    
            handler = new ThreeWasteTileHandler(6, mockInstanceManager);
        });

        it('should call scene.add with the correct object', async () => {
            // Mock the position
            const mockPosition = new THREE.Vector3(10, 20, 30);
            const mockObj = new THREE.Object3D();
            const mockMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1));
            mockObj.traverse = vi.fn((callback) => {
                callback(mockMesh); // Simulate traversal of a mesh
            });
            const tile = new Tile(TileType.Waste, 1, TileState.Neutral);
            (mockLibrary.get as Mock).mockReturnValue(mockObj);
    
            // Call the updateScene method
            await handler.updateScene(mockScene, mockPosition, mockLibrary, mockTextureLibrary, tile);
    
            expect(mockInstanceManager.addInstanceKind).toHaveBeenCalledTimes(3);
            expect(mockInstanceManager.addInstance).toHaveBeenCalledTimes(3);
        });
    });
})