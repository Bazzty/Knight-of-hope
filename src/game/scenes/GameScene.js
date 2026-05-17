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
        // Ponemos ?v=12 para que ignore totalmente cualquier error de caché anterior

        // Caminar: 480 / 8 cuadros = 60px
        this.load.spritesheet('knight_walk', 'assets/walk_final.png?v=12', {
            frameWidth: 60,
            frameHeight: 200
        });

        // ¡AQUÍ ESTÁ LA MAGIA! Cambiado a 60px para que calce con tu cuadrícula real
        this.load.spritesheet('knight_attack', 'assets/attack_final.png?v=12', {
            frameWidth: 60,
            frameHeight: 200
        });
    }

    create() {
        const { width, height } = this.scale;
        this.physics.world.setBounds(0, 0, width, height);

        // Animación de caminar (8 cuadros, del 0 al 7)
        if (!this.anims.exists('knight_walk_anim')) {
            this.anims.create({
                key: 'knight_walk_anim',
                frames: this.anims.generateFrameNumbers('knight_walk', { start: 0, end: 7 }),
                frameRate: 8,
                repeat: -1
            });
        }

        // Animación de ataque (6 cuadros, del 0 al 5)
        if (!this.anims.exists('knight_attack_anim')) {
            this.anims.create({
                key: 'knight_attack_anim',
                frames: this.anims.generateFrameNumbers('knight_attack', { start: 0, end: 5 }),
                frameRate: 10,
                repeat: 0
            });
        }

        this.player = createPlayer(this, Math.floor(width / 2), Math.floor(height / 2));
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