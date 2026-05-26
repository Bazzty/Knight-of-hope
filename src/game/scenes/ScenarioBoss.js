import Phaser from 'phaser';
import createPlayer from '../entities/player';
import { useGameStore } from '../../stores/gameState';
import { setupFireFrames, spawnFireTorch } from '../utils/fireEffect';

const UPGRADE_EVERY = 1;

// Sala del Trono — sala final con boss. No resetea el store (el jugador llega con sus stats acumulados).
export default class ScenarioBoss extends Phaser.Scene {
    constructor() {
        super('ScenarioBoss');
        this.player = null;
        this.enemigo = null;
        this.enemigoAttackHitbox = null;
        this.enemigoHpBarBg = null;
        this.enemigoHpBarFill = null;
        this.hpText = null;
        this.gameOver = false;
        this.gameOverText = null;
        this.continueText = null;
        this.cursors = null;
        this.wasd = null;
        this.attackKey = null;
    }

    preload() {
        this.load.image('throne', 'assets/throne.png');
        this.load.image('fire-orange', 'assets/fire-orange.png');
        this.load.spritesheet('knight_walk', 'assets/movimientoFinal.png', { frameWidth: 69, frameHeight: 69 });
        this.load.spritesheet('knight_attack', 'assets/Ataquefinal.png', { frameWidth: 69, frameHeight: 69 });
        this.load.spritesheet('knight_death', 'assets/muerteCaballero.png', { frameWidth: 69, frameHeight: 69 });
        this.load.spritesheet('enemigo', 'assets/enemigo.png', { frameWidth: 69, frameHeight: 69 });
        this.load.spritesheet('enemigo_attack', 'assets/ataqueEnemigo.png', { frameWidth: 69, frameHeight: 69 });
    }

    create() {
        const { width, height } = this.scale;

        this.gameOver = false;
        this.gameOverText = null;
        this.continueText = null;

        this.add.image(width / 2, height / 2, 'throne').setDisplaySize(width, height);
        this.physics.world.setBounds(0, 0, width, height);

        setupFireFrames(this, 'fire-orange', [124, 341, 564, 783, 1001, 1215, 1436, 1657], 110, 887);
        [{ x: 235, y: 260 }, { x: 470, y: 260 }, { x: 810, y: 260 }, { x: 1045, y: 260 }].forEach(({ x, y }, i) => {
            spawnFireTorch(this, x, y, 'fire-orange', 0.22, i * 2);
        });

        if (!this.anims.exists('knight_walk_anim')) {
            this.anims.create({ key: 'knight_walk_anim', frames: this.anims.generateFrameNumbers('knight_walk', { start: 0, end: 15 }), frameRate: 10, repeat: -1 });
        }
        if (!this.anims.exists('knight_attack_anim')) {
            this.anims.create({ key: 'knight_attack_anim', frames: this.anims.generateFrameNumbers('knight_attack', { start: 0, end: 11 }), frameRate: 18, repeat: 0 });
        }
        if (!this.anims.exists('knight_death_anim')) {
            this.anims.create({ key: 'knight_death_anim', frames: this.anims.generateFrameNumbers('knight_death', { start: 0, end: 7 }), frameRate: 8, repeat: 0 });
        }
        if (!this.anims.exists('enemigo_walk_anim')) {
            this.anims.create({ key: 'enemigo_walk_anim', frames: this.anims.generateFrameNumbers('enemigo'), frameRate: 4, repeat: -1 });
        }
        if (!this.anims.exists('enemigo_attack_anim')) {
            this.anims.create({ key: 'enemigo_attack_anim', frames: this.anims.generateFrameNumbers('enemigo_attack', { start: 0, end: 11 }), frameRate: 10, repeat: 0 });
        }

        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,A,S,D');
        this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.hpText = this.add.text(20, 20, '', {
            fontSize: '24px', color: '#ffffff', stroke: '#000000', strokeThickness: 4
        }).setDepth(200);

        // Etiqueta de boss en pantalla.
        this.add.text(width / 2, 20, '⚔ BOSS', {
            fontSize: '28px', color: '#ff4444', stroke: '#000000', strokeThickness: 5
        }).setOrigin(0.5, 0).setDepth(200);

        this.startScenario();
    }

    updateHpDisplay() {
        if (!this.hpText || !this.player) return;
        this.hpText.setText(`HP: ${this.player.hp} / ${this.player.maxHp}`);
    }

    updateEnemigoHpBar() {
        if (!this.enemigoHpBarFill || !this.enemigo) return;
        this.enemigoHpBarFill.width = 200 * (this.enemigo.hp / this.enemigo.maxHp);
    }

    showGameOverUI() {
        if (this.gameOverText || this.continueText) return;
        const { width, height } = this.scale;
        this.gameOverText = this.add.text(width / 2, height / 2 - 24, 'GAME OVER', {
            fontSize: '64px', color: '#ff0000', stroke: '#000000', strokeThickness: 6
        }).setOrigin(0.5).setDepth(300);
        this.continueText = this.add.text(width / 2, height / 2 + 250, 'Press SPACE to retry', {
            fontSize: '26px', color: '#ffffff', stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5).setDepth(300);
    }

    update() {
        if (this.gameOver) {
            if (Phaser.Input.Keyboard.JustDown(this.attackKey)) this.scene.restart();
            return;
        }
        if (!this.player || !this.cursors || !this.wasd) return;

        if (Phaser.Input.Keyboard.JustDown(this.attackKey)) this.player.attack();

        this.player.updateMovement({
            left: this.cursors.left.isDown || this.wasd.A.isDown,
            right: this.cursors.right.isDown || this.wasd.D.isDown,
            up: this.cursors.up.isDown || this.wasd.W.isDown,
            down: this.cursors.down.isDown || this.wasd.S.isDown
        });

        this.player.setDepth(this.player.y);

        if (this.enemigo && this.enemigo.active) {
            this.enemigo.setDepth(this.enemigo.y);

            const distanciaX = this.player.x - this.enemigo.x;
            const velocidad = 90;

            const barX = this.enemigo.x - 100;
            const barY = this.enemigo.y - 270;
            this.enemigoHpBarBg.setPosition(barX, barY);
            this.enemigoHpBarFill.setPosition(barX, barY);

            const enemigoHitOffsetX = this.enemigo.flipX ? -150 : 150;
            this.enemigoAttackHitbox.body.reset(this.enemigo.x + enemigoHitOffsetX, this.enemigo.y);

            if (this.enemigo.isAttacking) {
                this.enemigo.setVelocityX(0);
            } else if (Math.abs(distanciaX) > 160) {
                this.enemigo.setVelocityX(distanciaX > 0 ? velocidad : -velocidad);
                this.enemigo.setFlipX(distanciaX < 0);
                this.enemigo.play('enemigo_walk_anim', true);
            } else {
                this.enemigo.setVelocityX(0);
                const tiempoActual = this.time.now;
                if (tiempoActual - this.enemigo.lastAttackTime > 2000) {
                    this.enemigo.isAttacking = true;
                    this.enemigo.lastAttackTime = tiempoActual;
                    this.enemigo.setTexture('enemigo_attack');
                    this.enemigo.play('enemigo_attack_anim', true);
                    this.enemigoAttackHitbox.body.enable = true;
                    this.enemigo.setFlipX(distanciaX < 0);
                } else if (this.enemigo.anims.currentAnim?.key !== 'enemigo_attack_anim') {
                    this.enemigo.anims.stop();
                }
            }
            this.enemigo.setVelocityY(0);
        }
    }

    startScenario() {
        const store = useGameStore();
        const { width, height } = this.scale;

        this.player = createPlayer(this, 200, 750, {
            speed: store.playerSpeed,
            damage: store.playerDamage,
            maxHp: store.maxHp,
        });
        this.player.hp = store.hp;
        this.updateHpDisplay();

        // Boss: caballero con más HP, más rápido y ligeramente más grande.
        this.enemigo = this.physics.add.sprite(1050, 480, 'enemigo');
        this.enemigo.setScale(7);
        this.enemigo.setFlipX(true);
        this.enemigo.isAttacking = false;
        this.enemigo.lastAttackTime = 0;
        this.enemigo.hp = 8;
        this.enemigo.maxHp = 8;

        const barWidth = 200;
        const barHeight = 14;
        const barX = this.enemigo.x - barWidth / 2;
        const barY = this.enemigo.y - 270;
        this.enemigoHpBarBg = this.add.rectangle(barX, barY, barWidth, barHeight, 0x333333).setOrigin(0, 0).setDepth(200);
        this.enemigoHpBarFill = this.add.rectangle(barX, barY, barWidth, barHeight, 0xee4444).setOrigin(0, 0).setDepth(201);

        this.enemigoAttackHitbox = this.add.rectangle(this.enemigo.x, this.enemigo.y, 140, 100);
        this.physics.add.existing(this.enemigoAttackHitbox);
        this.enemigoAttackHitbox.body.enable = false;

        this.enemigo.on('animationcomplete', (anim) => {
            if (anim.key === 'enemigo_attack_anim') {
                this.enemigo.isAttacking = false;
                this.enemigo.setTexture('enemigo');
                this.enemigoAttackHitbox.body.enable = false;
            }
        });

        // Daño del jugador al boss.
        this.physics.add.overlap(this.player.attackHitbox, this.enemigo, () => {
            if (this.player.attackHasHit || !this.enemigo || !this.enemigo.active) return;
            this.player.attackHasHit = true;
            this.enemigo.hp -= this.player.damage;
            this.updateEnemigoHpBar();

            if (this.enemigo.hp <= 0) {
                this.enemigoAttackHitbox.destroy();
                this.enemigoAttackHitbox = null;
                this.enemigoHpBarBg.destroy();
                this.enemigoHpBarBg = null;
                this.enemigoHpBarFill.destroy();
                this.enemigoHpBarFill = null;
                this.enemigo.destroy();
                this.enemigo = null;
                this.onRoomCleared();
            }
        });

        // Daño del boss al jugador.
        this.physics.add.overlap(this.enemigoAttackHitbox, this.player, () => {
            if (this.gameOver) return;
            const playerDied = this.player.takeDamage(1);
            store.setHp(this.player.hp);
            this.updateHpDisplay();

            if (playerDied && !this.gameOver) {
                this.gameOver = true;
                this.player.setVelocity(0, 0);
                this.player.anims.stop();
                this.player.setTexture('knight_death');
                this.player.setOrigin(0.5, 1);
                this.player.setScale(4.5);
                this.player.body.enable = false;
                this.player.play('knight_death_anim');
                this.player.once('animationcomplete', (anim) => {
                    if (anim.key !== 'knight_death_anim') return;
                    this.showGameOverUI();
                });
                this.time.delayedCall(1200, () => {
                    if (this.gameOver) this.showGameOverUI();
                });
            }
        });
    }

    onRoomCleared() {
        const store = useGameStore();
        store.setHp(this.player.hp);
        store.incrementRoom();

        const { width, height } = this.scale;
        const roomText = this.add.text(width / 2, height / 3.5, 'BOSS DEFEATED!', {
            fontSize: '60px', color: '#FFD700', stroke: '#000000', strokeThickness: 6
        }).setOrigin(0.5).setDepth(300);

        this.time.delayedCall(2000, () => {
            if (roomText && roomText.destroy) roomText.destroy();

            if (store.roomCount % UPGRADE_EVERY === 0) {
                this.scene.pause();
                this.scene.launch('UpgradeScene', { callerScene: 'ScenarioBoss' });
                this.events.once('upgrade-chosen', () => {
                    this.showEndGame();
                });
            } else {
                this.showEndGame();
            }
        });
    }

    showEndGame() {
        const { width, height } = this.scale;
        this.add.text(width / 2, height / 2 - 60, 'YOU WIN!', {
            fontSize: '72px', color: '#FFD700', stroke: '#000000', strokeThickness: 6
        }).setOrigin(0.5).setDepth(300);
        this.add.text(width / 2, height / 2 + 80, 'Press SPACE to play again', {
            fontSize: '26px', color: '#ffffff', stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5).setDepth(300);

        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('GameScene');
        });
    }
}
