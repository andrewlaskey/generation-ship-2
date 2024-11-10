import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GameManager } from '../modules/GameManager';  // Import the GameManager class
import { Tile } from '../modules/Tile';
import { TileBlock } from '../modules/TileBlock';
import { HandItem } from '../modules/PlayerHand';
import { GameView } from '../types/GameViewInterface';

export class ThreeJSGameView implements GameView {
    private gameManager: GameManager;
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private tileMeshes: THREE.Mesh[][] = [];
    public document: Document;  // Make document public for the controller to access
    private appDiv: HTMLDivElement;
    private gridContainer!: HTMLDivElement;
    private handContainer!: HTMLDivElement;
    private deckCounterContainer!: HTMLDivElement;
    private scoreBoard!: HTMLDivElement;
    private controls: OrbitControls;

    constructor(gameManager: GameManager, document: Document) {
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
        this.camera.position.set(0, 0, 100);

        // Set up orbit controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.target.set(0, 0, 0); // Point the controls at the center of the grid
        this.controls.enableDamping = true; // Optional: adds a smooth effect to the orbiting
        this.controls.dampingFactor = 0.25; // Controls the amount of damping
        this.controls.enableZoom = true; // Allows zooming in and out
        this.controls.autoRotate = false; // If true, the camera will rotate automatically
        this.controls.maxPolarAngle = Math.PI / 2; // Limits the vertical angle

        // Set up basic lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(0, 0, 50);
        this.scene.add(directionalLight);

        const axesHelper = new THREE.AxesHelper(50);
        this.scene.add(axesHelper);


        // Initialize the grid with 3D objects
        this.initializeGrid();
    }

    // Method to initialize the static parts of the UI (buttons, containers, etc.)
    private initializeView(): void {
        this.appDiv.innerHTML = `
            <div id="gridContainer" class="grid three"></div>
            <div id="handContainer" class="hand"></div>
            <div id="deckCounterContainer" class="deck-counter"></div>
            <button id="rotateItem" type="button">Rotate</button>
            <div id="scoreboard" class="scoreboard"></div>
        `;

        // Cache the containers for dynamic updates
        this.gridContainer = this.document.querySelector<HTMLDivElement>('#gridContainer')!;
        this.handContainer = this.document.querySelector<HTMLDivElement>('#handContainer')!;
        this.deckCounterContainer = this.document.querySelector<HTMLDivElement>('#deckCounterContainer')!;
        this.scoreBoard = this.document.querySelector<HTMLDivElement>('#scoreboard')!;
    }

    // Method to create the HTML representation of the player's hand
    private renderHand(): string {
        const handItems: HandItem[] = this.gameManager.getPlayerHand();
        const selectedIndex = this.gameManager.getSelectedItemIndex();
        let handHtml = '<h2>Player Hand</h2>';

        if (handItems.length === 0) {
            handHtml += '<p>No items in hand</p>';
        } else {
            handHtml += '<div class="hand-grid">';  // Add a container for the hand items
            handItems.forEach((item, index) => {
                if (item instanceof TileBlock) {
                    const selectedClass = index === selectedIndex ? 'selected' : '';
                    handHtml += `<div class="hand-item ${selectedClass}" data-index="${index}">`;  // Wrap each hand item
                    const layout = item.getLayout();  // Assuming TileBlock has a getLayout() method
                    
                    // Render each tile in the TileBlock
                    layout.forEach(row => {
                        handHtml += '<div class="hand-row">';
                        row.forEach(tile => {
                            const tileType = tile ? tile.type : 'empty';
                            const tileLevel = tile ? tile.level : 0;
                            const tileState = tile ? tile.state : 'neutral';
                            
                            handHtml += `<div class="cell ${tileType} ${tileState} l${tileLevel}"></div>`;
                        });
                        handHtml += '</div>';  // End of row
                    });

                    handHtml += '</div>';  // End of hand-item
                }
            });
            handHtml += '</div>';  // End of hand-grid
        }

        return handHtml;
    }


    // Method to display the total number of items left in the deck
    private renderDeckCounter(): string {
        const deckCount = this.gameManager.getDeckItemCount();
        return `<h2>Deck Size</h2><p>${deckCount} items left</p>`;
    }

    private renderScoreBoard(): string {
        const ecoScore = `<div class="score">🌲 ${this.gameManager.getPlayerScore('ecology')}</div>`;
        const popScore = `<div class="score">👤 ${this.gameManager.getPlayerScore('population')}</div>`;
        return ecoScore + popScore;
    }

    // Initialize the grid of 3D objects
    private initializeGrid(): void {
        const gameSize = this.gameManager.gameBoard.size;
        const tileSize = 5;  // Size of each tile

        for (let x = 0; x < gameSize; x++) {
            this.tileMeshes[x] = [];
            for (let y = 0; y < gameSize; y++) {
                const space = this.gameManager.gameBoard.getSpace(x, y);
                const tile = space ? space.tile : undefined;

                const mesh = this.createTileMesh(tile);
                mesh.position.set(x * tileSize - (gameSize * tileSize) / 2, y * tileSize - (gameSize * tileSize) / 2, 0);
                this.scene.add(mesh);
                this.tileMeshes[x][y] = mesh;
            }
        }

        // Render the scene initially
        this.render();
    }

    // Create a mesh for a tile based on its type
    private createTileMesh(tile: Tile | null | undefined): THREE.Mesh {
        let geometry: THREE.BufferGeometry;
        let material: THREE.MeshStandardMaterial;

        // Determine the geometry and material based on the tile type
        switch (tile?.type) {
            case 'tree':
                geometry = new THREE.SphereGeometry(2, 32, 32);
                material = new THREE.MeshStandardMaterial({ color: 0x00ff00, wireframe: true }); // Green for trees
                break;
            case 'people':
                geometry = new THREE.CylinderGeometry(1.5, 1.5, 4, 32);
                material = new THREE.MeshStandardMaterial({ color: 0xd2b48c, wireframe: true }); // Adobe color for people
                break;
            case 'farm':
                geometry = new THREE.ConeGeometry(2, 4, 4); // Pyramid shape
                material = new THREE.MeshStandardMaterial({ color: 0xffff00, wireframe: true }); // Yellow for farms
                break;
            case 'power':
                geometry = new THREE.BoxGeometry(3, 3, 3);
                material = new THREE.MeshStandardMaterial({ color: 0xff00ff, wireframe: true }); // Magenta for power
                break;
            default:
                geometry = new THREE.PlaneGeometry(5, 5);
                material = new THREE.MeshStandardMaterial({ color: 0x333333, wireframe: true }); // Gray for empty spaces
                break;
        }

        return new THREE.Mesh(geometry, material);
    }

    // Update the grid's appearance based on the current game state
    public updateGrid(): void {
        const gameSize = this.gameManager.gameBoard.size;

        for (let x = 0; x < gameSize; x++) {
            for (let y = 0; y < gameSize; y++) {
                const space = this.gameManager.gameBoard.getSpace(x, y);
                const tile = space ? space.tile : undefined;

                // Update the mesh based on the current tile type and state
                const mesh = this.tileMeshes[x][y];
                this.updateTileMesh(mesh, tile);
            }
        }

        // Re-render the scene after updates
        this.render();
        this.handContainer.innerHTML = this.renderHand();
        this.deckCounterContainer.innerHTML = this.renderDeckCounter();
        this.scoreBoard.innerHTML = this.renderScoreBoard();
    }

    // Update the properties of a tile's mesh
    private updateTileMesh(mesh: THREE.Mesh, tile: Tile | null | undefined): void {
        // Update the color based on tile state
        if (tile) {
            switch (tile.state) {
                case 'healthy':
                    (mesh.material as THREE.MeshStandardMaterial).color.set(0x00ff00);
                    break;
                case 'unhealthy':
                    (mesh.material as THREE.MeshStandardMaterial).color.set(0xff0000);
                    break;
                default:
                    (mesh.material as THREE.MeshStandardMaterial).color.set(0xffffff);
                    break;
            }
        } else {
            (mesh.material as THREE.MeshStandardMaterial).color.set(0x333333); // Default for empty spaces
        }
    }

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
