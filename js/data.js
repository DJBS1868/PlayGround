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
  pendingFinds: [],
  selectedSite: 0,
  totalEarned: 0,
  flags: {
    firstRelic: false,
    firstSale: false,
    galleryBonus: false,
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
    artifacts: ['dinar', 'lamp', 'bell', 'caravan-key', 'camel-seal', 'woven-talisman', 'astrolabe', 'waterskin', 'sandal', 'bead-necklace'],
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
    artifacts: ['scarab', 'amphora', 'ibis', 'salt-censer', 'pharaoh-scarab', 'priests-seal', 'sistrum', 'canopic-jar', 'votive-hand', 'temple-relief'],
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
    artifacts: ['tooth', 'ammonite', 'pendant', 'whale-vertebra', 'marine-coin', 'reed-comb', 'megalodon-tooth', 'fossil-fish', 'barnacle-cluster', 'whale-rib'],
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
    artifacts: ['mask', 'ring', 'disc', 'black-stela', 'sun-bracer', 'obsidian-dagger', 'ushabti', 'ankh', 'chalice', 'obsidian-mirror'],
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
  },
  'caravan-key': {
    id: 'caravan-key', name: 'Merchant Caravan Key', shortName: 'Iron key', type: 'Tool', era: '12th century · Sahara', material: 'Wrought iron', rarity: 2, value: 260, fragility: 2, art: 'key', tint: '#65594a',
    desc: 'An oversized iron key with a trade guild mark filed into the bow.', provenance: 'Hanging by a rusted chain in the wrecked camel gear.'
  },
  'camel-seal': {
    id: 'camel-seal', name: 'Camel Caravan Seal', shortName: 'Clay seal', type: 'Official', era: '9th century · Maghreb', material: 'Stamped clay', rarity: 3, value: 330, fragility: 3, art: 'seal', tint: '#9e6f47',
    desc: 'A palm-sized clay sealing impressed with a kneeling camel and eight-point star.', provenance: 'Still fixed beneath the rim of a trader’s chest.'
  },
  'woven-talisman': {
    id: 'woven-talisman', name: 'Red-Woven Talisman', shortName: 'Woven talisman', type: 'Adornment', era: '11th century · Trans-Saharan', material: 'Wool & copper', rarity: 3, value: 350, fragility: 3, art: 'talisman', tint: '#bd6847',
    desc: 'A red wool cord knotted around a tiny hammered-copper charm.', provenance: 'Twisted around a pack frame buried in dune wash.'
  },
  astrolabe: {
    id: 'astrolabe', name: 'Caravan Astrolabe', shortName: 'Astrolabe', type: 'Instrument', era: '11th century · Andalusia', material: 'Brass', rarity: 4, value: 420, fragility: 4, art: 'astrolabe', tint: '#b08a4c',
    desc: 'A brass star-finder with a pierced rete and a pointer worn bright by a navigator’s thumb.', provenance: 'Wrapped in oiled cloth inside a camel saddlebag.'
  },
  waterskin: {
    id: 'waterskin', name: 'Goatskin Water Flask', shortName: 'Water flask', type: 'Utility', era: '19th century · Sahara', material: 'Goatskin & tar', rarity: 2, value: 240, fragility: 2, art: 'waterskin', tint: '#8a5a36',
    desc: 'A blackened waterskin, its seams sealed with tar and its neck tied with a leather thong.', provenance: 'Half buried beside the remains of a campfire.'
  },
  sandal: {
    id: 'sandal', name: 'Pilgrim’s Leather Sandal', shortName: 'Leather sandal', type: 'Personal', era: '13th century · Fez', material: 'Goat leather', rarity: 2, value: 270, fragility: 3, art: 'sandal', tint: '#8b5a32',
    desc: 'A single worn sandal with a thong strap and a sole stitched in coarse flax.', provenance: 'Pressed into the sand at the edge of the caravan road.'
  },
  'bead-necklace': {
    id: 'bead-necklace', name: 'Blue Bead Necklace', shortName: 'Bead necklace', type: 'Adornment', era: '10th century · Gao', material: 'Glass & carnelian', rarity: 3, value: 390, fragility: 2, art: 'beads', tint: '#3f7f91',
    desc: 'A strand of trade beads in lapis blue and carnelian, still strung on its original cord.', provenance: 'Knotted inside a folded strip of indigo cloth.'
  },
  'salt-censer': {
    id: 'salt-censer', name: 'Salt Priest Censer', shortName: 'Salt censer', type: 'Ceremonial', era: '18th dynasty · Sinai', material: 'Alabaster', rarity: 3, value: 610, fragility: 3, art: 'censer', tint: '#d1d0ba',
    desc: 'A shallow carved censer whose inner bowl is still veined with incense resin.', provenance: 'Found under a collapsed salt wall beside the altar.'
  },
  'pharaoh-scarab': {
    id: 'pharaoh-scarab', name: 'Crowned Scarab', shortName: 'Crowned scarab', type: 'Amulet', era: '18th dynasty · New Kingdom', material: 'Faience & gold', rarity: 4, value: 760, fragility: 2, art: 'crowned-scarab', tint: '#45a397',
    desc: 'A turquoise scarab crowned with a small gold solar disk.', provenance: 'Placed at the foot of a painted limestone guardian.'
  },
  'priests-seal': {
    id: 'priests-seal', name: 'White Temple Seal', shortName: 'Temple seal', type: 'Official', era: 'Ptolemaic · Sinai', material: 'Calcite', rarity: 4, value: 690, fragility: 3, art: 'seal-ring', tint: '#d9cfaa',
    desc: 'A calcite stamp ring engraved with the names of two temple priests.', provenance: 'Recovered from a drain channel beneath the shrine.'
  },
  sistrum: {
    id: 'sistrum', name: 'Temple Sistrum', shortName: 'Sistrum', type: 'Instrument', era: '18th dynasty · Sinai', material: 'Bronze', rarity: 4, value: 780, fragility: 3, art: 'sistrum', tint: '#9a8248',
    desc: 'A U-shaped bronze rattle whose loose discs still ring when the handle is turned.', provenance: 'Lying beneath the altar steps, tangled in a linen cord.'
  },
  'canopic-jar': {
    id: 'canopic-jar', name: 'Canopic Jar of Horus', shortName: 'Canopic jar', type: 'Vessel', era: '19th dynasty · New Kingdom', material: 'Alabaster', rarity: 4, value: 840, fragility: 4, art: 'canopic', tint: '#d8d2b6',
    desc: 'A veined alabaster jar sealed with a falcon-headed lid, its interior still faintly fragrant.', provenance: 'Set into a niche behind the salt altar, facing east.'
  },
  'votive-hand': {
    id: 'votive-hand', name: 'Votive Hand of Offering', shortName: 'Votive hand', type: 'Votive', era: 'Ptolemaic · Sinai', material: 'Limestone', rarity: 3, value: 620, fragility: 3, art: 'hand', tint: '#cbbd97',
    desc: 'An open limestone hand, fingers slightly curled as if releasing a gift.', provenance: 'Buried at the threshold where worshippers left their offerings.'
  },
  'temple-relief': {
    id: 'temple-relief', name: 'Salt Temple Relief', shortName: 'Temple relief', type: 'Inscription', era: 'Ptolemaic · Sinai', material: 'Limestone', rarity: 4, value: 760, fragility: 4, art: 'relief', tint: '#c9b993',
    desc: 'A carved slab showing a priest in profile beneath a row of worn hieroglyphs.', provenance: 'Fell face-up from the inner wall during the salt collapse.'
  },
  'whale-vertebra': {
    id: 'whale-vertebra', name: 'Fossil Whale Vertebra', shortName: 'Whale vertebra', type: 'Fossil', era: '36 million years · Eocene', material: 'Fossilised bone', rarity: 3, value: 670, fragility: 3, art: 'vertebra', tint: '#a89470',
    desc: 'A weathered vertebral disc, polished by aeons of wind and silt.', provenance: 'Exposed in a bone bed at the valley’s western edge.'
  },
  'marine-coin': {
    id: 'marine-coin', name: 'Drowned Nautical Coin', shortName: 'Nautical coin', type: 'Coin', era: 'Roman · Wadi Fayum', material: 'Silver', rarity: 3, value: 520, fragility: 2, art: 'nautical-coin', tint: '#aeb4ad',
    desc: 'A silver coin stamped with a dolphin, greened by ancient mineral salts.', provenance: 'Loose beneath a long-vanished shoreline marker.'
  },
  'reed-comb': {
    id: 'reed-comb', name: 'Papyrus Reed Comb', shortName: 'Bone comb', type: 'Personal', era: 'Neolithic · Fayum', material: 'Carved bone', rarity: 2, value: 450, fragility: 3, art: 'comb', tint: '#c2ad83',
    desc: 'A fine-toothed comb carved with a border of curling reeds.', provenance: 'Found in a reed mat at the remains of a lakeside camp.'
  },
  'megalodon-tooth': {
    id: 'megalodon-tooth', name: 'Megalodon Tooth', shortName: 'Megalodon tooth', type: 'Fossil', era: '15 million years · Miocene', material: 'Fossilised enamel', rarity: 4, value: 860, fragility: 2, art: 'shark-tooth', tint: '#a98f68',
    desc: 'A broad triangular tooth with a serrated edge, big enough to span a palm.', provenance: 'Washed out of a sandstone channel after a flash flood.'
  },
  'fossil-fish': {
    id: 'fossil-fish', name: 'Fossil Fish Plate', shortName: 'Fossil fish', type: 'Fossil', era: '40 million years · Eocene', material: 'Limestone & bone', rarity: 4, value: 790, fragility: 4, art: 'fish-fossil', tint: '#b3a27f',
    desc: 'A complete fish skeleton pressed into a pale limestone plate, fins still spread.', provenance: 'Split cleanly from a paper-thin layer in the bone valley.'
  },
  'barnacle-cluster': {
    id: 'barnacle-cluster', name: 'Fossil Barnacle Cluster', shortName: 'Barnacle cluster', type: 'Fossil', era: '30 million years · Oligocene', material: 'Fossilised shell', rarity: 3, value: 560, fragility: 3, art: 'barnacles', tint: '#b8ae91',
    desc: 'A cluster of conical barnacle shells fused to a fragment of ancient driftwood.', provenance: 'Found where the old shoreline cuts through the valley wall.'
  },
  'whale-rib': {
    id: 'whale-rib', name: 'Giant Whale Rib', shortName: 'Whale rib', type: 'Fossil', era: '36 million years · Eocene', material: 'Fossilised bone', rarity: 4, value: 820, fragility: 4, art: 'rib', tint: '#b6a17a',
    desc: 'A long curved rib, heavy as a fence post and cracked along its inner curve.', provenance: 'Leaning against a whale skull in the deepest bone bed.'
  },
  'black-stela': {
    id: 'black-stela', name: 'Shard of the Black Stela', shortName: 'Obsidian stela', type: 'Inscription', era: 'Unknown · Pre-dynastic', material: 'Obsidian', rarity: 5, value: 1320, fragility: 4, art: 'stela', tint: '#282527',
    desc: 'A sliver of polished black stone engraved with a map of the sealed tomb.', provenance: 'Split from the stela laid beside the inner doorway.'
  },
  'sun-bracer': {
    id: 'sun-bracer', name: 'Gold Sun Bracer', shortName: 'Sun bracer', type: 'Jewellery', era: 'Unknown · Solar cult', material: 'Gold', rarity: 5, value: 1180, fragility: 3, art: 'bracer', tint: '#d6a13f',
    desc: 'A broad spiral bracelet whose terminals curl into opposing sun discs.', provenance: 'Wrapped around the arm of a stone burial guardian.'
  },
  'obsidian-dagger': {
    id: 'obsidian-dagger', name: 'Ritual Obsidian Dagger', shortName: 'Obsidian dagger', type: 'Ceremonial', era: 'Unknown · Bronze Age', material: 'Obsidian & bronze', rarity: 5, value: 1400, fragility: 4, art: 'dagger', tint: '#30272d',
    desc: 'A razor-edged ceremonial blade fixed in a tarnished bronze hilt.', provenance: 'Placed across the threshold of the tomb’s last chamber.'
  },
  ushabti: {
    id: 'ushabti', name: 'Obsidian Ushabti', shortName: 'Ushabti', type: 'Funerary', era: 'Unknown · Late dynastic', material: 'Obsidian', rarity: 5, value: 1450, fragility: 4, art: 'ushabti', tint: '#3a3034',
    desc: 'A mummiform servant figure carved from black glass, its crossed arms holding tiny tools.', provenance: 'Stood in a row of forty beside the tomb’s western wall.'
  },
  ankh: {
    id: 'ankh', name: 'Gold Ankh of Passage', shortName: 'Gold ankh', type: 'Ceremonial', era: 'Unknown · Solar cult', material: 'Gold', rarity: 5, value: 1360, fragility: 2, art: 'ankh', tint: '#d6a13f',
    desc: 'A heavy gold ankh with a lapis inlay at its crossing, warm even in the cold chamber.', provenance: 'Clasped in the hand of a robbed burial.'
  },
  chalice: {
    id: 'chalice', name: 'Black Stone Chalice', shortName: 'Stone chalice', type: 'Vessel', era: 'Unknown · Bronze Age', material: 'Obsidian', rarity: 5, value: 1510, fragility: 4, art: 'chalice', tint: '#33292d',
    desc: 'A shallow obsidian cup on a slender stem, its rim banded with worn gold.', provenance: 'Centred on the last offering table, still upright.'
  },
  'obsidian-mirror': {
    id: 'obsidian-mirror', name: 'Obsidian Scrying Mirror', shortName: 'Obsidian mirror', type: 'Ritual', era: 'Unknown · Pre-dynastic', material: 'Obsidian & bronze', rarity: 5, value: 1580, fragility: 4, art: 'mirror', tint: '#2d2529',
    desc: 'A polished black mirror in a bronze frame, dark enough to hold a reflection without giving it back.', provenance: 'Face-down beneath the tomb’s final threshold stone.'
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

export const TOTAL_RELICS = 40;

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
