/**
 * MenuSystem - Pause menu, settings, and game state management
 * Features: Pause/resume, settings controls, save/load UI
 */
export class MenuSystem {
    constructor() {
        this.isPaused = false;
        this.currentMenu = null; // 'pause', 'settings', 'saves', 'controls', 'quit'
        this.menuStack = [];
        
        // Settings state
        this.settings = {
            masterVolume: 0.7,
            musicVolume: 0.5,
            sfxVolume: 0.8,
            musicEnabled: true,
            showFPS: false,
            keyboardControls: true,
            touchControls: false,
            screenShake: true,
            particleEffects: true,
            accessibility: {
                highContrast: false,
                reducedMotion: false,
                largeText: false
            }
        };
        
        // UI state
        this.selectedOption = 0;
        this.sliderDragging = null;
        
        // Callbacks
        this.onSettingsChange = null;
        this.onSave = null;
        this.onLoad = null;
        this.onQuit = null;
        this.onResume = null;
    }
    
    /**
     * Toggle pause state
     */
    togglePause() {
        if (this.isPaused) {
            this.resume();
        } else {
            this.pause();
        }
        return this.isPaused;
    }
    
    pause() {
        this.isPaused = true;
        this.currentMenu = 'pause';
        this.selectedOption = 0;
    }
    
    resume() {
        this.isPaused = false;
        this.currentMenu = null;
        this.menuStack = [];
        
        if (this.onResume) {
            this.onResume();
        }
    }
    
    /**
     * Open a submenu
     */
    openMenu(menuName) {
        this.menuStack.push(this.currentMenu);
        this.currentMenu = menuName;
        this.selectedOption = 0;
    }
    
    /**
     * Go back to previous menu
     */
    goBack() {
        if (this.menuStack.length > 0) {
            this.currentMenu = this.menuStack.pop();
            this.selectedOption = 0;
        } else {
            this.resume();
        }
    }
    
    /**
     * Update settings
     */
    updateSetting(key, value, subKey = null) {
        if (subKey) {
            if (this.settings[key]) {
                this.settings[key][subKey] = value;
            }
        } else {
            this.settings[key] = value;
        }
        
        if (this.onSettingsChange) {
            this.onSettingsChange(this.settings);
        }
    }
    
    /**
     * Get menu options for current menu
     */
    getMenuOptions() {
        switch (this.currentMenu) {
            case 'pause':
                return [
                    { id: 'resume', label: 'Resume Game', icon: '▶️' },
                    { id: 'settings', label: 'Settings', icon: '⚙️' },
                    { id: 'save', label: 'Save Game', icon: '💾' },
                    { id: 'load', label: 'Load Game', icon: '📂' },
                    { id: 'controls', label: 'Controls', icon: '🎮' },
                    { id: 'quit', label: 'Quit to Title', icon: '🚪' }
                ];
                
            case 'settings':
                return [
                    { id: 'masterVolume', label: 'Master Volume', type: 'slider', value: this.settings.masterVolume, icon: '🔊' },
                    { id: 'musicVolume', label: 'Music Volume', type: 'slider', value: this.settings.musicVolume, icon: '🎵' },
                    { id: 'sfxVolume', label: 'SFX Volume', type: 'slider', value: this.settings.sfxVolume, icon: '🔔' },
                    { id: 'musicEnabled', label: 'Music', type: 'toggle', value: this.settings.musicEnabled, icon: '🎶' },
                    { id: 'showFPS', label: 'Show FPS', type: 'toggle', value: this.settings.showFPS, icon: '📊' },
                    { id: 'screenShake', label: 'Screen Shake', type: 'toggle', value: this.settings.screenShake, icon: '📳' },
                    { id: 'particleEffects', label: 'Particles', type: 'toggle', value: this.settings.particleEffects, icon: '✨' },
                    { id: 'accessibility', label: 'Accessibility...', icon: '♿' },
                    { id: 'back', label: 'Back', icon: '⬅️' }
                ];
                
            case 'accessibility':
                return [
                    { id: 'highContrast', label: 'High Contrast', type: 'toggle', value: this.settings.accessibility.highContrast, icon: '🌓' },
                    { id: 'reducedMotion', label: 'Reduced Motion', type: 'toggle', value: this.settings.accessibility.reducedMotion, icon: '🐢' },
                    { id: 'largeText', label: 'Large Text', type: 'toggle', value: this.settings.accessibility.largeText, icon: '🔍' },
                    { id: 'back', label: 'Back', icon: '⬅️' }
                ];
                
            case 'controls':
                return [
                    { id: 'keyboard', label: 'Keyboard Controls', type: 'toggle', value: this.settings.keyboardControls, icon: '⌨️' },
                    { id: 'touch', label: 'Touch Controls', type: 'toggle', value: this.settings.touchControls, icon: '👆' },
                    { id: 'rebind', label: 'Rebind Keys...', icon: '🔧' },
                    { id: 'resetControls', label: 'Reset to Defaults', icon: '🔄' },
                    { id: 'back', label: 'Back', icon: '⬅️' }
                ];
                
            case 'saves':
                return [
                    { id: 'slot1', label: 'Save Slot 1', icon: '💾' },
                    { id: 'slot2', label: 'Save Slot 2', icon: '💾' },
                    { id: 'slot3', label: 'Save Slot 3', icon: '💾' },
                    { id: 'back', label: 'Back', icon: '⬅️' }
                ];
                
            case 'quit':
                return [
                    { id: 'confirmQuit', label: 'Yes, Quit', icon: '✓' },
                    { id: 'cancelQuit', label: 'No, Stay', icon: '✗' }
                ];
                
            default:
                return [];
        }
    }
    
    /**
     * Handle menu selection
     */
    selectOption(optionId) {
        switch (optionId) {
            case 'resume':
                this.resume();
                break;
            case 'settings':
                this.openMenu('settings');
                break;
            case 'save':
                this.openMenu('saves');
                break;
            case 'load':
                // Handle load directly
                if (this.onLoad) this.onLoad();
                break;
            case 'controls':
                this.openMenu('controls');
                break;
            case 'quit':
                this.openMenu('quit');
                break;
            case 'back':
                this.goBack();
                break;
            case 'accessibility':
                this.openMenu('accessibility');
                break;
            case 'confirmQuit':
                if (this.onQuit) this.onQuit();
                this.resume();
                break;
            case 'cancelQuit':
                this.goBack();
                break;
            case 'slot1':
            case 'slot2':
            case 'slot3':
                if (this.onSave) this.onSave(optionId);
                this.goBack();
                break;
        }
    }
    
    /**
     * Handle toggle option
     */
    toggleOption(optionId) {
        const accessibilitySettings = ['highContrast', 'reducedMotion', 'largeText'];
        
        if (accessibilitySettings.includes(optionId)) {
            const newValue = !this.settings.accessibility[optionId];
            this.updateSetting('accessibility', newValue, optionId);
        } else {
            const newValue = !this.settings[optionId];
            this.updateSetting(optionId, newValue);
        }
    }
    
    /**
     * Handle slider change
     */
    setSliderValue(optionId, value) {
        value = Math.max(0, Math.min(1, value));
        this.updateSetting(optionId, value);
    }
    
    /**
     * Navigate menu with keyboard
     */
    navigateUp() {
        const options = this.getMenuOptions();
        this.selectedOption = (this.selectedOption - 1 + options.length) % options.length;
    }
    
    navigateDown() {
        const options = this.getMenuOptions();
        this.selectedOption = (this.selectedOption + 1) % options.length;
    }
    
    confirmSelection() {
        const options = this.getMenuOptions();
        const selected = options[this.selectedOption];
        
        if (!selected) return;
        
        if (selected.type === 'toggle') {
            this.toggleOption(selected.id);
        } else if (selected.type === 'slider') {
            // Sliders handled by mouse
        } else {
            this.selectOption(selected.id);
        }
    }
    
    /**
     * Render pause menu
     */
    render(ctx, canvasWidth, canvasHeight) {
        if (!this.isPaused) return;
        
        // Darkened overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // Menu panel
        const panelWidth = 400;
        const panelHeight = this.currentMenu === 'pause' ? 380 : 450;
        const panelX = (canvasWidth - panelWidth) / 2;
        const panelY = (canvasHeight - panelHeight) / 2;
        
        // Panel background
        ctx.fillStyle = 'rgba(20, 30, 50, 0.95)';
        ctx.strokeStyle = '#4ECDC4';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(panelX, panelY, panelWidth, panelHeight, 15);
        ctx.fill();
        ctx.stroke();
        
        // Title
        ctx.fillStyle = '#4ECDC4';
        ctx.font = 'bold 28px "Silkscreen", monospace';
        ctx.textAlign = 'center';
        
        let title = 'PAUSED';
        switch (this.currentMenu) {
            case 'settings': title = '⚙️ SETTINGS'; break;
            case 'controls': title = '🎮 CONTROLS'; break;
            case 'saves': title = '💾 SAVE GAME'; break;
            case 'quit': title = '🚪 QUIT?'; break;
            case 'accessibility': title = '♿ ACCESSIBILITY'; break;
        }
        
        ctx.fillText(title, panelX + panelWidth / 2, panelY + 45);
        
        // Menu options
        const options = this.getMenuOptions();
        const optionHeight = 50;
        const startY = panelY + 80;
        
        options.forEach((option, index) => {
            const optY = startY + index * optionHeight;
            const isSelected = index === this.selectedOption;
            
            // Option background
            if (isSelected) {
                ctx.fillStyle = 'rgba(78, 205, 196, 0.3)';
                ctx.beginPath();
                ctx.roundRect(panelX + 20, optY, panelWidth - 40, optionHeight - 5, 8);
                ctx.fill();
                
                ctx.strokeStyle = '#4ECDC4';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
            
            // Icon
            ctx.font = '20px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillStyle = '#fff';
            ctx.fillText(option.icon, panelX + 35, optY + 30);
            
            // Label
            ctx.fillStyle = isSelected ? '#4ECDC4' : '#fff';
            ctx.font = `${isSelected ? 'bold' : 'normal'} 18px "Inter", sans-serif`;
            ctx.fillText(option.label, panelX + 70, optY + 30);
            
            // Value for toggles and sliders
            if (option.type === 'toggle') {
                const toggleX = panelX + panelWidth - 80;
                const toggleY = optY + 15;
                const toggleWidth = 50;
                const toggleHeight = 24;
                
                // Toggle background
                ctx.fillStyle = option.value ? '#4ECDC4' : '#555';
                ctx.beginPath();
                ctx.roundRect(toggleX, toggleY, toggleWidth, toggleHeight, toggleHeight / 2);
                ctx.fill();
                
                // Toggle knob
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                const knobX = option.value ? toggleX + toggleWidth - toggleHeight + 4 : toggleX + 4;
                ctx.arc(knobX + (toggleHeight - 8) / 2, toggleY + toggleHeight / 2, (toggleHeight - 8) / 2, 0, Math.PI * 2);
                ctx.fill();
            }
            
            if (option.type === 'slider') {
                const sliderX = panelX + panelWidth - 170;
                const sliderY = optY + 18;
                const sliderWidth = 120;
                const sliderHeight = 10;
                
                // Slider track
                ctx.fillStyle = '#333';
                ctx.beginPath();
                ctx.roundRect(sliderX, sliderY, sliderWidth, sliderHeight, 5);
                ctx.fill();
                
                // Slider fill
                ctx.fillStyle = '#4ECDC4';
                const fillWidth = sliderWidth * option.value;
                ctx.beginPath();
                ctx.roundRect(sliderX, sliderY, fillWidth, sliderHeight, 5);
                ctx.fill();
                
                // Slider handle
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(sliderX + fillWidth, sliderY + sliderHeight / 2, 8, 0, Math.PI * 2);
                ctx.fill();
                
                // Value text
                ctx.fillStyle = '#aaa';
                ctx.font = '12px "Inter", sans-serif';
                ctx.textAlign = 'right';
                ctx.fillText(`${Math.round(option.value * 100)}%`, panelX + panelWidth - 30, optY + 28);
            }
        });
        
        // Navigation hints
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '12px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('↑↓ Navigate • Enter Select • Esc Back', panelX + panelWidth / 2, panelY + panelHeight - 15);
    }
    
    /**
     * Handle click in menu
     */
    handleClick(clickX, clickY, canvasWidth, canvasHeight) {
        if (!this.isPaused) return null;
        
        const panelWidth = 400;
        const panelHeight = this.currentMenu === 'pause' ? 380 : 450;
        const panelX = (canvasWidth - panelWidth) / 2;
        const panelY = (canvasHeight - panelHeight) / 2;
        
        const options = this.getMenuOptions();
        const optionHeight = 50;
        const startY = panelY + 80;
        
        for (let i = 0; i < options.length; i++) {
            const optY = startY + i * optionHeight;
            
            if (clickX >= panelX + 20 && clickX <= panelX + panelWidth - 20 &&
                clickY >= optY && clickY <= optY + optionHeight - 5) {
                
                this.selectedOption = i;
                const option = options[i];
                
                // Handle slider drag
                if (option.type === 'slider') {
                    const sliderX = panelX + panelWidth - 170;
                    const sliderWidth = 120;
                    
                    if (clickX >= sliderX && clickX <= sliderX + sliderWidth) {
                        const value = (clickX - sliderX) / sliderWidth;
                        this.setSliderValue(option.id, value);
                        return { type: 'slider', option: option.id, value };
                    }
                }
                
                // Handle toggle
                if (option.type === 'toggle') {
                    const toggleX = panelX + panelWidth - 80;
                    if (clickX >= toggleX) {
                        this.toggleOption(option.id);
                        return { type: 'toggle', option: option.id };
                    }
                }
                
                // Handle button
                if (!option.type) {
                    this.selectOption(option.id);
                    return { type: 'select', option: option.id };
                }
                
                return { type: 'select', index: i };
            }
        }
        
        return null;
    }
    
    /**
     * Render FPS counter if enabled
     */
    renderFPS(ctx, fps) {
        if (!this.settings.showFPS) return;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(5, 5, 60, 25);
        
        ctx.fillStyle = fps >= 55 ? '#4CAF50' : fps >= 30 ? '#FF9800' : '#F44336';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`${Math.round(fps)} FPS`, 10, 22);
    }
    
    /**
     * Get settings state
     */
    getSettings() {
        return { ...this.settings };
    }
    
    /**
     * Load settings
     */
    loadSettings(settings) {
        if (!settings) return;
        
        this.settings = {
            ...this.settings,
            ...settings,
            accessibility: {
                ...this.settings.accessibility,
                ...(settings.accessibility || {})
            }
        };
        
        if (this.onSettingsChange) {
            this.onSettingsChange(this.settings);
        }
    }
}

// Export singleton instance
export const menuSystem = new MenuSystem();
