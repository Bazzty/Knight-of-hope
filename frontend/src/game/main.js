import Phaser from 'phaser';
import IntroScene from './scenes/IntroScene';
import GameScene from './scenes/GameScene';
import Scenario2 from './scenes/Scenario2';
import Scenario3 from './scenes/Scenario3';
import ScenarioBoss from './scenes/ScenarioBoss';
import UpgradeScene from './scenes/UpgradeScene';
let gameInstance = null;

const config = {
    type: Phaser.AUTO,
    parent: 'phaser-container',
    width: 1280,
    height: 720,
    pixelArt: true,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 } }
    },
    scene: [IntroScene, GameScene, Scenario2, Scenario3, ScenarioBoss, UpgradeScene]
};

export const initGame = (startScene = null) => {
    if (gameInstance) {
        gameInstance.destroy(true);
    }

    gameInstance = new Phaser.Game(config);

    if (startScene) {
        gameInstance.events.on('ready', () => {
            gameInstance.scene.stop('IntroScene');
            gameInstance.scene.start(startScene);
        });
    }

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
};
