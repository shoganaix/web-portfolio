"use strict";

// ---------------------------------------------------------------------------
// Player. Fixed vs the old version:
//   * Diagonal movement is normalized (no more running faster sideways).
//   * Collisions are resolved per-axis — no infinite while-loop possible.
//   * Animation only advances while moving/attacking.
//   * New: sword attack, damage + i-frames, knockback, respawn.
// ---------------------------------------------------------------------------
class Player extends Entity {
    constructor(world) {
        super(0, 0, CFG.PLAYER_W, CFG.PLAYER_H);
        this.world = world;

        this.spawnX = 1180;
        // Slight north of the sign so the player's feet do not start inside
        // the sign's collision box (that would block walking right).
        this.spawnY = 1180;

        this.sprite = LoadImage("img/spritesheet.png");
        this.sideSprite = LoadImage("img/sidewalk.png");
        this.collW = 60;
        this.collH = 44;
        this.offX = (this.w - this.collW) / 2;

        this.speed = CFG.PLAYER_SPEED;
        this.facing = { x: 0, y: 1 };
        this.moving = false;

        this.attacking = 0;
        this.attackCd = 0;
        this.kbX = 0;
        this.kbY = 0;

        // Small cooldown after interacting so a quick second E does not
        // instantly re-open the same prop.
        this.interactCd = 0;
        this.healTimer = 0;

        this.animTimer = 0;
        this.animFrame = 0;

        this.x = this.spawnX;
        this.y = this.spawnY;
    }

    rect() {
        return MakeRect(this.x + this.offX, this.y + this.h - this.collH, this.collW, this.collH);
    }

    reset() {
        this.x = this.spawnX;
        this.y = this.spawnY;
        this.kbX = 0;
        this.kbY = 0;
        this.attacking = 0;
        this.attackCd = 0;
    }

    takeDamage(dmg, srcX, srcY) {
        if (GameState.invuln > 0 || Dialogue.isOpen() || GameState.hearts <= 0) return;

        GameState.hearts = Math.max(0, GameState.hearts - dmg);
        GameState.invuln = CFG.PLAYER_IFRAMES;

        const dx = this.x - srcX;
        const dy = this.y - srcY;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        this.kbX = (dx / d) * 320;
        this.kbY = (dy / d) * 320;

        if (this.world && this.world.camera) {
            this.world.camera.addShake(0.35);
        }
    }

    update(dt, world) {
        this.animTimer += dt;
        this.attacking = Math.max(0, this.attacking - dt);
        this.attackCd = Math.max(0, this.attackCd - dt);
        this.interactCd = Math.max(0, this.interactCd - dt);
        GameState.invuln = Math.max(0, GameState.invuln - dt);
        if (GameState.hearts > 0 && GameState.hearts < GameState.maxHearts) {
            this.healTimer += dt;
            if (this.healTimer >= CFG.HEALTH_REGEN_INTERVAL) {
                GameState.hearts = Math.min(GameState.maxHearts, GameState.hearts + 1);
                this.healTimer = 0;
            }
        } else {
            this.healTimer = 0;
        }
        this.kbX *= Math.pow(0.0001, dt);
        this.kbY *= Math.pow(0.0001, dt);

        let chestOpening = false;
        for (let i = 0; i < world.interactables.length; i++) {
            if ((world.interactables[i].type === "chest" || world.interactables[i].type === "rewardChest") && world.interactables[i].opening) {
                chestOpening = true;
                break;
            }
        }

        if (Dialogue.isOpen() || GameState.paused || chestOpening) {
            this.moving = false;
            return;
        }

        // ----- 1. Movement input (normalized) -----
        let hDir = 0;
        let vDir = 0;
        if (Input.Held(KEY.D) || Input.Held(KEY.RIGHT)) hDir += 1;
        if (Input.Held(KEY.A) || Input.Held(KEY.LEFT)) hDir -= 1;
        if (Input.Held(KEY.S) || Input.Held(KEY.DOWN)) vDir += 1;
        if (Input.Held(KEY.W) || Input.Held(KEY.UP)) vDir -= 1;

        this.moving = (hDir !== 0 || vDir !== 0);

        if (this.moving) {
            const len = Math.sqrt(hDir * hDir + vDir * vDir) || 1;
            hDir /= len;
            vDir /= len;

            // Keep the animation direction cardinal. Vertical input takes
            // priority during diagonals so the side sheet cannot leak into
            // front/back movement when the previous input was horizontal.
            if (vDir !== 0) {
                this.facing.x = 0;
                this.facing.y = vDir;
            } else {
                this.facing.x = hDir;
                this.facing.y = 0;
            }

            const moveSpeed = Input.Held(KEY.SHIFT) ? this.speed * 2 : this.speed;
            const dispX = (hDir * moveSpeed + this.kbX) * dt;
            const dispY = (vDir * moveSpeed + this.kbY) * dt;
            this._moveAxis(dispX, dispY, world.solids);
        } else {
            this._moveAxis(this.kbX * dt, this.kbY * dt, world.solids);
        }

        // ----- 2. Interact -----
        if (Input.Pressed(KEY.E) && this.interactCd <= 0) {
            this._tryInteract(world);
        }

        // ----- 3. Attack -----
        if (Input.Pressed(KEY.SPACE) && !GameState.paused && world.projectiles.length < 3) {
            const targetX = world.camera.x + Input.mouse.x;
            const targetY = world.camera.y + Input.mouse.y;
            const startX = this.x + this.w / 2;
            const startY = this.y + this.h / 2;
            const spreadAngles = [-0.12, 0, 0.12];
            const spreadAngle = spreadAngles[world.projectiles.length];
            world.spawnProjectile(startX, startY, targetX, targetY, spreadAngle);
        }
    }

    // ---- Collision resolution, one axis at a time. ----
    _moveAxis(dispX, dispY, solids) {
        this.x += dispX;
        for (let i = 0; i < solids.length; i++) {
            const r = solids[i].rect();
            if (IsColliding(this.rect(), r)) {
                if (dispX > 0) this.x = r.x - this.offX - this.collW;
                else if (dispX < 0) this.x = r.x + r.width - this.offX;
            }
        }
        this._clampToWorld();

        this.y += dispY;
        for (let i = 0; i < solids.length; i++) {
            const r = solids[i].rect();
            if (IsColliding(this.rect(), r)) {
                if (dispY > 0) this.y = r.y - this.h + this.collH;
                else if (dispY < 0) this.y = r.y + r.height - this.h + this.collH;
            }
        }
        this._clampToWorld();
    }

    _clampToWorld() {
        // Use the complete sprite bounds so neither its top nor its feet can
        // cross the world edge.
        this.x = Clamp(this.x, 0, Math.max(0, CFG.WORLD_W - this.w));
        this.y = Clamp(this.y, 0, Math.max(0, CFG.WORLD_H - this.h));
    }

    _tryInteract(world) {
        let best = null;
        let bestD = Infinity;

        const candidates = world.interactables.concat(world.npcs);
        for (let i = 0; i < candidates.length; i++) {
            const c = candidates[i];
            if (!IsInTrigger(this.rect(), c.rect())) continue;
            const cx = c.x + c.w / 2;
            const cy = c.y + c.h / 2;
            const d = DistSq(this.x + this.w / 2, this.y + this.h / 2, cx, cy);
            if (d < bestD) {
                bestD = d;
                best = c;
            }
        }
        if (best) {
            best.interact();
            this.interactCd = 0.35;
        }
    }

    // ---- Sword sweep: hitbox in front of the player. ----
    _swing(world) {
        const reach = 96;
        const size = 96;
        let hx = this.x + this.w / 2 - size / 2 + this.facing.x * reach;
        let hy = this.y + this.h / 2 - size / 2 + this.facing.y * reach;
        if (this.facing.y !== 0) hx = this.x + this.w / 2 - size / 2;
        const hitbox = MakeRect(hx, hy, size, size);

        for (let i = 0; i < world.enemies.length; i++) {
            const e = world.enemies[i];
            if (e.dead) continue;
            if (IsColliding(hitbox, e.rect())) {
                e.takeHit(1, this.x + this.w / 2, this.y + this.h / 2);
            }
        }
    }

    draw(ctx) {
        // Blink while invulnerable
        if (GameState.invuln > 0 && Math.floor(GameState.invuln * 12) % 2 === 0) {
            return;
        }

        const fw = 45;
        const fh = 64;

        let row = 0; // idle
        if (this.attacking > 0) {
            row = 5; // placeholder attack row
        } else if (this.moving) {
            if (this.facing.y < 0) row = 2;
            else if (this.facing.y > 0) row = 1;
            else if (this.facing.x > 0) row = 3;
            else if (this.facing.x < 0) row = 4;
        }

        // Keep idle animation alive: only the frame pacing changes between
        // movement and idle, instead of freezing the sprite on frame 0.
        // Animation speed depending on player state

        let animationInterval;

        if (!this.moving && this.attacking <= 0) {

            // IDLE — standing still
            animationInterval = 0.20;

        } else if (Input.Held(KEY.SHIFT)) {

            // SPRINT
            animationInterval = 0.07;

        } else {

            // WALK
            animationInterval = 0.20;

        }
        if (this.animTimer > animationInterval) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 4;
        }

        const scale = CFG.SPRITE_SCALE;

        // Side walking uses its own sheet (img/sidewalk.png, 4 frames of
        // 64x64) so left/right reads correctly, mirrored for the left.
        if (this.moving && this.facing.x !== 0 && this.attacking <= 0) {
            const cellW = 64, cellH = 64;
            const drawW = cellW * scale;
            const drawH = cellH * scale;
            const dx = this.x + (this.w - drawW) / 2;
            const dy = this.y;

            ctx.save();
            ctx.imageSmoothingEnabled = false;
            if (this.facing.x < 0) {
                ctx.translate(dx + drawW, dy);
                ctx.scale(-1, 1);
                ctx.drawImage(this.sideSprite, this.animFrame * cellW, 0, cellW, cellH, 0, 0, drawW, drawH);
            } else {
                ctx.drawImage(this.sideSprite, this.animFrame * cellW, 0, cellW, cellH, dx, dy, drawW, drawH);
            }
            ctx.restore();
            return;
        }

        ctx.save();
        if (this.facing.x < 0) {
            ctx.translate(this.x + this.w, this.y);
            ctx.scale(-1, 1);
        } else {
            ctx.translate(this.x, this.y);
        }
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
            this.sprite,
            this.animFrame * fw, row * fh, fw, fh,
            0, 0, this.w, this.h
        );
        ctx.restore();
    }
}