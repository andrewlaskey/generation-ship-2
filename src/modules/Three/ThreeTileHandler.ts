import * as THREE from 'three';
import { draw } from 'radash';
import { ThreeModelLibrary } from './ThreeModelLibrary';
import { Tile, TileState } from '../Tile';
import { ThreeInstanceManager } from './ThreeInstanceManager';
import { ThreeTextureLibrary } from './ThreeTextureLibrary';

export interface ThreeTileHandler {
  updateScene(
    scene: THREE.Scene,
    position: THREE.Vector3,
    library: ThreeModelLibrary,
    textures: ThreeTextureLibrary,
    tile: Tile
  ): void;
}

export class ThreePowerTileHandler implements ThreeTileHandler {
  private tileSize: number;
  private manager: ThreeInstanceManager;

  constructor(tileSize: number, manager: ThreeInstanceManager) {
    this.tileSize = tileSize;
    this.manager = manager;
  }

  updateScene(
    _scene: THREE.Scene,
    position: THREE.Vector3,
    library: ThreeModelLibrary,
    textures: ThreeTextureLibrary,
    tile: Tile
  ): void {
    try {
      let fileName = 'Power_3.glb';
      const obj = library.get(fileName);
      const texture = textures.get('Power3.png');
      const emissiveMapTexture = textures.get('Power3_map.png');

      let material = new THREE.MeshStandardMaterial({
        map: texture,
        emissive: 0x32dfe4,
        emissiveMap: emissiveMapTexture,
        emissiveIntensity: 1,
      });

      if (tile.state === TileState.Dead) {
        fileName += `-${TileState.Dead}`;
        material = new THREE.MeshStandardMaterial({
          color: 0x1e2023,
        });
      }

      material.needsUpdate = true;

      const tileMid = this.tileSize * 0.5;
      let geometry;

      obj.traverse(child => {
        if (child instanceof THREE.Mesh) {
          geometry = child.geometry; // Get the geometry from the first mesh
        }
      });

      if (geometry) {
        this.manager.addInstanceKind(fileName, geometry, material);

        const dummy = new THREE.Object3D();
        dummy.position.set(position.x + tileMid, position.y, position.z + tileMid);
        dummy.updateMatrix();

        this.manager.addInstance(fileName, dummy.matrix);
      }

      // TODO: need to clone lights I think
      // Add a light
      // const light = new THREE.SpotLight(0xadd8e6, 20); // Light blue color
      // light.angle = THREE.MathUtils.degToRad(30);
      // light.position.set(position.x + tileMid, position.y + 8, position.z + tileMid); // Place in the room
      // light.target.position.set(position.x + tileMid, position.y, position.z + tileMid);
      // light.castShadow = true; // Enable shadows

      // scene.add(light);
    } catch (e) {
      console.error('Failed to load power tile', e);
      throw e;
    }
  }
}

export class ThreeFarmTileHandler implements ThreeTileHandler {
  private tileSize: number;
  private manager: ThreeInstanceManager;

  constructor(tileSize: number, manager: ThreeInstanceManager) {
    this.tileSize = tileSize;
    this.manager = manager;
  }

  updateScene(
    _scene: THREE.Scene,
    position: THREE.Vector3,
    library: ThreeModelLibrary,
    _textures: ThreeTextureLibrary,
    tile: Tile
  ): void {
    try {
      const fileName = 'Farm.glb';

      // Geometry and Material
      const obj = library.get(fileName);
      const material = new THREE.MeshStandardMaterial({
        color: 0xffd522,
        roughness: 0.9,
        metalness: 0.0,
      });
      let geometry;

      obj.traverse(child => {
        if (child instanceof THREE.Mesh) {
          geometry = child.geometry; // Get the geometry from the first mesh
        }
      });

      if (geometry) {
        this.manager.addInstanceKind(fileName, geometry, material);

        // Placement position helpers
        const tileMid = this.tileSize * 0.5;
        const midPosition = new THREE.Vector3(
          position.x + tileMid,
          position.y,
          position.z + tileMid
        );

        // Instancing
        let farmInstanceCount = 1;

        if (tile.level === 2) {
          farmInstanceCount = 3;
        } else if (tile.level === 3) {
          farmInstanceCount = 5;
        }

        const farmPositions: THREE.Vector3[] = [
          new THREE.Vector3(midPosition.x, midPosition.y, midPosition.z + 2.5),
          new THREE.Vector3(midPosition.x, midPosition.y, midPosition.z - 2.5),
          new THREE.Vector3(midPosition.x + 2.5, midPosition.y, midPosition.z),
          new THREE.Vector3(midPosition.x - 2.5, midPosition.y, midPosition.z),
          midPosition,
        ];

        for (let i = 0; i < farmInstanceCount; i++) {
          const dummy = new THREE.Object3D();
          dummy.position.set(farmPositions[i].x, farmPositions[i].y, farmPositions[i].z);
          dummy.rotateY(Math.random() * Math.PI * 2);
          dummy.updateMatrix();

          this.manager.addInstance(fileName, dummy.matrix);
        }
      }
    } catch (e) {
      console.error('Failed to load farm tile', e);
      throw e;
    }
  }
}

export class ThreeTreeTileHandler implements ThreeTileHandler {
  private tileSize: number;
  private manager: ThreeInstanceManager;

  constructor(tileSize: number, manager: ThreeInstanceManager) {
    this.tileSize = tileSize;
    this.manager = manager;
  }

  updateScene(
    _scene: THREE.Scene,
    position: THREE.Vector3,
    library: ThreeModelLibrary,
    textures: ThreeTextureLibrary,
    tile: Tile
  ): void {
    try {
      type ModelMapObj = {
        name: string;
        model: THREE.Object3D;
        geometry: THREE.BufferGeometry | null;
        count: number;
        material: THREE.Material;
      };
      const tree1FileName = 'Tree1.glb';
      const tree2FileName = 'Tree2.glb';
      const tree3FileName = 'Tree3.glb';
      const tree1 = library.get(tree1FileName);
      const tree2 = library.get(tree2FileName);
      const tree3 = library.get(tree3FileName);
      const tree1Texture = textures.get('tree1.png');
      const tree2Texture = textures.get('Tree2-alt.png');
      const tree3Texture = textures.get('Tree3-alt.png');

      const treeMap: ModelMapObj[] = [
        {
          name: tree1FileName,
          model: tree1,
          geometry: null,
          count: 0,
          material: new THREE.MeshStandardMaterial({
            map: tree1Texture,
          }),
        },
        {
          name: tree2FileName,
          model: tree2,
          geometry: null,
          count: 0,
          material: new THREE.MeshStandardMaterial({
            map: tree2Texture,
          }),
        },
        {
          name: tree3FileName,
          model: tree3,
          geometry: null,
          count: 0,
          material: new THREE.MeshStandardMaterial({
            map: tree3Texture,
          }),
        },
      ];

      treeMap.forEach(obj => {
        obj.model.traverse(child => {
          if (child instanceof THREE.Mesh) {
            obj.geometry = child.geometry;
          }
        });
      });

      let totalTreeCount = 1;

      if (tile.level === 2) {
        totalTreeCount = 3;
      } else if (tile.level === 3) {
        totalTreeCount = 5;
      }

      for (let i = 0; i < totalTreeCount; i++) {
        const randomTreeSelect = draw(treeMap);

        if (randomTreeSelect) {
          randomTreeSelect.count++;
        }
      }

      treeMap.forEach(treeType => {
        if (treeType.geometry) {
          this.manager.addInstanceKind(treeType.name, treeType.geometry, treeType.material);

          for (let i = 0; i < treeType.count; i++) {
            const dummy = this.addTree(position, tile.level);
            this.manager.addInstance(treeType.name, dummy.matrix);
          }
        }
      });
    } catch (e) {
      console.error('Failed to load tree tile', e);
      throw e;
    }
  }

  private addTree(position: THREE.Vector3, level: number): THREE.Object3D {
    const dummy = new THREE.Object3D();
    const placementPadding = 1;

    const minX = position.x + placementPadding;
    const maxX = position.x + this.tileSize - placementPadding;
    const minZ = position.z + placementPadding;
    const maxZ = position.z + this.tileSize - placementPadding;
    const newX = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
    const newZ = Math.floor(Math.random() * (maxZ - minZ + 1)) + minZ;

    dummy.position.set(newX, position.y, newZ);

    dummy.rotateY(Math.random() * Math.PI * 2);

    let minScale;
    let maxScale;

    if (level === 2) {
      minScale = 0.8;
      maxScale = 1.5;
    } else if (level === 3) {
      minScale = 1;
      maxScale = 2.2;
    } else {
      minScale = 0.6;
      maxScale = 1;
    }

    const randomScale = Math.floor(Math.random() * (maxScale - minScale + 1)) + minScale;
    dummy.scale.set(randomScale, randomScale, randomScale);

    dummy.updateMatrix();

    return dummy;
  }
}

export class ThreePeopleTileHandler implements ThreeTileHandler {
  private tileSize: number;
  private manager: ThreeInstanceManager;

  constructor(tileSize: number, manager: ThreeInstanceManager) {
    this.tileSize = tileSize;
    this.manager = manager;
  }

  updateScene(
    _scene: THREE.Scene,
    position: THREE.Vector3,
    library: ThreeModelLibrary,
    textures: ThreeTextureLibrary,
    tile: Tile
  ): void {
    try {
      let fileName = 'Smallhouse.glb';
      let textureFileName = 'SmallHouse2.png';
      let emissiveTexFileName = 'SmallHouse_emissive.png';

      if (tile.level === 2) {
        fileName = 'Midhouse.glb';
        textureFileName = 'MidHouse.png';
        emissiveTexFileName = 'MidHouse_emissive.png';
      } else if (tile.level === 3) {
        fileName = 'Bighouse.glb';
        textureFileName = 'BigHouse.png';
        emissiveTexFileName = 'BigHouse_emissive.png';
      }

      const tileMid = this.tileSize * 0.5;

      const obj = library.get(fileName);
      const texture = textures.get(textureFileName);
      const emissiveMapTexture = textures.get(emissiveTexFileName);

      const material = new THREE.MeshStandardMaterial({
        // roughness: 0.8,
        // metalness: 0.0,
        // flatShading: true,
        map: texture,
        emissiveMap: emissiveMapTexture,
        emissiveIntensity: 0,
        emissive: new THREE.Color(0xffbb00),
      });
      material.needsUpdate = true;

      let geometry;

      obj.traverse(child => {
        if (child instanceof THREE.Mesh) {
          geometry = child.geometry; // Get the geometry from the first mesh
        }
      });

      if (geometry) {
        this.manager.addInstanceKind(fileName, geometry, material);

        const dummy = new THREE.Object3D();

        const placePosition = new THREE.Vector3(
          position.x + tileMid,
          position.y,
          position.z + tileMid
        );
        dummy.position.set(placePosition.x, placePosition.y, placePosition.z);
        dummy.rotateY(THREE.MathUtils.degToRad(Math.floor(Math.random() * 6) * 60));

        dummy.updateMatrix();

        this.manager.addInstance(fileName, dummy.matrix);
      }
    } catch (e) {
      console.error('Failed to load people tile', e);
    }
  }
}

export class ThreeWasteTileHandler implements ThreeTileHandler {
  private tileSize: number;
  private manager: ThreeInstanceManager;

  constructor(tileSize: number, manager: ThreeInstanceManager) {
    this.tileSize = tileSize;
    this.manager = manager;
  }

  updateScene(
    _scene: THREE.Scene,
    position: THREE.Vector3,
    library: ThreeModelLibrary,
    _textures: ThreeTextureLibrary,
    _tile: Tile
  ): void {
    try {
      const rock1FileName = 'Rock.obj';
      const rock2FileName = 'Rock 2.obj';
      const wallFileName = 'Broken wall.obj';
      const rock1 = library.get(rock1FileName);
      const rock2 = library.get(rock2FileName);
      const wall = library.get(wallFileName);

      this.addTrash(rock1FileName, position, rock1);
      this.addTrash(rock2FileName, position, rock2);
      this.addTrash(wallFileName, position, wall);
    } catch (e) {
      console.error('Failed to load people tile', e);
    }
  }

  private addTrash(name: string, position: THREE.Vector3, obj: THREE.Object3D) {
    const placementPadding = 1;
    const material = new THREE.MeshStandardMaterial({
      color: 0x4a4645,
      roughness: 0.9,
      metalness: 0.0,
    });

    let geometry;
    obj.traverse(child => {
      if (child instanceof THREE.Mesh) {
        geometry = child.geometry; // Get the geometry from the first mesh
      }
    });

    if (geometry) {
      this.manager.addInstanceKind(name, geometry, material);

      const minX = position.x + placementPadding;
      const maxX = position.x + this.tileSize - placementPadding;
      const minZ = position.z + placementPadding;
      const maxZ = position.z + this.tileSize - placementPadding;
      const newX = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
      const newZ = Math.floor(Math.random() * (maxZ - minZ + 1)) + minZ;

      const dummy = new THREE.Object3D();
      dummy.position.set(newX, position.y - Math.random(), newZ);
      dummy.rotateY(Math.random() * Math.PI * 2);
      dummy.updateMatrix();

      this.manager.addInstance(name, dummy.matrix);
    }
  }
}
