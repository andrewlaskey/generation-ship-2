import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import * as THREE from 'three';
import { ThreeFarmTileHandler, ThreePeopleTileHandler, ThreePowerTileHandler, ThreeTreeTileHandler } from "./ThreeTileHandler";
import { ThreeModelLibrary } from "./ThreeModelLibrary";

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
            (mockLibrary.get as Mock).mockReturnValue(mockObj)
    
            // Call the updateScene method
            await handler.updateScene(mockScene, mockPosition, mockLibrary);
    
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
            (mockLibrary.get as Mock).mockReturnValue(mockObj)
    
            // Call the updateScene method
            await handler.updateScene(mockScene, mockPosition, mockLibrary);
    
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
    
            handler = new ThreeTreeTileHandler();
        });

        it('should call scene.add with the correct object', async () => {
            // Mock the position
            const mockPosition = new THREE.Vector3(10, 20, 30);
            const mockObj = new THREE.Object3D();
            (mockLibrary.get as Mock).mockReturnValue(mockObj)
    
            // Call the updateScene method
            await handler.updateScene(mockScene, mockPosition, mockLibrary);
    
            // Assert that scene.add was called
            expect(mockScene.add).toHaveBeenCalledTimes(2);
            expect(mockScene.add).toHaveBeenNthCalledWith(1, mockObj);
    
            expect(mockObj.position).toEqual(mockPosition);
        });
    });

    describe('ThreePeopleTileHandler', () => {
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
    
            handler = new ThreePeopleTileHandler(6);
        });

        it('should call scene.add with the correct object', async () => {
            // Mock the position
            const mockPosition = new THREE.Vector3(10, 20, 30);
            const mockObj = new THREE.Object3D();
            (mockLibrary.get as Mock).mockReturnValue(mockObj)
    
            // Call the updateScene method
            await handler.updateScene(mockScene, mockPosition, mockLibrary);
    
            // Assert that scene.add was called
            expect(mockScene.add).toHaveBeenCalledOnce();
            expect(mockScene.add).toHaveBeenCalledWith(mockObj);
    
            expect(mockObj.position.x).toBe(mockPosition.x + 3);
            expect(mockObj.position.z).toBe(mockPosition.z + 3);
            expect(mockObj.position.y).toBe(mockPosition.y);
        });
    });
})