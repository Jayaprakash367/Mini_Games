/**
 * VictoryScene - Game completion celebration screen
 * Features: Animated confetti, stats display, credits
 */
export class VictoryScene {
    constructor() {
        this.isActive = false;
        this.animationTime = 0;
        this.confetti = [];
        this.stars = [];
        this.stats = null;
        
        // Animation phases
        this.phase = 'fadeIn'; // fadeIn, reveal, confetti, stats, credits
        this.phaseTime = 0;
        
        // Credits
        this.credits = [
            { type: 'title', text: 'MESSENGER' },
            { type: 'subtitle', text: 'A Delivery Adventure' },
            { type: 'spacer' },
            { type: 'heading', text: 'Created With' },
            { type: 'item', text: 'HTML5 Canvas' },
            { type: 'item', text: 'JavaScript ES6+' },
            { type: 'item', text: 'Vite Build Tool' },
            { type: 'spacer' },
            { type: 'heading', text: 'Special Thanks' },
            { type: 'item', text: 'To all the players!' },
            { type: 'spacer' },
            { type: 'heading', text: 'Thank You for Playing!' }
        ];
        this.creditScroll = 0;
        
        // Callbacks
        this.onComplete = null;
        this.onReplay = null;
    }
    
    /**
     * Activate victory scene with player stats
     */
    activate(stats) {
        this.isActive = true;
        this.stats = stats || {};
        this.animationTime = 0;
        this.phase = 'fadeIn';
        this.phaseTime = 0;
        this.confetti = [];
        this.stars = [];
        this.creditScroll = 0;
        
        // Generate initial confetti
        this.generateConfetti(100);
        this.generateStars(50);
    }
    
    /**
     * Deactivate victory scene
     */
    deactivate() {
        this.isActive = false;
    }
    
    /**
     * Generate confetti particles
     */
    generateConfetti(count) {
        const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FF9FF3', '#54A0FF', '#5F27CD'];
        
        for (let i = 0; i < count; i++) {
            this.confetti.push({
                x: Math.random() * 800,
                y: -20 - Math.random() * 200,
                vx: (Math.random() - 0.5) * 4,
                vy: Math.random() * 3 + 2,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2,
                size: Math.random() * 10 + 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                shape: Math.random() > 0.5 ? 'rect' : 'circle'
            });
        }
    }
    
    /**
     * Generate background stars
     */
    generateStars(count) {
        for (let i = 0; i < count; i++) {
            this.stars.push({
                x: Math.random() * 800,
                y: Math.random() * 500,
                size: Math.random() * 3 + 1,
                twinkleSpeed: Math.random() * 2 + 1,
                twinkleOffset: Math.random() * Math.PI * 2
            });
        }
    }
    
    /**
     * Update victory scene
     */
    update(deltaTime) {
        if (!this.isActive) return;
        
        this.animationTime += deltaTime;
        this.phaseTime += deltaTime;
        
        // Phase transitions
        switch (this.phase) {
            case 'fadeIn':
                if (this.phaseTime > 1000) {
                    this.phase = 'reveal';
                    this.phaseTime = 0;
                }
                break;
            case 'reveal':
                if (this.phaseTime > 2000) {
                    this.phase = 'confetti';
                    this.phaseTime = 0;
                }
                break;
            case 'confetti':
                if (this.phaseTime > 3000) {
                    this.phase = 'stats';
                    this.phaseTime = 0;
                }
                break;
            case 'stats':
                if (this.phaseTime > 5000) {
                    this.phase = 'credits';
                    this.phaseTime = 0;
                }
                break;
            case 'credits':
                this.creditScroll += deltaTime * 0.03;
                break;
        }
        
        // Update confetti
        this.confetti.forEach(c => {
            c.x += c.vx;
            c.y += c.vy;
            c.rotation += c.rotationSpeed;
            c.vy += 0.05; // Gravity
            
            // Wind effect
            c.vx += Math.sin(this.animationTime * 0.001 + c.y * 0.01) * 0.02;
        });
        
        // Remove offscreen confetti and add new ones
        this.confetti = this.confetti.filter(c => c.y < 600);
        if (this.confetti.length < 50 && this.phase === 'confetti') {
            this.generateConfetti(10);
        }
    }
    
    /**
     * Render victory scene
     */
    render(ctx, canvasWidth, canvasHeight) {
        if (!this.isActive) return;
        
        const time = this.animationTime / 1000;
        
        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.5, '#16213e');
        gradient.addColorStop(1, '#0f3460');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // Stars
        this.stars.forEach(star => {
            const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.5 + 0.5;
            ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + twinkle * 0.7})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size * twinkle, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Fade in effect
        if (this.phase === 'fadeIn') {
            const alpha = 1 - (this.phaseTime / 1000);
            ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        }
        
        // Main content
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        
        // Victory text with animation
        if (this.phase !== 'credits') {
            const scale = this.phase === 'reveal' ? 
                Math.min(1, this.phaseTime / 500) : 1;
            const bounce = Math.sin(time * 2) * 5;
            
            ctx.save();
            ctx.translate(centerX, 80 + bounce);
            ctx.scale(scale, scale);
            
            // Glow effect
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 30 + Math.sin(time * 3) * 10;
            
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 48px "Silkscreen", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('🎉 VICTORY! 🎉', 0, 0);
            
            ctx.shadowBlur = 0;
            ctx.restore();
            
            // Subtitle
            ctx.fillStyle = '#4ECDC4';
            ctx.font = '24px "Inter", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('All Deliveries Complete!', centerX, 130);
        }
        
        // Confetti
        this.confetti.forEach(c => {
            ctx.save();
            ctx.translate(c.x, c.y);
            ctx.rotate(c.rotation);
            ctx.fillStyle = c.color;
            
            if (c.shape === 'rect') {
                ctx.fillRect(-c.size / 2, -c.size / 4, c.size, c.size / 2);
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, c.size / 2, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.restore();
        });
        
        // Stats panel
        if (this.phase === 'stats' || this.phase === 'credits') {
            this.renderStats(ctx, centerX - 150, 160, 300, 200);
        }
        
        // Credits
        if (this.phase === 'credits') {
            this.renderCredits(ctx, centerX, canvasHeight - 100);
        }
        
        // Buttons
        this.renderButtons(ctx, centerX, canvasHeight - 50);
    }
    
    /**
     * Render game statistics
     */
    renderStats(ctx, x, y, width, height) {
        // Panel background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.strokeStyle = '#4ECDC4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, 15);
        ctx.fill();
        ctx.stroke();
        
        // Title
        ctx.fillStyle = '#4ECDC4';
        ctx.font = 'bold 20px "Silkscreen", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('📊 Your Journey', x + width / 2, y + 30);
        
        // Stats
        const stats = [
            { icon: '🎯', label: 'Quests Completed', value: this.stats.questsCompleted || 5 },
            { icon: '👥', label: 'NPCs Met', value: this.stats.npcsInteracted || 6 },
            { icon: '🚶', label: 'Steps Taken', value: this.stats.stepsWalked || 0 },
            { icon: '⏱️', label: 'Play Time', value: this.formatTime(this.stats.playTime || 0) },
            { icon: '⭐', label: 'Items Found', value: this.stats.itemsCollected || 0 },
            { icon: '🏆', label: 'Achievements', value: `${this.stats.achievementsUnlocked || 0}/${this.stats.totalAchievements || 25}` }
        ];
        
        const startY = y + 55;
        const lineHeight = 25;
        
        stats.forEach((stat, index) => {
            const statY = startY + index * lineHeight;
            
            ctx.fillStyle = '#fff';
            ctx.font = '14px "Inter", sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(`${stat.icon} ${stat.label}:`, x + 15, statY);
            
            ctx.fillStyle = '#FFD700';
            ctx.textAlign = 'right';
            ctx.fillText(stat.value.toString(), x + width - 15, statY);
        });
    }
    
    /**
     * Render scrolling credits
     */
    renderCredits(ctx, centerX, baseY) {
        const lineHeight = 30;
        let y = baseY - this.creditScroll;
        
        this.credits.forEach(credit => {
            if (y > -50 && y < 600) {
                ctx.textAlign = 'center';
                
                switch (credit.type) {
                    case 'title':
                        ctx.fillStyle = '#FFD700';
                        ctx.font = 'bold 32px "Silkscreen", monospace';
                        ctx.fillText(credit.text, centerX, y);
                        y += 20;
                        break;
                    case 'subtitle':
                        ctx.fillStyle = '#4ECDC4';
                        ctx.font = '18px "Inter", sans-serif';
                        ctx.fillText(credit.text, centerX, y);
                        break;
                    case 'heading':
                        ctx.fillStyle = '#4ECDC4';
                        ctx.font = 'bold 18px "Inter", sans-serif';
                        ctx.fillText(credit.text, centerX, y);
                        break;
                    case 'item':
                        ctx.fillStyle = '#fff';
                        ctx.font = '14px "Inter", sans-serif';
                        ctx.fillText(credit.text, centerX, y);
                        break;
                    case 'spacer':
                        y += 10;
                        break;
                }
            }
            y += lineHeight;
        });
    }
    
    /**
     * Render action buttons
     */
    renderButtons(ctx, centerX, y) {
        // Play Again button
        const btn1X = centerX - 120;
        const btn2X = centerX + 20;
        const btnWidth = 100;
        const btnHeight = 35;
        
        // Play Again
        ctx.fillStyle = '#4ECDC4';
        ctx.beginPath();
        ctx.roundRect(btn1X, y, btnWidth, btnHeight, 8);
        ctx.fill();
        
        ctx.fillStyle = '#000';
        ctx.font = 'bold 14px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Play Again', btn1X + btnWidth / 2, y + 23);
        
        // Title Screen
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.strokeStyle = '#4ECDC4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(btn2X, y, btnWidth, btnHeight, 8);
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = '#4ECDC4';
        ctx.fillText('Title Screen', btn2X + btnWidth / 2, y + 23);
    }
    
    /**
     * Handle click in victory scene
     */
    handleClick(clickX, clickY, canvasWidth, canvasHeight) {
        if (!this.isActive) return null;
        
        const centerX = canvasWidth / 2;
        const y = canvasHeight - 50;
        const btnWidth = 100;
        const btnHeight = 35;
        
        // Play Again button
        const btn1X = centerX - 120;
        if (clickX >= btn1X && clickX <= btn1X + btnWidth &&
            clickY >= y && clickY <= y + btnHeight) {
            if (this.onReplay) this.onReplay();
            return 'replay';
        }
        
        // Title Screen button
        const btn2X = centerX + 20;
        if (clickX >= btn2X && clickX <= btn2X + btnWidth &&
            clickY >= y && clickY <= y + btnHeight) {
            if (this.onComplete) this.onComplete();
            return 'title';
        }
        
        // Skip to next phase on click
        if (this.phase !== 'credits') {
            this.phaseTime = 10000; // Force transition
            return 'skip';
        }
        
        return null;
    }
    
    /**
     * Format play time
     */
    formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else {
            return `${minutes}m ${seconds % 60}s`;
        }
    }
    
    /**
     * Check if game is won
     */
    static checkWinCondition(questSystem) {
        if (!questSystem) return false;
        
        const totalQuests = questSystem.quests.length;
        const completedQuests = questSystem.quests.filter(q => q.completed).length;
        
        return completedQuests >= totalQuests;
    }
}

// Export singleton instance
export const victoryScene = new VictoryScene();
