# Shoganai — Portfolio

**_"An interactive game-like experience"_**

A portfolio that lives in two places: a classic **web** experience and a playable
**pixel-art game**. Built with plain HTML, CSS and JavaScript (no frameworks),
plus Aseprite/Photoshop for the art.

> The current art in the game is a mixture of real assets and procedural
> placeholders — swap `game/img/*` with the final sprites when ready.

## Structure

```
.
├── index.html          Landing: choose Web or Game
├── style.css
├── web/                Classic website
│   ├── index.html      Home (hero + parallax)
│   ├── about.html      About (skills, contact form link)
│   ├── portfolio.html  Gallery with dynamic modal
│   ├── contact.html    Contact form (email JS-free)
│   ├── css/            theme.css + per-page styles
│   ├── js/             page scripts
│   └── images/         web art
├── game/               Playable portfolio game
│   ├── index.html      Canvas 640x360 + HUD/dialogue/pause overlays
│   ├── css/style.css
│   ├── img/            background, spritesheets, props
│   └── js/
│       ├── config.js        CFG + GameState
│       ├── input.js         keyboard/mouse manager
│       ├── helper.js        math + collision helpers
│       ├── camera.js        follow camera with shake + clamp
│       ├── placeholder.js   procedural sprite placeholders
│       ├── data/dialogues.js
│       ├── systems/dialogue.js
│       ├── systems/hud.js
│       ├── entities/entity.js, player.js, tree.js, gem.js,
│       │            npc.js, enemy.js, interactable.js
│       ├── scene.js         composes the world
│       └── main.js          bootstrap + game loop (rAF)
└── art/               Source / final art folders
    ├── final/spritesheets
    ├── final/sources
    ├── wip
    └── refs
```

## Game

Explore the valley, talk to the Guide and the Sage, gather the 5 gemstones,
defeat the enemies watching the tower, and touch the **Tower of Creation** to
open the web portfolio.

| Input | Action |
| --- | --- |
| WASD / Arrows | Move |
| E | Interact / Talk / Open chest / Read sign |
| SPACE | Attack |
| ESC | Pause |

Script loading order matters (classic scripts, works from `file://`):
`config → input → helper → camera → placeholder → dialogues → dialogue → hud →
entity → interactable → tree → gem → npc → enemy → player → scene → main`.

### Engine notes

- World is the full `Background.png` (3600x1950 px). The internal view is
  640x360 and the camera follows the player, clamped to the map edges.
- Every entity is authored in pixel units and scaled by `CFG.SPRITE_SCALE` (3).
- Run `node --check` on every `game/js/**/*.js` to validate syntax.

## Status

### Game — Programming

- [x] 8-directional movement (normalized diagonals)
- [x] Character animations (idle / walk / sword attack)
- [x] Axis-separated collisions (no infinite-loop bugs)
- [x] Camera: follow, clamp, shake
- [x] HUD: hearts, gems, contextual hint
- [x] Dialogue system (typewriter, skip, click/E/space/enter)
- [x] NPCs with dialogues (Guide, Sage)
- [x] Enemies: patrol, chase, hit, knockback, drops
- [x] Gemstones quest + goal indicator
- [x] Tutorial sign + interactable props (chest, sign, tower)
- [x] Pause menu with resume / switch-to-web / restart
- [x] Portal to `web/index.html` (after confirming with the tower)
- [ ] Final art swap

### Game — Art (awaiting final assets)

- [x] Chest, sign, tower, tree sprites wired
- [x] 4-direction movement animation wired
- [ ] Grass tiles / stone stairs
- [ ] Second character: animation + dialogue
- [ ] Sanctuary background finalization
- [ ] Enemy + NPC final sprites
- [ ] Soundtrack integration

### Web

- [x] Responsive landing with hover GIFs
- [x] About: table with info, skills, no title margins
- [x] Portfolio: 8 pieces, hover effect, dynamic modal, responsive
- [x] Contact: working form semantics, responsive
- [x] Shared theme (navbar, footer, fonts) across pages
- [ ] Background/line polish on About
- [ ] Form back-end (currently front-end only)

## Credits

Original concept and art by Maria Soriano (a.k.a. Shoganai).