/* Procedural artifact illustrations and expedition scenes. */

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.closePath();
}

function glow(ctx, x, y, r, color) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  circle(ctx, x, y, r);
  ctx.fill();
}

const PAINTERS = {
  coin(ctx, tint) {
    const r = rng(44);
    ctx.save();
    // irregular hand-struck edge
    ctx.beginPath();
    for (let i = 0; i <= 64; i++) {
      const a = i / 64 * Math.PI * 2;
      const rr = 64 + Math.sin(a * 7) * 2.2 + (r() - .5) * 2.2;
      const x = 100 + Math.cos(a) * rr;
      const y = 100 + Math.sin(a) * rr;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.closePath();
    const g = ctx.createRadialGradient(76, 70, 8, 100, 100, 82);
    g.addColorStop(0, '#ffe7a0');
    g.addColorStop(.32, '#e4b75c');
    g.addColorStop(.72, '#b57a29');
    g.addColorStop(1, '#7e4b14');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = 'rgba(94, 52, 8, .7)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // rim
    ctx.beginPath();
    ctx.arc(100, 100, 54, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 231, 164, .5)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(100, 100, 51, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(95, 52, 10, .35)';
    ctx.stroke();

    // portrait bust in profile
    ctx.save();
    ctx.translate(99, 103);
    ctx.fillStyle = 'rgba(105, 59, 13, .72)';
    ctx.beginPath();
    ctx.moveTo(-20, 33);
    ctx.bezierCurveTo(-25, 13, -17, -1, -5, -5);
    ctx.bezierCurveTo(-8, -12, -3, -22, 6, -21);
    ctx.bezierCurveTo(15, -20, 16, -10, 14, -5);
    ctx.bezierCurveTo(23, -4, 26, 5, 20, 8);
    ctx.bezierCurveTo(22, 13, 17, 17, 15, 17);
    ctx.bezierCurveTo(18, 22, 15, 30, 7, 33);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-18, 19);
    ctx.bezierCurveTo(-3, 14, 8, 14, 20, 21);
    ctx.strokeStyle = 'rgba(255, 226, 150, .35)';
    ctx.lineWidth = 1.6;
    ctx.stroke();
    // headdress
    ctx.beginPath();
    ctx.moveTo(-8, -6);
    ctx.bezierCurveTo(-30, -6, -32, 16, -23, 29);
    ctx.strokeStyle = 'rgba(105, 59, 13, .65)';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();

    // abstract kufic border marks
    ctx.strokeStyle = 'rgba(92, 50, 8, .58)';
    ctx.lineWidth = 1.4;
    ctx.lineCap = 'round';
    for (let i = 0; i < 18; i++) {
      const a = i / 18 * Math.PI * 2 + .08;
      const x1 = 100 + Math.cos(a) * 58, y1 = 100 + Math.sin(a) * 58;
      const x2 = 100 + Math.cos(a + .07) * 62, y2 = 100 + Math.sin(a + .07) * 62;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    // specular
    ctx.beginPath();
    ctx.ellipse(75, 63, 22, 10, -.7, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 244, 200, .24)';
    ctx.fill();
    ctx.restore();
  },

  lamp(ctx, tint) {
    const r = rng(12);
    ctx.save();
    // loop handle
    ctx.beginPath();
    ctx.moveTo(68, 103);
    ctx.bezierCurveTo(46, 96, 38, 116, 49, 131);
    ctx.bezierCurveTo(54, 137, 62, 136, 68, 130);
    ctx.strokeStyle = '#7b3f23';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.strokeStyle = '#c37648';
    ctx.lineWidth = 3.6;
    ctx.stroke();

    // broad, shallow body
    ctx.beginPath();
    ctx.moveTo(63, 117);
    ctx.bezierCurveTo(63, 98, 80, 87, 103, 87);
    ctx.bezierCurveTo(127, 87, 144, 98, 145, 116);
    ctx.bezierCurveTo(146, 134, 130, 145, 104, 145);
    ctx.bezierCurveTo(79, 145, 63, 135, 63, 117);
    ctx.closePath();
    const g = ctx.createRadialGradient(84, 97, 3, 108, 125, 62);
    g.addColorStop(0, '#e3a06b');
    g.addColorStop(.36, '#bf6f42');
    g.addColorStop(.7, '#914c2b');
    g.addColorStop(.9, '#71351d');
    g.addColorStop(1, '#542715');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = 'rgba(74, 31, 13, .78)';
    ctx.lineWidth = 1.7;
    ctx.stroke();

    // pointed spout
    ctx.beginPath();
    ctx.moveTo(135, 101);
    ctx.bezierCurveTo(154, 100, 171, 105, 182, 111);
    ctx.bezierCurveTo(174, 118, 158, 124, 138, 126);
    ctx.closePath();
    ctx.fillStyle = '#8b4928';
    ctx.fill();
    ctx.strokeStyle = '#68321a';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(179, 111, 4.2, 6.2, -.15, 0, Math.PI * 2);
    ctx.fillStyle = '#2d160b';
    ctx.fill();

    // fill hole and collar
    ctx.beginPath();
    ctx.ellipse(103, 96, 18, 8, -.04, 0, Math.PI * 2);
    ctx.fillStyle = '#5f2e18';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(103, 94, 15, 6, -.04, 0, Math.PI * 2);
    ctx.fillStyle = '#2a1208';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(103, 92.5, 17, 6.6, -.04, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(244, 179, 116, .35)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // concentric relief
    ctx.strokeStyle = 'rgba(250, 196, 139, .25)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.ellipse(104, 119, 28 - i * 6, 17 - i * 4, 0, .1, Math.PI - .1);
      ctx.stroke();
    }
    // palmette motif
    ctx.save();
    ctx.translate(103, 119);
    ctx.strokeStyle = 'rgba(255, 208, 151, .32)';
    ctx.lineWidth = 1.1;
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i - 2) * .36;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(Math.cos(a) * 8, Math.sin(a) * 9, Math.cos(a) * 15, Math.sin(a) * 18);
      ctx.stroke();
    }
    ctx.restore();

    // soot and wear
    ctx.beginPath();
    ctx.ellipse(163, 113, 17, 8, .08, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(37, 19, 9, .38)';
    ctx.fill();
    for (let i = 0; i < 24; i++) {
      ctx.beginPath();
      ctx.arc(62 + r() * 86, 93 + r() * 46, r() * 1.4 + .3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(247, 201, 144, ${.04 + r() * .1})`;
      ctx.fill();
    }
    // chipped rim
    ctx.beginPath();
    ctx.moveTo(73, 104);
    ctx.lineTo(79, 99);
    ctx.lineTo(82, 105);
    ctx.closePath();
    ctx.fillStyle = 'rgba(52, 24, 11, .55)';
    ctx.fill();
    ctx.restore();
  },

  bell(ctx, tint) {
    ctx.save();
    // loop
    ctx.beginPath();
    ctx.arc(100, 61, 15, Math.PI * .88, Math.PI * 2.12);
    ctx.strokeStyle = '#64724f';
    ctx.lineWidth = 7;
    ctx.stroke();
    ctx.strokeStyle = '#a3a77a';
    ctx.lineWidth = 3;
    ctx.stroke();

    // bell body
    ctx.beginPath();
    ctx.moveTo(77, 122);
    ctx.bezierCurveTo(75, 94, 82, 76, 100, 76);
    ctx.bezierCurveTo(118, 76, 125, 94, 123, 122);
    ctx.bezierCurveTo(128, 134, 142, 139, 146, 146);
    ctx.bezierCurveTo(126, 153, 74, 153, 54, 146);
    ctx.bezierCurveTo(58, 139, 72, 134, 77, 122);
    ctx.closePath();
    const g = ctx.createLinearGradient(55, 82, 145, 148);
    g.addColorStop(0, '#a7ad80');
    g.addColorStop(.24, '#6f7e5b');
    g.addColorStop(.54, '#48573e');
    g.addColorStop(.8, '#718061');
    g.addColorStop(1, '#3b4935');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = 'rgba(38, 49, 33, .8)';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // lip
    ctx.beginPath();
    ctx.ellipse(100, 147, 46, 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#45553c';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(100, 144, 38, 5, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(211, 208, 155, .26)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // ridges
    ctx.strokeStyle = 'rgba(198, 199, 145, .26)';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.ellipse(100, 94 + i * 12, 20 + i * 3.6, 4.2, 0, .15, Math.PI - .15);
      ctx.stroke();
    }
    // sun stamp
    circle(ctx, 100, 110, 11);
    ctx.strokeStyle = 'rgba(214, 205, 146, .36)';
    ctx.stroke();
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(100 + Math.cos(a) * 13, 110 + Math.sin(a) * 13);
      ctx.lineTo(100 + Math.cos(a) * 18, 110 + Math.sin(a) * 18);
      ctx.stroke();
    }
    // clapper
    ctx.beginPath();
    ctx.arc(100, 157, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#37442f';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(98, 154, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(206, 197, 139, .3)';
    ctx.fill();
    // patina blooms
    for (let i = 0; i < 9; i++) {
      glow(ctx, 64 + (i * 19) % 70, 88 + (i * 31) % 48, 11 + (i % 3) * 5, 'rgba(145, 177, 135, .08)');
    }
    ctx.restore();
  },

  scarab(ctx, tint) {
    ctx.save();
    // legs
    ctx.strokeStyle = '#2e7e75';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    const legs = [
      [68, 89, 47, 78], [62, 105, 40, 105], [67, 121, 46, 135],
      [132, 89, 153, 78], [138, 105, 160, 105], [133, 121, 154, 135]
    ];
    for (const [x1, y1, x2, y2] of legs) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo((x1 + x2) / 2 + (y2 > y1 ? 5 : -5), (y1 + y2) / 2, x2, y2);
      ctx.stroke();
    }
    // body
    ctx.beginPath();
    ctx.ellipse(100, 107, 37, 43, 0, 0, Math.PI * 2);
    const g = ctx.createRadialGradient(83, 86, 5, 105, 120, 52);
    g.addColorStop(0, '#8fd5c7');
    g.addColorStop(.32, '#56b3a7');
    g.addColorStop(.68, '#2e8c83');
    g.addColorStop(1, '#17645f');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = '#155d58';
    ctx.lineWidth = 1.7;
    ctx.stroke();

    // wing-case seam and head
    ctx.beginPath();
    ctx.moveTo(100, 93);
    ctx.lineTo(100, 146);
    ctx.strokeStyle = 'rgba(14, 82, 77, .65)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(100, 71, 22, 15, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#2d8b82';
    ctx.fill();
    ctx.strokeStyle = '#175f5a';
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(100, 68, 9, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(217, 247, 227, .32)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    // head plate
    ctx.beginPath();
    ctx.moveTo(87, 78);
    ctx.quadraticCurveTo(100, 85, 113, 78);
    ctx.strokeStyle = '#1b6c65';
    ctx.lineWidth = 2;
    ctx.stroke();

    // engraved sun disc held at front
    circle(ctx, 100, 133, 12);
    ctx.fillStyle = '#d5b35b';
    ctx.fill();
    ctx.strokeStyle = '#886226';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(100, 133, 5, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(91, 60, 17, .45)';
    ctx.stroke();

    // wing-case markings
    ctx.strokeStyle = 'rgba(223, 248, 226, .28)';
    ctx.lineWidth = 1.1;
    for (const side of [-1, 1]) {
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.ellipse(100 + side * 16, 96 + i * 11, 8, 3.4, side * .24, .2, Math.PI - .2);
        ctx.stroke();
      }
    }
    // glaze crazing
    ctx.strokeStyle = 'rgba(223, 249, 238, .2)';
    ctx.lineWidth = .7;
    const r = rng(8);
    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      let x = 72 + r() * 54, y = 84 + r() * 54;
      ctx.moveTo(x, y);
      for (let j = 0; j < 3; j++) { x += (r() - .5) * 12; y += (r() - .5) * 12; ctx.lineTo(x, y); }
      ctx.stroke();
    }
    ctx.restore();
  },

  amphora(ctx, tint) {
    ctx.save();
    // body
    ctx.beginPath();
    ctx.moveTo(87, 49);
    ctx.lineTo(113, 49);
    ctx.lineTo(112, 68);
    ctx.bezierCurveTo(139, 80, 149, 105, 139, 132);
    ctx.bezierCurveTo(131, 155, 69, 155, 61, 132);
    ctx.bezierCurveTo(51, 105, 61, 80, 88, 68);
    ctx.closePath();
    const g = ctx.createLinearGradient(54, 60, 147, 148);
    g.addColorStop(0, '#e8e1cb');
    g.addColorStop(.28, '#c9c4ad');
    g.addColorStop(.58, '#9fa48f');
    g.addColorStop(.84, '#c2bea4');
    g.addColorStop(1, '#817c67');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = '#68644f';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // neck rim
    ctx.beginPath();
    ctx.ellipse(100, 49, 14, 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#7b735b';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(100, 48, 10, 3.2, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#413e30';
    ctx.fill();

    // handles
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(88 + side * 2, 68);
      ctx.bezierCurveTo(60 + side * 4, 64, 48 + side * 4, 92, 70 + side * 2, 100);
      ctx.strokeStyle = '#77725d';
      ctx.lineWidth = 6;
      ctx.stroke();
      ctx.strokeStyle = '#c3bca4';
      ctx.lineWidth = 2.4;
      ctx.stroke();
    }

    // blue slip bands
    ctx.strokeStyle = 'rgba(63, 110, 105, .58)';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.ellipse(100, 82, 29, 8, 0, .1, Math.PI - .1);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(100, 92, 34, 9, 0, .1, Math.PI - .1);
    ctx.stroke();
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    for (let i = 0; i < 9; i++) {
      const x = 72 + i * 7;
      ctx.moveTo(x, 113);
      ctx.quadraticCurveTo(x + 3.5, 108, x + 7, 113);
    }
    ctx.stroke();
    // salt bloom
    for (let i = 0; i < 13; i++) {
      const x = 62 + (i * 23) % 76, y = 70 + (i * 17) % 68;
      glow(ctx, x, y, 7 + (i % 3) * 4, 'rgba(247, 244, 226, .18)');
    }
    // crack
    ctx.beginPath();
    ctx.moveTo(82, 96);
    ctx.lineTo(88, 111);
    ctx.lineTo(83, 121);
    ctx.lineTo(91, 136);
    ctx.strokeStyle = 'rgba(75, 69, 53, .4)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  },

  ibis(ctx, tint) {
    ctx.save();
    // legs
    ctx.strokeStyle = '#315d53';
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(96, 126); ctx.lineTo(91, 158); ctx.lineTo(81, 164); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(109, 127); ctx.lineTo(111, 157); ctx.lineTo(123, 163); ctx.stroke();
    // body
    ctx.beginPath();
    ctx.moveTo(65, 105);
    ctx.bezierCurveTo(62, 83, 80, 70, 103, 72);
    ctx.bezierCurveTo(127, 74, 139, 91, 132, 111);
    ctx.bezierCurveTo(126, 128, 92, 136, 74, 123);
    ctx.closePath();
    const g = ctx.createLinearGradient(62, 72, 137, 130);
    g.addColorStop(0, '#6e9d8c');
    g.addColorStop(.32, '#3d7669');
    g.addColorStop(.65, '#285a50');
    g.addColorStop(1, '#1c4139');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = '#193c34';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    // tail
    ctx.beginPath();
    ctx.moveTo(66, 107);
    ctx.lineTo(42, 124);
    ctx.lineTo(48, 132);
    ctx.lineTo(70, 119);
    ctx.closePath();
    ctx.fillStyle = '#214c43';
    ctx.fill();
    // neck
    ctx.beginPath();
    ctx.moveTo(116, 82);
    ctx.bezierCurveTo(128, 68, 128, 51, 116, 42);
    ctx.bezierCurveTo(108, 36, 99, 38, 96, 46);
    ctx.bezierCurveTo(104, 48, 109, 57, 105, 67);
    ctx.closePath();
    ctx.fillStyle = '#2a5c51';
    ctx.fill();
    // head
    ctx.beginPath();
    ctx.ellipse(105, 44, 13, 10, -.25, 0, Math.PI * 2);
    ctx.fillStyle = '#32675a';
    ctx.fill();
    // beak
    ctx.beginPath();
    ctx.moveTo(95, 46);
    ctx.bezierCurveTo(79, 49, 63, 57, 54, 70);
    ctx.bezierCurveTo(63, 63, 80, 57, 98, 53);
    ctx.closePath();
    ctx.fillStyle = '#9c7e3f';
    ctx.fill();
    ctx.strokeStyle = '#6d5226';
    ctx.lineWidth = 1;
    ctx.stroke();
    // eye inlay
    circle(ctx, 110, 42, 3.2);
    ctx.fillStyle = '#e3c06a';
    ctx.fill();
    circle(ctx, 110, 42, 1.2);
    ctx.fillStyle = '#3b2a12';
    ctx.fill();
    // feather detail
    ctx.strokeStyle = 'rgba(179, 213, 195, .23)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      ctx.arc(94, 101, 10 + i * 3.8, Math.PI * 1.1, Math.PI * 1.85);
      ctx.stroke();
    }
    // gold collar
    ctx.beginPath();
    ctx.arc(100, 75, 17, Math.PI * .75, Math.PI * 1.55);
    ctx.strokeStyle = 'rgba(211, 172, 89, .55)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  },

  tooth(ctx, tint) {
    ctx.save();
    // root / base
    ctx.beginPath();
    ctx.moveTo(69, 82);
    ctx.bezierCurveTo(72, 58, 92, 43, 109, 41);
    ctx.bezierCurveTo(132, 40, 146, 55, 142, 76);
    ctx.bezierCurveTo(139, 96, 126, 111, 115, 130);
    ctx.bezierCurveTo(108, 145, 99, 160, 92, 164);
    ctx.bezierCurveTo(88, 151, 88, 132, 83, 115);
    ctx.bezierCurveTo(76, 104, 66, 96, 69, 82);
    ctx.closePath();
    const g = ctx.createLinearGradient(72, 46, 138, 154);
    g.addColorStop(0, '#e5d6b4');
    g.addColorStop(.28, '#c5b18a');
    g.addColorStop(.58, '#a38a62');
    g.addColorStop(.82, '#7e6847');
    g.addColorStop(1, '#5a482f');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = '#5e4c32';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // enamel band
    ctx.beginPath();
    ctx.moveTo(72, 76);
    ctx.bezierCurveTo(91, 62, 121, 57, 141, 73);
    ctx.bezierCurveTo(133, 86, 100, 92, 76, 89);
    ctx.closePath();
    ctx.fillStyle = 'rgba(234, 219, 184, .55)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(88, 68, 43, .35)';
    ctx.stroke();
    // root split
    ctx.beginPath();
    ctx.moveTo(100, 111);
    ctx.bezierCurveTo(102, 132, 96, 145, 91, 163);
    ctx.strokeStyle = 'rgba(70, 53, 33, .65)';
    ctx.lineWidth = 2;
    ctx.stroke();
    // cracks / fossil grain
    const r = rng(33);
    ctx.strokeStyle = 'rgba(70, 54, 34, .25)';
    ctx.lineWidth = .8;
    for (let i = 0; i < 8; i++) {
      let x = 78 + r() * 54, y = 70 + r() * 66;
      ctx.beginPath(); ctx.moveTo(x, y);
      for (let j = 0; j < 3; j++) { x += (r() - .5) * 10; y += (r() - .5) * 12; ctx.lineTo(x, y); }
      ctx.stroke();
    }
    // sediment matrix at base
    ctx.beginPath();
    ctx.ellipse(94, 160, 26, 7, -.1, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(86, 65, 40, .36)';
    ctx.fill();
    ctx.restore();
  },

  ammonite(ctx, tint) {
    ctx.save();
    // outer shell spiral
    ctx.beginPath();
    ctx.arc(100, 102, 64, 0, Math.PI * 2);
    const g = ctx.createRadialGradient(81, 80, 5, 106, 111, 70);
    g.addColorStop(0, '#f0d184');
    g.addColorStop(.28, '#cfa64c');
    g.addColorStop(.58, '#9a732b');
    g.addColorStop(.82, '#6c501c');
    g.addColorStop(1, '#3f3016');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = 'rgba(62, 45, 16, .65)';
    ctx.lineWidth = 1.8;
    ctx.stroke();
    // inner spiral rings
    ctx.strokeStyle = 'rgba(255, 233, 171, .35)';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(100 + i * 1.3, 102 + i * 1.6, 50 - i * 9, .2, Math.PI * 1.9);
      ctx.stroke();
    }
    // radial ribs
    for (let i = 0; i < 24; i++) {
      const a = i / 24 * Math.PI * 2;
      const r0 = 23 + (i % 5) * 2;
      ctx.beginPath();
      ctx.moveTo(100 + Math.cos(a) * r0, 102 + Math.sin(a) * r0);
      ctx.quadraticCurveTo(
        100 + Math.cos(a + .05) * 45, 102 + Math.sin(a + .05) * 45,
        100 + Math.cos(a + .02) * 62, 102 + Math.sin(a + .02) * 62
      );
      ctx.strokeStyle = i % 2 ? 'rgba(73, 52, 17, .32)' : 'rgba(255, 232, 164, .28)';
      ctx.lineWidth = i % 2 ? 1 : 1.4;
      ctx.stroke();
    }
    // centre whorl
    circle(ctx, 100, 102, 19);
    ctx.fillStyle = '#5b431a';
    ctx.fill();
    circle(ctx, 97, 98, 7);
    ctx.fillStyle = '#e1c06d';
    ctx.fill();
    circle(ctx, 95, 96, 2.5);
    ctx.fillStyle = 'rgba(255, 245, 203, .65)';
    ctx.fill();
    // pyrite flecks
    const r = rng(71);
    for (let i = 0; i < 30; i++) {
      const a = r() * Math.PI * 2, rad = r() * 58;
      const x = 100 + Math.cos(a) * rad, y = 102 + Math.sin(a) * rad;
      ctx.beginPath();
      ctx.arc(x, y, .4 + r() * 1.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 239, 180, ${.18 + r() * .4})`;
      ctx.fill();
    }
    // matrix chips on edge
    for (let i = 0; i < 8; i++) {
      const a = r() * Math.PI * 2;
      const x = 100 + Math.cos(a) * (60 + r() * 7), y = 102 + Math.sin(a) * (60 + r() * 7);
      ctx.beginPath();
      ctx.arc(x, y, 2 + r() * 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(82, 70, 49, .5)';
      ctx.fill();
    }
    ctx.restore();
  },

  pendant(ctx, tint) {
    ctx.save();
    // cord hole and flat stone
    ctx.beginPath();
    ctx.moveTo(100, 42);
    ctx.bezierCurveTo(129, 43, 145, 63, 140, 94);
    ctx.bezierCurveTo(136, 130, 116, 157, 100, 163);
    ctx.bezierCurveTo(84, 157, 64, 130, 60, 94);
    ctx.bezierCurveTo(55, 63, 71, 43, 100, 42);
    ctx.closePath();
    const g = ctx.createLinearGradient(58, 48, 142, 154);
    g.addColorStop(0, '#e0d0aa');
    g.addColorStop(.3, '#c2ad82');
    g.addColorStop(.62, '#9f8862');
    g.addColorStop(.86, '#806b4b');
    g.addColorStop(1, '#5c4d36');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = '#5f4f38';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // suspension hole
    circle(ctx, 100, 55, 5.5);
    ctx.fillStyle = '#3e3121';
    ctx.fill();
    ctx.strokeStyle = 'rgba(240, 220, 176, .25)';
    ctx.stroke();
    // carved swimmer / fish figure
    ctx.save();
    ctx.translate(100, 105);
    ctx.rotate(-.2);
    ctx.strokeStyle = 'rgba(73, 56, 35, .7)';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.ellipse(0, 0, 26, 11, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(24, 0);
    ctx.lineTo(38, -9);
    ctx.lineTo(35, 0);
    ctx.lineTo(38, 9);
    ctx.closePath();
    ctx.fillStyle = 'rgba(73, 56, 35, .65)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-14, -2, 1.8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(243, 224, 182, .55)';
    ctx.fill();
    // fins
    ctx.beginPath();
    ctx.moveTo(0, 10); ctx.quadraticCurveTo(6, 23, 15, 12); ctx.stroke();
    ctx.restore();
    // incised border dots
    for (let i = 0; i < 18; i++) {
      const a = i / 18 * Math.PI * 2;
      const x = 100 + Math.cos(a) * 37, y = 104 + Math.sin(a) * 51;
      ctx.beginPath();
      ctx.arc(x, y, 1.1, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(77, 59, 37, .4)';
      ctx.fill();
    }
    // age cracks
    ctx.strokeStyle = 'rgba(71, 55, 35, .28)';
    ctx.lineWidth = .8;
    ctx.beginPath(); ctx.moveTo(70, 76); ctx.lineTo(82, 90); ctx.lineTo(78, 105); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(128, 125); ctx.lineTo(117, 138); ctx.stroke();
    ctx.restore();
  },

  mask(ctx, tint) {
    ctx.save();
    // face silhouette
    ctx.beginPath();
    ctx.moveTo(100, 38);
    ctx.bezierCurveTo(136, 38, 150, 66, 145, 103);
    ctx.bezierCurveTo(142, 128, 132, 146, 116, 158);
    ctx.lineTo(100, 171);
    ctx.lineTo(84, 158);
    ctx.bezierCurveTo(68, 146, 58, 128, 55, 103);
    ctx.bezierCurveTo(50, 66, 64, 38, 100, 38);
    ctx.closePath();
    const g = ctx.createLinearGradient(55, 42, 145, 160);
    g.addColorStop(0, '#65545a');
    g.addColorStop(.24, '#41363e');
    g.addColorStop(.55, '#251f28');
    g.addColorStop(.8, '#17141c');
    g.addColorStop(1, '#0c0b10');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = 'rgba(10, 9, 13, .9)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // brow ridge
    ctx.beginPath();
    ctx.moveTo(61, 87);
    ctx.bezierCurveTo(77, 75, 91, 75, 100, 80);
    ctx.bezierCurveTo(109, 75, 123, 75, 139, 87);
    ctx.strokeStyle = 'rgba(9, 8, 12, .9)';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.strokeStyle = 'rgba(173, 153, 122, .18)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // gold eyes
    for (const side of [-1, 1]) {
      const ex = 100 + side * 19;
      ctx.beginPath();
      ctx.ellipse(ex, 96, 12, 6, side * .1, 0, Math.PI * 2);
      ctx.fillStyle = '#c99e48';
      ctx.fill();
      ctx.strokeStyle = '#76521e';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(ex, 96, 4.2, 4.2, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#2a1a08';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ex - 1.5, 94.5, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 245, 200, .75)';
      ctx.fill();
    }
    // nose
    ctx.beginPath();
    ctx.moveTo(100, 88);
    ctx.lineTo(91, 118);
    ctx.quadraticCurveTo(100, 124, 109, 118);
    ctx.closePath();
    ctx.fillStyle = 'rgba(9, 8, 12, .6)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(183, 157, 119, .16)';
    ctx.lineWidth = 1;
    ctx.stroke();
    // mouth inlaid with gold
    ctx.beginPath();
    ctx.moveTo(82, 133);
    ctx.quadraticCurveTo(100, 140, 118, 133);
    ctx.strokeStyle = '#9f7937';
    ctx.lineWidth = 2.6;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(84, 133);
    ctx.quadraticCurveTo(100, 138, 116, 133);
    ctx.strokeStyle = 'rgba(32, 22, 10, .9)';
    ctx.lineWidth = 1;
    ctx.stroke();
    // gold inlay tears
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(100 + side * 25, 110);
      ctx.lineTo(100 + side * 23, 125);
      ctx.strokeStyle = 'rgba(186, 146, 72, .5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    // chips / volcanic glass sheen
    ctx.beginPath();
    ctx.moveTo(70, 57);
    ctx.bezierCurveTo(84, 50, 110, 49, 126, 59);
    ctx.strokeStyle = 'rgba(194, 181, 194, .12)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(73, 147);
    ctx.lineTo(80, 142);
    ctx.lineTo(78, 133);
    ctx.closePath();
    ctx.fillStyle = 'rgba(0,0,0,.35)';
    ctx.fill();
    ctx.restore();
  },

  ring(ctx, tint) {
    ctx.save();
    // band
    ctx.beginPath();
    ctx.ellipse(100, 116, 42, 35, -.12, 0, Math.PI * 2);
    ctx.strokeStyle = '#7d5317';
    ctx.lineWidth = 16;
    ctx.stroke();
    ctx.strokeStyle = '#d5a344';
    ctx.lineWidth = 11;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255, 226, 142, .45)';
    ctx.lineWidth = 2;
    ctx.stroke();
    // signet face
    ctx.beginPath();
    ctx.ellipse(100, 79, 33, 30, 0, 0, Math.PI * 2);
    const g = ctx.createRadialGradient(87, 65, 4, 104, 87, 40);
    g.addColorStop(0, '#ffe6a0');
    g.addColorStop(.35, '#e3b958');
    g.addColorStop(.75, '#a97224');
    g.addColorStop(1, '#6d4512');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = '#704712';
    ctx.lineWidth = 1.6;
    ctx.stroke();
    // engraved sun + closed eye
    ctx.beginPath();
    ctx.arc(100, 78, 15, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(91, 54, 8, .58)';
    ctx.lineWidth = 1.3;
    ctx.stroke();
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(100 + Math.cos(a) * 18, 78 + Math.sin(a) * 18);
      ctx.lineTo(100 + Math.cos(a) * 24, 78 + Math.sin(a) * 24);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(91, 80);
    ctx.quadraticCurveTo(100, 73, 109, 80);
    ctx.strokeStyle = 'rgba(82, 49, 7, .75)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(100, 82, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(82, 49, 7, .75)';
    ctx.fill();
    // rim bevel
    ctx.beginPath();
    ctx.ellipse(94, 69, 15, 8, -.4, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 246, 196, .26)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    // band inscription
    ctx.save();
    ctx.translate(100, 128);
    ctx.strokeStyle = 'rgba(89, 53, 8, .38)';
    ctx.lineWidth = 1.1;
    for (let i = 0; i < 9; i++) {
      ctx.beginPath();
      ctx.arc(0, 0, 31, Math.PI * .2 + i * .09, Math.PI * .24 + i * .09);
      ctx.stroke();
    }
    ctx.restore();
    ctx.restore();
  },

  disc(ctx, tint) {
    ctx.save();
    // disc body
    ctx.beginPath();
    ctx.arc(100, 101, 65, 0, Math.PI * 2);
    const g = ctx.createRadialGradient(81, 78, 6, 108, 112, 70);
    g.addColorStop(0, '#d2bd7e');
    g.addColorStop(.32, '#a98d4e');
    g.addColorStop(.65, '#746036');
    g.addColorStop(.88, '#4e4329');
    g.addColorStop(1, '#2e281a');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = 'rgba(34, 28, 15, .8)';
    ctx.lineWidth = 1.8;
    ctx.stroke();
    // concentric rings
    ctx.strokeStyle = 'rgba(220, 197, 133, .32)';
    ctx.lineWidth = 1.1;
    for (const r of [54, 43, 31, 18]) {
      ctx.beginPath();
      ctx.arc(100, 101, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    // perforations / star map
    const holes = [
      [100, 63, 3], [122, 72, 2.2], [137, 94, 2.6], [131, 119, 1.9],
      [112, 137, 2.7], [86, 140, 2.1], [69, 119, 2.5], [64, 91, 2],
      [79, 74, 1.7], [101, 100, 4.2], [108, 87, 1.3], [95, 116, 1.2]
    ];
    for (const [x, y, r] of holes) {
      circle(ctx, x, y, r);
      ctx.fillStyle = 'rgba(18, 16, 11, .8)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(231, 210, 153, .2)';
      ctx.lineWidth = .8;
      ctx.stroke();
    }
    // gold inlay sun
    circle(ctx, 100, 101, 12);
    ctx.strokeStyle = 'rgba(231, 194, 104, .68)';
    ctx.lineWidth = 2;
    ctx.stroke();
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(100 + Math.cos(a) * 15, 101 + Math.sin(a) * 15);
      ctx.lineTo(100 + Math.cos(a) * 22, 101 + Math.sin(a) * 22);
      ctx.strokeStyle = 'rgba(222, 188, 102, .55)';
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }
    // inscribed notches on rim
    for (let i = 0; i < 28; i++) {
      const a = i / 28 * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(100 + Math.cos(a) * 59, 101 + Math.sin(a) * 59);
      ctx.lineTo(100 + Math.cos(a) * 64, 101 + Math.sin(a) * 64);
      ctx.strokeStyle = 'rgba(227, 207, 152, .28)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    // green oxidation
    for (let i = 0; i < 7; i++) {
      glow(ctx, 66 + (i * 27) % 68, 74 + (i * 19) % 58, 9 + (i % 3) * 4, 'rgba(100, 145, 112, .1)');
    }
    ctx.restore();
  },

  key(ctx) {
    ctx.save();
    ctx.translate(100, 103);
    ctx.rotate(-.24);
    const iron = ctx.createLinearGradient(-24, -60, 26, 70);
    iron.addColorStop(0, '#a39a8b');
    iron.addColorStop(.34, '#69635a');
    iron.addColorStop(.7, '#403d37');
    iron.addColorStop(1, '#24221f');

    // bow
    ctx.beginPath();
    ctx.arc(0, -47, 23, 0, Math.PI * 2);
    ctx.strokeStyle = iron;
    ctx.lineWidth = 11;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -47, 13, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(213, 194, 158, .22)';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // shaft
    ctx.beginPath();
    ctx.moveTo(0, -25);
    ctx.lineTo(0, 59);
    ctx.strokeStyle = iron;
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.stroke();

    // collars
    ctx.strokeStyle = 'rgba(186, 164, 127, .45)';
    ctx.lineWidth = 2;
    for (const y of [-14, -8]) {
      ctx.beginPath();
      ctx.moveTo(-8, y);
      ctx.lineTo(8, y);
      ctx.stroke();
    }

    // bit and teeth
    ctx.beginPath();
    ctx.moveTo(2, 27);
    ctx.lineTo(27, 27);
    ctx.lineTo(27, 38);
    ctx.lineTo(17, 38);
    ctx.lineTo(17, 49);
    ctx.lineTo(31, 49);
    ctx.lineTo(31, 60);
    ctx.lineTo(2, 60);
    ctx.closePath();
    ctx.fillStyle = iron;
    ctx.fill();
    ctx.strokeStyle = 'rgba(18, 17, 15, .8)';
    ctx.lineWidth = 1.3;
    ctx.stroke();

    // guild stamp
    ctx.beginPath();
    ctx.arc(0, -47, 6, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(218, 199, 164, .34)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // rust blooms
    for (let i = 0; i < 10; i++) {
      glow(ctx, -14 + (i * 13) % 42, -32 + (i * 17) % 86, 5 + i % 4, 'rgba(171, 92, 45, .13)');
    }
    ctx.restore();
  },

  seal(ctx) {
    ctx.save();
    ctx.translate(100, 100);
    ctx.rotate(-.1);

    // clay tablet
    ctx.beginPath();
    ctx.moveTo(-49, -57);
    ctx.bezierCurveTo(-20, -67, 22, -66, 49, -55);
    ctx.bezierCurveTo(58, -20, 57, 30, 47, 56);
    ctx.bezierCurveTo(18, 65, -22, 64, -48, 54);
    ctx.bezierCurveTo(-57, 24, -57, -28, -49, -57);
    ctx.closePath();
    const g = ctx.createRadialGradient(-20, -30, 6, 8, 8, 75);
    g.addColorStop(0, '#d29a67');
    g.addColorStop(.45, '#a9683d');
    g.addColorStop(.8, '#794529');
    g.addColorStop(1, '#57301d');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = '#4d2a18';
    ctx.lineWidth = 2;
    ctx.stroke();

    // impressed border
    ctx.beginPath();
    ctx.moveTo(-37, -46);
    ctx.bezierCurveTo(-10, -54, 15, -53, 37, -45);
    ctx.bezierCurveTo(44, -18, 43, 24, 35, 44);
    ctx.bezierCurveTo(10, 51, -14, 50, -36, 43);
    ctx.bezierCurveTo(-43, 20, -43, -22, -37, -46);
    ctx.closePath();
    ctx.strokeStyle = 'rgba(60, 31, 16, .55)';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // kneeling camel
    ctx.save();
    ctx.translate(0, 3);
    ctx.fillStyle = 'rgba(67, 34, 17, .8)';
    ctx.beginPath();
    ctx.ellipse(-2, 3, 22, 12, -.06, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-9, -7, 11, 9, -.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(17, -4);
    ctx.bezierCurveTo(22, -18, 28, -25, 33, -23);
    ctx.bezierCurveTo(35, -22, 34, -18, 31, -16);
    ctx.bezierCurveTo(27, -13, 24, -6, 23, 2);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(34, -24, 6, 4, .2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(67, 34, 17, .8)';
    ctx.lineWidth = 3.4;
    ctx.lineCap = 'round';
    for (const [x, y] of [[-16, 11], [-7, 13], [11, 12], [19, 9]]) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 2, y + 18);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(-23, 0);
    ctx.quadraticCurveTo(-31, 8, -27, 16);
    ctx.stroke();
    ctx.restore();

    // eight-point star
    ctx.save();
    ctx.translate(0, 33);
    ctx.strokeStyle = 'rgba(66, 33, 16, .6)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 4);
      ctx.beginPath();
      ctx.moveTo(-8, 0);
      ctx.lineTo(8, 0);
      ctx.stroke();
    }
    ctx.restore();

    // drying cracks
    ctx.strokeStyle = 'rgba(55, 28, 14, .5)';
    ctx.lineWidth = .9;
    ctx.beginPath();
    ctx.moveTo(-42, -34);
    ctx.lineTo(-31, -22);
    ctx.lineTo(-35, -8);
    ctx.moveTo(39, 22);
    ctx.lineTo(29, 30);
    ctx.lineTo(31, 42);
    ctx.stroke();
    ctx.restore();
  },

  talisman(ctx) {
    ctx.save();
    ctx.translate(100, 98);

    // red cord loop
    ctx.beginPath();
    ctx.moveTo(0, 38);
    ctx.bezierCurveTo(-44, 14, -48, -40, -18, -58);
    ctx.bezierCurveTo(-2, -68, 2, -68, 18, -58);
    ctx.bezierCurveTo(48, -40, 44, 14, 0, 38);
    ctx.strokeStyle = '#7d2c22';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.strokeStyle = '#c25a3f';
    ctx.lineWidth = 3.2;
    ctx.stroke();

    // knot
    ctx.beginPath();
    ctx.arc(0, 39, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#8e3528';
    ctx.fill();
    ctx.strokeStyle = '#5e2119';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // copper charm
    ctx.save();
    ctx.translate(0, 58);
    ctx.rotate(Math.PI / 4);
    ctx.beginPath();
    ctx.rect(-13, -13, 26, 26);
    const g = ctx.createLinearGradient(-13, -13, 13, 13);
    g.addColorStop(0, '#d7955f');
    g.addColorStop(.5, '#a85f36');
    g.addColorStop(1, '#6c3c23');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = '#5b311d';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.restore();

    // charm eye
    ctx.beginPath();
    ctx.ellipse(0, 58, 8, 4, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(49, 25, 13, .72)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 58, 2.2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(49, 25, 13, .72)';
    ctx.fill();

    // tassels
    ctx.strokeStyle = '#a84331';
    ctx.lineWidth = 2.6;
    for (let i = -4; i <= 4; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 2, 70);
      ctx.quadraticCurveTo(i * 3.4, 82, i * 4.2, 92 - Math.abs(i));
      ctx.stroke();
    }
    ctx.restore();
  },

  astrolabe(ctx) {
    ctx.save();
    ctx.translate(100, 99);

    // suspension ring
    ctx.beginPath();
    ctx.arc(0, -69, 10, 0, Math.PI * 2);
    ctx.strokeStyle = '#8c6a34';
    ctx.lineWidth = 4.5;
    ctx.stroke();

    // brass plate
    ctx.beginPath();
    ctx.arc(0, -2, 56, 0, Math.PI * 2);
    const g = ctx.createRadialGradient(-18, -24, 4, 8, 10, 62);
    g.addColorStop(0, '#e3c27c');
    g.addColorStop(.35, '#b88d46');
    g.addColorStop(.72, '#80602e');
    g.addColorStop(1, '#4b391d');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = '#3e2f19';
    ctx.lineWidth = 2;
    ctx.stroke();

    // rim and degree ticks
    ctx.beginPath();
    ctx.arc(0, -2, 49, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(244, 218, 155, .4)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    for (let i = 0; i < 36; i++) {
      const a = i / 36 * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 51, -2 + Math.sin(a) * 51);
      ctx.lineTo(Math.cos(a) * (i % 3 ? 55 : 57), -2 + Math.sin(a) * (i % 3 ? 55 : 57));
      ctx.strokeStyle = 'rgba(64, 45, 20, .55)';
      ctx.lineWidth = i % 3 ? .7 : 1.2;
      ctx.stroke();
    }

    // openwork rete
    ctx.strokeStyle = 'rgba(55, 39, 17, .7)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, -2, 35, -.45, 2.15);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -2, 25, 1.2, 4.5);
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-27, -27);
    ctx.quadraticCurveTo(-6, -40, 10, -30);
    ctx.quadraticCurveTo(26, -20, 32, 4);
    ctx.stroke();
    for (const [x, y] of [[-30, -8], [-12, -34], [18, -28], [31, 13], [8, 26]]) {
      ctx.beginPath();
      ctx.arc(x, y, 4.2, 0, Math.PI * 2);
      ctx.stroke();
    }

    // alidade rule
    ctx.save();
    ctx.rotate(-.55);
    ctx.fillStyle = '#6b4f25';
    ctx.fillRect(-52, -3, 104, 6);
    ctx.fillStyle = 'rgba(238, 209, 143, .35)';
    ctx.fillRect(-52, -3, 104, 1.5);
    ctx.restore();

    // central pin
    ctx.beginPath();
    ctx.arc(0, -2, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#3d2c17';
    ctx.fill();
    ctx.strokeStyle = 'rgba(246, 220, 156, .5)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  },

  waterskin(ctx) {
    ctx.save();
    ctx.translate(100, 101);

    // hide body
    ctx.beginPath();
    ctx.moveTo(-20, -44);
    ctx.bezierCurveTo(-44, -32, -54, -4, -49, 30);
    ctx.bezierCurveTo(-44, 58, -22, 70, 0, 70);
    ctx.bezierCurveTo(22, 70, 44, 58, 49, 30);
    ctx.bezierCurveTo(54, -4, 44, -32, 20, -44);
    ctx.closePath();
    const g = ctx.createLinearGradient(-42, -38, 38, 68);
    g.addColorStop(0, '#a57449');
    g.addColorStop(.35, '#774a2c');
    g.addColorStop(.7, '#4d2d1b');
    g.addColorStop(1, '#2f1a10');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = '#2a170d';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // neck
    ctx.beginPath();
    ctx.moveTo(-15, -43);
    ctx.lineTo(-12, -61);
    ctx.lineTo(12, -61);
    ctx.lineTo(15, -43);
    ctx.closePath();
    ctx.fillStyle = '#5c351f';
    ctx.fill();
    ctx.strokeStyle = '#2c180d';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // tied neck and stopper
    ctx.strokeStyle = '#c08b52';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-15, -56);
    ctx.lineTo(15, -56);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, -64, 8, 4, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#2b1a10';
    ctx.fill();
    ctx.strokeStyle = '#6e4428';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // stitched seam
    ctx.strokeStyle = 'rgba(213, 171, 112, .32)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.moveTo(0, -40);
    ctx.quadraticCurveTo(-4, 10, 0, 66);
    ctx.stroke();
    ctx.setLineDash([]);

    // leather patch
    ctx.beginPath();
    ctx.moveTo(17, 11);
    ctx.lineTo(35, 17);
    ctx.lineTo(31, 37);
    ctx.lineTo(13, 31);
    ctx.closePath();
    ctx.fillStyle = '#8b5a34';
    ctx.fill();
    ctx.strokeStyle = 'rgba(48, 26, 14, .7)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // carrying strap
    ctx.beginPath();
    ctx.moveTo(-45, -6);
    ctx.bezierCurveTo(-64, 10, -63, 38, -43, 52);
    ctx.strokeStyle = '#5b351f';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(201, 154, 94, .3)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // tar spots
    for (let i = 0; i < 12; i++) {
      ctx.beginPath();
      ctx.arc(-38 + (i * 17) % 76, -24 + (i * 23) % 80, 1.4 + (i % 3), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(30, 18, 11, ${.18 + (i % 4) * .06})`;
      ctx.fill();
    }
    ctx.restore();
  },

  sandal(ctx) {
    ctx.save();
    ctx.translate(100, 100);
    ctx.rotate(-.12);

    // sole
    ctx.beginPath();
    ctx.moveTo(0, -67);
    ctx.bezierCurveTo(27, -64, 35, -36, 32, -8);
    ctx.bezierCurveTo(29, 20, 36, 42, 22, 59);
    ctx.bezierCurveTo(8, 74, -16, 72, -27, 54);
    ctx.bezierCurveTo(-37, 36, -29, 14, -30, -10);
    ctx.bezierCurveTo(-31, -39, -20, -62, 0, -67);
    ctx.closePath();
    const g = ctx.createLinearGradient(-30, -60, 32, 66);
    g.addColorStop(0, '#b88755');
    g.addColorStop(.4, '#8d5b32');
    g.addColorStop(.75, '#61391f');
    g.addColorStop(1, '#3c2112');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = '#3a2112';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // worn sole edge
    ctx.beginPath();
    ctx.moveTo(-24, 49);
    ctx.bezierCurveTo(-6, 61, 12, 60, 23, 49);
    ctx.strokeStyle = 'rgba(232, 193, 139, .32)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // thong straps
    ctx.strokeStyle = '#4d2c17';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, -48);
    ctx.lineTo(-22, -9);
    ctx.moveTo(0, -48);
    ctx.lineTo(22, -9);
    ctx.stroke();
    ctx.strokeStyle = '#a26b3d';
    ctx.lineWidth = 2.4;
    ctx.stroke();

    // toe loop
    ctx.beginPath();
    ctx.ellipse(0, -51, 9, 5, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#4d2c17';
    ctx.lineWidth = 4;
    ctx.stroke();

    // heel strap
    ctx.beginPath();
    ctx.moveTo(-25, 27);
    ctx.quadraticCurveTo(0, 38, 25, 27);
    ctx.strokeStyle = '#5c351c';
    ctx.lineWidth = 4;
    ctx.stroke();

    // stitching
    ctx.strokeStyle = 'rgba(219, 179, 123, .38)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    ctx.moveTo(-25, -49);
    ctx.bezierCurveTo(-34, -20, -27, 20, -19, 51);
    ctx.moveTo(25, -49);
    ctx.bezierCurveTo(33, -20, 27, 20, 19, 51);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  },

  beads(ctx) {
    ctx.save();
    ctx.translate(100, 100);

    // cord
    ctx.beginPath();
    ctx.ellipse(0, -2, 55, 68, 0, .12, Math.PI * 2 - .12);
    ctx.strokeStyle = '#6b5335';
    ctx.lineWidth = 2.4;
    ctx.stroke();

    const colors = ['#2f6f8f', '#c25d3d', '#d8b45a', '#4f8c8a', '#8a4b63'];
    for (let i = 0; i < 24; i++) {
      const a = i / 24 * Math.PI * 2 + .1;
      const x = Math.cos(a) * 55;
      const y = -2 + Math.sin(a) * 68;
      if (y > 58 && Math.abs(x) < 14) continue;
      const r = i % 3 === 0 ? 6.5 : 4.5;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      ctx.strokeStyle = 'rgba(20, 20, 20, .35)';
      ctx.lineWidth = .8;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x - r * .3, y - r * .3, r * .28, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, .35)';
      ctx.fill();
    }

    // carnelian drop
    ctx.beginPath();
    ctx.moveTo(0, 58);
    ctx.bezierCurveTo(-12, 70, -10, 84, 0, 91);
    ctx.bezierCurveTo(10, 84, 12, 70, 0, 58);
    ctx.closePath();
    ctx.fillStyle = '#b84f36';
    ctx.fill();
    ctx.strokeStyle = '#71301f';
    ctx.lineWidth = 1.3;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(-2, 70, 2.5, 6, -.3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 206, 170, .38)';
    ctx.fill();

    // gold cap
    ctx.beginPath();
    ctx.rect(-5, 54, 10, 6);
    ctx.fillStyle = '#c9a14f';
    ctx.fill();
    ctx.strokeStyle = '#7c5c24';
    ctx.lineWidth = .8;
    ctx.stroke();
    ctx.restore();
  },

  censer(ctx) {
    ctx.save();
    ctx.translate(100, 108);

    // bowl
    ctx.beginPath();
    ctx.moveTo(-54, -8);
    ctx.bezierCurveTo(-54, 18, -30, 36, 0, 36);
    ctx.bezierCurveTo(30, 36, 54, 18, 54, -8);
    ctx.closePath();
    const g = ctx.createLinearGradient(-48, -8, 46, 38);
    g.addColorStop(0, '#eee8d3');
    g.addColorStop(.32, '#d3cbb0');
    g.addColorStop(.65, '#b6ab8d');
    g.addColorStop(1, '#8c8066');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = '#756a53';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // rim
    ctx.beginPath();
    ctx.ellipse(0, -8, 54, 12, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#ded5b9';
    ctx.fill();
    ctx.strokeStyle = '#82765d';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, -8, 44, 8.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#786f5a';
    ctx.fill();

    // incense resin
    ctx.beginPath();
    ctx.ellipse(0, -6, 33, 6, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#4f4433';
    ctx.fill();
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.arc(-22 + i * 9, -7 + (i % 2) * 2, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(179, 109, 50, .65)';
      ctx.fill();
    }

    // handles
    ctx.strokeStyle = '#9c9074';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * 50, 2);
      ctx.bezierCurveTo(side * 66, -2, side * 68, 20, side * 53, 24);
      ctx.stroke();
    }

    // foot
    ctx.beginPath();
    ctx.moveTo(-18, 34);
    ctx.lineTo(-23, 53);
    ctx.lineTo(23, 53);
    ctx.lineTo(18, 34);
    ctx.closePath();
    ctx.fillStyle = '#a99d80';
    ctx.fill();
    ctx.strokeStyle = '#756a53';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // pierced lid
    ctx.beginPath();
    ctx.ellipse(0, -19, 31, 9, 0, Math.PI, Math.PI * 2);
    ctx.fillStyle = '#c9c0a4';
    ctx.fill();
    ctx.strokeStyle = '#82765d';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(-20 + i * 10, -23, 1.7, 0, Math.PI * 2);
      ctx.fillStyle = '#6e6450';
      ctx.fill();
    }

    // smoke
    ctx.strokeStyle = 'rgba(245, 234, 210, .28)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-8, -29);
    ctx.bezierCurveTo(-16, -44, 2, -51, -4, -66);
    ctx.moveTo(11, -28);
    ctx.bezierCurveTo(4, -42, 20, -48, 15, -62);
    ctx.stroke();
    ctx.restore();
  },

  'crowned-scarab'(ctx) {
    ctx.save();
    ctx.translate(100, 111);

    // legs
    ctx.strokeStyle = '#247b73';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    const legs = [
      [-27, -17, -49, -31], [-33, -2, -54, 2], [-28, 15, -48, 28],
      [27, -17, 49, -31], [33, -2, 54, 2], [28, 15, 48, 28]
    ];
    for (const [x1, y1, x2, y2] of legs) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo((x1 + x2) / 2 + (y2 > y1 ? 5 : -5), (y1 + y2) / 2, x2, y2);
      ctx.stroke();
    }

    // body
    ctx.beginPath();
    ctx.ellipse(0, 8, 34, 40, 0, 0, Math.PI * 2);
    const g = ctx.createRadialGradient(-15, -8, 4, 8, 16, 48);
    g.addColorStop(0, '#8bd4c6');
    g.addColorStop(.32, '#55b2a6');
    g.addColorStop(.7, '#2b887f');
    g.addColorStop(1, '#155f5a');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = '#145852';
    ctx.lineWidth = 1.7;
    ctx.stroke();

    // wing-case seam
    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.lineTo(0, 45);
    ctx.strokeStyle = 'rgba(13, 78, 73, .65)';
    ctx.lineWidth = 2;
    ctx.stroke();
    for (const side of [-1, 1]) {
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.ellipse(side * 15, -1 + i * 11, 8, 3.2, side * .24, .2, Math.PI - .2);
        ctx.strokeStyle = 'rgba(224, 248, 226, .28)';
        ctx.lineWidth = 1.1;
        ctx.stroke();
      }
    }

    // head
    ctx.beginPath();
    ctx.ellipse(0, -28, 21, 14, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#2d8b82';
    ctx.fill();
    ctx.strokeStyle = '#175f5a';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-12, -22);
    ctx.quadraticCurveTo(0, -16, 12, -22);
    ctx.strokeStyle = '#1b6c65';
    ctx.lineWidth = 2;
    ctx.stroke();

    // gold crown
    ctx.beginPath();
    ctx.moveTo(-18, -39);
    ctx.lineTo(-15, -59);
    ctx.lineTo(-6, -50);
    ctx.lineTo(0, -70);
    ctx.lineTo(7, -50);
    ctx.lineTo(16, -59);
    ctx.lineTo(18, -39);
    ctx.closePath();
    const crown = ctx.createLinearGradient(-18, -68, 18, -38);
    crown.addColorStop(0, '#f4d27e');
    crown.addColorStop(.45, '#d3a13e');
    crown.addColorStop(1, '#8a5c1e');
    ctx.fillStyle = crown;
    ctx.fill();
    ctx.strokeStyle = '#6d4718';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // crown band and sun disc
    ctx.beginPath();
    ctx.rect(-19, -43, 38, 7);
    ctx.fillStyle = '#b8832e';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, -33, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#e8bd5c';
    ctx.fill();
    ctx.strokeStyle = '#7d561d';
    ctx.lineWidth = 1;
    ctx.stroke();

    // glaze crazing
    ctx.strokeStyle = 'rgba(223, 249, 238, .2)';
    ctx.lineWidth = .7;
    const r = rng(21);
    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      let x = -24 + r() * 48, y = -8 + r() * 48;
      ctx.moveTo(x, y);
      for (let j = 0; j < 3; j++) {
        x += (r() - .5) * 12;
        y += (r() - .5) * 12;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();
  },

  'seal-ring'(ctx) {
    ctx.save();
    ctx.translate(100, 103);

    // band
    ctx.beginPath();
    ctx.arc(0, 20, 31, 0, Math.PI * 2);
    ctx.strokeStyle = '#b8ad8e';
    ctx.lineWidth = 13;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 20, 31, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(245, 239, 216, .45)';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 20, 31, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(94, 85, 63, .5)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // square stamp bezel
    ctx.save();
    ctx.translate(0, -27);
    ctx.rotate(-.08);
    ctx.beginPath();
    ctx.rect(-30, -27, 60, 54);
    const g = ctx.createLinearGradient(-30, -27, 30, 27);
    g.addColorStop(0, '#efe8d1');
    g.addColorStop(.45, '#d4c9a9');
    g.addColorStop(.8, '#b4a986');
    g.addColorStop(1, '#8f8467');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = '#786e55';
    ctx.lineWidth = 1.7;
    ctx.stroke();

    // engraved border
    ctx.beginPath();
    ctx.rect(-23, -20, 46, 40);
    ctx.strokeStyle = 'rgba(95, 84, 60, .55)';
    ctx.lineWidth = 1.1;
    ctx.stroke();

    // twin cartouches
    ctx.strokeStyle = 'rgba(74, 65, 46, .68)';
    ctx.lineWidth = 1.5;
    for (const x of [-10, 10]) {
      ctx.beginPath();
      ctx.ellipse(x, -2, 6, 15, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x - 3, -10);
      ctx.lineTo(x + 3, -10);
      ctx.moveTo(x - 3, -2);
      ctx.lineTo(x + 3, -2);
      ctx.moveTo(x - 3, 6);
      ctx.lineTo(x + 3, 6);
      ctx.stroke();
    }
    ctx.restore();

    // chips
    ctx.fillStyle = 'rgba(93, 84, 62, .4)';
    ctx.beginPath();
    ctx.moveTo(24, -51);
    ctx.lineTo(30, -46);
    ctx.lineTo(26, -40);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  },

  sistrum(ctx) {
    ctx.save();
    ctx.translate(100, 103);

    // handle
    ctx.beginPath();
    ctx.moveTo(-6, 48);
    ctx.lineTo(-8, 80);
    ctx.quadraticCurveTo(0, 86, 8, 80);
    ctx.lineTo(6, 48);
    ctx.closePath();
    const handle = ctx.createLinearGradient(-8, 48, 8, 82);
    handle.addColorStop(0, '#b09556');
    handle.addColorStop(.5, '#7d6534');
    handle.addColorStop(1, '#4e3d1e');
    ctx.fillStyle = handle;
    ctx.fill();
    ctx.strokeStyle = '#433318';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // U frame
    ctx.beginPath();
    ctx.moveTo(-6, 49);
    ctx.bezierCurveTo(-45, 26, -43, -43, -14, -58);
    ctx.bezierCurveTo(-4, -63, 4, -63, 14, -58);
    ctx.bezierCurveTo(43, -43, 45, 26, 6, 49);
    ctx.strokeStyle = '#8c713d';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.strokeStyle = '#c3a461';
    ctx.lineWidth = 3;
    ctx.stroke();

    // crossbars and loose discs
    for (const y of [-34, -14, 6, 26]) {
      const w = y < -20 ? 25 : 29;
      ctx.beginPath();
      ctx.moveTo(-w, y);
      ctx.lineTo(w, y);
      ctx.strokeStyle = '#6d542a';
      ctx.lineWidth = 3;
      ctx.stroke();
      for (const x of [-w + 6, w - 6]) {
        ctx.beginPath();
        ctx.arc(x, y, 7.5, 0, Math.PI * 2);
        ctx.fillStyle = '#b49450';
        ctx.fill();
        ctx.strokeStyle = '#5e4823';
        ctx.lineWidth = 1.1;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x - 2, y - 2, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(248, 224, 160, .4)';
        ctx.fill();
      }
    }

    // top loop
    ctx.beginPath();
    ctx.arc(0, -62, 9, 0, Math.PI * 2);
    ctx.strokeStyle = '#7c6234';
    ctx.lineWidth = 4;
    ctx.stroke();

    // patina
    for (let i = 0; i < 8; i++) {
      glow(ctx, -26 + (i * 17) % 52, -50 + (i * 19) % 76, 6 + i % 4, 'rgba(82, 135, 103, .12)');
    }
    ctx.restore();
  },

  canopic(ctx) {
    ctx.save();
    ctx.translate(100, 104);

    // jar body
    ctx.beginPath();
    ctx.moveTo(-27, -20);
    ctx.bezierCurveTo(-42, 4, -44, 30, -30, 48);
    ctx.bezierCurveTo(-16, 65, 16, 65, 30, 48);
    ctx.bezierCurveTo(44, 30, 42, 4, 27, -20);
    ctx.closePath();
    const g = ctx.createLinearGradient(-38, -20, 38, 60);
    g.addColorStop(0, '#f0ead7');
    g.addColorStop(.3, '#d9d2b9');
    g.addColorStop(.66, '#b8ae91');
    g.addColorStop(1, '#8d8268');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = '#756b54';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // shoulder collar
    ctx.beginPath();
    ctx.ellipse(0, -20, 28, 9, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#c7bea2';
    ctx.fill();
    ctx.strokeStyle = '#7c7259';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // falcon-headed lid
    ctx.beginPath();
    ctx.moveTo(-24, -26);
    ctx.bezierCurveTo(-28, -50, -16, -62, 2, -62);
    ctx.bezierCurveTo(20, -62, 28, -48, 24, -26);
    ctx.closePath();
    ctx.fillStyle = '#c9c0a3';
    ctx.fill();
    ctx.strokeStyle = '#756b54';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // falcon face
    ctx.beginPath();
    ctx.ellipse(4, -45, 14, 12, -.1, 0, Math.PI * 2);
    ctx.fillStyle = '#ded7bf';
    ctx.fill();
    ctx.strokeStyle = '#8b8167';
    ctx.lineWidth = 1;
    ctx.stroke();
    // beak
    ctx.beginPath();
    ctx.moveTo(16, -47);
    ctx.quadraticCurveTo(28, -43, 22, -36);
    ctx.quadraticCurveTo(16, -38, 14, -41);
    ctx.closePath();
    ctx.fillStyle = '#b89d5f';
    ctx.fill();
    ctx.strokeStyle = '#7b6432';
    ctx.lineWidth = 1;
    ctx.stroke();
    // eye
    ctx.beginPath();
    ctx.arc(7, -49, 3.2, 0, Math.PI * 2);
    ctx.fillStyle = '#3d382c';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(6, -50, 1.1, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 247, 218, .7)';
    ctx.fill();
    // head stripes
    ctx.strokeStyle = 'rgba(93, 82, 58, .5)';
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(-14 + i * 5, -55);
      ctx.quadraticCurveTo(-8 + i * 5, -42, -12 + i * 5, -31);
      ctx.stroke();
    }

    // jar bands
    ctx.strokeStyle = 'rgba(102, 91, 66, .42)';
    ctx.lineWidth = 1.2;
    for (const y of [4, 18, 32]) {
      ctx.beginPath();
      ctx.ellipse(0, y, 37 - Math.abs(y - 18) * .55, 6, 0, .08, Math.PI - .08);
      ctx.stroke();
    }

    // vein lines
    ctx.strokeStyle = 'rgba(255, 252, 237, .32)';
    ctx.lineWidth = .9;
    const r = rng(31);
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      let x = -26 + r() * 52, y = -10 + r() * 52;
      ctx.moveTo(x, y);
      for (let j = 0; j < 3; j++) {
        x += (r() - .5) * 16;
        y += (r() - .5) * 12;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();
  },

  hand(ctx) {
    ctx.save();
    ctx.translate(100, 101);

    // wrist and palm
    ctx.beginPath();
    ctx.moveTo(-22, 68);
    ctx.lineTo(-27, 24);
    ctx.bezierCurveTo(-31, 4, -34, -18, -28, -35);
    ctx.lineTo(-18, -38);
    ctx.lineTo(-15, -13);
    ctx.lineTo(-13, -56);
    ctx.quadraticCurveTo(-10, -66, -4, -64);
    ctx.quadraticCurveTo(1, -62, 1, -53);
    ctx.lineTo(1, -60);
    ctx.quadraticCurveTo(5, -69, 11, -66);
    ctx.quadraticCurveTo(16, -63, 15, -53);
    ctx.lineTo(15, -52);
    ctx.quadraticCurveTo(20, -59, 25, -55);
    ctx.quadraticCurveTo(30, -51, 27, -41);
    ctx.lineTo(22, -10);
    ctx.bezierCurveTo(34, -8, 38, 4, 31, 14);
    ctx.bezierCurveTo(26, 22, 18, 24, 15, 31);
    ctx.lineTo(16, 68);
    ctx.closePath();
    const g = ctx.createLinearGradient(-28, -60, 28, 68);
    g.addColorStop(0, '#e0d4b2');
    g.addColorStop(.45, '#c7b992');
    g.addColorStop(.8, '#a89a75');
    g.addColorStop(1, '#817557');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = '#6f644b';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // finger creases
    ctx.strokeStyle = 'rgba(104, 92, 66, .5)';
    ctx.lineWidth = 1.1;
    for (const [x1, y1, x2, y2] of [[-17, -29, -14, -5], [1, -46, 2, -18], [15, -44, 17, -18], [24, -38, 20, -18]]) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo((x1 + x2) / 2 + 2, (y1 + y2) / 2, x2, y2);
      ctx.stroke();
    }

    // palm lines
    ctx.beginPath();
    ctx.moveTo(-17, 9);
    ctx.quadraticCurveTo(0, 18, 20, 8);
    ctx.moveTo(-12, 27);
    ctx.quadraticCurveTo(2, 34, 17, 27);
    ctx.strokeStyle = 'rgba(108, 95, 68, .42)';
    ctx.lineWidth = 1.3;
    ctx.stroke();

    // chipped edge
    ctx.beginPath();
    ctx.moveTo(-27, 50);
    ctx.lineTo(-20, 45);
    ctx.lineTo(-23, 39);
    ctx.closePath();
    ctx.fillStyle = 'rgba(94, 82, 59, .45)';
    ctx.fill();
    ctx.restore();
  },

  relief(ctx) {
    ctx.save();
    ctx.translate(100, 100);
    ctx.rotate(-.05);

    // slab
    ctx.beginPath();
    ctx.moveTo(-43, -66);
    ctx.lineTo(39, -61);
    ctx.lineTo(45, 63);
    ctx.lineTo(-39, 68);
    ctx.closePath();
    const g = ctx.createLinearGradient(-40, -60, 42, 64);
    g.addColorStop(0, '#ded2ae');
    g.addColorStop(.4, '#c3b590');
    g.addColorStop(.72, '#a29472');
    g.addColorStop(1, '#7d7055');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = '#655a43';
    ctx.lineWidth = 1.7;
    ctx.stroke();

    // inner frame
    ctx.beginPath();
    ctx.rect(-34, -55, 68, 112);
    ctx.strokeStyle = 'rgba(96, 84, 59, .5)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // carved profile
    ctx.save();
    ctx.translate(-2, -4);
    ctx.fillStyle = 'rgba(102, 89, 62, .62)';
    ctx.beginPath();
    ctx.moveTo(-18, 37);
    ctx.bezierCurveTo(-20, 12, -17, -14, -7, -27);
    ctx.bezierCurveTo(2, -39, 18, -37, 21, -24);
    ctx.bezierCurveTo(24, -13, 17, -8, 22, -3);
    ctx.lineTo(16, 4);
    ctx.lineTo(23, 8);
    ctx.bezierCurveTo(20, 16, 14, 18, 15, 25);
    ctx.bezierCurveTo(17, 34, 12, 38, 4, 40);
    ctx.closePath();
    ctx.fill();
    // eye
    ctx.beginPath();
    ctx.ellipse(4, -17, 5, 2.4, -.1, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(72, 61, 41, .7)';
    ctx.fill();
    // headdress
    ctx.beginPath();
    ctx.moveTo(-9, -28);
    ctx.bezierCurveTo(-25, -24, -27, 1, -17, 15);
    ctx.strokeStyle = 'rgba(92, 79, 54, .5)';
    ctx.lineWidth = 4;
    ctx.stroke();
    // collar
    ctx.beginPath();
    ctx.moveTo(-19, 32);
    ctx.quadraticCurveTo(0, 42, 18, 31);
    ctx.strokeStyle = 'rgba(92, 79, 54, .5)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    // hieroglyph column
    ctx.strokeStyle = 'rgba(94, 81, 55, .58)';
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 4; i++) {
      const y = -48 + i * 12;
      ctx.beginPath();
      ctx.ellipse(26, y, 3, 5, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(21, y + 6);
      ctx.lineTo(31, y + 6);
      ctx.stroke();
    }

    // salt erosion
    for (let i = 0; i < 14; i++) {
      ctx.beginPath();
      ctx.arc(-40 + (i * 13) % 80, -60 + (i * 19) % 120, 1 + (i % 4), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(242, 235, 211, ${.08 + (i % 3) * .05})`;
      ctx.fill();
    }
    ctx.restore();
  },

  vertebra(ctx) {
    ctx.save();
    ctx.translate(100, 100);

    // transverse processes
    ctx.beginPath();
    ctx.moveTo(-24, -5);
    ctx.bezierCurveTo(-48, -14, -66, -8, -71, 4);
    ctx.bezierCurveTo(-65, 17, -44, 18, -23, 12);
    ctx.closePath();
    const bone = ctx.createLinearGradient(-60, -10, 56, 42);
    bone.addColorStop(0, '#d0bd94');
    bone.addColorStop(.4, '#b4a077');
    bone.addColorStop(.75, '#8c7957');
    bone.addColorStop(1, '#66563d');
    ctx.fillStyle = bone;
    ctx.fill();
    ctx.strokeStyle = '#5c4c35';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(24, -5);
    ctx.bezierCurveTo(48, -14, 66, -8, 71, 4);
    ctx.bezierCurveTo(65, 17, 44, 18, 23, 12);
    ctx.closePath();
    ctx.fillStyle = bone;
    ctx.fill();
    ctx.strokeStyle = '#5c4c35';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // spinous process
    ctx.beginPath();
    ctx.moveTo(-10, -29);
    ctx.bezierCurveTo(-8, -52, 8, -60, 18, -47);
    ctx.bezierCurveTo(23, -39, 14, -25, 11, -16);
    ctx.closePath();
    ctx.fillStyle = bone;
    ctx.fill();
    ctx.strokeStyle = '#5c4c35';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // centrum
    ctx.beginPath();
    ctx.ellipse(0, 10, 36, 35, 0, 0, Math.PI * 2);
    ctx.fillStyle = bone;
    ctx.fill();
    ctx.strokeStyle = '#5c4c35';
    ctx.lineWidth = 1.7;
    ctx.stroke();

    // spinal canal
    ctx.beginPath();
    ctx.ellipse(0, 8, 13, 11, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#4c3f2d';
    ctx.fill();
    ctx.strokeStyle = 'rgba(222, 204, 165, .35)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // growth rings and cracks
    ctx.strokeStyle = 'rgba(93, 76, 52, .35)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.ellipse(0, 10, 21 + i * 4, 20 + i * 4, 0, .3, Math.PI - .3);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(-30, -9);
    ctx.lineTo(-19, -2);
    ctx.lineTo(-22, 7);
    ctx.moveTo(27, 27);
    ctx.lineTo(17, 20);
    ctx.lineTo(19, 11);
    ctx.strokeStyle = 'rgba(73, 59, 39, .55)';
    ctx.lineWidth = 1.1;
    ctx.stroke();
    ctx.restore();
  },

  'nautical-coin'(ctx) {
    ctx.save();
    ctx.translate(100, 101);

    // irregular silver coin with a suspension hole
    ctx.beginPath();
    for (let i = 0; i <= 48; i++) {
      const a = i / 48 * Math.PI * 2;
      const rr = 60 + Math.sin(a * 5) * 2.6 + Math.sin(a * 9) * 1.4;
      const x = Math.cos(a) * rr;
      const y = Math.sin(a) * rr;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.closePath();
    const g = ctx.createRadialGradient(-18, -24, 5, 8, 12, 70);
    g.addColorStop(0, '#dfe2d8');
    g.addColorStop(.32, '#b4bbb0');
    g.addColorStop(.68, '#818b80');
    g.addColorStop(.9, '#5f6c5f');
    g.addColorStop(1, '#445044');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = '#3d493d';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // suspension hole
    ctx.beginPath();
    ctx.arc(0, -54, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#263128';
    ctx.fill();
    ctx.strokeStyle = 'rgba(226, 231, 217, .35)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // dolphin relief
    ctx.save();
    ctx.rotate(-.18);
    ctx.fillStyle = 'rgba(56, 74, 62, .68)';
    ctx.beginPath();
    ctx.moveTo(-34, 18);
    ctx.bezierCurveTo(-20, -8, 6, -20, 26, -10);
    ctx.bezierCurveTo(39, -4, 36, 13, 22, 17);
    ctx.bezierCurveTo(10, 21, -3, 15, -12, 6);
    ctx.bezierCurveTo(-18, 0, -24, 2, -27, 9);
    ctx.bezierCurveTo(-22, 14, -16, 18, -8, 20);
    ctx.bezierCurveTo(-18, 25, -28, 23, -34, 18);
    ctx.closePath();
    ctx.fill();
    // tail
    ctx.beginPath();
    ctx.moveTo(-33, 17);
    ctx.lineTo(-45, 9);
    ctx.lineTo(-43, 23);
    ctx.closePath();
    ctx.fill();
    // eye
    ctx.beginPath();
    ctx.arc(24, -3, 2.2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(217, 225, 211, .55)';
    ctx.fill();
    ctx.restore();

    // waves
    ctx.strokeStyle = 'rgba(55, 73, 61, .55)';
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(-32, 31 + i * 7);
      ctx.quadraticCurveTo(-16, 25 + i * 7, 0, 31 + i * 7);
      ctx.quadraticCurveTo(16, 37 + i * 7, 31, 31 + i * 7);
      ctx.stroke();
    }

    // verdigris
    for (let i = 0; i < 10; i++) {
      glow(ctx, -44 + (i * 19) % 88, -34 + (i * 23) % 82, 5 + i % 4, 'rgba(68, 132, 104, .15)');
    }
    ctx.restore();
  },

  comb(ctx) {
    ctx.save();
    ctx.translate(100, 101);
    ctx.rotate(-.04);

    // spine
    ctx.beginPath();
    ctx.moveTo(-43, -52);
    ctx.bezierCurveTo(-16, -59, 18, -59, 43, -52);
    ctx.lineTo(43, -28);
    ctx.bezierCurveTo(18, -34, -16, -34, -43, -28);
    ctx.closePath();
    const g = ctx.createLinearGradient(-42, -55, 42, -28);
    g.addColorStop(0, '#e0cfaa');
    g.addColorStop(.4, '#c6b28b');
    g.addColorStop(.75, '#a28c66');
    g.addColorStop(1, '#78664b');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = '#66563e';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // teeth
    ctx.strokeStyle = '#b7a17a';
    ctx.lineWidth = 3.2;
    ctx.lineCap = 'round';
    for (let i = 0; i < 15; i++) {
      const x = -39 + i * 5.6;
      const len = 50 + Math.sin(i * .8) * 4;
      ctx.beginPath();
      ctx.moveTo(x, -30);
      ctx.lineTo(x, -30 + len);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(84, 70, 49, .5)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 15; i++) {
      const x = -39 + i * 5.6;
      ctx.beginPath();
      ctx.moveTo(x + 1.2, -27);
      ctx.lineTo(x + 1.2, 22 + Math.sin(i * .8) * 4);
      ctx.stroke();
    }

    // carved reed border
    ctx.strokeStyle = 'rgba(99, 82, 55, .58)';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 5; i++) {
      const x = -29 + i * 14;
      ctx.beginPath();
      ctx.moveTo(x, -49);
      ctx.quadraticCurveTo(x + 6, -42, x + 2, -34);
      ctx.stroke();
    }

    // broken tooth
    ctx.strokeStyle = '#6e5d44';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(17, 18);
    ctx.lineTo(22, 24);
    ctx.stroke();
    ctx.restore();
  },

  'shark-tooth'(ctx) {
    ctx.save();
    ctx.translate(100, 102);

    // root
    ctx.beginPath();
    ctx.moveTo(-39, 52);
    ctx.bezierCurveTo(-34, 32, -21, 24, 0, 24);
    ctx.bezierCurveTo(21, 24, 34, 32, 39, 52);
    ctx.bezierCurveTo(20, 60, -20, 60, -39, 52);
    ctx.closePath();
    const root = ctx.createLinearGradient(-35, 30, 35, 58);
    root.addColorStop(0, '#8d795b');
    root.addColorStop(.5, '#6d5a40');
    root.addColorStop(1, '#4b3c29');
    ctx.fillStyle = root;
    ctx.fill();
    ctx.strokeStyle = '#423522';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // serrated blade
    ctx.beginPath();
    ctx.moveTo(-31, 28);
    ctx.lineTo(-25, 4);
    ctx.lineTo(-21, -4);
    ctx.lineTo(-17, -19);
    ctx.lineTo(-12, -28);
    ctx.lineTo(-9, -44);
    ctx.lineTo(-4, -53);
    ctx.lineTo(0, -70);
    ctx.lineTo(5, -50);
    ctx.lineTo(10, -41);
    ctx.lineTo(14, -25);
    ctx.lineTo(19, -16);
    ctx.lineTo(23, 0);
    ctx.lineTo(28, 10);
    ctx.lineTo(31, 28);
    ctx.closePath();
    const blade = ctx.createLinearGradient(-20, -60, 24, 30);
    blade.addColorStop(0, '#e5dcc4');
    blade.addColorStop(.35, '#c2b18d');
    blade.addColorStop(.7, '#988361');
    blade.addColorStop(1, '#6e5a40');
    ctx.fillStyle = blade;
    ctx.fill();
    ctx.strokeStyle = '#54442e';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // central ridge
    ctx.beginPath();
    ctx.moveTo(0, -64);
    ctx.quadraticCurveTo(-2, -12, 2, 26);
    ctx.strokeStyle = 'rgba(250, 245, 227, .35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // serration shadows
    ctx.strokeStyle = 'rgba(75, 59, 37, .48)';
    ctx.lineWidth = 1;
    for (const side of [-1, 1]) {
      for (let i = 0; i < 7; i++) {
        const y = -55 + i * 11;
        const x = side * (4 + i * 2.4);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + side * 5, y + 4);
        ctx.stroke();
      }
    }

    // cracks
    ctx.beginPath();
    ctx.moveTo(-10, 16);
    ctx.lineTo(-4, 9);
    ctx.lineTo(-7, 1);
    ctx.moveTo(15, 38);
    ctx.lineTo(9, 31);
    ctx.strokeStyle = 'rgba(70, 54, 34, .5)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  },

  'fish-fossil'(ctx) {
    ctx.save();
    ctx.translate(100, 100);
    ctx.rotate(-.03);

    // limestone plate
    ctx.beginPath();
    ctx.moveTo(-64, -39);
    ctx.lineTo(56, -45);
    ctx.lineTo(66, 30);
    ctx.lineTo(-51, 45);
    ctx.closePath();
    const stone = ctx.createLinearGradient(-60, -44, 60, 42);
    stone.addColorStop(0, '#d8c9a6');
    stone.addColorStop(.4, '#b9a986');
    stone.addColorStop(.75, '#968767');
    stone.addColorStop(1, '#75684d');
    ctx.fillStyle = stone;
    ctx.fill();
    ctx.strokeStyle = '#655943';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // matrix speckles
    const r = rng(77);
    for (let i = 0; i < 32; i++) {
      ctx.beginPath();
      ctx.arc(-58 + r() * 120, -39 + r() * 78, .8 + r() * 1.8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(88, 74, 52, ${.08 + r() * .12})`;
      ctx.fill();
    }

    // fish skeleton
    ctx.strokeStyle = '#5f4d36';
    ctx.fillStyle = '#5f4d36';
    ctx.lineWidth = 1.7;
    ctx.lineCap = 'round';

    // skull
    ctx.beginPath();
    ctx.ellipse(-37, 0, 13, 10, -.12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-41, -3, 2.4, 0, Math.PI * 2);
    ctx.fill();

    // spine
    ctx.beginPath();
    ctx.moveTo(-26, 0);
    ctx.bezierCurveTo(-8, -3, 16, -2, 40, 3);
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // ribs
    ctx.lineWidth = 1.1;
    for (let i = 0; i < 10; i++) {
      const x = -20 + i * 6;
      const len = 11 - Math.abs(i - 4) * .7;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.quadraticCurveTo(x + 1, -len, x + 4, -len - 4);
      ctx.moveTo(x, 1);
      ctx.quadraticCurveTo(x + 1, len, x + 4, len + 4);
      ctx.stroke();
    }

    // tail fin
    ctx.beginPath();
    ctx.moveTo(41, 3);
    ctx.lineTo(57, -13);
    ctx.lineTo(52, 2);
    ctx.lineTo(58, 16);
    ctx.closePath();
    ctx.stroke();

    // dorsal fin
    ctx.beginPath();
    ctx.moveTo(-4, -2);
    ctx.lineTo(3, -17);
    ctx.lineTo(12, -2);
    ctx.stroke();

    // scale impressions
    ctx.strokeStyle = 'rgba(96, 78, 53, .4)';
    ctx.lineWidth = .8;
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.arc(-16 + i * 6, 0, 4, -1, 1);
      ctx.stroke();
    }
    ctx.restore();
  },

  barnacles(ctx) {
    ctx.save();
    ctx.translate(100, 103);

    // driftwood base
    ctx.beginPath();
    ctx.moveTo(-59, 39);
    ctx.bezierCurveTo(-34, 25, 8, 27, 55, 37);
    ctx.bezierCurveTo(60, 47, 39, 56, 4, 55);
    ctx.bezierCurveTo(-31, 55, -54, 51, -59, 39);
    ctx.closePath();
    ctx.fillStyle = '#65543d';
    ctx.fill();
    ctx.strokeStyle = '#403324';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // barnacle cones
    const shells = [
      [-37, 12, 17], [-14, 2, 23], [14, 4, 20], [38, 15, 16],
      [-26, -21, 13], [3, -25, 15], [27, -15, 12]
    ];
    for (const [x, y, s] of shells) {
      ctx.beginPath();
      ctx.moveTo(x - s * .7, y + s * .55);
      ctx.lineTo(x - s * .34, y - s * .6);
      ctx.lineTo(x + s * .34, y - s * .6);
      ctx.lineTo(x + s * .7, y + s * .55);
      ctx.closePath();
      const g = ctx.createLinearGradient(x - s, y - s, x + s, y + s);
      g.addColorStop(0, '#d8cfb4');
      g.addColorStop(.45, '#b9ae8f');
      g.addColorStop(.8, '#8d8165');
      g.addColorStop(1, '#665b45');
      ctx.fillStyle = g;
      ctx.fill();
      ctx.strokeStyle = '#5b503b';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // opening
      ctx.beginPath();
      ctx.ellipse(x, y - s * .58, s * .25, s * .12, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#4f4533';
      ctx.fill();
      ctx.strokeStyle = 'rgba(236, 226, 201, .35)';
      ctx.lineWidth = .9;
      ctx.stroke();

      // ridges
      ctx.strokeStyle = 'rgba(90, 79, 58, .38)';
      ctx.lineWidth = .8;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(x + i * s * .35, y - s * .52);
        ctx.lineTo(x + i * s * .62, y + s * .45);
        ctx.stroke();
      }
    }

    // holdfast
    ctx.strokeStyle = 'rgba(62, 49, 33, .6)';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(-43 + i * 17, 40);
      ctx.quadraticCurveTo(-45 + i * 18, 48, -38 + i * 16, 53);
      ctx.stroke();
    }
    ctx.restore();
  },

  rib(ctx) {
    ctx.save();
    ctx.translate(100, 100);
    ctx.rotate(.32);

    // curved rib bone
    ctx.beginPath();
    ctx.moveTo(-7, -71);
    ctx.bezierCurveTo(22, -59, 34, -24, 31, 10);
    ctx.bezierCurveTo(28, 42, 13, 65, -3, 71);
    ctx.bezierCurveTo(-15, 66, -18, 49, -12, 28);
    ctx.bezierCurveTo(-6, 6, -8, -20, -21, -39);
    ctx.bezierCurveTo(-31, -53, -28, -67, -17, -71);
    ctx.closePath();
    const g = ctx.createLinearGradient(-25, -60, 24, 65);
    g.addColorStop(0, '#d3c19b');
    g.addColorStop(.35, '#b09b74');
    g.addColorStop(.7, '#887554');
    g.addColorStop(1, '#5e4f39');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = '#554631';
    ctx.lineWidth = 1.7;
    ctx.stroke();

    // inner curve
    ctx.beginPath();
    ctx.moveTo(-13, -58);
    ctx.bezierCurveTo(6, -38, 13, -8, 11, 21);
    ctx.bezierCurveTo(9, 44, 0, 56, -5, 60);
    ctx.strokeStyle = 'rgba(243, 230, 198, .35)';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // knobby ends
    ctx.beginPath();
    ctx.ellipse(-12, -66, 10, 7, .35, 0, Math.PI * 2);
    ctx.fillStyle = '#b8a47d';
    ctx.fill();
    ctx.strokeStyle = '#5b4b35';
    ctx.lineWidth = 1.1;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(-7, 66, 9, 6, -.25, 0, Math.PI * 2);
    ctx.fillStyle = '#a8946f';
    ctx.fill();
    ctx.stroke();

    // cracks
    ctx.strokeStyle = 'rgba(71, 57, 38, .55)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, -24);
    ctx.lineTo(11, -18);
    ctx.lineTo(14, -8);
    ctx.moveTo(-7, 37);
    ctx.lineTo(2, 31);
    ctx.lineTo(4, 20);
    ctx.stroke();

    // surface pores
    for (let i = 0; i < 16; i++) {
      ctx.beginPath();
      ctx.arc(-15 + (i * 11) % 36, -55 + (i * 17) % 110, .7 + (i % 3) * .5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(84, 68, 46, .35)';
      ctx.fill();
    }
    ctx.restore();
  },

  stela(ctx) {
    ctx.save();
    ctx.translate(100, 101);

    // irregular obsidian shard
    ctx.beginPath();
    ctx.moveTo(-38, -70);
    ctx.lineTo(-19, -77);
    ctx.lineTo(-8, -69);
    ctx.lineTo(12, -78);
    ctx.lineTo(39, -63);
    ctx.lineTo(34, -29);
    ctx.lineTo(43, 8);
    ctx.lineTo(32, 44);
    ctx.lineTo(39, 69);
    ctx.lineTo(2, 76);
    ctx.lineTo(-29, 65);
    ctx.lineTo(-24, 38);
    ctx.lineTo(-41, 13);
    ctx.lineTo(-34, -20);
    ctx.closePath();
    const g = ctx.createLinearGradient(-35, -70, 34, 72);
    g.addColorStop(0, '#4c4648');
    g.addColorStop(.35, '#2f2b2e');
    g.addColorStop(.7, '#1b181b');
    g.addColorStop(1, '#0d0b0d');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = '#080708';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // sheen
    ctx.beginPath();
    ctx.moveTo(-30, -62);
    ctx.lineTo(-16, -67);
    ctx.lineTo(-22, -18);
    ctx.lineTo(-32, -8);
    ctx.closePath();
    ctx.fillStyle = 'rgba(210, 198, 184, .1)';
    ctx.fill();

    // engraved tomb map
    ctx.strokeStyle = 'rgba(206, 174, 112, .62)';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(-18, -54);
    ctx.lineTo(13, -49);
    ctx.lineTo(9, -20);
    ctx.lineTo(24, -7);
    ctx.lineTo(17, 20);
    ctx.lineTo(-5, 32);
    ctx.lineTo(-14, 57);
    ctx.stroke();
    for (const [x, y, r] of [[-18, -54, 3], [9, -20, 3], [17, 20, 3], [-14, 57, 3]]) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(-5, 32);
    ctx.lineTo(-19, 19);
    ctx.lineTo(-30, 22);
    ctx.stroke();

    // gold inlay marks
    ctx.fillStyle = 'rgba(210, 171, 92, .7)';
    for (const [x, y] of [[-9, -66], [22, -41], [2, 4], [-22, 43]]) {
      ctx.beginPath();
      ctx.arc(x, y, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // chipped edges
    ctx.fillStyle = 'rgba(0, 0, 0, .45)';
    ctx.beginPath();
    ctx.moveTo(39, -63);
    ctx.lineTo(31, -57);
    ctx.lineTo(35, -51);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-29, 65);
    ctx.lineTo(-23, 58);
    ctx.lineTo(-27, 52);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  },

  bracer(ctx) {
    ctx.save();
    ctx.translate(100, 100);
    ctx.rotate(-.12);

    // curved cuff band
    ctx.beginPath();
    ctx.moveTo(-48, -42);
    ctx.bezierCurveTo(-65, -10, -65, 31, -48, 58);
    ctx.bezierCurveTo(-29, 67, 29, 67, 48, 58);
    ctx.bezierCurveTo(65, 31, 65, -10, 48, -42);
    ctx.bezierCurveTo(28, -52, -28, -52, -48, -42);
    ctx.closePath();
    const g = ctx.createLinearGradient(-55, -45, 55, 58);
    g.addColorStop(0, '#f1d07a');
    g.addColorStop(.3, '#d3a343');
    g.addColorStop(.65, '#9c6c22');
    g.addColorStop(.86, '#c59537');
    g.addColorStop(1, '#725017');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = '#5d4014';
    ctx.lineWidth = 1.7;
    ctx.stroke();

    // open seam
    ctx.beginPath();
    ctx.moveTo(0, -48);
    ctx.lineTo(0, 63);
    ctx.strokeStyle = 'rgba(73, 48, 12, .55)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // raised rims
    ctx.strokeStyle = 'rgba(255, 229, 157, .42)';
    ctx.lineWidth = 2;
    for (const y of [-36, 54]) {
      ctx.beginPath();
      ctx.moveTo(-42, y);
      ctx.quadraticCurveTo(0, y + (y < 0 ? -10 : 10), 42, y);
      ctx.stroke();
    }

    // sun discs at terminals
    for (const [x, y] of [[-47, -42], [47, -42]]) {
      ctx.beginPath();
      ctx.arc(x, y, 14, 0, Math.PI * 2);
      ctx.fillStyle = '#e0b75b';
      ctx.fill();
      ctx.strokeStyle = '#6f4c16';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(91, 58, 12, .5)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      for (let i = 0; i < 8; i++) {
        const a = i / 8 * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(a) * 16, y + Math.sin(a) * 16);
        ctx.lineTo(x + Math.cos(a) * 22, y + Math.sin(a) * 22);
        ctx.strokeStyle = 'rgba(238, 199, 103, .55)';
        ctx.lineWidth = 1.3;
        ctx.stroke();
      }
    }

    // engraved rays
    ctx.strokeStyle = 'rgba(102, 67, 17, .45)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(-36 + i * 18, -24);
      ctx.lineTo(-30 + i * 18, 38);
      ctx.stroke();
    }

    // specular
    ctx.beginPath();
    ctx.ellipse(-28, -20, 7, 24, -.3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 246, 208, .2)';
    ctx.fill();
    ctx.restore();
  },

  dagger(ctx) {
    ctx.save();
    ctx.translate(100, 100);
    ctx.rotate(.16);

    // leaf-shaped obsidian blade
    ctx.beginPath();
    ctx.moveTo(0, -79);
    ctx.bezierCurveTo(13, -57, 22, -31, 18, -5);
    ctx.bezierCurveTo(15, 11, 8, 22, 0, 27);
    ctx.bezierCurveTo(-8, 22, -15, 11, -18, -5);
    ctx.bezierCurveTo(-22, -31, -13, -57, 0, -79);
    ctx.closePath();
    const blade = ctx.createLinearGradient(-18, -70, 18, 25);
    blade.addColorStop(0, '#625c60');
    blade.addColorStop(.3, '#373237');
    blade.addColorStop(.65, '#1d1a1e');
    blade.addColorStop(1, '#0c0b0d');
    ctx.fillStyle = blade;
    ctx.fill();
    ctx.strokeStyle = '#080709';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // blade ridge and sheen
    ctx.beginPath();
    ctx.moveTo(0, -73);
    ctx.lineTo(0, 20);
    ctx.strokeStyle = 'rgba(219, 210, 220, .22)';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-6, -64);
    ctx.bezierCurveTo(-11, -38, -9, -12, -4, 8);
    ctx.strokeStyle = 'rgba(225, 216, 230, .12)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // bronze guard
    ctx.beginPath();
    ctx.moveTo(-30, 22);
    ctx.lineTo(30, 22);
    ctx.lineTo(24, 34);
    ctx.lineTo(-24, 34);
    ctx.closePath();
    const bronze = ctx.createLinearGradient(-30, 22, 30, 34);
    bronze.addColorStop(0, '#b99456');
    bronze.addColorStop(.5, '#7f602f');
    bronze.addColorStop(1, '#4f3b1b');
    ctx.fillStyle = bronze;
    ctx.fill();
    ctx.strokeStyle = '#413016';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // hilt
    ctx.beginPath();
    ctx.moveTo(-12, 34);
    ctx.lineTo(-9, 64);
    ctx.quadraticCurveTo(0, 70, 9, 64);
    ctx.lineTo(12, 34);
    ctx.closePath();
    ctx.fillStyle = '#3a2b1c';
    ctx.fill();
    ctx.strokeStyle = '#20170d';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(193, 154, 90, .35)';
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(-10, 40 + i * 6);
      ctx.lineTo(10, 38 + i * 6);
      ctx.stroke();
    }

    // pommel
    ctx.beginPath();
    ctx.ellipse(0, 68, 13, 7, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#8a6a35';
    ctx.fill();
    ctx.strokeStyle = '#493517';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();
  },

  ushabti(ctx) {
    ctx.save();
    ctx.translate(100, 102);

    // base
    ctx.beginPath();
    ctx.ellipse(0, 66, 30, 7, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#211b1e';
    ctx.fill();
    ctx.strokeStyle = '#0d0b0d';
    ctx.lineWidth = 1.3;
    ctx.stroke();

    // mummiform body
    ctx.beginPath();
    ctx.moveTo(-17, -42);
    ctx.bezierCurveTo(-30, -16, -32, 26, -22, 55);
    ctx.lineTo(22, 55);
    ctx.bezierCurveTo(32, 26, 30, -16, 17, -42);
    ctx.closePath();
    const g = ctx.createLinearGradient(-28, -44, 28, 58);
    g.addColorStop(0, '#5a5258');
    g.addColorStop(.35, '#332d32');
    g.addColorStop(.7, '#1c181c');
    g.addColorStop(1, '#0d0b0e');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = '#090709';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // head
    ctx.beginPath();
    ctx.ellipse(0, -51, 17, 20, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#40383e';
    ctx.fill();
    ctx.strokeStyle = '#0c0a0c';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // nemes headdress
    ctx.beginPath();
    ctx.moveTo(-17, -58);
    ctx.bezierCurveTo(-27, -48, -28, -28, -19, -22);
    ctx.lineTo(-15, -40);
    ctx.moveTo(17, -58);
    ctx.bezierCurveTo(27, -48, 28, -28, 19, -22);
    ctx.lineTo(15, -40);
    ctx.strokeStyle = 'rgba(195, 168, 112, .42)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // face
    ctx.strokeStyle = 'rgba(218, 199, 158, .55)';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(-8, -54);
    ctx.quadraticCurveTo(-4, -56, -1, -54);
    ctx.moveTo(3, -54);
    ctx.quadraticCurveTo(6, -56, 9, -54);
    ctx.moveTo(-4, -44);
    ctx.quadraticCurveTo(0, -42, 4, -44);
    ctx.stroke();

    // crossed arms
    ctx.strokeStyle = 'rgba(200, 176, 122, .45)';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-18, -18);
    ctx.quadraticCurveTo(0, -10, 18, -21);
    ctx.moveTo(-18, -24);
    ctx.quadraticCurveTo(0, -16, 18, -27);
    ctx.stroke();

    // tiny hoes
    ctx.strokeStyle = 'rgba(188, 160, 104, .5)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-12, -20);
    ctx.lineTo(-16, -4);
    ctx.moveTo(12, -22);
    ctx.lineTo(16, -6);
    ctx.stroke();

    // vertical inscription
    ctx.strokeStyle = 'rgba(202, 178, 123, .38)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(-4, 2 + i * 10);
      ctx.lineTo(4, 2 + i * 10);
      ctx.stroke();
    }

    // sheen
    ctx.beginPath();
    ctx.moveTo(-15, -36);
    ctx.lineTo(-8, -39);
    ctx.lineTo(-13, 44);
    ctx.lineTo(-20, 42);
    ctx.closePath();
    ctx.fillStyle = 'rgba(216, 207, 218, .09)';
    ctx.fill();
    ctx.restore();
  },

  ankh(ctx) {
    ctx.save();
    ctx.translate(100, 101);

    const gold = ctx.createLinearGradient(-40, -70, 40, 70);
    gold.addColorStop(0, '#f4d784');
    gold.addColorStop(.3, '#d6a844');
    gold.addColorStop(.65, '#a27323');
    gold.addColorStop(.88, '#d0a13c');
    gold.addColorStop(1, '#6f4c13');

    // loop
    ctx.beginPath();
    ctx.ellipse(0, -46, 27, 35, 0, 0, Math.PI * 2);
    ctx.strokeStyle = gold;
    ctx.lineWidth = 15;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255, 239, 184, .38)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // stem
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(0, 70);
    ctx.strokeStyle = gold;
    ctx.lineWidth = 15;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255, 239, 184, .35)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // crossbar
    ctx.beginPath();
    ctx.moveTo(-43, 1);
    ctx.lineTo(43, 1);
    ctx.strokeStyle = gold;
    ctx.lineWidth = 14;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255, 239, 184, .35)';
    ctx.lineWidth = 2.6;
    ctx.stroke();

    // lapis inlay at crossing
    ctx.beginPath();
    ctx.arc(0, 1, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#2f5b80';
    ctx.fill();
    ctx.strokeStyle = '#1c3a52';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-2.5, -2, 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(188, 224, 246, .55)';
    ctx.fill();

    // engraved bands
    ctx.strokeStyle = 'rgba(104, 70, 15, .45)';
    ctx.lineWidth = 1.2;
    for (const y of [24, 36, 48, 60]) {
      ctx.beginPath();
      ctx.moveTo(-5, y);
      ctx.lineTo(5, y);
      ctx.stroke();
    }
    for (const x of [-30, -18, 18, 30]) {
      ctx.beginPath();
      ctx.moveTo(x, -4);
      ctx.lineTo(x, 6);
      ctx.stroke();
    }
    ctx.restore();
  },

  chalice(ctx) {
    ctx.save();
    ctx.translate(100, 102);

    // bowl
    ctx.beginPath();
    ctx.moveTo(-45, -50);
    ctx.bezierCurveTo(-42, -18, -25, -4, 0, -4);
    ctx.bezierCurveTo(25, -4, 42, -18, 45, -50);
    ctx.closePath();
    const stone = ctx.createLinearGradient(-42, -50, 42, 0);
    stone.addColorStop(0, '#5a535a');
    stone.addColorStop(.35, '#332e34');
    stone.addColorStop(.7, '#1b181c');
    stone.addColorStop(1, '#0d0c0e');
    ctx.fillStyle = stone;
    ctx.fill();
    ctx.strokeStyle = '#080709';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // rim
    ctx.beginPath();
    ctx.ellipse(0, -50, 45, 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#b89146';
    ctx.fill();
    ctx.strokeStyle = '#6e521f';
    ctx.lineWidth = 1.3;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, -50, 37, 5.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#1b171a';
    ctx.fill();

    // gold band
    ctx.beginPath();
    ctx.moveTo(-39, -27);
    ctx.quadraticCurveTo(0, -16, 39, -27);
    ctx.strokeStyle = 'rgba(214, 174, 92, .7)';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // stem
    ctx.beginPath();
    ctx.moveTo(-10, -5);
    ctx.bezierCurveTo(-8, 18, -6, 36, -13, 48);
    ctx.lineTo(13, 48);
    ctx.bezierCurveTo(6, 36, 8, 18, 10, -5);
    ctx.closePath();
    ctx.fillStyle = '#272327';
    ctx.fill();
    ctx.strokeStyle = '#0b0a0b';
    ctx.lineWidth = 1.3;
    ctx.stroke();

    // knop
    ctx.beginPath();
    ctx.ellipse(0, 22, 15, 7, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#4b3a26';
    ctx.fill();
    ctx.strokeStyle = '#7d5f31';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // foot
    ctx.beginPath();
    ctx.moveTo(-30, 48);
    ctx.lineTo(-38, 60);
    ctx.quadraticCurveTo(0, 69, 38, 60);
    ctx.lineTo(30, 48);
    ctx.closePath();
    ctx.fillStyle = '#29252a';
    ctx.fill();
    ctx.strokeStyle = '#0b0a0b';
    ctx.lineWidth = 1.3;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-31, 56);
    ctx.quadraticCurveTo(0, 63, 31, 56);
    ctx.strokeStyle = 'rgba(205, 168, 88, .45)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // reflections
    ctx.beginPath();
    ctx.moveTo(-30, -42);
    ctx.bezierCurveTo(-27, -22, -17, -13, -6, -10);
    ctx.strokeStyle = 'rgba(225, 216, 232, .13)';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
  },

  mirror(ctx) {
    ctx.save();
    ctx.translate(100, 101);

    // handle
    ctx.beginPath();
    ctx.moveTo(-10, 40);
    ctx.lineTo(-8, 72);
    ctx.quadraticCurveTo(0, 78, 8, 72);
    ctx.lineTo(10, 40);
    ctx.closePath();
    const handle = ctx.createLinearGradient(-10, 40, 10, 76);
    handle.addColorStop(0, '#8d7440');
    handle.addColorStop(.5, '#5e4a28');
    handle.addColorStop(1, '#362a18');
    ctx.fillStyle = handle;
    ctx.fill();
    ctx.strokeStyle = '#2c2112';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // bronze rim
    ctx.beginPath();
    ctx.arc(0, -8, 55, 0, Math.PI * 2);
    const rim = ctx.createRadialGradient(-18, -28, 6, 4, 8, 60);
    rim.addColorStop(0, '#c3a05b');
    rim.addColorStop(.45, '#8a6a35');
    rim.addColorStop(.8, '#5c4421');
    rim.addColorStop(1, '#3a2a14');
    ctx.fillStyle = rim;
    ctx.fill();
    ctx.strokeStyle = '#2c2112';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // obsidian face
    ctx.beginPath();
    ctx.arc(0, -8, 46, 0, Math.PI * 2);
    const glass = ctx.createRadialGradient(-14, -24, 3, 4, 8, 50);
    glass.addColorStop(0, '#59545d');
    glass.addColorStop(.28, '#2d292f');
    glass.addColorStop(.68, '#151316');
    glass.addColorStop(1, '#080709');
    ctx.fillStyle = glass;
    ctx.fill();
    ctx.strokeStyle = 'rgba(217, 191, 132, .35)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // reflection
    ctx.beginPath();
    ctx.ellipse(-17, -25, 13, 6, -.7, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(228, 224, 235, .16)';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(14, 12, 6, 18, .45, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(228, 224, 235, .07)';
    ctx.fill();

    // rim studs
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * 50, -8 + Math.sin(a) * 50, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(230, 203, 142, .55)';
      ctx.fill();
    }

    // hairline crack
    ctx.beginPath();
    ctx.moveTo(19, -48);
    ctx.lineTo(10, -31);
    ctx.lineTo(16, -17);
    ctx.strokeStyle = 'rgba(206, 201, 214, .18)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }
};

export function drawArtifact(ctx, artId, x, y, size) {
  const painter = PAINTERS[artId] || PAINTERS.coin;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 200, size / 200);
  ctx.translate(-100, -100);
  painter(ctx, '#d5a23c');
  ctx.restore();
}

export function drawArtifactShadow(ctx, x, y, size, alpha = .35) {
  ctx.save();
  ctx.translate(x, y + size * .33);
  ctx.scale(1, .22);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, size * .38);
  g.addColorStop(0, `rgba(0,0,0,${alpha})`);
  g.addColorStop(.7, `rgba(0,0,0,${alpha * .35})`);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, size * .4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/* ---------------------------------------------------------
   Home expedition scene (SVG)
   --------------------------------------------------------- */
export function sceneSVG(site) {
  const p = site.palette;
  const u = site.id.replace(/-/g, '');
  const sunX = site.index === 2 ? 86 : site.index === 4 ? 318 : 302;
  const sunY = site.index === 4 ? 96 : 74;
  const sunR = site.index === 2 ? 28 : 34;

  const landmarks = {
    dunes: `
      <g opacity=".72" fill="#5a371c">
        <path d="M286 224l10-5 4 4 9-2 5 3 7-1 1 5-36 1z"/>
        <path d="M299 218c1-6 5-9 8-9 4 0 7 4 6 9" fill="none" stroke="#5a371c" stroke-width="2.2"/>
        <circle cx="310" cy="211" r="2.2"/>
        <path d="M292 219c1-4 3-6 5-6" fill="none" stroke="#5a371c" stroke-width="1.8"/>
        <path d="M267 232l6-4 3 2 5-2 2 3-14 1z"/>
      </g>
      <g transform="translate(34 205)" opacity=".55">
        <path d="M0 30c2-19 8-29 18-30 10 1 17 11 19 30" fill="none" stroke="#4e3018" stroke-width="1.4"/>
        <path d="M18 0v30M8 9c-7-6-10-13-9-20M28 9c7-6 10-13 9-20" fill="none" stroke="#4e3018" stroke-width="1.2"/>
      </g>
      <g transform="translate(276 239)" opacity=".85">
        <path d="M0 0h56v3H0z" fill="#6e431f"/>
        <path d="M7 0v-9M49 0v-9" stroke="#6e431f" stroke-width="2"/>
        <path d="M5-9h48l-5-8H10z" fill="#7b4b23"/>
        <path d="M15-17v-5h26v5" fill="none" stroke="#7b4b23" stroke-width="1.5"/>
      </g>
      <g fill="#70441f" opacity=".75">
        <path d="M330 248c6-2 12-1 18 2l-2 2c-5-2-10-3-16-2z"/>
        <path d="M341 251c3-6 8-9 13-8-2 4-5 6-9 9z"/>
      </g>
      <g transform="translate(215 226) scale(1.55)" opacity=".8" fill="#4b2d17">
        <path d="M0 12l8-4 3 3 8-2 4 3 6-1 1 4-30 1z"/>
        <path d="M10 8c1-7 5-10 8-10 4 0 7 4 6 10" fill="none" stroke="#4b2d17" stroke-width="2.4"/>
        <circle cx="21" cy="0" r="2.1"/>
        <path d="M2 10c1-4 3-6 5-6" fill="none" stroke="#4b2d17" stroke-width="1.7"/>
      </g>
      <g transform="translate(260 236) scale(.92)" opacity=".55" fill="#4b2d17">
        <path d="M0 10l6-3 2 2 6-2 3 2 5-1 1 3-23 1z"/>
        <path d="M8 7c1-5 4-8 6-8 3 0 5 3 4 8" fill="none" stroke="#4b2d17" stroke-width="2"/>
      </g>
      <g transform="translate(58 178)" opacity=".55" fill="none" stroke="#5a351a" stroke-width="1.4">
        <path d="M0 58V18h7v40M16 58V8h8v50M35 58V24h6v34M0 18l7-7 9 7 8-7 10 7M-4 58h52"/>
        <path d="M2 30h5M18 24h4M37 37h3" stroke-width="1"/>
      </g>
      <g transform="translate(286 232)" opacity=".9">
        <path d="M0 0h48v2H0z" fill="#6b421f"/>
        <path d="M3 0v-10M45 0v-10" stroke="#6b421f" stroke-width="1.5"/>
        <path d="M1-10h46l-6-8H7z" fill="#754923"/>
        <path d="M11-18v-5h23v5" fill="none" stroke="#754923" stroke-width="1.3"/>
        <path d="M12 0l3 6 3-6M33 0l3 6 3-6" stroke="#6b421f" stroke-width="1"/>
      </g>
      <g opacity=".28" fill="none" stroke="#5d3a1e" stroke-width=".8">
        <path d="M8 252c30-6 55-5 78 2M90 264c26-5 48-4 68 1M188 258c31-5 60-4 86 2M306 266c24-4 48-3 72 1"/>
      </g>`,
    salt: `
      <g opacity=".62" fill="none" stroke="#6e654e" stroke-width="1.6">
        <path d="M43 230v-54h38v54M51 230v-54M64 230v-54M77 230v-54"/>
        <path d="M35 178h54M38 171l9-8h33l9 8M30 230h70"/>
        <path d="M103 230v-37h30v37M110 230v-37M120 230v-37M129 230v-37M97 196h42M100 190l6-6h27l6 6"/>
      </g>
      <g opacity=".48" fill="#9fb5a7">
        <ellipse cx="192" cy="241" rx="45" ry="7"/>
        <ellipse cx="270" cy="253" rx="58" ry="8"/>
        <ellipse cx="112" cy="259" rx="36" ry="5"/>
      </g>
      <g opacity=".4" stroke="#746b56" stroke-width="1" fill="none">
        <path d="M172 220l15 7 12-2 18 8M223 212l9 5 13-1M285 231l12-4 8 5"/>
      </g>`,
    whales: `
      <g transform="translate(244 198)" opacity=".78" fill="none" stroke="#57321f" stroke-width="2.4">
        <path d="M0 32C4 2 24-10 47-4c22 6 30 24 27 44"/>
        <path d="M12 30c0-17 12-27 27-24 15 2 22 16 20 30"/>
        <path d="M17 12l-9-12M32 5l-2-15M47 8l7-13M61 18l13-7M63 33l15 2"/>
      </g>
      <g transform="translate(48 226)" opacity=".62" fill="#5b3622">
        <path d="M0 8l14-5 8 3 13-4 8 4 11-2 6 4H0z"/>
        <path d="M18 7c2-9 7-13 12-12 6 1 9 6 8 12" fill="none" stroke="#5b3622" stroke-width="2"/>
      </g>
      <g opacity=".4" fill="none" stroke="#6a4028" stroke-width="1.2">
        <path d="M30 248l24-4 16 2 21-5M280 245l18-4 14 2 20-3M154 255l16-4 12 2"/>
      </g>`,
    tomb: `
      <g transform="translate(54 154)" opacity=".9">
        <path d="M0 76V18L26 0l26 18v58z" fill="#211814" stroke="#0f0b09" stroke-width="1.4"/>
        <path d="M12 76V28l14-9 14 9v48z" fill="#0b0908"/>
        <path d="M0 76h52M6 18h40M17 28h18" stroke="#6e4d31" stroke-width="1" opacity=".45"/>
      </g>
      <g opacity=".8" fill="#16110e">
        <path d="M302 236l17-29 5 4-14 29zM327 247l11-20 5 2-9 21zM278 252l9-16 4 2-7 17z"/>
        <path d="M346 232l5-8 3 2-4 8z"/>
      </g>
      <g opacity=".45" stroke="#9a7350" stroke-width="1" fill="none">
        <path d="M108 246l16-3 10 2M196 239l22-5 13 3M252 249l11-3"/>
      </g>`
  }[site.scene];

  return `
  <svg viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="sky${u}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${p.skyTop}"/>
        <stop offset=".64" stop-color="${p.skyBottom}"/>
        <stop offset="1" stop-color="${p.skyBottom}"/>
      </linearGradient>
      <radialGradient id="halo${u}">
        <stop offset="0" stop-color="${p.sun}" stop-opacity=".85"/>
        <stop offset=".35" stop-color="${p.sun}" stop-opacity=".26"/>
        <stop offset="1" stop-color="${p.sun}" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="far${u}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${p.far}"/>
        <stop offset="1" stop-color="${p.mid}"/>
      </linearGradient>
      <linearGradient id="mid${u}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${p.mid}"/>
        <stop offset="1" stop-color="${p.near}"/>
      </linearGradient>
      <linearGradient id="near${u}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${p.near}"/>
        <stop offset="1" stop-color="${p.deep}"/>
      </linearGradient>
      <linearGradient id="sun${u}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fff4cc"/>
        <stop offset=".55" stop-color="${p.sun}"/>
        <stop offset="1" stop-color="#e8aa57"/>
      </linearGradient>
      <filter id="blur${u}" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="9"/>
      </filter>
    </defs>
    <rect width="400" height="320" fill="url(#sky${u})"/>
    <circle class="sun-halo" cx="${sunX}" cy="${sunY}" r="88" fill="url(#halo${u})" filter="url(#blur${u})"/>
    <circle cx="${sunX}" cy="${sunY}" r="${sunR}" fill="url(#sun${u})" opacity=".96"/>
    <circle cx="${sunX}" cy="${sunY}" r="${sunR + 17}" fill="none" stroke="${p.sun}" stroke-width=".9" opacity=".24"/>
    <circle cx="${sunX}" cy="${sunY}" r="${sunR + 31}" fill="none" stroke="${p.sun}" stroke-width=".6" opacity=".11"/>
    <g opacity=".5" fill="none" stroke="#4c321d" stroke-width="1.1" stroke-linecap="round">
      <path d="M110 88c3-3 6-3 9 0 3-3 6-3 9 0"/>
      <path d="M144 74c2-2 4-2 6 0 2-2 4-2 6 0"/>
      <path d="M82 112c2-2 4-2 6 0"/>
    </g>
    <g opacity=".18" fill="none" stroke="#fff4dc" stroke-width="1">
      <path d="M-10 108c40-6 82-5 124 1 28 4 58 4 88-2" stroke-width="4" filter="url(#blur${u})"/>
      <path d="M160 54c28-3 52-2 76 2" stroke-width="3" filter="url(#blur${u})"/>
    </g>
    <g class="heat" opacity=".28" fill="none" stroke="#fff4d8" stroke-width=".8">
      <path d="M12 144c30-4 58 4 86 0s58-5 88-1 54 4 84 0"/>
      <path d="M40 156c26-3 49 3 75 0s50-4 76-1"/>
      <path d="M224 151c22-2 44 2 66 0s47-3 70 0"/>
    </g>
    <g opacity=".55" fill="#5d4025">
      <path d="M44 74c2-4 5-6 8-6s6 2 8 6M52 68l-4-3M60 68l4-3"/>
      <path d="M330 106c1-3 3-5 5-5s4 2 5 5M335 101l-3-2M340 101l3-2"/>
    </g>
    <path d="M0 213c34-18 65-20 96-9 29 10 52 11 80 1 33-12 60-12 92-1 31 11 58 11 90 0 15-5 29-6 42-3v119H0z" fill="url(#far${u})" opacity=".75"/>
    <path d="M0 240c36-17 68-19 102-8 30 10 57 10 88 1 34-10 62-9 94 2 32 10 57 11 84 3 13-4 24-4 32-2v84H0z" fill="url(#mid${u})" opacity=".82"/>
    <g opacity=".28" fill="none" stroke="${p.accent}" stroke-width=".9">
      <path d="M0 232c38-13 75-14 111-4 35 10 70 10 105 1 37-9 74-8 111 2 25 7 49 8 73 4"/>
      <path d="M0 252c42-14 82-14 120-3 39 11 77 11 115 1 40-10 80-9 120 1 17 4 32 5 45 4"/>
    </g>
    ${landmarks}
    <path d="M0 267c48-24 94-23 137-7 35 13 67 13 101 2 35-11 70-11 105 0 20 7 39 8 57 4v54H0z" fill="url(#near${u})"/>
    <path d="M0 287c44-17 86-16 125-3 43 14 81 13 122 1 44-13 84-12 124 0 10 3 20 5 29 5v30H0z" fill="${p.deep}" opacity=".45"/>
    <path d="M0 279c56-13 103-11 146 3 38 12 76 12 116 2 44-11 88-10 138 2" fill="none" stroke="${p.accent}" stroke-width="1.1" opacity=".35"/>
    <g opacity=".13" fill="#3a2410">
      <path d="M42 295c14-6 29-8 44-6 13 1 24 3 35 6z"/>
      <path d="M262 304c17-5 33-6 49-3 11 2 19 4 27 7z"/>
    </g>
    <g opacity=".4" fill="#2d1b0d">
      <path d="M0 312c41-7 82-7 123 0 41 7 82 7 123 0 51-9 102-9 154 0v8H0z"/>
    </g>
  </svg>`;
}

export function iconSvg(id) {
  return `<svg><use href="#${id}"></use></svg>`;
}
