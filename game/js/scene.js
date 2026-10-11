"use strict";

// ---------------------------------------------------------------------------
// The world. Builds every object, wires the camera to the player and runs the
// update/render passes.
// ---------------------------------------------------------------------------
class Scene {
    constructor() {
        this.bg = null;
        this.camera = null;
        this.player = null;

        this.trees = [];
        this.interactables = [];
        this.npcs = [];
        this.enemies = [];
        this.projectiles = [];
        this.gems = [];
        this.solids = [];
        this.endlessSpawnTimer = 0;
        this.nextArtworkIndex = 0;
        this.waveStarted = false;
        this.waveSpawned = 0;
        this.waveDefeated = 0;
        this.waveComplete = false;
    }

    Start() {
        this.bg = WorldArt.create(CFG.WORLD_W, CFG.WORLD_H);
        this.camera = new Camera(CFG.VIEW_W, CFG.VIEW_H);

        this.player = new Player(this);
        this.camera.Follow(this.player);

        // ---- World layout (all coords in world pixels) ----
        this.trees.push(new WorldTree(1050, 450));
        this.trees.push(new WorldTree(1900, 320));
        this.trees.push(new WorldTree(200, 1500));
        this.trees.push(new WorldTree(3100, 1500));

        this.interactables.push(new Interactable(1650, 790, "chest"));
        this.interactables.push(new Interactable(1400, 1300, "sign"));
        this.interactables.push(new Interactable(513, 1287, "portal"));
        this.interactables.push(new Interactable(2450, 820, "enemyPortal"));
        this.interactables.push(new Interactable(1730, 1110, "bench"));
        this.interactables.forEach(item => { item.scene = this; });

        this.npcs.push(new NPC(1550, 1400, "Guide", "guide", Placeholders.Guide()));
        this.npcs.push(new NPC(3050, 620, "Sage", "sage", Placeholders.Sage(), [
            { x: 3050, y: 470 },
            { x: 3050, y: 820 },
        ]));
        this.npcs.push(new NPC(2100, 1450, "Prisoner", "prisoner", Placeholders.Prisoner()));

        this.enemies.push(new Enemy(2500, 500, [{ x: 2380, y: 440 }, { x: 2700, y: 620 }], "#c94f6d"));
        this.enemies.push(new Enemy(320, 520, [{ x: 240, y: 450 }, { x: 520, y: 650 }], "#9b59b6"));
        this.enemies.push(new Enemy(1960, 1450, [{ x: 1930, y: 1390 }, { x: 1980, y: 1510 }], "#c94f6d"));
        this.enemies.push(new Enemy(2100, 1310, [{ x: 2040, y: 1280 }, { x: 2160, y: 1340 }], "#9b59b6"));
        this.enemies.push(new Enemy(2240, 1450, [{ x: 2220, y: 1510 }, { x: 2270, y: 1390 }], "#c94f6d"));

        // One polaroid near the starting point, plus five around the valley.
        this.gems.push(new Gem(1370, 1160, "#4fd6c1", this.nextArtworkIndex++));
        this.gems.push(new Gem(1300, 920, "#4fd6c1", this.nextArtworkIndex++));
        this.gems.push(new Gem(1800, 1520, "#8bd24f", this.nextArtworkIndex++));
        this.gems.push(new Gem(2200, 720, "#4fa8d6", this.nextArtworkIndex++));
        this.gems.push(new Gem(2700, 1600, "#d6c14f", this.nextArtworkIndex++));
        this.gems.push(new Gem(3200, 1010, "#d68b4f", this.nextArtworkIndex++));

        this.enemies.forEach(e => e.setScene(this));
        this.solids = this.trees.concat(this.interactables);
    }

    spawnGem(x, y) {
        const position = this._findFreePosition(x, y, 22 * CFG.SPRITE_SCALE, 18 * CFG.SPRITE_SCALE, 32);
        if (!position) return;
        this.gems.push(new Gem(position.x, position.y, "#8bd24f", this.nextArtworkIndex++));
    }

    _findFreePosition(x, y, width, height, clearance = 16) {
        const candidate = (px, py) => {
            px = Clamp(px, clearance, CFG.WORLD_W - width - clearance);
            py = Clamp(py, clearance, CFG.WORLD_H - height - clearance);
            const bounds = MakeRect(px - clearance, py - clearance,
                width + clearance * 2, height + clearance * 2);
            return this.solids.some(solid => IsColliding(bounds, solid.rect()))
                ? null : { x: px, y: py };
        };
        const origin = candidate(x, y);
        if (origin) return origin;

        // Search outwards so drops stay close to the defeated enemy.
        const maxRadius = Math.hypot(CFG.WORLD_W, CFG.WORLD_H);
        for (let radius = 32; radius <= maxRadius; radius += 32) {
            const steps = Math.ceil(Math.PI * 2 * radius / 32);
            for (let step = 0; step < steps; step++) {
                const angle = step / steps * Math.PI * 2;
                const position = candidate(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
                if (position) return position;
            }
        }
        return null;
    }

    spawnProjectile(x, y, targetX, targetY, spreadAngle) {
        this.projectiles.push(new Projectile(x, y, targetX, targetY, spreadAngle));
    }

    respawn() {
        GameState.hearts = GameState.maxHearts;
        this.player.reset();
        if (this.camera) {
            this.camera.x = Clamp(this.player.x - this.camera.viewW / 2, 0, CFG.WORLD_W - this.camera.viewW);
            this.camera.y = Clamp(this.player.y - this.camera.viewH / 2, 0, CFG.WORLD_H - this.camera.viewH);
        }
        Dialogue.start("respawn", GameState);
    }

    Update(dt) {
        if (GameState.hearts <= 0 && !Dialogue.isOpen()) {
            this.respawn();
        }

        this.player.update(dt, this);

        for (let i = 0; i < this.npcs.length; i++) {
            this.npcs[i].update(dt, this.player);
        }
        for (let i = 0; i < this.enemies.length; i++) {
            this.enemies[i].update(dt, this.player);
        }
        this._updateEndlessEnemies(dt);
        for (let i = 0; i < this.projectiles.length; i++) {
            this.projectiles[i].update(dt, this);
        }
        for (let i = 0; i < this.interactables.length; i++) {
            this.interactables[i].update(dt, this.player);
        }

        // Collect gems on contact.
        for (let i = this.gems.length - 1; i >= 0; i--) {
            this.gems[i].collect(this.player);
            if (this.gems[i].dead) this.gems.splice(i, 1);
        }

        // Remove defeated enemies.
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            if (this.enemies[i].dead) {
                if (this.enemies[i].waveEnemy && !this.enemies[i].waveCounted) {
                    this.enemies[i].waveCounted = true;
                    this.waveDefeated += 1;
                }
                this.enemies.splice(i, 1);
            }
        }
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            if (this.projectiles[i].dead) this.projectiles.splice(i, 1);
        }

        this.camera.update(dt);
        Dialogue.update(dt);
        this._checkCollectionComplete();

        HUD.update(this.projectiles.length);
        this._updateHint();
    }

    _checkCollectionComplete() {
        if (GameState.collectionComplete || !this.waveComplete || Dialogue.isOpen() ||
            GameState.paused || GameState.hearts <= 0 ||
            !ARTWORKS.every((_, index) => GameState.artworks.includes(index))) return;
        GameState.collectionComplete = true;
        GameState.maxHearts += 1;
        GameState.hearts = GameState.maxHearts;
        this.player.resting = null;
        Dialogue.start("collectionComplete", GameState, () => HUD.toggleGallery(true));
    }

    _updateHint() {
        if (Dialogue.isOpen() || GameState.paused) {
            HUD.showHint(null);
            return;
        }

        let hint = null;
        for (let i = 0; i < this.npcs.length && !hint; i++) {
            const n = this.npcs[i];
            if (n.near) hint = `E — Talk to ${n.name}`;
        }
        for (let i = 0; i < this.interactables.length && !hint; i++) {
            const it = this.interactables[i];
            if (!it.near) continue;
            if (it.type === "chest") hint = GameState.chestOpened ? "E — Chest (empty)" : "E — Open chest";
            else if (it.type === "rewardChest") hint = GameState.rewardChestOpened ? "E — Chest (empty)" : "E — Claim reward chest";
            else if (it.type === "sign") hint = "E — Read sign";
            else if (it.type === "bench") {
                hint = this.player.resting === it
                    ? "Resting: +1 heart / 1.5s. Move or E to leave."
                    : "E — Rest and recover health";
            } else if (it.type === "portal") {
                hint = GameState.sageSpoken
                    ? (GameState.pulseUnlocked ? "F — Arcane pulse" : "E — Unlock arcane pulse")
                    : "E — Examine the tower";
            } else if (it.type === "enemyPortal") {
                hint = GameState.endlessEnemies ? "Enemy portal active" : "E — Awaken the enemy portal";
            }
        }
        if (!hint && this.enemies.length > 0) {
            const p = this.player;
            let close = false;
            for (let i = 0; i < this.enemies.length; i++) {
                if (DistSq(this.enemies[i].x, this.enemies[i].y, p.x, p.y) < 300 * 300) {
                    close = true;
                    break;
                }
            }
            if (close) hint = "SPACE — Attack! Projectiles follow your mouse.";
        }

        HUD.showHint(hint);
    }

    _updateEndlessEnemies(dt) {
        if (!GameState.endlessEnemies || this.waveComplete) return;

        if (!this.waveStarted) {
            this.waveStarted = true;
            this.endlessSpawnTimer = 0;
        }

        if (Dialogue.isOpen() || GameState.paused) return;

        if (this.waveSpawned >= CFG.ENEMY_WAVE_SIZE) {
            if (this.waveDefeated >= CFG.ENEMY_WAVE_SIZE) this._completeEnemyWave();
            return;
        }

        this.endlessSpawnTimer -= dt;
        if (this.endlessSpawnTimer > 0) return;

        const angle = Math.random() * Math.PI * 2;
        const distance = 420;
        const position = this._findFreePosition(
            this.player.x + Math.cos(angle) * distance,
            this.player.y + Math.sin(angle) * distance,
            26 * CFG.SPRITE_SCALE, 20 * CFG.SPRITE_SCALE
        );
        if (!position) return;
        const { x, y } = position;
        const enemy = new Enemy(x, y, [
            { x: Clamp(x - 140, 60, CFG.WORLD_W - 100), y: Clamp(y - 100, 60, CFG.WORLD_H - 80) },
            { x: Clamp(x + 140, 60, CFG.WORLD_W - 100), y: Clamp(y + 100, 60, CFG.WORLD_H - 80) },
        ], "#7048a8");
        enemy.waveEnemy = true;
        enemy.setScene(this);
        this.enemies.push(enemy);
        this.waveSpawned += 1;
        this.endlessSpawnTimer = CFG.ENEMY_WAVE_INTERVAL;
    }

    _completeEnemyWave() {
        this.waveComplete = true;
        GameState.endlessEnemies = false;

        const rewardChest = new Interactable(
            this.player.x + this.player.w + 24,
            this.player.y + this.player.h - 87,
            "rewardChest"
        );
        this.interactables.push(rewardChest);
        rewardChest.scene = this;
        this.solids.push(rewardChest);
        Dialogue.start("waveComplete", GameState);
    }

    Draw(ctx) {
        ctx.fillStyle = "#0d0f18";
        ctx.fillRect(0, 0, CFG.VIEW_W, CFG.VIEW_H);

        this.camera.apply(ctx);

        // Light grass field with a stable pixel-art texture.
        this._drawGrassBackground(ctx);

        // Ground pass
        for (let i = 0; i < this.gems.length; i++) this.gems[i].draw(ctx);
        for (let i = 0; i < this.interactables.length; i++) this.interactables[i].draw(ctx);
        for (let i = 0; i < this.trees.length; i++) this.trees[i].draw(ctx);
        for (let i = 0; i < this.enemies.length; i++) this.enemies[i].draw(ctx);
        for (let i = 0; i < this.npcs.length; i++) this.npcs[i].draw(ctx);
        for (let i = 0; i < this.projectiles.length; i++) this.projectiles[i].draw(ctx);

        let chestOpening = false;
        for (let i = 0; i < this.interactables.length; i++) {
            if ((this.interactables[i].type === "chest" || this.interactables[i].type === "rewardChest") && this.interactables[i].opening) {
                chestOpening = true;
                break;
            }
        }
        if (!chestOpening) this.player.draw(ctx);

        // Above-player pass (tree crowns, tall props).
        for (let i = 0; i < this.trees.length; i++) this.trees[i].drawAfter(ctx);

        this.camera.restore(ctx);
    }

    _drawGrassBackground(ctx) {
        ctx.drawImage(this.bg, 0, 0, CFG.WORLD_W, CFG.WORLD_H);
    }
}
