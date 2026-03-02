// =============================================
// ENVIRONMENT — Procedural Scene Rendering
// Sky, Clouds, Ocean, Buildings, Boats, Ground
// =============================================

export class Environment {
    constructor() {
        this.clouds = [];
        for (let i = 0; i < 6; i++) {
            this.clouds.push({
                x: Math.random(),
                y: Math.random() * 0.25 + 0.05,
                width: Math.random() * 120 + 80,
                speed: Math.random() * 0.015 + 0.005,
                opacity: Math.random() * 0.25 + 0.1,
            });
        }
    }

    drawSky(ctx, w, h, skyColor, time) {
        const grad = ctx.createLinearGradient(0, 0, 0, h * 0.65);
        grad.addColorStop(0, this.lightenColor(skyColor, 0.1));
        grad.addColorStop(0.5, skyColor);
        grad.addColorStop(1, this.lightenColor(skyColor, 0.2));
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Stylized sun/glow
        const sunX = w * 0.8;
        const sunY = h * 0.12;
        const sunGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 200);
        sunGrad.addColorStop(0, 'rgba(255, 235, 180, 0.4)');
        sunGrad.addColorStop(0.5, 'rgba(255, 235, 180, 0.1)');
        sunGrad.addColorStop(1, 'rgba(255, 235, 180, 0)');
        ctx.fillStyle = sunGrad;
        ctx.fillRect(0, 0, w, h * 0.5);
    }

    drawClouds(ctx, w, h, time) {
        this.clouds.forEach(c => {
            c.x += c.speed * 0.005;
            if (c.x > 1.3) c.x = -0.3;

            ctx.save();
            ctx.globalAlpha = c.opacity;
            ctx.fillStyle = '#E8F4F4';

            const cx = c.x * w;
            const cy = c.y * h;

            ctx.beginPath();
            ctx.ellipse(cx, cy, c.width * 0.5, 18, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(cx - c.width * 0.25, cy + 5, c.width * 0.3, 14, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(cx + c.width * 0.2, cy - 3, c.width * 0.35, 16, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        });
    }

    drawOcean(ctx, w, h, time) {
        const oceanY = h * 0.55;

        // Ocean body
        const oceanGrad = ctx.createLinearGradient(0, oceanY, 0, h);
        oceanGrad.addColorStop(0, '#5BA3A3');
        oceanGrad.addColorStop(0.3, '#4A9090');
        oceanGrad.addColorStop(1, '#3A8080');
        ctx.fillStyle = oceanGrad;
        ctx.fillRect(0, oceanY, w, h - oceanY);

        // Waves
        for (let wave = 0; wave < 5; wave++) {
            ctx.beginPath();
            ctx.moveTo(0, oceanY + wave * 25 + 10);
            for (let x = 0; x <= w; x += 30) {
                const y = oceanY + wave * 25 + 10 +
                    Math.sin(x * 0.02 + time * 1.5 + wave * 2) * 4 +
                    Math.sin(x * 0.01 + time * 0.8) * 3;
                ctx.lineTo(x, y);
            }
            ctx.lineTo(w, h);
            ctx.lineTo(0, h);
            ctx.closePath();

            ctx.fillStyle = `rgba(${90 + wave * 10}, ${160 + wave * 5}, ${160 + wave * 5}, ${0.15 - wave * 0.02})`;
            ctx.fill();
        }

        // Light reflections
        for (let i = 0; i < 8; i++) {
            const rx = (Math.sin(time * 0.4 + i * 1.2) * 0.5 + 0.5) * w;
            const ry = oceanY + 30 + i * 20 + Math.sin(time * 0.6 + i) * 5;
            ctx.beginPath();
            ctx.ellipse(rx, ry, 30 + Math.sin(time + i) * 10, 1.5, 0, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(168, 224, 224, ${0.2 + Math.sin(time * 0.8 + i) * 0.1})`;
            ctx.fill();
        }
    }

    drawBoats(ctx, w, h, time) {
        // Boat 1 — large cargo boat
        this.drawBoat(ctx, w * 0.2, h * 0.48, 120, 50, '#D1D5DB', time, 0);
        // Boat 2 — small fishing boat
        this.drawBoat(ctx, w * 0.7, h * 0.52, 70, 30, '#C4B8A4', time, 2);
    }

    drawBoat(ctx, x, y, bw, bh, color, time, offset) {
        const bob = Math.sin(time * 0.8 + offset) * 4;
        const tilt = Math.sin(time * 0.6 + offset) * 0.02;

        ctx.save();
        ctx.translate(x, y + bob);
        ctx.rotate(tilt);

        // Hull
        ctx.fillStyle = color;
        ctx.strokeStyle = '#2A2A3E';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-bw / 2, 0);
        ctx.lineTo(-bw / 2 + 10, bh / 2);
        ctx.lineTo(bw / 2 - 10, bh / 2);
        ctx.lineTo(bw / 2, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Upper body
        ctx.fillStyle = '#F8F8F0';
        ctx.beginPath();
        ctx.rect(-bw / 3, -bh / 3, bw * 0.66, bh / 3);
        ctx.fill();
        ctx.stroke();

        // Windows
        ctx.fillStyle = '#78C0C0';
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(-bw / 3 + 8 + i * 18, -bh / 3 + 5, 10, 8);
            ctx.strokeRect(-bw / 3 + 8 + i * 18, -bh / 3 + 5, 10, 8);
        }

        // Mast/pole
        ctx.strokeStyle = '#6B7280';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -bh / 3);
        ctx.lineTo(0, -bh);
        ctx.stroke();

        // Text on hull
        ctx.fillStyle = '#2A2A3E';
        ctx.font = "bold 10px 'Silkscreen', monospace";
        ctx.textAlign = 'center';
        ctx.fillText('⚓', 0, bh / 4);

        ctx.restore();
    }

    drawBackground(ctx, w, h, area, time) {
        if (area.bg.buildings) {
            this.drawCityBuildings(ctx, w, h, time);
        }
        if (area.bg.lighthouse) {
            this.drawLighthouseScene(ctx, w, h, time);
        }
        if (area.bg.stalls) {
            this.drawMarketStalls(ctx, w, h, time);
        }
    }

    drawCityBuildings(ctx, w, h, time) {
        const groundY = h * 0.65;

        // Background buildings (far)
        const farBuildings = [
            { x: 0.05, w: 80, h: 120, color: '#B8BCC4' },
            { x: 0.15, w: 60, h: 90, color: '#C4BCA8' },
            { x: 0.3, w: 100, h: 150, color: '#A8B0B8' },
            { x: 0.5, w: 70, h: 100, color: '#B0A898' },
            { x: 0.65, w: 90, h: 130, color: '#BCC0C8' },
            { x: 0.8, w: 75, h: 110, color: '#C0B8A8' },
            { x: 0.9, w: 85, h: 95, color: '#B4B8C0' },
        ];

        farBuildings.forEach(b => {
            const bx = b.x * w;
            const by = groundY - b.h;
            ctx.fillStyle = b.color;
            ctx.strokeStyle = '#2A2A3E';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.rect(bx, by, b.w, b.h + 5);
            ctx.fill();
            ctx.stroke();

            // Windows
            ctx.fillStyle = 'rgba(120, 192, 192, 0.4)';
            const rows = Math.floor(b.h / 20);
            const cols = Math.floor(b.w / 18);
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const wx = bx + 6 + c * 18;
                    const wy = by + 8 + r * 20;
                    ctx.fillRect(wx, wy, 10, 8);
                    ctx.strokeStyle = '#2A2A3E';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(wx, wy, 10, 8);
                }
            }

            // Rooftop
            ctx.fillStyle = '#8B9299';
            ctx.strokeStyle = '#2A2A3E';
            ctx.lineWidth = 2;
            ctx.fillRect(bx - 3, by - 5, b.w + 6, 8);
            ctx.strokeRect(bx - 3, by - 5, b.w + 6, 8);
        });

        // Foreground elements — railings, stairs, signs
        this.drawUrbanDetails(ctx, w, h, groundY, time);
    }

    drawUrbanDetails(ctx, w, h, groundY, time) {
        // Metal railings
        ctx.strokeStyle = '#9CA3AF';
        ctx.lineWidth = 2;

        // Left railing
        const railX = w * 0.1;
        ctx.beginPath();
        ctx.moveTo(railX, groundY - 30);
        ctx.lineTo(railX, groundY);
        ctx.moveTo(railX + 40, groundY - 30);
        ctx.lineTo(railX + 40, groundY);
        ctx.moveTo(railX, groundY - 25);
        ctx.lineTo(railX + 40, groundY - 25);
        ctx.moveTo(railX, groundY - 15);
        ctx.lineTo(railX + 40, groundY - 15);
        ctx.stroke();

        // Stairs (left side)
        ctx.fillStyle = '#B0A898';
        ctx.strokeStyle = '#2A2A3E';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 4; i++) {
            const stairX = w * 0.02;
            const stairY = groundY - 60 + i * 15;
            ctx.fillRect(stairX, stairY, 50, 12);
            ctx.strokeRect(stairX, stairY, 50, 12);
        }

        // Electric pole
        const poleX = w * 0.55;
        ctx.strokeStyle = '#6B7280';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(poleX, groundY - 200);
        ctx.lineTo(poleX, groundY);
        ctx.stroke();

        // Cross beam
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(poleX - 25, groundY - 190);
        ctx.lineTo(poleX + 25, groundY - 190);
        ctx.stroke();

        // Wires
        ctx.strokeStyle = '#9CA3AF';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(0, groundY - 185);
        ctx.quadraticCurveTo(poleX, groundY - 170 + Math.sin(time) * 2, w, groundY - 185);
        ctx.stroke();

        // Traffic cone
        ctx.fillStyle = '#E88040';
        ctx.strokeStyle = '#2A2A3E';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(w * 0.4, groundY);
        ctx.lineTo(w * 0.4 - 8, groundY);
        ctx.lineTo(w * 0.4 - 4, groundY - 20);
        ctx.lineTo(w * 0.4 + 4, groundY - 20);
        ctx.lineTo(w * 0.4 + 8, groundY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // White stripe
        ctx.fillStyle = '#F8F8F0';
        ctx.fillRect(w * 0.4 - 5, groundY - 12, 10, 4);

        // Boxes/crates
        this.drawCrates(ctx, w * 0.85, groundY, time);

        // Plant
        this.drawPottedPlant(ctx, w * 0.08, groundY - 5);

        // Sign on building
        ctx.fillStyle = '#F8F8F0';
        ctx.strokeStyle = '#2A2A3E';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(w * 0.32, groundY - 180, 60, 30, 4);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#2A2A3E';
        ctx.font = "bold 10px 'Silkscreen', monospace";
        ctx.textAlign = 'center';
        ctx.fillText('郵便', w * 0.32 + 30, groundY - 160);
    }

    drawCrates(ctx, x, y, time) {
        const crateColors = ['#8B7355', '#A08060', '#6B5A42'];
        crateColors.forEach((color, i) => {
            ctx.fillStyle = color;
            ctx.strokeStyle = '#2A2A3E';
            ctx.lineWidth = 1.5;
            ctx.fillRect(x + i * 22, y - 18 - (i === 1 ? 18 : 0), 20, 18);
            ctx.strokeRect(x + i * 22, y - 18 - (i === 1 ? 18 : 0), 20, 18);

            // Cross marks
            ctx.strokeStyle = '#5A4A32';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x + i * 22 + 3, y - 15 - (i === 1 ? 18 : 0));
            ctx.lineTo(x + i * 22 + 17, y - 3 - (i === 1 ? 18 : 0));
            ctx.moveTo(x + i * 22 + 17, y - 15 - (i === 1 ? 18 : 0));
            ctx.lineTo(x + i * 22 + 3, y - 3 - (i === 1 ? 18 : 0));
            ctx.stroke();
        });
    }

    drawPottedPlant(ctx, x, y) {
        // Pot
        ctx.fillStyle = '#C06040';
        ctx.strokeStyle = '#2A2A3E';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x - 10, y);
        ctx.lineTo(x - 8, y - 20);
        ctx.lineTo(x + 8, y - 20);
        ctx.lineTo(x + 10, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Plant
        ctx.fillStyle = '#68A060';
        const leaves = [
            { dx: -6, dy: -30, angle: -0.4 },
            { dx: 0, dy: -35, angle: 0 },
            { dx: 6, dy: -30, angle: 0.4 },
        ];
        leaves.forEach(leaf => {
            ctx.save();
            ctx.translate(x + leaf.dx, y + leaf.dy);
            ctx.rotate(leaf.angle);
            ctx.beginPath();
            ctx.ellipse(0, 0, 5, 12, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#2A2A3E';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();
        });
    }

    drawMarketStalls(ctx, w, h, time) {
        const groundY = h * 0.65;

        // Stall 1 — Noodle stand
        this.drawStall(ctx, w * 0.25, groundY, '#D04040', '麺', time);

        // Stall 2 — General goods
        this.drawStall(ctx, w * 0.6, groundY, '#5090D0', '品', time);

        // Hanging lanterns
        for (let i = 0; i < 5; i++) {
            const lx = w * 0.15 + i * w * 0.18;
            const ly = groundY - 160 + Math.sin(time * 1.5 + i) * 3;
            this.drawLantern(ctx, lx, ly, i % 2 === 0 ? '#D04040' : '#F4C430');
        }
    }

    drawStall(ctx, x, y, awningColor, text, time) {
        // Counter
        ctx.fillStyle = '#A08060';
        ctx.strokeStyle = '#2A2A3E';
        ctx.lineWidth = 2;
        ctx.fillRect(x - 40, y - 30, 80, 30);
        ctx.strokeRect(x - 40, y - 30, 80, 30);

        // Back wall
        ctx.fillStyle = '#C4B8A4';
        ctx.fillRect(x - 45, y - 80, 90, 55);
        ctx.strokeRect(x - 45, y - 80, 90, 55);

        // Awning
        ctx.fillStyle = awningColor;
        ctx.beginPath();
        ctx.moveTo(x - 50, y - 80);
        ctx.lineTo(x + 50, y - 80);
        ctx.lineTo(x + 55, y - 70);
        ctx.lineTo(x - 55, y - 70);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // White stripes on awning
        ctx.fillStyle = '#F8F8F0';
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(x - 48 + i * 24, y - 79, 10, 8);
        }

        // Sign text
        ctx.fillStyle = '#F8F8F0';
        ctx.font = "bold 18px sans-serif";
        ctx.textAlign = 'center';
        ctx.fillText(text, x, y - 55);

        // Steam effect for noodle stand
        if (text === '麺') {
            for (let i = 0; i < 3; i++) {
                const sx = x - 10 + i * 10;
                const sy = y - 35 - Math.abs(Math.sin(time * 2 + i)) * 15;
                ctx.fillStyle = `rgba(248, 248, 240, ${0.3 - Math.abs(Math.sin(time * 2 + i)) * 0.15})`;
                ctx.beginPath();
                ctx.ellipse(sx, sy, 4, 8, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    drawLantern(ctx, x, y, color) {
        // String
        ctx.strokeStyle = '#6B7280';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y - 15);
        ctx.lineTo(x, y);
        ctx.stroke();

        // Lantern body
        ctx.fillStyle = color;
        ctx.strokeStyle = '#2A2A3E';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(x, y + 10, 8, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Glow
        ctx.fillStyle = `rgba(${color === '#D04040' ? '208, 64, 64' : '244, 196, 48'}, 0.1)`;
        ctx.beginPath();
        ctx.arc(x, y + 10, 18, 0, Math.PI * 2);
        ctx.fill();
    }

    drawLighthouseScene(ctx, w, h, time) {
        const groundY = h * 0.65;

        // Hills in background
        ctx.fillStyle = '#5A9A52';
        ctx.strokeStyle = '#2A2A3E';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        ctx.quadraticCurveTo(w * 0.2, groundY - 80, w * 0.4, groundY - 30);
        ctx.quadraticCurveTo(w * 0.6, groundY - 100, w * 0.8, groundY - 40);
        ctx.quadraticCurveTo(w * 0.9, groundY - 60, w, groundY);
        ctx.lineTo(w, groundY + 10);
        ctx.lineTo(0, groundY + 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Lighthouse
        const lx = w * 0.7;
        const ly = groundY - 50;

        // Tower base
        ctx.fillStyle = '#E8DCC8';
        ctx.strokeStyle = '#2A2A3E';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(lx - 20, ly);
        ctx.lineTo(lx - 14, ly - 120);
        ctx.lineTo(lx + 14, ly - 120);
        ctx.lineTo(lx + 20, ly);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Red stripe
        ctx.fillStyle = '#D04040';
        ctx.fillRect(lx - 17, ly - 50, 34, 20);
        ctx.strokeRect(lx - 17, ly - 50, 34, 20);

        ctx.fillRect(lx - 15, ly - 95, 30, 15);
        ctx.strokeRect(lx - 15, ly - 95, 30, 15);

        // Lantern room
        ctx.fillStyle = '#F4C430';
        ctx.strokeStyle = '#2A2A3E';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.rect(lx - 16, ly - 135, 32, 18);
        ctx.fill();
        ctx.stroke();

        // Glass windows
        ctx.fillStyle = `rgba(244, 196, 48, ${0.6 + Math.sin(time * 2) * 0.2})`;
        ctx.fillRect(lx - 12, ly - 132, 8, 12);
        ctx.fillRect(lx + 4, ly - 132, 8, 12);
        ctx.strokeRect(lx - 12, ly - 132, 8, 12);
        ctx.strokeRect(lx + 4, ly - 132, 8, 12);

        // Roof
        ctx.fillStyle = '#8B9299';
        ctx.beginPath();
        ctx.moveTo(lx - 18, ly - 135);
        ctx.lineTo(lx, ly - 155);
        ctx.lineTo(lx + 18, ly - 135);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Light beam
        const beamOpacity = 0.12 + Math.sin(time * 1.5) * 0.06;
        ctx.fillStyle = `rgba(244, 196, 48, ${beamOpacity})`;
        ctx.beginPath();
        ctx.moveTo(lx, ly - 140);
        ctx.lineTo(lx - 100, ly - 250);
        ctx.lineTo(lx + 100, ly - 250);
        ctx.closePath();
        ctx.fill();

        // Trees around lighthouse
        const treePosL = [
            { x: lx - 60, y: ly },
            { x: lx + 50, y: ly + 5 },
            { x: lx - 90, y: ly + 10 },
            { x: w * 0.2, y: groundY - 20 },
            { x: w * 0.35, y: groundY - 35 },
        ];
        treePosL.forEach(t => this.drawTree(ctx, t.x, t.y));
    }

    drawTree(ctx, x, y) {
        // Trunk
        ctx.fillStyle = '#8B7355';
        ctx.strokeStyle = '#2A2A3E';
        ctx.lineWidth = 1.5;
        ctx.fillRect(x - 3, y - 22, 6, 22);
        ctx.strokeRect(x - 3, y - 22, 6, 22);

        // Foliage layers
        const greens = ['#5A9050', '#68A060', '#78B068'];
        greens.forEach((color, i) => {
            ctx.beginPath();
            ctx.ellipse(x + (i - 1) * 4, y - 28 - i * 6, 12 + (2 - i) * 2, 10, 0, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = '#2A2A3E';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        });
    }

    drawGround(ctx, w, h, groundColor) {
        const groundY = h * 0.65;

        // Main ground
        const groundGrad = ctx.createLinearGradient(0, groundY, 0, h);
        groundGrad.addColorStop(0, groundColor);
        groundGrad.addColorStop(0.3, this.darkenColor(groundColor, 0.1));
        groundGrad.addColorStop(1, this.darkenColor(groundColor, 0.2));
        ctx.fillStyle = groundGrad;
        ctx.fillRect(0, groundY - 5, w, h - groundY + 5);

        // Ground line
        ctx.strokeStyle = '#2A2A3E';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, groundY - 2);
        ctx.lineTo(w, groundY - 2);
        ctx.stroke();

        // Road marking
        ctx.strokeStyle = 'rgba(248, 248, 240, 0.2)';
        ctx.lineWidth = 2;
        ctx.setLineDash([20, 15]);
        ctx.beginPath();
        ctx.moveTo(0, groundY + (h - groundY) * 0.4);
        ctx.lineTo(w, groundY + (h - groundY) * 0.4);
        ctx.stroke();
        ctx.setLineDash([]);

        // Curb
        ctx.fillStyle = this.darkenColor(groundColor, 0.15);
        ctx.fillRect(0, groundY - 2, w, 6);
    }

    lightenColor(hex, amount) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const nr = Math.min(255, r + (255 - r) * amount);
        const ng = Math.min(255, g + (255 - g) * amount);
        const nb = Math.min(255, b + (255 - b) * amount);
        return `rgb(${Math.round(nr)}, ${Math.round(ng)}, ${Math.round(nb)})`;
    }

    darkenColor(hex, amount) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgb(${Math.round(r * (1 - amount))}, ${Math.round(g * (1 - amount))}, ${Math.round(b * (1 - amount))})`;
    }
}
