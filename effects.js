/* Pixel & Sons — glass, effects, tools and the main render pass. */
'use strict';

/* =========================================================
   Phone glass
   ========================================================= */
function drawPhoneGlass(g, x, y, w, h) {
  const p = G.phone, o = G.order;
  g.save();
  g.translate(x, y);
  rrPath(g, 0, 0, w, h, 22);
  g.clip();
  g.fillStyle = '#040506';
  g.fillRect(0, 0, w, h);

  const dead = ['battery', 'port', 'water', 'both'].includes(o.repair);
  if (p.powerOn) {
    drawBootScreen(g, w, h);
  } else {
    if (!dead) {
      drawWallpaper(g, 0, 0, w, h, o, 0.92);
      drawStatusBar(g, w, h, 0.75);
    } else {
      const dg = g.createLinearGradient(0, 0, w, h);
      dg.addColorStop(0, '#0b0d10');
      dg.addColorStop(0.45, '#040506');
      dg.addColorStop(1, '#0d1013');
      g.fillStyle = dg;
      g.fillRect(0, 0, w, h);
    }
    if (p.screenBroken && !p.screenNew) drawCracks(g, p.cracks, w, h, 1, 0);
    if (p.protector && !p.protectorPeeled) {
      drawFilm(g, w, h, p.protectorNew ? 0 : 1);
      if (!p.protectorNew) drawCracks(g, p.filmCracks, w, h, 0.95, 1);
      drawDustSpecks(g, w, h, p.clean);
      if (p.protectorNew) drawBubbles(g, w, h, p.bubbles);
    }
    if (p.protectorPeeled && p.clean < 1) drawSmudges(g, w, h, 1 - p.clean);
  }

  // glass reflections
  g.save();
  g.globalAlpha = 0.09;
  g.fillStyle = '#ffffff';
  g.beginPath();
  g.moveTo(-40, h * 0.08);
  g.lineTo(w * 0.5, h * 0.02);
  g.lineTo(w * 0.28, h * 0.62);
  g.lineTo(-20, h * 0.72);
  g.closePath();
  g.fill();
  g.globalAlpha = 0.04;
  g.beginPath();
  g.moveTo(w * 0.62, h * 0.02);
  g.lineTo(w * 1.05, h * 0.2);
  g.lineTo(w, h * 0.5);
  g.lineTo(w * 0.75, h * 0.2);
  g.closePath();
  g.fill();
  g.restore();

  // dynamic island
  fillRR(g, w / 2 - 31, 8, 62, 17, 9, '#030405');
  g.fillStyle = '#10161c';
  g.beginPath(); g.arc(w / 2 + 19, 16.5, 3.4, 0, Math.PI * 2); g.fill();
  g.fillStyle = 'rgba(70,110,170,.25)';
  g.beginPath(); g.arc(w / 2 + 19, 16.5, 1.5, 0, Math.PI * 2); g.fill();

  // home indicator
  fillRR(g, w / 2 - 34, h - 10, 68, 3.5, 2, 'rgba(255,255,255,.55)');

  // screen edge
  strokeRR(g, 1, 1, w - 2, h - 2, 21, 'rgba(255,255,255,.08)', 1.4);
  g.restore();
}

function drawWallpaper(g, x, y, w, h, order, dim) {
  const grad = g.createLinearGradient(x, y, x + w, y + h);
  grad.addColorStop(0, shade(order.glowA, -0.28));
  grad.addColorStop(0.55, shade(order.glowB, -0.12));
  grad.addColorStop(1, shade(order.glowB, -0.55));
  g.fillStyle = grad;
  g.fillRect(x, y, w, h);
  const blobs = [
    [0.24, 0.18, 0.52, order.glowA, 0.55],
    [0.8, 0.52, 0.62, order.glowB, 0.5],
    [0.35, 0.82, 0.5, order.glowA, 0.35]
  ];
  for (const [bx, by, br, col, a] of blobs) {
    const rg = g.createRadialGradient(x + w * bx, y + h * by, 4, x + w * bx, y + h * by, w * br);
    rg.addColorStop(0, col);
    rg.addColorStop(1, 'rgba(0,0,0,0)');
    g.globalAlpha = a;
    g.fillStyle = rg;
    g.fillRect(x, y, w, h);
  }
  g.globalAlpha = dim;
  g.fillStyle = 'rgba(2,4,7,.45)';
  g.fillRect(x, y, w, h);
  g.globalAlpha = 1;
}

function drawStatusBar(g, w, h, alpha) {
  alpha = alpha == null ? 0.8 : alpha;
  g.save();
  g.globalAlpha = alpha;
  g.fillStyle = '#fff';
  g.font = '700 8px "Trebuchet MS",sans-serif';
  g.textAlign = 'left';
  g.fillText('9:41', 15, 20);
  // signal
  for (let i = 0; i < 4; i++) {
    g.fillRect(w - 64 + i * 3.4, 17 - i * 1.8, 2.2, 2 + i * 1.8);
  }
  // wifi
  g.strokeStyle = '#fff';
  g.lineWidth = 1.3;
  g.beginPath(); g.arc(w - 44, 19, 6, -2.3, -0.85); g.stroke();
  g.beginPath(); g.arc(w - 44, 19, 3, -2.3, -0.85); g.stroke();
  // battery
  g.lineWidth = 1;
  g.strokeStyle = '#fff';
  rrPath(g, w - 32, 14, 16, 7, 2); g.stroke();
  g.fillRect(w - 30, 15.5, 11, 4);
  g.fillRect(w - 15, 16.5, 1.6, 2);
  g.restore();
}

function drawCracks(g, lines, w, h, alpha, offset) {
  g.save();
  g.lineCap = 'round';
  for (const pts of lines) {
    // dark under-stroke
    g.strokeStyle = `rgba(0,0,0,${0.5 * alpha})`;
    g.lineWidth = 3.2;
    g.beginPath();
    pts.forEach((p, i) => {
      const px = p.x * w + offset, py = p.y * h + offset;
      if (i === 0) g.moveTo(px, py); else g.lineTo(px, py);
    });
    g.stroke();
    // bright crack
    g.strokeStyle = `rgba(235,248,255,${0.78 * alpha})`;
    g.lineWidth = 1.2;
    g.beginPath();
    pts.forEach((p, i) => {
      const px = p.x * w + offset, py = p.y * h + offset;
      if (i === 0) g.moveTo(px, py); else g.lineTo(px, py);
    });
    g.stroke();
  }
  if (lines.length) {
    const ip = lines[0][0];
    g.fillStyle = `rgba(255,255,255,${0.5 * alpha})`;
    g.beginPath();
    g.arc(ip.x * w + offset, ip.y * h + offset, 2.4, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = `rgba(255,255,255,${0.22 * alpha})`;
    g.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      g.beginPath();
      g.arc(ip.x * w + offset, ip.y * h + offset, 8 + i * 7, i * 1.4, i * 1.4 + 2.1);
      g.stroke();
    }
  }
  g.restore();
}

function drawFilm(g, w, h, cracked) {
  g.save();
  rrPath(g, 5, 5, w - 10, h - 10, 18);
  g.fillStyle = 'rgba(255,255,255,.035)';
  g.fill();
  g.strokeStyle = 'rgba(255,255,255,.24)';
  g.lineWidth = 1;
  g.stroke();
  // corner pull tab
  g.fillStyle = 'rgba(255,255,255,.32)';
  g.beginPath();
  g.moveTo(w - 44, 6); g.lineTo(w - 8, 6); g.lineTo(w - 8, 38);
  g.closePath();
  g.fill();
  g.fillStyle = 'rgba(30,35,40,.75)';
  g.font = '700 5px "Courier New",monospace';
  g.textAlign = 'center';
  g.save();
  g.translate(w - 20, 18);
  g.rotate(0.7);
  g.fillText('PULL', 0, 0);
  g.restore();
  if (cracked) {
    g.strokeStyle = 'rgba(255,255,255,.12)';
    g.lineWidth = 1;
    g.strokeRect(12, 12, w - 24, h - 24);
  }
  g.restore();
}

function drawDustSpecks(g, w, h, clean) {
  const rnd = mulberry32(1201);
  g.save();
  for (let i = 0; i < 42; i++) {
    const a = (1 - clean) * (0.08 + rnd() * 0.2);
    g.fillStyle = `rgba(255,250,235,${a})`;
    g.beginPath();
    g.arc(10 + rnd() * (w - 20), 10 + rnd() * (h - 20), 0.5 + rnd() * 1.5, 0, Math.PI * 2);
    g.fill();
  }
  g.restore();
}

function drawSmudges(g, w, h, amount) {
  const rnd = mulberry32(510);
  g.save();
  for (let i = 0; i < 10; i++) {
    const cx = 20 + rnd() * (w - 40), cy = 30 + rnd() * (h - 60);
    const r = 8 + rnd() * 26;
    const rg = g.createRadialGradient(cx, cy, 0, cx, cy, r);
    rg.addColorStop(0, `rgba(255,255,255,${0.09 * amount})`);
    rg.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = rg;
    g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
    g.strokeStyle = `rgba(210,220,225,${0.05 * amount})`;
    g.lineWidth = 1;
    g.beginPath(); g.arc(cx - 2, cy + 1, r * 0.55, 0.4, 2.4); g.stroke();
  }
  g.restore();
}

function drawBubbles(g, w, h, amount) {
  const rnd = mulberry32(730);
  const count = Math.round(amount * 14);
  g.save();
  for (let i = 0; i < count; i++) {
    const x = 18 + rnd() * (w - 36), y = 20 + rnd() * (h - 40);
    const r = 1.5 + rnd() * 4;
    g.strokeStyle = 'rgba(255,255,255,.55)';
    g.lineWidth = 0.8;
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.12)';
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(255,255,255,.7)';
    g.beginPath(); g.arc(x - r * 0.3, y - r * 0.3, 0.7, 0, Math.PI * 2); g.fill();
  }
  g.restore();
}

/* =========================================================
   Boot sequence & home screen
   ========================================================= */
function drawBootScreen(g, w, h) {
  const p = G.phone, o = G.order;
  const t = p.bootT;
  g.fillStyle = '#050608';
  g.fillRect(0, 0, w, h);
  if (t < 1.35) {
    const appear = clamp(t / 0.35, 0, 1);
    const fade = t > 1.05 ? clamp((1.35 - t) / 0.3, 0, 1) : 1;
    const a = appear * fade;
    g.save();
    g.globalAlpha = a;
    const cx = w / 2, cy = h * 0.43;
    const lg = g.createLinearGradient(cx - 30, cy - 30, cx + 30, cy + 30);
    lg.addColorStop(0, o.glowA);
    lg.addColorStop(1, o.glowB);
    g.fillStyle = lg;
    g.beginPath(); g.arc(cx, cy, 29, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.5)';
    g.lineWidth = 1;
    g.beginPath(); g.arc(cx, cy, 33, 0, Math.PI * 2); g.stroke();
    g.fillStyle = 'rgba(20,16,12,.82)';
    g.font = 'italic 700 25px Georgia,serif';
    g.textAlign = 'center';
    g.fillText('&', cx, cy + 9);
    g.fillStyle = 'rgba(255,245,230,.6)';
    g.font = '6px "Courier New",monospace';
    g.fillText(o.model.toUpperCase(), cx, cy + 46);
    g.restore();
    // spinner
    const sa = (t * 4.4) % (Math.PI * 2);
    g.strokeStyle = 'rgba(255,205,150,.7)';
    g.lineWidth = 1.6;
    g.beginPath();
    g.arc(w / 2, h * 0.63, 9, sa, sa + 1.5);
    g.stroke();
  } else {
    drawHomeScreen(g, w, h);
    if (t > 1.52) {
      const a = clamp((t - 1.52) / 0.22, 0, 1) * (t > 2.2 ? clamp((2.55 - t) / 0.3, 0, 1) : 1);
      g.save();
      g.globalAlpha = a;
      const bw = 146, bh = 30, bx = w / 2 - bw / 2, by = h * 0.5 - 15;
      fillRR(g, bx, by, bw, bh, 15, 'rgba(24,38,28,.92)');
      g.strokeStyle = 'rgba(120,210,140,.6)';
      g.lineWidth = 1;
      rrPath(g, bx, by, bw, bh, 15); g.stroke();
      g.strokeStyle = '#8ee0a2';
      g.lineWidth = 1.8;
      g.beginPath();
      g.moveTo(bx + 16, by + 15);
      g.lineTo(bx + 21, by + 20);
      g.lineTo(bx + 30, by + 10);
      g.stroke();
      g.fillStyle = '#d9f5df';
      g.font = '700 7.5px "Trebuchet MS",sans-serif';
      g.textAlign = 'left';
      g.fillText('All systems go', bx + 38, by + 18);
      g.restore();
    }
  }
}

function drawHomeScreen(g, w, h) {
  const o = G.order;
  drawWallpaper(g, 0, 0, w, h, o, 1);
  drawStatusBar(g, w, h, 0.9);
  g.save();
  g.fillStyle = 'rgba(255,255,255,.95)';
  g.textAlign = 'center';
  g.font = '300 38px "Trebuchet MS",sans-serif';
  g.fillText('9:41', w / 2, h * 0.14);
  g.font = '600 7px "Trebuchet MS",sans-serif';
  g.fillStyle = 'rgba(255,255,255,.7)';
  g.fillText('Saturday, June 21', w / 2, h * 0.185);

  const icons = [
    ['#e8893a', 'dot'], ['#5a9e8f', 'bars'], ['#7a7fd6', 'grid'], ['#c9688c', 'ring'],
    ['#d5b25e', 'tri'], ['#5f8f6b', 'leaf'], ['#b5645a', 'dot'], ['#6b8db5', 'grid'],
    ['#8d75b5', 'ring'], ['#6f9f8d', 'bars'], ['#c58c5a', 'leaf'], ['#7f8a96', 'dot']
  ];
  const cols = 4, size = 26, gapX = 13, gapY = 15;
  const startX = (w - (cols * size + (cols - 1) * gapX)) / 2;
  const startY = h * 0.27;
  icons.forEach(([col, glyph], i) => {
    const c = i % cols, r = Math.floor(i / cols);
    const x = startX + c * (size + gapX), y = startY + r * (size + gapY + 9);
    const lg = g.createLinearGradient(x, y, x, y + size);
    lg.addColorStop(0, shade(col, 0.18));
    lg.addColorStop(1, shade(col, -0.18));
    fillRR(g, x, y, size, size, 7, lg);
    g.fillStyle = 'rgba(255,255,255,.75)';
    drawGlyph(g, glyph, x + size / 2, y + size / 2);
    g.fillStyle = 'rgba(255,255,255,.55)';
    g.font = '4px "Trebuchet MS",sans-serif';
    g.fillText(['Maps', 'Notes', 'Photos', 'Music', 'Wallet', 'Home', 'Calls', 'Mail', 'Health', 'Files', 'Clock', 'Calc'][i], x + size / 2, y + size + 7);
  });
  // dock
  const dy = h - 58;
  fillRR(g, 18, dy, w - 36, 44, 12, 'rgba(255,255,255,.18)');
  ['#e8893a', '#5a9e8f', '#7a7fd6', '#d5b25e'].forEach((col, i) => {
    const x = 30 + i * ((w - 60) / 4), y = dy + 9;
    fillRR(g, x, y, 26, 26, 7, col);
    g.fillStyle = 'rgba(255,255,255,.75)';
    drawGlyph(g, ['dot', 'bars', 'ring', 'grid'][i], x + 13, y + 13);
  });
  g.restore();
}

function drawGlyph(g, kind, cx, cy) {
  g.save();
  g.translate(cx, cy);
  if (kind === 'dot') {
    g.beginPath(); g.arc(0, 0, 4.4, 0, Math.PI * 2); g.fill();
  } else if (kind === 'bars') {
    for (let i = 0; i < 3; i++) g.fillRect(-5 + i * 4, -2 + i * 2, 2, 6 - i * 2);
  } else if (kind === 'grid') {
    for (let i = 0; i < 4; i++) g.fillRect((i % 2) * 5 - 5, Math.floor(i / 2) * 5 - 5, 3.5, 3.5);
  } else if (kind === 'ring') {
    g.strokeStyle = 'rgba(255,255,255,.8)';
    g.lineWidth = 1.6;
    g.beginPath(); g.arc(0, 0, 4, 0, Math.PI * 2); g.stroke();
  } else if (kind === 'tri') {
    g.beginPath(); g.moveTo(0, -5); g.lineTo(5, 4); g.lineTo(-5, 4); g.closePath(); g.fill();
  } else if (kind === 'leaf') {
    g.beginPath(); g.ellipse(0, 0, 3, 5, 0.7, 0, Math.PI * 2); g.fill();
  }
  g.restore();
}

/* =========================================================
   Guides, tools, progress, particles
   ========================================================= */
function drawGuides(g) {
  if (G.mode !== 'playing' || G.jobDone) return;
  const t = currentTask();
  if (!t) return;
  const pulse = 0.5 + 0.5 * Math.sin(G.time * 4.2);
  g.save();
  g.lineWidth = 2;
  g.setLineDash([7, 7]);
  g.lineDashOffset = -G.time * 16;
  g.strokeStyle = `rgba(255,184,105,${0.22 + 0.3 * pulse})`;
  const outline = (x, y, w, h, r) => { rrPath(g, x, y, w, h, r || 10); g.stroke(); };
  switch (t.type) {
    case 'heat':
      outline(PHONE.x - 4, PHONE.y - 4, PHONE.w + 8, PHONE.h + 8, 36);
      break;
    case 'pry':
      outline(SCREEN.x, SCREEN.y, SCREEN.w, SCREEN.h, 22);
      break;
    case 'unscrew': {
      const set = SCREW_SETS[t.where];
      set.forEach((s, i) => {
        if (G.phone.screwProg[t.where][i] >= 1) return;
        g.beginPath(); g.arc(s.x, s.y, 14, 0, Math.PI * 2); g.stroke();
      });
      break;
    }
    case 'disconnect': {
      const c = CONNECTORS[t.name];
      g.beginPath(); g.arc(c.x, c.y, 23, 0, Math.PI * 2); g.stroke();
      break;
    }
    case 'remove': {
      if (t.part === 'screen') outline(SIDE_HIT.x, SIDE_HIT.y, SIDE_HIT.w, SIDE_HIT.h, 12);
      else if (t.part === 'protector') outline(SCREEN.x, SCREEN.y, SCREEN.w, SCREEN.h, 22);
      else {
        const r = PART_RECTS[t.part];
        outline(r.x - 4, r.y - 4, r.w + 8, r.h + 8, 8);
      }
      break;
    }
    case 'install': {
      const r = dropRect(t.part);
      g.strokeStyle = `rgba(130,220,150,${0.24 + 0.32 * pulse})`;
      outline(r.x - 5, r.y - 5, r.w + 10, r.h + 10, 12);
      break;
    }
    case 'clean':
    case 'smooth':
      outline(SCREEN.x + 2, SCREEN.y + 2, SCREEN.w - 4, SCREEN.h - 4, 22);
      break;
    case 'dry':
    case 'scrub':
      outline(INNER.x + 3, INNER.y + 3, INNER.w - 6, INNER.h - 6, 18);
      break;
    case 'close':
      outline(PHONE.x - 4, PHONE.y - 4, PHONE.w + 8, PHONE.h + 8, 36);
      break;
  }
  g.restore();
}

function dropRect(part) {
  if (part === 'screen' || part === 'protector') return SCREEN;
  return PART_RECTS[part] || SCREEN;
}

function drawHeatGun(g, x, y, active) {
  g.save();
  g.translate(x, y);
  g.rotate(-0.28);
  if (active) {
    const glow = g.createRadialGradient(6, 0, 2, 6, 0, 70);
    glow.addColorStop(0, 'rgba(255,170,80,.4)');
    glow.addColorStop(1, 'rgba(255,150,60,0)');
    g.fillStyle = glow;
    g.beginPath(); g.arc(6, 0, 70, 0, Math.PI * 2); g.fill();
  }
  // waves
  if (active) {
    g.strokeStyle = 'rgba(255,190,110,.7)';
    g.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
      const phase = (G.time * 3 + i * 0.7) % 2;
      g.globalAlpha = 0.65 * (1 - phase / 2);
      g.beginPath();
      g.moveTo(8 + phase * 8, -10);
      g.quadraticCurveTo(18 + phase * 8, -4, 8 + phase * 8, 2);
      g.quadraticCurveTo(18 + phase * 8, 8, 8 + phase * 8, 13);
      g.stroke();
    }
    g.globalAlpha = 1;
  }
  fillRR(g, -25, -7, 24, 14, 4, '#7d858d');
  fillRR(g, -61, -18, 38, 36, 8, '#383d43');
  fillRR(g, -57, -14, 30, 6, 3, 'rgba(255,255,255,.12)');
  fillRR(g, -46, 16, 15, 26, 5, '#2b2e33');
  g.fillStyle = '#e8893a';
  g.fillRect(-52, 10, 12, 3);
  g.fillStyle = 'rgba(255,255,255,.18)';
  g.fillRect(-60, 8, 36, 1.5);
  g.restore();
}

function drawToolGhost(g) {
  if (G.mode !== 'playing' || G.jobDone || G.locked || G.drag) return;
  const p = G.pointer;
  if (!p) return;
  const over = inPhone(p, 40) || inScreen(p, 24) || (G.phone.openT > 0.6 && inRect(p, INNER, 30));
  if (!over && !G.down) return;
  const tool = G.selected;
  const t = currentTask();
  const active = G.hold && t && (t.type === 'heat' || t.type === 'dry' || t.type === 'unscrew' || t.type === 'close');
  g.save();
  if (tool === 'heat') {
    drawHeatGun(g, p.x, p.y, Boolean(active));
  } else if (tool === 'driver') {
    g.translate(p.x, p.y);
    g.rotate(-0.72);
    fillRR(g, -2, -45, 4, 45, 2, '#b6bec6');
    fillRR(g, -1, -18, 2, 9, 1, 'rgba(255,255,255,.5)');
    fillRR(g, -8, -74, 16, 30, 6, '#b9503f');
    fillRR(g, -6, -70, 4, 22, 2, 'rgba(255,255,255,.25)');
    fillRR(g, -3, -45, 6, 5, 1, '#7d858d');
  } else if (tool === 'suction') {
    g.beginPath(); g.arc(p.x, p.y, 19, 0, Math.PI * 2);
    g.fillStyle = 'rgba(38,42,46,.75)'; g.fill();
    g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 2; g.stroke();
    g.beginPath(); g.arc(p.x, p.y, 12, 0, Math.PI * 2);
    g.fillStyle = 'rgba(255,255,255,.08)'; g.fill();
    fillRR(g, p.x - 3, p.y - 34, 6, 16, 3, '#c9ced3');
    fillRR(g, p.x - 13, p.y - 38, 26, 5, 2.5, '#c9ced3');
  } else if (tool === 'spudger') {
    g.translate(p.x, p.y);
    g.rotate(-0.76);
    g.beginPath();
    g.moveTo(0, 0); g.lineTo(4, -8); g.lineTo(52, -14); g.lineTo(54, -6); g.closePath();
    g.fillStyle = 'rgba(220,180,90,.9)'; g.fill();
    g.strokeStyle = 'rgba(80,60,20,.4)'; g.lineWidth = 1; g.stroke();
  } else if (tool === 'tweezers') {
    g.translate(p.x, p.y);
    g.rotate(-0.5);
    g.strokeStyle = '#cfd6dc';
    g.lineWidth = 3;
    g.beginPath(); g.moveTo(-1, 0); g.lineTo(4, -42); g.stroke();
    g.beginPath(); g.moveTo(6, 1); g.lineTo(12, -40); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.5)';
    g.lineWidth = 1;
    g.beginPath(); g.moveTo(2, -26); g.lineTo(7, -25); g.stroke();
  } else if (tool === 'cloth') {
    g.save();
    g.translate(p.x, p.y);
    g.rotate(-0.2 + Math.sin(G.time * 2) * 0.06);
    g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 6; g.shadowOffsetY = 3;
    fillRR(g, -28, -24, 56, 48, 9, 'rgba(240,228,200,.92)');
    g.strokeStyle = 'rgba(150,125,90,.4)'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(-28, -4); g.quadraticCurveTo(0, -14, 28, -2); g.stroke();
    g.beginPath(); g.moveTo(-28, 8); g.quadraticCurveTo(0, -2, 28, 10); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.25)';
    for (let i = 0; i < 12; i++) {
      g.fillRect(-22 + (i % 4) * 12, -18 + Math.floor(i / 4) * 13, 8, 1);
    }
    g.restore();
  } else if (tool === 'hand') {
    const down = G.hold ? 1 : 0;
    g.strokeStyle = 'rgba(255,205,145,.85)';
    g.lineWidth = 2;
    for (let i = 0; i < 2; i++) {
      const yy = p.y - 42 + i * 12 + down * 4;
      g.beginPath();
      g.moveTo(p.x - 8, yy); g.lineTo(p.x, yy + 8); g.lineTo(p.x + 8, yy);
      g.stroke();
    }
    g.beginPath();
    g.arc(p.x, p.y, 22 + down * 2, 0, Math.PI * 2);
    g.strokeStyle = 'rgba(255,205,145,.3)';
    g.stroke();
  }
  g.restore();
}

function drawDraggedPart(g) {
  const d = G.drag;
  if (!d || !d.part || (d.kind !== 'remove' && d.kind !== 'install')) return;
  if (!PART_NAT[d.part]) return;
  g.save();
  g.globalAlpha = 0.94;
  g.shadowColor = 'rgba(0,0,0,.55)';
  g.shadowBlur = 18;
  g.shadowOffsetY = 12;
  if (d.part === 'screen' || d.part === 'protector') {
    const s = 0.64;
    g.translate(d.x, d.y);
    g.rotate(-0.08);
    g.scale(s, s);
    g.translate(-109, -225);
    drawLooseGlass(g, 218, 450, {
      newScreen: d.kind === 'install' && d.part === 'screen',
      film: d.part === 'protector',
      cracked: d.kind === 'remove' && d.part === 'screen'
    });
  } else {
    const nat = PART_NAT[d.part];
    const s = 0.9;
    g.translate(d.x, d.y);
    g.rotate(-0.05);
    g.scale(s, s);
    g.translate(-nat.w / 2, -nat.h / 2);
    drawPartShape(g, d.part, nat.w, nat.h, d.kind === 'install' ? 'new' : 'broken');
  }
  g.restore();
}

function drawLooseGlass(g, w, h, opts) {
  g.save();
  rrPath(g, 0, 0, w, h, 22);
  g.clip();
  g.fillStyle = '#05070a';
  g.fillRect(0, 0, w, h);
  if (opts.film) {
    // clear protector on its backing card
    g.fillStyle = '#e9dfc7';
    g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(140,170,160,.18)';
    g.fillRect(0, 0, w, h * 0.22);
    g.strokeStyle = 'rgba(80,70,50,.22)';
    g.lineWidth = 1;
    for (let y = h * 0.28; y < h * 0.9; y += 14) {
      g.beginPath(); g.moveTo(20, y); g.lineTo(w - 20, y); g.stroke();
    }
    // glass film
    rrPath(g, 12, 14, w - 24, h - 28, 12);
    g.fillStyle = 'rgba(178,216,224,.34)';
    g.fill();
    g.strokeStyle = 'rgba(255,255,255,.7)';
    g.lineWidth = 1.2;
    g.stroke();
    g.save();
    rrPath(g, 12, 14, w - 24, h - 28, 12);
    g.clip();
    g.fillStyle = 'rgba(255,255,255,.35)';
    g.beginPath();
    g.moveTo(-20, h * 0.18); g.lineTo(w * 0.55, 0); g.lineTo(w * 0.3, h * 0.55); g.lineTo(-20, h * 0.7);
    g.closePath(); g.fill();
    g.restore();
    g.fillStyle = 'rgba(255,255,255,.55)';
    g.beginPath(); g.moveTo(w - 56, 14); g.lineTo(w - 12, 14); g.lineTo(w - 12, 52); g.closePath(); g.fill();
    g.fillStyle = 'rgba(30,40,42,.72)';
    g.font = '700 7px "Courier New",monospace';
    g.textAlign = 'center';
    g.fillText('TEMPERED', w / 2, h - 40);
    g.fillText('GLASS', w / 2, h - 30);
    drawDustSpecks(g, w, h, 0.25);
  } else {
    drawWallpaper(g, 0, 0, w, h, G.order, 1);
    drawStatusBar(g, w, h, 0.7);
    fillRR(g, w / 2 - 31, 8, 62, 17, 9, '#030405');
  }
  if (opts.cracked) {
    drawCracks(g, G.phone.cracks, w, h, 1, 0);
  }
  // reflection
  g.save();
  g.globalAlpha = 0.1;
  g.fillStyle = '#fff';
  g.beginPath();
  g.moveTo(-30, h * 0.12); g.lineTo(w * 0.55, h * 0.03); g.lineTo(w * 0.3, h * 0.6); g.lineTo(-10, h * 0.7);
  g.closePath(); g.fill();
  g.restore();
  strokeRR(g, 1, 1, w - 2, h - 2, 21, 'rgba(255,255,255,.14)', 1.5);
  g.restore();
}

function drawProgress(g) {
  if (G.mode !== 'playing') return;
  const t = currentTask();
  if (G.hold && G.hold.progress != null) {
    drawRing(g, G.hold.x, G.hold.y, G.hold.r || 28, clamp(G.hold.progress, 0, 1));
  }
  if (G.drag && G.drag.kind === 'pry') {
    drawRing(g, G.pointer.x, G.pointer.y, 30, clamp(G.drag.lift || 0, 0, 1));
  }
  if (t && (t.type === 'clean' || t.type === 'smooth' || t.type === 'scrub') && t.progress > 0.02) {
    const p = clamp(t.progress, 0, 1);
    const x = 600 - 90, y = 643;
    fillRR(g, x, y, 180, 7, 3.5, 'rgba(10,8,6,.55)');
    fillRR(g, x + 1, y + 1, 178 * p, 5, 2.5, 'rgba(255,180,100,.85)');
    g.fillStyle = 'rgba(255,225,190,.8)';
    g.font = '700 7px "Courier New",monospace';
    g.textAlign = 'center';
    g.fillText(t.type === 'scrub' ? 'SCRUBBING' : t.type === 'smooth' ? 'SMOOTHING' : 'WIPING', 600, y - 5);
  }
}

function drawRing(g, x, y, r, p) {
  g.save();
  g.lineCap = 'round';
  g.strokeStyle = 'rgba(0,0,0,.4)';
  g.lineWidth = 6;
  g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.stroke();
  g.strokeStyle = 'rgba(255,190,110,.95)';
  g.lineWidth = 4;
  g.beginPath(); g.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p); g.stroke();
  g.restore();
}

function drawParticles(g) {
  if (!G.particles) return;
  for (const p of G.particles) {
    const a = clamp(p.life / p.max, 0, 1);
    g.save();
    g.globalAlpha = a;
    g.translate(p.x, p.y);
    g.rotate(p.rot || 0);
    if (p.shape === 'rect') {
      g.fillStyle = p.color;
      g.fillRect(-p.size, -p.size * 0.5, p.size * 2, p.size);
    } else {
      g.fillStyle = p.color;
      g.beginPath(); g.arc(0, 0, p.size, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }
}

const dustMotes = (() => {
  const rnd = mulberry32(1979);
  return Array.from({ length: 26 }, () => ({
    x: rnd() * W, y: rnd() * H, r: 0.6 + rnd() * 1.8,
    sx: (rnd() - 0.5) * 6, sy: -2 - rnd() * 5, ph: rnd() * 6.28
  }));
})();

function drawDust(g) {
  if (!G) return;
  const t = G.time;
  for (const d of dustMotes) {
    const x = ((d.x + t * d.sx) % W + W) % W;
    const y = ((d.y + t * d.sy) % H + H) % H;
    g.globalAlpha = 0.05 + 0.05 * Math.sin(t * 0.8 + d.ph);
    g.fillStyle = '#ffe2b5';
    g.beginPath(); g.arc(x, y, d.r, 0, Math.PI * 2); g.fill();
  }
  g.globalAlpha = 1;
}

/* =========================================================
   Background cache + main render
   ========================================================= */
const bgCanvas = document.createElement('canvas');
bgCanvas.width = W * DPR;
bgCanvas.height = H * DPR;
const bgx = bgCanvas.getContext('2d');
bgx.setTransform(DPR, 0, 0, DPR, 0, 0);
drawDesk(bgx);

function render() {
  if (!G) return;
  ctx.clearRect(0, 0, W, H);
  ctx.drawImage(bgCanvas, 0, 0, W, H);
  drawBin(ctx);
  drawPartsTray(ctx);
  drawPhone(ctx);
  drawGuides(ctx);
  drawDraggedPart(ctx);
  drawToolGhost(ctx);
  drawProgress(ctx);
  drawParticles(ctx);
  drawDust(ctx);
}
