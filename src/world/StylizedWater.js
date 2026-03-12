import * as THREE from 'three';

export class StylizedWater {
    constructor(scene) {
        this.mesh = null;
        this.material = null;
        this.scene = scene;
    }

    create(width, height, position) {
        const geo = new THREE.PlaneGeometry(width, height, 80, 40);

        this.material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uDeepColor: { value: new THREE.Color(0x0E4D6E) },
                uShallowColor: { value: new THREE.Color(0x3BB5D0) },
                uFoamColor: { value: new THREE.Color(0xE8F4F8) },
                uSunDirection: { value: new THREE.Vector3(0.5, 0.8, 0.3).normalize() },
                uSunColor: { value: new THREE.Color(0xFFEECC) },
                uWaveHeight: { value: 0.35 },
                uWaveFrequency: { value: 0.25 },
                uOpacity: { value: 0.88 }
            },
            vertexShader: `
                uniform float uTime;
                uniform float uWaveHeight;
                uniform float uWaveFrequency;
                varying vec2 vUv;
                varying vec3 vWorldPos;
                varying float vWave;
                varying vec3 vNormal;

                void main() {
                    vUv = uv;
                    vec3 pos = position;
                    
                    // Multi-layered waves
                    float wave1 = sin(pos.x * uWaveFrequency + uTime * 1.2) * uWaveHeight;
                    float wave2 = sin(pos.y * uWaveFrequency * 0.7 + uTime * 0.9) * uWaveHeight * 0.6;
                    float wave3 = sin((pos.x + pos.y) * uWaveFrequency * 1.3 + uTime * 1.8) * uWaveHeight * 0.3;
                    float wave4 = cos(pos.x * uWaveFrequency * 2.0 - uTime * 0.7) * uWaveHeight * 0.15;
                    
                    pos.z = wave1 + wave2 + wave3 + wave4;
                    vWave = pos.z;
                    
                    // Compute normal from wave derivatives
                    float dx = cos(pos.x * uWaveFrequency + uTime * 1.2) * uWaveHeight * uWaveFrequency
                              + cos((pos.x + pos.y) * uWaveFrequency * 1.3 + uTime * 1.8) * uWaveHeight * 0.3 * uWaveFrequency * 1.3;
                    float dy = cos(pos.y * uWaveFrequency * 0.7 + uTime * 0.9) * uWaveHeight * 0.6 * uWaveFrequency * 0.7
                              + cos((pos.x + pos.y) * uWaveFrequency * 1.3 + uTime * 1.8) * uWaveHeight * 0.3 * uWaveFrequency * 1.3;
                    vNormal = normalize(vec3(-dx, -dy, 1.0));
                    
                    vec4 modelPos = modelMatrix * vec4(pos, 1.0);
                    vWorldPos = modelPos.xyz;
                    gl_Position = projectionMatrix * viewMatrix * modelPos;
                }
            `,
            fragmentShader: `
                uniform vec3 uDeepColor;
                uniform vec3 uShallowColor;
                uniform vec3 uFoamColor;
                uniform vec3 uSunDirection;
                uniform vec3 uSunColor;
                uniform float uTime;
                uniform float uOpacity;
                varying vec2 vUv;
                varying vec3 vWorldPos;
                varying float vWave;
                varying vec3 vNormal;

                void main() {
                    // Depth-based color mix
                    float depth = smoothstep(-0.3, 0.3, vWave);
                    vec3 waterColor = mix(uDeepColor, uShallowColor, depth);
                    
                    // Specular highlight (sun reflection)
                    vec3 viewDir = normalize(cameraPosition - vWorldPos);
                    vec3 halfDir = normalize(uSunDirection + viewDir);
                    float spec = pow(max(dot(vNormal, halfDir), 0.0), 64.0);
                    vec3 specColor = uSunColor * spec * 0.8;
                    
                    // Fresnel effect
                    float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.0);
                    waterColor = mix(waterColor, uShallowColor * 1.3, fresnel * 0.4);
                    
                    // Foam on wave peaks
                    float foam = smoothstep(0.15, 0.35, vWave);
                    foam *= (sin(vWorldPos.x * 3.0 + uTime * 2.0) * 0.5 + 0.5) * 
                            (cos(vWorldPos.z * 2.5 + uTime * 1.5) * 0.5 + 0.5);
                    waterColor = mix(waterColor, uFoamColor, foam * 0.4);
                    
                    // Caustic-like patterns
                    float caustic = sin(vWorldPos.x * 5.0 + uTime * 3.0) * 
                                   sin(vWorldPos.z * 4.0 + uTime * 2.5) * 0.5 + 0.5;
                    waterColor += caustic * uShallowColor * 0.08;
                    
                    waterColor += specColor;
                    
                    gl_FragColor = vec4(waterColor, uOpacity);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false
        });

        this.mesh = new THREE.Mesh(geo, this.material);
        this.mesh.rotation.x = -Math.PI / 2;
        this.mesh.position.copy(position);
        this.mesh.receiveShadow = true;
        this.scene.add(this.mesh);

        return this.mesh;
    }

    update(time) {
        if (this.material) {
            this.material.uniforms.uTime.value = time;
        }
    }
}
