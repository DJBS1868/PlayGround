import * as THREE from 'three';

const steps = [
  { id: 'hilt', title: 'Hilt', kicker: 'THE FOUNDATION', eyebrow: 'STEP 01 · FOUNDATION', heading: 'Choose your hilt', description: 'The heart of your build. A good hilt feels like it was always meant to be yours.', note: 'A balanced classic, made for a steady hand.' },
  { id: 'emitter', title: 'Emitter', kicker: 'THE SIGNATURE', eyebrow: 'STEP 02 · THE SIGNATURE', heading: 'Shape the emitter', description: 'The saber’s silhouette starts here. Pick a profile that makes an entrance.', note: 'The emitter shapes the first impression.' },
  { id: 'grip', title: 'Grip', kicker: 'IN YOUR HAND', eyebrow: 'STEP 03 · IN YOUR HAND', heading: 'Find your grip', description: 'Comfort meets control. Choose the texture that will feel right in every duel.', note: 'A sure grip makes a steady blade.' },
  { id: 'pommel', title: 'Pommel', kicker: 'THE FINISHING TOUCH', eyebrow: 'STEP 04 · FINISHING TOUCH', heading: 'Cap it with character', description: 'A final detail with a little personality. Balance the build from end to end.', note: 'The smallest details stay with you.' },
  { id: 'crystal', title: 'Kyber crystal', kicker: 'FIND YOUR COLOR', eyebrow: 'STEP 05 · THE HEART', heading: 'Choose your crystal', description: 'A crystal is more than a color. It’s the voice of your saber.', note: 'Let the crystal choose you.' },
  { id: 'accent', title: 'Metal accents', kicker: 'MAKE IT YOURS', eyebrow: 'STEP 06 · METAL ACCENTS', heading: 'Choose your accents', description: 'A little contrast makes the whole build sing. Pick the metal details that catch the light.', note: 'The details make the legend.' },
  { id: 'blade', title: 'Blade profile', kicker: 'THE LIGHT', eyebrow: 'STEP 07 · BLADE PROFILE', heading: 'Set your blade', description: 'Tune the silhouette and color character of your energy blade.', note: 'A blade with its own signature.' },
  { id: 'switch', title: 'Activation switch', kicker: 'THE CONTROLS', eyebrow: 'STEP 08 · ACTIVATION', heading: 'Set the controls', description: 'Choose the detail that brings your saber to life.', note: 'Ready when you are.' },
  { id: 'engraving', title: 'Engraving', kicker: 'YOUR SIGNATURE', eyebrow: 'STEP 09 · PERSONAL TOUCH', heading: 'Leave your mark', description: 'A final inscription turns a fine saber into a personal heirloom.', note: 'Made by you. Known across the stars.' },
];
const options = {
  hilt: [
    { name: 'Wayfinder', detail: 'Classic · balanced', price: 620, finish: 'satin', profile: 'classic', swatch: '', note: 'A balanced classic, made for a steady hand.' },
    { name: 'Dune Walker', detail: 'Brushed copper · rugged', price: 740, finish: 'copper', profile: 'fluted', swatch: 'copper', note: 'Warm copper, built to weather any journey.' },
    { name: 'Nightfall', detail: 'Obsidian · minimalist', price: 890, finish: 'onyx', profile: 'slim', swatch: 'onyx', note: 'A shadow-dark profile with a quiet confidence.' },
    { name: 'Aureate', detail: 'Ivory alloy · heirloom', price: 1060, finish: 'ivory', profile: 'taper', swatch: 'ivory', note: 'An elegant heirloom with a light touch.' },
    { name: 'Tideglass', detail: 'Deep teal · oceanic', price: 840, finish: 'teal', profile: 'segmented', swatch: 'teal', note: 'A sea-glass alloy with separated, flowing barrel bands.' },
    { name: 'Sunspun', detail: 'Amber brass · radiant', price: 980, finish: 'brass', profile: 'bulbous', swatch: 'brass', note: 'A rounded brass core inspired by a miniature sun.' },
    { name: 'Frostline', detail: 'Pale steel · angular', price: 1120, finish: 'frost', profile: 'hex', swatch: 'frost', note: 'A crisp faceted shell with an unmistakably arctic finish.' },
    { name: 'Verdigris', detail: 'Patinated copper · ancient', price: 1280, finish: 'patina', profile: 'stacked', swatch: 'patina', note: 'Layered antique rings give this relic a timeworn silhouette.' },
  ],
  emitter: [
    { name: 'Ascendant', detail: 'Flared · classic', price: 360, style: 'flare', note: 'A sweeping flare that frames the blade.' },
    { name: 'Longshot', detail: 'Extended · precise', price: 480, style: 'long', note: 'A long, precise throat for a focused look.' },
    { name: 'Crownpoint', detail: 'Crowned · ornate', price: 610, style: 'crown', note: 'Crowned edges add a hint of ceremony.' },
    { name: 'Venting No. 7', detail: 'Vented · kinetic', price: 720, style: 'vent', note: 'Vented fins give this build a kinetic edge.' },
    { name: 'Needlepoint', detail: 'Narrow · duelist', price: 540, style: 'needle', note: 'A sharply tapered nozzle narrows to a duelist’s point.' },
    { name: 'Halo Shroud', detail: 'Open ring · ceremonial', price: 790, style: 'halo', note: 'A floating outer halo frames the blade in open metal.' },
    { name: 'Forked Arc', detail: 'Twin prongs · wild', price: 860, style: 'fork', note: 'Two swept prongs split around the blade like a fork of lightning.' },
    { name: 'Offset Shroud', detail: 'Asymmetric · industrial', price: 930, style: 'shroud', note: 'An offset armor plate gives the emitter a one-sided silhouette.' },
  ],
  grip: [
    { name: 'Pilgrim wrap', detail: 'Leather · soft touch', price: 220, style: 'wrap', note: 'A soft wrap for long hours on the trail.' },
    { name: 'Crosshatch', detail: 'Knurled · all-weather', price: 310, style: 'knurl', note: 'A tactile crosshatch holds firm in any weather.' },
    { name: 'Field ribs', detail: 'Ridged · secure', price: 380, style: 'ribs', note: 'Close-set ribs add control and a little drama.' },
    { name: 'Core weave', detail: 'Carbon · lightweight', price: 470, style: 'carbon', note: 'Lightweight weave, engineered for speed.' },
    { name: 'Coilbound', detail: 'Spiral wire · adaptive', price: 350, style: 'spiral', note: 'A single raised coil spirals around the entire grip.' },
    { name: 'Scalehide', detail: 'Overlapping plates · armored', price: 440, style: 'scales', note: 'Overlapping metal scales armor the palm-facing side.' },
    { name: 'Grip studs', detail: 'Studded · hard-wearing', price: 390, style: 'studs', note: 'Rows of rounded studs provide tactile points of contact.' },
    { name: 'Ceramic flats', detail: 'Smooth panels · cool touch', price: 510, style: 'panels', note: 'Six smooth ceramic flats break the grip into clean planes.' },
  ],
  pommel: [
    { name: 'Dissipator', detail: 'Vented · balanced', price: 180, style: 'vented', note: 'Clean venting keeps the hilt nicely balanced.' },
    { name: 'Anchor cap', detail: 'Weighted · steady', price: 260, style: 'weight', note: 'A weighted cap lends a reassuring counterbalance.' },
    { name: 'Starfang', detail: 'Pronged · striking', price: 350, style: 'fang', note: 'Three sculpted prongs leave a memorable finish.' },
    { name: 'Whisper', detail: 'Low profile · refined', price: 430, style: 'smooth', note: 'A smooth, low-profile ending for a refined build.' },
    { name: 'Comet spike', detail: 'Tapered · trailblazer', price: 320, style: 'spike', note: 'A long tapered spike gives the hilt a pointed finish.' },
    { name: 'Gyro ring', detail: 'Open loop · balanced', price: 460, style: 'ring', note: 'A broad open ring makes a distinctive counterweight.' },
    { name: 'Prism cap', detail: 'Faceted · luminous', price: 520, style: 'prism', note: 'A faceted crystal-like cap catches the light from every angle.' },
    { name: 'Cagework', detail: 'Open lattice · vented', price: 580, style: 'cage', note: 'Four open struts form an airy cage around the end cap.' },
  ],
  crystal: [
    { name: 'Azure', detail: 'KYBER · steadfast blue', price: 760, color: '#4a8dff', hex: 0x4a8dff, note: 'Steadfast and clear. The color of a path well chosen.' },
    { name: 'Verdant', detail: 'KYBER · living green', price: 920, color: '#48e184', hex: 0x48e184, note: 'Attuned to the living Force, bright as new growth.' },
    { name: 'Solaris', detail: 'KYBER · resolute gold', price: 1080, color: '#ffe45c', hex: 0xffe45c, note: 'A rare golden glow for a resolute spirit.' },
    { name: 'Vesper', detail: 'KYBER · intuitive violet', price: 1320, color: '#985cff', hex: 0x985cff, note: 'Intuitive and uncommon, with a violet heart.' },
    { name: 'Ember', detail: 'KYBER · unbound red', price: 1540, color: '#ff3b4f', hex: 0xff3b4f, note: 'An unbound fire, for those who choose their own way.' },
    { name: 'Glacier', detail: 'KYBER · glacial cyan', price: 990, color: '#4deaff', hex: 0x4deaff, note: 'A clear cyan pulse, cool and bright as an ice moon.' },
    { name: 'Tidecaller', detail: 'KYBER · tranquil teal', price: 1040, color: '#36e7c2', hex: 0x36e7c2, note: 'A calm teal current flows through this rare crystal.' },
    { name: 'Indigo Veil', detail: 'KYBER · deep indigo', price: 1180, color: '#5456ff', hex: 0x5456ff, note: 'A midnight blue-violet hue for a contemplative spirit.' },
    { name: 'Starling', detail: 'KYBER · bright magenta', price: 1260, color: '#e44cff', hex: 0xe44cff, note: 'Vivid magenta radiance with a playful, fearless energy.' },
    { name: 'Rosefire', detail: 'KYBER · vivid pink', price: 1190, color: '#ff5ba7', hex: 0xff5ba7, note: 'A warm pink glow that stands apart from every tradition.' },
    { name: 'Citrine', detail: 'KYBER · sunlit amber', price: 1010, color: '#ff9a32', hex: 0xff9a32, note: 'Orange-gold warmth, like the last light over the dunes.' },
    { name: 'Wildspark', detail: 'KYBER · bright chartreuse', price: 1130, color: '#b8ff55', hex: 0xb8ff55, note: 'A sharp yellow-green glimmer full of untamed life.' },
    { name: 'Pearl', detail: 'KYBER · pure white', price: 1680, color: '#fff5d6', hex: 0xfff5d6, note: 'Nearly colorless brilliance, luminous as a distant star.' },
    { name: 'Vermilion', detail: 'KYBER · molten orange', price: 1370, color: '#ff5938', hex: 0xff5938, note: 'A fierce orange-red spark with a molten heart.' },
  ],
  accent: [
    { name: 'Palladium', detail: 'Cool silver · classic', price: 180, color: '#c9d2cd', note: 'Crisp silver detailing gives a clean, timeless finish.' },
    { name: 'Gilt', detail: 'Warm gold · heirloom', price: 310, color: '#e5bd69', note: 'Warm gold catches the light like a treasured relic.' },
    { name: 'Aurora', detail: 'Iridescent · rare', price: 460, color: '#9ad9c9', note: 'Iridescent accents shift softly with every turn.' },
    { name: 'Crimson', detail: 'Enamel · bold', price: 390, color: '#d46b5f', note: 'A flash of red enamel makes this build unmistakable.' },
    { name: 'Cobalt', detail: 'Blue titanium · electric', price: 420, color: '#5d8dff', note: 'Cool blue hardware gives the hilt a technical edge.' },
    { name: 'Amethyst', detail: 'Violet alloy · arcane', price: 480, color: '#bd78ee', note: 'Violet metal details echo a rare crystal.' },
    { name: 'Verdigris', detail: 'Oxidized copper · aged', price: 350, color: '#55b6a0', note: 'Aged green patina gives each edge a relic-like finish.' },
    { name: 'Obsidian', detail: 'Black chrome · stealth', price: 530, color: '#59645f', note: 'Dark chrome accents disappear into the hilt’s shadows.' },
  ],
  blade: [
    { name: 'Classic', detail: 'Focused · balanced', price: 240, width: .092, style: 'classic', note: 'A balanced, focused blade with a bright core.' },
    { name: 'Duelist', detail: 'Broad · radiant', price: 380, width: .12, style: 'broad', note: 'A broader blade throws a bold pool of colored light.' },
    { name: 'Whisper', detail: 'Fine · precise', price: 330, width: .068, style: 'fine', note: 'A fine, precise beam with an elegant profile.' },
    { name: 'Prismatic', detail: 'Unstable · rare', price: 520, width: .105, style: 'prismatic', note: 'A lively, prismatic edge with an unusually bright aura.' },
    { name: 'Crossguard', detail: 'Quillons · defensive', price: 640, width: .09, style: 'crossguard', note: 'Two short side-blades flare from the emitter like a guard.' },
    { name: 'Pulsewave', detail: 'Segmented · rhythmic', price: 590, width: .095, style: 'pulse', note: 'Bright energy rings ripple along this segmented beam.' },
    { name: 'Longreach', detail: 'Extended · commanding', price: 710, width: .1, style: 'long', note: 'An extended beam reaches farther than the classic profile.' },
  ],
  switch: [
    { name: 'Recessed stud', detail: 'Low profile · tactile', price: 120, style: 'stud', note: 'A discreet control that sits flush to the hilt.' },
    { name: 'Twin toggles', detail: 'Machined · precise', price: 210, style: 'twin', note: 'Twin controls give the hilt a precision-instrument feel.' },
    { name: 'Guarded lever', detail: 'Protected · field-ready', price: 280, style: 'lever', note: 'A guarded lever built for quick activation.' },
    { name: 'Crystal touch', detail: 'Illuminated · arcane', price: 360, style: 'touch', note: 'A luminous touchpoint puts the crystal at your fingertips.' },
    { name: 'Rotary dial', detail: 'Turn control · mechanical', price: 240, style: 'dial', note: 'A knurled rotary wheel makes every setting feel deliberate.' },
    { name: 'Slide key', detail: 'Linear · quick draw', price: 190, style: 'slider', note: 'A long travel switch slides into place with a single motion.' },
    { name: 'Guarded toggle', detail: 'Caged · rugged', price: 310, style: 'guard', note: 'A protective loop shields a raised activation toggle.' },
    { name: 'Pulse button', detail: 'Pulsing · luminous', price: 410, style: 'pulse', note: 'A bright domed control glows in step with the crystal.' },
  ],
  engraving: [
    { name: 'None', detail: 'Pure lines · understated', price: 0, style: 'none', note: 'Let the shape and materials speak for themselves.' },
    { name: 'Star map', detail: 'Deep etched · explorer', price: 240, style: 'stars', note: 'A tiny star map marks the route that brought you here.' },
    { name: 'Old script', detail: 'Gold inlay · ceremonial', price: 390, style: 'script', note: 'A line of ancient script makes this an heirloom.' },
    { name: 'Maker’s mark', detail: 'Custom seal · artisan', price: 320, style: 'mark', note: 'Your maker’s seal, stamped into the heart of the hilt.' },
    { name: 'Runic band', detail: 'Glyphs · mystic', price: 430, style: 'runes', note: 'Angled rune marks encircle the grip in a repeating band.' },
    { name: 'Orbit lines', detail: 'Concentric · celestial', price: 290, style: 'orbit', note: 'Fine intersecting orbit lines cross the central barrel.' },
    { name: 'Flame etch', detail: 'Scalloped · fierce', price: 360, style: 'flame', note: 'A row of rising flame motifs makes a bold maker’s mark.' },
    { name: 'Serial code', detail: 'Stamped · personal', price: 180, style: 'serial', note: 'A neat row of engraved maker’s numerals identifies your build.' },
  ],
};
const selected = Object.fromEntries(Object.keys(options).map(key => [key, 0]));
let activeStep = 0;
let bladeIgnited = false;
let bladeUserChoice = null;
const $ = (id) => document.getElementById(id);
function syncBladeToggle() {
  const toggle = $('bladeToggle');
  toggle.setAttribute('aria-pressed', String(bladeIgnited));
  toggle.innerHTML = `${bladeIgnited ? 'EXTINGUISH BLADE' : 'IGNITE BLADE'} <span>${bladeIgnited ? '✦' : '↗'}</span>`;
}
const money = (amount) => `¤ ${Math.round(amount).toLocaleString('en-US')}`;

function selectedOption(id) { return options[id][selected[id]]; }
function totalValue() {
  const sum = Object.keys(options).reduce((total, key) => total + selectedOption(key).price, 0);
  const rarity = Object.values(selected).filter(index => index > 0).length >= 5 ? 360 : 0;
  const material = selected.hilt === 3 && selected.pommel === 3 ? 140 : 0;
  const harmony = selected.emitter === selected.crystal % 4 ? 160 : 0;
  return sum + rarity + material + harmony;
}
function buildName() {
  const hilt = selectedOption('hilt').name;
  const crystal = selectedOption('crystal').name;
  return `${crystal} ${hilt}`;
}
function renderSteps() {
  $('stepList').innerHTML = steps.map((step, index) => `<button class="step-item ${index === activeStep ? 'active' : ''} ${index < activeStep ? 'done' : ''}" data-step="${index}" aria-current="${index === activeStep ? 'step' : 'false'}"><span class="step-index">${index < activeStep ? '✓' : `0${index + 1}`}</span><span class="step-copy"><strong>${step.title}</strong><small>${step.kicker}</small></span>${index === activeStep ? '<span class="step-state">↗</span>' : ''}</button>`).join('');
  document.querySelectorAll('.step-item').forEach(button => button.addEventListener('click', () => setStep(Number(button.dataset.step))));
  $('progressFill').style.width = `${((activeStep + 1) / steps.length) * 100}%`;
  const stepCount = String(steps.length).padStart(2, '0');
  document.querySelector('.build-number').innerHTML = `${String(activeStep + 1).padStart(2, '0')}<br><span>/ ${stepCount}</span>`;
  $('stepSummary').innerHTML = `${String(activeStep + 1).padStart(2, '0')} / ${stepCount} &nbsp; ${steps[activeStep].title.toUpperCase()}`;
  document.querySelector('.scene-label-right').textContent = `${String(activeStep + 1).padStart(2, '0')} — ${stepCount}`;
  $('prevStep').disabled = activeStep === 0;
  const isLast = activeStep === steps.length - 1;
  $('nextStep').innerHTML = isLast ? 'SELL SABER <span>↗</span>' : 'NEXT PART <span>→</span>';
  $('finishButton').innerHTML = isLast ? 'FINISH & SELL <span>↗</span>' : 'NEXT PART <span>→</span>';
}
function renderOptions() {
  const step = steps[activeStep];
  const list = options[step.id];
  $('categoryEyebrow').textContent = step.eyebrow;
  $('categoryTitle').textContent = step.heading;
  $('categoryDescription').textContent = step.description;
  $('componentCount').innerHTML = `${String(selected[step.id] + 1).padStart(2, '0')} <i>/ ${String(list.length).padStart(2, '0')}</i>`;
  $('optionList').innerHTML = list.map((option, index) => {
    const swatch = option.swatch === undefined ? (step.id === 'crystal' ? 'crystal' : option.style === 'ribs' || option.style === 'crown' ? 'ridged' : '') : option.swatch;
    const swatchStyle = option.color ? ` style="--crystal:${option.color};background:radial-gradient(circle,${option.color} 0,#384a5c 32%,#202623 72%)"` : '';
    const title = step.id === 'crystal' ? `Kyber · ${option.name}` : option.name;
    return `<button class="option-card ${selected[step.id] === index ? 'selected' : ''}" data-option="${index}" aria-pressed="${selected[step.id] === index}"><span class="option-swatch ${swatch}"${swatchStyle}></span><span class="option-copy"><strong>${title}</strong><small>${option.detail}</small></span><span class="option-price">${money(option.price)}</span></button>`;
  }).join('');
  document.querySelectorAll('.option-card').forEach(button => button.addEventListener('click', () => {
    selected[step.id] = Number(button.dataset.option);
    if (step.id === 'crystal' || step.id === 'blade') bladeIgnited = true;
    syncBladeToggle();
    renderOptions(); updateUI(); rebuildSaber(); playTone(480 + activeStep * 70, .07);
  }));
  $('selectionNote').textContent = selectedOption(step.id).note;
  $('partValue').textContent = money(selectedOption(step.id).price);
}
function setStep(index) {
  activeStep = Math.max(0, Math.min(steps.length - 1, index));
  if (steps[activeStep].id !== 'crystal' && steps[activeStep].id !== 'blade') {
    bladeIgnited = bladeUserChoice === true;
    syncBladeToggle();
    rebuildSaber();
  }
  renderSteps(); renderOptions();
}
function updateUI() {
  const crystal = selectedOption('crystal');
  $('previewName').textContent = buildName();
  $('crystalReadout').textContent = `KYBER · ${crystal.name.toUpperCase()}`;
  $('crystalDot').style.background = crystal.color;
  $('crystalDot').style.color = crystal.color;
  $('crystalDot').style.boxShadow = `0 0 11px ${crystal.color}99`;
  $('previewPrice').textContent = money(totalValue());
}
function nextStep() {
  if (activeStep < steps.length - 1) { setStep(activeStep + 1); playTone(370, .09); }
  else openSale();
}
$('prevStep').addEventListener('click', () => setStep(activeStep - 1));
$('nextStep').addEventListener('click', nextStep);
$('finishButton').addEventListener('click', nextStep);

let audioContext = null;
let soundOn = false;
function playTone(frequency, duration) {
  if (!soundOn) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'sine'; oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(.035, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + duration);
    oscillator.connect(gain); gain.connect(audioContext.destination);
    oscillator.start(); oscillator.stop(audioContext.currentTime + duration);
  } catch (_) { /* Audio is an optional flourish. */ }
}
$('soundToggle').addEventListener('click', () => {
  soundOn = !soundOn;
  $('soundToggle').classList.toggle('enabled', soundOn);
  $('soundState').textContent = soundOn ? 'ON' : 'OFF';
  if (soundOn) playTone(580, .13);
});
let auctionTimerId = null, auctionBidId = null, auctionEndsAt = 0;
let auctionBid = 0, auctionCount = 0, lastBidder = -1;
const bidderNames = ['VEX-9', 'MASTER SOL', 'NYX KORR', 'DR. LUMA', 'JAX RENN', 'THE CURATOR'];
function stopAuction() {
  clearInterval(auctionTimerId); clearTimeout(auctionBidId);
  auctionTimerId = null; auctionBidId = null;
}
function closeSale() {
  stopAuction();
  $('saleOverlay').classList.remove('open'); $('saleOverlay').setAttribute('aria-hidden', 'true');
  document.body.classList.remove('sale-active');
  document.body.style.removeProperty('overflow');
}
function finishAuction() {
  if ($('auctionRoom').classList.contains('finished')) return;
  stopAuction();
  $('auctionRoom').classList.add('finished');
  $('auctionResult').classList.add('visible'); $('auctionResult').setAttribute('aria-hidden', 'false');
  $('salePrice').textContent = money(auctionBid);
  $('resultCopy').textContent = `${$('auctionBidder').textContent} takes home your ${buildName()} saber. The room made ${auctionCount} bids before the hammer fell.`;
  const base = Object.values(options).reduce((sum, list, index) => sum + selectedOption(Object.keys(options)[index]).price, 0);
  const bonus = totalValue() - base;
  const breakdown = Object.entries(options).map(([key]) => `<div><span>${steps.find(step => step.id === key).title}</span><b>${money(selectedOption(key).price)}</b></div>`);
  breakdown.push(`<div><span>Craftsmanship bonus</span><b>${money(bonus)}</b></div>`);
  breakdown.push(`<div><span>Auction premium</span><b>${money(auctionBid - totalValue())}</b></div>`);
  $('saleBreakdown').innerHTML = breakdown.join('');
  playTone(820, .24);
}
function placeBid() {
  if ($('auctionRoom').classList.contains('finished')) return;
  let bidderIndex = Math.floor(Math.random() * 6);
  if (bidderIndex === lastBidder) bidderIndex = (bidderIndex + 1 + Math.floor(Math.random() * 5)) % 6;
  lastBidder = bidderIndex;
  const increase = .045 + Math.random() * .075;
  auctionBid = Math.ceil((auctionBid * (1 + increase)) / 10) * 10;
  auctionCount++;
  const bidder = document.querySelector(`[data-bidder="${bidderIndex}"]`);
  bidder.classList.add('bidding');
  bidder.querySelector('.bid-tag').textContent = money(auctionBid);
  $('auctionPrice').textContent = money(auctionBid);
  $('auctionBidder').textContent = `${bidderNames[bidderIndex]} · NEW HIGH BID`;
  $('bidCount').textContent = auctionCount;
  $('auctionSpeech').textContent = `${bidderNames[bidderIndex]} bids ${money(auctionBid)}! Do I hear more?`;
  $('auctionState').textContent = 'BID RECEIVED';
  playTone(530 + bidderIndex * 35, .1);
  auctionEndsAt = Math.max(auctionEndsAt, Date.now() + 1800);
  if (auctionCount >= 8) auctionEndsAt = Math.min(auctionEndsAt, Date.now() + 2500);
  auctionBidId = setTimeout(() => {
    if (Date.now() >= auctionEndsAt || auctionCount >= 9) finishAuction();
    else placeBid();
  }, 1450 + Math.random() * 700);
}
function openSale() {
  const total = totalValue();
  auctionBid = Math.ceil((total * .72) / 10) * 10;
  auctionCount = 0; lastBidder = -1;
  stopAuction();
  document.querySelectorAll('.bidder').forEach(bidder => {
    bidder.classList.remove('bidding'); bidder.querySelector('.bid-tag').textContent = '—';
  });
  $('auctionRoom').classList.remove('finished');
  $('auctionResult').classList.remove('visible'); $('auctionResult').setAttribute('aria-hidden', 'true');
  $('auctionBuildName').textContent = buildName().toUpperCase();
  $('stageBuildName').textContent = buildName().toUpperCase();
  $('auctionPrice').textContent = money(auctionBid);
  $('auctionBidder').textContent = 'OPENING OFFER';
  $('bidCount').textContent = '0';
  $('auctionTimer').textContent = '18';
  $('auctionState').textContent = 'BIDDING OPEN';
  $('auctionSpeech').textContent = 'A rare build enters the room. Who will make the first offer?';
  $('saleOverlay').classList.add('open'); $('saleOverlay').setAttribute('aria-hidden', 'false');
  resizeAuctionScene();
  document.body.classList.add('sale-active');
  document.body.style.overflow = 'hidden';
  auctionEndsAt = Date.now() + 18000;
  auctionTimerId = setInterval(() => {
    const remaining = Math.max(0, Math.ceil((auctionEndsAt - Date.now()) / 1000));
    $('auctionTimer').textContent = remaining;
    if (remaining <= 0) finishAuction();
  }, 200);
  auctionBidId = setTimeout(placeBid, 1200);
  playTone(720, .2);
}
$('saleClose').addEventListener('click', closeSale);
$('saleOverlay').addEventListener('click', event => { if (event.target === $('saleOverlay')) closeSale(); });
$('acceptBid').addEventListener('click', finishAuction);
$('auctionRun').addEventListener('click', () => {
  if ($('auctionRoom').classList.contains('finished')) return;
  auctionEndsAt += 5000;
  $('auctionSpeech').textContent = 'The auctioneer gives the room a little longer. Any final offers?';
  $('auctionTimer').textContent = Math.ceil((auctionEndsAt - Date.now()) / 1000);
  $('auctionRun').textContent = 'MORE TIME ADDED';
  $('auctionRun').disabled = true;
  setTimeout(() => { $('auctionRun').textContent = 'LET BIDS ROLL ↗'; $('auctionRun').disabled = false; }, 1800);
});
$('buildAnother').addEventListener('click', () => {
  closeSale(); Object.keys(selected).forEach(key => { selected[key] = 0; }); setStep(0); updateUI(); rebuildSaber();
  $('toast').textContent = 'A fresh workbench. A new story.'; $('toast').classList.add('show'); setTimeout(() => $('toast').classList.remove('show'), 2200);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeSale();
  if (event.key === 'ArrowRight' && !$('saleOverlay').classList.contains('open')) nextStep();
  if (event.key === 'ArrowLeft' && !$('saleOverlay').classList.contains('open')) setStep(activeStep - 1);
});

// A compact, fully interactive Three.js workbench: every option is assembled from real 3D geometry.
const mount = $('sceneWrap');
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x1d2420, 9, 20);
const camera = new THREE.PerspectiveCamera(36, 1, .1, 80);
camera.position.set(5.2, 3.2, 8.8); camera.lookAt(0, 1.85, 0);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.12;
mount.insertBefore(renderer.domElement, mount.querySelector('.scene-vignette'));
scene.add(new THREE.HemisphereLight(0xc9d9cf, 0x202820, 2.1));
const keyLight = new THREE.DirectionalLight(0xffe6c6, 3.5); keyLight.position.set(4, 7, 5); keyLight.castShadow = true; keyLight.shadow.mapSize.set(1024, 1024); scene.add(keyLight);
const rimLight = new THREE.PointLight(0x83a878, 19, 12); rimLight.position.set(-3, 3, -2); scene.add(rimLight);
const floor = new THREE.Mesh(new THREE.CircleGeometry(5, 64), new THREE.MeshStandardMaterial({ color: 0x29302c, roughness: .8, metalness: .15 }));
floor.rotation.x = -Math.PI / 2; floor.position.y = -1.02; floor.receiveShadow = true; scene.add(floor);
const grid = new THREE.GridHelper(12, 24, 0x64705e, 0x3c453f); grid.position.y = -1; grid.material.transparent = true; grid.material.opacity = .22; scene.add(grid);
const turntable = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.13, .12, 64), new THREE.MeshStandardMaterial({ color: 0x252c28, metalness: .72, roughness: .32 }));
turntable.position.set(0, -.92, 0); turntable.castShadow = true; turntable.receiveShadow = true; scene.add(turntable);
const turntableEdge = new THREE.Mesh(new THREE.TorusGeometry(1.1, .018, 8, 64), new THREE.MeshStandardMaterial({ color: 0xc3d48c, emissive: 0x33421e, metalness: .55, roughness: .3 }));
turntableEdge.rotation.x = Math.PI / 2; turntableEdge.position.y = -.85; scene.add(turntableEdge);
const saberRoot = new THREE.Group(); scene.add(saberRoot);
let model = new THREE.Group(); saberRoot.add(model);
const auctionCanvas = $('auctionSaber');
const auctionScene = new THREE.Scene();
const auctionCamera = new THREE.OrthographicCamera(-2, 2, 2.9, -2.9, .1, 40);
auctionCamera.position.set(4.5, 3.1, 8); auctionCamera.lookAt(0, 1.8, 0);
const auctionRenderer = new THREE.WebGLRenderer({ canvas: auctionCanvas, antialias: true, alpha: true });
auctionRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
auctionRenderer.outputColorSpace = THREE.SRGBColorSpace;
auctionRenderer.toneMapping = THREE.ACESFilmicToneMapping; auctionRenderer.toneMappingExposure = 1.12;
auctionScene.add(new THREE.HemisphereLight(0xe4f0e2, 0x18211b, 2.2));
const auctionKey = new THREE.DirectionalLight(0xffe6c6, 3.2); auctionKey.position.set(4, 7, 5); auctionScene.add(auctionKey);
const auctionRim = new THREE.PointLight(0x9bd5ff, 16, 10); auctionRim.position.set(-2, 3, -2); auctionScene.add(auctionRim);
const auctionSaberRoot = new THREE.Group(); auctionScene.add(auctionSaberRoot);
let pointerDown = false, pointerX = 0, pointerY = 0, rotationX = 0, rotationY = -.24, autoRotate = true;
const clock = new THREE.Clock();

function metal(color, roughness = .33, metalness = .82) { return new THREE.MeshStandardMaterial({ color, roughness, metalness }); }
function addMesh(parent, geometry, material, position, rotation) {
  const mesh = new THREE.Mesh(geometry, material); mesh.position.set(...position);
  if (rotation) mesh.rotation.set(...rotation); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
function cylinder(parent, radiusTop, radiusBottom, height, material, y, radial = 48) {
  return addMesh(parent, new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radial, 1), material, [0, y, 0]);
}
function torus(parent, radius, tube, material, y) {
  const mesh = addMesh(parent, new THREE.TorusGeometry(radius, tube, 10, 48), material, [0, y, 0], [Math.PI / 2, 0, 0]); return mesh;
}
function syncAuctionSaber() {
  auctionSaberRoot.clear();
  const auctionModel = model.clone(true);
  auctionModel.scale.setScalar(.8);
  auctionSaberRoot.add(auctionModel);
  auctionRim.color.set(selectedOption('crystal').hex);
}
function resizeAuctionScene() {
  const width = Math.max(1, auctionCanvas.clientWidth), height = Math.max(1, auctionCanvas.clientHeight);
  auctionRenderer.setSize(width, height, false);
  const viewHeight = 5.9, halfWidth = viewHeight * width / height / 2;
  auctionCamera.left = -halfWidth; auctionCamera.right = halfWidth;
  auctionCamera.top = viewHeight / 2; auctionCamera.bottom = -viewHeight / 2;
  auctionCamera.updateProjectionMatrix();
}
function rebuildSaber() {
  scene.remove(saberRoot); model = new THREE.Group(); saberRoot.clear(); saberRoot.add(model); scene.add(saberRoot);
  const hilt = selectedOption('hilt');
  const emitter = selectedOption('emitter');
  const grip = selectedOption('grip');
  const pommel = selectedOption('pommel');
  const crystal = selectedOption('crystal');
  const bodyColor = { satin: 0xa6ada3, copper: 0xb7835d, onyx: 0x444b48, ivory: 0xd0c8b1, teal: 0x397d78, brass: 0xb98a3b, frost: 0xb8c9d0, patina: 0x668d79 }[hilt.finish];
  const body = metal(bodyColor, hilt.finish === 'ivory' ? .4 : .26, .8);
  const accent = selectedOption('accent');
  const accentHex = new THREE.Color(accent.color).getHex();
  const dark = metal(0x252b28, .38, .7), bright = metal(accentHex, .2, .92);
  const barrelRadius = hilt.profile === 'slim' ? .235 : .285;
  if (hilt.profile === 'taper') cylinder(model, .23, .31, 1.06, body, -.03);
  else if (hilt.profile === 'bulbous') {
    cylinder(model, .245, .245, 1.04, body, -.03);
    const bulb = addMesh(model, new THREE.SphereGeometry(.30, 32, 20), body, [0, -.04, 0]); bulb.scale.y = 1.48;
  } else cylinder(model, barrelRadius, barrelRadius, 1.06, body, -.03, hilt.profile === 'hex' ? 6 : 48);
  cylinder(model, barrelRadius + .01, barrelRadius + .01, .16, dark, .48);
  cylinder(model, barrelRadius + .013, barrelRadius + .013, .04, bright, .57);
  cylinder(model, .30, .30, .035, dark, -.53);
  for (const y of [-.47, -.39, .30, .36]) torus(model, hilt.profile === 'slim' ? .245 : .295, .014, bright, y);
  if (hilt.profile === 'fluted') {
    for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5; addMesh(model, new THREE.BoxGeometry(.035, .72, .035), bright, [Math.cos(a) * .278, -.02, Math.sin(a) * .278], [0, -a, 0]); }
  } else if (hilt.profile === 'segmented') {
    for (let i = 0; i < 5; i++) cylinder(model, .302, .302, .055, i % 2 ? bright : dark, -.38 + i * .17);
  } else if (hilt.profile === 'stacked') {
    for (let i = 0; i < 5; i++) cylinder(model, .32 - i * .012, .32 - i * .012, .075, i % 2 ? bright : body, -.40 + i * .20);
  }
  const gripColor = grip.style === 'wrap' ? 0x80634c : grip.style === 'carbon' ? 0x202c2b : hilt.finish === 'copper' ? 0x655044 : 0x303734;
  const gripMat = new THREE.MeshStandardMaterial({ color: gripColor, roughness: grip.style === 'wrap' ? .9 : .53, metalness: .4 });
  const gripRadius = hilt.profile === 'slim' ? .248 : .302;
  cylinder(model, gripRadius, gripRadius, .57, gripMat, -.08, hilt.profile === 'hex' ? 6 : 48);
  if (grip.style === 'ribs') {
    for (let i = 0; i < 9; i++) torus(model, gripRadius + .01, .018, bright, -.34 + i * .065);
  } else if (grip.style === 'knurl' || grip.style === 'carbon') {
    for (let row = 0; row < 7; row++) for (let col = 0; col < 12; col++) {
      const a = col * Math.PI / 6 + (row % 2) * .13, y = -.32 + row * .08;
      addMesh(model, new THREE.BoxGeometry(.035, .025, .018), grip.style === 'knurl' ? bright : metal(0x60716b, .4, .75), [Math.cos(a) * (gripRadius + .008), y, Math.sin(a) * (gripRadius + .008)], [0, -a, grip.style === 'knurl' ? .55 : -.45]);
    }
  } else if (grip.style === 'spiral') {
    const points = []; for (let i = 0; i <= 160; i++) { const t = i / 160, a = t * Math.PI * 12; points.push(new THREE.Vector3(Math.cos(a) * (gripRadius + .018), -.35 + t * .54, Math.sin(a) * (gripRadius + .018))); }
    addMesh(model, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 160, .018, 7, false), bright, [0, 0, 0]);
  } else if (grip.style === 'scales') {
    for (let row = 0; row < 5; row++) for (let col = 0; col < 10; col++) { const a = col * Math.PI / 5 + (row % 2) * .31; addMesh(model, new THREE.SphereGeometry(.056, 8, 6), row % 2 ? bright : dark, [Math.cos(a) * (gripRadius + .006), -.29 + row * .105, Math.sin(a) * (gripRadius + .006)]).scale.set(.72, .78, .35); }
  } else if (grip.style === 'studs') {
    for (let row = 0; row < 4; row++) for (let col = 0; col < 8; col++) { const a = col * Math.PI / 4, y = -.28 + row * .13; addMesh(model, new THREE.SphereGeometry(.032, 10, 8), bright, [Math.cos(a) * (gripRadius + .016), y, Math.sin(a) * (gripRadius + .016)]); }
  } else if (grip.style === 'panels') {
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; addMesh(model, new THREE.BoxGeometry(.09, .50, .025), metal(0xc9d1c9, .28, .55), [Math.cos(a) * (gripRadius + .008), -.08, Math.sin(a) * (gripRadius + .008)], [0, -a, 0]); }
  } else {
    for (let i = 0; i < 8; i++) { const a = i * Math.PI * 2 / 8; addMesh(model, new THREE.TorusGeometry(gripRadius + .015, .009, 6, 48), metal(0xb59676, .9, .15), [0, -.31 + i * .065, 0], [Math.PI / 2, a, .32]); }
  }
  // Emitter neck and chosen silhouette.
  cylinder(model, .20, .255, .18, dark, .64);
  cylinder(model, .24, .24, .055, bright, .76);
  const style = emitter.style;
  if (style === 'flare') {
    cylinder(model, .35, .22, .31, body, .91);
    cylinder(model, .355, .355, .055, bright, 1.07);
  } else if (style === 'long') {
    cylinder(model, .23, .23, .40, body, .89);
    cylinder(model, .29, .23, .12, bright, 1.15);
    cylinder(model, .30, .30, .045, dark, 1.23);
  } else if (style === 'crown') {
    cylinder(model, .30, .22, .25, body, .88);
    cylinder(model, .36, .29, .07, bright, 1.04);
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3;
      const tooth = addMesh(model, new THREE.ConeGeometry(.055, .20, 6), bright, [Math.cos(a) * .29, 1.17, Math.sin(a) * .29]);
      tooth.rotation.z = Math.cos(a) * .32; tooth.rotation.x = Math.sin(a) * .32;
    }
  } else if (style === 'vent') {
    cylinder(model, .31, .24, .25, body, .89);
    cylinder(model, .35, .35, .055, bright, 1.04);
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      addMesh(model, new THREE.BoxGeometry(.07, .23, .095), bright, [Math.cos(a) * .30, .91, Math.sin(a) * .30], [0, -a, .12]);
      addMesh(model, new THREE.BoxGeometry(.035, .12, .035), dark, [Math.cos(a) * .352, .90, Math.sin(a) * .352], [0, -a, 0]);
    }
  } else if (style === 'needle') {
    cylinder(model, .14, .28, .34, body, .91);
    cylinder(model, .155, .155, .07, bright, 1.11);
    cylinder(model, .12, .155, .10, dark, 1.19);
  } else if (style === 'halo') {
    cylinder(model, .25, .28, .17, body, .88);
    cylinder(model, .32, .32, .045, bright, 1.00);
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2;
      addMesh(model, new THREE.BoxGeometry(.035, .22, .035), bright, [Math.cos(a) * .26, 1.10, Math.sin(a) * .26], [0, -a, 0]);
    }
    torus(model, .39, .027, bright, 1.22);
  } else if (style === 'fork') {
    cylinder(model, .31, .24, .25, body, .89);
    cylinder(model, .35, .35, .055, bright, 1.04);
    for (const side of [-1, 1]) {
      const prong = addMesh(model, new THREE.ConeGeometry(.075, .43, 8), bright, [side * .23, 1.25, 0]);
      prong.rotation.z = side * -.28;
      addMesh(model, new THREE.CylinderGeometry(.035, .05, .24, 12), body, [side * .16, 1.07, 0], [0, 0, side * -.28]);
    }
  } else if (style === 'shroud') {
    cylinder(model, .29, .23, .23, body, .89);
    cylinder(model, .34, .34, .05, bright, 1.02);
    const plate = addMesh(model, new THREE.BoxGeometry(.16, .40, .12), body, [.27, 1.10, 0], [0, 0, -.16]);
    addMesh(model, new THREE.BoxGeometry(.045, .28, .025), bright, [.355, 1.10, .066], [0, 0, -.16]);
    plate.castShadow = true;
  }
  if (style !== 'halo') torus(model, style === 'needle' ? .16 : .24, .018, bright, style === 'long' ? 1.23 : 1.08);
  // A glowing, faceted kyber sliver is visible just inside the emitter throat.
  const crystalMat = new THREE.MeshPhysicalMaterial({ color: crystal.hex, emissive: crystal.hex, emissiveIntensity: 1.3, roughness: .12, metalness: .12, transparent: true, opacity: .9, transmission: .1 });
  const crystalMesh = addMesh(model, new THREE.OctahedronGeometry(.125, 0), crystalMat, [0, .89, 0]);
  crystalMesh.scale.set(.72, 1.75, .72);
  // Distinct activation hardware and its illuminated status jewel.
  const switchStyle = selectedOption('switch').style;
  const button = new THREE.MeshStandardMaterial({ color: crystal.hex, emissive: crystal.hex, emissiveIntensity: .8, metalness: .4, roughness: .25 });
  const switchBase = (x = 0, y = .22, radius = .09) => addMesh(model, new THREE.CylinderGeometry(radius, radius, .055, 24), dark, [x, y, .292], [Math.PI / 2, 0, 0]);
  const jewel = (x, y, size = .04) => addMesh(model, new THREE.SphereGeometry(size, 18, 12), button, [x, y, .34]);
  if (switchStyle === 'stud') {
    switchBase(); jewel(0, .22, .047);
  } else if (switchStyle === 'twin') {
    for (const x of [-.105, .105]) { switchBase(x, .22, .055); addMesh(model, new THREE.CylinderGeometry(.044, .044, .045, 20), bright, [x, .22, .32], [Math.PI / 2, 0, 0]); jewel(x, .22, .026); }
  } else if (switchStyle === 'lever') {
    switchBase(0, .20, .09);
    addMesh(model, new THREE.BoxGeometry(.07, .19, .06), bright, [0, .25, .34], [.2, 0, 0]); jewel(0, .34, .04);
    for (const x of [-.09, .09]) addMesh(model, new THREE.BoxGeometry(.025, .24, .05), dark, [x, .27, .33]);
  } else if (switchStyle === 'touch') {
    switchBase(); jewel(0, .22, .057); torus(model, .105, .012, bright, .22);
  } else if (switchStyle === 'dial') {
    switchBase(0, .22, .115);
    addMesh(model, new THREE.CylinderGeometry(.085, .085, .075, 12), bright, [0, .22, .35], [Math.PI / 2, 0, 0]);
    addMesh(model, new THREE.BoxGeometry(.025, .12, .035), button, [0, .22, .397]);
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; addMesh(model, new THREE.BoxGeometry(.018, .035, .018), dark, [Math.cos(a) * .105, .22 + Math.sin(a) * .105, .35], [0, 0, -a]); }
  } else if (switchStyle === 'slider') {
    addMesh(model, new THREE.BoxGeometry(.13, .30, .055), dark, [0, .22, .30]);
    addMesh(model, new THREE.BoxGeometry(.09, .12, .07), bright, [0, .24, .35], [.12, 0, 0]);
    jewel(0, .24, .025);
  } else if (switchStyle === 'guard') {
    switchBase(); jewel(0, .22, .046);
    const guard = addMesh(model, new THREE.TorusGeometry(.105, .014, 8, 24, Math.PI), bright, [0, .24, .35]);
    guard.rotation.z = Math.PI;
    for (const x of [-.105, .105]) addMesh(model, new THREE.BoxGeometry(.025, .12, .035), bright, [x, .18, .35]);
  } else if (switchStyle === 'pulse') {
    switchBase(0, .22, .11); jewel(0, .22, .067);
    torus(model, .135, .012, bright, .22);
  }
  // Individual maker's marks sit on the exposed upper barrel, above the grip.
  const engraving = selectedOption('engraving').style;
  if (engraving !== 'none') {
    const etchMat = metal(engraving === 'script' ? 0xd5ad62 : engraving === 'mark' ? accentHex : 0x87938b, .52, .45);
    const stamp = (geometry, position, rotation) => addMesh(model, geometry, etchMat, position, rotation);
    const etchLine = (x1, y1, x2, y2, width = .014) => {
      const dx = x2 - x1, dy = y2 - y1, length = Math.hypot(dx, dy);
      stamp(new THREE.BoxGeometry(width, length, .012), [(x1 + x2) / 2, (y1 + y2) / 2, .294], [0, 0, -Math.atan2(dx, dy)]);
    };
    if (engraving === 'stars') {
      const points = [[-.10,.27],[-.03,.39],[.08,.31],[.02,.47],[.12,.43]];
      points.forEach(([x, y], i) => stamp(new THREE.OctahedronGeometry(i % 2 ? .022 : .03, 0), [x, y, .30]));
      etchLine(-.10,.27,-.03,.39,.009); etchLine(-.03,.39,.08,.31,.009); etchLine(.08,.31,.02,.47,.009); etchLine(.02,.47,.12,.43,.009);
    } else if (engraving === 'script') {
      for (let i = 0; i < 5; i++) {
        const x = -.12 + i * .06, y = .28 + (i % 2) * .025;
        stamp(new THREE.BoxGeometry(.012, .12, .012), [x, y + .06, .294], [0, 0, i % 2 ? -.24 : .24]);
        stamp(new THREE.BoxGeometry(.045, .012, .012), [x + .012, y + .045, .294]);
        stamp(new THREE.SphereGeometry(.012, 8, 6), [x - .012, y + .12, .296]);
      }
    } else if (engraving === 'mark') {
      stamp(new THREE.TorusGeometry(.105, .012, 6, 28), [0, .37, .30]);
      stamp(new THREE.OctahedronGeometry(.06, 0), [0, .37, .31]);
      stamp(new THREE.BoxGeometry(.18, .012, .012), [0, .37, .30]);
      stamp(new THREE.BoxGeometry(.012, .18, .012), [0, .37, .30]);
    } else if (engraving === 'runes') {
      for (let i = 0; i < 5; i++) {
        const x = -.12 + i * .06, baseY = .27;
        etchLine(x - .018, baseY, x + .012, baseY + .07);
        etchLine(x + .012, baseY + .07, x - .012, baseY + .14);
        if (i % 2) etchLine(x - .024, baseY + .07, x + .025, baseY + .07, .01);
      }
    } else if (engraving === 'orbit') {
      stamp(new THREE.TorusGeometry(.105, .009, 6, 32), [0, .37, .30]);
      stamp(new THREE.TorusGeometry(.06, .009, 6, 24), [0, .37, .302]);
      stamp(new THREE.CircleGeometry(.014, 12), [.10, .41, .306]);
      etchLine(-.13,.30,.13,.44,.009);
    } else if (engraving === 'flame') {
      for (let i = 0; i < 4; i++) {
        const x = -.12 + i * .08, height = .09 + (i % 2) * .04;
        const flame = stamp(new THREE.ConeGeometry(.035, height, 5), [x, .31 + height / 2, .30]);
        flame.rotation.z = (i % 2 ? -.2 : .2);
        stamp(new THREE.SphereGeometry(.022, 8, 6), [x, .30, .30]).scale.set(1.2, .7, .5);
      }
    } else if (engraving === 'serial') {
      stamp(new THREE.BoxGeometry(.30, .014, .012), [0, .285, .294]);
      for (let i = 0; i < 11; i++) {
        const x = -.13 + i * .026, height = [.045,.075,.055,.09][i % 4];
        stamp(new THREE.BoxGeometry(.009, height, .012), [x, .33 + height / 2, .294]);
      }
      stamp(new THREE.BoxGeometry(.30, .012, .012), [0, .44, .294]);
    }
  }
  // Each pommel has its own recognizable silhouette and construction.
  cylinder(model, .24, .30, .15, dark, -.64);
  if (pommel.style === 'vented') {
    cylinder(model, .29, .30, .17, body, -.78);
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      addMesh(model, new THREE.BoxGeometry(.035, .12, .018), dark, [Math.cos(a) * .285, -.78, Math.sin(a) * .285], [0, -a, .12]);
    }
    torus(model, .30, .018, bright, -.69); torus(model, .29, .014, bright, -.87);
  } else if (pommel.style === 'weight') {
    cylinder(model, .34, .30, .24, body, -.80);
    cylinder(model, .31, .31, .06, bright, -.94);
    torus(model, .32, .02, bright, -.70);
  } else if (pommel.style === 'fang') {
    cylinder(model, .30, .28, .11, body, -.76);
    for (let i = 0; i < 3; i++) {
      const a = i * Math.PI * 2 / 3;
      const fang = addMesh(model, new THREE.ConeGeometry(.075, .30, 7), bright, [Math.cos(a) * .19, -.90, Math.sin(a) * .19]);
      fang.rotation.z = .35 * Math.cos(a); fang.rotation.x = .35 * Math.sin(a);
    }
  } else if (pommel.style === 'smooth') {
    cylinder(model, .26, .29, .14, body, -.77);
    const cap = addMesh(model, new THREE.SphereGeometry(.27, 24, 16), body, [0, -.84, 0]); cap.scale.y = .62;
    torus(model, .275, .016, bright, -.72);
  } else if (pommel.style === 'spike') {
    cylinder(model, .30, .27, .12, body, -.76);
    const spike = addMesh(model, new THREE.ConeGeometry(.17, .46, 12), bright, [0, -1.02, 0]); spike.rotation.z = Math.PI;
    cylinder(model, .22, .22, .035, dark, -.84);
  } else if (pommel.style === 'ring') {
    cylinder(model, .29, .27, .10, body, -.75);
    torus(model, .29, .035, bright, -.96);
    for (let i = 0; i < 3; i++) { const a = i * Math.PI * 2 / 3; addMesh(model, new THREE.CylinderGeometry(.025, .025, .25, 10), bright, [Math.cos(a) * .20, -.85, Math.sin(a) * .20]); }
  } else if (pommel.style === 'prism') {
    cylinder(model, .29, .27, .12, body, -.76);
    addMesh(model, new THREE.DodecahedronGeometry(.235, 0), bright, [0, -.91, 0], [.2, .35, .1]);
    torus(model, .285, .018, bright, -.73);
  } else if (pommel.style === 'cage') {
    cylinder(model, .29, .28, .08, body, -.73);
    torus(model, .27, .018, bright, -.68); torus(model, .24, .016, bright, -.98);
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; addMesh(model, new THREE.CylinderGeometry(.018, .018, .30, 8), bright, [Math.cos(a) * .24, -.83, Math.sin(a) * .24], [0, 0, Math.sin(a) * .10]); }
    addMesh(model, new THREE.SphereGeometry(.10, 12, 8), dark, [0, -.84, 0]);
  }
  torus(model, .29, .014, bright, -.69);
  // Build the energy blade and its light only while the ignition control is on.
  if (bladeIgnited) {
  const bladeProfile = selectedOption('blade');
  const bladeStyle = bladeProfile.style;
  const bladeLength = bladeStyle === 'long' ? 4.08 : bladeStyle === 'crossguard' ? 3.48 : 3.55;
  const bladeStart = 1.14;
  const bladeCenter = bladeStart + bladeLength / 2;
  const bladeEnd = bladeStart + bladeLength;
  const bladeSegments = bladeStyle === 'prismatic' ? 8 : bladeStyle === 'fine' ? 16 : 32;
  const bladeMat = new THREE.MeshBasicMaterial({ color: crystal.hex, transparent: true, opacity: bladeStyle === 'prismatic' ? .24 : .16, blending: THREE.AdditiveBlending, depthWrite: false });
  const bladeShell = cylinder(model, bladeProfile.width, bladeProfile.width * .78, bladeLength, bladeMat, bladeCenter, bladeSegments);
  bladeShell.userData.bladeGlow = true;
  const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .78, blending: THREE.AdditiveBlending, depthWrite: false });
  cylinder(model, bladeProfile.width * .29, bladeProfile.width * .23, bladeLength - .015, coreMat, bladeCenter, bladeStyle === 'prismatic' ? 8 : 16);
  const bladeTip = new THREE.Mesh(new THREE.SphereGeometry(bladeStyle === 'broad' ? .095 : .073, 16, 12), new THREE.MeshBasicMaterial({ color: crystal.hex, transparent: true, opacity: .5 }));
  bladeTip.position.y = bladeEnd; model.add(bladeTip);
  if (bladeStyle === 'prismatic') {
    // Faceted outer edge and a fine offset glint give the unstable blade its own silhouette.
    const edge = cylinder(model, bladeProfile.width * 1.12, bladeProfile.width * .86, bladeLength * .94, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .17, blending: THREE.AdditiveBlending, depthWrite: false, wireframe: true }), bladeCenter, 8);
    edge.userData.bladeGlow = true;
    for (let i = 0; i < 3; i++) {
      const spark = new THREE.Mesh(new THREE.SphereGeometry(.028, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .8 }));
      spark.position.set((i - 1) * .045, bladeStart + .45 + i * 1.05, .035); model.add(spark);
    }
  } else if (bladeStyle === 'crossguard') {
    const quillonMat = new THREE.MeshBasicMaterial({ color: crystal.hex, transparent: true, opacity: .32, blending: THREE.AdditiveBlending, depthWrite: false });
    const quillonCore = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .9, blending: THREE.AdditiveBlending, depthWrite: false });
    for (const side of [-1, 1]) {
      const quillon = addMesh(model, new THREE.CylinderGeometry(.047, .065, .72, 20), quillonMat, [side * .34, 1.52, 0], [0, 0, side * Math.PI / 2]);
      quillon.userData.bladeGlow = true;
      addMesh(model, new THREE.CylinderGeometry(.018, .024, .70, 14), quillonCore, [side * .34, 1.52, 0], [0, 0, side * Math.PI / 2]);
      const quillonTip = new THREE.Mesh(new THREE.SphereGeometry(.055, 12, 8), quillonMat); quillonTip.position.set(side * .70, 1.52, 0); model.add(quillonTip);
    }
  } else if (bladeStyle === 'pulse') {
    for (let i = 1; i < 8; i++) {
      const pulseMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .82, blending: THREE.AdditiveBlending, depthWrite: false });
      const ring = new THREE.Mesh(new THREE.TorusGeometry(bladeProfile.width * (i % 2 ? .92 : 1.08), .012, 6, 24), pulseMat);
      ring.rotation.x = Math.PI / 2; ring.position.y = bladeStart + i * (bladeLength / 8); ring.userData.pulseRing = i; model.add(ring);
    }
  }
  const aura = new THREE.PointLight(crystal.hex, 13, 5.5); aura.position.set(0, bladeCenter - .4, 0); model.add(aura);
  }
  model.rotation.z = -.055;
  syncAuctionSaber(); resizeAuctionScene();
  $('sceneLoading').style.opacity = '0'; setTimeout(() => { $('sceneLoading').style.display = 'none'; }, 520);
}

function resizeScene() {
  const width = Math.max(1, mount.clientWidth), height = Math.max(1, mount.clientHeight);
  renderer.setSize(width, height, false);
  camera.aspect = width / height; camera.updateProjectionMatrix();
}
new ResizeObserver(resizeScene).observe(mount);
resizeScene();
mount.addEventListener('pointerdown', event => { pointerDown = true; pointerX = event.clientX; pointerY = event.clientY; autoRotate = false; mount.setPointerCapture?.(event.pointerId); });
mount.addEventListener('pointermove', event => {
  if (!pointerDown) return;
  rotationY += (event.clientX - pointerX) * .009;
  rotationX = Math.max(-.35, Math.min(.35, rotationX + (event.clientY - pointerY) * .006));
  pointerX = event.clientX; pointerY = event.clientY;
});
mount.addEventListener('pointerup', () => { pointerDown = false; });
mount.addEventListener('pointercancel', () => { pointerDown = false; });
$('bladeToggle').addEventListener('click', () => {
  bladeIgnited = !bladeIgnited;
  bladeUserChoice = bladeIgnited;
  syncBladeToggle();
  rebuildSaber();
  playTone(bladeIgnited ? 620 : 340, .12);
});
$('resetView').addEventListener('click', () => { rotationY = -.24; rotationX = 0; autoRotate = false; });
function animate() {
  requestAnimationFrame(animate);
  const elapsed = clock.getElapsedTime();
  if (autoRotate && !pointerDown) rotationY += .002;
  saberRoot.rotation.y += (rotationY - saberRoot.rotation.y) * .08;
  saberRoot.rotation.x += (rotationX - saberRoot.rotation.x) * .08;
  const pulse = 1 + Math.sin(elapsed * 4.2) * .018;
  if (model.children.length) {
    // Profile-specific blade meshes breathe together; pulse rings ripple independently.
    model.children.forEach(child => {
      if (child.userData.bladeGlow && child.material) child.material.opacity = .14 + (Math.sin(elapsed * 3.2) + 1) * .025;
      if (child.userData.pulseRing) child.material.opacity = .42 + (Math.sin(elapsed * 5 - child.userData.pulseRing * .8) + 1) * .22;
    });
  }
  turntableEdge.material.emissiveIntensity = .22 + (pulse - 1) * 3;
  auctionSaberRoot.rotation.y += (rotationY - auctionSaberRoot.rotation.y) * .035;
  auctionSaberRoot.rotation.x += (rotationX - auctionSaberRoot.rotation.x) * .035;
  renderer.render(scene, camera);
  if ($('saleOverlay').classList.contains('open')) auctionRenderer.render(auctionScene, auctionCamera);
}
renderSteps(); renderOptions(); updateUI(); syncBladeToggle(); rebuildSaber(); animate();
