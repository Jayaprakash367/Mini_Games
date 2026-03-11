// =============================================
// HUD — Heads Up Display
// Menu, Music, Outfit, Companion buttons
// =============================================

export class HUD {
    constructor(game) {
        this.game = game;
        this.hudEl = document.getElementById('hud');
        this.menuBtn = document.getElementById('menu-btn');
        this.musicBtn = document.getElementById('music-btn');
        this.outfitBtn = document.getElementById('outfit-btn');
        this.petBtn = document.getElementById('pet-btn');
        this.questClose = document.getElementById('quest-close');
        this.outfitPanel = document.getElementById('outfit-panel');
        this.outfitClose = document.getElementById('outfit-close');
        this.outfitGrid = document.getElementById('outfit-grid');

        this.musicEnabled = true;
        this.selectedOutfit = 0;

        this.setupEvents();
        this.createOutfits();
    }

    setupEvents() {
        if (this.menuBtn) {
            this.menuBtn.addEventListener('click', () => {
                if (this.game.questSystem) {
                    this.game.questSystem.toggle();
                }
            });
        }

        if (this.questClose) {
            this.questClose.addEventListener('click', () => {
                if (this.game.questSystem) {
                    this.game.questSystem.hide();
                }
            });
        }

        if (this.musicBtn) {
            this.musicBtn.addEventListener('click', () => {
                this.musicEnabled = !this.musicEnabled;
                this.musicBtn.style.opacity = this.musicEnabled ? '1' : '0.5';
            });
        }

        if (this.outfitBtn && this.outfitPanel) {
            this.outfitBtn.addEventListener('click', () => {
                this.outfitPanel.classList.toggle('active');
            });
        }

        if (this.outfitClose && this.outfitPanel) {
            this.outfitClose.addEventListener('click', () => {
                this.outfitPanel.classList.remove('active');
            });
        }

        if (this.petBtn) {
            this.petBtn.addEventListener('click', () => {
                // Show a small notification
                this.showToast('🐾 Companions coming soon!');
            });
        }
    }

    createOutfits() {
        if (!this.outfitGrid) return;
        
        const outfits = [
            { emoji: '👕', name: 'Default', colors: { body: '#5BA3A3', skirt: '#B04040' } },
            { emoji: '🌸', name: 'Sakura', colors: { body: '#E88080', skirt: '#F8B0B0' } },
            { emoji: '🌊', name: 'Ocean', colors: { body: '#3A6EA5', skirt: '#2E5B88' } },
            { emoji: '🌙', name: 'Night', colors: { body: '#3A3A5E', skirt: '#2A2A4E' } },
            { emoji: '☀️', name: 'Sunny', colors: { body: '#F4C430', skirt: '#E88040' } },
            { emoji: '🍃', name: 'Forest', colors: { body: '#5A8A52', skirt: '#68A060' } },
        ];

        outfits.forEach((outfit, i) => {
            const item = document.createElement('div');
            item.className = `outfit-item${i === 0 ? ' selected' : ''}`;
            item.textContent = outfit.emoji;
            item.title = outfit.name;
            item.addEventListener('click', () => {
                // Update selection
                document.querySelectorAll('.outfit-item').forEach(el => el.classList.remove('selected'));
                item.classList.add('selected');
                this.selectedOutfit = i;

                // Change player colors
                const player = this.game.scenes.game?.player;
                if (player) {
                    player.bodyColor = outfit.colors.body;
                    player.skirtColor = outfit.colors.skirt;
                }

                this.showToast(`Outfit: ${outfit.name}`);
            });
            this.outfitGrid.appendChild(item);
        });
    }

    showToast(message) {
        // Create simple toast notification
        const existing = document.querySelector('.game-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'game-toast';
        toast.textContent = message;
        toast.style.cssText = `
      position: fixed;
      top: 70px;
      left: 50%;
      transform: translateX(-50%) translateY(-10px);
      background: rgba(248, 248, 240, 0.95);
      color: #2A2A3E;
      padding: 10px 24px;
      border-radius: 8px;
      border: 2px solid #2A2A3E;
      font-family: 'Silkscreen', monospace;
      font-size: 12px;
      letter-spacing: 1px;
      z-index: 300;
      box-shadow: 0 4px 12px rgba(26, 26, 46, 0.2);
      animation: toastIn 0.3s ease forwards;
    `;

        // Add animation keyframes if not already present
        if (!document.getElementById('toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes toastOut {
          from { opacity: 1; transform: translateX(-50%) translateY(0); }
          to { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        }
      `;
            document.head.appendChild(style);
        }

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'toastOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    show() {
        this.hudEl.classList.remove('hidden');
    }

    hide() {
        this.hudEl.classList.add('hidden');
    }
}
