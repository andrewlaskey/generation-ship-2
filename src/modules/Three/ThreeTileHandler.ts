import * as THREE from 'three';
import { ThreeModelLibrary } from './ThreeModelLibrary';
import { Tile } from '../Tile';

export interface ThreeTileHandler {
    updateScene(scene: THREE.Scene, position: THREE.Vector3, library: ThreeModelLibrary, tile: Tile): void;
}

export class ThreePowerTileHandler implements ThreeTileHandler {
    private tileSize: number;

    constructor(tileSize: number) {
        this.tileSize = tileSize;
    }

    updateScene(scene: THREE.Scene, position: THREE.Vector3, library: ThreeModelLibrary, _tile: Tile): void {
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

            // TODO: need to clone lights I think
            // Add a light
            // const light = new THREE.SpotLight(0xadd8e6, 20); // Light blue color
            // light.angle = THREE.MathUtils.degToRad(30);
            // light.position.set(position.x + tileMid, position.y + 8, position.z + tileMid); // Place in the room
            // light.target.position.set(position.x + tileMid, position.y, position.z + tileMid);
            // light.castShadow = true; // Enable shadows

            // scene.add(light);
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

    updateScene(scene: THREE.Scene, position: THREE.Vector3, library: ThreeModelLibrary, tile: Tile): void {
        try {
            const obj = library.get('Farm.obj');
            let farmCount = tile.level;

            if (!obj) {
                throw new Error('Model library failed to load');
            }

            for (let i = 0; i < farmCount; i++) {
                const newFarm = obj.clone();
                this.addFarm(scene, position, newFarm);
            }
        } catch (e) {
            console.error('Failed to load farm tile', e);
            throw e;
        }
    }

    private addFarm(scene: THREE.Scene, position: THREE.Vector3, obj: THREE.Object3D) {
        const placementPadding = 1;
        const material = new THREE.MeshStandardMaterial({
            color: 0xffd522,
            roughness: 0.9, 
            metalness: 0.0,
        });
        
        obj.receiveShadow = true;
        obj.castShadow = true;

        applyMaterialToChildren(obj, material);
        

        const minX = position.x + placementPadding;
        const maxX = position.x + this.tileSize - placementPadding;
        const minZ = position.z + placementPadding;
        const maxZ = position.z + this.tileSize - placementPadding;
        const newX = Math.floor(Math.random() * (maxX - minX + 1)) + minX; 
        const newZ = Math.floor(Math.random() * (maxZ - minZ + 1)) + minZ; 

        obj.position.set(newX, position.y, newZ);

        obj.rotateY(Math.random() * Math.PI * 2);

        const randomScale = Math.random() + 0.6;
        obj.scale.set(randomScale, randomScale, randomScale);

        scene.add(obj);
    }
}

export class ThreeTreeTileHandler implements ThreeTileHandler {
    private tileSize: number;

    constructor(tileSize: number) {
        this.tileSize = tileSize;
    }

    updateScene(scene: THREE.Scene, position: THREE.Vector3, library: ThreeModelLibrary, tile: Tile): void {
        try {
            const obj = library.get('Tree1.obj');
            let treeCount = 1;

            if (!obj) {
                throw new Error('Model library failed to load');
            }

            if (tile.level === 2) {
                treeCount = 3;    
            } else if (tile.level === 3) {
                treeCount = 5;
            }

            for (let i = 0; i < treeCount; i++) {
                const newTree = obj.clone();
                this.addTree(scene, position, newTree);
            }
        } catch (e) {
            console.error('Failed to load tree tile', e);
            throw e;
        }
    }

    private addTree(scene: THREE.Scene, position: THREE.Vector3, obj: THREE.Object3D) {
        const placementPadding = 1;
        const material = new THREE.MeshStandardMaterial({
            color: 0x1b9416,
            roughness: 0.9, 
            metalness: 0.0
        });
        
        obj.receiveShadow = true;
        obj.castShadow = true;

        applyMaterialToChildren(obj, material);
        

        const minX = position.x + placementPadding;
        const maxX = position.x + this.tileSize - placementPadding;
        const minZ = position.z + placementPadding;
        const maxZ = position.z + this.tileSize - placementPadding;
        const newX = Math.floor(Math.random() * (maxX - minX + 1)) + minX; 
        const newZ = Math.floor(Math.random() * (maxZ - minZ + 1)) + minZ; 

        obj.position.set(newX, position.y, newZ);

        obj.rotateY(Math.random() * Math.PI * 2);

        const randomScale = Math.random() + 0.6;
        obj.scale.set(randomScale, randomScale, randomScale);

        scene.add(obj);
    }
}

export class ThreePeopleTileHandler implements ThreeTileHandler {
    private tileSize: number;

    constructor(tileSize: number) {
        this.tileSize = tileSize;
    }

    updateScene(scene: THREE.Scene, position: THREE.Vector3, library: ThreeModelLibrary, _tile: Tile): void {
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