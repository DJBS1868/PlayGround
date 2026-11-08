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
    { name: 'Wayfinder', detail: 'Classic · balanced', price: 620, finish: 'satin', swatch: '', note: 'A balanced classic, made for a steady hand.' },
    { name: 'Dune Walker', detail: 'Brushed copper · rugged', price: 740, finish: 'copper', swatch: 'copper', note: 'Warm copper, built to weather any journey.' },
    { name: 'Nightfall', detail: 'Obsidian · minimalist', price: 890, finish: 'onyx', swatch: 'onyx', note: 'A shadow-dark profile with a quiet confidence.' },
    { name: 'Aureate', detail: 'Ivory alloy · heirloom', price: 1060, finish: 'ivory', swatch: 'ivory', note: 'An elegant heirloom with a light touch.' },
    { name: 'Tempest', detail: 'Blued steel · tactical', price: 820, finish: 'steel', swatch: 'steel', note: 'Blued steel with the cool precision of a storm front.' },
    { name: 'Cinderline', detail: 'Burnt bronze · weathered', price: 940, finish: 'bronze', swatch: 'bronze', note: 'Scorched bronze that has already seen a few legends.' },
    { name: 'Moonstone', detail: 'Pearl finish · serene', price: 1180, finish: 'pearl', swatch: 'pearl', note: 'A pale pearl sheen, calm as a moonlit tide.' },
    { name: 'Verdant Vow', detail: 'Moss patina · ancient', price: 1240, finish: 'moss', swatch: 'moss', note: 'Aged verdigris and old promises, worn with pride.' },
  ],
  emitter: [
    { name: 'Ascendant', detail: 'Flared · classic', price: 360, style: 'flare', note: 'A sweeping flare that frames the blade.' },
    { name: 'Longshot', detail: 'Extended · precise', price: 480, style: 'long', note: 'A long, precise throat for a focused look.' },
    { name: 'Crownpoint', detail: 'Crowned · ornate', price: 610, style: 'crown', note: 'Crowned edges add a hint of ceremony.' },
    { name: 'Venting No. 7', detail: 'Vented · kinetic', price: 720, style: 'vent', note: 'Vented fins give this build a kinetic edge.' },
    { name: 'Shroud', detail: 'Armored · cutaway', price: 690, style: 'shroud', note: 'Armored cutaways vent heat and hide the blade’s origin.' },
    { name: 'Halo', detail: 'Floating ring · ethereal', price: 840, style: 'halo', note: 'A suspended halo makes the blade feel almost ceremonial.' },
    { name: 'Serrated', detail: 'Tooth ring · aggressive', price: 560, style: 'serrated', note: 'A ring of teeth gives the emitter a predatory silhouette.' },
    { name: 'Oracle', detail: 'Stepped bell · stately', price: 780, style: 'oracle', note: 'A stepped bell that announces the blade before it ignites.' },
  ],
  grip: [
    { name: 'Pilgrim wrap', detail: 'Leather · soft touch', price: 220, style: 'wrap', note: 'A soft wrap for long hours on the trail.' },
    { name: 'Crosshatch', detail: 'Knurled · all-weather', price: 310, style: 'knurl', note: 'A tactile crosshatch holds firm in any weather.' },
    { name: 'Field ribs', detail: 'Ridged · secure', price: 380, style: 'ribs', note: 'Close-set ribs add control and a little drama.' },
    { name: 'Core weave', detail: 'Carbon · lightweight', price: 470, style: 'carbon', note: 'Lightweight weave, engineered for speed.' },
    { name: 'Krayt hide', detail: 'Heavy hide · old frontier', price: 350, style: 'hide', note: 'Thick hide rings, cured the way the outer rim still does it.' },
    { name: 'Copper coil', detail: 'Conductive · warm', price: 420, style: 'coil', note: 'A live copper coil runs heat away from your palm.' },
    { name: 'Segment scales', detail: 'Armored · grippy', price: 540, style: 'scales', note: 'Overlapping scales lock into your grip under pressure.' },
    { name: 'Polished bore', detail: 'Smooth · fast draw', price: 390, style: 'smooth', note: 'A mirror-smooth bore for a clean, fast draw.' },
  ],
  pommel: [
    { name: 'Dissipator', detail: 'Vented · balanced', price: 180, style: 'vented', note: 'Clean venting keeps the hilt nicely balanced.' },
    { name: 'Anchor cap', detail: 'Weighted · steady', price: 260, style: 'weight', note: 'A weighted cap lends a reassuring counterbalance.' },
    { name: 'Starfang', detail: 'Pronged · striking', price: 350, style: 'fang', note: 'Three sculpted prongs leave a memorable finish.' },
    { name: 'Whisper', detail: 'Low profile · refined', price: 430, style: 'smooth', note: 'A smooth, low-profile ending for a refined build.' },
    { name: 'Halo ring', detail: 'Floating · elegant', price: 330, style: 'ring', note: 'A free-hanging ring catches the light with every turn.' },
    { name: 'Needle', detail: 'Spiked · aggressive', price: 290, style: 'spike', note: 'A single needle point makes the last word unmistakable.' },
    { name: 'Monolith', detail: 'Block · brutalist', price: 470, style: 'block', note: 'A squared block anchors the build with brutalist weight.' },
    { name: 'Bell flare', detail: 'Flared · resonant', price: 380, style: 'bell', note: 'A flared bell gives the saber a resonant, musical finish.' },
  ],
  crystal: [
    { name: 'Azure', detail: 'KYBER · steadfast', price: 760, color: '#65aaff', hex: 0x65aaff, note: 'Steadfast and clear. The color of a path well chosen.' },
    { name: 'Verdant', detail: 'KYBER · attuned', price: 920, color: '#8de58c', hex: 0x8de58c, note: 'Attuned to the living Force, bright as new growth.' },
    { name: 'Solaris', detail: 'KYBER · resolute', price: 1080, color: '#ffbf63', hex: 0xffbf63, note: 'A rare golden glow for a resolute spirit.' },
    { name: 'Vesper', detail: 'KYBER · intuitive', price: 1320, color: '#c995ff', hex: 0xc995ff, note: 'Intuitive and uncommon, with a violet heart.' },
    { name: 'Ember', detail: 'KYBER · unbound', price: 1540, color: '#ff6f67', hex: 0xff6f67, note: 'An unbound fire, for those who choose their own way.' },
    { name: 'Tidecaller', detail: 'KYBER · adaptive', price: 880, color: '#5fe8e0', hex: 0x5fe8e0, note: 'A bright cyan current, always finding the open path.' },
    { name: 'Mistwalker', detail: 'KYBER · elusive', price: 960, color: '#6fe0b8', hex: 0x6fe0b8, note: 'Sea-green and quiet, like a shore wrapped in morning fog.' },
    { name: 'Suncatcher', detail: 'KYBER · radiant', price: 1140, color: '#ffd166', hex: 0xffd166, note: 'Amber light that gathers every warm thing in the room.' },
    { name: 'Orchid', detail: 'KYBER · fearless', price: 1260, color: '#ff7ad9', hex: 0xff7ad9, note: 'A vivid orchid blaze for a heart that never hedges.' },
    { name: 'Purity', detail: 'KYBER · balanced', price: 1680, color: '#f2f6ff', hex: 0xf2f6ff, note: 'White light, perfectly balanced between every extreme.' },
    { name: 'Deepwater', detail: 'KYBER · profound', price: 1420, color: '#6d7cff', hex: 0x6d7cff, note: 'Indigo depths with a calm that goes all the way down.' },
    { name: 'Heartline', detail: 'KYBER · devoted', price: 1100, color: '#ff9db0', hex: 0xff9db0, note: 'A rose glow that keeps its promise through any storm.' },
    { name: 'Springfire', detail: 'KYBER · restless', price: 1020, color: '#b8ff6e', hex: 0xb8ff6e, note: 'A restless lime spark, always ready for the next leap.' },
    { name: 'Crimson Oath', detail: 'KYBER · unbowed', price: 1760, color: '#ff3b4e', hex: 0xff3b4e, note: 'A scarlet vow. Some blades are not meant to be gentle.' },
  ],
  accent: [
    { name: 'Palladium', detail: 'Cool silver · classic', price: 180, color: '#c9d2cd', note: 'Crisp silver detailing gives a clean, timeless finish.' },
    { name: 'Gilt', detail: 'Warm gold · heirloom', price: 310, color: '#e5bd69', note: 'Warm gold catches the light like a treasured relic.' },
    { name: 'Aurora', detail: 'Iridescent · rare', price: 460, color: '#9ad9c9', note: 'Iridescent accents shift softly with every turn.' },
    { name: 'Crimson', detail: 'Enamel · bold', price: 390, color: '#d46b5f', note: 'A flash of red enamel makes this build unmistakable.' },
    { name: 'Antique brass', detail: 'Aged · warm', price: 250, color: '#b99a5e', note: 'Antique brass carries the warmth of a well-kept workshop.' },
    { name: 'Chrome', detail: 'Mirror · modern', price: 340, color: '#e8eef0', note: 'Mirror chrome throws every color of the room back at it.' },
    { name: 'Rose gold', detail: 'Soft · romantic', price: 420, color: '#e6a58d', note: 'Rose gold softens hard edges without losing any shine.' },
    { name: 'Gunmetal', detail: 'Dark · understated', price: 300, color: '#737c80', note: 'Dark gunmetal keeps the loudest details close to the vest.' },
  ],
  blade: [
    { name: 'Classic', detail: 'Focused · balanced', price: 240, width: .092, length: 3.55, note: 'A balanced, focused blade with a bright core.' },
    { name: 'Duelist', detail: 'Broad · radiant', price: 380, width: .12, length: 3.4, note: 'A broader blade throws a bold pool of colored light.' },
    { name: 'Whisper', detail: 'Fine · precise', price: 330, width: .068, length: 3.7, note: 'A fine, precise beam with an elegant profile.' },
    { name: 'Prismatic', detail: 'Unstable · rare', price: 520, width: .105, length: 3.5, glow: 17, note: 'A lively, prismatic edge with an unusually bright aura.' },
    { name: 'Lance', detail: 'Extended · reaching', price: 430, width: .084, length: 4.1, note: 'A long lance of light for keeping the fight at a distance.' },
    { name: 'Greatblade', detail: 'Heavy · imposing', price: 560, width: .142, length: 3.3, glow: 16, note: 'A heavy blade with the presence of a coming storm.' },
    { name: 'Needle', detail: 'Slender · surgical', price: 300, width: .052, length: 3.75, note: 'A surgical needle of light with almost no wasted glow.' },
    { name: 'Eclipse', detail: 'Dark aura · rare', price: 640, width: .112, length: 3.6, glow: 8, note: 'A blade that seems to drink the light around its own core.' },
  ],
  switch: [
    { name: 'Recessed stud', detail: 'Low profile · tactile', price: 120, style: 'stud', note: 'A discreet control that sits flush to the hilt.' },
    { name: 'Twin toggles', detail: 'Machined · precise', price: 210, style: 'twin', note: 'Twin controls give the hilt a precision-instrument feel.' },
    { name: 'Guarded lever', detail: 'Protected · field-ready', price: 280, style: 'lever', note: 'A guarded lever built for quick activation.' },
    { name: 'Crystal touch', detail: 'Illuminated · arcane', price: 360, style: 'touch', note: 'A luminous touchpoint puts the crystal at your fingertips.' },
    { name: 'Slide plate', detail: 'Linear · smooth', price: 190, style: 'slider', note: 'A linear slide plate activates with one clean motion.' },
    { name: 'Control wheel', detail: 'Rotary · tuned', price: 240, style: 'wheel', note: 'A rotary wheel lets you tune the blade like an instrument.' },
    { name: 'Field clamp', detail: 'Mechanical · rugged', price: 320, style: 'clamp', note: 'A heavy field clamp that will not fire by accident.' },
    { name: 'Touch pad', detail: 'Sealed · modern', price: 300, style: 'pad', note: 'A sealed touch pad, smooth under a gloved thumb.' },
  ],
  engraving: [
    { name: 'None', detail: 'Pure lines · understated', price: 0, style: 'none', note: 'Let the shape and materials speak for themselves.' },
    { name: 'Star map', detail: 'Deep etched · explorer', price: 240, style: 'stars', note: 'A tiny star map marks the route that brought you here.' },
    { name: 'Old script', detail: 'Gold inlay · ceremonial', price: 390, style: 'script', note: 'A line of ancient script makes this an heirloom.' },
    { name: 'Maker’s mark', detail: 'Custom seal · artisan', price: 320, style: 'mark', note: 'Your maker’s seal, stamped into the heart of the hilt.' },
    { name: 'Ring bands', detail: 'Turned lines · classic', price: 170, style: 'rings', note: 'Fine turned bands catch the light along the barrel.' },
    { name: 'Rune column', detail: 'Hand cut · mystic', price: 360, style: 'runes', note: 'A column of hand-cut runes whispers an old warning.' },
    { name: 'Constellation', detail: 'Studded · celestial', price: 430, style: 'constellation', note: 'A scatter of tiny studs maps a private constellation.' },
    { name: 'Motto line', detail: 'Micro etch · personal', price: 280, style: 'motto', note: 'A single etched line, small enough to keep a secret.' },
  ],
};
const selected = Object.fromEntries(Object.keys(options).map(key => [key, 0]));
let activeStep = 0;
const $ = (id) => document.getElementById(id);
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
    renderOptions(); updateUI(); rebuildSaber(); playTone(480 + activeStep * 70, .07);
  }));
  $('selectionNote').textContent = selectedOption(step.id).note;
  $('partValue').textContent = money(selectedOption(step.id).price);
}
function setStep(index) {
  activeStep = Math.max(0, Math.min(steps.length - 1, index));
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
function renderAuctionSaber() {
  const hilt = selectedOption('hilt');
  const crystal = selectedOption('crystal');
  const accent = selectedOption('accent');
  const blade = selectedOption('blade');
  const bodyColors = { satin: '#a6ada3', copper: '#b7835d', onyx: '#444b48', ivory: '#d0c8b1', steel: '#637985', bronze: '#79583e', pearl: '#d7d4ca', moss: '#536c58' };
  const saber = $('podiumSaber');
  saber.style.setProperty('--saber-body', bodyColors[hilt.finish] || '#a6ada3');
  saber.style.setProperty('--saber-accent', accent.color);
  saber.style.setProperty('--saber-crystal', crystal.color);
  saber.style.setProperty('--blade-width', `${Math.max(9, Math.min(24, blade.width * 150))}px`);
  saber.style.setProperty('--blade-height', `${Math.round(115 + (blade.length - 3.3) * 34)}px`);
  saber.dataset.emitter = selectedOption('emitter').style;
  saber.dataset.grip = selectedOption('grip').style;
  saber.dataset.pommel = selectedOption('pommel').style;
  saber.dataset.hilt = hilt.finish;
  saber.setAttribute('aria-label', `${buildName()} saber, ${crystal.name} ${blade.name} blade`);
  saber.innerHTML = '<div class="podium-saber-halo"></div><span class="auction-blade"><i></i></span><span class="auction-emitter"></span><span class="auction-neck"></span><span class="auction-hilt"><i class="auction-grip"></i><i class="auction-switch"></i><i class="auction-detail auction-detail-one"></i><i class="auction-detail auction-detail-two"></i></span><span class="auction-pommel"></span>';
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
  renderAuctionSaber();
  $('auctionBuildName').textContent = buildName().toUpperCase();
  $('stageBuildName').textContent = buildName().toUpperCase();
  $('auctionPrice').textContent = money(auctionBid);
  $('auctionBidder').textContent = 'OPENING OFFER';
  $('bidCount').textContent = '0';
  $('auctionTimer').textContent = '18';
  $('auctionState').textContent = 'BIDDING OPEN';
  $('auctionSpeech').textContent = 'A rare build enters the room. Who will make the first offer?';
  $('saleOverlay').classList.add('open'); $('saleOverlay').setAttribute('aria-hidden', 'false');
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
function rebuildSaber() {
  scene.remove(saberRoot); model = new THREE.Group(); saberRoot.clear(); saberRoot.add(model); scene.add(saberRoot);
  const hilt = selectedOption('hilt');
  const emitter = selectedOption('emitter');
  const grip = selectedOption('grip');
  const pommel = selectedOption('pommel');
  const crystal = selectedOption('crystal');
  const bodyColor = { satin: 0xa6ada3, copper: 0xb7835d, onyx: 0x444b48, ivory: 0xd0c8b1 }[hilt.finish];
  const body = metal(bodyColor, hilt.finish === 'ivory' ? .4 : .26, .8);
  const accent = selectedOption('accent');
  const accentHex = new THREE.Color(accent.color).getHex();
  const dark = metal(0x252b28, .38, .7), bright = metal(accentHex, .2, .92);
  cylinder(model, .285, .29, 1.06, body, -.03);
  cylinder(model, .296, .296, .16, dark, .48);
  cylinder(model, .299, .299, .04, bright, .57);
  cylinder(model, .3, .3, .035, dark, -.53);
  // Subtle hand-turned lathe details.
  for (const y of [-.47, -.39, .30, .36]) torus(model, .295, .014, bright, y);
  // Grip choice: sleeve with its own material and tactile ribs/knurling.
  const gripColor = grip.style === 'wrap' ? 0x80634c : grip.style === 'carbon' ? 0x303a37 : hilt.finish === 'copper' ? 0x655044 : 0x303734;
  const gripMat = new THREE.MeshStandardMaterial({ color: gripColor, roughness: grip.style === 'wrap' ? .9 : .53, metalness: .4 });
  cylinder(model, .302, .302, .57, gripMat, -.08);
  if (grip.style === 'ribs' || grip.style === 'knurl' || grip.style === 'carbon') {
    const count = grip.style === 'ribs' ? 8 : 13;
    for (let i = 0; i < count; i++) torus(model, .306, grip.style === 'ribs' ? .018 : .009, grip.style === 'ribs' ? bright : dark, -.34 + i * (.52 / (count - 1)));
  } else {
    for (let i = 0; i < 7; i++) {
      const a = i * .24;
      addMesh(model, new THREE.TorusGeometry(.304, .008, 6, 48), metal(0xb59676, .9, .15), [0, -.30 + i * .073, 0], [Math.PI / 2, a, .32]);
    }
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
  } else {
    cylinder(model, .31, .23, .27, body, .89);
    cylinder(model, .34, .34, .055, bright, 1.04);
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      addMesh(model, new THREE.BoxGeometry(.075, .20, .105), dark, [Math.cos(a) * .29, .90, Math.sin(a) * .29], [0, -a, .12]);
    }
  }
  torus(model, .24, .018, bright, 1.08);
  // A glowing, faceted kyber sliver is visible just inside the emitter throat.
  const crystalMat = new THREE.MeshPhysicalMaterial({ color: crystal.hex, emissive: crystal.hex, emissiveIntensity: 1.3, roughness: .12, metalness: .12, transparent: true, opacity: .9, transmission: .1 });
  const crystalMesh = addMesh(model, new THREE.OctahedronGeometry(.125, 0), crystalMat, [0, .89, 0]);
  crystalMesh.scale.set(.72, 1.75, .72);
  // Custom activation hardware and its illuminated status jewel.
  const switchStyle = selectedOption('switch').style;
  const button = new THREE.MeshStandardMaterial({ color: crystal.hex, emissive: crystal.hex, emissiveIntensity: .8, metalness: .4, roughness: .25 });
  addMesh(model, new THREE.CylinderGeometry(switchStyle === 'twin' ? .055 : .075, switchStyle === 'twin' ? .055 : .075, .055, 24), dark, [0, .22, .292], [Math.PI / 2, 0, 0]);
  if (switchStyle === 'twin') {
    for (const x of [-.105, .105]) {
      addMesh(model, new THREE.CylinderGeometry(.044, .044, .045, 20), bright, [x, .22, .30], [Math.PI / 2, 0, 0]);
      addMesh(model, new THREE.SphereGeometry(.026, 16, 10), button, [x, .22, .33]);
    }
  } else if (switchStyle === 'lever') {
    addMesh(model, new THREE.BoxGeometry(.07, .19, .06), bright, [0, .24, .33], [.2, 0, 0]);
    addMesh(model, new THREE.SphereGeometry(.04, 16, 10), button, [0, .32, .36]);
  } else {
    addMesh(model, new THREE.SphereGeometry(switchStyle === 'touch' ? .055 : .044, 18, 12), button, [0, .22, .327]);
    if (switchStyle === 'touch') torus(model, .105, .012, bright, .22);
  }
  for (let side = -1; side <= 1; side += 2) {
    addMesh(model, new THREE.BoxGeometry(.06, .16, .025), bright, [side * .13, .18, .288]);
  }
  // Fine maker's marks engraved into the exposed barrel.
  const engraving = selectedOption('engraving').style;
  if (engraving !== 'none') {
    const etchMat = metal(engraving === 'script' ? 0xd5ad62 : engraving === 'mark' ? accentHex : 0x87938b, .52, .45);
    if (engraving === 'stars') {
      for (let i = 0; i < 7; i++) {
        const y = -.38 + i * .105;
        addMesh(model, new THREE.OctahedronGeometry(.025, 0), etchMat, [.295, y, .035 + (i % 2) * .045]);
      }
    } else if (engraving === 'script') {
      for (let i = 0; i < 5; i++) addMesh(model, new THREE.BoxGeometry(.018, .075, .012), etchMat, [.297, -.30 + i * .13, .03], [0, 0, (i % 2 ? -.3 : .3)]);
    } else {
      addMesh(model, new THREE.TorusGeometry(.09, .012, 6, 24), etchMat, [0, .02, .30], [Math.PI / 2, 0, 0]);
      addMesh(model, new THREE.OctahedronGeometry(.055, 0), etchMat, [0, .02, .32]);
    }
  }
  // Pommel cap. The profile changes with every selection.
  cylinder(model, .24, .30, .15, dark, -.64);
  if (pommel.style === 'weight') {
    cylinder(model, .34, .29, .21, body, -.78); torus(model, .30, .02, bright, -.87);
  } else if (pommel.style === 'fang') {
    cylinder(model, .30, .28, .11, body, -.76);
    for (let i = 0; i < 3; i++) {
      const a = i * Math.PI * 2 / 3;
      const fang = addMesh(model, new THREE.ConeGeometry(.075, .30, 7), bright, [Math.cos(a) * .19, -.89, Math.sin(a) * .19]);
      fang.rotation.z = .35 * Math.cos(a); fang.rotation.x = .35 * Math.sin(a);
    }
  } else if (pommel.style === 'smooth') {
    cylinder(model, .26, .29, .19, body, -.78); torus(model, .27, .016, bright, -.88);
  } else {
    cylinder(model, .31, .27, .13, body, -.77);
    for (let i = 0; i < 6; i++) torus(model, .282, .013, bright, -.82 + i * .035);
  }
  torus(model, .29, .014, bright, -.69);
  // Extend the chosen crystal into a bright, softly translucent blade.
  const bladeProfile = selectedOption('blade');
  const bladeMat = new THREE.MeshBasicMaterial({ color: crystal.hex, transparent: true, opacity: bladeProfile.name === 'Prismatic' ? .22 : .16, blending: THREE.AdditiveBlending, depthWrite: false });
  cylinder(model, bladeProfile.width, bladeProfile.width * .78, 3.55, bladeMat, 2.91, 24);
  const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .78, blending: THREE.AdditiveBlending, depthWrite: false });
  cylinder(model, bladeProfile.width * .29, bladeProfile.width * .23, 3.54, coreMat, 2.91, 16);
  const aura = new THREE.PointLight(crystal.hex, 13, 5.5); aura.position.set(0, 2.5, 0); model.add(aura);
  const bladeTip = new THREE.Mesh(new THREE.SphereGeometry(.073, 16, 12), new THREE.MeshBasicMaterial({ color: crystal.hex, transparent: true, opacity: .5 }));
  bladeTip.position.y = 4.68; model.add(bladeTip);
  model.rotation.z = -.055;
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
$('resetView').addEventListener('click', () => { rotationY = -.24; rotationX = 0; autoRotate = false; });
function animate() {
  requestAnimationFrame(animate);
  const elapsed = clock.getElapsedTime();
  if (autoRotate && !pointerDown) rotationY += .002;
  saberRoot.rotation.y += (rotationY - saberRoot.rotation.y) * .08;
  saberRoot.rotation.x += (rotationX - saberRoot.rotation.x) * .08;
  const pulse = 1 + Math.sin(elapsed * 4.2) * .018;
  if (model.children.length) {
    // Blade is near the end of the assembly; gently breathe its glow.
    const bladeMesh = model.children.find(child => child.isMesh && child.material?.blending === THREE.AdditiveBlending && child.geometry?.type === 'CylinderGeometry' && child.geometry.parameters?.radiusTop > .05);
    if (bladeMesh) bladeMesh.material.opacity = .14 + (Math.sin(elapsed * 3.2) + 1) * .025;
  }
  turntableEdge.material.emissiveIntensity = .22 + (pulse - 1) * 3;
  renderer.render(scene, camera);
}
renderSteps(); renderOptions(); updateUI(); rebuildSaber(); animate();
