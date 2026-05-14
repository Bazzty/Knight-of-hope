import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        this.load.image('dungeon', 'assets/dungeon.png');
        this.load.spritesheet('torch', 'assets/torch.png', {
            frameWidth: 64,
            frameHeight: 64,
        });
    }

    create() {
        const { width, height } = this.scale;

        this.add.image(width / 2, height /2, 'dungeon').setDisplaySize(width, height);

        this.anims.create({
            key: 'torch-flicker',
            frames: this.anims.generateFrameNumbers('torch', { start: 0, end: 24 }),
            frameRate: 10,
            repeat: -1
        });

        // Posiciones aproximadas de los porta-antorchas en el fondo escalado a 800x600
        const torchScale = 1.5;
        const torchPositions = [
            { x: 540, y:320 },
            { x: 800, y: 320 },
        ];

        torchPositions.forEach(({ x, y }, index) => {
        const sprite = this.add.sprite(x, y, 'torch').setScale(torchScale).play('torch-flicker');
        if (index === 1) sprite.setFlipX(true);
        });
    }
}
