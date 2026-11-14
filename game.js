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
  toggle.setAttribute('aria-checked', String(bladeIgnited));
  toggle.setAttribute('aria-label', `${bladeIgnited ? 'Turn preview blade off' : 'Turn preview blade on'}`);
  toggle.classList.toggle('is-on', bladeIgnited);
  toggle.querySelector('.blade-power-state').textContent = bladeIgnited ? 'ON' : 'OFF';
}
const money = (amount) => `¤ ${Math.round(amount).toLocaleString('en-US')}`;

// Small technical illustrations for each option, drawn from the same profiles and finishes as the 3D build.
const finishHex = { satin: '#a6ada3', copper: '#b7835d', onyx: '#444b48', ivory: '#d0c8b1', teal: '#397d78', brass: '#b98a3b', frost: '#b8c9d0', patina: '#668d79' };
const gripHex = { wrap: '#80634c', carbon: '#242f2d' };
function iconShell(inner, glow = '#d8f36a') {
  return `<svg viewBox="0 0 48 50" aria-hidden="true" focusable="false"><rect width="48" height="50" fill="#111613"/><ellipse cx="24" cy="25" rx="21" ry="24" fill="${glow}" opacity=".075"/><path d="M3 6V3h3M42 3h3v3M45 44v3h-3M6 47H3v-3" stroke="#d8f36a" stroke-opacity=".26" fill="none"/>${inner}</svg>`;
}
function metalRect(x, y, w, h, color, rx = 2) {
  const hi = Math.max(1.4, w * .2), lo = Math.max(1.2, w * .16);
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${color}"/><rect x="${x + 1.1}" y="${y + 1}" width="${hi}" height="${h - 2}" fill="#fff" opacity=".16"/><rect x="${x + w - lo - 1.1}" y="${y + 1}" width="${lo}" height="${h - 2}" fill="#000" opacity=".24"/>`;
}
function barrelIcon(profile, color, accent, x, y, w, h) {
  let out = '';
  if (profile === 'slim') { x += w * .2; w *= .6; }
  if (profile === 'taper') {
    out += `<path d="M${x + w * .24} ${y}H${x + w * .76}L${x + w} ${y + h}H${x}Z" fill="${color}"/>`;
    out += `<path d="M${x + w * .24} ${y}H${x + w * .4}L${x + w * .18} ${y + h}H${x}Z" fill="#fff" opacity=".15"/>`;
    out += `<path d="M${x + w * .76} ${y}H${x + w * .62}L${x + w * .84} ${y + h}H${x + w}Z" fill="#000" opacity=".22"/>`;
  } else if (profile === 'hex') {
    out += `<path d="M${x + w * .2} ${y}H${x + w * .8}L${x + w} ${y + h * .12}V${y + h * .88}L${x + w * .8} ${y + h}H${x + w * .2}L${x} ${y + h * .88}V${y + h * .12}Z" fill="${color}"/>`;
    out += `<path d="M${x + w * .2} ${y}H${x + w * .5}V${y + h}H${x + w * .2}L${x} ${y + h * .88}V${y + h * .12}Z" fill="#fff" opacity=".14"/>`;
    out += `<path d="M${x + w * .5} ${y}H${x + w * .8}L${x + w} ${y + h * .12}V${y + h * .88}L${x + w * .8} ${y + h}H${x + w * .5}Z" fill="#000" opacity=".2"/>`;
    out += `<path d="M${x + w * .2} ${y}H${x + w * .5}M${x + w * .2} ${y + h}H${x + w * .5}" stroke="#fff" stroke-opacity=".24"/>`;
  } else if (profile === 'stacked') {
    for (let i = 0; i < 4; i++) {
      const sw = w - i * 1.2, sx = x + (w - sw) / 2, sy = y + i * h / 4;
      out += `<rect x="${sx}" y="${sy}" width="${sw}" height="${h / 4 + .4}" rx="1.5" fill="${i % 2 ? color : accent}" opacity="${i % 2 ? 1 : .55}"/>`;
      out += `<rect x="${sx + 1}" y="${sy + 1}" width="2" height="${h / 4 - 2}" fill="#fff" opacity=".14"/>`;
    }
  } else {
    out += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2.2" fill="${color}"/>`;
    out += `<rect x="${x + 1.2}" y="${y + 1}" width="${Math.max(1.6, w * .2)}" height="${h - 2}" fill="#fff" opacity=".16"/>`;
    out += `<rect x="${x + w - Math.max(1.5, w * .16) - 1.2}" y="${y + 1}" width="${Math.max(1.5, w * .16)}" height="${h - 2}" fill="#000" opacity=".23"/>`;
  }
  if (profile === 'fluted') {
    for (let i = 0; i < 5; i++) out += `<rect x="${x + w * (.16 + i * .17)}" y="${y + 2}" width="1.2" height="${h - 4}" rx=".6" fill="${accent}" opacity=".8"/>`;
  } else if (profile === 'segmented') {
    for (let i = 0; i < 5; i++) out += `<rect x="${x - 1}" y="${y + 3 + i * (h - 6) / 5}" width="${w + 2}" height="2.6" rx="1.3" fill="${i % 2 ? accent : '#202623'}"/>`;
  } else if (profile === 'bulbous') {
    out += `<ellipse cx="${x + w / 2}" cy="${y + h / 2}" rx="${w * .62}" ry="${h * .27}" fill="${color}"/>`;
    out += `<ellipse cx="${x + w * .38}" cy="${y + h * .46}" rx="${w * .13}" ry="${h * .2}" fill="#fff" opacity=".14"/>`;
    out += `<rect x="${x - 1}" y="${y + 3}" width="${w + 2}" height="2" rx="1" fill="${accent}" opacity=".85"/>`;
    out += `<rect x="${x - 1}" y="${y + h - 5}" width="${w + 2}" height="2" rx="1" fill="${accent}" opacity=".85"/>`;
  }
  return out;
}
function hiltIcon(option, accent) {
  const color = finishHex[option.finish] || '#a6ada3';
  return iconShell(`
    ${barrelIcon(option.profile, color, accent, 16, 11, 16, 29)}
    <rect x="14" y="8" width="20" height="4.5" rx="2" fill="#252b28"/>
    <rect x="14.5" y="9" width="19" height="1.6" rx=".8" fill="${accent}"/>
    <rect x="14.5" y="40" width="19" height="4" rx="2" fill="#252b28"/>
    <rect x="15" y="41" width="18" height="1.5" rx=".75" fill="${accent}" opacity=".85"/>
    <rect x="19" y="30" width="3" height="1.8" rx=".9" fill="${accent}"/>
    <circle cx="31" cy="33" r="1.2" fill="${accent}"/>
  `, color);
}
function emitterIcon(option, bodyColor, accent) {
  const neck = `<rect x="19" y="28" width="10" height="21" rx="2" fill="${bodyColor}"/><rect x="20.2" y="29" width="2" height="19" fill="#fff" opacity=".15"/><rect x="19" y="28.5" width="10" height="1.6" fill="${accent}" opacity=".8"/>`;
  let top = '';
  if (option.style === 'flare') {
    top = `<path d="M18 31h12l5-15H13z" fill="${bodyColor}"/><path d="M18 31h3l-2-15h-3z" fill="#fff" opacity=".15"/><rect x="11.5" y="12" width="25" height="4.5" rx="2" fill="${accent}"/><rect x="13" y="13" width="22" height="1.5" rx=".75" fill="#fff" opacity=".3"/>`;
  } else if (option.style === 'long') {
    top = `<rect x="19" y="7" width="10" height="24" rx="2" fill="${bodyColor}"/><rect x="20.2" y="8" width="2" height="22" fill="#fff" opacity=".16"/><path d="M19 10h10l2-5H17z" fill="${accent}"/><rect x="15.5" y="3" width="17" height="2.4" rx="1.2" fill="#252b28"/>`;
  } else if (option.style === 'crown') {
    top = `<path d="M17 31h14l3-13H14z" fill="${bodyColor}"/><path d="M17 31h3l-1.5-13H14z" fill="#fff" opacity=".15"/><rect x="12.5" y="17" width="23" height="3.5" rx="1.7" fill="${accent}"/><path d="M13.5 18l2.5-8 2.5 8zM19 18l2.5-8 2.5 8zM24.5 18l2.5-8 2.5 8zM30 18l2.5-8 2.5 8z" fill="${accent}"/>`;
  } else if (option.style === 'vent') {
    top = `<path d="M18 31h12l3-14H15z" fill="${bodyColor}"/><path d="M18 31h3l-1-14h-3z" fill="#fff" opacity=".15"/><rect x="13.5" y="15" width="21" height="3.2" rx="1.6" fill="${accent}"/><rect x="13" y="20" width="2.6" height="9" rx="1.2" fill="${accent}"/><rect x="17.5" y="19" width="2.6" height="10" rx="1.2" fill="${accent}"/><rect x="22.7" y="19" width="2.6" height="10" rx="1.2" fill="${accent}"/><rect x="27.9" y="19" width="2.6" height="10" rx="1.2" fill="${accent}"/><rect x="32.4" y="20" width="2.6" height="9" rx="1.2" fill="${accent}"/>`;
  } else if (option.style === 'needle') {
    top = `<path d="M18 31h12l-3-14h-6z" fill="${bodyColor}"/><path d="M18 31h3l-2-14h-1z" fill="#fff" opacity=".15"/><rect x="21.2" y="13" width="5.6" height="6" rx="1.5" fill="${accent}"/><rect x="22.4" y="8" width="3.2" height="5.5" rx="1.6" fill="#252b28"/><rect x="21.4" y="8" width="5.2" height="1.4" rx=".7" fill="${accent}"/>`;
  } else if (option.style === 'halo') {
    top = `<path d="M18 31h12l2-13H16z" fill="${bodyColor}"/><path d="M18 31h3l-1-13h-4z" fill="#fff" opacity=".13"/><rect x="14.5" y="16" width="19" height="3" rx="1.5" fill="${accent}"/><rect x="17" y="9" width="2" height="7" fill="${accent}"/><rect x="22" y="9" width="2" height="7" fill="${accent}"/><rect x="27" y="9" width="2" height="7" fill="${accent}"/><ellipse cx="24" cy="8" rx="11" ry="3.6" fill="none" stroke="${accent}" stroke-width="2.2"/>`;
  } else if (option.style === 'fork') {
    top = `<path d="M18 31h12l3-14H15z" fill="${bodyColor}"/><path d="M18 31h3l-1-14h-5z" fill="#fff" opacity=".13"/><rect x="13.5" y="15" width="21" height="3.2" rx="1.6" fill="${accent}"/><path d="M17 16l-4-9 3.2-1.2 4.4 9.4z" fill="${accent}"/><path d="M31 16l4-9-3.2-1.2-4.4 9.4z" fill="${accent}"/><path d="M19.5 14l-1.2-3.2 1.6-.6 1.4 3.4z" fill="#fff" opacity=".3"/>`;
  } else if (option.style === 'shroud') {
    top = `<path d="M18 31h12l2-13H16z" fill="${bodyColor}"/><path d="M18 31h3l-1-13h-4z" fill="#fff" opacity=".13"/><rect x="14.5" y="16" width="19" height="3" rx="1.5" fill="${accent}"/><path d="M27 15h7l2.5 9-4.5 3-5.5-4z" fill="${bodyColor}"/><path d="M27 15h2.5l1.5 11-3 1z" fill="#fff" opacity=".13"/><rect x="33" y="11" width="2.2" height="11" rx="1.1" fill="${accent}"/>`;
  }
  return iconShell(neck + top, bodyColor);
}
function gripIcon(option, accent) {
  const base = gripHex[option.style] || '#39413d';
  let tex = '';
  if (option.style === 'wrap') {
    for (let i = 0; i < 8; i++) {
      const y = 10 + i * 4;
      tex += `<path d="M14 ${y}L34 ${y - 3}" stroke="#5c4735" stroke-width="2.6"/><path d="M14 ${y + 1.2}L34 ${y - 1.8}" stroke="#a58567" stroke-width=".7" opacity=".5"/>`;
    }
  } else if (option.style === 'knurl') {
    for (let row = 0; row < 6; row++) for (let col = 0; col < 3; col++) {
      const cx = 17.5 + col * 6.5, cy = 12 + row * 4.6;
      tex += `<path d="M${cx - 2} ${cy - 1.7}L${cx + 2} ${cy + 1.7}M${cx + 2} ${cy - 1.7}L${cx - 2} ${cy + 1.7}" stroke="${accent}" stroke-width="1.1"/>`;
    }
  } else if (option.style === 'ribs') {
    for (let i = 0; i < 9; i++) {
      const y = 10 + i * 3.5;
      tex += `<rect x="13.5" y="${y}" width="21" height="2.2" rx="1.1" fill="${accent}"/><rect x="13.5" y="${y + 2.2}" width="21" height=".8" fill="#141917"/>`;
    }
  } else if (option.style === 'carbon') {
    for (let row = 0; row < 9; row++) for (let col = 0; col < 4; col++) {
      tex += `<rect x="${14.5 + col * 4.9}" y="${10 + row * 3.4}" width="4.2" height="2.8" fill="${(row + col) % 2 ? '#141a18' : '#3b4742'}"/>`;
    }
    tex += `<path d="M14 12L34 38" stroke="#fff" stroke-opacity=".12" stroke-width="1"/>`;
  } else if (option.style === 'spiral') {
    tex = `<path d="M14 10L34 16L14 22L34 28L14 34L34 40" fill="none" stroke="#141917" stroke-width="3.4"/><path d="M14 10L34 16L14 22L34 28L14 34L34 40" fill="none" stroke="${accent}" stroke-width="2"/>`;
  } else if (option.style === 'scales') {
    for (let row = 0; row < 6; row++) for (let col = 0; col < 3; col++) {
      const cx = 17.5 + col * 6.5 + (row % 2 ? 3.2 : 0), cy = 12 + row * 4.6;
      if (cx + 3 > 34) continue;
      tex += `<path d="M${cx - 3} ${cy}a3 3 0 0 0 6 0z" fill="${(row + col) % 2 ? accent : '#202623'}"/><path d="M${cx - 3} ${cy}a3 3 0 0 0 6 0" fill="none" stroke="#fff" stroke-opacity=".15"/>`;
    }
  } else if (option.style === 'studs') {
    for (let row = 0; row < 6; row++) for (let col = 0; col < 3; col++) {
      const cx = 17.5 + col * 6.5, cy = 12 + row * 4.6;
      tex += `<circle cx="${cx}" cy="${cy}" r="2" fill="${accent}"/><circle cx="${cx - .6}" cy="${cy - .6}" r=".6" fill="#fff" opacity=".5"/>`;
    }
  } else if (option.style === 'panels') {
    for (let i = 0; i < 3; i++) {
      const x = 15.5 + i * 6;
      tex += `<rect x="${x}" y="10" width="5" height="30" rx="1.3" fill="#c9d1c9" opacity=".72"/><rect x="${x}" y="10" width="1.2" height="30" fill="#fff" opacity=".3"/>`;
    }
  }
  return iconShell(`
    <rect x="14" y="5" width="20" height="40" rx="2.5" fill="${base}"/>
    <rect x="14" y="5" width="20" height="4" rx="2" fill="#202623"/>
    <rect x="14" y="41" width="20" height="4" rx="2" fill="#202623"/>
    ${tex}
    <rect x="14.5" y="9" width="2" height="32" fill="#fff" opacity=".1"/>
    <rect x="30.5" y="9" width="2" height="32" fill="#000" opacity=".2"/>
    <rect x="13.5" y="8.5" width="21" height="1.4" rx=".7" fill="${accent}" opacity=".7"/>
    <rect x="13.5" y="40.2" width="21" height="1.4" rx=".7" fill="${accent}" opacity=".7"/>
  `, accent);
}
function pommelIcon(option, bodyColor, accent) {
  const upper = `<rect x="15" y="4" width="18" height="18" rx="2" fill="${bodyColor}"/><rect x="16.2" y="5" width="3" height="16" fill="#fff" opacity=".14"/><rect x="15" y="18" width="18" height="2" fill="${accent}" opacity=".85"/>`;
  let cap = '';
  if (option.style === 'vented') {
    cap = `<path d="M15 20h18l3 19H12z" fill="${bodyColor}"/><path d="M15 20h4l-1 19h-6z" fill="#fff" opacity=".12"/><rect x="12" y="37" width="24" height="3.5" rx="1.7" fill="${accent}"/><rect x="15" y="24" width="1.6" height="12" fill="#202623" opacity=".8"/><rect x="19" y="24" width="1.6" height="12" fill="#202623" opacity=".8"/><rect x="23" y="24" width="1.6" height="12" fill="#202623" opacity=".8"/><rect x="27" y="24" width="1.6" height="12" fill="#202623" opacity=".8"/><rect x="31" y="24" width="1.6" height="12" fill="#202623" opacity=".8"/>`;
  } else if (option.style === 'weight') {
    cap = `<rect x="13" y="20" width="22" height="19" rx="3" fill="${bodyColor}"/><rect x="15" y="21.5" width="3.5" height="16" fill="#fff" opacity=".14"/><rect x="12" y="35" width="24" height="4.5" rx="2" fill="${accent}"/><rect x="14" y="20" width="20" height="2" fill="${accent}" opacity=".7"/>`;
  } else if (option.style === 'fang') {
    cap = `<rect x="15" y="20" width="18" height="7" rx="2" fill="${bodyColor}"/><path d="M17 26h6l-2 15z" fill="${accent}"/><path d="M25 26h6l-4 15z" fill="${accent}"/><path d="M21 26h6l-3 17z" fill="${accent}"/><path d="M22 27h1.6l-.8 10z" fill="#fff" opacity=".3"/>`;
  } else if (option.style === 'smooth') {
    cap = `<rect x="15" y="20" width="18" height="7" fill="${bodyColor}"/><path d="M15 26h18v3c0 8-4 12-9 12s-9-4-9-12z" fill="${bodyColor}"/><path d="M17 27h3v11c-2-2-3-5-3-8z" fill="#fff" opacity=".14"/><rect x="14.5" y="19" width="19" height="2.2" rx="1.1" fill="${accent}"/>`;
  } else if (option.style === 'spike') {
    cap = `<rect x="15" y="20" width="18" height="7" rx="2" fill="${bodyColor}"/><rect x="16" y="20.5" width="3" height="6" fill="#fff" opacity=".14"/><path d="M18 26h12l-6 21z" fill="${accent}"/><path d="M21 26h3l-1 14z" fill="#fff" opacity=".25"/><rect x="17" y="25" width="14" height="1.6" fill="#202623"/>`;
  } else if (option.style === 'ring') {
    cap = `<rect x="15" y="20" width="18" height="7" rx="2" fill="${bodyColor}"/><rect x="17.5" y="26" width="2" height="13" fill="${accent}"/><rect x="23" y="26" width="2" height="13" fill="${accent}"/><rect x="28.5" y="26" width="2" height="13" fill="${accent}"/><ellipse cx="24" cy="40" rx="9" ry="4.5" fill="none" stroke="${accent}" stroke-width="2.5"/>`;
  } else if (option.style === 'prism') {
    cap = `<rect x="15" y="20" width="18" height="7" rx="2" fill="${bodyColor}"/><path d="M24 25l7 5-2 11H19l-2-11z" fill="${accent}"/><path d="M24 25l-2 16h-3l-2-11z" fill="#fff" opacity=".18"/><path d="M24 25l2 16h3l2-11z" fill="#000" opacity=".18"/><rect x="15" y="19.5" width="18" height="2" fill="${accent}"/>`;
  } else if (option.style === 'cage') {
    cap = `<rect x="15" y="20" width="18" height="6" rx="2" fill="${bodyColor}"/><ellipse cx="24" cy="27" rx="10" ry="2.6" fill="none" stroke="${accent}" stroke-width="1.6"/><ellipse cx="24" cy="41" rx="8" ry="2.6" fill="none" stroke="${accent}" stroke-width="1.6"/><rect x="15.5" y="27" width="1.8" height="14" fill="${accent}"/><rect x="21.5" y="27" width="1.8" height="14" fill="${accent}"/><rect x="26.5" y="27" width="1.8" height="14" fill="${accent}"/><rect x="32.5" y="27" width="1.8" height="14" fill="${accent}"/><circle cx="24" cy="35" r="5" fill="#202623"/><circle cx="23" cy="34" r="1.5" fill="#fff" opacity=".2"/>`;
  }
  return iconShell(upper + cap, bodyColor);
}
function crystalIcon(option) {
  const c = option.color;
  return iconShell(`
    <ellipse cx="24" cy="27" rx="13" ry="18" fill="${c}" opacity=".16"/>
    <ellipse cx="24" cy="43" rx="10" ry="2.5" fill="${c}" opacity=".3"/>
    <path d="M24 5l8 15-4 23H20l-4-23z" fill="${c}"/>
    <path d="M24 5l-4 15-4 23h4l2-23z" fill="#fff" opacity=".22"/>
    <path d="M24 5l4 15 4 23h-4l-2-23z" fill="#000" opacity=".2"/>
    <path d="M24 5v38M17 20h14" stroke="#fff" stroke-opacity=".45" stroke-width=".8"/>
    <circle cx="33" cy="14" r="1.2" fill="#fff" opacity=".8"/>
    <circle cx="14" cy="29" r=".9" fill="#fff" opacity=".5"/>
  `, c);
}
function accentIcon(option, bodyColor) {
  const c = option.color;
  return iconShell(`
    ${metalRect(15, 5, 18, 40, bodyColor)}
    <rect x="13.5" y="13" width="21" height="4.5" rx="2" fill="${c}" stroke="#141917" stroke-width=".6"/>
    <rect x="13.5" y="32" width="21" height="4.5" rx="2" fill="${c}" stroke="#141917" stroke-width=".6"/>
    <rect x="15" y="8" width="18" height="1.8" rx=".9" fill="${c}" opacity=".9"/>
    <rect x="15" y="23" width="18" height="1.6" rx=".8" fill="${c}" opacity=".7"/>
    <rect x="15" y="40" width="18" height="1.8" rx=".9" fill="${c}" opacity=".9"/>
    <rect x="27.5" y="18" width="1.8" height="14" fill="${c}" opacity=".8"/>
    <circle cx="19" cy="19" r="1.7" fill="${c}"/><circle cx="19" cy="19" r=".6" fill="#202623"/>
    <circle cx="31" cy="28" r="1.7" fill="${c}"/><circle cx="31" cy="28" r=".6" fill="#202623"/>
    <circle cx="19" cy="38" r="1.7" fill="${c}"/><circle cx="19" cy="38" r=".6" fill="#202623"/>
  `, c);
}
function bladeIcon(option, crystalColor) {
  const c = crystalColor;
  let beam = '';
  if (option.style === 'crossguard') {
    beam = `<path d="M20.5 38h7L26.5 7h-5z" fill="${c}" opacity=".3"/><rect x="22.8" y="7" width="2.4" height="31" fill="#fff" opacity=".85"/><rect x="5" y="32" width="14" height="4" rx="2" fill="${c}" opacity=".5"/><rect x="6" y="33.2" width="12" height="1.5" fill="#fff" opacity=".85"/><rect x="29" y="32" width="14" height="4" rx="2" fill="${c}" opacity=".5"/><rect x="30" y="33.2" width="12" height="1.5" fill="#fff" opacity=".85"/>`;
  } else if (option.style === 'prismatic') {
    beam = `<path d="M20 38l1-7-2-4 2.5-5-2-5 2.5-6h4l2.5 6-2 5 2.5 5-2 4 1 7z" fill="${c}" opacity=".32"/><rect x="22.8" y="7" width="2.4" height="31" fill="#fff" opacity=".85"/><circle cx="17.5" cy="15" r="1" fill="#fff" opacity=".8"/><circle cx="31" cy="22" r=".8" fill="#fff" opacity=".65"/><circle cx="18" cy="30" r=".7" fill="#fff" opacity=".5"/>`;
  } else if (option.style === 'pulse') {
    beam = `<path d="M20.5 38h7L26.5 7h-5z" fill="${c}" opacity=".3"/><rect x="22.8" y="7" width="2.4" height="31" fill="#fff" opacity=".85"/>`;
    for (const y of [12, 18, 24, 30, 35]) beam += `<rect x="19" y="${y}" width="10" height="1.3" rx=".65" fill="#fff" opacity=".9"/>`;
  } else if (option.style === 'long') {
    beam = `<path d="M20.5 38h7L27 0h-6z" fill="${c}" opacity=".3"/><rect x="22.8" y="0" width="2.4" height="38" fill="#fff" opacity=".85"/>`;
  } else {
    const w = option.style === 'broad' ? 11 : option.style === 'fine' ? 4.4 : 7;
    const x = 24 - w / 2, core = option.style === 'broad' ? 3.6 : option.style === 'fine' ? 1.5 : 2.4;
    beam = `<path d="M${x} 38h${w}l-1.5-31h-${w - 3}z" fill="${c}" opacity=".3"/><rect x="${24 - core / 2}" y="7" width="${core}" height="31" fill="#fff" opacity=".85"/>`;
  }
  const emitter = `<rect x="16" y="37" width="16" height="13" rx="2" fill="#303733"/><rect x="17.2" y="38" width="3" height="11" fill="#fff" opacity=".14"/><rect x="14.5" y="36" width="19" height="3" rx="1.5" fill="#c9d2cd"/><rect x="21" y="38" width="6" height="2" fill="${c}"/>`;
  return iconShell(`<ellipse cx="24" cy="24" rx="10" ry="20" fill="${c}" opacity=".13"/>${beam}${emitter}`, c);
}
function switchIcon(option, crystalColor, accent) {
  const c = crystalColor;
  const base = `${metalRect(12, 4, 24, 42, '#303733')}<rect x="11" y="7" width="26" height="2" rx="1" fill="${accent}" opacity=".75"/><rect x="11" y="41" width="26" height="2" rx="1" fill="${accent}" opacity=".75"/><rect x="12" y="23" width="24" height="14" rx="2.5" fill="#252b28"/>`;
  let hardware = '';
  if (option.style === 'stud') {
    hardware = `<ellipse cx="24" cy="28" rx="8" ry="3.2" fill="#171c19"/><circle cx="24" cy="25" r="4.2" fill="${c}"/><circle cx="22.7" cy="23.7" r="1.3" fill="#fff" opacity=".55"/><circle cx="24" cy="25" r="6.5" fill="none" stroke="${accent}" stroke-width="1.2" opacity=".8"/>`;
  } else if (option.style === 'twin') {
    for (const x of [18, 30]) hardware += `<ellipse cx="${x}" cy="28" rx="5" ry="2.4" fill="#171c19"/><circle cx="${x}" cy="25" r="2.8" fill="${c}"/><circle cx="${x - .8}" cy="24.2" r=".8" fill="#fff" opacity=".5"/><circle cx="${x}" cy="25" r="4.2" fill="none" stroke="${accent}" stroke-width="1" opacity=".8"/>`;
  } else if (option.style === 'lever') {
    hardware = `<rect x="17" y="23" width="14" height="9" rx="2" fill="#1a201d"/><rect x="23" y="15" width="3" height="13" rx="1.5" fill="${accent}" transform="rotate(18 24 22)"/><circle cx="24" cy="23" r="2.5" fill="${c}"/><rect x="15.5" y="15" width="1.8" height="15" fill="${accent}"/><rect x="30.7" y="15" width="1.8" height="15" fill="${accent}"/>`;
  } else if (option.style === 'touch') {
    hardware = `<circle cx="24" cy="25" r="8" fill="none" stroke="${accent}" stroke-width="1.6"/><circle cx="24" cy="25" r="5" fill="${c}" opacity=".25"/><circle cx="24" cy="25" r="3.4" fill="${c}"/><circle cx="22.8" cy="23.8" r="1" fill="#fff" opacity=".6"/>`;
  } else if (option.style === 'dial') {
    hardware = `<circle cx="24" cy="25" r="8.5" fill="#1a201d" stroke="${accent}" stroke-width="1.4"/><path d="M24 16.5v2M24 31.5v2M15.5 25h2M30.5 25h2M18 19l1.4 1.4M28.6 29.6L30 31M30 19l-1.4 1.4M19.4 29.6L18 31" stroke="${accent}" stroke-width="1.2"/><circle cx="24" cy="25" r="3" fill="${c}"/><rect x="23.4" y="17" width="1.2" height="5" fill="${accent}"/>`;
  } else if (option.style === 'slider') {
    hardware = `<rect x="20.5" y="12" width="7" height="26" rx="3.5" fill="#171c19" stroke="${accent}" stroke-width="1.2"/><rect x="18.5" y="22" width="11" height="6" rx="2" fill="${accent}"/><circle cx="24" cy="25" r="1.5" fill="${c}"/>`;
  } else if (option.style === 'guard') {
    hardware = `<circle cx="24" cy="25" r="4.2" fill="${c}"/><circle cx="22.8" cy="23.8" r="1.2" fill="#fff" opacity=".5"/><path d="M14 29a10 10 0 0 1 20 0" fill="none" stroke="${accent}" stroke-width="2.2"/><rect x="13.4" y="28" width="2" height="6" fill="${accent}"/><rect x="32.6" y="28" width="2" height="6" fill="${accent}"/>`;
  } else if (option.style === 'pulse') {
    hardware = `<circle cx="24" cy="25" r="8.5" fill="none" stroke="${accent}" stroke-width="1.2" opacity=".8"/><circle cx="24" cy="25" r="6" fill="none" stroke="${c}" stroke-width="1.2" opacity=".6"/><circle cx="24" cy="25" r="4" fill="${c}"/><circle cx="22.8" cy="23.8" r="1.1" fill="#fff" opacity=".55"/>`;
  }
  return iconShell(base + hardware, c);
}
function engravingIcon(option, bodyColor, accent) {
  let art = '';
  if (option.style === 'stars') {
    art = `<path d="M15 32l5-8 4 4 5-11 5 6" stroke="${accent}" stroke-width="1.1" fill="none"/><circle cx="15" cy="32" r="1.3" fill="${accent}"/><circle cx="20" cy="24" r="1.5" fill="${accent}"/><circle cx="24" cy="28" r="1.2" fill="${accent}"/><circle cx="29" cy="17" r="1.7" fill="${accent}"/><circle cx="34" cy="23" r="1.3" fill="${accent}"/>`;
  } else if (option.style === 'script') {
    art = `<path d="M16 15c3 3-2 5 1 8s-1 5 1 8M21 14c3 4-2 5 1 9s-1 5 1 8M26 16c3 3-2 5 1 8s-1 5 1 7M31 15c2 3-1 5 1 8" stroke="#d5ad62" stroke-width="1.6" fill="none" stroke-linecap="round"/><circle cx="18.5" cy="35" r="1" fill="#d5ad62"/><circle cx="28.5" cy="35" r="1" fill="#d5ad62"/>`;
  } else if (option.style === 'mark') {
    art = `<circle cx="24" cy="25" r="8" fill="none" stroke="${accent}" stroke-width="1.3"/><circle cx="24" cy="25" r="4.5" fill="none" stroke="${accent}" stroke-width=".9"/><path d="M24 16v18M15 25h18" stroke="${accent}" stroke-width=".9"/><path d="M24 21l3 4-3 4-3-4z" fill="${accent}"/>`;
  } else if (option.style === 'runes') {
    art = `<path d="M15 17v14M15 17l4 4-4 3M21 31V17l4 5M27 17v14l4-4M33 31V17l-3 4 3 4" stroke="${accent}" stroke-width="1.3" fill="none" stroke-linecap="round"/>`;
  } else if (option.style === 'orbit') {
    art = `<ellipse cx="24" cy="25" rx="9" ry="5" fill="none" stroke="${accent}" stroke-width="1.2"/><ellipse cx="24" cy="25" rx="5" ry="9" fill="none" stroke="${accent}" stroke-width=".9" opacity=".7"/><path d="M15 34L33 16" stroke="${accent}" stroke-width=".9" opacity=".7"/><circle cx="31" cy="18" r="1.4" fill="${accent}"/>`;
  } else if (option.style === 'flame') {
    art = `<path d="M15 38c-2-5 2-7 2-11 3 3 3 6 2 8 2-2 2-4 1-6 4 3 5 6 3 9zM23 38c-2-5 2-7 2-11 3 3 3 6 2 8 2-2 2-4 1-6 4 3 5 6 3 9zM31 38c-2-5 2-7 2-11 3 3 3 6 2 8 2-2 2-4 1-6 4 3 5 6 3 9z" fill="${accent}" opacity=".9"/><rect x="14" y="38" width="20" height="1.5" rx=".75" fill="${accent}" opacity=".5"/>`;
  } else if (option.style === 'serial') {
    art = `<path d="M14 18h20M14 35h20" stroke="${accent}" stroke-width="1"/><path d="M16 21v11M19 21v11M21.5 22v9M24 21v11M26 23v7M28 21v11M31 22v9M33 21v11" stroke="${accent}" stroke-width="1.4"/>`;
  } else {
    art = `<path d="M15 16h18M15 34h18" stroke="#fff" stroke-opacity=".08"/><rect x="15" y="24" width="18" height="1" fill="#fff" opacity=".12"/><path d="M31 14l1.5 2.5" stroke="#fff" stroke-opacity=".2"/>`;
  }
  return iconShell(`
    ${metalRect(12, 4, 24, 42, bodyColor)}
    <rect x="11" y="6" width="26" height="2" fill="${accent}" opacity=".55"/>
    <rect x="11" y="42" width="26" height="2" fill="${accent}" opacity=".55"/>
    ${art}
  `, accent);
}
function optionIcon(stepId, option, colors) {
  const { hiltColor, accentColor, crystalColor } = colors;
  if (stepId === 'hilt') return hiltIcon(option, accentColor);
  if (stepId === 'emitter') return emitterIcon(option, hiltColor, accentColor);
  if (stepId === 'grip') return gripIcon(option, accentColor);
  if (stepId === 'pommel') return pommelIcon(option, hiltColor, accentColor);
  if (stepId === 'crystal') return crystalIcon(option);
  if (stepId === 'accent') return accentIcon(option, hiltColor);
  if (stepId === 'blade') return bladeIcon(option, crystalColor);
  if (stepId === 'switch') return switchIcon(option, crystalColor, accentColor);
  return engravingIcon(option, hiltColor, accentColor);
}

function selectedOption(id) { return options[id][selected[id]]; }
function withActivityArtifact(artifact, callback) {
  if (!artifact) return callback();
  const original = { selected: { ...selected }, bladeIgnited, bladeUserChoice };
  try {
    Object.keys(selected).forEach(key => { selected[key] = Math.max(0, Math.min(Number(artifact.parts?.[key]) || 0, options[key].length - 1)); });
    bladeIgnited = Boolean(artifact.blade); bladeUserChoice = bladeIgnited;
    rebuildSaber();
    return callback();
  } finally {
    Object.assign(selected, original.selected);
    bladeIgnited = original.bladeIgnited; bladeUserChoice = original.bladeUserChoice;
    rebuildSaber();
  }
}
function activityCrystalColor() {
  const artifact = selectedActivityArtifact();
  if (!artifact) return selectedOption('crystal').color;
  const index = Math.max(0, Math.min(Number(artifact.parts?.crystal) || 0, options.crystal.length - 1));
  return options.crystal[index].color;
}
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
  document.querySelector('.step-item.active')?.scrollIntoView({ block: 'nearest' });
  $('progressFill').style.width = `${((activeStep + 1) / steps.length) * 100}%`;
  const stepCount = String(steps.length).padStart(2, '0');
  document.querySelector('.build-number').innerHTML = `${String(activeStep + 1).padStart(2, '0')}<br><span>/ ${stepCount}</span>`;
  $('stepSummary').innerHTML = `${String(activeStep + 1).padStart(2, '0')} / ${stepCount} &nbsp; ${steps[activeStep].title.toUpperCase()}`;
  $('prevStep').disabled = activeStep === 0;
  const isLast = activeStep === steps.length - 1;
  $('nextStep').innerHTML = isLast ? 'SELL SABER <span>↗</span>' : 'NEXT PART <span>→</span>';
  $('finishButton').innerHTML = isLast ? 'FINISH SABER <span>✧</span>' : 'NEXT PART <span>→</span>';
}
function renderOptions() {
  const step = steps[activeStep];
  const list = options[step.id];
  $('categoryEyebrow').textContent = step.eyebrow;
  $('categoryTitle').textContent = step.heading;
  $('categoryDescription').textContent = step.description;
  $('componentCount').innerHTML = `${String(selected[step.id] + 1).padStart(2, '0')} <i>/ ${String(list.length).padStart(2, '0')}</i>`;
  const hiltColor = finishHex[selectedOption('hilt').finish] || '#a6ada3';
  const accentColor = selectedOption('accent').color;
  const crystalColor = selectedOption('crystal').color;
  $('optionList').innerHTML = list.map((option, index) => {
    const title = step.id === 'crystal' ? `Kyber · ${option.name}` : option.name;
    const icon = optionIcon(step.id, option, { hiltColor, accentColor, crystalColor });
    return `<button class="option-card ${selected[step.id] === index ? 'selected' : ''}" data-option="${index}" aria-pressed="${selected[step.id] === index}"><span class="option-icon">${icon}</span><span class="option-copy"><strong>${title}</strong><small>${option.detail}</small></span><span class="option-price">${money(option.price)}</span></button>`;
  }).join('');
  document.querySelectorAll('.option-card').forEach(button => button.addEventListener('click', () => {
    const scrollTop = $('optionList').scrollTop;
    selected[step.id] = Number(button.dataset.option);
    if (step.id === 'crystal' || step.id === 'blade') bladeIgnited = true;
    syncBladeToggle();
    renderOptions(); $('optionList').scrollTop = scrollTop; updateUI(); rebuildSaber(); playTone(480 + activeStep * 70, .07);
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
  else openKeepPrompt();
}
$('prevStep').addEventListener('click', () => setStep(activeStep - 1));
$('nextStep').addEventListener('click', nextStep);
$('finishButton').addEventListener('click', nextStep);

const COLLECTION_KEY = 'sabersmith.collection.v1';
let collection = [];
let collectionSelection = 0;
try {
  const storedCollection = JSON.parse(localStorage.getItem(COLLECTION_KEY) || '[]');
  if (Array.isArray(storedCollection)) collection = storedCollection.filter(item => item && item.parts && typeof item.name === 'string');
} catch (_) { /* A blocked or malformed local store should not stop the workbench. */ }
function saveCollection() {
  try { localStorage.setItem(COLLECTION_KEY, JSON.stringify(collection)); }
  catch (_) { showToast('Collection could not be saved in this browser.'); }
  updateCollectionCount();
  updateActivitySaberSelectors();
}
let activitySaberSelection = 0;
function selectedActivityArtifact() { return collection[activitySaberSelection] || null; }
function updateActivitySaberSelectors() {
  activitySaberSelection = collection.length ? Math.max(0, Math.min(activitySaberSelection, collection.length - 1)) : 0;
  ['disassemblySaberSelect', 'slicerSaberSelect'].forEach(id => {
    const select = $(id);
    if (!select) return;
    select.replaceChildren();
    if (!collection.length) {
      const option = document.createElement('option');
      option.value = '0'; option.textContent = 'Workbench saber · no saved sabers';
      select.append(option); select.disabled = true;
      return;
    }
    collection.forEach((artifact, index) => {
      const option = document.createElement('option');
      option.value = String(index); option.textContent = artifact.name;
      select.append(option);
    });
    select.disabled = false;
    select.value = String(activitySaberSelection);
  });
}
function changeActivitySaber(event) {
  const index = Number(event.currentTarget.value);
  activitySaberSelection = collection.length ? Math.max(0, Math.min(Number.isFinite(index) ? index : 0, collection.length - 1)) : 0;
  updateActivitySaberSelectors();
  if (disassemblyOpen) {
    disassemblyProgress = 0; disassemblyTarget = 0; disassemblyPhase = 'assembled';
    disassemblyActivePart = null; disassemblyCameraProgress = -1;
    buildDisassemblySaber(); updateDisassemblyUI(); resizeDisassemblyScene();
  }
  if (slicer.open) slicer.bladeRgb = hexToRgb(activityCrystalColor());
}
$('disassemblySaberSelect').addEventListener('change', changeActivitySaber);
$('slicerSaberSelect').addEventListener('change', changeActivitySaber);
updateActivitySaberSelectors();
function showToast(message) {
  $('toast').textContent = message;
  $('toast').classList.add('show');
  setTimeout(() => $('toast').classList.remove('show'), 2200);
}
function updateCollectionCount() {
  $('collectionCount').textContent = String(collection.length).padStart(2, '0');
}
const nameFirst = ['Silent', 'Wandering', 'Starlit', 'Ancient', 'Distant', 'Radiant', 'Hidden', 'Last', 'Fallen', 'Celestial'];
const nameLast = ['Resolve', 'Dawn', 'Sentinel', 'Promise', 'Tempest', 'Pilgrim', 'Eclipse', 'Guardian', 'Echo', 'Horizon'];
function generateSaberName() {
  return `${nameFirst[Math.floor(Math.random() * nameFirst.length)]} ${nameLast[Math.floor(Math.random() * nameLast.length)]}`;
}
function openKeepPrompt() {
  $('saberNameInput').value = buildName();
  $('keepOverlay').classList.add('open');
  $('keepOverlay').setAttribute('aria-hidden', 'false');
  document.body.classList.add('dialog-active');
  $('saberNameInput').focus();
  $('saberNameInput').select();
}
function closeKeepPrompt() {
  $('keepOverlay').classList.remove('open');
  $('keepOverlay').setAttribute('aria-hidden', 'true');
  document.body.classList.remove('dialog-active');
}
function keepCurrentSaber() {
  const name = $('saberNameInput').value.trim().slice(0, 32) || generateSaberName();
  const artifact = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, name, parts: { ...selected }, blade: bladeIgnited, value: totalValue(), createdAt: new Date().toISOString() };
  collection.push(artifact);
  saveCollection();
  closeKeepPrompt();
  collectionSelection = collection.length - 1;
  openCollection();
}
$('randomName').addEventListener('click', () => { $('saberNameInput').value = generateSaberName(); $('saberNameInput').focus(); });
$('keepSaber').addEventListener('click', keepCurrentSaber);
$('skipKeep').addEventListener('click', () => { closeKeepPrompt(); openSale(); });
$('keepClose').addEventListener('click', closeKeepPrompt);
$('keepOverlay').addEventListener('click', event => { if (event.target === $('keepOverlay')) closeKeepPrompt(); });
$('saberNameInput').addEventListener('keydown', event => { if (event.key === 'Enter') keepCurrentSaber(); });
$('collectionButton').addEventListener('click', () => openCollection());
$('activitiesButton').addEventListener('click', () => openActivities());
$('collectionClose').addEventListener('click', closeCollection);
$('backToWorkbench').addEventListener('click', closeCollection);
$('emptyBack').addEventListener('click', closeCollection);
$('collectionPrev').addEventListener('click', () => changeCollectionSelection(-1));
$('collectionNext').addEventListener('click', () => changeCollectionSelection(1));
$('auctionCollected').addEventListener('click', () => {
  const artifact = collection[collectionSelection];
  if (!artifact) return;
  loadArtifact(artifact);
  closeCollection();
  openSale(artifact.name);
});

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
  $('resultCopy').textContent = `${$('auctionBidder').textContent} takes home your ${$('auctionBuildName').textContent} saber. The room made ${auctionCount} bids before the hammer fell.`;
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
function openSale(lotName = buildName()) {
  const total = totalValue();
  auctionBid = Math.ceil((total * .72) / 10) * 10;
  auctionCount = 0; lastBidder = -1;
  stopAuction();
  document.querySelectorAll('.bidder').forEach(bidder => {
    bidder.classList.remove('bidding'); bidder.querySelector('.bid-tag').textContent = '—';
  });
  $('auctionRoom').classList.remove('finished');
  $('auctionResult').classList.remove('visible'); $('auctionResult').setAttribute('aria-hidden', 'true');
  $('auctionBuildName').textContent = lotName.toUpperCase();
  $('stageBuildName').textContent = lotName.toUpperCase();
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
  if (event.key === 'Escape') { closeSale(); closeCollection(); closeKeepPrompt(); closeSlicer(); closeDisassembly(); closeDuel(); closeActivities(); }
  const overlayOpen = $('saleOverlay').classList.contains('open') || $('collectionOverlay').classList.contains('open') || $('keepOverlay').classList.contains('open') || $('activitiesOverlay').classList.contains('open') || $('disassemblyOverlay').classList.contains('open') || $('slicerOverlay').classList.contains('open') || $('duelOverlay').classList.contains('open');
  if (overlayOpen) return;
  if (event.key === 'ArrowRight') nextStep();
  if (event.key === 'ArrowLeft') setStep(activeStep - 1);
});

// A compact, fully interactive Three.js workbench: every option is assembled from real 3D geometry.
const mount = $('sceneWrap');
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x1a211d, 12, 26);
const camera = new THREE.PerspectiveCamera(36, 1, .1, 80);
camera.position.set(5.6, 3.35, 9.6); camera.lookAt(0, 1.95, 0);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.12;
mount.insertBefore(renderer.domElement, mount.querySelector('.scene-vignette'));
scene.add(new THREE.HemisphereLight(0xc9d9cf, 0x202820, 2.1));
const keyLight = new THREE.DirectionalLight(0xffe6c6, 3.5); keyLight.position.set(4, 7, 5); keyLight.castShadow = true; keyLight.shadow.mapSize.set(1024, 1024); scene.add(keyLight);
const rimLight = new THREE.PointLight(0x83a878, 19, 12); rimLight.position.set(-3, 3, -2); scene.add(rimLight);
const floor = new THREE.Mesh(new THREE.CircleGeometry(8.6, 64), new THREE.MeshStandardMaterial({ color: 0x222a25, roughness: .88, metalness: .12 }));
floor.rotation.x = -Math.PI / 2; floor.position.y = -2.28; floor.receiveShadow = true; scene.add(floor);
const grid = new THREE.GridHelper(17, 34, 0x5d6959, 0x353f39); grid.position.y = -2.27; grid.material.transparent = true; grid.material.opacity = .18; scene.add(grid);
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
const collectionCanvas = $('collectionSaber');
const collectionScene = new THREE.Scene();
const collectionCamera = new THREE.OrthographicCamera(-3.2, 3.2, 3.2, -3.2, .1, 40);
collectionCamera.position.set(4.5, 3.2, 8); collectionCamera.lookAt(0, 1.8, 0);
const collectionRenderer = new THREE.WebGLRenderer({ canvas: collectionCanvas, antialias: true, alpha: true });
collectionRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
collectionRenderer.outputColorSpace = THREE.SRGBColorSpace;
collectionRenderer.toneMapping = THREE.ACESFilmicToneMapping; collectionRenderer.toneMappingExposure = 1.12;
collectionScene.add(new THREE.HemisphereLight(0xe4f0e2, 0x18211b, 2.2));
const collectionKey = new THREE.DirectionalLight(0xffe6c6, 3.2); collectionKey.position.set(4, 7, 5); collectionScene.add(collectionKey);
const collectionRim = new THREE.PointLight(0x9bd5ff, 18, 12); collectionRim.position.set(-2, 3, -2); collectionScene.add(collectionRim);
const collectionSaberRoot = new THREE.Group(); collectionScene.add(collectionSaberRoot);
let pointerDown = false, pointerX = 0, pointerY = 0, rotationX = 0, rotationY = -.24, autoRotate = true;
const clock = new THREE.Clock();

function metal(color, roughness = .33, metalness = .82) { return new THREE.MeshStandardMaterial({ color, roughness, metalness }); }
let saberPartTag = null;
function addMesh(parent, geometry, material, position, rotation) {
  const mesh = new THREE.Mesh(geometry, material); mesh.position.set(...position);
  if (rotation) mesh.rotation.set(...rotation); mesh.castShadow = true; mesh.receiveShadow = true;
  if (saberPartTag) mesh.userData.part = saberPartTag;
  parent.add(mesh); return mesh;
}
function cylinder(parent, radiusTop, radiusBottom, height, material, y, radial = 48) {
  return addMesh(parent, new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radial, 1), material, [0, y, 0]);
}
function torus(parent, radius, tube, material, y) {
  const mesh = addMesh(parent, new THREE.TorusGeometry(radius, tube, 10, 48), material, [0, y, 0], [Math.PI / 2, 0, 0]); return mesh;
}
let workshopDust = null, workshopRingGroup = null, levitationGlow = null, levitationLight = null;
function makePegboardTexture() {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 128;
  const context = canvas.getContext('2d');
  context.fillStyle = '#2b332e'; context.fillRect(0, 0, 128, 128);
  context.fillStyle = '#1a211d';
  for (let y = 10; y < 128; y += 18) for (let x = 10; x < 128; x += 18) {
    context.beginPath(); context.arc(x, y, 2.4, 0, Math.PI * 2); context.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(3, 1.6); texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
function makeGlowTexture(color) {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 128;
  const context = canvas.getContext('2d');
  const gradient = context.createRadialGradient(64, 64, 4, 64, 64, 62);
  gradient.addColorStop(0, color); gradient.addColorStop(.36, color); gradient.addColorStop(1, 'rgba(0,0,0,0)');
  context.fillStyle = gradient; context.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
function buildWorkshop() {
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x202723, roughness: .93, metalness: .06 });
  const panelMat = new THREE.MeshStandardMaterial({ color: 0x2a322d, roughness: .82, metalness: .16 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x3a433d, roughness: .48, metalness: .58 });
  const tableMat = new THREE.MeshStandardMaterial({ color: 0x3b443e, roughness: .34, metalness: .72 });
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x5b4030, roughness: .72, metalness: .08 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x232a26, roughness: .45, metalness: .76 });
  const steelMat = new THREE.MeshStandardMaterial({ color: 0x9aa69e, roughness: .3, metalness: .9 });
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xb08a4a, roughness: .34, metalness: .86 });
  const orangeMat = new THREE.MeshStandardMaterial({ color: 0x754331, roughness: .55, metalness: .3 });
  const glowMat = new THREE.MeshBasicMaterial({ color: 0xd8f36a });
  const workshop = new THREE.Group(); scene.add(workshop);

  // Room shell and back wall panelling.
  const wall = addMesh(workshop, new THREE.BoxGeometry(16, 9.2, .25), wallMat, [0, 1.7, -4.75]);
  wall.castShadow = false;
  for (const x of [-5.4, -2.7, 0, 2.7, 5.4]) addMesh(workshop, new THREE.BoxGeometry(.1, 9, .12), trimMat, [x, 1.7, -4.6]);
  for (const y of [-2.05, 3.45]) addMesh(workshop, new THREE.BoxGeometry(16, .1, .12), trimMat, [0, y, -4.6]);

  // Pegboard with a row of hanging tools.
  const pegboard = addMesh(workshop, new THREE.BoxGeometry(6.2, 3.0, .08), new THREE.MeshStandardMaterial({ map: makePegboardTexture(), roughness: .85, metalness: .16 }), [0, 2.0, -4.56]);
  pegboard.castShadow = false;
  for (const [x, y, w, h] of [[0, 3.52, 6.36, .08], [0, .48, 6.36, .08], [-3.14, 2.0, .08, 3.08], [3.14, 2.0, .08, 3.08]]) addMesh(workshop, new THREE.BoxGeometry(w, h, .1), trimMat, [x, y, -4.54]);
  const neon = addMesh(workshop, new THREE.BoxGeometry(5.9, .035, .035), glowMat, [0, 3.6, -4.47]);
  neon.castShadow = false;

  const wrench = new THREE.Group(); wrench.position.set(-2.2, 2.28, -4.44); wrench.rotation.z = -.12; workshop.add(wrench);
  addMesh(wrench, new THREE.BoxGeometry(.1, .82, .05), steelMat, [0, 0, 0]);
  addMesh(wrench, new THREE.TorusGeometry(.15, .045, 8, 20, Math.PI * 1.45), steelMat, [0, .52, 0]);
  addMesh(wrench, new THREE.BoxGeometry(.1, .16, .05), steelMat, [.11, .65, 0], [0, 0, -.4]);
  const screwdriver = new THREE.Group(); screwdriver.position.set(-1.35, 2.25, -4.44); screwdriver.rotation.z = .12; workshop.add(screwdriver);
  addMesh(screwdriver, new THREE.CylinderGeometry(.075, .075, .34, 12), brassMat, [0, .23, 0]);
  addMesh(screwdriver, new THREE.CylinderGeometry(.022, .022, .6, 8), steelMat, [0, -.22, 0]);
  addMesh(screwdriver, new THREE.ConeGeometry(.04, .1, 8), steelMat, [0, -.56, 0], [Math.PI, 0, 0]);
  const pliers = new THREE.Group(); pliers.position.set(-.5, 2.3, -4.44); workshop.add(pliers);
  for (const side of [-1, 1]) {
    addMesh(pliers, new THREE.BoxGeometry(.065, .5, .04), steelMat, [side * .055, -.2, 0], [0, 0, side * .14]);
    addMesh(pliers, new THREE.BoxGeometry(.055, .34, .04), steelMat, [side * .12, .28, 0], [0, 0, side * -.28]);
  }
  addMesh(pliers, new THREE.CylinderGeometry(.055, .055, .08, 10), darkMat, [0, .02, 0]);
  const mallet = new THREE.Group(); mallet.position.set(.55, 2.3, -4.44); mallet.rotation.z = .18; workshop.add(mallet);
  addMesh(mallet, new THREE.BoxGeometry(.07, .8, .05), woodMat, [0, -.1, 0]);
  addMesh(mallet, new THREE.CylinderGeometry(.13, .13, .3, 12), steelMat, [0, .36, 0], [0, 0, Math.PI / 2]);
  const spareHilt = new THREE.Group(); spareHilt.position.set(1.6, 2.15, -4.44); workshop.add(spareHilt);
  addMesh(spareHilt, new THREE.CylinderGeometry(.1, .1, .95, 20), steelMat, [0, 0, 0], [0, 0, Math.PI / 2]);
  for (const x of [-.3, 0, .3]) addMesh(spareHilt, new THREE.CylinderGeometry(.115, .115, .06, 20), darkMat, [x, 0, 0], [0, 0, Math.PI / 2]);
  addMesh(spareHilt, new THREE.CylinderGeometry(.11, .11, .1, 20), brassMat, [.42, 0, 0], [0, 0, Math.PI / 2]);

  // Wall shelves with parts bins.
  for (const side of [-1, 1]) {
    const shelfX = side * 4.15;
    addMesh(workshop, new THREE.BoxGeometry(1.7, .09, .62), woodMat, [shelfX, 1.35, -4.35]);
    for (const x of [shelfX - .65, shelfX + .65]) addMesh(workshop, new THREE.BoxGeometry(.07, .32, .5), trimMat, [x, 1.17, -4.35]);
    addMesh(workshop, new THREE.BoxGeometry(.5, .34, .42), darkMat, [shelfX - .35, 1.58, -4.35]);
    addMesh(workshop, new THREE.BoxGeometry(.5, .34, .42), panelMat, [shelfX + .35, 1.58, -4.35]);
    const strip = addMesh(workshop, new THREE.BoxGeometry(.42, .03, .03), glowMat, [shelfX - .35, 1.58, -4.12]);
    strip.castShadow = false;
  }

  // Heavy workshop bench.
  addMesh(workshop, new THREE.BoxGeometry(7.4, .22, 3.9), tableMat, [0, -1.0, .15]);
  addMesh(workshop, new THREE.BoxGeometry(7.5, .12, .12), woodMat, [0, -.96, 2.1]);
  addMesh(workshop, new THREE.BoxGeometry(.12, .12, 3.9), woodMat, [-3.7, -.96, .15]);
  addMesh(workshop, new THREE.BoxGeometry(.12, .12, 3.9), woodMat, [3.7, -.96, .15]);
  for (const x of [-3.25, 3.25]) for (const z of [-1.5, 1.55]) addMesh(workshop, new THREE.BoxGeometry(.16, 1.25, .16), darkMat, [x, -1.665, z]);
  addMesh(workshop, new THREE.BoxGeometry(6.5, .12, .12), darkMat, [0, -1.72, -1.5]);
  addMesh(workshop, new THREE.BoxGeometry(6.5, .12, .12), darkMat, [0, -1.72, 1.55]);
  addMesh(workshop, new THREE.BoxGeometry(.12, .12, 3.05), darkMat, [-3.25, -1.72, .02]);
  addMesh(workshop, new THREE.BoxGeometry(6.9, .08, 3.2), panelMat, [0, -2.2, .02]);

  // Rolling tool chest and a crate of spare stock.
  addMesh(workshop, new THREE.BoxGeometry(1.5, 1.0, 1.15), orangeMat, [-2.3, -1.62, .85]);
  for (let i = 0; i < 3; i++) {
    addMesh(workshop, new THREE.BoxGeometry(1.34, .24, .04), darkMat, [-2.3, -1.3 - i * .28, 1.44]);
    addMesh(workshop, new THREE.BoxGeometry(.4, .035, .035), steelMat, [-2.3, -1.3 - i * .28, 1.47]);
  }
  addMesh(workshop, new THREE.BoxGeometry(1.35, .8, 1.1), woodMat, [2.35, -1.76, .9]);
  addMesh(workshop, new THREE.BoxGeometry(1.15, .07, .9), panelMat, [2.35, -1.33, .9]);

  // Levitation pad built into the bench top.
  levitationGlow = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 2.9), new THREE.MeshBasicMaterial({ map: makeGlowTexture('#d8f36a'), transparent: true, opacity: .42, blending: THREE.AdditiveBlending, depthWrite: false }));
  levitationGlow.rotation.x = -Math.PI / 2; levitationGlow.position.y = -.842; workshop.add(levitationGlow);
  workshopRingGroup = new THREE.Group(); workshopRingGroup.position.y = -.838; workshop.add(workshopRingGroup);
  for (const [radius, color, opacity, arc, start] of [[.88, 0xd8f36a, .8, Math.PI * .52, 0], [.88, 0xd8f36a, .8, Math.PI * .52, Math.PI], [.64, 0x6fe8ff, .55, Math.PI * .36, Math.PI * .5]]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, .011, 6, 40, arc), new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false }));
    ring.rotation.set(Math.PI / 2, 0, start); ring.castShadow = false; workshopRingGroup.add(ring);
  }
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2 + Math.PI / 4;
    addMesh(workshop, new THREE.CylinderGeometry(.045, .06, .08, 12), darkMat, [Math.cos(a) * .87, -.82, Math.sin(a) * .87]);
    const tip = addMesh(workshop, new THREE.SphereGeometry(.022, 10, 8), glowMat, [Math.cos(a) * .87, -.77, Math.sin(a) * .87]);
    tip.castShadow = false;
  }
  levitationLight = new THREE.PointLight(0xd8f36a, 4.5, 2.8, 2); levitationLight.position.set(0, -.58, 0); workshop.add(levitationLight);
  const contactShadow = new THREE.Mesh(new THREE.CircleGeometry(.55, 32), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .34, depthWrite: false }));
  contactShadow.rotation.x = -Math.PI / 2; contactShadow.position.y = -.826; workshop.add(contactShadow);

  // Loose bench props: tools, spare barrel sections, kyber crystals and a datapad.
  addMesh(workshop, new THREE.CylinderGeometry(.16, .13, .34, 16), darkMat, [-2.85, -.77, 1.0]);
  for (let i = 0; i < 5; i++) {
    const a = i * Math.PI * 2 / 5;
    addMesh(workshop, new THREE.CylinderGeometry(.012, .012, .52, 6), i % 2 ? steelMat : brassMat, [-2.85 + Math.cos(a) * .06, -.54, 1.0 + Math.sin(a) * .06], [0, 0, Math.cos(a) * .18]);
  }
  addMesh(workshop, new THREE.BoxGeometry(1.2, .07, .5), darkMat, [-1.8, -.85, 1.35]);
  for (let i = 0; i < 3; i++) addMesh(workshop, new THREE.CylinderGeometry(.06, .07, .55, 12), i === 1 ? brassMat : steelMat, [-2.1 + i * .3, -.79, 1.35], [0, 0, Math.PI / 2]);
  addMesh(workshop, new THREE.BoxGeometry(.95, .1, .45), darkMat, [2.55, -.83, .8]);
  const crystalColors = [0x4a8dff, 0x48e184, 0xffe45c, 0x985cff, 0xff3b4f];
  crystalColors.forEach((hex, i) => {
    const material = new THREE.MeshStandardMaterial({ color: hex, emissive: hex, emissiveIntensity: 1.1, roughness: .12, metalness: .1, transparent: true, opacity: .95 });
    const crystal = addMesh(workshop, new THREE.OctahedronGeometry(.072, 0), material, [2.28 + i * .135, -.73, .8]);
    crystal.scale.set(.78, 1.5, .78); crystal.castShadow = false;
  });
  const crystalLight = new THREE.PointLight(0x8fd8ff, 2.2, 1.5, 2); crystalLight.position.set(2.55, -.55, .8); workshop.add(crystalLight);
  addMesh(workshop, new THREE.BoxGeometry(.9, .04, .55), darkMat, [1.55, -.86, 1.52], [0, -.25, 0]);
  const screen = addMesh(workshop, new THREE.BoxGeometry(.72, .012, .38), new THREE.MeshBasicMaterial({ color: 0x4deaff, transparent: true, opacity: .5 }), [1.55, -.834, 1.52], [0, -.25, 0]);
  screen.castShadow = false;
  for (let i = 0; i < 3; i++) {
    const line = addMesh(workshop, new THREE.BoxGeometry(.38, .006, .018), new THREE.MeshBasicMaterial({ color: 0xd8f36a, transparent: true, opacity: .8 }), [1.47, -.826, 1.43 + i * .07], [0, -.25, 0]);
    line.castShadow = false;
  }

  // Articulated bench lamp angled at the levitation pad.
  addMesh(workshop, new THREE.CylinderGeometry(.18, .22, .07, 20), darkMat, [2.75, -.855, -.65]);
  addMesh(workshop, new THREE.CylinderGeometry(.025, .025, .95, 8), steelMat, [2.75, -.38, -.65], [0, 0, .12]);
  addMesh(workshop, new THREE.CylinderGeometry(.022, .022, .8, 8), steelMat, [2.45, .2, -.55], [0, 0, -.75]);
  const shade = addMesh(workshop, new THREE.ConeGeometry(.23, .26, 18, 1, true), darkMat, [2.05, .58, -.45], [0, 0, Math.PI / 2.5]);
  shade.castShadow = false;
  const bulb = addMesh(workshop, new THREE.SphereGeometry(.08, 14, 10), new THREE.MeshBasicMaterial({ color: 0xffe0ad }), [1.97, .55, -.45]);
  bulb.castShadow = false;
  const lampLight = new THREE.PointLight(0xffd7a0, 8, 5.5, 2); lampLight.position.set(1.9, .55, -.35); workshop.add(lampLight);

  // Pendant work light hanging over the left end of the bench.
  addMesh(workshop, new THREE.CylinderGeometry(.012, .012, 1.4, 6), darkMat, [-2.35, 4.85, -1.0]);
  const pendantShade = addMesh(workshop, new THREE.ConeGeometry(.34, .24, 20, 1, true), darkMat, [-2.35, 4.08, -1.0]);
  pendantShade.castShadow = false;
  const pendantBulb = addMesh(workshop, new THREE.SphereGeometry(.09, 14, 10), new THREE.MeshBasicMaterial({ color: 0xffe0ad }), [-2.35, 4.0, -1.0]);
  pendantBulb.castShadow = false;
  const pendantLight = new THREE.PointLight(0xffd7a0, 6, 5, 2); pendantLight.position.set(-2.35, 3.9, -1.0); workshop.add(pendantLight);

  // Dust motes drifting through the work light.
  const positions = new Float32Array(110 * 3);
  for (let i = 0; i < 110; i++) {
    positions[i * 3] = (Math.random() - .5) * 9;
    positions[i * 3 + 1] = -.5 + Math.random() * 4.8;
    positions[i * 3 + 2] = -3.8 + Math.random() * 7;
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  workshopDust = new THREE.Points(dustGeometry, new THREE.PointsMaterial({ color: 0xd8f36a, size: .018, transparent: true, opacity: .32, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true }));
  workshop.add(workshopDust);
}
buildWorkshop();
function syncAuctionSaber() {
  auctionSaberRoot.clear();
  const auctionModel = model.clone(true);
  auctionModel.scale.setScalar(.8);
  auctionSaberRoot.add(auctionModel);
  auctionRim.color.set(selectedOption('crystal').hex);
}
function resizeCollectionScene() {
  const width = Math.max(1, collectionCanvas.clientWidth), height = Math.max(1, collectionCanvas.clientHeight);
  collectionRenderer.setSize(width, height, false);
  const viewHeight = 6.4, halfWidth = viewHeight * width / height / 2;
  collectionCamera.left = -halfWidth; collectionCamera.right = halfWidth;
  collectionCamera.top = viewHeight / 2; collectionCamera.bottom = -viewHeight / 2;
  collectionCamera.updateProjectionMatrix();
}
function openCollection() {
  collectionSelection = collection.length ? Math.max(0, Math.min(collectionSelection, collection.length - 1)) : 0;
  $('collectionOverlay').classList.add('open');
  $('collectionOverlay').setAttribute('aria-hidden', 'false');
  document.body.classList.add('collection-active');
  renderCollection();
  requestAnimationFrame(resizeCollectionScene);
}
function closeCollection() {
  $('collectionOverlay').classList.remove('open');
  $('collectionOverlay').setAttribute('aria-hidden', 'true');
  document.body.classList.remove('collection-active');
}
function changeCollectionSelection(delta) {
  if (collection.length < 2) return;
  collectionSelection = (collectionSelection + delta + collection.length) % collection.length;
  renderCollection();
}
function renderCollection() {
  updateCollectionCount();
  const hasItems = collection.length > 0;
  $('collectionEmpty').hidden = hasItems;
  document.querySelector('.collection-display').hidden = !hasItems;
  document.querySelector('.collection-details').hidden = !hasItems;
  $('collectionPrev').hidden = !hasItems || collection.length < 2;
  $('collectionNext').hidden = !hasItems || collection.length < 2;
  if (!hasItems) { collectionSaberRoot.clear(); return; }
  const artifact = collection[collectionSelection];
  $('collectionIndex').textContent = String(collectionSelection + 1).padStart(2, '0');
  $('collectionOrdinal').textContent = `ARTIFACT ${String(collectionSelection + 1).padStart(2, '0')} / ${String(collection.length).padStart(2, '0')}`;
  $('collectionSaberName').textContent = artifact.name;
  $('collectionSaberMeta').textContent = `HAND-FORGED · ${money(artifact.value || 0)} CREDITS EST. VALUE`;
  const partRows = Object.keys(options).map(key => {
    const index = Number(artifact.parts[key]) || 0;
    const part = options[key][Math.max(0, Math.min(index, options[key].length - 1))];
    const step = steps.find(item => item.id === key);
    return [step ? step.title : key, key === 'crystal' ? `Kyber · ${part.name}` : part.name];
  });
  $('collectionPartsCount').textContent = `${String(partRows.length).padStart(2, '0')} COMPONENTS`;
  const partsNode = $('collectionParts'); partsNode.replaceChildren();
  partRows.forEach(([label, part]) => {
    const row = document.createElement('div'); row.className = 'collection-part-row';
    const kind = document.createElement('span'); kind.textContent = label;
    const name = document.createElement('strong'); name.textContent = part;
    row.append(kind, name); partsNode.append(row);
  });
  const original = { ...selected };
  const originalBlade = bladeIgnited, originalChoice = bladeUserChoice;
  Object.keys(selected).forEach(key => { selected[key] = Math.max(0, Math.min(Number(artifact.parts[key]) || 0, options[key].length - 1)); });
  bladeIgnited = Boolean(artifact.blade); bladeUserChoice = bladeIgnited;
  rebuildSaber();
  collectionSaberRoot.clear();
  const displayModel = model.clone(true); displayModel.scale.setScalar(.9); collectionSaberRoot.add(displayModel);
  Object.assign(selected, original); bladeIgnited = originalBlade; bladeUserChoice = originalChoice;
  rebuildSaber();
  collectionRim.color.set(selectedOption('crystal').hex);
  resizeCollectionScene();
}
function loadArtifact(artifact) {
  Object.keys(selected).forEach(key => { selected[key] = Math.max(0, Math.min(Number(artifact.parts[key]) || 0, options[key].length - 1)); });
  bladeIgnited = Boolean(artifact.blade); bladeUserChoice = bladeIgnited;
  renderSteps(); renderOptions(); updateUI(); rebuildSaber(); syncAuctionSaber();
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
  saberPartTag = 'hilt';
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
  saberPartTag = 'grip';
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
  saberPartTag = 'emitter';
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
  crystalMesh.userData.part = 'crystal';
  // Distinct activation hardware and its illuminated status jewel.
  saberPartTag = 'switch';
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
  saberPartTag = 'hilt';
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
  saberPartTag = 'pommel';
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
  saberPartTag = 'blade';
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
  saberPartTag = null;
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
let lastAnimateTime = 0;
function animate() {
  requestAnimationFrame(animate);
  const elapsed = clock.getElapsedTime();
  const delta = Math.min(.05, Math.max(0, elapsed - lastAnimateTime));
  lastAnimateTime = elapsed;
  if (autoRotate && !pointerDown) rotationY += .002;
  saberRoot.rotation.y += (rotationY - saberRoot.rotation.y) * .08;
  saberRoot.rotation.x += (rotationX - saberRoot.rotation.x) * .08;
  saberRoot.position.y = .25 + Math.sin(elapsed * 1.45) * .045;
  saberRoot.rotation.z = Math.sin(elapsed * .8) * .008;
  if (workshopDust) { workshopDust.rotation.y = elapsed * .018; workshopDust.position.y = Math.sin(elapsed * .3) * .06; }
  if (workshopRingGroup) workshopRingGroup.rotation.y = elapsed * .45;
  if (levitationGlow) levitationGlow.material.opacity = .36 + (Math.sin(elapsed * 1.7) + 1) * .045;
  if (levitationLight) levitationLight.intensity = 3.8 + (Math.sin(elapsed * 2.1) + 1) * .8;
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
  collectionSaberRoot.rotation.y += (rotationY - collectionSaberRoot.rotation.y) * .025;
  collectionSaberRoot.position.y = .12 + Math.sin(elapsed * 1.35) * .08;
  const activityCover = disassemblyOpen || slicer.open || duel.open || $('activitiesOverlay').classList.contains('open');
  if (!activityCover) renderer.render(scene, camera);
  if ($('saleOverlay').classList.contains('open')) auctionRenderer.render(auctionScene, auctionCamera);
  if ($('collectionOverlay').classList.contains('open') && collection.length) collectionRenderer.render(collectionScene, collectionCamera);
  if (disassemblyOpen) {
    updateDisassembly(delta, elapsed);
    disassemblyRenderer.render(disassemblyScene, disassemblyCamera);
  }
}
renderSteps(); renderOptions(); updateUI(); updateCollectionCount(); syncBladeToggle(); rebuildSaber();

// ===========================================================================
// ACTIVITIES — disassembly bay, scrap run, and the future duel ring.
// ===========================================================================
function openOverlayElement(element) {
  element.classList.add('open');
  element.setAttribute('aria-hidden', 'false');
}
function closeOverlayElement(element) {
  element.classList.remove('open');
  element.setAttribute('aria-hidden', 'true');
}
function activityBodyLock() {
  const anyOpen = ['activitiesOverlay', 'disassemblyOverlay', 'slicerOverlay', 'duelOverlay'].some(id => $(id).classList.contains('open'));
  document.body.classList.toggle('dialog-active', anyOpen);
}
function openActivities() {
  openOverlayElement($('activitiesOverlay'));
  activityBodyLock();
  const now = new Date();
  $('activitiesClock').textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  playTone(700, .08);
}
function closeActivities() {
  closeOverlayElement($('activitiesOverlay'));
  activityBodyLock();
}
$('activitiesClose').addEventListener('click', closeActivities);
$('activitiesOverlay').addEventListener('click', event => { if (event.target === $('activitiesOverlay')) closeActivities(); });
$('activityDisassemble').addEventListener('click', () => openDisassembly());
$('activitySlicer').addEventListener('click', () => openSlicer());
$('activityDuel').addEventListener('click', () => openDuel());

// ---------------------------------------------------------------------------
// Activity 01 — Disassembly Bay
// ---------------------------------------------------------------------------
const disassemblyCanvas = $('disassemblyCanvas');
const disassemblyScene = new THREE.Scene();
const disassemblyCamera = new THREE.PerspectiveCamera(34, 1, .1, 70);
const disassemblyRenderer = new THREE.WebGLRenderer({ canvas: disassemblyCanvas, antialias: true, alpha: true });
disassemblyRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
disassemblyRenderer.outputColorSpace = THREE.SRGBColorSpace;
disassemblyRenderer.toneMapping = THREE.ACESFilmicToneMapping;
disassemblyRenderer.toneMappingExposure = 1.12;
disassemblyScene.add(new THREE.HemisphereLight(0xc9d9cf, 0x1a211d, 2.5));
const disassemblyKey = new THREE.DirectionalLight(0xffe6c6, 3.3);
disassemblyKey.position.set(4, 7, 6);
disassemblyScene.add(disassemblyKey);
const disassemblyRim = new THREE.PointLight(0x6fe8ff, 24, 15, 2);
disassemblyRim.position.set(-3.2, 2.2, -3);
disassemblyScene.add(disassemblyRim);
const disassemblyFill = new THREE.PointLight(0xd8f36a, 9, 9, 2);
disassemblyFill.position.set(3, -.6, 3);
disassemblyScene.add(disassemblyFill);
const disassemblyRoot = new THREE.Group();
disassemblyScene.add(disassemblyRoot);
const disassemblyPad = new THREE.Mesh(new THREE.CylinderGeometry(1.72, 1.9, .08, 64), new THREE.MeshStandardMaterial({ color: 0x232c26, metalness: .74, roughness: .34 }));
disassemblyPad.position.y = -2.22;
disassemblyScene.add(disassemblyPad);
const disassemblyPadRing = new THREE.Mesh(new THREE.TorusGeometry(1.78, .018, 8, 64), new THREE.MeshStandardMaterial({ color: 0xc3d48c, emissive: 0x33421e, metalness: .55, roughness: .3 }));
disassemblyPadRing.rotation.x = Math.PI / 2;
disassemblyPadRing.position.y = -2.16;
disassemblyScene.add(disassemblyPadRing);
const disassemblyGlow = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 4.6), new THREE.MeshBasicMaterial({ map: makeGlowTexture('#d8f36a'), transparent: true, opacity: .24, blending: THREE.AdditiveBlending, depthWrite: false }));
disassemblyGlow.rotation.x = -Math.PI / 2;
disassemblyGlow.position.y = -2.17;
disassemblyScene.add(disassemblyGlow);
const disassemblyDustGeometry = new THREE.BufferGeometry();
const disassemblyDustPositions = new Float32Array(90 * 3);
for (let i = 0; i < 90; i++) {
  const angle = Math.random() * Math.PI * 2, radius = Math.random() * 3.4;
  disassemblyDustPositions[i * 3] = Math.cos(angle) * radius;
  disassemblyDustPositions[i * 3 + 1] = -1.8 + Math.random() * 4.4;
  disassemblyDustPositions[i * 3 + 2] = Math.sin(angle) * radius;
}
disassemblyDustGeometry.setAttribute('position', new THREE.BufferAttribute(disassemblyDustPositions, 3));
const disassemblyDust = new THREE.Points(disassemblyDustGeometry, new THREE.PointsMaterial({ color: 0xd8f36a, size: .022, transparent: true, opacity: .3, blending: THREE.AdditiveBlending, depthWrite: false }));
disassemblyScene.add(disassemblyDust);

let disassemblyOpen = false;
let disassemblyProgress = 0;
let disassemblyTarget = 0;
let disassemblyPhase = 'assembled';
let disassemblyPieces = [];
let disassemblyClone = null;
let disassemblySpin = -.35;
let disassemblyTilt = 0;
let disassemblyDragging = false;
let disassemblyPointerX = 0;
let disassemblyPointerY = 0;
let disassemblyLastUpdate = 0;
let disassemblyCameraProgress = -1;
let disassemblyPartInfo = {};
let disassemblyActivePart = null;
let disassemblyLabelEls = [];
let disassemblyLeaderEls = [];
let disassemblySelector = null;
let disassemblyCrystalGlow = null;
let disassemblyCrystalPiece = null;

// The teardown is a clean vertical split: the upper half lifts away from the
// lower half instead of exploding in every direction.
const DISASSEMBLY_PARTS = [
  { id: 'emitter', category: 'EMITTER', slot: 3.04, ring: .42, edge: 34, side: 'right' },
  { id: 'crystal', category: 'KYBER CRYSTAL', slot: 2.10, ring: .22, edge: 14, side: 'right' },
  { id: 'switch', category: 'ACTIVATION SWITCH', slot: 1.32, ring: .20, edge: 14, side: 'right' },
  { id: 'hilt', category: 'HILT BODY', slot: -.52, ring: .44, edge: 36, side: 'left' },
  { id: 'grip', category: 'GRIP', slot: -1.58, ring: .38, edge: 32, side: 'left' },
  { id: 'pommel', category: 'POMMEL', slot: -2.62, ring: .34, edge: 28, side: 'left' }
];
function crystalTone(detail) {
  const last = String(detail || '').split('·').pop().trim();
  const tone = last.split(/\s+/).pop();
  return tone || 'blue';
}

function buildDisassemblySaber() {
  return withActivityArtifact(selectedActivityArtifact(), buildDisassemblySaberFromCurrentSaber);
}
function buildDisassemblySaberFromCurrentSaber() {
  disassemblyRoot.clear();
  disassemblyPieces = [];
  disassemblyCrystalPiece = null;
  disassemblyClone = model.clone(true);
  disassemblyClone.traverse(child => {
    if (child.isLight) child.visible = false;
    if (child.userData.part === 'blade') child.visible = false;
    if (child.isMesh && child.material && child.material.isMeshBasicMaterial && child.position.y > 1.02) child.visible = false;
  });
  disassemblyRoot.add(disassemblyClone);
  const meshes = [];
  disassemblyClone.traverse(child => { if (child.isMesh && child.visible) meshes.push(child); });

  const groups = new Map(DISASSEMBLY_PARTS.map(part => [part.id, []]));
  meshes.forEach(mesh => {
    let id = mesh.userData.part;
    if (!groups.has(id)) {
      const y = mesh.position.y;
      id = y >= .58 ? 'emitter' : y < -.58 ? 'pommel' : y < -.1 ? 'grip' : 'hilt';
    }
    groups.get(id).push(mesh);
  });

  const partMap = new Map(DISASSEMBLY_PARTS.map(part => [part.id, part]));
  groups.forEach((list, id) => {
    if (!list.length) return;
    const part = partMap.get(id);
    const centroid = new THREE.Vector3();
    list.forEach(mesh => centroid.add(mesh.position));
    centroid.divideScalar(list.length);
    list.forEach(mesh => {
      const home = mesh.position.clone();
      const target = new THREE.Vector3(0, part.slot, 0).add(home.clone().sub(centroid));
      target.x *= .96;
      target.z *= .96;
      const homeScale = mesh.scale.clone();
      const boost = id === 'crystal' ? 1.32 : id === 'switch' ? 1.12 : 1;
      disassemblyPieces.push({
        mesh,
        part: id,
        home,
        homeQuat: mesh.quaternion.clone(),
        homeScale,
        target,
        targetQuat: mesh.quaternion.clone(),
        targetScale: homeScale.clone().multiplyScalar(boost),
        delay: Math.min(.3, DISASSEMBLY_PARTS.findIndex(item => item.id === id) * .045 + Math.random() * .04),
        phase: Math.random() * Math.PI * 2
      });
      if (id === 'crystal') disassemblyCrystalPiece = disassemblyPieces[disassemblyPieces.length - 1];
    });
  });

  const crystal = selectedOption('crystal');
  const partDetail = (id, option) => id === 'crystal'
    ? `${option.name} — the ${crystalTone(option.detail)} one`
    : `${option.name} · ${option.detail}`;
  disassemblyPartInfo = {
    emitter: { category: 'EMITTER', option: selectedOption('emitter'), identify: partDetail('emitter', selectedOption('emitter')) },
    crystal: { category: 'KYBER CRYSTAL', option: crystal, identify: partDetail('crystal', crystal) },
    switch: { category: 'ACTIVATION SWITCH', option: selectedOption('switch'), identify: partDetail('switch', selectedOption('switch')) },
    hilt: { category: 'HILT BODY', option: selectedOption('hilt'), identify: partDetail('hilt', selectedOption('hilt')) },
    grip: { category: 'GRIP', option: selectedOption('grip'), identify: partDetail('grip', selectedOption('grip')) },
    pommel: { category: 'POMMEL', option: selectedOption('pommel'), identify: partDetail('pommel', selectedOption('pommel')) }
  };
  buildDisassemblyLabels();

  disassemblyCrystalGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: makeGlowTexture(crystal.color), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  disassemblyCrystalGlow.scale.set(1.45, 1.45, 1);
  disassemblyCrystalGlow.visible = false;
  disassemblyRoot.add(disassemblyCrystalGlow);

  disassemblySelector = new THREE.Mesh(new THREE.TorusGeometry(.5, .014, 8, 64), new THREE.MeshBasicMaterial({ color: 0xd8f36a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  disassemblySelector.rotation.x = Math.PI / 2;
  disassemblySelector.visible = false;
  disassemblyRoot.add(disassemblySelector);

  $('disassemblyPieceCount').textContent = `${String(DISASSEMBLY_PARTS.length).padStart(2, '0')} COMPONENTS · 06 ASSEMBLIES`;
}

function paintDisassemblyLabel(label, id, active) {
  if (!label) return;
  const part = DISASSEMBLY_PARTS.find(item => item.id === id);
  const info = disassemblyPartInfo[id];
  if (!part || !info) return;
  const index = DISASSEMBLY_PARTS.indexOf(part) + 1;
  label.querySelector('.part-label-kicker').textContent = active ? `PART ${String(index).padStart(2, '0')} · ${part.category}` : `PART ${String(index).padStart(2, '0')} · ASSEMBLY`;
  label.querySelector('strong').textContent = active ? info.option.name : part.category;
  label.querySelector('.part-label-spec').textContent = active ? info.option.detail : 'TAP TO IDENTIFY';
  label.classList.toggle('is-active', active);
}

function buildDisassemblyLabels() {
  const container = $('disassemblyLabels');
  container.innerHTML = DISASSEMBLY_PARTS.map((part, index) => {
    const info = disassemblyPartInfo[part.id];
    const option = info.option;
    const color = option.color || finishHex[option.finish] || '#d8f36a';
    return `<button type="button" class="part-label" data-part="${part.id}" style="--part-color:${color}" aria-label="${part.category}: tap to identify this part" aria-pressed="false">
      <span class="part-label-kicker">PART ${String(index + 1).padStart(2, '0')} · ASSEMBLY</span>
      <strong>${part.category}</strong>
      <span class="part-label-spec">TAP TO IDENTIFY</span>
      <i class="part-label-dot" aria-hidden="true"></i>
    </button>`;
  }).join('');
  disassemblyLabelEls = Array.from(container.querySelectorAll('.part-label'));
  const leaders = $('disassemblyLeaders');
  leaders.innerHTML = DISASSEMBLY_PARTS.map(() => '<g><line/><circle r="2.2"/></g>').join('');
  disassemblyLeaderEls = Array.from(leaders.querySelectorAll('g')).map(group => ({
    line: group.querySelector('line'),
    dot: group.querySelector('circle')
  }));
}

function updateDisassemblyDetail() {
  const kicker = $('disassemblyDetailKicker');
  const name = $('disassemblyPartName');
  const type = $('disassemblyPieceCount');
  const note = $('disassemblyDetailNote');
  const swatch = $('disassemblySwatch');
  const readout = $('disassemblyReadout');
  const info = disassemblyActivePart ? disassemblyPartInfo[disassemblyActivePart] : null;
  if (info) {
    const option = info.option;
    kicker.textContent = `PART ${String(DISASSEMBLY_PARTS.findIndex(item => item.id === disassemblyActivePart) + 1).padStart(2, '0')} · ${info.category}`;
    name.textContent = option.name;
    type.textContent = info.identify.toUpperCase();
    note.textContent = option.note;
    note.hidden = false;
    const color = option.color || finishHex[option.finish] || null;
    if (color) {
      swatch.hidden = false;
      swatch.style.color = color;
      swatch.style.background = color;
    } else {
      swatch.hidden = true;
    }
    readout.classList.add('is-active');
  } else {
    kicker.textContent = 'ON THE PAD';
    name.textContent = (selectedActivityArtifact()?.name || buildName()).toUpperCase();
    type.textContent = disassemblyPhase === 'disassembled' ? '06 COMPONENTS · TAP A LABEL TO IDENTIFY' : '06 COMPONENTS · SYSTEMS NOMINAL';
    note.hidden = true;
    swatch.hidden = true;
    readout.classList.remove('is-active');
  }
}

function selectDisassemblyPart(id) {
  if (disassemblyPhase !== 'disassembled' && disassemblyPhase !== 'disassembling') return;
  disassemblyActivePart = disassemblyActivePart === id ? null : id;
  disassemblyLabelEls.forEach(label => {
    paintDisassemblyLabel(label, label.dataset.part, label.dataset.part === disassemblyActivePart);
    label.setAttribute('aria-pressed', String(label.dataset.part === disassemblyActivePart));
  });
  updateDisassemblyDetail();
  if (disassemblySelector) {
    const part = DISASSEMBLY_PARTS.find(item => item.id === disassemblyActivePart);
    if (part) {
      disassemblySelector.visible = true;
      disassemblySelector.position.set(0, part.slot, 0);
      disassemblySelector.scale.setScalar(part.ring / .5);
    } else {
      disassemblySelector.visible = false;
    }
  }
  playTone(disassemblyActivePart ? 540 : 420, .06);
}

$('disassemblyLabels').addEventListener('click', event => {
  const button = event.target.closest('.part-label');
  if (!button) return;
  selectDisassemblyPart(button.dataset.part);
});

function updateDisassemblyLabels() {
  const stage = $('disassemblyStage');
  const labels = $('disassemblyLabels');
  const leaders = $('disassemblyLeaders');
  const show = disassemblyProgress > .72;
  labels.classList.toggle('show', show);
  leaders.classList.toggle('show', show);
  labels.setAttribute('aria-hidden', show ? 'false' : 'true');
  if (!show) return;
  const width = stage.clientWidth;
  const height = stage.clientHeight;
  leaders.setAttribute('viewBox', `0 0 ${width} ${height}`);
  const narrow = width < 760;
  const labelBias = narrow ? 10 : 20;
  const centerX = width / 2 + labelBias;
  const projected = new THREE.Vector3();
  const anchors = [];
  const lastBottom = { left: -Infinity, right: -Infinity };
  disassemblyCamera.updateMatrixWorld();
  disassemblyRoot.updateMatrixWorld(true);
  DISASSEMBLY_PARTS.forEach((part, index) => {
    const label = disassemblyLabelEls[index];
    if (!label) return;
    projected.set(0, part.slot, 0).applyMatrix4(disassemblyRoot.matrixWorld).project(disassemblyCamera);
    const sx = (projected.x * .5 + .5) * width;
    const sy = (-projected.y * .5 + .5) * height;
    const labelWidth = label.offsetWidth || 190;
    const labelHeight = label.offsetHeight || 50;
    const side = narrow ? 'right' : part.side;
    let top = sy - labelHeight / 2;
    top = Math.max(12, Math.min(height - labelHeight - 12, top));
    if (top < lastBottom[side] + 8) top = lastBottom[side] + 8;
    top = Math.min(height - labelHeight - 12, top);
    lastBottom[side] = top + labelHeight;
    let left;
    if (side === 'right') {
      left = Math.max(sx + 74, centerX + 108);
      left = Math.min(width - labelWidth - (narrow ? 10 : 18), left);
    } else {
      left = Math.min(sx - 74 - labelWidth, centerX - 108 - labelWidth);
      left = Math.max(narrow ? 10 : 18, left);
    }
    label.style.transform = `translate3d(${left.toFixed(1)}px, ${top.toFixed(1)}px, 0)`;
    const lineX = side === 'right' ? left : left + labelWidth;
    anchors.push({ sx: sx + (side === 'right' ? part.edge : -part.edge), sy, lineX, ly: top + labelHeight / 2 });
  });
  anchors.forEach((anchor, index) => {
    const leader = disassemblyLeaderEls[index];
    if (!leader) return;
    leader.line.setAttribute('x1', anchor.sx.toFixed(1));
    leader.line.setAttribute('y1', anchor.sy.toFixed(1));
    leader.line.setAttribute('x2', anchor.lineX.toFixed(1));
    leader.line.setAttribute('y2', anchor.ly.toFixed(1));
    leader.dot.setAttribute('cx', anchor.sx.toFixed(1));
    leader.dot.setAttribute('cy', anchor.sy.toFixed(1));
    const active = DISASSEMBLY_PARTS[index].id === disassemblyActivePart;
    leader.line.classList.toggle('is-active', active);
    leader.dot.classList.toggle('is-active', active);
  });
}

function updateDisassemblyUI() {
  const button = $('disassembleToggle');
  const status = $('disassemblyStatus');
  const statusWrap = status.parentElement;
  const phase = $('disassemblyPhase');
  const caption = $('disassemblyCaption');
  const hint = $('disassemblyHint');
  statusWrap.classList.toggle('is-busy', disassemblyPhase === 'disassembling' || disassemblyPhase === 'assembling');
  statusWrap.classList.toggle('is-open', disassemblyPhase === 'disassembled');
  if (disassemblyPhase === 'disassembling' || disassemblyPhase === 'assembling') {
    button.disabled = true;
    button.innerHTML = `${disassemblyPhase === 'disassembling' ? 'DISASSEMBLING' : 'ASSEMBLING'} <span>…</span>`;
    status.textContent = disassemblyPhase === 'disassembling' ? 'RELEASING CLAMPS' : 'RECALLING PARTS';
    phase.textContent = disassemblyPhase === 'disassembling' ? 'TEARDOWN IN PROGRESS' : 'REASSEMBLY IN PROGRESS';
    caption.textContent = disassemblyPhase === 'disassembling' ? 'Upper assemblies rise. Lower assemblies drop. Every piece keeps its own vertical lane.' : 'Magnets engaged. The upper and lower halves are coming home.';
    hint.textContent = disassemblyPhase === 'disassembling' ? 'DRAG TO ROTATE · VERTICAL TEARDOWN' : 'DRAG TO ROTATE · RECALLING COMPONENTS';
  } else if (disassemblyPhase === 'disassembled') {
    button.disabled = false;
    button.innerHTML = 'ASSEMBLE <span>✳</span>';
    status.textContent = 'DISASSEMBLED';
    phase.textContent = 'VERTICAL SPLIT COMPLETE';
    caption.textContent = 'Top half up, bottom half down. Tap any label to identify the exact part fitted to this build.';
    hint.textContent = 'DRAG TO ROTATE · TAP A LABEL TO IDENTIFY';
  } else {
    button.disabled = false;
    button.innerHTML = 'DISASSEMBLE <span>✳</span>';
    status.textContent = 'ASSEMBLED';
    phase.textContent = 'SYSTEMS LOCKED';
    caption.textContent = 'All components seated. Ready for teardown.';
    hint.textContent = 'DRAG TO ROTATE · BLADE POWER DISENGAGED';
  }
  updateDisassemblyDetail();
}

function layoutDisassemblyCamera() {
  const width = Math.max(1, disassemblyCanvas.clientWidth);
  const height = Math.max(1, disassemblyCanvas.clientHeight);
  const aspect = width / height;
  disassemblyCamera.aspect = aspect;
  const halfFov = THREE.MathUtils.degToRad(34) / 2;
  const fitHeight = 2.45 + 1.16 * disassemblyProgress;
  const fitWidth = 2.2 + .72 * disassemblyProgress;
  const distance = Math.max(fitHeight / Math.tan(halfFov), fitWidth / (Math.tan(halfFov) * aspect)) + 1.15;
  const centerY = .08;
  // Nudge the whole 3D rig left of centre so the part labels have clear air.
  const frameOffsetX = width < 760 ? .72 : .44;
  disassemblyCamera.position.set(frameOffsetX, centerY + .04, distance);
  disassemblyCamera.lookAt(frameOffsetX, centerY, 0);
  disassemblyCamera.updateProjectionMatrix();
  disassemblyCamera.updateMatrixWorld();
  disassemblyCameraProgress = disassemblyProgress;
}

function resizeDisassemblyScene() {
  const width = Math.max(1, disassemblyCanvas.clientWidth);
  const height = Math.max(1, disassemblyCanvas.clientHeight);
  disassemblyRenderer.setSize(width, height, false);
  layoutDisassemblyCamera();
}

function openDisassembly() {
  openOverlayElement($('disassemblyOverlay'));
  disassemblyOpen = true;
  activityBodyLock();
  disassemblyProgress = 0;
  disassemblyTarget = 0;
  disassemblyPhase = 'assembled';
  disassemblySpin = -.35;
  disassemblyTilt = 0;
  disassemblyLastUpdate = 0;
  disassemblyActivePart = null;
  disassemblyCameraProgress = -1;
  buildDisassemblySaber();
  updateDisassemblyUI();
  resizeDisassemblyScene();
  requestAnimationFrame(resizeDisassemblyScene);
  playTone(620, .12);
}
function closeDisassembly() {
  if (!disassemblyOpen) return;
  disassemblyOpen = false;
  disassemblyActivePart = null;
  closeOverlayElement($('disassemblyOverlay'));
  activityBodyLock();
}
$('disassemblyClose').addEventListener('click', closeDisassembly);
$('disassemblyBack').addEventListener('click', closeDisassembly);
$('disassemblyOverlay').addEventListener('click', event => { if (event.target === $('disassemblyOverlay')) closeDisassembly(); });
$('disassembleToggle').addEventListener('click', () => {
  if (disassemblyPhase === 'assembled') {
    disassemblyTarget = 1;
    disassemblyPhase = 'disassembling';
    const flash = $('disassemblyFlash');
    flash.classList.add('pop');
    setTimeout(() => flash.classList.remove('pop'), 60);
    playTone(300, .22);
  } else if (disassemblyPhase === 'disassembled') {
    disassemblyTarget = 0;
    disassemblyPhase = 'assembling';
    disassemblyActivePart = null;
    if (disassemblySelector) disassemblySelector.visible = false;
    disassemblyLabelEls.forEach(label => label.classList.remove('is-active'));
    playTone(520, .2);
  }
  updateDisassemblyUI();
});
disassemblyCanvas.addEventListener('pointerdown', event => {
  disassemblyDragging = true;
  disassemblyPointerX = event.clientX;
  disassemblyPointerY = event.clientY;
  try { disassemblyCanvas.setPointerCapture?.(event.pointerId); } catch (_) { /* synthetic pointer */ }
});
disassemblyCanvas.addEventListener('pointermove', event => {
  if (!disassemblyDragging) return;
  disassemblySpin += (event.clientX - disassemblyPointerX) * .009;
  disassemblyTilt = Math.max(-.32, Math.min(.32, disassemblyTilt + (event.clientY - disassemblyPointerY) * .005));
  disassemblyPointerX = event.clientX;
  disassemblyPointerY = event.clientY;
});
disassemblyCanvas.addEventListener('pointerup', () => { disassemblyDragging = false; });
disassemblyCanvas.addEventListener('pointercancel', () => { disassemblyDragging = false; });
new ResizeObserver(resizeDisassemblyScene).observe(disassemblyCanvas);

function updateDisassembly(delta, elapsed) {
  if (!disassemblyOpen) return;
  const now = performance.now();
  const realDelta = disassemblyLastUpdate ? Math.min(.32, (now - disassemblyLastUpdate) / 1000) : Math.min(.32, delta);
  disassemblyLastUpdate = now;
  if (Math.abs(disassemblyProgress - disassemblyTarget) > .0005) {
    const step = realDelta / 1.45;
    if (disassemblyProgress < disassemblyTarget) disassemblyProgress = Math.min(disassemblyTarget, disassemblyProgress + step);
    else disassemblyProgress = Math.max(disassemblyTarget, disassemblyProgress - step);
    if (disassemblyProgress === disassemblyTarget) {
      disassemblyPhase = disassemblyTarget ? 'disassembled' : 'assembled';
      updateDisassemblyUI();
    }
  }
  if (Math.abs(disassemblyCameraProgress - disassemblyProgress) > .001) layoutDisassemblyCamera();
  disassemblyPieces.forEach(piece => {
    const raw = Math.max(0, Math.min(1, (disassemblyProgress - piece.delay) / (1 - piece.delay)));
    const t = raw * raw * (3 - 2 * raw);
    piece.mesh.position.lerpVectors(piece.home, piece.target, t);
    piece.mesh.quaternion.slerpQuaternions(piece.homeQuat, piece.targetQuat, t);
    piece.mesh.scale.lerpVectors(piece.homeScale, piece.targetScale, t);
    if (t > 0) piece.mesh.position.y += Math.sin(elapsed * 1.35 + piece.phase) * .012 * t;
    if (piece.part === 'crystal' && t > .2) piece.mesh.rotateY(realDelta * .45 * t);
  });
  if (!disassemblyDragging) {
    // Let the hilt settle to a straight vertical readout once it splits.
    const settle = Math.max(0, 1 - disassemblyProgress * 2.6);
    disassemblySpin += realDelta * .2 * settle;
    if (disassemblyProgress > .18) {
      disassemblySpin *= Math.max(0, 1 - realDelta * 2.8);
      disassemblyTilt *= Math.max(0, 1 - realDelta * 2.2);
    }
  }
  disassemblyRoot.rotation.y = disassemblySpin;
  disassemblyRoot.rotation.x = disassemblyTilt;
  disassemblyRoot.rotation.z = Math.sin(elapsed * .7) * .008 * (1 - disassemblyProgress);
  disassemblyRoot.position.y = .16 * (1 - disassemblyProgress) + Math.sin(elapsed * 1.35) * .04 * (1 - disassemblyProgress * .8);
  // Drop the pad as the lower half descends so no component sinks into it.
  const padDrop = disassemblyProgress * 1.1;
  disassemblyPad.position.y = -2.22 - padDrop;
  disassemblyPadRing.position.y = -2.16 - padDrop;
  disassemblyGlow.position.y = -2.17 - padDrop;
  disassemblyDust.rotation.y = elapsed * .035;
  disassemblyGlow.material.opacity = .2 + (Math.sin(elapsed * 1.8) + 1) * .035;
  disassemblyPadRing.material.emissiveIntensity = .24 + (Math.sin(elapsed * 2.1) + 1) * .12;
  if (disassemblyCrystalGlow && disassemblyCrystalPiece) {
    disassemblyCrystalGlow.visible = disassemblyProgress > .04;
    disassemblyCrystalGlow.position.copy(disassemblyCrystalPiece.mesh.position);
    const pulse = .16 + (Math.sin(elapsed * 2.4) + 1) * .08;
    disassemblyCrystalGlow.material.opacity = pulse * Math.min(1, disassemblyProgress * 1.4);
    const size = 1.32 + (Math.sin(elapsed * 1.8) + 1) * .1;
    disassemblyCrystalGlow.scale.set(size, size, 1);
  }
  if (disassemblySelector && disassemblySelector.visible) {
    disassemblySelector.material.opacity = .3 + (Math.sin(elapsed * 3) + 1) * .14;
  }
  updateDisassemblyLabels();
}

// ---------------------------------------------------------------------------
// Activity 02 — Scrap Run (fruit-ninja style salvage slicer)
// ---------------------------------------------------------------------------
const slicerCanvas = $('slicerCanvas');
const slicerCtx = slicerCanvas.getContext('2d');
const SLICER_BEST_KEY = 'sabersmith.scrapRun.best.v1';
const SLICER_GRAVITY = 1180;
const slicer = {
  open: false,
  running: false,
  w: 1,
  h: 1,
  dpr: 1,
  score: 0,
  best: 0,
  lives: 3,
  elapsed: 0,
  timeLeft: 60,
  objects: [],
  pieces: [],
  sparks: [],
  floats: [],
  rings: [],
  trail: [],
  stars: [],
  backdrop: null,
  spawnTimer: 0,
  bombTimer: 3.6,
  combo: 0,
  comboTimer: 0,
  drawing: false,
  shake: 0,
  flash: 0,
  flashColor: '255, 80, 70',
  bannerUntil: 0,
  raf: 0,
  lastFrame: 0,
  bladeRgb: '74,141,255',
  lastScoreShown: -1,
  lastTimeShown: -1,
  lastLivesShown: -1
};
try { slicer.best = Math.max(0, Number(localStorage.getItem(SLICER_BEST_KEY)) || 0); } catch (_) { slicer.best = 0; }

const slicerTypeMeta = {
  crate: { points: 10, size: 86, w: .98, h: .98, colors: ['#d8f36a', '#c9a36b', '#fff5d6'] },
  droid: { points: 15, size: 92, w: .62, h: 1.15, colors: ['#d8f36a', '#c8ad7c', '#fff5d6'] },
  helmet: { points: 20, size: 86, w: .95, h: .82, colors: ['#d8f36a', '#d9ddd4', '#fff'] },
  barrel: { points: 10, size: 86, w: .62, h: 1.05, colors: ['#d8f36a', '#8a9690', '#fff'] },
  probe: { points: 25, size: 78, w: .95, h: .95, colors: ['#d8f36a', '#6fe8ff', '#fff'] },
  holocron: { points: 30, size: 80, w: .9, h: .9, colors: ['#d8f36a', '#ffd76f', '#8ff5ff'], rare: true },
  astromech: { points: 20, size: 86, w: .95, h: .9, colors: ['#d8f36a', '#9fc9e8', '#fff'] },
  blaster: { points: 25, size: 96, w: 1.1, h: .7, colors: ['#d8f36a', '#9aa69e', '#fff'] },
  saber: { points: 35, size: 90, w: .55, h: 1.1, colors: ['#d8f36a', '#c8ad7c', '#fff'], rare: true },
  mando: { points: 30, size: 86, w: .95, h: .86, colors: ['#d8f36a', '#8fa8b5', '#fff'] },
  remote: { points: 20, size: 74, w: .9, h: .9, colors: ['#d8f36a', '#9aa69e', '#fff'] },
  xwing: { points: 35, size: 104, w: 1.2, h: .88, colors: ['#d8f36a', '#d9ddd4', '#ff6b5c'], rare: true },
  tie: { points: 30, size: 98, w: .98, h: .98, colors: ['#d8f36a', '#8fa8b5', '#fff'] },
  vader: { points: 35, size: 92, w: .92, h: .9, colors: ['#d8f36a', '#9aa69e', '#ff4d4d'], rare: true },
  protocol: { points: 25, size: 92, w: .62, h: 1.1, colors: ['#d8f36a', '#e5bd69', '#fff'] },
  destroyer: { points: 50, size: 116, w: 1.35, h: .72, colors: ['#d8f36a', '#9aa69e', '#fff'], rare: true },
  darksaber: { points: 55, size: 100, w: .55, h: 1.15, colors: ['#d8f36a', '#8ff5ff', '#fff'], rare: true },
  bomb: { points: 0, size: 70, w: .72, h: .72, colors: ['#ff5b4d', '#ffb15c', '#fff'] },
  charge: { points: 0, size: 74, w: .72, h: .95, colors: ['#ff5b4d', '#ffb15c', '#fff'] },
  seismic: { points: 0, size: 78, w: .9, h: .9, colors: ['#4deaff', '#ff5b4d', '#fff'] }
};
const SLICER_BOMB_TYPES = new Set(['bomb', 'charge', 'seismic']);
const SLICER_BOMB_LABELS = { bomb: 'THERMAL DETONATOR', charge: 'PROTON CHARGE', seismic: 'SEISMIC CHARGE' };
const SLICER_SALVAGE_TABLE = [
  ['crate', 15], ['droid', 13], ['helmet', 10], ['barrel', 9], ['probe', 7],
  ['holocron', 6], ['astromech', 8], ['blaster', 7], ['saber', 4], ['mando', 6], ['remote', 8],
  ['xwing', 5], ['tie', 6], ['vader', 4], ['protocol', 6], ['destroyer', 3], ['darksaber', 3]
];
const SLICER_SALVAGE_TOTAL = SLICER_SALVAGE_TABLE.reduce((total, entry) => total + entry[1], 0);
function isSlicerBomb(type) { return SLICER_BOMB_TYPES.has(type); }
function pickSlicerBombType() {
  const roll = Math.random();
  return roll < .40 ? 'bomb' : roll < .72 ? 'charge' : 'seismic';
}
function pickSlicerSalvage() {
  let roll = Math.random() * SLICER_SALVAGE_TOTAL;
  for (const [type, weight] of SLICER_SALVAGE_TABLE) {
    roll -= weight;
    if (roll <= 0) return type;
  }
  return 'crate';
}

function hexToRgb(hex) {
  const value = parseInt(hex.replace('#', ''), 16);
  return `${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}`;
}
function roundRectPath(context, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.lineTo(x + width - r, y);
  context.quadraticCurveTo(x + width, y, x + width, y + r);
  context.lineTo(x + width, y + height - r);
  context.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  context.lineTo(x + r, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - r);
  context.lineTo(x, y + r);
  context.quadraticCurveTo(x, y, x + r, y);
  context.closePath();
}
function segmentDistance(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const lengthSq = dx * dx + dy * dy;
  if (lengthSq === 0) return Math.hypot(px - x1, py - y1);
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lengthSq));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function resizeSlicer() {
  const width = Math.max(1, slicerCanvas.clientWidth);
  const height = Math.max(1, slicerCanvas.clientHeight);
  slicer.w = width;
  slicer.h = height;
  slicer.dpr = Math.min(window.devicePixelRatio || 1, 2);
  slicerCanvas.width = Math.round(width * slicer.dpr);
  slicerCanvas.height = Math.round(height * slicer.dpr);
  slicerCtx.setTransform(slicer.dpr, 0, 0, slicer.dpr, 0, 0);
  if (!slicer.stars.length) {
    for (let i = 0; i < 86; i++) {
      slicer.stars.push({ x: Math.random(), y: Math.random() * .88, speed: .6 + Math.random() * 1.8, phase: Math.random() * Math.PI * 2, size: .6 + Math.random() * 1.7 });
    }
  }
  buildSlicerBackdrop();
}
new ResizeObserver(resizeSlicer).observe(slicerCanvas);

function buildSlicerBackdrop() {
  if (!slicer.w || !slicer.h) return;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(slicer.w * slicer.dpr);
  canvas.height = Math.round(slicer.h * slicer.dpr);
  const context = canvas.getContext('2d');
  context.setTransform(slicer.dpr, 0, 0, slicer.dpr, 0, 0);
  const width = slicer.w, height = slicer.h;
  const horizon = height * .69;

  const base = context.createRadialGradient(width * .5, height * .4, 10, width * .5, height * .52, Math.max(width, height) * .78);
  base.addColorStop(0, '#22332b');
  base.addColorStop(.38, '#15211b');
  base.addColorStop(.72, '#0d1411');
  base.addColorStop(1, '#070b09');
  context.fillStyle = base;
  context.fillRect(0, 0, width, height);

  const bloom = (x, y, radius, rgb, alpha) => {
    const glow = context.createRadialGradient(x, y, 0, x, y, radius);
    glow.addColorStop(0, `rgba(${rgb},${alpha})`);
    glow.addColorStop(.55, `rgba(${rgb},${alpha * .35})`);
    glow.addColorStop(1, `rgba(${rgb},0)`);
    context.fillStyle = glow;
    context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  };
  bloom(width * .18, height * .24, width * .32, '70, 190, 170', .075);
  bloom(width * .84, height * .3, width * .3, '216, 160, 80', .06);
  bloom(width * .5, height * .12, width * .4, '150, 210, 140', .05);

  for (let i = 0; i < 130; i++) {
    const x = Math.random() * width, y = Math.random() * height * .8;
    context.fillStyle = `rgba(220, 240, 220, ${.05 + Math.random() * .2})`;
    context.fillRect(x, y, Math.random() < .88 ? .8 : 1.6, Math.random() < .88 ? .8 : 1.6);
  }

  // A distant Coruscant district beyond the salvage floor.
  let x = -8;
  while (x < width + 8) {
    const towerWidth = 12 + Math.random() * 30;
    const towerHeight = height * (.07 + Math.random() * .18);
    const top = horizon - towerHeight;
    context.fillStyle = `rgba(${9 + Math.random() * 8},${16 + Math.random() * 8},${14 + Math.random() * 6},.95)`;
    context.fillRect(x, top, towerWidth, towerHeight + height * .01);
    context.fillStyle = 'rgba(216,243,106,.16)';
    for (let wy = top + 5; wy < horizon - 3; wy += 7) {
      if (Math.random() < .55) context.fillRect(x + 3 + Math.random() * (towerWidth - 7), wy, 1.4, 1.4);
    }
    if (Math.random() < .3) {
      context.fillStyle = 'rgba(111,232,255,.35)';
      context.fillRect(x + towerWidth * .5, top - 6, 1.2, 6);
    }
    x += towerWidth + 3 + Math.random() * 9;
  }
  context.fillStyle = 'rgba(111,232,255,.07)';
  for (let i = 0; i < 5; i++) {
    const laneY = horizon - 4 - i * 7;
    context.fillRect(width * (.05 + Math.random() * .2), laneY, width * .16, .9);
    context.fillRect(width * (.55 + Math.random() * .25), laneY + 2, width * .2, .8);
  }

  // Perspective floor and a lit salvage pit at the bottom of the frame.
  const floor = context.createLinearGradient(0, horizon, 0, height);
  floor.addColorStop(0, 'rgba(12,20,16,.15)');
  floor.addColorStop(.4, 'rgba(9,14,12,.82)');
  floor.addColorStop(1, '#050806');
  context.fillStyle = floor;
  context.fillRect(0, horizon, width, height - horizon);
  context.strokeStyle = 'rgba(216,243,106,.12)';
  context.lineWidth = 1;
  for (let i = -8; i <= 8; i++) {
    context.beginPath();
    context.moveTo(width * .5 + i * width * .015, horizon);
    context.lineTo(width * .5 + i * width * .11, height);
    context.stroke();
  }
  for (let i = 1; i <= 8; i++) {
    const t = i / 8;
    const y = horizon + (height - horizon) * t * t;
    context.strokeStyle = `rgba(216,243,106,${.04 + t * .07})`;
    context.beginPath(); context.moveTo(0, y); context.lineTo(width, y); context.stroke();
  }
  const pitGlow = context.createRadialGradient(width * .5, height * 1.02, 4, width * .5, height * 1.02, width * .34);
  pitGlow.addColorStop(0, 'rgba(216,243,106,.17)');
  pitGlow.addColorStop(.45, 'rgba(150,200,90,.06)');
  pitGlow.addColorStop(1, 'rgba(0,0,0,0)');
  context.fillStyle = pitGlow;
  context.fillRect(0, height * .7, width, height * .3);

  // Hangar gantries and overhead lamps frame the play space.
  const gantry = context.createLinearGradient(0, 0, width, 0);
  gantry.addColorStop(0, 'rgba(4,7,6,.96)');
  gantry.addColorStop(.045, 'rgba(9,14,12,.78)');
  gantry.addColorStop(.5, 'rgba(9,14,12,0)');
  gantry.addColorStop(.955, 'rgba(9,14,12,.78)');
  gantry.addColorStop(1, 'rgba(4,7,6,.96)');
  context.fillStyle = gantry;
  context.fillRect(0, 0, width, height);
  context.strokeStyle = 'rgba(216,243,106,.24)';
  context.lineWidth = 1;
  for (const [gx, dir] of [[width * .035, 1], [width * .965, -1]]) {
    context.beginPath();
    context.moveTo(gx, height * .13);
    context.lineTo(gx, height * .88);
    context.stroke();
    for (let i = 0; i < 5; i++) {
      context.strokeStyle = 'rgba(216,243,106,.11)';
      context.beginPath();
      context.moveTo(gx, height * (.17 + i * .14));
      context.lineTo(gx + dir * width * .035, height * (.15 + i * .14));
      context.stroke();
    }
    context.fillStyle = 'rgba(216,243,106,.6)';
    for (let i = 0; i < 3; i++) context.fillRect(gx - (dir > 0 ? 0 : 3), height * (.18 + i * .18), 3, 3);
    context.strokeStyle = 'rgba(216,243,106,.1)';
    context.beginPath();
    context.moveTo(gx, height * .1); context.lineTo(gx + dir * width * .14, height * .04);
    context.stroke();
  }

  context.font = '500 7px "DM Mono", monospace';
  context.fillStyle = 'rgba(216,243,106,.34)';
  context.fillText('SALVAGE BAY 07', width * .065, height * .11);
  context.fillStyle = 'rgba(190,205,190,.28)';
  context.fillText('CORUSCANT · NIGHT SHIFT', width * .065, height * .132);
  context.fillStyle = 'rgba(216,243,106,.2)';
  context.fillText('CHUTE OPEN', width * .87, height * .11);

  context.strokeStyle = 'rgba(216,243,106,.045)';
  context.lineWidth = 1;
  for (const radius of [width * .16, width * .3, width * .44]) {
    context.beginPath(); context.arc(width * .5, height * .46, radius, 0, Math.PI * 2); context.stroke();
  }

  slicer.backdrop = canvas;
}

const slicerGlowCache = new Map();
function getSlicerGlow(color) {
  if (slicerGlowCache.has(color)) return slicerGlowCache.get(color);
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 160;
  const context = canvas.getContext('2d');
  const rgb = hexToRgb(color);
  const glow = context.createRadialGradient(80, 80, 0, 80, 80, 80);
  glow.addColorStop(0, `rgba(${rgb},.58)`);
  glow.addColorStop(.28, `rgba(${rgb},.25)`);
  glow.addColorStop(.65, `rgba(${rgb},.06)`);
  glow.addColorStop(1, `rgba(${rgb},0)`);
  context.fillStyle = glow;
  context.fillRect(0, 0, 160, 160);
  slicerGlowCache.set(color, canvas);
  return canvas;
}

function comboMultiplier() {
  return Math.min(5, 1 + Math.floor(Math.max(0, slicer.combo) / 2));
}
function updateSlicerHud(force = false) {
  if (force || slicer.score !== slicer.lastScoreShown) {
    $('slicerScore').textContent = slicer.score.toLocaleString('en-US');
    slicer.lastScoreShown = slicer.score;
  }
  $('slicerBest').textContent = slicer.best.toLocaleString('en-US');
  const seconds = Math.max(0, Math.ceil(slicer.timeLeft));
  if (force || seconds !== slicer.lastTimeShown) {
    $('slicerTimer').textContent = String(seconds).padStart(2, '0');
    slicer.lastTimeShown = seconds;
  }
  if (force || slicer.lives !== slicer.lastLivesShown) {
    const marks = [];
    for (let i = 0; i < 3; i++) marks.push(i < slicer.lives ? '◆' : '◇');
    $('slicerLives').textContent = marks.join(' ');
    slicer.lastLivesShown = slicer.lives;
  }
}
function setSlicerBanner(message, seconds) {
  const banner = $('slicerBanner');
  banner.textContent = message;
  banner.classList.add('show');
  slicer.bannerUntil = performance.now() / 1000 + seconds;
}
function updateComboDisplay() {
  const element = $('slicerCombo');
  const multiplier = comboMultiplier();
  if (slicer.combo > 1 && slicer.comboTimer > 0) {
    element.textContent = `x${multiplier}`;
    element.classList.add('show');
  } else {
    element.classList.remove('show');
  }
}
function resetSlicerGame() {
  slicer.running = false;
  slicer.score = 0;
  slicer.lives = 3;
  slicer.elapsed = 0;
  slicer.timeLeft = 60;
  slicer.objects.length = 0;
  slicer.pieces.length = 0;
  slicer.sparks.length = 0;
  slicer.floats.length = 0;
  slicer.rings.length = 0;
  slicer.trail.length = 0;
  slicer.spawnTimer = 0;
  slicer.bombTimer = 3.6;
  slicer.combo = 0;
  slicer.comboTimer = 0;
  slicer.shake = 0;
  slicer.flash = 0;
  slicer.drawing = false;
  $('slicerStart').hidden = false;
  $('slicerOver').hidden = true;
  $('slicerOver').setAttribute('aria-hidden', 'true');
  $('slicerBanner').classList.remove('show');
  $('slicerCombo').classList.remove('show');
  $('slicerFooterStatus').textContent = 'AWAITING RUN';
  updateSlicerHud(true);
}
function startSlicerRun() {
  slicer.running = true;
  slicer.score = 0;
  slicer.lives = 3;
  slicer.elapsed = 0;
  slicer.timeLeft = 60;
  slicer.objects.length = 0;
  slicer.pieces.length = 0;
  slicer.sparks.length = 0;
  slicer.floats.length = 0;
  slicer.rings.length = 0;
  slicer.trail.length = 0;
  slicer.spawnTimer = .55;
  slicer.bombTimer = 3.6;
  slicer.combo = 0;
  slicer.comboTimer = 0;
  slicer.shake = 0;
  slicer.flash = 0;
  slicer.drawing = false;
  $('slicerStart').hidden = true;
  $('slicerOver').hidden = true;
  $('slicerOver').setAttribute('aria-hidden', 'true');
  $('slicerFooterStatus').textContent = 'RUN ACTIVE · 60 SECONDS';
  updateSlicerHud(true);
  updateComboDisplay();
  setSlicerBanner('SLICE THE SALVAGE', 1.5);
  playTone(760, .12);
}
function endSlicerRun(reason) {
  if (!slicer.running) return;
  slicer.running = false;
  slicer.drawing = false;
  const isBest = slicer.score > slicer.best;
  if (isBest) {
    slicer.best = slicer.score;
    try { localStorage.setItem(SLICER_BEST_KEY, String(slicer.best)); } catch (_) { /* optional */ }
  }
  $('slicerFinalScore').textContent = slicer.score.toLocaleString('en-US');
  $('slicerBest').textContent = slicer.best.toLocaleString('en-US');
  $('slicerNewBest').textContent = isBest && slicer.score > 0 ? 'NEW PERSONAL BEST' : 'PERSONAL BEST';
  $('slicerNewBest').classList.toggle('is-best', isBest && slicer.score > 0);
  if (reason === 'detonator') {
    $('slicerOverTitle').textContent = 'That was a detonator.';
    $('slicerOverCopy').textContent = 'The last thing through your blade was a detonator. Thermal, proton or seismic — the salvage floor takes this round.';
  } else if (reason === 'lives') {
    $('slicerOverTitle').textContent = 'The salvage won.';
    $('slicerOverCopy').textContent = 'Too much hardware hit the floor. Keep the blade moving and try another run.';
  } else if (slicer.score >= 600) {
    $('slicerOverTitle').textContent = 'Masterful cutting.';
    $('slicerOverCopy').textContent = 'The chute is closing and the floor is clean. The salvage guild will hear about this run.';
  } else {
    $('slicerOverTitle').textContent = 'Time called.';
    $('slicerOverCopy').textContent = 'The chute is closing. A respectable pile of salvage — but the guild always wants more.';
  }
  $('slicerOverEyebrow').textContent = 'RUN COMPLETE';
  $('slicerOver').hidden = false;
  $('slicerOver').setAttribute('aria-hidden', 'false');
  $('slicerFooterStatus').textContent = 'RUN COMPLETE · CHUTE CLOSED';
  $('slicerCombo').classList.remove('show');
  $('slicerBanner').classList.remove('show');
  playTone(220, .35);
}

function pickSlicerType() {
  const activeBombs = slicer.objects.filter(object => isSlicerBomb(object.type)).length;
  const bombChance = slicer.elapsed > 3 && activeBombs < 3 ? .035 + Math.min(.025, slicer.elapsed * .0004) : 0;
  if (Math.random() < bombChance) return pickSlicerBombType();
  return pickSlicerSalvage();
}
function spawnSlicerObject(offset = 0, forcedType = null) {
  const type = forcedType || pickSlicerType();
  const meta = slicerTypeMeta[type];
  const size = meta.size * (.85 + Math.random() * .3);
  const x = Math.min(slicer.w * .88, Math.max(slicer.w * .12, slicer.w * (.16 + Math.random() * .68) + offset));
  const peak = slicer.h * (.6 + Math.random() * .22);
  const vy = -Math.sqrt(2 * SLICER_GRAVITY * peak);
  const timeUp = -vy / SLICER_GRAVITY;
  const targetX = Math.min(slicer.w * .9, Math.max(slicer.w * .1, x + (slicer.w * .5 - x) * (.2 + Math.random() * .55)));
  const vx = (targetX - x) / (timeUp * 2);
  const radius = Math.max(size * meta.w, size * meta.h) * .5;
  slicer.objects.push({
    type,
    x,
    y: slicer.h + size,
    vx,
    vy,
    angle: (Math.random() - .5) * .5,
    va: (Math.random() - .5) * 2.4,
    size,
    radius,
    points: meta.points,
    seen: false,
    seed: Math.random() * Math.PI * 2
  });
}
function spawnSlicerWave() {
  const waveSize = 1 + (Math.random() < .5 ? 1 : 0) + (slicer.elapsed > 12 && Math.random() < .22 ? 1 : 0) + (slicer.elapsed > 35 && Math.random() < .12 ? 1 : 0);
  for (let i = 0; i < waveSize; i++) spawnSlicerObject((i - (waveSize - 1) / 2) * 90);
}
function spawnSlicerSparks(x, y, colors, count, power = 260) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = power * (.25 + Math.random() * .75);
    slicer.sparks.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 50,
      life: .4 + Math.random() * .5,
      maxLife: .9,
      size: 1 + Math.random() * 2.6,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }
}
function addSlicerFloat(x, y, text, color = '#d8f36a') {
  slicer.floats.push({ x, y, text, color, life: .9, maxLife: .9 });
}
function addSlicerRing(x, y, color = '#d8f36a', radius = 80, duration = .5) {
  slicer.rings.push({ x, y, color, radius, life: duration, maxLife: duration });
}
function loseSlicerLife(kind) {
  if (!slicer.running) return;
  slicer.lives = Math.max(0, slicer.lives - 1);
  slicer.combo = 0;
  slicer.comboTimer = 0;
  slicer.flash = 1;
  slicer.flashColor = kind === 'detonator' ? '255, 70, 58' : '242, 164, 113';
  slicer.shake = kind === 'detonator' ? 18 : 9;
  updateComboDisplay();
  updateSlicerHud(true);
  setSlicerBanner(kind === 'detonator' ? 'DETONATOR!' : 'SALVAGE LOST', 1.15);
  playTone(kind === 'detonator' ? 78 : 150, .3);
  if (slicer.lives <= 0) endSlicerRun(kind === 'detonator' ? 'detonator' : 'lives');
}
function sliceSlicerObject(object, cutAngle) {
  const index = slicer.objects.indexOf(object);
  if (index === -1) return;
  slicer.objects.splice(index, 1);
  const meta = slicerTypeMeta[object.type];
  if (isSlicerBomb(object.type)) {
    spawnSlicerSparks(object.x, object.y, meta.colors, 30, 450);
    addSlicerRing(object.x, object.y, meta.colors[0], 150, .55);
    slicer.shake = 20;
    slicer.flash = 1;
    slicer.flashColor = object.type === 'seismic' ? '77, 220, 255' : '255, 70, 58';
    addSlicerFloat(object.x, object.y - 30, SLICER_BOMB_LABELS[object.type], '#ff6b5c');
    loseSlicerLife('detonator');
    return;
  }
  slicer.combo += 1;
  slicer.comboTimer = 1.05;
  const multiplier = comboMultiplier();
  const gained = object.points * multiplier;
  const saberColor = activityCrystalColor();
  slicer.score += gained;
  spawnSlicerSparks(object.x, object.y, [saberColor], 12 + Math.min(10, multiplier * 2), 240);
  addSlicerRing(object.x, object.y, saberColor, 48 + multiplier * 10, .4);
  addSlicerFloat(object.x, object.y - object.radius - 8, `${meta.rare ? '✦ ' : ''}+${gained}`, multiplier > 1 || meta.rare ? '#d8f36a' : '#f5f7e9');
  const separation = cutAngle + Math.PI / 2;
  const push = 150 + Math.random() * 90;
  for (const side of [-1, 1]) {
    slicer.pieces.push({
      type: object.type,
      x: object.x,
      y: object.y,
      vx: object.vx + Math.cos(separation) * push * side,
      vy: object.vy + Math.sin(separation) * push * side - 45,
      angle: object.angle,
      va: object.va + side * (1.2 + Math.random()),
      size: object.size,
      side,
      alpha: 1
    });
  }
  updateSlicerHud();
  updateComboDisplay();
  playTone(560 + Math.min(7, slicer.combo) * 55, .07);
}
function checkSlicerSwipe(from, to) {
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  for (let i = slicer.objects.length - 1; i >= 0; i--) {
    const object = slicer.objects[i];
    if (segmentDistance(object.x, object.y, from.x, from.y, to.x, to.y) <= object.radius + 11) {
      sliceSlicerObject(object, angle);
    }
  }
}
function slicerLocalPoint(event) {
  const rect = slicerCanvas.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top, t: performance.now() / 1000 };
}
slicerCanvas.addEventListener('pointerdown', event => {
  if (!slicer.open || !slicer.running) return;
  event.preventDefault();
  slicer.drawing = true;
  try { slicerCanvas.setPointerCapture?.(event.pointerId); } catch (_) { /* synthetic pointer */ }
  slicer.trail.push(slicerLocalPoint(event));
});
slicerCanvas.addEventListener('pointermove', event => {
  if (!slicer.open || !slicer.running || !slicer.drawing) return;
  event.preventDefault();
  const point = slicerLocalPoint(event);
  const previous = slicer.trail[slicer.trail.length - 1];
  if (previous) checkSlicerSwipe(previous, point);
  slicer.trail.push(point);
  if (slicer.trail.length > 30) slicer.trail.shift();
});
const stopSlicerSwipe = () => { slicer.drawing = false; };
slicerCanvas.addEventListener('pointerup', stopSlicerSwipe);
slicerCanvas.addEventListener('pointercancel', stopSlicerSwipe);
slicerCanvas.addEventListener('pointerleave', stopSlicerSwipe);
slicerCanvas.addEventListener('contextmenu', event => event.preventDefault());

function openSlicer() {
  openOverlayElement($('slicerOverlay'));
  slicer.open = true;
  activityBodyLock();
  slicer.bladeRgb = hexToRgb(activityCrystalColor());
  resetSlicerGame();
  resizeSlicer();
  requestAnimationFrame(resizeSlicer);
  startSlicerLoop();
  playTone(680, .1);
}
function closeSlicer() {
  if (!slicer.open) return;
  slicer.open = false;
  slicer.running = false;
  slicer.drawing = false;
  stopSlicerLoop();
  closeOverlayElement($('slicerOverlay'));
  activityBodyLock();
}
function startSlicerLoop() {
  if (slicer.raf) return;
  slicer.lastFrame = 0;
  slicer.raf = requestAnimationFrame(slicerLoop);
}
function stopSlicerLoop() {
  if (slicer.raf) cancelAnimationFrame(slicer.raf);
  slicer.raf = 0;
}
$('slicerClose').addEventListener('click', closeSlicer);
$('slicerBack').addEventListener('click', closeSlicer);
$('slicerOverlay').addEventListener('click', event => { if (event.target === $('slicerOverlay')) closeSlicer(); });
$('slicerStartButton').addEventListener('click', startSlicerRun);
$('slicerRestart').addEventListener('click', startSlicerRun);

function updateSlicer(delta, now) {
  if (slicer.running) {
    slicer.elapsed += delta;
    slicer.timeLeft = Math.max(0, 60 - slicer.elapsed);
    if (slicer.timeLeft <= 0) {
      endSlicerRun('time');
    } else {
      slicer.spawnTimer -= delta;
      slicer.bombTimer -= delta;
      if (slicer.spawnTimer <= 0) {
        spawnSlicerWave();
        slicer.spawnTimer = Math.max(.42, .82 - slicer.elapsed * .006) + Math.random() * .2;
      }
      if (slicer.bombTimer <= 0 && slicer.elapsed > 3) {
        spawnSlicerObject(0, pickSlicerBombType());
        slicer.bombTimer = Math.max(5.6, 8.4 - slicer.elapsed * .035) + Math.random() * 1.4;
      }
    }
  }
  for (let i = slicer.objects.length - 1; i >= 0; i--) {
    const object = slicer.objects[i];
    object.vy += SLICER_GRAVITY * delta;
    object.x += object.vx * delta;
    object.y += object.vy * delta;
    object.angle += object.va * delta;
    if (object.y < slicer.h * .55) object.seen = true;
    if (object.seen && object.vy > 0 && object.y - object.radius > slicer.h + 60) {
      slicer.objects.splice(i, 1);
      if (slicer.running && !isSlicerBomb(object.type) && slicer.elapsed > 4) loseSlicerLife('miss');
      continue;
    }
    if (object.x < -260 || object.x > slicer.w + 260) slicer.objects.splice(i, 1);
  }
  for (let i = slicer.pieces.length - 1; i >= 0; i--) {
    const piece = slicer.pieces[i];
    piece.vy += SLICER_GRAVITY * delta;
    piece.x += piece.vx * delta;
    piece.y += piece.vy * delta;
    piece.angle += piece.va * delta;
    piece.alpha -= delta * .38;
    if (piece.alpha <= 0 || piece.y > slicer.h + 260) slicer.pieces.splice(i, 1);
  }
  for (let i = slicer.rings.length - 1; i >= 0; i--) {
    const ring = slicer.rings[i];
    ring.life -= delta;
    if (ring.life <= 0) slicer.rings.splice(i, 1);
  }
  for (let i = slicer.sparks.length - 1; i >= 0; i--) {
    const spark = slicer.sparks[i];
    spark.vy += 900 * delta;
    spark.x += spark.vx * delta;
    spark.y += spark.vy * delta;
    spark.life -= delta;
    if (spark.life <= 0) slicer.sparks.splice(i, 1);
  }
  for (let i = slicer.floats.length - 1; i >= 0; i--) {
    const float = slicer.floats[i];
    float.y -= 38 * delta;
    float.life -= delta;
    if (float.life <= 0) slicer.floats.splice(i, 1);
  }
  const cutoff = now - .2;
  while (slicer.trail.length && slicer.trail[0].t < cutoff) slicer.trail.shift();
  if (slicer.comboTimer > 0) {
    slicer.comboTimer -= delta;
    if (slicer.comboTimer <= 0) {
      slicer.combo = 0;
      updateComboDisplay();
    }
  }
  if (slicer.bannerUntil && now > slicer.bannerUntil) {
    $('slicerBanner').classList.remove('show');
    slicer.bannerUntil = 0;
  }
  slicer.shake = Math.max(0, slicer.shake - delta * 44);
  slicer.flash = Math.max(0, slicer.flash - delta * 2.6);
  updateSlicerHud();
}

function drawCrateArt(context) {
  context.save();
  context.fillStyle = 'rgba(0,0,0,.26)';
  context.beginPath(); context.ellipse(2, 24, 27, 5, 0, 0, Math.PI * 2); context.fill();
  context.restore();

  const topGradient = context.createLinearGradient(-18, -27, 18, -12);
  topGradient.addColorStop(0, '#d0a06a');
  topGradient.addColorStop(1, '#8d5a34');
  context.fillStyle = topGradient;
  context.beginPath();
  context.moveTo(-25, -13); context.lineTo(-15, -26); context.lineTo(22, -26); context.lineTo(25, -13);
  context.closePath(); context.fill();
  context.strokeStyle = '#5a3a22'; context.lineWidth = 1.4; context.stroke();

  context.fillStyle = '#5b3a23';
  context.beginPath();
  context.moveTo(25, -13); context.lineTo(22, -26); context.lineTo(23, 23); context.lineTo(25, 23);
  context.closePath(); context.fill();

  const frontGradient = context.createLinearGradient(-24, -12, 24, 24);
  frontGradient.addColorStop(0, '#a86d3e');
  frontGradient.addColorStop(.55, '#7e4e2d');
  frontGradient.addColorStop(1, '#59371f');
  context.fillStyle = frontGradient;
  roundRectPath(context, -25, -13, 50, 37, 3); context.fill();
  context.strokeStyle = '#432a17'; context.lineWidth = 1.5; context.stroke();

  context.fillStyle = 'rgba(255,214,160,.13)';
  context.fillRect(-22, -10, 44, 2);
  context.fillStyle = 'rgba(0,0,0,.18)';
  context.fillRect(-22, 15, 44, 2);

  context.strokeStyle = '#c28e52'; context.lineWidth = 3;
  context.beginPath();
  context.moveTo(-15, -13); context.lineTo(-15, 24);
  context.moveTo(15, -13); context.lineTo(15, 24);
  context.moveTo(-25, 3); context.lineTo(25, 3);
  context.stroke();
  context.strokeStyle = 'rgba(255,222,170,.35)'; context.lineWidth = .8;
  context.beginPath(); context.moveTo(-16.4, -12); context.lineTo(-16.4, 23); context.moveTo(13.6, -12); context.lineTo(13.6, 23); context.stroke();

  context.strokeStyle = '#d7b074'; context.lineWidth = 2;
  for (const [x, y] of [[-21, -9], [-9, -9], [9, -9], [21, -9], [-21, 20], [-9, 20], [9, 20], [21, 20]]) {
    context.beginPath(); context.arc(x, y, 1.4, 0, Math.PI * 2); context.stroke();
  }

  context.fillStyle = '#1c221c';
  roundRectPath(context, -9, 7, 18, 8, 1.5); context.fill();
  context.fillStyle = '#d8f36a';
  context.fillRect(-7, 9.5, 14, 1.4);
  context.fillStyle = 'rgba(255,255,255,.4)';
  context.fillRect(-7, 8.6, 5, .7);
  context.fillStyle = '#e7cda3';
  context.beginPath(); context.arc(-19, 11, 2.2, 0, Math.PI * 2); context.fill();
  context.fillStyle = '#8f6a42';
  context.beginPath(); context.arc(-19, 11, 1.2, 0, Math.PI * 2); context.fill();
}
function drawDroidArt(context) {
  context.save();
  context.fillStyle = 'rgba(0,0,0,.28)';
  context.beginPath(); context.ellipse(1, 30, 19, 4.5, 0, 0, Math.PI * 2); context.fill();
  context.restore();

  const limb = '#7f6c4f', limbLight = '#b59a6f';
  context.lineCap = 'round';
  context.strokeStyle = limb; context.lineWidth = 4.2;
  context.beginPath();
  context.moveTo(-5, -2); context.lineTo(-19, 10); context.lineTo(-16, 22);
  context.moveTo(5, -2); context.lineTo(19, 10); context.lineTo(16, 22);
  context.stroke();
  context.strokeStyle = limbLight; context.lineWidth = 2.6;
  context.beginPath();
  context.moveTo(-5, -3.4); context.lineTo(-19, 8.6); context.moveTo(5, -3.4); context.lineTo(19, 8.6);
  context.stroke();

  context.strokeStyle = limb; context.lineWidth = 4.6;
  context.beginPath();
  context.moveTo(-4, 15); context.lineTo(-9, 27); context.lineTo(-15, 30);
  context.moveTo(4, 15); context.lineTo(9, 27); context.lineTo(15, 30);
  context.stroke();
  context.fillStyle = '#4f4432';
  for (const [x, y] of [[-19, 10], [19, 10], [-9, 27], [9, 27], [-15, 30], [15, 30]]) {
    context.beginPath(); context.arc(x, y, 2.2, 0, Math.PI * 2); context.fill();
  }

  const torsoGradient = context.createLinearGradient(-8, -4, 8, 18);
  torsoGradient.addColorStop(0, '#d2b583');
  torsoGradient.addColorStop(.6, '#b3976b');
  torsoGradient.addColorStop(1, '#8b7351');
  context.fillStyle = torsoGradient;
  roundRectPath(context, -8, -5, 16, 22, 3.5); context.fill();
  context.strokeStyle = '#6e5a3e'; context.lineWidth = 1.2; context.stroke();
  context.fillStyle = '#4b3f2d';
  roundRectPath(context, -6, -1, 12, 5, 1.5); context.fill();
  context.fillStyle = '#d8f36a';
  context.fillRect(-5, .4, 10, 1.2);
  context.fillStyle = '#8b7351';
  for (let i = 0; i < 3; i++) context.fillRect(-5, 8 + i * 3, 10, 1.2);
  context.fillStyle = '#6e5a3e';
  roundRectPath(context, -9, 2, 3, 10, 1.5); context.fill();
  roundRectPath(context, 6, 2, 3, 10, 1.5); context.fill();

  context.strokeStyle = '#6e5a3e'; context.lineWidth = 3;
  context.beginPath(); context.moveTo(-3, -5); context.lineTo(-3, -11); context.moveTo(3, -5); context.lineTo(3, -11); context.stroke();

  const headGradient = context.createLinearGradient(0, -30, 0, -13);
  headGradient.addColorStop(0, '#e0c594');
  headGradient.addColorStop(1, '#a98c62');
  context.fillStyle = headGradient;
  context.beginPath();
  context.moveTo(-8, -13);
  context.quadraticCurveTo(-9, -27, 0, -29);
  context.quadraticCurveTo(9, -27, 8, -13);
  context.lineTo(5, -11); context.lineTo(-5, -11);
  context.closePath(); context.fill();
  context.strokeStyle = '#6e5a3e'; context.lineWidth = 1.3; context.stroke();

  context.fillStyle = '#2a2f2c';
  roundRectPath(context, -6, -24, 12, 4, 1.5); context.fill();
  context.fillStyle = '#e8d3aa';
  context.fillRect(-4.5, -22.8, 3, 1.5);
  context.fillRect(1.5, -22.8, 3, 1.5);
  context.fillStyle = '#d8f36a';
  context.fillRect(-1.4, -18, 2.8, 1.2);

  context.strokeStyle = '#8b7351'; context.lineWidth = 1.8;
  context.beginPath(); context.moveTo(0, -29); context.lineTo(0, -33); context.stroke();
  context.fillStyle = '#d8f36a';
  context.beginPath(); context.arc(0, -33.5, 1.3, 0, Math.PI * 2); context.fill();
  context.fillStyle = '#c8ad7c';
  roundRectPath(context, -11, -2, 3.5, 7, 1.5); context.fill();
  context.fillStyle = '#6e5a3e';
  context.fillRect(-10.4, 0, 2.3, 1.2);
}
function drawHelmetArt(context) {
  context.save();
  context.fillStyle = 'rgba(0,0,0,.26)';
  context.beginPath(); context.ellipse(1, 24, 24, 5, 0, 0, Math.PI * 2); context.fill();
  context.restore();

  const domeGradient = context.createLinearGradient(-18, -25, 20, 16);
  domeGradient.addColorStop(0, '#ffffff');
  domeGradient.addColorStop(.45, '#dde1d8');
  domeGradient.addColorStop(1, '#9fa79d');
  context.fillStyle = domeGradient;
  context.beginPath();
  context.moveTo(-25, 9);
  context.bezierCurveTo(-25, -13, -14, -27, 0, -27);
  context.bezierCurveTo(14, -27, 25, -13, 25, 9);
  context.lineTo(18, 15); context.lineTo(-18, 15);
  context.closePath(); context.fill();
  context.strokeStyle = '#727b73'; context.lineWidth = 1.4; context.stroke();

  context.fillStyle = 'rgba(255,255,255,.75)';
  context.beginPath(); context.ellipse(-7, -18, 7, 4, -.35, 0, Math.PI * 2); context.fill();

  context.fillStyle = '#1b201d';
  context.beginPath();
  context.moveTo(-23, -7); context.lineTo(-14, -13); context.lineTo(0, -14); context.lineTo(14, -13); context.lineTo(23, -7);
  context.lineTo(21, -1); context.lineTo(-21, -1);
  context.closePath(); context.fill();

  context.fillStyle = '#101412';
  context.beginPath(); context.moveTo(-19, -5); context.lineTo(-7, -9); context.lineTo(-5, -2); context.lineTo(-16, 0); context.closePath(); context.fill();
  context.beginPath(); context.moveTo(19, -5); context.lineTo(7, -9); context.lineTo(5, -2); context.lineTo(16, 0); context.closePath(); context.fill();
  context.fillStyle = 'rgba(110,232,255,.28)';
  context.beginPath(); context.moveTo(-17, -4.2); context.lineTo(-9, -7.2); context.lineTo(-8, -3.8); context.lineTo(-15, -1.4); context.closePath(); context.fill();
  context.beginPath(); context.moveTo(17, -4.2); context.lineTo(9, -7.2); context.lineTo(8, -3.8); context.lineTo(15, -1.4); context.closePath(); context.fill();

  context.fillStyle = '#2f3833';
  roundRectPath(context, -10, 5, 20, 5, 2); context.fill();
  context.fillStyle = '#1b201d';
  for (let i = 0; i < 4; i++) context.fillRect(-8 + i * 4.5, 6.2, 2.2, 2.6);
  context.fillStyle = '#6c756d';
  for (let i = 0; i < 5; i++) context.fillRect(-16 + i * 8, 13, 5, 2.4);

  context.strokeStyle = '#8c948c'; context.lineWidth = 1.6;
  context.beginPath();
  context.moveTo(-21, 1); context.lineTo(-24, 10);
  context.moveTo(21, 1); context.lineTo(24, 10);
  context.stroke();
  context.fillStyle = '#7e877f';
  context.beginPath(); context.arc(-22, 4, 3, 0, Math.PI * 2); context.fill();
  context.beginPath(); context.arc(22, 4, 3, 0, Math.PI * 2); context.fill();
  context.fillStyle = '#4a524b';
  context.beginPath(); context.arc(-22, 4, 1.2, 0, Math.PI * 2); context.fill();
  context.beginPath(); context.arc(22, 4, 1.2, 0, Math.PI * 2); context.fill();
}
function drawBarrelArt(context) {
  context.save();
  context.fillStyle = 'rgba(0,0,0,.26)';
  context.beginPath(); context.ellipse(1, 30, 16, 4.5, 0, 0, Math.PI * 2); context.fill();
  context.restore();

  const bodyGradient = context.createLinearGradient(-18, 0, 18, 0);
  bodyGradient.addColorStop(0, '#3d4744');
  bodyGradient.addColorStop(.28, '#9ba7a1');
  bodyGradient.addColorStop(.5, '#c8d2cb');
  bodyGradient.addColorStop(.74, '#75807b');
  bodyGradient.addColorStop(1, '#343d3a');
  context.fillStyle = bodyGradient;
  roundRectPath(context, -17, -28, 34, 56, 7); context.fill();
  context.strokeStyle = '#2a322f'; context.lineWidth = 1.4; context.stroke();

  context.fillStyle = '#242c29';
  roundRectPath(context, -19, -28, 38, 6, 3); context.fill();
  roundRectPath(context, -19, 22, 38, 6, 3); context.fill();
  context.fillStyle = '#4f5a56';
  context.fillRect(-16, -27, 32, 1.6);
  context.fillRect(-16, 25, 32, 1.2);

  context.fillStyle = '#121815';
  roundRectPath(context, -9, -9, 18, 20, 3); context.fill();
  const coreGradient = context.createLinearGradient(0, -7, 0, 9);
  coreGradient.addColorStop(0, '#d8ffff');
  coreGradient.addColorStop(.45, '#6fe8ff');
  coreGradient.addColorStop(1, '#1b6b7a');
  context.fillStyle = coreGradient;
  roundRectPath(context, -6.5, -6.5, 13, 15, 2); context.fill();
  context.fillStyle = 'rgba(255,255,255,.85)';
  roundRectPath(context, -3, -4, 6, 9, 2); context.fill();
  context.strokeStyle = 'rgba(111,232,255,.55)'; context.lineWidth = 2;
  context.beginPath(); context.arc(0, 1, 12, 0, Math.PI * 2); context.stroke();

  context.fillStyle = '#2c3431';
  for (const y of [-18, 17]) context.fillRect(-18, y, 36, 3.2);
  context.save();
  roundRectPath(context, -17, -28, 34, 56, 7); context.clip();
  context.fillStyle = '#d8f36a';
  context.save(); context.translate(0, 17); context.rotate(-.55); context.fillRect(-28, 0, 56, 6); context.restore();
  context.fillStyle = '#20251f';
  context.save(); context.translate(0, 17); context.rotate(-.55); context.fillRect(-28, 0, 56, 2); context.restore();
  context.restore();

  context.fillStyle = '#20251f';
  context.beginPath(); context.arc(0, -23, 5.5, 0, Math.PI * 2); context.fill();
  context.fillStyle = '#6fe8ff';
  context.beginPath(); context.arc(0, -23, 2.4, 0, Math.PI * 2); context.fill();
  context.strokeStyle = '#aab5af'; context.lineWidth = 2;
  context.beginPath(); context.moveTo(0, -28); context.lineTo(0, -31); context.stroke();
  context.fillStyle = '#d8f36a';
  context.beginPath(); context.arc(0, -31.5, 1.2, 0, Math.PI * 2); context.fill();
  context.strokeStyle = '#59645f'; context.lineWidth = 2;
  context.beginPath(); context.moveTo(-15, 8); context.lineTo(-21, 14); context.lineTo(-19, 21); context.stroke();
  context.beginPath(); context.moveTo(15, 8); context.lineTo(21, 14); context.lineTo(19, 21); context.stroke();
}
function drawProbeArt(context, time) {
  context.save();
  context.fillStyle = 'rgba(0,0,0,.26)';
  context.beginPath(); context.ellipse(1, 29, 18, 4.5, 0, 0, Math.PI * 2); context.fill();
  context.restore();

  context.strokeStyle = '#4f5a55'; context.lineWidth = 2.6; context.lineCap = 'round';
  context.beginPath();
  context.moveTo(-12, 0); context.lineTo(-22, 8); context.lineTo(-24, 20);
  context.moveTo(12, 0); context.lineTo(22, 8); context.lineTo(24, 20);
  context.moveTo(-8, 12); context.lineTo(-14, 23); context.lineTo(-11, 29);
  context.moveTo(8, 12); context.lineTo(14, 23); context.lineTo(11, 29);
  context.moveTo(-4, -15); context.lineTo(-9, -25);
  context.moveTo(4, -15); context.lineTo(9, -25);
  context.stroke();
  context.fillStyle = '#7d8983';
  for (const [x, y] of [[-22, 8], [22, 8], [-14, 23], [14, 23], [-9, -25], [9, -25]]) {
    context.beginPath(); context.arc(x, y, 1.8, 0, Math.PI * 2); context.fill();
  }

  const bodyGradient = context.createRadialGradient(-5, -5, 2, 0, 0, 20);
  bodyGradient.addColorStop(0, '#5c6962');
  bodyGradient.addColorStop(.55, '#2e3732');
  bodyGradient.addColorStop(1, '#121714');
  context.fillStyle = bodyGradient;
  context.beginPath(); context.arc(0, 0, 18, 0, Math.PI * 2); context.fill();
  context.strokeStyle = '#65726b'; context.lineWidth = 1.8;
  context.beginPath(); context.arc(0, 0, 18, 0, Math.PI * 2); context.stroke();

  context.strokeStyle = 'rgba(160,175,165,.3)'; context.lineWidth = 1;
  context.beginPath(); context.arc(0, 0, 13, .4, 2.3); context.stroke();
  context.beginPath(); context.arc(0, 0, 9, 3.4, 5.6); context.stroke();
  context.fillStyle = '#1c2320';
  for (const [x, y, r] of [[-11, -8, 2.2], [10, 8, 2], [-10, 10, 1.8], [12, -8, 1.8]]) {
    context.beginPath(); context.arc(x, y, r, 0, Math.PI * 2); context.fill();
  }

  const glow = .6 + .4 * Math.sin(time * 5);
  context.save();
  context.shadowColor = '#ff4d4d'; context.shadowBlur = 14 + glow * 10;
  context.fillStyle = `rgba(255,74,62,${.7 + glow * .3})`;
  context.beginPath(); context.arc(0, -1, 5.8, 0, Math.PI * 2); context.fill();
  context.restore();
  context.fillStyle = '#fff';
  context.beginPath(); context.arc(-1.6, -2.4, 1.7, 0, Math.PI * 2); context.fill();
  context.fillStyle = '#111614';
  context.beginPath(); context.arc(0, -1, 2.2, 0, Math.PI * 2); context.fill();

  context.fillStyle = '#d8f36a';
  context.fillRect(-7, 12, 14, 2);
  context.fillStyle = '#0f1412';
  context.fillRect(-4, 13, 2, 1);
  context.fillRect(2, 13, 2, 1);
}
function drawHolocronArt(context, time) {
  context.save();
  const glow = context.createRadialGradient(0, 0, 2, 0, 0, 32);
  glow.addColorStop(0, 'rgba(143,245,255,.32)');
  glow.addColorStop(.55, 'rgba(143,245,255,.1)');
  glow.addColorStop(1, 'rgba(143,245,255,0)');
  context.fillStyle = glow;
  context.beginPath(); context.arc(0, 0, 32, 0, Math.PI * 2); context.fill();
  context.restore();

  context.save();
  context.shadowColor = '#8ff5ff'; context.shadowBlur = 12;
  context.fillStyle = 'rgba(83,210,224,.32)';
  context.beginPath(); context.moveTo(-18, -14); context.lineTo(-4, -24); context.lineTo(18, -15); context.lineTo(18, 13); context.lineTo(4, 23); context.lineTo(-18, 14); context.closePath(); context.fill();
  context.restore();

  context.fillStyle = '#d8b56a';
  context.beginPath(); context.moveTo(-18, -14); context.lineTo(-4, -24); context.lineTo(18, -15); context.lineTo(4, -5); context.closePath(); context.fill();
  context.fillStyle = '#b48f4d';
  context.beginPath(); context.moveTo(18, -15); context.lineTo(18, 13); context.lineTo(4, 23); context.lineTo(4, -5); context.closePath(); context.fill();
  context.fillStyle = '#8f6d39';
  context.beginPath(); context.moveTo(-18, -14); context.lineTo(4, -5); context.lineTo(4, 23); context.lineTo(-18, 14); context.closePath(); context.fill();

  context.fillStyle = 'rgba(105,236,245,.5)';
  context.beginPath(); context.moveTo(-14, -11); context.lineTo(-4, -18); context.lineTo(13, -12); context.lineTo(3, -6); context.closePath(); context.fill();
  context.beginPath(); context.moveTo(-14, -6); context.lineTo(1, 1); context.lineTo(1, 17); context.lineTo(-14, 11); context.closePath(); context.fill();
  context.beginPath(); context.moveTo(14, -10); context.lineTo(14, 10); context.lineTo(6, 16); context.lineTo(6, -3); context.closePath(); context.fill();

  context.strokeStyle = '#f0d48e'; context.lineWidth = 1.8;
  context.beginPath();
  context.moveTo(-18, -14); context.lineTo(-4, -24); context.lineTo(18, -15); context.lineTo(18, 13); context.lineTo(4, 23); context.lineTo(-18, 14); context.closePath();
  context.moveTo(-4, -24); context.lineTo(4, -5); context.lineTo(4, 23);
  context.moveTo(4, -5); context.lineTo(18, -15);
  context.moveTo(-18, -14); context.lineTo(4, -5);
  context.moveTo(-18, 14); context.lineTo(4, -5);
  context.stroke();

  context.fillStyle = '#fff8d8';
  context.beginPath(); context.arc(0, -3, 3.2, 0, Math.PI * 2); context.fill();
  context.save();
  context.shadowColor = '#8ff5ff'; context.shadowBlur = 14;
  context.strokeStyle = 'rgba(143,245,255,.8)'; context.lineWidth = 1.2;
  context.beginPath(); context.arc(0, -3, 6 + Math.sin(time * 2) * 1.4, 0, Math.PI * 2); context.stroke();
  context.restore();

  for (const [x, y, s] of [[-24, -18, 2.2], [24, 8, 1.8], [-20, 21, 1.6], [23, -22, 1.4]]) {
    context.fillStyle = '#8ff5ff';
    context.save(); context.shadowColor = '#8ff5ff'; context.shadowBlur = 8;
    context.fillRect(x, y, s, s); context.restore();
  }
}
function drawAstromechArt(context) {
  context.save();
  context.fillStyle = 'rgba(0,0,0,.26)';
  context.beginPath(); context.ellipse(1, 25, 23, 5, 0, 0, Math.PI * 2); context.fill();
  context.restore();

  const domeGradient = context.createLinearGradient(-22, -22, 22, 12);
  domeGradient.addColorStop(0, '#eef3f0');
  domeGradient.addColorStop(.4, '#b8c5c6');
  domeGradient.addColorStop(1, '#6f7d80');
  context.fillStyle = domeGradient;
  context.beginPath(); context.arc(0, 10, 23, Math.PI, 0); context.closePath(); context.fill();
  context.strokeStyle = '#4f5c5e'; context.lineWidth = 1.5; context.stroke();

  context.fillStyle = '#6d7c80';
  roundRectPath(context, -24, 7, 48, 9, 4); context.fill();
  context.strokeStyle = '#394447'; context.lineWidth = 1.2; context.stroke();
  context.fillStyle = '#aab7b8';
  for (let i = 0; i < 7; i++) { context.beginPath(); context.arc(-18 + i * 6, 11.5, 1.1, 0, Math.PI * 2); context.fill(); }

  context.fillStyle = '#2f6d8c';
  context.beginPath(); context.moveTo(-21, 2); context.lineTo(-12, -12); context.lineTo(-4, -10); context.lineTo(-10, 3); context.closePath(); context.fill();
  context.beginPath(); context.moveTo(8, -15); context.lineTo(18, -6); context.lineTo(16, 3); context.lineTo(7, -3); context.closePath(); context.fill();
  context.beginPath(); context.moveTo(-2, -20); context.lineTo(5, -21); context.lineTo(7, -14); context.lineTo(0, -12); context.closePath(); context.fill();
  context.fillStyle = '#3f89ad';
  context.fillRect(-16, 4, 10, 3);
  context.fillRect(9, -4, 7, 2.6);

  context.fillStyle = '#151b1d';
  context.beginPath(); context.arc(0, -5, 7, 0, Math.PI * 2); context.fill();
  context.fillStyle = '#20282a';
  context.beginPath(); context.arc(0, -5, 5.4, 0, Math.PI * 2); context.fill();
  context.save();
  context.shadowColor = '#ff4d4d'; context.shadowBlur = 12;
  context.fillStyle = '#ff4d4d';
  context.beginPath(); context.arc(0, -5, 3.4, 0, Math.PI * 2); context.fill();
  context.restore();
  context.fillStyle = '#ffd7d2';
  context.beginPath(); context.arc(-1, -6.4, 1.1, 0, Math.PI * 2); context.fill();

  context.strokeStyle = '#9aa8a9'; context.lineWidth = 1.8;
  context.beginPath(); context.moveTo(7, -18); context.lineTo(9, -28); context.stroke();
  context.fillStyle = '#d8f36a';
  context.beginPath(); context.arc(9, -29, 1.4, 0, Math.PI * 2); context.fill();
  context.strokeStyle = '#5f6c6e'; context.lineWidth = 1.2;
  context.beginPath(); context.arc(0, 10, 18, Math.PI * 1.1, Math.PI * 1.9); context.stroke();
}
function drawBlasterArt(context) {
  context.save();
  context.fillStyle = 'rgba(0,0,0,.26)';
  context.beginPath(); context.ellipse(0, 16, 27, 4.5, 0, 0, Math.PI * 2); context.fill();
  context.restore();

  const bodyGradient = context.createLinearGradient(0, -10, 0, 10);
  bodyGradient.addColorStop(0, '#59645f');
  bodyGradient.addColorStop(.45, '#2c3531');
  bodyGradient.addColorStop(1, '#151b18');
  context.fillStyle = bodyGradient;
  roundRectPath(context, -28, -5, 48, 11, 2.5); context.fill();
  context.strokeStyle = '#0d1210'; context.lineWidth = 1.3; context.stroke();

  context.fillStyle = '#202824';
  roundRectPath(context, 14, -3.2, 15, 5.4, 1.5); context.fill();
  context.fillStyle = '#68746e';
  context.fillRect(17, -2.2, 12, 1);
  context.fillStyle = '#0e1311';
  roundRectPath(context, 27, -3.8, 3, 6.6, 1); context.fill();

  context.fillStyle = '#343d39';
  roundRectPath(context, -24, -9, 18, 5, 2); context.fill();
  context.strokeStyle = '#75817b'; context.lineWidth = 1;
  context.strokeRect(-22, -8, 14, 2.6);

  context.fillStyle = '#1b221f';
  roundRectPath(context, -10, -14, 16, 8, 2.5); context.fill();
  context.fillStyle = '#3d4843';
  roundRectPath(context, -8, -12.5, 12, 5, 1.8); context.fill();
  context.fillStyle = '#0e1311';
  context.beginPath(); context.arc(7, -9.5, 3, 0, Math.PI * 2); context.fill();
  context.fillStyle = 'rgba(111,232,255,.55)';
  context.beginPath(); context.arc(7, -9.5, 1.8, 0, Math.PI * 2); context.fill();
  context.fillStyle = '#111614';
  roundRectPath(context, -1, -15, 3, 3, 1); context.fill();

  context.fillStyle = '#232b27';
  context.beginPath(); context.moveTo(-8, 5); context.lineTo(1, 5); context.lineTo(4, 17); context.lineTo(-4, 17); context.closePath(); context.fill();
  context.strokeStyle = '#5f6b65'; context.lineWidth = 1;
  context.beginPath(); context.moveTo(-6, 7); context.lineTo(-3, 15); context.stroke();

  context.fillStyle = '#2c3531';
  context.beginPath(); context.moveTo(-28, -4); context.lineTo(-21, -4); context.lineTo(-24, 8); context.lineTo(-30, 10); context.closePath(); context.fill();
  context.fillStyle = '#3c4641';
  context.beginPath(); context.moveTo(-27, 2); context.lineTo(-20, 2); context.lineTo(-22, 10); context.lineTo(-27, 11); context.closePath(); context.fill();

  context.fillStyle = '#d8f36a';
  context.fillRect(4, -3.5, 5, 1.5);
  context.fillStyle = 'rgba(255,255,255,.45)';
  context.fillRect(-26, -3.6, 30, .7);
}
function drawSaberArt(context) {
  context.save();
  context.fillStyle = 'rgba(0,0,0,.26)';
  context.beginPath(); context.ellipse(1, 30, 13, 4, 0, 0, Math.PI * 2); context.fill();
  context.restore();

  context.save();
  context.translate(0, 0); context.rotate(.06);
  const metalGradient = context.createLinearGradient(-8, 0, 8, 0);
  metalGradient.addColorStop(0, '#4c5652');
  metalGradient.addColorStop(.28, '#c3ccc5');
  metalGradient.addColorStop(.5, '#eef2e9');
  metalGradient.addColorStop(.76, '#8b9690');
  metalGradient.addColorStop(1, '#3b4541');
  context.fillStyle = metalGradient;
  roundRectPath(context, -6.5, -20, 13, 42, 4); context.fill();
  context.strokeStyle = '#2a332f'; context.lineWidth = 1.2; context.stroke();

  context.fillStyle = '#202824';
  roundRectPath(context, -8, -23, 16, 5, 2); context.fill();
  context.fillStyle = '#68746e';
  context.fillRect(-7, -22.2, 14, 1);
  context.fillStyle = '#b9c3bc';
  roundRectPath(context, -7.5, -28, 15, 6, 2); context.fill();
  context.fillStyle = '#202824';
  context.fillRect(-5.5, -27, 11, 2.2);
  context.fillStyle = '#d8f36a';
  context.fillRect(-1, -26.4, 2, 1.2);

  context.fillStyle = '#6b4528';
  roundRectPath(context, -7, -6, 14, 18, 3); context.fill();
  context.strokeStyle = '#9a6b3f'; context.lineWidth = 1.4;
  for (let i = 0; i < 4; i++) { context.beginPath(); context.moveTo(-7, -4 + i * 4); context.lineTo(7, -4 + i * 4); context.stroke(); }

  context.fillStyle = '#202824';
  roundRectPath(context, -6.5, 12, 13, 4, 1.5); context.fill();
  context.fillStyle = '#4f5b55';
  roundRectPath(context, -6, 16, 12, 5, 2); context.fill();
  context.fillStyle = '#151b18';
  roundRectPath(context, -5, 20, 10, 4, 1.5); context.fill();

  context.save();
  context.shadowColor = '#6fe8ff'; context.shadowBlur = 10;
  context.fillStyle = 'rgba(111,232,255,.85)';
  context.fillRect(-2.4, -12, 4.8, 5.5);
  context.restore();
  context.fillStyle = 'rgba(255,255,255,.7)';
  context.fillRect(-1.2, -11, 1.2, 3.5);

  context.fillStyle = 'rgba(255,255,255,.5)';
  context.fillRect(-5, -19, 1.4, 34);
  context.restore();
}
function drawMandoArt(context) {
  context.save();
  context.fillStyle = 'rgba(0,0,0,.26)';
  context.beginPath(); context.ellipse(1, 25, 23, 5, 0, 0, Math.PI * 2); context.fill();
  context.restore();

  const domeGradient = context.createLinearGradient(-20, -26, 20, 18);
  domeGradient.addColorStop(0, '#c3d2d8');
  domeGradient.addColorStop(.35, '#8096a1');
  domeGradient.addColorStop(.7, '#536873');
  domeGradient.addColorStop(1, '#35454e');
  context.fillStyle = domeGradient;
  context.beginPath();
  context.moveTo(-24, 9);
  context.bezierCurveTo(-24, -12, -13, -26, 0, -26);
  context.bezierCurveTo(13, -26, 24, -12, 24, 9);
  context.lineTo(18, 17); context.lineTo(9, 19); context.lineTo(-9, 19); context.lineTo(-18, 17);
  context.closePath(); context.fill();
  context.strokeStyle = '#2e3d45'; context.lineWidth = 1.5; context.stroke();

  context.fillStyle = '#1a2328';
  context.beginPath();
  context.moveTo(-17, -4); context.lineTo(-10, -11); context.lineTo(0, -12); context.lineTo(10, -11); context.lineTo(17, -4);
  context.lineTo(12, 4); context.lineTo(5, 4); context.lineTo(5, 17); context.lineTo(-5, 17); context.lineTo(-5, 4); context.lineTo(-12, 4);
  context.closePath(); context.fill();
  context.fillStyle = 'rgba(111,232,255,.18)';
  context.beginPath(); context.moveTo(-14, -3); context.lineTo(-8, -8); context.lineTo(-1, -9); context.lineTo(-1, 1); context.lineTo(-9, 1); context.closePath(); context.fill();
  context.beginPath(); context.moveTo(14, -3); context.lineTo(8, -8); context.lineTo(1, -9); context.lineTo(1, 1); context.lineTo(9, 1); context.closePath(); context.fill();

  context.fillStyle = '#2c3a42';
  context.beginPath(); context.moveTo(-22, 4); context.lineTo(-14, 0); context.lineTo(-14, 12); context.lineTo(-20, 15); context.closePath(); context.fill();
  context.beginPath(); context.moveTo(22, 4); context.lineTo(14, 0); context.lineTo(14, 12); context.lineTo(20, 15); context.closePath(); context.fill();
  context.fillStyle = '#d8f36a';
  context.fillRect(-20, 6, 4, 1.4);
  context.fillRect(16, 6, 4, 1.4);

  context.fillStyle = '#4a5d67';
  context.beginPath(); context.arc(-21, -1, 4, 0, Math.PI * 2); context.fill();
  context.beginPath(); context.arc(21, -1, 4, 0, Math.PI * 2); context.fill();
  context.fillStyle = '#202a2f';
  context.beginPath(); context.arc(-21, -1, 1.7, 0, Math.PI * 2); context.fill();
  context.beginPath(); context.arc(21, -1, 1.7, 0, Math.PI * 2); context.fill();

  context.strokeStyle = '#9fb2bc'; context.lineWidth = 2;
  context.beginPath(); context.moveTo(18, -12); context.lineTo(23, -23); context.stroke();
  context.fillStyle = '#d8f36a';
  context.beginPath(); context.arc(23, -24, 1.8, 0, Math.PI * 2); context.fill();
  context.strokeStyle = '#26343b'; context.lineWidth = 1;
  context.beginPath(); context.moveTo(-17, 14); context.lineTo(-8, 15); context.moveTo(9, 16); context.lineTo(17, 15); context.stroke();
}
function drawRemoteArt(context) {
  context.save();
  context.fillStyle = 'rgba(0,0,0,.24)';
  context.beginPath(); context.ellipse(1, 25, 17, 4, 0, 0, Math.PI * 2); context.fill();
  context.restore();

  const bodyGradient = context.createRadialGradient(-6, -7, 2, 0, 0, 20);
  bodyGradient.addColorStop(0, '#8c9891');
  bodyGradient.addColorStop(.5, '#46524c');
  bodyGradient.addColorStop(1, '#151b18');
  context.fillStyle = bodyGradient;
  context.beginPath(); context.arc(0, 0, 19, 0, Math.PI * 2); context.fill();
  context.strokeStyle = '#68756e'; context.lineWidth = 1.6;
  context.beginPath(); context.arc(0, 0, 19, 0, Math.PI * 2); context.stroke();

  context.strokeStyle = 'rgba(180,195,185,.28)'; context.lineWidth = 1;
  for (const r of [14, 9]) { context.beginPath(); context.arc(0, 0, r, .3, Math.PI * 1.7); context.stroke(); }
  context.fillStyle = '#1b2320';
  for (const [x, y] of [[-12, -8], [11, 9], [-9, 11], [13, -7]]) { context.beginPath(); context.arc(x, y, 2, 0, Math.PI * 2); context.fill(); }

  context.save();
  context.shadowColor = '#ff4d4d'; context.shadowBlur = 12;
  context.fillStyle = '#ff4d4d';
  context.beginPath(); context.arc(0, -2, 4.6, 0, Math.PI * 2); context.fill();
  context.restore();
  context.fillStyle = '#fff';
  context.beginPath(); context.arc(-1.2, -3.4, 1.2, 0, Math.PI * 2); context.fill();

  context.strokeStyle = '#8f9c95'; context.lineWidth = 1.6;
  context.beginPath(); context.moveTo(6, -17); context.lineTo(9, -26); context.stroke();
  context.fillStyle = '#d8f36a';
  context.beginPath(); context.arc(9, -27, 1.4, 0, Math.PI * 2); context.fill();
  context.fillStyle = '#6fe8ff';
  for (const [x, y] of [[-15, 4], [15, -3], [0, 18]]) { context.beginPath(); context.arc(x, y, 1.2, 0, Math.PI * 2); context.fill(); }
}
function drawXWingArt(context) {
  context.save();
  context.fillStyle = 'rgba(0,0,0,.26)';
  context.beginPath(); context.ellipse(1, 27, 24, 5, 0, 0, Math.PI * 2); context.fill();
  context.restore();

  for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
    context.fillStyle = sy < 0 ? '#d4dad2' : '#9ca8a3';
    context.beginPath();
    context.moveTo(sx * 3.5, sy * 1.8);
    context.lineTo(sx * 25, sy * 15.5);
    context.lineTo(sx * 28, sy * 21.5);
    context.lineTo(sx * 8, sy * 6.5);
    context.closePath(); context.fill();
    context.strokeStyle = '#4e5a55'; context.lineWidth = 1.1; context.stroke();
    context.strokeStyle = '#c94f42'; context.lineWidth = 2.4; context.lineCap = 'round';
    context.beginPath(); context.moveTo(sx * 11, sy * 7.5); context.lineTo(sx * 22, sy * 15.5); context.stroke();
    context.strokeStyle = 'rgba(255,255,255,.35)'; context.lineWidth = .8;
    context.beginPath(); context.moveTo(sx * 7, sy * 4.6); context.lineTo(sx * 24, sy * 17.4); context.stroke();
    context.fillStyle = '#3e4844';
    context.beginPath(); context.arc(sx * 22.5, sy * 17.6, 3.3, 0, Math.PI * 2); context.fill();
    context.fillStyle = '#e8ede6';
    context.beginPath(); context.arc(sx * 22.5, sy * 17.6, 2.1, 0, Math.PI * 2); context.fill();
    context.fillStyle = '#202723';
    context.beginPath(); context.arc(sx * 22.5, sy * 17.6, 1.1, 0, Math.PI * 2); context.fill();
    context.strokeStyle = '#b9c2ba'; context.lineWidth = 1.4;
    context.beginPath(); context.moveTo(sx * 26, sy * 19); context.lineTo(sx * 29, sy * 23); context.stroke();
    context.fillStyle = '#c94f42';
    context.beginPath(); context.arc(sx * 29, sy * 23, 1.5, 0, Math.PI * 2); context.fill();
  }

  const body = context.createLinearGradient(-7, 0, 7, 0);
  body.addColorStop(0, '#7d8983');
  body.addColorStop(.4, '#eef2e9');
  body.addColorStop(.66, '#b8c2bb');
  body.addColorStop(1, '#59645f');
  context.fillStyle = body;
  context.beginPath();
  context.moveTo(0, -27); context.lineTo(5.2, -15); context.lineTo(6.5, 16); context.lineTo(-6.5, 16); context.lineTo(-5.2, -15);
  context.closePath(); context.fill();
  context.strokeStyle = '#39433f'; context.lineWidth = 1.2; context.stroke();

  context.fillStyle = '#2e3a45';
  roundRectPath(context, -3.6, -10, 7.2, 14, 3); context.fill();
  context.fillStyle = 'rgba(120,205,255,.75)';
  roundRectPath(context, -2.6, -8.5, 5.2, 9, 2); context.fill();
  context.fillStyle = 'rgba(255,255,255,.65)';
  context.fillRect(-1.7, -7.4, 1.1, 4.2);

  context.fillStyle = '#c94f42';
  context.fillRect(-2.2, 9, 4.4, 1.8);
  context.fillRect(-2.2, 12, 4.4, 1.2);
  context.strokeStyle = '#78847d'; context.lineWidth = 1;
  context.beginPath(); context.moveTo(-4, -16); context.lineTo(-4, 14); context.moveTo(4, -16); context.lineTo(4, 14); context.stroke();
  context.fillStyle = '#d8f36a';
  context.beginPath(); context.arc(0, -24.5, 1.2, 0, Math.PI * 2); context.fill();
}
function drawTieArt(context) {
  context.save();
  context.fillStyle = 'rgba(0,0,0,.27)';
  context.beginPath(); context.ellipse(1, 28, 25, 5, 0, 0, Math.PI * 2); context.fill();
  context.restore();

  for (const side of [-1, 1]) {
    const wingGradient = context.createLinearGradient(side * 29, 0, side * 11, 0);
    wingGradient.addColorStop(0, '#313b38');
    wingGradient.addColorStop(.45, '#202824');
    wingGradient.addColorStop(1, '#4c5752');
    context.fillStyle = wingGradient;
    context.beginPath();
    context.moveTo(side * 11, -19);
    context.lineTo(side * 27, -25);
    context.lineTo(side * 29, -16);
    context.lineTo(side * 29, 16);
    context.lineTo(side * 27, 25);
    context.lineTo(side * 11, 19);
    context.closePath(); context.fill();
    context.strokeStyle = '#77837c'; context.lineWidth = 1.2; context.stroke();
    context.strokeStyle = 'rgba(160,175,165,.28)'; context.lineWidth = .9;
    context.beginPath();
    context.moveTo(side * 14, -17); context.lineTo(side * 25, -21);
    context.moveTo(side * 14, 17); context.lineTo(side * 25, 21);
    context.moveTo(side * 18, -19); context.lineTo(side * 18, 19);
    context.moveTo(side * 23, -22); context.lineTo(side * 23, 22);
    context.stroke();
  }

  context.fillStyle = '#59645f';
  roundRectPath(context, -15, -3, 30, 6, 3); context.fill();
  context.strokeStyle = '#242c29'; context.lineWidth = 1; context.stroke();

  const ball = context.createRadialGradient(-4, -5, 2, 0, 0, 13);
  ball.addColorStop(0, '#7b8881');
  ball.addColorStop(.5, '#35403b');
  ball.addColorStop(1, '#101512');
  context.fillStyle = ball;
  context.beginPath(); context.arc(0, 0, 11.5, 0, Math.PI * 2); context.fill();
  context.strokeStyle = '#9aa69e'; context.lineWidth = 1.4;
  context.beginPath(); context.arc(0, 0, 11.5, 0, Math.PI * 2); context.stroke();

  context.fillStyle = '#0d161b';
  context.beginPath(); context.arc(0, -1, 7.4, 0, Math.PI * 2); context.fill();
  context.fillStyle = 'rgba(93,180,230,.42)';
  context.beginPath(); context.arc(0, -1, 5.2, 0, Math.PI * 2); context.fill();
  context.strokeStyle = '#9fd8ff'; context.lineWidth = 1;
  context.beginPath();
  context.moveTo(0, -6); context.lineTo(4.8, -3.4); context.lineTo(4.8, 1.4); context.lineTo(0, 4); context.lineTo(-4.8, 1.4); context.lineTo(-4.8, -3.4); context.closePath(); context.stroke();
  context.fillStyle = 'rgba(255,255,255,.65)';
  context.beginPath(); context.arc(-1.8, -2.6, 1.1, 0, Math.PI * 2); context.fill();

  context.fillStyle = '#d8f36a';
  context.fillRect(-3, 10.5, 6, 1.2);
  context.fillStyle = '#202824';
  context.fillRect(-5.5, 13, 11, 2);
}
function drawVaderArt(context) {
  context.save();
  context.fillStyle = 'rgba(0,0,0,.3)';
  context.beginPath(); context.ellipse(1, 25, 24, 5, 0, 0, Math.PI * 2); context.fill();
  context.restore();

  const dome = context.createLinearGradient(-20, -27, 18, 15);
  dome.addColorStop(0, '#5f6864');
  dome.addColorStop(.32, '#222a27');
  dome.addColorStop(.74, '#0e1311');
  dome.addColorStop(1, '#030504');
  context.fillStyle = dome;
  context.beginPath();
  context.moveTo(-24, 8);
  context.bezierCurveTo(-24, -14, -13, -28, 0, -28);
  context.bezierCurveTo(13, -28, 24, -14, 24, 8);
  context.lineTo(19, 16); context.lineTo(13, 13); context.lineTo(8, 17);
  context.lineTo(0, 14); context.lineTo(-8, 17); context.lineTo(-13, 13); context.lineTo(-19, 16);
  context.closePath(); context.fill();
  context.strokeStyle = '#5e6964'; context.lineWidth = 1.4; context.stroke();

  context.fillStyle = 'rgba(255,255,255,.15)';
  context.beginPath(); context.ellipse(-7, -18, 8, 4.2, -.32, 0, Math.PI * 2); context.fill();

  context.fillStyle = '#060807';
  context.beginPath();
  context.moveTo(-22, -6); context.lineTo(-12, -12); context.lineTo(0, -13); context.lineTo(12, -12); context.lineTo(22, -6);
  context.lineTo(18, 1); context.lineTo(9, 4); context.lineTo(0, 2); context.lineTo(-9, 4); context.lineTo(-18, 1);
  context.closePath(); context.fill();

  context.save();
  context.shadowColor = '#ff3a32'; context.shadowBlur = 9;
  context.fillStyle = '#ff3a32';
  context.beginPath(); context.moveTo(-19, -6); context.lineTo(-8, -10); context.lineTo(-6, -4); context.lineTo(-16, -1); context.closePath(); context.fill();
  context.beginPath(); context.moveTo(19, -6); context.lineTo(8, -10); context.lineTo(6, -4); context.lineTo(16, -1); context.closePath(); context.fill();
  context.restore();
  context.fillStyle = 'rgba(255,225,220,.65)';
  context.beginPath(); context.moveTo(-17, -5.6); context.lineTo(-11, -8); context.lineTo(-10, -5); context.lineTo(-15.4, -2.6); context.closePath(); context.fill();
  context.beginPath(); context.moveTo(17, -5.6); context.lineTo(11, -8); context.lineTo(10, -5); context.lineTo(15.4, -2.6); context.closePath(); context.fill();

  context.fillStyle = '#2a312e';
  context.beginPath(); context.moveTo(-10, 6); context.lineTo(10, 6); context.lineTo(6, 14); context.lineTo(-6, 14); context.closePath(); context.fill();
  context.fillStyle = '#0a0d0c';
  for (let i = 0; i < 4; i++) context.fillRect(-7 + i * 3.6, 8, 2.1, 4.5);
  context.fillStyle = '#59645f';
  context.fillRect(-17, 16, 34, 2.4);
  context.fillStyle = '#1b2320';
  for (let i = 0; i < 5; i++) context.fillRect(-15 + i * 6.5, 16.7, 4, 1);
}
function drawProtocolArt(context) {
  context.save();
  context.fillStyle = 'rgba(0,0,0,.26)';
  context.beginPath(); context.ellipse(1, 25, 19, 5, 0, 0, Math.PI * 2); context.fill();
  context.restore();

  const gold = context.createLinearGradient(-10, 0, 10, 0);
  gold.addColorStop(0, '#8f6d39');
  gold.addColorStop(.35, '#f0d48e');
  gold.addColorStop(.6, '#d8b56a');
  gold.addColorStop(1, '#7b5a2d');

  context.strokeStyle = '#a98c62'; context.lineWidth = 4.2; context.lineCap = 'round';
  context.beginPath(); context.moveTo(-7, 2); context.lineTo(-15, 12); context.lineTo(-13, 21);
  context.moveTo(7, 2); context.lineTo(15, 12); context.lineTo(13, 21); context.stroke();
  context.strokeStyle = '#dfc38a'; context.lineWidth = 2.2;
  context.beginPath(); context.moveTo(-7, 1); context.lineTo(-15, 10); context.moveTo(7, 1); context.lineTo(15, 10); context.stroke();

  context.fillStyle = gold;
  roundRectPath(context, -8, -4, 16, 22, 4); context.fill();
  context.strokeStyle = '#6d5229'; context.lineWidth = 1.1; context.stroke();
  context.fillStyle = '#b8c2bb';
  roundRectPath(context, -8.4, 9, 16.8, 4, 1.5); context.fill();
  context.fillStyle = '#8f9a93';
  context.fillRect(-7.4, 10, 14.8, 1);
  context.strokeStyle = '#b8c2bb'; context.lineWidth = 1;
  context.beginPath(); context.moveTo(-4, -2); context.lineTo(-4, 8); context.moveTo(4, -2); context.lineTo(4, 8); context.stroke();
  context.fillStyle = '#6d5229';
  context.fillRect(-6, 4, 12, 2.2);
  context.fillStyle = '#f0d48e';
  context.beginPath(); context.arc(-9, 3, 2.4, 0, Math.PI * 2); context.fill();
  context.beginPath(); context.arc(9, 3, 2.4, 0, Math.PI * 2); context.fill();

  context.strokeStyle = '#a98c62'; context.lineWidth = 3;
  context.beginPath(); context.moveTo(-3, -4); context.lineTo(-3, -10); context.moveTo(3, -4); context.lineTo(3, -10); context.stroke();

  const head = context.createLinearGradient(-10, -26, 10, -10);
  head.addColorStop(0, '#f3dda4');
  head.addColorStop(.55, '#d8b56a');
  head.addColorStop(1, '#96723d');
  context.fillStyle = head;
  context.beginPath();
  context.moveTo(-9, -12);
  context.quadraticCurveTo(-9, -27, 0, -28);
  context.quadraticCurveTo(9, -27, 9, -12);
  context.lineTo(5, -9); context.lineTo(-5, -9);
  context.closePath(); context.fill();
  context.strokeStyle = '#6d5229'; context.lineWidth = 1.2; context.stroke();

  context.fillStyle = '#2a1e0d';
  roundRectPath(context, -6.5, -21, 13, 5, 2); context.fill();
  context.fillStyle = '#ff6b3d';
  context.beginPath(); context.arc(-3, -18.5, 1.6, 0, Math.PI * 2); context.fill();
  context.beginPath(); context.arc(3, -18.5, 1.6, 0, Math.PI * 2); context.fill();
  context.fillStyle = 'rgba(255,255,255,.75)';
  context.beginPath(); context.arc(-3.6, -19.1, .55, 0, Math.PI * 2); context.fill();
  context.beginPath(); context.arc(2.4, -19.1, .55, 0, Math.PI * 2); context.fill();
  context.fillStyle = '#6d5229';
  context.fillRect(-3, -14.4, 6, 1.2);
  context.strokeStyle = '#a98c62'; context.lineWidth = 1.5;
  context.beginPath(); context.moveTo(0, -28); context.lineTo(0, -31); context.stroke();
  context.fillStyle = '#ff6b3d';
  context.beginPath(); context.arc(0, -31.5, 1.1, 0, Math.PI * 2); context.fill();
  context.strokeStyle = '#75582b'; context.lineWidth = 1;
  context.beginPath(); context.moveTo(-7, 17); context.lineTo(-5, 23); context.moveTo(7, 17); context.lineTo(5, 23); context.stroke();
}
function drawDestroyerArt(context) {
  context.save();
  context.fillStyle = 'rgba(0,0,0,.24)';
  context.beginPath(); context.ellipse(1, 24, 28, 4.5, 0, 0, Math.PI * 2); context.fill();
  context.restore();

  const hull = context.createLinearGradient(-28, -24, 20, 24);
  hull.addColorStop(0, '#c3ccc5');
  hull.addColorStop(.42, '#8b9690');
  hull.addColorStop(.72, '#59645f');
  hull.addColorStop(1, '#2e3732');
  context.fillStyle = hull;
  context.beginPath();
  context.moveTo(0, -27);
  context.lineTo(28, 21);
  context.lineTo(10, 17);
  context.lineTo(5, 22);
  context.lineTo(-5, 22);
  context.lineTo(-10, 17);
  context.lineTo(-28, 21);
  context.closePath(); context.fill();
  context.strokeStyle = '#202824'; context.lineWidth = 1.2; context.stroke();

  context.strokeStyle = 'rgba(25,33,29,.45)'; context.lineWidth = .8;
  context.beginPath();
  context.moveTo(0, -22); context.lineTo(0, 12);
  context.moveTo(-8, 4); context.lineTo(8, 4);
  context.moveTo(-13, 10); context.lineTo(13, 10);
  context.moveTo(-18, 15); context.lineTo(18, 15);
  context.stroke();
  context.strokeStyle = 'rgba(255,255,255,.28)';
  context.beginPath(); context.moveTo(-3, -25); context.lineTo(-25, 19); context.stroke();

  context.fillStyle = '#4f5b55';
  roundRectPath(context, -6, 5, 12, 6, 1.5); context.fill();
  context.fillStyle = '#242c29';
  roundRectPath(context, -4, 3, 8, 4, 1); context.fill();
  context.fillStyle = '#b9c3bc';
  context.fillRect(-7, 4, 14, 1);
  context.strokeStyle = '#68746e'; context.lineWidth = 1;
  context.beginPath(); context.moveTo(0, 2); context.lineTo(0, -12); context.stroke();
  context.fillStyle = '#8f9a93';
  context.beginPath(); context.arc(0, -12, 1.8, 0, Math.PI * 2); context.fill();

  context.save();
  context.shadowColor = '#6fe8ff'; context.shadowBlur = 8;
  context.fillStyle = 'rgba(111,232,255,.85)';
  for (const x of [-7, -2.4, 2.4, 7]) context.fillRect(x - 1.2, 18.5, 2.4, 2.4);
  context.restore();
  context.fillStyle = '#d8f36a';
  context.fillRect(-11, 19.6, 22, 1.1);
}
function drawDarksaberArt(context) {
  context.save();
  context.fillStyle = 'rgba(0,0,0,.28)';
  context.beginPath(); context.ellipse(1, 29, 12, 4, 0, 0, Math.PI * 2); context.fill();
  context.restore();

  context.save();
  context.translate(0, 1); context.rotate(.08);
  context.save();
  context.shadowColor = '#8ff5ff'; context.shadowBlur = 8;
  context.fillStyle = 'rgba(143,245,255,.1)';
  roundRectPath(context, -5.2, -27, 10.4, 42, 2); context.fill();
  context.restore();

  const blade = context.createLinearGradient(-4.8, 0, 4.8, 0);
  blade.addColorStop(0, '#1b2320');
  blade.addColorStop(.3, '#090d0b');
  blade.addColorStop(.7, '#050706');
  blade.addColorStop(1, '#161d1a');
  context.fillStyle = blade;
  context.beginPath();
  context.moveTo(0, -29); context.lineTo(4.9, -23); context.lineTo(4.4, 16); context.lineTo(-4.4, 16); context.lineTo(-4.9, -23);
  context.closePath(); context.fill();
  context.strokeStyle = 'rgba(240,255,255,.95)'; context.lineWidth = 1.25;
  context.beginPath();
  context.moveTo(0, -28); context.lineTo(4.4, -22.6); context.lineTo(4, 15); context.moveTo(0, -28); context.lineTo(-4.4, -22.6); context.lineTo(-4, 15);
  context.stroke();
  context.strokeStyle = 'rgba(143,245,255,.52)'; context.lineWidth = .7;
  context.beginPath(); context.moveTo(0, -24); context.lineTo(0, 13); context.stroke();
  context.fillStyle = 'rgba(255,255,255,.13)';
  context.fillRect(-2.8, -21, 1.2, 30);

  const hilt = context.createLinearGradient(-6, 0, 6, 0);
  hilt.addColorStop(0, '#4c5652');
  hilt.addColorStop(.28, '#d4dcd5');
  hilt.addColorStop(.55, '#8b9690');
  hilt.addColorStop(1, '#2b332f');
  context.fillStyle = hilt;
  roundRectPath(context, -5.5, 15, 11, 14, 3); context.fill();
  context.strokeStyle = '#1c2320'; context.lineWidth = 1; context.stroke();
  context.fillStyle = '#202824';
  roundRectPath(context, -6.5, 15, 13, 3, 1.5); context.fill();
  context.fillStyle = '#d8f36a';
  context.fillRect(-4, 21, 8, 1.4);
  context.fillStyle = '#141917';
  context.fillRect(-4, 24, 8, 1);
  context.fillStyle = '#8ff5ff';
  context.beginPath(); context.arc(0, 27, 1.2, 0, Math.PI * 2); context.fill();
  context.restore();
}
function drawBombArt(context, time) {
  const pulse = .5 + .5 * Math.sin(time * 11);
  context.save();
  const aura = context.createRadialGradient(0, 0, 6, 0, 0, 30);
  aura.addColorStop(0, `rgba(255,80,65,${.24 + pulse * .16})`);
  aura.addColorStop(1, 'rgba(255,80,65,0)');
  context.fillStyle = aura;
  context.beginPath(); context.arc(0, 0, 30, 0, Math.PI * 2); context.fill();
  context.restore();

  context.save();
  context.shadowColor = '#ff4d4d'; context.shadowBlur = 14 + pulse * 12;
  context.fillStyle = '#202622';
  context.beginPath(); context.arc(0, 0, 20, 0, Math.PI * 2); context.fill();
  context.restore();

  const sphereGradient = context.createRadialGradient(-6, -7, 2, 0, 0, 21);
  sphereGradient.addColorStop(0, '#5d6861');
  sphereGradient.addColorStop(.55, '#2b342f');
  sphereGradient.addColorStop(1, '#101512');
  context.fillStyle = sphereGradient;
  context.beginPath(); context.arc(0, 0, 19.5, 0, Math.PI * 2); context.fill();
  context.strokeStyle = '#78847d'; context.lineWidth = 1.6;
  context.beginPath(); context.arc(0, 0, 19.5, 0, Math.PI * 2); context.stroke();

  context.fillStyle = '#b9c3bc';
  roundRectPath(context, -20, -3.6, 40, 7.2, 3); context.fill();
  context.fillStyle = '#4c5752';
  context.fillRect(-19, -1, 38, 1.2);
  context.fillStyle = '#1b211e';
  for (const x of [-13, -4.5, 4.5, 13]) { context.beginPath(); context.arc(x, 0, 2.1, 0, Math.PI * 2); context.fill(); }
  context.fillStyle = `rgba(255,74,62,${.6 + pulse * .4})`;
  for (const x of [-8.5, 8.5]) { context.beginPath(); context.arc(x, 0, 1.5, 0, Math.PI * 2); context.fill(); }

  context.fillStyle = '#353f39';
  roundRectPath(context, -7, -24, 14, 6, 2); context.fill();
  context.fillStyle = '#9aa69e';
  roundRectPath(context, -4.5, -27, 9, 4, 1.5); context.fill();
  context.fillStyle = `rgba(255,74,62,${.65 + pulse * .35})`;
  context.beginPath(); context.arc(0, -27.5, 2.2, 0, Math.PI * 2); context.fill();
  context.strokeStyle = '#b9c3bc'; context.lineWidth = 1.4;
  context.beginPath(); context.arc(0, 0, 13, .35, 1.5); context.stroke();
  context.beginPath(); context.arc(0, 0, 13, 3.5, 4.7); context.stroke();

  context.fillStyle = '#d8f36a';
  context.fillRect(-9, 15, 18, 1.8);
  context.fillStyle = '#101512';
  for (let i = 0; i < 4; i++) context.fillRect(-7 + i * 4.4, 15.5, 1.6, .8);
}
function drawChargeArt(context, time) {
  const pulse = .5 + .5 * Math.sin(time * 9 + 1.2);
  context.save();
  const aura = context.createRadialGradient(0, 0, 4, 0, 0, 31);
  aura.addColorStop(0, `rgba(255,90,60,${.22 + pulse * .18})`);
  aura.addColorStop(1, 'rgba(255,90,60,0)');
  context.fillStyle = aura;
  context.beginPath(); context.arc(0, 0, 31, 0, Math.PI * 2); context.fill();
  context.restore();

  context.fillStyle = '#1c2320';
  roundRectPath(context, -11, -22, 22, 44, 8); context.fill();
  const bodyGradient = context.createLinearGradient(-12, 0, 12, 0);
  bodyGradient.addColorStop(0, '#3a443e');
  bodyGradient.addColorStop(.3, '#8f9b94');
  bodyGradient.addColorStop(.55, '#bcc6bf');
  bodyGradient.addColorStop(1, '#2f3833');
  context.fillStyle = bodyGradient;
  roundRectPath(context, -9.5, -21, 19, 42, 7); context.fill();
  context.strokeStyle = '#5e6a63'; context.lineWidth = 1.2; context.stroke();

  context.fillStyle = '#222a26';
  for (const side of [-1, 1]) {
    roundRectPath(context, side * 12 - (side < 0 ? 3 : 0), -14, 3, 28, 1.5); context.fill();
  }
  context.fillStyle = '#39433d';
  for (let i = 0; i < 3; i++) context.fillRect(-12, -9 + i * 9, 3, 4);

  context.fillStyle = '#121815';
  roundRectPath(context, -5.5, -8, 11, 20, 3); context.fill();
  context.save();
  context.shadowColor = '#ff4d4d'; context.shadowBlur = 12 + pulse * 8;
  context.fillStyle = `rgba(255,74,62,${.6 + pulse * .4})`;
  roundRectPath(context, -3.4, -5.5, 6.8, 15, 2); context.fill();
  context.restore();
  context.fillStyle = 'rgba(255,255,255,.7)';
  context.fillRect(-1.2, -4, 1.4, 10);

  context.fillStyle = '#d8f36a';
  context.save(); context.translate(0, 15); context.rotate(-.35); context.fillRect(-13, 0, 26, 4); context.restore();
  context.fillStyle = '#151b18';
  context.save(); context.translate(0, 15); context.rotate(-.35);
  for (let i = 0; i < 4; i++) context.fillRect(-12 + i * 7, 0, 3, 4);
  context.restore();

  context.fillStyle = '#2a332e';
  roundRectPath(context, -7, -26, 14, 6, 2); context.fill();
  context.strokeStyle = '#9aa69e'; context.lineWidth = 1.6;
  context.beginPath(); context.moveTo(0, -26); context.lineTo(0, -31); context.stroke();
  context.save();
  context.shadowColor = '#ff4d4d'; context.shadowBlur = 10;
  context.fillStyle = `rgba(255,74,62,${.6 + pulse * .4})`;
  context.beginPath(); context.arc(0, -32, 2.4, 0, Math.PI * 2); context.fill();
  context.restore();
  context.fillStyle = '#6fe8ff';
  context.beginPath(); context.arc(0, 22, 1.4, 0, Math.PI * 2); context.fill();
}
function drawSeismicArt(context, time) {
  const pulse = .5 + .5 * Math.sin(time * 10 + 1.2);
  context.save();
  const aura = context.createRadialGradient(0, 0, 5, 0, 0, 33);
  aura.addColorStop(0, `rgba(77,234,255,${.22 + pulse * .2})`);
  aura.addColorStop(.55, `rgba(77,140,255,${.1 + pulse * .08})`);
  aura.addColorStop(1, 'rgba(77,234,255,0)');
  context.fillStyle = aura;
  context.beginPath(); context.arc(0, 0, 33, 0, Math.PI * 2); context.fill();
  context.restore();

  context.save();
  context.translate(0, 0);
  context.rotate(time * .35);
  context.strokeStyle = `rgba(120,240,255,${.28 + pulse * .42})`;
  context.lineWidth = 1.6;
  for (let i = 0; i < 3; i++) {
    context.beginPath();
    context.arc(0, 0, 22 + i * 4.4, i * 2.1, i * 2.1 + 2.3);
    context.stroke();
  }
  context.restore();

  context.save();
  context.shadowColor = '#4deaff'; context.shadowBlur = 12 + pulse * 10;
  context.fillStyle = '#1b2b33';
  context.beginPath(); context.arc(0, 0, 20, 0, Math.PI * 2); context.fill();
  context.restore();

  const body = context.createRadialGradient(-6, -7, 2, 0, 0, 21);
  body.addColorStop(0, '#5e7c84');
  body.addColorStop(.38, '#2a3f47');
  body.addColorStop(.74, '#132029');
  body.addColorStop(1, '#070d12');
  context.fillStyle = body;
  context.beginPath(); context.arc(0, 0, 19, 0, Math.PI * 2); context.fill();
  context.strokeStyle = '#76b9c9'; context.lineWidth = 1.4;
  context.beginPath(); context.arc(0, 0, 19, 0, Math.PI * 2); context.stroke();

  context.strokeStyle = 'rgba(185,240,250,.35)'; context.lineWidth = 1;
  for (const r of [14.5, 9.5]) {
    context.beginPath(); context.arc(0, 0, r, .3, Math.PI * 1.7); context.stroke();
  }
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4 + .2;
    context.fillStyle = '#101a20';
    context.beginPath(); context.arc(Math.cos(a) * 15.6, Math.sin(a) * 15.6, 2.1, 0, Math.PI * 2); context.fill();
    context.fillStyle = '#8be8f8';
    context.beginPath(); context.arc(Math.cos(a) * 15.6, Math.sin(a) * 15.6, .8, 0, Math.PI * 2); context.fill();
  }

  context.save();
  context.shadowColor = '#8bf6ff'; context.shadowBlur = 14 + pulse * 10;
  const core = context.createRadialGradient(-2, -3, 0, 0, 0, 9);
  core.addColorStop(0, '#ffffff');
  core.addColorStop(.35, '#a9fbff');
  core.addColorStop(.7, '#31cbe8');
  core.addColorStop(1, 'rgba(24,122,160,0)');
  context.fillStyle = core;
  context.beginPath(); context.arc(0, 0, 9, 0, Math.PI * 2); context.fill();
  context.restore();

  context.strokeStyle = '#b9c3bc'; context.lineWidth = 1.2;
  context.beginPath(); context.arc(0, 0, 18.5, -.55, .4); context.stroke();
  context.beginPath(); context.arc(0, 0, 18.5, 2.6, 3.55); context.stroke();
  context.fillStyle = '#ff5b4d';
  context.save(); context.shadowColor = '#ff5b4d'; context.shadowBlur = 9;
  context.beginPath(); context.arc(0, -22, 2.1, 0, Math.PI * 2); context.fill();
  context.restore();
  context.fillStyle = '#d8f36a';
  context.fillRect(-6, 21, 12, 1.2);
}
function drawSlicerArt(context, type, time) {
  if (type === 'crate') drawCrateArt(context);
  else if (type === 'droid') drawDroidArt(context);
  else if (type === 'helmet') drawHelmetArt(context);
  else if (type === 'barrel') drawBarrelArt(context);
  else if (type === 'probe') drawProbeArt(context, time);
  else if (type === 'holocron') drawHolocronArt(context, time);
  else if (type === 'astromech') drawAstromechArt(context);
  else if (type === 'blaster') drawBlasterArt(context);
  else if (type === 'saber') drawSaberArt(context);
  else if (type === 'mando') drawMandoArt(context);
  else if (type === 'remote') drawRemoteArt(context);
  else if (type === 'xwing') drawXWingArt(context);
  else if (type === 'tie') drawTieArt(context);
  else if (type === 'vader') drawVaderArt(context);
  else if (type === 'protocol') drawProtocolArt(context);
  else if (type === 'destroyer') drawDestroyerArt(context);
  else if (type === 'darksaber') drawDarksaberArt(context);
  else if (type === 'charge') drawChargeArt(context, time);
  else if (type === 'seismic') drawSeismicArt(context, time);
  else drawBombArt(context, time);
}
const slicerArtCache = new Map();
function getSlicerArt(type) {
  if (slicerArtCache.has(type)) return slicerArtCache.get(type);
  const scale = 4;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 60 * scale;
  const context = canvas.getContext('2d');
  context.translate(30 * scale, 30 * scale);
  context.scale(scale, scale);
  drawSlicerArt(context, type, 0);
  slicerArtCache.set(type, canvas);
  return canvas;
}
function drawSlicerBackground(time) {
  const context = slicerCtx;
  const width = slicer.w, height = slicer.h;
  if (slicer.backdrop) {
    context.drawImage(slicer.backdrop, 0, 0, width, height);
  } else {
    const gradient = context.createRadialGradient(width * .5, height * .42, 12, width * .5, height * .5, Math.max(width, height) * .76);
    gradient.addColorStop(0, '#22332b');
    gradient.addColorStop(.52, '#111915');
    gradient.addColorStop(1, '#080c0a');
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
  }
  for (const star of slicer.stars) {
    const drift = (time * star.speed * 3) % (height * .8);
    const alpha = .16 + .5 * (.5 + .5 * Math.sin(time * star.speed + star.phase));
    const y = (star.y * height + drift) % (height * .84);
    context.fillStyle = `rgba(216, 243, 106, ${alpha})`;
    context.fillRect(star.x * width, y, star.size, star.size);
  }
  const sweep = (time * 34) % height;
  const sweepGradient = context.createLinearGradient(0, sweep - 26, 0, sweep + 26);
  sweepGradient.addColorStop(0, 'rgba(216,243,106,0)');
  sweepGradient.addColorStop(.5, 'rgba(216,243,106,.028)');
  sweepGradient.addColorStop(1, 'rgba(216,243,106,0)');
  context.fillStyle = sweepGradient;
  context.fillRect(0, sweep - 26, width, 52);
}
function drawSlicerTrail(now) {
  const context = slicerCtx;
  if (slicer.trail.length < 2) return;
  context.save();
  context.globalCompositeOperation = 'lighter';
  context.lineCap = 'round';
  for (let i = 1; i < slicer.trail.length; i++) {
    const from = slicer.trail[i - 1];
    const to = slicer.trail[i];
    const life = Math.max(0, 1 - (now - to.t) / .22);
    if (life <= 0) continue;
    context.strokeStyle = `rgba(${slicer.bladeRgb}, ${.12 * life})`;
    context.lineWidth = 18 * life + 2;
    context.beginPath(); context.moveTo(from.x, from.y); context.lineTo(to.x, to.y); context.stroke();
    context.strokeStyle = `rgba(255, 255, 255, ${.72 * life})`;
    context.lineWidth = 3.2 * life + .4;
    context.beginPath(); context.moveTo(from.x, from.y); context.lineTo(to.x, to.y); context.stroke();
  }
  const head = slicer.trail[slicer.trail.length - 1];
  const headLife = Math.max(0, 1 - (now - head.t) / .22);
  if (headLife > 0) {
    const glow = context.createRadialGradient(head.x, head.y, 0, head.x, head.y, 22);
    glow.addColorStop(0, `rgba(255,255,255,${.65 * headLife})`);
    glow.addColorStop(.4, `rgba(${slicer.bladeRgb},${.28 * headLife})`);
    glow.addColorStop(1, `rgba(${slicer.bladeRgb},0)`);
    context.fillStyle = glow;
    context.beginPath(); context.arc(head.x, head.y, 22, 0, Math.PI * 2); context.fill();
  }
  context.restore();
}
function drawSlicer(now) {
  const context = slicerCtx;
  context.setTransform(slicer.dpr, 0, 0, slicer.dpr, 0, 0);
  context.clearRect(0, 0, slicer.w, slicer.h);
  drawSlicerBackground(now);
  context.save();
  if (slicer.shake > .1) context.translate((Math.random() - .5) * slicer.shake, (Math.random() - .5) * slicer.shake);
  for (const piece of slicer.pieces) {
    context.save();
    context.translate(piece.x, piece.y);
    context.rotate(piece.angle);
    context.scale(piece.size / 60, piece.size / 60);
    context.globalAlpha = Math.max(0, piece.alpha);
    context.beginPath();
    if (piece.side < 0) context.rect(-46, -46, 92, 46);
    else context.rect(-46, 0, 92, 46);
    context.clip();
    context.drawImage(getSlicerArt(piece.type), -30, -30, 60, 60);
    context.strokeStyle = 'rgba(216, 243, 106, .85)';
    context.lineWidth = 1.8;
    context.shadowColor = '#d8f36a';
    context.shadowBlur = 10;
    context.beginPath(); context.moveTo(-34, 0); context.lineTo(34, 0); context.stroke();
    context.shadowBlur = 0;
    context.restore();
  }
  for (const object of slicer.objects) {
    const meta = slicerTypeMeta[object.type];
    const bomb = isSlicerBomb(object.type);
    const halo = bomb ? (object.type === 'seismic' ? meta.colors[0] : '#ff5b4d') : (meta.colors[1] || '#d8f36a');
    const pulse = .5 + .5 * Math.sin(now * (bomb ? 7 : 3.2) + object.seed);
    const haloSize = object.size * (bomb ? 1.6 : meta.rare ? 1.5 : 1.24);
    context.save();
    context.translate(object.x, object.y);
    context.globalCompositeOperation = 'lighter';
    context.globalAlpha = bomb ? .55 + pulse * .22 : meta.rare ? .38 + pulse * .12 : .22 + pulse * .06;
    context.drawImage(getSlicerGlow(halo), -haloSize / 2, -haloSize / 2, haloSize, haloSize);
    context.restore();

    context.save();
    context.translate(object.x, object.y);
    context.rotate(object.angle);
    context.scale(object.size / 60, object.size / 60);
    if (bomb) {
      drawSlicerArt(context, object.type, now);
      const warning = object.type === 'seismic' ? '77, 234, 255' : '255, 90, 70';
      context.save();
      context.rotate(now * .9 + object.seed);
      context.strokeStyle = `rgba(${warning}, ${.32 + .22 * pulse})`;
      context.lineWidth = 1.5;
      context.setLineDash([3.5, 5.5]);
      context.beginPath(); context.arc(0, 0, 26, 0, Math.PI * 2); context.stroke();
      context.restore();
      context.setLineDash([]);
      context.save();
      context.shadowColor = object.type === 'seismic' ? '#4deaff' : '#ff5b4d';
      context.shadowBlur = 9;
      context.fillStyle = object.type === 'seismic' ? '#9df6ff' : '#ff6b5c';
      context.font = '800 10px Manrope, sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText('!', 0, -30);
      context.restore();
    } else {
      context.drawImage(getSlicerArt(object.type), -30, -30, 60, 60);
      if (meta.rare) {
        const twinkle = .5 + .5 * Math.sin(now * 4.6 + object.seed);
        context.save();
        context.strokeStyle = `rgba(255, 248, 196, ${.3 + twinkle * .55})`;
        context.lineWidth = .9;
        for (const [x, y] of [[-24, -17], [23, 15], [5, -28]]) {
          context.beginPath();
          context.moveTo(x - 2.2, y); context.lineTo(x + 2.2, y);
          context.moveTo(x, y - 2.2); context.lineTo(x, y + 2.2);
          context.stroke();
        }
        context.restore();
      }
    }
    context.restore();
  }
  for (const ring of slicer.rings) {
    const t = 1 - ring.life / ring.maxLife;
    const radius = 6 + (ring.radius - 6) * (1 - Math.pow(1 - t, 2));
    const alpha = Math.max(0, ring.life / ring.maxLife);
    context.save();
    context.globalCompositeOperation = 'lighter';
    context.strokeStyle = `rgba(${hexToRgb(ring.color)}, ${alpha * .8})`;
    context.lineWidth = 2.6 * (1 - t) + .5;
    context.beginPath(); context.arc(ring.x, ring.y, radius, 0, Math.PI * 2); context.stroke();
    context.strokeStyle = `rgba(255,255,255,${alpha * .35})`;
    context.lineWidth = .8;
    context.beginPath(); context.arc(ring.x, ring.y, radius * .82, 0, Math.PI * 2); context.stroke();
    context.restore();
  }
  context.save();
  context.globalCompositeOperation = 'lighter';
  for (const spark of slicer.sparks) {
    const alpha = Math.max(0, spark.life / spark.maxLife);
    context.globalAlpha = alpha;
    context.fillStyle = spark.color;
    context.fillRect(spark.x - spark.size / 2, spark.y - spark.size / 2, spark.size, spark.size);
  }
  context.restore();
  for (const float of slicer.floats) {
    const alpha = Math.max(0, float.life / float.maxLife);
    context.globalAlpha = alpha;
    context.fillStyle = float.color;
    context.font = '600 13px Manrope, sans-serif';
    context.textAlign = 'center';
    context.fillText(float.text, float.x, float.y);
  }
  context.globalAlpha = 1;
  drawSlicerTrail(now);
  context.restore();
  if (slicer.flash > 0) {
    context.fillStyle = `rgba(${slicer.flashColor}, ${slicer.flash * .18})`;
    context.fillRect(0, 0, slicer.w, slicer.h);
  }
}
function slicerLoop(timestamp) {
  if (!slicer.open) { slicer.raf = 0; return; }
  const now = timestamp / 1000;
  if (!slicer.lastFrame) slicer.lastFrame = now;
  const frameDelta = Math.min(.35, Math.max(0, now - slicer.lastFrame));
  slicer.lastFrame = now;
  // Sub-step physics so the run keeps real time even on slow software renderers.
  let remaining = frameDelta;
  let steps = 0;
  while (remaining > .0001 && steps < 12) {
    const step = Math.min(1 / 60, remaining);
    updateSlicer(step, now);
    remaining -= step;
    steps++;
  }
  drawSlicer(now);
  slicer.raf = requestAnimationFrame(slicerLoop);
}

// ===========================================================================
// ACTIVITY 03 — TRAINING DUEL
// ===========================================================================
const DUEL_KEY = 'sabersmith.duel.v1';
const DUEL_STANCES = {
  shii: {
    id: 'shii', name: 'Shii-Cho', form: 'FORM I', label: 'BALANCED',
    desc: 'Even footwork and clean lines. A little of everything.',
    damage: 1, guard: .62, force: 1, taken: 1, glyph: 'I'
  },
  soresu: {
    id: 'soresu', name: 'Soresu', form: 'FORM III', label: 'DEFENSIVE',
    desc: 'A patient shell. Blocks absorb more and restore extra Force.',
    damage: .84, guard: .82, force: 1.32, taken: .86, glyph: 'III'
  },
  djem: {
    id: 'djem', name: 'Djem So', form: 'FORM V', label: 'AGGRESSIVE',
    desc: 'Forward pressure. More damage, less protection when caught.',
    damage: 1.25, guard: .48, force: .9, taken: 1.16, glyph: 'V'
  }
};
const DUEL_RANKS = [
  [15, 'Grandmaster'], [11, 'Battlemaster'], [8, 'Duelist'], [5, 'Knight'], [3, 'Padawan'], [1, 'Initiate']
];
const DUEL_TITLES = [
  'SALVAGE ACOLYTE', 'TEMPLE INITIATE', 'OUTER RIM DUELIST', 'JEDI ARCHIVIST',
  'BOUNTY HUNTER', 'PRIVATE VAULT', 'SITH APPRENTICE', 'BLADE MASTER',
  'CIRCUIT CHAMPION', 'RING VETERAN', 'KYBER SCAVENGER', 'NIGHTBROKER',
  'CRIMSON ADEPT', 'GRAV-BALL PRODIGY', 'CONSULAR EMISSARY', 'UNDERWORLD CHAMPION',
  'DUNE WANDERER', 'FORGE ADEPT', 'ORBITAL MARSHAL', 'VEIL SENTINEL'
];
const DUEL_TAG_FIRST = [
  'Vex', 'Nyx', 'Kael', 'Sora', 'Ren', 'Mira', 'Jax', 'Talon', 'Rook', 'Sable',
  'Kestis', 'Wren', 'Nova', 'Vale', 'Cinder', 'Echo', 'Havoc', 'Juno', 'Korr', 'Lumen',
  'Mace', 'Onyx', 'Pike', 'Quill', 'Rune', 'Sly', 'Thorn', 'Umbra', 'Vanta', 'Zephyr',
  'Ash', 'Brix', 'Cyra', 'Dax', 'Eira', 'Fenn', 'Galen', 'Hera', 'Ivo', 'Jade'
];
const DUEL_TAG_SECOND = [
  'Walker', 'Runner', 'Blade', 'Warden', 'Rider', 'Fang', 'Vigil', 'Storm',
  'Shade', 'Spark', 'Hawk', 'Reign', 'Drift', 'Pulse', 'Knight', 'Rogue',
  'Edge', 'Flux', 'Dusk', 'Ember', 'Saber', 'Wraith', 'Tide', 'Crow'
];
const DUEL_LOOK_KEYS = ['hilt', 'emitter', 'grip', 'pommel', 'crystal', 'accent', 'blade', 'switch', 'engraving'];
const DUEL_FINISH_TONES = {
  satin: ['#a6ada3', '#d2d9d0', '#6f7972'],
  copper: ['#b7835d', '#d9ac81', '#7f5739'],
  onyx: ['#444b48', '#6c7570', '#232927'],
  ivory: ['#d0c8b1', '#f0ead6', '#99927e'],
  teal: ['#397d78', '#60b7ae', '#204b48'],
  brass: ['#b98a3b', '#dfb55c', '#7b571f'],
  frost: ['#b8c9d0', '#e5f1f4', '#7d8d94'],
  patina: ['#668d79', '#90b9a2', '#3d5b4c']
};
const duelRecordDefaults = {
  level: 1, xp: 0, wins: 0, losses: 0, streak: 0, bestStreak: 0,
  stance: 'shii', selectedSaberId: null, opponentNames: [], opponentLooks: []
};
let duelRecord = { ...duelRecordDefaults, opponentNames: [], opponentLooks: [] };
try {
  const storedDuel = JSON.parse(localStorage.getItem(DUEL_KEY) || '{}');
  if (storedDuel && typeof storedDuel === 'object') {
    duelRecord = {
      ...duelRecordDefaults,
      ...storedDuel,
      level: Math.max(1, Math.round(Number(storedDuel.level) || 1)),
      xp: Math.max(0, Number(storedDuel.xp) || 0),
      wins: Math.max(0, Math.round(Number(storedDuel.wins) || 0)),
      losses: Math.max(0, Math.round(Number(storedDuel.losses) || 0)),
      streak: Math.max(0, Math.round(Number(storedDuel.streak) || 0)),
      bestStreak: Math.max(0, Math.round(Number(storedDuel.bestStreak) || 0)),
      opponentNames: Array.isArray(storedDuel.opponentNames)
        ? storedDuel.opponentNames.filter(name => typeof name === 'string').slice(-120)
        : [],
      opponentLooks: Array.isArray(storedDuel.opponentLooks)
        ? storedDuel.opponentLooks.filter(look => typeof look === 'string').slice(-120)
        : []
    };
  }
} catch (_) { /* A blocked local store should not stop the training ring. */ }
if (!DUEL_STANCES[duelRecord.stance]) duelRecord.stance = 'shii';

const duel = {
  open: false, screen: 'lobby', token: 0, raf: 0, lastFrame: 0, w: 0, h: 0, dpr: 1,
  record: duelRecord, stance: duelRecord.stance, selectedSaberId: duelRecord.selectedSaberId || null,
  selectedArtifact: null, selectedSpec: null, loanerArtifact: null,
  player: null, enemy: null, round: 1, busy: false, over: false, playerBlocked: false,
  anim: {
    player: { kind: '', start: -99, dur: .9 },
    enemy: { kind: '', start: -99, dur: .9 }
  },
  fx: { hitPlayer: -99, hitEnemy: -99, clash: -99, clashX: 0, clashY: 0, shake: -99, waves: [], floaters: [], sparks: [] },
  log: [], bg: null, resultKind: null,
  matchInterval: 0, matchTimers: [], matchOpponent: null, introStart: 0
};
const duelCanvas = $('duelCanvas');
const duelCtx = duelCanvas.getContext('2d');
const duelPreviewCanvas = $('duelSaberPreview');
const duelPreviewCtx = duelPreviewCanvas.getContext('2d');

function saveDuelRecord() {
  duel.record.stance = duel.stance;
  duel.record.selectedSaberId = duel.selectedSaberId;
  try { localStorage.setItem(DUEL_KEY, JSON.stringify(duel.record)); }
  catch (_) { /* The duel record is a nice-to-have when storage is blocked. */ }
}
function duelRank(level) {
  for (const [min, rank] of DUEL_RANKS) if (level >= min) return rank;
  return 'Initiate';
}
function duelXpNeeded(level) { return 60 + (level - 1) * 45; }
function duelRand(min, max) { return min + Math.random() * (max - min); }
function duelEaseOut(t) { return 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3); }
function duelEaseInOut(t) { t = Math.max(0, Math.min(1, t)); return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
function duelSpecFromArtifact(artifact) {
  const parts = {};
  Object.keys(options).forEach(key => {
    const index = Math.max(0, Math.min(Number(artifact?.parts?.[key]) || 0, options[key].length - 1));
    parts[key] = options[key][index];
  });
  return {
    artifact, parts,
    hilt: parts.hilt, emitter: parts.emitter, grip: parts.grip, pommel: parts.pommel,
    crystal: parts.crystal, accent: parts.accent, blade: parts.blade, switch: parts.switch, engraving: parts.engraving,
    tones: DUEL_FINISH_TONES[parts.hilt.finish] || DUEL_FINISH_TONES.satin
  };
}
function duelPick(list) { return list[Math.floor(Math.random() * list.length)]; }
function duelPartSignature(parts = {}) {
  return DUEL_LOOK_KEYS.map(key => Math.max(0, Math.round(Number(parts[key]) || 0))).join('.');
}
function makeDuelGamertag(usedNames) {
  for (let attempt = 0; attempt < 90; attempt++) {
    const first = duelPick(DUEL_TAG_FIRST);
    const second = duelPick(DUEL_TAG_SECOND);
    const style = Math.random();
    let tag;
    if (style < .46) tag = `${first}${second}`;
    else if (style < .68) tag = `${first}_${second}`;
    else if (style < .84) tag = `${first}${Math.floor(duelRand(10, 100))}`;
    else if (style < .94) tag = `${first}-${Math.floor(duelRand(10, 100))}`;
    else tag = `${first}${second}${Math.floor(duelRand(10, 100))}`;
    if (!usedNames.has(tag)) return tag;
  }
  return `${duelPick(DUEL_TAG_FIRST)}${duelPick(DUEL_TAG_SECOND)}${Date.now().toString(36).slice(-3).toUpperCase()}`;
}
function makeDuelOpponentLook(usedLooks) {
  for (let attempt = 0; attempt < 90; attempt++) {
    const parts = {};
    DUEL_LOOK_KEYS.forEach(key => {
      parts[key] = Math.floor(Math.random() * options[key].length);
    });
    const signature = duelPartSignature(parts);
    if (!usedLooks.has(signature)) return { parts, signature };
  }
  const parts = {};
  DUEL_LOOK_KEYS.forEach((key, index) => {
    parts[key] = (Math.floor(Math.random() * options[key].length) + index + Date.now()) % options[key].length;
  });
  return { parts, signature: duelPartSignature(parts) };
}
function makeDuelOpponentIdentity() {
  const record = duel.record;
  const usedNames = new Set(record.opponentNames);
  const usedLooks = new Set(record.opponentLooks);
  const playerSignature = duelPartSignature(duel.selectedArtifact?.parts || {});
  if (duel.selectedArtifact?.parts) usedLooks.add(playerSignature);
  const name = makeDuelGamertag(usedNames);
  const look = makeDuelOpponentLook(usedLooks);
  record.opponentNames.push(name);
  record.opponentLooks.push(look.signature);
  if (record.opponentNames.length > 120) record.opponentNames.splice(0, record.opponentNames.length - 120);
  if (record.opponentLooks.length > 120) record.opponentLooks.splice(0, record.opponentLooks.length - 120);
  saveDuelRecord();
  return { name, parts: look.parts };
}
function makeDuelLoaner() {
  return {
    id: 'loaner', name: 'Atelier Training Blade', blade: true, value: 0,
    parts: { hilt: 0, emitter: 0, grip: 0, pommel: 0, crystal: 0, accent: 0, blade: 0, switch: 0, engraving: 0 }
  };
}
function duelEnsureSelection() {
  if (collection.length) {
    const artifact = collection.find(item => item.id === duel.selectedSaberId) || collection[0];
    duel.selectedSaberId = artifact.id;
    duel.selectedArtifact = artifact;
  } else {
    duel.loanerArtifact ||= makeDuelLoaner();
    duel.selectedSaberId = 'loaner';
    duel.selectedArtifact = duel.loanerArtifact;
  }
  duel.selectedSpec = duelSpecFromArtifact(duel.selectedArtifact);
}
function updateDuelProfileUI() {
  const record = duel.record;
  const need = duelXpNeeded(record.level);
  const rank = duelRank(record.level);
  $('duelHeaderLevel').textContent = String(record.level).padStart(2, '0');
  $('duelHeaderWins').textContent = String(record.wins).padStart(2, '0');
  $('duelHeaderStreak').textContent = String(record.streak).padStart(2, '0');
  $('duelProfileLevel').textContent = String(record.level).padStart(2, '0');
  $('duelProfileRank').textContent = rank;
  $('duelProfileNote').textContent = record.wins
    ? `${record.wins} ring wins. ${record.streak ? `${record.streak} in a row — the crowd is watching.` : 'Every loss is another lesson in footwork.'}`
    : 'Every duel sharpens the bond between you and your blade.';
  $('duelXpNow').textContent = Math.round(record.xp);
  $('duelXpNext').textContent = need;
  $('duelXpFill').style.width = `${Math.min(100, Math.max(0, record.xp / need * 100))}%`;
  $('duelWins').textContent = String(record.wins).padStart(2, '0');
  $('duelLosses').textContent = String(record.losses).padStart(2, '0');
  $('duelStreak').textContent = String(record.streak).padStart(2, '0');
  $('duelBest').textContent = String(record.bestStreak).padStart(2, '0');
}
function renderDuelSaberList() {
  const hasItems = collection.length > 0;
  $('duelSaberList').hidden = !hasItems;
  $('duelEmpty').hidden = hasItems;
  $('duelSaberList').replaceChildren();
  $('duelSaberCount').textContent = hasItems ? `${String(collection.length).padStart(2, '0')} SABERS` : 'TRAINING ISSUE';
  if (!hasItems) return;
  collection.forEach(artifact => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'duel-saber-card' + (artifact.id === duel.selectedSaberId ? ' is-selected' : '');
    card.setAttribute('aria-pressed', String(artifact.id === duel.selectedSaberId));
    const thumb = document.createElement('canvas');
    thumb.className = 'duel-saber-thumb';
    thumb.width = 60; thumb.height = 96;
    const index = collection.indexOf(artifact) + 1;
    const copy = document.createElement('span'); copy.className = 'duel-saber-card-copy';
    const name = document.createElement('strong'); name.textContent = artifact.name;
    const spec = duelSpecFromArtifact(artifact);
    const meta = document.createElement('small');
    meta.textContent = `KYBER ${spec.crystal.name.toUpperCase()} · ${spec.blade.name.toUpperCase()} BLADE`;
    copy.append(name, meta);
    const state = document.createElement('span'); state.className = 'duel-saber-card-state';
    state.textContent = artifact.id === duel.selectedSaberId ? 'EQUIPPED' : `No. ${String(index).padStart(2, '0')}`;
    card.append(thumb, copy, state);
    card.addEventListener('click', () => selectDuelSaber(artifact));
    $('duelSaberList').append(card);
    drawDuelThumb(thumb, artifact);
  });
}
function renderDuelStances() {
  const list = $('duelStanceList');
  list.replaceChildren();
  Object.values(DUEL_STANCES).forEach(stance => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'duel-stance-card' + (duel.stance === stance.id ? ' is-selected' : '');
    button.setAttribute('aria-pressed', String(duel.stance === stance.id));
    const glyph = document.createElement('span'); glyph.className = 'duel-stance-glyph'; glyph.textContent = stance.glyph;
    const copy = document.createElement('span'); copy.className = 'duel-stance-copy';
    const title = document.createElement('strong'); title.textContent = `${stance.name} · ${stance.label}`;
    const form = document.createElement('small'); form.textContent = stance.form;
    const description = document.createElement('span'); description.textContent = stance.desc;
    copy.append(title, form, description);
    button.append(glyph, copy);
    button.addEventListener('click', () => selectDuelStance(stance.id));
    list.append(button);
  });
}
function selectDuelSaber(artifact) {
  duel.selectedSaberId = artifact.id;
  duel.selectedArtifact = artifact;
  duel.selectedSpec = duelSpecFromArtifact(artifact);
  saveDuelRecord();
  renderDuelSaberList();
  renderDuelLoadoutPreview();
  playTone(540, .06);
}
function selectDuelStance(id) {
  if (!DUEL_STANCES[id]) return;
  duel.stance = id;
  duel.record.stance = id;
  saveDuelRecord();
  renderDuelStances();
  updateDuelProfileUI();
  $('duelFooterCopy').textContent = `${DUEL_STANCES[id].name} selected — ${DUEL_STANCES[id].desc}`;
  playTone(480, .06);
}
function renderDuelLoadoutPreview() {
  const artifact = duel.selectedArtifact;
  const spec = duel.selectedSpec;
  if (!artifact || !spec) return;
  $('duelPreviewName').textContent = artifact.name;
  $('duelPreviewParts').textContent = `${spec.hilt.name} hilt · ${spec.emitter.name} emitter · Kyber ${spec.crystal.name} · ${spec.blade.name} blade`;
  $('duelPreviewGlow').style.background = `radial-gradient(ellipse, ${spec.crystal.color}55, transparent 68%)`;
  const start = $('duelStart');
  start.disabled = false;
  start.innerHTML = `ENTER THE RING <span>↗</span>`;
  requestAnimationFrame(resizeDuelPreview);
}
function clearDuelMatchTimers() {
  if (duel.matchInterval) clearInterval(duel.matchInterval);
  duel.matchInterval = 0;
  duel.matchTimers.forEach(timer => clearTimeout(timer));
  duel.matchTimers = [];
}
function renderDuelMatchTags() {
  const feed = $('duelMatchTags');
  if (!feed) return;
  feed.replaceChildren();
  const used = new Set(duel.record.opponentNames);
  for (let i = 0; i < 5; i++) {
    const tag = makeDuelGamertag(used);
    used.add(tag);
    const row = document.createElement('div');
    row.className = 'duel-match-tag' + (i === 2 ? ' is-target' : '');
    const dot = document.createElement('i');
    const name = document.createElement('span');
    name.textContent = tag;
    const meta = document.createElement('small');
    const level = 2 + Math.floor(Math.random() * Math.max(4, duel.record.level + 5));
    meta.textContent = `LV ${String(level).padStart(2, '0')} · ${18 + Math.floor(Math.random() * 30)} MS`;
    row.append(dot, name, meta);
    feed.append(row);
  }
}
function drawDuelMatchSaber(canvas, spec) {
  if (!canvas || !spec) return;
  const width = Math.max(1, canvas.clientWidth);
  const height = Math.max(1, canvas.clientHeight);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  const context = canvas.getContext('2d');
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.clearRect(0, 0, width, height);
  const scale = Math.min(width / 5.2, height / 4.9);
  const pommelX = width * .58;
  const pommelY = height - 10;
  drawDuelFlatSaber(context, spec, pommelX, pommelY, scale, -Math.PI / 2 + .04, true, 1);
  context.save();
  context.globalCompositeOperation = 'lighter';
  context.strokeStyle = `rgba(${hexToRgb(spec.crystal.color)},.3)`;
  context.lineWidth = 1;
  context.beginPath();
  context.ellipse(width * .5, height - 8, width * .21, 6, 0, 0, Math.PI * 2);
  context.stroke();
  context.restore();
}
function resizeDuelMatchSabers() {
  drawDuelMatchSaber($('duelMatchPlayerSaber'), duel.selectedSpec);
  drawDuelMatchSaber($('duelMatchOpponentSaber'), duel.matchOpponent?.spec);
}
function beginDuelMatchmaking() {
  if (!duel.open) return;
  duelEnsureSelection();
  if (!duel.selectedArtifact) return;
  clearDuelMatchTimers();
  duel.token++;
  const token = duel.token;
  duel.screen = 'match';
  duel.matchOpponent = null;
  stopDuelLoop();
  $('duelLobby').hidden = true;
  $('duelArena').hidden = true;
  $('duelMatch').hidden = false;
  $('duelMatchSearch').hidden = false;
  $('duelMatchFound').hidden = true;
  $('duelMatchHeadline').textContent = 'Searching the atelier network…';
  $('duelMatchSubline').textContent = 'Matching by level, stance, and blade signature.';
  $('duelMatchTitle').textContent = 'FINDING A CHALLENGER';
  $('duelMatchEyebrow').textContent = 'MATCHMAKING · OPEN RING';
  $('duelMatchCopy').textContent = 'Scanning for a duelist near your level. Every challenger forges a different blade.';
  $('duelMatchCancel').textContent = '← CANCEL SEARCH';
  $('duelMatchPing').textContent = String(18 + Math.floor(Math.random() * 19));
  renderDuelMatchTags();
  playTone(520, .06);
  let ticks = 0;
  duel.matchInterval = setInterval(() => {
    if (!duel.open || duel.screen !== 'match' || duel.token !== token) return;
    ticks++;
    if (ticks % 2 === 0) $('duelMatchPing').textContent = String(16 + Math.floor(Math.random() * 33));
    if (ticks % 3 === 1) renderDuelMatchTags();
    if (ticks === 6) $('duelMatchHeadline').textContent = 'Narrowing the field…';
    if (ticks === 11) $('duelMatchHeadline').textContent = 'One challenger is answering…';
    if (ticks >= 15) {
      clearInterval(duel.matchInterval);
      duel.matchInterval = 0;
      revealDuelMatchOpponent(token);
    }
  }, 130);
}
function revealDuelMatchOpponent(token) {
  if (!duel.open || duel.screen !== 'match' || duel.token !== token) return;
  const foe = buildDuelOpponent();
  duel.matchOpponent = foe;
  const player = duel.selectedArtifact;
  const rank = duelRank(duel.record.level);
  $('duelMatchSearch').hidden = true;
  $('duelMatchFound').hidden = false;
  $('duelMatchPlayerName').textContent = player.name;
  $('duelMatchPlayerMeta').textContent = `${rank.toUpperCase()} · LEVEL ${String(duel.record.level).padStart(2, '0')}`;
  $('duelMatchPlayerStance').textContent = `${duel.selectedSpec.crystal.name.toUpperCase()} · ${DUEL_STANCES[duel.stance].name.toUpperCase()}`;
  $('duelMatchOpponentName').textContent = foe.name;
  $('duelMatchOpponentMeta').textContent = `${foe.title} · LEVEL ${String(duel.record.level).padStart(2, '0')}`;
  $('duelMatchOpponentStance').textContent = foe.form;
  $('duelMatchTitle').textContent = 'CHALLENGER FOUND';
  document.querySelector('.duel-versus-card.is-player').style.setProperty('--versus-color', duel.selectedSpec.crystal.color);
  document.querySelector('.duel-versus-card.is-player').style.setProperty('--versus-glow', `rgba(${hexToRgb(duel.selectedSpec.crystal.color)},.14)`);
  document.querySelector('.duel-versus-card.is-opponent').style.setProperty('--versus-color', foe.spec.crystal.color);
  document.querySelector('.duel-versus-card.is-opponent').style.setProperty('--versus-glow', `rgba(${hexToRgb(foe.spec.crystal.color)},.13)`);
  $('duelMatchEyebrow').textContent = 'MATCH FOUND · RING 07';
  $('duelMatchCopy').textContent = `${foe.name} answered the call. Blades syncing — entering the ring.`;
  $('duelMatchCancel').textContent = '← BACK TO LOADOUT';
  requestAnimationFrame(() => resizeDuelMatchSabers());
  playTone(880, .1);
  duel.matchTimers.push(setTimeout(() => playTone(1180, .07), 150));
  duel.matchTimers.push(setTimeout(() => {
    if (duel.open && duel.screen === 'match' && duel.token === token) startDuel();
  }, 1950));
}
function cancelDuelMatchmaking() {
  if (!duel.open || duel.screen !== 'match') return;
  clearDuelMatchTimers();
  duel.token++;
  duel.matchOpponent = null;
  $('duelMatch').hidden = true;
  duel.screen = 'lobby';
  renderDuelLobby();
  playTone(420, .08);
}
function renderDuelLobby() {
  duel.screen = 'lobby';
  $('duelLobby').hidden = false;
  $('duelArena').hidden = true;
  $('duelMatch').hidden = true;
  duelEnsureSelection();
  updateDuelProfileUI();
  renderDuelSaberList();
  renderDuelStances();
  renderDuelLoadoutPreview();
  const hasItems = collection.length > 0;
  $('duelFooterEyebrow').textContent = hasItems ? 'RING PREPARED' : 'TRAINING ISSUE READY';
  $('duelFooterCopy').textContent = hasItems
    ? 'Pick a saber and a stance. Your next opponent scales to your record.'
    : 'No saber in the vault yet — the atelier training blade is ready for a first lesson.';
  requestAnimationFrame(resizeDuelPreview);
}
function openDuel() {
  duel.open = true;
  duel.token++;
  renderDuelLobby();
  openOverlayElement($('duelOverlay'));
  activityBodyLock();
  requestAnimationFrame(() => {
    resizeDuelPreview();
    $('duelSaberList').scrollTop = 0;
  });
  playTone(700, .08);
}
function closeDuel() {
  if (!duel.open) return;
  duel.open = false;
  duel.token++;
  clearDuelMatchTimers();
  duel.matchOpponent = null;
  stopDuelLoop();
  closeOverlayElement($('duelOverlay'));
  $('duelLobby').hidden = false;
  $('duelArena').hidden = true;
  $('duelMatch').hidden = true;
  activityBodyLock();
}
function backToDuelLobby() {
  if (!duel.open) return;
  duel.token++;
  clearDuelMatchTimers();
  duel.matchOpponent = null;
  stopDuelLoop();
  $('duelArena').hidden = true;
  $('duelMatch').hidden = true;
  $('duelLobby').hidden = false;
  renderDuelLobby();
  playTone(420, .08);
}
function resizeDuelPreview() {
  if (duel.screen !== 'lobby') return;
  const width = Math.max(1, duelPreviewCanvas.clientWidth);
  const height = Math.max(1, duelPreviewCanvas.clientHeight);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  duelPreviewCanvas.width = Math.round(width * dpr);
  duelPreviewCanvas.height = Math.round(height * dpr);
  const context = duelPreviewCtx;
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.clearRect(0, 0, width, height);
  const spec = duel.selectedSpec;
  if (!spec) return;
  const scale = Math.min(width / 5.35, height / 5.35);
  const pommelX = width * .52;
  const pommelY = height - 12;
  drawDuelFlatSaber(context, spec, pommelX, pommelY, scale, -Math.PI / 2 + .035, true, 1);
  context.save();
  context.globalCompositeOperation = 'lighter';
  context.strokeStyle = `rgba(${hexToRgb(spec.crystal.color)},.28)`;
  context.lineWidth = 1;
  context.beginPath();
  context.ellipse(width * .5, height - 10, width * .19, 7, 0, 0, Math.PI * 2);
  context.stroke();
  context.restore();
}
function drawDuelThumb(canvas, artifact) {
  const context = canvas.getContext('2d');
  context.setTransform(2, 0, 0, 2, 0, 0);
  context.clearRect(0, 0, 30, 48);
  const spec = duelSpecFromArtifact(artifact);
  drawDuelFlatSaber(context, spec, 15.2, 45, 8.9, -Math.PI / 2 + .05, true, 1);
}

// ---------------------------------------------------------------------------
// Flattened 2D saber renderer. The workbench builds real 3D geometry; the ring
// projects the same part choices into a clean side-view silhouette.
// ---------------------------------------------------------------------------
function drawDuelFlatSaber(context, spec, x, y, scale, angle, bladeOn, alpha = 1, reveal = 1) {
  const ctx = context;
  const { hilt, emitter, grip, pommel, crystal, accent, blade, switch: switchPart, engraving, tones } = spec;
  const body = tones[0], light = tones[1], bodyDark = tones[2];
  const accentColor = accent.color;
  const crystalColor = crystal.color;
  const hiltWidth = hilt.profile === 'slim' ? .25 : hilt.profile === 'hex' ? .31 : .29;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle - Math.PI / 2);
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const round = (rx, ry, rw, rh, radius, color) => {
    ctx.fillStyle = color;
    if (radius && ctx.roundRect) { ctx.beginPath(); ctx.roundRect(rx, ry, rw, rh, radius); ctx.fill(); }
    else ctx.fillRect(rx, ry, rw, rh);
  };
  const line = (x1, y1, x2, y2, color, width) => {
    ctx.strokeStyle = color; ctx.lineWidth = width;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  };
  const poly = (points, color) => {
    ctx.fillStyle = color; ctx.beginPath();
    points.forEach(([px, py], index) => index ? ctx.lineTo(px, py) : ctx.moveTo(px, py));
    ctx.closePath(); ctx.fill();
  };
  const ellipse = (cx, cy, rx, ry, color) => {
    ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
  };

  const pommelStyle = pommel.style;
  if (pommelStyle === 'spike') {
    poly([[-hiltWidth * .3, .18], [0, -.34], [hiltWidth * .3, .18]], light);
    round(-hiltWidth * .31, .02, hiltWidth * .62, .18, .02, bodyDark);
  } else if (pommelStyle === 'ring') {
    round(-hiltWidth * .34, .01, hiltWidth * .68, .18, .03, body);
    ctx.strokeStyle = accentColor; ctx.lineWidth = .037;
    ctx.beginPath(); ctx.arc(0, .10, .12, 0, Math.PI * 2); ctx.stroke();
    line(-.07, .04, -.07, .18, accentColor, .02); line(.07, .04, .07, .18, accentColor, .02);
  } else if (pommelStyle === 'fang') {
    round(-hiltWidth * .36, .01, hiltWidth * .72, .19, .03, body);
    for (const side of [-1, 1]) poly([[side * .07, .10], [side * .18, -.12], [side * .22, .11]], accentColor);
  } else if (pommelStyle === 'prism') {
    poly([[0, -.08], [.15, .10], [0, .24], [-.15, .10]], accentColor);
    round(-hiltWidth * .33, .14, hiltWidth * .66, .13, .02, bodyDark);
  } else if (pommelStyle === 'cage') {
    round(-hiltWidth * .32, .02, hiltWidth * .64, .16, .02, bodyDark);
    line(-hiltWidth * .34, .02, hiltWidth * .34, .02, accentColor, .026);
    line(-hiltWidth * .31, .20, hiltWidth * .31, .20, accentColor, .026);
    for (const side of [-1, 1]) line(side * hiltWidth * .23, .02, side * hiltWidth * .27, .20, accentColor, .018);
  } else if (pommelStyle === 'weight') {
    round(-hiltWidth * .41, .01, hiltWidth * .82, .24, .035, body);
    round(-hiltWidth * .45, .04, hiltWidth * .9, .05, .02, light);
  } else if (pommelStyle === 'smooth') {
    round(-hiltWidth * .34, .03, hiltWidth * .68, .18, .08, body);
  } else {
    round(-hiltWidth * .34, .02, hiltWidth * .68, .19, .03, bodyDark);
    for (const offset of [.06, .14]) line(-hiltWidth * .34, offset, hiltWidth * .34, offset, accentColor, .018);
  }

  round(-hiltWidth / 2, .19, hiltWidth, .84, .05, bodyDark);
  round(-hiltWidth / 2 + .012, .20, hiltWidth - .024, .80, .045, body);
  line(-hiltWidth * .33, .26, -hiltWidth * .33, .98, light, .025);
  line(hiltWidth * .37, .26, hiltWidth * .37, .98, bodyDark, .02);
  const gripColor = grip.style === 'wrap' ? '#6c543d' : grip.style === 'carbon' ? '#1c2826' : grip.style === 'panels' ? '#69726b' : '#29322e';
  round(-hiltWidth * .55, .29, hiltWidth * 1.1, .39, .025, gripColor);
  if (grip.style === 'ribs') {
    for (let i = 0; i < 8; i++) line(-hiltWidth * .54, .31 + i * .048, hiltWidth * .54, .31 + i * .048, light, .016);
  } else if (grip.style === 'wrap') {
    for (let i = 0; i < 8; i++) line(-hiltWidth * .52, .30 + i * .048, hiltWidth * .52, .335 + i * .048, '#a58964', .013);
  } else if (grip.style === 'knurl' || grip.style === 'carbon') {
    for (let row = 0; row < 6; row++) for (let col = 0; col < 3; col++) {
      const px = -hiltWidth * .30 + col * hiltWidth * .30, py = .32 + row * .06 + (row % 2) * .012;
      round(px, py, .026, .018, .006, grip.style === 'knurl' ? light : '#65736c');
    }
  } else if (grip.style === 'spiral') {
    for (let i = 0; i < 6; i++) line(-hiltWidth * .5, .31 + i * .058, hiltWidth * .5, .335 + i * .058, accentColor, .015);
  } else if (grip.style === 'scales') {
    for (let row = 0; row < 5; row++) for (let col = 0; col < 3; col++) {
      ellipse(-hiltWidth * .30 + col * hiltWidth * .30, .32 + row * .062 + (row % 2) * .012, .035, .022, row % 2 ? light : bodyDark);
    }
  } else if (grip.style === 'studs') {
    for (let row = 0; row < 4; row++) for (let col = 0; col < 2; col++) {
      ellipse(-hiltWidth * .23 + col * hiltWidth * .46, .335 + row * .077, .026, .026, accentColor);
    }
  } else if (grip.style === 'panels') {
    for (let i = 0; i < 3; i++) round(-hiltWidth * .42 + i * hiltWidth * .30, .31, hiltWidth * .22, .34, .01, '#a5ada4');
  }
  for (const bandY of [.285, .69, .86]) round(-hiltWidth * .58, bandY, hiltWidth * 1.16, .034, .012, accentColor);
  const switchX = hiltWidth * .39, switchY = .76;
  round(switchX - .055, switchY - .035, .11, .07, .018, '#202825');
  ellipse(switchX, switchY, .042, .042, switchPart.style === 'pulse' || switchPart.style === 'touch' ? crystalColor : accentColor);
  if (switchPart.style === 'twin') { ellipse(switchX, switchY - .06, .026, .026, crystalColor); ellipse(switchX, switchY + .06, .026, .026, crystalColor); }
  if (switchPart.style === 'lever') line(switchX - .03, switchY - .02, switchX + .01, switchY - .13, accentColor, .025);
  if (switchPart.style === 'dial') { ctx.strokeStyle = accentColor; ctx.lineWidth = .018; ctx.beginPath(); ctx.arc(switchX, switchY, .07, 0, Math.PI * 2); ctx.stroke(); }
  const etch = engraving.style;
  if (etch !== 'none') {
    const etchColor = etch === 'script' ? '#d9b568' : etch === 'mark' ? accentColor : light;
    if (etch === 'stars' || etch === 'orbit') {
      for (const [px, py, size] of [[-.08, .80, .018], [0, .88, .026], [.08, .82, .015]]) {
        poly([[px, py - size], [px + size, py], [px, py + size], [px - size, py]], etchColor);
      }
      if (etch === 'orbit') { ctx.strokeStyle = etchColor; ctx.lineWidth = .012; ctx.beginPath(); ctx.ellipse(0, .86, .13, .055, 0, 0, Math.PI * 2); ctx.stroke(); }
    } else if (etch === 'script' || etch === 'runes') {
      for (let i = 0; i < 5; i++) {
        const px = -.10 + i * .05;
        line(px, .79, px + (i % 2 ? .012 : -.012), .91, etchColor, .012);
        if (etch === 'runes') line(px - .012, .85, px + .014, .85, etchColor, .009);
      }
    } else if (etch === 'mark') {
      ctx.strokeStyle = etchColor; ctx.lineWidth = .012;
      ctx.beginPath(); ctx.arc(0, .855, .055, 0, Math.PI * 2); ctx.stroke();
      line(-.08, .855, .08, .855, etchColor, .012); line(0, .78, 0, .93, etchColor, .012);
    } else if (etch === 'flame') {
      for (let i = 0; i < 4; i++) poly([[-.10 + i * .066, .90], [-.075 + i * .066, .81], [-.05 + i * .066, .90]], etchColor);
    } else if (etch === 'serial') {
      for (let i = 0; i < 9; i++) line(-.11 + i * .027, .83, -.11 + i * .027, .89 + (i % 3) * .016, etchColor, .01);
    }
  }

  const emitterStyle = emitter.style;
  round(-hiltWidth * .42, .98, hiltWidth * .84, .12, .02, bodyDark);
  let emitterTop = 1.20;
  if (emitterStyle === 'flare') {
    poly([[-.16, 1.02], [.16, 1.02], [.23, 1.22], [-.23, 1.22]], body);
    line(-.23, 1.20, .23, 1.20, accentColor, .026);
    emitterTop = 1.22;
  } else if (emitterStyle === 'long') {
    round(-.13, 1.00, .26, .29, .02, body);
    for (const py of [1.08, 1.18, 1.27]) line(-.13, py, .13, py, accentColor, .02);
    emitterTop = 1.30;
  } else if (emitterStyle === 'crown') {
    poly([[-.18, 1.01], [.18, 1.01], [.22, 1.17], [-.22, 1.17]], body);
    for (let i = 0; i < 4; i++) {
      const px = -.16 + i * .107;
      poly([[px - .035, 1.17], [px, 1.30], [px + .035, 1.17]], accentColor);
    }
    emitterTop = 1.28;
  } else if (emitterStyle === 'vent') {
    round(-.22, 1.00, .44, .21, .02, body);
    for (let i = 0; i < 4; i++) round(-.17 + i * .09, 1.03, .045, .14, .01, bodyDark);
    line(-.24, 1.20, .24, 1.20, accentColor, .026);
    emitterTop = 1.21;
  } else if (emitterStyle === 'needle') {
    poly([[-.13, 1.00], [.13, 1.00], [.07, 1.29], [-.07, 1.29]], body);
    round(-.075, 1.27, .15, .07, .02, accentColor);
    emitterTop = 1.34;
  } else if (emitterStyle === 'halo') {
    round(-.16, 1.00, .32, .15, .02, body);
    ctx.strokeStyle = accentColor; ctx.lineWidth = .028;
    ctx.beginPath(); ctx.arc(0, 1.27, .20, 0, Math.PI * 2); ctx.stroke();
    for (const side of [-1, 1]) line(side * .13, 1.10, side * .19, 1.25, accentColor, .02);
    emitterTop = 1.30;
  } else if (emitterStyle === 'fork') {
    round(-.20, 1.00, .40, .14, .02, body);
    for (const side of [-1, 1]) poly([[side * .06, 1.06], [side * .20, 1.33], [side * .10, 1.08]], accentColor);
    emitterTop = 1.30;
  } else if (emitterStyle === 'shroud') {
    round(-.17, 1.00, .34, .18, .02, body);
    poly([[.06, 1.03], [.29, 1.06], [.27, 1.30], [.10, 1.26]], bodyDark);
    line(.13, 1.08, .24, 1.25, accentColor, .022);
    emitterTop = 1.27;
  } else {
    poly([[-.15, 1.00], [.15, 1.00], [.19, 1.17], [-.19, 1.17]], body);
    line(-.19, 1.16, .19, 1.16, accentColor, .024);
  }
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.shadowColor = crystalColor; ctx.shadowBlur = 10;
  ellipse(0, 1.05, .055, .085, crystalColor);
  ctx.fillStyle = '#ffffff';
  ellipse(0, 1.05, .018, .045, '#ffffff');
  ctx.restore();

  if (bladeOn && reveal > .01) drawDuelFlatBlade(ctx, spec, emitterTop, reveal);

  ctx.restore();
}
function drawDuelFlatBlade(ctx, spec, base, reveal = 1) {
  const color = spec.crystal.color;
  const style = spec.blade.style;
  const fullLength = style === 'long' ? 4.08 : style === 'crossguard' ? 3.42 : style === 'fine' ? 3.62 : 3.56;
  const length = fullLength * Math.max(0, Math.min(1, reveal));
  const widthFactor = Math.max(.72, Math.min(1.45, (spec.blade.width || .092) / .092));
  const tip = base + length;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  ctx.shadowColor = color;
  ctx.shadowBlur = 20;
  ctx.strokeStyle = `rgba(${hexToRgb(color)},.34)`;
  ctx.lineWidth = .145 * widthFactor;
  ctx.beginPath(); ctx.moveTo(0, base); ctx.lineTo(0, tip); ctx.stroke();
  ctx.shadowBlur = 12;
  ctx.strokeStyle = color;
  ctx.lineWidth = .078 * widthFactor;
  ctx.beginPath(); ctx.moveTo(0, base); ctx.lineTo(0, tip); ctx.stroke();
  ctx.shadowBlur = 5;
  ctx.strokeStyle = 'rgba(255,255,255,.92)';
  ctx.lineWidth = .027 * widthFactor;
  ctx.beginPath(); ctx.moveTo(0, base); ctx.lineTo(0, tip); ctx.stroke();
  ctx.shadowBlur = 12;
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(0, tip, .06 * widthFactor, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(0, tip - .01, .025 * widthFactor, 0, Math.PI * 2); ctx.fill();
  if (style === 'crossguard') {
    for (const side of [-1, 1]) {
      ctx.strokeStyle = `rgba(${hexToRgb(color)},.55)`;
      ctx.lineWidth = .10 * widthFactor;
      ctx.beginPath(); ctx.moveTo(side * .08, base + .17); ctx.lineTo(side * .48, base + .03); ctx.stroke();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = .022;
      ctx.beginPath(); ctx.moveTo(side * .08, base + .17); ctx.lineTo(side * .48, base + .03); ctx.stroke();
    }
  } else if (style === 'prismatic') {
    ctx.shadowBlur = 8;
    for (const off of [-.024, .024]) {
      ctx.strokeStyle = 'rgba(255,255,255,.55)';
      ctx.lineWidth = .012;
      ctx.beginPath(); ctx.moveTo(off, base + .1); ctx.lineTo(off * 1.8, tip - .15); ctx.stroke();
    }
    for (let i = 1; i < 5; i++) {
      ctx.fillStyle = 'rgba(255,255,255,.72)';
      ctx.beginPath(); ctx.arc((i % 2 ? .035 : -.035), base + length * (i / 5), .022, 0, Math.PI * 2); ctx.fill();
    }
  } else if (style === 'pulse') {
    for (let i = 1; i < 8; i++) {
      const py = base + length * (i / 8);
      ctx.strokeStyle = 'rgba(255,255,255,.78)';
      ctx.lineWidth = .015;
      ctx.beginPath(); ctx.ellipse(0, py, .075 * widthFactor, .022, 0, 0, Math.PI * 2); ctx.stroke();
    }
  }
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Duel flow and turn-based combat
// ---------------------------------------------------------------------------
function buildDuelPlayer() {
  const artifact = duel.selectedArtifact;
  const spec = duel.selectedSpec;
  const level = duel.record.level;
  const maxHp = 110 + (level - 1) * 16;
  duel.player = {
    side: 'player', name: artifact.name, level,
    rank: duelRank(level), spec,
    hp: maxHp, maxHp, force: 45, maxForce: 100,
    attack: 13 + level * 2,
    stance: DUEL_STANCES[duel.stance]
  };
}
function buildDuelOpponent() {
  const record = duel.record;
  const tier = Math.min(7, Math.floor(record.wins / 2));
  const identity = makeDuelOpponentIdentity();
  const stance = DUEL_STANCES[duelPick(Object.keys(DUEL_STANCES))];
  const artifact = { id: `foe-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, name: identity.name, blade: true, parts: identity.parts };
  const spec = duelSpecFromArtifact(artifact);
  const maxHp = Math.round(84 + record.level * 12 + Math.min(record.wins, 18) * 4 + tier * 2);
  const foe = {
    side: 'enemy', name: identity.name, title: duelPick(DUEL_TITLES), form: `${stance.form} · ${stance.name.toUpperCase()}`,
    spec, hp: maxHp, maxHp, focus: 20,
    attack: 8.4 + record.level * 1.55 + Math.min(record.wins, 20) * .38,
    intent: 'attack', defeated: false
  };
  duel.enemy = foe;
  return foe;
}
function startDuel() {
  if (!duel.selectedArtifact) return;
  if (!DUEL_STANCES[duel.stance]) duel.stance = 'shii';
  clearDuelMatchTimers();
  duel.token++;
  duel.screen = 'arena';
  duel.round = 1;
  duel.busy = false;
  duel.over = false;
  duel.playerBlocked = false;
  duel.anim.player = { kind: '', start: -99, dur: .9 };
  duel.anim.enemy = { kind: '', start: -99, dur: .9 };
  duel.fx.hitPlayer = -99; duel.fx.hitEnemy = -99; duel.fx.clash = -99; duel.fx.shake = -99;
  duel.fx.waves.length = 0; duel.fx.floaters.length = 0; duel.fx.sparks.length = 0;
  duel.log.length = 0;
  $('duelLobby').hidden = true;
  $('duelMatch').hidden = true;
  $('duelArena').hidden = false;
  $('duelResult').classList.remove('is-open');
  $('duelResult').setAttribute('aria-hidden', 'true');
  buildDuelPlayer();
  const foe = duel.matchOpponent || buildDuelOpponent();
  duel.enemy = foe;
  duel.matchOpponent = null;
  duel.introStart = performance.now() / 1000 + .12;
  duel.player.name = duel.selectedArtifact.name;
  rollDuelIntent();
  updateDuelBattleUI(true);
  renderDuelLog();
  addDuelLog(`You enter the ring against ${foe.name}.`);
  requestAnimationFrame(() => {
    resizeDuelCanvas();
    requestAnimationFrame(() => {
      resizeDuelCanvas();
      startDuelLoop();
      announceDuel('ROUND 01 · ENGAGE', '');
      playTone(560, .1);
      duelDelay(320, () => playTone(840, .13));
    });
  });
}
function rollDuelIntent() {
  const enemy = duel.enemy;
  if (!enemy) return;
  let intent;
  const roll = Math.random();
  if (enemy.focus >= 62 && roll < .46) intent = 'force';
  else if (roll < .12) intent = 'block';
  else if (roll < .4) intent = 'heavy';
  else intent = 'attack';
  enemy.intent = intent;
  if (intent === 'force') enemy.focus = Math.max(0, enemy.focus - 62);
  else enemy.focus = Math.min(100, enemy.focus + 14);
}
function updateDuelBattleUI(force = false) {
  const p = duel.player, e = duel.enemy;
  if (!p || !e) return;
  $('duelRound').textContent = String(duel.round).padStart(2, '0');
  $('duelPlayerName').textContent = p.name;
  $('duelPlayerRank').textContent = p.rank.toUpperCase();
  $('duelEnemyName').textContent = e.name;
  $('duelEnemyTier').textContent = e.title;
  $('duelPlayerHpFill').style.width = `${Math.max(0, p.hp / p.maxHp * 100)}%`;
  $('duelPlayerHpText').textContent = `${Math.max(0, Math.ceil(p.hp))} / ${p.maxHp}`;
  $('duelPlayerForceFill').style.width = `${Math.max(0, p.force / p.maxForce * 100)}%`;
  $('duelPlayerForceText').textContent = `FORCE ${Math.round(p.force)} / ${p.maxForce}`;
  $('duelPlayerStance').textContent = `${p.stance.form} · ${p.stance.name.toUpperCase()}`;
  $('duelEnemyHpFill').style.width = `${Math.max(0, e.hp / e.maxHp * 100)}%`;
  $('duelEnemyHpText').textContent = `${Math.max(0, Math.ceil(e.hp))} / ${e.maxHp}`;
  $('duelEnemyForceFill').style.width = `${Math.max(0, e.focus)}%`;
  $('duelEnemyForceText').textContent = `FOCUS ${Math.round(e.focus)}`;
  $('duelEnemyStance').textContent = e.form;
  document.querySelector('.duel-hud-player').style.setProperty('--duel-color', p.spec.crystal.color);
  document.querySelector('.duel-hud-enemy').style.setProperty('--duel-enemy-color', e.spec.crystal.color);
  $('duelArenaOpponent').textContent = `${e.name} · ${e.title}`;
  const intentMap = {
    attack: { label: 'Closing in · basic strike', cls: '' },
    heavy: { label: 'Winding up · heavy strike', cls: 'is-heavy' },
    block: { label: 'Guard raised · strikes will be deflected', cls: 'is-block' },
    force: { label: 'Reaching out · Force push', cls: 'is-force' }
  };
  const intent = intentMap[e.intent] || intentMap.attack;
  const intentEl = $('duelIntent');
  intentEl.className = `duel-intent ${duel.playerBlocked ? 'is-staggered' : intent.cls}`;
  intentEl.innerHTML = `<span class="eyebrow">OPPONENT INTENT</span><b>${duel.busy ? 'The exchange is in motion…' : intent.label}</b>`;
  updateDuelActionButtons();
  if (force) updateDuelProfileUI();
}
function updateDuelActionButtons() {
  const busy = duel.busy || duel.over;
  document.querySelectorAll('#duelActions .duel-action').forEach(button => {
    const isForce = button.dataset.duelAction === 'force';
    const needsForce = isForce && (!duel.player || duel.player.force < 35);
    button.disabled = busy || needsForce;
    button.title = needsForce ? 'Requires 35 Force' : '';
  });
}
function addDuelLog(text, type = '') {
  duel.log.unshift({ text, type });
  if (duel.log.length > 6) duel.log.length = 6;
  renderDuelLog();
}
function renderDuelLog() {
  const log = $('duelLog');
  log.replaceChildren();
  duel.log.forEach(entry => {
    const row = document.createElement('div');
    row.className = entry.type;
    row.textContent = entry.text;
    log.append(row);
  });
}
function announceDuel(text, type = '') {
  const element = $('duelAnnounce');
  element.textContent = text;
  element.className = `duel-announce show ${type}`.trim();
  clearTimeout(duel.announceTimer);
  duel.announceTimer = setTimeout(() => element.classList.remove('show'), 1700);
}
function duelDelay(ms, callback) {
  const token = duel.token;
  return setTimeout(() => {
    if (!duel.open || duel.screen !== 'arena' || duel.token !== token) return;
    callback();
  }, ms);
}
function addDuelFloater(x, y, text, color, size = 16) {
  duel.fx.floaters.push({ x, y, text, color, size, start: performance.now() / 1000, dur: 1.1 });
}
function addDuelSparks(x, y, color, count = 12) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2, speed = 40 + Math.random() * 160;
    duel.fx.sparks.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 30, color, life: .3 + Math.random() * .45, maxLife: .75, size: 1 + Math.random() * 2.4 });
  }
}
function addDuelWave(x, y, color) {
  duel.fx.waves.push({ x, y, color, start: performance.now() / 1000, dur: .7 });
}
function duelLayout() {
  const w = duel.w, h = duel.h;
  const floorY = h * .82;
  const charH = Math.min(h * .44, 300);
  return { w, h, floorY, charH, playerX: w * .30, enemyX: w * .70, scale: charH / 6.15 };
}
function duelCharacterPoint(side) {
  const layout = duelLayout();
  const x = side === 'player' ? layout.playerX : layout.enemyX;
  return { x, y: layout.floorY - layout.charH * .64 };
}
function triggerDuelAnim(side, kind) {
  const durations = { attack: .92, heavy: 1.12, block: .78, force: .96 };
  duel.anim[side] = { kind, start: performance.now() / 1000, dur: durations[kind] || .9 };
}
function resolvePlayerHit(amount, label, crit = false) {
  const e = duel.enemy;
  if (!e || e.hp <= 0) return;
  e.hp = Math.max(0, e.hp - amount);
  const point = duelCharacterPoint('enemy');
  addDuelFloater(point.x + duelRand(-16, 16), point.y - 22, `-${amount}`, crit ? '#ffe45c' : '#ff8d7e', crit ? 19 : 16);
  addDuelSparks(point.x, point.y + 24, duel.player.spec.crystal.color, crit ? 20 : 12);
  duel.fx.hitEnemy = performance.now() / 1000;
  duel.fx.shake = performance.now() / 1000;
  playTone(crit ? 350 : 300, .09);
  addDuelLog(`${crit ? 'Critical! ' : ''}${label} deals ${amount} damage.`, 'is-good');
  updateDuelBattleUI();
  if (e.hp <= 0) endDuelVictory();
}
function resolveEnemyHit(amount, label, type = 'attack') {
  const p = duel.player;
  if (!p || p.hp <= 0) return;
  let damage = amount;
  let riposte = 0;
  if (duel.playerBlocked) {
    damage = Math.max(1, Math.round(damage * (1 - p.stance.guard) * p.stance.taken));
    if (type !== 'force') riposte = Math.round((4 + p.level * .9) * p.stance.damage);
    addDuelSparks(duelCharacterPoint('player').x + 28, duelCharacterPoint('player').y + 14, p.spec.crystal.color, 14);
    duel.fx.clash = performance.now() / 1000;
    duel.fx.clashX = duelCharacterPoint('player').x + 42;
    duel.fx.clashY = duelCharacterPoint('player').y + 5;
    playTone(780, .05);
  } else {
    damage = Math.round(damage * p.stance.taken);
  }
  p.hp = Math.max(0, p.hp - damage);
  const point = duelCharacterPoint('player');
  addDuelFloater(point.x + duelRand(-14, 14), point.y - 22, `-${damage}`, '#ff8e83', 16);
  duel.fx.hitPlayer = performance.now() / 1000;
  duel.fx.shake = performance.now() / 1000;
  playTone(180, .11);
  addDuelLog(duel.playerBlocked ? `${label} is caught on your guard for ${damage}.` : `${label} lands for ${damage} damage.`, 'is-bad');
  if (riposte > 0) {
    const e = duel.enemy;
    e.hp = Math.max(0, e.hp - riposte);
    addDuelFloater(duelCharacterPoint('enemy').x, duelCharacterPoint('enemy').y - 12, `-${riposte}`, '#d8f36a', 13);
    addDuelLog(`Riposte cuts back for ${riposte}.`, 'is-good');
  }
  updateDuelBattleUI();
  if (p.hp <= 0) endDuelDefeat();
  else if (duel.enemy && duel.enemy.hp <= 0) endDuelVictory();
}
function playerDuelAction(action) {
  if (!duel.open || duel.screen !== 'arena' || duel.busy || duel.over) return;
  const p = duel.player, e = duel.enemy, stance = p.stance;
  if (!p || !e) return;
  if (action === 'force' && p.force < 35) { announceDuel('NOT ENOUGH FORCE', 'is-hit'); return; }
  duel.busy = true;
  duel.playerBlocked = false;
  updateDuelBattleUI();
  if (action === 'attack') {
    const guarded = e.intent === 'block';
    const amount = Math.max(3, Math.round(p.attack * stance.damage * duelRand(.9, 1.12) * (guarded ? .42 : 1)));
    const crit = Math.random() < (duel.stance === 'djem' ? .16 : .06);
    const finalAmount = crit ? Math.round(amount * 1.55) : amount;
    p.force = Math.min(p.maxForce, p.force + Math.round(12 * stance.force));
    triggerDuelAnim('player', 'attack');
    addDuelLog(guarded ? 'Your strike meets a raised guard.' : 'You step in with a clean strike.');
    duelDelay(390, () => resolvePlayerHit(finalAmount, guarded ? 'Deflected strike' : 'Strike', crit));
    duelDelay(1180, () => { if (!duel.over) enemyDuelTurn(); });
  } else if (action === 'heavy') {
    const guarded = e.intent === 'block';
    const hits = Math.random() < .76;
    const amount = Math.max(4, Math.round(p.attack * 2.1 * stance.damage * duelRand(.9, 1.1) * (guarded ? .35 : 1)));
    p.force = Math.min(p.maxForce, p.force + Math.round(8 * stance.force));
    triggerDuelAnim('player', 'heavy');
    addDuelLog('You wind up a heavy strike.');
    duelDelay(520, () => {
      if (hits) resolvePlayerHit(amount, guarded ? 'Deflected heavy strike' : 'Heavy strike');
      else {
        addDuelFloater(duelCharacterPoint('enemy').x, duelCharacterPoint('enemy').y + 4, 'MISS', '#a9b5a9', 14);
        addDuelLog('The heavy strike cuts air.', '');
        playTone(220, .07);
      }
    });
    duelDelay(1420, () => { if (!duel.over) enemyDuelTurn(); });
  } else if (action === 'block') {
    duel.playerBlocked = true;
    p.force = Math.min(p.maxForce, p.force + Math.round(20 * stance.force));
    triggerDuelAnim('player', 'block');
    addDuelLog(`You set your guard. ${stance.name} absorbs the next exchange.`);
    updateDuelBattleUI();
    duelDelay(760, () => { if (!duel.over) enemyDuelTurn(); });
  } else if (action === 'force') {
    p.force = Math.max(0, p.force - 35);
    triggerDuelAnim('player', 'force');
    addDuelLog('You reach out and release a wave of Force.', 'is-force');
    const point = duelCharacterPoint('enemy');
    const amount = Math.round((10 + p.level * 1.5) * stance.damage * duelRand(.92, 1.12));
    duelDelay(340, () => {
      addDuelWave(point.x, point.y + 18, p.spec.crystal.color);
      addDuelSparks(point.x, point.y + 26, p.spec.crystal.color, 18);
      resolvePlayerHit(amount, 'Force push');
      if (!duel.over) {
        announceDuel('STAGGERED · ENEMY TURN LOST', 'is-force');
        addDuelLog('The push staggers your opponent — their next action is lost.', 'is-force');
        duelDelay(880, () => finishDuelRound(true));
      }
    });
  }
}
function enemyDuelTurn() {
  if (duel.over || !duel.open || duel.screen !== 'arena') return;
  const p = duel.player, e = duel.enemy;
  if (!e || e.hp <= 0 || p.hp <= 0) return;
  const intent = e.intent;
  updateDuelBattleUI();
  if (intent === 'block') {
    addDuelLog(`${e.name} holds a high guard.`, '');
    duelDelay(500, () => finishDuelRound());
    return;
  }
  if (intent === 'force') {
    triggerDuelAnim('enemy', 'force');
    addDuelLog(`${e.name} gathers the Force.`, 'is-force');
    const point = duelCharacterPoint('player');
    duelDelay(430, () => {
      addDuelWave(point.x, point.y + 20, e.spec.crystal.color);
      const amount = e.attack * 1.22;
      p.force = Math.max(0, p.force - 15);
      resolveEnemyHit(amount, 'Force push', 'force');
      if (!duel.over) duelDelay(720, () => finishDuelRound());
    });
    return;
  }
  if (intent === 'heavy') {
    triggerDuelAnim('enemy', 'heavy');
    addDuelLog(`${e.name} winds up a heavy strike.`, 'is-bad');
    duelDelay(510, () => {
      if (Math.random() < .79) resolveEnemyHit(e.attack * 1.85, 'Heavy strike', 'heavy');
      else {
        addDuelFloater(duelCharacterPoint('player').x, duelCharacterPoint('player').y + 2, 'MISS', '#a9b5a9', 14);
        addDuelLog(`${e.name}'s heavy strike misses.`, '');
      }
      if (!duel.over) duelDelay(760, () => finishDuelRound());
    });
    return;
  }
  triggerDuelAnim('enemy', 'attack');
  addDuelLog(`${e.name} presses forward.`, 'is-bad');
  duelDelay(400, () => {
    resolveEnemyHit(e.attack * duelRand(.9, 1.12), 'Strike', 'attack');
    if (!duel.over) duelDelay(620, () => finishDuelRound());
  });
}
function finishDuelRound(forcePush = false) {
  if (duel.over || !duel.open || duel.screen !== 'arena') return;
  duel.player.force = Math.min(duel.player.maxForce, duel.player.force + 5);
  duel.playerBlocked = false;
  duel.round += 1;
  duel.busy = false;
  rollDuelIntent();
  updateDuelBattleUI();
  addDuelLog(`Round ${duel.round}. Read your opponent.`, '');
  announceDuel(forcePush ? `ROUND ${String(duel.round).padStart(2, '0')} · RESET` : `ROUND ${String(duel.round).padStart(2, '0')}`, '');
}
function gainDuelXp(amount) {
  const record = duel.record;
  record.xp += amount;
  let levels = 0;
  while (record.xp >= duelXpNeeded(record.level)) {
    record.xp -= duelXpNeeded(record.level);
    record.level += 1;
    levels += 1;
  }
  return levels;
}
function endDuelVictory() {
  if (duel.over) return;
  duel.over = true;
  duel.busy = true;
  duel.enemy.defeated = true;
  updateDuelBattleUI();
  const record = duel.record;
  const xpGain = 24 + Math.floor(record.wins / 2) * 4 + Math.min(record.streak, 5) * 2;
  record.wins += 1;
  record.streak += 1;
  record.bestStreak = Math.max(record.bestStreak, record.streak);
  const levels = gainDuelXp(xpGain);
  saveDuelRecord();
  playTone(760, .12);
  announceDuel('VICTORY', '');
  addDuelLog(`${duel.enemy.name} yields. +${xpGain} XP.`, 'is-good');
  updateDuelProfileUI();
  duelDelay(760, () => showDuelResult('victory', xpGain, levels));
}
function endDuelDefeat() {
  if (duel.over) return;
  duel.over = true;
  duel.busy = true;
  updateDuelBattleUI();
  const record = duel.record;
  record.losses += 1;
  record.streak = 0;
  saveDuelRecord();
  playTone(150, .2);
  announceDuel('THE RING WINS THIS ROUND', 'is-hit');
  addDuelLog('You are disarmed. The lesson is yours.', 'is-bad');
  updateDuelProfileUI();
  duelDelay(900, () => showDuelResult('defeat', 0, 0));
}
function showDuelResult(kind, xpGain, levels) {
  const record = duel.record;
  const victory = kind === 'victory';
  const card = document.querySelector('.duel-result-card');
  card.className = `duel-result-card is-${kind}${levels > 0 ? ' is-levelup' : ''}`;
  $('duelResultEyebrow').textContent = victory ? (levels > 0 ? 'A NEW RANK' : 'ROUND COMPLETE · VICTORY') : 'ROUND COMPLETE · DEFEAT';
  $('duelResultTitle').innerHTML = victory
    ? (levels > 0 ? `Level <em>${record.level}.</em>` : 'Victory in the <em>ring.</em>')
    : 'The ring wins <em>this round.</em>';
  $('duelResultCopy').textContent = victory
    ? `${duel.enemy.name} yields. ${levels > 0 ? `You reached level ${record.level} — your stance and footwork are sharper.` : 'Your record grows, and the next challenger is already watching.'}`
    : `${duel.enemy.name} found the opening. Shake out your blade and take the rematch when you are ready.`;
  $('duelResultXp').textContent = victory ? `+${xpGain}` : '+0';
  $('duelResultLevel').textContent = String(record.level).padStart(2, '0');
  $('duelResultStreak').textContent = String(record.streak).padStart(2, '0');
  $('duelNext').innerHTML = victory ? 'NEXT DUEL <span>↗</span>' : 'REMATCH <span>↗</span>';
  $('duelResult').classList.add('is-open');
  $('duelResult').setAttribute('aria-hidden', 'false');
  duel.resultKind = kind;
  if (levels > 0) playTone(920, .16);
}
function nextDuelFromResult() {
  if (!duel.open) return;
  $('duelResult').classList.remove('is-open');
  $('duelResult').setAttribute('aria-hidden', 'true');
  beginDuelMatchmaking();
}

// ---------------------------------------------------------------------------
// Duel canvas rendering
// ---------------------------------------------------------------------------
function startDuelLoop() {
  if (duel.raf) return;
  duel.lastFrame = 0;
  duel.raf = requestAnimationFrame(duelLoop);
}
function stopDuelLoop() {
  if (duel.raf) cancelAnimationFrame(duel.raf);
  duel.raf = 0;
}
function resizeDuelCanvas() {
  if (duel.screen !== 'arena') return;
  const width = Math.max(1, $('duelStage').clientWidth);
  const height = Math.max(1, $('duelStage').clientHeight);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  duelCanvas.width = Math.round(width * dpr);
  duelCanvas.height = Math.round(height * dpr);
  duelCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  duel.w = width; duel.h = height; duel.dpr = dpr;
  duel.bg = buildDuelBackdrop(width, height, dpr, duel.player?.spec.crystal.color || '#d8f36a');
}
function buildDuelBackdrop(width, height, dpr, bladeColor) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * dpr));
  canvas.height = Math.max(1, Math.round(height * dpr));
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const floorY = height * .82;
  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, '#1a2821');
  bg.addColorStop(.46, '#101812');
  bg.addColorStop(1, '#070b08');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, width, height);
  let seed = 1337;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  for (let i = 0; i < 46; i++) {
    const x = random() * width, y = random() * floorY * .82;
    const size = random() < .8 ? .8 : 1.6;
    ctx.fillStyle = `rgba(216,243,106,${.06 + random() * .16})`;
    ctx.fillRect(x, y, size, size);
  }
  const skyline = ctx.createLinearGradient(0, floorY - height * .22, 0, floorY);
  skyline.addColorStop(0, '#101a14');
  skyline.addColorStop(1, '#080e0a');
  for (let i = 0; i < 17; i++) {
    const w = width * (.025 + random() * .06);
    const x = random() * (width + 40) - 20;
    const h = height * (.05 + random() * .18);
    ctx.fillStyle = skyline;
    ctx.fillRect(x, floorY - h, w, h);
    for (let wY = floorY - h + 7; wY < floorY - 5; wY += 11) {
      for (let wX = x + 5; wX < x + w - 4; wX += 8) {
        if (random() < .22) {
          ctx.fillStyle = 'rgba(216,243,106,.11)';
          ctx.fillRect(wX, wY, 2, 2);
        }
      }
    }
  }
  const floor = ctx.createLinearGradient(0, floorY, 0, height);
  floor.addColorStop(0, '#1a251e');
  floor.addColorStop(.35, '#111a14');
  floor.addColorStop(1, '#090d0b');
  ctx.fillStyle = floor;
  ctx.fillRect(0, floorY, width, height - floorY);
  ctx.strokeStyle = 'rgba(216,243,106,.24)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, floorY + .5); ctx.lineTo(width, floorY + .5); ctx.stroke();
  ctx.save();
  ctx.beginPath(); ctx.rect(0, floorY, width, height - floorY); ctx.clip();
  const vanishX = width / 2, vanishY = floorY - 12;
  for (let i = -8; i <= 8; i++) {
    const bottomX = width / 2 + i * width * .095;
    ctx.strokeStyle = 'rgba(180,204,160,.075)';
    ctx.beginPath(); ctx.moveTo(vanishX, vanishY); ctx.lineTo(bottomX, height + 16); ctx.stroke();
  }
  for (let i = 1; i <= 5; i++) {
    const y = floorY + Math.pow(i / 5, 1.7) * (height - floorY);
    ctx.strokeStyle = 'rgba(180,204,160,.06)';
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
  }
  ctx.restore();
  // Ring platform: a dark disc banded with faint concentric guide lines.
  const ringCX = width * .5, ringCY = floorY + 6, ringRX = width * .29, ringRY = height * .045;
  ctx.save();
  ctx.beginPath(); ctx.ellipse(ringCX, ringCY, ringRX, ringRY, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(8,13,10,.52)'; ctx.fill();
  ctx.clip();
  for (let i = 1; i <= 3; i++) {
    ctx.strokeStyle = `rgba(216,243,106,${.035 + i * .02})`;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(ringCX, ringCY, ringRX * i / 4, ringRY * i / 4, 0, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
  // Rim ticks read as an engraved training ring rather than a plain outline.
  for (let i = 0; i < 56; i++) {
    const angle = i / 56 * Math.PI * 2;
    const major = i % 7 === 0;
    const inner = major ? .955 : .978;
    ctx.strokeStyle = `rgba(216,243,106,${major ? .26 : .13})`;
    ctx.lineWidth = major ? 1.3 : 1;
    ctx.beginPath();
    ctx.moveTo(ringCX + Math.cos(angle) * ringRX * inner, ringCY + Math.sin(angle) * ringRY * inner);
    ctx.lineTo(ringCX + Math.cos(angle) * ringRX, ringCY + Math.sin(angle) * ringRY);
    ctx.stroke();
  }
  ctx.save();
  ctx.strokeStyle = 'rgba(216,243,106,.3)';
  ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.ellipse(ringCX, ringCY, ringRX, ringRY, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = 'rgba(216,243,106,.1)';
  ctx.beginPath(); ctx.ellipse(width * .5, floorY + 8, width * .23, height * .032, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
  // Faded floor stencil at the front of the platform.
  ctx.save();
  ctx.translate(ringCX, ringCY + ringRY * .42);
  ctx.scale(1, .42);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `600 ${Math.max(8, Math.round(width * .0082))}px "IBM Plex Mono", monospace`;
  ctx.fillStyle = 'rgba(216,243,106,.15)';
  ctx.fillText('RING 07 · ATELIER', 0, 0);
  ctx.restore();
  for (const x of [width * .18, width * .82]) {
    const beam = ctx.createLinearGradient(0, floorY - 150, 0, floorY);
    beam.addColorStop(0, 'rgba(120,170,140,0)');
    beam.addColorStop(1, 'rgba(120,170,140,.055)');
    ctx.fillStyle = beam;
    ctx.beginPath(); ctx.moveTo(x - 26, floorY); ctx.lineTo(x + 26, floorY); ctx.lineTo(x + 50, 0); ctx.lineTo(x - 50, 0); ctx.closePath(); ctx.fill();
  }
  // Low haze where the ring lights meet the floor.
  const mist = ctx.createLinearGradient(0, floorY - height * .12, 0, floorY + height * .16);
  mist.addColorStop(0, 'rgba(158,190,168,0)');
  mist.addColorStop(.45, 'rgba(158,190,168,.028)');
  mist.addColorStop(1, 'rgba(158,190,168,0)');
  ctx.fillStyle = mist; ctx.fillRect(0, floorY - height * .12, width, height * .28);
  // Freestanding work lights frame the ring without crowding the HUD.
  for (const side of [-1, 1]) {
    const lx = width * .5 + side * width * .375;
    const baseY = floorY + 4;
    const headY = floorY - height * .30;
    ctx.strokeStyle = 'rgba(168,190,172,.17)';
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(lx, baseY); ctx.lineTo(lx, headY + 9); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(lx - 9, baseY); ctx.lineTo(lx, baseY - 5); ctx.lineTo(lx + 9, baseY); ctx.stroke();
    ctx.save();
    ctx.translate(lx, headY);
    ctx.rotate(side * .46);
    ctx.fillStyle = '#131b16';
    ctx.strokeStyle = 'rgba(170,196,176,.2)';
    ctx.beginPath(); ctx.rect(-8, -8, 16, 16); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(236,255,180,.8)';
    ctx.fillRect(-5, 2, 10, 2);
    const headGlow = ctx.createRadialGradient(0, 4, 1, 0, 4, 34);
    headGlow.addColorStop(0, 'rgba(232,250,170,.2)');
    headGlow.addColorStop(.45, 'rgba(216,243,106,.07)');
    headGlow.addColorStop(1, 'rgba(216,243,106,0)');
    ctx.fillStyle = headGlow;
    ctx.beginPath(); ctx.arc(0, 4, 34, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  const glow = ctx.createRadialGradient(width * .5, floorY - 70, 8, width * .5, floorY - 70, width * .42);
  glow.addColorStop(0, `rgba(${hexToRgb(bladeColor)},.11)`);
  glow.addColorStop(.55, `rgba(${hexToRgb(bladeColor)},.035)`);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, width, height);
  return canvas;
}
function duelPose(side, now) {
  const facing = side === 'player' ? 1 : -1;
  const rest = facing === 1 ? -1.02 : -2.12;
  const anim = duel.anim[side];
  const raw = anim.kind ? (now - anim.start) / anim.dur : 1;
  const p = Math.max(0, Math.min(1, raw));
  const kind = anim.kind && raw < 1 ? anim.kind : '';
  let angle = rest, handForward = 0, handRaise = 0, shield = 0;
  if (kind === 'attack' || kind === 'heavy') {
    const windup = rest - facing * (kind === 'heavy' ? .68 : .44);
    const target = facing === 1 ? (kind === 'heavy' ? .46 : .18) : (kind === 'heavy' ? -3.14 : -2.96);
    if (p < .27) angle = rest + (windup - rest) * (p / .27);
    else if (p < .57) angle = windup + (target - windup) * duelEaseOut((p - .27) / .3);
    else angle = target + (rest - target) * duelEaseInOut((p - .57) / .43);
    const reach = Math.sin(Math.min(1, p / .78) * Math.PI);
    handForward = reach * .07;
    handRaise = reach * .035;
  } else if (kind === 'block') {
    angle = facing === 1 ? -1.64 : -1.50;
    const brace = Math.sin(Math.min(1, p / .9) * Math.PI);
    handForward = brace * .025;
    handRaise = brace * .02;
    shield = brace;
  } else if (kind === 'force') {
    angle = rest;
    const reach = Math.sin(Math.min(1, p / .72) * Math.PI);
    handForward = reach * .10;
    handRaise = reach * .025;
  }
  return { angle: angle + Math.sin(now * 1.8 + (side === 'player' ? 0 : 1.9)) * .012, handForward, handRaise, kind, p, shield };
}
function drawDuelFighter(side, now) {
  const layout = duelLayout();
  const ctx = duelCtx;
  const player = side === 'player';
  const fighter = player ? duel.player : duel.enemy;
  if (!fighter) return;
  const facing = player ? 1 : -1;
  const x = player ? layout.playerX : layout.enemyX;
  const footY = layout.floorY;
  const height = layout.charH;
  const spec = fighter.spec;
  const pose = duelPose(side, now);
  const defeated = fighter.hp <= 0;
  const hitStart = player ? duel.fx.hitPlayer : duel.fx.hitEnemy;
  const hit = Math.max(0, 1 - (now - hitStart) / .36);
  const ignition = duel.introStart
    ? duelEaseOut((now - duel.introStart - (player ? 0 : .16)) / .72)
    : 1;
  const bladeReveal = defeated ? 1 : ignition;
  const palette = player
    ? { robe: '#26332b', robeLight: '#3a4a3c', robeDark: '#17201a', pants: '#1b241e', glove: '#2f3b31', trim: spec.crystal.color, face: '#8f8474', visor: spec.crystal.color }
    : { robe: '#271b1e', robeLight: '#3c292d', robeDark: '#160f11', pants: '#1b1214', glove: '#322326', trim: '#ff5b6b', face: '#6f5551', visor: '#ff6b78' };
  ctx.save();
  if (defeated) {
    ctx.translate(x, footY);
    ctx.rotate(facing * .13);
    ctx.scale(1, .9);
    ctx.translate(-x, -footY);
  }
  const scale = layout.scale;
  const shoulderX = x + facing * height * .045;
  const shoulderY = footY - height * .74;
  const hipY = footY - height * .44;
  const waistY = footY - height * .55;
  const headY = footY - height * .86;
  const baseHandX = x + facing * height * .16;
  const baseHandY = footY - height * .51;
  const handX = baseHandX + facing * pose.handForward * height;
  const handY = baseHandY - pose.handRaise * height;
  const headRadius = height * .062;
  ctx.fillStyle = 'rgba(0,0,0,.36)';
  ctx.beginPath(); ctx.ellipse(x, footY + 3, height * .18, height * .026, 0, 0, Math.PI * 2); ctx.fill();
  const legColor = palette.pants, bootColor = palette.robeDark;
  const backFootX = x - height * .145, frontFootX = x + height * .15;
  const backKneeX = x - height * .10, frontKneeX = x + height * .09;
  ctx.lineCap = 'round';
  ctx.strokeStyle = legColor; ctx.lineWidth = height * .047;
  ctx.beginPath(); ctx.moveTo(x - height * .045, hipY); ctx.lineTo(backKneeX, footY - height * .22); ctx.lineTo(backFootX, footY - 2); ctx.stroke();
  ctx.strokeStyle = palette.pants; ctx.lineWidth = height * .052;
  ctx.beginPath(); ctx.moveTo(x + height * .04, hipY); ctx.lineTo(frontKneeX, footY - height * .22); ctx.lineTo(frontFootX, footY - 2); ctx.stroke();
  ctx.fillStyle = bootColor;
  ctx.beginPath(); ctx.ellipse(backFootX - height * .02, footY - 1, height * .075, height * .025, -.08, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(frontFootX + height * .018, footY - 1, height * .085, height * .027, -.08, 0, Math.PI * 2); ctx.fill();
  if (!player) {
    ctx.fillStyle = palette.robeDark;
    ctx.beginPath();
    ctx.moveTo(shoulderX - facing * height * .05, shoulderY - height * .02);
    ctx.quadraticCurveTo(x - facing * height * .16, footY - height * .42, x - facing * height * .24, footY - height * .07);
    ctx.quadraticCurveTo(x - facing * height * .1, footY - height * .14, x + facing * height * .07, hipY);
    ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = palette.robe;
  ctx.beginPath();
  ctx.moveTo(shoulderX - height * .095, shoulderY + height * .012);
  ctx.quadraticCurveTo(x - height * .115, shoulderY + height * .13, x - height * .09, waistY);
  ctx.lineTo(x - height * .085, hipY + height * .035);
  ctx.lineTo(x + height * .085, hipY + height * .035);
  ctx.lineTo(x + height * .09, waistY);
  ctx.quadraticCurveTo(x + height * .115, shoulderY + height * .13, shoulderX + height * .095, shoulderY + height * .012);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = palette.robeLight; ctx.lineWidth = height * .012;
  ctx.beginPath(); ctx.moveTo(x + facing * height * .015, shoulderY + height * .03); ctx.lineTo(x + facing * height * .02, waistY); ctx.stroke();
  ctx.fillStyle = palette.trim;
  ctx.fillRect(x - height * .077, hipY + height * .008, height * .154, height * .013);
  ctx.fillStyle = palette.robeLight;
  for (const sideOffset of [-1, 1]) {
    ctx.beginPath(); ctx.ellipse(shoulderX + sideOffset * height * .065, shoulderY + height * .01, height * .055, height * .026, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.strokeStyle = palette.robeDark; ctx.lineWidth = height * .038;
  ctx.beginPath(); ctx.moveTo(shoulderX - facing * height * .04, shoulderY + height * .025); ctx.lineTo(x - facing * height * .055, waistY + height * .06); ctx.stroke();
  ctx.fillStyle = palette.robeDark;
  ctx.beginPath();
  ctx.moveTo(shoulderX - height * .09, shoulderY + height * .02);
  ctx.quadraticCurveTo(x - height * .12, headY - height * .01, x - height * .07, headY - headRadius * 1.7);
  ctx.quadraticCurveTo(x, headY - headRadius * 2.3, x + height * .07, headY - headRadius * 1.7);
  ctx.quadraticCurveTo(x + height * .12, headY - height * .01, shoulderX + height * .09, shoulderY + height * .02);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = palette.face;
  ctx.beginPath(); ctx.arc(x + facing * height * .018, headY, headRadius, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = palette.robeDark;
  ctx.beginPath(); ctx.arc(x + facing * height * .018, headY - headRadius * .15, headRadius * .86, Math.PI * 1.05, Math.PI * 2.05); ctx.fill();
  ctx.strokeStyle = palette.visor; ctx.lineWidth = height * .009;
  ctx.beginPath(); ctx.moveTo(x + facing * height * .01, headY + headRadius * .1); ctx.lineTo(x + facing * height * .065, headY + headRadius * .12); ctx.stroke();
  ctx.strokeStyle = palette.robeLight; ctx.lineWidth = height * .045;
  ctx.beginPath(); ctx.moveTo(shoulderX, shoulderY + height * .03); ctx.quadraticCurveTo(handX - facing * height * .02, handY + height * .04, handX, handY); ctx.stroke();
  ctx.strokeStyle = palette.glove; ctx.lineWidth = height * .032;
  ctx.beginPath(); ctx.moveTo(handX, handY); ctx.lineTo(handX + facing * height * .035, handY - height * .015); ctx.stroke();
  const dirX = Math.cos(pose.angle), dirY = Math.sin(pose.angle);
  const pommelX = handX - dirX * .62 * scale;
  const pommelY = handY - dirY * .62 * scale;
  drawDuelFlatSaber(ctx, spec, pommelX, pommelY, scale, pose.angle, !defeated, defeated ? .28 : 1, bladeReveal);
  ctx.fillStyle = palette.glove;
  ctx.beginPath(); ctx.arc(handX, handY, height * .026, 0, Math.PI * 2); ctx.fill();
  if (pose.shield > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = pose.shield * .22;
    ctx.strokeStyle = spec.crystal.color;
    ctx.lineWidth = 2;
    const guardX = x + facing * height * .16;
    const guardY = footY - height * .52;
    ctx.beginPath(); ctx.arc(guardX, guardY, height * .16, facing === 1 ? -1.2 : Math.PI - 1.2, facing === 1 ? 1.2 : Math.PI + 1.2); ctx.stroke();
    ctx.restore();
  }
  if (pose.kind === 'force' && pose.p < .8) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = `rgba(${hexToRgb(spec.crystal.color)},${.36 * (1 - pose.p)})`;
    ctx.beginPath(); ctx.arc(handX + facing * height * .035, handY, height * .055 * (1 + pose.p), 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  if (hit > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = `rgba(255,76,65,${hit * .22})`;
    ctx.beginPath(); ctx.ellipse(x, footY - height * .48, height * .17, height * .3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}
function drawDuelEffects(now) {
  const ctx = duelCtx;
  const clashAge = now - duel.fx.clash;
  if (clashAge >= 0 && clashAge < .38) {
    const t = clashAge / .38;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(duel.fx.clashX, duel.fx.clashY);
    for (let i = 0; i < 9; i++) {
      const angle = i / 9 * Math.PI * 2 + .3;
      const length = 10 + t * 28;
      ctx.strokeStyle = `rgba(255,245,190,${(1 - t) * .7})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(Math.cos(angle) * 4, Math.sin(angle) * 4); ctx.lineTo(Math.cos(angle) * length, Math.sin(angle) * length); ctx.stroke();
    }
    ctx.restore();
  }
  for (let i = duel.fx.waves.length - 1; i >= 0; i--) {
    const wave = duel.fx.waves[i];
    const t = (now - wave.start) / wave.dur;
    if (t >= 1) { duel.fx.waves.splice(i, 1); continue; }
    const radius = 12 + t * 95;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = `rgba(${hexToRgb(wave.color)},${(1 - t) * .55})`;
    ctx.lineWidth = 2.2 * (1 - t) + .6;
    ctx.beginPath(); ctx.ellipse(wave.x, wave.y, radius * 1.35, radius * .42, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = `rgba(255,255,255,${(1 - t) * .22})`;
    ctx.lineWidth = .8;
    ctx.beginPath(); ctx.ellipse(wave.x, wave.y, radius * 1.15, radius * .34, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const spark of duel.fx.sparks) {
    const alpha = Math.max(0, spark.life / spark.maxLife);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = spark.color;
    ctx.fillRect(spark.x - spark.size / 2, spark.y - spark.size / 2, spark.size, spark.size);
  }
  ctx.restore();
  for (const floater of duel.fx.floaters) {
    const age = now - floater.start;
    if (age >= floater.dur) continue;
    const t = age / floater.dur;
    ctx.save();
    ctx.globalAlpha = 1 - t;
    ctx.fillStyle = floater.color;
    ctx.font = `700 ${floater.size}px Manrope, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(floater.text, floater.x, floater.y - t * 32);
    ctx.restore();
  }
}
function drawDuelFrame(now) {
  if (!duel.w || !duel.h) return;
  const ctx = duelCtx;
  ctx.clearRect(0, 0, duel.w, duel.h);
  if (duel.bg) ctx.drawImage(duel.bg, 0, 0, duel.w, duel.h);
  // Motes drifting through the lamp light give the still frame some air.
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 30; i++) {
    const speed = .011 + (i % 7) * .0026;
    const drift = (now * speed + i * .137) % 1;
    const x = ((i * 61) % 97) / 97 * duel.w + Math.sin(now * .35 + i * 1.7) * 11;
    const y = duel.h * .1 + (1 - drift) * duel.h * .7;
    const twinkle = .5 + .5 * Math.sin(now * 1.8 + i * 2.3);
    ctx.fillStyle = `rgba(216,243,106,${.028 + twinkle * .058})`;
    ctx.fillRect(x, y, 1.1, 1.1);
  }
  const rimPulse = .5 + .5 * Math.sin(now * 2.1);
  ctx.strokeStyle = `rgba(216,243,106,${.035 + rimPulse * .045})`;
  ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.ellipse(duel.w * .5, duel.h * .82 + 6, duel.w * .29, duel.h * .045, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
  const shakeAge = now - duel.fx.shake;
  ctx.save();
  if (shakeAge >= 0 && shakeAge < .22) {
    const strength = (1 - shakeAge / .22) * 5;
    ctx.translate((Math.random() - .5) * strength, (Math.random() - .5) * strength);
  }
  const layout = duelLayout();
  const floorPulse = .5 + .5 * Math.sin(now * 2.1);
  for (const side of ['player', 'enemy']) {
    const fighter = side === 'player' ? duel.player : duel.enemy;
    if (!fighter || fighter.hp <= 0) continue;
    const x = side === 'player' ? layout.playerX : layout.enemyX;
    const grd = ctx.createRadialGradient(x, layout.floorY + 2, 2, x, layout.floorY + 2, layout.charH * .34);
    grd.addColorStop(0, `rgba(${hexToRgb(fighter.spec.crystal.color)},${.09 + floorPulse * .045})`);
    grd.addColorStop(1, `rgba(${hexToRgb(fighter.spec.crystal.color)},0)`);
    ctx.fillStyle = grd;
    ctx.beginPath(); ctx.ellipse(x, layout.floorY + 3, layout.charH * .35, layout.charH * .06, 0, 0, Math.PI * 2); ctx.fill();
  }
  drawDuelFighter('player', now);
  drawDuelFighter('enemy', now);
  drawDuelEffects(now);
  ctx.restore();
}
function updateDuelVisuals(now, delta) {
  for (let i = duel.fx.floaters.length - 1; i >= 0; i--) if (now - duel.fx.floaters[i].start >= duel.fx.floaters[i].dur) duel.fx.floaters.splice(i, 1);
  for (let i = duel.fx.sparks.length - 1; i >= 0; i--) {
    const spark = duel.fx.sparks[i];
    spark.life -= delta;
    if (spark.life <= 0) { duel.fx.sparks.splice(i, 1); continue; }
    spark.x += spark.vx * delta;
    spark.y += spark.vy * delta;
    spark.vy += 190 * delta;
    spark.vx *= .985;
  }
}
function duelLoop(timestamp) {
  if (!duel.open || duel.screen !== 'arena') { duel.raf = 0; return; }
  const now = timestamp / 1000;
  if (!duel.lastFrame) duel.lastFrame = now;
  const delta = Math.min(.05, Math.max(0, now - duel.lastFrame));
  duel.lastFrame = now;
  updateDuelVisuals(now, delta);
  drawDuelFrame(now);
  duel.raf = requestAnimationFrame(duelLoop);
}

// ---------------------------------------------------------------------------
// Wiring
// ---------------------------------------------------------------------------
$('duelClose').addEventListener('click', closeDuel);
$('duelArenaClose').addEventListener('click', backToDuelLobby);
$('duelBack').addEventListener('click', closeDuel);
$('duelStart').addEventListener('click', beginDuelMatchmaking);
$('duelMatchClose').addEventListener('click', cancelDuelMatchmaking);
$('duelMatchCancel').addEventListener('click', cancelDuelMatchmaking);
$('duelNext').addEventListener('click', nextDuelFromResult);
$('duelLeave').addEventListener('click', backToDuelLobby);
$('duelEmptyBuild').addEventListener('click', () => {
  closeDuel();
  closeActivities();
  setStep(0);
  showToast('Finish and keep a saber, then return to the training ring.');
});
$('duelLoaner').addEventListener('click', () => {
  duel.loanerArtifact ||= makeDuelLoaner();
  duel.selectedArtifact = duel.loanerArtifact;
  duel.selectedSaberId = 'loaner';
  duel.selectedSpec = duelSpecFromArtifact(duel.loanerArtifact);
  saveDuelRecord();
  renderDuelLoadoutPreview();
  playTone(620, .07);
});
document.querySelectorAll('#duelActions .duel-action').forEach(button => {
  button.addEventListener('click', () => playerDuelAction(button.dataset.duelAction));
});
document.addEventListener('keydown', event => {
  if (!duel.open || duel.screen !== 'arena' || $('duelResult').classList.contains('is-open')) return;
  const keys = { 1: 'attack', 2: 'heavy', 3: 'block', 4: 'force' };
  if (keys[event.key]) { event.preventDefault(); playerDuelAction(keys[event.key]); }
});
new ResizeObserver(() => {
  if (duel.screen === 'arena') resizeDuelCanvas();
  else if (duel.open) resizeDuelPreview();
}).observe($('duelStage'));
new ResizeObserver(() => { if (duel.open && duel.screen === 'lobby') resizeDuelPreview(); }).observe($('duelSaberPreview'));
new ResizeObserver(() => { if (duel.open && duel.screen === 'match') resizeDuelMatchSabers(); }).observe($('duelMatch'));

animate();
