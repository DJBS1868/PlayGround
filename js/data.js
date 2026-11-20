export const STARTING_STATE = {
  coins: 620,
  renown: 12,
  levels: {
    trowel: 1,
    sieve: 1,
    sonar: 1,
    brush: 1,
    water: 1,
    cloth: 1
  },
  collection: [],
  currentRelic: null,
  selectedSite: 0,
  totalEarned: 0,
  flags: {
    firstRelic: false,
    firstSale: false,
    tutorialDig: false,
    tutorialClean: false
  }
};

export const SITES = [
  {
    id: 'sunken-caravan',
    index: 1,
    name: 'The Sunken Caravan',
    shortName: 'Caravan',
    region: 'Sahara · Sector 07',
    coord: '24°N · 12°E',
    subtitle: 'A merchant train lost to the red wind, 1846.',
    unlock: 0,
    scene: 'dunes',
    palette: {
      skyTop: '#efbd75', skyBottom: '#f8dfb3', sun: '#f2b14c',
      far: '#d19757', mid: '#ba783f', near: '#8e512c', deep: '#5a321d',
      accent: '#f0c476'
    },
    artifacts: ['dinar', 'lamp', 'bell'],
    flavor: 'The dune moves eleven metres a year. Somewhere beneath it, a caravan still waits.'
  },
  {
    id: 'temple-of-salt',
    index: 2,
    name: 'Temple of Salt',
    shortName: 'Salt',
    region: 'Sinai · White Basin',
    coord: '29°N · 34°E',
    subtitle: 'A shrine swallowed by a salt flat, then forgotten.',
    unlock: 22,
    scene: 'salt',
    palette: {
      skyTop: '#b8d5cd', skyBottom: '#f0e6cb', sun: '#f1d28e',
      far: '#cfc7ab', mid: '#e1d8bf', near: '#b7a681', deep: '#756448',
      accent: '#69a89a'
    },
    artifacts: ['scarab', 'amphora', 'ibis'],
    flavor: 'Salt preserves everything — including the curses the priests carved into the door.'
  },
  {
    id: 'valley-of-whales',
    index: 3,
    name: 'Valley of Whales',
    shortName: 'Whales',
    region: 'Fayum · Bone Valley',
    coord: '29°N · 30°E',
    subtitle: 'An ocean that dried into a desert of bones.',
    unlock: 46,
    scene: 'whales',
    palette: {
      skyTop: '#eeae70', skyBottom: '#f6d7a8', sun: '#f2b35c',
      far: '#c47d4d', mid: '#a65e38', near: '#7e4328', deep: '#4d291b',
      accent: '#e3a45a'
    },
    artifacts: ['tooth', 'ammonite', 'pendant'],
    flavor: 'Forty million years ago this was a sea. The whales never learned to leave.'
  },
  {
    id: 'obsidian-tomb',
    index: 4,
    name: 'The Obsidian Tomb',
    shortName: 'Tomb',
    region: 'Libyan Desert · Black Glass',
    coord: '25°N · 25°E',
    subtitle: 'A sealed chamber beneath a field of black glass.',
    unlock: 72,
    scene: 'tomb',
    palette: {
      skyTop: '#cf8b5e', skyBottom: '#e7b98d', sun: '#e8a552',
      far: '#5c4033', mid: '#3e2b23', near: '#241a16', deep: '#120d0b',
      accent: '#b47a3d'
    },
    artifacts: ['mask', 'ring', 'disc'],
    flavor: 'The doorway was sealed from the inside. The expedition has decided not to discuss this.'
  }
];

export const ARTIFACTS = {
  dinar: {
    id: 'dinar',
    name: 'Umayyad Gold Dinar',
    shortName: 'Gold dinar',
    type: 'Coin',
    era: '711 CE · Damascus mint',
    material: 'Gold',
    rarity: 3,
    value: 380,
    fragility: 1,
    art: 'coin',
    tint: '#d5a23c',
    desc: 'A hand-struck dinar, its profile worn soft by a thousand hands. The inscription names a caliph and a promise.',
    provenance: 'Found in a leather purse knotted beneath a caravan axle.'
  },
  lamp: {
    id: 'lamp',
    name: 'Caravan Oil Lamp',
    shortName: 'Oil lamp',
    type: 'Vessel',
    era: '9th century · Ifriqiya',
    material: 'Terracotta',
    rarity: 2,
    value: 230,
    fragility: 1,
    art: 'lamp',
    tint: '#b96939',
    desc: 'A palm-sized lamp with a soot-blackened spout. The last flame it held was probably the last the caravan ever saw.',
    provenance: 'Recovered from the windward side of a collapsed tent ring.'
  },
  bell: {
    id: 'bell',
    name: 'Bronze Caravan Bell',
    shortName: 'Bronze bell',
    type: 'Adornment',
    era: '10th century · Trans-Saharan route',
    material: 'Bronze',
    rarity: 2,
    value: 295,
    fragility: 2,
    art: 'bell',
    tint: '#7d8a5e',
    desc: 'A small bell with a clapper cut from a Roman nail. Its patina is the colour of shallow sea.',
    provenance: 'Buried with a camel harness, still buckled.'
  },
  scarab: {
    id: 'scarab',
    name: 'Faience Scarab',
    shortName: 'Faience scarab',
    type: 'Amulet',
    era: '1550 BCE · New Kingdom',
    material: 'Faience',
    rarity: 3,
    value: 490,
    fragility: 2,
    art: 'scarab',
    tint: '#4fa79d',
    desc: 'A turquoise scarab, its glaze crazed like a dried riverbed. The beetle carries a sun disc between its forelegs.',
    provenance: 'Pressed into a salt block beneath the temple threshold.'
  },
  amphora: {
    id: 'amphora',
    name: 'Salt-Glaze Amphora',
    shortName: 'Amphora',
    type: 'Vessel',
    era: '1st century · Roman Sinai',
    material: 'Ceramic',
    rarity: 3,
    value: 560,
    fragility: 3,
    art: 'amphora',
    tint: '#b5c6b4',
    desc: 'A tall amphora sealed with resin and salt. Whatever it carried has long since become a rumour.',
    provenance: 'Lying on its side in the flooded lower nave.'
  },
  ibis: {
    id: 'ibis',
    name: 'Bronze Ibis of Thoth',
    shortName: 'Bronze ibis',
    type: 'Idol',
    era: '664 BCE · Late Period',
    material: 'Bronze',
    rarity: 4,
    value: 720,
    fragility: 3,
    art: 'ibis',
    tint: '#477a6f',
    desc: 'The ibis stands with its beak raised, as if listening to something beyond the room. Gold remains in the eye sockets.',
    provenance: 'Recovered from a niche behind the salt altar.'
  },
  tooth: {
    id: 'tooth',
    name: 'Basilosaurus Tooth',
    shortName: 'Whale tooth',
    type: 'Fossil',
    era: '34 million years · Eocene',
    material: 'Fossilised bone',
    rarity: 3,
    value: 640,
    fragility: 2,
    art: 'tooth',
    tint: '#b8a078',
    desc: 'A palm-long tooth from a serpent-whale. Its enamel still holds a faint blue fire in strong sunlight.',
    provenance: 'Eroded free of a sandstone ledge after a rare desert rain.'
  },
  ammonite: {
    id: 'ammonite',
    name: 'Golden Ammonite',
    shortName: 'Ammonite',
    type: 'Fossil',
    era: '110 million years · Cretaceous',
    material: 'Pyritised shell',
    rarity: 4,
    value: 810,
    fragility: 2,
    art: 'ammonite',
    tint: '#b68a42',
    desc: 'A spiral the size of a compass rose, replaced cell by cell with iron pyrite. Turn it and the whole desert glitters.',
    provenance: 'Found at the centre of a bone circle, deliberately placed.'
  },
  pendant: {
    id: 'pendant',
    name: 'Whalebone Pendant',
    shortName: 'Bone pendant',
    type: 'Adornment',
    era: 'Neolithic · Fayum',
    material: 'Carved bone',
    rarity: 3,
    value: 590,
    fragility: 3,
    art: 'pendant',
    tint: '#bda77e',
    desc: 'A flat pendant carved with a swimming figure. The hole is worn smooth — it was worn for a lifetime.',
    provenance: 'Buried with a child, wrapped in woven reeds.'
  },
  mask: {
    id: 'mask',
    name: 'Obsidian Funerary Mask',
    shortName: 'Obsidian mask',
    type: 'Ceremonial',
    era: 'Unknown · Pre-dynastic',
    material: 'Obsidian & gold',
    rarity: 5,
    value: 1250,
    fragility: 4,
    art: 'mask',
    tint: '#57484c',
    desc: 'A face cut from volcanic glass, its eyes inlaid with gold. The expression changes with the angle of the sun.',
    provenance: 'Sealed inside the black tomb, facing the door.'
  },
  ring: {
    id: 'ring',
    name: 'Signet of the Sun Priest',
    shortName: 'Gold signet',
    type: 'Jewellery',
    era: 'Unknown · Solar cult',
    material: 'Gold',
    rarity: 5,
    value: 1080,
    fragility: 3,
    art: 'ring',
    tint: '#d2a044',
    desc: 'A heavy gold signet incised with a sun over a closed eye. The band is sized for a hand larger than any in the record.',
    provenance: 'On the third finger of a stone sarcophagus.'
  },
  disc: {
    id: 'disc',
    name: 'Celestial Disc',
    shortName: 'Celestial disc',
    type: 'Instrument',
    era: 'Unknown · Bronze Age',
    material: 'Bronze & gold',
    rarity: 4,
    value: 920,
    fragility: 4,
    art: 'disc',
    tint: '#9b7e45',
    desc: 'A perforated bronze disc mapping stars that no longer sit where they should. One hole has been drilled later, by a different hand.',
    provenance: 'Mounted above the tomb door, aimed at the western horizon.'
  }
};

export const UPGRADES = {
  trowel: {
    id: 'trowel',
    cat: 'field',
    icon: 'i-trowel',
    name: 'Excavator’s trowel',
    desc: 'A wider, tempered blade that moves sand without scarring the find.',
    costs: [0, 320, 780],
    effects: ['Standard 44 cm sweep', 'Wider 54 cm sweep', 'Master 64 cm sweep']
  },
  sieve: {
    id: 'sieve',
    cat: 'field',
    icon: 'i-sieve',
    name: 'Precision sieve',
    desc: 'Catches the small stuff the desert tries to keep: coins, beads, loose fragments.',
    costs: [0, 300, 720],
    effects: ['18% bonus-cache chance', '32% bonus-cache chance', '48% bonus-cache chance']
  },
  sonar: {
    id: 'sonar',
    cat: 'field',
    icon: 'i-scan',
    name: 'Pulse scanner',
    desc: 'Maps density beneath the trench. Marks the buried relic before the first sweep.',
    costs: [0, 420, 980],
    effects: ['Pulse only', 'Faint relic outline', 'Clear relic outline']
  },
  brush: {
    id: 'brush',
    cat: 'lab',
    icon: 'i-brush',
    name: 'Sable brush kit',
    desc: 'Soft, springy bristles that lift crust without scratching the surface below.',
    costs: [0, 340, 820],
    effects: ['Standard bristle', 'Fine conservation grade', 'Museum master grade']
  },
  water: {
    id: 'water',
    cat: 'lab',
    icon: 'i-water',
    name: 'Pressurised mister',
    desc: 'A controlled mist that dissolves salt in the cracks instead of blasting it loose.',
    costs: [0, 360, 860],
    effects: ['Wide, gentle spray', 'Focused salt solvent', 'Conservator’s micro-mist']
  },
  cloth: {
    id: 'cloth',
    cat: 'lab',
    icon: 'i-cloth',
    name: 'Conservator’s cloth',
    desc: 'A microfibre cloth for the final buff. Cleaner lustre means a stronger appraisal.',
    costs: [0, 380, 900],
    effects: ['Soft cotton finish', 'Lint-free microfibre', 'Silk conservator’s finish']
  }
};

export const RANKS = [
  { at: 0, name: 'Field novice' },
  { at: 10, name: 'Curator' },
  { at: 28, name: 'Fellow' },
  { at: 55, name: 'Laureate' },
  { at: 90, name: 'Legend' }
];

export const TOTAL_RELICS = 12;

export function rankFor(renown) {
  let rank = RANKS[0].name;
  for (const row of RANKS) if (renown >= row.at) rank = row.name;
  return rank;
}

export function siteFor(id) {
  return SITES.find(site => site.id === id) || SITES[0];
}

export function artifactFor(id) {
  return ARTIFACTS[id] || ARTIFACTS.dinar;
}

export function levelFor(state, key) {
  return Math.max(1, Math.min(3, state.levels[key] || 1));
}

export function upgradeCost(key, state) {
  const def = UPGRADES[key];
  const level = levelFor(state, key);
  return level >= 3 ? null : def.costs[level];
}

export function cleaningGrade(state) {
  return Math.min(levelFor(state, 'brush'), levelFor(state, 'water'), levelFor(state, 'cloth'));
}
