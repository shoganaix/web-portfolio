/* A small orthographic 3D scene rendered with Canvas 2D.
   Conceptual motion only; the scientific simulator lives in the linked repo. */
(() => {
  'use strict';
  const lab = document.getElementById('orbital-lab');
  const canvas = document.getElementById('orbit-canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;

  const range = document.getElementById('inclination');
  const output = document.getElementById('inclination-value');
  const motionButton = document.getElementById('motion-toggle');
  const modes = [...document.querySelectorAll('[data-view]')];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const tau = Math.PI * 2;
  const rad = Math.PI / 180;
  const state = { mode: 'orbit', yaw: -.3, pitch: -.18, phase: .65, tilt: 35, paused: reducedMotion.matches };
  let width = 1, height = 1, radius = 1, cx = 0, cy = 0;
  let frame = 0, last = 0, elapsed = 0, visible = true, dragging = false, pointerX = 0, pointerY = 0;
  let background;

  // Coarse geographic silhouettes, sampled once as points on a unit sphere.
  const continents = [
    [[-168,69],[-145,71],[-126,60],[-111,59],[-98,73],[-75,76],[-54,51],[-66,46],[-82,25],[-98,16],[-110,28],[-127,47],[-152,57]],
    [[-82,12],[-67,11],[-50,1],[-35,-7],[-40,-23],[-55,-40],[-68,-55],[-75,-35],[-80,-8]],
    [[-17,35],[9,38],[35,31],[51,11],[39,-12],[28,-34],[17,-35],[10,-18],[-2,5],[-17,16]],
    [[-10,36],[-10,57],[8,71],[36,70],[52,54],[79,71],[129,72],[170,61],[144,45],[125,35],[107,5],[97,10],[78,9],[68,25],[45,30],[30,42],[16,39]],
    [[112,-12],[134,-10],[153,-24],[146,-39],[126,-35],[113,-26]],
    [[-52,60],[-42,60],[-20,77],[-39,84],[-61,80]],
    [[46,-13],[50,-16],[48,-26],[44,-24]],
    [[129,31],[141,46],[146,43],[137,32]],
    [[-10,50],[-7,59],[0,58],[2,51]],
    [[96,4],[105,-6],[119,-9],[116,-3],[104,1]]
  ];
  function inside(x, y, polygon) {
    let result = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const a = polygon[i], b = polygon[j];
      if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) result = !result;
    }
    return result;
  }
  function sphere(lon, lat) {
    return [Math.cos(lat) * Math.sin(lon), -Math.sin(lat), Math.cos(lat) * Math.cos(lon)];
  }
  const land = [];
  for (let lat = -56; lat < 82; lat += 2.6) {
    const step = 2.6 / Math.cos(lat * rad);
    for (let lon = -180; lon < 180; lon += step) {
      if (continents.some(poly => inside(lon, lat, poly))) land.push(sphere(lon * rad, lat * rad));
    }
  }
  const grid = [];
  for (let lat = -60; lat <= 60; lat += 30) {
    const points = [];
    for (let lon = -180; lon <= 180; lon += 4) points.push(sphere(lon * rad, lat * rad));
    grid.push(points);
  }
  for (let lon = -180; lon < 180; lon += 30) {
    const points = [];
    for (let lat = -90; lat <= 90; lat += 4) points.push(sphere(lon * rad, lat * rad));
    grid.push(points);
  }

  function rotate(point, yaw = state.yaw, pitch = state.pitch) {
    const [x, y, z] = point;
    const X = x * Math.cos(yaw) + z * Math.sin(yaw);
    const Z = -x * Math.sin(yaw) + z * Math.cos(yaw);
    return [X, y * Math.cos(pitch) - Z * Math.sin(pitch), y * Math.sin(pitch) + Z * Math.cos(pitch)];
  }
  function project(p, scale = radius, x = cx, y = cy) { return [x + p[0] * scale, y + p[1] * scale, p[2]]; }
  function line(points, color, lineWidth = 1, frontOnly = false) {
    ctx.beginPath();
    let start = true;
    points.forEach(p => {
      if (frontOnly && p[2] < 0) { start = true; return; }
      if (start) { ctx.moveTo(p[0], p[1]); start = false; } else ctx.lineTo(p[0], p[1]);
    });
    ctx.strokeStyle = color; ctx.lineWidth = lineWidth; ctx.stroke();
  }
  function createBackground() {
    background = document.createElement('canvas');
    background.width = canvas.width; background.height = canvas.height;
    const b = background.getContext('2d');
    b.scale(canvas.width / width, canvas.height / height);
    b.fillStyle = '#0b0a12'; b.fillRect(0, 0, width, height);
    const glow = b.createRadialGradient(cx - radius * .3, cy - radius * .1, radius * .4, cx, cy, radius * 1.65);
    glow.addColorStop(0, '#50346342'); glow.addColorStop(.6, '#38234b23'); glow.addColorStop(1, '#0b0a1200');
    b.fillStyle = glow; b.fillRect(0, 0, width, height);
    let seed = 47;
    const rand = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
    for (let i = 0; i < 105; i++) {
      const x = rand() * width, y = rand() * height, r = rand() * .9 + .2;
      b.fillStyle = `rgba(210,190,242,${rand() * .4 + .1})`;
      b.beginPath(); b.arc(x, y, r, 0, tau); b.fill();
      if (i % 22 === 0) {
        b.strokeStyle = '#b49bcc44'; b.lineWidth = .5;
        b.beginPath(); b.moveTo(x - 3, y); b.lineTo(x + 3, y); b.moveTo(x, y - 3); b.lineTo(x, y + 3); b.stroke();
      }
    }
  }

  function drawEarth() {
    const earth = ctx.createRadialGradient(cx - radius * .47, cy - radius * .5, 0, cx + radius * .15, cy + radius * .2, radius * 1.2);
    earth.addColorStop(0, '#584163'); earth.addColorStop(.35, '#302439'); earth.addColorStop(.68, '#15111f'); earth.addColorStop(1, '#080910');
    ctx.beginPath(); ctx.arc(cx, cy, radius, 0, tau); ctx.fillStyle = earth; ctx.fill();
    const earthYaw = state.yaw + elapsed * .035;
    grid.forEach(points => line(points.map(p => project(rotate(p, earthYaw))), '#c4a4e31c', .55, true));
    for (const point of land) {
      const p = rotate(point, earthYaw);
      if (p[2] <= .02) continue;
      const lighting = Math.max(.1, p[2] * .65 - p[0] * .3 - p[1] * .2);
      ctx.fillStyle = `rgba(206,170,227,${lighting * .63})`;
      const size = Math.max(.5, radius * .007 * Math.sqrt(p[2]));
      ctx.fillRect(cx + p[0] * radius, cy + p[1] * radius, size, size);
    }
    const rim = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
    rim.addColorStop(0, '#ead1ffbb'); rim.addColorStop(.45, '#a479d04a'); rim.addColorStop(.8, '#927ba712'); rim.addColorStop(1, '#927ba700');
    ctx.strokeStyle = rim; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, radius, 0, tau); ctx.stroke();
    ctx.strokeStyle = '#c69cec0b'; ctx.lineWidth = 6; ctx.stroke();
  }
  function orbitPoint(angle) {
    const inclination = state.tilt * rad;
    return rotate([Math.cos(angle) * 1.46, Math.sin(angle) * Math.sin(inclination) * 1.46, Math.sin(angle) * Math.cos(inclination) * 1.46]);
  }
  function drawOrbit(front) {
    const points = [];
    for (let i = 0; i <= 180; i++) {
      const p = orbitPoint(i * tau / 180);
      points.push(project([p[0], p[1], (front ? p[2] : -p[2])]));
    }
    line(points, front ? '#d2b2ef8a' : '#a084bf36', front ? .9 : .65, true);
  }

  function drawSatellite(x, y, scale, yaw, pitch) {
    const faces = [];
    const transform = point => project(rotate(point, yaw, pitch), scale, x, y);
    function face(points, fill, stroke = '#cdb8dc') {
      const projected = points.map(transform);
      faces.push({ points: projected, fill, stroke, depth: projected.reduce((sum, p) => sum + p[2], 0) / points.length });
    }
    const a = .29, h = .72;
    face([[-a,-h,-a],[a,-h,-a],[a,h,-a],[-a,h,-a]], '#4c405b');
    face([[-a,-h,a],[a,-h,a],[a,h,a],[-a,h,a]], '#827086');
    face([[-a,-h,-a],[-a,-h,a],[-a,h,a],[-a,h,-a]], '#3c334b');
    face([[a,-h,-a],[a,-h,a],[a,h,a],[a,h,-a]], '#b5a18c');
    face([[-a,-h,-a],[a,-h,-a],[a,-h,a],[-a,-h,a]], '#c9bdc8');
    face([[-a,h,-a],[a,h,-a],[a,h,a],[-a,h,a]], '#554b5d');
    for (const side of [-1, 1]) {
      face([[side*a,-.37,0],[side*1.45,-.37,0],[side*1.45,.37,0],[side*a,.37,0]], '#36334e', '#b6a9d1');
      for (let column = 0; column < 5; column++) for (let row = 0; row < 3; row++) {
        const X = side * (.37 + column * .21), Y = -.32 + row * .22;
        face([[X,Y,.008],[X+side*.18,Y,.008],[X+side*.18,Y+.18,.008],[X,Y+.18,.008]], '#242a46', '#6e6b9877');
      }
    }
    // Gold rails and stacked panels suggest the 3U structure.
    for (let row = 0; row < 3; row++) {
      const y0 = -.61 + row * .43;
      face([[-.22,y0,a+.006],[.22,y0,a+.006],[.22,y0+.34,a+.006],[-.22,y0+.34,a+.006]], '#252334', '#cfb89c');
    }
    faces.sort((f, g) => f.depth - g.depth).forEach(f => {
      ctx.beginPath(); f.points.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath();
      ctx.fillStyle = f.fill; ctx.fill(); ctx.strokeStyle = f.stroke; ctx.lineWidth = Math.max(.4, scale * .005); ctx.stroke();
    });
    line([[0,-h,0],[0,-1.05,0],[.2,-1.23,0]].map(transform), '#d4c4d9', Math.max(.5, scale * .008));
  }
  function render() {
    if (!background) return;
    ctx.drawImage(background, 0, 0, width, height);
    if (state.mode === 'orbit') {
      const satellite = orbitPoint(state.phase);
      const p = project(satellite);
      drawOrbit(false);
      if (satellite[2] < 0) drawSatellite(p[0], p[1], radius * .09, state.phase, -.4);
      drawEarth();
      drawOrbit(true);
      if (satellite[2] >= 0) {
        drawSatellite(p[0], p[1], radius * .09, state.phase, -.4);
        ctx.strokeStyle = '#c2a5e950'; ctx.lineWidth = .5;
        ctx.beginPath(); ctx.moveTo(p[0]+12,p[1]-12); ctx.lineTo(p[0]+27,p[1]-27); ctx.lineTo(p[0]+72,p[1]-27); ctx.stroke();
        ctx.fillStyle = '#b49eca'; ctx.font = '7px monospace'; ctx.fillText('3U / CUBESAT', p[0]+30, p[1]-33);
      }
      ctx.strokeStyle = '#a087ba28'; ctx.lineWidth = .6;
      ctx.beginPath(); ctx.arc(cx, cy, radius * 1.7, -.8, .3); ctx.stroke();
      for (let i = 0; i < 19; i++) {
        const a = -.8 + i * 1.1 / 18;
        line([[cx+Math.cos(a)*radius*1.68,cy+Math.sin(a)*radius*1.68,0],[cx+Math.cos(a)*radius*1.72,cy+Math.sin(a)*radius*1.72,0]], '#a087ba40', .6);
      }
    } else {
      ctx.strokeStyle = '#a58ec52c'; ctx.lineWidth = .7;
      ctx.beginPath(); ctx.ellipse(cx, cy, radius * 1.36, radius * .52, -.25, 0, tau); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, radius * 1.1, 0, tau); ctx.stroke();
      const scale = radius * .9;
      drawSatellite(cx, cy, scale, state.yaw + elapsed * .15, state.pitch + state.tilt * rad * .4);
      const axes = [[1,0,0,'X','#be9dd7'],[0,-1,0,'Y','#9ac4b6'],[0,0,1,'Z','#d4b58d']];
      axes.forEach(([x,y,z,label,color]) => {
        const p = rotate([x,y,z], state.yaw + elapsed * .15, state.pitch + state.tilt * rad * .4);
        const baseX = width * .17, baseY = height * .77;
        line([[baseX,baseY,0],[baseX+p[0]*24,baseY+p[1]*24,p[2]]],color,.8);
        ctx.fillStyle=color;ctx.font='7px monospace';ctx.fillText(label,baseX+p[0]*32,baseY+p[1]*32);
      });
    }
  }

  function tick(time) {
    frame = 0;
    if (state.paused || !visible || document.hidden) { last = 0; return; }
    if (!last) last = time;
    const delta = time - last;
    // A slow orbital motion needs only 30 fps, independent of monitor refresh.
    if (delta >= 32) {
      const dt = Math.min(delta / 1000, .08);
      last = time; elapsed += dt;
      if (!dragging) state.phase = (state.phase + dt * .17) % tau;
      render();
    }
    frame = requestAnimationFrame(tick);
  }
  function schedule() {
    if (!frame && !state.paused && visible && !document.hidden) { last = 0; frame = requestAnimationFrame(tick); }
  }
  function syncMotion() {
    motionButton.textContent = state.paused ? '▷' : 'Ⅱ';
    motionButton.setAttribute('aria-label', state.paused ? 'Play animation' : 'Pause animation');
    motionButton.setAttribute('aria-pressed', String(state.paused));
    if (state.paused) { cancelAnimationFrame(frame); frame = 0; } else schedule();
  }
  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width; height = rect.height;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
    radius = width * .265; cx = width * .51; cy = height * .46;
    createBackground(); render();
  }
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) schedule(); else { cancelAnimationFrame(frame); frame = 0; last = 0; }
  }, { threshold: .05 }).observe(lab);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; last = 0; } else schedule();
  });
  reducedMotion.addEventListener('change', () => { state.paused = reducedMotion.matches; syncMotion(); render(); });
  range.addEventListener('input', () => { state.tilt = Number(range.value); output.value = `${state.tilt}°`; render(); });
  motionButton.addEventListener('click', () => { state.paused = !state.paused; syncMotion(); });
  modes.forEach(button => button.addEventListener('click', () => {
    state.mode = button.dataset.view;
    modes.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    range.labels[0].firstChild.textContent = state.mode === 'orbit' ? 'INCLINATION ' : 'BODY TILT ';
    lab.querySelector('.scene-label').innerHTML = state.mode === 'orbit'
      ? '<span class="crosshair">+</span> LOW EARTH ORBIT <span class="scene-label-sub">A small satellite. A bigger perspective.</span>'
      : '<span class="crosshair">+</span> CUBESAT / BODY FRAME <span class="scene-label-sub">Explore the orientation of a 3U platform.</span>';
    render();
  }));
  document.getElementById('reset-scene').addEventListener('click', () => {
    state.yaw = -.3; state.pitch = -.18; state.phase = .65; state.tilt = 35; elapsed = 0;
    range.value = '35'; output.value = '35°'; render();
  });
  canvas.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    dragging = true; pointerX = event.clientX; pointerY = event.clientY;
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', event => {
    if (!dragging) return;
    state.yaw += (event.clientX - pointerX) * .008;
    state.pitch = Math.max(-.8, Math.min(.8, state.pitch + (event.clientY - pointerY) * .004));
    pointerX = event.clientX; pointerY = event.clientY; render();
  });
  ['pointerup','pointercancel','lostpointercapture'].forEach(name => canvas.addEventListener(name, () => { dragging = false; }));
  canvas.tabIndex = 0;
  canvas.setAttribute('aria-describedby', 'drag-hint');
  canvas.addEventListener('keydown', event => {
    if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'ArrowLeft') state.yaw -= .15;
    if (event.key === 'ArrowRight') state.yaw += .15;
    if (event.key === 'ArrowUp') state.pitch = Math.max(-.8, state.pitch - .1);
    if (event.key === 'ArrowDown') state.pitch = Math.min(.8, state.pitch + .1);
    render();
  });
  document.getElementById('drag-hint').textContent = '↔ DRAG OR USE ARROW KEYS';
  lab.querySelector('.scene-controls').hidden = false;
  lab.classList.add('ready');
  resize(); syncMotion();
})();
