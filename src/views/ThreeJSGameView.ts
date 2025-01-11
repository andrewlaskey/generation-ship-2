import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
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
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private tileMeshes: THREE.Mesh[][] = [];
    public document: Document;  // Make document public for the controller to access
    private appDiv: HTMLDivElement;
    private gridContainer!: HTMLDivElement;
    private controls: OrbitControls;

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
        this.gridContainer.appendChild(this.renderer.domElement);

        // Set up camera position
        this.camera.position.set(10, 20, 30);

        // Set up orbit controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.target.set(0, 0, 0); // Point the controls at the center of the grid
        this.controls.enableDamping = true; // Optional: adds a smooth effect to the orbiting
        this.controls.dampingFactor = 0.25; // Controls the amount of damping
        this.controls.enableZoom = true; // Allows zooming in and out
        this.controls.autoRotate = false; // If true, the camera will rotate automatically
        this.controls.maxPolarAngle = Math.PI / 2; // Limits the vertical angle

        // Set up basic lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
        directionalLight.position.set(10, 20, 50); // Adjusted position
        directionalLight.castShadow = true; // Enable shadows
        this.scene.add(directionalLight);

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
                    const mesh = this.createTileMesh(tile, meshPos);
                    
                    this.scene.add(mesh);
                    this.tileMeshes[x][y] = mesh;
                }
            }
        }

        // Render the scene initially
        this.render();
    }

    private createWorld(): void {
        const size = this.gameManager.gameBoard.size;
        const geometry = new THREE.PlaneGeometry(size * 5, size * 5);
        const material = new THREE.MeshStandardMaterial({
            color: 0x5a5652,
            roughness: 0.8,
            metalness: 0
        });
        const mesh = new THREE.Mesh(geometry, material);

        mesh.position.set(0, 0, 0);
        mesh.rotation.x = -Math.PI / 2;

        this.scene.add(mesh);
    }

    // Create a mesh for a tile based on its type
    private createTileMesh(tile: Tile, position: THREE.Vector3 ): THREE.Mesh {
        let geometry: THREE.BufferGeometry;
        let material: THREE.MeshStandardMaterial;
        let mesh: THREE.Mesh;

        // Determine the geometry and material based on the tile type
        switch (tile?.type) {                
            case 'people':
                geometry = new THREE.CylinderGeometry(1.5, 1.5, 4, 32);
                material = new THREE.MeshStandardMaterial({
                    color: 0x7c4e10,
                    roughness: 0.4, 
                    metalness: 0.2
                });
                mesh = new THREE.Mesh(geometry, material);
                mesh.position.set(position.x, position.y + 1.5, position.z);
                break;
            case 'farm':
                geometry = new THREE.PlaneGeometry(5, 5);
                material = new THREE.MeshStandardMaterial({
                    color: 0xffd522,
                    roughness: 0.4, 
                    metalness: 0.2
                });
                mesh = new THREE.Mesh(geometry, material);
                mesh.rotation.x = -Math.PI / 2;
                mesh.position.set(position.x, position.y + 0.5, position.z);
                break;
            case 'power':
                geometry = new THREE.BoxGeometry(3, 3, 3);
                material = new THREE.MeshStandardMaterial({
                    color: 0x00f1ff,
                    roughness: 0.4, 
                    metalness: 0.2 
                });
                mesh = new THREE.Mesh(geometry, material);
                mesh.position.set(position.x, position.y + 1.5, position.z);
                break;
            default:
                // Default tree. For now. This whole thing is gonna go
                geometry = new THREE.ConeGeometry(2, 4, 4); // Pyramid shape
                material = new THREE.MeshStandardMaterial({
                    color: 0x1b9416,
                    roughness: 0.4, 
                    metalness: 0.2 
                });
                mesh = new THREE.Mesh(geometry, material);
                mesh.position.set(position.x, position.y + 1.5, position.z);
                break;
        }

        return mesh;
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

    public moveCamera(deltaX: number, deltaY: number): void {
        // Rotate the camera based on mouse movement
        this.camera.rotation.y += deltaX * 0.005;
        this.camera.rotation.x += deltaY * 0.005;

        // Limit the vertical rotation to prevent flipping
        this.camera.rotation.x = Math.max(
            Math.min(this.camera.rotation.x, Math.PI / 2),
            -Math.PI / 2
        );

        this.render(); // Update the rendering
    }

    public getCanvas(): HTMLCanvasElement {
        return this.renderer.domElement;
    }

    public getMeshes(): THREE.Mesh[][] {
        return this.tileMeshes;
    }

    // Render the three.js scene
    public render(): void {
        this.controls.update(); // Update the orbit controls
        this.renderer.render(this.scene, this.camera);
    }

    // Handle window resizing
    public onResize(width: number, height: number): void {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
}
