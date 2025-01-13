import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/Addons.js';
import { GameManager } from '../modules/GameManager';  // Import the GameManager class
import { Tile } from '../modules/Tile';
import { GameView } from '../types/GameViewInterface';
import { clearElementChildren, insertHtml } from '../utils/htmlUtils';

export type ThreeJSGameViewOptions = {
    showAxes?: boolean;
}
export class ThreeJSGameView implements GameView {
    private gameManager: GameManager;
    private scene: THREE.Scene;
    public camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private tileMeshes: (THREE.Mesh | THREE.Object3D)[][] = [];
    public document: Document;  // Make document public for the controller to access
    private appDiv: HTMLDivElement;
    private gridContainer!: HTMLDivElement;
    private pitch = 0;
    private yaw = 0;

    constructor(gameManager: GameManager, document: Document, options?: ThreeJSGameViewOptions) {
        this.gameManager = gameManager;
        this.document = document;
        this.appDiv = this.document.querySelector<HTMLDivElement>('#app')!;

        this.initializeView();

        // Initialize the three.js scene
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, this.gridContainer.clientWidth / this.gridContainer.clientHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.gridContainer.clientWidth, this.gridContainer.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.gridContainer.appendChild(this.renderer.domElement);

        // Set up camera position
        this.camera.position.set(0, 1.6, 5);

        if (options?.showAxes) {
            const axesHelper = new THREE.AxesHelper(50);
            this.scene.add(axesHelper);
        }

        this.createWorld();

        // Initialize the grid with 3D objects
        this.initializeGrid();
    }

    // Method to initialize the static parts of the UI (buttons, containers, etc.)
    private initializeView(): void {
        clearElementChildren(this.appDiv);
        const html = `
<div class="threejs-wrapper">
    <div class="threejs" id="gridContainer"></div>
    <button class="button" id="exit">⬅</button>
</div>`

        insertHtml(html, this.appDiv);

        this.gridContainer = this.appDiv.querySelector<HTMLDivElement>('#gridContainer')!;
    }

    // Initialize the grid of 3D objects
    private initializeGrid(): void {
        const gameSize = this.gameManager.gameBoard.size;
        const tileSize = 5;  // Size of each tile

        for (let x = 0; x < gameSize; x++) {
            this.tileMeshes[x] = [];
            for (let y = 0; y < gameSize; y++) {
                const space = this.gameManager.gameBoard.getSpace(x, y);
                const tile = space?.tile;

                if (tile) {
                    const meshX = x * tileSize - (gameSize * tileSize) / 2;
                    const meshZ = y * tileSize - (gameSize * tileSize) / 2; // grid plane is on z axis
                    const meshPos = new THREE.Vector3(meshX, 0, meshZ);
                    this.createTileMesh(tile, meshPos).then((mesh) => {
                        this.scene.add(mesh);
                        this.tileMeshes[x][y] = mesh;
                    })
                }
            }
        }

        // Render the scene initially
        this.render();
    }

    private createWorld(): void {
        // Add directional light
        const directionalLight = new THREE.DirectionalLight(0xffee00, 1.0);
        directionalLight.position.set(-50, 20, 50);
        directionalLight.castShadow = true;

        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.camera.near = 1;
        directionalLight.shadow.camera.far = 200;
        directionalLight.shadow.camera.left = -50;
        directionalLight.shadow.camera.right = 50;
        directionalLight.shadow.camera.top = 50;
        directionalLight.shadow.camera.bottom = -50;

        this.scene.add(directionalLight);

        // Dim ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        this.scene.add(ambientLight);

        // Add background and fog
        this.scene.background = new THREE.Color(0x000000); // Sunset color
        this.scene.fog = new THREE.Fog(0xffa07a, 10, 100); // Light haze
        
        // Add world plane
        const size = this.gameManager.gameBoard.size;
        const geometry = new THREE.PlaneGeometry(size * 5, size * 5);
        const material = new THREE.MeshStandardMaterial({ color: 0xa5d66e });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.receiveShadow = true;

        mesh.position.set(0, 0, 0);
        mesh.rotation.x = -Math.PI / 2;

        this.scene.add(mesh);
    }

    // Create a mesh for a tile based on its type
    private async createTileMesh(tile: Tile, position: THREE.Vector3 ): Promise<THREE.Mesh | THREE.Object3D> {
        const loader = new OBJLoader();
        let material: THREE.MeshStandardMaterial;
        let mesh: THREE.Mesh | THREE.Object3D;

        try {

            // Determine the geometry and material based on the tile type
            switch (tile?.type) {                
                case 'people':
                    mesh = await loader.loadAsync('/generation-ship-2/public/models/SmallHouse1.obj');
                    mesh.position.set(position.x, position.y, position.z);
                    material = new THREE.MeshStandardMaterial({
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
                    mesh.traverse((child) => {
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
                    break;
                case 'farm':
                    mesh = await loader.loadAsync('/generation-ship-2/public/models/Farm.obj');
                    mesh.position.set(position.x, position.y, position.z);

                    material = new THREE.MeshStandardMaterial({
                        color: 0xffd522,
                        roughness: 0.9, 
                        metalness: 0.0,
                    });
                    this.applyMaterialToChildren(mesh, material);
                    break;
                case 'power':
                    mesh = await loader.loadAsync('/generation-ship-2/public/models/Power2.obj');
                    mesh.position.set(position.x, position.y, position.z);

                    material = new THREE.MeshStandardMaterial({
                        color: 0x555451,
                        roughness: 0.7, 
                        metalness: 0.2,
                        flatShading: true
                    });
                    this.applyMaterialToChildren(mesh, material);
                    break;
                default:
                    mesh = await loader.loadAsync('/generation-ship-2/public/models/Tree1.obj');
                    mesh.position.set(position.x, position.y, position.z);

                    material = new THREE.MeshStandardMaterial({
                        color: 0x1b9416,
                        roughness: 0.9, 
                        metalness: 0.0
                    });
                    this.applyMaterialToChildren(mesh, material);
                    break;
            }

            mesh.receiveShadow = true;
            mesh.castShadow = true;

            return mesh;
        } catch(e) {
            console.error('Create Tile Mesh Error', e);
            throw e;
        }
    }

    private applyMaterialToChildren(obj: THREE.Object3D, material: THREE.MeshStandardMaterial): void {
        obj.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.material = material;
                child.receiveShadow = true;
                child.castShadow = true;
            }
        });
    }

    // Update the grid's appearance based on the current game state
    public updateGrid(): void {

        // for (let x = 0; x < gameSize; x++) {
        //     for (let y = 0; y < gameSize; y++) {
        //         const space = this.gameManager.gameBoard.getSpace(x, y);
        //         const tile = space?.tile;

        //         if (tile) {
        //             // Update the mesh based on the current tile type and state
        //             const mesh = this.tileMeshes[x][y];
        //             this.updateTileMesh(mesh, tile);
        //         }
        //     }
        // }

        // Re-render the scene after updates
        this.render();
    }

    // Update the properties of a tile's mesh
    // private updateTileMesh(mesh: THREE.Mesh, tile: Tile): void {
    //     // Update the color based on tile state
    //     switch (tile.state) {
    //         case 'healthy':
    //             (mesh.material as THREE.MeshStandardMaterial).color.set(0x00ff00);
    //             break;
    //         case 'unhealthy':
    //             (mesh.material as THREE.MeshStandardMaterial).color.set(0xff0000);
    //             break;
    //         default:
    //             (mesh.material as THREE.MeshStandardMaterial).color.set(0xffffff);
    //             break;
    //     }
    // }

    public moveCamera(direction: THREE.Vector3, distance: number, yawDelta: number, pitchDelta: number) {
        // Update yaw and pitch
        this.yaw -= yawDelta;
        this.pitch -= pitchDelta;
    
        // Clamp pitch to avoid flipping upside down
        this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
    
        // Create a quaternion for the rotation
        const quaternion = new THREE.Quaternion();
        quaternion.setFromEuler(new THREE.Euler(this.pitch, this.yaw, 0, "YXZ")); // "YXZ" ensures proper yaw-pitch order
    
        // Apply rotation to the camera
        this.camera.quaternion.copy(quaternion);
    
        // Calculate forward movement direction
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
        const strafe = new THREE.Vector3(-1, 0, 0).applyQuaternion(this.camera.quaternion);
    
        // Combine movement directions
        const combinedDirection = new THREE.Vector3();
        combinedDirection.addScaledVector(forward, direction.z); // Forward/backward
        combinedDirection.addScaledVector(strafe, direction.x); // Left/right
        combinedDirection.normalize();
    
        // Calculate the new position while locking the y-position to 1.6
        const newPosition = this.camera.position.clone();
        newPosition.addScaledVector(combinedDirection, distance);
        newPosition.y = 1.6; // Lock y-position

        // Update the camera position
        this.camera.position.copy(newPosition);
    
        // Render the scene
        this.render();
    }

    public moveCameraRotation(deltaX: number, deltaY: number): void {
        this.yaw -= deltaX;
        this.pitch -= deltaY;

        // Clamp pitch to avoid flipping upside down
        this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
        
        this.camera.rotation.set(this.pitch, this.yaw, 0);

        this.render(); // Update the rendering
    }

    public moveCameraPosition(direction: THREE.Vector3, distance: number): void {
        direction.normalize().applyEuler(this.camera.rotation);

        this.camera.position.addScaledVector(direction, distance);

        this.render();
    }

    public getCanvas(): HTMLCanvasElement {
        return this.renderer.domElement;
    }

    public getMeshes(): (THREE.Mesh | THREE.Object3D)[][] {
        return this.tileMeshes;
    }

    // Render the three.js scene
    public render(): void {
        // this.controls.update(); // Update the orbit controls
        this.renderer.render(this.scene, this.camera);
    }

    // Handle window resizing
    public onResize(width: number, height: number): void {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
}
