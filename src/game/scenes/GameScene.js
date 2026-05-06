import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        this.load.image('knight', 'assets/knight.png');
    }

    create() {
        this.add.image(400, 300, 'knight').setScale(0.2);
    }
}
