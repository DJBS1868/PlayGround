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
