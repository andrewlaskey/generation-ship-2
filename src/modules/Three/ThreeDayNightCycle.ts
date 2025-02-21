import * as THREE from 'three';
import { gsap } from 'gsap';

export class ThreeDayNightCycle {
    public cycleDurationMinutes = 3;

    constructor(
        private sunArc: THREE.Group, 
        private ambientLight: THREE.AmbientLight,
        private fog: THREE.Fog,
        private sunLight: THREE.DirectionalLight
    ) {

    }

    public start(): void {
        // Note: Currently our scene is starting at noon
        const fullCycleDuration = 60 * this.cycleDurationMinutes;

        this.rotateSunArc(fullCycleDuration);
        this.updateAmbientLight(fullCycleDuration);
        this.updateSun(fullCycleDuration);
    };

    private rotateSunArc(fullCycleDuration: number): void {
        gsap.to(this.sunArc.rotation, {
            x: Math.PI * 2, // Rotate 360 degrees
            duration: fullCycleDuration,
            ease: "none",
            repeat: -1,
        });
    }

    private updateSun(fullCycleDuration: number): void {
        const colorObject = {
            r: 0.98,
            g: 0.92,
            b: 0.76
        };

        const tl = gsap.timeline({
            repeat: -1
        });

        tl.addLabel('afternoon', 0);
        tl.addLabel('sunset', fullCycleDuration * 0.133);
        tl.addLabel('sunrise', fullCycleDuration * 0.75);
        tl.addLabel('morning', fullCycleDuration * 0.875);

        tl.fromTo(colorObject,
            {
                r: 0.96,
                g: 0.76,
                b: 0,
            }, {
                r: 0.96,
                g: 0.55,
                b: 0,
                duration: 5,
                onUpdate: () => {
                    this.sunLight.color.setRGB(colorObject.r, colorObject.g, colorObject.b);
                }
            },
            'afternoon'
        );
        tl.set(this.sunLight, { intensity: 1 }, 'afternoon');

        tl.fromTo(colorObject, {
            r: 0.96,
            g: 0.55,
            b: 0
        }, {
            r: 0.96,
            g: 0.49,
            b: 0,
            duration: 5,
            onUpdate: () => {
                this.sunLight.color.setRGB(colorObject.r, colorObject.g, colorObject.b);
            }
        }, 'sunset')
        tl.fromTo(this.sunLight, {
            intensity: 1
        }, {
            intensity: 0,
            duration: 3
        }, '>1')

        tl.fromTo(this.sunLight, {
            intensity: 0
        }, {
            intensity: 1,
            duration: 5,
        }, 'sunrise-=2');
        tl.fromTo(colorObject, {
            r: 0.96,
            g: 0.49,
            b: 0
        }, {
            r: 0.96,
            g: 0.55,
            b: 0,
            duration: 5,
            onUpdate: () => {
                this.sunLight.color.setRGB(colorObject.r, colorObject.g, colorObject.b);
            }
        }, 'sunrise');
        
        tl.fromTo(colorObject,
            {
                r: 0.96,
                g: 0.55,
                b: 0
            }, {
            r: 0.96,
            g: 0.76,
            b: 0,
            duration: 5,
            onUpdate: () => {
                this.sunLight.color.setRGB(colorObject.r, colorObject.g, colorObject.b);
            }
        }, 'morning');
        tl.set(this.sunLight, { intensity: 1 }, 'morning');
    }

    private updateAmbientLight(fullCycleDuration: number): void {
        const transitionDurationSeconds = 5;
        const colorObject = {
            r: 0.96,
            g: 0.96,
            b: 0.96
        };

        const tl = gsap.timeline({
            repeat: -1,
            defaults: {
                duration: transitionDurationSeconds,
                ease: 'power1.inOut'
            }
        });

        tl.addLabel('afternoon', 0);
        tl.addLabel('sunset', fullCycleDuration * 0.133);
        tl.addLabel('night', fullCycleDuration * 0.25);
        tl.addLabel('sunrise', fullCycleDuration * 0.75);
        tl.addLabel('morning', fullCycleDuration * 0.875);


        tl.fromTo(colorObject,
            { r: 0.96, g: 0.96, b: 0.96},
            {
                r: 0.93,
                g: 0.60,
                b: 0.82,
                onUpdate: () => {
                    this.ambientLight.color.setRGB(colorObject.r, colorObject.g, colorObject.b);
                    this.fog.color.setRGB(colorObject.r, colorObject.g, colorObject.b);
                }
            },
            'afternoon'
        );
        tl.fromTo(colorObject,
            {
                r: 0.93,
                g: 0.60,
                b: 0.82,
            },
            {
                r: 0.93,
                g: 0.27,
                b: 0.08,
                onUpdate: () => {
                    this.ambientLight.color.setRGB(colorObject.r, colorObject.g, colorObject.b);
                    this.fog.color.setRGB(colorObject.r, colorObject.g, colorObject.b);
                }
            },
            'sunset'
        );

        tl.fromTo(colorObject,
            {
                r: 0.93,
                g: 0.27,
                b: 0.08,
            },
            {
                r: 0.07,
                g: 0.09,
                b: 0.36,
                onUpdate: () => {
                    this.ambientLight.color.setRGB(colorObject.r, colorObject.g, colorObject.b);
                    this.fog.color.setRGB(colorObject.r, colorObject.g, colorObject.b);
                }
            },
            'night'
        );

        tl.fromTo(colorObject,
            {
                r: 0.07,
                g: 0.09,
                b: 0.36
            },
            {
                r: 0.96,
                g: 0.62,
                b: 0,
                onUpdate: () => {
                    this.ambientLight.color.setRGB(colorObject.r, colorObject.g, colorObject.b);
                    this.fog.color.setRGB(colorObject.r, colorObject.g, colorObject.b);
                }
            },
            'sunrise'
        );

        tl.fromTo(colorObject,
            {
                r: 0.96,
                g: 0.62,
                b: 0
            },
            {
                r: 0.96,
                g: 0.96,
                b: 0.96,
                onUpdate: () => {
                    this.ambientLight.color.setRGB(colorObject.r, colorObject.g, colorObject.b);
                    this.fog.color.setRGB(colorObject.r, colorObject.g, colorObject.b);
                }
            },
            'morning'
        );
    }
}