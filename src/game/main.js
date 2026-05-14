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

export const initGame = () => {
    return new Phaser.Game(config);
};