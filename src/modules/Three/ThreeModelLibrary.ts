import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/Addons.js';

export class ThreeModelLibrary {
    private modelMap: Map<string, THREE.Object3D>;

    constructor() {
        this.modelMap = new Map();
    }

    async loadModels(): Promise<void> {
        const loader = new OBJLoader();

        try {
            const modelsToLoad = [
                '/generation-ship-2/public/models/Power2.obj',
                '/generation-ship-2/public/models/Farm.obj',
                '/generation-ship-2/public/models/Tree1.obj',
                '/generation-ship-2/public/models/SmallHouse1.obj'
            ];

            for(const path of modelsToLoad) {
                const fileName = path.match(/[^/]+$/)?.[0];
                
                if (fileName) {
                    const model = await loader.loadAsync(path);

                    this.modelMap.set(fileName, model);
                }
            }
        } catch (e) {
            console.log('Failed to load models', e);
        }
    }

    get(name: string): THREE.Object3D | undefined {
        const obj = this.modelMap.get(name);
        return obj?.clone();
    }
}