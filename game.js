(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const $ = (id) => document.getElementById(id);
  const ui = {
    health: $('healthText'), healthBar: $('healthBar'), force: $('forceText'), forceBar: $('forceBar'), wave: $('waveText'), waveSub: $('waveSub'), credits: $('creditsText'), score: $('scoreText'),
    pylon: $('pylonBtn'), turret: $('turretBtn'), forceBtn: $('forceBtn'), cooldown: $('cooldownText'), cooldownRing: $('cooldownRing'), hint: $('hintText'), boss: $('bossHud'), bossHp: $('bossHpText'), bossBar: $('bossHpBar'), toast: $('toast'), modal: $('modalLayer'), modalCard: $('modalCard')
  };
  const TAU = Math.PI * 2;
  let W = innerWidth, H = innerHeight, dpr = 1, last = 0, time = 0, toastTimer = 0;
  let state, selectedBuild = null;

  function reset() {
    state = {
      health: 100, force: 100, credits: 120, score: 0, wave: 1, hero: { x: W * .5, y: H * .52, tx: W * .5, ty: H * .52, speed: 250, facing: 1 },
      enemies: [], bolts: [], shots: [], defenses: [], particles: [], pulses: [], spawned: 0, kills: 0, spawnClock: 1.4,
      waveCount: 6, phase: 'battle', forceCooldown: 0, upgrades: { speed: 0, damage: 0 }, dead: false, won: false
    };
    const arena = bounds(); state.hero.x = state.hero.tx = arena.cx; state.hero.y = state.hero.ty = arena.cy + 70;
    selectedBuild = null; updateButtons(); updateUI(); ui.modal.hidden = true; ui.boss.classList.remove('visible');
    setTimeout(() => spawnEnemy(), 450);
  }
  function bounds() { return { left: 18, right: W - 18, top: 91, bottom: H - (innerWidth <= 560 ? 128 : 93), cx: W / 2, cy: (91 + H - (innerWidth <= 560 ? 128 : 93)) / 2 }; }
  function resize() {
    W = innerWidth; H = innerHeight; dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (state) { const b = bounds(); state.hero.x = Math.min(W - 55, state.hero.x); state.hero.y = Math.min(b.bottom - 34, Math.max(b.top + 34, state.hero.y)); state.hero.tx = Math.min(W - 55, state.hero.tx); state.hero.ty = Math.min(b.bottom - 34, Math.max(b.top + 34, state.hero.ty)); }
  }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function distance(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function showToast(message) { ui.toast.textContent = message; ui.toast.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => ui.toast.classList.remove('show'), 1500); }

  function spawnEnemy() {
    if (!state || state.phase !== 'battle' || state.spawned >= state.waveCount) return;
    const b = bounds();
    const side = Math.random() < .5 ? 0 : 1;
    const x = side === 0 ? b.left - 20 : b.right + 20;
    const y = rand(b.top + 80, b.bottom - 50);
    const boss = state.wave === 5 && state.spawned === 0;
    const kind = boss ? 'boss' : (Math.random() < .32 ? 'scout' : 'droid');
    const hp = boss ? 780 : (kind === 'scout' ? 45 : 76 + state.wave * 11);
    state.enemies.push({ x, y, hp, maxHp: hp, kind, r: boss ? 33 : kind === 'scout' ? 14 : 18, speed: boss ? 24 : kind === 'scout' ? 48 + state.wave * 3 : 32 + state.wave * 2, fire: rand(1.1, 2.8), hit: 0, side, knock: 0, angle: side === 0 ? 0 : Math.PI });
    state.spawned++;
    if (boss) ui.boss.classList.add('visible');
    const delay = state.wave === 5 ? rand(1.8, 2.8) : Math.max(.55, 1.55 - state.wave * .12);
    state.spawnClock = delay;
  }

  function update(dt) {
    if (!state) return; time += dt;
    if (state.phase !== 'battle') { updateParticles(dt); return; }
    const b = bounds(), hero = state.hero;
    state.force = Math.min(100, state.force + dt * 3.2);
    state.forceCooldown = Math.max(0, state.forceCooldown - dt);
    const dx = hero.tx - hero.x, dy = hero.ty - hero.y, d = Math.hypot(dx, dy);
    if (d > 2) { const move = Math.min(d, (hero.speed + state.upgrades.speed * 25) * dt); hero.x += dx / d * move; hero.y += dy / d * move; if (Math.abs(dx) > 2) hero.facing = Math.sign(dx); }
    hero.x = clamp(hero.x, b.left + 23, b.right - 23); hero.y = clamp(hero.y, b.top + 38, b.bottom - 30);

    state.spawnClock -= dt; if (state.spawnClock <= 0 && state.spawned < state.waveCount) spawnEnemy();
    for (let i = state.enemies.length - 1; i >= 0; i--) {
      const e = state.enemies[i]; e.hit = Math.max(0, e.hit - dt * 3.5); e.fire -= dt;
      if (e.knock > 0) { const k = Math.min(e.knock, dt * 74); e.x += Math.cos(e.knockAngle) * k; e.y += Math.sin(e.knockAngle) * k; e.knock -= k; }
      let slow = 1;
      for (const p of state.defenses) if (p.type === 'pylon' && Math.hypot(e.x - p.x, e.y - p.y) < 126) slow = Math.min(slow, .55);
      const target = { x: b.cx, y: b.cy };
      const vx = target.x - e.x, vy = target.y - e.y, len = Math.hypot(vx, vy) || 1;
      e.x += vx / len * e.speed * slow * dt; e.y += vy / len * e.speed * slow * dt;
      if (e.fire <= 0 && e.kind !== 'scout' && distance(e, hero) < 310) {
        state.bolts.push({ x: e.x, y: e.y, tx: hero.x, ty: hero.y, speed: e.kind === 'boss' ? 135 : 170, r: e.kind === 'boss' ? 4 : 3, team: 'enemy', life: 3 });
        e.fire = e.kind === 'boss' ? rand(.9, 1.5) : rand(2.2, 3.2);
      }
      if (Math.hypot(e.x - b.cx, e.y - b.cy) < (e.kind === 'boss' ? 48 : 33)) {
        state.health = Math.max(0, state.health - (e.kind === 'boss' ? 24 : e.kind === 'scout' ? 9 : 14));
        burst(e.x, e.y, '#ff6b65', 14); state.enemies.splice(i, 1); updateUI();
        if (state.health <= 0) { finish(false); return; }
      }
    }

    // Hero's saber automatically catches nearby incoming bolts and returns them toward the closest droid.
    for (let i = state.bolts.length - 1; i >= 0; i--) {
      const p = state.bolts[i]; p.life -= dt;
      if (p.team === 'enemy' && Math.hypot(p.x - hero.x, p.y - hero.y) < 30) {
        const target = nearestEnemy(hero);
        if (target) { p.team = 'friendly'; p.tx = target.x; p.ty = target.y; p.speed = 430; p.r = 3.5; p.life = 2.2; p.deflected = true; burst(p.x, p.y, '#aaf8ff', 5); }
        else { state.bolts.splice(i, 1); continue; }
      }
      const dxp = p.tx - p.x, dyp = p.ty - p.y, dist = Math.hypot(dxp, dyp) || 1, step = p.speed * dt;
      p.x += dxp / dist * step; p.y += dyp / dist * step;
      if (dist < step + 7) {
        if (p.team === 'friendly') { const target = nearestEnemy(p); if (target && Math.hypot(target.x - p.x, target.y - p.y) < 45) damageEnemy(target, 42 + state.upgrades.damage * 12); }
        state.bolts.splice(i, 1);
      } else if (p.life <= 0 || p.x < -40 || p.x > W + 40 || p.y < 60 || p.y > H - 70) state.bolts.splice(i, 1);
    }

    // Turrets find the nearest droid in range and fire automatically.
    for (const t of state.defenses) if (t.type === 'turret') {
      t.cool -= dt;
      const target = nearestEnemy(t, 265);
      if (target && t.cool <= 0) { state.shots.push({ x: t.x, y: t.y, target, speed: 375, life: 2 }); t.cool = .78; }
    }
    for (let i = state.shots.length - 1; i >= 0; i--) {
      const s = state.shots[i]; s.life -= dt;
      if (!state.enemies.includes(s.target)) { state.shots.splice(i, 1); continue; }
      const dxs = s.target.x - s.x, dys = s.target.y - s.y, dist = Math.hypot(dxs, dys) || 1, step = s.speed * dt;
      s.x += dxs / dist * step; s.y += dys / dist * step;
      if (dist < step + s.target.r) { damageEnemy(s.target, 28 + state.upgrades.damage * 10); burst(s.x, s.y, '#72efff', 4); state.shots.splice(i, 1); }
      else if (s.life <= 0) state.shots.splice(i, 1);
    }
    for (let i = state.pulses.length - 1; i >= 0; i--) { state.pulses[i].r += dt * 450; state.pulses[i].life -= dt; if (state.pulses[i].life <= 0) state.pulses.splice(i, 1); }
    updateParticles(dt);
    if (state.phase === 'battle' && state.spawned >= state.waveCount && state.enemies.length === 0) waveComplete();
    updateUI();
  }
  function nearestEnemy(from, max = Infinity) { let found = null, best = max; for (const e of state.enemies) { const d = Math.hypot(e.x - from.x, e.y - from.y); if (d < best) { best = d; found = e; } } return found; }
  function damageEnemy(e, amount) {
    if (!state.enemies.includes(e)) return; e.hp -= amount; e.hit = 1;
    if (e.kind === 'boss') { ui.bossHp.textContent = `${Math.max(0, Math.ceil(e.hp / e.maxHp * 100))}%`; ui.bossBar.style.width = `${Math.max(0, e.hp / e.maxHp * 100)}%`; }
    if (e.hp <= 0) {
      const i = state.enemies.indexOf(e); if (i !== -1) state.enemies.splice(i, 1);
      const reward = e.kind === 'boss' ? 220 : e.kind === 'scout' ? 28 : 36;
      state.credits += reward; state.score += e.kind === 'boss' ? 1400 : e.kind === 'scout' ? 160 : 240; state.kills++;
      burst(e.x, e.y, e.kind === 'boss' ? '#ff725e' : '#74e8ff', e.kind === 'boss' ? 34 : 16);
      if (e.kind === 'boss') { ui.boss.classList.remove('visible'); showToast('SENTINEL DROID NEUTRALIZED'); }
    }
  }
  function burst(x, y, color, count) { for (let i = 0; i < count; i++) { const a = rand(0, TAU), speed = rand(24, 150); state.particles.push({ x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, life: rand(.25, .75), max: .75, size: rand(1, 3), color }); } }
  function updateParticles(dt) { if (!state) return; for (let i = state.particles.length - 1; i >= 0; i--) { const p = state.particles[i]; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= .96; p.vy *= .96; p.life -= dt; if (p.life <= 0) state.particles.splice(i, 1); } }

  function forcePush() {
    if (state.phase !== 'battle') return;
    if (state.forceCooldown > 0) { showToast(`FORCE PUSH RECHARGING · ${Math.ceil(state.forceCooldown)} SEC`); return; }
    if (state.force < 25) { showToast('NOT ENOUGH FORCE ENERGY'); return; }
    const h = state.hero; state.force -= 25; state.forceCooldown = 10; state.pulses.push({ x: h.x, y: h.y, r: 12, life: .65 }); burst(h.x, h.y, '#80edff', 32);
    for (const e of [...state.enemies]) if (Math.hypot(e.x - h.x, e.y - h.y) < 190) { const dx = e.x - h.x, dy = e.y - h.y, d = Math.hypot(dx, dy) || 1; e.knockAngle = Math.atan2(dy, dx); e.knock = 110; damageEnemy(e, 115 + state.upgrades.damage * 20); }
    for (let i = state.bolts.length - 1; i >= 0; i--) if (state.bolts[i].team === 'enemy' && Math.hypot(state.bolts[i].x - h.x, state.bolts[i].y - h.y) < 195) state.bolts.splice(i, 1);
    showToast('FORCE WAVE RELEASED'); updateUI();
  }
  function selectBuild(type) {
    if (state.phase !== 'battle') return;
    const cost = type === 'pylon' ? 60 : 80;
    if (state.credits < cost) { showToast('INSUFFICIENT CREDITS'); return; }
    selectedBuild = selectedBuild === type ? null : type; updateButtons();
    ui.hint.textContent = selectedBuild ? `TAP AN OPEN FLOOR TILE TO DEPLOY ${selectedBuild === 'pylon' ? 'SHIELD PYLON' : 'BLASTER TURRET'}` : 'TAP THE ARCHIVE FLOOR TO MOVE';
  }
  function placeDefense(x, y) {
    const type = selectedBuild, cost = type === 'pylon' ? 60 : 80, b = bounds();
    if (x < b.left + 28 || x > b.right - 28 || y < b.top + 42 || y > b.bottom - 28) return;
    if (Math.hypot(x - b.cx, y - b.cy) < 78) { showToast('ARCHIVE CORE IS A NO-BUILD ZONE'); return; }
    if (state.credits < cost) { selectedBuild = null; updateButtons(); showToast('INSUFFICIENT CREDITS'); return; }
    if (state.defenses.some(d => Math.hypot(x - d.x, y - d.y) < 54)) { showToast('DEFENSE GRID TOO CROWDED'); return; }
    state.credits -= cost; state.defenses.push({ x, y, type, cool: .25, phase: rand(0, TAU) });
    burst(x, y, '#77eaff', 12); selectedBuild = null; updateButtons(); ui.hint.textContent = 'TAP THE ARCHIVE FLOOR TO MOVE'; showToast(type === 'pylon' ? 'SHIELD PYLON DEPLOYED' : 'BLASTER TURRET ONLINE'); updateUI();
  }
  function updateButtons() { ui.pylon.classList.toggle('selected', selectedBuild === 'pylon'); ui.turret.classList.toggle('selected', selectedBuild === 'turret'); }
  function updateUI() {
    ui.health.textContent = `${Math.ceil(state.health)}%`; ui.healthBar.style.width = `${state.health}%`;
    ui.force.textContent = `${Math.floor(state.force)}%`; ui.forceBar.style.width = `${state.force}%`;
    ui.wave.innerHTML = `${String(state.wave).padStart(2, '0')} <small>/ 05</small>`;
    ui.waveSub.textContent = state.phase === 'battle' ? (state.wave === 5 ? 'SENTINEL · FINAL ASSAULT' : 'DROID PATROL · INBOUND') : 'ARCHIVE SECURE · RESUPPLY';
    ui.credits.textContent = state.credits; ui.score.textContent = String(state.score).padStart(4, '0');
    const cd = state.forceCooldown; ui.cooldown.textContent = cd > 0 ? `RECHARGING · ${Math.ceil(cd)} SEC` : 'READY · 10 SEC'; ui.cooldownRing.style.transform = `scaleX(${1 - cd / 10})`; ui.forceBtn.disabled = cd > 0 || state.force < 25 || state.phase !== 'battle';
    const boss = state.enemies.find(e => e.kind === 'boss'); if (boss) { ui.boss.classList.add('visible'); ui.bossHp.textContent = `${Math.max(0, Math.ceil(boss.hp / boss.maxHp * 100))}%`; ui.bossBar.style.width = `${Math.max(0, boss.hp / boss.maxHp * 100)}%`; }
  }
  function waveComplete() {
    state.phase = 'shop'; state.credits += 50 + state.wave * 15; state.score += 500;
    if (state.wave === 5) { finish(true); return; }
    ui.modal.hidden = false;
    renderShop();
    updateUI();
  }
  function renderShop() {
    ui.modalCard.innerHTML = `<div class="modal-kicker">WAVE ${String(state.wave).padStart(2, '0')} SECURED</div><h2 class="modal-title">Wave Complete</h2><p class="modal-desc">The archive is holding. Spend your field credits on upgrades before the next droid assault.</p><div class="shop-balance">AVAILABLE CREDITS · ${state.credits}</div><div class="shop-grid"><button class="upgrade" data-upgrade="speed"><b>FORCE-ENHANCED MOBILITY</b><small>Increase hero movement speed</small><span>✧ ${120 + state.upgrades.speed * 60} CREDITS</span></button><button class="upgrade" data-upgrade="damage"><b>SABER ATTUNEMENT</b><small>Increase deflection &amp; push damage</small><span>✧ ${120 + state.upgrades.damage * 60} CREDITS</span></button></div><button class="modal-primary" id="continueBtn">PREPARE FOR WAVE ${state.wave + 1} &nbsp; →</button>`;
    ui.modalCard.querySelectorAll('[data-upgrade]').forEach(btn => btn.addEventListener('click', () => buyUpgrade(btn.dataset.upgrade)));
    $('continueBtn').addEventListener('click', nextWave);
  }
  function buyUpgrade(type) {
    const cost = 120 + state.upgrades[type] * 60;
    if (state.credits < cost) { showToast('NOT ENOUGH CREDITS'); return; }
    state.credits -= cost; state.upgrades[type]++; showToast(type === 'speed' ? 'MOBILITY UPGRADED' : 'SABER ATTUNEMENT IMPROVED'); renderShop(); updateUI();
  }
  function nextWave() {
    state.wave++; state.phase = 'battle'; state.spawned = 0; state.spawnClock = 1.4; state.waveCount = state.wave === 5 ? 1 : 6 + state.wave * 2;
    state.force = Math.min(100, state.force + 30); ui.modal.hidden = true; ui.hint.textContent = 'TAP THE ARCHIVE FLOOR TO MOVE';
    if (state.wave === 5) showToast('FINAL WAVE · SENTINEL DROID DETECTED'); else showToast(`WAVE ${String(state.wave).padStart(2, '0')} INCOMING`);
    setTimeout(() => { if (state.phase === 'battle') spawnEnemy(); }, 600); updateUI();
  }
  function finish(victory) {
    state.phase = victory ? 'victory' : 'defeat'; state.won = victory; ui.modal.hidden = false; ui.boss.classList.remove('visible');
    ui.modalCard.innerHTML = `<div class="modal-kicker">${victory ? 'THE FORCE IS WITH YOU' : 'ARCHIVE SIGNAL LOST'}</div><h2 class="modal-title">${victory ? 'Temple Preserved!' : 'Temple Fallen'}</h2><p class="modal-desc">${victory ? 'The sentinel is down. The Jedi archives endure, and the knowledge within remains safe.' : 'The droids breached the archive core. Regroup, Guardian—the temple still needs you.'}</p><div class="final-score">FINAL SCORE &nbsp; ${String(state.score).padStart(5, '0')} &nbsp; · &nbsp; ${state.kills} DROIDS</div><button class="modal-primary" id="restartBtn">${victory ? 'PLAY AGAIN' : 'TRY AGAIN'}</button>`;
    $('restartBtn').addEventListener('click', reset); updateUI();
  }

  function draw() {
    if (!state) return;
    ctx.clearRect(0, 0, W, H);
    drawBackground(); drawCore(); drawDefenses(); drawEnemies(); drawProjectiles(); drawHero(); drawEffects();
  }
  function drawBackground() {
    const b = bounds(), g = ctx.createRadialGradient(b.cx, b.cy, 20, b.cx, b.cy, Math.max(W, H) * .75);
    g.addColorStop(0, '#142738'); g.addColorStop(.55, '#0b1722'); g.addColorStop(1, '#080d14'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // Archive floor's understated technical grid.
    ctx.save(); ctx.beginPath(); ctx.rect(0, b.top, W, b.bottom - b.top); ctx.clip();
    ctx.strokeStyle = 'rgba(86,167,191,.055)'; ctx.lineWidth = 1;
    const grid = 42, ox = ((time * 2) % grid);
    for (let x = ox; x < W; x += grid) { ctx.beginPath(); ctx.moveTo(x, b.top); ctx.lineTo(x, b.bottom); ctx.stroke(); }
    for (let y = b.top + ((time * 1.3) % grid); y < b.bottom; y += grid) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    // Long vanishing-line floor panels.
    ctx.strokeStyle = 'rgba(85,177,200,.035)';
    for (let i = -10; i <= 10; i++) { ctx.beginPath(); ctx.moveTo(b.cx + i * 36, b.cy); ctx.lineTo(b.cx + i * 118, b.bottom); ctx.stroke(); }
    // Archive alcoves on the side walls.
    for (let side = 0; side < 2; side++) for (let y = b.top + 50; y < b.bottom - 15; y += 84) {
      const x = side ? W - 27 : 27; ctx.fillStyle = 'rgba(18,38,51,.7)'; ctx.fillRect(x - 9, y, 18, 60);
      ctx.strokeStyle = 'rgba(83,190,214,.12)'; ctx.strokeRect(x - 9, y, 18, 60);
      ctx.fillStyle = `rgba(79,217,243,${.17 + .05 * Math.sin(time * 2 + y)})`; ctx.fillRect(x - 1, y + 9, 2, 42);
    }
    ctx.restore();
    // Arena perimeter corners.
    ctx.strokeStyle = 'rgba(95,210,231,.28)'; ctx.lineWidth = 1;
    const s = 18, len = 17;
    for (const [x, y, sx, sy] of [[s,b.top+14,1,1],[W-s,b.top+14,-1,1],[s,b.bottom-12,1,-1],[W-s,b.bottom-12,-1,-1]]) {
      ctx.beginPath(); ctx.moveTo(x, y + sy * len); ctx.lineTo(x, y); ctx.lineTo(x + sx * len, y); ctx.stroke();
    }
    // Small tactical markers hint at the two inbound lanes.
    for (const side of [-1, 1]) {
      const x = b.cx + side * Math.min(W * .3, 250); ctx.fillStyle = 'rgba(255,103,94,.37)';
      ctx.beginPath(); ctx.moveTo(x - 5, b.cy - 3); ctx.lineTo(x + 5, b.cy); ctx.lineTo(x - 5, b.cy + 3); ctx.fill();
      ctx.fillStyle = 'rgba(145,102,108,.5)'; ctx.font = '8px DM Mono, monospace'; ctx.textAlign = side < 0 ? 'left' : 'right'; ctx.fillText('THREAT VECTOR', x + side * 10, b.cy - 8);
    }
  }
  function drawCore() {
    const b = bounds(), x = b.cx, y = b.cy;
    const glow = ctx.createRadialGradient(x, y, 4, x, y, 110); glow.addColorStop(0, 'rgba(55,171,205,.2)'); glow.addColorStop(1, 'rgba(54,162,200,0)'); ctx.fillStyle = glow; ctx.fillRect(x - 115, y - 115, 230, 230);
    ctx.save(); ctx.translate(x, y);
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(0, 0, 62 + i * 12, 0, TAU); ctx.strokeStyle = i === 0 ? 'rgba(89,209,235,.3)' : 'rgba(83,165,190,.11)'; ctx.lineWidth = 1; ctx.stroke(); }
    ctx.beginPath(); ctx.arc(0, 0, 52, 0, TAU); ctx.fillStyle = 'rgba(7,19,29,.92)'; ctx.fill(); ctx.strokeStyle = 'rgba(100,221,243,.58)'; ctx.lineWidth = 1.3; ctx.stroke();
    ctx.rotate(time * .12); ctx.beginPath(); ctx.arc(0, 0, 43, .2, 2.3); ctx.strokeStyle = 'rgba(98,234,255,.65)'; ctx.lineWidth = 2; ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, 43, 3.3, 5.3); ctx.stroke(); ctx.rotate(-time * .12);
    ctx.beginPath(); ctx.moveTo(0, -26); ctx.lineTo(22, 14); ctx.lineTo(-22, 14); ctx.closePath(); ctx.fillStyle = 'rgba(61,147,171,.13)'; ctx.fill(); ctx.strokeStyle = 'rgba(134,228,242,.6)'; ctx.stroke();
    ctx.fillStyle = '#b9f4ff'; ctx.shadowColor = '#52dbf4'; ctx.shadowBlur = 12; ctx.beginPath(); ctx.arc(0, -2, 3, 0, TAU); ctx.fill(); ctx.shadowBlur = 0;
    ctx.restore();
    ctx.textAlign = 'center'; ctx.font = '7px DM Mono, monospace'; ctx.fillStyle = 'rgba(135,194,207,.5)'; ctx.fillText('JEDI ARCHIVE CORE', x, y + 84);
  }
  function drawDefenses() {
    for (const d of state.defenses) {
      ctx.save(); ctx.translate(d.x, d.y);
      if (d.type === 'pylon') {
        ctx.beginPath(); ctx.arc(0, 0, 126, 0, TAU); ctx.fillStyle = 'rgba(70,199,225,.025)'; ctx.fill(); ctx.setLineDash([3, 7]); ctx.strokeStyle = 'rgba(86,210,233,.15)'; ctx.stroke(); ctx.setLineDash([]);
        ctx.beginPath(); ctx.arc(0, 0, 17, 0, TAU); ctx.strokeStyle = 'rgba(107,230,247,.34)'; ctx.stroke();
        ctx.rotate(time * .3 + d.phase); ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(10, 0); ctx.lineTo(0, 12); ctx.lineTo(-10, 0); ctx.closePath(); ctx.fillStyle = 'rgba(18,58,72,.95)'; ctx.fill(); ctx.strokeStyle = '#71e6fa'; ctx.lineWidth = 1.3; ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, 3, 0, TAU); ctx.fillStyle = '#b7f9ff'; ctx.shadowColor = '#65e8fa'; ctx.shadowBlur = 10; ctx.fill();
        ctx.shadowBlur = 0; ctx.restore();
      } else {
        ctx.beginPath(); ctx.arc(0, 0, 21, 0, TAU); ctx.fillStyle = 'rgba(6,17,25,.92)'; ctx.fill(); ctx.strokeStyle = 'rgba(94,219,240,.62)'; ctx.lineWidth = 1.2; ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, 14, 0, TAU); ctx.strokeStyle = 'rgba(81,172,196,.38)'; ctx.stroke();
        const target = nearestEnemy(d, 270); const a = target ? Math.atan2(target.y - d.y, target.x - d.x) : -Math.PI / 2;
        ctx.rotate(a); ctx.fillStyle = '#174153'; ctx.strokeStyle = '#77eaff'; ctx.lineWidth = 1; ctx.fillRect(-3, -18, 16, 7); ctx.strokeRect(-3, -18, 16, 7);
        ctx.beginPath(); ctx.arc(0, 0, 5, 0, TAU); ctx.fillStyle = '#63dff5'; ctx.fill();
        ctx.restore();
      }
    }
  }
  function drawEnemies() {
    for (const e of state.enemies) {
      ctx.save(); ctx.translate(e.x, e.y); const enemyRed = e.kind === 'boss' ? '#ff695f' : '#f07670';
      const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, e.r * 2.3); glow.addColorStop(0, e.hit ? 'rgba(255,255,255,.38)' : 'rgba(241,89,82,.12)'); glow.addColorStop(1, 'rgba(255,70,62,0)'); ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(0, 0, e.r * 2.3, 0, TAU); ctx.fill();
      if (e.kind === 'boss') {
        ctx.rotate(Math.sin(time * 1.2) * .04); ctx.fillStyle = e.hit ? '#ffe4df' : '#49252a'; ctx.strokeStyle = enemyRed; ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.moveTo(-26,-22); ctx.lineTo(-13,-31); ctx.lineTo(16,-29); ctx.lineTo(30,-15); ctx.lineTo(28,16); ctx.lineTo(12,28); ctx.lineTo(-19,25); ctx.lineTo(-30,9); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#1a1b22'; ctx.fillRect(-17,-9,34,10); ctx.fillStyle = '#ff534d'; ctx.shadowColor = '#ff5b56'; ctx.shadowBlur = 12; ctx.fillRect(-10,-6,20,4); ctx.shadowBlur = 0;
        ctx.strokeStyle = '#d86660'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-22,-20); ctx.lineTo(-35,-29); ctx.moveTo(22,-20); ctx.lineTo(35,-29); ctx.stroke();
      } else if (e.kind === 'scout') {
        ctx.rotate(e.side ? Math.PI : 0); ctx.fillStyle = e.hit ? '#fff' : '#503039'; ctx.strokeStyle = enemyRed; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-15,0); ctx.lineTo(-5,-9); ctx.lineTo(9,-7); ctx.lineTo(15,0); ctx.lineTo(6,8); ctx.lineTo(-8,7); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ff8b7b'; ctx.fillRect(1,-2,7,3); ctx.beginPath(); ctx.moveTo(-7,-8); ctx.lineTo(-13,-14); ctx.moveTo(7,7); ctx.lineTo(13,13); ctx.stroke();
      } else {
        ctx.rotate(e.side ? Math.PI : 0); ctx.fillStyle = e.hit ? '#fff' : '#432a31'; ctx.strokeStyle = enemyRed; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(-17,-12); ctx.lineTo(9,-12); ctx.lineTo(17,-6); ctx.lineTo(17,10); ctx.lineTo(7,15); ctx.lineTo(-13,12); ctx.lineTo(-18,5); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#221b22'; ctx.fillRect(-8,-8,14,9); ctx.fillStyle = '#ff8e80'; ctx.shadowColor = '#ff695f'; ctx.shadowBlur = 8; ctx.fillRect(-4,-5,9,3); ctx.shadowBlur = 0;
        ctx.fillStyle = '#ad625d'; ctx.fillRect(-13,13,5,4); ctx.fillRect(8,13,5,4);
      }
      // Health bar appears after damage and always on the boss.
      if (e.hp < e.maxHp || e.kind === 'boss') { const bw = e.kind === 'boss' ? 60 : 28; ctx.fillStyle = 'rgba(5,9,14,.9)'; ctx.fillRect(-bw/2, -e.r - 10, bw, 3); ctx.fillStyle = enemyRed; ctx.fillRect(-bw/2, -e.r - 10, bw * Math.max(0, e.hp / e.maxHp), 3); }
      ctx.restore();
    }
  }
  function drawProjectiles() {
    for (const p of state.bolts) {
      const color = p.team === 'enemy' ? '#ff655f' : '#b5f7ff'; ctx.save(); ctx.strokeStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 9; ctx.lineWidth = p.r * 1.4; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - (p.tx - p.x) * .035, p.y - (p.ty - p.y) * .035); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * .72, 0, TAU); ctx.fill(); ctx.restore();
    }
    for (const s of state.shots) { ctx.save(); ctx.strokeStyle = '#5feaff'; ctx.shadowColor = '#54e7ff'; ctx.shadowBlur = 12; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - 12, s.y + 2); ctx.stroke(); ctx.restore(); }
  }
  function drawHero() {
    const h = state.hero; ctx.save(); ctx.translate(h.x, h.y);
    const glow = ctx.createRadialGradient(0,0,2,0,0,42); glow.addColorStop(0,'rgba(63,211,240,.16)'); glow.addColorStop(1,'rgba(63,211,240,0)'); ctx.fillStyle=glow; ctx.beginPath();ctx.arc(0,0,42,0,TAU);ctx.fill();
    // Jedi robe silhouette and hood.
    ctx.fillStyle = '#0a1219'; ctx.strokeStyle = 'rgba(135,192,204,.65)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-12,13); ctx.lineTo(-8,1); ctx.lineTo(-10,-8); ctx.lineTo(-6,-15); ctx.lineTo(5,-16); ctx.lineTo(11,-8); ctx.lineTo(8,1); ctx.lineTo(14,14); ctx.lineTo(5,19); ctx.lineTo(-8,18); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0,-12,7,8,0,0,TAU); ctx.fillStyle='#19242b';ctx.fill();ctx.strokeStyle='rgba(180,212,218,.56)';ctx.stroke();
    ctx.strokeStyle='rgba(121,160,169,.48)';ctx.beginPath();ctx.moveTo(-1,-1);ctx.lineTo(2,14);ctx.stroke();
    // Activated cyan saber in hand.
    const saberA = h.facing > 0 ? -.8 : Math.PI + .8; const sx = Math.cos(saberA), sy = Math.sin(saberA);
    ctx.save();ctx.translate(h.facing > 0 ? 9 : -9,0);ctx.rotate(saberA);ctx.strokeStyle='rgba(105,239,255,.3)';ctx.lineWidth=7;ctx.shadowColor='#69efff';ctx.shadowBlur=14;ctx.beginPath();ctx.moveTo(1,0);ctx.lineTo(29,0);ctx.stroke();ctx.strokeStyle='#a5f8ff';ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(2,0);ctx.lineTo(28,0);ctx.stroke();ctx.strokeStyle='#e2ffff';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(8,0);ctx.lineTo(27,0);ctx.stroke();ctx.restore();
    // Auto-deflection radius, only shown as a subtle pulse when a bolt is nearby.
    const incoming = state.bolts.some(p => p.team === 'enemy' && Math.hypot(p.x-h.x,p.y-h.y)<70);
    if (incoming) { ctx.beginPath();ctx.arc(0,0,29+Math.sin(time*20)*2,0,TAU);ctx.strokeStyle='rgba(130,244,255,.55)';ctx.lineWidth=1;ctx.stroke(); }
    ctx.restore();
  }
  function drawEffects() {
    for (const p of state.pulses) { ctx.save(); ctx.globalAlpha = Math.max(0,p.life/.65); ctx.strokeStyle='#75efff';ctx.shadowColor='#5be5ff';ctx.shadowBlur=15;ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,TAU);ctx.stroke();ctx.beginPath();ctx.arc(p.x,p.y,p.r*.86,0,TAU);ctx.strokeStyle='rgba(156,247,255,.42)';ctx.lineWidth=1;ctx.stroke();ctx.restore(); }
    for (const p of state.particles) { ctx.globalAlpha = Math.min(1,p.life/p.max);ctx.fillStyle=p.color;ctx.shadowColor=p.color;ctx.shadowBlur=8;ctx.fillRect(p.x,p.y,p.size,p.size); }
    ctx.globalAlpha=1;ctx.shadowBlur=0;
    if (selectedBuild) { /* placement preview follows pointer via pointermove */ }
  }

  let pointer = { x: -100, y: -100 };
  canvas.addEventListener('pointermove', e => { const r = canvas.getBoundingClientRect(); pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top; });
  canvas.addEventListener('pointerdown', e => {
    if (state.phase !== 'battle') return;
    const r = canvas.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    if (selectedBuild) placeDefense(x, y); else { state.hero.tx = x; state.hero.ty = y; }
  });
  // Ghost placement preview.
  const drawOriginal = draw;
  function render() {
    drawOriginal();
    if (selectedBuild && state && state.phase === 'battle') {
      const x = pointer.x, y = pointer.y; ctx.save(); ctx.globalAlpha = .68; ctx.translate(x,y);
      if (selectedBuild === 'pylon') { ctx.beginPath();ctx.arc(0,0,126,0,TAU);ctx.strokeStyle='rgba(95,224,246,.4)';ctx.setLineDash([3,6]);ctx.stroke();ctx.setLineDash([]);ctx.rotate(time);ctx.strokeStyle='#8af2ff';ctx.beginPath();ctx.moveTo(0,-12);ctx.lineTo(10,0);ctx.lineTo(0,12);ctx.lineTo(-10,0);ctx.closePath();ctx.stroke(); }
      else { ctx.beginPath();ctx.arc(0,0,20,0,TAU);ctx.strokeStyle='#8af2ff';ctx.stroke();ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-24);ctx.stroke(); }
      ctx.restore();
    }
  }
  ui.pylon.addEventListener('click', () => selectBuild('pylon'));
  ui.turret.addEventListener('click', () => selectBuild('turret'));
  ui.forceBtn.addEventListener('click', forcePush);
  addEventListener('keydown', e => { if (e.key === '1') selectBuild('pylon'); if (e.key === '2') selectBuild('turret'); if (e.code === 'Space') { e.preventDefault(); forcePush(); } if (e.key === 'Escape') { selectedBuild = null; updateButtons(); } });
  function frame(now) { const dt = Math.min(.035, (now - last) / 1000 || 0); last = now; update(dt); render(); requestAnimationFrame(frame); }
  addEventListener('resize', resize); resize(); reset(); requestAnimationFrame(frame);
})();
