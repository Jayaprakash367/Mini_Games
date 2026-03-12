import * as THREE from 'three';

export class EnvironmentObjects {
    static createTree(scene, x, z, scale = 1) {
        const group = new THREE.Group();

        // Trunk with taper
        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.12 * scale, 0.22 * scale, 1.6 * scale, 8),
            new THREE.MeshStandardMaterial({ color: 0x6B4226, roughness: 0.9 })
        );
        trunk.position.set(x, 0.8 * scale, z);
        trunk.castShadow = true;
        group.add(trunk);

        // Foliage (layered cones for a stylized low-poly look)
        const leafColors = [0x2D7A2D, 0x3A8A3A, 0x228B22];
        const sizes = [1.6, 1.2, 0.8];
        const heights = [1.8, 2.8, 3.6];
        for (let i = 0; i < 3; i++) {
            const foliage = new THREE.Mesh(
                new THREE.ConeGeometry(sizes[i] * scale, 1.2 * scale, 7),
                new THREE.MeshStandardMaterial({
                    color: leafColors[i],
                    roughness: 0.85,
                    flatShading: true
                })
            );
            foliage.position.set(x, heights[i] * scale, z);
            foliage.castShadow = true;
            group.add(foliage);
        }

        scene.add(group);
        return group;
    }

    static createPalmTree(scene, x, z) {
        const group = new THREE.Group();

        // Curved trunk segments
        const segCount = 5;
        const segHeight = 0.9;
        for (let i = 0; i < segCount; i++) {
            const t = i / segCount;
            const radius = 0.18 - t * 0.06;
            const seg = new THREE.Mesh(
                new THREE.CylinderGeometry(radius - 0.02, radius, segHeight, 8),
                new THREE.MeshStandardMaterial({ color: 0x8B7355, roughness: 0.9 })
            );
            seg.position.set(
                x + Math.sin(t * 0.5) * 0.3,
                i * segHeight + segHeight / 2,
                z
            );
            seg.rotation.x = 0.05 * i;
            seg.castShadow = true;
            group.add(seg);
        }

        const topY = segCount * segHeight;

        // Coconuts
        const coconutMat = new THREE.MeshStandardMaterial({ color: 0x5A3A1A, roughness: 0.8 });
        for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2;
            const coconut = new THREE.Mesh(
                new THREE.SphereGeometry(0.1, 8, 8),
                coconutMat
            );
            coconut.position.set(
                x + Math.cos(angle) * 0.2,
                topY - 0.1,
                z + Math.sin(angle) * 0.2
            );
            group.add(coconut);
        }

        // Palm fronds (leaf-shaped)
        const frondMat = new THREE.MeshStandardMaterial({
            color: 0x228B22,
            side: THREE.DoubleSide,
            flatShading: true
        });
        for (let i = 0; i < 7; i++) {
            const angle = (i / 7) * Math.PI * 2;
            const frond = new THREE.Mesh(
                new THREE.PlaneGeometry(0.6, 2.8),
                frondMat
            );
            frond.position.set(
                x + Math.cos(angle) * 0.5,
                topY + 0.2,
                z + Math.sin(angle) * 0.5
            );
            frond.rotation.set(-0.9, angle, 0);
            group.add(frond);
        }

        scene.add(group);
        return group;
    }

    static createBench(scene, x, z, rotation = 0) {
        const group = new THREE.Group();
        const woodMat = new THREE.MeshStandardMaterial({ color: 0x8B6F4E });
        const metalMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.7 });

        // Seat
        const seat = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.5), woodMat);
        seat.position.y = 0.5;
        seat.castShadow = true;
        group.add(seat);

        // Back
        const back = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.5, 0.06), woodMat);
        back.position.set(0, 0.8, -0.22);
        group.add(back);

        // Legs
        const legGeo = new THREE.BoxGeometry(0.06, 0.5, 0.4);
        const positions = [[-0.7, 0.25, 0], [0.7, 0.25, 0]];
        for (const [lx, ly, lz] of positions) {
            const leg = new THREE.Mesh(legGeo, metalMat);
            leg.position.set(lx, ly, lz);
            group.add(leg);
        }

        group.position.set(x, 0, z);
        group.rotation.y = rotation;
        scene.add(group);
        return group;
    }

    static createLampPost(scene, x, z) {
        const group = new THREE.Group();
        const metalMat = new THREE.MeshStandardMaterial({
            color: 0x2A2A2A,
            metalness: 0.7,
            roughness: 0.4
        });

        // Base
        const base = new THREE.Mesh(
            new THREE.CylinderGeometry(0.15, 0.2, 0.3, 8),
            metalMat
        );
        base.position.set(0, 0.15, 0);
        group.add(base);

        // Pole
        const pole = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.07, 3.5, 8),
            metalMat
        );
        pole.position.set(0, 2.05, 0);
        pole.castShadow = true;
        group.add(pole);

        // Curved arm
        const arm = new THREE.Mesh(
            new THREE.TorusGeometry(0.5, 0.03, 8, 8, Math.PI / 2),
            metalMat
        );
        arm.position.set(0.5, 3.7, 0);
        arm.rotation.z = Math.PI;
        group.add(arm);

        // Lantern housing
        const housing = new THREE.Mesh(
            new THREE.CylinderGeometry(0.18, 0.12, 0.35, 6),
            new THREE.MeshStandardMaterial({
                color: 0x333333,
                metalness: 0.6,
                roughness: 0.4
            })
        );
        housing.position.set(0.5, 3.55, 0);
        group.add(housing);

        // Lamp glow
        const lamp = new THREE.Mesh(
            new THREE.SphereGeometry(0.12, 8, 8),
            new THREE.MeshStandardMaterial({
                color: 0xFFEEAA,
                emissive: 0xFFDD66,
                emissiveIntensity: 0.8,
                transparent: true,
                opacity: 0.9
            })
        );
        lamp.position.set(0.5, 3.35, 0);
        group.add(lamp);

        // Light
        const light = new THREE.PointLight(0xFFDD88, 0.5, 15);
        light.position.set(0.5, 3.3, 0);
        light.castShadow = false;
        group.add(light);

        group.position.set(x, 0, z);
        scene.add(group);
        return group;
    }

    static createCrate(scene, x, z) {
        const crate = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 0.6, 0.6),
            new THREE.MeshStandardMaterial({ color: 0xAA8855, roughness: 0.9 })
        );
        crate.position.set(x, 0.3, z);
        crate.castShadow = true;
        crate.receiveShadow = true;
        scene.add(crate);
        return crate;
    }

    static createBarrel(scene, x, z) {
        const barrel = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.3, 0.8, 12),
            new THREE.MeshStandardMaterial({ color: 0x885533 })
        );
        barrel.position.set(x, 0.4, z);
        barrel.castShadow = true;
        scene.add(barrel);

        // Metal bands
        const bandMat = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.8 });
        for (const by of [0.15, 0.65]) {
            const band = new THREE.Mesh(
                new THREE.TorusGeometry(0.31, 0.02, 8, 16),
                bandMat
            );
            band.position.set(x, by, z);
            band.rotation.x = Math.PI / 2;
            scene.add(band);
        }
        return barrel;
    }

    static createFountain(scene, x, z) {
        const group = new THREE.Group();

        // Base
        const base = new THREE.Mesh(
            new THREE.CylinderGeometry(2.0, 2.2, 0.5, 24),
            new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.6 })
        );
        base.position.y = 0.25;
        base.receiveShadow = true;
        group.add(base);

        // Water
        const water = new THREE.Mesh(
            new THREE.CylinderGeometry(1.8, 1.8, 0.1, 24),
            new THREE.MeshStandardMaterial({
                color: 0x4488CC,
                transparent: true,
                opacity: 0.7,
                roughness: 0.1
            })
        );
        water.position.y = 0.45;
        group.add(water);

        // Center column
        const column = new THREE.Mesh(
            new THREE.CylinderGeometry(0.15, 0.2, 1.5, 12),
            new THREE.MeshStandardMaterial({ color: 0x888888 })
        );
        column.position.y = 1.0;
        group.add(column);

        // Top basin
        const topBasin = new THREE.Mesh(
            new THREE.CylinderGeometry(0.6, 0.3, 0.3, 16),
            new THREE.MeshStandardMaterial({ color: 0x888888 })
        );
        topBasin.position.y = 1.8;
        group.add(topBasin);

        group.position.set(x, 0, z);
        scene.add(group);
        return group;
    }

    static createClouds(scene) {
        const clouds = [];
        const cloudMat = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.8,
            roughness: 1,
            flatShading: true
        });

        for (let i = 0; i < 18; i++) {
            const cloud = new THREE.Group();
            const count = 4 + Math.floor(Math.random() * 4);
            for (let j = 0; j < count; j++) {
                const puff = new THREE.Mesh(
                    new THREE.SphereGeometry(1.5 + Math.random() * 2, 8, 6),
                    cloudMat
                );
                puff.position.set(
                    j * 2 - count,
                    Math.random() * 0.5,
                    Math.random() * 1.5
                );
                puff.scale.y = 0.5;
                cloud.add(puff);
            }
            cloud.position.set(
                (Math.random() - 0.5) * 180,
                35 + Math.random() * 15,
                (Math.random() - 0.5) * 180
            );
            cloud.userData.speed = 0.3 + Math.random() * 0.5;
            scene.add(cloud);
            clouds.push(cloud);
        }
        return clouds;
    }

    static createBoat(scene, x, z) {
        const group = new THREE.Group();

        // Hull
        const hull = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 0.6, 3.5),
            new THREE.MeshStandardMaterial({ color: 0xCC6633 })
        );
        hull.position.y = -0.1;
        group.add(hull);

        // Pointed bow
        const bow = new THREE.Mesh(
            new THREE.ConeGeometry(0.75, 1.2, 4),
            new THREE.MeshStandardMaterial({ color: 0xCC6633 })
        );
        bow.position.set(0, -0.1, 2.2);
        bow.rotation.x = Math.PI / 2;
        group.add(bow);

        // Cabin
        const cabin = new THREE.Mesh(
            new THREE.BoxGeometry(1.0, 0.7, 1.2),
            new THREE.MeshStandardMaterial({ color: 0xEEDDCC })
        );
        cabin.position.set(0, 0.55, -0.5);
        group.add(cabin);

        // Mast
        const mast = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.04, 3, 8),
            new THREE.MeshStandardMaterial({ color: 0x6B4226 })
        );
        mast.position.set(0, 1.5, 0.5);
        group.add(mast);

        group.position.set(x, 0.1, z);
        scene.add(group);
        return group;
    }
}
