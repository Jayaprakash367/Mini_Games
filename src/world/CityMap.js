import * as THREE from 'three';
import { Buildings } from './Buildings.js';
import { EnvironmentObjects } from './EnvironmentObjects.js';
import { StylizedWater } from './StylizedWater.js';

export class CityMap {
    constructor(scene) {
        this.scene = scene;
        this.colliders = [];
        this.clouds = [];
        this.waterMesh = null;
        this.stylizedWater = null;
        this.boats = [];
    }

    generate() {
        this.createGround();
        this.createRoads();
        this.createHarborArea();
        this.createMarketArea();
        this.createParkArea();
        this.createResidentialArea();
        this.createObservatoryHill();
        this.createEnvironmentDetails();
        this.clouds = EnvironmentObjects.createClouds(this.scene);
    }

    createGround() {
        // Main ground with subtle vertex color variation
        const groundGeo = new THREE.PlaneGeometry(200, 200, 40, 40);
        const groundColors = [];
        const baseColor = new THREE.Color(0x5A7A4A);
        for (let i = 0; i < groundGeo.attributes.position.count; i++) {
            const variation = 0.9 + Math.random() * 0.2;
            groundColors.push(
                baseColor.r * variation,
                baseColor.g * variation,
                baseColor.b * variation
            );
        }
        groundGeo.setAttribute('color', new THREE.Float32BufferAttribute(groundColors, 3));

        const ground = new THREE.Mesh(
            groundGeo,
            new THREE.MeshStandardMaterial({
                color: 0x6B8E5A,
                roughness: 0.92,
                vertexColors: true
            })
        );
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Stylized water (south side = harbor)
        this.stylizedWater = new StylizedWater(this.scene);
        this.waterMesh = this.stylizedWater.create(
            200, 60,
            new THREE.Vector3(0, -0.2, -80)
        );

        // Beach/shore transition with gradient
        const shoreGeo = new THREE.PlaneGeometry(200, 10, 40, 4);
        const shoreColors = [];
        const sandColor = new THREE.Color(0xD4B483);
        const wetSandColor = new THREE.Color(0xB09060);
        for (let i = 0; i < shoreGeo.attributes.position.count; i++) {
            const y = shoreGeo.attributes.position.getY(i);
            const t = (y + 5) / 10;
            const c = sandColor.clone().lerp(wetSandColor, 1 - t);
            shoreColors.push(c.r, c.g, c.b);
        }
        shoreGeo.setAttribute('color', new THREE.Float32BufferAttribute(shoreColors, 3));

        const shore = new THREE.Mesh(
            shoreGeo,
            new THREE.MeshStandardMaterial({
                color: 0xD4B483,
                roughness: 0.95,
                vertexColors: true
            })
        );
        shore.rotation.x = -Math.PI / 2;
        shore.position.set(0, 0.01, -52);
        shore.receiveShadow = true;
        this.scene.add(shore);

        // Grass tufts around ground
        this.createGrassTufts();
    }

    createGrassTufts() {
        // Instanced grass tufts for visual richness
        const grassGeo = new THREE.ConeGeometry(0.15, 0.4, 4);
        const grassMat = new THREE.MeshStandardMaterial({
            color: 0x4A7A3A,
            roughness: 1.0
        });
        const grassMesh = new THREE.InstancedMesh(grassGeo, grassMat, 300);
        const dummy = new THREE.Object3D();
        const color = new THREE.Color();

        for (let i = 0; i < 300; i++) {
            const x = (Math.random() - 0.5) * 180;
            const z = (Math.random() - 0.5) * 180;
            // Skip water area and road areas
            if (z < -48 || (Math.abs(x) < 5 && Math.abs(z) < 60)) continue;
            
            dummy.position.set(x, 0.2, z);
            dummy.scale.set(
                0.5 + Math.random() * 0.8,
                0.5 + Math.random() * 1.0,
                0.5 + Math.random() * 0.8
            );
            dummy.updateMatrix();
            grassMesh.setMatrixAt(i, dummy.matrix);

            const green = 0.3 + Math.random() * 0.3;
            color.setRGB(0.2, green, 0.15);
            grassMesh.setColorAt(i, color);
        }
        grassMesh.instanceMatrix.needsUpdate = true;
        grassMesh.instanceColor.needsUpdate = true;
        grassMesh.receiveShadow = true;
        this.scene.add(grassMesh);
    }

    createRoads() {
        const roadMat = new THREE.MeshStandardMaterial({ color: 0x484848, roughness: 0.95 });
        const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.8 });

        // Main north-south road
        this.createRoadSegment(0, 0, 6, 120, roadMat, sidewalkMat);
        // Main east-west road
        this.createRoadSegment(0, 0, 120, 6, roadMat, sidewalkMat, true);
        // Market street
        this.createRoadSegment(30, 15, 6, 50, roadMat, sidewalkMat);
        // Harbor road
        this.createRoadSegment(0, -45, 80, 5, roadMat, sidewalkMat, true);
        // Park path
        this.createRoadSegment(-35, 15, 4, 40, roadMat, sidewalkMat);
        // Hill road
        this.createRoadSegment(-50, 50, 5, 40, roadMat, sidewalkMat);
    }

    createRoadSegment(x, z, width, length, roadMat, sidewalkMat, eastWest = false) {
        const road = new THREE.Mesh(
            new THREE.PlaneGeometry(width, length),
            roadMat
        );
        road.rotation.x = -Math.PI / 2;
        road.position.set(x, 0.02, z);
        if (eastWest) road.rotation.z = Math.PI / 2;
        road.receiveShadow = true;
        this.scene.add(road);

        // Dashed center line
        const lineMat = new THREE.MeshStandardMaterial({ color: 0xDDDD44 });
        const dashLength = 1.5;
        const gapLength = 1.0;
        const totalDashes = Math.floor(length / (dashLength + gapLength));
        for (let i = 0; i < totalDashes; i++) {
            const dash = new THREE.Mesh(
                new THREE.PlaneGeometry(0.12, dashLength),
                lineMat
            );
            dash.rotation.x = -Math.PI / 2;
            const offset = -length / 2 + i * (dashLength + gapLength) + dashLength / 2;
            if (eastWest) {
                dash.position.set(x + offset, 0.025, z);
                dash.rotation.z = Math.PI / 2;
            } else {
                dash.position.set(x, 0.025, z + offset);
            }
            this.scene.add(dash);
        }

        // Raised sidewalks with curb
        const swWidth = 1.4;
        const halfW = width / 2 + swWidth / 2;
        const curbMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.85 });
        for (const side of [-1, 1]) {
            // Sidewalk surface
            const sw = new THREE.Mesh(
                new THREE.BoxGeometry(swWidth, 0.08, length),
                sidewalkMat
            );
            if (eastWest) {
                sw.position.set(x, 0.06, z + side * halfW);
            } else {
                sw.position.set(x + side * halfW, 0.06, z);
            }
            if (eastWest) sw.rotation.y = Math.PI / 2;
            sw.receiveShadow = true;
            this.scene.add(sw);

            // Curb edge
            const curb = new THREE.Mesh(
                new THREE.BoxGeometry(0.12, 0.1, length),
                curbMat
            );
            const curbOffset = side > 0 ? -swWidth / 2 : swWidth / 2;
            if (eastWest) {
                curb.position.set(x, 0.05, z + side * halfW + curbOffset);
            } else {
                curb.position.set(x + side * halfW + curbOffset, 0.05, z);
            }
            if (eastWest) curb.rotation.y = Math.PI / 2;
            this.scene.add(curb);
        }
    }

    createHarborArea() {
        // Harbor buildings
        Buildings.createBuilding(this.scene, 20, -42, 8, 6, 5, 0x8B7355, this.colliders);
        Buildings.createBuilding(this.scene, -15, -42, 6, 5, 4, 0x7A6B5A, this.colliders);
        Buildings.createShop(this.scene, 5, -42, 5, 4, 3.5, 0x998877, 0xCC4444, this.colliders);

        // Lighthouse
        Buildings.createLighthouse(this.scene, 55, -55, this.colliders);

        // Piers
        Buildings.createHarborPier(this.scene, 10, -55, 14, 3);
        Buildings.createHarborPier(this.scene, -10, -58, 18, 3);
        Buildings.createHarborPier(this.scene, 35, -55, 12, 2.5);

        // Boats
        this.boats.push(EnvironmentObjects.createBoat(this.scene, 15, -62));
        this.boats.push(EnvironmentObjects.createBoat(this.scene, -8, -66));
        this.boats.push(EnvironmentObjects.createBoat(this.scene, 38, -60));

        // Harbor crates and barrels
        EnvironmentObjects.createCrate(this.scene, 12, -48);
        EnvironmentObjects.createCrate(this.scene, 13, -48.5);
        EnvironmentObjects.createCrate(this.scene, 12.5, -47.5);
        EnvironmentObjects.createBarrel(this.scene, 14, -47);
        EnvironmentObjects.createBarrel(this.scene, -12, -46);
    }

    createMarketArea() {
        // Market shops
        Buildings.createShop(this.scene, 22, 8, 5, 5, 4, 0xCC9966, 0xDD5533, this.colliders);
        Buildings.createShop(this.scene, 30, 8, 4, 5, 3.5, 0xDDAA77, 0x33AA55, this.colliders);
        Buildings.createShop(this.scene, 38, 8, 5, 4, 4.5, 0xBB8855, 0x4488CC, this.colliders);

        Buildings.createShop(this.scene, 22, 22, 5, 5, 4, 0xAA7744, 0xEE7733, this.colliders);
        Buildings.createShop(this.scene, 30, 22, 6, 5, 5, 0xCC8844, 0x8844CC, this.colliders);
        Buildings.createShop(this.scene, 40, 22, 5, 4, 3.5, 0xBBAA66, 0xCC3366, this.colliders);

        // Market stalls
        this.createMarketStall(26, 15, 0xDD4444);
        this.createMarketStall(34, 15, 0x44BB44);
        this.createMarketStall(42, 15, 0x4466DD);

        // Fountain in market square
        EnvironmentObjects.createFountain(this.scene, 30, 15);
    }

    createMarketStall(x, z, canopyColor) {
        const group = new THREE.Group();

        // Table
        const table = new THREE.Mesh(
            new THREE.BoxGeometry(2, 0.08, 1.2),
            new THREE.MeshStandardMaterial({ color: 0x8B6F4E })
        );
        table.position.y = 0.9;
        group.add(table);

        // Legs
        const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.9, 6);
        const legMat = new THREE.MeshStandardMaterial({ color: 0x6B4F3E });
        for (const [lx, lz] of [[-0.9, -0.5], [0.9, -0.5], [-0.9, 0.5], [0.9, 0.5]]) {
            const leg = new THREE.Mesh(legGeo, legMat);
            leg.position.set(lx, 0.45, lz);
            group.add(leg);
        }

        // Canopy
        const canopy = new THREE.Mesh(
            new THREE.PlaneGeometry(2.4, 1.6),
            new THREE.MeshStandardMaterial({ color: canopyColor, side: THREE.DoubleSide })
        );
        canopy.position.set(0, 2.2, 0);
        canopy.rotation.x = 0.1;
        group.add(canopy);

        // Canopy poles
        for (const px of [-1.1, 1.1]) {
            const pole = new THREE.Mesh(
                new THREE.CylinderGeometry(0.03, 0.03, 2.2, 6),
                legMat
            );
            pole.position.set(px, 1.1, -0.6);
            group.add(pole);
        }

        group.position.set(x, 0, z);
        this.scene.add(group);
    }

    createParkArea() {
        // Park ground
        const parkGround = new THREE.Mesh(
            new THREE.PlaneGeometry(30, 30),
            new THREE.MeshStandardMaterial({ color: 0x5A8A4A, roughness: 1.0 })
        );
        parkGround.rotation.x = -Math.PI / 2;
        parkGround.position.set(-35, 0.01, 10);
        parkGround.receiveShadow = true;
        this.scene.add(parkGround);

        // Trees in park
        const treePositions = [
            [-28, 5], [-42, 5], [-30, 18], [-40, 18],
            [-25, 12], [-45, 12], [-35, 25], [-35, -2]
        ];
        for (const [tx, tz] of treePositions) {
            const scale = 0.8 + Math.random() * 0.5;
            EnvironmentObjects.createTree(this.scene, tx, tz, scale);
        }

        // Park benches
        EnvironmentObjects.createBench(this.scene, -32, 10, 0);
        EnvironmentObjects.createBench(this.scene, -38, 10, Math.PI);
        EnvironmentObjects.createBench(this.scene, -35, 5, Math.PI / 2);

        // Pond in park (nicer with ring)
        const pondGeo = new THREE.CircleGeometry(4, 32);
        const pondMat = new THREE.MeshStandardMaterial({
            color: 0x2288AA,
            transparent: true,
            opacity: 0.75,
            roughness: 0.05,
            metalness: 0.3
        });
        const pond = new THREE.Mesh(pondGeo, pondMat);
        pond.rotation.x = -Math.PI / 2;
        pond.position.set(-35, 0.02, 12);
        this.scene.add(pond);

        // Stone ring around pond
        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x777777, roughness: 0.85 });
        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            const rock = new THREE.Mesh(
                new THREE.BoxGeometry(0.5, 0.2, 0.4),
                stoneMat
            );
            rock.position.set(
                -35 + Math.cos(angle) * 4.3,
                0.1,
                12 + Math.sin(angle) * 4.3
            );
            rock.rotation.y = angle;
            this.scene.add(rock);
        }

        // Flower beds
        this.createFlowerBed(-28, 15, 0xDD4477);
        this.createFlowerBed(-42, 8, 0xFFAA33);
        this.createFlowerBed(-30, 22, 0x7744DD);
    }

    createFlowerBed(x, z, color) {
        for (let i = 0; i < 8; i++) {
            const fx = x + (Math.random() - 0.5) * 2;
            const fz = z + (Math.random() - 0.5) * 2;
            const stem = new THREE.Mesh(
                new THREE.CylinderGeometry(0.02, 0.02, 0.3, 4),
                new THREE.MeshStandardMaterial({ color: 0x336622 })
            );
            stem.position.set(fx, 0.15, fz);
            this.scene.add(stem);

            const flower = new THREE.Mesh(
                new THREE.SphereGeometry(0.08, 6, 4),
                new THREE.MeshStandardMaterial({ color })
            );
            flower.position.set(fx, 0.35, fz);
            this.scene.add(flower);
        }
    }

    createResidentialArea() {
        // Houses
        const houseConfigs = [
            { x: -15, z: 38, w: 6, d: 5, h: 5, c: 0xCC8866 },
            { x: -15, z: 50, w: 5, d: 5, h: 4.5, c: 0xBBAA88 },
            { x: -15, z: 62, w: 6, d: 6, h: 6, c: 0xAA9977 },
            { x: 15, z: 38, w: 5, d: 5, h: 5, c: 0xDDBB99 },
            { x: 15, z: 50, w: 6, d: 5, h: 5.5, c: 0xCCAA77 },
            { x: 15, z: 62, w: 5, d: 5, h: 4, c: 0xBB9966 },
            { x: -5, z: 70, w: 7, d: 6, h: 5, c: 0xCCBB88 },
            { x: 8, z: 70, w: 5, d: 5, h: 4.5, c: 0xDDCC99 },
        ];
        for (const h of houseConfigs) {
            Buildings.createBuilding(this.scene, h.x, h.z, h.w, h.d, h.h, h.c, this.colliders);
        }

        // Residential trees
        const treePosRes = [[-8, 40], [8, 40], [-8, 55], [8, 55], [-8, 65], [8, 65]];
        for (const [tx, tz] of treePosRes) {
            EnvironmentObjects.createTree(this.scene, tx, tz, 0.9);
        }

        // Post office (player's base)
        Buildings.createShop(this.scene, 0, 35, 7, 5, 5, 0xDDCCAA, 0x2266AA, this.colliders);

        // Lamp posts along residential street
        for (let z = 35; z <= 70; z += 10) {
            EnvironmentObjects.createLampPost(this.scene, 5, z);
            EnvironmentObjects.createLampPost(this.scene, -5, z);
        }
    }

    createObservatoryHill() {
        // Elevated terrain (cone shape)
        const hill = new THREE.Mesh(
            new THREE.ConeGeometry(15, 5, 16),
            new THREE.MeshStandardMaterial({ color: 0x5A7A4A, roughness: 1 })
        );
        hill.position.set(-60, 2.0, 65);
        hill.receiveShadow = true;
        this.scene.add(hill);

        // Flat top
        const top = new THREE.Mesh(
            new THREE.CylinderGeometry(6, 8, 0.5, 16),
            new THREE.MeshStandardMaterial({ color: 0x5A8A4A })
        );
        top.position.set(-60, 4.5, 65);
        top.receiveShadow = true;
        this.scene.add(top);

        // Observatory building — placed on top of hill (y=4.75)
        const obsGroup = Buildings.createBuilding(this.scene, -60, 65, 5, 5, 4, 0x8899AA, this.colliders);
        obsGroup.position.y = 4.75;
        // Adjust collider height for hill
        const lastCollider = this.colliders[this.colliders.length - 1];
        lastCollider.elevated = true;

        // Observatory dome — on top of elevated building
        const dome = new THREE.Mesh(
            new THREE.SphereGeometry(3, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
            new THREE.MeshStandardMaterial({ color: 0x99AABB, metalness: 0.5 })
        );
        dome.position.set(-60, 4.75 + 4, 65);
        this.scene.add(dome);

        // Elevated ground collider
        this.colliders.push({
            type: 'elevated',
            minX: -75, maxX: -45,
            minZ: 50, maxZ: 80,
            height: 4.5
        });

        // Path trees
        EnvironmentObjects.createTree(this.scene, -52, 55, 0.7);
        EnvironmentObjects.createTree(this.scene, -48, 48, 0.8);
    }

    createEnvironmentDetails() {
        // Scatter trees around the world edges
        const edgeTrees = [
            [80, 30], [85, -10], [75, 50], [-80, 30], [-85, 10],
            [-75, -20], [70, -30], [-70, -30], [80, 70], [-80, 70],
            [50, 80], [-50, 80], [30, 85], [-30, 85], [60, 85],
        ];
        for (const [tx, tz] of edgeTrees) {
            const scale = 0.7 + Math.random() * 0.6;
            EnvironmentObjects.createTree(this.scene, tx, tz, scale);
        }

        // Palm trees near harbor
        EnvironmentObjects.createPalmTree(this.scene, 30, -45);
        EnvironmentObjects.createPalmTree(this.scene, -20, -45);
        EnvironmentObjects.createPalmTree(this.scene, 45, -42);

        // Lamp posts along main roads
        for (let x = -40; x <= 40; x += 12) {
            EnvironmentObjects.createLampPost(this.scene, x, 4);
            EnvironmentObjects.createLampPost(this.scene, x, -4);
        }
        for (let z = -40; z <= 30; z += 12) {
            EnvironmentObjects.createLampPost(this.scene, 4, z);
            EnvironmentObjects.createLampPost(this.scene, -4, z);
        }

        // Benches along roads
        EnvironmentObjects.createBench(this.scene, 8, -15, Math.PI / 2);
        EnvironmentObjects.createBench(this.scene, -8, 10, -Math.PI / 2);
        EnvironmentObjects.createBench(this.scene, 15, -5, 0);
    }

    update(time, delta) {
        // Animate stylized water
        if (this.stylizedWater) {
            this.stylizedWater.update(time);
        }

        // Animate clouds
        for (const cloud of this.clouds) {
            cloud.position.x += cloud.userData.speed * delta;
            if (cloud.position.x > 100) cloud.position.x = -100;
        }

        // Animate boats (gentle rocking)
        for (const boat of this.boats) {
            boat.rotation.z = Math.sin(time * 0.8 + boat.position.x) * 0.05;
            boat.rotation.x = Math.sin(time * 0.6 + boat.position.z) * 0.03;
            boat.position.y = 0.1 + Math.sin(time * 0.7 + boat.position.x) * 0.1;
        }
    }
}
