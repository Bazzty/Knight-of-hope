import Phaser from 'phaser';

// Registra frames centrados en cada llama y crea la animación.
// centers: array de coordenadas X del centro de cada llama en el spritesheet.
// halfW: mitad del ancho del frame (la llama queda centrada dentro).
export function setupFireFrames(scene, key, centers, halfW, fullH) {
    const tex = scene.textures.get(key);
    if (!tex.has('f0')) {
        centers.forEach((cx, i) => {
            tex.add(`f${i}`, 0, cx - halfW, 0, halfW * 2, fullH);
        });
    }
    const animKey = `${key}-anim`;
    if (!scene.anims.exists(animKey)) {
        scene.anims.create({
            key: animKey,
            frames: centers.map((_, i) => ({ key, frame: `f${i}` })),
            frameRate: 10,
            repeat: -1
        });
    }
}

// Spawna una antorcha animada en la posición indicada.
// startFrameOffset permite desfasar la animación entre antorchas de la misma sala.
export function spawnFireTorch(scene, x, y, key, scale, startFrameOffset = 0) {
    const animKey = `${key}-anim`;
    const fire = scene.add.sprite(x, y, key, 'f0')
        .setScale(scale)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(10)
        .play(animKey);
    if (startFrameOffset > 0) {
        const frames = fire.anims.currentAnim.frames;
        fire.anims.setCurrentFrame(frames[startFrameOffset % frames.length]);
    }
    return fire;
}
