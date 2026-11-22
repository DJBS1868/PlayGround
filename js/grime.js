/* Shared encrustation layers so a relic looks the same when lifted and when
   it first reaches the conservation bench. */

function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function paintDirtLayer(ctx, w, h, maskCanvas, seed = 113) {
  ctx.clearRect(0, 0, w, h);
  const rr = seeded(seed);

  ctx.fillStyle = 'rgba(72, 54, 35, .92)';
  ctx.fillRect(0, 0, w, h);

  // mottled encrustation
  for (let i = 0; i < 130; i++) {
    const x = rr() * w, y = rr() * h;
    const rw = 3 + rr() * 20, rh = 2 + rr() * 13;
    const g = ctx.createRadialGradient(x, y, 0, x, y, rw);
    const dark = rr() > .46;
    g.addColorStop(0, dark ? `rgba(45, 32, 20, ${.16 + rr() * .28})` : `rgba(137, 108, 72, ${.1 + rr() * .23})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1, rh / rw);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, rw, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // grime grain
  for (let i = 0; i < 460; i++) {
    ctx.beginPath();
    ctx.arc(rr() * w, rr() * h, .3 + rr() * 1.6, 0, Math.PI * 2);
    ctx.fillStyle = rr() > .5 ? `rgba(154, 123, 79, ${.05 + rr() * .17})` : `rgba(38, 27, 17, ${.06 + rr() * .18})`;
    ctx.fill();
  }

  // crust cracks
  ctx.strokeStyle = 'rgba(35, 24, 15, .32)';
  for (let i = 0; i < 12; i++) {
    let x = rr() * w, y = rr() * h;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let j = 0; j < 4; j++) {
      x += (rr() - .5) * 28;
      y += (rr() - .5) * 28;
      ctx.lineTo(x, y);
    }
    ctx.lineWidth = .6 + rr() * .8;
    ctx.stroke();
  }

  // clip to artifact silhouette
  ctx.save();
  ctx.globalCompositeOperation = 'destination-in';
  ctx.drawImage(maskCanvas, 0, 0, w, h);
  ctx.restore();
}

export function paintSaltLayer(ctx, w, h, maskCanvas, seed = 451) {
  ctx.clearRect(0, 0, w, h);
  const rr = seeded(seed);

  // base crust
  ctx.fillStyle = 'rgba(224, 220, 199, .42)';
  ctx.fillRect(0, 0, w, h);

  // crystalline blooms
  for (let i = 0; i < 80; i++) {
    const x = rr() * w, y = rr() * h;
    const r = 4 + rr() * 18;
    const g = ctx.createRadialGradient(x - r * .2, y - r * .25, 0, x, y, r);
    g.addColorStop(0, `rgba(255, 253, 239, ${.18 + rr() * .22})`);
    g.addColorStop(.55, `rgba(211, 219, 207, ${.08 + rr() * .14})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // salt veins / crack fill
  for (let i = 0; i < 22; i++) {
    let x = rr() * w, y = rr() * h;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let j = 0; j < 4; j++) {
      x += (rr() - .5) * 18;
      y += (rr() - .5) * 18;
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(248, 247, 231, ${.08 + rr() * .22})`;
    ctx.lineWidth = 1 + rr() * 2.6;
    ctx.stroke();
  }

  // blue-grey shadows in the salt
  for (let i = 0; i < 30; i++) {
    ctx.beginPath();
    ctx.arc(rr() * w, rr() * h, 2 + rr() * 9, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(117, 139, 133, ${.025 + rr() * .09})`;
    ctx.fill();
  }

  // clip
  ctx.save();
  ctx.globalCompositeOperation = 'destination-in';
  ctx.drawImage(maskCanvas, 0, 0, w, h);
  ctx.restore();
}
