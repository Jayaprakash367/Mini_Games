/**
 * SaveSystem - Complete game persistence with LocalStorage
 * Handles save/load, auto-save, and multiple save slots
 */
export class SaveSystem {
    constructor() {
        this.STORAGE_KEY = 'messenger_game_save';
        this.AUTO_SAVE_KEY = 'messenger_game_autosave';
        this.SETTINGS_KEY = 'messenger_game_settings';
        this.autoSaveInterval = null;
        this.autoSaveDelay = 30000; // 30 seconds
    }
    
    /**
     * Save complete game state
     */
    save(gameState, slot = 'default') {
        try {
            const saveData = {
                version: '1.0.0',
                timestamp: Date.now(),
                slot: slot,
                data: {
                    player: this.serializePlayer(gameState.player),
                    quests: this.serializeQuests(gameState.questSystem),
                    inventory: this.serializeInventory(gameState.inventorySystem),
                    achievements: this.serializeAchievements(gameState.achievementSystem),
                    npcs: this.serializeNPCs(gameState.npcs),
                    pet: this.serializePet(gameState.petSystem),
                    currentArea: gameState.currentArea,
                    playTime: gameState.playTime || 0,
                    stats: gameState.stats || {}
                }
            };
            
            const key = slot === 'auto' ? this.AUTO_SAVE_KEY : `${this.STORAGE_KEY}_${slot}`;
            localStorage.setItem(key, JSON.stringify(saveData));
            
            console.log(`Game saved to slot: ${slot}`);
            return true;
        } catch (error) {
            console.error('Failed to save game:', error);
            return false;
        }
    }
    
    /**
     * Load game state from a slot
     */
    load(slot = 'default') {
        try {
            const key = slot === 'auto' ? this.AUTO_SAVE_KEY : `${this.STORAGE_KEY}_${slot}`;
            const saveDataStr = localStorage.getItem(key);
            
            if (!saveDataStr) {
                console.log('No save data found');
                return null;
            }
            
            const saveData = JSON.parse(saveDataStr);
            
            // Version migration if needed
            if (saveData.version !== '1.0.0') {
                console.log('Migrating save data from version:', saveData.version);
                // Add migration logic here
            }
            
            console.log(`Game loaded from slot: ${slot}`);
            return saveData.data;
        } catch (error) {
            console.error('Failed to load game:', error);
            return null;
        }
    }
    
    /**
     * Check if a save exists
     */
    hasSave(slot = 'default') {
        const key = slot === 'auto' ? this.AUTO_SAVE_KEY : `${this.STORAGE_KEY}_${slot}`;
        return localStorage.getItem(key) !== null;
    }
    
    /**
     * Get save metadata without loading full state
     */
    getSaveInfo(slot = 'default') {
        try {
            const key = slot === 'auto' ? this.AUTO_SAVE_KEY : `${this.STORAGE_KEY}_${slot}`;
            const saveDataStr = localStorage.getItem(key);
            
            if (!saveDataStr) return null;
            
            const saveData = JSON.parse(saveDataStr);
            return {
                slot: saveData.slot,
                timestamp: saveData.timestamp,
                playTime: saveData.data.playTime,
                currentArea: saveData.data.currentArea,
                questsCompleted: saveData.data.quests ? 
                    saveData.data.quests.filter(q => q.completed).length : 0
            };
        } catch (error) {
            return null;
        }
    }
    
    /**
     * Get all save slots
     */
    getAllSaves() {
        const saves = [];
        const slots = ['default', 'slot1', 'slot2', 'slot3', 'auto'];
        
        slots.forEach(slot => {
            const info = this.getSaveInfo(slot);
            if (info) {
                saves.push(info);
            }
        });
        
        return saves;
    }
    
    /**
     * Delete a save slot
     */
    deleteSave(slot = 'default') {
        try {
            const key = slot === 'auto' ? this.AUTO_SAVE_KEY : `${this.STORAGE_KEY}_${slot}`;
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Failed to delete save:', error);
            return false;
        }
    }
    
    /**
     * Save settings (separate from game state)
     */
    saveSettings(settings) {
        try {
            localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('Failed to save settings:', error);
            return false;
        }
    }
    
    /**
     * Load settings
     */
    loadSettings() {
        try {
            const settingsStr = localStorage.getItem(this.SETTINGS_KEY);
            if (!settingsStr) {
                return this.getDefaultSettings();
            }
            return { ...this.getDefaultSettings(), ...JSON.parse(settingsStr) };
        } catch (error) {
            return this.getDefaultSettings();
        }
    }
    
    getDefaultSettings() {
        return {
            masterVolume: 0.7,
            musicVolume: 0.5,
            sfxVolume: 0.8,
            musicEnabled: true,
            showFPS: false,
            keyboardControls: true,
            touchControls: false,
            language: 'en',
            accessibility: {
                highContrast: false,
                reducedMotion: false,
                largeText: false
            }
        };
    }
    
    /**
     * Start auto-save timer
     */
    startAutoSave(gameState) {
        this.stopAutoSave();
        
        this.autoSaveInterval = setInterval(() => {
            this.save(gameState, 'auto');
        }, this.autoSaveDelay);
        
        console.log('Auto-save started');
    }
    
    /**
     * Stop auto-save timer
     */
    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }
    
    // Serialization helpers
    serializePlayer(player) {
        if (!player) return null;
        return {
            x: player.x,
            y: player.y,
            bodyColor: player.bodyColor,
            skirtColor: player.skirtColor,
            hairColor: player.hairColor,
            currentOutfit: player.currentOutfit
        };
    }
    
    serializeQuests(questSystem) {
        if (!questSystem) return [];
        return questSystem.quests.map(quest => ({
            id: quest.id,
            name: quest.name,
            description: quest.description,
            progress: quest.progress,
            target: quest.target,
            completed: quest.completed,
            revealed: quest.revealed
        }));
    }
    
    serializeInventory(inventorySystem) {
        if (!inventorySystem) return { items: [], maxSlots: 20 };
        return {
            items: inventorySystem.items.map(item => ({
                id: item.id,
                name: item.name,
                type: item.type,
                quantity: item.quantity,
                icon: item.icon,
                description: item.description
            })),
            maxSlots: inventorySystem.maxSlots
        };
    }
    
    serializeAchievements(achievementSystem) {
        if (!achievementSystem) return [];
        return achievementSystem.achievements.map(achievement => ({
            id: achievement.id,
            unlocked: achievement.unlocked,
            unlockedAt: achievement.unlockedAt
        }));
    }
    
    serializeNPCs(npcs) {
        if (!npcs) return [];
        return npcs.map(npc => ({
            id: npc.id,
            interacted: npc.interacted || false,
            dialogueIndex: npc.dialogueIndex || 0,
            questGiven: npc.questGiven || false,
            questCompleted: npc.questCompleted || false
        }));
    }
    
    serializePet(petSystem) {
        if (!petSystem || !petSystem.currentPet) return null;
        return {
            type: petSystem.currentPet.type,
            name: petSystem.currentPet.name,
            happiness: petSystem.currentPet.happiness,
            color: petSystem.currentPet.color
        };
    }
    
    /**
     * Apply loaded data to game state
     */
    applyLoadedData(loadedData, gameState) {
        if (!loadedData) return false;
        
        try {
            // Apply player data
            if (loadedData.player && gameState.player) {
                Object.assign(gameState.player, loadedData.player);
            }
            
            // Apply quest data
            if (loadedData.quests && gameState.questSystem) {
                loadedData.quests.forEach(savedQuest => {
                    const quest = gameState.questSystem.quests.find(q => q.id === savedQuest.id);
                    if (quest) {
                        quest.progress = savedQuest.progress;
                        quest.completed = savedQuest.completed;
                        quest.revealed = savedQuest.revealed;
                    }
                });
            }
            
            // Apply inventory data
            if (loadedData.inventory && gameState.inventorySystem) {
                gameState.inventorySystem.items = loadedData.inventory.items || [];
            }
            
            // Apply achievement data
            if (loadedData.achievements && gameState.achievementSystem) {
                loadedData.achievements.forEach(savedAchievement => {
                    const achievement = gameState.achievementSystem.achievements.find(
                        a => a.id === savedAchievement.id
                    );
                    if (achievement) {
                        achievement.unlocked = savedAchievement.unlocked;
                        achievement.unlockedAt = savedAchievement.unlockedAt;
                    }
                });
            }
            
            // Apply NPC data
            if (loadedData.npcs && gameState.npcs) {
                loadedData.npcs.forEach(savedNpc => {
                    const npc = gameState.npcs.find(n => n.id === savedNpc.id);
                    if (npc) {
                        npc.interacted = savedNpc.interacted;
                        npc.dialogueIndex = savedNpc.dialogueIndex;
                        npc.questGiven = savedNpc.questGiven;
                        npc.questCompleted = savedNpc.questCompleted;
                    }
                });
            }
            
            // Apply pet data
            if (loadedData.pet && gameState.petSystem) {
                gameState.petSystem.setPet(loadedData.pet);
            }
            
            // Apply other data
            if (loadedData.currentArea) {
                gameState.currentArea = loadedData.currentArea;
            }
            
            if (loadedData.playTime) {
                gameState.playTime = loadedData.playTime;
            }
            
            if (loadedData.stats) {
                gameState.stats = loadedData.stats;
            }
            
            console.log('Game state restored successfully');
            return true;
        } catch (error) {
            console.error('Failed to apply loaded data:', error);
            return false;
        }
    }
    
    /**
     * Export save as downloadable file
     */
    exportSave(slot = 'default') {
        try {
            const key = slot === 'auto' ? this.AUTO_SAVE_KEY : `${this.STORAGE_KEY}_${slot}`;
            const saveData = localStorage.getItem(key);
            
            if (!saveData) return false;
            
            const blob = new Blob([saveData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `messenger_save_${slot}_${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
            
            return true;
        } catch (error) {
            console.error('Failed to export save:', error);
            return false;
        }
    }
    
    /**
     * Import save from file
     */
    async importSave(file, slot = 'default') {
        try {
            const text = await file.text();
            const saveData = JSON.parse(text);
            
            // Validate save data
            if (!saveData.version || !saveData.data) {
                throw new Error('Invalid save file format');
            }
            
            const key = slot === 'auto' ? this.AUTO_SAVE_KEY : `${this.STORAGE_KEY}_${slot}`;
            localStorage.setItem(key, JSON.stringify(saveData));
            
            return true;
        } catch (error) {
            console.error('Failed to import save:', error);
            return false;
        }
    }
    
    /**
     * Format play time for display
     */
    formatPlayTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }
    
    /**
     * Format timestamp for display
     */
    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }
}

// Export singleton instance
export const saveSystem = new SaveSystem();
