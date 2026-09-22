"use strict";

class Projectile extends Entity {
    constructor(x, y, targetX, targetY, spreadAngle) {
        const size = 28;
        super(x - size / 2, y - size / 2, size, size);

        const dx = targetX - x;
        const dy = targetY - y;
        this.speed = 430;
        const angle = Math.atan2(dy, dx) + (spreadAngle || 0);
        this.spreadFactor = Math.round((spreadAngle || 0) / 0.12);
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
        this.life = 2.2;
        this.maxLife = this.life;
        this.damage = 1;
        this.dead = false;
        this.returning = false;
        this.hitEnemies = new Set();
        this.age = 0;
        this.wobblePhase = Math.random() * Math.PI * 2;
    }

    update(dt, scene) {
        if (this.dead || Dialogue.isOpen() || GameState.paused) return;

        this.age += dt;
        this.life -= dt;
        if (this.life <= 0) {
            this.dead = true;
            return;
        }

        if (this.life <= this.maxLife / 2) this.returning = true;
        const returning = this.returning;
        const homeTargetX = scene.player.x + scene.player.w / 2;
        const homeTargetY = scene.player.y + scene.player.h / 2;
        let targetX = returning
            ? homeTargetX
            : scene.camera.x + Input.mouse.x;
        let targetY = returning
            ? homeTargetY
            : scene.camera.y + Input.mouse.y;

        if (!returning && this.spreadFactor !== 0) {
            const playerX = scene.player.x + scene.player.w / 2;
            const playerY = scene.player.y + scene.player.h / 2;
            const aimAngle = Math.atan2(targetY - playerY, targetX - playerX);
            const laneOffset = this.spreadFactor * 110;
            targetX -= Math.sin(aimAngle) * laneOffset;
            targetY += Math.cos(aimAngle) * laneOffset;
        }

        const steerAngle = Math.atan2(targetY - (this.y + this.h / 2), targetX - (this.x + this.w / 2));
        const wobble = Math.sin(this.age * 8 + this.wobblePhase) * (returning ? 42 : 70);
        targetX -= Math.sin(steerAngle) * wobble;
        targetY += Math.cos(steerAngle) * wobble;
        const targetDx = targetX - (this.x + this.w / 2);
        const targetDy = targetY - (this.y + this.h / 2);
        const targetDistance = Math.sqrt(targetDx * targetDx + targetDy * targetDy) || 1;
        this.vx = (targetDx / targetDistance) * this.speed;
        this.vy = (targetDy / targetDistance) * this.speed;

        this.x += this.vx * dt;
        this.y += this.vy * dt;

        if (this.returning && DistSq(this.x + this.w / 2, this.y + this.h / 2, homeTargetX, homeTargetY) < 26 * 26) {
            this.dead = true;
            return;
        }

        if (this.x < 0 || this.y < 0 || this.x > CFG.WORLD_W || this.y > CFG.WORLD_H) {
            this.dead = true;
            return;
        }

        for (let i = 0; i < scene.enemies.length; i++) {
            const enemy = scene.enemies[i];
            if (enemy.dead || this.hitEnemies.has(enemy) || !IsColliding(this.rect(), enemy.rect())) continue;

            enemy.takeHit(this.damage, this.x, this.y);
            this.hitEnemies.add(enemy);
            this.returning = true;
            break;
        }
    }

    draw(ctx) {
        const centerX = this.x + this.w / 2;
        const centerY = this.y + this.h / 2;

        ctx.fillStyle = "#286bd1";
        ctx.fillRect(centerX - 11, centerY - 11, 22, 22);
        ctx.fillStyle = "#9ed8ff";
        ctx.fillRect(centerX - 5, centerY - 5, 10, 10);
    }
}
