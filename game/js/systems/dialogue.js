"use strict";

// ---------------------------------------------------------------------------
// Dialogue system. Renders an HTML overlay at the bottom of the game screen
// with a typewriter effect. While a dialogue is open the player cannot move
// (checked elsewhere via Dialogue.isOpen()).
// ---------------------------------------------------------------------------
const Dialogue = {
    box: null,
    nameEl: null,
    textEl: null,
    nextEl: null,

    _open: false,
    _lines: [],
    _index: 0,
    _charIndex: 0,
    _typeTimer: 0,
    _typing: false,
    _onClose: null,

    CHAR_INTERVAL: 0.018,

    OnReady() {
        this.box = document.getElementById("dialogue-box");
        this.nameEl = document.getElementById("dialogue-name");
        this.textEl = document.getElementById("dialogue-text");
        this.nextEl = document.getElementById("dialogue-next");
        this.box.addEventListener("click", (e) => {
            e.stopPropagation();
            this.advance();
        });
    },

    isOpen() {
        return this._open;
    },

    // blockId must exist in DIALOGUES. `context` (GameState) lets a block use
    // conditional lines. `onClose` is called when the box finishes.
    start(blockId, context, onClose) {
        const block = DIALOGUES[blockId];
        if (!block) return;

        this._lines = typeof block.lines === "function" ? block.lines(context) : block.lines;
        this._index = 0;
        this._onClose = onClose || null;
        this._open = true;
        this.box.classList.remove("hidden");
        this._beginLine();
    },

    _beginLine() {
        const line = this._lines[this._index];
        this.nameEl.textContent = line.who;
        this.textEl.textContent = "";
        this._charIndex = 0;
        this._typing = true;
        this.nextEl.textContent = "";
    },

    advance() {
        if (!this._open) return;

        if (this._typing) {
            // Skip the typewriter and reveal the whole line.
            this._charIndex = this._lines[this._index].text.length;
            this._typing = false;
            return;
        }

        this._index += 1;
        if (this._index >= this._lines.length) {
            this._close();
        } else {
            this._beginLine();
        }
    },

    _close() {
        this._open = false;
        this.box.classList.add("hidden");
        this.nameEl.textContent = "";
        this.textEl.textContent = "";
        if (this._onClose) {
            const cb = this._onClose;
            this._onClose = null;
            cb();
        }
    },

    update(dt) {
        if (!this._open) return;

        if (this._typing) {
            this._typeTimer += dt;
            while (this._typeTimer >= this.CHAR_INTERVAL) {
                this._typeTimer -= this.CHAR_INTERVAL;
                this._charIndex = Math.min(this._charIndex + 1, this._lines[this._index].text.length);
            }
            this.textEl.textContent = this._lines[this._index].text.slice(0, this._charIndex);

            if (this._charIndex >= this._lines[this._index].text.length) {
                this._typing = false;
            }
        }

        if (!this._typing) {
            this.nextEl.textContent = "[ E ]  continue";
        }

        // Advance input (works while typing — skips — and once the line is shown).
        if (Input.Pressed(KEY.E) || Input.Pressed(KEY.SPACE) || Input.Pressed(KEY.ENTER)) {
            this.advance();
        }
    },
};