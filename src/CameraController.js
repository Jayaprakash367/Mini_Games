import * as THREE from 'three';

export class CameraController {
    constructor(camera, player) {
        this.camera = camera;
        this.player = player;

        // Orbit parameters
        this.distance = 12;
        this.targetDistance = 12;
        this.minDistance = 5;
        this.maxDistance = 22;
        this.height = 5;
        this.rotationX = 0;       // horizontal angle (yaw)
        this.rotationY = 0.35;    // vertical angle (pitch)
        this.minRotationY = -0.1;
        this.maxRotationY = 1.0;
        this.sensitivity = 0.002;
        this.smoothing = 8;
        this.scrollSmoothing = 6;

        // Current smooth position
        this.currentPosition = new THREE.Vector3();
        this.targetPosition = new THREE.Vector3();
        this.lookTarget = new THREE.Vector3();
        this.currentLookTarget = new THREE.Vector3();

        // Camera shake
        this.shakeIntensity = 0;
        this.shakeDecay = 5;

        // Speed-based pull-back
        this.lastPlayerPos = new THREE.Vector3();
        this.playerSpeed = 0;
    }

    handleMouseMove(dx, dy) {
        this.rotationX -= dx * this.sensitivity;
        this.rotationY += dy * this.sensitivity;
        this.rotationY = Math.max(this.minRotationY, Math.min(this.maxRotationY, this.rotationY));
    }

    handleScroll(deltaY) {
        this.targetDistance += deltaY * 0.008;
        this.targetDistance = Math.max(this.minDistance, Math.min(this.maxDistance, this.targetDistance));
    }

    shake(intensity = 0.3) {
        this.shakeIntensity = intensity;
    }

    getForward() {
        const forward = new THREE.Vector3(
            -Math.sin(this.rotationX),
            0,
            -Math.cos(this.rotationX)
        );
        return forward.normalize();
    }

    getRight() {
        const forward = this.getForward();
        return new THREE.Vector3(-forward.z, 0, forward.x).normalize();
    }

    update(delta) {
        if (!this.player || !this.player.mesh) return;

        const playerPos = this.player.mesh.position;

        // Track player speed for dynamic distance
        this.playerSpeed = playerPos.distanceTo(this.lastPlayerPos) / Math.max(delta, 0.001);
        this.lastPlayerPos.copy(playerPos);

        // Dynamic distance: pull back slightly when moving fast
        const speedPullback = Math.min(this.playerSpeed * 0.08, 2.5);
        const effectiveDistance = this.targetDistance + speedPullback;

        // Smooth distance interpolation
        const dt = 1.0 - Math.exp(-this.scrollSmoothing * delta);
        this.distance += (effectiveDistance - this.distance) * dt;

        // Calculate ideal camera position based on orbit angles
        const horizontalDist = this.distance * Math.cos(this.rotationY);
        const verticalDist = this.distance * Math.sin(this.rotationY) + this.height;

        this.targetPosition.set(
            playerPos.x + horizontalDist * Math.sin(this.rotationX),
            playerPos.y + verticalDist,
            playerPos.z + horizontalDist * Math.cos(this.rotationX)
        );

        // Clamp camera above ground
        this.targetPosition.y = Math.max(this.targetPosition.y, 1.5);

        // Smooth position interpolation
        const t = 1.0 - Math.exp(-this.smoothing * delta);
        this.currentPosition.lerp(this.targetPosition, t);

        // Camera shake
        if (this.shakeIntensity > 0.001) {
            this.currentPosition.x += (Math.random() - 0.5) * this.shakeIntensity;
            this.currentPosition.y += (Math.random() - 0.5) * this.shakeIntensity;
            this.shakeIntensity *= Math.exp(-this.shakeDecay * delta);
        }

        this.camera.position.copy(this.currentPosition);

        // Smooth look target (slightly above player center, offset forward when moving)
        const lookOffset = this.player.isMoving ? 1.2 : 0;
        const forward = this.getForward();
        this.lookTarget.set(
            playerPos.x - forward.x * lookOffset,
            playerPos.y + 2.0,
            playerPos.z - forward.z * lookOffset
        );
        this.currentLookTarget.lerp(this.lookTarget, t);
        this.camera.lookAt(this.currentLookTarget);
    }
}
