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
            console.error('Failed to load models', e);
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
            `${import.meta.env.BASE_URL}models/Broken wall.obj`,
            `${import.meta.env.BASE_URL}models/Rock 2.obj`,
            `${import.meta.env.BASE_URL}models/Rock.obj`,
            `${import.meta.env.BASE_URL}models/World Ring.obj`,
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
            `${import.meta.env.BASE_URL}models/Farm.glb`,
            `${import.meta.env.BASE_URL}models/Tree1.glb`,
            `${import.meta.env.BASE_URL}models/Tree2.glb`,
            `${import.meta.env.BASE_URL}models/Tree3.glb`,
            `${import.meta.env.BASE_URL}models/Smallhouse.glb`,
            `${import.meta.env.BASE_URL}models/Bighouse.glb`,
            `${import.meta.env.BASE_URL}models/Midhouse.glb`,
            `${import.meta.env.BASE_URL}models/Power_3.glb`,
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