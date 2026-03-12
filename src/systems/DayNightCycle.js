import * as THREE from 'three';

export class DayNightCycle {
    constructor(scene, sunLight, skyMaterial) {
        this.scene = scene;
        this.sunLight = sunLight;
        this.skyMaterial = skyMaterial;
        
        // Time: 0-1 where 0.25=sunrise, 0.5=noon, 0.75=sunset, 0=midnight
        this.timeOfDay = 0.4; // Start at late morning
        this.speed = 0.008; // Full cycle speed (adjustable)
        this.paused = false;
        
        // Sun path
        this.sunDistance = 80;
        
        // Color presets
        this.presets = {
            dawn:     { sky: [0xFFAA77, 0xFFDDCC], sun: 0xFFAA66, sunIntensity: 0.8, ambient: 0.25, fog: 0xDDBB99 },
            morning:  { sky: [0x5599DD, 0xAADDFF], sun: 0xFFEECC, sunIntensity: 1.0, ambient: 0.3, fog: 0xBBDDEE },
            noon:     { sky: [0x4488CC, 0xCCDDEE], sun: 0xFFFFEE, sunIntensity: 1.3, ambient: 0.35, fog: 0xCCDDEE },
            afternoon:{ sky: [0x5588BB, 0xDDCCBB], sun: 0xFFDD99, sunIntensity: 1.1, ambient: 0.3, fog: 0xCCCCBB },
            sunset:   { sky: [0xDD6644, 0xFFBB88], sun: 0xFF8844, sunIntensity: 0.7, ambient: 0.2, fog: 0xDDAA77 },
            dusk:     { sky: [0x443366, 0x886688], sun: 0x665577, sunIntensity: 0.3, ambient: 0.15, fog: 0x776688 },
            night:    { sky: [0x111133, 0x222244], sun: 0x334466, sunIntensity: 0.1, ambient: 0.08, fog: 0x222244 },
            predawn:  { sky: [0x332244, 0x664466], sun: 0x554455, sunIntensity: 0.2, ambient: 0.1, fog: 0x443355 }
        };

        this.currentColors = {
            skyTop: new THREE.Color(),
            skyBottom: new THREE.Color(),
            sun: new THREE.Color(),
            fog: new THREE.Color()
        };
    }

    getPresetAt(t) {
        // t: 0-1, returns interpolated preset
        const phases = [
            { t: 0.0, preset: 'night' },
            { t: 0.2, preset: 'predawn' },
            { t: 0.25, preset: 'dawn' },
            { t: 0.3, preset: 'morning' },
            { t: 0.45, preset: 'noon' },
            { t: 0.6, preset: 'afternoon' },
            { t: 0.72, preset: 'sunset' },
            { t: 0.8, preset: 'dusk' },
            { t: 0.85, preset: 'night' },
            { t: 1.0, preset: 'night' }
        ];

        let from = phases[0], to = phases[1];
        for (let i = 0; i < phases.length - 1; i++) {
            if (t >= phases[i].t && t <= phases[i + 1].t) {
                from = phases[i];
                to = phases[i + 1];
                break;
            }
        }

        const range = to.t - from.t;
        const alpha = range > 0 ? (t - from.t) / range : 0;

        const a = this.presets[from.preset];
        const b = this.presets[to.preset];

        return {
            skyTop: new THREE.Color(a.sky[0]).lerp(new THREE.Color(b.sky[0]), alpha),
            skyBottom: new THREE.Color(a.sky[1]).lerp(new THREE.Color(b.sky[1]), alpha),
            sun: new THREE.Color(a.sun).lerp(new THREE.Color(b.sun), alpha),
            sunIntensity: a.sunIntensity + (b.sunIntensity - a.sunIntensity) * alpha,
            ambient: a.ambient + (b.ambient - a.ambient) * alpha,
            fog: new THREE.Color(a.fog).lerp(new THREE.Color(b.fog), alpha)
        };
    }

    update(delta) {
        if (this.paused) return;

        this.timeOfDay += this.speed * delta;
        if (this.timeOfDay >= 1.0) this.timeOfDay -= 1.0;

        const preset = this.getPresetAt(this.timeOfDay);

        // Sun position on arc
        const sunAngle = (this.timeOfDay - 0.25) * Math.PI * 2;
        this.sunLight.position.set(
            Math.cos(sunAngle * 0.5) * this.sunDistance,
            Math.sin(sunAngle) * this.sunDistance + 10,
            30
        );
        this.sunLight.color.copy(preset.sun);
        this.sunLight.intensity = preset.sunIntensity;

        // Sky
        if (this.skyMaterial && this.skyMaterial.uniforms) {
            this.skyMaterial.uniforms.topColor.value.copy(preset.skyTop);
            this.skyMaterial.uniforms.bottomColor.value.copy(preset.skyBottom);
        }

        // Fog
        if (this.scene.fog) {
            this.scene.fog.color.copy(preset.fog);
        }
        this.scene.background = preset.fog;

        // Store for external use
        this.currentColors.skyTop.copy(preset.skyTop);
        this.currentColors.skyBottom.copy(preset.skyBottom);
        this.currentColors.sun.copy(preset.sun);
        this.currentColors.fog.copy(preset.fog);
    }
}
