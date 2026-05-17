export default function createPlayer(scene, x, y) {
    const player = scene.physics.add.sprite(x, y, 'knight_walk', 0);

    player.setScale(1);
    player.setCollideWorldBounds(true);
    player.speed = 180;

    player.isAttacking = false;

    // Cuando la animación de ataque termina, volver a la animación de caminar
    player.on('animationcomplete', (anim) => {
        if (anim.key === 'knight_attack_anim') {
            player.isAttacking = false;
            if (player.body && (player.body.velocity.x !== 0 || player.body.velocity.y !== 0)) {
                player.play('knight_walk_anim', true);
            } else {
                player.play('knight_walk_anim', true);
                player.anims.pause();
            }
        }
    });

    player.attack = () => {
        if (player.isAttacking) return;

        player.isAttacking = true;

        // DEJAMOS QUE PHASER MANEJE LA TEXTURA: .play() cambia el spritesheet automáticamente 
        // sin necesidad de setTexture previo, eliminando el parpadeo estilo PowerPoint.
        player.play('knight_attack_anim', true);

        // RESPALDO SEGURO: después del tiempo máximo esperado, resetear estado sin forzar texturas
        scene.time.delayedCall(800, () => {
            if (player.isAttacking) {
                player.isAttacking = false;
                if (player.body && (player.body.velocity.x !== 0 || player.body.velocity.y !== 0)) {
                    player.play('knight_walk_anim', true);
                } else {
                    player.play('knight_walk_anim', true);
                    player.anims.pause();
                }
            }
        });
    };

    player.updateMovement = (input) => {
        const body = player.body;
        if (!body) return;

        if (player.isAttacking) {
            body.setVelocity(0, 0);
            return;
        }

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
            player.play('knight_walk_anim', true);
        } else {
            // Solo detenido y no atacando: mostrar frame idle consistente sin cambiar textura
            if (!player.anims.isPlaying || player.anims.currentAnim.key !== 'knight_attack_anim') {
                player.play('knight_walk_anim', true);
                player.anims.pause();
            }
        }
    };

    return player;
}