import Phaser from 'phaser';
import createPlayer from '../entities/player';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.player = null;
        this.cursors = null;
        this.wasd = null;
        this.attackKey = null;
    }

    preload() {
        this.load.image('dungeon', 'assets/dungeon.png');
        this.load.spritesheet('torch', 'assets/torch.png', {
            frameWidth: 64,
            frameHeight: 64,
        });
        this.load.spritesheet('knight_walk', 'assets/movimiento.png', {
            frameWidth: 120,
            frameHeight: 400
        });
        this.load.spritesheet('knight_attack', 'assets/ataque.png', {
            frameWidth: 120,
            frameHeight: 400
        });
    }

    create() {
        const { width, height } = this.scale;

        this.add.image(width / 2, height / 2, 'dungeon').setDisplaySize(width, height);

        this.physics.world.setBounds(0, 0, width, height);

        this.anims.create({
            key: 'torch-flicker',
            frames: this.anims.generateFrameNumbers('torch', { start: 0, end: 24 }),
            frameRate: 10,
            repeat: -1
        });

        const torchPositions = [
            { x: 540, y: 320 },
            { x: 800, y: 320 },
        ];

        torchPositions.forEach(({ x, y }, index) => {
            const sprite = this.add.sprite(x, y, 'torch').setScale(1.5).play('torch-flicker');
            if (index === 1) sprite.setFlipX(true);
        });

        if (!this.anims.exists('knight_walk_anim')) {
            this.anims.create({
                key: 'knight_walk_anim',
                frames: this.anims.generateFrameNumbers('knight_walk', { start: 0, end: 5 }),
                frameRate: 8,
                repeat: -1
            });
        }

        if (!this.anims.exists('knight_attack_anim')) {
            this.anims.create({
                key: 'knight_attack_anim',
                frames: this.anims.generateFrameNumbers('knight_attack', { start: 0, end: 5 }),
                frameRate: 6,
                repeat: 0
            });
        }


        this.player = createPlayer(this, Math.floor(width / 2), 750);
        this.player.setDepth(10);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,A,S,D');
        this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    update() {
        if (!this.player || !this.cursors || !this.wasd) return;

        if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
            this.player.attack();
        }

        this.player.updateMovement({
            left: this.cursors.left.isDown || this.wasd.A.isDown,
            right: this.cursors.right.isDown || this.wasd.D.isDown,
            up: this.cursors.up.isDown || this.wasd.W.isDown,
            down: this.cursors.down.isDown || this.wasd.S.isDown
        });
    }
}
