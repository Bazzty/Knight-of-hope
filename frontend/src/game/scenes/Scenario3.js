import Phaser from 'phaser';
import DungeonScene from './DungeonScene';

// Sala 3 — dos slimes + un esqueleto. Transición al boss.
export default class Scenario3 extends DungeonScene {
    constructor() {
        super('Scenario3');
        this.slime = null;
        this.slimeAttackHitbox = null;
        this.slimeHpBarBg = null;
        this.slimeHpBarFill = null;
        this.slime2 = null;
        this.slimeAttackHitbox2 = null;
        this.slimeHpBarBg2 = null;
        this.slimeHpBarFill2 = null;
        this.skele = null;
        this.skeleAttackHitbox = null;
        this.skeleHpBarBg = null;
        this.skeleHpBarFill = null;
    }

    preloadScene() {
        this.load.image('room3', 'assets/backgrounds/room3.png');
        this.load.spritesheet('slime', 'assets/enemies/slime-Sheet.png', { frameWidth: 32, frameHeight: 25 });
        this.load.spritesheet('skeleton', 'assets/enemies/skeleton.png', { frameWidth: 64, frameHeight: 64 });
    }

    createScene() {
        const { width, height } = this.scale;

        this.add.image(width / 2, height / 2, 'room3').setDisplaySize(width, height);
        this.physics.world.setBounds(0, 0, width + 140, height);

        if (!this.anims.exists('slime_idle_anim')) {
            this.anims.create({ key: 'slime_idle_anim', frames: this.anims.generateFrameNumbers('slime', { start: 0, end: 7 }), frameRate: 8, repeat: -1 });
        }
        if (!this.anims.exists('slime_attack_anim')) {
            this.anims.create({ key: 'slime_attack_anim', frames: this.anims.generateFrameNumbers('slime', { start: 8, end: 15 }), frameRate: 10, repeat: 0 });
        }
        if (!this.anims.exists('slime_death_anim')) {
            this.anims.create({ key: 'slime_death_anim', frames: this.anims.generateFrameNumbers('slime', { start: 16, end: 20 }), frameRate: 8, repeat: 0 });
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

        const barWidth = 120;
        const barHeight = 10;

        // ── SLIME 1 ───────────────────────────────────────────────────────────────────
        this.slime = this.physics.add.sprite(1100, 520, 'slime');
        this.slime.setScale(5);
        this.slime.setDepth(this.slime.y);
        this.slime.isAttacking = false;
        this.slime.isDead = false;
        this.slime.lastAttackTime = 0;
        this.slime.hp = 20;
        this.slime.maxHp = 20;
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
        this.slime2 = this.physics.add.sprite(820, 530, 'slime');
        this.slime2.setScale(5);
        this.slime2.setDepth(this.slime2.y);
        this.slime2.isAttacking = false;
        this.slime2.isDead = false;
        this.slime2.lastAttackTime = this.time.now - 600;
        this.slime2.hp = 20;
        this.slime2.maxHp = 20;
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

        // ── ESQUELETO ─────────────────────────────────────────────────────────────────
        this.skele = this.physics.add.sprite(960, 510, 'skeleton');
        this.skele.setScale(4);
        this.skele.setFlipX(true);
        this.skele.setDepth(this.skele.y);
        this.skele.isAttacking = false;
        this.skele.isDead = false;
        this.skele.lastAttackTime = this.time.now - 800;
        this.skele.hp = 15;
        this.skele.maxHp = 15;
        this.skele.play('skeleton_idle_anim');

        const skeleBarWidth = 140;
        this.skeleHpBarBg = this.add.rectangle(this.skele.x - skeleBarWidth / 2, this.skele.y - 160, skeleBarWidth, barHeight, 0x333333).setOrigin(0, 0).setDepth(200);
        this.skeleHpBarFill = this.add.rectangle(this.skele.x - skeleBarWidth / 2, this.skele.y - 160, skeleBarWidth, barHeight, 0xee4444).setOrigin(0, 0).setDepth(201);

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

        // ── OVERLAPS SLIME 1 ──────────────────────────────────────────────────────────
        this.physics.add.overlap(this.player.attackHitbox, this.slime, () => {
            if (this.player.attackHasHit || !this.slime?.active) return;
            this.player.attackHasHit = true;
            this.slime.hp -= this.player.damage;
            this.updateSlimeHpBar();

            if (this.slime.hp <= 0) {
                this.spawnHitBurst(this.slime.x, this.slime.y - 60, [0x44ff88, 0x00cc44, 0xffffff, 0xaaffaa]);
                if (this.slimeAttackHitbox) { this.slimeAttackHitbox.body.enable = false; this.slimeAttackHitbox.destroy(); this.slimeAttackHitbox = null; }
                this.slimeHpBarBg.destroy(); this.slimeHpBarBg = null;
                this.slimeHpBarFill.destroy(); this.slimeHpBarFill = null;
                this.slime.setVelocity(0, 0); this.slime.isDead = true; this.slime.body.enable = false;
                this.slime.play('slime_death_anim');
                this.slime.once('animationcomplete', (anim) => {
                    if (anim.key !== 'slime_death_anim') return;
                    if (this.slime?.destroy) this.slime.destroy();
                    this.slime = null;
                    if (!this.slime2 && !this.skele) this.onRoomCleared('ScenarioBoss');
                });
            } else {
                this.slime.setTint(0xff5555);
                this.time.delayedCall(90, () => { if (this.slime?.active) this.slime.clearTint(); });
                this.slime.setVelocityX((this.player.x < this.slime.x ? 1 : -1) * 200);
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
                if (this.slimeAttackHitbox2) { this.slimeAttackHitbox2.body.enable = false; this.slimeAttackHitbox2.destroy(); this.slimeAttackHitbox2 = null; }
                this.slimeHpBarBg2.destroy(); this.slimeHpBarBg2 = null;
                this.slimeHpBarFill2.destroy(); this.slimeHpBarFill2 = null;
                this.slime2.setVelocity(0, 0); this.slime2.isDead = true; this.slime2.body.enable = false;
                this.slime2.play('slime_death_anim');
                this.slime2.once('animationcomplete', (anim) => {
                    if (anim.key !== 'slime_death_anim') return;
                    if (this.slime2?.destroy) this.slime2.destroy();
                    this.slime2 = null;
                    if (!this.slime && !this.skele) this.onRoomCleared('ScenarioBoss');
                });
            } else {
                this.slime2.setTint(0xff5555);
                this.time.delayedCall(90, () => { if (this.slime2?.active) this.slime2.clearTint(); });
                this.slime2.setVelocityX((this.player.x < this.slime2.x ? 1 : -1) * 200);
            }
        });

        this.physics.add.overlap(this.slimeAttackHitbox2, this.player, () => {
            if (!this.gameOver) this.handlePlayerTakeDamage(1, this.slime2?.x);
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
                this.skeleHpBarBg.destroy(); this.skeleHpBarBg = null;
                this.skeleHpBarFill.destroy(); this.skeleHpBarFill = null;
                this.skele.setVelocity(0, 0); this.skele.isDead = true; this.skele.body.enable = false;
                this.skele.play('skeleton_death_anim');
                this.skele.once('animationcomplete', (anim) => {
                    if (anim.key !== 'skeleton_death_anim') return;
                    if (this.skele?.destroy) this.skele.destroy();
                    this.skele = null;
                    if (!this.slime && !this.slime2) this.onRoomCleared('ScenarioBoss');
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
    }

    getRoomTitle() { return this.t('ROOM 3', 'SALA 3'); }

    updateSlimeHpBar() {
        if (!this.slimeHpBarFill || !this.slime) return;
        this.slimeHpBarFill.width = 120 * (this.slime.hp / this.slime.maxHp);
    }

    updateSlimeHpBar2() {
        if (!this.slimeHpBarFill2 || !this.slime2) return;
        this.slimeHpBarFill2.width = 120 * (this.slime2.hp / this.slime2.maxHp);
    }

    updateSkeleHpBar() {
        if (!this.skeleHpBarFill || !this.skele) return;
        this.skeleHpBarFill.width = 140 * (this.skele.hp / this.skele.maxHp);
    }

    updateScene() {
        const slimeSpeed = 75;

        // IA slime 1
        if (this.slime?.active && !this.slime.isDead) {
            this.slime.setDepth(this.slime.y);
            const dx = this.player.x - this.slime.x;
            if (this.slimeHpBarBg) {
                this.slimeHpBarBg.setPosition(this.slime.x - 60, this.slime.y - 100);
                this.slimeHpBarFill.setPosition(this.slime.x - 60, this.slime.y - 100);
            }
            if (this.slimeAttackHitbox?.body) this.slimeAttackHitbox.body.reset(this.slime.x + (this.slime.flipX ? -56 : 56), this.slime.y - 8);
            if (this.slime.isAttacking) {
                this.slime.setVelocityX(0);
            } else if (Math.abs(dx) > 120) {
                const tvx1 = dx > 0 ? slimeSpeed : -slimeSpeed;
                this.slime.setVelocityX(Phaser.Math.Linear(this.slime.body.velocity.x, tvx1, 0.18));
                this.slime.setFlipX(dx < 0);
                this.slime.play('slime_idle_anim', true);
            } else {
                this.slime.setVelocityX(0);
                const t = this.time.now;
                if (t - this.slime.lastAttackTime > 1100) {
                    this.slime.isAttacking = true; this.slime.lastAttackTime = t;
                    this.slime.play('slime_attack_anim', true);
                    this.time.delayedCall(300, () => { if (this.slime?.isAttacking && this.slimeAttackHitbox?.body) this.slimeAttackHitbox.body.enable = true; });
                    this.slime.setFlipX(dx < 0);
                }
            }
            this.slime.setVelocityY(0);
        }

        // IA slime 2
        if (this.slime2?.active && !this.slime2.isDead) {
            this.slime2.setDepth(this.slime2.y);
            const dx2 = this.player.x - this.slime2.x;
            if (this.slimeHpBarBg2) {
                this.slimeHpBarBg2.setPosition(this.slime2.x - 60, this.slime2.y - 100);
                this.slimeHpBarFill2.setPosition(this.slime2.x - 60, this.slime2.y - 100);
            }
            if (this.slimeAttackHitbox2?.body) this.slimeAttackHitbox2.body.reset(this.slime2.x + (this.slime2.flipX ? -56 : 56), this.slime2.y - 8);
            if (this.slime2.isAttacking) {
                this.slime2.setVelocityX(0);
            } else if (Math.abs(dx2) > 120) {
                const tvx2 = dx2 > 0 ? slimeSpeed : -slimeSpeed;
                this.slime2.setVelocityX(Phaser.Math.Linear(this.slime2.body.velocity.x, tvx2, 0.18));
                this.slime2.setFlipX(dx2 < 0);
                this.slime2.play('slime_idle_anim', true);
            } else {
                this.slime2.setVelocityX(0);
                const t2 = this.time.now;
                if (t2 - this.slime2.lastAttackTime > 1100) {
                    this.slime2.isAttacking = true; this.slime2.lastAttackTime = t2;
                    this.slime2.play('slime_attack_anim', true);
                    this.time.delayedCall(300, () => { if (this.slime2?.isAttacking && this.slimeAttackHitbox2?.body) this.slimeAttackHitbox2.body.enable = true; });
                    this.slime2.setFlipX(dx2 < 0);
                }
            }
            this.slime2.setVelocityY(0);
        }

        // IA esqueleto
        if (this.skele?.active && !this.skele.isDead) {
            this.skele.setDepth(this.skele.y);
            const dxs = this.player.x - this.skele.x;

            if (this.skeleHpBarBg) {
                this.skeleHpBarBg.setPosition(this.skele.x - 70, this.skele.y - 160);
                this.skeleHpBarFill.setPosition(this.skele.x - 70, this.skele.y - 160);
            }
            if (this.skeleAttackHitbox?.body) {
                const hitOffX = this.skele.flipX ? -80 : 80;
                this.skeleAttackHitbox.body.reset(this.skele.x + hitOffX, this.skele.y - 60);
            }

            if (this.skele.isAttacking) {
                this.skele.setVelocityX(0);
            } else if (Math.abs(dxs) > 180) {
                const tvxs = dxs > 0 ? 70 : -70;
                this.skele.setVelocityX(Phaser.Math.Linear(this.skele.body.velocity.x, tvxs, 0.18));
                this.skele.setFlipX(dxs < 0);
                this.skele.play('skeleton_walk_anim', true);
            } else {
                this.skele.setVelocityX(0);
                if (this.skele.anims.currentAnim?.key === 'skeleton_walk_anim') {
                    this.skele.play('skeleton_idle_anim', true);
                }
                const ts = this.time.now;
                if (ts - this.skele.lastAttackTime > 2200) {
                    this.skele.isAttacking = true; this.skele.lastAttackTime = ts;
                    this.skele.play('skeleton_attack_anim', true);
                    this.time.delayedCall(350, () => { if (this.skele?.isAttacking && this.skeleAttackHitbox?.body) this.skeleAttackHitbox.body.enable = true; });
                    this.skele.setFlipX(dxs < 0);
                }
            }
            this.skele.setVelocityY(0);
        }
    }
}
