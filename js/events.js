// GREEN EMPIRE — random street events. Each choice mutates the game.
const pct = (n, p) => Math.floor(n * p);
const totalCash = g => Math.max(0, g.state.dirty + g.state.clean);

export const EVENTS = [
  {
    id: 'bulk', icon: 'cash', title: 'A MAN WITH A VAN', tag: 'OPPORTUNITY',
    body: 'A guy in a tracksuit flashes a roll of bills. "I\'ll take ten grams off your hands. No receipt, no names."',
    requires: g => g.stockGrams() >= 10,
    choices: [
      { label: 'Sell him 10g', sub: 'Market price +25% · +Heat', effects: { g: 3 },
        run: g => { const r = g.quickSale(10, 1.25); if (!r) return 'Not enough stock.'; g.state.heat += 4; return `+$${r} cash. He drives off without a seatbelt.`; } },
      { label: 'No thanks', sub: 'Stay careful', run: () => 'You watch him circle the block twice. Better safe than photographed.' }
    ]
  },
  {
    id: 'neighbour', icon: 'eye', title: 'THE NOSY NEIGHBOUR', tag: 'PRESSURE',
    body: 'Mrs. Pemberton from 4C is sniffing the hallway again. "Dear, is everything alright? It smells like a skunk died in a greenhouse."',
    choices: [
      { label: 'Bribe her', sub: '-$80 · Heat -4', effects: { dirty: -80, heat: -4 },
        run: g => { if (!g.spendDirty(80)) return 'You can\'t afford the bribe.'; g.state.heat = Math.max(0, g.state.heat - 4); return 'She buys a new air fryer and forgets your hallway exists.' } },
      { label: 'Play dumb', sub: '+Heat', effects: { heat: 9 },
        run: g => { g.state.heat += 9; return 'She writes a letter to the building manager. In cursive. With footnotes.' } }
    ]
  },
  {
    id: 'shortage', icon: 'seed', title: 'SUPPLY SHORTAGE', tag: 'SUPPLIER',
    body: 'Your seed guy is jumpy. "Whole city\'s dry. I can get you three plantings, but it\'ll cost."',
    choices: [
      { label: 'Buy the crate', sub: '-$150 · 3 free plantings', effects: { dirty: -150 },
        run: g => { if (!g.spendDirty(150)) return 'Not enough dirty cash.'; g.state.freePlantings = (g.state.freePlantings || 0) + 3; return 'Three vacuum-sealed packets. No labels. Perfect.' } },
      { label: 'Ration what you have', sub: '+Heat', effects: { heat: 5 },
        run: g => { g.state.heat += 5; return 'You stretch the stash. The smell gets worse. So does the tension.' } }
    ]
  },
  {
    id: 'shakedown', icon: 'fist', title: 'THE SHAKEDOWN', tag: 'RIVAL',
    body: 'Two of Sloane\'s guys are waiting by your door. "Rent\'s due. The Syndicate is raising the rate."',
    choices: [
      { label: 'Pay them', sub: '-$200 · Heat -2', effects: { dirty: -200, heat: -2 },
        run: g => { if (!g.spendDirty(200)) return 'They laugh at your empty pockets and take your best pot instead.'; g.state.heat = Math.max(0, g.state.heat - 2); return 'They leave. One of them steals a lighter on the way out.' } },
      { label: 'Stand your ground', sub: '+Rep · +Heat', effects: { rep: 5, heat: 8 },
        run: g => { g.state.rep = Math.min(100, g.state.rep + 5); g.state.heat += 8; return 'You don\'t blink. They respect it. They also key your door on the way out.' } }
    ]
  },
  {
    id: 'influencer', icon: 'star', title: 'VIRAL POTENTIAL', tag: 'SOCIAL',
    body: 'A local influencer with 40,000 followers wants a free sample. "The exposure alone is worth thousands, babe."',
    requires: g => g.stockGrams() >= 8,
    choices: [
      { label: 'Give 8 grams', sub: '+Reputation', effects: { rep: 12 },
        run: g => { if (!g.removeStock(8)) return 'Not enough stock.'; g.state.rep = Math.min(100, g.state.rep + 12); return 'Her review goes viral for the wrong reasons. Your reputation still climbs.' } },
      { label: 'Charge full price', sub: 'Cash now', run: g => { const r = g.quickSale(8, 1.1); return r ? `+$${r}. She posts a lukewarm review. Money is money.` : 'She leaves in a cloud of perfume and resentment.'; } }
    ]
  },
  {
    id: 'surge', icon: 'bolt', title: 'POWER SURGE', tag: 'EQUIPMENT',
    body: 'The lights flicker. Somewhere below, a breaker gives up. Half your gear is running on hope.',
    choices: [
      { label: 'Call an electrician', sub: '-$120', effects: { dirty: -120 },
        run: g => { if (!g.spendDirty(120)) return 'You can\'t afford it. You unplug the fridge instead.'; return 'The electrician fixes it in ten minutes and asks no questions. His rate is a different kind of robbery.' } },
      { label: 'Let it ride', sub: '+Heat · Growth stall', effects: { heat: 6 },
        run: g => { g.state.heat += 6; g.stallRandomPlant(); return 'One plant takes the hit. The rest flicker ominously.' } }
    ]
  },
  {
    id: 'patrol', icon: 'siren', title: 'POLICE PATROL', tag: 'POLICE',
    body: 'A cruiser rolls past the building. Slow. Then slower. Then it stops.',
    choices: [
      { label: 'Lay low', sub: 'Heat -8 · Short pause', run: g => { g.state.heat = Math.max(0, g.state.heat - 8); g.layLow(30); return 'You kill the lights and sit in the dark. The cruiser eventually moves on.' } },
      { label: 'Bribe the window', sub: '-$150 · Heat -12', effects: { dirty: -150 },
        run: g => { if (!g.spendDirty(150)) return 'You have nothing to offer. The cruiser stays for eleven more minutes.'; g.state.heat = Math.max(0, g.state.heat - 12); return 'Two coffees and a handshake later, the cruiser finds somewhere else to be.' } }
    ]
  },
  {
    id: 'seed', icon: 'flask', title: 'THE MYSTERY SEED', tag: 'CHEMISTRY',
    body: 'A courier hands you an unmarked envelope. Inside: one seed, black as a pupil, and a note that says "TRY IT."',
    choices: [
      { label: 'Buy it', sub: '-$300 · Resin buff', effects: { dirty: -300 },
        run: g => { if (!g.spendDirty(300)) return 'You can\'t afford the mystery.'; g.addBuff('resin', 3); return 'You plant it. It grows with a sound like a held breath. Resin Boost active for 3 harvests.' } },
      { label: 'Burn the note', sub: 'Avoid unknown risks', run: () => 'You burn the note in the sink. The seed goes in the trash. Probably.' }
    ]
  },
  {
    id: 'informant', icon: 'eye', title: 'A QUIET WORD', tag: 'POLICE',
    body: 'A man in a windbreaker slides into the booth beside you. "I know what you did. The question is who else needs to know."',
    choices: [
      { label: 'Pay him off', sub: '-8% dirty cash', run: g => { const amount = Math.max(20, pct(g.state.dirty, .08)); if (!g.spendDirty(amount)) return 'He takes a plant instead and promises to forget.'; return `You lose $${amount}. He promises to forget your face.`; } },
      { label: 'Tell him to leave', sub: '+Heat', effects: { heat: 14 },
        run: g => { g.state.heat += 14; return 'He leaves a card on the table. It has your name on it already.' } }
    ]
  },
  {
    id: 'stash', icon: 'cash', title: 'THE OLD JACKET', tag: 'LUCK',
    body: 'You find one of your aunt\'s old coats in the closet. There is a folded envelope in the pocket.',
    choices: [
      { label: 'Open it', sub: 'Finders keepers', run: g => { const found = 180 + Math.floor(Math.random() * 140); g.addDirty(found); return `Inside: $${found} and a lottery ticket from 1998. You keep both.`; } },
      { label: 'Leave it', sub: 'Respect the dead', effects: { rep: 2 }, run: g => { g.state.rep = Math.min(100, g.state.rep + 2); return 'You hang the coat back up. Some things are worth more than cash.' } }
    ]
  }
];
