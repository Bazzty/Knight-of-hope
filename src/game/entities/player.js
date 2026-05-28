// Factory function que crea y configura el sprite del jugador con física, animaciones y combate.
// Recibe la escena de Phaser, y las coordenadas x/y donde aparece el jugador.
// config: { speed, damage, maxHp } — todos opcionales, usan defaults si no se pasan.
export default function createPlayer(scene, x, y, config = {}) {

    // Crea un sprite con física arcade en la posición indicada.
    // 'knight_walk' es la clave del spritesheet cargado en preload(), y 0 es el frame inicial.
    const player = scene.physics.add.sprite(x, y, 'knight_walk', 0);

    // El origen (0.5, 1) significa: centro horizontal, base inferior.
    // Así player.y siempre representa los pies del personaje, útil para profundidad (setDepth).
    player.setOrigin(0.5, 1);

    // Escala visual del sprite. Los frames son 69x69 px, con scale 4.5 quedan ~310px en pantalla.
    player.setScale(4.5);

    // Define el tamaño del cuerpo físico (hitbox de colisión), en píxeles del texture original (sin escala).
    // 60x50 es más pequeño que el frame completo para que las colisiones se sientan justas.
    player.setBodySize(60, 50);

    // Desplaza el cuerpo físico respecto a la esquina superior izquierda del sprite.
    // Necesario para centrar bien el hitbox sobre el personaje visible.
    player.setOffset(24, 33);

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
        // Si ya está en iframes o ya murió, ignora el golpe.
        if (player.isInvincible || player.hp <= 0) return false;

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

        // Desactiva la hitbox de ataque para que no siga haciendo daño.
        attackHitbox.body.enable = false;

        // Vuelve al spritesheet de caminar y pausa si no se está moviendo.
        player.setTexture('knight_walk');
        player.play('knight_walk_anim', true);

        if (!player.body || (player.body.velocity.x === 0 && player.body.velocity.y === 0)) {
            player.anims.pause();
        }
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
            // Durante el ataque el jugador no se puede mover.
            body.setVelocity(0, 0);
        } else {
            let vx = 0;

            if (input.left) {
                vx = -1;
                // setFlipX(true) espeja el sprite horizontalmente para mirar a la izquierda.
                player.setFlipX(true);
            } else if (input.right) {
                vx = 1;
                player.setFlipX(false);
            }

            // Multiplica la dirección (-1 o 1) por la velocidad para obtener px/seg.
            body.setVelocity(vx * player.speed, 0);

            if (vx !== 0) {
                // true = no reiniciar la animación si ya está reproduciéndose.
                player.play('knight_walk_anim', true);
            } else if (!player.anims.isPlaying || player.anims.currentAnim?.key !== 'knight_attack_anim') {
                // Si está quieto, pausa la animación en el primer frame (pose de reposo).
                player.play('knight_walk_anim', true);
                player.anims.pause();
            }
        }

        // Sincroniza la hitbox de ataque delante del jugador en cada frame.
        // Si mira a la izquierda (flipX), el offset es negativo; si mira a la derecha, positivo.
        // y - 200 aproxima la altura del arma (ajustar según el spritesheet).
        const hitOffsetX = player.flipX ? -150 : 150;
        attackHitbox.body.reset(player.x + hitOffsetX, player.y - 200);
    };

    return player;
}
