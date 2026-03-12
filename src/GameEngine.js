import * as THREE from 'three';
import { Renderer } from './Renderer.js';
import { CameraController } from './CameraController.js';
import { InputSystem } from './systems/InputSystem.js';
import { Player } from './entities/Player.js';
import { NPC } from './entities/NPC.js';
import { CityMap } from './world/CityMap.js';
import { DialogueSystem } from './systems/DialogueSystem.js';
import { QuestSystem } from './systems/QuestSystem.js';
import { InteractionSystem } from './systems/InteractionSystem.js';
import { InventorySystem } from './systems/InventorySystem.js';
import { AudioSystem } from './systems/AudioSystem.js';
import { ParticleSystem } from './systems/ParticleSystem.js';
import { DayNightCycle } from './systems/DayNightCycle.js';
import { HUD } from './ui/HUD.js';
import { DialogueUI } from './ui/DialogueUI.js';
import { QuestUI } from './ui/QuestUI.js';
import { NPC_DATA } from './data/NPCData.js';
import { QUEST_DATA } from './data/QuestData.js';

export class GameEngine {
    constructor() {
        this.clock = new THREE.Clock();
        this.isRunning = false;
        this.npcs = [];
        this.elapsedTime = 0;
    }

    init() {
        // Core renderer
        this.renderer = new Renderer();
        this.renderer.init();

        // Input
        this.input = new InputSystem(this.renderer.domElement);

        // World
        this.cityMap = new CityMap(this.renderer.scene);
        this.cityMap.generate();

        // Player
        this.player = new Player(this.renderer.scene);

        // Camera
        this.cameraController = new CameraController(this.renderer.camera, this.player);

        // Wire mouse input to camera
        this.input.onMouseMove = (dx, dy) => this.cameraController.handleMouseMove(dx, dy);
        this.input.onScroll = (d) => this.cameraController.handleScroll(d);

        // Systems
        this.inventorySystem = new InventorySystem();
        this.questSystem = new QuestSystem(QUEST_DATA, this.inventorySystem);
        this.dialogueSystem = new DialogueSystem();
        this.audioSystem = new AudioSystem();

        // Create NPCs
        this.createNPCs();

        // Interaction
        this.interactionSystem = new InteractionSystem(
            this.player, this.npcs,
            this.dialogueSystem, this.questSystem,
            this.inventorySystem, this.audioSystem
        );

        // Particle system
        this.particleSystem = new ParticleSystem(this.renderer.scene);
        this.particleSystem.init();

        // Day/Night cycle
        this.dayNightCycle = new DayNightCycle(
            this.renderer.scene,
            this.renderer.sunLight,
            this.renderer.skyMaterial
        );

        // UI
        this.hud = new HUD(this.inventorySystem, this.questSystem);
        this.dialogueUI = new DialogueUI(this.dialogueSystem);
        this.questUI = new QuestUI(this.questSystem);

        // Pointer lock
        this.renderer.domElement.addEventListener('click', () => {
            if (!this.dialogueSystem.isActive) {
                this.renderer.domElement.requestPointerLock();
            }
        });

        // Start audio on first interaction
        const startAudio = () => {
            this.audioSystem.init();
            this.audioSystem.playAmbient();
            document.removeEventListener('click', startAudio);
            document.removeEventListener('keydown', startAudio);
        };
        document.addEventListener('click', startAudio);
        document.addEventListener('keydown', startAudio);

        this.isRunning = true;
    }

    createNPCs() {
        for (const data of NPC_DATA) {
            const npc = new NPC(this.renderer.scene, data);
            this.npcs.push(npc);
        }
    }

    update() {
        if (!this.isRunning) return;

        const delta = Math.min(this.clock.getDelta(), 0.05); // cap delta
        this.elapsedTime += delta;

        // Update input
        this.input.update();

        // Update player movement
        const paused = this.dialogueSystem.isActive;
        if (!paused) {
            this.player.update(
                delta, this.input,
                this.cityMap.colliders,
                this.cameraController.getForward(),
                this.cameraController.getRight()
            );
        }

        // Camera
        this.cameraController.update(delta);

        // NPCs
        for (const npc of this.npcs) {
            npc.update(delta, this.elapsedTime);
        }

        // Interaction
        this.interactionSystem.update(this.input);

        // Quest
        this.questSystem.update(delta);

        // Dialogue
        this.dialogueSystem.update(delta);

        // Animate world
        this.cityMap.update(this.elapsedTime, delta);

        // Particles
        this.particleSystem.update(this.elapsedTime, delta);

        // Day/Night cycle
        this.dayNightCycle.update(delta);

        // UI
        this.hud.update(this.player);
        this.dialogueUI.update();
        this.questUI.update();

        // Render
        this.renderer.render();

        requestAnimationFrame(() => this.update());
    }

    start() {
        this.init();
        this.update();
    }
}
