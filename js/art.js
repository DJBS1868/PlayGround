import { TAU, mulberry32, clamp, lerp } from './util.js';

function smoothBlob(ctx, seed, radius, points = 9, wobble = 0.24) {
  const rnd = mulberry32(seed);
  const pts = [];
  for (let i = 0; i < points; i++) {
    const a = (i / points) * TAU + (rnd() - 0.5) * 0.16;
    const r = radius * (1 - wobble * 0.5 + rnd() * wobble);
    pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
  }
  ctx.beginPath();
  let mx = (pts[points - 1].x + pts[0].x) / 2;
  let my = (pts[points - 1].y + pts[0].y) / 2;
  ctx.moveTo(mx, my);
  for (let i = 0; i < points; i++) {
    const p = pts[i];
    const n = pts[(i + 1) % points];
    mx = (p.x + n.x) / 2;
    my = (p.y + n.y) / 2;
    ctx.quadraticCurveTo(p.x, p.y, mx, my);
  }
  ctx.closePath();
}

function pineStar(ctx, seed, radius, spikes = 11) {
  const rnd = mulberry32(seed);
  const total = spikes * 2;
  ctx.beginPath();
  for (let i = 0; i <= total; i++) {
    const a = (i / total) * TAU + (rnd() - 0.5) * 0.06;
    const long = i % 2 === 0;
    const r = radius * (long ? 0.94 + rnd() * 0.14 : 0.66 + rnd() * 0.12);
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

export function drawPine(ctx, o, time) {
  const s = o.scale;
  ctx.fillStyle = 'rgba(17,38,27,.2)';
  ctx.beginPath();
  ctx.ellipse(o.x + 7 * s, o.y + 9 * s, 21 * s, 8 * s, 0.08, 0, TAU);
  ctx.fill();

  ctx.fillStyle = '#6b5138';
  ctx.beginPath();
  ctx.ellipse(o.x + 1.5 * s, o.y + 5.5 * s, 3.3 * s, 4.4 * s, 0, 0, TAU);
  ctx.fill();

  if (!o.ready) {
    // stump
    ctx.fillStyle = '#7a5d3f';
    ctx.beginPath();
    ctx.ellipse(o.x, o.y + 1 * s, 8 * s, 6.5 * s, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#c3a679';
    ctx.beginPath();
    ctx.ellipse(o.x, o.y - 0.5 * s, 7.1 * s, 5.6 * s, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(116,87,55,.5)';
    ctx.lineWidth = 0.8 * s;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.ellipse(o.x, o.y - 0.5 * s, (2.2 + i * 2.1) * s, (1.6 + i * 1.6) * s, 0, 0, TAU);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(77,105,62,.8)';
    ctx.beginPath();
    ctx.ellipse(o.x - 9 * s, o.y + 3 * s, 5 * s, 2.6 * s, -0.3, 0, TAU);
    ctx.fill();
    return;
  }

  const g = o.growth ?? 1;
  const sway = Math.sin(time * 0.62 + o.sway) * 0.028 + Math.sin(time * 0.23 + o.sway * 2) * 0.012;
  const palettes = [
    ['#294c35', '#3b6643', '#537e4b', 'rgba(156,182,110,.2)'],
    ['#2a4a37', '#3d6742', '#5a824d', 'rgba(171,191,117,.18)'],
    ['#315138', '#426b46', '#5e874f', 'rgba(184,199,126,.18)'],
  ];
  const pal = palettes[o.seed % palettes.length];
  ctx.save();
  ctx.translate(o.x, o.y);
  ctx.rotate(sway);
  ctx.scale(g, g);

  // outer needles
  ctx.fillStyle = pal[0];
  pineStar(ctx, o.seed, 29 * s, 12 + (o.seed % 3));
  ctx.fill();

  // mid canopy
  ctx.save();
  ctx.rotate(0.28);
  ctx.fillStyle = pal[1];
  pineStar(ctx, o.seed + 17, 22 * s, 10);
  ctx.fill();
  ctx.restore();

  // lit crown
  ctx.save();
  ctx.translate(-1.8 * s, -2.6 * s);
  ctx.rotate(-0.18);
  ctx.fillStyle = pal[2];
  pineStar(ctx, o.seed + 43, 15 * s, 8);
  ctx.fill();
  ctx.restore();

  // needle strokes
  const rnd = mulberry32(o.seed + 5);
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * TAU + rnd() * 0.22;
    const r0 = 5 * s;
    const r1 = (15 + rnd() * 12) * s;
    ctx.strokeStyle = i % 4 === 0 ? 'rgba(166,190,116,.25)' : 'rgba(24,52,34,.34)';
    ctx.lineWidth = (i % 4 === 0 ? 0.7 : 0.85) * s;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0);
    ctx.lineTo(Math.cos(a + 0.045) * r1, Math.sin(a + 0.045) * r1);
    ctx.stroke();
  }

  // soft light
  ctx.fillStyle = pal[3];
  ctx.beginPath();
  ctx.ellipse(-6 * s, -7.5 * s, 9 * s, 5.2 * s, -0.6, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(234,237,196,.14)';
  ctx.beginPath();
  ctx.ellipse(-8 * s, -10 * s, 3.8 * s, 2.1 * s, -0.7, 0, TAU);
  ctx.fill();

  // a few bright needle tips
  ctx.fillStyle = 'rgba(173,196,123,.3)';
  for (let i = 0; i < 5; i++) {
    const a = rnd() * TAU;
    const r = (18 + rnd() * 8) * s;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * r, Math.sin(a) * r, (0.8 + rnd() * 0.8) * s, 0, TAU);
    ctx.fill();
  }

  ctx.restore();
}

export function drawRock(ctx, o, time) {
  const s = o.scale;
  ctx.fillStyle = 'rgba(23,39,30,.24)';
  ctx.beginPath();
  ctx.ellipse(o.x + 6 * s, o.y + 7 * s, 20 * s, 8 * s, 0.06, 0, TAU);
  ctx.fill();

  if (!o.ready) {
    for (let i = 0; i < 3; i++) {
      const a = i * 2.1 + o.seed;
      const r = 6.5 + i * 2.4;
      const px = o.x + Math.cos(a) * 9 * s;
      const py = o.y + Math.sin(a) * 6 * s;
      ctx.save();
      ctx.translate(px, py);
      ctx.fillStyle = i === 0 ? '#94917e' : '#7a7d6d';
      smoothBlob(ctx, o.seed + i * 13, r * 0.6 * s, 6, 0.3);
      ctx.fill();
      ctx.restore();
    }
    return;
  }

  const g = o.growth ?? 1;
  ctx.save();
  ctx.translate(o.x, o.y);
  ctx.scale(g, g);

  const r = 20 * s;
  const grad = ctx.createLinearGradient(-r, -r, r * 0.9, r);
  grad.addColorStop(0, '#b3ae98');
  grad.addColorStop(0.42, '#93917e');
  grad.addColorStop(1, '#5f675c');
  ctx.fillStyle = grad;
  smoothBlob(ctx, o.seed, r, 9, 0.32);
  ctx.fill();
  ctx.strokeStyle = 'rgba(52,62,53,.42)';
  ctx.lineWidth = 1.1 * s;
  ctx.stroke();

  // moss
  ctx.fillStyle = 'rgba(106,135,79,.66)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.3, -r * 0.38, r * 0.42, r * 0.24, -0.5, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(132,156,96,.4)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.04, -r * 0.56, r * 0.24, r * 0.13, 0.2, 0, TAU);
  ctx.fill();

  // top light
  ctx.strokeStyle = 'rgba(234,229,205,.42)';
  ctx.lineWidth = 1.6 * s;
  ctx.beginPath();
  ctx.arc(-r * 0.12, -r * 0.1, r * 0.64, Math.PI * 1.04, Math.PI * 1.52);
  ctx.stroke();

  // cracks
  ctx.strokeStyle = 'rgba(60,67,58,.46)';
  ctx.lineWidth = 0.9 * s;
  ctx.beginPath();
  ctx.moveTo(-r * 0.15, -r * 0.1);
  ctx.lineTo(r * 0.05, r * 0.2);
  ctx.lineTo(r * 0.26, r * 0.28);
  ctx.moveTo(r * 0.05, r * 0.2);
  ctx.lineTo(r * 0.12, r * 0.46);
  ctx.stroke();

  // tiny grass at base
  ctx.strokeStyle = 'rgba(87,119,69,.75)';
  ctx.lineWidth = 0.9 * s;
  for (let i = 0; i < 5; i++) {
    const a = 0.35 + i * 0.42;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * r * 0.85, Math.sin(a) * r * 0.7);
    ctx.lineTo(Math.cos(a) * r * 1.08, Math.sin(a) * r * 0.98);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawStick(ctx, o, time) {
  const s = o.scale;
  const sway = Math.sin(time * 0.9 + o.sway) * 0.02;
  ctx.save();
  ctx.translate(o.x, o.y + 1.5);
  ctx.rotate(o.sway * 1.7 + sway);

  ctx.fillStyle = 'rgba(20,34,24,.18)';
  ctx.beginPath();
  ctx.ellipse(1.5 * s, 2.2 * s, 10.5 * s, 3.4 * s, 0, 0, TAU);
  ctx.fill();

  // main branch
  ctx.strokeStyle = '#6f5134';
  ctx.lineWidth = 2.4 * s;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-8.5 * s, 0.8 * s);
  ctx.quadraticCurveTo(-1 * s, -2.2 * s, 8.5 * s, -0.4 * s);
  ctx.stroke();
  ctx.strokeStyle = '#8a6743';
  ctx.lineWidth = 1.1 * s;
  ctx.beginPath();
  ctx.moveTo(-7.8 * s, -0.2 * s);
  ctx.quadraticCurveTo(-1 * s, -2.9 * s, 8 * s, -1.1 * s);
  ctx.stroke();

  // side twigs
  ctx.strokeStyle = '#63472e';
  ctx.lineWidth = 1.5 * s;
  ctx.beginPath();
  ctx.moveTo(1.6 * s, -1.6 * s);
  ctx.lineTo(4.6 * s, -5.6 * s);
  ctx.stroke();
  ctx.lineWidth = 1.2 * s;
  ctx.beginPath();
  ctx.moveTo(-3.4 * s, -1.2 * s);
  ctx.lineTo(-5.6 * s, -4.4 * s);
  ctx.stroke();

  // little leaves
  ctx.fillStyle = 'rgba(116,144,84,.92)';
  ctx.beginPath();
  ctx.ellipse(5.2 * s, -6.2 * s, 2.1 * s, 1.0 * s, -0.7, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(96,126,74,.8)';
  ctx.beginPath();
  ctx.ellipse(-6.2 * s, -4.9 * s, 1.7 * s, 0.85 * s, 0.7, 0, TAU);
  ctx.fill();

  // cut end
  ctx.fillStyle = 'rgba(215,186,143,.55)';
  ctx.beginPath();
  ctx.arc(-8.6 * s, 0.7 * s, 1.1 * s, 0, TAU);
  ctx.fill();
  ctx.restore();
}

export function drawBush(ctx, o, time) {
  const s = o.scale;
  ctx.fillStyle = 'rgba(18,38,26,.24)';
  ctx.beginPath();
  ctx.ellipse(o.x + 5 * s, o.y + 8 * s, 20 * s, 8 * s, 0.08, 0, TAU);
  ctx.fill();

  const g = o.growth ?? 1;
  const sway = Math.sin(time * 0.8 + o.sway) * 0.02;
  ctx.save();
  ctx.translate(o.x, o.y);
  ctx.rotate(sway);
  ctx.scale(g, g);

  const ready = o.ready;
  ctx.fillStyle = ready ? 'rgba(32,61,42,.55)' : 'rgba(55,76,52,.4)';
  ctx.beginPath();
  ctx.ellipse(0, 4, 17 * s, 10 * s, 0, 0, TAU);
  ctx.fill();

  const blobs = [
    [-8, 2, 12.5, '#376441'],
    [7, 1, 13, '#437046'],
    [0, -7, 14, '#4f7c4b'],
    [-2, 8, 11.5, '#305b3c'],
    [10, 8, 8.8, '#396742'],
    [-10, -4, 8.5, '#44704a'],
  ];
  for (let i = 0; i < blobs.length; i++) {
    const [bx, by, br, col] = blobs[i];
    ctx.save();
    ctx.translate(bx * s, by * s);
    ctx.fillStyle = ready ? col : '#587553';
    smoothBlob(ctx, o.seed + i * 31, br * s, 8, 0.34);
    ctx.fill();
    ctx.restore();
  }

  // leaf highlights
  const rnd = mulberry32(o.seed + 7);
  for (let i = 0; i < 14; i++) {
    const a = rnd() * TAU;
    const r0 = 4 + rnd() * 10;
    ctx.strokeStyle = ready
      ? (i % 3 === 0 ? 'rgba(147,177,104,.55)' : 'rgba(104,141,82,.45)')
      : 'rgba(139,151,112,.4)';
    ctx.lineWidth = (0.8 + rnd() * 0.6) * s;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * r0 * s, Math.sin(a) * r0 * s);
    ctx.lineTo(Math.cos(a + 0.3) * (r0 + 6) * s, Math.sin(a + 0.3) * (r0 + 6) * s);
    ctx.stroke();
  }

  // light rim
  ctx.fillStyle = ready ? 'rgba(154,183,111,.2)' : 'rgba(140,154,118,.14)';
  ctx.beginPath();
  ctx.ellipse(-6 * s, -9 * s, 7.5 * s, 4.2 * s, -0.5, 0, TAU);
  ctx.fill();

  if (ready) {
    const berries = 11;
    for (let i = 0; i < berries; i++) {
      const a = (i / berries) * TAU + o.seed * 0.001;
      const rr = 3 + rnd() * 11;
      const bx = Math.cos(a) * rr * s;
      const by = Math.sin(a) * rr * s - 2.5 * s;
      ctx.fillStyle = i % 3 === 0 ? '#d06b5d' : '#b44f47';
      ctx.beginPath();
      ctx.arc(bx, by, 2.5 * s, 0, TAU);
      ctx.fill();
      ctx.fillStyle = 'rgba(250,203,180,.65)';
      ctx.beginPath();
      ctx.arc(bx - 0.7 * s, by - 0.8 * s, 0.85 * s, 0, TAU);
      ctx.fill();
    }
  } else {
    ctx.strokeStyle = 'rgba(91,112,75,.55)';
    ctx.lineWidth = 0.8 * s;
    for (let i = 0; i < 5; i++) {
      const a = rnd() * TAU;
      ctx.beginPath();
      ctx.moveTo(0, 2 * s);
      ctx.lineTo(Math.cos(a) * 13 * s, Math.sin(a) * 10 * s);
      ctx.stroke();
    }
  }
  ctx.restore();
}

export function drawFireGlow(ctx, fire, time, strength = 1) {
  const flicker = 0.9 + Math.sin(time * 7.3 + fire.seed) * 0.05 + Math.sin(time * 13.1 + fire.seed * 0.3) * 0.03;
  const r = 290 * flicker;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const grad = ctx.createRadialGradient(fire.x, fire.y - 4, 4, fire.x, fire.y - 4, r);
  grad.addColorStop(0, `rgba(255,196,112,${0.27 * strength})`);
  grad.addColorStop(0.32, `rgba(242,154,78,${0.15 * strength})`);
  grad.addColorStop(0.68, `rgba(216,118,58,${0.055 * strength})`);
  grad.addColorStop(1, 'rgba(200,100,50,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(fire.x, fire.y - 4, r, 0, TAU);
  ctx.fill();
  ctx.restore();
}

export function drawCampfire(ctx, fire, time, night = 0) {
  ctx.fillStyle = 'rgba(21,35,25,.24)';
  ctx.beginPath();
  ctx.ellipse(fire.x + 4, fire.y + 8, 28, 10, 0, 0, TAU);
  ctx.fill();

  // worn ash ring
  ctx.fillStyle = 'rgba(91,73,54,.35)';
  ctx.beginPath();
  ctx.ellipse(fire.x, fire.y + 2, 24, 11, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(57,49,40,.35)';
  ctx.beginPath();
  ctx.ellipse(fire.x, fire.y + 2, 15, 7, 0, 0, TAU);
  ctx.fill();

  // stone ring
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * TAU + 0.15;
    const px = fire.x + Math.cos(a) * 21.5;
    const py = fire.y + Math.sin(a) * 12.5;
    ctx.fillStyle = i % 2 ? '#918f7c' : '#a5a18c';
    ctx.beginPath();
    ctx.ellipse(px, py, 5, 3.8, a, 0, TAU);
    ctx.fill();
    ctx.fillStyle = 'rgba(234,230,206,.22)';
    ctx.beginPath();
    ctx.ellipse(px - 0.9, py - 1.1, 1.9, 1.2, a, 0, TAU);
    ctx.fill();
  }

  // logs
  ctx.save();
  ctx.translate(fire.x, fire.y + 1);
  ctx.rotate(0.45);
  ctx.fillStyle = '#5c4430';
  roundRect(ctx, -15, -3.6, 30, 7.2, 3.4);
  ctx.fill();
  ctx.fillStyle = '#785a3e';
  roundRect(ctx, -15, -3.6, 30, 3.2, 1.6);
  ctx.fill();
  ctx.rotate(-0.9);
  ctx.fillStyle = '#523c2b';
  roundRect(ctx, -14, -3.2, 28, 6.4, 3.2);
  ctx.fill();
  ctx.fillStyle = '#6c4e35';
  roundRect(ctx, -14, -3.2, 28, 2.6, 1.3);
  ctx.fill();
  ctx.restore();

  // ember bed
  ctx.fillStyle = `rgba(238,128,58,${0.48 + night * 0.28})`;
  ctx.beginPath();
  ctx.ellipse(fire.x, fire.y + 1, 9, 4.2, 0, 0, TAU);
  ctx.fill();

  const f = 1 + Math.sin(time * 9 + fire.seed) * 0.08 + Math.sin(time * 15.7 + fire.seed * 0.4) * 0.05;
  const sway = Math.sin(time * 6.2 + fire.seed) * 1.7;
  ctx.save();
  ctx.translate(fire.x + sway * 0.3, fire.y - 4);
  ctx.scale(1.16, 1.16);

  // outer flame
  flamePath(ctx, 13 * f, 36 * f, sway);
  ctx.fillStyle = `rgba(224,108,52,${0.9})`;
  ctx.fill();
  // side tongue
  ctx.save();
  ctx.translate(7 * f, 1);
  ctx.rotate(0.18);
  flamePath(ctx, 6 * f, 20 * f, sway * 0.6);
  ctx.fillStyle = 'rgba(234,137,61,.75)';
  ctx.fill();
  ctx.restore();
  // mid
  ctx.save();
  ctx.translate(0, 4);
  flamePath(ctx, 9.2 * f, 27 * f, sway * 0.7);
  ctx.fillStyle = 'rgba(245,169,74,.95)';
  ctx.fill();
  // core
  ctx.translate(0, 4.5);
  flamePath(ctx, 5.4 * f, 16 * f, sway * 0.45);
  ctx.fillStyle = 'rgba(255,229,158,.97)';
  ctx.fill();
  ctx.restore();

  // hot tip
  ctx.fillStyle = 'rgba(255,248,212,.85)';
  ctx.beginPath();
  ctx.ellipse(sway * 0.4, -20 * f, 2.1, 5.2, 0, 0, TAU);
  ctx.fill();
  ctx.restore();

  if (night > 0.15) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = `rgba(255,196,116,${0.1 * night})`;
    ctx.beginPath();
    ctx.arc(fire.x, fire.y - 6, 48, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
}

function flamePath(ctx, w, h, sway) {
  ctx.beginPath();
  ctx.moveTo(0, 2);
  ctx.bezierCurveTo(w, -h * 0.12, w * 0.82 + sway, -h * 0.58, sway * 0.6, -h);
  ctx.bezierCurveTo(-w * 0.82 + sway, -h * 0.58, -w, -h * 0.12, 0, 2);
  ctx.closePath();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawPlayerBoots(ctx, step) {
  for (const side of [-1, 1]) {
    const bx = -7.2 + step * 0.42 * side;
    const by = side * 11.4;
    ctx.fillStyle = '#4a3a2c';
    ctx.beginPath();
    ctx.ellipse(bx, by, 3.2, 2.4, side * -0.35, 0, TAU);
    ctx.fill();
    ctx.fillStyle = 'rgba(226,198,158,.3)';
    ctx.beginPath();
    ctx.ellipse(bx - 0.7, by - side * 0.25, 1.3, 0.8, side * -0.35, 0, TAU);
    ctx.fill();
  }
}

function drawPlayerBody(ctx, p, time, step) {
  drawPlayerBoots(ctx, step);

  // trailing cape
  const flutter = Math.sin(time * 6.4) * 0.8 + Math.sin(time * 2.7) * 0.5;
  const cape = ctx.createLinearGradient(-19, -8, -2, 8);
  cape.addColorStop(0, '#3d5b3c');
  cape.addColorStop(1, '#5a784d');
  ctx.fillStyle = cape;
  ctx.beginPath();
  ctx.moveTo(-4.4, -7.6);
  ctx.quadraticCurveTo(-11, -9.8 + flutter, -18.8, -5.2 + flutter * 0.55);
  ctx.quadraticCurveTo(-14.6, -0.4, -19.2, 4.8 + flutter * 0.5);
  ctx.quadraticCurveTo(-11, 8.6 + flutter * 0.3, -4, 7.5);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(233,222,192,.34)';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(-5.2, -7.4);
  ctx.quadraticCurveTo(-11.2, -8.8 + flutter, -17.8, -5.1 + flutter * 0.55);
  ctx.stroke();

  // backpack and bedroll
  ctx.fillStyle = '#6b4f33';
  roundRect(ctx, -14.2, -4.8, 6.2, 9.6, 3.0);
  ctx.fill();
  ctx.fillStyle = '#583f27';
  roundRect(ctx, -14.2, -4.8, 1.9, 9.6, 0.95);
  ctx.fill();
  ctx.fillStyle = '#9a754f';
  roundRect(ctx, -15.2, -3.4, 3.2, 6.8, 1.6);
  ctx.fill();
  ctx.strokeStyle = 'rgba(80,55,33,.55)';
  ctx.lineWidth = 0.8;
  for (const sy of [-1.7, 1.7]) {
    ctx.beginPath();
    ctx.moveTo(-14.9, sy);
    ctx.lineTo(-12.0, sy);
    ctx.stroke();
  }

  // scarf tail, trailing off to one side
  const scarfFlutter = Math.sin(time * 8.4) * 1.3;
  ctx.fillStyle = '#9d5b45';
  ctx.beginPath();
  ctx.moveTo(-4.2, -6.3);
  ctx.quadraticCurveTo(-12.6, -9.6 - scarfFlutter * 0.35, -16.2, -5.0);
  ctx.quadraticCurveTo(-10.4, -4.7, -4.9, -1.3);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(232,164,132,.26)';
  ctx.beginPath();
  ctx.ellipse(-10.8, -5.2, 2.2, 0.7, -0.3, 0, TAU);
  ctx.fill();

  // moss cloak / shoulders
  const cloak = ctx.createRadialGradient(1.5, -3.8, 1, 0, 0, 14.5);
  cloak.addColorStop(0, '#8aa273');
  cloak.addColorStop(0.52, '#6b8a5b');
  cloak.addColorStop(1, '#476642');
  ctx.fillStyle = cloak;
  ctx.beginPath();
  ctx.ellipse(0.3, 0, 11.4, 12.8, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(33,55,33,.62)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // hem and cloth folds
  ctx.strokeStyle = 'rgba(236,224,194,.2)';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.ellipse(0.3, 0.8, 10.3, 11.6, 0, Math.PI * 0.1, Math.PI * 0.9);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(38,62,39,.28)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-8.2, -2.4);
  ctx.quadraticCurveTo(-4.4, -6.2, -1.2, -9.2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-8.2, 2.4);
  ctx.quadraticCurveTo(-4.4, 6.2, -1.2, 9.2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,247,220,.13)';
  ctx.beginPath();
  ctx.moveTo(-6.4, -5.2);
  ctx.quadraticCurveTo(-1.6, -8.2, 4.2, -7.2);
  ctx.stroke();

  // stitched hem around the back of the cloak
  ctx.save();
  ctx.strokeStyle = 'rgba(232,220,188,.28)';
  ctx.lineWidth = 0.8;
  ctx.setLineDash([1.3, 2.3]);
  ctx.beginPath();
  ctx.ellipse(0.3, 0.2, 10.6, 11.9, 0, Math.PI * 0.62, Math.PI * 1.38);
  ctx.stroke();
  ctx.restore();

  // moss patch on one shoulder
  ctx.fillStyle = 'rgba(108,140,82,.55)';
  ctx.beginPath();
  ctx.ellipse(-4.6, 6.4, 3.4, 2.1, 0.5, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(148,178,112,.35)';
  ctx.beginPath();
  ctx.ellipse(-5.2, 5.9, 1.7, 1.0, 0.5, 0, TAU);
  ctx.fill();

  // cream shoulder trim along the front
  ctx.strokeStyle = 'rgba(240,229,201,.52)';
  ctx.lineWidth = 1.7;
  ctx.beginPath();
  ctx.arc(0.5, 0, 9.9, -1.12, 1.12);
  ctx.stroke();

  // shoulder straps
  ctx.strokeStyle = 'rgba(94,66,42,.58)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-9.6, -5.5);
  ctx.quadraticCurveTo(-4.2, -8.2, 2.6, -7.3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-9.6, 5.5);
  ctx.quadraticCurveTo(-4.2, 8.2, 2.6, 7.3);
  ctx.stroke();

  // belt pouch
  ctx.fillStyle = '#7d5c3b';
  roundRect(ctx, -5.8, 7.4, 4.8, 3.9, 1.6);
  ctx.fill();
  ctx.strokeStyle = 'rgba(80,55,33,.5)';
  ctx.lineWidth = 0.7;
  ctx.stroke();

  // arms and hands, resting at the sides of the cloak
  const handSwing = p.moving ? step * 0.52 : 0;
  for (const side of [-1, 1]) {
    const ax = -0.6 + handSwing * side;
    const ay = side * 10.2;
    ctx.fillStyle = '#6c8a5a';
    ctx.beginPath();
    ctx.ellipse(ax, ay, 4.6, 2.8, side * -0.48, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(40,63,40,.32)';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.fillStyle = '#eac9a3';
    ctx.beginPath();
    ctx.arc(ax - 3.0, ay + side * 0.9, 2.0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,240,214,.35)';
    ctx.beginPath();
    ctx.arc(ax - 3.5, ay + side * 0.4, 0.7, 0, TAU);
    ctx.fill();
  }

  // hat brim shadow on the shoulders
  ctx.fillStyle = 'rgba(24,40,26,.24)';
  ctx.beginPath();
  ctx.ellipse(4.4, 1.8, 8.4, 7.7, 0, 0, TAU);
  ctx.fill();
}

function drawPlayerHead(ctx, time, sway) {
  // straw hat
  ctx.save();
  ctx.translate(5.5, 0);
  ctx.rotate(sway);

  ctx.fillStyle = 'rgba(48,38,24,.2)';
  ctx.beginPath();
  ctx.ellipse(0.4, 1.2, 6.8, 6.5, 0, 0, TAU);
  ctx.fill();

  const brim = ctx.createRadialGradient(-1.7, -2.1, 1, 0, 0, 7.3);
  brim.addColorStop(0, '#ecd49a');
  brim.addColorStop(0.58, '#d6b476');
  brim.addColorStop(1, '#ab8049');
  ctx.fillStyle = brim;
  ctx.beginPath();
  ctx.ellipse(0, 0, 7.0, 6.7, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(104,76,44,.65)';
  ctx.lineWidth = 1.1;
  ctx.stroke();

  // woven brim texture
  ctx.strokeStyle = 'rgba(146,112,68,.24)';
  ctx.lineWidth = 0.6;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 3.9, Math.sin(a) * 3.7);
    ctx.lineTo(Math.cos(a) * 6.4, Math.sin(a) * 6.0);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(255,246,218,.18)';
  ctx.lineWidth = 0.75;
  ctx.beginPath();
  ctx.ellipse(0, 0, 5.8, 5.5, 0, 0, TAU);
  ctx.stroke();

  // crown
  ctx.fillStyle = 'rgba(83,55,29,.2)';
  ctx.beginPath();
  ctx.ellipse(0, 1.0, 4.3, 4.0, 0, 0, TAU);
  ctx.fill();
  const crown = ctx.createRadialGradient(-1.8, -1.9, 0.5, 0, 0, 4.2);
  crown.addColorStop(0, '#d8b877');
  crown.addColorStop(0.6, '#c39e5f');
  crown.addColorStop(1, '#a77c45');
  ctx.fillStyle = crown;
  ctx.beginPath();
  ctx.ellipse(0, 0, 3.9, 3.7, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(96,68,38,.6)';
  ctx.lineWidth = 0.95;
  ctx.beginPath();
  ctx.ellipse(0, 0, 4.2, 4.0, 0, 0, TAU);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,244,205,.18)';
  ctx.beginPath();
  ctx.ellipse(-1.5, -2.0, 1.9, 1.4, -0.5, 0, TAU);
  ctx.fill();

  // thin dark binding around the crown base
  ctx.strokeStyle = 'rgba(105,76,43,.45)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(0, 0, 3.55, 0.35, TAU - 0.35);
  ctx.stroke();

  // leaf tucked into the band
  ctx.save();
  ctx.translate(3.6, -3.9);
  ctx.rotate(-0.7);
  ctx.fillStyle = '#6f8d52';
  ctx.beginPath();
  ctx.ellipse(0, 0, 2.6, 1.3, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(42,64,36,.55)';
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(-1.9, 0);
  ctx.lineTo(2.1, 0);
  ctx.stroke();
  ctx.restore();

  // tiny flower on the brim
  ctx.save();
  ctx.translate(4.3, 3.1);
  ctx.rotate(0.4);
  ctx.fillStyle = 'rgba(244,236,213,.9)';
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * TAU;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * 0.95, Math.sin(a) * 0.95, 0.65, 0, TAU);
    ctx.fill();
  }
  ctx.fillStyle = '#d9b66e';
  ctx.beginPath();
  ctx.arc(0, 0, 0.5, 0, TAU);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = 'rgba(255,247,224,.5)';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.arc(0, 0, 6.4, -2.5, -0.8);
  ctx.stroke();
  ctx.restore();

  // hair peeking from under the brim
  ctx.fillStyle = '#5a4433';
  ctx.beginPath();
  ctx.ellipse(9.1, 0, 2.5, 3.0, 0, 0, TAU);
  ctx.fill();

  // face, tucked under the front of the brim
  const skin = ctx.createRadialGradient(11.6, -1.1, 0.5, 11.0, 0, 3.7);
  skin.addColorStop(0, '#f7d2a6');
  skin.addColorStop(1, '#e2ab7c');
  ctx.fillStyle = 'rgba(91,58,38,.35)';
  ctx.beginPath();
  ctx.ellipse(11.0, 0.45, 3.2, 3.6, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.ellipse(11.0, 0, 2.95, 3.35, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(126,82,52,.6)';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // brim shadow falling over the back of the face
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(8.9, 0, 2.95, 3.35, 0, 0, TAU);
  ctx.clip();
  const faceShade = ctx.createLinearGradient(8.0, 0, 11.8, 0);
  faceShade.addColorStop(0, 'rgba(79,47,27,.3)');
  faceShade.addColorStop(1, 'rgba(79,47,27,0)');
  ctx.fillStyle = faceShade;
  ctx.fillRect(7.5, -4.0, 7.2, 8.0);
  ctx.restore();

  // cheeks
  ctx.fillStyle = 'rgba(208,126,100,.3)';
  ctx.beginPath();
  ctx.arc(10.9, -2.05, 0.8, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(10.9, 2.05, 0.8, 0, TAU);
  ctx.fill();

  // eyes, highlights, nose
  ctx.fillStyle = '#463528';
  ctx.beginPath();
  ctx.arc(11.9, -1.15, 0.55, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(11.9, 1.15, 0.55, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,250,235,.9)';
  ctx.beginPath();
  ctx.arc(12.06, -1.32, 0.19, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(12.06, 0.98, 0.19, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(190,132,92,.8)';
  ctx.beginPath();
  ctx.arc(13.0, 0, 0.44, 0, TAU);
  ctx.fill();
}

function drawWading(ctx, p, time, wade, waterline) {
  const strength = clamp(wade, 0, 1);
  ctx.save();

  // soft underwater shadow
  ctx.fillStyle = `rgba(8,40,48,${0.16 * strength})`;
  ctx.beginPath();
  ctx.ellipse(p.x + 1.5, p.y + 8.5, 15.5, 7.2, 0, 0, TAU);
  ctx.fill();

  // foam at the waterline
  ctx.strokeStyle = `rgba(228,244,232,${0.18 + strength * 0.3})`;
  ctx.lineWidth = 1.35;
  ctx.beginPath();
  ctx.ellipse(p.x, waterline, 12.8, 4.2, 0, 0.06, Math.PI - 0.06);
  ctx.stroke();
  ctx.strokeStyle = `rgba(215,238,226,${0.12 + strength * 0.16})`;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.ellipse(p.x, waterline + 1.8, 14.6, 5.0, 0, 0.16, Math.PI - 0.16);
  ctx.stroke();

  // drifting rings
  const pace = p.moving ? 1.5 : 0.7;
  for (let i = 0; i < 3; i++) {
    const t = (time * 0.34 * pace + i / 3 + (p.wadePhase || 0)) % 1;
    const r = 10 + t * 26;
    ctx.globalAlpha = (1 - t) * (0.1 + strength * 0.2);
    ctx.strokeStyle = 'rgba(222,243,232,1)';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.ellipse(p.x, waterline + 1.2, r, r * 0.4, 0, 0, TAU);
    ctx.stroke();
  }

  ctx.restore();
}

export function drawPlayer(ctx, p, time, night = 0, wade = 0) {
  const walking = p.moving;
  const wadeClamped = clamp(wade, 0, 0.62);
  const stride = 11.5 * (1 - wadeClamped * 0.3);
  const bob = walking ? Math.sin(time * stride) * 1.4 * (1 - wadeClamped * 0.45) : Math.sin(time * 2.1) * 0.5;
  const step = walking ? Math.sin(time * stride) * 3.2 : 0;
  const sway = walking ? Math.sin(time * stride) * 0.035 : Math.sin(time * 2.1) * 0.015;
  const sink = wadeClamped * 5.5;
  const waterline = p.y + 11.5 - wadeClamped * 7.2;

  // shadow / underwater silhouette
  if (wadeClamped > 0.02) {
    ctx.fillStyle = `rgba(16,34,26,${0.16 * (1 - wadeClamped * 0.5)})`;
    ctx.beginPath();
    ctx.ellipse(p.x + 1.5, p.y + 9.5, 13.5, 5.4, 0, 0, TAU);
    ctx.fill();
  } else {
    ctx.fillStyle = 'rgba(16,34,26,.3)';
    ctx.beginPath();
    ctx.ellipse(p.x + 1.5, p.y + 9.5, 13.5, 5.4, 0, 0, TAU);
    ctx.fill();
  }

  if (night > 0.2) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, 42);
    g.addColorStop(0, `rgba(255,214,150,${0.12 * night})`);
    g.addColorStop(1, 'rgba(255,200,130,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 42, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  // body, clipped at the waterline
  ctx.save();
  if (wadeClamped > 0.02) {
    ctx.beginPath();
    ctx.rect(p.x - 52, p.y - 80, 104, waterline - (p.y - 80));
    ctx.clip();
  }
  ctx.translate(p.x, p.y + bob + sink);
  ctx.rotate(p.dir);
  ctx.scale(1.18, 1.18);
  drawPlayerBody(ctx, p, time, step);
  ctx.restore();

  if (wadeClamped > 0.02) {
    drawWading(ctx, p, time, wadeClamped, waterline);
  }

  // head stays above the surface and sinks only slightly
  ctx.save();
  ctx.translate(p.x, p.y + bob + sink * 0.32);
  ctx.rotate(p.dir);
  ctx.scale(1.18, 1.18);
  drawPlayerHead(ctx, time, sway);
  ctx.restore();
}

export function drawTargetRing(ctx, o, time) {
  const meta = o.scale;
  const r = o.kind === 'stick' ? 19 : 29 * meta;
  ctx.save();
  ctx.translate(o.x, o.y + 3);
  ctx.strokeStyle = 'rgba(255,247,225,.42)';
  ctx.lineWidth = 1.4;
  ctx.setLineDash([4, 7]);
  ctx.lineDashOffset = -time * 16;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle = 'rgba(255,247,225,.1)';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

export function drawWater(ctx, water, view, time) {
  const { sparkles, waterLines, shoreRipples } = water;
  ctx.save();
  ctx.lineCap = 'round';

  // slow drifting current lines
  for (const w of waterLines) {
    if (w.x < view.x1 - 20 || w.x > view.x2 + 20 || w.y < view.y1 - 20 || w.y > view.y2 + 20) continue;
    const pulse = 0.5 + 0.5 * Math.sin(time * w.speed + w.phase);
    ctx.globalAlpha = w.a * (0.28 + pulse * 0.72);
    ctx.strokeStyle = 'rgba(208,238,228,1)';
    ctx.lineWidth = 0.85;
    const x = w.x + Math.sin(time * 0.3 + w.phase) * 2.4;
    const y = w.y + Math.sin(time * 0.42 + w.phase) * 1.2;
    ctx.beginPath();
    ctx.moveTo(x - w.len * 0.5, y);
    ctx.quadraticCurveTo(x, y - 1.1 - w.tilt * 3.2, x + w.len * 0.5, y + w.tilt * 1.8);
    ctx.stroke();
  }

  // expanding rings near the shoreline
  for (const r of shoreRipples) {
    if (r.x < view.x1 - 20 || r.x > view.x2 + 20 || r.y < view.y1 - 20 || r.y > view.y2 + 20) continue;
    const t = (time * r.speed + r.phase) % 1;
    const rad = r.r + t * 10;
    ctx.globalAlpha = r.a * (1 - t) * 1.5;
    ctx.strokeStyle = 'rgba(226,244,233,1)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.ellipse(r.x, r.y, rad, rad * 0.42, 0, 0, TAU);
    ctx.stroke();
  }

  // glints on the surface
  for (const s of sparkles) {
    if (s.x < view.x1 || s.x > view.x2 || s.y < view.y1 || s.y > view.y2) continue;
    const pulse = 0.5 + 0.5 * Math.sin(time * s.speed + s.phase);
    ctx.globalAlpha = s.a * (0.32 + pulse * 0.68);
    ctx.strokeStyle = 'rgba(235,247,236,1)';
    ctx.lineWidth = 1.0;
    const y = s.y + Math.sin(time * 0.5 + s.phase) * 1.5;
    ctx.beginPath();
    ctx.moveTo(s.x - s.len * 0.5, y);
    ctx.quadraticCurveTo(s.x, y - 1.6, s.x + s.len * 0.5, y);
    ctx.stroke();
    if (pulse > 0.82) {
      ctx.globalAlpha *= 0.8;
      ctx.fillStyle = 'rgba(250,255,247,1)';
      ctx.beginPath();
      ctx.arc(s.x + s.len * 0.18, y - 0.8, 0.75, 0, TAU);
      ctx.fill();
    }
  }

  ctx.restore();
}

export function drawFirefly(ctx, f, time) {
  const pulse = 0.55 + 0.45 * Math.sin(time * f.speed + f.phase);
  const a = f.alpha * pulse;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = `rgba(214,240,150,${a * 0.13})`;
  ctx.beginPath();
  ctx.arc(f.x, f.y, 7, 0, TAU);
  ctx.fill();
  ctx.fillStyle = `rgba(236,252,184,${a})`;
  ctx.beginPath();
  ctx.arc(f.x, f.y, 1.5, 0, TAU);
  ctx.fill();
  ctx.restore();
}

export function drawParticle(ctx, p) {
  const life = clamp(p.life / p.maxLife, 0, 1);
  ctx.save();
  ctx.globalAlpha = life * (p.alpha ?? 0.9);
  ctx.fillStyle = p.color;
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot || 0);
  if (p.shape === 'leaf') {
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size, p.size * 0.46, 0, 0, TAU);
    ctx.fill();
  } else if (p.shape === 'spark') {
    ctx.fillRect(-p.size * 0.5, -p.size * 0.5, p.size, p.size);
  } else {
    ctx.beginPath();
    ctx.arc(0, 0, p.size, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

export function drawDecor(ctx, d, time) {
  if (d.type === 'fern') drawFern(ctx, d, time);
  else if (d.type === 'reed') drawReeds(ctx, d, time);
  else if (d.type === 'lily') drawLily(ctx, d, time);
  else if (d.type === 'pebble') drawPebble(ctx, d);
  else if (d.type === 'mushroom') drawMushroom(ctx, d, time);
  else if (d.type === 'log') drawLog(ctx, d);
  else if (d.type === 'driftwood') drawDriftwood(ctx, d);
  else if (d.type === 'stump') drawStump(ctx, d);
}

function drawFern(ctx, d, time) {
  const s = d.scale;
  const rnd = mulberry32(d.seed);
  const sway = Math.sin(time * 0.55 + d.phase) * 0.035;
  ctx.save();
  ctx.translate(d.x, d.y);
  ctx.fillStyle = 'rgba(20,42,27,.16)';
  ctx.beginPath();
  ctx.ellipse(2 * s, 2 * s, 9 * s, 4 * s, 0, 0, TAU);
  ctx.fill();
  ctx.rotate(sway);
  const fronds = 7;
  for (let i = 0; i < fronds; i++) {
    const a = -Math.PI / 2 + (i - (fronds - 1) / 2) * 0.4 + (rnd() - 0.5) * 0.1;
    const len = (8 + rnd() * 9) * s;
    const bend = (rnd() - 0.5) * 0.35;
    const tx = Math.cos(a + bend) * len;
    const ty = Math.sin(a + bend) * len * 0.85;
    const mx = Math.cos(a) * len * 0.55;
    const my = Math.sin(a) * len * 0.5;
    ctx.strokeStyle = i % 2 ? 'rgba(63,107,67,.9)' : 'rgba(85,124,75,.9)';
    ctx.lineWidth = 1.1 * s;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(mx, my, tx, ty);
    ctx.stroke();
    for (let j = 1; j <= 4; j++) {
      const t = j / 5;
      const px = mx * 2 * t * (1 - t) + tx * t * t;
      const py = my * 2 * t * (1 - t) + ty * t * t;
      const perp = a + Math.PI / 2;
      const leaf = (1.4 + rnd() * 1.6) * s;
      ctx.strokeStyle = 'rgba(116,151,92,.75)';
      ctx.lineWidth = 0.8 * s;
      ctx.beginPath();
      ctx.moveTo(px - Math.cos(perp) * leaf, py - Math.sin(perp) * leaf);
      ctx.lineTo(px + Math.cos(perp) * leaf, py + Math.sin(perp) * leaf);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawReeds(ctx, d, time) {
  const s = d.scale;
  const rnd = mulberry32(d.seed);
  const sway = Math.sin(time * 0.7 + d.phase) * 0.08;
  ctx.save();
  ctx.translate(d.x, d.y);
  ctx.fillStyle = 'rgba(20,40,30,.14)';
  ctx.beginPath();
  ctx.ellipse(1, 2, 7 * s, 3 * s, 0, 0, TAU);
  ctx.fill();
  const count = 5 + ((rnd() * 4) | 0);
  for (let i = 0; i < count; i++) {
    const bx = (rnd() - 0.5) * 10 * s;
    const h = (13 + rnd() * 17) * s;
    const lean = (rnd() - 0.5) * 7 * s + sway * h;
    ctx.strokeStyle = i % 3 === 0 ? 'rgba(145,148,89,.85)' : i % 2 ? 'rgba(99,128,79,.9)' : 'rgba(76,112,71,.9)';
    ctx.lineWidth = (0.8 + rnd() * 0.6) * s;
    ctx.beginPath();
    ctx.moveTo(bx, 1);
    ctx.quadraticCurveTo(bx + lean * 0.4, -h * 0.55, bx + lean, -h);
    ctx.stroke();
    if (i % 2 === 0) {
      ctx.fillStyle = 'rgba(113,87,57,.8)';
      ctx.beginPath();
      ctx.ellipse(bx + lean, -h, 1.3 * s, 3.2 * s, lean * 0.02, 0, TAU);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawLily(ctx, d, time) {
  const s = d.scale;
  const bob = Math.sin(time * 0.8 + d.phase) * 0.9;
  ctx.save();
  ctx.translate(d.x, d.y + bob);
  const r = 7 * s;
  ctx.fillStyle = 'rgba(38,89,72,.5)';
  ctx.beginPath();
  ctx.ellipse(1, 1.5, r, r * 0.75, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(73,125,83,.94)';
  ctx.beginPath();
  ctx.ellipse(0, 0, r, r * 0.72, 0.2, 0.35, TAU - 0.35);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(45,92,65,.7)';
  ctx.lineWidth = 0.7 * s;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(139,170,117,.5)';
  ctx.lineWidth = 0.7 * s;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(Math.cos(0.4) * r * 0.85, Math.sin(0.4) * r * 0.6);
  ctx.stroke();
  if (d.seed % 5 === 0) {
    ctx.fillStyle = 'rgba(238,222,196,.9)';
    ctx.beginPath();
    ctx.arc(r * 0.2, -r * 0.25, 1.5 * s, 0, TAU);
    ctx.fill();
    ctx.fillStyle = 'rgba(228,182,146,.85)';
    ctx.beginPath();
    ctx.arc(r * 0.2, -r * 0.25, 0.7 * s, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

function drawPebble(ctx, d) {
  const s = d.scale;
  const rnd = mulberry32(d.seed);
  ctx.save();
  ctx.translate(d.x, d.y);
  for (let i = 0; i < 3; i++) {
    const x = (rnd() - 0.5) * 7 * s;
    const y = (rnd() - 0.5) * 4 * s;
    const r = (1.1 + rnd() * 1.7) * s;
    ctx.fillStyle = i % 2 ? 'rgba(130,130,116,.8)' : 'rgba(154,152,136,.75)';
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.7, rnd() * TAU, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

function drawMushroom(ctx, d, time) {
  const s = d.scale;
  const rnd = mulberry32(d.seed);
  ctx.save();
  ctx.translate(d.x, d.y);
  const count = 2 + ((rnd() * 2) | 0);
  for (let i = 0; i < count; i++) {
    const x = (rnd() - 0.5) * 9 * s;
    const y = (rnd() - 0.5) * 5 * s;
    const r = (1.9 + rnd() * 1.5) * s;
    ctx.fillStyle = 'rgba(218,205,177,.9)';
    ctx.fillRect(x - 0.6 * s, y - 0.4 * s, 1.2 * s, 2.8 * s);
    ctx.fillStyle = i % 2 ? 'rgba(153,91,69,.92)' : 'rgba(185,157,108,.92)';
    ctx.beginPath();
    ctx.ellipse(x, y - 0.6 * s, r, r * 0.62, 0, Math.PI, TAU);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(246,236,209,.55)';
    ctx.beginPath();
    ctx.arc(x - r * 0.3, y - 1 * s, 0.4 * s, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

function drawLog(ctx, d) {
  const s = d.scale;
  const rnd = mulberry32(d.seed);
  ctx.save();
  ctx.translate(d.x, d.y);
  ctx.rotate((d.seed % 100) / 100 * 1.6 - 0.8);
  ctx.fillStyle = 'rgba(19,36,25,.2)';
  ctx.beginPath();
  ctx.ellipse(2 * s, 3 * s, 16 * s, 6 * s, 0, 0, TAU);
  ctx.fill();
  const grad = ctx.createLinearGradient(0, -6 * s, 0, 6 * s);
  grad.addColorStop(0, '#8a6846');
  grad.addColorStop(0.55, '#6d5136');
  grad.addColorStop(1, '#543f2c');
  ctx.fillStyle = grad;
  roundRect(ctx, -15 * s, -4.6 * s, 30 * s, 9.2 * s, 4.6 * s);
  ctx.fill();
  ctx.strokeStyle = 'rgba(53,40,29,.4)';
  ctx.lineWidth = 0.7 * s;
  for (let i = 0; i < 5; i++) {
    const x = -11 * s + rnd() * 22 * s;
    ctx.beginPath();
    ctx.moveTo(x, -3.2 * s);
    ctx.lineTo(x + 1.5 * s, 3.2 * s);
    ctx.stroke();
  }
  ctx.fillStyle = '#b39a71';
  ctx.beginPath();
  ctx.ellipse(15 * s, 0, 2.4 * s, 4.5 * s, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(123,100,70,.6)';
  ctx.lineWidth = 0.6 * s;
  ctx.beginPath();
  ctx.ellipse(15 * s, 0, 1.2 * s, 2.4 * s, 0, 0, TAU);
  ctx.stroke();
  ctx.fillStyle = 'rgba(99,133,78,.75)';
  ctx.beginPath();
  ctx.ellipse(-3 * s, -3 * s, 5 * s, 1.8 * s, 0.2, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawDriftwood(ctx, d) {
  const s = d.scale;
  ctx.save();
  ctx.translate(d.x, d.y);
  ctx.rotate((d.seed % 100) / 100 * 1.8 - 0.9);
  ctx.fillStyle = 'rgba(20,38,30,.14)';
  ctx.beginPath();
  ctx.ellipse(1 * s, 2 * s, 13 * s, 3.5 * s, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(177,166,139,.9)';
  ctx.lineWidth = 3 * s;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-12 * s, 0);
  ctx.quadraticCurveTo(0, -2 * s, 12 * s, 1 * s);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(141,131,108,.85)';
  ctx.lineWidth = 1.2 * s;
  ctx.beginPath();
  ctx.moveTo(2 * s, -0.5 * s);
  ctx.lineTo(7 * s, -4 * s);
  ctx.moveTo(-5 * s, 0);
  ctx.lineTo(-8 * s, 3 * s);
  ctx.stroke();
  ctx.lineCap = 'butt';
  ctx.restore();
}

function drawStump(ctx, d) {
  const s = d.scale;
  ctx.save();
  ctx.translate(d.x, d.y);
  ctx.fillStyle = 'rgba(20,38,27,.2)';
  ctx.beginPath();
  ctx.ellipse(3 * s, 4 * s, 10 * s, 4.5 * s, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#73563a';
  ctx.beginPath();
  ctx.ellipse(0, 1 * s, 8.5 * s, 7 * s, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#c0a274';
  ctx.beginPath();
  ctx.ellipse(0, -0.5 * s, 7.5 * s, 6 * s, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(116,87,55,.5)';
  ctx.lineWidth = 0.7 * s;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.ellipse(0, -0.5 * s, (2.2 + i * 2.2) * s, (1.6 + i * 1.7) * s, 0, 0, TAU);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(98,129,74,.8)';
  ctx.beginPath();
  ctx.ellipse(-6 * s, 3 * s, 4 * s, 2 * s, -0.3, 0, TAU);
  ctx.fill();
  ctx.restore();
}

export function drawButterfly(ctx, b, time) {
  const flap = 0.35 + Math.abs(Math.sin(time * b.flap + b.phase)) * 0.9;
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.rotate(b.angle);
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = b.color;
  ctx.beginPath();
  ctx.ellipse(0, -3.2, 3.6 * flap, 2.3, -0.5, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0, 3.2, 3.6 * flap, 2.3, 0.5, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(65,54,42,.8)';
  ctx.beginPath();
  ctx.ellipse(0, 0, 0.9, 2.6, 0, 0, TAU);
  ctx.fill();
  ctx.restore();
}


export function drawDarkness(ctx, lightCanvas, darkness, playerScreen, radius, firesScreen, time, viewW, viewH) {
  const lctx = lightCanvas.getContext('2d');
  lctx.setTransform(1, 0, 0, 1, 0, 0);
  lctx.clearRect(0, 0, viewW, viewH);
  const alpha = 0.93 * Math.pow(darkness, 0.9);
  lctx.fillStyle = `rgba(5,12,34,${alpha})`;
  lctx.fillRect(0, 0, viewW, viewH);
  lctx.globalCompositeOperation = 'destination-out';

  function punch(x, y, r, strength = 1) {
    const g = lctx.createRadialGradient(x, y, r * 0.12, x, y, r);
    g.addColorStop(0, `rgba(0,0,0,${strength})`);
    g.addColorStop(0.55, `rgba(0,0,0,${strength * 0.88})`);
    g.addColorStop(0.82, `rgba(0,0,0,${strength * 0.35})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    lctx.fillStyle = g;
    lctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  punch(playerScreen.x, playerScreen.y, radius, 1);
  for (const f of firesScreen) {
    punch(f.x, f.y, f.r, 1);
  }

  lctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(lightCanvas, 0, 0, viewW, viewH);
}
