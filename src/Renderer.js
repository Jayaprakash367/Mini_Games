import * as THREE from 'three';
import { PostProcessing } from './systems/PostProcessing.js';

export class Renderer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.postProcessing = null;
        this.skyMaterial = null;
    }

    init() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xCCDDEE);
        this.scene.fog = new THREE.FogExp2(0xCCDDEE, 0.0035);

        const gameContainer = document.getElementById('game-container');
        const initialWidth = gameContainer?.clientWidth || window.innerWidth;
        const initialHeight = gameContainer?.clientHeight || window.innerHeight;

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            55,
            initialWidth / initialHeight,
            0.1,
            600
        );
        this.camera.position.set(0, 10, 15);

        // WebGL Renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: 'high-performance',
            stencil: false
        });
        this.renderer.setSize(initialWidth, initialHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.3;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;

        gameContainer.appendChild(this.renderer.domElement);

        this.setupLighting();
        this.setupSky();

        // Post-processing pipeline
        this.postProcessing = new PostProcessing(
            this.renderer, this.scene, this.camera
        );

        window.addEventListener('resize', () => this.onResize());

        return this.renderer.domElement;
    }

    get domElement() {
        return this.renderer.domElement;
    }

    setupLighting() {
        // Hemisphere light for natural sky/ground lighting
        const hemiLight = new THREE.HemisphereLight(0x88BBEE, 0x445522, 0.7);
        this.scene.add(hemiLight);

        // Ambient fill
        const ambient = new THREE.AmbientLight(0xFFFFFF, 0.35);
        this.scene.add(ambient);

        // Main directional (sun) light with shadows
        this.sunLight = new THREE.DirectionalLight(0xFFEECC, 1.3);
        this.sunLight.position.set(50, 80, 30);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 4096;
        this.sunLight.shadow.mapSize.height = 4096;
        this.sunLight.shadow.camera.near = 1;
        this.sunLight.shadow.camera.far = 200;
        this.sunLight.shadow.camera.left = -80;
        this.sunLight.shadow.camera.right = 80;
        this.sunLight.shadow.camera.top = 80;
        this.sunLight.shadow.camera.bottom = -80;
        this.sunLight.shadow.bias = -0.0005;
        this.sunLight.shadow.normalBias = 0.02;
        this.scene.add(this.sunLight);

        // Subtle fill light from opposite direction (cool blue)
        const fillLight = new THREE.DirectionalLight(0x8899CC, 0.35);
        fillLight.position.set(-30, 40, -20);
        this.scene.add(fillLight);

        // Warm rim light
        const rimLight = new THREE.DirectionalLight(0xFFCC88, 0.2);
        rimLight.position.set(20, 10, -60);
        this.scene.add(rimLight);
    }

    setupSky() {
        // Gradient sky dome
        const skyGeo = new THREE.SphereGeometry(280, 32, 15);
        this.skyMaterial = new THREE.ShaderMaterial({
            uniforms: {
                topColor: { value: new THREE.Color(0x4488CC) },
                bottomColor: { value: new THREE.Color(0xCCDDEE) },
                offset: { value: 20 },
                exponent: { value: 0.4 }
            },
            vertexShader: `
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPos = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPos.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 topColor;
                uniform vec3 bottomColor;
                uniform float offset;
                uniform float exponent;
                varying vec3 vWorldPosition;
                void main() {
                    float h = normalize(vWorldPosition + offset).y;
                    gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
                }
            `,
            side: THREE.BackSide,
            depthWrite: false
        });
        const sky = new THREE.Mesh(skyGeo, this.skyMaterial);
        this.scene.add(sky);
    }

    onResize() {
        const gameContainer = document.getElementById('game-container');
        const w = gameContainer?.clientWidth || window.innerWidth;
        const h = gameContainer?.clientHeight || window.innerHeight;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
        if (this.postProcessing) {
            this.postProcessing.onResize(w, h);
        }
    }

    render() {
        if (this.postProcessing) {
            this.postProcessing.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }
}
