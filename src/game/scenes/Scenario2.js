import Phaser from 'phaser';

export default class Scenario2 extends Phaser.Scene {
    constructor() {
        super('Scenario2');
        this.player = null;
    }

    preload() {
        // Reuse same assets as GameScene; ensure keys exist.
        this.load.image('dungeon2', 'assets/Scenario2.png');
    }

    create() {
        const { width, height } = this.scale;
        this.add.image(width / 2, height / 2, 'dungeon2').setDisplaySize(width, height);

        this.add.text(width / 2, 80, 'SCENARIO 2', {
            fontSize: '48px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setDepth(200);

        // Simple instruction to the player
        this.add.text(width / 2, height - 100, 'Welcome to the next room!', {
            fontSize: '28px',
            color: '#ffff66',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(200);
    }
}
