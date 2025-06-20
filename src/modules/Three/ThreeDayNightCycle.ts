import * as THREE from 'three';
import { gsap } from 'gsap';
import { ThreeInstanceManager } from './ThreeInstanceManager';

export class ThreeDayNightCycle {
  public cycleDurationMinutes = 5;
  private tl: gsap.core.Timeline;
  private sunArc: THREE.Group | null = null;
  private ambientLight: THREE.AmbientLight | null = null;
  private fog: THREE.Fog | null = null;
  public sunLight: THREE.DirectionalLight | null = null;
  private instanceManager: ThreeInstanceManager | null = null;

  constructor() {
    this.tl = gsap.timeline({ repeat: -1 });
    this.setupTimeline();
  }

  private setupTimeline(): void {
    const fullCycleDuration = 60 * this.cycleDurationMinutes;

    // Define our cycle points as percentages of the full duration
    const cyclePoints = {
      noon: 0, // 0%
      sunset: fullCycleDuration * 0.125, // 12.5%
      night: fullCycleDuration * 0.25, // 25%
      midnight: fullCycleDuration * 0.5, // 50%
      sunrise: fullCycleDuration * 0.75, // 75%
      morning: fullCycleDuration * 0.875, // 87.5%
      // back to noon at 100%
    };

    // Add labels at each cycle point
    Object.entries(cyclePoints).forEach(([label, time]) => {
      this.tl.addLabel(label, time);
    });
  }

  public start(): void {
    const fullCycleDuration = 60 * this.cycleDurationMinutes;

    // Clear existing animations before adding new ones
    this.tl.clear();

    // Reset and setup the timeline labels
    this.setupTimeline();

    // Add all animations
    this.rotateSunArc(fullCycleDuration);
    this.updateAmbientLight();
    this.updateSun();
    this.updateHabitatLights();

    // Start the timeline playing
    this.tl.play(0);
  }

  addSunArc(sunArc: THREE.Group): void {
    this.sunArc = sunArc;
  }

  private rotateSunArc(fullCycleDuration: number): void {
    if (!this.sunArc) return;

    this.tl.to(
      this.sunArc.rotation,
      {
        x: Math.PI * 2, // Rotate 360 degrees
        duration: fullCycleDuration,
        ease: 'none',
      },
      0
    ); // Start at the beginning of the timeline
  }

  addSunLight(light: THREE.DirectionalLight): void {
    this.sunLight = light;
  }

  private updateSun(): void {
    if (!this.sunLight) return;

    const colorObject = {
      r: 255,
      g: 252,
      b: 198,
    };

    const setSunLightColorFromRgb = (): void => {
      if (!this.sunLight) return;

      this.sunLight.color.setRGB(
        this.convertColorVal(colorObject.r),
        this.convertColorVal(colorObject.g),
        this.convertColorVal(colorObject.b)
      );
    };

    // Noon to sunset transition (12.5% of cycle)
    this.tl.to(
      colorObject,
      {
        r: 255,
        g: 229,
        b: 198,
        duration: 60 * this.cycleDurationMinutes * 0.125,
        onUpdate: () => setSunLightColorFromRgb(),
      },
      'noon'
    );
    this.tl.set(this.sunLight, { intensity: 1 }, 'noon');

    // Sunset to night transition (12.5% of cycle)
    this.tl.to(
      colorObject,
      {
        r: 249,
        g: 65,
        b: 68,
        duration: 60 * this.cycleDurationMinutes * 0.125,
        onUpdate: () => setSunLightColorFromRgb(),
      },
      'sunset'
    );

    // Night transition
    this.tl.to(
      this.sunLight,
      {
        intensity: 0,
        duration: 60 * this.cycleDurationMinutes * 0.05, // Fade out quickly as night falls
      },
      'night-=2'
    );

    this.tl.to(
      colorObject,
      {
        r: 128,
        g: 95,
        b: 217,
        duration: 60 * this.cycleDurationMinutes * 0.125,
        onUpdate: () => setSunLightColorFromRgb(),
      },
      'night'
    );

    // Sunrise transition
    this.tl.to(
      this.sunLight,
      {
        intensity: 1,
        duration: 60 * this.cycleDurationMinutes * 0.05, // Fade in as sun rises
      },
      'sunrise-=2'
    );

    this.tl.to(
      colorObject,
      {
        r: 248,
        g: 174,
        b: 21,
        duration: 60 * this.cycleDurationMinutes * 0.125,
        onUpdate: () => setSunLightColorFromRgb(),
      },
      'sunrise'
    );

    // Morning to noon transition
    this.tl.to(
      colorObject,
      {
        r: 255,
        g: 252,
        b: 198,
        duration: 60 * this.cycleDurationMinutes * 0.125,
        onUpdate: () => setSunLightColorFromRgb(),
      },
      'morning'
    );
  }

  addAmbientLight(light: THREE.AmbientLight): void {
    this.ambientLight = light;
  }

  addFog(fog: THREE.Fog): void {
    this.fog = fog;
  }
  private updateAmbientLight(): void {
    const colorObject = {
      r: 255,
      g: 240,
      b: 157,
    };

    const updateColors = () => {
      if (this.ambientLight) {
        this.ambientLight.color.setRGB(
          this.convertColorVal(colorObject.r),
          this.convertColorVal(colorObject.g),
          this.convertColorVal(colorObject.b)
        );
      }

      if (this.fog) {
        this.fog.color.setRGB(
          this.convertColorVal(colorObject.r),
          this.convertColorVal(colorObject.g),
          this.convertColorVal(colorObject.b)
        );
      }
    };

    // Noon to sunset (shift to orange)
    this.tl.to(
      colorObject,
      {
        r: 243,
        g: 64,
        b: 22,
        duration: 60 * this.cycleDurationMinutes * 0.125,
        ease: 'power1.inOut',
        onUpdate: updateColors,
      },
      'noon'
    );

    // Sunset to night (shift to purple)
    this.tl.to(
      colorObject,
      {
        r: 249,
        g: 65,
        b: 68,
        duration: 60 * this.cycleDurationMinutes * 0.125,
        ease: 'power1.inOut',
        onUpdate: updateColors,
      },
      'sunset'
    );

    // Night to midnight (go to deep blue)
    this.tl.to(
      colorObject,
      {
        r: 39,
        g: 19,
        b: 180,
        duration: 60 * this.cycleDurationMinutes * 0.25,
        ease: 'power2.out',
        onUpdate: updateColors,
      },
      'night'
    );
    this.tl.to(
      this.ambientLight,
      {
        intensity: 0.05,
        duration: 60 * this.cycleDurationMinutes * 0.25,
        ease: 'power2.out',
      },
      'night'
    );

    // Midnight to sunrise (to orange)
    this.tl.to(
      colorObject,
      {
        r: 236,
        g: 90,
        b: 21,
        duration: 60 * this.cycleDurationMinutes * 0.25,
        ease: 'expo.in',
        onUpdate: updateColors,
      },
      'midnight'
    );
    this.tl.to(
      this.ambientLight,
      {
        intensity: 0.25,
        duration: 60 * this.cycleDurationMinutes * 0.25,
        ease: 'power2.out',
      },
      'night'
    );

    // Sunrise to morning (back to bright yellow-ish white)
    this.tl.to(
      colorObject,
      {
        r: 255,
        g: 240,
        b: 157,
        duration: 60 * this.cycleDurationMinutes * 0.25,
        ease: 'power1.inOut',
        onUpdate: updateColors,
      },
      'sunrise'
    );
  }

  private convertColorVal(val: number): number {
    // Three uses float values from 0 to 1. I'm used to 0-255.
    return val / 255;
  }

  addInstanceManager(manager: ThreeInstanceManager): void {
    this.instanceManager = manager;
  }

  private updateHabitatLights(): void {
    if (!this.instanceManager) return;

    const collection = this.instanceManager.getInstanceCollection();

    this.tl.call(
      () => {
        collection.forEach((element, key) => {
          if (key.includes('house.glb') && element.material instanceof THREE.MeshStandardMaterial) {
            element.material.emissiveIntensity = 1;
            element.material.needsUpdate = true;
          }
        });
      },
      [],
      'night'
    );

    this.tl.call(
      () => {
        collection.forEach((element, key) => {
          if (key.includes('house.glb') && element.material instanceof THREE.MeshStandardMaterial) {
            element.material.emissiveIntensity = 0;
            element.material.needsUpdate = true;
          }
        });
      },
      [],
      'sunrise'
    );
  }
}
