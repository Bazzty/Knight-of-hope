import Phaser from 'phaser';
import GameScene from './scenes/GameScene';

let gameInstance = null;

const config = {
    type: Phaser.AUTO,
    parent: 'phaser-container', // ¡Este ID debe ser igual al del div en App.vue!
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 } }
    },
    scene: [GameScene]
};

export const initGame = () => {
    if (gameInstance) {
        gameInstance.destroy(true);
    }

    gameInstance = new Phaser.Game(config);

    if (typeof window !== 'undefined') {
        window.__KOH_GAME = gameInstance;
    }

    return gameInstance;
};

export const destroyGame = () => {
    if (gameInstance) {
        gameInstance.destroy(true);
        gameInstance = null;
    }

    if (typeof window !== 'undefined') {
        window.__KOH_GAME = null;
    }
};