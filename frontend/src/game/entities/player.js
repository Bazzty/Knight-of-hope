// Factory function que crea y configura el sprite del jugador con física, animaciones y combate.
// Recibe la escena de Phaser, y las coordenadas x/y donde aparece el jugador.
// config: { speed, damage, maxHp } — todos opcionales, usan defaults si no se pasan.
export default function createPlayer(scene, x, y, config = {}) {

    // Crea un sprite con física arcade en la posición indicada.
    // 'knight_walk' es la clave del spritesheet cargado en preload(), y 0 es el frame inicial.
    const player = scene.physics.add.sprite(x, y, 'knight_idle', 0);

    // El origen (0.5, 1) significa: centro horizontal, base inferior.
    // Así player.y siempre representa los pies del personaje, útil para profundidad (setDepth).
    player.setOrigin(0.5, 1);

    // Escala visual del sprite. Los frames son 96x84 px, con scale 4.0 quedan ~384px de ancho en pantalla.
    player.setScale(5.0);

    // Hitbox ajustada al cuerpo visible del caballero dentro del frame 96x84.
    player.setBodySize(55, 70);
    player.setOffset(20, 14);

    // Impide que el jugador salga de los límites definidos con physics.world.setBounds().
    player.setCollideWorldBounds(true);
    player.setDragX(600);

    // Velocidad de movimiento en píxeles por segundo. Puede venir del store (upgrade velocidad).
    player.speed = config.speed ?? 150;

    // Daño por ataque. Puede venir del store (upgrade ataque).
    player.damage = config.damage ?? 1;

    player.isAttacking = false;
    player.attackCombo = 0;

    // Sistema de vida del jugador. maxHp puede venir del store (upgrade salud).
    player.maxHp = config.maxHp ?? 10;
    player.hp = config.hp ?? config.maxHp ?? 10;

    // Bandera de invencibilidad: evita recibir daño múltiple en el mismo momento (iframes).
    player.isInvincible = false;

    // Bloqueo con escudo — mientras es true, los golpes no hacen daño.
    player.isBlocking = false;
    player.blockKey = config.blockKey ?? null;

    // Evita que un solo ataque dañe al enemigo más de una vez por pulsación de SPACE.
    // Se resetea cuando la animación de ataque termina.
    player.attackHasHit = false;

    // ── HITBOX DE ATAQUE ──────────────────────────────────────────────────────────────
    // Rectángulo invisible que representa el área de daño del arma del jugador.
    // Usamos add.rectangle() para crear un objeto gráfico y luego le agregamos física.
    const attackHitbox = scene.add.rectangle(x, y, 110, 70);

    // physics.add.existing() añade un cuerpo físico dinámico al rectángulo.
    // Así Phaser puede detectar solapamiento (overlap) con otros objetos.
    scene.physics.add.existing(attackHitbox);

    // Desactivado por defecto; se activa solo mientras dure la animación de ataque.
    attackHitbox.body.enable = false;

    // Adjuntamos la hitbox al objeto player para accederla desde GameScene.
    player.attackHitbox = attackHitbox;

    // ── SISTEMA DE DAÑO ──────────────────────────────────────────────────────────────
    player.takeDamage = (amount) => {
        if (player.isInvincible || player.hp <= 0) return { died: false, tookDamage: false };
        if (player.isBlocking || player.blockKey?.isDown) return { died: false, tookDamage: false };

        // Math.max(0, ...) evita que la vida quede en negativo.
        player.hp = Math.max(0, player.hp - amount);

        if (player.hp <= 0) {
            return { died: true, tookDamage: true };
        }

        player.isInvincible = true;

        if (!player.isAttacking) {
            player.setTexture('knight_hurt');
            player.play('knight_hurt_anim', true);
            player.once('animationcomplete', (anim) => {
                if (anim.key !== 'knight_hurt_anim') return;
                if (!player.isAttacking) resetToIdle();
            });
        }

        scene.tweens.add({
            targets: player,
            alpha: 0,
            duration: 100,
            yoyo: true,
            repeat: 4,
            onComplete: () => {
                player.alpha = 1;
                player.isInvincible = false;
            }
        });

        return { died: false, tookDamage: true };
    };

    // ── ANIMACIÓN: VOLVER A IDLE ──────────────────────────────────────────────────────
    // Se llama al terminar la animación de ataque para restablecer el estado normal.
    function resetToIdle() {
        player.isAttacking = false;
        player.attackHasHit = false;
        attackHitbox.body.enable = false;
        player.setTexture('knight_idle');
        player.play('knight_idle_anim', true);
    }

    player.on('animationcomplete', (anim) => {
        if (anim.key === 'knight_attack1_anim' || anim.key === 'knight_attack2_anim' || anim.key === 'knight_attack3_anim') {
            resetToIdle();
        }
    });

    // ── ATAQUE ────────────────────────────────────────────────────────────────────────
    player.attack = () => {
        if (player.isAttacking) return;
        player.isAttacking = true;
        attackHitbox.body.enable = true;
        const combo = player.attackCombo % 3;
        player.attackCombo++;
        if (combo === 0) { player.setTexture('knight_attack1'); player.play('knight_attack1_anim', true); }
        else if (combo === 1) { player.setTexture('knight_attack2'); player.play('knight_attack2_anim', true); }
        else { player.setTexture('knight_attack3'); player.play('knight_attack3_anim', true); }
    };

    // ── MOVIMIENTO ────────────────────────────────────────────────────────────────────
    // Se llama cada frame desde GameScene.update() con el estado actual del teclado.
    player.updateMovement = (input) => {
        const body = player.body;
        if (!body) return;

        if (player.isAttacking) {
            player.isBlocking = false;
            body.setVelocity(0, 0);
        } else if (input.block) {
            player.isBlocking = true;
            body.setVelocity(0, 0);
            if (player.anims.currentAnim?.key !== 'knight_defend_anim') {
                player.setTexture('knight_defend');
                player.play('knight_defend_anim', true);
            }
        } else {
            player.isBlocking = false;
            let vx = 0;

            if (input.left) {
                vx = -1;
                player.setFlipX(true);
            } else if (input.right) {
                vx = 1;
                player.setFlipX(false);
            }

            const currentSpeed = (vx !== 0 && input.sprint) ? player.speed * 1.6 : player.speed;
            body.setVelocity(vx * currentSpeed, 0);

            if (vx !== 0) {
                if (input.sprint) {
                    if (player.anims.currentAnim?.key !== 'knight_run_anim') {
                        player.setTexture('knight_run');
                        player.play('knight_run_anim', true);
                    }
                } else if (player.anims.currentAnim?.key !== 'knight_walk_anim') {
                    player.setTexture('knight_walk');
                    player.play('knight_walk_anim', true);
                }
            } else if (player.anims.currentAnim?.key !== 'knight_idle_anim') {
                player.setTexture('knight_idle');
                player.play('knight_idle_anim', true);
            }
        }

        const hitOffsetX = player.flipX ? -130 : 130;
        attackHitbox.body.reset(player.x + hitOffsetX, player.y - 210);
    };

    return player;
}
