/**
 * InputSystem - Comprehensive input handling for keyboard, mouse, touch
 * Supports customizable key bindings and input buffering
 */
export class InputSystem {
    constructor() {
        this.keys = {};
        this.keyBindings = {
            moveUp: ['KeyW', 'ArrowUp'],
            moveDown: ['KeyS', 'ArrowDown'],
            moveLeft: ['KeyA', 'ArrowLeft'],
            moveRight: ['KeyD', 'ArrowRight'],
            interact: ['KeyE', 'Space'],
            inventory: ['KeyI', 'Tab'],
            menu: ['Escape'],
            pause: ['KeyP'],
            quickSave: ['F5'],
            quickLoad: ['F9'],
            sprint: ['ShiftLeft', 'ShiftRight']
        };
        
        this.mouse = {
            x: 0,
            y: 0,
            canvasX: 0,
            canvasY: 0,
            clicked: false,
            rightClicked: false,
            isDown: false
        };
        
        this.touch = {
            active: false,
            x: 0,
            y: 0,
            startX: 0,
            startY: 0
        };
        
        // Movement state
        this.movement = {
            x: 0,
            y: 0
        };
        
        // Input callbacks
        this.callbacks = {
            onInteract: null,
            onInventory: null,
            onMenu: null,
            onPause: null,
            onQuickSave: null,
            onQuickLoad: null
        };
        
        // Prevent default for game keys
        this.preventDefaultKeys = new Set([
            'Tab', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'
        ]);
        
        this.enabled = true;
        this.keyboardMovementEnabled = true;
        this.touchControlsEnabled = true;
        
        this.init();
    }
    
    init() {
        // Keyboard events
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
        
        // Mouse events
        window.addEventListener('mousemove', this.handleMouseMove.bind(this));
        window.addEventListener('mousedown', this.handleMouseDown.bind(this));
        window.addEventListener('mouseup', this.handleMouseUp.bind(this));
        window.addEventListener('contextmenu', this.handleContextMenu.bind(this));
        
        // Touch events
        window.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        window.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        window.addEventListener('touchend', this.handleTouchEnd.bind(this));
        
        // Visibility change (pause when tab hidden)
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
        
        console.log('InputSystem initialized');
    }
    
    handleKeyDown(e) {
        if (!this.enabled) return;
        
        // Prevent default for game keys
        if (this.preventDefaultKeys.has(e.key)) {
            e.preventDefault();
        }
        
        // Skip if key is already held
        if (this.keys[e.code]) return;
        
        this.keys[e.code] = true;
        
        // Check for action bindings
        if (this.isAction('interact', e.code)) {
            this.triggerCallback('onInteract');
        }
        if (this.isAction('inventory', e.code)) {
            e.preventDefault();
            this.triggerCallback('onInventory');
        }
        if (this.isAction('menu', e.code)) {
            this.triggerCallback('onMenu');
        }
        if (this.isAction('pause', e.code)) {
            this.triggerCallback('onPause');
        }
        if (this.isAction('quickSave', e.code)) {
            e.preventDefault();
            this.triggerCallback('onQuickSave');
        }
        if (this.isAction('quickLoad', e.code)) {
            e.preventDefault();
            this.triggerCallback('onQuickLoad');
        }
        
        // Update movement
        this.updateMovement();
    }
    
    handleKeyUp(e) {
        this.keys[e.code] = false;
        this.updateMovement();
    }
    
    handleMouseMove(e) {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
        
        // Calculate canvas-relative position
        const canvas = document.querySelector('canvas');
        if (canvas) {
            const rect = canvas.getBoundingClientRect();
            this.mouse.canvasX = e.clientX - rect.left;
            this.mouse.canvasY = e.clientY - rect.top;
        }
    }
    
    handleMouseDown(e) {
        if (!this.enabled) return;
        
        this.mouse.isDown = true;
        if (e.button === 0) {
            this.mouse.clicked = true;
        } else if (e.button === 2) {
            this.mouse.rightClicked = true;
        }
    }
    
    handleMouseUp(e) {
        this.mouse.isDown = false;
    }
    
    handleContextMenu(e) {
        // Prevent context menu in game area
        const canvas = document.querySelector('canvas');
        if (canvas && e.target === canvas) {
            e.preventDefault();
        }
    }
    
    handleTouchStart(e) {
        if (!this.enabled || !this.touchControlsEnabled) return;
        
        const touch = e.touches[0];
        this.touch.active = true;
        this.touch.x = touch.clientX;
        this.touch.y = touch.clientY;
        this.touch.startX = touch.clientX;
        this.touch.startY = touch.clientY;
        
        // Convert to mouse-like click
        this.mouse.canvasX = touch.clientX;
        this.mouse.canvasY = touch.clientY;
        this.mouse.clicked = true;
        
        // Prevent scrolling
        if (e.target.tagName === 'CANVAS') {
            e.preventDefault();
        }
    }
    
    handleTouchMove(e) {
        if (!this.touch.active || !this.touchControlsEnabled) return;
        
        const touch = e.touches[0];
        this.touch.x = touch.clientX;
        this.touch.y = touch.clientY;
        
        // Calculate swipe direction for movement
        const dx = touch.clientX - this.touch.startX;
        const dy = touch.clientY - this.touch.startY;
        
        const threshold = 30;
        this.movement.x = Math.abs(dx) > threshold ? Math.sign(dx) : 0;
        this.movement.y = Math.abs(dy) > threshold ? Math.sign(dy) : 0;
        
        if (e.target.tagName === 'CANVAS') {
            e.preventDefault();
        }
    }
    
    handleTouchEnd(e) {
        this.touch.active = false;
        this.movement.x = 0;
        this.movement.y = 0;
    }
    
    handleVisibilityChange() {
        if (document.hidden) {
            // Clear all keys when tab loses focus
            this.keys = {};
            this.movement = { x: 0, y: 0 };
            this.triggerCallback('onPause');
        }
    }
    
    updateMovement() {
        if (!this.keyboardMovementEnabled) {
            this.movement.x = 0;
            this.movement.y = 0;
            return;
        }
        
        this.movement.x = 0;
        this.movement.y = 0;
        
        if (this.isActionHeld('moveLeft')) this.movement.x -= 1;
        if (this.isActionHeld('moveRight')) this.movement.x += 1;
        if (this.isActionHeld('moveUp')) this.movement.y -= 1;
        if (this.isActionHeld('moveDown')) this.movement.y += 1;
        
        // Normalize diagonal movement
        if (this.movement.x !== 0 && this.movement.y !== 0) {
            const len = Math.sqrt(this.movement.x * this.movement.x + this.movement.y * this.movement.y);
            this.movement.x /= len;
            this.movement.y /= len;
        }
    }
    
    isAction(action, keyCode) {
        const bindings = this.keyBindings[action];
        return bindings && bindings.includes(keyCode);
    }
    
    isActionHeld(action) {
        const bindings = this.keyBindings[action];
        if (!bindings) return false;
        return bindings.some(key => this.keys[key]);
    }
    
    isSprinting() {
        return this.isActionHeld('sprint');
    }
    
    triggerCallback(callbackName) {
        const callback = this.callbacks[callbackName];
        if (callback && typeof callback === 'function') {
            callback();
        }
    }
    
    setCallback(name, callback) {
        if (name in this.callbacks) {
            this.callbacks[name] = callback;
        }
    }
    
    /**
     * Consume click event (call after handling)
     */
    consumeClick() {
        this.mouse.clicked = false;
        this.mouse.rightClicked = false;
    }
    
    /**
     * Check if there's a pending click
     */
    hasClick() {
        return this.mouse.clicked;
    }
    
    hasRightClick() {
        return this.mouse.rightClicked;
    }
    
    /**
     * Get current movement vector
     */
    getMovement() {
        return { ...this.movement };
    }
    
    /**
     * Get mouse position relative to canvas
     */
    getCanvasMousePosition() {
        return {
            x: this.mouse.canvasX,
            y: this.mouse.canvasY
        };
    }
    
    /**
     * Check if a point is being clicked
     */
    isClickingAt(x, y, width, height) {
        if (!this.mouse.clicked) return false;
        
        return this.mouse.canvasX >= x && 
               this.mouse.canvasX <= x + width &&
               this.mouse.canvasY >= y && 
               this.mouse.canvasY <= y + height;
    }
    
    /**
     * Check if mouse is hovering over an area
     */
    isHoveringAt(x, y, width, height) {
        return this.mouse.canvasX >= x && 
               this.mouse.canvasX <= x + width &&
               this.mouse.canvasY >= y && 
               this.mouse.canvasY <= y + height;
    }
    
    /**
     * Rebind a key action
     */
    rebindKey(action, oldKey, newKey) {
        const bindings = this.keyBindings[action];
        if (!bindings) return false;
        
        const index = bindings.indexOf(oldKey);
        if (index !== -1) {
            bindings[index] = newKey;
            return true;
        }
        return false;
    }
    
    /**
     * Add additional key to action
     */
    addKeyBinding(action, key) {
        if (!this.keyBindings[action]) {
            this.keyBindings[action] = [];
        }
        if (!this.keyBindings[action].includes(key)) {
            this.keyBindings[action].push(key);
        }
    }
    
    /**
     * Get current bindings for an action
     */
    getBindings(action) {
        return this.keyBindings[action] || [];
    }
    
    /**
     * Enable/disable all input
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.keys = {};
            this.movement = { x: 0, y: 0 };
        }
    }
    
    /**
     * Get a human-readable key name
     */
    getKeyDisplayName(keyCode) {
        const names = {
            'ArrowUp': '↑',
            'ArrowDown': '↓',
            'ArrowLeft': '←',
            'ArrowRight': '→',
            'Space': 'Space',
            'ShiftLeft': 'L-Shift',
            'ShiftRight': 'R-Shift',
            'ControlLeft': 'L-Ctrl',
            'ControlRight': 'R-Ctrl',
            'AltLeft': 'L-Alt',
            'AltRight': 'R-Alt',
            'Tab': 'Tab',
            'Escape': 'Esc',
            'Enter': 'Enter',
            'Backspace': 'Backspace'
        };
        
        if (names[keyCode]) return names[keyCode];
        if (keyCode.startsWith('Key')) return keyCode.slice(3);
        if (keyCode.startsWith('Digit')) return keyCode.slice(5);
        return keyCode;
    }
    
    /**
     * Serialize input settings for save
     */
    getSettings() {
        return {
            keyBindings: { ...this.keyBindings },
            keyboardMovementEnabled: this.keyboardMovementEnabled,
            touchControlsEnabled: this.touchControlsEnabled
        };
    }
    
    /**
     * Load input settings
     */
    loadSettings(settings) {
        if (settings.keyBindings) {
            Object.assign(this.keyBindings, settings.keyBindings);
        }
        if (settings.keyboardMovementEnabled !== undefined) {
            this.keyboardMovementEnabled = settings.keyboardMovementEnabled;
        }
        if (settings.touchControlsEnabled !== undefined) {
            this.touchControlsEnabled = settings.touchControlsEnabled;
        }
    }
    
    /**
     * Reset to default bindings
     */
    resetToDefaults() {
        this.keyBindings = {
            moveUp: ['KeyW', 'ArrowUp'],
            moveDown: ['KeyS', 'ArrowDown'],
            moveLeft: ['KeyA', 'ArrowLeft'],
            moveRight: ['KeyD', 'ArrowRight'],
            interact: ['KeyE', 'Space'],
            inventory: ['KeyI', 'Tab'],
            menu: ['Escape'],
            pause: ['KeyP'],
            quickSave: ['F5'],
            quickLoad: ['F9'],
            sprint: ['ShiftLeft', 'ShiftRight']
        };
    }
}

// Export singleton instance
export const inputSystem = new InputSystem();
