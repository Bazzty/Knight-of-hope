import Phaser from 'phaser';

export default class IntroScene extends Phaser.Scene {
    constructor() {
        super('IntroScene');
    }

    create() {
        const { width, height } = this.scale;

        this.add.rectangle(width / 2, height / 2, width, height, 0x000000);
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        const mainStyle = {
            fontSize: '24px',
            color: '#aaaaaa',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center',
            wordWrap: { width: 860 }
        };

        const transStyle = {
            fontSize: '14px',
            color: '#666666',
            fontStyle: 'italic',
            align: 'center',
            wordWrap: { width: 860 }
        };

        const paragraphs = [
            {
                text: 'The kingdom of Eryndal has fallen into darkness...',
                translation: 'El reino de Eryndal ha caído en la oscuridad...',
                y: height * 0.24, delay: 1200
            },
            {
                text: 'Terrifying monsters have overrun the dungeons\nbeneath the castle.',
                translation: 'Monstruos aterradores han invadido las mazmorras bajo el castillo.',
                y: height * 0.42, delay: 3200
            },
            {
                text: 'One knight steps into the shadows.\nThe last hope of the kingdom.',
                translation: 'Un caballero se adentra en las sombras.\nLa última esperanza del reino.',
                y: height * 0.60, delay: 5600
            },
        ];

        paragraphs.forEach(({ text, translation, y, delay }) => {
            const main = this.add.text(width / 2, y, text, mainStyle).setOrigin(0.5).setAlpha(0);
            const trans = this.add.text(width / 2, y + 44, translation, transStyle).setOrigin(0.5).setAlpha(0);
            this.time.delayedCall(delay, () => {
                this.tweens.add({ targets: main, alpha: 1, duration: 1200 });
                this.tweens.add({ targets: trans, alpha: 1, duration: 1200, delay: 400 });
            });
        });

        const title = this.add.text(width / 2, height * 0.84, 'KNIGHT OF HOPE', {
            fontSize: '52px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6,
        }).setOrigin(0.5).setAlpha(0);

        this.time.delayedCall(8000, () => {
            this.tweens.add({ targets: title, alpha: 1, duration: 1400 });
        });

        const prompt = this.add.text(width / 2, height - 28, 'Press SPACE to begin', {
            fontSize: '18px',
            color: '#666666',
        }).setOrigin(0.5).setAlpha(0);

        this.time.delayedCall(9800, () => {
            this.tweens.add({ targets: prompt, alpha: 1, duration: 500, yoyo: true, repeat: -1 });
        });

        this.input.keyboard.on('keydown-SPACE', () => {
            this.input.keyboard.removeAllListeners();
            this.cameras.main.fadeOut(700, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('GameScene');
            });
        });
    }
}
