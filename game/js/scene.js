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
        this.gems = [];
        this.solids = [];
    }

    Start() {
        this.bg = LoadImage("img/Background.png");
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

        this.npcs.push(new NPC(1550, 1400, "Guide", "guide", Placeholders.Guide()));
        this.npcs.push(new NPC(3050, 620, "Sage", "sage", Placeholders.Sage()));

        this.enemies.push(new Enemy(2650, 1250, [{ x: 2480, y: 1170 }, { x: 2800, y: 1330 }], "#c94f6d"));
        this.enemies.push(new Enemy(720, 1620, [{ x: 640, y: 1550 }, { x: 880, y: 1660 }], "#9b59b6"));
        this.enemies.push(new Enemy(3300, 1000, [{ x: 3200, y: 950 }, { x: 3420, y: 1080 }], "#c94f6d"));

        // Five gems hidden around the valley (plus drops from enemies).
        this.gems.push(new Gem(1300, 920, "#4fd6c1"));
        this.gems.push(new Gem(1800, 1520, "#8bd24f"));
        this.gems.push(new Gem(2200, 720, "#4fa8d6"));
        this.gems.push(new Gem(2700, 1600, "#d6c14f"));
        this.gems.push(new Gem(3200, 1010, "#d68b4f"));

        this.enemies.forEach(e => e.setScene(this));
        this.solids = this.trees.concat(this.interactables);
    }

    spawnGem(x, y) {
        this.gems.push(new Gem(x, y, "#8bd24f"));
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
            if (this.enemies[i].dead) this.enemies.splice(i, 1);
        }

        this.camera.update(dt);
        Dialogue.update(dt);

        HUD.update();
        this._updateHint();
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
            else if (it.type === "sign") hint = "E — Read sign";
            else if (it.type === "portal") hint = it.confirmPortal ? "E — Step through the tower" : "E — Touch the tower";
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
            if (close) hint = "SPACE — Attack!";
        }

        HUD.showHint(hint);
    }

    Draw(ctx) {
        ctx.fillStyle = "#0d0f18";
        ctx.fillRect(0, 0, CFG.VIEW_W, CFG.VIEW_H);

        this.camera.apply(ctx);

        // Background (the whole 3600x1950 map).
        ctx.drawImage(this.bg, 0, 0, CFG.WORLD_W, CFG.WORLD_H);

        // Ground pass
        for (let i = 0; i < this.gems.length; i++) this.gems[i].draw(ctx);
        for (let i = 0; i < this.interactables.length; i++) this.interactables[i].draw(ctx);
        for (let i = 0; i < this.trees.length; i++) this.trees[i].draw(ctx);
        for (let i = 0; i < this.enemies.length; i++) this.enemies[i].draw(ctx);
        for (let i = 0; i < this.npcs.length; i++) this.npcs[i].draw(ctx);

        this.player.draw(ctx);

        // Above-player pass (tree crowns, tall props).
        for (let i = 0; i < this.trees.length; i++) this.trees[i].drawAfter(ctx);

        this.camera.restore(ctx);
    }
}