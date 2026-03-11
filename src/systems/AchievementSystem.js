/**
 * AchievementSystem - Track and reward player accomplishments
 * Features: Progress tracking, unlock notifications, badges display
 */
export class AchievementSystem {
    constructor() {
        this.achievements = [];
        this.recentUnlocks = [];
        this.isDisplayOpen = false;
        
        // Callbacks
        this.onAchievementUnlocked = null;
        
        // Initialize achievements
        this.initAchievements();
    }
    
    initAchievements() {
        this.achievements = [
            // Story Progress
            {
                id: 'first_steps',
                name: 'First Steps',
                description: 'Start your messenger journey',
                icon: '👣',
                category: 'story',
                condition: { type: 'gameStarted' },
                unlocked: false,
                unlockedAt: null,
                points: 10
            },
            {
                id: 'harbor_helper',
                name: 'Harbor Helper',
                description: 'Complete your first harbor delivery',
                icon: '⚓',
                category: 'story',
                condition: { type: 'questComplete', questId: 'harbor_delivery' },
                unlocked: false,
                unlockedAt: null,
                points: 25
            },
            {
                id: 'market_messenger',
                name: 'Market Messenger',
                description: 'Complete a delivery in the market district',
                icon: '🛒',
                category: 'story',
                condition: { type: 'questComplete', questId: 'lunch_delivery' },
                unlocked: false,
                unlockedAt: null,
                points: 25
            },
            {
                id: 'stargazer',
                name: 'Stargazer',
                description: 'Help the observatory keeper',
                icon: '🔭',
                category: 'story',
                condition: { type: 'questComplete', questId: 'telescope_lens' },
                unlocked: false,
                unlockedAt: null,
                points: 25
            },
            {
                id: 'master_messenger',
                name: 'Master Messenger',
                description: 'Complete all deliveries',
                icon: '🏆',
                category: 'story',
                condition: { type: 'allQuestsComplete' },
                unlocked: false,
                unlockedAt: null,
                points: 100
            },
            
            // Exploration
            {
                id: 'explorer',
                name: 'Explorer',
                description: 'Visit all three areas of the town',
                icon: '🗺️',
                category: 'exploration',
                condition: { type: 'areasVisited', count: 3 },
                unlocked: false,
                unlockedAt: null,
                points: 30
            },
            {
                id: 'wanderer',
                name: 'Wanderer',
                description: 'Walk a total of 1000 steps',
                icon: '🚶',
                category: 'exploration',
                condition: { type: 'stepsWalked', count: 1000 },
                unlocked: false,
                unlockedAt: null,
                points: 20
            },
            {
                id: 'marathon',
                name: 'Marathon Runner',
                description: 'Walk a total of 5000 steps',
                icon: '🏃',
                category: 'exploration',
                condition: { type: 'stepsWalked', count: 5000 },
                unlocked: false,
                unlockedAt: null,
                points: 50
            },
            
            // Social
            {
                id: 'friendly',
                name: 'Making Friends',
                description: 'Talk to 3 different NPCs',
                icon: '👋',
                category: 'social',
                condition: { type: 'npcsInteracted', count: 3 },
                unlocked: false,
                unlockedAt: null,
                points: 15
            },
            {
                id: 'social_butterfly',
                name: 'Social Butterfly',
                description: 'Talk to all NPCs in town',
                icon: '🦋',
                category: 'social',
                condition: { type: 'npcsInteracted', count: 6 },
                unlocked: false,
                unlockedAt: null,
                points: 40
            },
            {
                id: 'good_listener',
                name: 'Good Listener',
                description: 'Read through 10 dialogue sequences',
                icon: '👂',
                category: 'social',
                condition: { type: 'dialoguesCompleted', count: 10 },
                unlocked: false,
                unlockedAt: null,
                points: 25
            },
            
            // Collection
            {
                id: 'collector_beginner',
                name: 'Budding Collector',
                description: 'Find your first collectible item',
                icon: '⭐',
                category: 'collection',
                condition: { type: 'itemsCollected', count: 1 },
                unlocked: false,
                unlockedAt: null,
                points: 10
            },
            {
                id: 'collector_intermediate',
                name: 'Avid Collector',
                description: 'Collect 10 items',
                icon: '🌟',
                category: 'collection',
                condition: { type: 'itemsCollected', count: 10 },
                unlocked: false,
                unlockedAt: null,
                points: 35
            },
            {
                id: 'shell_collector',
                name: 'Shell Collector',
                description: 'Find 5 seashells',
                icon: '🐚',
                category: 'collection',
                condition: { type: 'specificItem', itemId: 'seashell', count: 5 },
                unlocked: false,
                unlockedAt: null,
                points: 20
            },
            {
                id: 'pearl_diver',
                name: 'Pearl Diver',
                description: 'Find a rare pearl',
                icon: '💎',
                category: 'collection',
                condition: { type: 'specificItem', itemId: 'pearl', count: 1 },
                unlocked: false,
                unlockedAt: null,
                points: 30
            },
            
            // Pets
            {
                id: 'pet_owner',
                name: 'Pet Owner',
                description: 'Adopt your first pet companion',
                icon: '🐾',
                category: 'pets',
                condition: { type: 'petAdopted' },
                unlocked: false,
                unlockedAt: null,
                points: 20
            },
            {
                id: 'pet_lover',
                name: 'Pet Lover',
                description: 'Unlock all pets',
                icon: '❤️',
                category: 'pets',
                condition: { type: 'petsUnlocked', count: 6 },
                unlocked: false,
                unlockedAt: null,
                points: 75
            },
            {
                id: 'happy_pet',
                name: 'Best Friends',
                description: 'Keep your pet at maximum happiness',
                icon: '🥰',
                category: 'pets',
                condition: { type: 'petHappiness', value: 100 },
                unlocked: false,
                unlockedAt: null,
                points: 25
            },
            
            // Style
            {
                id: 'fashionista',
                name: 'Fashionista',
                description: 'Try on 3 different outfits',
                icon: '👗',
                category: 'style',
                condition: { type: 'outfitsUsed', count: 3 },
                unlocked: false,
                unlockedAt: null,
                points: 15
            },
            {
                id: 'style_icon',
                name: 'Style Icon',
                description: 'Unlock all outfit variations',
                icon: '✨',
                category: 'style',
                condition: { type: 'outfitsUsed', count: 6 },
                unlocked: false,
                unlockedAt: null,
                points: 35
            },
            
            // Time-based
            {
                id: 'dedicated',
                name: 'Dedicated Messenger',
                description: 'Play for 10 minutes',
                icon: '⏰',
                category: 'time',
                condition: { type: 'playTime', minutes: 10 },
                unlocked: false,
                unlockedAt: null,
                points: 15
            },
            {
                id: 'committed',
                name: 'Committed',
                description: 'Play for 30 minutes',
                icon: '🕐',
                category: 'time',
                condition: { type: 'playTime', minutes: 30 },
                unlocked: false,
                unlockedAt: null,
                points: 30
            },
            {
                id: 'devoted',
                name: 'Devoted Player',
                description: 'Play for 1 hour',
                icon: '🕕',
                category: 'time',
                condition: { type: 'playTime', minutes: 60 },
                unlocked: false,
                unlockedAt: null,
                points: 50
            },
            
            // Secret
            {
                id: 'speed_demon',
                name: 'Speed Demon',
                description: 'Complete a quest in under 1 minute',
                icon: '⚡',
                category: 'secret',
                condition: { type: 'questSpeedrun', seconds: 60 },
                unlocked: false,
                unlockedAt: null,
                points: 50,
                hidden: true
            },
            {
                id: 'night_owl',
                name: 'Night Owl',
                description: 'Play during midnight hours',
                icon: '🦉',
                category: 'secret',
                condition: { type: 'playAtTime', startHour: 0, endHour: 4 },
                unlocked: false,
                unlockedAt: null,
                points: 25,
                hidden: true
            },
            {
                id: 'completionist',
                name: 'Completionist',
                description: 'Unlock all other achievements',
                icon: '👑',
                category: 'secret',
                condition: { type: 'allAchievements' },
                unlocked: false,
                unlockedAt: null,
                points: 200,
                hidden: true
            }
        ];
    }
    
    /**
     * Check if an achievement should be unlocked
     */
    checkAchievement(achievementId, gameState) {
        const achievement = this.achievements.find(a => a.id === achievementId);
        if (!achievement || achievement.unlocked) return false;
        
        const condition = achievement.condition;
        let shouldUnlock = false;
        
        switch (condition.type) {
            case 'gameStarted':
                shouldUnlock = true;
                break;
                
            case 'questComplete':
                shouldUnlock = gameState.completedQuests?.includes(condition.questId);
                break;
                
            case 'allQuestsComplete':
                shouldUnlock = gameState.totalQuestsCompleted >= 5;
                break;
                
            case 'areasVisited':
                shouldUnlock = (gameState.areasVisited || 0) >= condition.count;
                break;
                
            case 'stepsWalked':
                shouldUnlock = (gameState.stepsWalked || 0) >= condition.count;
                break;
                
            case 'npcsInteracted':
                shouldUnlock = (gameState.npcsInteracted || 0) >= condition.count;
                break;
                
            case 'dialoguesCompleted':
                shouldUnlock = (gameState.dialoguesCompleted || 0) >= condition.count;
                break;
                
            case 'itemsCollected':
                shouldUnlock = (gameState.itemsCollected || 0) >= condition.count;
                break;
                
            case 'specificItem':
                const itemCount = gameState.inventory?.getItemCount(condition.itemId) || 0;
                shouldUnlock = itemCount >= condition.count;
                break;
                
            case 'petAdopted':
                shouldUnlock = gameState.hasPet === true;
                break;
                
            case 'petsUnlocked':
                shouldUnlock = (gameState.petsUnlocked || 0) >= condition.count;
                break;
                
            case 'petHappiness':
                shouldUnlock = (gameState.petHappiness || 0) >= condition.value;
                break;
                
            case 'outfitsUsed':
                shouldUnlock = (gameState.outfitsUsed?.size || 0) >= condition.count;
                break;
                
            case 'playTime':
                const playMinutes = (gameState.playTime || 0) / 60000;
                shouldUnlock = playMinutes >= condition.minutes;
                break;
                
            case 'questSpeedrun':
                shouldUnlock = gameState.fastestQuestTime <= condition.seconds * 1000;
                break;
                
            case 'playAtTime':
                const hour = new Date().getHours();
                shouldUnlock = hour >= condition.startHour && hour < condition.endHour;
                break;
                
            case 'allAchievements':
                const otherAchievements = this.achievements.filter(a => a.id !== 'completionist');
                shouldUnlock = otherAchievements.every(a => a.unlocked);
                break;
        }
        
        if (shouldUnlock) {
            this.unlock(achievementId);
            return true;
        }
        
        return false;
    }
    
    /**
     * Check all achievements against game state
     */
    checkAllAchievements(gameState) {
        const newUnlocks = [];
        
        this.achievements.forEach(achievement => {
            if (!achievement.unlocked && this.checkAchievement(achievement.id, gameState)) {
                newUnlocks.push(achievement);
            }
        });
        
        return newUnlocks;
    }
    
    /**
     * Unlock an achievement
     */
    unlock(achievementId) {
        const achievement = this.achievements.find(a => a.id === achievementId);
        if (!achievement || achievement.unlocked) return false;
        
        achievement.unlocked = true;
        achievement.unlockedAt = Date.now();
        
        // Add to recent unlocks for notification display
        this.recentUnlocks.unshift(achievement);
        if (this.recentUnlocks.length > 3) {
            this.recentUnlocks.pop();
        }
        
        console.log(`Achievement unlocked: ${achievement.name}`);
        
        if (this.onAchievementUnlocked) {
            this.onAchievementUnlocked(achievement);
        }
        
        return true;
    }
    
    /**
     * Get achievement progress
     */
    getProgress() {
        const unlocked = this.achievements.filter(a => a.unlocked).length;
        const total = this.achievements.length;
        const points = this.achievements
            .filter(a => a.unlocked)
            .reduce((sum, a) => sum + a.points, 0);
        const totalPoints = this.achievements.reduce((sum, a) => sum + a.points, 0);
        
        return {
            unlocked,
            total,
            percentage: Math.round((unlocked / total) * 100),
            points,
            totalPoints
        };
    }
    
    /**
     * Get achievements by category
     */
    getByCategory(category) {
        return this.achievements.filter(a => a.category === category);
    }
    
    /**
     * Get all categories
     */
    getCategories() {
        const categories = {
            story: { name: 'Story', icon: '📖' },
            exploration: { name: 'Exploration', icon: '🗺️' },
            social: { name: 'Social', icon: '💬' },
            collection: { name: 'Collection', icon: '⭐' },
            pets: { name: 'Pets', icon: '🐾' },
            style: { name: 'Style', icon: '👗' },
            time: { name: 'Time', icon: '⏰' },
            secret: { name: 'Secret', icon: '🔮' }
        };
        return categories;
    }
    
    /**
     * Toggle achievement display
     */
    toggleDisplay() {
        this.isDisplayOpen = !this.isDisplayOpen;
        return this.isDisplayOpen;
    }
    
    /**
     * Render achievement notification
     */
    renderNotification(ctx, canvasWidth, canvasHeight) {
        if (this.recentUnlocks.length === 0) return;
        
        const notif = this.recentUnlocks[0];
        const notifAge = Date.now() - notif.unlockedAt;
        
        // Show for 4 seconds
        if (notifAge > 4000) {
            this.recentUnlocks.shift();
            return;
        }
        
        // Animation
        const slideIn = Math.min(1, notifAge / 300);
        const fadeOut = notifAge > 3500 ? 1 - ((notifAge - 3500) / 500) : 1;
        const y = 20 + (1 - slideIn) * -50;
        
        ctx.save();
        ctx.globalAlpha = fadeOut;
        
        // Background
        const width = 280;
        const height = 70;
        const x = (canvasWidth - width) / 2;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, 10);
        ctx.fill();
        ctx.stroke();
        
        // Glow effect
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 15;
        ctx.strokeStyle = '#FFD700';
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, 10);
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        // Icon
        ctx.font = '32px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(notif.icon, x + 35, y + 45);
        
        // Text
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 12px "Silkscreen", monospace';
        ctx.textAlign = 'left';
        ctx.fillText('🏆 ACHIEVEMENT UNLOCKED!', x + 60, y + 25);
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px "Inter", sans-serif';
        ctx.fillText(notif.name, x + 60, y + 47);
        
        ctx.fillStyle = '#aaa';
        ctx.font = '12px "Inter", sans-serif';
        ctx.fillText(`+${notif.points} points`, x + 60, y + 62);
        
        ctx.restore();
    }
    
    /**
     * Render full achievement panel
     */
    renderPanel(ctx, x, y, width, height, selectedCategory = 'story') {
        if (!this.isDisplayOpen) return;
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.92)';
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, 15);
        ctx.fill();
        ctx.stroke();
        
        // Header
        const progress = this.getProgress();
        
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 24px "Silkscreen", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('🏆 Achievements', x + width / 2, y + 35);
        
        // Progress bar
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.roundRect(x + 30, y + 50, width - 60, 20, 5);
        ctx.fill();
        
        ctx.fillStyle = '#FFD700';
        const progressWidth = ((width - 60) * progress.percentage) / 100;
        ctx.beginPath();
        ctx.roundRect(x + 30, y + 50, progressWidth, 20, 5);
        ctx.fill();
        
        ctx.fillStyle = '#000';
        ctx.font = 'bold 12px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
            `${progress.unlocked}/${progress.total} (${progress.percentage}%) - ${progress.points} pts`,
            x + width / 2, y + 64
        );
        
        // Category tabs
        const categories = this.getCategories();
        const tabWidth = (width - 40) / Object.keys(categories).length;
        const tabY = y + 85;
        
        let tabIndex = 0;
        for (const [catId, cat] of Object.entries(categories)) {
            const tabX = x + 20 + tabIndex * tabWidth;
            const isActive = selectedCategory === catId;
            
            ctx.fillStyle = isActive ? '#FFD700' : 'rgba(255, 255, 255, 0.2)';
            ctx.beginPath();
            ctx.roundRect(tabX + 2, tabY, tabWidth - 4, 30, 5);
            ctx.fill();
            
            ctx.fillStyle = isActive ? '#000' : '#fff';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(cat.icon, tabX + tabWidth / 2, tabY + 21);
            
            tabIndex++;
        }
        
        // Achievement list
        const listY = tabY + 45;
        const listHeight = height - listY + y - 40;
        const achievementHeight = 60;
        const categoryAchievements = this.getByCategory(selectedCategory);
        
        categoryAchievements.forEach((achievement, index) => {
            const achY = listY + index * achievementHeight;
            
            if (achY + achievementHeight > y + height - 30) return; // Clip
            
            const isUnlocked = achievement.unlocked;
            const isHidden = achievement.hidden && !isUnlocked;
            
            // Achievement row background
            ctx.fillStyle = isUnlocked ? 'rgba(255, 215, 0, 0.15)' : 'rgba(255, 255, 255, 0.05)';
            ctx.beginPath();
            ctx.roundRect(x + 20, achY, width - 40, achievementHeight - 5, 8);
            ctx.fill();
            
            if (isUnlocked) {
                ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
            
            // Icon
            ctx.font = '28px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(
                isHidden ? '❓' : achievement.icon,
                x + 50, achY + 38
            );
            
            // Name and description
            ctx.textAlign = 'left';
            ctx.fillStyle = isUnlocked ? '#FFD700' : isHidden ? '#666' : '#fff';
            ctx.font = 'bold 14px "Inter", sans-serif';
            ctx.fillText(
                isHidden ? '???' : achievement.name,
                x + 80, achY + 25
            );
            
            ctx.fillStyle = isUnlocked ? '#ccc' : isHidden ? '#444' : '#888';
            ctx.font = '12px "Inter", sans-serif';
            ctx.fillText(
                isHidden ? 'Complete certain conditions to reveal' : achievement.description,
                x + 80, achY + 43
            );
            
            // Points
            ctx.fillStyle = isUnlocked ? '#FFD700' : '#555';
            ctx.font = 'bold 12px "Inter", sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(`${achievement.points} pts`, x + width - 30, achY + 35);
            
            // Checkmark for unlocked
            if (isUnlocked) {
                ctx.fillStyle = '#4CAF50';
                ctx.font = '16px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('✓', x + width - 50, achY + 37);
            }
        });
        
        // Close hint
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '12px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Press ESC to close', x + width / 2, y + height - 15);
    }
    
    /**
     * Handle click in achievement panel
     */
    handlePanelClick(clickX, clickY, panelX, panelY, width) {
        if (!this.isDisplayOpen) return null;
        
        const categories = Object.keys(this.getCategories());
        const tabWidth = (width - 40) / categories.length;
        const tabY = panelY + 85;
        
        // Check category tabs
        for (let i = 0; i < categories.length; i++) {
            const tabX = panelX + 20 + i * tabWidth;
            
            if (clickX >= tabX && clickX <= tabX + tabWidth &&
                clickY >= tabY && clickY <= tabY + 30) {
                return { type: 'category', category: categories[i] };
            }
        }
        
        return null;
    }
    
    /**
     * Get state for saving
     */
    getState() {
        return this.achievements.map(achievement => ({
            id: achievement.id,
            unlocked: achievement.unlocked,
            unlockedAt: achievement.unlockedAt
        }));
    }
    
    /**
     * Load state from save
     */
    loadState(state) {
        if (!state || !Array.isArray(state)) return;
        
        state.forEach(savedAch => {
            const achievement = this.achievements.find(a => a.id === savedAch.id);
            if (achievement) {
                achievement.unlocked = savedAch.unlocked;
                achievement.unlockedAt = savedAch.unlockedAt;
            }
        });
    }
}

// Export singleton instance
export const achievementSystem = new AchievementSystem();
