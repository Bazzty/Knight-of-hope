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
    player.setOffset(20, 10);

    // Impide que el jugador salga de los límites definidos con physics.world.setBounds().
    player.setCollideWorldBounds(true);

    // Velocidad de movimiento en píxeles por segundo. Puede venir del store (upgrade velocidad).
    player.speed = config.speed ?? 150;

    // Daño por ataque. Puede venir del store (upgrade ataque).
    player.damage = config.damage ?? 1;

    // Estado de ataque: mientras es true el jugador no puede moverse ni atacar de nuevo.
    player.isAttacking = false;

    // Sistema de vida del jugador. maxHp puede venir del store (upgrade salud).
    player.maxHp = config.maxHp ?? 10;
    player.hp = config.hp ?? config.maxHp ?? 10;

    // Bandera de invencibilidad: evita recibir daño múltiple en el mismo momento (iframes).
    player.isInvincible = false;

    // Bloqueo con escudo — mientras es true, los golpes no hacen daño.
    player.isBlocking = false;

    // Evita que un solo ataque dañe al enemigo más de una vez por pulsación de SPACE.
    // Se resetea cuando la animación de ataque termina.
    player.attackHasHit = false;

    // ── HITBOX DE ATAQUE ──────────────────────────────────────────────────────────────
    // Rectángulo invisible que representa el área de daño del arma del jugador.
    // Usamos add.rectangle() para crear un objeto gráfico y luego le agregamos física.
    const attackHitbox = scene.add.rectangle(x, y, 120, 70);

    // physics.add.existing() añade un cuerpo físico dinámico al rectángulo.
    // Así Phaser puede detectar solapamiento (overlap) con otros objetos.
    scene.physics.add.existing(attackHitbox);

    // Desactivado por defecto; se activa solo mientras dure la animación de ataque.
    attackHitbox.body.enable = false;

    // Adjuntamos la hitbox al objeto player para accederla desde GameScene.
    player.attackHitbox = attackHitbox;

    // ── SISTEMA DE DAÑO ──────────────────────────────────────────────────────────────
    player.takeDamage = (amount) => {
        if (player.isInvincible || player.hp <= 0) return false;
        if (player.isBlocking) return false;

        // Math.max(0, ...) evita que la vida quede en negativo.
        player.hp = Math.max(0, player.hp - amount);

        if (player.hp <= 0) {
            return true;
        }

        // Activa invencibilidad temporal para evitar daño en cadena.
        player.isInvincible = true;

        // Efecto visual de parpadeo: alterna entre transparente y visible 4 veces (~1 segundo).
        // yoyo: true hace que vuelva al estado original automáticamente después de cada ciclo.
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

        return false;
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

    // Phaser emite el evento 'animationcomplete' cuando una animación sin loop termina.
    // Lo usamos para detectar cuándo terminó el ataque y volver al estado idle.
    player.on('animationcomplete', (anim) => {
        if (anim.key === 'knight_attack_anim') {
            resetToIdle();
        }
    });

    // ── ATAQUE ────────────────────────────────────────────────────────────────────────
    player.attack = () => {
        // Si ya está atacando, no hace nada (evita spam de ataques).
        if (player.isAttacking) return;

        player.isAttacking = true;

        // Activa la hitbox para que pueda golpear al enemigo.
        attackHitbox.body.enable = true;

        // Cambia al spritesheet de ataque y reproduce la animación una sola vez (repeat: 0).
        player.setTexture('knight_attack');
        player.play('knight_attack_anim', true);
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

            body.setVelocity(vx * player.speed, 0);

            if (vx !== 0) {
                if (player.anims.currentAnim?.key !== 'knight_walk_anim') {
                    player.setTexture('knight_walk');
                    player.play('knight_walk_anim', true);
                }
            } else if (player.anims.currentAnim?.key !== 'knight_idle_anim') {
                player.setTexture('knight_idle');
                player.play('knight_idle_anim', true);
            }
        }

        const hitOffsetX = player.flipX ? -170 : 170;
        attackHitbox.body.reset(player.x + hitOffsetX, player.y - 170);
    };

    return player;
}
