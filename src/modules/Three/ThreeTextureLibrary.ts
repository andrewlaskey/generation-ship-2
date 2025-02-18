
import * as THREE from 'three';


export class ThreeTextureLibrary {
    private textures: Map<string, THREE.Texture>;
    public skybox: THREE.CubeTexture | null = null;

    constructor() {
        this.textures = new Map();
    }

    async loadTextures(): Promise<void> {
        try {
            await this.load();
            await this.loadSkybox();
        } catch (e) {
            console.error('Failed to load models', e);
        }
    }

    get(name: string): THREE.Texture {
        const texture = this.textures.get(name);

        if (!texture) {
            throw new Error(`No texture of ${name} exists in map.`);
        }

        return texture;
    }

    private async load(): Promise<void> {
        const textureLoader = new THREE.TextureLoader();
        const basePath = `${import.meta.env.BASE_URL}textures/`;
        const texturesToLoad = [
            'Power3.png',
            'SmallHouse.png',
            'MidHouse.png',
            'BigHouse.png',
            'grass.png',
            'Power3_map.png'
        ];

        for(const path of texturesToLoad) {
            const fileName = path.match(/[^/]+$/)?.[0];
            
            if (fileName) {
                const texture = await textureLoader.loadAsync(`${basePath}${fileName}`);

                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;

                this.textures.set(fileName, texture);
            }
        }
    }

    private async loadSkybox(): Promise<void> {
        const loader = new THREE.CubeTextureLoader();
        const skyboxTexture = await loader.loadAsync([
            `${import.meta.env.BASE_URL}textures/skybox/nightskycolor.png`, // +X (right)
            `${import.meta.env.BASE_URL}textures/skybox/nightskycolor.png`, // -X (left)
            `${import.meta.env.BASE_URL}textures/skybox/nightskycolor.png`, // +Y (top)
            `${import.meta.env.BASE_URL}textures/skybox/nightskycolor.png`, // -Y (bottom)
            `${import.meta.env.BASE_URL}textures/skybox/nightskycolor.png`, // +Z (front)
            `${import.meta.env.BASE_URL}textures/skybox/nightskycolor.png`  // -Z (back)
        ]);

        this.skybox = skyboxTexture;
    }

}