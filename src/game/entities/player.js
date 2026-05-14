export default function createPlayer(scene, x, y) {
    const key = scene.textures.exists('knight') ? 'knight' : 'knight-placeholder';
    const player = scene.physics.add.sprite(x, y, key, '0');
    player.setDisplaySize(96, 104);
    if (player.body) {
        player.body.setSize(player.displayWidth, player.displayHeight, true);
    }
    player.setCollideWorldBounds(true);
    player.speed = 180;

    player.updateMovement = (input) => {
        const body = player.body;
        if (!body) return;
        body.setVelocity(0, 0);
        let isMoving = false;

        if (input.left) {
            body.setVelocityX(-player.speed);
            player.setFlipX(true);
            isMoving = true;
        } else if (input.right) {
            body.setVelocityX(player.speed);
            player.setFlipX(false);
            isMoving = true;
        }

        if (input.up) {
            body.setVelocityY(-player.speed);
            isMoving = true;
        } else if (input.down) {
            body.setVelocityY(player.speed);
            isMoving = true;
        }

        if (body.velocity.x !== 0 && body.velocity.y !== 0) {
            body.velocity.normalize().scale(player.speed);
        }

        if (isMoving) {
            player.anims.play('knight-walk', true);
        } else {
            player.anims.stop();
            player.setFrame('0');
        }
    };

    return player;
}
