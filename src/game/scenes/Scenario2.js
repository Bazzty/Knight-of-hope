import Phaser from 'phaser';
import createPlayer from '../entities/player';
import { useGameStore } from '../../stores/gameState';
import { setupFireFrames, spawnFireTorch } from '../utils/fireEffect';

// Cada cuántas salas se muestra la pantalla de mejoras.
const UPGRADE_EVERY = 1;

// Scenario2 reutiliza la base de controles/combate de GameScene
export default class Scenario2 extends Phaser.Scene {
    constructor() {
        super('Scenario2');
        // Referencias principales de escena y combate.
        this.player = null;
        this.slime = null;
        this.slimeAttackHitbox = null;
        this.gameOver = false;
        this.gameOverText = null;
        this.continueText = null;
        this.cursors = null;
        this.wasd = null;
        this.attackKey = null;
        this.hpText = null;
    }

    // ── PRELOAD ───────────────────────────────────────────────────────────────────────
    // Carga assets del escenario, jugador y slime.
    preload() {
        this.load.image('room2', 'assets/room2.png');
        this.load.image('fire-orange', 'assets/fire-orange.png');
        this.load.spritesheet('fire-blue', 'assets/fire-blue.png', { frameWidth: 192, frameHeight: 1024 });
        this.load.spritesheet('knight_walk', 'assets/movimientoFinal.png', {
            frameWidth: 69,
            frameHeight: 69
        });
        this.load.spritesheet('knight_attack', 'assets/Ataquefinal.png', {
            frameWidth: 69,
            frameHeight: 69
        });
        this.load.spritesheet('knight_death', 'assets/muerteCaballero.png', {
            frameWidth: 69,
            frameHeight: 69
        });
        this.load.spritesheet('slime', 'assets/slime-Sheet.png', {
            frameWidth: 32,
            frameHeight: 25
        });
    }

    // ── CREATE ────────────────────────────────────────────────────────────────────────
    // Inicializa fondo, animaciones, HUD e input.
    create() {
        const { width, height } = this.scale;

        // Resetear estado de partida anterior (el constructor no se re-ejecuta en restart).
        this.gameOver = false;
        this.gameOverText = null;
        this.continueText = null;

        // Fondo del cuarto y límites físicos del mundo.
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

        // Animaciones del caballero.
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

        if (!this.anims.exists('knight_death_anim')) {
            this.anims.create({
                key: 'knight_death_anim',
                frames: this.anims.generateFrameNumbers('knight_death', { start: 0, end: 7 }),
                frameRate: 8,
                repeat: 0
            });
        }

        // Animaciones del slime:
        if (!this.anims.exists('slime_idle_anim')) {
            this.anims.create({
                key: 'slime_idle_anim',
                frames: this.anims.generateFrameNumbers('slime', { start: 0, end: 7 }),
                frameRate: 8,
                repeat: -1
            });
        }

        if (!this.anims.exists('slime_attack_anim')) {
            this.anims.create({
                key: 'slime_attack_anim',
                frames: this.anims.generateFrameNumbers('slime', { start: 8, end: 15 }),
                frameRate: 10,
                repeat: 0
            });
        }

        if (!this.anims.exists('slime_death_anim')) {
            this.anims.create({
                key: 'slime_death_anim',
                frames: this.anims.generateFrameNumbers('slime', { start: 16, end: 20 }),
                frameRate: 8,
                repeat: 0
            });
        }

        // Input de movimiento y ataque.
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,A,S,D');
        this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // HUD de vida del jugador.
        this.hpText = this.add.text(20, 20, '', {
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setDepth(200);

        this.updateHpDisplay = this.updateHpDisplay.bind(this);
        this.startScenario();
    }

    // Actualiza el texto de HP en pantalla.
    updateHpDisplay() {
        if (!this.hpText || !this.player) return;
        this.hpText.setText(`HP: ${this.player.hp} / ${this.player.maxHp}`);
    }

    showGameOverUI() {
        if (this.gameOverText || this.continueText) return;

        const { width, height } = this.scale;

        this.gameOverText = this.add.text(width / 2, height / 2 - 24, 'GAME OVER', {
            fontSize: '64px',
            color: '#ff0000',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setDepth(300);

        this.continueText = this.add.text(width / 2, height / 2 + 250, 'Press SPACE to retry', {
            fontSize: '26px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(300);
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────────────
    // Bucle principal: procesa input y ejecuta IA del slime.
    update() {
        // En game over, SPACE reinicia la escena.
        if (this.gameOver) {
            if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
                this.scene.restart();
            }
            return;
        }

        // Si falta algún objeto crítico, no actualizamos lógica de frame.
        if (!this.player || !this.cursors || !this.wasd) return;

        // Ataque por pulsación única.
        if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
            this.player.attack();
        }

        // Movimiento del jugador con flechas o WASD.
        this.player.updateMovement({
            left: this.cursors.left.isDown || this.wasd.A.isDown,
            right: this.cursors.right.isDown || this.wasd.D.isDown,
            up: this.cursors.up.isDown || this.wasd.W.isDown,
            down: this.cursors.down.isDown || this.wasd.S.isDown
        });

        // Profundidad por Y para simular perspectiva top-down.
        this.player.setDepth(this.player.y);

        // IA del slime: perseguir en X y atacar con cooldown cuando está cerca.
        if (this.slime && this.slime.active && !this.slime.isDead) {
            this.slime.setDepth(this.slime.y);

            const distanceX = this.player.x - this.slime.x;
            const speed = 45;

            // Hitbox de ataque del slime siempre delante de su dirección.
            if (this.slimeAttackHitbox && this.slimeAttackHitbox.body) {
                const hitOffsetX = this.slime.flipX ? -56 : 56;
                this.slimeAttackHitbox.body.reset(this.slime.x + hitOffsetX, this.slime.y - 8);
            }

            if (this.slime.isAttacking) {
                this.slime.setVelocityX(0);
            } else if (Math.abs(distanceX) > 120) {
                if (distanceX > 0) {
                    this.slime.setVelocityX(speed);
                    this.slime.setFlipX(false);
                } else {
                    this.slime.setVelocityX(-speed);
                    this.slime.setFlipX(true);
                }
                this.slime.play('slime_idle_anim', true);
            } else {
                this.slime.setVelocityX(0);

                const timeNow = this.time.now;
                // Cooldown entre ataques del slime.
                if (timeNow - this.slime.lastAttackTime > 1800) {
                    this.slime.isAttacking = true;
                    this.slime.lastAttackTime = timeNow;
                    this.slime.play('slime_attack_anim', true);
                    if (this.slimeAttackHitbox && this.slimeAttackHitbox.body) {
                        this.slimeAttackHitbox.body.enable = true;
                    }
                    this.slime.setFlipX(distanceX < 0);
                }
            }

            this.slime.setVelocityY(0);
        }

        this.updateHpDisplay();
    }

    // Crea jugador, slime y overlaps de combate.
    startScenario() {
        // Spawn del jugador con stats del store (HP, daño y velocidad heredados de sala anterior).
        const store = useGameStore();
        this.player = createPlayer(this, 200, 750, {
            speed: store.playerSpeed,
            damage: store.playerDamage,
            maxHp: store.maxHp,
        });
        this.player.hp = store.hp;
        this.player.setDepth(this.player.y);
        this.player.play('knight_walk_anim', true);

        // Spawn del slime con su estado inicial.
        this.slime = this.physics.add.sprite(1100, 520, 'slime');
        this.slime.setScale(5);
        this.slime.setDepth(this.slime.y);
        this.slime.isAttacking = false;
        this.slime.isDead = false;
        this.slime.lastAttackTime = 0;
        this.slime.hp = 4;
        this.slime.maxHp = 4;
        this.slime.play('slime_idle_anim');

        // Hitbox de ataque del slime: separada del sprite para controlar timing.
        this.slimeAttackHitbox = this.add.rectangle(this.slime.x, this.slime.y, 80, 60);
        this.physics.add.existing(this.slimeAttackHitbox);
        this.slimeAttackHitbox.body.enable = false;

        // Al terminar el ataque, vuelve a idle y desactiva hitbox de daño.
        this.slime.on('animationcomplete', (anim) => {
            if (anim.key === 'slime_attack_anim') {
                this.slime.isAttacking = false;
                this.slime.play('slime_idle_anim', true);
                this.slimeAttackHitbox.body.enable = false;
            }
        });

        // Daño del jugador sobre el slime.
        this.physics.add.overlap(this.player.attackHitbox, this.slime, () => {
            if (this.player.attackHasHit || !this.slime || !this.slime.active) return;

            this.player.attackHasHit = true;
            this.slime.hp -= this.player.damage;

            if (this.slime.hp <= 0) {
                // Secuencia de muerte del slime.
                this.slime.setVelocity(0, 0);
                this.slime.isDead = true;
                this.slime.body.enable = false;
                this.slime.isAttacking = false;
                if (this.slimeAttackHitbox) {
                    this.slimeAttackHitbox.body.enable = false;
                    this.slimeAttackHitbox.destroy();
                }
                this.slimeAttackHitbox = null;
                this.slime.play('slime_death_anim');
                this.slime.once('animationcomplete', (anim) => {
                    if (anim.key !== 'slime_death_anim') return;
                    if (this.slime && this.slime.destroy) this.slime.destroy();
                    this.slime = null;
                    this.onRoomCleared();
                });
            }
        });

        // Daño del slime sobre el jugador y game over.
        this.physics.add.overlap(this.slimeAttackHitbox, this.player, () => {
            if (this.gameOver) return;

            const playerDied = this.player.takeDamage(1);
            this.updateHpDisplay();

            if (playerDied && !this.gameOver) {
                this.gameOver = true;
                // Congela al jugador y reproduce la animación de muerte.
                this.player.setVelocity(0, 0);
                this.player.anims.stop();
                this.player.setTexture('knight_death');
                this.player.setOrigin(0.5, 1);
                this.player.setScale(4.5);
                this.player.body.enable = false;
                this.player.alpha = 1;
                this.player.play('knight_death_anim');

                this.player.once('animationcomplete', (anim) => {
                    if (anim.key !== 'knight_death_anim') return;
                    this.showGameOverUI();
                });

                // Fallback por si el evento animationcomplete no se dispara.
                this.time.delayedCall(1200, () => {
                    if (this.gameOver) {
                        this.showGameOverUI();
                    }
                });
            }
        });

        this.updateHpDisplay();

        // Pequeño delay para que el spawn no quede con animación trabada.
        this.time.delayedCall(300, () => {
            if (this.player && this.player.anims) {
                this.player.anims.pause();
            }
        });
    }

    // Se llama cuando todos los enemigos de la sala están eliminados.
    onRoomCleared() {
        const store = useGameStore();
        store.setHp(this.player.hp);
        store.incrementRoom();

        const { width, height } = this.scale;
        const roomText = this.add.text(width / 2, height / 3.5, 'ROOM CLEARED!', {
            fontSize: '60px',
            color: '#f31313',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setDepth(300);

        this.time.delayedCall(2000, () => {
            if (roomText && roomText.destroy) roomText.destroy();

            if (store.roomCount % UPGRADE_EVERY === 0) {
                this.scene.pause();
                this.scene.launch('UpgradeScene', { callerScene: 'Scenario2' });
                this.events.once('upgrade-chosen', () => {
                    this.player.hp = store.hp;
                    this.player.maxHp = store.maxHp;
                    this.player.speed = store.playerSpeed;
                    this.player.damage = store.playerDamage;
                    this.updateHpDisplay();
                    this.showDoorTrigger();
                });
            } else {
                this.showDoorTrigger();
            }
        });
    }

    // Trigger de puerta invisible para pasar a la siguiente sala.
    showDoorTrigger() {
        const { width, height } = this.scale;
        const xDoor = width + 80;
        const yDoor = height / 2 + 10;
        const doorTrigger = this.add.rectangle(xDoor, yDoor, 220, 300).setOrigin(0.5).setDepth(199);
        doorTrigger.visible = false;
        this.physics.add.existing(doorTrigger, true);

        let doorOverlap = this.physics.add.overlap(this.player, doorTrigger, () => {
            if (doorOverlap) {
                try { doorOverlap.destroy(); } catch (e) { }
                doorOverlap = null;
            }
            if (doorTrigger && doorTrigger.destroy) doorTrigger.destroy();
            useGameStore().setHp(this.player.hp);
            this.scene.start('Scenario3');
        }, null, this);
    }
}
