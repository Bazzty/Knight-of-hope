import Phaser from 'phaser';
import GameScene from './scenes/GameScene';

const config = {
    type: Phaser.AUTO,
    parent: 'phaser-container', // ¡Este ID debe ser igual al del div en App.vue!
    width: 1280,
    height: 720,
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 } }
    },
    scene: [GameScene]
};

let gameInstance = null;

export const initGame = () => {
    if (gameInstance) gameInstance.destroy(true);
    gameInstance = new Phaser.Game(config);
    return gameInstance;
};

export const destroyGame = () => {
    if (gameInstance) {
        gameInstance.destroy(true);
        gameInstance = null;
    }
};