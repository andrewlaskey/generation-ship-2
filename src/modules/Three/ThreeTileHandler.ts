import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/Addons.js';

export interface ThreeTileHandler {
    updateScene(scene: THREE.Scene, position: THREE.Vector3): Promise<void>;
}

export class ThreePowerTileHandler implements ThreeTileHandler {
    async updateScene(scene: THREE.Scene, position: THREE.Vector3 ): Promise<void> {
        try {
            const loader = new OBJLoader();
            const obj = await loader.loadAsync('/generation-ship-2/public/models/Power2.obj');
            obj.position.set(position.x, position.y, position.z);

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
        }
    }
}

export class ThreeFarmTileHandler implements ThreeTileHandler {
    async updateScene(scene: THREE.Scene, position: THREE.Vector3): Promise<void> {
        try {
            const loader = new OBJLoader();
            const obj = await loader.loadAsync('/generation-ship-2/public/models/Farm.obj');
            obj.position.set(position.x, position.y, position.z);

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
            console.error('Failed to load power tile', e);
        }
    }
}

export class ThreeTreeTileHandler implements ThreeTileHandler {
    async updateScene(scene: THREE.Scene, position: THREE.Vector3): Promise<void> {
        try {
            const loader = new OBJLoader();
            const obj = await loader.loadAsync('/generation-ship-2/public/models/Tree1.obj');
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
        } catch (e) {
            console.error('Failed to load power tile', e);
        }
    }
}

export class ThreePeopleTileHandler implements ThreeTileHandler {
    async updateScene(scene: THREE.Scene, position: THREE.Vector3): Promise<void> {
        try {
            const loader = new OBJLoader();
            const obj = await loader.loadAsync('/generation-ship-2/public/models/SmallHouse1.obj');
            obj.position.set(position.x, position.y, position.z);

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
            console.error('Failed to load power tile', e);
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