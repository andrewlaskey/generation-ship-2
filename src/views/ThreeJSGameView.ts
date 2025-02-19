import * as THREE from 'three';
import Stats from 'stats.js';
import { GameManager } from '../modules/GameManager';
import { GameView } from '../types/GameViewInterface';
import { clearElementChildren, insertHtml } from '../utils/htmlUtils';
import { ThreeTileHandlerRegistry } from '../modules/Three/ThreeTileHandlerRegistry';
import { ThreeModelLibrary } from '../modules/Three/ThreeModelLibrary';
import { ThreeInstanceManager } from '../modules/Three/ThreeInstanceManager';
import { ThreeTextureLibrary } from '../modules/Three/ThreeTextureLibrary';
import { gsap } from 'gsap';

export type ThreeJSGameViewOptions = {
    debug?: boolean;
    fpsOn?: boolean;
}
export class ThreeJSGameView implements GameView {
    private gameManager: GameManager;
    private scene: THREE.Scene;
    public camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private tileHandlerRegistry: ThreeTileHandlerRegistry;
    private modelLibrary: ThreeModelLibrary;
    private textureLibrary: ThreeTextureLibrary;
    private instanceManager = new ThreeInstanceManager();
    public document: Document;
    private appDiv: HTMLDivElement;
    private gridContainer!: HTMLDivElement;
    private pitch = 0;
    private yaw = 0;
    private tileSize = 8;
    private debugOn = false;
    private stats = new Stats();
    private sunArc = new THREE.Group();

    constructor(
        gameManager: GameManager,
        document: Document,
        modelLibrary: ThreeModelLibrary,
        textureLibrary: ThreeTextureLibrary,
        options?: ThreeJSGameViewOptions
    ) {
        this.debugOn = options?.debug ?? false;
        this.gameManager = gameManager;
        this.document = document;
        this.appDiv = this.document.querySelector<HTMLDivElement>('#app')!;

        this.initializeView();

        // Initialize the three.js scene
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, this.gridContainer.clientWidth / this.gridContainer.clientHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.gridContainer.clientWidth, this.gridContainer.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.tileHandlerRegistry = new ThreeTileHandlerRegistry(this.tileSize, this.instanceManager);
        this.modelLibrary = modelLibrary;
        this.textureLibrary = textureLibrary;

        this.gridContainer.appendChild(this.renderer.domElement);

        // Set up camera position
        this.camera.position.set(0, 1.6, 5);

        if (this.debugOn) {
            const axesHelper = new THREE.AxesHelper(50);
            this.scene.add(axesHelper);
        }

        if (options?.fpsOn) {
            this.stats.showPanel(0) // 0 = FPS, 1 = ms/frame, 2 = memory
            this.document.body.appendChild(this.stats.dom);
        }

        this.createWorld();

        // Initialize the grid with 3D objects
        this.initializeGrid();

        // Begin animation loop
        this.rotateSunArc();
        this.animate();
    }

    public updateGrid(): void {
        // Does nothing for now. The view is updating automatically with the animation loop and doesn't
        // need to be commanded to update by the controller
    }

    public render(): void {
        this.renderer.render(this.scene, this.camera);
    }

    public animate(): void {
        this.stats.begin();
        this.render();
        this.stats.end();
        requestAnimationFrame(() => {
            this.animate()
        });
    }

    // Method to initialize the static parts of the UI (buttons, containers, etc.)
    private initializeView(): void {
        clearElementChildren(this.appDiv);
        const html = `
<div class="threejs-wrapper">
    <div class="threejs" id="gridContainer"></div>
    <div class="threejs-header">
        <button class="button" id="exit">
            <svg id="icon-arrow_back_ios" viewBox="0 0 24 24">
                <path d="M11.672 3.891l-8.109 8.109 8.109 8.109-1.781 1.781-9.891-9.891 9.891-9.891z"></path>
            </svg>
        </button>
    </div>
    <div class="threejs-footer">
        <div class="threejs-controls">
            <button class="button left" id="left">⏴</button>
            <button class="button forward" id="forward">⏶</button>
            <button class="button backward" id="backward">⏷</button>
            <button class="button right" id="right">⏵</button>
        </div>
        <p>⚠️ Warning! 3D Mode is a work in progress ⚠️</p>
    </div>
</div>`

        insertHtml(html, this.appDiv);

        this.gridContainer = this.appDiv.querySelector<HTMLDivElement>('#gridContainer')!;
    }

    // Initialize the grid of 3D objects
    private initializeGrid(): void {
        const gameSize = this.gameManager.gameBoard.size;

        for (let x = 0; x < gameSize; x++) {
            for (let y = 0; y < gameSize; y++) {
                const space = this.gameManager.gameBoard.getSpace(x, y);
                const tile = space?.tile;

                const meshX = x * this.tileSize - (gameSize * this.tileSize) / 2;
                const meshZ = y * this.tileSize - (gameSize * this.tileSize) / 2; // grid plane is on z axis
                const meshPos = new THREE.Vector3(meshX, 0, meshZ);

                if (this.debugOn) {
                    this.addDebugSphere(this.scene, meshPos);
                }

                if (tile) {
                    const handler = this.tileHandlerRegistry.getHandler(tile.type);

                    if (handler) {
                        handler.updateScene(this.scene, meshPos, this.modelLibrary, this.textureLibrary, tile);
                    }
                }
            }
        }

        this.instanceManager.updateScene(this.scene);
    }

    private createWorld(): void {
        const gameSize = this.gameManager.gameBoard.size;
        const worldSize = gameSize * this.tileSize;
        const outerWorldSize = worldSize * Math.SQRT2;
        // Add directional light
        const directionalLight = new THREE.DirectionalLight(0xebbb73, 1.0);
        directionalLight.position.set(-30, 35, 0);
        directionalLight.castShadow = true;

        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.camera.near = 1;
        directionalLight.shadow.camera.far = 200;
        directionalLight.shadow.camera.left = -50;
        directionalLight.shadow.camera.right = 50;
        directionalLight.shadow.camera.top = 50;
        directionalLight.shadow.camera.bottom = -50;

        this.sunArc.add(directionalLight);

        if (this.debugOn) {
            const sunHelper = new THREE.DirectionalLightHelper(directionalLight);
            this.sunArc.add(sunHelper);
        }

        // Dim ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.25);
        this.scene.add(ambientLight);

        // Add background and fog
        
        // this.scene.background = new THREE.Color(0x000000); // Sunset color
        this.scene.background = this.textureLibrary.skybox;
        this.scene.fog = new THREE.Fog(0xffa07a, 10, 100); // Light haze
        
        // Add world plane
        const geometry = new THREE.PlaneGeometry(outerWorldSize, outerWorldSize, 10, 10);
        const texture = this.textureLibrary.get('grass.png');
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(10, 10); // Adjust for more/less tiling
        
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            color: 0xa5d66e, // Adjust base color for the grass
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.receiveShadow = true;

        mesh.position.set(0, 0, 0);
        mesh.rotation.x = -Math.PI / 2;

        this.scene.add(mesh);

        // Add World Ring
        const worldRing = this.modelLibrary.get('WorldRing.glb');

        if (worldRing) {
            worldRing?.position.set(0, -1, 0);
            worldRing.scale.set(outerWorldSize, outerWorldSize, outerWorldSize);

            const ringMaterial = new THREE.MeshStandardMaterial({
                color: 0xccd0db,
                roughness: 0.8, 
                metalness: 0.2,
            });

            worldRing.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.material = ringMaterial;
                    child.receiveShadow = true;
                    child.castShadow = true;
                }
            });
            
            this.scene.add(worldRing);
        }

        // Add SunArc
        this.addSunArc(outerWorldSize);

        this.scene.add(this.sunArc);
    }

    private addSunArc(outerWorldSize: number): void {
        const texture = this.textureLibrary.get('SunArc_map.png');
        const material = new THREE.MeshStandardMaterial({
            color: 0xccd0db,
            roughness: 0.8, 
            metalness: 0.2,
            emissive: 0xffe600,
            emissiveMap: texture,
            emissiveIntensity: 1
        });
        const model = this.modelLibrary.get('SunArc.glb');

        model.position.set(0, 0, 0);
        model.scale.set(outerWorldSize, outerWorldSize, outerWorldSize);

        model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.material = material;
                child.receiveShadow = true;
                child.castShadow = true;
            }
        });

        this.sunArc.add(model);
    }

    private rotateSunArc(): void {
        gsap.to(this.sunArc.rotation, {
            x: Math.PI * 2, // Rotate 360 degrees
            duration: 60 * 5,
            ease: "none",
            repeat: -1,
        });
    }

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

        // Check that the new position is within bounds
        const gameSize = this.gameManager.gameBoard.size;
        const worldSize = gameSize * this.tileSize;
        const outerWorldSize = worldSize * Math.SQRT2;
        const outerWorldSizeRadius = outerWorldSize * 0.5;
        const centerPoint = new THREE.Vector3();

        if (centerPoint.distanceTo(newPosition) > outerWorldSizeRadius) {
            // Calculate direction vector from center to new position
            const direction = newPosition.clone().sub(centerPoint).normalize();
            
            // Scale the direction vector by the maximum allowed radius
            // This gives us the closest valid position on the circle
            const constrainedPosition = direction.multiplyScalar(outerWorldSizeRadius);
            
            // Update the newPosition to the constrained position
            newPosition.copy(constrainedPosition);
        }

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

    // Handle window resizing
    public onResize(width: number, height: number): void {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    private addDebugSphere(scene: THREE.Scene, pos: THREE.Vector3): void {
        // Create a sphere geometry
        const debugSphereGeometry = new THREE.SphereGeometry(0.2, 16, 16); // Small sphere with 0.2 radius

        // Create a material for the sphere
        const debugSphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red color for visibility

        // Create the sphere mesh
        const debugSphere = new THREE.Mesh(debugSphereGeometry, debugSphereMaterial);

        // Set the position of the sphere (for example, where your light is)
        debugSphere.position.set(pos.x, pos.y, pos.z);

        // Add the debug sphere to the scene
        scene.add(debugSphere);
    }
}
