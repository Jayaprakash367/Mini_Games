import * as THREE from 'three';

export class Buildings {
    static createBuilding(scene, x, z, width, depth, height, color, colliders) {
        const group = new THREE.Group();

        // Main structure with rounded edges feel (beveled look via slightly larger base)
        const geo = new THREE.BoxGeometry(width, height, depth, 1, 1, 1);
        const mat = new THREE.MeshStandardMaterial({
            color,
            roughness: 0.75,
            metalness: 0.05
        });
        const building = new THREE.Mesh(geo, mat);
        building.position.set(x, height / 2, z);
        building.castShadow = true;
        building.receiveShadow = true;
        group.add(building);

        // Base trim (foundation)
        const baseTrim = new THREE.Mesh(
            new THREE.BoxGeometry(width + 0.2, 0.3, depth + 0.2),
            new THREE.MeshStandardMaterial({
                color: new THREE.Color(color).multiplyScalar(0.65),
                roughness: 0.9
            })
        );
        baseTrim.position.set(x, 0.15, z);
        baseTrim.receiveShadow = true;
        group.add(baseTrim);

        // Windows with warm glow
        const windowGlowColor = 0xFFEECC;
        const windowMat = new THREE.MeshStandardMaterial({
            color: 0xAADDFF,
            emissive: windowGlowColor,
            emissiveIntensity: 0.12,
            roughness: 0.15,
            metalness: 0.6
        });

        // Window frame
        const frameMat = new THREE.MeshStandardMaterial({
            color: 0xEEEEEE,
            roughness: 0.5
        });

        const floors = Math.floor(height / 2.5);
        const windowsPerFloor = Math.max(1, Math.floor(width / 2.0));
        const windowGeo = new THREE.PlaneGeometry(0.55, 0.75);
        const frameGeo = new THREE.PlaneGeometry(0.7, 0.9);

        for (let f = 0; f < floors; f++) {
            const wy = f * 2.5 + 2.0;
            for (let w = 0; w < windowsPerFloor; w++) {
                const wx = (w - (windowsPerFloor - 1) / 2) * 1.8;
                // Front windows with frames
                const ff = new THREE.Mesh(frameGeo, frameMat);
                ff.position.set(x + wx, wy, z + depth / 2 + 0.005);
                group.add(ff);
                const wf = new THREE.Mesh(windowGeo, windowMat);
                wf.position.set(x + wx, wy, z + depth / 2 + 0.01);
                group.add(wf);
                // Back windows
                const fb = new THREE.Mesh(frameGeo, frameMat);
                fb.position.set(x + wx, wy, z - depth / 2 - 0.005);
                fb.rotation.y = Math.PI;
                group.add(fb);
                const wb = new THREE.Mesh(windowGeo, windowMat);
                wb.position.set(x + wx, wy, z - depth / 2 - 0.01);
                wb.rotation.y = Math.PI;
                group.add(wb);
            }

            const sideWindows = Math.max(1, Math.floor(depth / 2.0));
            for (let w = 0; w < sideWindows; w++) {
                const wz = (w - (sideWindows - 1) / 2) * 1.8;
                const fl = new THREE.Mesh(frameGeo, frameMat);
                fl.position.set(x - width / 2 - 0.005, wy, z + wz);
                fl.rotation.y = -Math.PI / 2;
                group.add(fl);
                const wl = new THREE.Mesh(windowGeo, windowMat);
                wl.position.set(x - width / 2 - 0.01, wy, z + wz);
                wl.rotation.y = -Math.PI / 2;
                group.add(wl);
                const fr = new THREE.Mesh(frameGeo, frameMat);
                fr.position.set(x + width / 2 + 0.005, wy, z + wz);
                fr.rotation.y = Math.PI / 2;
                group.add(fr);
                const wr = new THREE.Mesh(windowGeo, windowMat);
                wr.position.set(x + width / 2 + 0.01, wy, z + wz);
                wr.rotation.y = Math.PI / 2;
                group.add(wr);
            }
        }

        // Sloped roof
        const roofColor = new THREE.Color(color).multiplyScalar(0.55);
        const roofHeight = height * 0.35;
        const roofGeo = new THREE.ConeGeometry(
            Math.max(width, depth) * 0.75,
            roofHeight,
            4
        );
        const roofMat = new THREE.MeshStandardMaterial({
            color: roofColor,
            roughness: 0.8
        });
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.set(x, height + roofHeight / 2, z);
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        group.add(roof);

        // Door with frame
        const doorFrameGeo = new THREE.PlaneGeometry(1.1, 1.8);
        const doorFrameMat = new THREE.MeshStandardMaterial({ color: 0x443322 });
        const doorFrame = new THREE.Mesh(doorFrameGeo, doorFrameMat);
        doorFrame.position.set(x, 0.9, z + depth / 2 + 0.015);
        group.add(doorFrame);

        const doorGeo = new THREE.PlaneGeometry(0.85, 1.6);
        const doorMat = new THREE.MeshStandardMaterial({ color: 0x664433, roughness: 0.7 });
        const door = new THREE.Mesh(doorGeo, doorMat);
        door.position.set(x, 0.8, z + depth / 2 + 0.02);
        group.add(door);

        // Door knob
        const knob = new THREE.Mesh(
            new THREE.SphereGeometry(0.04, 8, 8),
            new THREE.MeshStandardMaterial({ color: 0xCCAA44, metalness: 0.8, roughness: 0.3 })
        );
        knob.position.set(x + 0.3, 0.8, z + depth / 2 + 0.04);
        group.add(knob);

        scene.add(group);

        // Collider
        colliders.push({
            type: 'building',
            minX: x - width / 2 - 0.1,
            maxX: x + width / 2 + 0.1,
            minZ: z - depth / 2 - 0.1,
            maxZ: z + depth / 2 + 0.1,
            height
        });

        return group;
    }

    static createShop(scene, x, z, width, depth, height, wallColor, awningColor, colliders) {
        const group = Buildings.createBuilding(scene, x, z, width, depth, height, wallColor, colliders);

        // Striped awning (curved shape)
        const awningGeo = new THREE.CylinderGeometry(1.5, 1.5, width + 0.6, 12, 1, false, 0, Math.PI);
        const awningMat = new THREE.MeshStandardMaterial({
            color: awningColor,
            roughness: 0.8,
            side: THREE.DoubleSide
        });
        const awning = new THREE.Mesh(awningGeo, awningMat);
        awning.position.set(x, height * 0.55, z + depth / 2 + 0.5);
        awning.rotation.z = Math.PI / 2;
        awning.rotation.y = Math.PI / 2;
        awning.scale.set(0.5, 1, 0.4);
        awning.castShadow = true;
        scene.add(awning);

        // Shop sign board
        const signGeo = new THREE.BoxGeometry(width * 0.6, 0.4, 0.06);
        const signMat = new THREE.MeshStandardMaterial({
            color: 0xFAF0E6,
            roughness: 0.6
        });
        const sign = new THREE.Mesh(signGeo, signMat);
        sign.position.set(x, height * 0.75, z + depth / 2 + 0.04);
        scene.add(sign);

        return group;
    }

    static createLighthouse(scene, x, z, colliders) {
        const group = new THREE.Group();
        const height = 14;

        // Tower
        const tower = new THREE.Mesh(
            new THREE.CylinderGeometry(1.2, 1.8, height, 16),
            new THREE.MeshStandardMaterial({ color: 0xEEEEDD })
        );
        tower.position.set(x, height / 2, z);
        tower.castShadow = true;
        group.add(tower);

        // Red stripes
        for (let i = 0; i < 4; i++) {
            const stripe = new THREE.Mesh(
                new THREE.CylinderGeometry(
                    1.2 + 0.02 - i * 0.08,
                    1.5 + 0.02 - i * 0.08,
                    1.5, 16
                ),
                new THREE.MeshStandardMaterial({ color: 0xCC3333 })
            );
            stripe.position.set(x, i * 3.5 + 2, z);
            group.add(stripe);
        }

        // Lamp room
        const lampRoom = new THREE.Mesh(
            new THREE.CylinderGeometry(1.6, 1.3, 2, 8),
            new THREE.MeshStandardMaterial({
                color: 0xFFFFCC,
                emissive: 0xFFDD88,
                emissiveIntensity: 0.5,
                transparent: true,
                opacity: 0.8
            })
        );
        lampRoom.position.set(x, height + 1, z);
        group.add(lampRoom);

        // Lamp roof
        const lampRoof = new THREE.Mesh(
            new THREE.ConeGeometry(1.8, 1.5, 8),
            new THREE.MeshStandardMaterial({ color: 0x444444 })
        );
        lampRoof.position.set(x, height + 2.8, z);
        group.add(lampRoof);

        // Light
        const light = new THREE.PointLight(0xFFDD88, 2, 40);
        light.position.set(x, height + 1, z);
        group.add(light);

        scene.add(group);

        colliders.push({
            type: 'building',
            minX: x - 2, maxX: x + 2,
            minZ: z - 2, maxZ: z + 2,
            height
        });

        return group;
    }

    static createHarborPier(scene, x, z, length, width) {
        const group = new THREE.Group();

        // Wooden planks
        const planks = new THREE.Mesh(
            new THREE.BoxGeometry(width, 0.3, length),
            new THREE.MeshStandardMaterial({ color: 0x8B6F4E, roughness: 0.9 })
        );
        planks.position.set(x, 0.4, z);
        planks.receiveShadow = true;
        group.add(planks);

        // Support posts
        const postGeo = new THREE.CylinderGeometry(0.15, 0.15, 1.5, 8);
        const postMat = new THREE.MeshStandardMaterial({ color: 0x6B4F3E });
        const posts = Math.floor(length / 3);
        for (let i = 0; i <= posts; i++) {
            const pz = z - length / 2 + i * 3;
            const p1 = new THREE.Mesh(postGeo, postMat);
            p1.position.set(x - width / 2 + 0.3, -0.2, pz);
            group.add(p1);
            const p2 = new THREE.Mesh(postGeo, postMat);
            p2.position.set(x + width / 2 - 0.3, -0.2, pz);
            group.add(p2);
        }

        // Bollards
        const bollardGeo = new THREE.CylinderGeometry(0.12, 0.15, 0.5, 8);
        const bollardMat = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.6 });
        for (let i = 0; i < 3; i++) {
            const b = new THREE.Mesh(bollardGeo, bollardMat);
            b.position.set(x + width / 2 - 0.2, 0.8, z - length / 3 + i * (length / 3));
            group.add(b);
        }

        scene.add(group);
        return group;
    }
}
