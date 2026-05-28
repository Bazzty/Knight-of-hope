import Phaser from 'phaser';
import createPlayer from '../entities/player';
import { useGameStore } from '../../stores/gameState';

// Cada cuántas salas aparece la pantalla de mejoras.
const UPGRADE_EVERY = 1;

// Clase base para todas las salas del dungeon.
// Define el flujo común (input, animaciones, HUD, combate, game over, puertas)
// y expone hooks que las subclases sobreescriben para lo específico de cada sala.
export default class DungeonScene extends Phaser.Scene {
    constructor(key) {
        super(key);
        this.player = null;
        this.cursors = null;
        this.wasd = null;
        this.attackKey = null;
        this.blockKey = null;
        this.hpText = null;
        this.store = null;
        this.gameOver = false;
        this.gameOverText = null;
        this.continueText = null;
        this.dialogueActive = false;
    }

    // ── PRELOAD ───────────────────────────────────────────────────────────────────────
    // Carga los spritesheets del knight que se usan en TODAS las salas.
    // Llama a preloadScene() para que cada hija cargue sus assets propios.
    preload() {
        this.load.spritesheet('knight_walk', 'assets/player/knight-walk.png', { frameWidth: 96, frameHeight: 84 });
        this.load.spritesheet('knight_attack', 'assets/player/knight-attack.png', { frameWidth: 96, frameHeight: 84 });
        this.load.spritesheet('knight_death', 'assets/player/knight-death.png', { frameWidth: 96, frameHeight: 84 });
        this.load.spritesheet('knight_idle', 'assets/player/knight-idle.png', { frameWidth: 96, frameHeight: 84 });
        this.load.spritesheet('knight_defend', 'assets/player/knight-defend.png', { frameWidth: 96, frameHeight: 84 });

        // Carga la música general (Phaser detectará si usa el OGG o el MP3 según el navegador)
        this.load.audio('musicforscenes', [
            'assets/audio/music/musicforscenes.ogg',
            'assets/audio/music/musicforscenes.mp3'
        ]);
        this.load.audio('gameoversound', [
            'assets/audio/music/sfx/gameover.ogg',
            'assets/audio/music/sfx/gameover.mp3'
        ]);

        // IMPORTANTE: Llama al pre-load de la respectiva sala (GameScene, Scenario2, etc.)
        this.preloadScene();
    }

    // Hook: la subclase carga sus assets específicos (fondo, enemigo, etc.).
    preloadScene() { }

    // ── CREATE ────────────────────────────────────────────────────────────────────────
    // Inicializa todo lo común: store, input, animaciones del knight, HUD.
    // Luego delega en createScene() para lo específico de cada sala.
    create() {
        this.gameOver = false;
        this.gameOverText = null;
        this.continueText = null;

        this.store = useGameStore();

        // Reproducir música (verificando que no esté sonando ya para que no se reinicie)
        let musicforscenes = this.sound.get('musicforscenes');
        if (!musicforscenes) {
            musicforscenes = this.sound.add('musicforscenes', { loop: true, volume: 0.15 });
            musicforscenes.play();
        } else {
            // Restaurar volumen normal por si venimos de un "Game Over"
            musicforscenes.setVolume(0.15);
            if (!musicforscenes.isPlaying) {
                musicforscenes.play();
            }
        }

        // Input — idéntico en todas las salas.
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,A,S,D');
        this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.blockKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

        // Animaciones del knight — idénticas en todas las salas.
        // El guard !this.anims.exists() evita error al reiniciar la escena.
        if (!this.anims.exists('knight_defend_anim')) {
            this.anims.create({ key: 'knight_defend_anim', frames: this.anims.generateFrameNumbers('knight_defend', { start: 0, end: 5 }), frameRate: 10, repeat: 0 });
        }
        if (!this.anims.exists('knight_idle_anim')) {
            this.anims.create({ key: 'knight_idle_anim', frames: this.anims.generateFrameNumbers('knight_idle', { start: 0, end: 6 }), frameRate: 8, repeat: -1 });
        }
        if (!this.anims.exists('knight_walk_anim')) {
            this.anims.create({ key: 'knight_walk_anim', frames: this.anims.generateFrameNumbers('knight_walk', { start: 0, end: 7 }), frameRate: 10, repeat: -1 });
        }
        if (!this.anims.exists('knight_attack_anim')) {
            this.anims.create({ key: 'knight_attack_anim', frames: this.anims.generateFrameNumbers('knight_attack', { start: 0, end: 5 }), frameRate: 14, repeat: 0 });
        }
        if (!this.anims.exists('knight_death_anim')) {
            this.anims.create({ key: 'knight_death_anim', frames: this.anims.generateFrameNumbers('knight_death', { start: 0, end: 11 }), frameRate: 8, repeat: 0 });
        }

        // HUD de vida — idéntico en todas las salas.
        this.hpText = this.add.text(20, 20, '', {
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setDepth(200);

        // La subclase construye el resto: fondo, límites del mundo, enemigo, overlaps.
        this.createScene();
        this.showRoomTitle(this.getRoomTitle());
    }

    // Hook principal: la subclase arma el fondo, llama spawnPlayer(), crea enemigos y overlaps.
    createScene() { }

    // ── PLAYER ────────────────────────────────────────────────────────────────────────
    // Crea el jugador leyendo los stats actuales del store.
    // La subclase decide CUÁNDO llamar esto dentro de createScene()
    // (GameScene lo llama después de reset(); las demás, directo).
    spawnPlayer(x, y) {
        this.player = createPlayer(this, x, y, {
            speed: this.store.playerSpeed,
            damage: this.store.playerDamage,
            maxHp: this.store.maxHp,
            hp: this.store.hp,
        });
        this.updateHpDisplay();
    }

    // ── HUD ───────────────────────────────────────────────────────────────────────────
    updateHpDisplay() {
        if (!this.hpText || !this.player) return;
        this.hpText.setText(`HP: ${this.player.hp} / ${this.player.maxHp}`);
    }

    // ── COMBATE: DAÑO AL JUGADOR ──────────────────────────────────────────────────────
    // Centraliza: aplicar daño + sincronizar store + actualizar HUD + manejar muerte.
    // Las subclases llaman esto desde sus overlaps en vez de duplicar esa lógica.
    handlePlayerTakeDamage(amount) {
        const died = this.player.takeDamage(amount);
        this.store.setHp(this.player.hp);
        this.updateHpDisplay();
        if (!this.gameOver) this.cameras.main.shake(150, 0.012);
        if (died && !this.gameOver) this.handlePlayerDeath();
        return died;
    }

    // ── COMBATE: MUERTE DEL JUGADOR ───────────────────────────────────────────────────
    // Congela al jugador, reproduce animación de muerte y muestra UI de game over.
    handlePlayerDeath() {
        this.gameOver = true;

        // Reducir la música de fondo y reproducir el sonido de game over
        const bgm = this.sound.get('musicforscenes');
        if (bgm) {
            bgm.setVolume(0.05);
        }
        this.sound.play('gameoversound', { volume: 0.1 });

        this.player.setVelocity(0, 0);
        this.player.anims.stop();
        this.player.setTexture('knight_death');
        this.player.setOrigin(0.5, 1);
        this.player.setScale(5.0);
        this.player.body.enable = false;
        this.player.alpha = 1;
        this.player.play('knight_death_anim');

        // Muestra el UI cuando termina la animación.
        this.player.once('animationcomplete', (anim) => {
            if (anim.key !== 'knight_death_anim') return;
            this.showGameOverUI();
        });

        // Fallback: si el evento no dispara (bug de Phaser al reiniciar rápido), muestra igual.
        this.time.delayedCall(1200, () => {
            if (this.gameOver) this.showGameOverUI();
        });
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

    // ── SALA COMPLETADA ───────────────────────────────────────────────────────────────
    // Persiste HP, incrementa contador de salas, muestra texto y gestiona upgrade/puerta.
    // nextScene: clave de la escena siguiente. Si es null, llama afterRoomCleared() en su lugar.
    // text/color: mensaje de sala completada (por defecto "ROOM CLEARED!" en rojo).
    onRoomCleared(nextScene, text = 'ROOM CLEARED!', color = '#f31313', skipUpgrade = false) {
        this.store.setHp(this.player.hp);
        this.store.incrementRoom();

        const { width, height } = this.scale;
        const roomText = this.add.text(width / 2, height / 3.5, text, {
            fontSize: '60px', color, stroke: '#000000', strokeThickness: 6
        }).setOrigin(0.5).setDepth(300);

        this.time.delayedCall(2000, () => {
            if (roomText?.destroy) roomText.destroy();

            // Se ejecuta tanto después del upgrade como cuando no hay upgrade.
            const proceed = () => {
                // Sincroniza los stats del jugador con los del store (puede haber subido de nivel).
                this.player.hp = this.store.hp;
                this.player.maxHp = this.store.maxHp;
                this.player.speed = this.store.playerSpeed;
                this.player.damage = this.store.playerDamage;
                this.updateHpDisplay();

                if (nextScene) {
                    this.showDoorTrigger(nextScene);
                } else {
                    // ScenarioBoss sobreescribe esto para mostrar la pantalla de victoria.
                    this.afterRoomCleared();
                }
            };

            if (!skipUpgrade && this.store.roomCount % UPGRADE_EVERY === 0) {
                this.scene.pause();
                this.scene.launch('UpgradeScene', { callerScene: this.scene.key });
                this.events.once('upgrade-chosen', proceed);
            } else {
                proceed();
            }
        });
    }

    // Hook para cuando no hay sala siguiente (usado en ScenarioBoss).
    afterRoomCleared() { }

    // ── PUERTA ────────────────────────────────────────────────────────────────────────
    // Crea un trigger invisible fuera del borde derecho de la pantalla.
    // Al entrar el jugador, guarda el HP y lanza la escena siguiente.
    showDoorTrigger(nextScene) {
        const { width, height } = this.scale;
        const doorTrigger = this.add.rectangle(width + 80, height / 2 + 10, 220, 300).setOrigin(0.5).setDepth(199);
        doorTrigger.visible = false;
        this.physics.add.existing(doorTrigger, true);

        let doorOverlap = this.physics.add.overlap(this.player, doorTrigger, () => {
            if (doorOverlap) {
                try { doorOverlap.destroy(); } catch (e) { /* ya destruido */ }
                doorOverlap = null;
            }
            if (doorTrigger?.destroy) doorTrigger.destroy();
            this.store.setHp(this.player.hp);
            this.scene.start(nextScene);
        }, null, this);
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────────────
    // Bucle principal: maneja game over, input del jugador, profundidad.
    // Delega la lógica del enemigo en updateScene() de cada subclase.
    update() {
        if (!this.player || !this.cursors || !this.wasd) return;
        if (this.dialogueActive) return;

        if (this.gameOver) {
            if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
                // Al morir y pedir retry, volver al inicio global (GameScene)
                // Detenemos audio activo y reseteamos el estado del juego.
                try { this.sound.stopAll(); } catch (e) { /* ignore */ }
                try { this.store.reset(); } catch (e) { /* ignore */ }
                this.scene.start('GameScene');
            }
            return;
        }

        if (!this.player.isBlocking && Phaser.Input.Keyboard.JustDown(this.attackKey)) this.player.attack();

        this.player.updateMovement({
            left: this.cursors.left.isDown || this.wasd.A.isDown,
            right: this.cursors.right.isDown || this.wasd.D.isDown,
            up: this.cursors.up.isDown || this.wasd.W.isDown,
            down: this.cursors.down.isDown || this.wasd.S.isDown,
            block: this.blockKey.isDown
        });

        this.player.setDepth(this.player.y);

        this.updateScene();
    }

    // ── EFECTOS VISUALES ──────────────────────────────────────────────────────────────
    // Explosión de partículas rectangulares al matar un enemigo.
    spawnHitBurst(x, y, colors = [0xffcc00, 0xff8800, 0xffffff, 0xff4444]) {
        const count = 12;
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const dist = Phaser.Math.Between(80, 240);
            const color = colors[i % colors.length];
            const size = Phaser.Math.Between(8, 18);
            const piece = this.add.rectangle(x, y, size, size, color).setDepth(150);
            this.tweens.add({
                targets: piece,
                x: x + Math.cos(angle) * dist,
                y: y + Math.sin(angle) * dist,
                alpha: 0,
                scaleX: 0,
                scaleY: 0,
                duration: Phaser.Math.Between(400, 700),
                ease: 'Power2',
                onComplete: () => { if (piece?.destroy) piece.destroy(); }
            });
        }
    }

    // Título de sala con fade-in y fade-out al inicio de cada nivel.
    showRoomTitle(label) {
        if (!label) return;
        const { width, height } = this.scale;
        const title = this.add.text(width / 2, height / 2 - 80, label, {
            fontSize: '68px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5).setDepth(250).setAlpha(0);

        this.tweens.add({
            targets: title,
            alpha: 1,
            duration: 400,
            hold: 900,
            yoyo: true,
            onComplete: () => { if (title?.destroy) title.destroy(); }
        });
    }

    // ── SISTEMA DE DIÁLOGO ────────────────────────────────────────────────────────────
    // lines: [{ speaker: 'Name', text: '...' }, ...]
    // onComplete: callback cuando se cierra el último mensaje.
    showDialogue(lines, onComplete) {
        if (!lines?.length) { onComplete?.(); return; }
        this.dialogueActive = true;

        const { width, height } = this.scale;
        const boxH = 182;
        const boxY = height - boxH - 14;

        const bg = this.add.rectangle(width / 2, boxY + boxH / 2, width - 48, boxH, 0x000000)
            .setAlpha(0.85).setDepth(400);
        const border = this.add.rectangle(width / 2, boxY + boxH / 2, width - 48, boxH)
            .setStrokeStyle(2, 0xffcc44).setFillStyle(0, 0).setDepth(401);

        const nameLabel = this.add.text(44, boxY + 12, '', {
            fontSize: '18px', color: '#FFD700', stroke: '#000000', strokeThickness: 3
        }).setDepth(402);
        const nameColors = lines.map(l => l.color ?? '#FFD700');

        const bodyLabel = this.add.text(44, boxY + 38, '', {
            fontSize: '20px', color: '#ffffff', stroke: '#000000', strokeThickness: 2,
            wordWrap: { width: width - 96 }
        }).setDepth(402);

        const translationLabel = this.add.text(44, boxY + 108, '', {
            fontSize: '13px', color: '#aaaaaa', fontStyle: 'italic',
            wordWrap: { width: width - 96 }
        }).setDepth(402);

        const hint = this.add.text(width - 44, boxY + boxH - 12, '▶ SPACE', {
            fontSize: '14px', color: '#888888'
        }).setOrigin(1, 1).setDepth(402);
        this.tweens.add({ targets: hint, alpha: 0, duration: 500, yoyo: true, repeat: -1 });

        const all = [bg, border, nameLabel, bodyLabel, translationLabel, hint];
        let idx = 0;

        const show = () => {
            nameLabel.setText(lines[idx].speaker ?? '');
            nameLabel.setColor(nameColors[idx]);
            bodyLabel.setText(lines[idx].text);
            translationLabel.setText(lines[idx].translation ?? '');
        };
        show();

        const advance = () => {
            idx++;
            if (idx >= lines.length) {
                all.forEach(o => { try { o.destroy(); } catch (e) { /* ignore */ } });
                this.input.keyboard.off('keydown-SPACE', advance);
                this.dialogueActive = false;
                onComplete?.();
            } else {
                show();
            }
        };

        // Delay antes de escuchar SPACE para evitar que el mismo keypress
        // que activó el diálogo lo cierre al instante.
        this.time.delayedCall(500, () => {
            this.input.keyboard.on('keydown-SPACE', advance);
        });
    }

    // Hook: la subclase devuelve el texto que se muestra al entrar a la sala.
    getRoomTitle() { return null; }

    // Hook: la subclase implementa la IA del enemigo y lógica específica de frame.
    updateScene() { }
}
