import Phaser from 'phaser';
import createPlayer from '../entities/player';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.player = null;
        this.cursors = null;
        this.wasd = null;
    }

    preload() {
        this.load.image('knight', 'assets/knight.png');
    }

    create() {
        const { width, height } = this.scale;
        this.physics.world.setBounds(0, 0, width, height);

        this.player = createPlayer(this, Math.floor(width / 2), Math.floor(height / 2));
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,A,S,D');
        this.input.keyboard.addCapture(['W', 'A', 'S', 'D', 'UP', 'DOWN', 'LEFT', 'RIGHT']);

        if (this.game && this.game.canvas) {
            this.game.canvas.setAttribute('tabindex', '0');
            this.game.canvas.focus();
        }
    }

    update() {
        if (!this.player || !this.cursors || !this.wasd) return;

        this.player.updateMovement({
            left: this.cursors.left.isDown || this.wasd.A.isDown,
            right: this.cursors.right.isDown || this.wasd.D.isDown,
            up: this.cursors.up.isDown || this.wasd.W.isDown,
            down: this.cursors.down.isDown || this.wasd.S.isDown
        });
    }
}
