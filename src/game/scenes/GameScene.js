import { setupFireFrames, spawnFireTorch } from '../utils/fireEffect';
import DungeonScene from './DungeonScene';

// Sala 1 — dungeon con caballero enemigo.
// Solo contiene lo específico de esta sala; el flujo base está en DungeonScene.
export default class GameScene extends DungeonScene {
    constructor() {
        super('GameScene');
        this.enemigo = null;
        this.enemigoAttackHitbox = null;
        this.enemigoHpBarBg = null;
        this.enemigoHpBarFill = null;
    }

    // Carga los assets únicos de sala 1 (fondo, antorcha, sprites del caballero enemigo).
    preloadScene() {
        this.load.image('room1', 'assets/room1.png');
        this.load.image('fire-orange', 'assets/fire-orange.png');
        this.load.spritesheet('enemigo', 'assets/enemigo.png', { frameWidth: 69, frameHeight: 69 });
        this.load.spritesheet('enemigo_attack', 'assets/ataqueEnemigo.png', { frameWidth: 69, frameHeight: 69 });
    }

    // Construye la sala: fondo, antorchas, enemigo, overlaps de combate.
    createScene() {
        const { width, height } = this.scale;

        // Sala 1 siempre arranca con stats frescos (nueva partida o retry).
        // Se llama ANTES de spawnPlayer() para que el jugador lea los valores reseteados.
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

        // spawnPlayer() lee store.hp, store.maxHp, etc. — ya reseteados arriba.
        this.spawnPlayer(200, 750);

        // ── ENEMIGO ───────────────────────────────────────────────────────────────────
        this.enemigo = this.physics.add.sprite(1100, 480, 'enemigo');
        this.enemigo.setScale(6);
        this.enemigo.setFlipX(true);
        this.enemigo.isAttacking = false;
        this.enemigo.lastAttackTime = 0;
        this.enemigo.hp = 3;
        this.enemigo.maxHp = 3;

        // ── BARRA DE VIDA DEL ENEMIGO ─────────────────────────────────────────────────
        const barWidth = 200;
        const barHeight = 14;
        const barX = this.enemigo.x - barWidth / 2;
        const barY = this.enemigo.y - 250;
        this.enemigoHpBarBg = this.add.rectangle(barX, barY, barWidth, barHeight, 0x333333).setOrigin(0, 0).setDepth(200);
        this.enemigoHpBarFill = this.add.rectangle(barX, barY, barWidth, barHeight, 0xee4444).setOrigin(0, 0).setDepth(201);

        // ── HITBOX DE ATAQUE DEL ENEMIGO ──────────────────────────────────────────────
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

        // ── OVERLAPS DE COMBATE ───────────────────────────────────────────────────────

        // Jugador golpea al enemigo.
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
                this.onRoomCleared('Scenario2');
            }
        });

        // Enemigo golpea al jugador — delega en el método base que maneja daño, HUD y muerte.
        this.physics.add.overlap(this.enemigoAttackHitbox, this.player, () => {
            if (!this.gameOver) this.handlePlayerTakeDamage(1);
        });
    }

    // Reescala la barra de vida del enemigo según su HP restante.
    updateEnemigoHpBar() {
        if (!this.enemigoHpBarFill || !this.enemigo) return;
        this.enemigoHpBarFill.width = 200 * (this.enemigo.hp / this.enemigo.maxHp);
    }

    // IA del caballero enemigo: perseguir en X y atacar con cooldown cuando está cerca.
    updateScene() {
        if (!this.enemigo?.active) return;

        this.enemigo.setDepth(this.enemigo.y);

        const distanciaX = this.player.x - this.enemigo.x;
        const velocidad = 80;

        // La barra de vida sigue al enemigo en cada frame.
        const barX = this.enemigo.x - 100;
        const barY = this.enemigo.y - 250;
        this.enemigoHpBarBg.setPosition(barX, barY);
        this.enemigoHpBarFill.setPosition(barX, barY);

        // La hitbox de ataque siempre está delante del enemigo.
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
            if (tiempoActual - this.enemigo.lastAttackTime > 2500) {
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
