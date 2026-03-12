import * as THREE from 'three';

export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.systems = [];
        this.pool = [];
    }

    init() {
        this.createAmbientDust();
        this.createFloatingLeaves();
        this.createFireflies();
        this.createWaterSparkles();
    }

    createAmbientDust() {
        const count = 200;
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        const speeds = new Float32Array(count);
        const offsets = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 120;
            positions[i * 3 + 1] = Math.random() * 20 + 1;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 120;
            sizes[i] = Math.random() * 0.3 + 0.1;
            speeds[i] = Math.random() * 0.5 + 0.2;
            offsets[i] = Math.random() * Math.PI * 2;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

        const mat = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uColor: { value: new THREE.Color(0xFFEEDD) },
                uOpacity: { value: 0.3 }
            },
            vertexShader: `
                attribute float aSize;
                uniform float uTime;
                varying float vAlpha;
                void main() {
                    vec3 pos = position;
                    pos.y += sin(uTime * 0.5 + position.x * 0.1) * 0.5;
                    pos.x += sin(uTime * 0.3 + position.z * 0.1) * 0.3;
                    
                    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
                    gl_Position = projectionMatrix * mvPos;
                    gl_PointSize = aSize * (200.0 / -mvPos.z);
                    
                    vAlpha = smoothstep(0.0, 5.0, pos.y) * smoothstep(25.0, 15.0, pos.y);
                }
            `,
            fragmentShader: `
                uniform vec3 uColor;
                uniform float uOpacity;
                varying float vAlpha;
                void main() {
                    float d = length(gl_PointCoord - 0.5);
                    if (d > 0.5) discard;
                    float alpha = smoothstep(0.5, 0.0, d) * uOpacity * vAlpha;
                    gl_FragColor = vec4(uColor, alpha);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        const dust = new THREE.Points(geo, mat);
        dust.frustumCulled = false;
        this.scene.add(dust);

        this.systems.push({
            type: 'dust', mesh: dust, speeds, offsets,
            update: (time) => {
                mat.uniforms.uTime.value = time;
            }
        });
    }

    createFloatingLeaves() {
        const count = 50;
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const velocities = [];

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 1] = Math.random() * 15 + 3;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
            velocities.push({
                x: (Math.random() - 0.5) * 0.5,
                y: -Math.random() * 0.3 - 0.1,
                z: (Math.random() - 0.5) * 0.5,
                rotSpeed: Math.random() * 2,
                phase: Math.random() * Math.PI * 2
            });
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const mat = new THREE.PointsMaterial({
            color: 0x55AA33,
            size: 0.25,
            transparent: true,
            opacity: 0.7,
            depthWrite: false,
            sizeAttenuation: true
        });

        const leaves = new THREE.Points(geo, mat);
        leaves.frustumCulled = false;
        this.scene.add(leaves);

        this.systems.push({
            type: 'leaves', mesh: leaves, velocities,
            update: (time, delta) => {
                const pos = leaves.geometry.attributes.position;
                for (let i = 0; i < count; i++) {
                    const v = velocities[i];
                    let x = pos.getX(i) + (v.x + Math.sin(time + v.phase) * 0.3) * delta;
                    let y = pos.getY(i) + v.y * delta;
                    let z = pos.getZ(i) + (v.z + Math.cos(time * 0.8 + v.phase) * 0.2) * delta;

                    if (y < 0.1) { y = 12 + Math.random() * 8; x = (Math.random() - 0.5) * 100; z = (Math.random() - 0.5) * 100; }
                    if (x > 60) x = -60;
                    if (x < -60) x = 60;
                    if (z > 60) z = -60;
                    if (z < -60) z = 60;

                    pos.setXYZ(i, x, y, z);
                }
                pos.needsUpdate = true;
            }
        });
    }

    createFireflies() {
        const count = 40;
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const phases = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 80;
            positions[i * 3 + 1] = Math.random() * 4 + 1;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
            phases[i] = Math.random() * Math.PI * 2;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const mat = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uColor: { value: new THREE.Color(0xFFDD44) }
            },
            vertexShader: `
                uniform float uTime;
                varying float vAlpha;
                void main() {
                    vec3 pos = position;
                    pos.y += sin(uTime * 2.0 + position.x * 0.5) * 0.3;
                    pos.x += cos(uTime * 1.5 + position.z * 0.3) * 0.2;
                    
                    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
                    gl_Position = projectionMatrix * mvPos;
                    gl_PointSize = 3.0 * (150.0 / -mvPos.z);
                    
                    // Flickering
                    vAlpha = 0.3 + 0.7 * pow(sin(uTime * 3.0 + position.x * 2.0) * 0.5 + 0.5, 2.0);
                }
            `,
            fragmentShader: `
                uniform vec3 uColor;
                varying float vAlpha;
                void main() {
                    float d = length(gl_PointCoord - 0.5);
                    if (d > 0.5) discard;
                    float glow = exp(-d * 6.0);
                    gl_FragColor = vec4(uColor, glow * vAlpha);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        const fireflies = new THREE.Points(geo, mat);
        fireflies.frustumCulled = false;
        this.scene.add(fireflies);

        this.systems.push({
            type: 'fireflies', mesh: fireflies,
            update: (time) => {
                mat.uniforms.uTime.value = time;
            }
        });
    }

    createWaterSparkles() {
        const count = 80;
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 120;
            positions[i * 3 + 1] = 0.1 + Math.random() * 0.2;
            positions[i * 3 + 2] = -55 - Math.random() * 40;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const mat = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uColor: { value: new THREE.Color(0xFFFFFF) }
            },
            vertexShader: `
                uniform float uTime;
                varying float vAlpha;
                void main() {
                    vec3 pos = position;
                    pos.y += sin(uTime * 1.5 + position.x * 0.5) * 0.15;
                    
                    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
                    gl_Position = projectionMatrix * mvPos;
                    gl_PointSize = 2.5 * (100.0 / -mvPos.z);
                    
                    vAlpha = pow(sin(uTime * 4.0 + position.x * 3.0 + position.z * 2.0) * 0.5 + 0.5, 4.0);
                }
            `,
            fragmentShader: `
                uniform vec3 uColor;
                varying float vAlpha;
                void main() {
                    float d = length(gl_PointCoord - 0.5);
                    if (d > 0.5) discard;
                    float glow = exp(-d * 8.0);
                    gl_FragColor = vec4(uColor, glow * vAlpha * 0.6);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        const sparkles = new THREE.Points(geo, mat);
        sparkles.frustumCulled = false;
        this.scene.add(sparkles);

        this.systems.push({
            type: 'sparkles', mesh: sparkles,
            update: (time) => {
                mat.uniforms.uTime.value = time;
            }
        });
    }

    // Burst particles for interactions
    createBurst(position, color = 0xFFDD44, count = 15) {
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const velocities = [];

        for (let i = 0; i < count; i++) {
            positions[i * 3] = position.x;
            positions[i * 3 + 1] = position.y + 1;
            positions[i * 3 + 2] = position.z;
            velocities.push(new THREE.Vector3(
                (Math.random() - 0.5) * 4,
                Math.random() * 5 + 2,
                (Math.random() - 0.5) * 4
            ));
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const mat = new THREE.PointsMaterial({
            color,
            size: 0.2,
            transparent: true,
            opacity: 1,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        const burst = new THREE.Points(geo, mat);
        this.scene.add(burst);

        const burstData = {
            mesh: burst, velocities, life: 1.5, maxLife: 1.5,
            update: (time, delta) => {
                const pos = burst.geometry.attributes.position;
                for (let i = 0; i < count; i++) {
                    const v = velocities[i];
                    v.y -= 9.8 * delta;
                    pos.setX(i, pos.getX(i) + v.x * delta);
                    pos.setY(i, pos.getY(i) + v.y * delta);
                    pos.setZ(i, pos.getZ(i) + v.z * delta);
                }
                pos.needsUpdate = true;
                burstData.life -= delta;
                mat.opacity = Math.max(0, burstData.life / burstData.maxLife);
                if (burstData.life <= 0) {
                    this.scene.remove(burst);
                    geo.dispose();
                    mat.dispose();
                    return true; // remove
                }
                return false;
            }
        };

        this.pool.push(burstData);
    }

    update(time, delta) {
        for (const sys of this.systems) {
            sys.update(time, delta);
        }

        // Update burst effects
        this.pool = this.pool.filter(b => !b.update(time, delta));
    }
}
