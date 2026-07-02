import Phaser from 'phaser';
import { setupFireFrames, spawnFireTorch } from '../utils/fireEffect';
import DungeonScene from './DungeonScene';

// Sala 2 — dos slimes y fuego azul.
export default class Scenario2 extends DungeonScene {
    constructor() {
        super('Scenario2');
        this.slime = null;
        this.slimeAttackHitbox = null;
        this.slimeHpBarBg = null;
        this.slimeHpBarFill = null;
        this.slime2 = null;
        this.slimeAttackHitbox2 = null;
        this.slimeHpBarBg2 = null;
        this.slimeHpBarFill2 = null;
    }

    preloadScene() {
        this.load.image('room2', 'assets/backgrounds/room2.png');
        this.load.image('fire-orange', 'assets/effects/fire-orange.png');
        this.load.spritesheet('fire-blue', 'assets/effects/fire-blue.png', { frameWidth: 192, frameHeight: 1024 });
        this.load.spritesheet('slime', 'assets/enemies/slime-Sheet.png', { frameWidth: 32, frameHeight: 25 });
    }

    createScene() {
        const { width, height } = this.scale;

        this.add.image(width / 2, height / 2, 'room2').setDisplaySize(width, height);
        this.physics.world.setBounds(0, 0, width + 140, height);

        setupFireFrames(this, 'fire-orange', [124, 341, 564, 783, 1001, 1215, 1436, 1657], 110, 887);
        spawnFireTorch(this, 280, 280, 'fire-orange', 0.22, 0);

        if (!this.anims.exists('fire-blue-anim')) {
            this.anims.create({ key: 'fire-blue-anim', frames: this.anims.generateFrameNumbers('fire-blue', { start: 0, end: 7 }), frameRate: 10, repeat: -1 });
        }
        this.add.sprite(1000, 290, 'fire-blue')
            .setScale(0.4)
            .setBlendMode(Phaser.BlendModes.ADD)
            .setDepth(10)
            .play('fire-blue-anim');

        if (!this.anims.exists('slime_idle_anim')) {
            this.anims.create({ key: 'slime_idle_anim', frames: this.anims.generateFrameNumbers('slime', { start: 0, end: 7 }), frameRate: 8, repeat: -1 });
        }
        if (!this.anims.exists('slime_attack_anim')) {
            this.anims.create({ key: 'slime_attack_anim', frames: this.anims.generateFrameNumbers('slime', { start: 8, end: 15 }), frameRate: 10, repeat: 0 });
        }
        if (!this.anims.exists('slime_death_anim')) {
            this.anims.create({ key: 'slime_death_anim', frames: this.anims.generateFrameNumbers('slime', { start: 16, end: 20 }), frameRate: 8, repeat: 0 });
        }

        this.spawnPlayer(200, 680);

        const barWidth = 120;
        const barHeight = 10;

        // ── SLIME 1 ───────────────────────────────────────────────────────────────────
        this.slime = this.physics.add.sprite(1100, 520, 'slime');
        this.slime.setScale(5);
        this.slime.setDepth(this.slime.y);
        this.slime.isAttacking = false;
        this.slime.isDead = false;
        this.slime.lastAttackTime = 0;
        this.slime.hp = 14;
        this.slime.maxHp = 14;
        this.slime.play('slime_idle_anim');

        this.slimeHpBarBg = this.add.rectangle(this.slime.x - barWidth / 2, this.slime.y - 100, barWidth, barHeight, 0x333333).setOrigin(0, 0).setDepth(200);
        this.slimeHpBarFill = this.add.rectangle(this.slime.x - barWidth / 2, this.slime.y - 100, barWidth, barHeight, 0xee4444).setOrigin(0, 0).setDepth(201);

        this.slimeAttackHitbox = this.add.rectangle(this.slime.x, this.slime.y, 80, 60);
        this.physics.add.existing(this.slimeAttackHitbox);
        this.slimeAttackHitbox.body.enable = false;

        this.slime.on('animationcomplete', (anim) => {
            if (anim.key === 'slime_attack_anim') {
                this.slime.isAttacking = false;
                this.slime.play('slime_idle_anim', true);
                this.slimeAttackHitbox.body.enable = false;
            }
        });

        // ── SLIME 2 ───────────────────────────────────────────────────────────────────
        this.slime2 = this.physics.add.sprite(780, 530, 'slime');
        this.slime2.setScale(5);
        this.slime2.setDepth(this.slime2.y);
        this.slime2.isAttacking = false;
        this.slime2.isDead = false;
        this.slime2.lastAttackTime = this.time.now - 600;
        this.slime2.hp = 14;
        this.slime2.maxHp = 14;
        this.slime2.play('slime_idle_anim');

        this.slimeHpBarBg2 = this.add.rectangle(this.slime2.x - barWidth / 2, this.slime2.y - 100, barWidth, barHeight, 0x333333).setOrigin(0, 0).setDepth(200);
        this.slimeHpBarFill2 = this.add.rectangle(this.slime2.x - barWidth / 2, this.slime2.y - 100, barWidth, barHeight, 0xee4444).setOrigin(0, 0).setDepth(201);

        this.slimeAttackHitbox2 = this.add.rectangle(this.slime2.x, this.slime2.y, 80, 60);
        this.physics.add.existing(this.slimeAttackHitbox2);
        this.slimeAttackHitbox2.body.enable = false;

        this.slime2.on('animationcomplete', (anim) => {
            if (anim.key === 'slime_attack_anim') {
                this.slime2.isAttacking = false;
                this.slime2.play('slime_idle_anim', true);
                if (this.slimeAttackHitbox2?.body) this.slimeAttackHitbox2.body.enable = false;
            }
        });

        // ── OVERLAPS SLIME 1 ──────────────────────────────────────────────────────────
        this.physics.add.overlap(this.player.attackHitbox, this.slime, () => {
            if (this.player.attackHasHit || !this.slime?.active) return;
            this.player.attackHasHit = true;
            this.slime.hp -= this.player.damage;
            this.updateSlimeHpBar();

            if (this.slime.hp <= 0) {
                this.spawnHitBurst(this.slime.x, this.slime.y - 60, [0x44ff88, 0x00cc44, 0xffffff, 0xaaffaa]);
                this.slime.setVelocity(0, 0);
                this.slime.isDead = true;
                this.slime.body.enable = false;
                this.slime.isAttacking = false;
                if (this.slimeAttackHitbox) { this.slimeAttackHitbox.body.enable = false; this.slimeAttackHitbox.destroy(); this.slimeAttackHitbox = null; }
                this.slimeHpBarBg.destroy(); this.slimeHpBarBg = null;
                this.slimeHpBarFill.destroy(); this.slimeHpBarFill = null;
                this.slime.play('slime_death_anim');
                this.slime.once('animationcomplete', (anim) => {
                    if (anim.key !== 'slime_death_anim') return;
                    if (this.slime?.destroy) this.slime.destroy();
                    this.slime = null;
                    if (!this.slime2) this.onRoomCleared('Scenario3');
                });
            } else {
                this.slime.setTint(0xff5555);
                this.time.delayedCall(90, () => { if (this.slime?.active) this.slime.clearTint(); });
                const knockDir = (this.player.x < this.slime.x) ? 1 : -1;
                this.slime.setVelocityX(knockDir * 200);
            }
        });

        this.physics.add.overlap(this.slimeAttackHitbox, this.player, () => {
            if (!this.gameOver) this.handlePlayerTakeDamage(1, this.slime?.x);
        });

        // ── OVERLAPS SLIME 2 ──────────────────────────────────────────────────────────
        this.physics.add.overlap(this.player.attackHitbox, this.slime2, () => {
            if (this.player.attackHasHit || !this.slime2?.active) return;
            this.player.attackHasHit = true;
            this.slime2.hp -= this.player.damage;
            this.updateSlimeHpBar2();

            if (this.slime2.hp <= 0) {
                this.spawnHitBurst(this.slime2.x, this.slime2.y - 60, [0x44ff88, 0x00cc44, 0xffffff, 0xaaffaa]);
                this.slime2.setVelocity(0, 0);
                this.slime2.isDead = true;
                this.slime2.body.enable = false;
                this.slime2.isAttacking = false;
                if (this.slimeAttackHitbox2) { this.slimeAttackHitbox2.body.enable = false; this.slimeAttackHitbox2.destroy(); this.slimeAttackHitbox2 = null; }
                this.slimeHpBarBg2.destroy(); this.slimeHpBarBg2 = null;
                this.slimeHpBarFill2.destroy(); this.slimeHpBarFill2 = null;
                this.slime2.play('slime_death_anim');
                this.slime2.once('animationcomplete', (anim) => {
                    if (anim.key !== 'slime_death_anim') return;
                    if (this.slime2?.destroy) this.slime2.destroy();
                    this.slime2 = null;
                    if (!this.slime) this.onRoomCleared('Scenario3');
                });
            } else {
                this.slime2.setTint(0xff5555);
                this.time.delayedCall(90, () => { if (this.slime2?.active) this.slime2.clearTint(); });
                const knockDir = (this.player.x < this.slime2.x) ? 1 : -1;
                this.slime2.setVelocityX(knockDir * 200);
            }
        });

        this.physics.add.overlap(this.slimeAttackHitbox2, this.player, () => {
            if (!this.gameOver) this.handlePlayerTakeDamage(1, this.slime2?.x);
        });
    }

    getRoomTitle() { return this.t('ROOM 2', 'SALA 2'); }

    updateSlimeHpBar() {
        if (!this.slimeHpBarFill || !this.slime) return;
        this.slimeHpBarFill.width = 120 * (this.slime.hp / this.slime.maxHp);
    }

    updateSlimeHpBar2() {
        if (!this.slimeHpBarFill2 || !this.slime2) return;
        this.slimeHpBarFill2.width = 120 * (this.slime2.hp / this.slime2.maxHp);
    }

    updateScene() {
        const speed = 65;

        if (this.slime?.active && !this.slime.isDead) {
            this.slime.setDepth(this.slime.y);
            const distanceX = this.player.x - this.slime.x;

            if (this.slimeHpBarBg) {
                this.slimeHpBarBg.setPosition(this.slime.x - 60, this.slime.y - 100);
                this.slimeHpBarFill.setPosition(this.slime.x - 60, this.slime.y - 100);
            }
            if (this.slimeAttackHitbox?.body) {
                this.slimeAttackHitbox.body.reset(this.slime.x + (this.slime.flipX ? -56 : 56), this.slime.y - 8);
            }

            if (this.slime.isAttacking) {
                this.slime.setVelocityX(0);
            } else if (Math.abs(distanceX) > 120) {
                const targetVx1 = distanceX > 0 ? speed : -speed;
                this.slime.setVelocityX(Phaser.Math.Linear(this.slime.body.velocity.x, targetVx1, 0.18));
                this.slime.setFlipX(distanceX < 0);
                this.slime.play('slime_idle_anim', true);
            } else {
                this.slime.setVelocityX(0);
                const timeNow = this.time.now;
                if (timeNow - this.slime.lastAttackTime > 1300) {
                    this.slime.isAttacking = true;
                    this.slime.lastAttackTime = timeNow;
                    this.slime.play('slime_attack_anim', true);
                    this.time.delayedCall(300, () => { if (this.slime?.isAttacking && this.slimeAttackHitbox?.body) this.slimeAttackHitbox.body.enable = true; });
                    this.slime.setFlipX(distanceX < 0);
                }
            }
            this.slime.setVelocityY(0);
        }

        if (this.slime2?.active && !this.slime2.isDead) {
            this.slime2.setDepth(this.slime2.y);
            const distanceX2 = this.player.x - this.slime2.x;

            if (this.slimeHpBarBg2) {
                this.slimeHpBarBg2.setPosition(this.slime2.x - 60, this.slime2.y - 100);
                this.slimeHpBarFill2.setPosition(this.slime2.x - 60, this.slime2.y - 100);
            }
            if (this.slimeAttackHitbox2?.body) {
                this.slimeAttackHitbox2.body.reset(this.slime2.x + (this.slime2.flipX ? -56 : 56), this.slime2.y - 8);
            }

            if (this.slime2.isAttacking) {
                this.slime2.setVelocityX(0);
            } else if (Math.abs(distanceX2) > 120) {
                const targetVx2 = distanceX2 > 0 ? speed : -speed;
                this.slime2.setVelocityX(Phaser.Math.Linear(this.slime2.body.velocity.x, targetVx2, 0.18));
                this.slime2.setFlipX(distanceX2 < 0);
                this.slime2.play('slime_idle_anim', true);
            } else {
                this.slime2.setVelocityX(0);
                const timeNow2 = this.time.now;
                if (timeNow2 - this.slime2.lastAttackTime > 1300) {
                    this.slime2.isAttacking = true;
                    this.slime2.lastAttackTime = timeNow2;
                    this.slime2.play('slime_attack_anim', true);
                    this.time.delayedCall(300, () => { if (this.slime2?.isAttacking && this.slimeAttackHitbox2?.body) this.slimeAttackHitbox2.body.enable = true; });
                    this.slime2.setFlipX(distanceX2 < 0);
                }
            }
            this.slime2.setVelocityY(0);
        }
    }
}
