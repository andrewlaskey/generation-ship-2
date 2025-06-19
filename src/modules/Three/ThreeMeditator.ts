import { random } from 'radash';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ThreeTextureLibrary } from './ThreeTextureLibrary';

interface MeditationPoint {
  mesh: THREE.Mesh;
  light: THREE.PointLight;
  position: THREE.Vector3;
  isFound: boolean;
}

interface VectorReference {
  x: number;
  y: number;
  z: number;
}

export default class ThreeMeditator {
  public numLocations = 5;
  public points: MeditationPoint[] = [];
  public minCollisionDistance = 1;

  private tl: gsap.core.Timeline;
  private cameraPosition: VectorReference;
  private worldSize: number;

  constructor(public camera: THREE.PerspectiveCamera) {
    this.tl = gsap.timeline({ repeat: -1 });
    this.cameraPosition = {
      x: this.camera.position.x,
      y: this.camera.position.y,
      z: this.camera.position.z,
    };
    this.worldSize = 0;
  }

  public init(scene: THREE.Scene, worldSize: number, textureLibrary: ThreeTextureLibrary) {
    this.worldSize = worldSize;
    const texture = textureLibrary.get('flare.png');
    const geometry = new THREE.PlaneGeometry(0.5, 0.5);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
    });

    for (let index = 0; index < this.numLocations; index++) {
      const x = random(worldSize * -0.5, worldSize * 0.5);
      const z = random(worldSize * -0.5, worldSize * 0.5);
      const position = new THREE.Vector3(x, 0.5, z);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, 0.5, z);

      const light = new THREE.PointLight(0xfaed87);
      light.position.set(x, 0.5, z);

      this.points.push({ mesh, position, isFound: false, light });

      scene.add(mesh);
      scene.add(light);
    }
  }

  public update(): void {
    for (const point of this.points) {
      point.mesh.lookAt(this.camera.position);
    }
  }

  public checkCollision(position: THREE.Vector3): boolean {
    for (const point of this.points) {
      const distance = point.position.distanceTo(position);

      if (distance <= this.minCollisionDistance && !point.isFound) {
        point.isFound = true;
        return true;
      }
    }

    return false;
  }

  public startMeditating(
    scene: THREE.Scene,
    position: THREE.Vector3,
    sunPosition?: THREE.Vector3
  ): void {
    for (const point of this.points) {
      if (point.isFound) {
        scene.remove(point.mesh);
        scene.remove(point.light);
      }
    }

    this.tl.clear();

    this.tl.set(this.cameraPosition, {
      x: gsap.utils.clamp(this.worldSize * -0.5, this.worldSize * 0.5, position.x),
      y: 20,
      z: gsap.utils.clamp(this.worldSize * -0.5, this.worldSize * 0.5, position.z),
      onComplete: () => {
        this.camera.position.set(
          this.cameraPosition.x,
          this.cameraPosition.y,
          this.cameraPosition.z
        );
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
      },
    });

    this.tl.to(this.cameraPosition, {
      x: gsap.utils.clamp(this.worldSize * -0.5, this.worldSize * 0.5, position.x + 50),
      duration: 20,
      ease: 'none',
      onUpdate: () => {
        this.camera.position.copy(this.cameraPosition);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
      },
    });

    this.tl.set(this.cameraPosition, {
      x: gsap.utils.clamp(this.worldSize * -0.5, this.worldSize * 0.5, position.x - 10),
      y: 1,
      z: gsap.utils.clamp(this.worldSize * -0.5, this.worldSize * 0.5, position.z - 10),
      onComplete: () => {
        this.camera.position.set(
          this.cameraPosition.x,
          this.cameraPosition.y,
          this.cameraPosition.z
        );

        if (sunPosition) {
          this.camera.lookAt(new THREE.Vector3(sunPosition.x, 2, sunPosition.z));
        } else {
          this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        }
      },
    });

    this.tl.to(this.cameraPosition, {
      x: gsap.utils.clamp(this.worldSize * -0.5, this.worldSize * 0.5, position.x + 20),
      z: gsap.utils.clamp(this.worldSize * -0.5, this.worldSize * 0.5, position.z + 20),
      duration: 20,
      ease: 'none',
      onUpdate: () => {
        this.camera.position.copy(this.cameraPosition);
        if (sunPosition) {
          this.camera.lookAt(new THREE.Vector3(sunPosition.x, 2, sunPosition.z));
        }
      },
    });

    this.tl.set(this.cameraPosition, {
      x: gsap.utils.clamp(this.worldSize * -0.5, this.worldSize * 0.5, position.x + 30),
      y: 12,
      z: gsap.utils.clamp(this.worldSize * -0.5, this.worldSize * 0.5, position.z + 30),
      onComplete: () => {
        this.camera.position.set(
          this.cameraPosition.x,
          this.cameraPosition.y,
          this.cameraPosition.z
        );
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
      },
    });

    this.tl.to(this.cameraPosition, {
      x: gsap.utils.clamp(this.worldSize * -0.5, this.worldSize * 0.5, position.x - 30),
      y: 18,
      z: gsap.utils.clamp(this.worldSize * -0.5, this.worldSize * 0.5, position.z - 30),
      duration: 20,
      ease: 'none',
      onUpdate: () => {
        this.camera.position.copy(this.cameraPosition);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
      },
    });
  }

  public stopMeditating(): void {
    this.tl.clear();
  }
}
