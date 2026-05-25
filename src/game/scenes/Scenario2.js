import Phaser from 'phaser';
import createPlayer from '../entities/player';

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
        this.titleText = null;
        this.enterKey = null;
        this.promptText = null;
        this.playerIntroText = null;
        this.started = false;
    }

    // ── PRELOAD ───────────────────────────────────────────────────────────────────────
    // Carga assets del escenario, jugador y slime.
    preload() {
        this.load.image('dungeon', 'assets/dungeon.png');
        this.load.image('dungeon2', 'assets/Scenario2.png');
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

        // Fondo del cuarto y límites físicos del mundo.
        this.add.image(width / 2, height / 2, 'dungeon2').setDisplaySize(width, height);
        this.physics.world.setBounds(0, 0, width + 140, height);

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

        // Títulos iniciales antes de comenzar el escenario con ENTER.
        this.titleText = this.add.text(width / 2, 80, 'SCENARIO 2', {
            fontSize: '48px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setDepth(200);

        this.playerIntroText = this.add.text(width / 2, height - 120, 'Welcome to the next room!', {
            fontSize: '28px',
            color: '#ffff66',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(200);

        this.promptText = this.add.text(width / 2, height - 70, 'Press ENTER to continue', {
            fontSize: '28px',
            color: '#ffff66',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(200);

        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.updateHpDisplay = this.updateHpDisplay.bind(this);
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
    // Bucle principal: espera inicio, procesa input y ejecuta IA del slime.
    update() {
        // Hasta pulsar ENTER, la escena no arranca.
        if (!this.started) {
            if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
                this.startScenario();
            }
            return;
        }

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

    // Arranca el escenario al presionar ENTER: crea jugador, slime y overlaps.
    startScenario() {
        if (this.started) return;

        this.started = true;

        // Oculta textos de introducción al iniciar.
        if (this.titleText) this.titleText.destroy();
        if (this.promptText) this.promptText.destroy();
        if (this.playerIntroText) this.playerIntroText.destroy();

        // Spawn del jugador.
        this.player = createPlayer(this, 200, 750);
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
            this.slime.hp -= 1;

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
}
