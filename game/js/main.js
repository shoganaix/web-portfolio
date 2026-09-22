"use strict";

// ---------------------------------------------------------------------------
// Bootstrap + game loop. Fixed vs the old version:
//   * requestAnimationFrame with a clamped delta (was setTimeout(18ms)).
//   * Correct delta accumulation and no stale `pause`/`delta` mixups.
//   * Input state cleaned once per frame.
//   * Canvas scales to fit the window while keeping pixel-perfect rendering.
// ---------------------------------------------------------------------------
const Game = {
    canvas: null,
    ctx: null,
    scene: null,
    last: 0,

    onload() {
        const canvas = document.getElementById("myCanvas");
        canvas.width = CFG.VIEW_W;
        canvas.height = CFG.VIEW_H;
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.ctx.imageSmoothingEnabled = false;

        SetupKeyboardEvents();
        SetupMouseEvents(canvas);
        Dialogue.OnReady();
        HUD.OnReady();

        this.scene = new Scene();
        this.scene.Start();

        window.addEventListener("resize", () => this.fit());
        document.addEventListener("keydown", (e) => {
            if (e.keyCode === KEY.ESC) this.togglePause();
        });

        this.fit();
        this.last = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    },

    // Scale the canvas (and its overlay) to the window, centered, crisp.
    fit() {
        const scale = Math.min(
            window.innerWidth / CFG.VIEW_W,
            window.innerHeight / CFG.VIEW_H
        );
        const w = Math.floor(CFG.VIEW_W * scale);
        const h = Math.floor(CFG.VIEW_H * scale);

        this.canvas.style.width = w + "px";
        this.canvas.style.height = h + "px";

        const wrap = document.getElementById("game-wrap");
        if (wrap) {
            wrap.style.width = w + "px";
            wrap.style.height = h + "px";
        }
    },

    togglePause() {
        if (Dialogue.isOpen()) return;
        GameState.paused = !GameState.paused;
        HUD.updatePause();
        HUD.update();
    },

    loop(t) {
        const dt = Math.min((t - this.last) / 1000, 0.05);
        this.last = t;

        if (!GameState.paused) {
            this.scene.Update(dt);
        } else {
            HUD.update();
        }
        this.scene.Draw(this.ctx);

        Input.PostUpdate();
        requestAnimationFrame((tt) => this.loop(tt));
    },
};

window.addEventListener("load", () => Game.onload());