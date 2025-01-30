import * as THREE from 'three';

export interface ThreeInstanceElement {
    count: number,
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    matrices: THREE.Matrix4[],
    instancedMesh: THREE.InstancedMesh | null
}

export class ThreeInstanceManager {
    private instanceCollection = new Map<string, ThreeInstanceElement>();

    constructor() {}

    addInstanceKind(modelName: string, geometry: THREE.BufferGeometry, material: THREE.Material): void {
        if (!this.instanceCollection.has(modelName)) {
            this.instanceCollection.set(modelName, {
                count: 0,
                geometry,
                material,
                matrices: [],
                instancedMesh: null
            });
        }
    }

    getInstanceCollection(): Map<string, ThreeInstanceElement> {
        return this.instanceCollection;
    }

    incrementInstanceCount(modelName: string, increment: number): void {
        if (this.instanceCollection.has(modelName)) {
            const instance = this.instanceCollection.get(modelName);

            if (instance) {
                instance.count += increment;
            }
        }
    }

    updateScene(scene: THREE.Scene): void {
        this.instanceCollection.forEach(el => {
            const instancedMesh = new THREE.InstancedMesh(el.geometry, el.material, el.count);
            instancedMesh.castShadow = true;
            instancedMesh.receiveShadow = true;

            el.matrices.forEach((matrix, i) => {
                instancedMesh.setMatrixAt(i, matrix);
            });

            el.instancedMesh = instancedMesh;

            scene.add(instancedMesh);
        });
    }

    addInstance(modelName: string, matrix: THREE.Matrix4): void {
        if (this.instanceCollection.has(modelName)) {
            const instance = this.instanceCollection.get(modelName);

            if (instance) {
                instance.count += 1;
                instance.matrices.push(matrix);
            }
        }
    }
}