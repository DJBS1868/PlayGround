// GREEN EMPIRE — core simulation: economy, growing, customers, risk, story.
import {
  SAVE_KEY, DAY_LENGTH, STRAINS, STRAIN_BY_ID, QUALITY_GRADES, gradeFor, rankFor,
  PROPERTIES, PROPERTY_LIST, STAFF, STAFF_BY_ID, UPGRADES, UPGRADE_BY_ID,
  FRONTS, FRONT_BY_ID, BUFFS, PRICING, CUSTOMER_TYPES
} from './data.js';
import { MISSIONS_1, MISSIONS_2 } from './story.js';
import { EVENTS } from './events.js';

export const MISSIONS = [...MISSIONS_1, ...MISSIONS_2];
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const rnd = (a, b) => a + Math.random() * (b - a);
const round = Math.round;

export class Game {
  constructor() {
    this.listeners = new Map();
    this.runtime = { customers: [], spawnTimer: 5, staffTimers: { bea: 0, tito: 0 }, eventTimer: 95, autosave: 0, launderAcc: 0, uiPaused: false, pendingEvent: null, raidCooldown: 0, lastFrame: 0 };
    this.state = this.newState();
  }

  // ---------- setup & persistence ----------
  newState() {
    const properties = {};
    for (const p of PROPERTY_LIST) {
      properties[p.id] = {
        owned: p.id === 'apartment',
        slots: p.slots.map(() => null),
        upgrades: { lights: 0, vent: 0, irrigation: 0, security: 0, counter: 0 }
      };
    }
    return {
      version: 2, clock: 0, lastSave: Date.now(),
      dirty: 250, clean: 0, rep: 15, heat: 0, day: 1, dayTime: 0,
      inventory: {}, freePlantings: 0, selectedStrain: 'dime',
      activeProperty: 'apartment', properties,
      staff: [], fronts: [], buff: null, pricing: 'standard',
      story: { idx: 0, seen: false, base: { harvests: 0, sold: 0, laundered: 0, refined: 0, qualitySold: 0 } },
      flags: {}, layLowUntil: 0,
      settings: { sound: true, hints: true, voice: true },
      stats: { harvests: 0, harvested: 0, plants: 0, sold: 0, earned: 0, laundered: 0, refined: 0, qualitySold: 0, sales: 0, raids: 0, played: 0, bestSale: 0 }
    };
  }

  freshStart() {
    this.state = this.newState();
    this.runtime.customers = [];
    this.runtime.spawnTimer = 5;
    this.runtime.raidCooldown = 0;
    this.runtime.pendingEvent = null;
    this.save();
    this.emit('newgame');
  }

  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (!data || data.version !== 2) return false;
      const base = this.newState();
      this.state = { ...base, ...data, settings: { ...base.settings, ...data.settings }, story: { ...base.story, ...data.story }, stats: { ...base.stats, ...data.stats } };
      // hydrate property slots defensively
      for (const p of PROPERTY_LIST) {
        if (!this.state.properties[p.id]) this.state.properties[p.id] = base.properties[p.id];
        const ps = this.state.properties[p.id];
        ps.upgrades = { ...base.properties[p.id].upgrades, ...ps.upgrades };
        if (!Array.isArray(ps.slots)) ps.slots = p.slots.map(() => null);
        while (ps.slots.length < p.slots.length) ps.slots.push(null);
      }
      this.state.inventory = data.inventory || {};
      this.state.flags = data.flags || {};
      const away = Math.max(0, (Date.now() - (data.lastSave || Date.now())) / 1000);
      const summary = this.simulateOffline(away);
      this.runtime.lastLoadSummary = summary;
      return true;
    } catch (err) {
      console.warn('Save load failed', err);
      return false;
    }
  }

  save() {
    this.state.lastSave = Date.now();
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(this.state)); } catch {}
  }

  simulateOffline(seconds) {
    if (!seconds || seconds < 8) return null;
    const sec = Math.min(seconds, 4 * 3600);
    const before = { dirty: this.state.dirty, clean: this.state.clean };
    this.state.clock += sec;
    this.state.heat = Math.max(0, this.state.heat - sec * 0.1);
    this.state.dayTime += sec;
    while (this.state.dayTime >= DAY_LENGTH) { this.state.dayTime -= DAY_LENGTH; this.state.day++; }
    let ready = 0, grown = 0;
    for (const p of PROPERTY_LIST) {
      const ps = this.state.properties[p.id];
      if (!ps?.owned) continue;
      ps.slots.forEach((slot, i) => {
        if (!slot) return;
        const strain = STRAIN_BY_ID[slot.strain];
        if (!strain) return;
        if (slot.progress < 1) {
          const rate = this.growthRate(p.id, slot);
          slot.progress = Math.min(1, slot.progress + rate * sec);
          grown++;
        }
        if (slot.progress >= 1 && slot.notified !== true) { slot.notified = true; ready++; }
      });
    }
    // fronts quietly wash money while away
    let washed = 0;
    for (const id of this.state.fronts) {
      const f = FRONT_BY_ID[id];
      if (!f || !f.rate) continue;
      const amount = Math.min(this.state.dirty, (f.rate / 60) * Math.min(sec, 2 * 3600));
      if (amount <= 0) continue;
      this.state.dirty -= amount;
      this.state.clean += amount * f.conv;
      this.state.stats.laundered += amount;
      washed += amount * f.conv;
    }
    return { seconds: sec, ready, grown, washed: Math.floor(washed), dirtyDelta: Math.floor(this.state.dirty - before.dirty), cleanDelta: Math.floor(this.state.clean - before.clean) };
  }

  // ---------- events ----------
  on(evt, fn) {
    if (!this.listeners.has(evt)) this.listeners.set(evt, []);
    this.listeners.get(evt).push(fn);
    return () => { const arr = this.listeners.get(evt) || []; const i = arr.indexOf(fn); if (i >= 0) arr.splice(i, 1); };
  }
  emit(evt, data) {
    for (const fn of this.listeners.get(evt) || []) { try { fn(data); } catch (e) { console.error(e); } }
  }
  toast(text, kind = 'info') { this.emit('toast', { text, kind }); }

  // ---------- helpers ----------
  get propConfig() { return PROPERTIES[this.state.activeProperty] || PROPERTIES.apartment; }
  get propState() { return this.state.properties[this.state.activeProperty]; }
  get mission() { return MISSIONS[this.state.story.idx] || null; }
  get hour() { return (8 + (this.state.dayTime / DAY_LENGTH) * 24) % 24; }
  get isNight() { const h = this.hour; return h < 6.2 || h > 19.5; }
  get totalCash() { return this.state.dirty + this.state.clean; }
  get wageTotal() { return this.state.staff.reduce((n, id) => n + (STAFF_BY_ID[id]?.wage || 0), 0); }
  get layLowActive() { return this.state.layLowUntil > this.state.clock; }
  get heatGainMult() {
    const sec = this.propState?.upgrades?.security || 0;
    return (this.state.staff.includes('bruno') ? .75 : 1) * (1 - sec * .12);
  }

  rank() { return rankFor(this.state.rep); }

  strainUnlocked(id) {
    const s = STRAIN_BY_ID[id];
    if (!s) return false;
    return this.state.story.idx >= s.unlockedAt;
  }
  propertyAvailable(id) {
    const p = PROPERTIES[id];
    if (!p) return false;
    if (this.state.properties[id].owned) return true;
    return this.state.story.idx >= p.reqMission;
  }
  frontsUnlocked() { return this.state.story.idx >= 2; }
  staffUnlocked() { return this.state.story.idx >= 3; }

  stockGrams() {
    return Object.values(this.state.inventory).reduce((n, s) => n + (s?.g || 0), 0);
  }
  qualityAvg() {
    let total = 0, q = 0;
    for (const s of Object.values(this.state.inventory)) { if (!s?.g) continue; total += s.g; q += s.g * s.q; }
    return total ? q / total : 0;
  }
  strainStock(id) { return this.state.inventory[id]?.g || 0; }
  bestStock() {
    let best = null;
    for (const [id, lot] of Object.entries(this.state.inventory)) {
      if (!lot?.g) continue;
      const score = lot.g * (STRAIN_BY_ID[id]?.price || 1) * (0.55 + lot.q / 100 * .95);
      if (!best || score > best.score) best = { id, ...lot, score };
    }
    return best;
  }
  addStock(id, grams, quality) {
    if (grams <= 0) return;
    const cur = this.state.inventory[id];
    if (!cur) this.state.inventory[id] = { g: grams, q: quality };
    else {
      const total = cur.g + grams;
      cur.q = (cur.q * cur.g + quality * grams) / total;
      cur.g = total;
    }
  }
  removeStock(grams, id = null) {
    let left = grams;
    const order = id ? [id] : Object.keys(this.state.inventory).sort((a, b) => (this.state.inventory[b]?.g || 0) - (this.state.inventory[a]?.g || 0));
    for (const key of order) {
      const lot = this.state.inventory[key];
      if (!lot?.g) continue;
      const take = Math.min(lot.g, left);
      lot.g -= take; left -= take;
      if (lot.g <= 0.01) delete this.state.inventory[key];
      if (left <= 0.01) return true;
    }
    return left <= 0.01;
  }
  removeStockOf(id, grams) {
    const lot = this.state.inventory[id];
    if (!lot || lot.g < grams) return false;
    lot.g -= grams;
    if (lot.g <= 0.01) delete this.state.inventory[id];
    return true;
  }
  spendDirty(n) {
    if (n <= 0) return true;
    if (this.state.dirty < n) return false;
    this.state.dirty -= n;
    return true;
  }
  addDirty(n) { this.state.dirty += n; }
  addClean(n) { this.state.clean += n; }

  addBuff(id, charges = 3) {
    const b = BUFFS.find(x => x.id === id);
    if (!b) return;
    this.state.buff = { id, charges, type: b.type };
    this.emit('buff', b);
  }

  // ---------- growing ----------
  growthRate(propId, slot) {
    const p = PROPERTIES[propId];
    const ps = this.state.properties[propId];
    const strain = STRAIN_BY_ID[slot.strain];
    if (!p || !strain) return 0;
    const lights = ps.upgrades.lights || 0;
    let mult = 1 + lights * .12 + (p.growthMod || 0);
    if (this.state.buff?.type === 'speed') mult *= 1.4;
    return mult / strain.growTime;
  }

  plant(propId, index, strainId = this.state.selectedStrain) {
    const ps = this.state.properties[propId];
    const p = PROPERTIES[propId];
    const strain = STRAIN_BY_ID[strainId];
    if (!ps?.owned || !p) return { ok: false, msg: 'Property not owned.' };
    if (!strain) return { ok: false, msg: 'Unknown strain.' };
    if (!this.strainUnlocked(strainId)) return { ok: false, msg: 'That strain is still locked.' };
    const slot = ps.slots[index];
    if (slot) return { ok: false, msg: 'That pot is already growing.' };
    if (this.state.freePlantings > 0) this.state.freePlantings--;
    else if (!this.spendDirty(strain.cost)) return { ok: false, msg: `Need $${strain.cost} for a ${strain.short} seed.` };
    ps.slots[index] = { strain: strainId, progress: 0, tendQ: 0, lastTend: -99, planted: this.state.clock, notified: false };
    this.state.stats.plants++;
    this.emit('plant', { propId, index, strain: strainId });
    this.save();
    return { ok: true, strain };
  }

  selectedStrainId() {
    const id = this.state.selectedStrain;
    return this.strainUnlocked(id) ? id : 'dime';
  }
  selectStrain(id) {
    if (!this.strainUnlocked(id)) return this.toast('Unlock that strain through the story first.', 'warn');
    this.state.selectedStrain = id;
    this.emit('ui');
  }

  tend(propId, index) {
    const slot = this.state.properties[propId]?.slots[index];
    if (!slot || slot.progress >= 1) return { ok: false };
    if (this.state.clock - slot.lastTend < 4) return { ok: false, msg: 'Give it a moment to drink.' };
    slot.lastTend = this.state.clock;
    slot.progress = Math.min(1, slot.progress + .11);
    slot.tendQ = Math.min(12, (slot.tendQ || 0) + 1);
    this.emit('tend', { propId, index });
    return { ok: true };
  }

  harvest(propId, index, auto = false) {
    const ps = this.state.properties[propId];
    const p = PROPERTIES[propId];
    const slot = ps?.slots[index];
    if (!slot || slot.progress < 1) return null;
    const strain = STRAIN_BY_ID[slot.strain];
    if (!strain) { ps.slots[index] = null; return null; }
    const up = ps.upgrades;
    let quality = strain.quality + (p.qualityMod || 0) + up.vent * 4 + up.irrigation * 2 + (this.state.staff.includes('priya') ? 8 : 0) + (slot.tendQ || 0);
    if (this.state.buff?.type === 'quality') quality += 9;
    quality += rnd(-3, 3);
    quality = clamp(round(quality), 15, 100);
    let yieldG = strain.yield * (1 + (p.yieldMod || 0) + up.lights * .03) * rnd(.92, 1.08);
    if (this.state.buff?.type === 'yield') yieldG *= 1.25;
    yieldG = Math.max(1, round(yieldG));
    this.addStock(strain.id, yieldG, quality);
    this.state.stats.harvests++;
    this.state.stats.harvested += yieldG;
    if (this.state.buff) {
      this.state.buff.charges--;
      if (this.state.buff.charges <= 0) this.state.buff = null;
    }
    ps.slots[index] = null;
    this.emit('harvest', { propId, index, strain: strain.id, grams: yieldG, quality, auto });
    this.save();
    return { strain, grams: yieldG, quality };
  }

  replantAll(propId = this.state.activeProperty) {
    const ps = this.state.properties[propId];
    if (!ps?.owned) return;
    const strain = STRAIN_BY_ID[this.selectedStrainId()];
    let n = 0;
    ps.slots.forEach((slot, i) => {
      if (!slot && (this.state.dirty >= strain.cost || this.state.freePlantings > 0)) {
        const r = this.plant(propId, i, strain.id);
        if (r.ok) n++;
      }
    });
    if (n) this.toast(`Replanted ${n} ${strain.short} seed${n > 1 ? 's' : ''}.`, 'good');
    else this.toast('No empty pots or not enough cash.', 'warn');
  }

  // ---------- customers & sales ----------
  sellPrice(strainId, quality, multiplier = 1) {
    const strain = STRAIN_BY_ID[strainId];
    const p = this.propConfig;
    const up = this.propState.upgrades;
    const pricing = PRICING[this.state.pricing] || PRICING.standard;
    const qFactor = .55 + clamp(quality, 0, 100) / 100 * .95;
    const repFactor = .82 + clamp(this.state.rep, 0, 100) / 300;
    return strain.price * qFactor * (p.priceMod || 1) * (1 + (up.counter || 0) * .07) * pricing.mod * repFactor * multiplier;
  }

  customerOffer(c) {
    const stock = this.state.inventory[c.strain];
    const q = stock?.q || STRAIN_BY_ID[c.strain].quality;
    let unit = this.sellPrice(c.strain, q, c.type.mult);
    unit *= .94 + Math.random() * .12;
    return { unit, total: round(unit * c.grams), q };
  }

  spawnCustomer() {
    const freeQueue = [0, 1, 2, 3].filter(i => !this.runtime.customers.some(c => c.queueIndex === i && (c.state === 'wait' || c.state === 'enter')));
    if (!freeQueue.length) return;
    const qIndex = freeQueue[0];
    const available = STRAINS.filter(s => this.state.inventory[s.id]?.g > 0);
    let strainId;
    if (available.length && Math.random() < .78) strainId = available[Math.floor(Math.random() * available.length)].id;
    else {
      const unlocked = STRAINS.filter(s => this.strainUnlocked(s.id));
      strainId = unlocked[Math.floor(Math.random() * unlocked.length)].id;
    }
    const totalWeight = CUSTOMER_TYPES.reduce((n, t) => n + t.weight, 0);
    let roll = Math.random() * totalWeight, type = CUSTOMER_TYPES[0];
    for (const t of CUSTOMER_TYPES) { roll -= t.weight; if (roll <= 0) { type = t; break; } }
    const grams = Math.max(3, Math.min(15, 3 + Math.floor(Math.random() * 7) + Math.floor(this.state.rep / 22)));
    const prop = this.propConfig;
    const queue = prop.queue[qIndex] || [prop.counter[0], prop.counter[1] + 1.2];
    const c = {
      id: 'c' + Math.random().toString(36).slice(2, 8), type, strain: strainId, grams, queueIndex: qIndex,
      x: prop.door[0], y: prop.door[1], qx: queue[0], qy: queue[1],
      state: 'enter', patience: 0, maxPatience: rnd(30, 44), served: false, servedQty: 0,
      wobble: Math.random() * 6.28, created: this.state.clock
    };
    const offer = this.customerOffer(c);
    c.unit = offer.unit; c.total = offer.total; c.reqQ = offer.q;
    this.runtime.customers.push(c);
    this.emit('customer', c);
  }

  serveCustomer(c, auto = false) {
    if (!c || c.state !== 'wait' || c.served) return { ok: false };
    let strainId = c.strain;
    let lot = this.state.inventory[strainId];
    let substitute = false;
    if (!lot?.g) {
      const alt = this.bestStock();
      if (!alt) {
        if (!auto) this.toast('No product in stock. Harvest something first.', 'warn');
        return { ok: false, msg: 'Out of stock' };
      }
      strainId = alt.id; lot = { g: alt.g, q: alt.q }; substitute = true;
    }
    const qty = Math.min(c.grams, Math.floor(lot.g));
    if (qty <= 0) return { ok: false };
    const quality = lot.q;
    const unit = this.sellPrice(strainId, quality, c.type.mult) * (substitute ? .88 : 1);
    const payout = Math.max(1, round(unit * qty * (qty < c.grams ? .96 : 1)));
    this.removeStockOf(strainId, qty);
    this.addDirty(payout);
    this.state.stats.sold += qty;
    this.state.stats.earned += payout;
    this.state.stats.sales++;
    this.state.stats.bestSale = Math.max(this.state.stats.bestSale, payout);
    if (quality >= 70) this.state.stats.qualitySold += qty;
    const pricing = PRICING[this.state.pricing] || PRICING.standard;
    let repGain = (substitute ? .25 : .6) * pricing.rep * (qty < c.grams ? .5 : 1);
    this.state.rep = clamp(this.state.rep + repGain, 0, 100);
    const heatGain = (0.5 + qty * .05) * pricing.heat * this.heatGainMult * (1 + (this.propConfig.priceMod - 1) * .3);
    this.state.heat = clamp(this.state.heat + heatGain, 0, 100);
    c.served = true; c.servedQty = qty; c.state = 'leave'; c.target = this.propConfig.door;
    c.paid = payout;
    this.emit('sale', { customer: c, payout, qty, strainId, quality, auto, substitute });
    return { ok: true, payout, qty, quality, strainId };
  }

  autoServe() {
    const c = this.runtime.customers.find(x => x.state === 'wait' && !x.served);
    if (!c) return false;
    const r = this.serveCustomer(c, true);
    return r.ok;
  }

  quickSale(grams, mult = 1) {
    const lot = this.bestStock();
    if (!lot || lot.g < grams) return 0;
    const strainId = lot.id;
    const unit = this.sellPrice(strainId, lot.q, mult);
    const payout = Math.max(1, round(unit * grams));
    this.removeStockOf(strainId, grams);
    this.addDirty(payout);
    this.state.stats.sold += grams;
    this.state.stats.earned += payout;
    this.state.stats.sales++;
    if (lot.q >= 70) this.state.stats.qualitySold += grams;
    this.emit('sale', { payout, qty: grams, strainId, quality: lot.q, quick: true });
    return payout;
  }

  updateCustomers(dt) {
    const prop = this.propConfig;
    for (const c of this.runtime.customers) {
      if (c.state === 'enter') {
        const dx = c.qx - c.x, dy = c.qy - c.y, dist = Math.hypot(dx, dy);
        if (dist < .12) { c.x = c.qx; c.y = c.qy; c.state = 'wait'; c.patience = c.maxPatience; }
        else { c.x += dx / dist * 1.7 * dt; c.y += dy / dist * 1.7 * dt; c.wobble += dt * 7; }
      } else if (c.state === 'wait') {
        c.patience -= dt;
        c.wobble += dt * 2;
        if (c.patience <= 0) {
          c.state = 'leave'; c.target = prop.door;
          this.state.rep = clamp(this.state.rep - .9, 0, 100);
          this.emit('angry', { customer: c });
        }
      } else if (c.state === 'leave') {
        const dx = prop.door[0] - c.x, dy = prop.door[1] - c.y, dist = Math.hypot(dx, dy);
        if (dist < .2) c.dead = true;
        else { c.x += dx / dist * 2.1 * dt; c.y += dy / dist * 2.1 * dt; c.wobble += dt * 9; }
      }
    }
    this.runtime.customers = this.runtime.customers.filter(c => !c.dead);
  }

  // ---------- main loop ----------
  update(dt) {
    dt = Math.min(dt || 0, .5);
    const s = this.state;
    s.clock += dt;
    s.stats.played += dt;
    const paused = this.runtime.uiPaused || this.runtime.pendingEvent;

    // plants grow in every owned property
    for (const p of PROPERTY_LIST) {
      const ps = s.properties[p.id];
      if (!ps?.owned) continue;
      ps.slots.forEach(slot => {
        if (!slot || slot.progress >= 1) return;
        slot.progress = Math.min(1, slot.progress + this.growthRate(p.id, slot) * dt);
        if (slot.progress >= 1 && !slot.notified) {
          slot.notified = true;
          if (p.id === s.activeProperty) this.emit('ready', { propId: p.id, slot });
        }
      });
    }

    // active room customers
    if (!paused) {
      this.updateCustomers(dt);
      this.runtime.spawnTimer -= dt;
      if (this.runtime.spawnTimer <= 0 && !this.layLowActive && s.heat < 96) {
        this.spawnCustomer();
        const busy = this.runtime.customers.filter(c => c.state === 'wait' || c.state === 'enter').length;
        const base = clamp(9.5 - s.rep / 16 - PROPERTY_LIST.findIndex(x => x.id === s.activeProperty) * .5 + (s.heat > 60 ? 2 : 0) + busy * .8, 3.2, 11);
        this.runtime.spawnTimer = base * rnd(.85, 1.2);
      }
      // staff automation
      this.updateStaff(dt);
      // random events
      this.runtime.eventTimer -= dt;
      if (this.runtime.eventTimer <= 0 && s.story.idx >= 1 && !this.runtime.pendingEvent) {
        this.triggerRandomEvent();
        this.runtime.eventTimer = rnd(80, 130);
      }
    }

    // fronts: passive laundering + heat relief
    this.updateFronts(dt);

    // heat cools slowly, security and lawyer help
    const cooling = .1 + (s.fronts.includes('legal') ? .2 : 0) + this.propState.upgrades.security * .02;
    s.heat = Math.max(0, s.heat - cooling * dt);

    // day clock
    s.dayTime += dt;
    if (s.dayTime >= DAY_LENGTH) {
      s.dayTime -= DAY_LENGTH;
      s.day++;
      this.payWages();
      this.emit('day', { day: s.day });
    }

    // raids
    this.runtime.raidCooldown = Math.max(0, this.runtime.raidCooldown - dt);
    if (s.heat >= 100 && this.runtime.raidCooldown <= 0 && !paused) this.triggerRaid(false);

    // autosave
    this.runtime.autosave += dt;
    if (this.runtime.autosave > 12) { this.runtime.autosave = 0; this.save(); }
  }

  updateStaff(dt) {
    const st = this.runtime.staffTimers;
    if (this.state.staff.includes('bea')) {
      st.bea = (st.bea || 0) + dt;
      if (st.bea >= 8) {
        st.bea = 0;
        for (const p of PROPERTY_LIST) {
          const ps = this.state.properties[p.id];
          if (!ps?.owned) continue;
          const i = ps.slots.findIndex(slot => slot && slot.progress >= 1);
          if (i >= 0) { this.harvest(p.id, i, true); break; }
        }
      }
    }
    if (this.state.staff.includes('tito')) {
      st.tito = (st.tito || 0) + dt;
      if (st.tito >= 6) { st.tito = 0; this.autoServe(); }
    }
  }

  updateFronts(dt) {
    if (!this.state.fronts.length || this.state.dirty <= 0) return;
    const rateMult = this.state.fronts.includes('legal') ? 1.06 : 1;
    const legalBonus = this.state.fronts.includes('legal') ? .03 : 0;
    let dirtyRate = 0, cleanRate = 0;
    for (const id of this.state.fronts) {
      const f = FRONT_BY_ID[id];
      if (!f || !f.rate) continue;
      const raw = (f.rate / 60) * rateMult * dt;
      dirtyRate += raw;
      cleanRate += raw * Math.min(.92, f.conv + legalBonus);
    }
    if (dirtyRate <= 0) return;
    const actual = Math.min(this.state.dirty, dirtyRate);
    this.state.dirty -= actual;
    this.state.clean += actual * (cleanRate / dirtyRate);
    this.state.stats.laundered += actual;
  }

  payWages() {
    let paid = 0;
    const remaining = [];
    for (const id of this.state.staff) {
      const staff = STAFF_BY_ID[id];
      if (!staff) continue;
      if (this.spendDirty(staff.wage)) { paid++; remaining.push(id); }
      else this.emit('toast', { text: `${staff.name} quit: you couldn't cover the $${staff.wage} wage.`, kind: 'bad' });
    }
    this.state.staff = remaining;
    if (paid) this.emit('toast', { text: `Payday: $${this.state.staff.reduce((n, id) => n + STAFF_BY_ID[id].wage, 0)} in wages paid.`, kind: 'info' });
  }

  // ---------- purchases & upgrades ----------
  upgradeCost(id, level) {
    const u = UPGRADE_BY_ID[id];
    if (!u) return 0;
    return Math.round(u.base * Math.pow(u.growth, level));
  }
  buyUpgrade(propId, id) {
    const ps = this.state.properties[propId];
    const u = UPGRADE_BY_ID[id];
    if (!ps?.owned || !u) return { ok: false };
    const lvl = ps.upgrades[id] || 0;
    if (lvl >= u.max) return { ok: false, msg: 'Already maxed out.' };
    const cost = this.upgradeCost(id, lvl);
    if (!this.spendDirty(cost)) return { ok: false, msg: `Need $${cost} dirty cash.` };
    ps.upgrades[id] = lvl + 1;
    this.emit('upgrade', { propId, id, level: lvl + 1 });
    this.save();
    return { ok: true, cost };
  }

  buyProperty(id) {
    const p = PROPERTIES[id];
    const ps = this.state.properties[id];
    if (!p || !ps) return { ok: false };
    if (ps.owned) { this.moveProperty(id); return { ok: true, moved: true }; }
    if (this.state.story.idx < p.reqMission) return { ok: false, msg: 'Keep working the story to unlock this property.' };
    if (this.state.clean < p.cost) return { ok: false, msg: `Need $${p.cost.toLocaleString()} clean cash.` };
    this.state.clean -= p.cost;
    ps.owned = true;
    this.state.activeProperty = id;
    this.runtime.customers = [];
    this.runtime.spawnTimer = 4;
    this.emit('propertyBought', { id, p });
    this.save();
    return { ok: true };
  }
  moveProperty(id) {
    if (!this.state.properties[id]?.owned) return { ok: false };
    this.state.activeProperty = id;
    this.runtime.customers = [];
    this.runtime.spawnTimer = 3;
    this.emit('property', { id });
    this.save();
    return { ok: true };
  }

  hireStaff(id) {
    const staff = STAFF_BY_ID[id];
    if (!staff) return { ok: false };
    if (!this.staffUnlocked()) return { ok: false, msg: 'The crew unlocks after the garage.' };
    if (this.state.staff.includes(id)) return { ok: false, msg: 'Already on the payroll.' };
    if (!this.spendDirty(staff.cost)) return { ok: false, msg: `Need $${staff.cost} dirty cash.` };
    this.state.staff.push(id);
    this.emit('hire', { staff });
    this.save();
    return { ok: true, staff };
  }

  buyFront(id) {
    const f = FRONT_BY_ID[id];
    if (!f) return { ok: false };
    if (!this.frontsUnlocked()) return { ok: false, msg: 'Lenny introduces fronts later in the story.' };
    if (this.state.story.idx < f.req) return { ok: false, msg: 'Not available yet.' };
    if (this.state.fronts.includes(id)) return { ok: false, msg: 'Already owned.' };
    if (this.state.clean < f.cost) return { ok: false, msg: `Need $${f.cost.toLocaleString()} clean cash.` };
    this.state.clean -= f.cost;
    this.state.fronts.push(id);
    if (f.rep) this.state.rep = clamp(this.state.rep + f.rep, 0, 100);
    this.emit('frontBought', { f });
    this.save();
    return { ok: true, f };
  }

  launder(amount) {
    if (!this.frontsUnlocked()) return { ok: false, msg: 'Meet Lenny first.' };
    let amt = amount === 'all' ? this.state.dirty : Number(amount);
    amt = Math.min(Math.floor(amt), Math.floor(this.state.dirty));
    if (!amt || amt < 10) return { ok: false, msg: 'Minimum wash is $10 dirty.' };
    const rate = .72 + (this.state.fronts.includes('legal') ? .06 : 0);
    const cleanGain = Math.floor(amt * rate);
    this.state.dirty -= amt;
    this.state.clean += cleanGain;
    this.state.heat = Math.max(0, this.state.heat - Math.min(14, 2 + amt / 260));
    this.state.stats.laundered += amt;
    this.emit('launder', { amount: amt, cleanGain, rate });
    this.save();
    return { ok: true, amount: amt, cleanGain };
  }

  bribeCost() {
    return Math.floor((180 + this.state.heat * 9) * (this.state.fronts.includes('legal') ? .8 : 1));
  }
  bribe() {
    const cost = this.bribeCost();
    if (this.state.heat < 6) return { ok: false, msg: 'Nobody is interested in a bribe right now.' };
    if (!this.spendDirty(cost)) return { ok: false, msg: `Need $${cost} dirty cash.` };
    this.state.heat = Math.max(0, this.state.heat - 26);
    this.emit('bribe', { cost });
    this.save();
    return { ok: true, cost };
  }
  layLow(seconds = 50) {
    this.state.layLowUntil = this.state.clock + seconds;
    this.state.heat = Math.max(0, this.state.heat - 9);
    this.emit('laylow', { seconds });
    this.toast(`Lights out. No customers for ${seconds}s. Heat falling.`, 'info');
    return { ok: true };
  }

  buyBuff(id) {
    const b = BUFFS.find(x => x.id === id);
    if (!b) return { ok: false };
    if (!this.spendDirty(b.cost)) return { ok: false, msg: `Need $${b.cost} dirty cash.` };
    this.addBuff(id, 3);
    this.save();
    return { ok: true, b };
  }

  // ---------- chemistry ----------
  canRefine() { return this.state.properties.lab.owned; }
  refineStart(strainId) {
    if (!this.canRefine()) return { ok: false, msg: 'You need the underground lab.' };
    const lot = this.state.inventory[strainId];
    if (!lot || lot.g < 10) return { ok: false, msg: 'Refining needs at least 10g of one strain.' };
    return { ok: true, strainId, grams: lot.g, quality: lot.q, cost: 60, instantCost: 150 };
  }
  refineResolve(strainId, bonus = 10, instant = false) {
    if (!this.canRefine()) return { ok: false, msg: 'You need the underground lab.' };
    const lot = this.state.inventory[strainId];
    if (!lot || lot.g < 10) return { ok: false, msg: 'Not enough grams any more.' };
    const cost = instant ? 150 : 60;
    if (!this.spendDirty(cost)) return { ok: false, msg: `Need $${cost} dirty cash.` };
    const oldQ = lot.q;
    this.removeStockOf(strainId, 10);
    const newQ = clamp(round(oldQ + bonus), 10, 100);
    this.addStock(strainId, 8, newQ);
    this.state.stats.refined++;
    this.state.heat = clamp(this.state.heat + (instant ? .4 : 1.2), 0, 100);
    this.emit('refine', { strainId, oldQ, newQ, bonus });
    this.save();
    return { ok: true, oldQ, newQ, cost };
  }

  // ---------- story ----------
  markStorySeen() { this.state.story.seen = true; this.save(); }
  missionBase() {
    return {
      harvests: this.state.stats.harvests, sold: this.state.stats.sold,
      laundered: this.state.stats.laundered, refined: this.state.stats.refined,
      qualitySold: this.state.stats.qualitySold
    };
  }
  missionProgress() {
    const m = this.mission;
    if (!m) return null;
    const o = m.objective;
    const b = this.state.story.base || this.missionBase();
    let current = 0;
    if (o.type === 'harvest') current = this.state.stats.harvests - (b.harvests || 0);
    else if (o.type === 'sellGrams') current = this.state.stats.sold - (b.sold || 0);
    else if (o.type === 'launder') current = this.state.stats.laundered - (b.laundered || 0);
    else if (o.type === 'refine') current = this.state.stats.refined - (b.refined || 0);
    else if (o.type === 'sellQuality') current = this.state.stats.qualitySold - (b.qualitySold || 0);
    else if (o.type === 'ownProperty') current = this.state.properties[o.property]?.owned ? 1 : 0;
    else if (o.type === 'ownFront') current = this.state.fronts.length;
    else if (o.type === 'heatBelow') current = this.state.heat <= o.target ? 1 : 0;
    const target = o.target || 1;
    return { current: Math.min(current, target), raw: current, target, label: o.label, pct: clamp(current / target, 0, 1), complete: current >= target };
  }
  completeMission() {
    const m = this.mission;
    if (!m) return { ok: false };
    const prog = this.missionProgress();
    if (!prog?.complete) return { ok: false, msg: 'Objective not complete yet.' };
    const r = m.reward || {};
    this.state.dirty += r.dirty || 0;
    this.state.clean += r.clean || 0;
    this.state.rep = clamp(this.state.rep + (r.rep || 0), 0, 100);
    this.state.heat = clamp(this.state.heat + (r.heat || 0), 0, 100);
    if (r.dirty || r.clean) this.emit('missionReward', { dirty: r.dirty || 0, clean: r.clean || 0 });
    const ending = !!r.ending;
    if (ending) this.state.flags.ending = true;
    this.state.story.idx++;
    this.state.story.seen = false;
    this.state.story.base = this.missionBase();
    this.state.story.completed = (this.state.story.completed || 0) + 1;
    this.save();
    this.emit('missionComplete', { mission: m, next: this.mission });
    return { ok: true, mission: m, reward: r, next: this.mission, ending, betrayal: !!r.raid };
  }

  // ---------- danger ----------
  triggerRaid(scripted = false) {
    const sec = this.propState?.upgrades?.security || 0;
    const mult = (1 - sec * .08) * (this.state.staff.includes('bruno') ? .88 : 1);
    const before = { dirty: this.state.dirty, grams: this.stockGrams() };
    const dirtyLoss = Math.floor(this.state.dirty * .3 * mult);
    this.state.dirty -= dirtyLoss;
    let stockLoss = 0;
    for (const id of Object.keys(this.state.inventory)) {
      const lot = this.state.inventory[id];
      const take = Math.floor(lot.g * .4 * mult);
      if (take > 0) { lot.g -= take; stockLoss += take; }
      if (lot.g <= .01) delete this.state.inventory[id];
    }
    const destroyedProp = this.state.activeProperty;
    const ps = this.state.properties[destroyedProp];
    const plantIdx = ps.slots.findIndex(x => x);
    if (plantIdx >= 0) ps.slots[plantIdx] = null;
    this.state.heat = 22;
    this.state.rep = clamp(this.state.rep - 10, 0, 100);
    this.state.stats.raids++;
    this.runtime.customers = [];
    this.runtime.raidCooldown = this.state.clock + 90;
    this.state.layLowUntil = this.state.clock + 25;
    const info = { dirtyLoss, stockLoss, gramsBefore: before.grams, plantLost: plantIdx >= 0, scripted };
    this.save();
    this.emit('raid', info);
    return info;
  }

  triggerBetrayal() {
    const before = this.state.dirty;
    const dirtyLoss = Math.floor(this.state.dirty * .36);
    this.state.dirty -= dirtyLoss;
    let stockLoss = 0;
    for (const id of Object.keys(this.state.inventory)) {
      const lot = this.state.inventory[id];
      const take = Math.ceil(lot.g * .3);
      lot.g = Math.max(0, lot.g - take);
      stockLoss += take;
      if (lot.g <= .01) delete this.state.inventory[id];
    }
    this.state.heat = 48;
    this.state.rep = clamp(this.state.rep - 8, 0, 100);
    this.state.flags.betrayed = true;
    this.state.flags.dexGone = true;
    this.state.stats.raids++;
    this.runtime.customers = [];
    this.runtime.raidCooldown = this.state.clock + 100;
    this.state.layLowUntil = this.state.clock + 35;
    const info = { dirtyLoss, stockLoss, before, cashBefore: before };
    this.save();
    this.emit('betrayal', info);
    return info;
  }

  stallRandomPlant() {
    const ps = this.propState;
    const idx = ps.slots.findIndex(x => x && x.progress < 1);
    if (idx >= 0) { ps.slots[idx].progress = Math.max(0, ps.slots[idx].progress - .28); return true; }
    return false;
  }

  triggerRandomEvent() {
    const eligible = EVENTS.filter(e => !this.runtime.lastEvents?.includes(e.id) && (!e.requires || e.requires(this)));
    if (!eligible.length) return;
    const e = eligible[Math.floor(Math.random() * eligible.length)];
    this.runtime.lastEvents = [...(this.runtime.lastEvents || []).slice(-3), e.id];
    this.runtime.pendingEvent = e;
    this.emit('event', e);
  }
  resolveEvent(index) {
    const e = this.runtime.pendingEvent;
    if (!e) return { ok: false };
    const choice = e.choices[index];
    if (!choice) return { ok: false };
    let result = '';
    try { result = choice.run(this) || ''; } catch (err) { result = 'The moment passes.'; }
    this.runtime.pendingEvent = null;
    this.save();
    this.emit('eventResolved', { event: e, choice, result });
    return { ok: true, result, event: e };
  }

  // ---------- interaction dispatcher ----------
  interact(hit) {
    if (!hit) return null;
    if (hit.kind === 'slot') {
      const slot = this.state.properties[hit.propId]?.slots[hit.index];
      if (!slot) {
        const r = this.plant(hit.propId, hit.index);
        if (!r.ok) this.toast(r.msg, 'warn');
        else this.toast(`${r.strain.name} planted. Tap it to tend if you like.`, 'good');
        return r;
      }
      if (slot.progress >= 1) {
        const r = this.harvest(hit.propId, hit.index);
        if (r) {
          const grade = gradeFor(r.quality);
          this.toast(`Harvested ${r.grams}g ${r.strain.short} · Q${r.quality} ${grade.name}`, 'good');
        }
        return r;
      }
      const r = this.tend(hit.propId, hit.index);
      if (r.ok) this.emit('toast', { text: 'Watered and tended. Quality up.', kind: 'info', quiet: true });
      else if (r.msg) this.toast(r.msg, 'info');
      return r;
    }
    if (hit.kind === 'customer') {
      const c = this.runtime.customers.find(x => x.id === hit.id);
      const r = this.serveCustomer(c);
      if (!r.ok && r.msg) this.toast(r.msg, 'warn');
      return r;
    }
    if (hit.kind === 'counter') { this.emit('uiAction', { action: 'panel', panel: 'grow' }); return null; }
    if (hit.kind === 'reactor') { this.emit('uiAction', { action: 'refine' }); return null; }
    if (hit.kind === 'laundry') { this.emit('uiAction', { action: 'panel', panel: 'laundry' }); return null; }
    return null;
  }

  setPaused(v) { this.runtime.uiPaused = !!v; }

  netWorth() {
    let inv = 0;
    for (const [id, lot] of Object.entries(this.state.inventory)) {
      if (!lot?.g) continue;
      inv += lot.g * this.sellPrice(id, lot.q, 1);
    }
    const propVal = PROPERTY_LIST.filter(p => this.state.properties[p.id].owned).reduce((n, p) => n + p.cost * .6, 0);
    const frontVal = this.state.fronts.reduce((n, id) => n + FRONT_BY_ID[id].cost * .7, 0);
    return Math.floor(this.totalCash + inv + propVal + frontVal);
  }

  heatLabel() {
    const h = this.state.heat;
    if (h >= 85) return 'RAID IMMINENT';
    if (h >= 65) return 'UNDER SURVEILLANCE';
    if (h >= 40) return 'QUESTIONS ASKED';
    if (h >= 20) return 'ON THE RADAR';
    return 'INVISIBLE';
  }

  //__MORE__
}
