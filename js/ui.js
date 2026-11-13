// GREEN EMPIRE — interface, panels, story theatre, minigames.
import {
  STRAINS, STRAIN_BY_ID, PROPERTIES, PROPERTY_LIST, STAFF, STAFF_BY_ID,
  UPGRADES, UPGRADE_BY_ID, FRONTS, FRONT_BY_ID, BUFFS, PRICING, DAY_LENGTH,
  QUALITY_GRADES, gradeFor, rankFor
} from './data.js';
import { CHARACTERS } from './story.js';
import { MISSIONS } from './game.js';

const $ = id => document.getElementById(id);
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const pad2 = n => String(n).padStart(2, '0');
const money = n => {
  n = Math.max(0, Math.round(n || 0));
  if (n >= 1000000) return '$' + (n / 1000000).toFixed(n >= 10000000 ? 1 : 2) + 'M';
  if (n >= 10000) return '$' + (n / 1000).toFixed(n >= 100000 ? 0 : 1) + 'K';
  return '$' + n.toLocaleString('en-US');
};
const num = n => Math.round(n || 0).toLocaleString('en-US');
const ico = (name, cls = '') => `<svg class="${cls}"><use href="#i-${name}"/></svg>`;

export class UI {
  constructor(game, renderer, audio) {
    this.game = game;
    this.renderer = renderer;
    this.audio = audio;
    this.activePanel = null;
    this.modalType = null;
    this.syncTimer = 0;
    this.panelRefresh = 0;
    this.typeTimer = null;
    this.refineTimer = null;
    this.refineSession = null;
    this.confirmReset = false;
    this.storyView = null;
    this.splashDone = false;
    this.lastHoverId = null;
    this.pendingRaid = null;
    this.pointers = new Map();
    this.drag = null;
    this.pinch = null;
    this.cameraTipShown = false;
    this.bindBase();
    this.bindGame();
  }

  // ---------- boot & events ----------
  bindBase() {
    $('btnStart').addEventListener('click', () => this.startGame());
    $('dock').addEventListener('click', e => {
      const b = e.target.closest('.dock-btn');
      if (!b) return;
      this.audio?.click();
      if (b.dataset.action === 'story') this.openStory();
      else this.togglePanel(b.dataset.panel);
    });
    document.querySelectorAll('[data-panel]').forEach(el => {
      if (el.closest('.dock')) return;
      el.addEventListener('click', e => { e.preventDefault(); this.audio?.click(); this.openPanel(el.dataset.panel); });
    });
    $('panelClose').addEventListener('click', () => { this.audio?.click(); this.closePanel(); });
    $('panelBackdrop').addEventListener('click', () => this.closePanel());
    $('btnSound').addEventListener('click', () => this.toggleSound());
    $('modalRoot').addEventListener('click', e => {
      if (e.target === $('modalRoot') && this.modalType !== 'story') this.closeModal();
      const btn = e.target.closest('[data-act]');
      if (btn) this.modalAction(btn);
    });
    $('statCash').addEventListener('click', () => this.openPanel('laundry'));
    $('statStock').addEventListener('click', () => this.openPanel('grow'));
    $('statHeat').addEventListener('click', () => this.openPanel('heat'));
    $('statRep').addEventListener('click', () => this.openPanel('crew'));
    $('statDay').addEventListener('click', () => this.openPanel('settings'));
    $('missionStrip').addEventListener('click', () => this.openStory());
    $('camZoomIn').addEventListener('click', () => {
      this.audio?.click();
      this.renderer.zoomBy(1.22);
      this.syncCameraUi();
    });
    $('camZoomOut').addEventListener('click', () => {
      this.audio?.click();
      this.renderer.zoomBy(1 / 1.22);
      this.syncCameraUi();
    });
    $('camReset').addEventListener('click', () => {
      this.audio?.click();
      this.renderer.resetCamera();
      this.syncCameraUi();
    });
    this.bindCanvas();
    window.addEventListener('keydown', e => this.onKey(e));
    document.addEventListener('visibilitychange', () => { if (document.hidden) this.game.save(); });
  }

  bindGame() {
    const g = this.game;
    g.on('toast', d => this.toast(d.text, d.kind));
    g.on('raid', info => { this.closePanel(); this.openRaid(info); });
    g.on('betrayal', info => { this.closePanel(); this.openBetrayal(info); });
    g.on('event', ev => { this.closePanel(); this.openEvent(ev); });
    g.on('uiAction', d => {
      if (d.action === 'refine') this.openRefine();
      else if (d.action === 'panel') this.openPanel(d.panel);
    });
    g.on('propertyBought', () => { this.renderer.resize(); this.refreshPanel(); });
    g.on('property', () => { this.renderer.resize(); this.refreshPanel(); });
    g.on('ui', () => this.refreshPanel());
    window.addEventListener('resize', () => { this.renderer.resize(); });
  }

  startGame() {
    $('splash').classList.add('hidden');
    this.splashDone = true;
    this.game.setPaused(false);
    this.audio?.init();
    this.sync(0, true);
    const loaded = !!this.game.runtime.lastLoadSummary;
    setTimeout(() => {
      if (loaded && this.game.runtime.lastLoadSummary) { this.openOffline(this.game.runtime.lastLoadSummary); this.game.runtime.lastLoadSummary = null; }
      else if (!this.game.mission?.seen) this.openStory();
    }, 360);
  }

  bindCanvas() {
    const c = $('scene'), tip = $('sceneTip');
    const active = () => this.splashDone && !this.modalType && !this.activePanel;

    c.addEventListener('pointerdown', e => {
      if (!active()) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      try { c.setPointerCapture(e.pointerId); } catch {}
      this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      this.clearHover();
      if (this.pointers.size >= 2) {
        this.beginPinch();
        return;
      }
      this.drag = {
        id: e.pointerId, startX: e.clientX, startY: e.clientY,
        lastX: e.clientX, lastY: e.clientY, moved: false, panning: false
      };
      c.style.cursor = this.renderer.pick(e.clientX, e.clientY) ? 'pointer' : (this.renderer.canPan() ? 'grab' : 'default');
    });

    c.addEventListener('pointermove', e => {
      const tracked = this.pointers.get(e.pointerId);
      if (tracked) { tracked.x = e.clientX; tracked.y = e.clientY; }
      if (this.pointers.size >= 2) { this.updatePinch(); return; }

      if (this.drag && this.drag.id === e.pointerId) {
        const dx = e.clientX - this.drag.lastX;
        const dy = e.clientY - this.drag.lastY;
        this.drag.lastX = e.clientX; this.drag.lastY = e.clientY;
        const dist = Math.hypot(e.clientX - this.drag.startX, e.clientY - this.drag.startY);
        if (!this.drag.moved && dist > 7) {
          this.drag.moved = true;
          this.drag.panning = this.renderer.canPan();
          if (this.drag.panning) this.renderer.panBy(e.clientX - this.drag.startX, e.clientY - this.drag.startY);
          this.clearHover();
          c.style.cursor = this.drag.panning ? 'grabbing' : 'default';
          if (this.drag.panning) this.syncCameraUi();
          return;
        }
        if (this.drag.moved) {
          if (this.drag.panning) {
            this.renderer.panBy(dx, dy);
            this.syncCameraUi();
          }
          this.clearHover();
          c.style.cursor = this.drag.panning ? 'grabbing' : 'default';
          return;
        }
      }

      if (e.pointerType === 'touch') return;
      if (!active()) { this.clearHover(); return; }
      const hit = this.renderer.pick(e.clientX, e.clientY);
      if (hit) {
        this.renderer.hoverId = hit.id;
        this.lastHoverId = hit.id;
        c.style.cursor = 'pointer';
        tip.textContent = this.renderer.labelFor(hit);
        tip.style.left = e.clientX + 'px';
        tip.style.top = e.clientY + 'px';
        tip.classList.add('show');
      } else {
        this.clearHover();
        c.style.cursor = this.renderer.canPan() ? 'grab' : 'default';
      }
    });

    c.addEventListener('pointerup', e => {
      const wasPinch = !!this.pinch;
      const drag = this.drag && this.drag.id === e.pointerId ? this.drag : null;
      this.pointers.delete(e.pointerId);
      try { c.releasePointerCapture(e.pointerId); } catch {}
      if (wasPinch) {
        if (this.pointers.size < 2) this.pinch = null;
        if (this.pointers.size === 0) {
          this.drag = null;
          c.style.cursor = this.renderer.canPan() ? 'grab' : 'default';
        }
        this.syncCameraUi();
        return;
      }
      if (drag) {
        this.drag = null;
        if (!drag.moved && this.pointers.size === 0) this.handleCanvasTap(e);
        c.style.cursor = this.renderer.canPan() ? 'grab' : 'default';
        this.syncCameraUi();
      }
    });

    c.addEventListener('pointercancel', e => {
      this.pointers.delete(e.pointerId);
      if (this.pointers.size < 2) this.pinch = null;
      if (this.pointers.size === 0) {
        this.drag = null;
        this.clearHover();
      }
      this.syncCameraUi();
    });

    c.addEventListener('pointerleave', () => {
      if (!this.pointers.size) this.clearHover();
    });

    c.addEventListener('wheel', e => {
      if (!active()) return;
      e.preventDefault();
      const factor = Math.exp(-e.deltaY * .0014);
      if (this.renderer.zoomBy(factor, e.clientX, e.clientY)) {
        c.style.cursor = this.renderer.canPan() ? 'grab' : 'default';
        this.syncCameraUi();
      }
    }, { passive: false });
  }

  beginPinch() {
    const pts = [...this.pointers.values()];
    if (pts.length < 2) return;
    const a = pts[0], b = pts[1];
    this.pinch = {
      dist: Math.max(1, Math.hypot(b.x - a.x, b.y - a.y)),
      zoom: this.renderer.zoomFactor,
      midX: (a.x + b.x) / 2,
      midY: (a.y + b.y) / 2
    };
    this.drag = null;
    this.clearHover();
    $('scene').style.cursor = 'grabbing';
  }

  updatePinch() {
    const pts = [...this.pointers.values()];
    if (pts.length < 2) return;
    if (!this.pinch) { this.beginPinch(); return; }
    const a = pts[0], b = pts[1];
    const dist = Math.max(1, Math.hypot(b.x - a.x, b.y - a.y));
    const midX = (a.x + b.x) / 2, midY = (a.y + b.y) / 2;
    this.renderer.zoomTo(this.pinch.zoom * dist / this.pinch.dist, midX, midY);
    this.renderer.panBy(midX - this.pinch.midX, midY - this.pinch.midY);
    this.pinch.midX = midX;
    this.pinch.midY = midY;
    this.syncCameraUi();
  }

  handleCanvasTap(e) {
    const hit = this.renderer.pick(e.clientX, e.clientY);
    if (!hit) return;
    this.renderer.hoverId = hit.id;
    const before = hit.kind === 'slot' ? this.game.state.properties[hit.propId]?.slots[hit.index] : null;
    const res = this.game.interact(hit);
    if (hit.kind === 'customer') this.audio?.cash();
    else if (hit.kind === 'slot') {
      if (!before) this.audio?.plant();
      else if (before.progress >= 1) this.audio?.harvest();
      else this.audio?.water();
    }
    if (res && res.ok === false && res.msg) this.audio?.error();
    this.syncStats();
  }

  syncCameraUi() {
    const r = this.renderer;
    const zin = $('camZoomIn'), zout = $('camZoomOut'), fit = $('camReset');
    if (!zin || !zout || !fit) return;
    zin.disabled = r.zoomFactor >= r.maxZoomFactor - .001;
    zout.disabled = r.zoomFactor <= r.minZoomFactor + .001;
    const fitted = Math.abs(r.zoomFactor - 1) < .001 && Math.abs(r.panX) < .5 && Math.abs(r.panY) < .5;
    fit.disabled = fitted;
    fit.classList.toggle('active', !fitted);
    if (!fitted && r.canPan() && !this.cameraTipShown && this.splashDone) {
      this.cameraTipShown = true;
      this.toast('Drag the room to move the camera.', 'info');
    }
  }

  clearHover() {
    this.renderer.hoverId = null;
    this.lastHoverId = null;
    $('scene').style.cursor = 'default';
    $('sceneTip').classList.remove('show');
  }

  onKey(e) {
    if (e.key === 'Escape') {
      if (this.modalType) this.closeModal();
      else if (this.activePanel) this.closePanel();
      return;
    }
    if (this.modalType === 'story' && (e.key === 'Enter' || e.key === ' ')) {
      if (this.storyView?.mode === 'dialogue') { e.preventDefault(); this.advanceStory(); }
      else if (this.storyView?.mode === 'reply') { e.preventDefault(); this.finishReply(); }
    }
    if (this.activePanel || this.modalType || !this.splashDone) return;
    if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      this.renderer.zoomBy(1.18);
      this.syncCameraUi();
      return;
    }
    if (e.key === '-' || e.key === '_') {
      e.preventDefault();
      this.renderer.zoomBy(1 / 1.18);
      this.syncCameraUi();
      return;
    }
    if (e.key === '0') {
      e.preventDefault();
      this.renderer.resetCamera();
      this.syncCameraUi();
      return;
    }
    const panKeys = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    if (panKeys[e.key] && this.renderer.canPan()) {
      e.preventDefault();
      const [dx, dy] = panKeys[e.key];
      this.renderer.panBy(dx * 52, dy * 52);
      this.syncCameraUi();
      return;
    }
    const map = { '1': 'grow', '2': 'crew', '3': 'upgrades', '4': 'properties', '5': 'laundry', '6': 'story' };
    if (map[e.key]) {
      if (map[e.key] === 'story') this.openStory(); else this.togglePanel(map[e.key]);
    }
  }

  toggleSound() {
    const s = this.game.state.settings;
    s.sound = !s.sound;
    if (this.audio) this.audio.setEnabled(s.sound);
    $('soundIcon').setAttribute('href', s.sound ? '#i-sound-on' : '#i-sound-off');
    this.game.save();
    if (s.sound) this.audio?.init();
    this.syncStoryVoiceButton();
  }

  // ---------- periodic sync ----------
  sync(dt, force = false) {
    this.syncTimer += dt;
    if (!force && this.syncTimer > .22) {
      this.syncTimer = 0;
      this.syncStats();
      this.syncMission();
      this.syncHint();
      this.syncCameraUi();
      const voiceBtn = $('storyVoice');
      if (voiceBtn) voiceBtn.classList.toggle('speaking', !!this.audio?.speaking);
      $('storyBadge').classList.toggle('show', !this.game.mission?.seen || this.game.missionProgress()?.complete);
      if (this.activePanel === 'laundry' || this.activePanel === 'heat') {
        this.panelRefresh += .22;
        if (this.panelRefresh > 1.1) { this.panelRefresh = 0; this.refreshPanel(true); }
      }
    }
    if (force) { this.syncStats(); this.syncMission(); this.syncHint(); this.syncCameraUi(); }
    $('soundIcon').setAttribute('href', this.game.state.settings.sound ? '#i-sound-on' : '#i-sound-off');
  }

  syncStats() {
    const s = this.game.state;
    $('cashDirty').textContent = money(s.dirty);
    $('cashClean').textContent = 'clean ' + money(s.clean);
    const grams = this.game.stockGrams();
    const q = this.game.qualityAvg();
    $('stockValue').textContent = `${Math.floor(grams)}g`;
    $('stockQuality').textContent = grams ? `Q${Math.round(q)} · ${gradeFor(q).name}` : 'empty';
    $('repValue').textContent = Math.round(s.rep);
    $('repRank').textContent = rankFor(s.rep);
    $('heatValue').textContent = Math.round(s.heat) + '%';
    $('heatBar').style.width = clamp(s.heat, 0, 100) + '%';
    $('heatValue').style.color = s.heat > 70 ? '#ff8f86' : s.heat > 45 ? '#ffd27a' : '#ffb4a8';
    $('dayValue').textContent = 'D' + s.day;
    const h = this.game.hour;
    $('clockValue').textContent = `${pad2(Math.floor(h))}:${pad2(Math.floor((h % 1) * 60))}`;
    $('statHeat').title = `Police heat: ${this.game.heatLabel()}`;
  }

  syncMission() {
    const m = this.game.mission;
    const strip = $('missionStrip');
    if (!m) {
      $('missionKicker').textContent = 'ENDGAME';
      $('missionTitle').textContent = 'The city is yours';
      $('missionObj').textContent = 'Keep building. Buy fronts, expand, survive.';
      $('missionBar').style.width = '100%';
      $('storyBadge').classList.remove('show');
      strip.classList.remove('ready');
      return;
    }
    const p = this.game.missionProgress();
    $('missionKicker').textContent = `MISSION ${pad2(this.game.state.story.idx + 1)}`;
    $('missionTitle').textContent = m.title;
    $('missionObj').textContent = `${m.objective.label} · ${Math.floor(p.current)}/${p.target}`;
    $('missionBar').style.width = (p.pct * 100) + '%';
    strip.classList.toggle('ready', p.complete);
  }

  syncHint() {
    const hint = $('hintBar'), txt = $('hintText');
    const g = this.game, s = g.state;
    if (!s.settings.hints || this.modalType || this.activePanel || !this.splashDone) { hint.classList.add('hidden'); return; }
    const slots = g.propState.slots;
    const ready = slots.some(x => x && x.progress >= 1);
    const empty = slots.filter(x => !x).length;
    const wait = g.runtime.customers.some(c => c.state === 'wait');
    let text = '';
    if (this.renderer.shake > 0) text = 'The police are inside. Let them leave.';
    else if (ready) text = 'A plant is ready — tap it to harvest.';
    else if (wait) text = 'Tap a customer to serve them.';
    else if (empty && g.state.dirty >= STRAIN_BY_ID[g.selectedStrainId()].cost) text = 'Tap an empty pot to plant another seed.';
    else if (s.heat > 72) text = 'Heat is critical. Open HEAT to bribe or lay low.';
    else if (g.stockGrams() > 0) text = 'Product ready. Customers are on the way — tap them before they leave.';
    else if (!g.mission?.seen && g.mission) text = 'New story mission available. Open STORY.';
    else text = 'Tend plants for bonus quality. Upgrade gear to grow faster.';
    txt.textContent = text;
    hint.classList.remove('hidden');
  }

  // ---------- toasts ----------
  toast(text, kind = 'info') {
    if (!text) return;
    const root = $('toasts');
    const el = document.createElement('div');
    el.className = `toast ${kind}`;
    el.textContent = text;
    root.appendChild(el);
    while (root.children.length > 4) root.firstElementChild.remove();
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 320); }, 3800);
  }

  // ---------- panels ----------
  togglePanel(name) { this.openPanel(this.activePanel === name ? null : name); }

  openPanel(name) {
    if (!name) return this.closePanel();
    if (this.modalType) return;
    this.activePanel = name;
    this.game.setPaused(true);
    const meta = {
      grow: ['OPERATIONS', 'Grow Room'], crew: ['THE CREW', 'People & Payroll'],
      upgrades: ['EQUIPMENT', 'Upgrade Bench'], properties: ['REAL ESTATE', 'The Empire'],
      laundry: ['MONEY', 'Laundry & Fronts'], heat: ['RISK', 'Heat & Police'], settings: ['SYSTEM', 'Settings']
    };
    $('panelKicker').textContent = meta[name]?.[0] || 'MENU';
    $('panelTitle').textContent = meta[name]?.[1] || name;
    $('panelSub').textContent = this.panelSub(name);
    $('panelBody').innerHTML = this.panelHTML(name);
    $('panel').classList.add('open');
    $('panelBackdrop').classList.add('open');
    this.bindPanelBody();
    document.querySelectorAll('.dock-btn').forEach(b => b.classList.toggle('active', b.dataset.panel === name));
    this.syncHint();
  }

  closePanel() {
    this.activePanel = null;
    $('panel').classList.remove('open');
    $('panelBackdrop').classList.remove('open');
    document.querySelectorAll('.dock-btn').forEach(b => b.classList.remove('active'));
    if (!this.modalType) this.game.setPaused(false);
    this.syncHint();
    this.renderer.resize();
  }

  refreshPanel(preserve = false) {
    if (!this.activePanel) return;
    const body = $('panelBody');
    const scroll = body.scrollTop;
    if (!preserve) $('panelSub').textContent = this.panelSub(this.activePanel);
    body.innerHTML = this.panelHTML(this.activePanel);
    this.bindPanelBody();
    if (preserve) body.scrollTop = scroll;
  }

  panelSub(name) {
    const g = this.game, s = g.state;
    if (name === 'grow') return `${g.propConfig.name} · ${g.propState.slots.filter(Boolean).length}/${g.propState.slots.length} pots growing`;
    if (name === 'crew') return `${s.staff.length} on payroll · ${money(g.wageTotal)}/day`;
    if (name === 'upgrades') return `${g.propConfig.name} · equipment levels`;
    if (name === 'properties') return `${PROPERTY_LIST.filter(p => s.properties[p.id].owned).length}/${PROPERTY_LIST.length} properties owned`;
    if (name === 'laundry') return `${s.fronts.length} fronts · clean cash buys legitimacy`;
    if (name === 'heat') return `${g.heatLabel()} · ${Math.round(s.heat)}% police interest`;
    if (name === 'settings') return 'Save, sound, hints and the nuclear option';
    return '';
  }

  bindPanelBody() {
    $('panelBody').addEventListener('click', e => {
      const el = e.target.closest('[data-act]');
      if (!el) return;
      this.panelAction(el.dataset.act, el.dataset, el);
    }, { once: true });
  }

  panelAction(act, data, el) {
    const g = this.game;
    this.audio?.click();
    if (act === 'select') { g.selectStrain(data.id); this.refreshPanel(); }
    else if (act === 'pricing') { g.state.pricing = data.id; g.save(); this.refreshPanel(); }
    else if (act === 'replant') { g.replantAll(); this.refreshPanel(); }
    else if (act === 'buff') {
      const r = g.buyBuff(data.id);
      if (!r.ok) { this.toast(r.msg || 'Cannot buy that.', 'warn'); this.audio?.error(); }
      else { this.toast(`${r.b.name} active for 3 harvests.`, 'good'); this.refreshPanel(); }
    }
    else if (act === 'refine') { this.closePanel(); this.openRefine(data.id); }
    else if (act === 'hire') {
      const r = g.hireStaff(data.id);
      if (!r.ok) { this.toast(r.msg || 'Cannot hire.', 'warn'); this.audio?.error(); }
      else { this.toast(`${r.staff.name} joined the crew.`, 'good'); this.audio?.success(); this.renderer.sparkleScreen(); this.refreshPanel(); }
    }
    else if (act === 'upgrade') {
      const r = g.buyUpgrade(g.state.activeProperty, data.id);
      if (!r.ok) { this.toast(r.msg || 'Cannot upgrade.', 'warn'); this.audio?.error(); }
      else { this.toast(`${UPGRADE_BY_ID[data.id].name} upgraded.`, 'good'); this.audio?.success(); this.refreshPanel(); }
    }
    else if (act === 'buyprop') {
      const r = g.buyProperty(data.id);
      if (!r.ok) { this.toast(r.msg || 'Cannot buy.', 'warn'); this.audio?.error(); }
      else { this.toast(r.moved ? `Moved to ${PROPERTIES[data.id].name}.` : `Bought ${PROPERTIES[data.id].name}.`, 'good'); this.audio?.success(); this.renderer.sparkleScreen(); this.renderer.resize(); this.refreshPanel(); }
    }
    else if (act === 'visit') { g.moveProperty(data.id); this.toast(`Moved to ${PROPERTIES[data.id].name}.`, 'info'); this.renderer.resize(); this.refreshPanel(); }
    else if (act === 'launder') {
      const r = g.launder(data.amount === 'all' ? 'all' : Number(data.amount));
      if (!r.ok) { this.toast(r.msg || 'Cannot launder.', 'warn'); this.audio?.error(); }
      else { this.toast(`Washed ${money(r.amount)} → ${money(r.cleanGain)} clean.`, 'good'); this.audio?.cash(); this.refreshPanel(); }
    }
    else if (act === 'front') {
      const r = g.buyFront(data.id);
      if (!r.ok) { this.toast(r.msg || 'Cannot buy front.', 'warn'); this.audio?.error(); }
      else { this.toast(`${r.f.name} acquired. The money has a porch now.`, 'good'); this.audio?.success(); this.renderer.sparkleScreen(); this.refreshPanel(); }
    }
    else if (act === 'bribe') {
      const r = g.bribe();
      if (!r.ok) { this.toast(r.msg || 'No one is buying.', 'warn'); this.audio?.error(); }
      else { this.toast(`Bribed the precinct. Heat -26%.`, 'good'); this.audio?.cash(); this.refreshPanel(); }
    }
    else if (act === 'laylow') {
      g.layLow(50);
      this.toast('Lights out for 50 seconds. No customers, less heat.', 'info');
      this.refreshPanel();
    }
    else if (act === 'settingsSound') { this.toggleSound(); this.refreshPanel(); }
    else if (act === 'settingsVoice') {
      const s = g.state.settings;
      s.voice = s.voice === false;
      if (!s.voice) this.audio?.stopSpeaking();
      else this.audio?.primeSpeech();
      g.save(); this.refreshPanel();
      this.syncStoryVoiceButton();
    }
    else if (act === 'settingsHints') { g.state.settings.hints = !g.state.settings.hints; g.save(); this.refreshPanel(); }
    else if (act === 'save') { g.save(); this.toast('Empire saved locally.', 'good'); this.audio?.success(); }
    else if (act === 'reset1') { this.confirmReset = true; this.refreshPanel(); }
    else if (act === 'reset2') {
      g.save();
      localStorage.removeItem('greenEmpire.save.v2');
      g.freshStart();
      this.closePanel();
      location.reload();
    }
  }

  // ---------- panel templates ----------
  panelHTML(name) {
    if (name === 'grow') return this.growHTML();
    if (name === 'crew') return this.crewHTML();
    if (name === 'upgrades') return this.upgradesHTML();
    if (name === 'properties') return this.propertiesHTML();
    if (name === 'laundry') return this.laundryHTML();
    if (name === 'heat') return this.heatHTML();
    if (name === 'settings') return this.settingsHTML();
    return '';
  }

  growHTML() {
    const g = this.game, s = g.state, p = g.propState;
    const strain = STRAIN_BY_ID[g.selectedStrainId()];
    const lots = Object.entries(s.inventory).filter(([, l]) => l?.g > 0)
      .sort((a, b) => (STRAIN_BY_ID[b[0]]?.price || 0) - (STRAIN_BY_ID[a[0]]?.price || 0));
    const invHTML = lots.length ? lots.map(([id, lot]) => {
      const st = STRAIN_BY_ID[id];
      const grade = gradeFor(lot.q);
      return `<div class="inv-row">
        <span class="dot" style="background:${st.color}"></span>
        <div class="grow"><div class="between"><b class="small">${st.name}</b><span class="small gold">${lot.g.toFixed(0)}g</span></div>
        <div class="between" style="margin-top:2px"><span class="tiny" style="color:${grade.color}">Q${Math.round(lot.q)} ${grade.name}</span><span class="tiny muted">${money(lot.g * g.sellPrice(id, lot.q, 1))}</span></div></div>
        ${g.canRefine() && lot.g >= 10 ? `<button class="btn small ghost" data-act="refine" data-id="${id}">REFINE</button>` : ''}
      </div>`;
    }).join('') : `<div class="empty">${ico('leaf')}No product in stock.<br>Plant a seed and harvest.</div>`;

    const strains = STRAINS.map(st => {
      const locked = !g.strainUnlocked(st.id);
      const active = g.selectedStrainId() === st.id;
      return `<div class="strain-card ${active ? 'active' : ''} ${locked ? 'locked' : ''}" ${locked ? '' : `data-act="select" data-id="${st.id}"`}>
        <span class="strain-swatch" style="background:${st.color}"></span>
        <div class="strain-main">
          <div class="strain-name">${st.name} ${active ? `<span class="chip green">SELECTED</span>` : ''}</div>
          <div class="strain-desc">${st.desc}</div>
          <div class="strain-stats"><span class="chip">${st.growTime}s</span><span class="chip">~${st.yield}g</span><span class="chip">base Q${st.quality}</span><span class="chip gold">$${st.price}/g</span></div>
        </div>
        <div class="strain-side">${locked ? `<span class="chip"><svg style="width:10px;height:10px"><use href="#i-lock"/></svg> STORY</span><span class="strain-lock">UNLOCKS LATER</span>` : `<span class="strain-cost">$${st.cost}</span><span class="strain-lock">SEED</span>`}</div>
      </div>`;
    }).join('');

    const buff = s.buff ? (() => {
      const b = BUFFS.find(x => x.id === s.buff.id);
      return `<div class="card" style="border-color:${b.color}55"><div class="between"><div><div class="small" style="font-weight:800;color:${b.color}">${b.name} ACTIVE</div><div class="tiny muted">${b.desc}</div></div><span class="chip" style="color:${b.color}">${s.buff.charges} HARVESTS</span></div></div>`;
    })() : BUFFS.map(b => `<div class="card" style="padding:9px 10px"><div class="between"><div><div class="small" style="font-weight:800">${b.name}</div><div class="tiny muted">${b.desc}</div></div><button class="btn small ghost" data-act="buff" data-id="${b.id}">$${b.cost}</button></div></div>`).join('');

    return `
      <div class="sec-title">INVENTORY <em>${Math.floor(g.stockGrams())}g · ${money(g.stockGrams() * (lots.length ? g.sellPrice(lots[0][0], lots[0][1].q, 1) : 0))}</em></div>
      <div class="card">${invHTML}</div>

      <div class="sec-title">STRAIN LIBRARY <em>tap to select</em></div>
      ${strains}

      <div class="sec-title">SEED & PLANT <em>${s.freePlantings ? s.freePlantings + ' free plantings' : ''}</em></div>
      <div class="card">
        <div class="between"><div><div class="small" style="font-weight:800">Selected: ${strain.name}</div><div class="tiny muted">${p.slots.filter(x => !x).length} empty pots · seed $${strain.cost}</div></div>
        <button class="btn small" data-act="replant">REPLANT ALL</button></div>
      </div>

      <div class="sec-title">NUTRIENTS <em>one at a time</em></div>
      ${buff}

      <div class="sec-title">PRICING STRATEGY <em>applies city-wide</em></div>
      <div class="price-grid">
        ${Object.entries(PRICING).map(([id, pr]) => `<button class="price-opt ${s.pricing === id ? 'active' : ''}" data-act="pricing" data-id="${id}"><b>${pr.name}</b>${(pr.mod * 100 - 100 >= 0 ? '+' : '')}${Math.round((pr.mod - 1) * 100)}% cash<span>${pr.rep >= 1 ? '+rep' : '-rep'}</span></button>`).join('')}
      </div>
      <p class="tiny muted" style="margin-top:8px;line-height:1.5">${PRICING[s.pricing].note} Higher prices raise heat faster.</p>
      ${g.canRefine() ? `<button class="btn ghost wide" style="margin-top:12px" data-act="refine">${ico('flask')} OPEN CHEM STATION</button>` : ''}
    `;
  }

  crewHTML() {
    const g = this.game, s = g.state;
    const locked = !g.staffUnlocked();
    const nextPay = Math.max(0, DAY_LENGTH - s.dayTime);
    const staff = STAFF.map(st => {
      const hired = s.staff.includes(st.id);
      return `<div class="card"><div class="staff-card">
        <div class="avatar" style="background:${st.color}">${st.name[0]}</div>
        <div class="staff-info">
          <div class="staff-name">${st.name} <span class="role">${st.role}</span></div>
          <div class="staff-desc">${st.desc}</div>
          <div class="row" style="margin-top:5px"><span class="chip" style="color:${st.color}">${st.power}</span><span class="wage">$${st.wage}/day</span></div>
        </div>
        ${hired ? '<span class="chip green">HIRED</span>' : `<button class="btn small" data-act="hire" data-id="${st.id}" ${locked ? 'disabled' : ''}>$${st.cost}</button>`}
      </div></div>`;
    }).join('');
    return `
      ${locked ? `<div class="card" style="border-color:rgba(255,207,107,.3)"><div class="small" style="font-weight:800">🔒 Crew unlocks after the garage</div><div class="tiny muted">Advance the story to hire people. They automate the boring parts.</div></div>` : ''}
      <div class="card"><div class="between">
        <div><div class="mini-label">DAILY PAYROLL</div><div style="font-size:18px;font-weight:900">${money(g.wageTotal)}</div></div>
        <div style="text-align:right"><div class="mini-label">NEXT PAYDAY</div><div class="small gold">${Math.floor(nextPay / 60)}m ${pad2(Math.floor(nextPay % 60))}s</div></div>
      </div></div>
      <div class="sec-title">AVAILABLE CREW <em>${s.staff.length} hired</em></div>
      ${staff}
      <div class="card"><div class="tiny muted">Wages are taken from dirty cash at daybreak. If you can't pay, they walk. Auto-harvest and auto-sell keep working while you're here — and plants keep growing while you're away.</div></div>
    `;
  }

  upgradesHTML() {
    const g = this.game, p = g.propConfig, ps = g.propState;
    const list = UPGRADES.map(u => {
      const lvl = ps.upgrades[u.id] || 0;
      const maxed = lvl >= u.max;
      const cost = g.upgradeCost(u.id, lvl);
      return `<div class="card"><div class="upg-card">
        <div class="upg-icon">${ico(u.icon)}</div>
        <div class="grow"><div class="between"><div class="small" style="font-weight:800">${u.name}</div><span class="tiny muted">Lv ${lvl}/${u.max}</span></div>
        <div class="tiny muted">${u.desc}</div>
        <div class="pips">${Array.from({ length: u.max }, (_, i) => `<i class="${i < lvl ? 'on' : ''}"></i>`).join('')}</div></div>
        ${maxed ? '<span class="chip green">MAX</span>' : `<button class="btn small" data-act="upgrade" data-id="${u.id}">$${num(cost)}</button>`}
      </div></div>`;
    }).join('');
    const light = ps.upgrades.lights * 12 + Math.round(p.growthMod * 100);
    const qmod = ps.upgrades.vent * 4 + ps.upgrades.irrigation * 2 + p.qualityMod;
    const price = Math.round((p.priceMod * (1 + ps.upgrades.counter * .07) * 100 - 100));
    return `
      <div class="card"><div class="between"><div><div class="mini-label">FACILITY</div><div class="small" style="font-weight:800">${p.name}</div></div><span class="chip green">OWNED</span></div>
        <div class="row" style="gap:5px;flex-wrap:wrap;margin-top:8px"><span class="chip">+${light}% growth</span><span class="chip">+${qmod} quality</span><span class="chip">+${price}% prices</span></div>
      </div>
      <div class="sec-title">EQUIPMENT <em>upgrades apply to this property</em></div>
      ${list}
      <p class="tiny muted" style="line-height:1.5;margin-top:6px">Each property has its own equipment. Better properties start with stronger bonuses and more pots.</p>
    `;
  }

  propertiesHTML() {
    const g = this.game, s = g.state;
    const cards = PROPERTY_LIST.map((p, i) => {
      const ps = s.properties[p.id];
      const owned = ps.owned;
      const active = s.activeProperty === p.id;
      const available = g.propertyAvailable(p.id);
      const canBuy = !owned && available && s.clean >= p.cost;
      const pal = p.palette;
      return `<div class="card prop-card" style="${active ? 'border-color:rgba(200,255,110,.45)' : ''}">
        <div class="prop-visual" style="background:linear-gradient(135deg, ${pal.wallR} 0%, ${pal.floorA} 55%, #0a100d 100%)">
          <div class="tags">${active ? '<span class="chip green">YOU ARE HERE</span>' : owned ? '<span class="chip">OWNED</span>' : available ? `<span class="chip gold">$${num(p.cost)} CLEAN</span>` : `<span class="chip red"><svg style="width:9px;height:9px"><use href="#i-lock"/></svg> STORY LOCKED</span>`}</div>
        </div>
        <div class="prop-body">
          <div class="between"><div><div class="prop-title">${p.name}</div><div class="tiny muted">${p.act} · ${p.short}</div></div><span class="chip">${p.slots.length} POTS</span></div>
          <div class="prop-sub">${p.tagline}</div>
          <div class="prop-stats"><span class="chip">+${Math.round(p.priceMod * 100 - 100)}% prices</span><span class="chip">+${Math.round(p.growthMod * 100)}% growth</span><span class="chip">+${p.qualityMod} quality</span><span class="chip">+${Math.round(p.yieldMod * 100)}% yield</span></div>
          <div class="prop-foot">
            <span class="tiny muted">${owned ? 'Equipment ready' : available ? 'Requires clean cash' : 'Advance the story'}</span>
            ${owned ? (active ? '<span class="chip green">CURRENT</span>' : `<button class="btn small ghost" data-act="visit" data-id="${p.id}">VISIT</button>`) : `<button class="btn small" data-act="buyprop" data-id="${p.id}" ${canBuy ? '' : 'disabled'}>${available ? `BUY $${num(p.cost)}` : `MISSION ${p.reqMission + 1}`}</button>`}
          </div>
        </div>
      </div>`;
    }).join('');
    return `<div class="card"><div class="between"><div><div class="mini-label">EMPIRE VALUE</div><div style="font-size:19px;font-weight:900">${money(g.netWorth())}</div></div><div style="text-align:right"><div class="mini-label">CLEAN CASH</div><div class="green" style="font-size:15px;font-weight:800">${money(s.clean)}</div></div></div>
      <div class="tiny muted" style="margin-top:6px">Properties must be bought with clean cash. Dirty cash needs laundering first.</div></div>
      <div class="sec-title">PROPERTIES <em>${PROPERTY_LIST.filter(p => s.properties[p.id].owned).length}/${PROPERTY_LIST.length} owned</em></div>
      ${cards}`;
  }

  laundryHTML() {
    const g = this.game, s = g.state;
    const rate = Math.round((.72 + (s.fronts.includes('legal') ? .06 : 0)) * 100);
    const auto = s.fronts.reduce((n, id) => n + (FRONT_BY_ID[id]?.rate || 0), 0);
    const fronts = FRONTS.map(f => {
      const owned = s.fronts.includes(f.id);
      const locked = s.story.idx < f.req;
      return `<div class="card"><div class="front-card">
        <div class="front-icon">${f.id === 'legal' ? '⚖️' : f.id === 'carwash' ? '🚗' : f.id === 'chicken' ? '🍗' : '🍸'}</div>
        <div class="grow"><div class="between"><div class="small" style="font-weight:800">${f.name}</div>${owned ? '<span class="chip green">OWNED</span>' : ''}</div>
        <div class="tiny muted">${f.kind} · ${f.desc}</div>
        <div class="row" style="margin-top:5px;flex-wrap:wrap"><span class="chip gold">${f.tag}</span>${f.rep ? `<span class="chip green">+${f.rep} rep</span>` : ''}</div></div>
        ${!owned ? `<button class="btn small" data-act="front" data-id="${f.id}" ${locked || s.clean < f.cost ? 'disabled' : ''}>$${num(f.cost)}</button>` : ''}
      </div></div>`;
    }).join('');
    return `
      <div class="laundry-hero">
        <div style="flex:1"><div class="mini-label">DIRTY CASH</div><div class="laundry-money dirty">${money(s.dirty)}</div></div>
        <div class="swap-arrow" style="font-size:18px">→</div>
        <div style="flex:1;text-align:right"><div class="mini-label">CLEAN CASH</div><div class="laundry-money clean">${money(s.clean)}</div></div>
      </div>
      <div class="card">
        <div class="between"><div><div class="small" style="font-weight:800">Manual wash · ${rate}% return</div><div class="tiny muted">Laundering cools police interest.</div></div><span class="chip">${s.fronts.includes('legal') ? 'LAWYER +6%' : 'NO LAWYER'}</span></div>
        <div class="btn-row" style="margin-top:9px">
          <button class="btn small ghost" data-act="launder" data-amount="500" ${s.dirty < 500 ? 'disabled' : ''}>WASH $500</button>
          <button class="btn small ghost" data-act="launder" data-amount="2500" ${s.dirty < 2500 ? 'disabled' : ''}>WASH $2.5K</button>
          <button class="btn small" data-act="launder" data-amount="all" ${s.dirty < 10 ? 'disabled' : ''}>WASH ALL</button>
        </div>
      </div>
      <div class="card"><div class="between"><div><div class="mini-label">AUTOMATIC LAUNDERING</div><div class="small" style="font-weight:800">${auto ? `$${num(auto)} dirty / minute` : 'No fronts owned'}</div></div><div style="text-align:right"><div class="mini-label">FRONTS</div><div class="small">${s.fronts.length}</div></div></div>
      <div class="tiny muted" style="margin-top:5px">Fronts wash money passively while you play and while you're away. They also make the city respect you.</div></div>
      <div class="sec-title">LEGITIMATE FRONTS <em>clean cash only</em></div>
      ${fronts}
      <div class="card"><div class="tiny muted">Clean cash buys properties and fronts. Dirty cash buys seeds, upgrades and wages. Keep both moving, or the empire stalls.</div></div>
    `;
  }

  heatHTML() {
    const g = this.game, s = g.state;
    const bribe = g.bribeCost();
    const sec = g.propState.upgrades.security;
    const cooling = (0.1 + (s.fronts.includes('legal') ? .2 : 0) + sec * .02).toFixed(2);
    const stateCol = s.heat > 75 ? 'red' : s.heat > 45 ? 'gold' : 'green';
    return `
      <div class="card">
        <div class="between"><div><div class="mini-label">POLICE INTEREST</div><div style="font-size:26px;font-weight:900" class="${stateCol}">${Math.round(s.heat)}%</div></div><span class="chip ${stateCol}">${g.heatLabel()}</span></div>
        <div class="heat-gauge"><i style="width:${clamp(s.heat, 0, 100)}%"></i></div>
        <div class="heat-scale"><span>INVISIBLE</span><span>WATCHED</span><span>RAID</span></div>
        <div class="tiny muted" style="margin-top:8px;line-height:1.5">Sales raise heat. Property raids start at 100%. At 100%, police seize cash and stock and one plant is destroyed.</div>
      </div>
      <div class="card">
        <div class="between"><div><div class="small" style="font-weight:800">Bribe the precinct</div><div class="tiny muted">Heat -26% instantly. Cost scales with heat.</div></div><button class="btn small" data-act="bribe" ${s.heat < 6 || s.dirty < bribe ? 'disabled' : ''}>$${num(bribe)}</button></div>
      </div>
      <div class="card">
        <div class="between"><div><div class="small" style="font-weight:800">Lay low</div><div class="tiny muted">No customers for 50s. Heat -9%. Lets the room cool.</div></div><button class="btn small ghost" data-act="laylow">LAY LOW</button></div>
      </div>
      <div class="sec-title">YOUR DEFENCES</div>
      <div class="card"><div class="row" style="gap:6px;flex-wrap:wrap"><span class="chip">Cooling ${cooling}%/s</span><span class="chip">Security Lv ${sec}</span><span class="chip ${s.staff.includes('bruno') ? 'green' : ''}">${s.staff.includes('bruno') ? 'BRUNO ON DUTY' : 'NO MUSCLE'}</span><span class="chip gold">${s.stats.raids} raids survived</span></div>
        <div class="tiny muted" style="margin-top:7px">Upgrade Security in the Upgrades panel and hire Bruno to reduce heat gain and raid losses.</div></div>
      <div class="card"><div class="tiny muted">Tip: Laundering $500+ lowers heat. A lawyer on retainer cools the city passively.</div></div>
    `;
  }

  settingsHTML() {
    const g = this.game, s = g.state;
    const played = Math.floor(s.stats.played / 60);
    return `
      <div class="card"><div class="between"><div><div class="small" style="font-weight:800">Manual save</div><div class="tiny muted">Autosaves every 12 seconds.</div></div><button class="btn small" data-act="save">SAVE NOW</button></div></div>
      <div class="card"><div class="between"><div><div class="small" style="font-weight:800">Sound</div><div class="tiny muted">Synth clicks, cash and sirens.</div></div><button class="toggle ${s.settings.sound ? 'on' : ''}" data-act="settingsSound" aria-label="Toggle sound"></button></div></div>
      <div class="card"><div class="between"><div><div class="small" style="font-weight:800">Character voices</div><div class="tiny muted">${this.audio?.ttsSupported ? 'Browser speech reads story dialogue. Uses the sound setting.' : 'Speech is not supported in this browser.'}</div></div>${this.audio?.ttsSupported ? `<button class="toggle ${s.settings.voice !== false ? 'on' : ''}" data-act="settingsVoice" aria-label="Toggle character voices"></button>` : `<span class="chip">UNAVAILABLE</span>`}</div></div>
      <div class="card"><div class="between"><div><div class="small" style="font-weight:800">Hints</div><div class="tiny muted">Contextual tips above the dock.</div></div><button class="toggle ${s.settings.hints ? 'on' : ''}" data-act="settingsHints" aria-label="Toggle hints"></button></div></div>
      <div class="card"><div><div class="small" style="font-weight:800">Camera</div><div class="tiny muted">Scroll or pinch to zoom. Drag the room to pan. Press 0 or use the corner button to reset.</div></div></div>
      <div class="sec-title">EMPIRE RECORD</div>
      <div class="card">
        <div class="between"><span class="tiny muted">Net worth</span><span class="small green">${money(g.netWorth())}</span></div>
        <div class="between" style="margin-top:5px"><span class="tiny muted">Time played</span><span class="small">${played}m</span></div>
        <div class="between" style="margin-top:5px"><span class="tiny muted">Plants harvested</span><span class="small">${s.stats.harvests}</span></div>
        <div class="between" style="margin-top:5px"><span class="tiny muted">Grams sold</span><span class="small">${Math.floor(s.stats.sold)}g</span></div>
        <div class="between" style="margin-top:5px"><span class="tiny muted">Lifetime earnings</span><span class="small gold">${money(s.stats.earned)}</span></div>
        <div class="between" style="margin-top:5px"><span class="tiny muted">Raids survived</span><span class="small red">${s.stats.raids}</span></div>
      </div>
      <div class="sec-title">DANGER ZONE</div>
      <div class="card" style="border-color:rgba(255,112,112,.22)">
        <div class="between"><div><div class="small" style="font-weight:800">Start over</div><div class="tiny muted">Deletes your save, cash, properties and story progress.</div></div>
          ${this.confirmReset ? '<button class="btn small danger" data-act="reset2">CONFIRM WIPE</button>' : '<button class="btn small ghost" data-act="reset1">RESET</button>'}
        </div>
        ${this.confirmReset ? '<div class="tiny red" style="margin-top:6px">This cannot be undone. Click CONFIRM WIPE to erase everything.</div>' : ''}
      </div>
      <p class="tiny muted" style="line-height:1.5;margin-top:10px">GREEN EMPIRE v1.0 · An original fictional crime saga. 18+ themes. Built as a single-page game; save data lives in your browser.</p>
    `;
  }

  // ---------- story theatre ----------
  setModal(html, type) {
    $('modalRoot').innerHTML = `<div class="modal-inner">${html}</div>`;
    $('modalRoot').classList.add('open');
    this.modalType = type;
    this.game.setPaused(true);
    this.syncHint();
  }

  closeModal() {
    if (this.typeTimer) { clearInterval(this.typeTimer); this.typeTimer = null; }
    if (this.refineTimer) { clearInterval(this.refineTimer); this.refineTimer = null; }
    this.refineSession = null;
    $('modalRoot').classList.remove('open');
    this.modalType = null;
    this.storyView = null;
    this.audio?.stopSpeaking();
    if (!this.activePanel) this.game.setPaused(false);
    this.syncHint();
  }

  modalAction(btn) {
    const act = btn.dataset.act;
    if (act === 'storyClose') { this.closeModal(); return; }
    if (act === 'storyAdvance') { this.advanceStory(); return; }
    if (act === 'storyReplayLine') { this.replayStoryLine(); return; }
    if (act === 'storyChoice') { this.chooseStory(Number(btn.dataset.index)); return; }
    if (act === 'storyClaim') { this.claimMission(); return; }
    if (act === 'storyReplay') { this.startStoryDialogue(this.game.mission, true); return; }
    if (act === 'eventChoice') { this.chooseEvent(Number(btn.dataset.index)); return; }
    if (act === 'eventClose') { this.closeModal(); return; }
    if (act === 'raidClose' || act === 'endingClose' || act === 'offlineClose') { this.closeModal(); return; }
    if (act === 'endingReset') { this.closeModal(); this.openPanel('settings'); return; }
    if (act === 'refinePick') { this.startRefine(btn.dataset.id); return; }
    if (act === 'refineGo') { this.resolveRefine(false); return; }
    if (act === 'refineAuto') { this.resolveRefine(true); return; }
    if (act === 'refineDone') { this.closeModal(); if (this.activePanel) this.refreshPanel(); return; }
    if (act === 'refineCancel') { this.closeModal(); return; }
  }

  openStory() {
    const g = this.game;
    if (this.modalType) return;
    if (this.activePanel) this.closePanel();
    const m = g.mission;
    if (!m) { this.openStoryComplete(); return; }
    this.audio?.click();
    if (!g.state.story.seen) this.startStoryDialogue(m);
    else this.showStorySummary(m);
  }

  storyShell(m) {
    const ch = CHARACTERS[m.lines[0]?.s] || CHARACTERS.narrator;
    return `<div class="story-card">
      <button class="icon-btn story-close" data-act="storyClose" aria-label="Close story">${ico('close')}</button>
      <div class="story-portrait">
        <canvas id="storyPortrait" width="320" height="440"></canvas>
        <div class="portrait-vignette"></div>
        <div class="portrait-name"><b id="storyName">${ch.name}</b><span id="storyRole">${ch.role || ''}</span></div>
      </div>
      <div class="story-main">
        <div class="story-top"><div><div class="story-act">${m.act} · MISSION ${pad2(this.game.state.story.idx + 1)}</div><div class="story-place">${m.place}</div></div></div>
        <div class="story-title">${m.title}</div>
        <div class="story-dialogue" id="storyDialogue" data-act="storyAdvance">
          <div class="story-speaker" id="storySpeaker"></div>
          <div class="story-text" id="storyText"></div>
          <div id="storyChoices"></div>
        </div>
        <div class="story-foot">
          <div class="story-dots" id="storyDots"></div>
          <div class="story-foot-end">
            <button class="story-voice" id="storyVoice" data-act="storyReplayLine" aria-label="Replay voice line" title="Replay voice line">${ico('sound-on')}</button>
            <div class="story-next" id="storyNext">TAP TO CONTINUE ${ico('arrow')}</div>
          </div>
        </div>
      </div>
    </div>`;
  }

  startStoryDialogue(m, replay = false) {
    this.storyView = { mode: 'dialogue', mission: m, line: 0, typing: false, typed: 0, text: '', speakerId: '', replay };
    this.setModal(this.storyShell(m), 'story');
    this.renderStoryLine();
  }

  renderStoryLine() {
    const v = this.storyView;
    if (!v) return;
    const line = v.mission.lines[v.line];
    if (!line) { this.afterDialogue(); return; }
    const ch = CHARACTERS[line.s] || CHARACTERS.narrator;
    v.speakerId = line.s;
    $('storyName').textContent = ch.name;
    $('storyRole').textContent = ch.role || '';
    $('storySpeaker').textContent = ch.narrator ? 'THE CITY' : ch.name;
    $('storySpeaker').style.opacity = ch.narrator ? '.65' : '1';
    $('storyText').className = 'story-text' + (ch.narrator ? ' narrator typing' : ' typing');
    $('storyChoices').innerHTML = '';
    $('storyNext').style.visibility = 'visible';
    $('storyNext').innerHTML = `TAP TO CONTINUE ${ico('arrow')}`;
    $('storyDots').innerHTML = v.mission.lines.map((_, i) => `<i class="${i === v.line ? 'on' : ''}"></i>`).join('');
    if (line.s !== v.lastSpeaker) { this.drawPortrait($('storyPortrait'), line.s); v.lastSpeaker = line.s; }
    v.text = line.t; v.typed = 0; v.typing = true;
    this.syncStoryVoiceButton();
    this.audio?.speakLine(line.s, line.t);
    $('storyText').textContent = '';
    clearInterval(this.typeTimer);
    this.typeTimer = setInterval(() => {
      if (!this.storyView || this.storyView.mode !== 'dialogue') { clearInterval(this.typeTimer); return; }
      v.typed += 2;
      if (v.typed >= v.text.length) {
        v.typed = v.text.length; v.typing = false;
        $('storyText').textContent = v.text;
        $('storyText').classList.remove('typing');
        clearInterval(this.typeTimer);
      } else {
        $('storyText').textContent = v.text.slice(0, v.typed);
      }
    }, 16);
  }

  advanceStory() {
    const v = this.storyView;
    if (!v) return;
    if (v.mode === 'reply') { this.finishReply(); return; }
    if (v.mode !== 'dialogue') return;
    if (v.typing) {
      v.typing = false;
      clearInterval(this.typeTimer);
      $('storyText').textContent = v.text;
      $('storyText').classList.remove('typing');
      return;
    }
    v.line++;
    if (v.line >= v.mission.lines.length) this.afterDialogue();
    else { this.audio?.click(); this.renderStoryLine(); }
  }

  replayStoryLine() {
    const v = this.storyView;
    if (!v) return;
    if (v.mode === 'dialogue') {
      const line = v.mission.lines[v.line];
      if (line) this.audio?.speakLine(line.s, line.t);
    } else if (v.mode === 'choice') {
      const prompt = v.mission.choice?.prompt;
      if (prompt) this.audio?.speakLine('narrator', prompt);
    } else if (v.mode === 'reply' && v.text) {
      this.audio?.speakLine('narrator', v.text);
    }
  }

  syncStoryVoiceButton() {
    const b = $('storyVoice');
    if (b) b.style.display = this.audio?.voiceEnabled() ? '' : 'none';
  }

  afterDialogue() {
    const v = this.storyView;
    if (!v) return;
    this.game.markStorySeen();
    if (v.mission.choice) { this.showStoryChoice(v.mission.choice); return; }
    this.showStorySummary(v.mission);
  }

  showStoryChoice(choice) {
    const v = this.storyView;
    if (!v) return;
    v.mode = 'choice';
    $('storyText').textContent = '';
    $('storySpeaker').textContent = 'DECISION';
    $('storyDots').innerHTML = '';
    $('storyNext').style.visibility = 'hidden';
    $('storyChoices').innerHTML = `<div class="choice-prompt">${choice.prompt}</div><div class="story-choice">${choice.options.map((o, i) => `<button class="choice-btn" data-act="storyChoice" data-index="${i}"><b>${o.label}</b><span>${o.sub || ''}</span></button>`).join('')}</div>`;
    if (choice.prompt) this.audio?.speakLine('narrator', choice.prompt);
  }

  applyChoiceEffects(effects = {}) {
    const g = this.game, s = g.state;
    if (effects.dirty) s.dirty = Math.max(0, s.dirty + effects.dirty);
    if (effects.clean) s.clean = Math.max(0, s.clean + effects.clean);
    if (effects.heat) s.heat = clamp(s.heat + effects.heat, 0, 100);
    if (effects.rep) s.rep = clamp(s.rep + effects.rep, 0, 100);
    if (effects.flag) s.flags[effects.flag] = true;
    g.save();
  }

  chooseStory(index) {
    const v = this.storyView;
    if (!v || v.mode !== 'choice') return;
    const choice = v.mission.choice;
    const opt = choice?.options[index];
    if (!opt) return;
    this.applyChoiceEffects(opt.effects);
    this.audio?.click();
    if (opt.effects?.heat) this.toast(`Heat ${opt.effects.heat > 0 ? '+' : ''}${opt.effects.heat}%`, opt.effects.heat > 0 ? 'warn' : 'good');
    v.mode = 'reply';
    v.text = opt.reply || '';
    v.typed = 0; v.typing = true;
    $('storySpeaker').textContent = 'THE CITY';
    $('storySpeaker').style.opacity = '.65';
    $('storyText').className = 'story-text narrator typing';
    $('storyChoices').innerHTML = '';
    $('storyNext').style.visibility = 'visible';
    $('storyNext').innerHTML = `CONTINUE ${ico('arrow')}`;
    clearInterval(this.typeTimer);
    if (v.text) this.audio?.speakLine('narrator', v.text);
    this.typeTimer = setInterval(() => {
      if (!this.storyView || this.storyView.mode !== 'reply') { clearInterval(this.typeTimer); return; }
      v.typed += 2;
      if (v.typed >= v.text.length) {
        v.typed = v.text.length; v.typing = false;
        $('storyText').textContent = v.text;
        $('storyText').classList.remove('typing');
        clearInterval(this.typeTimer);
      } else $('storyText').textContent = v.text.slice(0, v.typed);
    }, 16);
    if (v.speakerId !== 'narrator') { this.drawPortrait($('storyPortrait'), 'narrator'); v.lastSpeaker = 'narrator'; }
    $('storyName').textContent = 'The City';
    $('storyRole').textContent = 'Consequence';
  }

  finishReply() {
    const v = this.storyView;
    if (!v) return;
    if (v.typing) {
      clearInterval(this.typeTimer);
      v.typing = false;
      $('storyText').textContent = v.text;
      $('storyText').classList.remove('typing');
      return;
    }
    this.showStorySummary(v.mission);
  }

  showStorySummary(m) {
    if (!m) return;
    this.audio?.stopSpeaking();
    const g = this.game, p = g.missionProgress();
    const lastSpeaker = [...m.lines].reverse().find(l => l.s !== 'narrator')?.s || 'milo';
    this.storyView = { mode: 'summary', mission: m };
    const r = m.reward || {};
    const rewardChips = [
      r.dirty ? `<span class="chip gold">+${money(r.dirty)} dirty</span>` : '',
      r.clean ? `<span class="chip green">+${money(r.clean)} clean</span>` : '',
      r.rep ? `<span class="chip purple">+${r.rep} REP</span>` : '',
      r.heat ? `<span class="chip ${r.heat > 0 ? 'red' : 'green'}">${r.heat > 0 ? '+' : ''}${r.heat}% heat</span>` : ''
    ].filter(Boolean).join('');
    const html = `<div class="story-card">
      <button class="icon-btn story-close" data-act="storyClose" aria-label="Close story">${ico('close')}</button>
      <div class="story-portrait">
        <canvas id="storyPortrait" width="320" height="440"></canvas><div class="portrait-vignette"></div>
        <div class="portrait-name"><b>${CHARACTERS[lastSpeaker]?.name || 'Milo Vance'}</b><span>${CHARACTERS[lastSpeaker]?.role || ''}</span></div>
      </div>
      <div class="story-main">
        <div class="story-top"><div><div class="story-act">${m.act} · MISSION ${pad2(this.game.state.story.idx + 1)}</div><div class="story-place">${m.place}</div></div></div>
        <div class="story-title">${m.title}</div>
        <div class="story-dialogue">
          <div class="story-speaker">OBJECTIVE</div>
          <div class="objective-card">
            <div class="objective-top"><span>${p?.complete ? 'READY TO CLAIM' : 'IN PROGRESS'}</span><span>${Math.floor(p?.current || 0)} / ${p?.target || 1}</span></div>
            <div class="objective-label">${m.objective.label}</div>
            <div class="bar"><i style="width:${(p?.pct || 0) * 100}%;background:${p?.complete ? 'var(--acid)' : 'var(--green)'}"></i></div>
            <div class="reward-row">${rewardChips || '<span class="chip">Story reward</span>'}</div>
          </div>
        </div>
        <div class="story-foot">
          <button class="story-replay" data-act="storyReplay">REREAD BRIEFING</button>
          <div class="story-actions" style="margin:0;flex:0 0 auto">
            <button class="btn ghost" data-act="storyClose" style="flex:0 0 auto">${p?.complete ? 'LATER' : 'BACK TO WORK'}</button>
            ${p?.complete ? `<button class="btn" data-act="storyClaim">CLAIM REWARD</button>` : ''}
          </div>
        </div>
      </div>
    </div>`;
    this.setModal(html, 'story');
    this.drawPortrait($('storyPortrait'), lastSpeaker);
  }

  claimMission() {
    const g = this.game;
    const r = g.completeMission();
    if (!r.ok) { this.toast(r.msg || 'Not ready yet.', 'warn'); this.audio?.error(); return; }
    const rw = r.mission.reward || {};
    const parts = [];
    if (rw.dirty) parts.push(`+${money(rw.dirty)} dirty`);
    if (rw.clean) parts.push(`+${money(rw.clean)} clean`);
    if (rw.rep) parts.push(`+${rw.rep} REP`);
    if (rw.heat) parts.push(`${rw.heat > 0 ? '+' : ''}${rw.heat}% heat`);
    this.toast(`MISSION COMPLETE · ${r.mission.title}${parts.length ? ' · ' + parts.join(' · ') : ''}`, 'good');
    this.audio?.success();
    this.renderer.sparkleScreen();
    this.closeModal();
    if (r.ending) setTimeout(() => this.openEnding(), 500);
    else if (r.betrayal) setTimeout(() => this.openBetrayal(g.triggerBetrayal()), 700);
    else if (r.next) {
      setTimeout(() => this.toast(`New mission: ${r.next.title}`, 'info'), 900);
      setTimeout(() => this.openStory(), 1500);
    }
    this.syncStats(); this.syncMission();
  }

  openStoryComplete() {
    const g = this.game, s = g.state;
    this.storyView = { mode: 'summary' };
    this.setModal(`<div class="ending-card">
      <div class="ending-kicker">ENDGAME</div>
      <div class="ending-title">THE CITY<br><span>IS YOURS</span></div>
      <p class="ending-text">You came from a dead woman's apartment with three cracked pots. Now the skyline belongs to you. Keep growing, keep laundering, keep buying. An empire is never finished.</p>
      <div class="ending-stats"><div><b>${money(g.netWorth())}</b><span>NET WORTH</span></div><div><b>${s.day}</b><span>DAYS</span></div><div><b>${Math.floor(s.stats.sold)}g</b><span>SOLD</span></div><div><b>${PROPERTY_LIST.filter(p => s.properties[p.id].owned).length}</b><span>PROPERTIES</span></div></div>
      <button class="btn" data-act="storyClose">KEEP BUILDING</button>
    </div>`, 'story');
  }

  // ---------- random events ----------
  openEvent(ev) {
    if (!ev) return;
    this.setModal(`<div class="event-card">
      <button class="icon-btn story-close" data-act="eventClose" style="position:absolute;top:14px;right:14px">${ico('close')}</button>
      <div class="event-icon">${ico(this.eventIcon(ev.icon))}</div>
      <div class="event-tag">${ev.tag}</div>
      <h2 class="event-title">${ev.title}</h2>
      <div class="event-body" id="eventBody">${ev.body}</div>
      <div class="event-choices" id="eventChoices">${ev.choices.map((c, i) => `<button class="choice-btn" data-act="eventChoice" data-index="${i}"><b>${c.label}</b><span>${c.sub || ''}</span></button>`).join('')}</div>
    </div>`, 'event');
  }

  eventIcon(name) {
    return { cash: 'cash', seed: 'grow', eye: 'eye', fist: 'heat', star: 'star', bolt: 'upgrade', siren: 'siren', flask: 'flask' }[name] || 'story';
  }

  chooseEvent(index) {
    const r = this.game.resolveEvent(index);
    if (!r.ok) { this.closeModal(); return; }
    this.audio?.click();
    $('eventChoices').innerHTML = '';
    $('eventBody').innerHTML = `<div class="event-result">${r.result}</div>`;
    const foot = document.createElement('button');
    foot.className = 'btn wide';
    foot.dataset.act = 'eventClose';
    foot.textContent = 'BACK TO WORK';
    $('eventChoices').appendChild(foot);
    this.syncStats();
  }

  // ---------- raids, betrayal, endings, offline ----------
  openRaid(info) {
    const g = this.game;
    this.audio?.siren();
    this.setModal(`<div class="raid-card">
      <div class="siren-ico">${ico('siren')}</div>
      <div class="raid-kicker">SATURDAY · 4:12 AM</div>
      <div class="raid-title">KNOCK.<br>KNOCK.</div>
      <div class="raid-sub">The DEA found the grow. Officers took what they could carry and left the rest for the evidence photos.</div>
      <div class="loss-grid">
        <div class="loss"><b>-${money(info.dirtyLoss)}</b><span>DIRTY CASH</span></div>
        <div class="loss"><b>-${Math.floor(info.stockLoss)}g</b><span>PRODUCT</span></div>
        <div class="loss"><b>${info.plantLost ? '1' : '0'}</b><span>PLANT LOST</span></div>
      </div>
      <div class="tiny muted" style="margin-bottom:14px">Heat reset to 22%. Reputation -10. Nobody was arrested. This time.</div>
      <button class="btn wide" data-act="raidClose">REBUILD</button>
    </div>`, 'raid');
    this.syncStats();
  }

  openBetrayal(info) {
    const g = this.game;
    this.audio?.siren();
    this.setModal(`<div class="raid-card">
      <div class="siren-ico" style="color:#c9a0ff">${ico('story')}</div>
      <div class="raid-kicker" style="color:#d3a6ff">LOYALTY IS A LIABILITY</div>
      <div class="raid-title" style="color:#e8c9ff">THE<br>KNIFE</div>
      <div class="raid-sub">Dex sold the stash house to the Syndicate. Police arrived eleven minutes later. You were not supposed to survive the night.<br><br>Dex is gone. So is a third of everything you built.</div>
      <div class="loss-grid">
        <div class="loss" style="border-color:rgba(200,150,255,.2)"><b style="color:#d8aaff">-${money(info.dirtyLoss)}</b><span>DIRTY CASH</span></div>
        <div class="loss" style="border-color:rgba(200,150,255,.2)"><b style="color:#d8aaff">-${Math.floor(info.stockLoss)}g</b><span>PRODUCT</span></div>
        <div class="loss" style="border-color:rgba(200,150,255,.2)"><b style="color:#d8aaff">DEAD</b><span>PARTNERSHIP</span></div>
      </div>
      <div class="tiny muted" style="margin-bottom:14px">Heat is at 48%. Lay low. Rebuild. Remember.</div>
      <button class="btn wide" data-act="raidClose">NEVER AGAIN</button>
    </div>`, 'raid');
    this.syncStats();
  }

  openEnding() {
    const g = this.game, s = g.state;
    let text = '';
    if (s.flags.merged) text = 'You merged with Vera Sloane. The city gets a king and a queen, two thrones in the same tower, and a peace built on mutually assured destruction. You still sleep with the lights on.';
    else if (s.flags.war) text = 'You burned the Syndicate from the inside. Rook vanished. Vera\'s lawyers fled. The Green Empire owns every corner that matters, and the city has stopped pretending otherwise.';
    else text = 'You outgrew every cage they built for you. The apartment, the garage, the lab, the warehouse — stepping stones under a skyline that now answers to your name.';
    if (s.flags.informant) text += ' Marlow keeps her word. Your file stays closed. You never ask what it cost.';
    if (s.flags.betrayed) text += ' Dex\'s chair at the table stays empty. You never let anyone sit in it.';
    text += ' The empire stands. For now.';
    this.setModal(`<div class="ending-card">
      <div class="ending-kicker">FINAL MISSION COMPLETE</div>
      <div class="ending-title">GREEN<br><span>EMPIRE</span></div>
      <p class="ending-text">${text}</p>
      <div class="ending-stats"><div><b>${money(g.netWorth())}</b><span>NET WORTH</span></div><div><b>${s.day}</b><span>DAYS</span></div><div><b>${Math.floor(s.stats.sold)}g</b><span>PRODUCT SOLD</span></div><div><b>${s.stats.raids}</b><span>RAIDS</span></div></div>
      <div class="btn-row" style="justify-content:center">
        <button class="btn" data-act="endingClose">KEEP BUILDING</button>
        <button class="btn ghost" data-act="endingReset">SETTINGS</button>
      </div>
    </div>`, 'ending');
    this.audio?.success();
    this.syncStats();
  }

  openOffline(summary) {
    const hours = summary.seconds / 3600;
    this.setModal(`<div class="offline-card">
      <div class="mini-label">WHILE YOU WERE GONE</div>
      <h2>The empire kept breathing.</h2>
      <p>${hours >= 1 ? hours.toFixed(1) + ' hours' : Math.round(summary.seconds / 60) + ' minutes'} passed. Plants grew. Fronts washed money. Nobody got arrested.</p>
      <div class="offline-grid">
        <div><b>+${money(summary.washed)}</b><span>LAUNDERED</span></div>
        <div><b>${summary.ready}</b><span>READY</span></div>
        <div><b>${summary.grown}</b><span>GREW</span></div>
      </div>
      <button class="btn wide" data-act="offlineClose">BACK TO WORK</button>
    </div>`, 'offline');
  }

  // ---------- chemistry minigame ----------
  openRefine(preselect) {
    const g = this.game;
    if (g.modalType || this.modalType) return;
    if (!g.canRefine()) { this.toast('The chemistry station unlocks with The Hive. Buy the underground lab first.', 'warn'); return; }
    const lots = Object.entries(g.state.inventory).filter(([, l]) => l?.g >= 10);
    if (!lots.length) { this.toast('Refining needs at least 10g of a single strain. Grow more first.', 'warn'); return; }
    this.audio?.click();
    this.setModal(`<div class="refine-card">
      <button class="icon-btn story-close" data-act="refineCancel" style="position:absolute;top:14px;right:14px">${ico('close')}</button>
      <div class="mini-label" style="color:var(--cyan)">THE HIVE · CHEM STATION</div>
      <div class="refine-title">Batch Stabilization</div>
      <div class="refine-body">Consume 10g, recover 8g at higher quality. Costs $60. Catch the needle in the green zone to maximize purity.</div>
      <div class="sec-title" style="margin-top:4px">SELECT A BATCH</div>
      ${lots.map(([id, lot]) => `<div class="card" style="padding:9px 10px"><div class="between"><div class="row"><span class="dot" style="background:${STRAIN_BY_ID[id].color}"></span><div><div class="small" style="font-weight:800">${STRAIN_BY_ID[id].name}</div><div class="tiny muted">${lot.g.toFixed(0)}g · Q${Math.round(lot.q)} ${gradeFor(lot.q).name}</div></div></div><button class="btn small" data-act="refinePick" data-id="${id}" ${preselect === id ? 'autofocus' : ''}>STABILIZE</button></div></div>`).join('')}
      <div class="refine-note">${g.state.staff.includes('priya') ? 'Priya can auto-stabilize any batch for $150 with a guaranteed +10 quality.' : 'Hire Priya the chemist to unlock instant stabilization.'}</div>
    </div>`, 'refine');
    if (preselect && lots.some(([id]) => id === preselect)) setTimeout(() => this.startRefine(preselect), 60);
  }

  startRefine(id) {
    const g = this.game;
    const lot = g.state.inventory[id];
    if (!lot || lot.g < 10) { this.toast('That batch is gone.', 'warn'); return; }
    const st = STRAIN_BY_ID[id];
    this.refineSession = { id, needle: .12 + Math.random() * .7, dir: 1, speed: .6 + Math.random() * .14, done: false };
    this.setModal(`<div class="refine-card">
      <button class="icon-btn story-close" data-act="refineCancel" style="position:absolute;top:14px;right:14px">${ico('close')}</button>
      <div class="mini-label" style="color:var(--cyan)">STABILIZATION RUN · ${st.name.toUpperCase()}</div>
      <div class="refine-title">Catch the purity window</div>
      <div class="refine-body" style="margin-bottom:8px">10g → 8g · current Q${Math.round(lot.q)} · cost $60. Stop the needle inside the bright core for maximum quality.</div>
      <div class="chem-meter" id="chemMeter">
        <div class="chem-zone" style="left:28%;width:44%"></div>
        <div class="chem-zone core" style="left:45%;width:10%"></div>
        <div class="chem-needle" id="chemNeedle" style="left:12%"></div>
        <div class="chem-ticks">${Array.from({ length: 11 }, () => '<i></i>').join('')}</div>
      </div>
      <div class="chem-readout"><span>REAGENT STABILITY</span><b id="chemReadout">READY</b><span>Q${Math.round(lot.q)} → higher</span></div>
      <div class="refine-actions">
        <button class="btn" data-act="refineGo" id="refineGo">STABILIZE</button>
        ${g.state.staff.includes('priya') ? `<button class="btn ghost" data-act="refineAuto">PRIYA · $150</button>` : ''}
      </div>
      <div class="refine-note">The needle moves faster each run. No batch is ever exactly the same.</div>
    </div>`, 'refine');
    clearInterval(this.refineTimer);
    this.refineTimer = setInterval(() => {
      const s = this.refineSession;
      if (!s || s.done) { clearInterval(this.refineTimer); return; }
      s.needle += s.dir * s.speed * .016;
      if (s.needle >= 1) { s.needle = 1; s.dir = -1; }
      if (s.needle <= 0) { s.needle = 0; s.dir = 1; }
      const el = $('chemNeedle');
      if (!el) { clearInterval(this.refineTimer); return; }
      el.style.left = (s.needle * 100) + '%';
      const diff = Math.abs(s.needle - .5);
      $('chemReadout').textContent = diff < .045 ? 'PRISTINE' : diff < .09 ? 'STABLE' : diff < .16 ? 'VOLATILE' : 'DANGEROUS';
      $('chemReadout').style.color = diff < .045 ? 'var(--acid)' : diff < .09 ? 'var(--green)' : diff < .16 ? 'var(--gold)' : 'var(--red)';
    }, 16);
  }

  resolveRefine(auto) {
    const s = this.refineSession;
    if (!s || s.done) return;
    s.done = true;
    clearInterval(this.refineTimer);
    let bonus, label;
    if (auto) { bonus = 10; label = 'PRIYA\'S HANDS'; }
    else {
      const diff = Math.abs(s.needle - .5);
      if (diff <= .045) { bonus = 24; label = 'PRISTINE'; }
      else if (diff <= .09) { bonus = 18; label = 'CLEAN'; }
      else if (diff <= .16) { bonus = 12; label = 'DECENT'; }
      else { bonus = 5; label = 'CRUDE'; }
    }
    const r = this.game.refineResolve(s.id, bonus, auto);
    if (!r.ok) {
      this.toast(r.msg || 'Refinement failed.', 'warn');
      this.audio?.error();
      $('refineGo') && ($('refineGo').disabled = true);
      setTimeout(() => this.closeModal(), 500);
      return;
    }
    if (r.newQ > r.oldQ) this.audio?.success(); else this.audio?.error();
    this.setModal(`<div class="refine-card">
      <div class="mini-label" style="color:var(--cyan)">RUN COMPLETE</div>
      <div class="refine-title">${label}</div>
      <div class="refine-result">
        <div class="big">Q${r.newQ}</div>
        <p>${Math.round(r.oldQ)} → ${r.newQ} quality · 10g → 8g<br>${auto ? 'Priya charges $150.' : 'Cost $60.'}</p>
      </div>
      <div class="bar" style="margin-bottom:14px"><i style="width:${r.newQ}%;background:linear-gradient(90deg,var(--green),var(--acid))"></i></div>
      <button class="btn wide" data-act="refineDone">BACK TO THE LAB</button>
    </div>`, 'refine');
    this.renderer.sparkleScreen();
    this.syncStats();
  }

  // ---------- portrait art ----------
  drawPortrait(canvas, charId) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const ch = CHARACTERS[charId] || CHARACTERS.narrator;
    ctx.clearRect(0, 0, W, H);
    if (ch.narrator) { this.drawCityPortrait(ctx, W, H); return; }
    const accent = ch.accent || '#7bf58a';
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#1a2b21'); bg.addColorStop(.6, '#0d1711'); bg.addColorStop(1, '#080d0a');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    // backdrop glow + block
    const rg = ctx.createRadialGradient(W * .55, H * .25, 8, W * .55, H * .25, W * .9);
    rg.addColorStop(0, this.hexA(accent, .28)); rg.addColorStop(.5, this.hexA(accent, .06)); rg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.globalAlpha = .09;
    ctx.strokeStyle = accent; ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(W * .6, H * .34, 80 + i * 42, 0, Math.PI * 2); ctx.stroke(); }
    ctx.restore();
    // shoulders / body
    const shirt = ch.shirt || '#3f6a52';
    ctx.fillStyle = shirt;
    ctx.beginPath();
    ctx.moveTo(W * .12, H);
    ctx.bezierCurveTo(W * .12, H * .68, W * .3, H * .6, W * .5, H * .6);
    ctx.bezierCurveTo(W * .7, H * .6, W * .88, H * .68, W * .88, H);
    ctx.closePath(); ctx.fill();
    const sg = ctx.createLinearGradient(0, H * .6, 0, H);
    sg.addColorStop(0, 'rgba(255,255,255,.16)'); sg.addColorStop(1, 'rgba(0,0,0,.35)');
    ctx.fillStyle = sg; ctx.beginPath(); ctx.moveTo(W * .12, H); ctx.bezierCurveTo(W * .12, H * .68, W * .3, H * .6, W * .5, H * .6); ctx.bezierCurveTo(W * .7, H * .6, W * .88, H * .68, W * .88, H); ctx.closePath(); ctx.fill();
    // collar
    ctx.fillStyle = 'rgba(0,0,0,.22)';
    ctx.beginPath(); ctx.moveTo(W * .43, H * .61); ctx.lineTo(W * .5, H * .78); ctx.lineTo(W * .57, H * .61); ctx.closePath(); ctx.fill();
    if (ch.tie) { ctx.fillStyle = ch.tie; ctx.beginPath(); ctx.moveTo(W * .5, H * .66); ctx.lineTo(W * .53, H * .72); ctx.lineTo(W * .5, H * .94); ctx.lineTo(W * .47, H * .72); ctx.closePath(); ctx.fill(); }
    // neck
    ctx.fillStyle = ch.skin || '#c8926b';
    ctx.beginPath(); ctx.roundRect(W * .43, H * .5, W * .14, H * .15, 14); ctx.fill();
    // head
    const cx = W * .5, cy = H * .36, r = W * .185;
    ctx.fillStyle = ch.skin || '#c8926b';
    ctx.beginPath(); ctx.ellipse(cx, cy, r, r * 1.15, 0, 0, Math.PI * 2); ctx.fill();
    // jaw shadow
    const jg = ctx.createLinearGradient(cx - r, cy, cx + r, cy + r);
    jg.addColorStop(0, 'rgba(0,0,0,0)'); jg.addColorStop(1, 'rgba(40,20,10,.18)');
    ctx.fillStyle = jg; ctx.beginPath(); ctx.ellipse(cx + r * .2, cy + r * .2, r * .9, r, 0, 0, Math.PI * 2); ctx.fill();
    // ears
    ctx.fillStyle = ch.skin || '#c8926b';
    ctx.beginPath(); ctx.ellipse(cx - r * .98, cy + 6, 11, 17, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + r * .98, cy + 6, 11, 17, 0, 0, Math.PI * 2); ctx.fill();
    // hair styles
    ctx.fillStyle = ch.hair || '#2a211d';
    if (ch.style === 'bald') {
      ctx.globalAlpha = .18; ctx.beginPath(); ctx.arc(cx, cy - r * .25, r * .98, Math.PI * 1.1, Math.PI * 1.9); ctx.fill(); ctx.globalAlpha = 1;
      if (ch.beard) { ctx.globalAlpha = .9; ctx.beginPath(); ctx.ellipse(cx, cy + r * .7, r * .8, r * .55, 0, 0, Math.PI); ctx.fill(); ctx.globalAlpha = 1; }
    } else if (ch.style === 'curly') {
      for (let i = 0; i < 12; i++) {
        const a = Math.PI * 1.05 + (i / 11) * Math.PI * .9;
        ctx.beginPath(); ctx.arc(cx + Math.cos(a) * r * .92, cy + Math.sin(a) * r * .95 - 4, 15 + (i % 3) * 3, 0, Math.PI * 2); ctx.fill();
      }
      ctx.beginPath(); ctx.ellipse(cx, cy - r * .72, r * .95, r * .48, 0, 0, Math.PI * 2); ctx.fill();
    } else if (ch.style === 'slick') {
      ctx.beginPath(); ctx.ellipse(cx, cy - r * .16, r * 1.06, r * 1.12, 0, Math.PI * 1.01, Math.PI * 1.99); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.arc(cx - r * .1, cy - r * .22, r * .78, Math.PI * 1.15, Math.PI * 1.75); ctx.stroke();
    } else if (ch.style === 'bob') {
      ctx.beginPath(); ctx.arc(cx, cy - r * .15, r * 1.1, Math.PI, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.roundRect(cx - r * 1.1, cy - r * .4, r * .2, r * 1.7, 8); ctx.fill();
      ctx.beginPath(); ctx.roundRect(cx + r * .9, cy - r * .4, r * .2, r * 1.7, 8); ctx.fill();
    } else if (ch.style === 'locs') {
      ctx.beginPath(); ctx.arc(cx, cy - r * .3, r * 1.05, Math.PI, Math.PI * 2); ctx.fill();
      for (let i = 0; i < 8; i++) {
        const x = cx - r * .95 + i * r * .27;
        ctx.beginPath(); ctx.moveTo(x, cy - r * .4);
        ctx.quadraticCurveTo(x - 8, cy + r * .3, x - 3 + (i % 2) * 5, cy + r * .75);
        ctx.lineWidth = 12; ctx.strokeStyle = ch.hair; ctx.stroke();
      }
    } else if (ch.style === 'wild') {
      for (let i = 0; i < 14; i++) {
        const a = Math.PI * 1.02 + (i / 13) * Math.PI * .96;
        ctx.beginPath(); ctx.arc(cx + Math.cos(a) * r * 1.0, cy + Math.sin(a) * r * 1.02, 13, 0, Math.PI * 2); ctx.fill();
      }
    } else if (ch.style === 'messy') {
      ctx.beginPath(); ctx.arc(cx, cy - r * .3, r * 1.04, Math.PI, Math.PI * 2); ctx.fill();
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(cx - r * .7 + i * 12, cy - r * .85); ctx.lineTo(cx - r * .9 + i * 13, cy - r * 1.15); ctx.lineTo(cx - r * .45 + i * 12, cy - r * .9); ctx.closePath(); ctx.fill(); }
    } else {
      ctx.beginPath(); ctx.arc(cx, cy - r * .18, r * 1.02, Math.PI, Math.PI * 2); ctx.fill();
    }
    // bandana
    if (ch.bandana) { ctx.fillStyle = ch.bandana; ctx.beginPath(); ctx.roundRect(cx - r * .9, cy - r * .55, r * 1.8, 14, 6); ctx.fill(); }
    // eyebrows
    ctx.strokeStyle = ch.hair || '#2a211d'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx - 27, cy - 8); ctx.quadraticCurveTo(cx - 18, cy - 14, cx - 8, cy - 9); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 8, cy - 9); ctx.quadraticCurveTo(cx + 18, cy - 14, cx + 27, cy - 8); ctx.stroke();
    // eyes
    ctx.fillStyle = '#241a15';
    ctx.beginPath(); ctx.ellipse(cx - 18, cy + 1, 5, 3.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + 18, cy + 1, 5, 3.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.6)';
    ctx.beginPath(); ctx.arc(cx - 19.5, cy - .5, 1.2, 0, Math.PI * 2); ctx.arc(cx + 16.5, cy - .5, 1.2, 0, Math.PI * 2); ctx.fill();
    if (ch.glasses) {
      ctx.strokeStyle = 'rgba(220,240,235,.55)'; ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.roundRect(cx - 32, cy - 9, 27, 20, 6); ctx.stroke();
      ctx.beginPath(); ctx.roundRect(cx + 5, cy - 9, 27, 20, 6); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - 5, cy + 1); ctx.lineTo(cx + 5, cy + 1); ctx.stroke();
    }
    // nose
    ctx.strokeStyle = 'rgba(80,45,30,.4)'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(cx - 2, cy + 8); ctx.quadraticCurveTo(cx - 5, cy + 18, cx + 2, cy + 20); ctx.stroke();
    // mouth / lips
    if (ch.lips) { ctx.fillStyle = '#a83f54'; ctx.beginPath(); ctx.ellipse(cx, cy + 36, 15, 6, 0, 0, Math.PI * 2); ctx.fill(); }
    else {
      ctx.strokeStyle = 'rgba(70,35,28,.75)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(cx - 13, cy + 34); ctx.quadraticCurveTo(cx, cy + 40, cx + 13, cy + 34); ctx.stroke();
    }
    if (ch.beard) {
      ctx.fillStyle = ch.hair || '#2a211d';
      ctx.globalAlpha = .92;
      ctx.beginPath(); ctx.ellipse(cx, cy + r * .68, r * .82, r * .62, 0, 0, Math.PI); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx, cy + r * .54, r * .4, r * .2, 0, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }
    if (ch.chain) {
      ctx.strokeStyle = '#e1bf6d'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(cx, cy + r * 1.24, r * .34, .3, Math.PI - .3); ctx.stroke();
      ctx.fillStyle = '#e1bf6d'; ctx.beginPath(); ctx.arc(cx, cy + r * 1.42, 5, 0, Math.PI * 2); ctx.fill();
    }
    if (ch.lips) {
      ctx.fillStyle = '#d9b26a'; ctx.beginPath(); ctx.arc(cx - r * 1.0, cy + 30, 5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + r * 1.0, cy + 30, 5, 0, Math.PI * 2); ctx.fill();
    }
    // rim light
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const rim = ctx.createLinearGradient(W * .1, 0, W * .9, H * .8);
    rim.addColorStop(0, this.hexA(accent, .16)); rim.addColorStop(.5, 'rgba(0,0,0,0)');
    ctx.fillStyle = rim; ctx.fillRect(0, 0, W, H);
    ctx.restore();
    // vignette
    const vg = ctx.createRadialGradient(W * .5, H * .4, H * .25, W * .5, H * .45, H * .8);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.6)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    // bottom fade for name
    const bf = ctx.createLinearGradient(0, H * .72, 0, H);
    bf.addColorStop(0, 'rgba(6,10,8,0)'); bf.addColorStop(1, 'rgba(6,10,8,.95)');
    ctx.fillStyle = bf; ctx.fillRect(0, H * .6, W, H * .4);
  }

  drawCityPortrait(ctx, W, H) {
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#071019'); bg.addColorStop(.55, '#102027'); bg.addColorStop(1, '#0a1512');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 60; i++) {
      ctx.fillStyle = `rgba(210,235,225,${.12 + Math.random() * .4})`;
      ctx.fillRect(Math.random() * W, Math.random() * H * .45, 1.2, 1.2);
    }
    ctx.fillStyle = 'rgba(240,242,214,.9)'; ctx.beginPath(); ctx.arc(W * .72, H * .17, 22, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(240,242,214,.08)'; ctx.beginPath(); ctx.arc(W * .72, H * .17, 55, 0, Math.PI * 2); ctx.fill();
    for (let layer = 0; layer < 3; layer++) {
      const base = H * (.56 + layer * .12);
      for (let i = 0; i < 9; i++) {
        const bw = 24 + Math.random() * 22, bh = 40 + Math.random() * 130 * (1 - layer * .2);
        const x = ((i * 41 + layer * 13) % (W + 40)) - 20;
        ctx.fillStyle = ['rgba(8,18,22,.95)', 'rgba(9,22,24,.9)', 'rgba(6,12,14,.95)'][layer];
        ctx.fillRect(x, base - bh, bw, bh);
        if (layer > 0) {
          ctx.fillStyle = 'rgba(255,210,120,.35)';
          for (let wy = base - bh + 6; wy < base - 4; wy += 8) for (let wx = x + 4; wx < x + bw - 4; wx += 7) if (Math.random() > .4) ctx.fillRect(wx, wy, 2, 2.5);
        }
      }
    }
    // rain
    ctx.strokeStyle = 'rgba(170,210,210,.12)'; ctx.lineWidth = .7;
    for (let i = 0; i < 40; i++) { const x = Math.random() * W, y = Math.random() * H; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 2, y + 14); ctx.stroke(); }
    const fog = ctx.createLinearGradient(0, H * .55, 0, H);
    fog.addColorStop(0, 'rgba(60,100,95,.05)'); fog.addColorStop(1, 'rgba(40,80,70,.3)');
    ctx.fillStyle = fog; ctx.fillRect(0, H * .5, W, H * .5);
    const vg = ctx.createRadialGradient(W * .5, H * .4, H * .2, W * .5, H * .45, H * .75);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.6)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  }

  hexA(hex, a) {
    const n = parseInt(hex.replace('#', ''), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }
}
