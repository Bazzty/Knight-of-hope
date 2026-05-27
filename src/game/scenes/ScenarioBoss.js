import { setupFireFrames, spawnFireTorch } from '../utils/fireEffect';
import DungeonScene from './DungeonScene';

// Sala del Trono — boss final. No hay puerta de salida: al ganar muestra YOU WIN.
// Sobreescribe afterRoomCleared() del base para ese comportamiento distinto.
export default class ScenarioBoss extends DungeonScene {
    constructor() {
        super('ScenarioBoss');
        this.enemigo = null;
        this.enemigoAttackHitbox = null;
        this.enemigoHpBarBg = null;
        this.enemigoHpBarFill = null;
    }

    preloadScene() {
        this.load.image('throne', 'assets/throne.png');
        this.load.image('fire-orange', 'assets/fire-orange.png');
        this.load.spritesheet('enemigo', 'assets/enemigo.png', { frameWidth: 69, frameHeight: 69 });
        this.load.spritesheet('enemigo_attack', 'assets/ataqueEnemigo.png', { frameWidth: 69, frameHeight: 69 });
    }

    createScene() {
        const { width, height } = this.scale;

        this.add.image(width / 2, height / 2, 'throne').setDisplaySize(width, height);
        this.physics.world.setBounds(0, 0, width, height);

        setupFireFrames(this, 'fire-orange', [124, 341, 564, 783, 1001, 1215, 1436, 1657], 110, 887);
        [{ x: 235, y: 260 }, { x: 470, y: 260 }, { x: 810, y: 260 }, { x: 1045, y: 260 }].forEach(({ x, y }, i) => {
            spawnFireTorch(this, x, y, 'fire-orange', 0.22, i * 2);
        });

        if (!this.anims.exists('enemigo_walk_anim')) {
            this.anims.create({ key: 'enemigo_walk_anim', frames: this.anims.generateFrameNumbers('enemigo'), frameRate: 4, repeat: -1 });
        }
        if (!this.anims.exists('enemigo_attack_anim')) {
            this.anims.create({ key: 'enemigo_attack_anim', frames: this.anims.generateFrameNumbers('enemigo_attack', { start: 0, end: 11 }), frameRate: 10, repeat: 0 });
        }

        // Etiqueta de boss en pantalla.
        this.add.text(width / 2, 20, '⚔ BOSS', {
            fontSize: '28px', color: '#ff4444', stroke: '#000000', strokeThickness: 5
        }).setOrigin(0.5, 0).setDepth(200);

        this.spawnPlayer(200, 750);

        // ── BOSS ──────────────────────────────────────────────────────────────────────
        // El boss es el mismo sprite que el caballero enemigo, pero más grande y con más HP.
        this.enemigo = this.physics.add.sprite(1050, 480, 'enemigo');
        this.enemigo.setScale(7);
        this.enemigo.setFlipX(true);
        this.enemigo.isAttacking = false;
        this.enemigo.lastAttackTime = 0;
        this.enemigo.hp = 8;
        this.enemigo.maxHp = 8;

        // ── BARRA DE VIDA DEL BOSS ────────────────────────────────────────────────────
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

        // Jugador golpea al boss.
        this.physics.add.overlap(this.player.attackHitbox, this.enemigo, () => {
            if (this.player.attackHasHit || !this.enemigo?.active) return;
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
                // nextScene = null porque no hay sala siguiente; afterRoomCleared() muestra YOU WIN.
                this.onRoomCleared(null, 'BOSS DEFEATED!', '#FFD700');
            }
        });

        // Boss golpea al jugador.
        this.physics.add.overlap(this.enemigoAttackHitbox, this.player, () => {
            if (!this.gameOver) this.handlePlayerTakeDamage(1);
        });
    }

    updateEnemigoHpBar() {
        if (!this.enemigoHpBarFill || !this.enemigo) return;
        this.enemigoHpBarFill.width = 200 * (this.enemigo.hp / this.enemigo.maxHp);
    }

    // Se llama desde DungeonScene.onRoomCleared() cuando nextScene es null.
    // En el boss no hay puerta: mostramos la pantalla de victoria.
    afterRoomCleared() {
        this.showEndGame();
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

    // IA del boss: idéntica al caballero de sala 1 pero más rápida y cooldown menor.
    updateScene() {
        if (!this.enemigo?.active) return;

        this.enemigo.setDepth(this.enemigo.y);

        const distanciaX = this.player.x - this.enemigo.x;
        const velocidad = 90;

        const barX = this.enemigo.x - 100;
        const barY = this.enemigo.y - 270;
        this.enemigoHpBarBg.setPosition(barX, barY);
        this.enemigoHpBarFill.setPosition(barX, barY);

        const hitOffsetX = this.enemigo.flipX ? -150 : 150;
        this.enemigoAttackHitbox.body.reset(this.enemigo.x + hitOffsetX, this.enemigo.y);

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
