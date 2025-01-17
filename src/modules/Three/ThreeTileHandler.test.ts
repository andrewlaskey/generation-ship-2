import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import * as THREE from 'three';
import { ThreeFarmTileHandler, ThreePeopleTileHandler, ThreePowerTileHandler, ThreeTreeTileHandler } from "./ThreeTileHandler";

vi.mock('three/examples/jsm/Addons.js', async () => {
    return {
        OBJLoader: class {
            async loadAsync() {
                return {
                    position: { set: vi.fn() },
                    traverse: vi.fn(),
                };
            }
        },
    };
});

describe('ThreeTileHandler', () => {
    describe('ThreePowerTileHandler', () => {
        let mockScene: THREE.Scene;
        let handler: ThreePowerTileHandler;
        
        beforeEach(() => {

            mockScene = {
                add: vi.fn(),
                children: [],
                remove: vi.fn(),
                traverse: vi.fn(),
            } as unknown as THREE.Scene;
    
            handler = new ThreePowerTileHandler();
        });

        it('should call scene.add with the correct object', async () => {
            // Mock the position
            const mockPosition = new THREE.Vector3(10, 20, 30);
    
            // Call the updateScene method
            await handler.updateScene(mockScene, mockPosition);
    
            // Assert that scene.add was called
            expect(mockScene.add).toHaveBeenCalledOnce();
            const addedObject = (mockScene.add as Mock).mock.calls[0][0];
    
            expect(addedObject).toBeDefined();
            expect(addedObject.position.set).toHaveBeenCalledWith(10, 20, 30);
        });
    });

    describe('ThreeFarmTileHandler', () => {
        let mockScene: THREE.Scene;
        let handler: ThreeFarmTileHandler;
        
        beforeEach(() => {

            mockScene = {
                add: vi.fn(),
                children: [],
                remove: vi.fn(),
                traverse: vi.fn(),
            } as unknown as THREE.Scene;
    
            handler = new ThreeFarmTileHandler();
        });

        it('should call scene.add with the correct object', async () => {
            // Mock the position
            const mockPosition = new THREE.Vector3(10, 20, 30);
    
            // Call the updateScene method
            await handler.updateScene(mockScene, mockPosition);
    
            // Assert that scene.add was called
            expect(mockScene.add).toHaveBeenCalledOnce();
            const addedObject = (mockScene.add as Mock).mock.calls[0][0];
    
            expect(addedObject).toBeDefined();
            expect(addedObject.position.set).toHaveBeenCalledWith(10, 20, 30);
        });
    });

    describe('ThreeTreeTileHandler', () => {
        let mockScene: THREE.Scene;
        let handler: ThreeTreeTileHandler;
        
        beforeEach(() => {

            mockScene = {
                add: vi.fn(),
                children: [],
                remove: vi.fn(),
                traverse: vi.fn(),
            } as unknown as THREE.Scene;
    
            handler = new ThreeTreeTileHandler();
        });

        it('should call scene.add with the correct object', async () => {
            // Mock the position
            const mockPosition = new THREE.Vector3(10, 20, 30);
    
            // Call the updateScene method
            await handler.updateScene(mockScene, mockPosition);
    
            // Assert that scene.add was called
            expect(mockScene.add).toHaveBeenCalledOnce();
            const addedObject = (mockScene.add as Mock).mock.calls[0][0];
    
            expect(addedObject).toBeDefined();
            expect(addedObject.position.set).toHaveBeenCalledWith(10, 20, 30);
        });
    });

    describe('ThreePeopleTileHandler', () => {
        let mockScene: THREE.Scene;
        let handler: ThreePeopleTileHandler
        
        beforeEach(() => {

            mockScene = {
                add: vi.fn(),
                children: [],
                remove: vi.fn(),
                traverse: vi.fn(),
            } as unknown as THREE.Scene;
    
            handler = new ThreePeopleTileHandler();
        });

        it('should call scene.add with the correct object', async () => {
            // Mock the position
            const mockPosition = new THREE.Vector3(10, 20, 30);
    
            // Call the updateScene method
            await handler.updateScene(mockScene, mockPosition);
    
            // Assert that scene.add was called
            expect(mockScene.add).toHaveBeenCalledOnce();
            const addedObject = (mockScene.add as Mock).mock.calls[0][0];
    
            expect(addedObject).toBeDefined();
            expect(addedObject.position.set).toHaveBeenCalledWith(10, 20, 30);
        });
    });
})