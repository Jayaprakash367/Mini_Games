export class InputSystem {
    constructor(domElement) {
        this.keys = {
            w: false, a: false, s: false, d: false,
            space: false, shift: false, e: false,
            escape: false
        };
        this.mouseMovement = { x: 0, y: 0 };
        this.onMouseMove = null;
        this.onScroll = null;
        this.justPressed = {};

        this._prevKeys = {};

        document.addEventListener('keydown', (e) => this._onKeyDown(e));
        document.addEventListener('keyup', (e) => this._onKeyUp(e));
        document.addEventListener('mousemove', (e) => this._onMouseMove(e));
        domElement.addEventListener('wheel', (e) => this._onWheel(e), { passive: true });
    }

    _onKeyDown(e) {
        const key = this._mapKey(e.code);
        if (key) {
            this.keys[key] = true;
        }
    }

    _onKeyUp(e) {
        const key = this._mapKey(e.code);
        if (key) {
            this.keys[key] = false;
        }
    }

    _mapKey(code) {
        const map = {
            'KeyW': 'w', 'KeyA': 'a', 'KeyS': 's', 'KeyD': 'd',
            'ArrowUp': 'w', 'ArrowLeft': 'a', 'ArrowDown': 's', 'ArrowRight': 'd',
            'Space': 'space', 'ShiftLeft': 'shift', 'ShiftRight': 'shift',
            'KeyE': 'e', 'Escape': 'escape'
        };
        return map[code] || null;
    }

    _onMouseMove(e) {
        if (document.pointerLockElement) {
            const dx = e.movementX || 0;
            const dy = e.movementY || 0;
            this.mouseMovement.x += dx;
            this.mouseMovement.y += dy;
            if (this.onMouseMove) this.onMouseMove(dx, dy);
        }
    }

    _onWheel(e) {
        if (this.onScroll) this.onScroll(e.deltaY);
    }

    isJustPressed(key) {
        return this.keys[key] && !this._prevKeys[key];
    }

    update() {
        // Track just-pressed state
        this.justPressed = {};
        for (const key of Object.keys(this.keys)) {
            this.justPressed[key] = this.keys[key] && !this._prevKeys[key];
        }
        this._prevKeys = { ...this.keys };

        // Reset mouse movement
        this.mouseMovement.x = 0;
        this.mouseMovement.y = 0;
    }
}
