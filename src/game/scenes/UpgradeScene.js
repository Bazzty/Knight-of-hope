import Phaser from 'phaser';
import { useGameStore } from '../../stores/gameState';

// Definición de las 3 mejoras disponibles.
const UPGRADE_DEFS = [
    { key: 'upgrade-health', type: 'health' },
    { key: 'upgrade-attack', type: 'attack' },
    { key: 'upgrade-speed', type: 'speed' },
];

// UpgradeScene se lanza como overlay encima de la escena activa al limpiar una sala.
// La escena que la invoca se pausa; al elegir una carta se reanuda.
export default class UpgradeScene extends Phaser.Scene {
    constructor() {
        super('UpgradeScene');
    }

    // init() recibe los datos pasados en scene.launch({ callerScene: '...' }).
    init(data) {
        this.callerSceneKey = data.callerScene;
        this.cards = [];
        this.canSelect = false;
    }

    // Carga las imágenes de las cartas solo si no están ya en el cache.
    preload() {
        UPGRADE_DEFS.forEach(({ key }) => {
            if (!this.textures.exists(key)) {
                this.load.image(key, `assets/${key}.png`);
            }
        });
    }

    create() {
        const { width, height } = this.scale;

        // Fondo semitransparente negro que aparece con fade-in.
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000)
            .setAlpha(0)
            .setDepth(0);
        this.tweens.add({ targets: overlay, alpha: 0.78, duration: 350 });

        // Título con fade-in.
        const title = this.add.text(width / 2, 85, 'CHOOSE AN UPGRADE', {
            fontSize: '34px',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 6,
        }).setOrigin(0.5).setDepth(2).setAlpha(0);
        this.tweens.add({ targets: title, alpha: 1, duration: 400, delay: 150 });

        // Cartas: se deslizan hacia arriba desde fuera de pantalla, con stagger.
        const cardY = height / 2 + 50;
        const spacingX = 340;
        const startX = width / 2 - spacingX;

        UPGRADE_DEFS.forEach(({ key, type }, i) => {
            const x = startX + i * spacingX;
            const card = this.add.image(x, height + 300, key)
                .setScale(0.85)
                .setDepth(2);

            this.cards.push({ image: card, type, baseY: cardY });

            this.tweens.add({
                targets: card,
                y: cardY,
                duration: 520,
                ease: 'Back.easeOut',
                delay: 200 + i * 160,
                onComplete: () => {
                    // Habilitar interacción solo cuando la última carta termina de entrar.
                    if (i === UPGRADE_DEFS.length - 1) {
                        this.canSelect = true;
                        this.enableInteraction();
                    }
                }
            });
        });
    }

    // Adjunta eventos de hover y click a cada carta.
    enableInteraction() {
        this.cards.forEach(({ image, type, baseY }) => {
            image.setInteractive({ useHandCursor: true });

            image.on('pointerover', () => {
                this.tweens.killTweensOf(image);
                this.tweens.add({
                    targets: image,
                    scaleX: 1.0,
                    scaleY: 1.0,
                    y: baseY - 18,
                    duration: 140,
                    ease: 'Power2'
                });
            });

            image.on('pointerout', () => {
                this.tweens.killTweensOf(image);
                this.tweens.add({
                    targets: image,
                    scaleX: 0.85,
                    scaleY: 0.85,
                    y: baseY,
                    duration: 140,
                    ease: 'Power2'
                });
            });

            image.on('pointerdown', () => {
                if (!this.canSelect) return;
                this.selectUpgrade(type);
            });
        });
    }

    // Aplica la mejora elegida y cierra la escena con animación de salida.
    selectUpgrade(type) {
        this.canSelect = false;
        this.cards.forEach(({ image }) => image.disableInteractive());

        useGameStore().applyUpgrade(type);

        // Cartas salen volando hacia arriba con stagger.
        this.cards.forEach(({ image }, i) => {
            this.tweens.add({
                targets: image,
                y: -400,
                duration: 380,
                ease: 'Back.easeIn',
                delay: i * 70,
                onComplete: i === this.cards.length - 1 ? () => this.closeScene() : undefined
            });
        });
    }

    // Emite evento a la escena llamante y la reanuda.
    closeScene() {
        const caller = this.scene.get(this.callerSceneKey);
        if (caller) caller.events.emit('upgrade-chosen');
        this.scene.stop();
        this.scene.resume(this.callerSceneKey);
    }
}
