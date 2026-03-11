/**
 * PetSystem - Companion pets that follow the player
 * Features: Pet selection, animations, happiness, interactions
 */
export class PetSystem {
    constructor() {
        this.currentPet = null;
        this.unlockedPets = ['cat']; // Start with cat unlocked
        this.isSelectionOpen = false;
        
        // Pet definitions
        this.petTypes = {
            cat: {
                id: 'cat',
                name: 'Whiskers',
                icon: '🐱',
                description: 'A curious cat that loves to explore.',
                color: '#FFA500',
                accentColor: '#FFD700',
                speed: 0.9,
                unlockCondition: 'default',
                sounds: ['meow', 'purr']
            },
            dog: {
                id: 'dog',
                name: 'Buddy',
                icon: '🐕',
                description: 'A loyal dog always happy to see you.',
                color: '#8B4513',
                accentColor: '#D2691E',
                speed: 1.1,
                unlockCondition: 'complete_3_quests',
                sounds: ['bark', 'woof']
            },
            bunny: {
                id: 'bunny',
                name: 'Fluffy',
                icon: '🐰',
                description: 'A bouncy bunny that hops along beside you.',
                color: '#FFFFFF',
                accentColor: '#FFB6C1',
                speed: 1.0,
                unlockCondition: 'find_5_collectibles',
                sounds: ['squeak']
            },
            bird: {
                id: 'bird',
                name: 'Chirpy',
                icon: '🐦',
                description: 'A cheerful bird that flies around you.',
                color: '#4169E1',
                accentColor: '#87CEEB',
                speed: 1.2,
                unlockCondition: 'visit_all_areas',
                sounds: ['chirp', 'tweet']
            },
            fox: {
                id: 'fox',
                name: 'Rusty',
                icon: '🦊',
                description: 'A clever fox with a bushy tail.',
                color: '#FF6347',
                accentColor: '#FFFFFF',
                speed: 1.0,
                unlockCondition: 'complete_all_quests',
                sounds: ['yip']
            },
            dragon: {
                id: 'dragon',
                name: 'Ember',
                icon: '🐲',
                description: 'A tiny dragon that breathes sparkles!',
                color: '#9400D3',
                accentColor: '#FF4500',
                speed: 0.95,
                unlockCondition: 'secret',
                sounds: ['roar']
            }
        };
        
        // Pet state
        this.petState = {
            x: 0,
            y: 0,
            targetX: 0,
            targetY: 0,
            happiness: 100,
            animationTime: 0,
            facingLeft: false,
            isIdling: true,
            actionTimer: 0,
            currentAction: 'follow'
        };
        
        this.followDistance = 60;
        this.idleThreshold = 20;
        
        // Callbacks
        this.onPetUnlocked = null;
        this.onPetChanged = null;
        this.onPetAction = null;
    }
    
    /**
     * Select a pet to accompany the player
     */
    selectPet(petId) {
        if (!this.unlockedPets.includes(petId)) {
            console.warn('Pet not unlocked:', petId);
            return false;
        }
        
        const petData = this.petTypes[petId];
        if (!petData) return false;
        
        this.currentPet = {
            ...petData,
            happiness: 100,
            lastFed: Date.now(),
            lastPetted: Date.now()
        };
        
        if (this.onPetChanged) {
            this.onPetChanged(this.currentPet);
        }
        
        return true;
    }
    
    /**
     * Dismiss current pet
     */
    dismissPet() {
        this.currentPet = null;
        if (this.onPetChanged) {
            this.onPetChanged(null);
        }
    }
    
    /**
     * Unlock a new pet
     */
    unlockPet(petId) {
        if (this.unlockedPets.includes(petId)) return false;
        
        const petData = this.petTypes[petId];
        if (!petData) return false;
        
        this.unlockedPets.push(petId);
        
        if (this.onPetUnlocked) {
            this.onPetUnlocked(petData);
        }
        
        return true;
    }
    
    /**
     * Check if pet should be unlocked based on game state
     */
    checkUnlocks(gameState) {
        Object.entries(this.petTypes).forEach(([petId, petData]) => {
            if (this.unlockedPets.includes(petId)) return;
            
            let shouldUnlock = false;
            
            switch (petData.unlockCondition) {
                case 'complete_3_quests':
                    if (gameState.completedQuests >= 3) shouldUnlock = true;
                    break;
                case 'find_5_collectibles':
                    if (gameState.collectiblesFound >= 5) shouldUnlock = true;
                    break;
                case 'visit_all_areas':
                    if (gameState.areasVisited >= 3) shouldUnlock = true;
                    break;
                case 'complete_all_quests':
                    if (gameState.completedQuests >= 5) shouldUnlock = true;
                    break;
                case 'secret':
                    // Unlocked by special condition
                    break;
            }
            
            if (shouldUnlock) {
                this.unlockPet(petId);
            }
        });
    }
    
    /**
     * Update pet each frame
     */
    update(deltaTime, playerX, playerY) {
        if (!this.currentPet) return;
        
        this.petState.animationTime += deltaTime;
        
        // Update target position (follow player)
        const offsetX = this.petState.facingLeft ? this.followDistance : -this.followDistance;
        this.petState.targetX = playerX + offsetX;
        this.petState.targetY = playerY + 20;
        
        // Calculate distance to target
        const dx = this.petState.targetX - this.petState.x;
        const dy = this.petState.targetY - this.petState.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Update facing direction based on player position
        if (Math.abs(dx) > 10) {
            this.petState.facingLeft = dx < 0;
        }
        
        // Move towards target if too far
        if (distance > this.idleThreshold) {
            this.petState.isIdling = false;
            const speed = (this.currentPet.speed || 1) * 150 * (deltaTime / 1000);
            
            this.petState.x += (dx / distance) * Math.min(speed, distance);
            this.petState.y += (dy / distance) * Math.min(speed, distance);
        } else {
            this.petState.isIdling = true;
        }
        
        // Update happiness over time
        const timeSinceFed = Date.now() - (this.currentPet.lastFed || Date.now());
        const timeSincePetted = Date.now() - (this.currentPet.lastPetted || Date.now());
        
        // Decrease happiness slowly over time
        const happinessDecay = deltaTime * 0.001; // Lose 1 happiness per second
        this.currentPet.happiness = Math.max(0, this.currentPet.happiness - happinessDecay);
        
        // Random actions
        this.petState.actionTimer -= deltaTime;
        if (this.petState.actionTimer <= 0 && this.petState.isIdling) {
            this.petState.actionTimer = 3000 + Math.random() * 5000;
            this.performRandomAction();
        }
    }
    
    /**
     * Pet does a random idle action
     */
    performRandomAction() {
        const actions = ['lookAround', 'sit', 'play', 'jump'];
        this.petState.currentAction = actions[Math.floor(Math.random() * actions.length)];
        
        setTimeout(() => {
            this.petState.currentAction = 'follow';
        }, 1000);
        
        if (this.onPetAction) {
            this.onPetAction(this.petState.currentAction);
        }
    }
    
    /**
     * Feed the pet (increases happiness)
     */
    feedPet(amount = 20) {
        if (!this.currentPet) return false;
        
        this.currentPet.happiness = Math.min(100, this.currentPet.happiness + amount);
        this.currentPet.lastFed = Date.now();
        this.petState.currentAction = 'happy';
        
        setTimeout(() => {
            this.petState.currentAction = 'follow';
        }, 1500);
        
        return true;
    }
    
    /**
     * Pet the pet (increases happiness)
     */
    petThePet() {
        if (!this.currentPet) return false;
        
        this.currentPet.happiness = Math.min(100, this.currentPet.happiness + 10);
        this.currentPet.lastPetted = Date.now();
        this.petState.currentAction = 'happy';
        
        setTimeout(() => {
            this.petState.currentAction = 'follow';
        }, 1000);
        
        return true;
    }
    
    /**
     * Render pet on canvas
     */
    render(ctx, cameraX = 0, cameraY = 0) {
        if (!this.currentPet) return;
        
        const screenX = this.petState.x - cameraX;
        const screenY = this.petState.y - cameraY;
        const time = this.petState.animationTime / 1000;
        
        ctx.save();
        
        // Flip if facing left
        if (this.petState.facingLeft) {
            ctx.translate(screenX, screenY);
            ctx.scale(-1, 1);
            ctx.translate(-screenX, screenY);
        }
        
        // Pet shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(screenX, screenY + 15, 12, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Animation offsets
        const bobY = Math.sin(time * 3) * (this.petState.isIdling ? 2 : 4);
        const bounceY = this.petState.currentAction === 'jump' ? -10 : 0;
        
        // Draw pet based on type
        this.drawPetBody(ctx, screenX, screenY + bobY + bounceY, this.currentPet.id);
        
        // Happiness indicator
        if (this.currentPet.happiness < 50) {
            ctx.fillStyle = '#FFD700';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('💤', screenX, screenY - 25);
        } else if (this.petState.currentAction === 'happy') {
            ctx.fillStyle = '#FF69B4';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('❤️', screenX + Math.random() * 10 - 5, screenY - 25 - Math.random() * 5);
        }
        
        ctx.restore();
    }
    
    /**
     * Draw pet body based on type
     */
    drawPetBody(ctx, x, y, petId) {
        const pet = this.petTypes[petId];
        const time = this.petState.animationTime / 1000;
        
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        
        switch (petId) {
            case 'cat':
                this.drawCat(ctx, x, y, pet.color, pet.accentColor, time);
                break;
            case 'dog':
                this.drawDog(ctx, x, y, pet.color, pet.accentColor, time);
                break;
            case 'bunny':
                this.drawBunny(ctx, x, y, pet.color, pet.accentColor, time);
                break;
            case 'bird':
                this.drawBird(ctx, x, y, pet.color, pet.accentColor, time);
                break;
            case 'fox':
                this.drawFox(ctx, x, y, pet.color, pet.accentColor, time);
                break;
            case 'dragon':
                this.drawDragon(ctx, x, y, pet.color, pet.accentColor, time);
                break;
            default:
                // Generic pet
                ctx.fillStyle = pet.color;
                ctx.beginPath();
                ctx.ellipse(x, y, 15, 12, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
        }
    }
    
    drawCat(ctx, x, y, color, accent, time) {
        // Body
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(x, y, 14, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Head
        ctx.beginPath();
        ctx.arc(x + 10, y - 5, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Ears
        ctx.beginPath();
        ctx.moveTo(x + 5, y - 12);
        ctx.lineTo(x + 8, y - 20);
        ctx.lineTo(x + 12, y - 12);
        ctx.fill();
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(x + 12, y - 12);
        ctx.lineTo(x + 15, y - 20);
        ctx.lineTo(x + 18, y - 12);
        ctx.fill();
        ctx.stroke();
        
        // Eyes
        ctx.fillStyle = '#000';
        const blink = Math.sin(time * 2) > 0.95 ? 0.5 : 3;
        ctx.beginPath();
        ctx.ellipse(x + 7, y - 5, 2, blink, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x + 13, y - 5, 2, blink, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Tail
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x - 14, y);
        ctx.quadraticCurveTo(x - 25, y - 10 + Math.sin(time * 3) * 5, x - 20, y - 15);
        ctx.stroke();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
    }
    
    drawDog(ctx, x, y, color, accent, time) {
        // Body
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(x, y, 16, 11, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Head
        ctx.beginPath();
        ctx.ellipse(x + 12, y - 4, 11, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Snout
        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.ellipse(x + 20, y - 2, 5, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Nose
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(x + 23, y - 2, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Ears (floppy)
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(x + 5, y - 8 + Math.sin(time * 4) * 1, 6, 10, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Eyes
        const blink = Math.sin(time * 2) > 0.95 ? 0.5 : 3;
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.ellipse(x + 14, y - 6, 2, blink, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Tail (wagging)
        ctx.strokeStyle = color;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(x - 16, y);
        ctx.quadraticCurveTo(x - 22 + Math.sin(time * 8) * 5, y - 8, x - 18, y - 12);
        ctx.stroke();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
    }
    
    drawBunny(ctx, x, y, color, accent, time) {
        // Body
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(x, y, 12, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Head
        ctx.beginPath();
        ctx.arc(x + 8, y - 3, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Ears (long)
        ctx.beginPath();
        ctx.ellipse(x + 4, y - 22, 4, 12, -0.2 + Math.sin(time * 2) * 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        ctx.beginPath();
        ctx.ellipse(x + 12, y - 22, 4, 12, 0.2 + Math.sin(time * 2 + 0.5) * 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Inner ears
        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.ellipse(x + 4, y - 22, 2, 8, -0.2 + Math.sin(time * 2) * 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x + 12, y - 22, 2, 8, 0.2 + Math.sin(time * 2 + 0.5) * 0.1, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#000';
        const blink = Math.sin(time * 2) > 0.95 ? 0.5 : 3;
        ctx.beginPath();
        ctx.ellipse(x + 5, y - 4, 2, blink, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x + 11, y - 4, 2, blink, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Nose
        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.arc(x + 8, y, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Tail (puffball)
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x - 12, y + 2, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }
    
    drawBird(ctx, x, y, color, accent, time) {
        // Wing flap animation
        const wingAngle = Math.sin(time * 10) * 0.5;
        
        // Body
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(x, y, 10, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Wings
        ctx.save();
        ctx.translate(x - 5, y - 3);
        ctx.rotate(wingAngle);
        ctx.beginPath();
        ctx.ellipse(0, 0, 8, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        
        ctx.save();
        ctx.translate(x + 5, y - 3);
        ctx.rotate(-wingAngle);
        ctx.beginPath();
        ctx.ellipse(0, 0, 8, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        
        // Head
        ctx.beginPath();
        ctx.arc(x + 8, y - 5, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Beak
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.moveTo(x + 14, y - 5);
        ctx.lineTo(x + 20, y - 4);
        ctx.lineTo(x + 14, y - 3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Eye
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(x + 10, y - 6, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Tail feathers
        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.moveTo(x - 10, y);
        ctx.lineTo(x - 18, y - 3);
        ctx.lineTo(x - 16, y + 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
    
    drawFox(ctx, x, y, color, accent, time) {
        // Body
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(x, y, 15, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Head
        ctx.beginPath();
        ctx.ellipse(x + 12, y - 3, 10, 8, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Snout
        ctx.beginPath();
        ctx.moveTo(x + 18, y - 2);
        ctx.lineTo(x + 26, y + 1);
        ctx.lineTo(x + 18, y + 3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // White chest
        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.ellipse(x + 5, y + 3, 6, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Ears
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x + 7, y - 8);
        ctx.lineTo(x + 5, y - 18);
        ctx.lineTo(x + 12, y - 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(x + 14, y - 8);
        ctx.lineTo(x + 17, y - 18);
        ctx.lineTo(x + 20, y - 8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Eyes
        ctx.fillStyle = '#000';
        const blink = Math.sin(time * 2) > 0.95 ? 0.5 : 3;
        ctx.beginPath();
        ctx.ellipse(x + 14, y - 4, 2, blink, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Nose
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(x + 25, y + 1, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Tail (fluffy)
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x - 15, y);
        ctx.quadraticCurveTo(x - 30, y - 15 + Math.sin(time * 2) * 5, x - 28, y - 5);
        ctx.quadraticCurveTo(x - 25, y + 5, x - 15, y + 5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // White tail tip
        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.arc(x - 27, y - 8 + Math.sin(time * 2) * 5, 4, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawDragon(ctx, x, y, color, accent, time) {
        // Body
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(x, y, 14, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Wings
        const wingFlap = Math.sin(time * 6) * 0.3;
        ctx.save();
        ctx.translate(x - 5, y - 8);
        ctx.rotate(-0.5 + wingFlap);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-15, -8);
        ctx.lineTo(-12, 0);
        ctx.lineTo(-8, -5);
        ctx.lineTo(-5, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        
        ctx.save();
        ctx.translate(x + 5, y - 8);
        ctx.rotate(0.5 - wingFlap);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(15, -8);
        ctx.lineTo(12, 0);
        ctx.lineTo(8, -5);
        ctx.lineTo(5, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        
        // Head
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(x + 10, y - 5, 9, 7, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Horns
        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.moveTo(x + 5, y - 10);
        ctx.lineTo(x + 2, y - 18);
        ctx.lineTo(x + 8, y - 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(x + 12, y - 10);
        ctx.lineTo(x + 15, y - 18);
        ctx.lineTo(x + 18, y - 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Eyes (glowing)
        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.arc(x + 12, y - 6, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(x + 12, y - 6, 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Snout and nostrils
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(x + 18, y - 3, 4, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Fire breath particles (occasional)
        if (Math.sin(time * 0.5) > 0.7) {
            ctx.fillStyle = accent;
            for (let i = 0; i < 3; i++) {
                const px = x + 22 + i * 4 + Math.random() * 3;
                const py = y - 3 + Math.sin(time * 10 + i) * 3;
                ctx.beginPath();
                ctx.arc(px, py, 2 - i * 0.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Tail (spiky)
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x - 14, y);
        ctx.quadraticCurveTo(x - 25, y + 5, x - 30, y - 5 + Math.sin(time * 2) * 3);
        ctx.lineTo(x - 28, y - 2);
        ctx.lineTo(x - 25, y - 8);
        ctx.lineTo(x - 22, y);
        ctx.lineTo(x - 14, y + 5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
    
    /**
     * Initialize pet position near player
     */
    initPosition(playerX, playerY) {
        this.petState.x = playerX - this.followDistance;
        this.petState.y = playerY + 20;
    }
    
    /**
     * Toggle selection menu
     */
    toggleSelection() {
        this.isSelectionOpen = !this.isSelectionOpen;
        return this.isSelectionOpen;
    }
    
    /**
     * Render pet selection UI
     */
    renderSelectionUI(ctx, x, y, width, height) {
        if (!this.isSelectionOpen) return;
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.strokeStyle = '#4ECDC4';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, 15);
        ctx.fill();
        ctx.stroke();
        
        // Title
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px "Silkscreen", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('🐾 Choose Your Pet', x + width / 2, y + 35);
        
        // Pet grid
        const cols = 3;
        const cellWidth = (width - 60) / cols;
        const cellHeight = 100;
        const startX = x + 30;
        const startY = y + 60;
        
        let index = 0;
        Object.entries(this.petTypes).forEach(([petId, pet]) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            const cellX = startX + col * cellWidth;
            const cellY = startY + row * cellHeight;
            
            const isUnlocked = this.unlockedPets.includes(petId);
            const isSelected = this.currentPet && this.currentPet.id === petId;
            
            // Cell background
            ctx.fillStyle = isSelected ? 'rgba(78, 205, 196, 0.4)' : 
                           isUnlocked ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.3)';
            ctx.strokeStyle = isSelected ? '#4ECDC4' : isUnlocked ? 'rgba(255, 255, 255, 0.3)' : '#333';
            ctx.lineWidth = isSelected ? 2 : 1;
            ctx.beginPath();
            ctx.roundRect(cellX, cellY, cellWidth - 10, cellHeight - 10, 10);
            ctx.fill();
            ctx.stroke();
            
            // Pet icon
            ctx.font = '32px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = isUnlocked ? '#fff' : '#666';
            ctx.fillText(isUnlocked ? pet.icon : '🔒', cellX + (cellWidth - 10) / 2, cellY + 40);
            
            // Pet name
            ctx.font = '14px "Inter", sans-serif';
            ctx.fillText(isUnlocked ? pet.name : '???', cellX + (cellWidth - 10) / 2, cellY + 65);
            
            // Unlock condition hint
            if (!isUnlocked) {
                ctx.font = '10px "Inter", sans-serif';
                ctx.fillStyle = '#888';
                ctx.fillText(this.getUnlockHint(pet.unlockCondition), cellX + (cellWidth - 10) / 2, cellY + 80);
            }
            
            index++;
        });
        
        // Current pet info
        if (this.currentPet) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.beginPath();
            ctx.roundRect(x + 20, y + height - 80, width - 40, 60, 8);
            ctx.fill();
            
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 16px "Inter", sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(`${this.currentPet.icon} ${this.currentPet.name}`, x + 35, y + height - 55);
            
            // Happiness bar
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.beginPath();
            ctx.roundRect(x + 35, y + height - 45, 150, 15, 4);
            ctx.fill();
            
            const happinessWidth = (this.currentPet.happiness / 100) * 150;
            ctx.fillStyle = this.currentPet.happiness > 50 ? '#4ECDC4' : '#FF6B6B';
            ctx.beginPath();
            ctx.roundRect(x + 35, y + height - 45, happinessWidth, 15, 4);
            ctx.fill();
            
            ctx.fillStyle = '#fff';
            ctx.font = '10px "Inter", sans-serif';
            ctx.fillText(`❤️ ${Math.round(this.currentPet.happiness)}%`, x + 40, y + height - 33);
            
            // Dismiss button
            ctx.fillStyle = '#FF6B6B';
            ctx.beginPath();
            ctx.roundRect(x + width - 100, y + height - 55, 70, 30, 5);
            ctx.fill();
            
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px "Inter", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Dismiss', x + width - 65, y + height - 35);
        }
        
        // Close hint
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '12px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Click a pet to select • Press ESC to close', x + width / 2, y + height - 10);
    }
    
    /**
     * Get human-readable unlock hint
     */
    getUnlockHint(condition) {
        const hints = {
            'default': 'Unlocked',
            'complete_3_quests': 'Complete 3 quests',
            'find_5_collectibles': 'Find 5 items',
            'visit_all_areas': 'Explore everywhere',
            'complete_all_quests': 'Complete all quests',
            'secret': '???'
        };
        return hints[condition] || condition;
    }
    
    /**
     * Handle click in pet selection UI
     */
    handleSelectionClick(clickX, clickY, uiX, uiY, width, height) {
        if (!this.isSelectionOpen) return null;
        
        const cols = 3;
        const cellWidth = (width - 60) / cols;
        const cellHeight = 100;
        const startX = uiX + 30;
        const startY = uiY + 60;
        
        let index = 0;
        for (const [petId, pet] of Object.entries(this.petTypes)) {
            const col = index % cols;
            const row = Math.floor(index / cols);
            const cellX = startX + col * cellWidth;
            const cellY = startY + row * cellHeight;
            
            if (clickX >= cellX && clickX <= cellX + cellWidth - 10 &&
                clickY >= cellY && clickY <= cellY + cellHeight - 10) {
                
                if (this.unlockedPets.includes(petId)) {
                    if (this.currentPet && this.currentPet.id === petId) {
                        // Deselect
                        this.dismissPet();
                    } else {
                        this.selectPet(petId);
                    }
                    return petId;
                }
            }
            index++;
        }
        
        // Check dismiss button
        if (this.currentPet) {
            const dismissX = uiX + width - 100;
            const dismissY = uiY + height - 55;
            if (clickX >= dismissX && clickX <= dismissX + 70 &&
                clickY >= dismissY && clickY <= dismissY + 30) {
                this.dismissPet();
                return 'dismissed';
            }
        }
        
        return null;
    }
    
    /**
     * Get state for saving
     */
    getState() {
        return {
            currentPet: this.currentPet ? {
                id: this.currentPet.id,
                name: this.currentPet.name,
                happiness: this.currentPet.happiness
            } : null,
            unlockedPets: [...this.unlockedPets],
            position: { x: this.petState.x, y: this.petState.y }
        };
    }
    
    /**
     * Load state from save
     */
    loadState(state) {
        if (!state) return;
        
        this.unlockedPets = state.unlockedPets || ['cat'];
        
        if (state.currentPet) {
            this.selectPet(state.currentPet.id);
            if (this.currentPet) {
                this.currentPet.happiness = state.currentPet.happiness || 100;
            }
        }
        
        if (state.position) {
            this.petState.x = state.position.x;
            this.petState.y = state.position.y;
        }
    }
    
    /**
     * Set a pet from loaded data
     */
    setPet(petData) {
        if (!petData || !petData.type) return;
        
        if (!this.unlockedPets.includes(petData.type)) {
            this.unlockPet(petData.type);
        }
        
        this.selectPet(petData.type);
        
        if (this.currentPet && petData.happiness !== undefined) {
            this.currentPet.happiness = petData.happiness;
        }
        
        if (this.currentPet && petData.name) {
            this.currentPet.name = petData.name;
        }
    }
}

// Export singleton instance
export const petSystem = new PetSystem();
