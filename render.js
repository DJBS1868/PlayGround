/* Pixel & Sons — workbench, phone and parts rendering. */
'use strict';

function rrPath(g, x, y, w, h, r) {
  const rad = Math.max(0, Math.min(r, w / 2, h / 2));
  g.beginPath();
  g.moveTo(x + rad, y);
  g.arcTo(x + w, y, x + w, y + h, rad);
  g.arcTo(x + w, y + h, x, y + h, rad);
  g.arcTo(x, y + h, x, y, rad);
  g.arcTo(x, y, x + w, y, rad);
  g.closePath();
}
function fillRR(g, x, y, w, h, r, fill) {
  rrPath(g, x, y, w, h, r);
  g.fillStyle = fill;
  g.fill();
}
function strokeRR(g, x, y, w, h, r, stroke, lw) {
  rrPath(g, x, y, w, h, r);
  g.strokeStyle = stroke;
  g.lineWidth = lw || 1;
  g.stroke();
}

/* =========================================================
   Background (cached once)
   ========================================================= */
function drawDesk(g) {
  const planks = ['#6d4a31', '#65432b', '#714e34', '#603f28', '#6a4730', '#68442d', '#714a30', '#5f3e27'];
  for (let y = 0, i = 0; y < H; y += 96, i++) {
    g.fillStyle = planks[i % planks.length];
    g.fillRect(0, y, W, 96);
    const lg = g.createLinearGradient(0, y, 0, y + 96);
    lg.addColorStop(0, 'rgba(255,222,180,.055)');
    lg.addColorStop(0.55, 'rgba(0,0,0,0)');
    lg.addColorStop(1, 'rgba(0,0,0,.14)');
    g.fillStyle = lg;
    g.fillRect(0, y, W, 96);
    const rnd = mulberry32(900 + i * 37);
    for (let k = 0; k < 8; k++) {
      const gy = y + 6 + rnd() * 84;
      g.beginPath();
      g.moveTo(-30, gy);
      for (let x = 0; x <= W + 30; x += 90) {
        g.lineTo(x, gy + Math.sin(x * 0.006 + k * 2.1) * 4 + (rnd() - 0.5) * 3);
      }
      g.strokeStyle = k % 3 === 0 ? 'rgba(255,222,180,.04)' : 'rgba(0,0,0,.07)';
      g.lineWidth = 0.8 + rnd() * 1.4;
      g.stroke();
    }
    g.fillStyle = 'rgba(0,0,0,.32)';
    g.fillRect(0, y, W, 2);
    g.fillStyle = 'rgba(255,222,180,.045)';
    g.fillRect(0, y + 2, W, 1);
  }
  // knots
  const kr = mulberry32(4242);
  for (let i = 0; i < 6; i++) {
    const kx = 40 + kr() * 1120, ky = 20 + kr() * 720;
    g.save();
    g.translate(kx, ky);
    g.rotate(kr() * 0.6);
    for (let j = 0; j < 3; j++) {
      g.beginPath();
      g.ellipse(0, 0, 9 + j * 5, 4 + j * 2.4, 0, 0, Math.PI * 2);
      g.strokeStyle = 'rgba(0,0,0,.09)';
      g.lineWidth = 1;
      g.stroke();
    }
    g.restore();
  }

  // mat shadow + mat
  g.save();
  g.shadowColor = 'rgba(0,0,0,.5)';
  g.shadowBlur = 28;
  g.shadowOffsetY = 13;
  fillRR(g, 330, 62, 570, 610, 24, '#234540');
  g.restore();
  const mg = g.createLinearGradient(0, 66, 0, 668);
  mg.addColorStop(0, '#2c524b');
  mg.addColorStop(0.55, '#274a44');
  mg.addColorStop(1, '#1e3b37');
  fillRR(g, 337, 69, 556, 596, 19, mg);

  // grid + ruler marks
  g.save();
  rrPath(g, 337, 69, 556, 596, 19);
  g.clip();
  g.strokeStyle = 'rgba(215,242,232,.055)';
  g.lineWidth = 1;
  for (let x = 352; x < 900; x += 34) {
    g.beginPath(); g.moveTo(x, 70); g.lineTo(x, 665); g.stroke();
  }
  for (let y = 84; y < 665; y += 34) {
    g.beginPath(); g.moveTo(338, y); g.lineTo(892, y); g.stroke();
  }
  g.strokeStyle = 'rgba(225,248,240,.11)';
  for (let x = 344; x < 892; x += 17) {
    const tall = (x - 344) % 85 === 0;
    g.beginPath(); g.moveTo(x, 72); g.lineTo(x, 72 + (tall ? 10 : 5)); g.stroke();
    g.beginPath(); g.moveTo(x, 662); g.lineTo(x, 662 - (tall ? 8 : 4)); g.stroke();
  }
  g.fillStyle = 'rgba(225,245,235,.1)';
  g.font = '700 12px "Courier New",monospace';
  g.textAlign = 'center';
  g.fillText('P I X E L   &   S O N S', 615, 646);
  g.font = '8px "Courier New",monospace';
  g.fillStyle = 'rgba(225,245,235,.07)';
  g.fillText('P R E C I S I O N   W O R K   S U R F A C E', 615, 658);
  g.restore();
  strokeRR(g, 337, 69, 556, 596, 19, 'rgba(230,248,240,.09)', 1.5);

  drawProps(g);

  // warm overhead light
  const light = g.createRadialGradient(600, 250, 40, 600, 280, 560);
  light.addColorStop(0, 'rgba(255,205,140,.13)');
  light.addColorStop(0.55, 'rgba(255,190,120,.04)');
  light.addColorStop(1, 'rgba(255,180,110,0)');
  g.fillStyle = light;
  g.fillRect(0, 0, W, H);

  // vignette
  const vig = g.createRadialGradient(600, 360, 260, 600, 380, 760);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(0.72, 'rgba(0,0,0,.16)');
  vig.addColorStop(1, 'rgba(0,0,0,.62)');
  g.fillStyle = vig;
  g.fillRect(0, 0, W, H);
}

function drawProps(g) {
  // coffee mug (bottom right)
  g.save();
  g.translate(1102, 686);
  g.fillStyle = 'rgba(0,0,0,.35)';
  g.beginPath(); g.ellipse(12, 16, 38, 14, 0, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.arc(0, 0, 30, 0, Math.PI * 2);
  g.fillStyle = '#e6ddc9'; g.fill();
  g.beginPath(); g.arc(0, 0, 30, 0, Math.PI * 2);
  g.strokeStyle = 'rgba(120,90,60,.35)'; g.lineWidth = 1.5; g.stroke();
  g.beginPath(); g.arc(0, 0, 23, 0, Math.PI * 2);
  g.fillStyle = '#4b2b17'; g.fill();
  g.beginPath(); g.arc(-7, -7, 9, 0, Math.PI * 2);
  g.fillStyle = 'rgba(255,235,205,.08)'; g.fill();
  g.beginPath(); g.arc(32, -2, 12, -1.2, 1.4);
  g.strokeStyle = '#d8cdb6'; g.lineWidth = 6; g.stroke();
  g.restore();

  // notebook (bottom right, left of mug)
  g.save();
  g.translate(982, 662);
  g.rotate(-0.13);
  g.fillStyle = 'rgba(0,0,0,.35)';
  fillRR(g, 4, 6, 92, 58, 4, 'rgba(0,0,0,.3)');
  fillRR(g, 0, 0, 92, 58, 4, '#eadfc6');
  g.strokeStyle = 'rgba(80,58,35,.25)';
  g.lineWidth = 1;
  for (let y = 12; y < 54; y += 10) {
    g.beginPath(); g.moveTo(12, y); g.lineTo(84, y); g.stroke();
  }
  g.fillStyle = 'rgba(80,58,35,.6)';
  for (let y = 7; y < 56; y += 9) { g.beginPath(); g.arc(4, y, 1.8, 0, Math.PI * 2); g.fill(); }
  g.strokeStyle = '#c0a45a'; g.lineWidth = 3.2;
  g.beginPath(); g.moveTo(20, 44); g.lineTo(74, 30); g.stroke();
  g.fillStyle = '#d9cba8';
  g.beginPath(); g.moveTo(74, 30); g.lineTo(82, 28); g.lineTo(75, 34); g.closePath(); g.fill();
  g.restore();

  // plant (bottom left)
  g.save();
  g.translate(72, 664);
  g.fillStyle = 'rgba(0,0,0,.35)';
  g.beginPath(); g.ellipse(4, 24, 32, 11, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#9c5d3e';
  g.beginPath();
  g.moveTo(-24, -2); g.lineTo(24, -2); g.lineTo(17, 28); g.lineTo(-17, 28); g.closePath(); g.fill();
  g.fillStyle = '#b06c49';
  g.beginPath(); g.ellipse(0, -2, 24, 7, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#3e6b48';
  const leaves = [[-18, -30, -0.7], [-4, -42, 0.1], [14, -34, 0.7], [-24, -14, -1.2], [24, -16, 1.2]];
  for (const [lx, ly, rot] of leaves) {
    g.save(); g.translate(lx, ly); g.rotate(rot);
    g.beginPath(); g.ellipse(0, 0, 8, 20, 0, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  g.fillStyle = 'rgba(120,190,130,.18)';
  g.beginPath(); g.ellipse(-6, -40, 3, 10, 0.1, 0, Math.PI * 2); g.fill();
  g.restore();

  // jar of spare screws
  g.save();
  g.translate(160, 700);
  g.fillStyle = 'rgba(0,0,0,.3)';
  g.beginPath(); g.ellipse(4, 20, 24, 8, 0, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.arc(0, 0, 22, 0, Math.PI * 2);
  g.fillStyle = 'rgba(205,222,215,.22)'; g.fill();
  g.strokeStyle = 'rgba(220,240,230,.28)'; g.lineWidth = 1.4; g.stroke();
  g.fillStyle = 'rgba(210,175,90,.7)';
  const rnd = mulberry32(77);
  for (let i = 0; i < 12; i++) {
    g.beginPath(); g.arc((rnd() - 0.5) * 30, (rnd() - 0.5) * 30, 1.4 + rnd() * 1.2, 0, Math.PI * 2); g.fill();
  }
  g.beginPath(); g.arc(0, 0, 22, 0, Math.PI * 2);
  g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 2; g.stroke();
  g.fillStyle = '#5b4a3a';
  g.fillRect(-23, -26, 46, 9);
  g.restore();

  // parts dish
  g.save();
  g.translate(156, 486);
  g.fillStyle = 'rgba(0,0,0,.3)';
  g.beginPath(); g.ellipse(4, 8, 44, 16, 0, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(0, 0, 42, 19, 0, 0, Math.PI * 2);
  g.fillStyle = '#586066'; g.fill();
  g.beginPath(); g.ellipse(0, 0, 36, 15, 0, 0, Math.PI * 2);
  g.fillStyle = '#41494e'; g.fill();
  const rnd2 = mulberry32(91);
  for (let i = 0; i < 10; i++) {
    g.beginPath();
    g.arc((rnd2() - 0.5) * 54, (rnd2() - 0.5) * 20, 1.2 + rnd2() * 1.6, 0, Math.PI * 2);
    g.fillStyle = i % 3 ? '#c6a05d' : '#9aa3ab';
    g.fill();
  }
  g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 1;
  g.beginPath(); g.ellipse(0, 0, 36, 15, 0, 0, Math.PI * 2); g.stroke();
  g.restore();

  // loose screwdriver
  g.save();
  g.translate(58, 430);
  g.rotate(0.42);
  g.fillStyle = 'rgba(0,0,0,.28)';
  fillRR(g, 2, 4, 100, 12, 6, 'rgba(0,0,0,.28)');
  fillRR(g, 0, 0, 54, 12, 5, '#b94f3c');
  fillRR(g, 54, 3, 46, 5, 2, '#aeb6bd');
  fillRR(g, 54, 5, 10, 1.4, 1, 'rgba(255,255,255,.5)');
  g.fillStyle = 'rgba(255,255,255,.18)';
  fillRR(g, 8, 2, 26, 2.4, 1, 'rgba(255,255,255,.18)');
  g.restore();
}

/* =========================================================
   Broken-parts bin & new-parts tray
   ========================================================= */
function drawBin(g) {
  const b = BIN;
  const hover = G && G.drag && G.drag.kind === 'remove' && inRect(G.pointer, b, 18);
  g.save();
  g.fillStyle = 'rgba(0,0,0,.4)';
  g.beginPath();
  g.ellipse(b.x + b.w / 2 + 5, b.y + b.h - 2, b.w * 0.56, 17, 0, 0, Math.PI * 2);
  g.fill();
  fillRR(g, b.x, b.y, b.w, b.h, 9, '#a5713f');
  // flaps
  g.fillStyle = '#b47f47';
  g.beginPath();
  g.moveTo(b.x, b.y + 6); g.lineTo(b.x + 22, b.y + 28); g.lineTo(b.x, b.y + 34); g.closePath(); g.fill();
  g.beginPath();
  g.moveTo(b.x + b.w, b.y + 6); g.lineTo(b.x + b.w - 22, b.y + 28); g.lineTo(b.x + b.w, b.y + 34); g.closePath(); g.fill();
  // opening
  fillRR(g, b.x + 9, b.y + 12, b.w - 18, b.h - 26, 5, '#332317');
  const ig = g.createLinearGradient(b.x, b.y + 14, b.x, b.y + b.h - 10);
  ig.addColorStop(0, 'rgba(0,0,0,.6)');
  ig.addColorStop(1, 'rgba(0,0,0,.1)');
  fillRR(g, b.x + 9, b.y + 12, b.w - 18, b.h - 26, 5, ig);
  // shards and bits
  g.save();
  rrPath(g, b.x + 9, b.y + 12, b.w - 18, b.h - 26, 5);
  g.clip();
  g.fillStyle = 'rgba(190,215,225,.32)';
  g.beginPath();
  g.moveTo(b.x + 22, b.y + 50); g.lineTo(b.x + 44, b.y + 36); g.lineTo(b.x + 52, b.y + 66); g.lineTo(b.x + 30, b.y + 72); g.closePath(); g.fill();
  g.beginPath();
  g.moveTo(b.x + 62, b.y + 84); g.lineTo(b.x + 86, b.y + 74); g.lineTo(b.x + 78, b.y + 100); g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,255,255,.14)';
  g.beginPath(); g.moveTo(b.x + 26, b.y + 52); g.lineTo(b.x + 38, b.y + 42); g.lineTo(b.x + 33, b.y + 60); g.closePath(); g.fill();
  g.fillStyle = '#c9a35a';
  for (let i = 0; i < 5; i++) {
    g.beginPath(); g.arc(b.x + 30 + i * 14, b.y + 108 - (i % 2) * 6, 2.2, 0, Math.PI * 2); g.fill();
  }
  g.restore();
  // label
  g.save();
  g.translate(b.x + b.w / 2, b.y + b.h - 18);
  g.rotate(-0.035);
  fillRR(g, -44, -11, 88, 22, 2, '#efe1c3');
  g.fillStyle = '#a34d38';
  g.font = '700 8px "Courier New",monospace';
  g.textAlign = 'center';
  g.fillText('BROKEN PARTS', 0, 1);
  g.fillStyle = 'rgba(120,80,40,.5)';
  g.font = '5px "Courier New",monospace';
  g.fillText('PLEASE RECYCLE', 0, 8);
  g.restore();
  if (hover) {
    g.strokeStyle = `rgba(255,176,90,${0.5 + 0.3 * Math.sin(G.time * 8)})`;
    g.lineWidth = 2.5;
    g.setLineDash([6, 5]);
    rrPath(g, b.x - 5, b.y - 5, b.w + 10, b.h + 10, 12);
    g.stroke();
    g.setLineDash([]);
  }
  g.restore();
}

function drawPartsTray(g) {
  g.save();
  g.fillStyle = 'rgba(0,0,0,.4)';
  g.beginPath();
  g.ellipse(TRAY.x + TRAY.w / 2 + 4, TRAY.y + TRAY.h - 4, TRAY.w * 0.56, 18, 0, 0, Math.PI * 2);
  g.fill();
  const wood = g.createLinearGradient(TRAY.x, TRAY.y, TRAY.x + TRAY.w, TRAY.y + TRAY.h);
  wood.addColorStop(0, '#4d3624');
  wood.addColorStop(0.6, '#3b2a1d');
  wood.addColorStop(1, '#2c1f15');
  fillRR(g, TRAY.x, TRAY.y, TRAY.w, TRAY.h, 14, wood);
  strokeRR(g, TRAY.x, TRAY.y, TRAY.w, TRAY.h, 14, 'rgba(255,214,160,.18)', 1.5);
  fillRR(g, TRAY.x + 6, TRAY.y + 6, TRAY.w - 12, TRAY.h - 12, 10, '#21180f');
  g.fillStyle = 'rgba(240,220,190,.42)';
  g.font = '700 7.5px "Courier New",monospace';
  g.textAlign = 'center';
  g.fillText('N E W   P A R T S', TRAY.x + TRAY.w / 2, TRAY.y + 20);

  const slots = typeof traySlots === 'function' ? traySlots() : [];
  if (!slots.length) {
    g.fillStyle = 'rgba(230,210,180,.22)';
    g.font = '7px "Courier New",monospace';
    g.fillText('NO PARTS NEEDED', TRAY.x + TRAY.w / 2, TRAY.y + 68);
    // a few spare screws in the empty tray
    const rnd = mulberry32(303);
    for (let i = 0; i < 9; i++) {
      g.beginPath();
      g.arc(TRAY.x + 30 + rnd() * 70, TRAY.y + 100 + rnd() * 210, 1.6, 0, Math.PI * 2);
      g.fillStyle = 'rgba(200,165,90,.35)'; g.fill();
    }
    g.restore();
    return;
  }
  for (const slot of slots) {
    const active = typeof currentTask === 'function' && currentTask() && currentTask().type === 'install' && currentTask().part === slot.part;
    const installed = typeof partInstalled === 'function' && partInstalled(slot.part);
    const x = slot.cx - slot.w / 2, y = slot.cy - slot.h / 2;
    if (active) {
      const pulse = 0.45 + 0.35 * Math.sin(G.time * 5);
      strokeRR(g, x - 4, y - 4, slot.w + 8, slot.h + 8, 8, `rgba(255,176,90,${pulse})`, 1.5);
      fillRR(g, x - 4, y - 4, slot.w + 8, slot.h + 8, 8, 'rgba(255,160,70,.06)');
    } else {
      strokeRR(g, x - 4, y - 4, slot.w + 8, slot.h + 8, 8, 'rgba(240,220,190,.08)', 1);
    }
    if (installed) {
      g.fillStyle = 'rgba(160,210,160,.5)';
      g.font = '7px "Courier New",monospace';
      g.fillText('FITTED ✓', slot.cx, slot.cy + 2);
    } else {
      drawPartSprite(g, slot.part, slot.cx, slot.cy, slot.w, slot.h);
    }
    g.fillStyle = active ? 'rgba(255,205,150,.82)' : 'rgba(230,210,180,.36)';
    g.font = '700 7px "Courier New",monospace';
    g.fillText(PART_LABEL[slot.part], slot.cx, slot.cy + slot.h / 2 + 15);
  }
  g.restore();
}

/* =========================================================
   Phone
   ========================================================= */
function screenTransform() {
  const p = G.phone;
  const o = ease(clamp(p.openT, 0, 1));
  const lift = (1 - p.seat) * 17 * (1 - o);
  return {
    open: o,
    cx: lerp(600, SIDE_SCREEN.cx, o),
    cy: lerp(392, SIDE_SCREEN.cy, o) - lift,
    scale: lerp(1, SIDE_SCREEN.scale, o),
    rot: lerp(0, SIDE_SCREEN.rot, o)
  };
}

function drawPhone(g) {
  const p = G.phone, o = G.order;
  if (!p || !o) return;

  // soft shadow
  g.save();
  g.translate(600, 622);
  g.scale(1, 0.16);
  const sh = g.createRadialGradient(0, 0, 30, 0, 0, 180);
  sh.addColorStop(0, 'rgba(0,0,0,.56)');
  sh.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = sh;
  g.beginPath(); g.arc(0, 0, 180, 0, Math.PI * 2); g.fill();
  g.restore();

  // body
  const bg = g.createLinearGradient(PHONE.x, PHONE.y, PHONE.x + PHONE.w, PHONE.y + PHONE.h);
  bg.addColorStop(0, shade(o.body, 0.26));
  bg.addColorStop(0.32, o.body);
  bg.addColorStop(1, shade(o.body, -0.4));
  fillRR(g, PHONE.x, PHONE.y, PHONE.w, PHONE.h, 34, bg);
  strokeRR(g, PHONE.x + 1, PHONE.y + 1, PHONE.w - 2, PHONE.h - 2, 33, 'rgba(255,255,255,.2)', 1.2);
  fillRR(g, PHONE.x + 8, PHONE.y + 8, PHONE.w - 16, PHONE.h - 16, 27, '#0b0d0f');
  strokeRR(g, PHONE.x + 10, PHONE.y + 10, PHONE.w - 20, PHONE.h - 20, 25, 'rgba(255,255,255,.055)', 1);

  // side buttons
  fillRR(g, PHONE.x + PHONE.w - 1, 240, 5, 42, 2.5, shade(o.body, -0.3));
  fillRR(g, PHONE.x + PHONE.w - 1, 292, 5, 26, 2.5, shade(o.body, -0.3));
  fillRR(g, PHONE.x - 4, 258, 5, 32, 2.5, shade(o.body, -0.3));
  fillRR(g, PHONE.x - 4, 300, 5, 48, 2.5, shade(o.body, -0.3));

  drawInterior(g);

  // ribbon to loose screen
  const tr = screenTransform();
  if (tr.open > 0.35 && !p.screenRemoved) {
    g.save();
    g.strokeStyle = '#c67a32';
    g.lineWidth = 4;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(tr.cx + 72, tr.cy + 120);
    g.bezierCurveTo(500, 470, 500, 420, 495, 370);
    g.stroke();
    g.strokeStyle = 'rgba(255,220,160,.35)';
    g.lineWidth = 1.2;
    g.stroke();
    g.restore();
  }

  // screen panel
  const draggingScreen = G.drag && G.drag.kind === 'remove' && G.drag.part === 'screen';
  if (!p.screenRemoved && !draggingScreen) {
    g.save();
    if (tr.open > 0.4) {
      g.save();
      g.translate(tr.cx, tr.cy + 4);
      g.scale(1, 0.9);
      g.fillStyle = 'rgba(0,0,0,.35)';
      rrPath(g, -109, -225, 218, 450, 24);
      g.filter = 'blur(10px)';
      g.fill();
      g.restore();
    }
    g.translate(tr.cx, tr.cy);
    g.rotate(tr.rot);
    g.scale(tr.scale, tr.scale);
    drawPhoneGlass(g, -109, -225, 218, 450);
    g.restore();
  }

  // power button hint
  if (G.mode === 'playing' && currentTask() && currentTask().type === 'test' && !p.powerOn) {
    const pulse = 0.5 + 0.5 * Math.sin(G.time * 5);
    g.save();
    g.strokeStyle = `rgba(255,196,110,${0.35 + pulse * 0.5})`;
    g.lineWidth = 2;
    g.beginPath(); g.arc(POWER.x, POWER.y, 18 + pulse * 6, 0, Math.PI * 2); g.stroke();
    g.restore();
  }
}

function drawInterior(g) {
  const p = G.phone;
  if (!p) return;
  fillRR(g, INNER.x, INNER.y, INNER.w, INNER.h, 18, '#14181a');
  strokeRR(g, INNER.x + 1, INNER.y + 1, INNER.w - 2, INNER.h - 2, 17, 'rgba(255,255,255,.05)', 1);
  // adhesive border
  g.save();
  rrPath(g, INNER.x + 5, INNER.y + 5, INNER.w - 10, INNER.h - 10, 14);
  g.strokeStyle = 'rgba(20,20,20,.7)';
  g.setLineDash([4, 5]);
  g.lineWidth = 3;
  g.stroke();
  g.setLineDash([]);
  g.restore();

  // mainboard
  fillRR(g, 503, 180, 190, 112, 9, '#24332e');
  g.save();
  rrPath(g, 503, 180, 190, 112, 9);
  g.clip();
  g.strokeStyle = 'rgba(215,180,90,.16)';
  g.lineWidth = 1;
  for (let i = 0; i < 9; i++) {
    g.beginPath();
    g.moveTo(506, 188 + i * 11);
    g.lineTo(540, 188 + i * 11);
    g.lineTo(548, 194 + i * 11);
    g.lineTo(690, 194 + i * 11);
    g.stroke();
  }
  for (let i = 0; i < 6; i++) {
    g.beginPath();
    g.moveTo(556 + i * 20, 184);
    g.lineTo(556 + i * 20, 286);
    g.stroke();
  }
  // small chips
  const chips = [[508, 238, 30, 22], [544, 260, 20, 16], [668, 184, 20, 26], [562, 184, 30, 14]];
  for (const [x, y, w, h] of chips) {
    fillRR(g, x, y, w, h, 2, '#171b1c');
    g.fillStyle = 'rgba(220,230,225,.08)';
    g.fillRect(x + 2, y + 2, w - 4, 2);
  }
  g.restore();
  // shield
  fillRR(g, 584, 198, 96, 56, 5, '#2b3338');
  strokeRR(g, 584, 198, 96, 56, 5, 'rgba(255,255,255,.09)', 1);
  g.fillStyle = 'rgba(230,235,235,.2)';
  g.font = '700 7px "Courier New",monospace';
  g.textAlign = 'center';
  g.fillText('P&S · A9', 632, 228);
  g.fillStyle = 'rgba(230,235,235,.09)';
  g.font = '5px "Courier New",monospace';
  g.fillText('LOGIC  BOARD', 632, 239);
  // little gold pads
  g.fillStyle = 'rgba(215,175,90,.4)';
  for (let i = 0; i < 5; i++) g.fillRect(506 + i * 8, 184, 4, 3);

  // corrosion for water damage
  if (p.corrosion > 0) {
    const rnd = mulberry32(404);
    g.save();
    for (let i = 0; i < 26; i++) {
      const cx = 505 + rnd() * 186, cy = 182 + rnd() * 104;
      const r = 1 + rnd() * 5;
      g.globalAlpha = p.corrosion * (0.25 + rnd() * 0.4);
      g.fillStyle = i % 2 ? '#4f8f6d' : '#7fae7a';
      g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }

  drawCamera(g);
  drawBattery(g);
  drawSpeaker(g);
  drawPort(g);

  // flex cables + connectors
  if (p.screenRemoved || p.openT > 0.55) {
    g.save();
    g.strokeStyle = '#b5722e';
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(657, 312);
    g.bezierCurveTo(690, 292, 700, 270, 704, 250);
    g.stroke();
    g.strokeStyle = 'rgba(255,215,150,.3)';
    g.lineWidth = 1;
    g.stroke();
    g.restore();
  }
  drawConnector(g, 'display');
  drawConnector(g, 'battery');
  drawConnector(g, 'camera');

  drawScrews(g, 'bottom');
  if (G.order.repair === 'port') drawScrews(g, 'port');
  if (G.order.repair === 'speaker') drawScrews(g, 'speaker');
}

function drawCamera(g) {
  const p = G.phone;
  const r = PART_RECTS.camera;
  const dragging = G.drag && G.drag.kind === 'remove' && G.drag.part === 'camera';
  const state = dragging ? 'gone' : p.parts.camera;
  if (state === 'gone') {
    g.save();
    g.setLineDash([5, 4]);
    strokeRR(g, r.x, r.y, r.w, r.h, 9, 'rgba(255,170,120,.4)', 1.5);
    g.setLineDash([]);
    g.fillStyle = 'rgba(255,190,150,.35)';
    g.font = '6px "Courier New",monospace';
    g.textAlign = 'center';
    g.fillText('CAMERA', r.x + r.w / 2, r.y + r.h / 2 + 2);
    g.restore();
    return;
  }
  fillRR(g, r.x, r.y, r.w, r.h, 9, '#20262a');
  strokeRR(g, r.x, r.y, r.w, r.h, 9, 'rgba(255,255,255,.12)', 1);
  const lenses = [[r.x + 20, r.y + 22, 12], [r.x + 45, r.y + 22, 10], [r.x + 20, r.y + 46, 9]];
  lenses.forEach(([x, y, rr], i) => {
    g.beginPath(); g.arc(x, y, rr, 0, Math.PI * 2);
    g.fillStyle = '#0c1014'; g.fill();
    g.beginPath(); g.arc(x, y, rr - 3, 0, Math.PI * 2);
    g.fillStyle = i === 0 ? '#1b2b44' : '#182226'; g.fill();
    g.beginPath(); g.arc(x - rr * 0.3, y - rr * 0.3, rr * 0.28, 0, Math.PI * 2);
    g.fillStyle = 'rgba(160,200,255,.35)'; g.fill();
  });
  g.fillStyle = '#d9c58a';
  g.beginPath(); g.arc(r.x + 47, r.y + 48, 4, 0, Math.PI * 2); g.fill();
  if (p.parts.camera === 'broken') {
    g.strokeStyle = 'rgba(255,240,220,.8)';
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(r.x + 12, r.y + 12); g.lineTo(r.x + 31, r.y + 33); g.lineTo(r.x + 26, r.y + 50);
    g.moveTo(r.x + 31, r.y + 33); g.lineTo(r.x + 53, r.y + 41);
    g.stroke();
    g.fillStyle = 'rgba(190,80,60,.4)';
    g.beginPath(); g.arc(r.x + 20, r.y + 22, 5, 0, Math.PI * 2); g.fill();
  }
  if (p.parts.camera === 'new') {
    fillRR(g, r.x + 42, r.y + 4, 19, 10, 2, 'rgba(120,200,130,.9)');
    g.fillStyle = '#102416';
    g.font = '700 5px "Courier New",monospace';
    g.fillText('NEW', r.x + 51, r.y + 11);
  }
}

function drawBattery(g) {
  const p = G.phone;
  const r = PART_RECTS.battery;
  const dragging = G.drag && G.drag.kind === 'remove' && G.drag.part === 'battery';
  const state = dragging ? 'gone' : p.parts.battery;
  if (state === 'gone') {
    g.save();
    g.setLineDash([5, 4]);
    strokeRR(g, r.x, r.y, r.w, r.h, 8, 'rgba(255,170,120,.42)', 1.5);
    g.setLineDash([]);
    g.fillStyle = 'rgba(255,190,150,.3)';
    g.font = '7px "Courier New",monospace';
    g.textAlign = 'center';
    g.fillText('BATTERY', r.x + r.w / 2, r.y + r.h / 2 + 2);
    // adhesive strips
    g.fillStyle = 'rgba(255,255,255,.06)';
    g.fillRect(r.x + 12, r.y + 16, r.w - 24, 8);
    g.fillRect(r.x + 12, r.y + r.h - 24, r.w - 24, 8);
    g.restore();
    return;
  }
  const bulge = p.parts.battery === 'broken' ? 3 : 0;
  const grad = g.createLinearGradient(r.x, r.y, r.x + r.w, r.y + r.h);
  grad.addColorStop(0, '#3b4147');
  grad.addColorStop(1, '#252a2f');
  fillRR(g, r.x - bulge, r.y - bulge, r.w + bulge * 2, r.h + bulge * 2, 8 + bulge, grad);
  g.save();
  rrPath(g, r.x - bulge, r.y - bulge, r.w + bulge * 2, r.h + bulge * 2, 8 + bulge);
  g.clip();
  // label
  g.fillStyle = 'rgba(235,225,200,.86)';
  g.fillRect(r.x + 8, r.y + 26, r.w - 16, 38);
  g.fillStyle = '#3b3a35';
  g.font = '700 6px "Courier New",monospace';
  g.textAlign = 'left';
  g.fillText('Li-ion 4500mAh', r.x + 13, r.y + 38);
  g.fillStyle = '#8a7c5f';
  g.font = '5px "Courier New",monospace';
  g.fillText('MODEL PB-11 · 3.86V', r.x + 13, r.y + 47);
  g.fillStyle = '#b5483a';
  g.fillRect(r.x + 13, r.y + 53, 26, 4);
  g.fillStyle = '#4b5a52';
  g.fillRect(r.x + 43, r.y + 53, 40, 4);
  // connector tab
  g.fillStyle = '#1a1e21';
  g.fillRect(r.x + r.w - 32, r.y - 6, 22, 8);
  g.fillStyle = 'rgba(215,178,90,.6)';
  for (let i = 0; i < 4; i++) g.fillRect(r.x + r.w - 29 + i * 4, r.y - 5, 2, 3);
  // warning tape
  g.fillStyle = 'rgba(210,95,60,.75)';
  g.fillRect(r.x + 8, r.y + 84, r.w - 16, 3);
  g.fillStyle = 'rgba(220,225,220,.25)';
  g.font = '5px "Courier New",monospace';
  g.fillText('DO NOT PUNCTURE', r.x + 26, r.y + 95);
  g.restore();
  strokeRR(g, r.x - bulge, r.y - bulge, r.w + bulge * 2, r.h + bulge * 2, 8 + bulge, 'rgba(255,255,255,.08)', 1);
  if (p.parts.battery === 'broken') {
    const pulse = 0.5 + 0.5 * Math.sin(G.time * 4);
    g.save();
    g.strokeStyle = `rgba(235,120,80,${0.3 + pulse * 0.4})`;
    g.lineWidth = 2;
    g.beginPath(); g.ellipse(r.x + r.w - 12, r.y + r.h * 0.65, 12, 26, 0, 0, Math.PI * 2); g.stroke();
    g.fillStyle = `rgba(255,120,80,${0.5 + pulse * 0.4})`;
    g.font = '700 9px "Courier New",monospace';
    g.textAlign = 'center';
    g.fillText('!', r.x + r.w / 2, r.y + 18);
    g.restore();
  }
  if (p.parts.battery === 'new') {
    fillRR(g, r.x + 8, r.y + 6, 22, 10, 2, 'rgba(120,200,130,.9)');
    g.fillStyle = '#102416';
    g.font = '700 5px "Courier New",monospace';
    g.textAlign = 'center';
    g.fillText('NEW', r.x + 19, r.y + 13);
  }
}

function drawSpeaker(g) {
  const p = G.phone;
  const r = PART_RECTS.speaker;
  const dragging = G.drag && G.drag.kind === 'remove' && G.drag.part === 'speaker';
  const state = dragging ? 'gone' : p.parts.speaker;
  if (state === 'gone') {
    g.save();
    g.setLineDash([5, 4]);
    strokeRR(g, r.x, r.y, r.w, r.h, 4, 'rgba(255,170,120,.42)', 1.3);
    g.setLineDash([]);
    g.fillStyle = 'rgba(255,190,150,.3)';
    g.font = '6px "Courier New",monospace';
    g.textAlign = 'center';
    g.fillText('SPEAKER', r.x + r.w / 2, r.y + r.h / 2 + 2);
    g.restore();
    return;
  }
  fillRR(g, r.x, r.y, r.w, r.h, 4, '#2a3034');
  g.fillStyle = '#14181b';
  for (let x = r.x + 5; x < r.x + r.w - 5; x += 6) {
    for (let y = r.y + 6; y < r.y + r.h - 5; y += 6) {
      g.beginPath(); g.arc(x, y, 1.7, 0, Math.PI * 2); g.fill();
    }
  }
  strokeRR(g, r.x, r.y, r.w, r.h, 4, 'rgba(255,255,255,.09)', 1);
  if (p.parts.speaker === 'broken') {
    g.strokeStyle = 'rgba(240,130,90,.8)';
    g.lineWidth = 1.4;
    g.beginPath();
    g.moveTo(r.x + 30, r.y + 4); g.lineTo(r.x + 44, r.y + 16); g.lineTo(r.x + 38, r.y + 26);
    g.moveTo(r.x + 44, r.y + 16); g.lineTo(r.x + 64, r.y + 10);
    g.stroke();
  }
  if (p.parts.speaker === 'new') {
    g.fillStyle = 'rgba(130,205,140,.9)';
    g.font = '700 5px "Courier New",monospace';
    g.textAlign = 'right';
    g.fillText('NEW', r.x + r.w - 4, r.y + 8);
  }
}

function drawPort(g) {
  const p = G.phone;
  const r = PART_RECTS.port;
  const dragging = G.drag && G.drag.kind === 'remove' && G.drag.part === 'port';
  const state = dragging ? 'gone' : p.parts.port;
  if (state === 'gone') {
    g.save();
    g.setLineDash([5, 4]);
    strokeRR(g, r.x, r.y, r.w, r.h, 4, 'rgba(255,170,120,.42)', 1.3);
    g.setLineDash([]);
    g.fillStyle = 'rgba(255,190,150,.3)';
    g.font = '6px "Courier New",monospace';
    g.textAlign = 'center';
    g.fillText('CHARGE PORT', r.x + r.w / 2, r.y + r.h / 2 + 2);
    g.restore();
    return;
  }
  fillRR(g, r.x, r.y, r.w, r.h, 4, '#1e2427');
  strokeRR(g, r.x, r.y, r.w, r.h, 4, 'rgba(255,255,255,.08)', 1);
  // USB C opening
  fillRR(g, r.x + r.w / 2 - 17, r.y + r.h - 9, 34, 9, 4.5, '#07090a');
  g.fillStyle = 'rgba(150,160,165,.5)';
  g.fillRect(r.x + r.w / 2 - 11, r.y + r.h - 5, 22, 1.5);
  // gold pads
  g.fillStyle = 'rgba(215,175,90,.4)';
  for (let i = 0; i < 6; i++) g.fillRect(r.x + 8 + i * 6, r.y + 4, 3, 3);
  if (p.parts.port === 'broken') {
    const rnd = mulberry32(808);
    for (let i = 0; i < 14; i++) {
      g.fillStyle = i % 2 ? 'rgba(90,160,110,.75)' : 'rgba(150,185,110,.6)';
      g.beginPath();
      g.arc(r.x + 6 + rnd() * (r.w - 12), r.y + 3 + rnd() * (r.h - 6), 1 + rnd() * 2.4, 0, Math.PI * 2);
      g.fill();
    }
    g.strokeStyle = 'rgba(235,110,80,.8)';
    g.lineWidth = 1;
    g.beginPath(); g.moveTo(r.x + 22, r.y + 6); g.lineTo(r.x + 30, r.y + 18); g.lineTo(r.x + 25, r.y + 26); g.stroke();
  }
  if (p.parts.port === 'new') {
    g.fillStyle = 'rgba(130,205,140,.9)';
    g.font = '700 5px "Courier New",monospace';
    g.textAlign = 'right';
    g.fillText('NEW', r.x + r.w - 4, r.y + 8);
  }
}

function drawConnector(g, key) {
  const p = G.phone;
  const c = CONNECTORS[key];
  if (key === 'battery' && p.parts.battery === 'gone') return;
  if (key === 'camera' && p.parts.camera === 'gone') return;
  const attached = p.connectors[key];
  g.save();
  g.translate(c.x, c.y);
  if (!attached) {
    g.rotate(-0.5);
    g.translate(-3, -7);
  }
  // ribbon
  g.strokeStyle = '#b16c2c';
  g.lineWidth = 2.4;
  g.beginPath();
  if (key === 'display') { g.moveTo(0, 6); g.lineTo(10, 20); }
  else if (key === 'battery') { g.moveTo(-4, 0); g.lineTo(-16, 6); }
  else { g.moveTo(-4, 0); g.lineTo(-26, 0); }
  g.stroke();
  fillRR(g, -10, -5, 20, 10, 2, '#191d20');
  g.fillStyle = 'rgba(220,180,95,.8)';
  for (let i = 0; i < 4; i++) g.fillRect(-7 + i * 4, -3, 2, 4);
  g.strokeStyle = 'rgba(255,255,255,.1)';
  g.lineWidth = 1;
  rrPath(g, -10, -5, 20, 10, 2);
  g.stroke();
  g.restore();
}

function drawScrews(g, where) {
  const p = G.phone;
  if (p.openT < 0.35) return;
  const set = SCREW_SETS[where];
  const removed = p.screwsRemoved[where];
  set.forEach((s, i) => {
    const prog = p.screwProg[where][i];
    if (removed || prog >= 1) return;
    const lift = prog * 4;
    g.save();
    g.translate(s.x, s.y - lift);
    g.beginPath(); g.arc(0, 0, 7, 0, Math.PI * 2);
    g.fillStyle = prog > 0 ? '#aeb8c0' : '#8b959d';
    g.fill();
    g.strokeStyle = 'rgba(0,0,0,.45)';
    g.lineWidth = 1;
    g.stroke();
    g.rotate(prog * 2.2);
    g.strokeStyle = '#3a4147';
    g.lineWidth = 1.3;
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      g.beginPath();
      g.moveTo(0, 0);
      g.lineTo(Math.cos(a) * 4.6, Math.sin(a) * 4.6);
      g.stroke();
    }
    g.beginPath(); g.arc(0, 0, 2, 0, Math.PI * 2);
    g.fillStyle = '#3a4147'; g.fill();
    g.restore();
  });
}

/* =========================================================
   Part sprites
   ========================================================= */
function drawPartShape(g, part, w, h, mode) {
  switch (part) {
    case 'battery': {
      fillRR(g, 0, 0, w, h, 8, '#343b41');
      g.fillStyle = 'rgba(235,225,200,.9)';
      g.fillRect(8, 26, w - 16, h * 0.32);
      g.fillStyle = '#44423c';
      g.font = '700 5px "Courier New",monospace';
      g.textAlign = 'left';
      g.fillText('Li-ion 4500mAh', 12, 38);
      g.fillStyle = '#9aa58f';
      g.font = '4px "Courier New",monospace';
      g.fillText('MODEL PB-11 · NEW CELL', 12, 46);
      g.fillStyle = 'rgba(120,200,130,.9)';
      g.fillRect(10, 56, 22, 8);
      g.fillStyle = '#0f2416';
      g.font = '700 5px "Courier New",monospace';
      g.fillText('NEW', 16, 62);
      fillRR(g, w - 32, -2, 20, 6, 2, '#191d20');
      break;
    }
    case 'camera': {
      fillRR(g, 0, 0, w, h, 9, '#20262a');
      [[w * 0.33, h * 0.36, w * 0.19], [w * 0.7, h * 0.36, w * 0.16], [w * 0.33, h * 0.72, w * 0.14]].forEach(([x, y, r], i) => {
        g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2);
        g.fillStyle = '#0b0f12'; g.fill();
        g.beginPath(); g.arc(x - r * 0.25, y - r * 0.25, r * 0.3, 0, Math.PI * 2);
        g.fillStyle = i === 0 ? 'rgba(160,200,255,.5)' : 'rgba(220,235,255,.25)'; g.fill();
      });
      g.fillStyle = 'rgba(120,200,130,.95)';
      g.font = '700 5px "Courier New",monospace';
      g.textAlign = 'right';
      g.fillText('NEW', w - 4, 8);
      break;
    }
    case 'speaker': {
      fillRR(g, 0, 0, w, h, 4, '#2a3034');
      g.fillStyle = '#14181b';
      for (let x = 5; x < w - 4; x += 6) {
        for (let y = 5; y < h - 4; y += 6) {
          g.beginPath(); g.arc(x, y, 1.7, 0, Math.PI * 2); g.fill();
        }
      }
      g.fillStyle = 'rgba(130,205,140,.9)';
      g.font = '700 5px "Courier New",monospace';
      g.textAlign = 'right';
      g.fillText('NEW', w - 4, h - 4);
      break;
    }
    case 'port': {
      fillRR(g, 0, 0, w, h, 4, '#1e2427');
      fillRR(g, w / 2 - 17, h - 9, 34, 9, 4.5, '#07090a');
      g.fillStyle = 'rgba(150,160,165,.55)';
      g.fillRect(w / 2 - 11, h - 5, 22, 1.5);
      g.fillStyle = 'rgba(130,205,140,.9)';
      g.font = '700 5px "Courier New",monospace';
      g.textAlign = 'right';
      g.fillText('NEW', w - 4, 8);
      break;
    }
    case 'screen':
      drawLooseGlass(g, w, h, { newScreen: true });
      break;
    case 'protector':
      drawLooseGlass(g, w, h, { film: true });
      break;
  }
}

function drawPartSprite(g, part, cx, cy, maxW, maxH) {
  const nat = PART_NAT[part];
  const s = Math.min(maxW / nat.w, maxH / nat.h);
  g.save();
  g.translate(cx, cy);
  g.scale(s, s);
  g.translate(-nat.w / 2, -nat.h / 2);
  g.shadowColor = 'rgba(0,0,0,.5)';
  g.shadowBlur = 10;
  g.shadowOffsetY = 5;
  drawPartShape(g, part, nat.w, nat.h, 'new');
  g.restore();
}
