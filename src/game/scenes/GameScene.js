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
        this.load.spritesheet('knight_walk', 'assets/movimientoFinal.png', {
            frameWidth: 69,
            frameHeight: 69
        });
        this.load.spritesheet('knight_attack', 'assets/Ataquefinal.png', {
            frameWidth: 69,
            frameHeight: 69
        });
        this.load.spritesheet('enemigo', 'assets/enemigo.png', {
            frameWidth: 69, // Ajusta según las medidas reales de tu spritesheet
            frameHeight: 69
        });
        this.load.spritesheet('enemigo_attack', 'assets/ataqueEnemigo.png', {
            frameWidth: 69,
            frameHeight: 69
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
                frames: this.anims.generateFrameNumbers('knight_walk', { start: 0, end: 15 }),
                frameRate: 10,
                repeat: -1
            });
        }

        if (!this.anims.exists('knight_attack_anim')) {
            this.anims.create({
                key: 'knight_attack_anim',
                frames: this.anims.generateFrameNumbers('knight_attack', { start: 0, end: 11 }),
                frameRate: 18,
                repeat: 0
            });
        }

        if (!this.anims.exists('enemigo_walk_anim')) {
            this.anims.create({
                key: 'enemigo_walk_anim',
                frames: this.anims.generateFrameNumbers('enemigo'), // Usa todos los fotogramas del spritesheet
                frameRate: 4,
                repeat: -1
            });
        }

        if (!this.anims.exists('enemigo_attack_anim')) {
            this.anims.create({
                key: 'enemigo_attack_anim',
                frames: this.anims.generateFrameNumbers('enemigo_attack', { start: 0, end: 11 }),
                frameRate: 10,
                repeat: 0
            });
        }

        // Empieza en el píxel 200 desde el lado izquierdo de la pantalla
        this.player = createPlayer(this, 200, 750);

        // Enemigo cubriendo la puerta derecha
        this.enemigo = this.physics.add.sprite(1100, 480, 'enemigo');
        this.enemigo.setScale(6);
        this.enemigo.setFlipX(true);
        this.enemigo.isAttacking = false;
        this.enemigo.lastAttackTime = 0; // Controla el tiempo entre ataques

        this.enemigo.on('animationcomplete', (anim) => {
            if (anim.key === 'enemigo_attack_anim') {
                this.enemigo.isAttacking = false;
                this.enemigo.setTexture('enemigo');
            }
        });

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

        // Actualizar la profundidad en función de Y
        this.player.setDepth(this.player.y);
        // Lógica para que el enemigo persiga al jugador solo en línea horizontal
        if (this.enemigo && this.enemigo.active) {
            this.enemigo.setDepth(this.enemigo.y);
            const velocidad = 80;
            const distanciaX = this.player.x - this.enemigo.x;

            if (this.enemigo.isAttacking) {
                this.enemigo.setVelocityX(0);
            } else if (Math.abs(distanciaX) > 160) { // Un pequeño margen para que no tiemble
                if (distanciaX > 0) {
                    this.enemigo.setVelocityX(velocidad);
                    this.enemigo.setFlipX(false);
                } else {
                    this.enemigo.setVelocityX(-velocidad);
                    this.enemigo.setFlipX(true);
                }
                this.enemigo.play('enemigo_walk_anim', true); // Reproducir animación del enemigo
            } else {
                this.enemigo.setVelocityX(0); // Se detiene si está a su misma altura en X

                // Intentar atacar si ha pasado el tiempo de enfriamiento (cooldown, ej: 2.5 seg)
                const tiempoActual = this.time.now;

                if (tiempoActual - this.enemigo.lastAttackTime > 2500) {
                    this.enemigo.isAttacking = true;
                    this.enemigo.lastAttackTime = tiempoActual;
                    this.enemigo.setTexture('enemigo_attack');
                    this.enemigo.play('enemigo_attack_anim', true);

                    // Asegurarnos de que mire al jugador al atacar
                    this.enemigo.setFlipX(distanciaX < 0);
                } else if (this.enemigo.anims.currentAnim && this.enemigo.anims.currentAnim.key !== 'enemigo_attack_anim') {
                    this.enemigo.anims.stop(); // Detener animación cuando deje de moverse
                }
            }

            // Asegurarnos de que no se mueva verticalmente
            this.enemigo.setVelocityY(0);
        }
    }
}