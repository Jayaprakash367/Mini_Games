import * as THREE from 'three';

export class NPC {
    constructor(scene, data) {
        this.scene = scene;
        this.id = data.id;
        this.name = data.name;
        this.role = data.role;
        this.position = new THREE.Vector3(data.x, 0, data.z);
        this.dialogueKey = data.dialogueKey;
        this.interactionRadius = data.interactionRadius || 3.5;
        this.color = data.color || 0xEE6644;
        this.accessory = data.accessory || null;
        this.animOffset = Math.random() * Math.PI * 2;

        this.mesh = null;
        this.parts = {};
        this.label = null;

        this.buildMesh();
        scene.add(this.mesh);
        this.createLabel();
    }

    buildMesh() {
        this.mesh = new THREE.Group();
        this.mesh.position.copy(this.position);

        const skinColor = 0xFFDBAC;
        const shoeColor = 0x333333;

        // Torso
        const torso = new THREE.Mesh(
            new THREE.BoxGeometry(0.85, 0.95, 0.45),
            new THREE.MeshStandardMaterial({ color: this.color })
        );
        torso.position.y = 1.6;
        torso.castShadow = true;
        this.mesh.add(torso);
        this.parts.torso = torso;

        // Head
        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.33, 16, 12),
            new THREE.MeshStandardMaterial({ color: skinColor })
        );
        head.position.y = 2.4;
        head.castShadow = true;
        this.mesh.add(head);
        this.parts.head = head;

        // Eyes
        const eyeGeo = new THREE.SphereGeometry(0.045, 8, 8);
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.position.set(-0.1, 2.42, 0.28);
        this.mesh.add(leftEye);
        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        rightEye.position.set(0.1, 2.42, 0.28);
        this.mesh.add(rightEye);

        // Arms
        const armGeo = new THREE.BoxGeometry(0.22, 0.75, 0.22);
        const armMat = new THREE.MeshStandardMaterial({ color: this.color });

        this.parts.leftArm = new THREE.Group();
        this.parts.leftArm.position.set(-0.55, 1.85, 0);
        const la = new THREE.Mesh(armGeo, armMat);
        la.position.y = -0.37;
        la.castShadow = true;
        this.parts.leftArm.add(la);
        this.mesh.add(this.parts.leftArm);

        this.parts.rightArm = new THREE.Group();
        this.parts.rightArm.position.set(0.55, 1.85, 0);
        const ra = new THREE.Mesh(armGeo, armMat);
        ra.position.y = -0.37;
        ra.castShadow = true;
        this.parts.rightArm.add(ra);
        this.mesh.add(this.parts.rightArm);

        // Legs
        const legGeo = new THREE.BoxGeometry(0.28, 0.65, 0.28);
        const legMat = new THREE.MeshStandardMaterial({ color: 0x555566 });

        this.parts.leftLeg = new THREE.Group();
        this.parts.leftLeg.position.set(-0.2, 1.0, 0);
        const ll = new THREE.Mesh(legGeo, legMat);
        ll.position.y = -0.32;
        this.parts.leftLeg.add(ll);
        this.mesh.add(this.parts.leftLeg);

        this.parts.rightLeg = new THREE.Group();
        this.parts.rightLeg.position.set(0.2, 1.0, 0);
        const rl = new THREE.Mesh(legGeo, legMat);
        rl.position.y = -0.32;
        this.parts.rightLeg.add(rl);
        this.mesh.add(this.parts.rightLeg);

        // Shoes
        const shoeGeo = new THREE.BoxGeometry(0.28, 0.12, 0.4);
        const shoeMat = new THREE.MeshStandardMaterial({ color: shoeColor });
        const ls = new THREE.Mesh(shoeGeo, shoeMat);
        ls.position.set(0, -0.68, 0.04);
        this.parts.leftLeg.add(ls);
        const rs = new THREE.Mesh(shoeGeo, shoeMat);
        rs.position.set(0, -0.68, 0.04);
        this.parts.rightLeg.add(rs);

        // Accessory
        this.buildAccessory();
    }

    buildAccessory() {
        switch (this.accessory) {
            case 'sailor_hat': {
                const brim = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.4, 0.42, 0.06, 16),
                    new THREE.MeshStandardMaterial({ color: 0xFFFFFF })
                );
                brim.position.y = 2.72;
                this.mesh.add(brim);
                const top = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.25, 0.3, 0.2, 16),
                    new THREE.MeshStandardMaterial({ color: 0xFFFFFF })
                );
                top.position.y = 2.84;
                this.mesh.add(top);
                const band = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.305, 0.305, 0.06, 16),
                    new THREE.MeshStandardMaterial({ color: 0x2244AA })
                );
                band.position.y = 2.76;
                this.mesh.add(band);
                break;
            }
            case 'chef_hat': {
                const hatBase = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.28, 0.3, 0.08, 16),
                    new THREE.MeshStandardMaterial({ color: 0xFFFFFF })
                );
                hatBase.position.y = 2.72;
                this.mesh.add(hatBase);
                const hatTop = new THREE.Mesh(
                    new THREE.SphereGeometry(0.3, 12, 10),
                    new THREE.MeshStandardMaterial({ color: 0xFFFFFF })
                );
                hatTop.position.y = 2.95;
                this.mesh.add(hatTop);
                break;
            }
            case 'beret': {
                const beret = new THREE.Mesh(
                    new THREE.SphereGeometry(0.32, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.4),
                    new THREE.MeshStandardMaterial({ color: 0xCC2244 })
                );
                beret.position.y = 2.65;
                beret.rotation.x = -0.1;
                this.mesh.add(beret);
                break;
            }
            case 'glasses': {
                const glassMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8 });
                const leftLens = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.015, 8, 12), glassMat);
                leftLens.position.set(-0.1, 2.42, 0.3);
                leftLens.rotation.y = Math.PI / 2;
                this.mesh.add(leftLens);
                const rightLens = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.015, 8, 12), glassMat);
                rightLens.position.set(0.1, 2.42, 0.3);
                rightLens.rotation.y = Math.PI / 2;
                this.mesh.add(rightLens);
                break;
            }
            case 'lantern': {
                const lantern = new THREE.Group();
                const base = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.08, 0.1, 0.2, 8),
                    new THREE.MeshStandardMaterial({ color: 0x886633 })
                );
                lantern.add(base);
                const glow = new THREE.Mesh(
                    new THREE.SphereGeometry(0.12, 8, 8),
                    new THREE.MeshStandardMaterial({ color: 0xFFCC44, emissive: 0xFFAA22, emissiveIntensity: 0.5 })
                );
                glow.position.y = 0.15;
                lantern.add(glow);
                const light = new THREE.PointLight(0xFFAA22, 0.5, 5);
                light.position.y = 0.15;
                lantern.add(light);
                lantern.position.set(0.65, 1.2, 0.1);
                this.mesh.add(lantern);
                this.parts.lantern = lantern;
                break;
            }
            case 'telescope': {
                const tube = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.04, 0.06, 0.5, 8),
                    new THREE.MeshStandardMaterial({ color: 0x8B7355, metalness: 0.6 })
                );
                tube.rotation.z = -Math.PI / 4;
                tube.position.set(0.5, 1.8, 0.2);
                this.mesh.add(tube);
                break;
            }
        }
    }

    createLabel() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(4, 4, 248, 56, 8);
            ctx.fill();
        } else {
            ctx.fillRect(4, 4, 248, 56);
        }
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, 128, 40);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMat = new THREE.SpriteMaterial({ map: texture, depthTest: false });
        this.label = new THREE.Sprite(spriteMat);
        this.label.position.y = 3.2;
        this.label.scale.set(2, 0.5, 1);
        this.label.visible = false;
        this.mesh.add(this.label);
    }

    update(delta, time) {
        // Idle animation: gentle sway
        const t = time + this.animOffset;
        const sway = Math.sin(t * 1.5) * 0.04;
        this.parts.leftArm.rotation.x = sway;
        this.parts.rightArm.rotation.x = -sway;
        this.parts.torso.position.y = 1.6 + Math.sin(t * 2) * 0.015;

        // Subtle head turn
        this.parts.head.rotation.y = Math.sin(t * 0.5) * 0.15;
    }

    showLabel() {
        if (this.label) this.label.visible = true;
    }

    hideLabel() {
        if (this.label) this.label.visible = false;
    }

    distanceTo(playerPos) {
        return this.mesh.position.distanceTo(playerPos);
    }

    facePlayer(playerPos) {
        const dir = new THREE.Vector3().subVectors(playerPos, this.mesh.position);
        dir.y = 0;
        if (dir.lengthSq() > 0.01) {
            this.mesh.rotation.y = Math.atan2(dir.x, dir.z);
        }
    }
}
