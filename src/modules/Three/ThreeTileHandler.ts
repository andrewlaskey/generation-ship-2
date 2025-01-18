import * as THREE from 'three';
import { ThreeModelLibrary } from './ThreeModelLibrary';

export interface ThreeTileHandler {
    updateScene(scene: THREE.Scene, position: THREE.Vector3, library: ThreeModelLibrary): void;
}

export class ThreePowerTileHandler implements ThreeTileHandler {
    private tileSize: number;

    constructor(tileSize: number) {
        this.tileSize = tileSize;
    }

    updateScene(scene: THREE.Scene, position: THREE.Vector3, library: ThreeModelLibrary): void {
        try {
            const obj = library.get('Power2.obj');
            const tileMid = this.tileSize * 0.5;

            if (!obj) {
                throw new Error('Model library failed to load');
            }

            obj.position.set(position.x + tileMid, position.y, position.z + tileMid);

            const material = new THREE.MeshStandardMaterial({
                color: 0x555451,
                roughness: 0.7, 
                metalness: 0.2,
                flatShading: true
            });

            applyMaterialToChildren(obj, material);

            obj.receiveShadow = true;
            obj.castShadow = true;

            scene.add(obj);
        } catch (e) {
            console.error('Failed to load power tile', e);
            throw e;
        }
    }
}

export class ThreeFarmTileHandler implements ThreeTileHandler {
    private tileSize: number;

    constructor(tileSize: number) {
        this.tileSize = tileSize;
    }

    updateScene(scene: THREE.Scene, position: THREE.Vector3, library: ThreeModelLibrary): void {
        try {
            const obj = library.get('Farm.obj');
            const tileMid = this.tileSize * 0.5;

            if (!obj) {
                throw new Error('Model library failed to load');
            }

            obj.position.set(position.x + tileMid, position.y, position.z + tileMid);

            const material = new THREE.MeshStandardMaterial({
                color: 0xffd522,
                roughness: 0.9, 
                metalness: 0.0,
            });

            applyMaterialToChildren(obj, material);

            obj.receiveShadow = true;
            obj.castShadow = true;

            scene.add(obj);
        } catch (e) {
            console.error('Failed to load farm tile', e);
            throw e;
        }
    }
}

export class ThreeTreeTileHandler implements ThreeTileHandler {
    updateScene(scene: THREE.Scene, position: THREE.Vector3, library: ThreeModelLibrary): void {
        try {
            const obj = library.get('Tree1.obj');

            if (!obj) {
                throw new Error('Model library failed to load');
            }

            obj.position.set(position.x, position.y, position.z);

            const material = new THREE.MeshStandardMaterial({
                color: 0x1b9416,
                roughness: 0.9, 
                metalness: 0.0
            });

            applyMaterialToChildren(obj, material);

            obj.receiveShadow = true;
            obj.castShadow = true;

            scene.add(obj);

            const newTree = obj.clone();

            newTree.position.set(position.x + 5, position.y, position.z + 5);

            scene.add(newTree);
        } catch (e) {
            console.error('Failed to load tree tile', e);
            throw e;
        }
    }
}

export class ThreePeopleTileHandler implements ThreeTileHandler {
    private tileSize: number;

    constructor(tileSize: number) {
        this.tileSize = tileSize;
    }

    updateScene(scene: THREE.Scene, position: THREE.Vector3, library: ThreeModelLibrary): void {
        try {
            const obj = library.get('SmallHouse1.obj');
            const tileMid = this.tileSize * 0.5;

            if (!obj) {
                throw new Error('Model library failed to load');
            }

            obj.position.set(position.x + tileMid, position.y, position.z + tileMid);

            const material = new THREE.MeshStandardMaterial({
                color: 0xf1efe7,
                roughness: 0.8, 
                metalness: 0.0,
                flatShading: true
            });
            const woodMaterial = new THREE.MeshStandardMaterial({
                color: 0x741518,
                roughness: 0.8, 
                metalness: 0.0,
                flatShading: true
            });
            const altMaterial = new THREE.MeshStandardMaterial({
                color: 0x5a54a3,
                roughness: 0.8, 
                metalness: 0.0,
                flatShading: true
            });

            obj.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    if (child.name == 'Wood') {
                        child.material = woodMaterial;    
                    } else if (child.name == 'Glass') {
                        child.material = altMaterial;
                    } else {
                        child.material = material;
                    }
                    child.receiveShadow = true;
                    child.castShadow = true;
                }
            });

            obj.receiveShadow = true;
            obj.castShadow = true;

            scene.add(obj);
        } catch (e) {
            console.error('Failed to load people tile', e);
        }
    }
}

function applyMaterialToChildren(obj: THREE.Object3D, material: THREE.MeshStandardMaterial): void {
    obj.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            child.material = material;
            child.receiveShadow = true;
            child.castShadow = true;
        }
    });
}