export default function createPlayer(scene, x, y) {
    const key = scene.textures.exists('knight') ? 'knight' : 'knight-placeholder';
    const player = scene.physics.add.sprite(x, y, key);
    player.setDisplaySize(32, 48);
    if (player.body) {
        player.body.setSize(player.displayWidth, player.displayHeight, true);
    }
    player.setCollideWorldBounds(true);
    player.speed = 180;

    player.updateMovement = (input) => {
        const body = player.body;
        if (!body) return;
        body.setVelocity(0, 0);

        if (input.left) {
            body.setVelocityX(-player.speed);
            player.setFlipX(true);
        } else if (input.right) {
            body.setVelocityX(player.speed);
            player.setFlipX(false);
        }

        if (input.up) {
            body.setVelocityY(-player.speed);
        } else if (input.down) {
            body.setVelocityY(player.speed);
        }

        if (body.velocity.x !== 0 && body.velocity.y !== 0) {
            body.velocity.normalize().scale(player.speed);
        }
    };

    return player;
}
