import Phaser from 'phaser';
import { setupFireFrames, spawnFireTorch } from '../utils/fireEffect';
import DungeonScene from './DungeonScene';

// Sala 1 — caballero débil + esqueleto introductorio.
export default class GameScene extends DungeonScene {
    constructor() {
        super('GameScene');
        this.enemigo = null;
        this.enemigoAttackHitbox = null;
        this.enemigoHpBarBg = null;
        this.enemigoHpBarFill = null;
        this.skele = null;
        this.skeleAttackHitbox = null;
        this.skeleHpBarBg = null;
        this.skeleHpBarFill = null;
    }

    preloadScene() {
        this.load.image('room1', 'assets/backgrounds/room1.png');
        this.load.image('fire-orange', 'assets/effects/fire-orange.png');
        this.load.spritesheet('enemigo', 'assets/enemies/enemigo.png', { frameWidth: 69, frameHeight: 69 });
        this.load.spritesheet('enemigo_attack', 'assets/enemies/ataqueEnemigo.png', { frameWidth: 69, frameHeight: 69 });
        this.load.spritesheet('skeleton', 'assets/enemies/skeleton.png', { frameWidth: 64, frameHeight: 64 });
    }

    createScene() {
        const { width, height } = this.scale;

        this.store.reset();

        this.add.image(width / 2, height / 2, 'room1').setDisplaySize(width, height);
        this.physics.world.setBounds(0, 0, width + 280, height);

        setupFireFrames(this, 'fire-orange', [124, 341, 564, 783, 1001, 1215, 1436, 1657], 110, 887);
        [{ x: 295, y: 290 }, { x: 975, y: 290 }].forEach(({ x, y }, i) => {
            spawnFireTorch(this, x, y, 'fire-orange', 0.22, i * 4);
        });

        if (!this.anims.exists('enemigo_walk_anim')) {
            this.anims.create({ key: 'enemigo_walk_anim', frames: this.anims.generateFrameNumbers('enemigo'), frameRate: 4, repeat: -1 });
        }
        if (!this.anims.exists('enemigo_attack_anim')) {
            this.anims.create({ key: 'enemigo_attack_anim', frames: this.anims.generateFrameNumbers('enemigo_attack', { start: 0, end: 11 }), frameRate: 10, repeat: 0 });
        }
        if (!this.anims.exists('skeleton_idle_anim')) {
            this.anims.create({ key: 'skeleton_idle_anim', frames: this.anims.generateFrameNumbers('skeleton', { start: 39, end: 42 }), frameRate: 6, repeat: -1 });
        }
        if (!this.anims.exists('skeleton_walk_anim')) {
            this.anims.create({ key: 'skeleton_walk_anim', frames: this.anims.generateFrameNumbers('skeleton', { start: 26, end: 37 }), frameRate: 10, repeat: -1 });
        }
        if (!this.anims.exists('skeleton_attack_anim')) {
            this.anims.create({ key: 'skeleton_attack_anim', frames: this.anims.generateFrameNumbers('skeleton', { start: 0, end: 12 }), frameRate: 12, repeat: 0 });
        }
        if (!this.anims.exists('skeleton_death_anim')) {
            this.anims.create({ key: 'skeleton_death_anim', frames: this.anims.generateFrameNumbers('skeleton', { start: 13, end: 25 }), frameRate: 8, repeat: 0 });
        }

        this.spawnPlayer(200, 680);

        // ── CABALLERO ENEMIGO (débil) ─────────────────────────────────────────────────
        this.enemigo = this.physics.add.sprite(1100, 480, 'enemigo');
        this.enemigo.setScale(6);
        this.enemigo.setFlipX(true);
        this.enemigo.isAttacking = false;
        this.enemigo.lastAttackTime = 0;
        this.enemigo.hp = 5;
        this.enemigo.maxHp = 5;

        const eBarW = 140, eBarH = 12;
        this.enemigoHpBarBg = this.add.rectangle(this.enemigo.x - eBarW / 2, this.enemigo.y - 250, eBarW, eBarH, 0x333333).setOrigin(0, 0).setDepth(200);
        this.enemigoHpBarFill = this.add.rectangle(this.enemigo.x - eBarW / 2, this.enemigo.y - 250, eBarW, eBarH, 0xee4444).setOrigin(0, 0).setDepth(201);

        this.enemigoAttackHitbox = this.add.rectangle(this.enemigo.x, this.enemigo.y, 95, 70);
        this.physics.add.existing(this.enemigoAttackHitbox);
        this.enemigoAttackHitbox.body.enable = false;

        this.enemigo.on('animationcomplete', (anim) => {
            if (anim.key === 'enemigo_attack_anim') {
                this.enemigo.isAttacking = false;
                this.enemigo.setTexture('enemigo');
                this.enemigoAttackHitbox.body.enable = false;
            }
        });

        // ── ESQUELETO INTRODUCTORIO ───────────────────────────────────────────────────
        this.skele = this.physics.add.sprite(1340, 490, 'skeleton');
        this.skele.setScale(4);
        this.skele.setFlipX(true);
        this.skele.setDepth(this.skele.y);
        this.skele.isAttacking = false;
        this.skele.isDead = false;
        this.skele.lastAttackTime = this.time.now - 600;
        this.skele.hp = 3;
        this.skele.maxHp = 3;
        this.skele.play('skeleton_idle_anim');

        const sBarW = 120, sBarH = 10;
        this.skeleHpBarBg = this.add.rectangle(this.skele.x - sBarW / 2, this.skele.y - 155, sBarW, sBarH, 0x333333).setOrigin(0, 0).setDepth(200);
        this.skeleHpBarFill = this.add.rectangle(this.skele.x - sBarW / 2, this.skele.y - 155, sBarW, sBarH, 0xee4444).setOrigin(0, 0).setDepth(201);

        this.skeleAttackHitbox = this.add.rectangle(this.skele.x, this.skele.y, 95, 65);
        this.physics.add.existing(this.skeleAttackHitbox);
        this.skeleAttackHitbox.body.enable = false;

        this.skele.on('animationcomplete', (anim) => {
            if (anim.key === 'skeleton_attack_anim') {
                this.skele.isAttacking = false;
                this.skele.play('skeleton_idle_anim', true);
                if (this.skeleAttackHitbox?.body) this.skeleAttackHitbox.body.enable = false;
            }
        });

        // ── OVERLAPS CABALLERO ────────────────────────────────────────────────────────
        this.physics.add.overlap(this.player.attackHitbox, this.enemigo, () => {
            if (this.player.attackHasHit || !this.enemigo?.active) return;
            this.player.attackHasHit = true;
            this.enemigo.hp -= this.player.damage;
            this.updateEnemigoHpBar();

            if (this.enemigo.hp <= 0) {
                this.spawnHitBurst(this.enemigo.x, this.enemigo.y - 150, [0xffcc00, 0xff8800, 0xffffff, 0xeeaaaa]);
                if (this.enemigoAttackHitbox) { this.enemigoAttackHitbox.destroy(); this.enemigoAttackHitbox = null; }
                if (this.enemigoHpBarBg) { this.enemigoHpBarBg.destroy(); this.enemigoHpBarBg = null; }
                if (this.enemigoHpBarFill) { this.enemigoHpBarFill.destroy(); this.enemigoHpBarFill = null; }
                this.enemigo.destroy(); this.enemigo = null;
                if (!this.skele) this.onRoomCleared('Scenario2');
            } else {
                this.enemigo.setTint(0xff5555);
                this.time.delayedCall(90, () => { if (this.enemigo?.active) this.enemigo.clearTint(); });
                this.enemigo.setVelocityX((this.player.x < this.enemigo.x ? 1 : -1) * 280);
            }
        });

        this.physics.add.overlap(this.enemigoAttackHitbox, this.player, () => {
            if (!this.gameOver) this.handlePlayerTakeDamage(1, this.enemigo?.x);
        });

        // ── OVERLAPS ESQUELETO ────────────────────────────────────────────────────────
        this.physics.add.overlap(this.player.attackHitbox, this.skele, () => {
            if (this.player.attackHasHit || !this.skele?.active) return;
            this.player.attackHasHit = true;
            this.skele.hp -= this.player.damage;
            this.updateSkeleHpBar();

            if (this.skele.hp <= 0) {
                this.spawnHitBurst(this.skele.x, this.skele.y - 100, [0xdddddd, 0xaaaaaa, 0xffffff, 0x888888]);
                if (this.skeleAttackHitbox) { this.skeleAttackHitbox.body.enable = false; this.skeleAttackHitbox.destroy(); this.skeleAttackHitbox = null; }
                if (this.skeleHpBarBg) { this.skeleHpBarBg.destroy(); this.skeleHpBarBg = null; }
                if (this.skeleHpBarFill) { this.skeleHpBarFill.destroy(); this.skeleHpBarFill = null; }
                this.skele.setVelocity(0, 0); this.skele.isDead = true; this.skele.body.enable = false;
                this.skele.play('skeleton_death_anim');
                this.skele.once('animationcomplete', (anim) => {
                    if (anim.key !== 'skeleton_death_anim') return;
                    if (this.skele?.destroy) this.skele.destroy();
                    this.skele = null;
                    if (!this.enemigo) this.onRoomCleared('Scenario2');
                });
            } else {
                this.skele.setTint(0xff5555);
                this.time.delayedCall(90, () => { if (this.skele?.active) this.skele.clearTint(); });
                this.skele.setVelocityX((this.player.x < this.skele.x ? 1 : -1) * 180);
            }
        });

        this.physics.add.overlap(this.skeleAttackHitbox, this.player, () => {
            if (!this.gameOver) this.handlePlayerTakeDamage(1, this.skele?.x);
        });

        this.showDialogue([
            {
                speaker: 'Dark Knight', color: '#ff5533',
                text: '"Intruder! You dare enter the Guardian\'s dungeon?"',
                translation: '¡Intruso! ¿Te atreves a entrar en la mazmorra del Guardián?'
            },
            {
                speaker: 'Dark Knight', color: '#ff5533',
                text: '"Turn back. Under The Guardian\'s reign, this world will finally know order and peace."',
                translation: 'Da la vuelta. Bajo el reinado del Guardián, el mundo conocerá el orden y la paz.'
            },
            {
                speaker: 'Dark Knight', color: '#ff5533',
                text: '"The Guardian is unstoppable. Your resistance only brings suffering!"',
                translation: '¡El Guardián es imparable. ¡Tu resistencia solo trae sufrimiento!'
            },
            {
                speaker: 'Knight', color: '#FFD700',
                text: '"Peace through fear is no peace at all."',
                translation: 'La paz a través del miedo no es paz en absoluto.'
            },
            {
                speaker: 'Knight', color: '#FFD700',
                text: '"I will stop The Guardian — and restore hope to this kingdom."',
                translation: 'Detendré al Guardián y restauraré la esperanza en este reino.'
            },
        ]);
    }

    getRoomTitle() { return this.t('ROOM 1', 'SALA 1'); }

    updateEnemigoHpBar() {
        if (!this.enemigoHpBarFill || !this.enemigo) return;
        this.enemigoHpBarFill.width = 140 * (this.enemigo.hp / this.enemigo.maxHp);
    }

    updateSkeleHpBar() {
        if (!this.skeleHpBarFill || !this.skele) return;
        this.skeleHpBarFill.width = 120 * (this.skele.hp / this.skele.maxHp);
    }

    updateScene() {
        // IA caballero
        if (this.enemigo?.active) {
            this.enemigo.setDepth(this.enemigo.y);
            const distanciaX = this.player.x - this.enemigo.x;

            this.enemigoHpBarBg.setPosition(this.enemigo.x - 70, this.enemigo.y - 250);
            this.enemigoHpBarFill.setPosition(this.enemigo.x - 70, this.enemigo.y - 250);

            const hitOffsetX = this.enemigo.flipX ? -95 : 95;
            this.enemigoAttackHitbox.body.reset(this.enemigo.x + hitOffsetX, this.enemigo.y);

            if (this.enemigo.isAttacking) {
                this.enemigo.setVelocityX(0);
            } else if (Math.abs(distanciaX) > 160) {
                const targetVx = distanciaX > 0 ? 80 : -80;
                this.enemigo.setVelocityX(Phaser.Math.Linear(this.enemigo.body.velocity.x, targetVx, 0.18));
                this.enemigo.setFlipX(distanciaX < 0);
                this.enemigo.play('enemigo_walk_anim', true);
            } else {
                this.enemigo.setVelocityX(0);
                const tiempoActual = this.time.now;
                if (tiempoActual - this.enemigo.lastAttackTime > 2200) {
                    this.enemigo.isAttacking = true;
                    this.enemigo.lastAttackTime = tiempoActual;
                    this.enemigo.setTexture('enemigo_attack');
                    this.enemigo.play('enemigo_attack_anim', true);
                    this.time.delayedCall(400, () => { if (this.enemigo?.isAttacking && this.enemigoAttackHitbox?.body) this.enemigoAttackHitbox.body.enable = true; });
                    this.enemigo.setFlipX(distanciaX < 0);
                } else if (this.enemigo.anims.currentAnim?.key !== 'enemigo_attack_anim') {
                    this.enemigo.anims.stop();
                }
            }
            this.enemigo.setVelocityY(0);
        }

        // IA esqueleto
        if (this.skele?.active && !this.skele.isDead) {
            this.skele.setDepth(this.skele.y);
            const dxs = this.player.x - this.skele.x;

            if (this.skeleHpBarBg) {
                this.skeleHpBarBg.setPosition(this.skele.x - 60, this.skele.y - 155);
                this.skeleHpBarFill.setPosition(this.skele.x - 60, this.skele.y - 155);
            }
            if (this.skeleAttackHitbox?.body) {
                this.skeleAttackHitbox.body.reset(this.skele.x + (this.skele.flipX ? -80 : 80), this.skele.y - 60);
            }

            if (this.skele.isAttacking) {
                this.skele.setVelocityX(0);
            } else if (Math.abs(dxs) > 180) {
                const targetVxS = dxs > 0 ? 50 : -50;
                this.skele.setVelocityX(Phaser.Math.Linear(this.skele.body.velocity.x, targetVxS, 0.18));
                this.skele.setFlipX(dxs < 0);
                this.skele.play('skeleton_walk_anim', true);
            } else {
                this.skele.setVelocityX(0);
                if (this.skele.anims.currentAnim?.key === 'skeleton_walk_anim') {
                    this.skele.play('skeleton_idle_anim', true);
                }
                const ts = this.time.now;
                if (ts - this.skele.lastAttackTime > 2500) {
                    this.skele.isAttacking = true;
                    this.skele.lastAttackTime = ts;
                    this.skele.play('skeleton_attack_anim', true);
                    this.time.delayedCall(350, () => { if (this.skele?.isAttacking && this.skeleAttackHitbox?.body) this.skeleAttackHitbox.body.enable = true; });
                    this.skele.setFlipX(dxs < 0);
                }
            }
            this.skele.setVelocityY(0);
        }
    }
}
