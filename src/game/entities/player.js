export default function createPlayer(scene, x, y) {
    const player = scene.physics.add.sprite(x, y, 'knight_walk', 0);

    player.setOrigin(0.5, 1);

    // Scale for 69x69 sprites to make it larger
    player.setScale(4.5);
    // Adjusted hit box for the new sprites
    player.setBodySize(60, 55);
    player.setOffset(24, 33);

    player.setCollideWorldBounds(true);
    player.speed = 150;
    player.isAttacking = false;

    function resetToIdle() {
        player.isAttacking = false;
        player.setTexture('knight_walk');
        player.play('knight_walk_anim', true);

        if (!player.body || (player.body.velocity.x === 0 && player.body.velocity.y === 0)) {
            player.anims.pause();
        }
    }

    player.on('animationcomplete', (anim) => {
        if (anim.key === 'knight_attack_anim') {
            resetToIdle();
        }
    });

    player.attack = () => {
        if (player.isAttacking) return;

        player.isAttacking = true;
        player.setTexture('knight_attack');
        player.play('knight_attack_anim', true);
    };

    player.updateMovement = (input) => {
        const body = player.body;
        if (!body) return;

        if (player.isAttacking) {
            body.setVelocity(0, 0);
            return;
        }

        let vx = 0;

        if (input.left) {
            vx = -1;
            player.setFlipX(true);
        } else if (input.right) {
            vx = 1;
            player.setFlipX(false);
        }

        body.setVelocity(vx * player.speed, 0);

        if (vx !== 0) {
            player.play('knight_walk_anim', true);
        } else if (!player.anims.isPlaying || player.anims.currentAnim?.key !== 'knight_attack_anim') {
            player.play('knight_walk_anim', true);
            player.anims.pause();
        }
    };

    return player;
}