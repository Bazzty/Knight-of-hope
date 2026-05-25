import Phaser from 'phaser';
import createPlayer from '../entities/player';

// GameScene es la escena principal del juego. Extiende Phaser.Scene para tener acceso
// a todos los sistemas de Phaser (física, animaciones, input, etc.).
export default class GameScene extends Phaser.Scene {
    constructor() {
        // 'GameScene' es la clave con la que otras escenas o código pueden referenciar esta escena.
        super('GameScene');

        // Declaramos todas las referencias que vamos a usar para tenerlas organizadas.
        this.player = null;
        this.cursors = null;       // Teclas de flecha
        this.wasd = null;          // Teclas WASD
        this.attackKey = null;     // Tecla SPACE
        this.enemigo = null;
        this.door = null;
        this.doorOverlap = null;
        this.doorTrigger = null;
        this.enemigoAttackHitbox = null;
        this.enemigoHpBarBg = null;   // Fondo gris de la barra de vida del enemigo
        this.enemigoHpBarFill = null; // Relleno rojo que se encoge al recibir daño
        this.hpText = null;
        this.gameOver = false;
        this.gameOverText = null;
        this.continueText = null;
    }

    // ── PRELOAD ───────────────────────────────────────────────────────────────────────
    // Phaser llama a preload() antes de create(). Aquí se cargan todos los assets.
    // Los assets en /public/assets/ se cargan por URL relativa.
    preload() {
        // Imagen estática para el fondo de la mazmorra.
        this.load.image('dungeon', 'assets/dungeon.png');

        // Spritesheets: imágenes con múltiples frames del mismo tamaño.
        // frameWidth/frameHeight indica el tamaño de cada frame individual.
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
        this.load.spritesheet('knight_death', 'assets/muerteCaballero.png', {
            frameWidth: 69,
            frameHeight: 69
        });
        this.load.spritesheet('enemigo', 'assets/enemigo.png', {
            frameWidth: 69,
            frameHeight: 69
        });
        this.load.spritesheet('enemigo_attack', 'assets/ataqueEnemigo.png', {
            frameWidth: 69,
            frameHeight: 69
        });
    }

    // ── CREATE ────────────────────────────────────────────────────────────────────────
    // Phaser llama a create() una vez que preload() termina. Aquí se construye la escena.
    // También se llama al reiniciar con scene.restart().
    create() {
        const { width, height } = this.scale;

        // Resetear gameOver al reiniciar la escena.
        this.gameOver = false;

        // ── ESCENARIO ─────────────────────────────────────────────────────────────────
        // Fondo centrado y estirado al tamaño de la pantalla.
        this.add.image(width / 2, height / 2, 'dungeon').setDisplaySize(width, height);

        // Define los límites del mundo físico. setCollideWorldBounds() en los sprites
        // los detiene al llegar a estos límites.
        // Amplía el mundo hacia la derecha para dar más espacio de movimiento.
        this.physics.world.setBounds(0, 0, width + 140, height);

        // ── ANIMACIONES ───────────────────────────────────────────────────────────────
        // Las animaciones se definen globalmente en la escena y se reutilizan por clave.

        // Antorcha: frames 0 al 24, 10 fps, loop infinito (repeat: -1).
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
            // La segunda antorcha se espeja para que parezca distinta.
            if (index === 1) sprite.setFlipX(true);
        });

        // El guard !this.anims.exists() evita un error si la escena se reinicia:
        // Phaser lanza excepción si intentás crear una animación que ya existe.
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
                frameRate: 18, // Más rápido que caminar para que el ataque se sienta snappy.
                repeat: 0      // Sin loop: la animación se reproduce una sola vez.
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

        if (!this.anims.exists('enemigo_walk_anim')) {
            this.anims.create({
                key: 'enemigo_walk_anim',
                frames: this.anims.generateFrameNumbers('enemigo'), // Sin start/end: usa todos los frames.
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

        // ── JUGADOR ───────────────────────────────────────────────────────────────────
        // createPlayer() es una factory function en entities/player.js que devuelve
        // el sprite configurado con física, animaciones y métodos de combate.
        this.player = createPlayer(this, 200, 750);

        // ── ENEMIGO ───────────────────────────────────────────────────────────────────
        this.enemigo = this.physics.add.sprite(1100, 480, 'enemigo');
        this.enemigo.setScale(6);
        this.enemigo.setFlipX(true); // Mira hacia la izquierda al inicio.
        this.enemigo.isAttacking = false;
        this.enemigo.lastAttackTime = 0; // Timestamp del último ataque para controlar el cooldown.
        this.enemigo.hp = 3;
        this.enemigo.maxHp = 3;

        // ── BARRA DE VIDA DEL ENEMIGO ─────────────────────────────────────────────────
        // Dos rectángulos superpuestos: el de fondo (gris) siempre es 200px,
        // el de relleno (rojo) se encoge según el HP restante.
        const barWidth = 200;
        const barHeight = 14;
        const barX = this.enemigo.x - barWidth / 2; // Centrado sobre el enemigo.
        const barY = this.enemigo.y - 250;          // 250px arriba del centro del sprite.

        // setOrigin(0, 0) hace que x/y sea la esquina superior izquierda, no el centro.
        // Así al reducir el width, encoge hacia la derecha (efecto de barra de vida).
        // setDepth() controla el orden de dibujado: mayor número = se dibuja encima.
        this.enemigoHpBarBg = this.add.rectangle(barX, barY, barWidth, barHeight, 0x333333).setOrigin(0, 0).setDepth(200);
        this.enemigoHpBarFill = this.add.rectangle(barX, barY, barWidth, barHeight, 0xee4444).setOrigin(0, 0).setDepth(201);

        // ── HITBOX DE ATAQUE DEL ENEMIGO ──────────────────────────────────────────────
        // Igual que la del jugador: rectángulo invisible con cuerpo físico.
        this.enemigoAttackHitbox = this.add.rectangle(this.enemigo.x, this.enemigo.y, 140, 100);
        this.physics.add.existing(this.enemigoAttackHitbox);
        this.enemigoAttackHitbox.body.enable = false; // Inactiva hasta que el enemigo ataque.

        // Cuando la animación de ataque termina, vuelve al estado normal.
        this.enemigo.on('animationcomplete', (anim) => {
            if (anim.key === 'enemigo_attack_anim') {
                this.enemigo.isAttacking = false;
                this.enemigo.setTexture('enemigo');
                // Desactiva la hitbox para que no siga haciendo daño después del ataque.
                this.enemigoAttackHitbox.body.enable = false;
            }
        });

        // ── OVERLAPS DE COMBATE ───────────────────────────────────────────────────────
        // physics.add.overlap() llama al callback cada frame que los dos cuerpos se solapan.
        // A diferencia de collider(), no aplica rebote físico.

        // Hitbox del jugador golpea al enemigo.
        this.physics.add.overlap(this.player.attackHitbox, this.enemigo, () => {
            // attackHasHit evita que un mismo swing dañe más de una vez.
            if (this.player.attackHasHit || !this.enemigo || !this.enemigo.active) return;
            this.player.attackHasHit = true;
            this.enemigo.hp -= 1;
            this.updateEnemigoHpBar();

            if (this.enemigo.hp <= 0) {
                // Destruimos todos los objetos asociados al enemigo para evitar memory leaks.
                this.enemigoAttackHitbox.destroy();
                this.enemigoAttackHitbox = null;
                this.enemigoHpBarBg.destroy();
                this.enemigoHpBarBg = null;
                this.enemigoHpBarFill.destroy();
                this.enemigoHpBarFill = null;
                this.enemigo.destroy();
                this.enemigo = null;

                // ── CAMBIO DE ESCENA ───────────────────────────────────────────────────────
                // Mostrar texto de victoria
                const roomText = this.add.text(width / 2, height / 3.5, 'ROOM CLEARED!', {
                    fontSize: '60px',
                    color: '#f31313',
                    stroke: '#000000',
                    strokeThickness: 6
                }).setOrigin(0.5).setDepth(300);

                // Mantener el texto visible 3 segundos
                this.time.delayedCall(3000, () => {
                    if (roomText && roomText.destroy) roomText.destroy();
                });

                // Usar la puerta que ya está dibujada en la imagen `dungeon.png`.
                // Creamos únicamente un trigger INVISIBLE en la posición aproximada
                // de la puerta del fondo. Cuando el jugador se pare sobre él, pasamos a Scenario2.
                // Ajusta `xDoor`/`yDoor` o el tamaño si la posición no coincide exactamente.
                const xDoor = width + 230; // posición relativa en pantalla (ajustable)
                const yDoor = height / 2 + 10;
                this.doorTrigger = this.add.rectangle(xDoor, yDoor, 220, 300).setOrigin(0.5).setDepth(199);
                this.doorTrigger.visible = false;
                this.physics.add.existing(this.doorTrigger, true);

                // Overlap que activa la transición cuando el jugador está sobre la puerta dibujada.
                this.doorOverlap = this.physics.add.overlap(this.player, this.doorTrigger, () => {
                    if (this.doorOverlap) {
                        try { this.doorOverlap.destroy(); } catch (e) { }
                        this.doorOverlap = null;
                    }
                    if (this.doorTrigger && this.doorTrigger.destroy) this.doorTrigger.destroy();
                    this.scene.start('Scenario2');
                }, null, this);

            }
        });

        // Hitbox del enemigo golpea al jugador.
        this.physics.add.overlap(this.enemigoAttackHitbox, this.player, () => {
            const playerDied = this.player.takeDamage(1);
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
                });
            }


        });

        // ── HUD DEL JUGADOR ───────────────────────────────────────────────────────────
        // Texto fijo en la esquina superior izquierda. setDepth(200) garantiza que
        // se dibuje encima de los sprites del juego.
        this.hpText = this.add.text(20, 20, '', {
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#000000',    // Borde negro para que sea legible sobre cualquier fondo.
            strokeThickness: 4
        }).setDepth(200);
        this.updateHpDisplay();

        // ── INPUT ─────────────────────────────────────────────────────────────────────
        // createCursorKeys() devuelve un objeto con las 4 flechas + shift + space.
        this.cursors = this.input.keyboard.createCursorKeys();
        // addKeys() permite registrar múltiples teclas con un solo string separado por comas.
        this.wasd = this.input.keyboard.addKeys('W,A,S,D');
        this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    // ── HELPERS ───────────────────────────────────────────────────────────────────────

    // Actualiza el texto de HP del jugador en el HUD.
    updateHpDisplay() {
        this.hpText.setText(`HP: ${this.player.hp} / ${this.player.maxHp}`);
    }

    // Actualiza el ancho del relleno de la barra de vida del enemigo.
    // El ratio hp/maxHp va de 0 a 1; multiplicado por 200 da el ancho en píxeles.
    updateEnemigoHpBar() {
        if (!this.enemigoHpBarFill || !this.enemigo) return;
        const ratio = this.enemigo.hp / this.enemigo.maxHp;
        this.enemigoHpBarFill.width = 200 * ratio;
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────────────
    // Phaser llama a update() ~60 veces por segundo (cada frame).
    // Aquí va toda la lógica que cambia con el tiempo: input, IA, física.
    update() {
        // Si algún objeto crítico no está listo, no hacemos nada.
        if (!this.player || !this.cursors || !this.wasd) return;

        if (this.gameOver) {
            if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
                this.scene.restart();
            }
            return;
        }

        // JustDown() devuelve true solo en el frame exacto en que se presionó la tecla,
        // no en cada frame que esté sostenida. Ideal para acciones de una sola vez.
        if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
            this.player.attack();
        }

        // Pasa el estado actual de las teclas al método de movimiento del jugador.
        this.player.updateMovement({
            left: this.cursors.left.isDown || this.wasd.A.isDown,
            right: this.cursors.right.isDown || this.wasd.D.isDown,
            up: this.cursors.up.isDown || this.wasd.W.isDown,
            down: this.cursors.down.isDown || this.wasd.S.isDown
        });

        // setDepth con el valor Y simula perspectiva top-down: quien está más abajo
        // en la pantalla se dibuja encima de quien está más arriba.
        this.player.setDepth(this.player.y);

        // ── IA DEL ENEMIGO ────────────────────────────────────────────────────────────
        if (this.enemigo && this.enemigo.active) {
            this.enemigo.setDepth(this.enemigo.y);

            const velocidad = 80;
            // distanciaX positiva = jugador a la derecha del enemigo; negativa = a la izquierda.
            const distanciaX = this.player.x - this.enemigo.x;

            // Mueve la barra de vida para que siga al enemigo cada frame.
            const barX = this.enemigo.x - 100;
            const barY = this.enemigo.y - 250;
            this.enemigoHpBarBg.setPosition(barX, barY);
            this.enemigoHpBarFill.setPosition(barX, barY);

            // Mueve la hitbox de ataque delante del enemigo en cada frame.
            const enemigoHitOffsetX = this.enemigo.flipX ? -150 : 150;
            this.enemigoAttackHitbox.body.reset(
                this.enemigo.x + enemigoHitOffsetX,
                this.enemigo.y
            );

            if (this.enemigo.isAttacking) {
                // Durante el ataque el enemigo se queda quieto.
                this.enemigo.setVelocityX(0);

            } else if (Math.abs(distanciaX) > 160) {
                // Si está lejos del jugador, persigue en horizontal.
                if (distanciaX > 0) {
                    this.enemigo.setVelocityX(velocidad);
                    this.enemigo.setFlipX(false); // Mira a la derecha.
                } else {
                    this.enemigo.setVelocityX(-velocidad);
                    this.enemigo.setFlipX(true);  // Mira a la izquierda.
                }
                this.enemigo.play('enemigo_walk_anim', true);

            } else {
                // Está en rango de ataque: se detiene y ataca si pasó el cooldown.
                this.enemigo.setVelocityX(0);

                const tiempoActual = this.time.now; // Milisegundos desde que inició la escena.
                if (tiempoActual - this.enemigo.lastAttackTime > 2500) {
                    this.enemigo.isAttacking = true;
                    this.enemigo.lastAttackTime = tiempoActual;
                    this.enemigo.setTexture('enemigo_attack');
                    this.enemigo.play('enemigo_attack_anim', true);
                    this.enemigoAttackHitbox.body.enable = true; // Activa el hitbox del ataque.
                    this.enemigo.setFlipX(distanciaX < 0); // Mira hacia el jugador al atacar.
                } else if (this.enemigo.anims.currentAnim && this.enemigo.anims.currentAnim.key !== 'enemigo_attack_anim') {
                    // Pausa la animación de caminar cuando está parado esperando atacar.
                    this.enemigo.anims.stop();
                }
            }

            // Anula cualquier velocidad vertical para que el enemigo se mueva solo en X.
            this.enemigo.setVelocityY(0);
        }
    }
}
