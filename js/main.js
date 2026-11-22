import {
  STARTING_STATE, SITES, ARTIFACTS, UPGRADES, TOTAL_RELICS,
  rankFor, artifactFor, levelFor, upgradeCost, cleaningGrade
} from './data.js';
import { sceneSVG, drawArtifact, iconSvg } from './art.js';
import { AudioEngine } from './audio.js';
import { DigScene } from './dig.js';
import { CleanScene } from './clean.js';

const STORE_KEY = 'dune_and_dust_save_v3';
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

const audio = new AudioEngine();
let digScene = null;
let cleanScene = null;
let shopTab = 'field';
let lastScreen = 'home';
let modalActions = [];
let auctionTimers = [];
let auctionSale = null;
const imageCache = new Map();

/* ---------------------------------------------------------
   State
   --------------------------------------------------------- */
function freshState() {
  return JSON.parse(JSON.stringify(STARTING_STATE));
}

function loadState() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY));
    if (!raw || typeof raw !== 'object') return freshState();
    return {
      ...freshState(),
      ...raw,
      levels: { ...STARTING_STATE.levels, ...(raw.levels || {}) },
      flags: { ...STARTING_STATE.flags, ...(raw.flags || {}) },
      collection: Array.isArray(raw.collection) ? raw.collection : [],
      currentRelic: raw.currentRelic && typeof raw.currentRelic === 'object' ? raw.currentRelic : null,
      selectedSite: Number.isFinite(raw.selectedSite) ? clamp(raw.selectedSite, 0, SITES.length - 1) : 0
    };
  } catch {
    return freshState();
  }
}

const state = loadState();

function save() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch {
    // A full gallery should never break the expedition.
  }
}

function artifactImage(id, size = 340) {
  const key = `${id}_${size}`;
  if (imageCache.has(key)) return imageCache.get(key);
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  drawArtifact(ctx, artifactFor(id).art, size / 2, size / 2, size * .88);
  const url = c.toDataURL('image/webp', .92);
  imageCache.set(key, url);
  return url;
}

/* ---------------------------------------------------------
   Utilities
   --------------------------------------------------------- */
function money(n) {
  return '$' + Math.round(n).toLocaleString('en-US');
}

function formatName(name) {
  const words = name.split(' ');
  if (words.length <= 2) return name;
  if (name.startsWith('The ')) {
    return `${words.slice(0, 2).join(' ')}<br>${words.slice(2).join(' ')}`;
  }
  const mid = Math.ceil(words.length / 2);
  return `${words.slice(0, mid).join(' ')}<br>${words.slice(mid).join(' ')}`;
}

function siteIndexLabel(site) {
  return `Site ${String(site.index).padStart(2, '0')} · ${site.region.split(' · ')[0]}`;
}

function gradeText(condition) {
  if (condition >= 96) return 'Museum';
  if (condition >= 89) return 'Excellent';
  if (condition >= 80) return 'Fine';
  if (condition >= 70) return 'Stable';
  return 'Study';
}

function gradeLetter(condition) {
  if (condition >= 96) return 'A+';
  if (condition >= 90) return 'A';
  if (condition >= 84) return 'B+';
  if (condition >= 76) return 'B';
  if (condition >= 68) return 'C';
  return 'D';
}

function vibrate(pattern) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

function updateSoundButtons() {
  $$('.sound-btn').forEach(btn => {
    const use = btn.querySelector('use');
    if (use) use.setAttribute('href', audio.muted ? '#i-mute' : '#i-sound');
    btn.setAttribute('aria-label', audio.muted ? 'Unmute sound' : 'Mute sound');
  });
}

function updateWallet(bump = false) {
  $$('.coin-value').forEach(el => { el.textContent = Math.round(state.coins).toLocaleString('en-US'); });
  if (bump) {
    $$('.wallet').forEach(el => {
      el.classList.remove('is-bumping');
      void el.offsetWidth;
      el.classList.add('is-bumping');
    });
  }
}

let toastTimer = 0;
function toast(message, duration = 2500) {
  const layer = $('#toastLayer');
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  layer.appendChild(el);
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    el.classList.add('is-leaving');
    setTimeout(() => el.remove(), 320);
  }, duration);
}

/* ---------------------------------------------------------
   Modal
   --------------------------------------------------------- */
function openModal({ kicker = 'A note from the field', title, text = '', bodyHTML = '', actions = [] }) {
  $('#modalKicker').textContent = kicker;
  $('#modalTitle').textContent = title;
  const textEl = $('#modalText');
  if (bodyHTML) textEl.innerHTML = bodyHTML;
  else {
    textEl.textContent = text;
    textEl.hidden = !text;
  }
  if (bodyHTML) textEl.hidden = false;
  const wrap = $('#modalActions');
  wrap.innerHTML = '';
  modalActions = actions;
  actions.forEach((action, index) => {
    const btn = document.createElement('button');
    btn.className = action.style === 'ghost' ? 'ghost-btn' : 'primary-btn';
    btn.innerHTML = action.style === 'ghost' ? `<span>${action.label}</span>` : `<span>${action.label}</span>${iconSvg('i-arrow')}`;
    btn.addEventListener('click', () => {
      audio.click();
      closeModal();
      action.onClick?.();
    });
    wrap.appendChild(btn);
  });
  $('#modal').hidden = false;
}

function closeModal() {
  $('#modal').hidden = true;
  modalActions = [];
}

function guideModal(kind) {
  const isDig = kind === 'dig';
  openModal({
    kicker: isDig ? 'Field manual · excavation' : 'Conservation notes',
    title: isDig ? 'Read the sand.' : 'Slow hands, bright gold.',
    bodyHTML: `
      <div class="guide-steps">
        <div class="guide-step"><span class="guide-num">1</span><span><strong>${isDig ? 'Sweep with a finger' : 'Brush the grime'}</strong><span>${isDig ? 'Drag across the trench to move sand. Watch the signal meter climb.' : 'Use the dry brush to lift loose dirt from the surface.'}</span></span></div>
        <div class="guide-step"><span class="guide-num">2</span><span><strong>${isDig ? 'Clear around the signal' : 'Mist away the salt'}</strong><span>${isDig ? 'The artifact appears once enough overburden is gone. Pulse the scanner if you lose it.' : 'Switch to water. Salt crust only dissolves under a controlled mist.'}</span></span></div>
        <div class="guide-step"><span class="guide-num">3</span><span><strong>${isDig ? 'Lift the find' : 'Buff to a shine'}</strong><span>${isDig ? 'At 55% exposure the lift button wakes up. Take it back to the lab.' : 'Polish with the cloth, then send the relic to appraisal.'}</span></span></div>
      </div>`,
    actions: [{ label: isDig ? 'Back to the trench' : 'Back to the bench', style: 'primary' }]
  });
}

/* ---------------------------------------------------------
   Navigation
   --------------------------------------------------------- */
const SCREENS = ['home', 'dig', 'clean', 'appraise', 'lab', 'museum', 'shop'];

function showScreen(name) {
  const next = $(`#screen-${name}`);
  if (!next) return;
  $$('.screen').forEach(screen => screen.classList.remove('is-active'));
  next.classList.add('is-active');
  lastScreen = name;
  $$('.tab').forEach(tab => {
    const active = tab.dataset.nav === name || (name === 'dig' && tab.dataset.nav === 'home');
    tab.classList.toggle('is-active', active);
  });
  $('#toastLayer').classList.toggle('is-top', ['dig', 'clean', 'appraise'].includes(name));
  if (name === 'home') renderHome();
  if (name === 'lab') renderLab();
  if (name === 'museum') renderMuseum();
  if (name === 'shop') renderShop();
}

function goHome() {
  stopDig();
  stopClean();
  showScreen('home');
  updateWallet();
}

function stopDig() {
  if (digScene) {
    digScene.destroy();
    digScene = null;
  }
}

function stopClean() {
  if (cleanScene) {
    cleanScene.destroy();
    cleanScene = null;
  }
}

/* ---------------------------------------------------------
   Home
   --------------------------------------------------------- */
function renderHome() {
  const site = SITES[state.selectedSite];
  const locked = state.renown < site.unlock;
  const hero = $('#hero');
  hero.classList.toggle('is-locked', locked);
  $('#heroArt').innerHTML = sceneSVG(site);
  $('#heroSiteTag').textContent = siteIndexLabel(site);
  $('#heroCoord').textContent = site.coord;
  $('#heroEyebrow').textContent = `Expedition ${String(site.index).padStart(2, '0')} · ${state.collection.length} relic${state.collection.length === 1 ? '' : 's'} recovered`;
  $('#heroTitle').innerHTML = formatName(site.name);
  $('#heroSub').textContent = site.subtitle;
  $('#journalKicker').textContent = `Field note · Site ${String(site.index).padStart(2, '0')}`;
  $('#journalText').textContent = site.flavor;
  $('#heroLocked').hidden = !locked;
  $('#heroLockText').textContent = `Requires ${site.unlock} renown`;
  const cta = $('#heroCtaText');
  if (state.currentRelic) {
    cta.textContent = state.currentRelic.condition != null ? 'Appraise your find' : 'Clean your find';
  } else if (locked) {
    cta.textContent = `Reach ${site.unlock} renown`;
  } else {
    cta.textContent = 'Begin excavation';
  }

  const rail = $('#siteRail');
  rail.innerHTML = SITES.map((s, i) => {
    const isLocked = state.renown < s.unlock;
    return `<button class="site-chip ${i === state.selectedSite ? 'is-active' : ''} ${isLocked ? 'is-locked' : ''}" data-site="${i}" aria-label="${s.name}${isLocked ? ' locked' : ''}">
      <span class="site-index">0${s.index}</span>
      <span class="site-name">${s.shortName}</span>
      ${isLocked ? `<svg class="site-lock"><use href="#i-lock"></use></svg>` : ''}
    </button>`;
  }).join('');
  $$('.site-chip', rail).forEach(chip => {
    chip.addEventListener('click', () => {
      state.selectedSite = Number(chip.dataset.site);
      save();
      audio.click();
      renderHome();
    });
  });

  $('#statRecovered').textContent = state.collection.length;
  $('#statRenown').textContent = state.renown;
  $('#statRank').textContent = '· ' + rankFor(state.renown);
  $('#fieldBookCount').textContent = `${new Set(state.collection.map(item => item.artifactId)).size} / ${TOTAL_RELICS}`;

  const dispatch = nextObjective();
  $('#dispatchText').textContent = dispatch.text;
  $('#dispatchReward').textContent = dispatch.reward;
  updateBadges();
  updateWallet();
}

function nextObjective() {
  if (state.currentRelic?.condition != null) return { text: 'Appraise the find on your bench', reward: 'LAB' };
  if (state.currentRelic) return { text: 'Finish restoring your latest find', reward: 'LAB' };
  if (state.collection.length === 0) return { text: 'Recover your first relic', reward: '+150' };
  if (state.renown < SITES[1].unlock) return { text: `Reach ${SITES[1].unlock} renown to open the Salt Temple`, reward: 'RENOWN' };
  if (state.collection.length < 3) return { text: 'Deliver three relics to the gallery', reward: '+200' };
  if (state.renown < SITES[2].unlock) return { text: `Reach ${SITES[2].unlock} renown for the Bone Valley`, reward: 'RENOWN' };
  return { text: 'Bring home a museum-grade treasure', reward: '★' };
}

function updateBadges() {
  $$('.tab-badge').forEach(el => { el.hidden = !state.currentRelic; });
}

function selectSite(delta) {
  state.selectedSite = (state.selectedSite + delta + SITES.length) % SITES.length;
  save();
  audio.click();
  renderHome();
}

function beginDig() {
  audio.ensure();
  if (state.currentRelic) {
    routeCurrentRelic();
    return;
  }
  const site = SITES[state.selectedSite];
  if (state.renown < site.unlock) {
    audio.error();
    toast(`${site.name} opens at ${site.unlock} renown. Sell a find to the museum.`, 3200);
    return;
  }
  startDig(site);
}

function routeCurrentRelic() {
  if (!state.currentRelic) return;
  if (state.currentRelic.condition != null) {
    showScreen('appraise');
    renderAppraisal();
  } else {
    startClean();
  }
}

/* ---------------------------------------------------------
   Dig
   --------------------------------------------------------- */
function startDig(site) {
  stopDig();
  stopClean();
  const artifactId = (state.collection.length === 0 && !state.flags.firstRelic && site.index === 1)
    ? 'dinar'
    : site.artifacts[Math.floor(Math.random() * site.artifacts.length)];
  const artifact = artifactFor(artifactId);

  $('#digSiteLabel').textContent = siteIndexLabel(site);
  $('#digSiteName').textContent = site.name;
  $('#digHint').classList.remove('is-hidden');
  $('#exposureValue').textContent = '0%';
  $('#exposureBar').style.width = '0%';
  $('#digStratum').textContent = 'Stratum I';
  $('#digDepth').textContent = '0.0 m';
  $('#digSignal').textContent = 'Signal 70%';
  $('#digNote').textContent = 'Sweep the topsoil to find the signal';
  $('#liftBtn').disabled = true;
  $('#liftBtn span').textContent = 'Lift the find';
  showScreen('dig');
  updateWallet();

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      digScene = new DigScene({
        canvas: $('#digCanvas'),
        stage: $('#digStage'),
        state,
        site,
        artifact,
        audio,
        onUpdate: ({ pct, stratum, depth, found, signal }) => {
          $('#exposureValue').textContent = `${pct}%`;
          $('#exposureBar').style.width = `${pct}%`;
          $('#digStratum').textContent = `Stratum ${stratum}`;
          $('#digDepth').textContent = `${depth} m`;
          $('#digSignal').textContent = `Signal ${signal}%`;
          $('#liftBtn').disabled = !found;
          if (found) {
            $('#digNote').textContent = 'Artifact exposed — lift it before the wind shifts';
            $('#liftBtn span').textContent = 'Lift the find';
          } else if (pct > 28) {
            $('#digNote').textContent = 'Keep sweeping — the signal is getting stronger';
          }
        },
        onFound: () => {
          toast(`${artifact.shortName} exposed · lift the find`, 2400);
          $('#digStage').classList.add('is-found');
        },
        onLift: () => {
          const sieve = levelFor(state, 'sieve');
          const chance = .12 + sieve * .1;
          let bonus = 0;
          if (Math.random() < chance) {
            bonus = 30 + sieve * 25 + Math.floor(Math.random() * 30);
            state.coins += bonus;
            audio.coin();
            updateWallet(true);
          }
          state.currentRelic = {
            artifactId,
            siteId: site.id,
            condition: null,
            dirt: 1,
            salt: 1,
            polish: 0,
            bonus,
            foundAt: Date.now()
          };
          save();
          stopDig();
          toast(bonus ? `Find lifted · bonus cache +${money(bonus)}` : 'Find lifted · off to the lab', 2600);
          startClean();
        }
      });
      const stage = $('#digStage');
      stage.addEventListener('dig-start', () => {
        $('#digHint').classList.add('is-hidden');
        state.flags.tutorialDig = true;
        save();
      }, { once: true });
    });
  });
}

function pulseScan() {
  if (!digScene) return;
  digScene.pulse();
  const scan = $('#digScan');
  scan.classList.remove('is-pinging');
  void scan.offsetWidth;
  scan.classList.add('is-pinging');
  toast('Pulse sent · dense shape beneath the sand', 1600);
}

/* ---------------------------------------------------------
   Clean
   --------------------------------------------------------- */
function startClean() {
  if (!state.currentRelic) {
    showScreen('lab');
    return;
  }
  stopClean();
  stopDig();
  const artifact = artifactFor(state.currentRelic.artifactId);
  const site = SITES.find(s => s.id === state.currentRelic.siteId) || SITES[0];

  $('#cleanRelicLabel').textContent = 'Unidentified find';
  $('#cleanFragility').textContent = artifact.fragility >= 3 ? 'Fragile' : 'Stable';
  $('#cleanGrade').textContent = 'Field condition';
  $('#cleanHint').classList.remove('is-hidden');
  $('#cleanHint').innerHTML = `<span class="hint-tool">${iconSvg('i-brush')}</span><span>Scrub away the grime</span>`;
  $('#cleanComplete').classList.remove('is-visible');
  $('#cleanNote').textContent = 'Dry-brush the grime first';
  $('#grimeLabel').textContent = 'Grime';
  $('#saltLabel').textContent = 'Salt crust';
  $('#grimeBar').style.width = '100%';
  $('#saltBar').style.width = '100%';
  $('#grimePct').textContent = '100%';
  $('#saltPct').textContent = '100%';
  $('#appraiseBtn').disabled = true;
  $('#appraiseBtn span').textContent = 'Appraise';
  $$('.tool-btn').forEach(btn => btn.classList.remove('is-suggested'));
  selectTool('brush', false);
  showScreen('clean');
  updateWallet();

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      cleanScene = new CleanScene({
        canvas: $('#cleanCanvas'),
        stage: $('#cleanStage'),
        state,
        artifact,
        audio,
        onUpdate: ({ dirt, salt, polish, phase }) => {
          const grimePct = Math.round(dirt * 100);
          const saltPct = Math.round(salt * 100);
          $('#grimeBar').style.width = `${grimePct}%`;
          $('#grimePct').textContent = `${grimePct}%`;
          if (phase === 'clean') {
            $('#saltBar').style.width = `${saltPct}%`;
            $('#saltPct').textContent = `${saltPct}%`;
          } else {
            const lustre = Math.round(polish * 100);
            $('#saltBar').style.width = `${lustre}%`;
            $('#saltPct').textContent = `${lustre}%`;
          }
          if (phase === 'done') {
            $('#appraiseBtn').disabled = false;
            $('#cleanGrade').textContent = gradeText(state.currentRelic?.condition || 90) + ' grade';
          }
        },
        onPhase: (phase) => {
          if (phase === 'polish') {
            $('#saltLabel').textContent = 'Lustre';
            $('#cleanRelicLabel').textContent = artifact.name;
            $('#cleanHint').classList.remove('is-hidden');
            $('#cleanHint').innerHTML = `<span class="hint-tool">${iconSvg('i-cloth')}</span><span>Buff the surface with the cloth</span>`;
            $('#cleanNote').textContent = 'Buff to a museum shine';
            $$('.tool-btn').forEach(btn => btn.classList.toggle('is-suggested', btn.dataset.tool === 'cloth'));
            toast('Encrustation cleared · select the cloth to buff', 2600);
            setTimeout(() => $('#cleanHint').classList.add('is-hidden'), 3600);
          }
          if (phase === 'done') {
            $('#cleanHint').classList.add('is-hidden');
            $('#cleanComplete').classList.add('is-visible');
            $('#appraiseBtn').disabled = false;
            $('#appraiseBtn span').textContent = 'Appraise find';
            $('#cleanGrade').textContent = gradeText(state.currentRelic?.condition || 90) + ' grade';
            $('#cleanRelicLabel').textContent = artifact.name;
          }
        },
        onComplete: ({ condition, dirt, salt, polish }) => {
          if (!state.currentRelic) return;
          state.currentRelic.condition = condition;
          state.currentRelic.dirt = dirt;
          state.currentRelic.salt = salt;
          state.currentRelic.polish = polish;
          state.currentRelic.cat = state.currentRelic.cat || String(100 + state.collection.length + 1);
          save();
          $('#cleanGrade').textContent = gradeText(condition) + ' grade';
          updateBadges();
        },
        onHint: (message) => {
          $('#cleanNote').textContent = message;
        }
      });
      const stage = $('#cleanStage');
      stage.addEventListener('clean-start', () => {
        $('#cleanHint').classList.add('is-hidden');
        state.flags.tutorialClean = true;
        save();
      }, { once: true });
    });
  });
}

function selectTool(tool, notify = true) {
  $$('.tool-btn').forEach(btn => {
    btn.classList.toggle('is-active', btn.dataset.tool === tool);
    btn.classList.remove('is-suggested');
  });
  if (cleanScene) cleanScene.setTool(tool);
  if (notify) {
    const labels = { brush: 'Dry brush selected', water: 'Mister selected', cloth: 'Conservator’s cloth selected' };
    toast(labels[tool], 1000);
  }
}

function goAppraise() {
  if (!state.currentRelic || state.currentRelic.condition == null) return;
  stopClean();
  showScreen('appraise');
  renderAppraisal();
}

/* ---------------------------------------------------------
   Appraisal
   --------------------------------------------------------- */
function appraisalOffers() {
  const relic = state.currentRelic;
  if (!relic) return null;
  const artifact = artifactFor(relic.artifactId);
  const condition = relic.condition ?? 85;
  const market = Math.round(artifact.value * (.62 + (condition / 100) * .72));
  const collector = Math.round(market * (1.1 + Math.random() * .13));
  const museum = Math.round(market * .89);
  const renown = Math.round(artifact.rarity * 2.4 + condition / 15) + (state.flags.firstSale ? 0 : 3);
  return { artifact, condition, market, collector, museum, renown };
}

function renderAppraisal() {
  const relic = state.currentRelic;
  if (!relic) return;
  const offers = appraisalOffers();
  if (!offers) return;
  if (!relic.offers) {
    relic.offers = { collector: offers.collector, museum: offers.museum, renown: offers.renown, market: offers.market };
    save();
  }
  const o = relic.offers;
  const a = offers.artifact;
  $('#appraiseImg').src = artifactImage(a.id, 360);
  $('#appraiseName').textContent = a.name;
  $('#appraiseEra').textContent = a.era;
  $('#appraiseDesc').textContent = a.desc;
  $('#appraiseProvenance').textContent = a.provenance;
  $('#appraisePulse').textContent = offers.condition >= 95
    ? 'Exceptional condition · collector interest high'
    : a.rarity >= 4
      ? 'Museum-tier rarity · demand rising'
      : 'Steady demand · comparable sales this season';
  $('#appraiseCondition').textContent = `${offers.condition}%`;
  $('#appraiseMarket').textContent = money(o.market);
  $('#appraiseGrade').textContent = gradeText(offers.condition);
  $('#appraiseStamp').textContent = offers.condition >= 95 ? 'Museum grade' : offers.condition >= 84 ? 'Conserved' : 'Stable';
  $('#appraiseId').textContent = `CAT. 0${relic.cat || 101}`;
  $('#appraiseRarity').innerHTML = Array.from({ length: 5 }, (_, i) =>
    `<svg class="star ${i < a.rarity ? '' : 'empty'}"><use href="#i-star"></use></svg>`
  ).join('') + `<span class="rarity-text">${['', 'Common', 'Notable', 'Rare', 'Museum', 'Masterwork'][a.rarity]}</span>`;
  $('#museumOfferValue').textContent = money(o.museum);
  $('#collectorValue').textContent = money(o.collector);
  $('#museumOfferRenown').textContent = `+${o.renown}`;
  $('#soldOverlay').hidden = true;
}

function sellRelic(buyer) {
  const relic = state.currentRelic;
  if (!relic || !relic.offers) return;
  const artifact = artifactFor(relic.artifactId);
  const offers = relic.offers;
  const amount = buyer === 'museum' ? offers.museum : offers.collector;
  let grant = 0;
  let grantNote = '';
  if (!state.flags.firstRelic) {
    grant += 150;
    state.flags.firstRelic = true;
    grantNote = `The Society adds a first-find grant of ${money(150)}.`;
  }
  if (!state.flags.galleryBonus && state.collection.length + 1 >= 3) {
    grant += 200;
    state.flags.galleryBonus = true;
    grantNote = `${grantNote ? grantNote + ' ' : ''}A gallery milestone adds ${money(200)}.`;
  }
  state.coins += amount + grant;
  state.totalEarned += amount + grant;
  if (buyer === 'museum') state.renown += offers.renown;
  state.flags.firstSale = true;
  state.collection.push({
    artifactId: relic.artifactId,
    name: artifact.name,
    condition: relic.condition ?? 85,
    value: amount,
    buyer: buyer === 'museum' ? 'Atlas Museum' : 'Private collector',
    renown: buyer === 'museum' ? offers.renown : 0,
    date: Date.now()
  });
  state.currentRelic = null;
  save();
  updateWallet(true);
  updateBadges();

  const isMuseum = buyer === 'museum';
  if (!isMuseum) {
    $('#soldOverlay').hidden = true;
    audio.click();
    startPrivateAuction({
      artifact,
      amount,
      grant,
      grantNote,
      lot: relic.cat || 101
    });
    return;
  }

  $('#soldEyebrow').textContent = 'Acquired by the Atlas Museum';
  $('#soldTitle').innerHTML = 'A new treasure<br>enters the archive.';
  $('#soldAmount').textContent = money(amount + grant);
  $('#soldRenown').textContent = `+${offers.renown}`;
  const buyerNote = 'Curator Hana places it in the sunrise gallery.';
  $('#soldFlavor').textContent = grantNote ? `${grantNote} ${buyerNote}` : buyerNote;
  $('#soldOverlay').hidden = false;
  audio.coin();
  vibrate([20, 40, 30]);
}

/* ---------------------------------------------------------
   Private collector auction
   --------------------------------------------------------- */
function clearAuctionTimers() {
  auctionTimers.forEach(id => clearTimeout(id));
  auctionTimers = [];
}

function scheduleAuction(fn, delay) {
  const id = setTimeout(fn, delay);
  auctionTimers.push(id);
  return id;
}

function startPrivateAuction({ artifact, amount, grant, grantNote, lot }) {
  clearAuctionTimers();
  const overlay = $('#auctionOverlay');
  const bidders = $$('.bidder', overlay);
  const steps = 6;
  const start = Math.max(1, Math.round(amount * .64));
  const bids = Array.from({ length: steps }, (_, i) =>
    i === steps - 1 ? amount : Math.round(start + (amount - start) * ((i + 1) / steps))
  );
  for (let i = 1; i < bids.length - 1; i++) {
    if (bids[i] <= bids[i - 1]) bids[i] = bids[i - 1] + 1;
  }
  bids[bids.length - 1] = amount;

  auctionSale = { artifact, amount, grant, grantNote, lot, bids, count: 0, lastBidder: -1 };
  overlay.hidden = false;
  $('#auctionSoldStamp').hidden = true;
  $('#auctionSoldStamp').classList.remove('is-visible');
  $('#auctionContinue').hidden = true;
  $('#auctionSkip').hidden = false;
  $('#auctionBidPanel').classList.remove('is-bump');
  $('#auctionImg').src = artifactImage(artifact.id, 360);
  $('#auctionImg').alt = artifact.name;
  $('#auctionName').textContent = artifact.name;
  $('#auctionLot').textContent = `LOT ${String(lot || 101).padStart(3, '0')}`;
  $('#auctionBid').textContent = money(start);
  $('#auctionBidCount').textContent = '0 bids';
  $('#auctionStatus').textContent = 'The room is quiet. The first paddle goes up…';
  $('#auctionGrant').hidden = true;
  $('#auctionGrant').textContent = '';
  bidders.forEach(bidder => {
    bidder.classList.remove('is-bidding', 'is-winner');
    bidder.querySelector('.bidder-sign').textContent = money(start);
  });
  scheduleAuction(() => auctionBid(bids, 0), 650);
}

function auctionBid(bids, index) {
  if (!auctionSale) return;
  if (index >= bids.length) {
    finishPrivateAuction();
    return;
  }

  const bidders = $$('.bidder', $('#auctionOverlay'));
  let pick = Math.floor(Math.random() * bidders.length);
  if (pick === auctionSale.lastBidder) {
    pick = (pick + 1 + Math.floor(Math.random() * (bidders.length - 1))) % bidders.length;
  }
  auctionSale.lastBidder = pick;
  auctionSale.count = index + 1;

  const bidder = bidders[pick];
  const value = bids[index];
  bidder.querySelector('.bidder-sign').textContent = money(value);
  bidder.classList.add('is-bidding');
  $('#auctionBid').textContent = money(value);
  $('#auctionBidCount').textContent = `${auctionSale.count} bid${auctionSale.count === 1 ? '' : 's'}`;
  const panel = $('#auctionBidPanel');
  panel.classList.remove('is-bump');
  void panel.offsetWidth;
  panel.classList.add('is-bump');

  const calls = [
    'A paddle lifts at the back.',
    'A collector answers.',
    'The room stirs.',
    'Another hand goes up.',
    'The bidding tightens.',
    'One last raise.'
  ];
  $('#auctionStatus').textContent = calls[Math.min(index, calls.length - 1)];
  audio.tone(480 + (index % 3) * 90, .07, .03, 'triangle');
  audio.noiseBurst({ freq: 1500, q: 1.1, dur: .035, vol: .018 });

  if (index === bids.length - 1) {
    bidder.classList.add('is-winner');
  } else {
    scheduleAuction(() => bidder.classList.remove('is-bidding'), 720);
  }
  scheduleAuction(() => auctionBid(bids, index + 1), 560 + Math.random() * 220);
}

function finishPrivateAuction() {
  if (!auctionSale) return;
  clearAuctionTimers();
  const sale = auctionSale;
  const bidders = $$('.bidder', $('#auctionOverlay'));
  bidders.forEach(bidder => bidder.classList.remove('is-bidding'));
  if (sale.lastBidder >= 0) {
    const winner = bidders[sale.lastBidder];
    winner.classList.add('is-bidding', 'is-winner');
    winner.querySelector('.bidder-sign').textContent = money(sale.amount);
  }

  $('#auctionBid').textContent = money(sale.amount);
  $('#auctionBidCount').textContent = `${sale.count || 1} bid${(sale.count || 1) === 1 ? '' : 's'}`;
  $('#auctionStatus').textContent = `Sold to the room for ${money(sale.amount)}.`;
  $('#auctionSoldStamp').hidden = false;
  requestAnimationFrame(() => $('#auctionSoldStamp').classList.add('is-visible'));
  $('#auctionContinue').hidden = false;
  $('#auctionSkip').hidden = true;
  if (sale.grant > 0) {
    $('#auctionGrant').hidden = false;
    $('#auctionGrant').textContent = `${sale.grantNote || 'Society grant'} +${money(sale.grant)}.`;
  }
  audio.coin();
  audio.tone(160, .22, .06, 'square');
  audio.noiseBurst({ freq: 600, q: .6, dur: .18, vol: .07 });
  vibrate([20, 40, 30]);
}

function closePrivateAuction() {
  clearAuctionTimers();
  auctionSale = null;
  $('#auctionOverlay').hidden = true;
}

/* ---------------------------------------------------------
   Lab page
   --------------------------------------------------------- */
function renderLab() {
  const relic = state.currentRelic;
  const art = $('#labArt');
  const eyebrow = $('#labEyebrow');
  const title = $('#labTitle');
  const text = $('#labText');
  const cta = $('#labCta');
  const tip = $('#labTipText');
  if (relic) {
    const artifact = artifactFor(relic.artifactId);
    art.innerHTML = `<img src="${artifactImage(artifact.id, 300)}" alt="${artifact.name}" style="width:100%;height:auto;display:block;filter:drop-shadow(0 14px 14px rgba(76,49,18,.2))">`;
    if (relic.condition != null) {
      eyebrow.textContent = 'Conserved · awaiting appraisal';
      title.textContent = artifact.shortName;
      text.textContent = `Condition ${relic.condition}%. The bench is clean; the market is waiting.`;
      cta.querySelector('span').textContent = 'Send to appraisal';
      tip.textContent = 'Tip: museum offers build renown. Private buyers pay more, but keep the gallery quiet.';
    } else {
      eyebrow.textContent = 'A find on the table';
      title.textContent = 'Finish the restoration.';
      text.textContent = `${artifact.shortName} is still encrusted. The lab is set up and waiting.`;
      cta.querySelector('span').textContent = 'Clean the find';
      tip.textContent = 'Tip: dry brush lifts grime, water dissolves salt, cloth restores lustre.';
    }
  } else {
    art.innerHTML = `
      <svg viewBox="0 0 240 190" aria-hidden="true">
        <defs>
          <linearGradient id="trayGrad" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f3ead9"/><stop offset="1" stop-color="#d8c6a6"/></linearGradient>
          <linearGradient id="boneGrad" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#a78a63"/><stop offset=".55" stop-color="#7f6748"/><stop offset="1" stop-color="#5d4933"/></linearGradient>
        </defs>
        <ellipse cx="120" cy="158" rx="74" ry="12" fill="#b79f7b" opacity=".32"/>
        <path d="M55 76h130l-11 76H66L55 76z" fill="url(#trayGrad)" stroke="#b49d78" stroke-width="1.2"/>
        <path d="M67 88h106l-8 52H75L67 88z" fill="#c8b18d" opacity=".55"/>
        <path d="M93 112c8-13 20-20 33-20 12 0 20 4 28 14-4 14-16 23-31 23-13 0-23-6-30-17z" fill="url(#boneGrad)"/>
        <path d="M95 105c-5-7-3-14 3-16 5-2 10 2 11 8M139 89c8-2 13 4 10 11-2 5-8 7-13 5" fill="none" stroke="#8e7552" stroke-width="5" stroke-linecap="round"/>
        <path d="M96 113c8-5 17-8 26-8 9 0 17 2 25 6" fill="none" stroke="#c0a983" stroke-width="1.4" opacity=".7"/>
        <path d="M70 88h100" stroke="#fff" stroke-width="1" opacity=".45"/>
        <g transform="translate(184 48) rotate(18)">
          <rect x="-2" y="0" width="4" height="54" rx="2" fill="#8e6d43"/>
          <path d="M-8 55c0-8 16-8 16 0 0 8-16 8-16 0z" fill="#c5a16c"/>
          <path d="M-4 57c0-4 8-4 8 0" stroke="#7d5f3b" stroke-width="1" fill="none"/>
        </g>
      </svg>`;
    eyebrow.textContent = 'No find on the table';
    title.textContent = 'The lab is quiet.';
    text.textContent = 'Bring a relic back from the dunes and the atelier will wake up.';
    cta.querySelector('span').textContent = 'Go to the excavation';
    tip.textContent = 'Tip: water dissolves salt crust. Dry brushing lifts loose grime.';
  }
  updateBadges();
  updateWallet();
}

/* ---------------------------------------------------------
   Museum
   --------------------------------------------------------- */
function renderMuseum() {
  const collection = state.collection;
  const latest = collection[collection.length - 1];
  $('#museumCount').textContent = `${collection.length} / ${TOTAL_RELICS}`;
  $('#stripCount').textContent = `${collection.length} relic${collection.length === 1 ? '' : 's'}`;
  const display = $('#museumDisplay');
  if (!latest) {
    display.innerHTML = `<div class="museum-empty">
      <span class="empty-vase">${iconSvg('i-museum')}</span>
      <strong>The gallery awaits.</strong>
      <span>Recover and conserve a relic to begin the collection.</span>
    </div>`;
  } else {
    const artifact = artifactFor(latest.artifactId);
    display.innerHTML = `<div class="featured-relic">
      <img class="featured-img" src="${artifactImage(artifact.id, 300)}" alt="${artifact.name}">
      <div class="featured-copy">
        <span class="eyebrow">Latest acquisition · ${gradeText(latest.condition)}</span>
        <h2>${artifact.name}</h2>
        <p>${artifact.era} · condition ${latest.condition}%</p>
        <span class="featured-buyer">${latest.buyer}</span>
      </div>
    </div>`;
    display.querySelector('.featured-relic').addEventListener('click', () => {
      openModal({
        kicker: 'Atlas accession record',
        title: artifact.name,
        text: `${artifact.desc}\n\n${artifact.provenance}\n\nCondition ${latest.condition}% · acquired by ${latest.buyer}.`,
        actions: [{ label: 'Close the record', style: 'primary' }]
      });
    });
  }

  const strip = $('#museumStrip');
  strip.innerHTML = '';
  const recent = collection.slice(-4).reverse();
  for (let i = 0; i < 4; i++) {
    const slot = document.createElement('div');
    slot.className = 'strip-slot' + (recent[i] ? '' : ' is-empty');
    slot.innerHTML = recent[i]
      ? `<span class="slot-index">0${i + 1}</span><img src="${artifactImage(recent[i].artifactId, 160)}" alt="${recent[i].name}">`
      : `<span class="slot-index">0${i + 1}</span>${iconSvg('i-museum')}`;
    if (recent[i]) {
      slot.addEventListener('click', () => {
        const artifact = artifactFor(recent[i].artifactId);
        openModal({
          kicker: 'Atlas accession record',
          title: artifact.name,
          text: `${artifact.era}\n\n${artifact.desc}\n\nCondition ${recent[i].condition}% · ${money(recent[i].value)} · ${recent[i].buyer}.`,
          actions: [{ label: 'Close the record', style: 'primary' }]
        });
      });
    }
    strip.appendChild(slot);
  }

  const avg = collection.length ? collection.reduce((sum, item) => sum + item.condition, 0) / collection.length : 0;
  const total = collection.reduce((sum, item) => sum + (item.value || 0), 0);
  $('#museumRenown').textContent = state.renown;
  $('#museumGrade').textContent = collection.length ? gradeLetter(avg) : '—';
  $('#museumValue').textContent = money(total);
  $('#bookCount').textContent = `${collection.length} / ${TOTAL_RELICS}`;
  updateWallet();
}

function artifactSilhouette(id, size = 180) {
  const key = `silhouette_${id}_${size}`;
  if (imageCache.has(key)) return imageCache.get(key);
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  drawArtifact(ctx, artifactFor(id).art, size / 2, size / 2, size * .88);
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, size, size);
  ctx.globalCompositeOperation = 'source-over';
  const url = c.toDataURL('image/png');
  imageCache.set(key, url);
  return url;
}

function renderCollectionBook() {
  const discovered = new Set(state.collection.map(item => item.artifactId));
  const list = $('#collectionBookList');
  const uniqueCount = discovered.size;
  $('#collectionBookCount').textContent = `${uniqueCount} / ${TOTAL_RELICS}`;

  list.innerHTML = SITES.map(site => {
    const found = site.artifacts.filter(id => discovered.has(id)).length;
    const cards = site.artifacts.map(id => {
      const artifact = artifactFor(id);
      const foundEntry = state.collection.find(item => item.artifactId === id);
      if (foundEntry) {
        return `<button class="book-card is-found" type="button" data-artifact="${id}">
          <img src="${artifactImage(id, 180)}" alt="${artifact.name}">
          <strong>${artifact.shortName}</strong>
        </button>`;
      }
      return `<div class="book-card is-undiscovered" aria-label="Undiscovered relic">
        <img src="${artifactSilhouette(id, 180)}" alt="Undiscovered artifact silhouette">
        <strong>Undiscovered</strong>
      </div>`;
    }).join('');
    return `<section class="book-site">
      <header><div><span>${site.shortName}</span><strong>${site.name}</strong></div><b>${found} / ${site.artifacts.length}</b></header>
      <div class="book-grid">${cards}</div>
    </section>`;
  }).join('');

  list.querySelectorAll('[data-artifact]').forEach(card => {
    card.addEventListener('click', () => {
      const entry = state.collection.find(item => item.artifactId === card.dataset.artifact);
      const artifact = artifactFor(card.dataset.artifact);
      openModal({
        kicker: 'Collection record',
        title: artifact.name,
        text: `${artifact.era}\n\n${artifact.desc}\n\nCondition ${entry.condition}% · ${money(entry.value)} · ${entry.buyer}.`,
        actions: [{ label: 'Close', style: 'primary' }]
      });
    });
  });
}

/* ---------------------------------------------------------
   Shop
   --------------------------------------------------------- */
function renderShop() {
  $$('.seg').forEach(seg => seg.classList.toggle('is-active', seg.dataset.shopTab === shopTab));
  const list = $('#upgradeList');
  const keys = Object.keys(UPGRADES).filter(key => UPGRADES[key].cat === shopTab);
  list.innerHTML = keys.map(key => {
    const def = UPGRADES[key];
    const level = levelFor(state, key);
    const cost = upgradeCost(key, state);
    const dots = Array.from({ length: 3 }, (_, i) => `<i class="${i < level ? 'on' : ''}"></i>`).join('');
    const effect = def.effects[level - 1];
    return `<article class="upgrade-card">
      <span class="upgrade-icon">${iconSvg(def.icon)}</span>
      <div class="upgrade-copy">
        <div class="upgrade-title-row"><strong>${def.name}</strong><span class="lvl-dots">${dots}</span></div>
        <p>${effect}. ${def.desc}</p>
      </div>
      ${cost == null
        ? `<button class="upgrade-buy is-max" disabled><small>Level</small><strong>MAX</strong></button>`
        : `<button class="upgrade-buy" data-upgrade="${key}" aria-label="Upgrade ${def.name} for ${money(cost)}"><small>Upgrade</small><strong>${iconSvg('i-coin')}${cost}</strong></button>`}
    </article>`;
  }).join('');

  $$('[data-upgrade]', list).forEach(btn => {
    btn.addEventListener('click', () => buyUpgrade(btn.dataset.upgrade));
  });
  updateWallet();
}

function buyUpgrade(key) {
  const def = UPGRADES[key];
  if (!def) return;
  const cost = upgradeCost(key, state);
  if (cost == null) return;
  if (state.coins < cost) {
    audio.error();
    vibrate(30);
    toast(`Not enough coin — ${money(cost - state.coins)} short. Appraise another find.`, 2600);
    return;
  }
  state.coins -= cost;
  state.levels[key] = levelFor(state, key) + 1;
  save();
  audio.coin();
  vibrate([15, 30, 15]);
  renderShop();
  updateWallet(true);
  toast(`${def.name} upgraded to level ${state.levels[key]}`, 2200);
}

/* ---------------------------------------------------------
   Wiring
   --------------------------------------------------------- */
function bind() {
  $$('.sound-btn').forEach(btn => btn.addEventListener('click', () => {
    audio.ensure();
    audio.setMuted(!audio.muted);
    updateSoundButtons();
    if (!audio.muted) audio.click();
    toast(audio.muted ? 'Sound off' : 'Sound on', 1200);
  }));

  $$('.tab').forEach(tab => tab.addEventListener('click', () => {
    const target = tab.dataset.nav;
    if (target === 'lab' && state.currentRelic?.condition == null && state.currentRelic) {
      // Keep the lab as a hub; the CTA resumes the bench.
    }
    audio.click();
    showScreen(target);
    updateWallet();
  }));

  $('#prevSite').addEventListener('click', () => selectSite(-1));
  $('#nextSite').addEventListener('click', () => selectSite(1));
  $('#beginDigBtn').addEventListener('click', beginDig);

  let heroSwipe = null;
  $('#hero').addEventListener('pointerdown', (e) => {
    if (e.target.closest('button')) return;
    heroSwipe = { x: e.clientX, y: e.clientY };
  }, { passive: true });
  $('#hero').addEventListener('pointerup', (e) => {
    if (!heroSwipe || e.target.closest('button')) { heroSwipe = null; return; }
    const dx = e.clientX - heroSwipe.x;
    const dy = e.clientY - heroSwipe.y;
    heroSwipe = null;
    if (Math.abs(dx) > 42 && Math.abs(dx) > Math.abs(dy) * 1.4) selectSite(dx < 0 ? 1 : -1);
  }, { passive: true });
  $('#hero').addEventListener('pointercancel', () => { heroSwipe = null; }, { passive: true });
  $('#dispatchCard').addEventListener('click', () => {
    audio.click();
    if (state.currentRelic) routeCurrentRelic();
    else if (state.collection.length === 0) beginDig();
    else if (state.renown < SITES[1].unlock) {
      state.selectedSite = 1;
      save();
      renderHome();
      toast(`The Salt Temple opens at ${SITES[1].unlock} renown.`, 2200);
    } else beginDig();
  });

  $('#digBack').addEventListener('click', () => {
    openModal({
      kicker: 'Cover the trench?',
      title: 'Leave the excavation?',
      text: 'The sand will take back whatever you leave. The find has not been lifted yet.',
      actions: [
        { label: 'Keep digging', style: 'ghost' },
        { label: 'Return to camp', style: 'primary', onClick: goHome }
      ]
    });
  });
  $('#digInfo').addEventListener('click', () => guideModal('dig'));
  $('#scanBtn').addEventListener('click', pulseScan);
  $('#liftBtn').addEventListener('click', () => {
    if (digScene) digScene.lift();
  });

  $('#cleanBack').addEventListener('click', () => {
    openModal({
      kicker: 'The bench can wait',
      title: 'Leave the restoration?',
      text: 'Your find will stay safe in the lab. You can return to the bench whenever you are ready.',
      actions: [
        { label: 'Stay at the bench', style: 'ghost' },
        { label: 'Go to the lab', style: 'primary', onClick: () => { stopClean(); showScreen('lab'); } }
      ]
    });
  });
  $('#cleanInfo').addEventListener('click', () => guideModal('clean'));
  $$('.tool-btn').forEach(btn => btn.addEventListener('click', () => selectTool(btn.dataset.tool)));
  $('#appraiseBtn').addEventListener('click', goAppraise);
  $('#appraiseBack').addEventListener('click', () => { showScreen('lab'); });
  $('#museumOffer').addEventListener('click', () => sellRelic('museum'));
  $('#collectorOffer').addEventListener('click', () => sellRelic('collector'));
  $('#soldContinue').addEventListener('click', () => {
    $('#soldOverlay').hidden = true;
    goHome();
    toast('The dunes are waiting.', 1500);
  });
  $('#auctionSkip').addEventListener('click', finishPrivateAuction);
  $('#auctionContinue').addEventListener('click', () => {
    closePrivateAuction();
    goHome();
    toast('The collector’s money is in your purse.', 1800);
  });

  $('#labCta').addEventListener('click', () => {
    audio.click();
    if (state.currentRelic) routeCurrentRelic();
    else startDig(SITES[state.selectedSite]);
  });

  const openCollectionBook = () => {
    audio.click();
    renderCollectionBook();
    $('#collectionBook').hidden = false;
  };

  $('#openCollectionBook').addEventListener('click', openCollectionBook);
  $('#openFieldCollectionBook').addEventListener('click', openCollectionBook);
  $('#closeCollectionBook').addEventListener('click', () => {
    audio.click();
    $('#collectionBook').hidden = true;
  });

  $$('.seg').forEach(seg => seg.addEventListener('click', () => {
    shopTab = seg.dataset.shopTab;
    audio.click();
    renderShop();
  }));

  $('#modalClose').addEventListener('click', closeModal);
  $('#modal').querySelector('.modal-scrim').addEventListener('click', closeModal);

  document.addEventListener('pointerdown', () => audio.ensure(), { once: true });
  document.addEventListener('touchmove', (e) => {
    if (!e.target.closest('canvas')) e.preventDefault();
  }, { passive: false });
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  document.addEventListener('dblclick', (e) => e.preventDefault(), { passive: false });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopDig();
      stopClean();
    }
  });

  window.addEventListener('beforeunload', save);
  updateSoundButtons();
}

/* ---------------------------------------------------------
   Boot
   --------------------------------------------------------- */
function boot() {
  bind();
  updateWallet();
  updateBadges();
  renderHome();
  renderLab();
  renderMuseum();
  renderShop();
  showScreen('home');
  window.__DUNE = {
    state,
    showScreen,
    startDig,
    startClean,
    beginDig,
    sellRelic,
    save,
    get digScene() { return digScene; },
    get cleanScene() { return cleanScene; }
  };
}

boot();
