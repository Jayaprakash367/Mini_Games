export class HUD {
    constructor(inventorySystem, questSystem) {
        this.inventory = inventorySystem;
        this.quests = questSystem;

        this.container = document.getElementById('hud');
        this.createElements();

        this.inventory.onChange(() => this.updateInventory());
        this.quests.onQuestUpdate(() => this.updateQuestTracker());
    }

    createElements() {
        this.container.innerHTML = `
            <div id="quest-tracker" class="hud-panel">
                <div class="hud-title">📋 Active Quests</div>
                <div id="quest-list" class="quest-list">
                    <div class="quest-empty">Talk to Postmaster Edgar to begin</div>
                </div>
            </div>
            <div id="inventory-bar" class="inventory-bar">
                <div class="hud-title">🎒 Inventory</div>
                <div id="inventory-slots" class="inventory-slots"></div>
            </div>
            <div id="minimap" class="minimap">
                <canvas id="minimap-canvas" width="120" height="120"></canvas>
            </div>
            <div id="controls-hint" class="controls-hint">
                <span>WASD: Move</span>
                <span>Mouse: Look</span>
                <span>E: Interact</span>
                <span>Space: Jump</span>
                <span>Shift: Run</span>
            </div>
        `;
    }

    updateQuestTracker() {
        const questList = document.getElementById('quest-list');
        if (!questList) return;

        const active = this.quests.getActiveQuests();
        if (active.length === 0) {
            questList.innerHTML = '<div class="quest-empty">No active quests</div>';
            return;
        }

        questList.innerHTML = active.map(q => {
            const step = q.steps[q.currentStep];
            return `
                <div class="quest-item">
                    <div class="quest-name">${q.title}</div>
                    <div class="quest-step">${step ? step.description : 'Complete'}</div>
                </div>
            `;
        }).join('');
    }

    updateInventory() {
        const slots = document.getElementById('inventory-slots');
        if (!slots) return;

        const items = this.inventory.getItems();
        if (items.length === 0) {
            slots.innerHTML = '<div class="inventory-empty">Empty</div>';
            return;
        }

        slots.innerHTML = items.map(item => `
            <div class="inventory-item" title="${item.description || item.name}">
                <span class="item-icon">${item.icon || '📦'}</span>
                <span class="item-name">${item.name}</span>
                ${item.quantity > 1 ? `<span class="item-qty">x${item.quantity}</span>` : ''}
            </div>
        `).join('');
    }

    update(player) {
        // Update minimap
        this.updateMinimap(player);
    }

    updateMinimap(player) {
        const canvas = document.getElementById('minimap-canvas');
        if (!canvas || !player || !player.mesh) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        const scale = 0.6; // world units to pixels

        ctx.clearRect(0, 0, w, h);

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, w, h);

        // Center of minimap = player position
        const px = player.mesh.position.x;
        const pz = player.mesh.position.z;
        const cx = w / 2;
        const cy = h / 2;

        // Draw zone indicators
        const zones = [
            { name: 'Harbor', x: 15, z: -50, color: '#4488AA' },
            { name: 'Market', x: 30, z: 15, color: '#CC8844' },
            { name: 'Park', x: -35, z: 10, color: '#44AA44' },
            { name: 'Residential', x: 0, z: 55, color: '#AA8866' },
            { name: 'Observatory', x: -60, z: 65, color: '#8888AA' }
        ];

        for (const zone of zones) {
            const sx = cx + (zone.x - px) * scale;
            const sy = cy + (zone.z - pz) * scale;
            if (sx > -10 && sx < w + 10 && sy > -10 && sy < h + 10) {
                ctx.fillStyle = zone.color;
                ctx.beginPath();
                ctx.arc(sx, sy, 4, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Player dot
        ctx.fillStyle = '#44FF44';
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fill();

        // Player direction indicator
        const facing = player.facing || 0;
        ctx.strokeStyle = '#44FF44';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(
            cx + Math.sin(facing) * 8,
            cy - Math.cos(facing) * 8
        );
        ctx.stroke();

        // Border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, w, h);
    }
}
