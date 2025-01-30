import * as THREE from 'three';
import { OBJLoader, GLTFLoader } from 'three/examples/jsm/Addons.js';


export class ThreeModelLibrary {
    private modelMap: Map<string, THREE.Object3D>;

    constructor() {
        this.modelMap = new Map();
    }

    async loadModels(): Promise<void> {
        try {
            await this.loadObj();
            await this.loadGltf();
        } catch (e) {
            console.log('Failed to load models', e);
        }
    }

    get(name: string): THREE.Object3D {
        const obj = this.modelMap.get(name);

        if (!obj) {
            throw new Error(`No model of ${name} exists in map.`);
        }

        return obj.clone();
    }

    private async loadObj(): Promise<void> {
        const loader = new OBJLoader();
        const modelsToLoad = [
            '/generation-ship-2/public/models/Power2.obj',
            '/generation-ship-2/public/models/Farm.obj',
            '/generation-ship-2/public/models/Tree1.obj',
            '/generation-ship-2/public/models/SmallHouse1.obj',
            '/generation-ship-2/public/models/Broken wall.obj',
            '/generation-ship-2/public/models/Rock 2.obj',
            '/generation-ship-2/public/models/Rock.obj',
            '/generation-ship-2/public/models/World Ring.obj',
            '/generation-ship-2/public/models/BigHouse.obj',
            '/generation-ship-2/public/models/Yurt.obj',
            '/generation-ship-2/public/models/Tree2.obj',
            '/generation-ship-2/public/models/Tree3.obj'
        ];

        for(const path of modelsToLoad) {
            const fileName = path.match(/[^/]+$/)?.[0];
            
            if (fileName) {
                const model = await loader.loadAsync(path);

                this.modelMap.set(fileName, model);
            }
        }
    }

    private async loadGltf(): Promise<void> {
        const loader = new GLTFLoader();
        const modelsToLoad = [
            '/generation-ship-2/public/models/Farm.glb',
            '/generation-ship-2/public/models/Tree1.glb',
            '/generation-ship-2/public/models/Tree2.glb',
            '/generation-ship-2/public/models/Tree3.glb',
        ];

        for(const path of modelsToLoad) {
            const fileName = path.match(/[^/]+$/)?.[0];
            
            if (fileName) {
                const gltf = await loader.loadAsync(path);
                const model = gltf.scene;

                this.modelMap.set(fileName, model);
            }
        }
    }
}