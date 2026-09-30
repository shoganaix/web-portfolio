from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
def edit(name, fn):
    p = root / name
    p.write_text(fn(p.read_text(encoding='utf-8')), encoding='utf-8')

card = '''<a class="nav-link engineering-link" href="engineering/index.html" aria-label="Explore engineering projects">
                    <article class="column column-engineering">
                        <div class="card-glow" aria-hidden="true"></div>
                        <div class="engineering-orbit" aria-hidden="true"><span>✧</span></div>
                        <div class="card-content"><h2 class="title">Engineering</h2>
                        <p class="subtitle">Robotics · Simulation · Embedded</p>
                        <span class="card-action">Explore <span class="arrow" aria-hidden="true">→</span></span></div>
                    </article>
                </a>'''
edit('index.html', lambda s: s.replace('<div class="row">','<div class="row">\n'+card,1).replace('Choose between the classic portfolio and an interactive game experience.','Engineering, robotics and embedded systems alongside art and an interactive game experience.'))
edit('style.css', lambda s: s.replace('web/images/bg1.jpg','web/images/bg.jpg')+'''
/* Engineering joins the existing experience selector. */
.selection .row { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 26px; max-width: 1320px; }
.column-engineering { background: radial-gradient(ellipse at 50% 20%, #325456, #112023 72%); border-color: #7caa9e; overflow: hidden; }
.engineering-orbit { position: absolute; top: 12%; left: 20%; width: 60%; aspect-ratio: 1; border: 1px solid #82b0a6; border-radius: 50%; transform: rotate(-30deg) scaleY(.65); box-shadow: 0 0 35px #76bba51c; }
.engineering-orbit::after { content: ''; position: absolute; inset: 20%; border: 1px solid #e6bb7a; transform: rotate(50deg); }
.engineering-orbit span { color: #e6bb7a; font-size: 70px; position: absolute; top: 10%; left: 28%; }
.column-engineering .card-content { position: relative; z-index: 2; }
.column-engineering .title { color: #e6d7b3; font-size: clamp(1.8rem, 3vw, 3rem); }
.column-engineering .subtitle { font-size: .85rem; }
@media(max-width: 800px) { .selection .row { grid-template-columns: 1fr; max-width: 520px; } .choice-page { padding-inline: 22px; } .column { min-height: 280px; } }
@media(prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important; } .arched-title .word { opacity: 1; filter: none; } }
''')

for name in ['index','about','portfolio','contact']:
    def update(s):
        # Keep the navbar and footer alive; swap the page and its modal together.
        start=s.index('</nav>')+len('</nav>')
        end=s.index('<footer')
        s=s[:start]+'\n<main id="page-content" tabindex="-1">'+s[start:end]+'</main>\n'+s[end:]
        s=re.sub(r'<link rel="stylesheet" href="css/(style|about|portfolio|contact)\.css">',r'<link rel="stylesheet" data-page-style href="css/\1.css">',s)
        s=s.replace('</head>','<link rel="stylesheet" href="css/shared-enhancements.css">\n</head>')
        s=re.sub(r'<script src="js/(?:index|about|portfolio|waypoints/noframework.waypoints)\.js"></script>','',s)
        s=s.replace('</body>','<script src="js/site-navigation.js"></script>\n</body>')
        s=s.replace('<ul class="navbar-nav ms-auto">','<ul class="navbar-nav ms-auto"><li class="nav-item"><a class="nav-link" href="../engineering/index.html">Engineering</a></li>')
        if name=='index':
            s=re.sub(r'<div class="music-player">.*?</div>','<div id="home-player-slot"></div>',s,flags=re.S)
        if name=='about':
            s=s.replace("I'm a <span class=\"keywords\">video game developer</span>, <span class=\"keywords\">artist</span>","I'm a <span class=\"keywords\">software &amp; game developer</span>, <span class=\"keywords\">artist</span>")
            s=s.replace("and <span class=\"keywords\">programmer</span> who loves building worlds and characters that feel alive.","and <span class=\"keywords\">electronics &amp; engineering student</span>. My current focus is robotics, simulation and embedded systems for space, including a personal CubeSat attitude-control project. <a class=\"mailto\" href=\"../engineering/index.html\">Explore my engineering work</a>.")
        if name=='contact':
            for field in ['name','email','subject','message']:
                s=s.replace(f'<label for="{field}"></label>', f'<label class="visually-hidden" for="{field}">{field.capitalize()}</label>')
        return s
    edit('web/'+name+'.html',update)

# Page scripts have an explicit lifetime when navigating without a reload.
edit('web/js/index.js',lambda s:s.replace('window.addEventListener("mousemove", function (e) {','const onMove = function (e) {').replace('target.y = (e.clientY / window.innerHeight - 0.5) * 2;\n    });','target.y = (e.clientY / window.innerHeight - 0.5) * 2;\n    };\n    window.addEventListener("mousemove", onMove);\n    let frame;\n    window.pageCleanup = () => { cancelAnimationFrame(frame); window.removeEventListener("mousemove", onMove); };').replace('requestAnimationFrame(loop);','frame = requestAnimationFrame(loop);').replace('"layer-far": 12, "layer-mid": 24, "layer-near": 38, "layer-front": 55','"layer-far": 38, "layer-mid": 24, "layer-near": 12, "layer-front": 5'))
edit('web/js/portfolio.js',lambda s:s.replace('document.addEventListener("keydown", function (e) {','const handleKeys = function (e) {').replace('    });\n\n})();','    };\n    document.addEventListener("keydown", handleKeys);\n    window.pageCleanup = () => { document.removeEventListener("keydown", handleKeys); if (bootstrapModal) bootstrapModal.dispose(); };\n})();'))

edit('game/js/config.js',lambda s:s.replace('Portfolio_06_Character_TurnAround"','Portfolio_06_Character_TurnAround.png"').replace('Portfolio_10.0_Tarditional.png','Portfolio_10.0_Tarditional.jpg').replace('Portfolio_10.1_TarditionalHouses.png','Portfolio_10.1_TarditionalHouses.jpg').replace('Portfolio_11.0_TarditionalStudies.png','Portfolio_11.0_TarditionalStudies.jpg').replace('Portfolio_11.2_TarditionalStudies.png','Portfolio_11.2_TarditionalStudies.jpg').replace('Portfolio_11.3_TarditionalStudies.png','Portfolio_11.3_TarditionalStudies.jpg').replace('_TFG.png','_TFG.PNG'))
edit('game/js/systems/dialogue.js',lambda s:s.replace('this._typing = true;\n        this.nextEl','this._typing = true;\n        this._typeTimer = 0;\n        this.nextEl').replace('this._typing = false;\n            return;','this._typing = false;\n            this.textEl.textContent = this._lines[this._index].text;\n            return;').replace('!wasTyping && !ignoreInput','!ignoreInput').replace('        const wasTyping = this._typing;\n',''))
edit('game/js/entities/npc.js',lambda s:s.replace('this.time += dt;','if (Dialogue.isOpen() || GameState.paused) return;\n        this.time += dt;').replace('if (GameState.gems >= GameState.requiredGems)', 'if (!GameState.sageSpoken && GameState.gems >= GameState.requiredGems)'))
edit('game/js/main.js',lambda s:s.replace('if (e.keyCode === KEY.ESC)', 'if (e.keyCode === KEY.ESC && !e.repeat)').replace('Math.max(window.innerWidth / CFG.VIEW_W, window.innerHeight / CFG.VIEW_H)','Math.min(window.innerWidth / CFG.VIEW_W, window.innerHeight / CFG.VIEW_H)'))
edit('game/js/input.js',lambda s:s.replace('function SetupKeyboardEvents() {','function SetupKeyboardEvents() {\n    window.addEventListener("blur", () => { Input._held = {}; Input._down = {}; Input._up = {}; Input.sprintHeld = false; });').replace('const touch = event.touches[0];\n        if (!touch) return;\n        const rect = joystick','const touch = Array.from(event.touches).find(t => t.identifier === joystickPointer);\n        if (!touch) return;\n        const rect = joystick').replace('        knob.style.transform = `translate(calc(-50% + ${knobX}px), calc(-50% + ${knobY}px))`;\n\n        clearDirections();','        clearDirections();\n        knob.style.transform = `translate(calc(-50% + ${knobX}px), calc(-50% + ${knobY}px))`;').replace('    joystick.addEventListener("touchend", (event) => {','    joystick.addEventListener("touchcancel", () => { joystickPointer = null; clearDirections(); });\n    joystick.addEventListener("touchend", (event) => {\n        if (Array.from(event.touches).some(t => t.identifier === joystickPointer)) return;'))
