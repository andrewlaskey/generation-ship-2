import * as THREE from 'three';
import { ThreeTileHandlerRegistry } from './ThreeTileHandlerRegistry';
import { ThreeInstanceManager } from './ThreeInstanceManager';
import { ThreeTextureLibrary } from './ThreeTextureLibrary';
import { ThreeModelLibrary } from './ThreeModelLibrary';
import { ThreeDayNightCycle } from './ThreeDayNightCycle';
import { GameManager } from '../GameManager';

export class ThreeWorldManager {
  public containerEl: HTMLDivElement;

  private gameManager: GameManager;

  private scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;

  private sunArc = new THREE.Group();

  private tileHandlerRegistry: ThreeTileHandlerRegistry;
  private instanceManager: ThreeInstanceManager;
  private modelLibrary: ThreeModelLibrary;
  private textureLibrary: ThreeTextureLibrary;
  // private dayNightController: ThreeDayNightCycle | null;

  private pitch = 0;
  private yaw = 0;
  private tileSize = 8;
  private cameraHeight = 1.2;
  private gridSize;
  private worldSize;
  private outerWorldSize;

  constructor(
    containerEl: HTMLDivElement,
    modelLibrary: ThreeModelLibrary,
    textureLibrary: ThreeTextureLibrary,
    gameManager: GameManager
  ) {
    this.containerEl = containerEl;

    this.gameManager = gameManager;
    this.gridSize = this.gameManager.gameBoard.size;
    this.worldSize = this.gridSize * this.tileSize;
    this.outerWorldSize = this.worldSize * Math.SQRT2;

    this.instanceManager = new ThreeInstanceManager();
    this.tileHandlerRegistry = new ThreeTileHandlerRegistry(this.tileSize, this.instanceManager);
    this.modelLibrary = modelLibrary;
    this.textureLibrary = textureLibrary;
    // this.dayNightController = null;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      60,
      this.containerEl.clientWidth / this.containerEl.clientHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.containerEl.clientWidth, this.containerEl.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.camera.position.set(0, this.cameraHeight, 5);
  }

  init(): void {
    this.createWorld();

    console.log(this.containerEl);
    this.containerEl.appendChild(this.renderer.domElement);
  }

  render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  onResize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  createWorld(): void {
    this.createBaseScene();
    this.createWorldPlane();
    this.createWorldBorderRing();
    this.createSunArc();
    this.updateGrid();
  }

  createBaseScene(): void {
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.25);
    this.scene.add(ambientLight);

    const fog = new THREE.Fog(0xffa07a, 10, 100); // Light haze
    this.scene.fog = fog;

    this.scene.background = this.textureLibrary.skybox;
  }

  createWorldPlane(): void {
    const geometry = new THREE.PlaneGeometry(this.outerWorldSize, this.outerWorldSize, 10, 10);
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
  }

  createWorldBorderRing(): void {
    const worldRing = this.modelLibrary.get('WorldRing.glb');

    if (worldRing) {
      worldRing?.position.set(0, -1, 0);
      worldRing.scale.set(this.outerWorldSize, this.outerWorldSize, this.outerWorldSize);

      const ringMaterial = new THREE.MeshStandardMaterial({
        color: 0xccd0db,
        roughness: 0.8,
        metalness: 0.2,
      });

      worldRing.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.material = ringMaterial;
          child.receiveShadow = true;
          child.castShadow = true;
        }
      });

      this.scene.add(worldRing);
    }
  }

  createSunArc(): void {
    // Add the model
    const texture = this.textureLibrary.get('SunArc_map.png');
    const model = this.modelLibrary.get('SunArc.glb');
    const material = new THREE.MeshStandardMaterial({
      color: 0xccd0db,
      roughness: 0.8,
      metalness: 0.2,
      emissive: 0xffe600,
      emissiveMap: texture,
      emissiveIntensity: 1,
    });

    model.position.set(0, 0, 0);
    model.scale.set(this.outerWorldSize, this.outerWorldSize, this.outerWorldSize);

    model.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.material = material;
        child.receiveShadow = true;
        child.castShadow = true;
      }
    });

    this.sunArc.add(model);

    // Add the directional light for the artificial sun
    const sunLight = new THREE.DirectionalLight(0xfbebc4, 1.0);
    sunLight.position.set(-30, 35, 0);
    sunLight.castShadow = true;

    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 200;
    sunLight.shadow.camera.left = -50;
    sunLight.shadow.camera.right = 50;
    sunLight.shadow.camera.top = 50;
    sunLight.shadow.camera.bottom = -50;

    this.sunArc.add(sunLight);

    // if (this.debugOn) {
    //   const sunHelper = new THREE.DirectionalLightHelper(directionalLight);
    //   this.sunArc.add(sunHelper);
    // }
  }

  public moveCamera(
    direction: THREE.Vector3,
    distance: number,
    yawDelta: number,
    pitchDelta: number
  ) {
    // Update yaw and pitch
    this.yaw -= yawDelta;
    this.pitch -= pitchDelta;

    // Clamp pitch to avoid flipping upside down
    this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));

    // Create a quaternion for the rotation
    const quaternion = new THREE.Quaternion();
    quaternion.setFromEuler(new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ')); // "YXZ" ensures proper yaw-pitch order

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

    // Calculate the new position while locking the y-position
    const newPosition = this.camera.position.clone();
    newPosition.addScaledVector(combinedDirection, distance);
    newPosition.y = this.cameraHeight; // Lock y-position

    // Check that the new position is within bounds
    const outerWorldSizeRadius = this.outerWorldSize * 0.5;
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
  }

  updateGrid(): void {
    for (let x = 0; x < this.gridSize; x++) {
      for (let y = 0; y < this.gridSize; y++) {
        const space = this.gameManager.gameBoard.getSpace(x, y);
        const tile = space?.tile;

        const meshX = x * this.tileSize - (this.gridSize * this.tileSize) / 2;
        const meshZ = y * this.tileSize - (this.gridSize * this.tileSize) / 2; // grid plane is on z axis
        const meshPos = new THREE.Vector3(meshX, 0, meshZ);

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
}
