// =============================================
// GAME SCENE — Main Gameplay
// Coastal city environment with point-and-click exploration
// =============================================

import { Player } from '../entities/Player.js';
import { NPC } from '../entities/NPC.js';
import { Environment } from '../utils/Environment.js';

export class GameScene {
    constructor(game) {
        this.game = game;
        this.time = 0;
        this.camera = { x: 0, y: 0, targetX: 0, targetY: 0, shake: 0 };
        this.currentArea = 0;
        this.areas = this.createAreas();
        this.player = new Player(400, 380);
        this.environment = new Environment();
        this.introPlayed = false;
        this.transitioning = false;
        this.transitionAlpha = 0;
        this.nextArea = -1;
    }

    createAreas() {
        return [
            {
                name: 'Harbor District',
                bg: { sky: '#78C0C0', ground: '#9CA3AF', buildings: true, boats: true },
                npcs: [
                    new NPC({
                        name: 'Sailor Kim',
                        x: 650, y: 370,
                        color: '#F0C040',
                        headColor: '#E8A040',
                        dialogues: [
                            "Ahoy! Another beautiful day at the harbor.",
                            "You're the new messenger, right? I've got a package for old Tanaka up the hill.",
                            "Be careful on the stairs — they're steep!",
                        ],
                        quest: { id: 'harbor_delivery', text: 'Deliver to Old Tanaka' }
                    }),
                    new NPC({
                        name: 'Fisher Yuki',
                        x: 250, y: 390,
                        color: '#68A060',
                        headColor: '#8B7355',
                        dialogues: [
                            "The fish aren't biting today...",
                            "Say, could you take this note to the lighthouse keeper?",
                            "I wrote it on waterproof paper, just in case!",
                        ],
                        quest: { id: 'lost_note', text: 'A note lost at sea' }
                    }),
                ],
                exits: [{ x: 900, direction: 'right', to: 1, label: 'Market Street →' }],
            },
            {
                name: 'Market Street',
                bg: { sky: '#7AC4C4', ground: '#A08878', buildings: true, stalls: true },
                npcs: [
                    new NPC({
                        name: 'Chef Hana',
                        x: 350, y: 375,
                        color: '#D04040',
                        headColor: '#F0C040',
                        dialogues: [
                            "Welcome to my noodle stand!",
                            "Business has been slow since the bridge closed...",
                            "Could you deliver these lunch boxes to the workers at the construction site?",
                        ],
                        quest: { id: 'lunch_delivery', text: 'Lunch box delivery' }
                    }),
                    new NPC({
                        name: 'Artist Sora',
                        x: 700, y: 380,
                        color: '#5090D0',
                        headColor: '#6B7280',
                        dialogues: [
                            "I'm painting the sunset. Isn't it gorgeous?",
                            "Oh! You're a messenger? I have a letter for my sister at the lighthouse.",
                            "Tell her I miss her paintings of the sea.",
                        ],
                        quest: { id: 'letter_delivery', text: 'Falling off the corporate ladder' }
                    }),
                ],
                exits: [
                    { x: 50, direction: 'left', to: 0, label: '← Harbor' },
                    { x: 900, direction: 'right', to: 2, label: 'Hilltop →' },
                ],
            },
            {
                name: 'Hilltop Observatory',
                bg: { sky: '#6DB8B8', ground: '#68A060', buildings: false, lighthouse: true },
                npcs: [
                    new NPC({
                        name: 'Old Tanaka',
                        x: 500, y: 360,
                        color: '#8B7355',
                        headColor: '#9CA3AF',
                        dialogues: [
                            "Ah, you've climbed all the way up here!",
                            "From this hill, you can see the entire city...",
                            "Thank you for the delivery. Here, take this telescope lens to the lighthouse keeper.",
                        ],
                        quest: { id: 'telescope', text: 'The telescope lens' }
                    }),
                    new NPC({
                        name: 'Keeper Aoi',
                        x: 200, y: 370,
                        color: '#E88040',
                        headColor: '#5090D0',
                        dialogues: [
                            "The lighthouse has guided sailors for 100 years.",
                            "But the lens cracked last month during a storm...",
                            "You brought me a new lens? And a letter from Sora? Thank you, messenger!",
                        ],
                        quest: null
                    }),
                ],
                exits: [
                    { x: 50, direction: 'left', to: 1, label: '← Market' },
                ],
            },
        ];
    }

    enter() {
        this.time = 0;
        if (!this.introPlayed) {
            this.introPlayed = true;
            setTimeout(() => {
                this.game.dialogueSystem.start([
                    { name: 'Messenger', text: "Looks like I slept in... I better start today's deliveries." },
                    { name: 'Messenger', text: "Let me check my checklist and talk to people around the harbor." },
                ]);
            }, 500);
        }
    }

    exit() { }

    update(dt) {
        this.time += dt;
        const area = this.areas[this.currentArea];

        // Update player
        if (!this.game.dialogueSystem.isActive && !this.transitioning) {
            if (this.game.mouse.clicked) {
                const clickX = this.game.mouse.clickX;
                const clickY = this.game.mouse.clickY;

                // Check NPC interactions
                let npcClicked = false;
                area.npcs.forEach(npc => {
                    if (npc.isClicked(clickX, clickY)) {
                        npcClicked = true;
                        // Walk to NPC then talk
                        this.player.walkTo(npc.x - 50, npc.y, () => {
                            this.player.facingRight = this.player.x < npc.x;
                            this.game.dialogueSystem.start(
                                npc.dialogues.map(text => ({ name: npc.name, text })),
                                () => {
                                    if (npc.quest && !this.game.questSystem.isCompleted(npc.quest.id)) {
                                        this.game.questSystem.addProgress(npc.quest.id);
                                    }
                                }
                            );
                        });
                    }
                });

                // Check exits
                if (!npcClicked) {
                    area.exits.forEach(exit => {
                        if (Math.abs(clickX - exit.x) < 80 && clickY > 250) {
                            this.player.walkTo(exit.x, this.player.y, () => {
                                this.transitionToArea(exit.to);
                            });
                            npcClicked = true;
                        }
                    });
                }

                // Walk to clicked position
                if (!npcClicked && clickY > 280 && clickY < 480) {
                    this.player.walkTo(clickX, Math.max(350, Math.min(430, clickY)));
                }
            }
        }

        this.player.update(dt);

        // Update NPCs
        area.npcs.forEach(npc => npc.update(dt, this.time));

        // Camera follow
        this.camera.targetX = Math.max(0, Math.min(200, this.player.x - this.game.width / 2));
        this.camera.x += (this.camera.targetX - this.camera.x) * 0.05;

        // Area transition
        if (this.transitioning) {
            this.transitionAlpha += dt * 3;
            if (this.transitionAlpha >= 1 && this.nextArea >= 0) {
                this.currentArea = this.nextArea;
                this.nextArea = -1;
                const area2 = this.areas[this.currentArea];
                // Position player at entry
                if (area2.exits.length > 0) {
                    const entryExit = area2.exits.find(e => e.to === (this.currentArea > 0 ? this.currentArea - 1 : 1));
                    if (entryExit) {
                        this.player.x = entryExit.x + (entryExit.direction === 'left' ? 80 : -80);
                    }
                }
            }
            if (this.transitionAlpha >= 2) {
                this.transitioning = false;
                this.transitionAlpha = 0;
            }
        }
    }

    transitionToArea(areaIndex) {
        this.transitioning = true;
        this.transitionAlpha = 0;
        this.nextArea = areaIndex;
    }

    render(ctx, w, h) {
        const area = this.areas[this.currentArea];

        // Draw environment
        this.environment.drawSky(ctx, w, h, area.bg.sky, this.time);
        this.environment.drawClouds(ctx, w, h, this.time);

        if (area.bg.boats) {
            this.environment.drawOcean(ctx, w, h, this.time);
            this.environment.drawBoats(ctx, w, h, this.time);
        }

        this.environment.drawBackground(ctx, w, h, area, this.time);
        this.environment.drawGround(ctx, w, h, area.bg.ground);

        // Draw exit indicators
        area.exits.forEach(exit => {
            this.drawExitIndicator(ctx, exit, h);
        });

        // Draw NPCs (behind player if lower y)
        const entities = [...area.npcs, this.player];
        entities.sort((a, b) => a.y - b.y);
        entities.forEach(entity => entity.render(ctx, this.time));

        // Draw interaction markers
        area.npcs.forEach(npc => {
            if (!this.game.dialogueSystem.isActive) {
                npc.drawInteractionMarker(ctx, this.time);
            }
        });

        // Draw area name
        this.drawAreaName(ctx, w, area.name);

        // Draw cel-shading post-processing effect (vignette)
        this.drawVignette(ctx, w, h);

        // Area transition fade
        if (this.transitioning) {
            const alpha = this.transitionAlpha <= 1
                ? this.transitionAlpha
                : 2 - this.transitionAlpha;
            ctx.fillStyle = `rgba(26, 26, 46, ${alpha})`;
            ctx.fillRect(0, 0, w, h);
        }
    }

    drawExitIndicator(ctx, exit, h) {
        const pulse = Math.sin(this.time * 3) * 0.3 + 0.7;

        ctx.save();
        ctx.globalAlpha = pulse * 0.6;
        ctx.fillStyle = '#F8F8F0';

        if (exit.direction === 'right') {
            ctx.beginPath();
            ctx.moveTo(exit.x - 5, h * 0.5 - 20);
            ctx.lineTo(exit.x + 15, h * 0.5);
            ctx.lineTo(exit.x - 5, h * 0.5 + 20);
            ctx.closePath();
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.moveTo(exit.x + 5, h * 0.5 - 20);
            ctx.lineTo(exit.x - 15, h * 0.5);
            ctx.lineTo(exit.x + 5, h * 0.5 + 20);
            ctx.closePath();
            ctx.fill();
        }

        // Label
        ctx.globalAlpha = pulse * 0.8;
        ctx.font = '600 13px Inter, sans-serif';
        ctx.textAlign = exit.direction === 'right' ? 'right' : 'left';
        ctx.fillText(exit.label, exit.x + (exit.direction === 'right' ? -15 : 15), h * 0.5 + 35);

        ctx.restore();
    }

    drawAreaName(ctx, w, name) {
        ctx.save();
        ctx.font = "600 16px 'Silkscreen', monospace";
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(248, 248, 240, 0.7)';
        ctx.fillText(name.toUpperCase(), 24, 40);

        // Underline
        const textWidth = ctx.measureText(name.toUpperCase()).width;
        ctx.fillStyle = 'rgba(248, 248, 240, 0.3)';
        ctx.fillRect(24, 46, textWidth, 2);
        ctx.restore();
    }

    drawVignette(ctx, w, h) {
        // Cel-shading vignette
        const gradient = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.7);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(26, 26, 46, 0.2)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
    }
}
