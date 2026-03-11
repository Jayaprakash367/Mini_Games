// =============================================
// MESSENGER GAME — Main Entry Point
// Complete Real-Time Game Engine
// =============================================
import { TitleScene } from './scenes/TitleScene.js';
import { GameScene } from './scenes/GameScene.js';
import { VictoryScene } from './scenes/VictoryScene.js';
import { DialogueSystem } from './systems/DialogueSystem.js';
import { QuestSystem } from './systems/QuestSystem.js';
import { AudioSystem, audioSystem } from './systems/AudioSystem.js';
import { SaveSystem, saveSystem } from './systems/SaveSystem.js';
import { InputSystem, inputSystem } from './systems/InputSystem.js';
import { InventorySystem, inventorySystem } from './systems/InventorySystem.js';
import { PetSystem, petSystem } from './systems/PetSystem.js';
import { AchievementSystem, achievementSystem } from './systems/AchievementSystem.js';
import { MenuSystem, menuSystem } from './systems/MenuSystem.js';
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
    
    // Game state tracking
    this.gameState = {
      playTime: 0,
      stepsWalked: 0,
      npcsInteracted: 0,
      dialoguesCompleted: 0,
      itemsCollected: 0,
      areasVisited: new Set(),
      outfitsUsed: new Set(['default']),
      completedQuests: [],
      totalQuestsCompleted: 0,
      hasPet: false,
      petsUnlocked: 1,
      petHappiness: 100,
      fastestQuestTime: Infinity,
      currentQuestStartTime: 0,
      gameStarted: false
    };
    
    // FPS tracking
    this.frameCount = 0;
    this.fpsTime = 0;
    this.currentFPS = 60;

    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.canvas.addEventListener('click', (e) => this.handleClick(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    
    // Initialize audio on first user interaction
    const initAudio = async () => {
      await audioSystem.init();
      window.removeEventListener('click', initAudio);
      window.removeEventListener('keydown', initAudio);
    };
    window.addEventListener('click', initAudio, { once: true });
    window.addEventListener('keydown', initAudio, { once: true });

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
    
    // Play click sound
    audioSystem.play('click');
    
    // Handle menu clicks first
    if (menuSystem.isPaused) {
      const result = menuSystem.handleClick(this.mouse.clickX, this.mouse.clickY, this.width, this.height);
      if (result) {
        e.stopPropagation();
        return;
      }
    }
    
    // Handle inventory clicks
    if (inventorySystem.isOpen) {
      const invX = (this.width - 320) / 2;
      const invY = (this.height - 400) / 2;
      if (inventorySystem.handleClick(this.mouse.clickX, this.mouse.clickY, invX, invY)) {
        e.stopPropagation();
        return;
      }
    }
    
    // Handle pet selection clicks
    if (petSystem.isSelectionOpen) {
      const petX = (this.width - 400) / 2;
      const petY = (this.height - 350) / 2;
      const result = petSystem.handleSelectionClick(this.mouse.clickX, this.mouse.clickY, petX, petY, 400, 350);
      if (result) {
        if (result !== 'dismissed') {
          audioSystem.play('petHappy');
        }
        e.stopPropagation();
        return;
      }
    }
    
    // Handle achievement panel clicks
    if (achievementSystem.isDisplayOpen) {
      const achX = (this.width - 500) / 2;
      const achY = (this.height - 450) / 2;
      achievementSystem.handlePanelClick(this.mouse.clickX, this.mouse.clickY, achX, achY, 500);
    }
    
    // Handle victory scene clicks
    if (this.victoryScene && this.victoryScene.isActive) {
      this.victoryScene.handleClick(this.mouse.clickX, this.mouse.clickY, this.width, this.height);
    }
  }

  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = e.clientX - rect.left;
    this.mouse.y = e.clientY - rect.top;
  }

  async init() {
    try {
      console.log('Game initializing...');
      
      // Initialize core systems
      this.dialogueSystem = new DialogueSystem();
      console.log('DialogueSystem initialized');
      
      this.questSystem = new QuestSystem();
      console.log('QuestSystem initialized');
      
      this.hud = new HUD(this);
      console.log('HUD initialized');
      
      // Reference to singleton systems
      this.audioSystem = audioSystem;
      this.saveSystem = saveSystem;
      this.inputSystem = inputSystem;
      this.inventorySystem = inventorySystem;
      this.petSystem = petSystem;
      this.achievementSystem = achievementSystem;
      this.menuSystem = menuSystem;
      
      // Initialize victory scene
      this.victoryScene = new VictoryScene();
      console.log('VictoryScene initialized');
      
      // Setup input callbacks
      this.setupInputCallbacks();
      console.log('Input callbacks setup');
      
      // Setup menu callbacks
      this.setupMenuCallbacks();
      console.log('Menu callbacks setup');
      
      // Setup quest callbacks
      this.setupQuestCallbacks();
      console.log('Quest callbacks setup');
      
      // Setup achievement callbacks
      this.setupAchievementCallbacks();
      console.log('Achievement callbacks setup');
      
      // Load saved settings
      const settings = saveSystem.loadSettings();
      if (menuSystem.loadSettings) {
        menuSystem.loadSettings(settings);
      }
      this.applySettings(settings);
      console.log('Settings loaded');

      // Initialize scenes
      this.scenes.title = new TitleScene(this);
      console.log('TitleScene initialized');
      
      this.scenes.game = new GameScene(this);
      console.log('GameScene initialized');

      // Simulate loading
      const loaderBar = document.getElementById('loader-bar');
      if (loaderBar) {
        for (let i = 0; i <= 100; i += 2) {
          loaderBar.style.width = `${i}%`;
          await new Promise(r => setTimeout(r, 30));
        }
      }

      // Hide loading screen
      await new Promise(r => setTimeout(r, 400));
      const loadingScreen = document.getElementById('loading-screen');
      if (loadingScreen) {
        loadingScreen.classList.add('fade-out');
        await new Promise(r => setTimeout(r, 800));
        loadingScreen.style.display = 'none';
      }
      console.log('Loading screen hidden');

      // Check for auto-save
      if (saveSystem.hasSave && saveSystem.hasSave('auto')) {
        // Could show a "Continue?" prompt here
      }

      // Start with title scene
      this.switchScene('title');

      // Begin game loop
      this.lastTime = performance.now();
      this.gameLoop(this.lastTime);
      
      console.log('Game initialized successfully!');
    } catch (error) {
      console.error('Error during game initialization:', error);
      // Still try to hide loading screen on error
      const loadingScreen = document.getElementById('loading-screen');
      if (loadingScreen) {
        loadingScreen.innerHTML = `<div style="color: #ff4444; text-align: center; padding: 20px;">
          <p>Error loading game:</p>
          <p style="font-size: 12px;">${error.message}</p>
          <p style="font-size: 10px;">Check console for details</p>
        </div>`;
      }
    }
  }
  
  setupInputCallbacks() {
    inputSystem.setCallback('onInteract', () => {
      if (this.currentScene && this.currentScene.handleInteraction) {
        this.currentScene.handleInteraction();
      }
    });
    
    inputSystem.setCallback('onInventory', () => {
      if (this.scenes.game && this.currentScene === this.scenes.game) {
        inventorySystem.toggle();
        audioSystem.play(inventorySystem.isOpen ? 'menuOpen' : 'menuClose');
      }
    });
    
    inputSystem.setCallback('onMenu', () => {
      if (achievementSystem.isDisplayOpen) {
        achievementSystem.toggleDisplay();
      } else if (inventorySystem.isOpen) {
        inventorySystem.toggle();
      } else if (petSystem.isSelectionOpen) {
        petSystem.toggleSelection();
      } else if (menuSystem.currentMenu) {
        menuSystem.goBack();
      } else if (this.currentScene === this.scenes.game) {
        menuSystem.togglePause();
        audioSystem.play(menuSystem.isPaused ? 'menuOpen' : 'menuClose');
      }
    });
    
    inputSystem.setCallback('onPause', () => {
      if (this.currentScene === this.scenes.game && !inventorySystem.isOpen) {
        menuSystem.togglePause();
        audioSystem.play(menuSystem.isPaused ? 'menuOpen' : 'menuClose');
      }
    });
    
    inputSystem.setCallback('onQuickSave', () => {
      if (this.currentScene === this.scenes.game) {
        this.quickSave();
      }
    });
    
    inputSystem.setCallback('onQuickLoad', () => {
      this.quickLoad();
    });
  }
  
  setupMenuCallbacks() {
    menuSystem.onSettingsChange = (settings) => {
      this.applySettings(settings);
      saveSystem.saveSettings(settings);
    };
    
    menuSystem.onSave = (slot) => {
      this.saveGame(slot);
      audioSystem.play('success');
    };
    
    menuSystem.onLoad = () => {
      this.loadGame('default');
    };
    
    menuSystem.onQuit = () => {
      // Save before quitting
      this.saveGame('auto');
      this.switchScene('title', true);
    };
    
    menuSystem.onResume = () => {
      // Resume game
    };
  }
  
  setupQuestCallbacks() {
    // Track quest completion for achievements
    // Wrap addProgress to also track completions
    const originalAddProgress = this.questSystem.addProgress.bind(this.questSystem);
    this.questSystem.addProgress = (questId) => {
      originalAddProgress(questId);
      
      // Check if quest was just completed
      const quest = this.questSystem.quests.find(q => q.id === questId);
      if (quest && quest.completed && !this.gameState.completedQuests.includes(questId)) {
        this.gameState.completedQuests.push(questId);
        this.gameState.totalQuestsCompleted++;
        
        // Track speed runs
        if (this.gameState.currentQuestStartTime > 0) {
          const questTime = Date.now() - this.gameState.currentQuestStartTime;
          this.gameState.fastestQuestTime = Math.min(this.gameState.fastestQuestTime, questTime);
        }
        
        audioSystem.play('questComplete');
        this.checkAchievements();
        this.checkWinCondition();
      }
    };
  }
  
  setupAchievementCallbacks() {
    achievementSystem.onAchievementUnlocked = (achievement) => {
      audioSystem.play('achievement');
      
      // Check for pet unlocks based on achievements
      petSystem.checkUnlocks({
        completedQuests: this.gameState.totalQuestsCompleted,
        collectiblesFound: this.gameState.itemsCollected,
        areasVisited: this.gameState.areasVisited.size
      });
    };
  }
  
  applySettings(settings) {
    if (!settings) return;
    
    audioSystem.setMasterVolume(settings.masterVolume || 0.7);
    audioSystem.setMusicVolume(settings.musicVolume || 0.5);
    audioSystem.setSFXVolume(settings.sfxVolume || 0.8);
    
    if (settings.musicEnabled && !audioSystem.currentMusic) {
      audioSystem.playBackgroundMusic();
    } else if (!settings.musicEnabled && audioSystem.currentMusic) {
      audioSystem.stopBackgroundMusic();
    }
    
    inputSystem.keyboardMovementEnabled = settings.keyboardControls !== false;
    inputSystem.touchControlsEnabled = settings.touchControls !== false;
  }
  
  saveGame(slot = 'default') {
    const gameSceneData = this.scenes.game ? {
      player: this.scenes.game.player,
      currentArea: this.scenes.game.currentArea,
      npcs: this.scenes.game.npcs
    } : {};
    
    const fullState = {
      ...gameSceneData,
      questSystem: this.questSystem,
      inventorySystem: inventorySystem,
      achievementSystem: achievementSystem,
      petSystem: petSystem,
      playTime: this.gameState.playTime,
      stats: this.gameState
    };
    
    const success = saveSystem.save(fullState, slot);
    if (success) {
      this.showNotification('Game Saved!');
    }
    return success;
  }
  
  loadGame(slot = 'default') {
    const loadedData = saveSystem.load(slot);
    if (!loadedData) {
      this.showNotification('No save found');
      return false;
    }
    
    // Apply loaded data
    if (loadedData.quests) {
      loadedData.quests.forEach(savedQuest => {
        const quest = this.questSystem.quests.find(q => q.id === savedQuest.id);
        if (quest) {
          quest.progress = savedQuest.progress;
          quest.completed = savedQuest.completed;
        }
      });
    }
    
    if (loadedData.inventory) {
      inventorySystem.loadState(loadedData.inventory);
    }
    
    if (loadedData.achievements) {
      achievementSystem.loadState(loadedData.achievements);
    }
    
    if (loadedData.pet) {
      petSystem.loadState(loadedData.pet);
    }
    
    if (loadedData.playTime) {
      this.gameState.playTime = loadedData.playTime;
    }
    
    if (loadedData.stats) {
      Object.assign(this.gameState, loadedData.stats);
    }
    
    // Switch to game scene if not already there
    if (this.currentScene !== this.scenes.game) {
      this.switchScene('game', true);
    }
    
    this.showNotification('Game Loaded!');
    return true;
  }
  
  quickSave() {
    this.saveGame('auto');
    this.showNotification('Quick Save!');
  }
  
  quickLoad() {
    if (saveSystem.hasSave('auto')) {
      this.loadGame('auto');
      this.showNotification('Quick Load!');
    } else {
      this.showNotification('No quick save found');
    }
  }
  
  showNotification(message) {
    // Use HUD notification system
    if (this.hud && this.hud.showToast) {
      this.hud.showToast(message);
    } else {
      console.log(message);
    }
  }
  
  checkAchievements() {
    achievementSystem.checkAllAchievements({
      ...this.gameState,
      inventory: inventorySystem,
      completedQuests: this.gameState.completedQuests,
      totalQuestsCompleted: this.gameState.totalQuestsCompleted
    });
  }
  
  checkWinCondition() {
    if (VictoryScene.checkWinCondition(this.questSystem)) {
      // Player has won!
      this.triggerVictory();
    }
  }
  
  triggerVictory() {
    const stats = {
      questsCompleted: this.gameState.totalQuestsCompleted,
      npcsInteracted: this.gameState.npcsInteracted,
      stepsWalked: this.gameState.stepsWalked,
      playTime: this.gameState.playTime,
      itemsCollected: this.gameState.itemsCollected,
      achievementsUnlocked: achievementSystem.getProgress().unlocked,
      totalAchievements: achievementSystem.getProgress().total
    };
    
    this.victoryScene.activate(stats);
    
    this.victoryScene.onComplete = () => {
      this.victoryScene.deactivate();
      this.switchScene('title', true);
    };
    
    this.victoryScene.onReplay = () => {
      this.victoryScene.deactivate();
      this.resetGame();
      this.switchScene('game', true);
    };
  }
  
  resetGame() {
    // Reset game state
    this.gameState = {
      playTime: 0,
      stepsWalked: 0,
      npcsInteracted: 0,
      dialoguesCompleted: 0,
      itemsCollected: 0,
      areasVisited: new Set(),
      outfitsUsed: new Set(['default']),
      completedQuests: [],
      totalQuestsCompleted: 0,
      hasPet: false,
      petsUnlocked: 1,
      petHappiness: 100,
      fastestQuestTime: Infinity,
      currentQuestStartTime: 0,
      gameStarted: false
    };
    
    // Reset systems
    this.questSystem = new QuestSystem();
    inventorySystem.items = [];
    achievementSystem.initAchievements();
    petSystem.dismissPet();
    
    // Reinitialize game scene
    this.scenes.game = new GameScene(this);
  }
  
  trackStep() {
    this.gameState.stepsWalked++;
    if (this.gameState.stepsWalked % 50 === 0) {
      this.checkAchievements();
    }
  }
  
  trackNPCInteraction() {
    this.gameState.npcsInteracted++;
    this.checkAchievements();
  }
  
  trackDialogueComplete() {
    this.gameState.dialoguesCompleted++;
    this.checkAchievements();
  }
  
  trackItemCollected() {
    this.gameState.itemsCollected++;
    audioSystem.play('pickup');
    this.checkAchievements();
  }
  
  trackAreaVisit(areaName) {
    if (!this.gameState.areasVisited.has(areaName)) {
      this.gameState.areasVisited.add(areaName);
      audioSystem.play('transition');
      this.checkAchievements();
    }
  }
  
  trackOutfitChange(outfitName) {
    this.gameState.outfitsUsed.add(outfitName);
    this.checkAchievements();
  }

  switchScene(sceneName, fadeTransition = false) {
    if (fadeTransition) {
      this.pendingScene = sceneName;
      this.fadeDirection = 1;
      audioSystem.play('transition');
    } else {
      if (this.currentScene && this.currentScene.exit) {
        this.currentScene.exit();
      }
      this.currentScene = this.scenes[sceneName];
      if (this.currentScene && this.currentScene.enter) {
        this.currentScene.enter();
      }
      
      // Mark game as started when entering game scene
      if (sceneName === 'game' && !this.gameState.gameStarted) {
        this.gameState.gameStarted = true;
        achievementSystem.checkAchievement('first_steps', this.gameState);
        
        // Start background music
        if (menuSystem.settings.musicEnabled) {
          audioSystem.playBackgroundMusic();
        }
        
        // Start auto-save
        saveSystem.startAutoSave(this.getFullGameState());
      }
    }
  }
  
  getFullGameState() {
    return {
      player: this.scenes.game?.player,
      questSystem: this.questSystem,
      inventorySystem: inventorySystem,
      achievementSystem: achievementSystem,
      petSystem: petSystem,
      npcs: this.scenes.game?.npcs,
      currentArea: this.scenes.game?.currentArea,
      playTime: this.gameState.playTime,
      stats: this.gameState
    };
  }

  gameLoop(timestamp) {
    const dtMs = timestamp - this.lastTime;
    const dt = Math.min(dtMs / 1000, 0.05);
    this.lastTime = timestamp;
    
    // Track FPS
    this.frameCount++;
    this.fpsTime += dtMs;
    if (this.fpsTime >= 1000) {
      this.currentFPS = this.frameCount;
      this.frameCount = 0;
      this.fpsTime = 0;
    }
    
    // Track play time
    if (this.currentScene === this.scenes.game && !menuSystem.isPaused) {
      this.gameState.playTime += dtMs;
    }

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

    // Update (skip if paused)
    if (!menuSystem.isPaused) {
      if (this.currentScene && this.currentScene.update) {
        this.currentScene.update(dt);
      }
      
      // Update pet system
      if (this.currentScene === this.scenes.game && petSystem.currentPet) {
        const player = this.scenes.game.player;
        if (player) {
          petSystem.update(dtMs, player.x, player.y);
          this.gameState.hasPet = true;
          this.gameState.petHappiness = petSystem.currentPet.happiness;
        }
      }
      
      // Update victory scene
      if (this.victoryScene.isActive) {
        this.victoryScene.update(dtMs);
      }
      
      // Check time-based achievements
      if (this.gameState.playTime > 0 && this.gameState.playTime % 60000 < dtMs) {
        this.checkAchievements();
      }
    }

    // Render
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    if (this.currentScene && this.currentScene.render) {
      this.currentScene.render(this.ctx, this.width, this.height);
    }
    
    // Render pet (if in game scene)
    if (this.currentScene === this.scenes.game && petSystem.currentPet) {
      const camera = this.scenes.game.camera || { x: 0, y: 0 };
      petSystem.render(this.ctx, camera.x, camera.y);
    }
    
    // Render inventory overlay
    if (inventorySystem.isOpen) {
      const invWidth = 320;
      const invHeight = 420;
      const invX = (this.width - invWidth) / 2;
      const invY = (this.height - invHeight) / 2;
      inventorySystem.render(this.ctx, invX, invY, invWidth, invHeight);
    }
    
    // Render pet selection overlay
    if (petSystem.isSelectionOpen) {
      const petWidth = 400;
      const petHeight = 350;
      const petX = (this.width - petWidth) / 2;
      const petY = (this.height - petHeight) / 2;
      petSystem.renderSelectionUI(this.ctx, petX, petY, petWidth, petHeight);
    }
    
    // Render achievement panel
    if (achievementSystem.isDisplayOpen) {
      const achWidth = 500;
      const achHeight = 450;
      const achX = (this.width - achWidth) / 2;
      const achY = (this.height - achHeight) / 2;
      achievementSystem.renderPanel(this.ctx, achX, achY, achWidth, achHeight);
    }
    
    // Render achievement notifications
    achievementSystem.renderNotification(this.ctx, this.width, this.height);
    
    // Render victory scene overlay
    if (this.victoryScene.isActive) {
      this.victoryScene.render(this.ctx, this.width, this.height);
    }
    
    // Render pause menu (on top of everything)
    menuSystem.render(this.ctx, this.width, this.height);
    
    // Render FPS counter
    menuSystem.renderFPS(this.ctx, this.currentFPS);

    // Fade overlay
    if (this.screenFade > 0) {
      this.ctx.fillStyle = `rgba(26, 26, 46, ${this.screenFade})`;
      this.ctx.fillRect(0, 0, this.width, this.height);
    }

    // Reset click
    this.mouse.clicked = false;
    inputSystem.consumeClick();

    this.animationId = requestAnimationFrame((t) => this.gameLoop(t));
  }
}

// Start game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
});
