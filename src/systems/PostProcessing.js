import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// Custom color grading + vignette shader
const ColorGradingShader = {
    uniforms: {
        tDiffuse: { value: null },
        brightness: { value: 0.02 },
        contrast: { value: 1.08 },
        saturation: { value: 1.15 },
        vignetteIntensity: { value: 0.35 },
        vignetteRadius: { value: 0.85 },
        tintColor: { value: new THREE.Vector3(1.02, 1.0, 0.96) }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float brightness;
        uniform float contrast;
        uniform float saturation;
        uniform float vignetteIntensity;
        uniform float vignetteRadius;
        uniform vec3 tintColor;
        varying vec2 vUv;

        void main() {
            vec4 color = texture2D(tDiffuse, vUv);
            
            // Brightness
            color.rgb += brightness;
            
            // Contrast
            color.rgb = (color.rgb - 0.5) * contrast + 0.5;
            
            // Saturation
            float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
            color.rgb = mix(vec3(gray), color.rgb, saturation);
            
            // Color tint (warm sunlight feel)
            color.rgb *= tintColor;
            
            // Vignette
            vec2 center = vUv - 0.5;
            float dist = length(center);
            float vignette = smoothstep(vignetteRadius, vignetteRadius - 0.45, dist);
            color.rgb *= mix(1.0 - vignetteIntensity, 1.0, vignette);
            
            gl_FragColor = color;
        }
    `
};

// Outline post-processing for stylized look
const OutlineShader = {
    uniforms: {
        tDiffuse: { value: null },
        resolution: { value: new THREE.Vector2(1, 1) },
        outlineColor: { value: new THREE.Vector3(0.15, 0.12, 0.1) },
        strength: { value: 1.0 }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec2 resolution;
        uniform vec3 outlineColor;
        uniform float strength;
        varying vec2 vUv;

        float getLuminance(vec3 c) {
            return dot(c, vec3(0.299, 0.587, 0.114));
        }

        void main() {
            vec2 texel = vec2(1.0 / resolution.x, 1.0 / resolution.y);
            
            float tl = getLuminance(texture2D(tDiffuse, vUv + vec2(-texel.x, texel.y)).rgb);
            float t  = getLuminance(texture2D(tDiffuse, vUv + vec2(0.0, texel.y)).rgb);
            float tr = getLuminance(texture2D(tDiffuse, vUv + vec2(texel.x, texel.y)).rgb);
            float l  = getLuminance(texture2D(tDiffuse, vUv + vec2(-texel.x, 0.0)).rgb);
            float r  = getLuminance(texture2D(tDiffuse, vUv + vec2(texel.x, 0.0)).rgb);
            float bl = getLuminance(texture2D(tDiffuse, vUv + vec2(-texel.x, -texel.y)).rgb);
            float b  = getLuminance(texture2D(tDiffuse, vUv + vec2(0.0, -texel.y)).rgb);
            float br = getLuminance(texture2D(tDiffuse, vUv + vec2(texel.x, -texel.y)).rgb);
            
            float sobelX = tl + 2.0 * l + bl - tr - 2.0 * r - br;
            float sobelY = tl + 2.0 * t + tr - bl - 2.0 * b - br;
            float edge = sqrt(sobelX * sobelX + sobelY * sobelY);
            
            edge = smoothstep(0.05, 0.15, edge * strength);
            
            vec4 color = texture2D(tDiffuse, vUv);
            color.rgb = mix(color.rgb, outlineColor, edge * 0.4);
            
            gl_FragColor = color;
        }
    `
};

export class PostProcessing {
    constructor(renderer, scene, camera) {
        this.composer = new EffectComposer(renderer);
        
        // Base render pass
        const renderPass = new RenderPass(scene, camera);
        this.composer.addPass(renderPass);
        
        // Subtle bloom for glowing elements (lights, water, emissive)
        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.3,    // strength
            0.6,    // radius
            0.85    // threshold
        );
        this.composer.addPass(this.bloomPass);
        
        // Outline/edge detection for stylized look
        this.outlinePass = new ShaderPass(OutlineShader);
        this.outlinePass.uniforms.resolution.value.set(
            window.innerWidth * Math.min(window.devicePixelRatio, 2),
            window.innerHeight * Math.min(window.devicePixelRatio, 2)
        );
        this.composer.addPass(this.outlinePass);
        
        // Color grading + vignette
        this.colorPass = new ShaderPass(ColorGradingShader);
        this.composer.addPass(this.colorPass);
        
        // Output pass (tone mapping)
        const outputPass = new OutputPass();
        this.composer.addPass(outputPass);
    }

    onResize(width, height) {
        this.composer.setSize(width, height);
        const pixelRatio = Math.min(window.devicePixelRatio, 2);
        this.outlinePass.uniforms.resolution.value.set(
            width * pixelRatio,
            height * pixelRatio
        );
        this.bloomPass.resolution.set(width, height);
    }

    render() {
        this.composer.render();
    }
}
