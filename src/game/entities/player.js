export default function createPlayer(scene, x, y) {
    const player = scene.physics.add.sprite(x, y, 'knight_walk', 0);

    player.setCollideWorldBounds(true);
    player.speed = 150;
    player.isAttacking = false;

    function resetToIdle() {
        player.isAttacking = false;
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
        player.play('knight_attack_anim', true);

        scene.time.delayedCall(800, () => {
            if (player.isAttacking) resetToIdle();
        });
    };

    player.updateMovement = (input) => { // Lógica de movimiento del jugador
        const body = player.body; // Accede al cuerpo del jugador para aplicar la física
        if (!body) return; // Asegura que el cuerpo del jugador esté disponible antes de intentar acceder a él

        if (player.isAttacking) {
            body.setVelocity(1, 1); // Reduce la velocidad al atacar para dar una sensación de peso
            return;
        }

        let vx = 0; // Velocidad horizontal inicializada en 0
        let vy = 0; // Velocidad vertical inicializada en 0

        if (input.left) {  //Logica de movimiento horizontal
            vx = -1;
            player.setFlipX(true);
        } else if (input.right) {
            vx = 1;
            player.setFlipX(false);
        }

        body.setVelocity(vx * player.speed, vy * player.speed); // Aplica la velocidad al cuerpo del jugador

        const isMoving = vx !== 0 || vy !== 0; 

        if (isMoving) { //
            player.play('knight_walk_anim', true);
        } else if (!player.anims.isPlaying || player.anims.currentAnim?.key !== 'knight_attack_anim') {
            player.play('knight_walk_anim', true);
            player.anims.pause();
        }
    };

    return player;
}
