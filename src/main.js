// =============================================
// MESSENGER GAME — Main Entry Point
// =============================================
import { TitleScene } from './scenes/TitleScene.js';
import { GameScene } from './scenes/GameScene.js';
import { DialogueSystem } from './systems/DialogueSystem.js';
import { QuestSystem } from './systems/QuestSystem.js';
import { HUD } from './ui/HUD.js';

class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.currentScene = null;
    this.scenes = {};
    this.lastTime = 0;
    this.animationId = null;
    this.mouse = { x: 0, y: 0, clicked: false, clickX: 0, clickY: 0 };
    this.screenFade = 0;
    this.fadeDirection = 0;
    this.pendingScene = null;

    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.canvas.addEventListener('click', (e) => this.handleClick(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));

    this.init();
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
  }

  handleClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.clickX = e.clientX - rect.left;
    this.mouse.clickY = e.clientY - rect.top;
    this.mouse.clicked = true;
  }

  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = e.clientX - rect.left;
    this.mouse.y = e.clientY - rect.top;
  }

  async init() {
    // Initialize systems
    this.dialogueSystem = new DialogueSystem();
    this.questSystem = new QuestSystem();
    this.hud = new HUD(this);

    // Initialize scenes
    this.scenes.title = new TitleScene(this);
    this.scenes.game = new GameScene(this);

    // Simulate loading
    const loaderBar = document.getElementById('loader-bar');
    for (let i = 0; i <= 100; i += 2) {
      loaderBar.style.width = `${i}%`;
      await new Promise(r => setTimeout(r, 30));
    }

    // Hide loading screen
    await new Promise(r => setTimeout(r, 400));
    document.getElementById('loading-screen').classList.add('fade-out');
    await new Promise(r => setTimeout(r, 800));
    document.getElementById('loading-screen').style.display = 'none';

    // Start with title scene
    this.switchScene('title');

    // Begin game loop
    this.lastTime = performance.now();
    this.gameLoop(this.lastTime);
  }

  switchScene(sceneName, fadeTransition = false) {
    if (fadeTransition) {
      this.pendingScene = sceneName;
      this.fadeDirection = 1;
    } else {
      if (this.currentScene && this.currentScene.exit) {
        this.currentScene.exit();
      }
      this.currentScene = this.scenes[sceneName];
      if (this.currentScene && this.currentScene.enter) {
        this.currentScene.enter();
      }
    }
  }

  gameLoop(timestamp) {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
    this.lastTime = timestamp;

    // Handle fade transition
    if (this.fadeDirection !== 0) {
      this.screenFade += this.fadeDirection * dt * 3;
      if (this.screenFade >= 1 && this.fadeDirection > 0) {
        this.screenFade = 1;
        this.fadeDirection = -1;
        if (this.pendingScene) {
          if (this.currentScene && this.currentScene.exit) this.currentScene.exit();
          this.currentScene = this.scenes[this.pendingScene];
          if (this.currentScene && this.currentScene.enter) this.currentScene.enter();
          this.pendingScene = null;
        }
      } else if (this.screenFade <= 0 && this.fadeDirection < 0) {
        this.screenFade = 0;
        this.fadeDirection = 0;
      }
    }

    // Update
    if (this.currentScene && this.currentScene.update) {
      this.currentScene.update(dt);
    }

    // Render
    this.ctx.clearRect(0, 0, this.width, this.height);
    if (this.currentScene && this.currentScene.render) {
      this.currentScene.render(this.ctx, this.width, this.height);
    }

    // Fade overlay
    if (this.screenFade > 0) {
      this.ctx.fillStyle = `rgba(26, 26, 46, ${this.screenFade})`;
      this.ctx.fillRect(0, 0, this.width, this.height);
    }

    // Reset click
    this.mouse.clicked = false;

    this.animationId = requestAnimationFrame((t) => this.gameLoop(t));
  }
}

// Start game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
});
