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
  $('finishButton').innerHTML = isLast ? 'FINISH & SELL <span>↗</span>' : 'NEXT PART <span>→</span>';
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
  renderer.render(scene, camera);
  if ($('saleOverlay').classList.contains('open')) auctionRenderer.render(auctionScene, auctionCamera);
}
renderSteps(); renderOptions(); updateUI(); syncBladeToggle(); rebuildSaber(); animate();
