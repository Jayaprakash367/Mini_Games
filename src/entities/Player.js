// =============================================
// PLAYER ENTITY — Messenger Girl
// Cel-shaded character with walk/idle animations
// =============================================

export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
        this.walking = false;
        this.facingRight = true;
        this.speed = 180;
        this.animTime = 0;
        this.walkCallback = null;
        this.scale = 1;
        this.breathOffset = 0;

        // Character appearance
        this.bodyColor = '#5BA3A3'; // Blue-teal shirt
        this.skirtColor = '#B04040'; // Red skirt
        this.hairColor = '#2A2A3E'; // Dark hair
        this.skinColor = '#F0D8C0'; // Skin
        this.bagColor = '#F0C040'; // Yellow bag
        this.shoeColor = '#2A2A3E'; // Dark shoes
    }

    walkTo(tx, ty, callback) {
        this.targetX = tx;
        this.targetY = ty || this.y;
        this.walking = true;
        this.walkCallback = callback || null;
    }

    update(dt) {
        this.animTime += dt;
        this.breathOffset = Math.sin(this.animTime * 2) * 1.5;

        if (this.walking) {
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 5) {
                const moveX = (dx / dist) * this.speed * dt;
                const moveY = (dy / dist) * this.speed * dt;
                this.x += moveX;
                this.y += moveY;
                this.facingRight = dx > 0;
            } else {
                this.walking = false;
                this.x = this.targetX;
                this.y = this.targetY;
                if (this.walkCallback) {
                    const cb = this.walkCallback;
                    this.walkCallback = null;
                    cb();
                }
            }
        }
    }

    render(ctx, time) {
        ctx.save();
        ctx.translate(this.x, this.y);

        const dir = this.facingRight ? 1 : -1;
        ctx.scale(dir, 1);

        const walkBob = this.walking ? Math.sin(this.animTime * 10) * 3 : 0;
        const walkLean = this.walking ? Math.sin(this.animTime * 10) * 0.03 : 0;

        ctx.rotate(walkLean);

        // Shadow
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 5, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(26, 26, 46, 0.15)';
        ctx.fill();

        // Legs
        const legSpread = this.walking ? Math.sin(this.animTime * 10) * 8 : 0;

        // Left leg
        ctx.fillStyle = this.skinColor;
        ctx.strokeStyle = '#2A2A3E';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-8 - legSpread, -20, 7, 18, 2);
        ctx.fill();
        ctx.stroke();

        // Right leg
        ctx.beginPath();
        ctx.roundRect(1 + legSpread, -20, 7, 18, 2);
        ctx.fill();
        ctx.stroke();

        // Shoes
        ctx.fillStyle = this.shoeColor;
        ctx.beginPath();
        ctx.roundRect(-10 - legSpread, -5, 10, 5, [0, 0, 2, 2]);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.roundRect(0 + legSpread, -5, 10, 5, [0, 0, 2, 2]);
        ctx.fill();
        ctx.stroke();

        // Socks
        ctx.fillStyle = '#F8F8F0';
        ctx.fillRect(-9 - legSpread, -10, 8, 6);
        ctx.fillRect(1 + legSpread, -10, 8, 6);

        // Skirt
        ctx.fillStyle = this.skirtColor;
        ctx.strokeStyle = '#2A2A3E';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-14, -22);
        ctx.quadraticCurveTo(-16, -12, -13, -18);
        ctx.lineTo(13, -18);
        ctx.quadraticCurveTo(16, -12, 14, -22);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Body/Shirt
        ctx.fillStyle = this.bodyColor;
        ctx.beginPath();
        ctx.roundRect(-13, -48 + this.breathOffset, 26, 28, 3);
        ctx.fill();
        ctx.stroke();

        // White triangle on shirt
        ctx.fillStyle = '#F8F8F0';
        ctx.beginPath();
        ctx.moveTo(0, -42 + this.breathOffset);
        ctx.lineTo(-6, -28 + this.breathOffset);
        ctx.lineTo(6, -28 + this.breathOffset);
        ctx.closePath();
        ctx.fill();

        // Arms
        const armSwing = this.walking ? Math.sin(this.animTime * 10) * 15 : 0;

        // Left arm
        ctx.save();
        ctx.translate(-13, -44 + this.breathOffset);
        ctx.rotate((armSwing * Math.PI) / 180);
        ctx.fillStyle = this.bodyColor;
        ctx.strokeStyle = '#2A2A3E';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-4, 0, 7, 22, 3);
        ctx.fill();
        ctx.stroke();
        // Hand
        ctx.fillStyle = this.skinColor;
        ctx.beginPath();
        ctx.arc(0, 22, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Right arm
        ctx.save();
        ctx.translate(13, -44 + this.breathOffset);
        ctx.rotate((-armSwing * Math.PI) / 180);
        ctx.fillStyle = this.bodyColor;
        ctx.strokeStyle = '#2A2A3E';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-3, 0, 7, 22, 3);
        ctx.fill();
        ctx.stroke();
        // Hand
        ctx.fillStyle = this.skinColor;
        ctx.beginPath();
        ctx.arc(0, 22, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Bag strap
        ctx.strokeStyle = this.bagColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-8, -45 + this.breathOffset);
        ctx.lineTo(8, -30 + this.breathOffset);
        ctx.stroke();

        // Bag
        ctx.fillStyle = this.bagColor;
        ctx.strokeStyle = '#2A2A3E';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(4, -32 + this.breathOffset, 16, 14, 4);
        ctx.fill();
        ctx.stroke();

        // Bag flap
        ctx.fillStyle = '#D4A830';
        ctx.beginPath();
        ctx.roundRect(6, -32 + this.breathOffset, 12, 5, [3, 3, 0, 0]);
        ctx.fill();
        ctx.stroke();

        // Neck
        ctx.fillStyle = this.skinColor;
        ctx.strokeStyle = '#2A2A3E';
        ctx.lineWidth = 1.5;
        ctx.fillRect(-4, -52 + this.breathOffset, 8, 6);

        // Head
        ctx.fillStyle = this.skinColor;
        ctx.strokeStyle = '#2A2A3E';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, -62 + this.breathOffset, 14, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Hair
        ctx.fillStyle = this.hairColor;
        ctx.beginPath();
        ctx.ellipse(0, -67 + this.breathOffset, 15, 10, 0, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Hair buns
        ctx.beginPath();
        ctx.arc(-8, -74 + this.breathOffset, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(8, -74 + this.breathOffset, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Hair ties (red)
        ctx.fillStyle = '#D04040';
        ctx.beginPath();
        ctx.arc(-8, -69 + this.breathOffset, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(8, -69 + this.breathOffset, 3, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        const blinkCycle = Math.sin(time * 0.5);
        const eyeHeight = blinkCycle > 0.95 ? 0.5 : 3;

        ctx.fillStyle = '#2A2A3E';
        ctx.beginPath();
        ctx.ellipse(-5, -62 + this.breathOffset, 2, eyeHeight, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(5, -62 + this.breathOffset, 2, eyeHeight, 0, 0, Math.PI * 2);
        ctx.fill();

        // Blush
        ctx.fillStyle = 'rgba(220, 140, 140, 0.3)';
        ctx.beginPath();
        ctx.ellipse(-9, -58 + this.breathOffset, 4, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(9, -58 + this.breathOffset, 4, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Mouth
        ctx.strokeStyle = '#8B6040';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(0, -57 + this.breathOffset, 2.5, 0.1, Math.PI - 0.1);
        ctx.stroke();

        ctx.restore();
    }
}
