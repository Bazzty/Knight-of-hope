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
        // Al cargarlo como imagen plana, evitamos que Phaser recorte uniformemente con márgenes en ambos ejes
        this.load.image('knight', 'assets/test4.png');
    }

    create() {
        const { width, height } = this.scale;
        this.physics.world.setBounds(0, 0, width, height);

        // Agregamos manualmente los cuadros al mapa de la textura porque la imagen original 
        // tiene al jugador desplazado específicamente en el eje Y (584px hasta 969px).
        const texture = this.textures.get('knight');
        if (texture && !texture.has('0')) {
            for (let i = 0; i < 8; i++) {
                // frameId, sourceIndex, x, y, width, height
                texture.add(i.toString(), 0, i * 352, 584, 352, 386);
            }
        }

        if (!this.anims.exists('knight-walk')) {
            this.anims.create({
                key: 'knight-walk',
                // Construimos las referencias de los cuadros de animación explícitamente
                frames: [
                    { key: 'knight', frame: '0' },
                    { key: 'knight', frame: '1' },
                    { key: 'knight', frame: '2' },
                    { key: 'knight', frame: '3' },
                    { key: 'knight', frame: '4' },
                    { key: 'knight', frame: '5' },
                    { key: 'knight', frame: '6' },
                    { key: 'knight', frame: '7' }
                ],
                frameRate: 8,
                repeat: -1,
            });
        }

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
