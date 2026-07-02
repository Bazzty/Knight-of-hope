import { setupFireFrames, spawnFireTorch } from '../utils/fireEffect';
import DungeonScene from './DungeonScene';

// Sala del Trono — tres oleadas: slimes → esqueletos → boss.
export default class ScenarioBoss extends DungeonScene {
    constructor() {
        super('ScenarioBoss');
        // Boss
        this.enemigo = null;
        this.enemigoAttackHitbox = null;
        this.enemigoHpBarBg = null;
        this.enemigoHpBarFill = null;
        this.bossPhase2 = false;
        this.bossPhase3 = false;
        this.bossSpawned = false;
        this.bossInvulnerable = false;
        // Oleada 1 — slimes
        this.slime = null;
        this.slimeAttackHitbox = null;
        this.slimeHpBarBg = null;
        this.slimeHpBarFill = null;
        this.slime2 = null;
        this.slimeAttackHitbox2 = null;
        this.slimeHpBarBg2 = null;
        this.slimeHpBarFill2 = null;
        // Oleada 2 — esqueletos
        this.skele = null;
        this.skeleAttackHitbox = null;
        this.skeleHpBarBg = null;
        this.skeleHpBarFill = null;
        this.skele2 = null;
        this.skeleAttackHitbox2 = null;
        this.skeleHpBarBg2 = null;
        this.skeleHpBarFill2 = null;
    }

    preloadScene() {
        this.load.image('throne', 'assets/backgrounds/throne.png');
        this.load.image('fire-orange', 'assets/effects/fire-orange.png');
        this.load.spritesheet('enemigo', 'assets/enemies/enemigo.png', { frameWidth: 69, frameHeight: 69 });
        this.load.spritesheet('enemigo_attack', 'assets/enemies/ataqueEnemigo.png', { frameWidth: 69, frameHeight: 69 });
        this.load.spritesheet('slime', 'assets/enemies/slime-Sheet.png', { frameWidth: 32, frameHeight: 25 });
        this.load.spritesheet('skeleton', 'assets/enemies/skeleton.png', { frameWidth: 64, frameHeight: 64 });
        this.load.audio('bossroomsound', ['assets/audio/music/Bossroom.ogg', 'assets/audio/music/Bossroom.mp3']);
        this.load.audio('WinAudio', ['assets/audio/music/sfx/WinAudio.ogg', 'assets/audio/music/sfx/WinAudio.mp3']);
    }

    createScene() {
        // Resetear estado entre runs (el constructor no se vuelve a llamar al reiniciar la escena)
        this.enemigo = null; this.enemigoAttackHitbox = null;
        this.enemigoHpBarBg = null; this.enemigoHpBarFill = null;
        this.bossPhase2 = false; this.bossPhase3 = false;
        this.bossSpawned = false; this.bossInvulnerable = false;
        this.slime = null; this.slimeAttackHitbox = null;
        this.slimeHpBarBg = null; this.slimeHpBarFill = null;
        this.slime2 = null; this.slimeAttackHitbox2 = null;
        this.slimeHpBarBg2 = null; this.slimeHpBarFill2 = null;
        this.skele = null; this.skeleAttackHitbox = null;
        this.skeleHpBarBg = null; this.skeleHpBarFill = null;
        this.skele2 = null; this.skeleAttackHitbox2 = null;
        this.skeleHpBarBg2 = null; this.skeleHpBarFill2 = null;

        const { width, height } = this.scale;

        this.add.image(width / 2, height / 2, 'throne').setDisplaySize(width, height);
        this.physics.world.setBounds(0, 0, width, height);

        setupFireFrames(this, 'fire-orange', [124, 341, 564, 783, 1001, 1215, 1436, 1657], 110, 887);
        [{ x: 235, y: 260 }, { x: 470, y: 260 }, { x: 810, y: 260 }, { x: 1045, y: 260 }].forEach(({ x, y }, i) => {
            spawnFireTorch(this, x, y, 'fire-orange', 0.22, i * 2);
        });

        // Animaciones slime
        if (!this.anims.exists('slime_idle_anim')) this.anims.create({ key: 'slime_idle_anim', frames: this.anims.generateFrameNumbers('slime', { start: 0, end: 7 }), frameRate: 8, repeat: -1 });
        if (!this.anims.exists('slime_attack_anim')) this.anims.create({ key: 'slime_attack_anim', frames: this.anims.generateFrameNumbers('slime', { start: 8, end: 15 }), frameRate: 10, repeat: 0 });
        if (!this.anims.exists('slime_death_anim')) this.anims.create({ key: 'slime_death_anim', frames: this.anims.generateFrameNumbers('slime', { start: 16, end: 20 }), frameRate: 8, repeat: 0 });
        // Animaciones esqueleto
        if (!this.anims.exists('skeleton_idle_anim')) this.anims.create({ key: 'skeleton_idle_anim', frames: this.anims.generateFrameNumbers('skeleton', { start: 39, end: 42 }), frameRate: 6, repeat: -1 });
        if (!this.anims.exists('skeleton_walk_anim')) this.anims.create({ key: 'skeleton_walk_anim', frames: this.anims.generateFrameNumbers('skeleton', { start: 26, end: 37 }), frameRate: 10, repeat: -1 });
        if (!this.anims.exists('skeleton_attack_anim')) this.anims.create({ key: 'skeleton_attack_anim', frames: this.anims.generateFrameNumbers('skeleton', { start: 0, end: 12 }), frameRate: 12, repeat: 0 });
        if (!this.anims.exists('skeleton_death_anim')) this.anims.create({ key: 'skeleton_death_anim', frames: this.anims.generateFrameNumbers('skeleton', { start: 13, end: 25 }), frameRate: 8, repeat: 0 });
        // Animaciones boss
        if (!this.anims.exists('enemigo_walk_anim')) this.anims.create({ key: 'enemigo_walk_anim', frames: this.anims.generateFrameNumbers('enemigo'), frameRate: 4, repeat: -1 });
        if (!this.anims.exists('enemigo_attack_anim')) this.anims.create({ key: 'enemigo_attack_anim', frames: this.anims.generateFrameNumbers('enemigo_attack', { start: 0, end: 11 }), frameRate: 10, repeat: 0 });

        this.spawnPlayer(200, 680);

        this.events.once('shutdown', () => {
            try { const bm = this.sound.get('bossroomsound'); if (bm?.isPlaying) bm.stop(); } catch (e) { /* ignore */ }
        });

        this.spawnSlimeWave();
    }

    getRoomTitle() { return this.t('BOSS ROOM', 'SALA FINAL'); }

    // ── OLEADA 1: SLIMES ─────────────────────────────────────────────────────────────
    spawnSlimeWave() {
        const bw = 120, bh = 10;

        this.slime = this.physics.add.sprite(640, 510, 'skeleton');
        this.slime.setScale(4); this.slime.setDepth(this.slime.y); this.slime.setFlipX(false);
        this.slime.isAttacking = false; this.slime.isDead = false;
        this.slime.lastAttackTime = 0; this.slime.hp = 15; this.slime.maxHp = 15;
        this.slime.play('skeleton_idle_anim');

        this.slimeHpBarBg  = this.add.rectangle(this.slime.x - 70, this.slime.y - 160, 140, bh, 0x333333).setOrigin(0, 0).setDepth(200);
        this.slimeHpBarFill = this.add.rectangle(this.slime.x - 70, this.slime.y - 160, 140, bh, 0xee4444).setOrigin(0, 0).setDepth(201);
        this.slimeAttackHitbox = this.add.rectangle(this.slime.x, this.slime.y, 95, 65);
        this.physics.add.existing(this.slimeAttackHitbox); this.slimeAttackHitbox.body.enable = false;

        this.slime.on('animationcomplete', (anim) => {
            if (anim.key !== 'skeleton_attack_anim') return;
            this.slime.isAttacking = false; this.slime.play('skeleton_idle_anim', true);
            this.slimeAttackHitbox.body.enable = false;
        });

        this.slime2 = this.physics.add.sprite(960, 510, 'skeleton');
        this.slime2.setScale(4); this.slime2.setDepth(this.slime2.y); this.slime2.setFlipX(true);
        this.slime2.isAttacking = false; this.slime2.isDead = false;
        this.slime2.lastAttackTime = this.time.now - 500; this.slime2.hp = 15; this.slime2.maxHp = 15;
        this.slime2.play('skeleton_idle_anim');

        this.slimeHpBarBg2  = this.add.rectangle(this.slime2.x - 70, this.slime2.y - 160, 140, bh, 0x333333).setOrigin(0, 0).setDepth(200);
        this.slimeHpBarFill2 = this.add.rectangle(this.slime2.x - 70, this.slime2.y - 160, 140, bh, 0xee4444).setOrigin(0, 0).setDepth(201);
        this.slimeAttackHitbox2 = this.add.rectangle(this.slime2.x, this.slime2.y, 95, 65);
        this.physics.add.existing(this.slimeAttackHitbox2); this.slimeAttackHitbox2.body.enable = false;

        this.slime2.on('animationcomplete', (anim) => {
            if (anim.key !== 'skeleton_attack_anim') return;
            this.slime2.isAttacking = false; this.slime2.play('skeleton_idle_anim', true);
            if (this.slimeAttackHitbox2?.body) this.slimeAttackHitbox2.body.enable = false;
        });

        this.physics.add.overlap(this.player.attackHitbox, this.slime, () => {
            if (this.player.attackHasHit || !this.slime?.active) return;
            this.player.attackHasHit = true;
            this.slime.hp -= this.player.damage;
            if (this.slimeHpBarFill) this.slimeHpBarFill.width = 140 * Math.max(0, this.slime.hp / this.slime.maxHp);
            if (this.slime.hp <= 0) {
                this.killSlime(1);
            } else {
                this.slime.setTint(0xff5555);
                this.time.delayedCall(90, () => { if (this.slime?.active) this.slime.clearTint(); });
                this.slime.setVelocityX((this.player.x < this.slime.x ? 1 : -1) * 200);
            }
        });
        this.physics.add.overlap(this.slimeAttackHitbox, this.player, () => { if (!this.gameOver) this.handlePlayerTakeDamage(1, this.slime?.x); });

        this.physics.add.overlap(this.player.attackHitbox, this.slime2, () => {
            if (this.player.attackHasHit || !this.slime2?.active) return;
            this.player.attackHasHit = true;
            this.slime2.hp -= this.player.damage;
            if (this.slimeHpBarFill2) this.slimeHpBarFill2.width = 140 * Math.max(0, this.slime2.hp / this.slime2.maxHp);
            if (this.slime2.hp <= 0) {
                this.killSlime(2);
            } else {
                this.slime2.setTint(0xff5555);
                this.time.delayedCall(90, () => { if (this.slime2?.active) this.slime2.clearTint(); });
                this.slime2.setVelocityX((this.player.x < this.slime2.x ? 1 : -1) * 200);
            }
        });
        this.physics.add.overlap(this.slimeAttackHitbox2, this.player, () => { if (!this.gameOver) this.handlePlayerTakeDamage(1, this.slime2?.x); });
    }

    killSlime(n) {
        const s = n === 1 ? this.slime : this.slime2;
        const hb = n === 1 ? this.slimeAttackHitbox : this.slimeAttackHitbox2;
        const bg = n === 1 ? this.slimeHpBarBg : this.slimeHpBarBg2;
        const fill = n === 1 ? this.slimeHpBarFill : this.slimeHpBarFill2;

        this.spawnHitBurst(s.x, s.y - 100, [0xdddddd, 0xaaaaaa, 0xffffff, 0x888888]);
        if (hb) { hb.body.enable = false; hb.destroy(); }
        if (bg) bg.destroy(); if (fill) fill.destroy();
        s.setVelocity(0, 0); s.isDead = true; s.body.enable = false;
        s.play('skeleton_death_anim');

        if (n === 1) { this.slimeAttackHitbox = null; this.slimeHpBarBg = null; this.slimeHpBarFill = null; }
        else { this.slimeAttackHitbox2 = null; this.slimeHpBarBg2 = null; this.slimeHpBarFill2 = null; }

        s.once('animationcomplete', (anim) => {
            if (anim.key !== 'skeleton_death_anim') return;
            if (s?.destroy) s.destroy();
            if (n === 1) this.slime = null; else this.slime2 = null;
            if (!this.slime && !this.slime2) this.spawnSkeletonWave();
        });
    }

    // ── OLEADA 2: ESQUELETOS ─────────────────────────────────────────────────────────
    spawnSkeletonWave() {
        const { width, height } = this.scale;

        this.cameras.main.shake(300, 0.015);
        const flash = this.add.rectangle(width / 2, height / 2, width, height, 0x001133).setDepth(250).setAlpha(0.5);
        this.tweens.add({ targets: flash, alpha: 0, duration: 600, onComplete: () => flash.destroy() });

        const txt = this.add.text(width / 2, height / 2 - 60, this.t('💀  MORE BONES ARISE  💀', '💀  ¡MÁS HUESOS SE ALZAN!  💀'), {
            fontSize: '46px', color: '#cccccc', stroke: '#000000', strokeThickness: 8
        }).setOrigin(0.5).setDepth(300).setAlpha(0);
        this.tweens.add({ targets: txt, alpha: 1, duration: 400, hold: 1100, yoyo: true, onComplete: () => txt.destroy() });

        this.time.delayedCall(500, () => this.createSkeletons());
    }

    createSkeletons() {
        const bw = 140, bh = 10;

        this.skele = this.physics.add.sprite(580, 510, 'skeleton');
        this.skele.setScale(4); this.skele.setDepth(this.skele.y);
        this.skele.isAttacking = false; this.skele.isDead = false;
        this.skele.lastAttackTime = this.time.now - 800; this.skele.hp = 20; this.skele.maxHp = 20;
        this.skele.play('skeleton_idle_anim');
        this.skele.setAlpha(0); this.tweens.add({ targets: this.skele, alpha: 1, duration: 500 });

        this.skeleHpBarBg  = this.add.rectangle(this.skele.x - 70, this.skele.y - 160, bw, bh, 0x333333).setOrigin(0, 0).setDepth(200);
        this.skeleHpBarFill = this.add.rectangle(this.skele.x - 70, this.skele.y - 160, bw, bh, 0xee4444).setOrigin(0, 0).setDepth(201);
        this.skeleAttackHitbox = this.add.rectangle(this.skele.x, this.skele.y, 95, 65);
        this.physics.add.existing(this.skeleAttackHitbox); this.skeleAttackHitbox.body.enable = false;

        this.skele.on('animationcomplete', (anim) => {
            if (anim.key !== 'skeleton_attack_anim') return;
            this.skele.isAttacking = false; this.skele.play('skeleton_idle_anim', true);
            if (this.skeleAttackHitbox?.body) this.skeleAttackHitbox.body.enable = false;
        });

        this.skele2 = this.physics.add.sprite(1000, 510, 'skeleton');
        this.skele2.setScale(4); this.skele2.setDepth(this.skele2.y); this.skele2.setFlipX(true);
        this.skele2.isAttacking = false; this.skele2.isDead = false;
        this.skele2.lastAttackTime = this.time.now - 400; this.skele2.hp = 20; this.skele2.maxHp = 20;
        this.skele2.play('skeleton_idle_anim');
        this.skele2.setAlpha(0); this.tweens.add({ targets: this.skele2, alpha: 1, duration: 500 });

        this.skeleHpBarBg2  = this.add.rectangle(this.skele2.x - 70, this.skele2.y - 160, bw, bh, 0x333333).setOrigin(0, 0).setDepth(200);
        this.skeleHpBarFill2 = this.add.rectangle(this.skele2.x - 70, this.skele2.y - 160, bw, bh, 0xee4444).setOrigin(0, 0).setDepth(201);
        this.skeleAttackHitbox2 = this.add.rectangle(this.skele2.x, this.skele2.y, 95, 65);
        this.physics.add.existing(this.skeleAttackHitbox2); this.skeleAttackHitbox2.body.enable = false;

        this.skele2.on('animationcomplete', (anim) => {
            if (anim.key !== 'skeleton_attack_anim') return;
            this.skele2.isAttacking = false; this.skele2.play('skeleton_idle_anim', true);
            if (this.skeleAttackHitbox2?.body) this.skeleAttackHitbox2.body.enable = false;
        });

        this.physics.add.overlap(this.player.attackHitbox, this.skele, () => {
            if (this.player.attackHasHit || !this.skele?.active) return;
            this.player.attackHasHit = true;
            this.skele.hp -= this.player.damage;
            if (this.skeleHpBarFill) this.skeleHpBarFill.width = 140 * Math.max(0, this.skele.hp / this.skele.maxHp);
            if (this.skele.hp <= 0) { this.killSkele(1); }
            else {
                this.skele.setTint(0xff5555);
                this.time.delayedCall(90, () => { if (this.skele?.active) this.skele.clearTint(); });
                this.skele.setVelocityX((this.player.x < this.skele.x ? 1 : -1) * 180);
            }
        });
        this.physics.add.overlap(this.skeleAttackHitbox, this.player, () => { if (!this.gameOver) this.handlePlayerTakeDamage(1, this.skele?.x); });

        this.physics.add.overlap(this.player.attackHitbox, this.skele2, () => {
            if (this.player.attackHasHit || !this.skele2?.active) return;
            this.player.attackHasHit = true;
            this.skele2.hp -= this.player.damage;
            if (this.skeleHpBarFill2) this.skeleHpBarFill2.width = 140 * Math.max(0, this.skele2.hp / this.skele2.maxHp);
            if (this.skele2.hp <= 0) { this.killSkele(2); }
            else {
                this.skele2.setTint(0xff5555);
                this.time.delayedCall(90, () => { if (this.skele2?.active) this.skele2.clearTint(); });
                this.skele2.setVelocityX((this.player.x < this.skele2.x ? 1 : -1) * 180);
            }
        });
        this.physics.add.overlap(this.skeleAttackHitbox2, this.player, () => { if (!this.gameOver) this.handlePlayerTakeDamage(1, this.skele2?.x); });
    }

    killSkele(n) {
        const s = n === 1 ? this.skele : this.skele2;
        const hb = n === 1 ? this.skeleAttackHitbox : this.skeleAttackHitbox2;
        const bg = n === 1 ? this.skeleHpBarBg : this.skeleHpBarBg2;
        const fill = n === 1 ? this.skeleHpBarFill : this.skeleHpBarFill2;

        this.spawnHitBurst(s.x, s.y - 100, [0xdddddd, 0xaaaaaa, 0xffffff, 0x888888]);
        if (hb) { hb.body.enable = false; hb.destroy(); }
        if (bg) bg.destroy(); if (fill) fill.destroy();
        s.setVelocity(0, 0); s.isDead = true; s.body.enable = false;
        s.play('skeleton_death_anim');

        if (n === 1) { this.skeleAttackHitbox = null; this.skeleHpBarBg = null; this.skeleHpBarFill = null; }
        else { this.skeleAttackHitbox2 = null; this.skeleHpBarBg2 = null; this.skeleHpBarFill2 = null; }

        s.once('animationcomplete', (anim) => {
            if (anim.key !== 'skeleton_death_anim') return;
            if (s?.destroy) s.destroy();
            if (n === 1) this.skele = null; else this.skele2 = null;
            if (!this.skele && !this.skele2) this.spawnBoss();
        });
    }

    // ── OLEADA 3: BOSS ───────────────────────────────────────────────────────────────
    spawnBoss() {
        if (this.bossSpawned) return;
        this.bossSpawned = true;

        const { width, height } = this.scale;

        this.cameras.main.shake(500, 0.022);
        const flash = this.add.rectangle(width / 2, height / 2, width, height, 0x220000).setDepth(250).setAlpha(0.6);
        this.tweens.add({ targets: flash, alpha: 0, duration: 700, onComplete: () => flash.destroy() });

        const bossText = this.add.text(width / 2, height / 2 - 60, this.t('⚔  THE GUARDIAN AWAKENS  ⚔', '⚔  ¡EL GUARDIÁN DESPIERTA!  ⚔'), {
            fontSize: '42px', color: '#ff3300', stroke: '#000000', strokeThickness: 8
        }).setOrigin(0.5).setDepth(300).setAlpha(0);
        this.tweens.add({ targets: bossText, alpha: 1, duration: 400, hold: 1200, yoyo: true, onComplete: () => bossText.destroy() });

        const bgm = this.sound.get('musicforscenes');
        if (bgm?.isPlaying) this.tweens.add({ targets: bgm, volume: 0, duration: 800, onComplete: () => { try { bgm.stop(); } catch (e) { /* ignore */ } } });
        const bossMusic = this.sound.add('bossroomsound', { loop: true, volume: 0 });
        bossMusic.play();
        this.tweens.add({ targets: bossMusic, volume: 0.25, duration: 800 });

        this.add.text(width / 2, 12, this.t('THE GUARDIAN', 'EL GUARDIÁN'), {
            fontSize: '18px', color: '#FFD700', stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5, 0).setDepth(202);
        this.enemigoHpBarBg   = this.add.rectangle(width / 2 - 300, 36, 600, 22, 0x111111).setOrigin(0, 0).setDepth(200);
        this.enemigoHpBarFill = this.add.rectangle(width / 2 - 300, 36, 600, 22, 0xee4444).setOrigin(0, 0).setDepth(201);

        this.time.delayedCall(600, () => {
            this.enemigo = this.physics.add.sprite(1050, 480, 'enemigo');
            this.enemigo.setScale(7); this.enemigo.setFlipX(true);
            this.enemigo.setCollideWorldBounds(true);
            this.enemigo.isAttacking = false; this.enemigo.isCharging = false;
            this.enemigo.lastAttackTime = this.time.now + 1500; this.enemigo.lastChargeTime = 0;
            this.enemigo.hp = 40; this.enemigo.maxHp = 40;
            this.enemigo.setAlpha(0); this.tweens.add({ targets: this.enemigo, alpha: 1, duration: 600 });

            this.enemigoAttackHitbox = this.add.rectangle(this.enemigo.x, this.enemigo.y, 95, 70);
            this.physics.add.existing(this.enemigoAttackHitbox); this.enemigoAttackHitbox.body.enable = false;

            this.enemigo.on('animationcomplete', (anim) => {
                if (anim.key !== 'enemigo_attack_anim') return;
                this.enemigo.isAttacking = false; this.enemigo.setTexture('enemigo');
                this.enemigoAttackHitbox.body.enable = false;
            });

            this.physics.add.overlap(this.player.attackHitbox, this.enemigo, () => {
                if (this.player.attackHasHit || !this.enemigo?.active || this.bossInvulnerable) return;
                this.player.attackHasHit = true;
                this.enemigo.hp -= this.player.damage;

                // Fase 2 — al 50% HP: enojo + pequeña curación
                if (!this.bossPhase2 && this.enemigo.hp <= this.enemigo.maxHp / 2) {
                    this.enemigo.hp = Math.max(1, this.enemigo.hp);
                    this.updateEnemigoHpBar();
                    this.triggerBossPhase2(); return;
                }
                // Fase 3 — al 30% HP (solo si fase 2 ya activa): UNLEASHED + vida completa + crece
                if (this.bossPhase2 && !this.bossPhase3 && this.enemigo.hp <= Math.floor(this.enemigo.maxHp * 0.3)) {
                    this.enemigo.hp = Math.max(1, this.enemigo.hp);
                    this.updateEnemigoHpBar();
                    this.triggerBossPhase3(); return;
                }

                this.updateEnemigoHpBar();

                if (this.enemigo.hp <= 0) {
                    this.spawnHitBurst(this.enemigo.x, this.enemigo.y - 180, [0xffcc00, 0xff8800, 0xff4444, 0xffffff]);
                    this.spawnHitBurst(this.enemigo.x - 60, this.enemigo.y - 100, [0xff6600, 0xffcc00, 0xffffff]);
                    this.cameras.main.shake(300, 0.02);

                    if (this.enemigoAttackHitbox?.body) { this.enemigoAttackHitbox.body.enable = false; this.enemigoAttackHitbox.destroy(); this.enemigoAttackHitbox = null; }
                    if (this.enemigo) { this.enemigo.disableBody(true, true); this.enemigo.active = false; }
                    if (this.enemigoHpBarBg) { this.enemigoHpBarBg.destroy(); this.enemigoHpBarBg = null; }
                    if (this.enemigoHpBarFill) { this.enemigoHpBarFill.destroy(); this.enemigoHpBarFill = null; }

                    this.onRoomCleared(null, this.t('BOSS DEFEATED!', '¡JEFE DERROTADO!'), '#FFD700', true);
                } else {
                    this.enemigo.setTint(0xff5555);
                    this.time.delayedCall(90, () => {
                        if (this.enemigo?.active && !this.bossInvulnerable)
                            this.bossPhase2 ? this.enemigo.setTint(0xff8888) : this.enemigo.clearTint();
                    });
                    this.enemigo.setVelocityX((this.player.x < this.enemigo.x ? 1 : -1) * 260);
                }
            });

            this.physics.add.overlap(this.enemigoAttackHitbox, this.player, () => {
                if (!this.gameOver) this.handlePlayerTakeDamage(this.bossPhase3 ? 3 : (this.bossPhase2 ? 2 : 1), this.enemigo?.x, false);
            });
        });
    }

    // Fase 2 — 50% HP: enojo, diálogo, pequeña curación, más agresivo
    triggerBossPhase2() {
        this.bossPhase2 = true;
        this.bossInvulnerable = true;
        const { width, height } = this.scale;

        if (this.enemigo?.active) {
            this.enemigo.setVelocity(0, 0);
            this.tweens.add({ targets: this.enemigo, x: width - 140, duration: 350, ease: 'Power2' });
        }

        this.cameras.main.shake(350, 0.016);
        const flash = this.add.rectangle(width / 2, height / 2, width, height, 0xff0000).setDepth(250).setAlpha(0.4);
        this.tweens.add({ targets: flash, alpha: 0, duration: 500, onComplete: () => flash.destroy() });

        const rage = this.add.text(width / 2, height / 2 - 80, this.t('RAGE MODE!', '¡MODO RABIA!'), {
            fontSize: '56px', color: '#ff3300', stroke: '#000000', strokeThickness: 8
        }).setOrigin(0.5).setDepth(300).setAlpha(0);
        this.tweens.add({ targets: rage, alpha: 1, duration: 300, hold: 700, yoyo: true, onComplete: () => rage.destroy() });

        this.showDialogue([
            {
                speaker: 'The Guardian', color: '#ff4400',
                text: '"You\'ve done well... but you\'ve only scratched the surface of my power!"',
                translation: '¡Lo has hecho bien... pero solo has arañado la superficie de mi poder!'
            },
            {
                speaker: 'The Guardian', color: '#ff4400',
                text: '"Allow me to show you what I am TRULY capable of!"',
                translation: '¡Permíteme mostrarte de lo que soy VERDADERAMENTE capaz!'
            },
        ], () => {
            if (!this.enemigo?.active) return;
            const heal = Math.floor(this.enemigo.maxHp * 0.35);
            this.enemigo.hp = Math.min(this.enemigo.maxHp, this.enemigo.hp + heal);
            this.updateEnemigoHpBar();

            const greenFlash = this.add.rectangle(width / 2, height / 2, width, height, 0x00ff88).setDepth(250).setAlpha(0.25);
            this.tweens.add({ targets: greenFlash, alpha: 0, duration: 500, onComplete: () => greenFlash.destroy() });

            this.enemigo.setTint(0xff8888);
            this.bossInvulnerable = false;
        });
    }

    // Fase 3 — 30% HP: UNLEASHED, diálogo, vida completa, boss crece, máxima agresividad
    triggerBossPhase3() {
        this.bossPhase3 = true;
        this.bossInvulnerable = true;

        if (this.enemigo?.active) {
            this.enemigo.setVelocity(0, 0);
            this.tweens.add({ targets: this.enemigo, x: this.scale.width - 140, duration: 350, ease: 'Power2' });
        }

        this.cameras.main.shake(500, 0.025);

        this.showDialogue([
            {
                speaker: 'The Guardian', color: '#ff0000',
                text: '"THIS... IS NOT OVER! I will not fall — not here, not now!"',
                translation: '¡Esto... NO HA TERMINADO! ¡No caeré — no aquí, no ahora!'
            },
            {
                speaker: 'The Guardian', color: '#ff0000',
                text: '"Witness my TRUE power. This is the end for you!"',
                translation: '¡Sé testigo de mi VERDADERO poder. ¡Este es tu fin!'
            },
        ], () => {
            if (!this.enemigo?.active) return;

            this.enemigo.hp = this.enemigo.maxHp;
            this.updateEnemigoHpBar();

            const { width, height } = this.scale;
            const flashSeq = (color, alpha, delay) => {
                this.time.delayedCall(delay, () => {
                    const f = this.add.rectangle(width / 2, height / 2, width, height, color).setDepth(255).setAlpha(alpha);
                    this.tweens.add({ targets: f, alpha: 0, duration: 280, onComplete: () => f.destroy() });
                });
            };
            flashSeq(0xffffff, 0.8, 0);
            flashSeq(0xff2200, 0.7, 300);
            flashSeq(0xffffff, 0.6, 580);
            flashSeq(0xff0000, 0.5, 850);

            this.spawnHitBurst(this.enemigo.x, this.enemigo.y - 200, [0xff0000, 0xff4400, 0xffcc00, 0xffffff]);
            this.spawnHitBurst(this.enemigo.x - 80, this.enemigo.y - 120, [0xff2200, 0xffffff, 0xff8800]);
            this.spawnHitBurst(this.enemigo.x + 80, this.enemigo.y - 120, [0xff2200, 0xffffff, 0xff8800]);

            const unleashed = this.add.text(width / 2, height / 2 - 80, this.t('— UNLEASHED —', '— DESATADO —'), {
                fontSize: '58px', color: '#ff0000', stroke: '#000000', strokeThickness: 10
            }).setOrigin(0.5).setDepth(300).setAlpha(0);
            this.tweens.add({ targets: unleashed, alpha: 1, duration: 250, hold: 1000, yoyo: true, onComplete: () => unleashed.destroy() });

            this.tweens.add({
                targets: this.enemigo, scaleX: 9, scaleY: 9, duration: 400, ease: 'Back.Out',
                onComplete: () => {
                    // Fijar el body para que no lo empuje el world bounds al crecer
                    if (this.enemigo?.body) this.enemigo.body.setSize(52, 52);
                }
            });
            this.enemigo.setTint(0xff0000);
            this.cameras.main.shake(700, 0.03);

            this.time.delayedCall(400, () => { this.bossInvulnerable = false; });
        });
    }

    startBossCharge(directionX) {
        if (!this.enemigo?.active) return;
        this.enemigo.isCharging = true;
        this.enemigo.lastChargeTime = this.time.now;
        this.enemigo.setVelocityX(0); this.enemigo.anims.stop();

        this.enemigo.setTint(0xffffff); this.cameras.main.shake(100, 0.008);
        this.time.delayedCall(150, () => { if (this.enemigo?.active) this.enemigo.setTint(0xff8888); });
        this.time.delayedCall(280, () => { if (this.enemigo?.active) this.enemigo.setTint(0xffffff); });

        this.time.delayedCall(350, () => {
            if (!this.enemigo?.active || !this.enemigo.isCharging) return;
            this.enemigo.setVelocityX((directionX > 0 ? 1 : -1) * (this.bossPhase3 ? 950 : 720));
            this.enemigo.setFlipX(directionX < 0);
            if (this.enemigoAttackHitbox?.body) this.enemigoAttackHitbox.body.enable = true;
        });

        this.time.delayedCall(850, () => {
            if (!this.enemigo?.active) return;
            this.enemigo.isCharging = false; this.enemigo.setVelocityX(0);
            if (this.enemigoAttackHitbox?.body) this.enemigoAttackHitbox.body.enable = false;
            if (this.enemigo.active) this.enemigo.setTint(0xff8888);
            this.cameras.main.shake(200, 0.012);
        });
    }

    updateEnemigoHpBar() {
        if (!this.enemigoHpBarFill || !this.enemigo) return;
        this.enemigoHpBarFill.width = 600 * Math.max(0, this.enemigo.hp / this.enemigo.maxHp);
    }

    afterRoomCleared() {
        this.showDialogue([
            {
                speaker: 'Knight', color: '#FFD700',
                text: '"It is over... The Guardian has fallen."',
                translation: 'Todo terminó... El Guardián ha caído.'
            },
            {
                speaker: 'Knight', color: '#FFD700',
                text: '"The kingdom of Eryndal can breathe again."',
                translation: 'El reino de Eryndal puede respirar de nuevo.'
            },
            {
                speaker: 'Knight', color: '#FFD700',
                text: '"This victory belongs to all who never lost hope."',
                translation: 'Esta victoria pertenece a todos los que nunca perdieron la esperanza.'
            },
        ], () => {
            const bm = this.sound.get('bossroomsound');
            if (bm) this.tweens.add({ targets: bm, volume: 0, duration: 1200, onComplete: () => bm.stop() });
            this.sound.play('WinAudio', { volume: 0.3 });
            this.showEndGame();
        });
    }

    showEndGame() {
        const { width, height } = this.scale;
        this.add.text(width / 2, height / 2 - 60, this.t('YOU WIN!', '¡GANASTE!'), {
            fontSize: '72px', color: '#FFD700', stroke: '#000000', strokeThickness: 6
        }).setOrigin(0.5).setDepth(300);
        this.add.text(width / 2, height / 2 + 80, this.t('Press SPACE to play again', 'ESPACIO para volver a jugar'), {
            fontSize: '26px', color: '#ffffff', stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5).setDepth(300);
        this.gameOver = true;
    }

    updateScene() {
        // ── IA esqueletos (oleada 1) ──────────────────────────────────────────────────
        if (this.slime?.active && !this.slime.isDead) {
            this.slime.setDepth(this.slime.y);
            const dx = this.player.x - this.slime.x;
            if (this.slimeHpBarBg) { this.slimeHpBarBg.setPosition(this.slime.x - 70, this.slime.y - 160); this.slimeHpBarFill.setPosition(this.slime.x - 70, this.slime.y - 160); }
            if (this.slimeAttackHitbox?.body) this.slimeAttackHitbox.body.reset(this.slime.x + (this.slime.flipX ? -80 : 80), this.slime.y - 60);
            if (this.slime.isAttacking) { this.slime.setVelocityX(0); }
            else if (Math.abs(dx) > 180) { this.slime.setVelocityX(dx > 0 ? 70 : -70); this.slime.setFlipX(dx < 0); this.slime.play('skeleton_walk_anim', true); }
            else {
                this.slime.setVelocityX(0);
                if (this.slime.anims.currentAnim?.key === 'skeleton_walk_anim') this.slime.play('skeleton_idle_anim', true);
                const t = this.time.now;
                if (t - this.slime.lastAttackTime > 2200) { this.slime.isAttacking = true; this.slime.lastAttackTime = t; this.slime.play('skeleton_attack_anim', true); this.time.delayedCall(350, () => { if (this.slime?.isAttacking && this.slimeAttackHitbox?.body) this.slimeAttackHitbox.body.enable = true; }); this.slime.setFlipX(dx < 0); }
            }
            this.slime.setVelocityY(0);
        }

        if (this.slime2?.active && !this.slime2.isDead) {
            this.slime2.setDepth(this.slime2.y);
            const dx2 = this.player.x - this.slime2.x;
            if (this.slimeHpBarBg2) { this.slimeHpBarBg2.setPosition(this.slime2.x - 70, this.slime2.y - 160); this.slimeHpBarFill2.setPosition(this.slime2.x - 70, this.slime2.y - 160); }
            if (this.slimeAttackHitbox2?.body) this.slimeAttackHitbox2.body.reset(this.slime2.x + (this.slime2.flipX ? -80 : 80), this.slime2.y - 60);
            if (this.slime2.isAttacking) { this.slime2.setVelocityX(0); }
            else if (Math.abs(dx2) > 180) { this.slime2.setVelocityX(dx2 > 0 ? 70 : -70); this.slime2.setFlipX(dx2 < 0); this.slime2.play('skeleton_walk_anim', true); }
            else {
                this.slime2.setVelocityX(0);
                if (this.slime2.anims.currentAnim?.key === 'skeleton_walk_anim') this.slime2.play('skeleton_idle_anim', true);
                const t2 = this.time.now;
                if (t2 - this.slime2.lastAttackTime > 2200) { this.slime2.isAttacking = true; this.slime2.lastAttackTime = t2; this.slime2.play('skeleton_attack_anim', true); this.time.delayedCall(350, () => { if (this.slime2?.isAttacking && this.slimeAttackHitbox2?.body) this.slimeAttackHitbox2.body.enable = true; }); this.slime2.setFlipX(dx2 < 0); }
            }
            this.slime2.setVelocityY(0);
        }

        // ── IA esqueletos (oleada 2) ──────────────────────────────────────────────────
        for (const [sk, hb, bg, fill] of [
            [this.skele, this.skeleAttackHitbox, this.skeleHpBarBg, this.skeleHpBarFill],
            [this.skele2, this.skeleAttackHitbox2, this.skeleHpBarBg2, this.skeleHpBarFill2]
        ]) {
            if (!sk?.active || sk.isDead) continue;
            sk.setDepth(sk.y);
            const dxs = this.player.x - sk.x;
            if (bg) { bg.setPosition(sk.x - 70, sk.y - 160); fill.setPosition(sk.x - 70, sk.y - 160); }
            if (hb?.body) hb.body.reset(sk.x + (sk.flipX ? -80 : 80), sk.y - 60);
            if (sk.isAttacking) { sk.setVelocityX(0); }
            else if (Math.abs(dxs) > 180) { sk.setVelocityX(dxs > 0 ? 80 : -80); sk.setFlipX(dxs < 0); sk.play('skeleton_walk_anim', true); }
            else {
                sk.setVelocityX(0);
                if (sk.anims.currentAnim?.key === 'skeleton_walk_anim') sk.play('skeleton_idle_anim', true);
                const ts = this.time.now;
                if (ts - sk.lastAttackTime > 1800) { sk.isAttacking = true; sk.lastAttackTime = ts; sk.play('skeleton_attack_anim', true); this.time.delayedCall(350, () => { if (sk?.isAttacking && hb?.body) hb.body.enable = true; }); sk.setFlipX(dxs < 0); }
            }
            sk.setVelocityY(0);
        }

        // ── IA boss (oleada 3) ────────────────────────────────────────────────────────
        if (!this.enemigo?.active || !this.bossSpawned) return;
        if (this.bossInvulnerable) { this.enemigo.setVelocityX(0); return; }

        this.enemigo.setDepth(this.enemigo.y);
        const distanciaX = this.player.x - this.enemigo.x;
        const velocidad = this.bossPhase3 ? 230 : (this.bossPhase2 ? 155 : 110);
        const cooldown  = this.bossPhase3 ? 420 : (this.bossPhase2 ? 1200 : 1500);

        if ((this.bossPhase2 || this.bossPhase3) && !this.enemigo.isCharging && !this.enemigo.isAttacking && !this.bossInvulnerable) {
            const chargeCooldown = this.bossPhase3 ? 2200 : 4000;
            if (Math.abs(distanciaX) > 380 && this.time.now - this.enemigo.lastChargeTime > chargeCooldown) {
                this.startBossCharge(distanciaX); return;
            }
        }

        if (this.enemigo.isCharging) return;

        const attackRange = this.bossPhase3 ? 220 : 140;
        const hitOffX = this.bossPhase3 ? 145 : 95;

        const hitOffsetX = this.enemigo.flipX ? -hitOffX : hitOffX;
        this.enemigoAttackHitbox.body.reset(this.enemigo.x + hitOffsetX, this.enemigo.y);

        if (this.enemigo.isAttacking) {
            this.enemigo.setVelocityX(0);
        } else if (Math.abs(distanciaX) > attackRange) {
            this.enemigo.setVelocityX(distanciaX > 0 ? velocidad : -velocidad);
            this.enemigo.setFlipX(distanciaX < 0);
            this.enemigo.play('enemigo_walk_anim', true);
        } else {
            this.enemigo.setVelocityX(0);
            const tiempoActual = this.time.now;
            if (tiempoActual - this.enemigo.lastAttackTime > cooldown) {
                this.enemigo.isAttacking = true; this.enemigo.lastAttackTime = tiempoActual;
                this.enemigo.setTexture('enemigo_attack'); this.enemigo.play('enemigo_attack_anim', true);
                this.time.delayedCall(400, () => { if (this.enemigo?.isAttacking && this.enemigoAttackHitbox?.body) this.enemigoAttackHitbox.body.enable = true; }); this.enemigo.setFlipX(distanciaX < 0);
            } else if (this.enemigo.anims.currentAnim?.key !== 'enemigo_attack_anim') {
                this.enemigo.anims.stop();
            }
        }
        this.enemigo.setVelocityY(0);
    }
}
