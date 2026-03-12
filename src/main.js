import { GameEngine } from './GameEngine.js';

const engine = new GameEngine();

// Loading screen
const loading = document.getElementById('loading-screen');

window.addEventListener('DOMContentLoaded', () => {
    engine.start();
    // Hide loading screen
    if (loading) {
        loading.style.opacity = '0';
        setTimeout(() => { loading.style.display = 'none'; }, 600);
    }
});
