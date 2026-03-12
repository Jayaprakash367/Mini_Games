import * as THREE from 'three';

export class Player {
    constructor(scene) {
        this.scene = scene;
        this.mesh = null;
        this.velocity = new THREE.Vector3();
        this.speed = 10;
        this.runSpeed = 18;
        this.jumpForce = 12;
        this.gravity = -30;
        this.isGrounded = true;
        this.height = 2.0;
        this.radius = 0.5;
        this.facing = 0; // y-axis rotation
        this.animTime = 0;
        this.isMoving = false;

        // Body parts for animation
        this.parts = {};

        this.buildMesh();
        scene.add(this.mesh);
    }

    buildMesh() {
        this.mesh = new THREE.Group();
        this.mesh.position.set(0, 0, 5);

        const skinColor = 0xFFDBAC;
        const shirtColor = 0x4488DD;
        const shirtDark = 0x336699;
        const pantsColor = 0x3A4D5E;
        const shoeColor = 0x4A3322;
        const bagColor = 0xDD8833;
        const hairColor = 0x442211;

        // Body (torso) - slightly rounded with chest detail
        const torso = new THREE.Mesh(
            new THREE.BoxGeometry(0.85, 0.95, 0.5),
            new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.75 })
        );
        torso.position.y = 1.6;
        torso.castShadow = true;
        this.mesh.add(torso);
        this.parts.torso = torso;

        // Collar/neck
        const collar = new THREE.Mesh(
            new THREE.CylinderGeometry(0.15, 0.2, 0.15, 8),
            new THREE.MeshStandardMaterial({ color: shirtDark, roughness: 0.7 })
        );
        collar.position.y = 2.15;
        this.mesh.add(collar);

        // Head (slightly larger for stylized proportions)
        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.38, 16, 12),
            new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.8 })
        );
        head.position.y = 2.55;
        head.castShadow = true;
        this.mesh.add(head);
        this.parts.head = head;

        // Hair (stylized cap shape)
        const hair = new THREE.Mesh(
            new THREE.SphereGeometry(0.4, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55),
            new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.9 })
        );
        hair.position.y = 2.6;
        this.mesh.add(hair);

        // Hair fringe
        const fringe = new THREE.Mesh(
            new THREE.BoxGeometry(0.55, 0.08, 0.15),
            new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.9 })
        );
        fringe.position.set(0, 2.72, 0.3);
        this.mesh.add(fringe);

        // Eyes (larger, more expressive)
        const eyeWhiteGeo = new THREE.SphereGeometry(0.07, 8, 8);
        const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
        const eyeGeo = new THREE.SphereGeometry(0.04, 8, 8);
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
        
        // Left eye
        const leftEyeWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
        leftEyeWhite.position.set(-0.13, 2.57, 0.32);
        this.mesh.add(leftEyeWhite);
        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.position.set(-0.13, 2.57, 0.37);
        this.mesh.add(leftEye);
        
        // Right eye
        const rightEyeWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
        rightEyeWhite.position.set(0.13, 2.57, 0.32);
        this.mesh.add(rightEyeWhite);
        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        rightEye.position.set(0.13, 2.57, 0.37);
        this.mesh.add(rightEye);

        // Eyebrows
        const browMat = new THREE.MeshStandardMaterial({ color: hairColor });
        const leftBrow = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.025, 0.03), browMat);
        leftBrow.position.set(-0.13, 2.67, 0.35);
        leftBrow.rotation.z = 0.1;
        this.mesh.add(leftBrow);
        const rightBrow = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.025, 0.03), browMat);
        rightBrow.position.set(0.13, 2.67, 0.35);
        rightBrow.rotation.z = -0.1;
        this.mesh.add(rightBrow);

        // Mouth (small smile)
        const mouth = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 0.02, 0.02),
            new THREE.MeshStandardMaterial({ color: 0xCC8877 })
        );
        mouth.position.set(0, 2.42, 0.36);
        this.mesh.add(mouth);

        // Left arm
        const armGeo = new THREE.BoxGeometry(0.22, 0.75, 0.22);
        const armMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.75 });
        this.parts.leftArm = new THREE.Group();
        this.parts.leftArm.position.set(-0.58, 1.9, 0);
        const leftArmMesh = new THREE.Mesh(armGeo, armMat);
        leftArmMesh.position.y = -0.37;
        leftArmMesh.castShadow = true;
        this.parts.leftArm.add(leftArmMesh);
        // Left hand
        const handGeo = new THREE.SphereGeometry(0.09, 8, 8);
        const handMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.8 });
        const leftHand = new THREE.Mesh(handGeo, handMat);
        leftHand.position.y = -0.8;
        this.parts.leftArm.add(leftHand);
        this.mesh.add(this.parts.leftArm);

        // Right arm
        this.parts.rightArm = new THREE.Group();
        this.parts.rightArm.position.set(0.58, 1.9, 0);
        const rightArmMesh = new THREE.Mesh(armGeo, armMat);
        rightArmMesh.position.y = -0.37;
        rightArmMesh.castShadow = true;
        this.parts.rightArm.add(rightArmMesh);
        const rightHand = new THREE.Mesh(handGeo, handMat);
        rightHand.position.y = -0.8;
        this.parts.rightArm.add(rightHand);
        this.mesh.add(this.parts.rightArm);

        // Left leg
        const legGeo = new THREE.BoxGeometry(0.28, 0.65, 0.28);
        const legMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.8 });
        this.parts.leftLeg = new THREE.Group();
        this.parts.leftLeg.position.set(-0.22, 1.05, 0);
        const leftLegMesh = new THREE.Mesh(legGeo, legMat);
        leftLegMesh.position.y = -0.32;
        leftLegMesh.castShadow = true;
        this.parts.leftLeg.add(leftLegMesh);
        // Left shoe (rounded)
        const shoeGeo = new THREE.BoxGeometry(0.28, 0.14, 0.42);
        const shoeMat = new THREE.MeshStandardMaterial({ color: shoeColor, roughness: 0.7 });
        const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
        leftShoe.position.set(0, -0.7, 0.05);
        this.parts.leftLeg.add(leftShoe);
        this.mesh.add(this.parts.leftLeg);

        // Right leg
        this.parts.rightLeg = new THREE.Group();
        this.parts.rightLeg.position.set(0.22, 1.05, 0);
        const rightLegMesh = new THREE.Mesh(legGeo, legMat);
        rightLegMesh.position.y = -0.32;
        rightLegMesh.castShadow = true;
        this.parts.rightLeg.add(rightLegMesh);
        const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
        rightShoe.position.set(0, -0.7, 0.05);
        this.parts.rightLeg.add(rightShoe);
        this.mesh.add(this.parts.rightLeg);

        // Messenger bag (slung over shoulder, more detailed)
        const bagGroup = new THREE.Group();
        const bag = new THREE.Mesh(
            new THREE.BoxGeometry(0.55, 0.38, 0.22),
            new THREE.MeshStandardMaterial({ color: bagColor, roughness: 0.7 })
        );
        bagGroup.add(bag);
        // Bag flap
        const flap = new THREE.Mesh(
            new THREE.BoxGeometry(0.55, 0.15, 0.24),
            new THREE.MeshStandardMaterial({
                color: new THREE.Color(bagColor).multiplyScalar(0.85),
                roughness: 0.7
            })
        );
        flap.position.set(0, 0.15, 0.01);
        bagGroup.add(flap);
        // Bag buckle
        const buckle = new THREE.Mesh(
            new THREE.BoxGeometry(0.08, 0.06, 0.04),
            new THREE.MeshStandardMaterial({ color: 0xCCAA44, metalness: 0.8, roughness: 0.3 })
        );
        buckle.position.set(0, 0.08, 0.14);
        bagGroup.add(buckle);
        
        bagGroup.position.set(0.3, 1.3, -0.25);
        bagGroup.castShadow = true;
        this.mesh.add(bagGroup);
        this.parts.bag = bagGroup;

        // Bag strap
        const strap = new THREE.Mesh(
            new THREE.BoxGeometry(0.06, 1.0, 0.06),
            new THREE.MeshStandardMaterial({ color: 0x664422, roughness: 0.8 })
        );
        strap.position.set(0.0, 1.8, 0.0);
        strap.rotation.z = 0.4;
        this.mesh.add(strap);
    }

    update(delta, input, colliders, camForward, camRight) {
        // Movement direction
        let moveDir = new THREE.Vector3();
        this.isMoving = false;

        if (input.keys.w) { moveDir.add(camForward); this.isMoving = true; }
        if (input.keys.s) { moveDir.sub(camForward); this.isMoving = true; }
        if (input.keys.a) { moveDir.sub(camRight); this.isMoving = true; }
        if (input.keys.d) { moveDir.add(camRight); this.isMoving = true; }

        moveDir.y = 0;
        if (moveDir.lengthSq() > 0) {
            moveDir.normalize();
            // Face movement direction
            this.facing = Math.atan2(moveDir.x, moveDir.z);
        }

        // Speed (shift to run)
        const currentSpeed = input.keys.shift ? this.runSpeed : this.speed;

        // Apply horizontal velocity with smoothing
        const targetVelX = moveDir.x * currentSpeed;
        const targetVelZ = moveDir.z * currentSpeed;
        const accel = this.isGrounded ? 15 : 5;
        this.velocity.x += (targetVelX - this.velocity.x) * Math.min(accel * delta, 1);
        this.velocity.z += (targetVelZ - this.velocity.z) * Math.min(accel * delta, 1);

        // Jump
        if (input.keys.space && this.isGrounded) {
            this.velocity.y = this.jumpForce;
            this.isGrounded = false;
        }

        // Gravity
        this.velocity.y += this.gravity * delta;

        // Move
        const pos = this.mesh.position;
        pos.x += this.velocity.x * delta;
        pos.y += this.velocity.y * delta;
        pos.z += this.velocity.z * delta;

        // Ground collision
        const groundY = this.getGroundHeight(pos.x, pos.z, colliders);
        if (pos.y <= groundY) {
            pos.y = groundY;
            this.velocity.y = 0;
            this.isGrounded = true;
        }

        // World bounds
        const bound = 95;
        pos.x = Math.max(-bound, Math.min(bound, pos.x));
        pos.z = Math.max(-bound, Math.min(bound, pos.z));

        // Building collision
        this.resolveCollisions(colliders);

        // Rotate mesh to face direction
        const targetRot = this.facing;
        let currentRot = this.mesh.rotation.y;
        let diff = targetRot - currentRot;
        // Wrap around
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        this.mesh.rotation.y += diff * Math.min(10 * delta, 1);

        // Animate
        this.animate(delta);
    }

    getGroundHeight(x, z, colliders) {
        // Simple: ground is at y=0 everywhere except elevated areas
        for (const c of colliders) {
            if (c.type === 'ramp' || c.type === 'elevated') {
                if (x >= c.minX && x <= c.maxX && z >= c.minZ && z <= c.maxZ) {
                    return c.height || 0;
                }
            }
        }
        return 0;
    }

    resolveCollisions(colliders) {
        const pos = this.mesh.position;
        const r = this.radius;

        for (const c of colliders) {
            if (c.type !== 'building') continue;

            // AABB vs circle collision on xz plane
            const closestX = Math.max(c.minX, Math.min(pos.x, c.maxX));
            const closestZ = Math.max(c.minZ, Math.min(pos.z, c.maxZ));
            const dx = pos.x - closestX;
            const dz = pos.z - closestZ;
            const distSq = dx * dx + dz * dz;

            if (distSq < r * r && distSq > 0) {
                const dist = Math.sqrt(distSq);
                const pushX = (dx / dist) * (r - dist);
                const pushZ = (dz / dist) * (r - dist);
                pos.x += pushX;
                pos.z += pushZ;
            }
        }
    }

    animate(delta) {
        if (this.isMoving) {
            this.animTime += delta * 9;
            const swing = Math.sin(this.animTime) * 0.55;
            const fastSwing = Math.sin(this.animTime * 2) * 0.08;
            
            // Arms swing opposite to legs
            this.parts.leftArm.rotation.x = -swing;
            this.parts.rightArm.rotation.x = swing;
            this.parts.leftArm.rotation.z = 0.05;
            this.parts.rightArm.rotation.z = -0.05;
            
            // Leg swing with knee bend feel
            this.parts.leftLeg.rotation.x = swing * 0.8;
            this.parts.rightLeg.rotation.x = -swing * 0.8;
            
            // Body bob (up-down bounce)
            const bob = Math.abs(Math.sin(this.animTime)) * 0.08;
            this.parts.torso.position.y = 1.6 + bob;
            
            // Subtle torso twist
            this.parts.torso.rotation.y = Math.sin(this.animTime) * 0.04;
            
            // Head slight bob
            this.parts.head.position.y = 2.55 + bob * 0.5;
            
            // Bag sway
            this.parts.bag.rotation.z = fastSwing;
        } else {
            this.animTime = 0;
            // Idle breathing cycle
            const breathe = Math.sin(Date.now() * 0.003) * 0.015;
            const idleSway = Math.sin(Date.now() * 0.001) * 0.02;
            
            // Smooth return to idle pose
            this.parts.leftArm.rotation.x *= 0.88;
            this.parts.rightArm.rotation.x *= 0.88;
            this.parts.leftLeg.rotation.x *= 0.88;
            this.parts.rightLeg.rotation.x *= 0.88;
            this.parts.leftArm.rotation.z = 0.03;
            this.parts.rightArm.rotation.z = -0.03;
            this.parts.torso.rotation.y *= 0.9;
            
            // Breathing effect
            this.parts.torso.position.y = 1.6 + breathe;
            this.parts.head.position.y = 2.55 + breathe * 0.5;
            
            // Subtle idle weight shift
            this.parts.torso.rotation.z = idleSway;
        }

        if (!this.isGrounded) {
            // Jump pose - arms up, legs tucked
            this.parts.leftArm.rotation.x = -0.7;
            this.parts.rightArm.rotation.x = -0.7;
            this.parts.leftArm.rotation.z = 0.3;
            this.parts.rightArm.rotation.z = -0.3;
            this.parts.leftLeg.rotation.x = 0.4;
            this.parts.rightLeg.rotation.x = -0.15;
        }
    }
}
