import Phaser from 'phaser';
import { setupFireFrames, spawnFireTorch } from '../utils/fireEffect';
import DungeonScene from './DungeonScene';

// Sala 2 — con slime enemigo y fuego azul.
export default class Scenario2 extends DungeonScene {
    constructor() {
        super('Scenario2');
        this.slime = null;
        this.slimeAttackHitbox = null;
        this.slimeHpBarBg = null;
        this.slimeHpBarFill = null;
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

        // El jugador ya tiene el HP persistido desde sala 1 en el store.
        this.spawnPlayer(200, 750);

        // ── SLIME ─────────────────────────────────────────────────────────────────────
        this.slime = this.physics.add.sprite(1100, 520, 'slime');
        this.slime.setScale(5);
        this.slime.setDepth(this.slime.y);
        this.slime.isAttacking = false;
        this.slime.isDead = false;
        this.slime.lastAttackTime = 0;
        this.slime.hp = 4;
        this.slime.maxHp = 4;
        this.slime.play('slime_idle_anim');

        // ── BARRA DE VIDA DEL SLIME ───────────────────────────────────────────────────
        const barWidth = 120;
        const barHeight = 10;
        const barX = this.slime.x - barWidth / 2;
        const barY = this.slime.y - 100;
        this.slimeHpBarBg = this.add.rectangle(barX, barY, barWidth, barHeight, 0x333333).setOrigin(0, 0).setDepth(200);
        this.slimeHpBarFill = this.add.rectangle(barX, barY, barWidth, barHeight, 0xee4444).setOrigin(0, 0).setDepth(201);

        // ── HITBOX DE ATAQUE DEL SLIME ────────────────────────────────────────────────
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

        // ── OVERLAPS DE COMBATE ───────────────────────────────────────────────────────

        // Jugador golpea al slime.
        this.physics.add.overlap(this.player.attackHitbox, this.slime, () => {
            if (this.player.attackHasHit || !this.slime?.active) return;
            this.player.attackHasHit = true;
            this.slime.hp -= this.player.damage;
            this.updateSlimeHpBar();

            if (this.slime.hp <= 0) {
                this.slime.setVelocity(0, 0);
                this.slime.isDead = true;
                this.slime.body.enable = false;
                this.slime.isAttacking = false;
                if (this.slimeAttackHitbox) {
                    this.slimeAttackHitbox.body.enable = false;
                    this.slimeAttackHitbox.destroy();
                    this.slimeAttackHitbox = null;
                }
                this.slimeHpBarBg.destroy();
                this.slimeHpBarBg = null;
                this.slimeHpBarFill.destroy();
                this.slimeHpBarFill = null;
                this.slime.play('slime_death_anim');
                this.slime.once('animationcomplete', (anim) => {
                    if (anim.key !== 'slime_death_anim') return;
                    if (this.slime?.destroy) this.slime.destroy();
                    this.slime = null;
                    this.onRoomCleared('Scenario3');
                });
            }
        });

        // Slime golpea al jugador.
        this.physics.add.overlap(this.slimeAttackHitbox, this.player, () => {
            if (!this.gameOver) this.handlePlayerTakeDamage(1);
        });
    }

    updateSlimeHpBar() {
        if (!this.slimeHpBarFill || !this.slime) return;
        this.slimeHpBarFill.width = 120 * (this.slime.hp / this.slime.maxHp);
    }

    // IA del slime: perseguir en X y atacar con cooldown.
    updateScene() {
        if (!this.slime?.active || this.slime.isDead) return;

        this.slime.setDepth(this.slime.y);
        const distanceX = this.player.x - this.slime.x;
        const speed = 45;

        // La barra de vida sigue al slime.
        if (this.slimeHpBarBg) {
            const barX = this.slime.x - 60;
            const barY = this.slime.y - 100;
            this.slimeHpBarBg.setPosition(barX, barY);
            this.slimeHpBarFill.setPosition(barX, barY);
        }

        if (this.slimeAttackHitbox?.body) {
            const hitOffsetX = this.slime.flipX ? -56 : 56;
            this.slimeAttackHitbox.body.reset(this.slime.x + hitOffsetX, this.slime.y - 8);
        }

        if (this.slime.isAttacking) {
            this.slime.setVelocityX(0);
        } else if (Math.abs(distanceX) > 120) {
            this.slime.setVelocityX(distanceX > 0 ? speed : -speed);
            this.slime.setFlipX(distanceX < 0);
            this.slime.play('slime_idle_anim', true);
        } else {
            this.slime.setVelocityX(0);
            const timeNow = this.time.now;
            if (timeNow - this.slime.lastAttackTime > 1800) {
                this.slime.isAttacking = true;
                this.slime.lastAttackTime = timeNow;
                this.slime.play('slime_attack_anim', true);
                if (this.slimeAttackHitbox?.body) this.slimeAttackHitbox.body.enable = true;
                this.slime.setFlipX(distanceX < 0);
            }
        }
        this.slime.setVelocityY(0);
    }
}
