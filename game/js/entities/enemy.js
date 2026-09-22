"use strict";

// ---------------------------------------------------------------------------
// Enemy. Simple AI: patrols between waypoints, and chases the player when
// they get close enough. Touching the player deals damage. Takes damage from
// the player's sword attack, flinches, and drops a gemstone when defeated.
// ---------------------------------------------------------------------------
class Enemy extends Entity {
    constructor(x, y, waypoints, color) {
        const S = CFG.SPRITE_SCALE;
        const w = 26 * S;
        const h = 20 * S;

        super(x, y, w, h);
        this.sprite = Placeholders.Enemy(color || "#c94f6d");
        this.waypoints = (waypoints || []).map(p => ({ x: p.x, y: p.y }));
        this.wpIndex = 0;
        this.hp = 2;
        this.speed = 65;
        this.chaseSpeed = 115;
        this.chaseRadius = 290;
        this.rectCollider = () => MakeRect(this.x + 4 * S, this.y + 6 * S, 18 * S, 14 * S);
        this.hitFlash = 0;
        this.kbX = 0;
        this.kbY = 0;
        this.dead = false;
        this.dir = 1;
        this.scene = null;
    }

    rect() {
        return this.rectCollider();
    }

    setScene(scene) {
        this.scene = scene;
    }

    takeHit(damage, fromX, fromY) {
        if (this.dead) return;
        this.hp -= damage;
        this.hitFlash = 0.2;

        const dx = this.x - fromX;
        const dy = this.y - fromY;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        this.kbX = (dx / d) * 240;
        this.kbY = (dy / d) * 240;

        if (this.hp <= 0) {
            this.dead = true;
            GameState.enemiesKilled += 1;
            if (this.scene) {
                this.scene.spawnGem(this.x + this.w / 2, this.y + this.h / 2);
            }
        }
    }

    update(dt, player) {
        if (this.dead) return;
        if (Dialogue.isOpen() || GameState.paused) return;

        this.hitFlash = Math.max(0, this.hitFlash - dt);

        // Knockback decay
        this.kbX *= Math.pow(0.0001, dt);
        this.kbY *= Math.pow(0.0001, dt);

        const px = player.x + player.w / 2;
        const py = player.y + player.h / 2;
        const ex = this.x + this.w / 2;
        const ey = this.y + this.h / 2;

        const dist = Math.sqrt(DistSq(px, py, ex, ey));
        let vx = 0;
        let vy = 0;

        if (dist < this.chaseRadius + 40) {
            const nx = (px - ex) / (dist || 1);
            const ny = (py - ey) / (dist || 1);
            vx = nx * this.chaseSpeed;
            vy = ny * this.chaseSpeed;
        } else if (this.waypoints.length > 0) {
            const wp = this.waypoints[this.wpIndex];
            const wd = Math.sqrt(DistSq(ex, ey, wp.x, wp.y));
            if (wd < 30) {
                this.wpIndex = (this.wpIndex + 1) % this.waypoints.length;
            } else {
                vx = ((wp.x - ex) / wd) * this.speed;
                vy = ((wp.y - ey) / wd) * this.speed;
            }
        }

        if (vx < -2) this.dir = -1;
        if (vx > 2) this.dir = 1;

        const nextX = Clamp(this.x + (vx + this.kbX) * dt, 0, CFG.WORLD_W - this.w);
        const nextY = Clamp(this.y + (vy + this.kbY) * dt, 0, CFG.WORLD_H - this.h);
        const nextRect = MakeRect(nextX, nextY, this.w, this.h);
        const blockedByPortal = this.scene && this.scene.interactables.some((item) =>
            (item.type === "portal" || item.type === "enemyPortal") && IsColliding(nextRect, item.rect())
        );
        if (!blockedByPortal) {
            this.x = nextX;
            this.y = nextY;
        }

        // Contact damage
        if (IsColliding(this.rect(), player.rect()) && GameState.invuln <= 0) {
            player.takeDamage(1, this.x, this.y);
        }
    }

    draw(ctx) {
        ctx.save();
        if (this.dir < 0) {
            ctx.translate(this.x + this.w, this.y);
            ctx.scale(-1, 1);
            ctx.drawImage(this.sprite, 0, 0, this.w, this.h);
        } else {
            ctx.drawImage(this.sprite, this.x, this.y, this.w, this.h);
        }
        ctx.restore();

        if (this.hitFlash > 0) {
            ctx.globalAlpha = Math.min(1, this.hitFlash * 6);
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(this.x, this.y, this.w, this.h);
            ctx.globalAlpha = 1;
        }
    }
}