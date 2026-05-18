import Phaser from 'phaser';
import GameScene from './scenes/GameScene';

let gameInstance = null;

const config = {
    type: Phaser.AUTO,
    parent: 'phaser-container',
    width: 1280,
    height: 720,
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 } }
    },
    scene: [GameScene]
};

export const initGame = () => {  // Asegura que solo haya una instancia del juego
    if (gameInstance) {
        gameInstance.destroy(true);
    }

    gameInstance = new Phaser.Game(config); // Crea una nueva instancia del juego

    if (typeof window !== 'undefined') {
        window.__KOH_GAME = gameInstance;  // Guarda la instancia del juego en una variable global para facilitar su acceso desde otros módulos
    }

    return gameInstance;
};

export const destroyGame = () => {
    if (gameInstance) {
        gameInstance.destroy(true);
        gameInstance = null;
    }
};