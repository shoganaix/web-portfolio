"use strict";

// ---------------------------------------------------------------------------
// HUD. Reads GameState and refreshes the HTML overlay (hearts, gems, hint).
// Also controls the pause screen and the "switch to web" link.
// ---------------------------------------------------------------------------
const HUD = {
    heartsEl: null,
    gemsEl: null,
    orbsEl: null,
    galleryEl: null,
    artworkGridEl: null,
    artworkCountEl: null,
    hintEl: null,
    pauseEl: null,

    OnReady() {
        this.heartsEl = document.getElementById("hud-hearts");
        this.gemsEl = document.getElementById("hud-gems");
        this.orbsEl = document.getElementById("hud-orbs");
        this.galleryEl = document.getElementById("artwork-gallery");
        this.artworkGridEl = document.getElementById("artwork-grid");
        this.artworkCountEl = document.getElementById("artwork-count");
        this.hintEl = document.getElementById("hint");
        this.pauseEl = document.getElementById("pause-overlay");

        document.getElementById("artwork-open").addEventListener("click", () => this.toggleGallery(true));
        document.getElementById("artwork-close").addEventListener("click", () => this.toggleGallery(false));

        document.getElementById("btn-resume").addEventListener("click", () => {
            GameState.paused = false;
            this.updatePause();
        });
    },

    update(activeOrbs) {
        let hearts = "";
        for (let i = 0; i < GameState.maxHearts; i++) {
            const filled = i < GameState.hearts ? "filled" : "empty";
            hearts += `<span class="heart ${filled}">&#9829;</span>`;
        }
        this.heartsEl.innerHTML = hearts;
        this.gemsEl.innerHTML = `ART ${GameState.artworks.length}/${ARTWORKS.length}`;

        const availableOrbs = Math.max(0, 3 - Math.min(3, activeOrbs || 0));
        let orbs = "";
        for (let i = 0; i < 3; i++) {
            orbs += `<span class="orb ${i < availableOrbs ? "" : "empty"}"></span>`;
        }
        this.orbsEl.innerHTML = orbs;
    },

    toggleGallery(force) {
        const show = typeof force === "boolean"
            ? force
            : this.galleryEl.classList.contains("hidden");
        if (show) this.renderGallery();
        this.galleryEl.classList.toggle("hidden", !show);
        this.galleryEl.setAttribute("aria-hidden", String(!show));
        GameState.paused = show;
        this.pauseEl.classList.add("hidden");
        this.update(Game.scene ? Game.scene.projectiles.length : 0);
    },

    renderGallery() {
        this.artworkCountEl.textContent = `${GameState.artworks.length}/${ARTWORKS.length}`;
        this.artworkGridEl.innerHTML = ARTWORKS.map((artwork, index) => {
            const unlocked = GameState.artworks.includes(index);
            return `<article class="artwork-card ${unlocked ? "unlocked" : "locked"}">
                ${unlocked
                    ? `<img src="../web/images/${artwork.file}" alt="${artwork.title}">`
                    : `<div class="artwork-lock">?</div>`}
                <span>${unlocked ? artwork.title : "Locked"}</span>
            </article>`;
        }).join("");
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
            this.update(Game.scene ? Game.scene.projectiles.length : 0);
        }
    },
};