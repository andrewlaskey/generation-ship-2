import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { ThreeInstanceManager } from './ThreeInstanceManager';

describe('ThreeInstanceManager.ts', () => {
  let manager: ThreeInstanceManager;

  beforeEach(() => {
    manager = new ThreeInstanceManager();
  });

  it('should add a new instance element to collection', () => {
    const geo = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial();

    manager.addInstanceKind('test', geo, material);

    const actual = manager.getInstanceCollection();

    expect(actual.size).toBe(1);
    expect(actual.has('test')).toBe(true);
    expect(actual.get('test')?.count).toBe(0);
  });

  it("should update the instance element's count", () => {
    const geo = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial();

    manager.addInstanceKind('test', geo, material);
    manager.incrementInstanceCount('test', 4);

    const actual = manager.getInstanceCollection();

    expect(actual.get('test')?.count).toBe(4);
  });

  it('adding already existing kind should not overwrite', () => {
    const geo = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial();

    manager.addInstanceKind('test', geo, material);
    manager.incrementInstanceCount('test', 4);
    manager.addInstanceKind('test', geo, material);

    const actual = manager.getInstanceCollection();

    expect(actual.get('test')?.count).toBe(4);
  });

  it('should add InstancedMeshes to the scene', () => {
    const geo = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial();
    const scene = new THREE.Scene();
    const addSpy = vi.spyOn(scene, 'add');

    manager.addInstanceKind('test', geo, material);
    manager.incrementInstanceCount('test', 4);
    manager.updateScene(scene);

    expect(addSpy).toHaveBeenCalledOnce();
  });

  it('should add a matrix to an instance group', () => {
    const geo = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial();
    const dummy = new THREE.Object3D();
    dummy.rotateX(Math.PI * 2);
    dummy.updateMatrix();

    manager.addInstanceKind('test', geo, material);
    manager.addInstance('test', dummy.matrix);

    const collection = manager.getInstanceCollection();
    const actual = collection.get('test');

    const expectedMatrix = new THREE.Matrix4();
    expectedMatrix.makeRotationX(Math.PI * 2);

    expect(actual?.matrices.length).toBe(1);
    expect(actual?.count).toBe(1);
    expect(actual?.matrices[0].elements).toEqual(expectedMatrix.elements);
  });

  it('should add InstancedMeshes with matrices applied to the scene', () => {
    const geo = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial();
    const scene = new THREE.Scene();
    const dummy = new THREE.Object3D();
    const newPosition = new THREE.Vector3(1, 0, 0);
    dummy.position.set(newPosition.x, newPosition.y, newPosition.z);
    dummy.updateMatrix();

    const addSpy = vi.spyOn(scene, 'add');

    manager.addInstanceKind('test', geo, material);
    manager.addInstance('test', dummy.matrix);
    manager.updateScene(scene);

    const collection = manager.getInstanceCollection();
    const element = collection.get('test');
    const actualMatrix = new THREE.Matrix4();
    element?.instancedMesh?.getMatrixAt(0, actualMatrix);

    const expectedMatrix = new THREE.Matrix4();
    expectedMatrix.setPosition(newPosition);

    expect(addSpy).toHaveBeenCalledOnce();
    expect(actualMatrix.elements).toEqual(expectedMatrix.elements);
  });
});
