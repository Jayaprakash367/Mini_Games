// =============================================
// NPC ENTITY — Non-Player Characters
// =============================================

export class NPC {
    constructor({ name, x, y, color, headColor, dialogues, quest }) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.color = color;
        this.headColor = headColor || color;
        this.dialogues = dialogues;
        this.quest = quest;
        this.animTime = Math.random() * 10;
        this.breathOffset = 0;
        this.scale = 0.9;
        this.interacted = false;
        this.hitboxWidth = 50;
        this.hitboxHeight = 80;
    }

    isClicked(mx, my) {
        return (
            mx > this.x - this.hitboxWidth / 2 &&
            mx < this.x + this.hitboxWidth / 2 &&
            my > this.y - this.hitboxHeight &&
            my < this.y
        );
    }

    update(dt, globalTime) {
        this.animTime += dt;
        this.breathOffset = Math.sin(this.animTime * 1.8) * 1.5;
    }

    drawInteractionMarker(ctx, time) {
        const markerY = this.y - 95;
        const bob = Math.sin(time * 3) * 6;

        ctx.save();
        ctx.translate(this.x, markerY + bob);

        // White triangle marker
        ctx.fillStyle = '#F8F8F0';
        ctx.strokeStyle = '#2A2A3E';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -12);
        ctx.lineTo(-8, 4);
        ctx.lineTo(8, 4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }

    render(ctx, time) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.scale, this.scale);

        // Shadow
        ctx.beginPath();
        ctx.ellipse(0, 0, 16, 4, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(26, 26, 46, 0.12)';
        ctx.fill();

        // Legs
        ctx.fillStyle = '#6B7280';
        ctx.strokeStyle = '#2A2A3E';
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.roundRect(-7, -18, 6, 16, 2);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.roundRect(1, -18, 6, 16, 2);
        ctx.fill();
        ctx.stroke();

        // Shoes
        ctx.fillStyle = '#3A3A4E';
        ctx.beginPath();
        ctx.roundRect(-9, -4, 9, 4, [0, 0, 2, 2]);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.roundRect(0, -4, 9, 4, [0, 0, 2, 2]);
        ctx.fill();
        ctx.stroke();

        // Body
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#2A2A3E';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-12, -44 + this.breathOffset, 24, 28, 3);
        ctx.fill();
        ctx.stroke();

        // Arms
        ctx.fillStyle = this.color;
        ctx.lineWidth = 1.5;

        // Left arm
        ctx.beginPath();
        ctx.roundRect(-16, -42 + this.breathOffset, 6, 20, 3);
        ctx.fill();
        ctx.stroke();

        // Right arm
        ctx.beginPath();
        ctx.roundRect(10, -42 + this.breathOffset, 6, 20, 3);
        ctx.fill();
        ctx.stroke();

        // Neck
        ctx.fillStyle = '#F0D8C0';
        ctx.fillRect(-3, -48 + this.breathOffset, 6, 6);

        // Head
        ctx.fillStyle = '#F0D8C0';
        ctx.strokeStyle = '#2A2A3E';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, -56 + this.breathOffset, 13, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Hair
        ctx.fillStyle = this.headColor;
        ctx.beginPath();
        ctx.ellipse(0, -61 + this.breathOffset, 14, 9, 0, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Side hair
        ctx.beginPath();
        ctx.roundRect(-14, -62 + this.breathOffset, 5, 14, 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.roundRect(9, -62 + this.breathOffset, 5, 14, 2);
        ctx.fill();
        ctx.stroke();

        // Eyes
        ctx.fillStyle = '#2A2A3E';
        const blinkCycle = Math.sin(time * 0.3 + this.animTime);
        const eyeHeight = blinkCycle > 0.95 ? 0.5 : 2.5;

        ctx.beginPath();
        ctx.ellipse(-4, -56 + this.breathOffset, 1.8, eyeHeight, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(4, -56 + this.breathOffset, 1.8, eyeHeight, 0, 0, Math.PI * 2);
        ctx.fill();

        // Mouth
        ctx.strokeStyle = '#8B6040';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, -51 + this.breathOffset, 2, 0.1, Math.PI - 0.1);
        ctx.stroke();

        // Unique accessories based on NPC
        this.drawAccessories(ctx, time);

        ctx.restore();
    }

    drawAccessories(ctx, time) {
        // Different accessories for different NPC types
        if (this.name.includes('Sailor')) {
            // Sailor hat
            ctx.fillStyle = '#F8F8F0';
            ctx.strokeStyle = '#2A2A3E';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.ellipse(0, -68 + this.breathOffset, 15, 4, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.roundRect(-8, -76 + this.breathOffset, 16, 10, [4, 4, 0, 0]);
            ctx.fill();
            ctx.stroke();
        }

        if (this.name.includes('Fisher')) {
            // Fishing rod
            ctx.strokeStyle = '#8B7355';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(16, -30 + this.breathOffset);
            ctx.lineTo(40, -70 + this.breathOffset);
            ctx.stroke();
            // Line
            ctx.strokeStyle = '#9CA3AF';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(40, -70 + this.breathOffset);
            ctx.quadraticCurveTo(50, -40, 45, -10 + Math.sin(time * 2) * 3);
            ctx.stroke();
        }

        if (this.name.includes('Chef')) {
            // Chef hat
            ctx.fillStyle = '#F8F8F0';
            ctx.strokeStyle = '#2A2A3E';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(-10, -82 + this.breathOffset, 20, 20, [6, 6, 0, 0]);
            ctx.fill();
            ctx.stroke();
        }

        if (this.name.includes('Artist')) {
            // Beret
            ctx.fillStyle = '#D04040';
            ctx.strokeStyle = '#2A2A3E';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.ellipse(2, -67 + this.breathOffset, 14, 6, -0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }

        if (this.name.includes('Keeper')) {
            // Lantern
            ctx.fillStyle = '#F4C430';
            ctx.strokeStyle = '#2A2A3E';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(14, -28 + this.breathOffset, 10, 14, 3);
            ctx.fill();
            ctx.stroke();
            // Glow
            ctx.fillStyle = `rgba(244, 196, 48, ${0.2 + Math.sin(time * 3) * 0.1})`;
            ctx.beginPath();
            ctx.arc(19, -21 + this.breathOffset, 12, 0, Math.PI * 2);
            ctx.fill();
        }

        if (this.name.includes('Tanaka')) {
            // Walking cane
            ctx.strokeStyle = '#8B7355';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(16, -25 + this.breathOffset);
            ctx.lineTo(20, 0);
            ctx.quadraticCurveTo(22, 2, 24, 0);
            ctx.stroke();
        }
    }
}
