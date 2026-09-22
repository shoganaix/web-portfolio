"use strict";

// ---------------------------------------------------------------------------
// HUD. Reads GameState and refreshes the HTML overlay (hearts, gems, hint).
// Also controls the pause screen and the "switch to web" link.
// ---------------------------------------------------------------------------
const HUD = {
    heartsEl: null,
    gemsEl: null,
    hintEl: null,
    pauseEl: null,

    OnReady() {
        this.heartsEl = document.getElementById("hud-hearts");
        this.gemsEl = document.getElementById("hud-gems");
        this.hintEl = document.getElementById("hint");
        this.pauseEl = document.getElementById("pause-overlay");

        document.getElementById("btn-resume").addEventListener("click", () => {
            GameState.paused = false;
            this.updatePause();
        });
    },

    update() {
        let hearts = "";
        for (let i = 0; i < GameState.maxHearts; i++) {
            const filled = i < GameState.hearts ? "filled" : "empty";
            hearts += `<span class="heart ${filled}">&#9829;</span>`;
        }
        this.heartsEl.innerHTML = hearts;
        this.gemsEl.innerHTML = `&#9670;  ${GameState.gems} <span class="gems-total">/ ${GameState.requiredGems}</span>`;
    },

    showHint(text) {
        if (text && !Dialogue.isOpen() && !GameState.paused) {
            this.hintEl.textContent = text;
            this.hintEl.classList.remove("hidden");
        } else {
            this.hintEl.classList.add("hidden");
            this.hintEl.textContent = "";
        }
    },

    updatePause() {
        const show = GameState.paused;
        this.pauseEl.classList.toggle("hidden", !show);
        if (show) {
            this.update();
        }
    },
};