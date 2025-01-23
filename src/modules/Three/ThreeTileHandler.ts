import * as THREE from 'three';
import { draw } from 'radash';
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
            // Geometry and Material
            const obj = library.get('Farm.glb');

            if (!obj) {
                throw new Error('Model library failed to load Farm');
            }

            const material = new THREE.MeshStandardMaterial({
                color: 0xffd522,
                roughness: 0.9, 
                metalness: 0.0,
            });
            let geometry;
            obj.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    geometry = child.geometry; // Get the geometry from the first mesh
                }
            });
            
            
            // Placement position helpers
            const tileMid = this.tileSize * 0.5;
            const midPosition = new THREE.Vector3(position.x + tileMid, position.y, position.z + tileMid);

            // Instancing
            let farmInstanceCount = 1;

            if (tile.level === 2) {
                farmInstanceCount = 3;
            } else if (tile.level === 3) {
                farmInstanceCount = 5;
            }

            const farmInstancedMesh = new THREE.InstancedMesh(geometry, material, farmInstanceCount);

            const farmPositions: THREE.Vector3[] = [
                new THREE.Vector3(midPosition.x, midPosition.y, midPosition.z + 2.5),
                new THREE.Vector3(midPosition.x, midPosition.y, midPosition.z - 2.5),
                new THREE.Vector3(midPosition.x + 2.5, midPosition.y, midPosition.z),
                new THREE.Vector3(midPosition.x - 2.5, midPosition.y, midPosition.z),
                midPosition
            ]

            const dummy = new THREE.Object3D();
            for (let i = 0; i < farmInstanceCount; i++) {
                dummy.position.set(farmPositions[i].x, farmPositions[i].y, farmPositions[i].z);
                dummy.rotateY(Math.random() * Math.PI * 2);
                dummy.updateMatrix();
                farmInstancedMesh.setMatrixAt(i, dummy.matrix);
            }

            scene.add(farmInstancedMesh);
        } catch (e) {
            console.error('Failed to load farm tile', e);
            throw e;
        }
    }
}

export class ThreeTreeTileHandler implements ThreeTileHandler {
    private tileSize: number;

    constructor(tileSize: number) {
        this.tileSize = tileSize;
    }

    updateScene(scene: THREE.Scene, position: THREE.Vector3, library: ThreeModelLibrary, tile: Tile): void {
        try {
            const tree1 = library.get('Tree1.glb');
            const tree2 = library.get('Tree2.glb');
            const tree3 = library.get('Tree3.glb');
            const treeModels = [
                ...(tree1 ? [tree1] : []),
                ...(tree2 ? [tree2] : []),
                ...(tree3 ? [tree3] : [])
            ];

            if (treeModels.length === 0) {
                throw new Error('Tree models library failed to load');
            }

            const treeMap: { geometry: THREE.BufferGeometry, count: number }[] = []; 
            treeModels.forEach(obj => {
                obj.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        treeMap.push({
                            geometry: child.geometry,
                            count: 0
                        })
                    }
                });
            });

            let totalTreeCount = 1;

            if (tile.level === 2) {
                totalTreeCount = 3;    
            } else if (tile.level === 3) {
                totalTreeCount = 5;
            }

            for (let i = 0; i < totalTreeCount; i++) {
                const randomTreeSelect = draw(treeMap);

                if (randomTreeSelect) {
                    randomTreeSelect.count++;
                }
            }

            const material = new THREE.MeshStandardMaterial({
                color: 0x1b9416,
                roughness: 0.9, 
                metalness: 0.0
            });

            console.log(treeMap);

            treeMap.forEach(treeType => {
                const instanceMesh = new THREE.InstancedMesh(treeType.geometry, material, treeType.count);

                for (let i = 0; i < treeType.count; i++) {
                    const dummy = this.addTree(position, tile.level);
                    dummy.updateMatrix();
                    instanceMesh.setMatrixAt(i, dummy.matrix);
                }

                scene.add(instanceMesh);
            })

        } catch (e) {
            console.error('Failed to load tree tile', e);
            throw e;
        }
    }

    private addTree(position: THREE.Vector3, level: number): THREE.Object3D {
        const dummy = new THREE.Object3D;
        const placementPadding = 1;
        

        const minX = position.x + placementPadding;
        const maxX = position.x + this.tileSize - placementPadding;
        const minZ = position.z + placementPadding;
        const maxZ = position.z + this.tileSize - placementPadding;
        const newX = Math.floor(Math.random() * (maxX - minX + 1)) + minX; 
        const newZ = Math.floor(Math.random() * (maxZ - minZ + 1)) + minZ; 

        dummy.position.set(newX, position.y, newZ);

        dummy.rotateY(Math.random() * Math.PI * 2);

        let minScale;
        let maxScale;

        if (level === 2) {
            minScale = 0.8;
            maxScale = 1.5;
        } else if (level === 3) {
            minScale = 1;
            maxScale = 2.2;
        } else {
            minScale = 0.6;
            maxScale = 1;
        }

        const randomScale = Math.floor(Math.random() * (maxScale - minScale + 1)) + minScale; 
        dummy.scale.set(randomScale, randomScale, randomScale);

        return dummy
    }
}

export class ThreePeopleTileHandler implements ThreeTileHandler {
    private tileSize: number;

    constructor(tileSize: number) {
        this.tileSize = tileSize;
    }

    updateScene(scene: THREE.Scene, position: THREE.Vector3, library: ThreeModelLibrary, _tile: Tile): void {
        try {
            const obj = library.get('Yurt.obj');
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

export class ThreeWasteTileHandler implements ThreeTileHandler {
    private tileSize: number;

    constructor(tileSize: number) {
        this.tileSize = tileSize;
    }

    updateScene(scene: THREE.Scene, position: THREE.Vector3, library: ThreeModelLibrary, _tile: Tile): void {
        try {
            const rock1 = library.get('Rock.obj');
            const rock2 = library.get('Rock 2.obj');
            const wall = library.get('Broken wall.obj');

            if (rock1) {
                this.addTrash(scene, position, rock1);
            }

            if (rock2) {
                this.addTrash(scene, position, rock2);
            }

            if (wall) {
                this.addTrash(scene, position, wall);
            }

        } catch (e) {
            console.error('Failed to load people tile', e);
        }
    }

    private addTrash(scene: THREE.Scene, position: THREE.Vector3, obj: THREE.Object3D) {
        const placementPadding = 1;
        const material = new THREE.MeshStandardMaterial({
            color: 0x4a4645,
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

        obj.position.set(newX, position.y - Math.random(), newZ);

        obj.rotateY(Math.random() * Math.PI * 2);

        scene.add(obj);
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