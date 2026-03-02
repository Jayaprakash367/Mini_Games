// =============================================
// TITLE SCENE — Floating Island + "MESSENGER" Title
// =============================================

export class TitleScene {
    constructor(game) {
        this.game = game;
        this.time = 0;
        this.particles = [];
        this.clouds = [];
        this.island = {
            x: 0, y: 0,
            bobOffset: 0,
            rotation: 0,
        };
        this.beginBtn = document.getElementById('begin-btn');
        this.titleScreen = document.getElementById('title-screen');

        // Generate particles
        for (let i = 0; i < 60; i++) {
            this.particles.push({
                x: Math.random(),
                y: Math.random(),
                size: Math.random() * 3 + 1,
                speed: Math.random() * 0.3 + 0.1,
                opacity: Math.random() * 0.4 + 0.1,
                drift: Math.random() * 0.5 - 0.25,
            });
        }

        // Generate clouds
        for (let i = 0; i < 8; i++) {
            this.clouds.push({
                x: Math.random() * 2 - 0.5,
                y: Math.random() * 0.6 + 0.05,
                width: Math.random() * 200 + 100,
                height: Math.random() * 40 + 20,
                speed: Math.random() * 0.01 + 0.005,
                opacity: Math.random() * 0.3 + 0.1,
            });
        }

        this.setupEvents();
    }

    setupEvents() {
        this.beginBtn.addEventListener('click', () => {
            this.titleScreen.classList.add('hidden');
            this.game.hud.show();
            this.game.switchScene('game', true);
        });
    }

    enter() {
        this.titleScreen.classList.remove('hidden');
        this.titleScreen.classList.add('active');
        this.game.hud.hide();
    }

    exit() {
        // Title screen hidden by button click
    }

    update(dt) {
        this.time += dt;

        // Update particles
        this.particles.forEach(p => {
            p.y -= p.speed * dt;
            p.x += p.drift * dt * 0.1;
            if (p.y < -0.05) {
                p.y = 1.05;
                p.x = Math.random();
            }
        });

        // Update clouds
        this.clouds.forEach(c => {
            c.x += c.speed * dt;
            if (c.x > 1.5) c.x = -0.5;
        });

        // Island bob
        this.island.bobOffset = Math.sin(this.time * 0.8) * 8;
        this.island.rotation = Math.sin(this.time * 0.5) * 0.02;
    }

    render(ctx, w, h) {
        // Sky gradient
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
        skyGrad.addColorStop(0, '#6DB8B8');
        skyGrad.addColorStop(0.4, '#78C0C0');
        skyGrad.addColorStop(0.7, '#8ED6D6');
        skyGrad.addColorStop(1, '#A8E0E0');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h);

        // Draw ocean shimmer
        this.drawOceanShimmer(ctx, w, h);

        // Draw clouds
        this.clouds.forEach(c => {
            this.drawCloud(ctx, c.x * w, c.y * h, c.width, c.height, c.opacity);
        });

        // Draw particles (bubbles/dust)
        this.particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x * w, p.y * h, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(248, 248, 240, ${p.opacity})`;
            ctx.fill();
        });

        // Draw floating island
        this.drawIsland(ctx, w, h);
    }

    drawOceanShimmer(ctx, w, h) {
        const shimmerY = h * 0.75;
        for (let i = 0; i < 12; i++) {
            const x = (Math.sin(this.time * 0.3 + i * 0.8) * 0.5 + 0.5) * w;
            const y = shimmerY + Math.sin(this.time * 0.5 + i) * 30 + i * 15;
            const width = 60 + Math.sin(this.time + i) * 20;
            ctx.beginPath();
            ctx.ellipse(x, y, width, 2, 0, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(180, 228, 208, ${0.15 + Math.sin(this.time + i) * 0.05})`;
            ctx.fill();
        }
    }

    drawCloud(ctx, x, y, w, h, opacity) {
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.fillStyle = '#E8F0F0';

        // Main body
        ctx.beginPath();
        ctx.ellipse(x, y, w * 0.5, h, 0, 0, Math.PI * 2);
        ctx.fill();

        // Bumps
        ctx.beginPath();
        ctx.ellipse(x - w * 0.3, y + h * 0.2, w * 0.3, h * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(x + w * 0.25, y - h * 0.1, w * 0.35, h * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    drawIsland(ctx, w, h) {
        const cx = w / 2;
        const cy = h / 2 + this.island.bobOffset - 30;
        const scale = Math.min(w, h) / 900;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(this.island.rotation);
        ctx.scale(scale, scale);

        // Island shadow on water
        ctx.beginPath();
        ctx.ellipse(0, 250, 180, 20, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(58, 142, 142, 0.2)';
        ctx.fill();

        // Main island body (rocky base)
        ctx.beginPath();
        ctx.moveTo(-160, 0);
        ctx.quadraticCurveTo(-180, 80, -140, 140);
        ctx.quadraticCurveTo(-80, 200, 0, 180);
        ctx.quadraticCurveTo(80, 200, 140, 140);
        ctx.quadraticCurveTo(180, 80, 160, 0);
        ctx.quadraticCurveTo(100, -20, 0, -10);
        ctx.quadraticCurveTo(-100, -20, -160, 0);
        ctx.closePath();

        const rockGrad = ctx.createLinearGradient(0, 0, 0, 200);
        rockGrad.addColorStop(0, '#9CA3AF');
        rockGrad.addColorStop(0.4, '#8B9299');
        rockGrad.addColorStop(1, '#6B7280');
        ctx.fillStyle = rockGrad;
        ctx.fill();
        ctx.strokeStyle = '#2A2A3E';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Top ground layer (grass/earth)
        ctx.beginPath();
        ctx.moveTo(-170, -5);
        ctx.quadraticCurveTo(-120, -40, -60, -30);
        ctx.quadraticCurveTo(0, -50, 60, -30);
        ctx.quadraticCurveTo(120, -40, 170, -5);
        ctx.quadraticCurveTo(100, 5, 0, 10);
        ctx.quadraticCurveTo(-100, 5, -170, -5);
        ctx.closePath();

        const grassGrad = ctx.createLinearGradient(0, -50, 0, 10);
        grassGrad.addColorStop(0, '#68A060');
        grassGrad.addColorStop(1, '#5A8A52');
        ctx.fillStyle = grassGrad;
        ctx.fill();
        ctx.strokeStyle = '#2A2A3E';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Buildings on top
        this.drawBuildings(ctx);

        // Trees
        this.drawTrees(ctx);

        // Water element (small waterfall)
        this.drawWaterfall(ctx);

        // Lighthouse at top
        this.drawLighthouse(ctx);

        // Industrial elements (pipe/crane)
        this.drawIndustrial(ctx);

        ctx.restore();
    }

    drawBuildings(ctx) {
        // Main concrete building
        ctx.fillStyle = '#D1D5DB';
        ctx.strokeStyle = '#2A2A3E';
        ctx.lineWidth = 2;

        // Building 1 (left)
        ctx.beginPath();
        ctx.rect(-100, -90, 55, 60);
        ctx.fill();
        ctx.stroke();

        // Windows
        ctx.fillStyle = '#78C0C0';
        ctx.fillRect(-92, -82, 12, 10);
        ctx.fillRect(-75, -82, 12, 10);
        ctx.fillRect(-92, -65, 12, 10);
        ctx.fillRect(-75, -65, 12, 10);
        ctx.strokeStyle = '#2A2A3E';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-92, -82, 12, 10);
        ctx.strokeRect(-75, -82, 12, 10);
        ctx.strokeRect(-92, -65, 12, 10);
        ctx.strokeRect(-75, -65, 12, 10);

        // Building 2 (right)
        ctx.fillStyle = '#C4B8A4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.rect(30, -75, 50, 50);
        ctx.fill();
        ctx.stroke();

        // Yellow door
        ctx.fillStyle = '#F0C040';
        ctx.fillRect(48, -45, 18, 20);
        ctx.strokeRect(48, -45, 18, 20);

        // Building 2 windows
        ctx.fillStyle = '#5BA3A3';
        ctx.fillRect(38, -68, 10, 8);
        ctx.fillRect(58, -68, 10, 8);
        ctx.strokeRect(38, -68, 10, 8);
        ctx.strokeRect(58, -68, 10, 8);

        // Rooftop details
        ctx.fillStyle = '#8B9299';
        ctx.beginPath();
        ctx.rect(-100, -95, 55, 8);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.rect(30, -80, 50, 7);
        ctx.fill();
        ctx.stroke();
    }

    drawTrees(ctx) {
        const treePositions = [
            { x: -140, y: -40 },
            { x: 110, y: -35 },
            { x: -20, y: -50 },
            { x: 140, y: -20 },
        ];

        treePositions.forEach(({ x, y }) => {
            // Trunk
            ctx.fillStyle = '#8B7355';
            ctx.strokeStyle = '#2A2A3E';
            ctx.lineWidth = 1.5;
            ctx.fillRect(x - 3, y - 25, 6, 25);
            ctx.strokeRect(x - 3, y - 25, 6, 25);

            // Foliage
            const foliageColors = ['#68A060', '#5A9050', '#78B068'];
            foliageColors.forEach((color, i) => {
                ctx.beginPath();
                ctx.ellipse(
                    x + (i - 1) * 6,
                    y - 30 - i * 5,
                    12 + (2 - i) * 3,
                    10 + (2 - i) * 2,
                    0, 0, Math.PI * 2
                );
                ctx.fillStyle = color;
                ctx.fill();
                ctx.strokeStyle = '#2A2A3E';
                ctx.lineWidth = 1.5;
                ctx.stroke();
            });
        });
    }

    drawWaterfall(ctx) {
        // Small water stream on right side
        const waterX = 120;
        const waterY = 40;

        ctx.beginPath();
        ctx.moveTo(waterX, waterY);
        ctx.quadraticCurveTo(waterX + 5, waterY + 40, waterX - 3, waterY + 80);
        ctx.quadraticCurveTo(waterX + 8, waterY + 40, waterX + 3, waterY);
        ctx.closePath();

        ctx.fillStyle = `rgba(120, 192, 192, ${0.6 + Math.sin(this.time * 3) * 0.2})`;
        ctx.fill();

        // Splash at bottom
        for (let i = 0; i < 3; i++) {
            const sx = waterX - 5 + i * 5 + Math.sin(this.time * 4 + i) * 3;
            const sy = waterY + 80 + Math.random() * 10;
            ctx.beginPath();
            ctx.arc(sx, sy, 2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(168, 224, 224, 0.5)';
            ctx.fill();
        }
    }

    drawLighthouse(ctx) {
        const lx = 20;
        const ly = -100;

        // Tower
        ctx.fillStyle = '#E8DCC8';
        ctx.strokeStyle = '#2A2A3E';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(lx - 12, ly + 50);
        ctx.lineTo(lx - 8, ly);
        ctx.lineTo(lx + 8, ly);
        ctx.lineTo(lx + 12, ly + 50);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Red stripe
        ctx.fillStyle = '#D04040';
        ctx.beginPath();
        ctx.rect(lx - 10, ly + 15, 20, 10);
        ctx.fill();

        // Top
        ctx.fillStyle = '#F4C430';
        ctx.beginPath();
        ctx.moveTo(lx - 10, ly);
        ctx.lineTo(lx, ly - 15);
        ctx.lineTo(lx + 10, ly);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Light beam
        const beamOpacity = 0.15 + Math.sin(this.time * 2) * 0.1;
        ctx.fillStyle = `rgba(244, 196, 48, ${beamOpacity})`;
        ctx.beginPath();
        ctx.moveTo(lx, ly - 10);
        ctx.lineTo(lx - 40, ly - 50);
        ctx.lineTo(lx + 40, ly - 50);
        ctx.closePath();
        ctx.fill();
    }

    drawIndustrial(ctx) {
        // Crane arm
        ctx.strokeStyle = '#C06040';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(-80, -90);
        ctx.lineTo(-80, -130);
        ctx.lineTo(-40, -130);
        ctx.stroke();

        // Crane hook
        ctx.beginPath();
        ctx.moveTo(-45, -130);
        ctx.lineTo(-45, -115);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(-45, -113, 4, 0, Math.PI * 2);
        ctx.strokeStyle = '#C06040';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Pipe on side
        ctx.fillStyle = '#C06040';
        ctx.strokeStyle = '#2A2A3E';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(-155, 30, 12, 8, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#9CA3AF';
        ctx.fillRect(-165, 20, 30, 8);
        ctx.strokeRect(-165, 20, 30, 8);
    }
}
