// GREEN EMPIRE — characters and story missions (part 1).
export const CHARACTERS = {
  milo: { name: 'Milo Vance', role: 'The Chemist', skin: '#c8926b', hair: '#2a211d', shirt: '#3f6a52', accent: '#7bf58a', style: 'curly', glasses: true },
  dex: { name: 'Dex Rourke', role: 'The Partner', skin: '#a9714e', hair: '#161311', shirt: '#7d2f35', accent: '#ffb257', style: 'slick', chain: true },
  vera: { name: 'Vera Sloane', role: 'The Queenpin', skin: '#d9b094', hair: '#d9d4cb', shirt: '#1e1b24', accent: '#c79bff', style: 'bob', lips: true },
  marlow: { name: 'Ada Marlow', role: 'Narcotics Detective', skin: '#8b5c40', hair: '#231c1a', shirt: '#6b5a43', accent: '#6fe7ff', style: 'short' },
  lenny: { name: 'Lenny Kestrel', role: 'Attorney at Law', skin: '#d2a57e', hair: '#6b5a4a', shirt: '#2f3d56', accent: '#ffcf6b', style: 'bald', glasses: true, tie: '#b23b4a' },
  tess: { name: 'Big Tess', role: 'Distributor', skin: '#6f4630', hair: '#1b1412', shirt: '#476d54', accent: '#ffd166', style: 'locs', bandana: '#c05a3c' },
  ward: { name: 'Dr. Elias Ward', role: 'Reclusive Chemist', skin: '#c29c7e', hair: '#d7d5cc', shirt: '#e8e8df', accent: '#6fe7ff', style: 'wild', beard: true, glasses: true },
  rook: { name: 'Rook', role: "Sloane's Enforcer", skin: '#b98a67', hair: '#191716', shirt: '#2a2730', accent: '#c05a5a', style: 'bald', tattoo: true },
  nico: { name: 'Nico Vance', role: 'Little Brother', skin: '#c8926b', hair: '#2b221e', shirt: '#52616e', accent: '#ffb257', style: 'messy' },
  bea: { name: 'Bea', role: 'The Trimmer', skin: '#b97f57', hair: '#3a2419', shirt: '#7c4d63', accent: '#f0a35e', style: 'curly', lips: true },
  priya: { name: 'Priya', role: 'The Chemist', skin: '#a9714e', hair: '#1d1613', shirt: '#3d6d76', accent: '#9ad1ff', style: 'bob', glasses: true },
  narrator: { name: 'The City', role: '', narrator: true }
};

export const MISSIONS_1 = [
  {
    id: 'm0', act: 'ACT I', title: 'The Eviction Notice', place: 'Ashgrove Apartments · 4B',
    lines: [
      { s: 'narrator', t: 'Three weeks ago, Milo Vance had a job, a lease, and a future. Now he has a duffel bag and his dead aunt\'s apartment.' },
      { s: 'milo', t: 'Eleven years of chemistry. Fired for one unauthorized experiment.' },
      { s: 'nico', t: 'They\'re gonna break my legs, Milo. I just need three grand. I swear this is the last time.' },
      { s: 'milo', t: 'I\'ve got nothing, Nico. Unless...' },
      { s: 'narrator', t: 'In the closet: a grow light, three cracked pots, and a bag of seeds. Aunt June always did have a green thumb.' },
      { s: 'dex', t: 'Look who\'s back from the dead. You gonna stand there, or are we gonna make some money?' },
      { s: 'milo', t: 'This isn\'t a business, Dex. It\'s a hobby.' },
      { s: 'dex', t: 'Everything\'s a hobby till the rent\'s due. Plant something. I\'ll find us a buyer.' }
    ],
    objective: { type: 'harvest', target: 1, label: 'Harvest 1 plant' },
    reward: { dirty: 120, clean: 0, rep: 4, heat: 0 },
    nextHint: 'Tap an empty pot in the grow room to plant your first seed.'
  },
  {
    id: 'm1', act: 'ACT I', title: 'The First Bag', place: 'Ashgrove Apartments · 4B',
    lines: [
      { s: 'dex', t: 'June\'s old gear. Cute. Now let\'s meet the woman who buys cute.' },
      { s: 'tess', t: 'I don\'t care about your story. I care about weight, moisture, and whether you waste my time.' },
      { s: 'milo', t: 'It\'s fresh. Hand-trimmed. The quality\'s only going to get better.' },
      { s: 'tess', t: 'Get me twenty grams. Clean trim. Then we\'ll talk wholesale.' },
      { s: 'dex', t: 'Twenty grams. That\'s, what, two days of not getting evicted?' },
      { s: 'milo', t: 'I was thinking more like one very small step toward an empire.' },
      { s: 'dex', t: 'There he is. There\'s the guy who got fired.' }
    ],
    objective: { type: 'sellGrams', target: 20, label: 'Sell 20 grams' },
    reward: { dirty: 300, clean: 0, rep: 6, heat: 2 },
    nextHint: 'Customers walk in from the right. Tap one to serve them.'
  },
  {
    id: 'm2', act: 'ACT I', title: 'Clean Money', place: 'Kestrel Legal · Downtown',
    lines: [
      { s: 'narrator', t: 'Cash is a confession with a serial number. It needs a bath.' },
      { s: 'lenny', t: 'Lenny Kestrel. Attorney, entrepreneur, friend to the financially complicated.' },
      { s: 'milo', t: 'I need my money to look less... enthusiastic.' },
      { s: 'lenny', t: 'My laundering service takes a modest cut. In return, your money comes out smelling like lemon pledge.' },
      { s: 'milo', t: 'And the police?' },
      { s: 'lenny', t: 'They love paperwork. Paperwork hates them. Wash four hundred dollars and we\'ll call it a baptism.' },
      { s: 'lenny', t: 'Clean cash buys property. Dirty cash buys trouble. Learn the difference or learn a lawyer\'s hourly rate.' }
    ],
    objective: { type: 'launder', target: 400, label: 'Launder $400 of dirty cash' },
    reward: { dirty: 0, clean: 250, rep: 3, heat: -6 },
    nextHint: 'Open LAUNDER in the dock to wash dirty cash into clean money.'
  },
  {
    id: 'm3', act: 'ACT II', title: 'The Garage', place: "Rourke's Auto Body · 9th Street",
    lines: [
      { s: 'dex', t: 'Apartment\'s getting cramped. My cousin\'s auto body on Ninth is empty. Key\'s under the compressor.' },
      { s: 'milo', t: 'A garage. Real walls. Room to breathe.' },
      { s: 'dex', t: 'Room to expand. Also, a guy named Rook is coming by. Vera Sloane\'s people. They tax ambition.' },
      { s: 'rook', t: 'The Syndicate owns the corners. You want to sell on Ninth, you pay the toll.' },
      { s: 'milo', t: 'And if I don\'t?' },
      { s: 'rook', t: 'Then you become an example. Vera likes examples. She puts them in nice frames.' }
    ],
    choice: {
      prompt: 'Rook waits, hand out. What do you do?',
      options: [
        { label: 'Pay the toll', sub: '-$250 · Heat -5', effects: { dirty: -250, heat: -5, flag: 'paidToll' },
          reply: 'Rook pockets the cash. "Smart. Vera appreciates a businessman." He leaves without looking back.' },
        { label: 'Refuse', sub: '+Reputation · +Heat', effects: { heat: 12, rep: 4, flag: 'defiedRook' },
          reply: '"The Syndicate remembers," Rook says. He tips an imaginary hat. "So do I."' }
      ]
    },
    objective: { type: 'ownProperty', property: 'garage', label: "Buy Rourke's Auto Body" },
    reward: { dirty: 0, clean: 400, rep: 5, heat: 0 },
    nextHint: 'Open PROPERTIES and buy the garage with clean cash.'
  },
  {
    id: 'm4', act: 'ACT II', title: 'Chemistry Lessons', place: 'Ashgrove Apartments · 4B',
    lines: [
      { s: 'narrator', t: 'Dr. Elias Ward has not left his apartment in four years. He has, however, published three papers.' },
      { s: 'ward', t: 'You\'re the one who was fired for synthesizing a catalyst nobody asked for.' },
      { s: 'milo', t: 'It was beautiful.' },
      { s: 'ward', t: 'It was reckless. Beauty and recklessness are the same instinct with different lawyers.' },
      { s: 'ward', t: 'Your plants are children with potential. Your equipment is a crime against science. Bring me six harvests and I\'ll show you what a real lab can do.' },
      { s: 'milo', t: 'Why help me?' },
      { s: 'ward', t: 'Because the last man who understood my work is dead, and I am bored of talking to the ceiling.' }
    ],
    objective: { type: 'harvest', target: 6, label: 'Harvest 6 plants' },
    reward: { dirty: 400, clean: 500, rep: 6, heat: 0 },
    nextHint: 'Keep planting and harvesting. The lab is within reach.'
  },
  {
    id: 'm5', act: 'ACT II', title: 'The Hive', place: 'Sublevel 3 · Beneath the garage',
    lines: [
      { s: 'narrator', t: 'Below the garage: a forgotten city cistern. Concrete, cold, perfect.' },
      { s: 'dex', t: 'Told you the city had bones. We just need lights, vents, and a chemist with nothing to lose.' },
      { s: 'ward', t: 'The first rule of a secret lab: never call it a lab. It\'s a laundry room with ambition.' },
      { s: 'milo', t: 'No windows. No neighbours. No excuses.' },
      { s: 'ward', t: 'Buy it. Then we cook something worth the felony.' }
    ],
    objective: { type: 'ownProperty', property: 'lab', label: 'Buy The Hive underground lab' },
    reward: { dirty: 600, clean: 1200, rep: 8, heat: 0 },
    nextHint: 'The lab is expensive. Launder more clean cash and expand your grow.'
  },
  {
    id: 'm6', act: 'ACT II', title: 'Blue Cipher', place: 'The Hive · Sublevel 3',
    lines: [
      { s: 'ward', t: 'Blue Cipher. A strain with a crystalline finish. It is also a diva.' },
      { s: 'milo', t: 'I want purity you can see through.' },
      { s: 'ward', t: 'Then stabilize the batch. Heat it, cool it, and catch the needle in the green. Anything else is expensive garbage.' },
      { s: 'milo', t: 'And if I miss?' },
      { s: 'ward', t: 'You will learn. The batch will not care. That is the beauty of chemistry: it has no sympathy and perfect memory.' }
    ],
    objective: { type: 'refine', target: 1, label: 'Refine 1 batch in the lab' },
    reward: { dirty: 900, clean: 1500, rep: 10, heat: 6 },
    nextHint: 'Open GROW and pick REFINE. Catch the needle in the green zone.'
  }
];

export const MISSIONS_2 = [
  {
    id: 'm7', act: 'ACT III', title: 'The Blue Orchid', place: 'The Blue Orchid Club · VIP floor',
    lines: [
      { s: 'narrator', t: 'Vera Sloane does not attend meetings. She grants audiences.' },
      { s: 'vera', t: 'Milo Vance. The chemist who cooks in a basement and dreams of a skyline.' },
      { s: 'milo', t: 'You\'ve been watching me.' },
      { s: 'vera', t: 'I watch everything that grows in my garden. You can be a supplier, or a cautionary tale.' },
      { s: 'milo', t: 'I\'m not interested in being either.' },
      { s: 'vera', t: 'That\'s what the last three said. Their funerals were lovely. Open caskets. Very tasteful.' },
      { s: 'rook', t: 'Say the word, Vera. I\'ll make it look like an accident.' },
      { s: 'vera', t: 'Not yet, Rook. I like him. He has that doomed confidence.' }
    ],
    choice: {
      prompt: 'Vera offers distribution through the Syndicate.',
      options: [
        { label: 'Take the deal', sub: '+$2,500 clean · Heat -10', effects: { clean: 2500, heat: -10, rep: 2, flag: 'alliedVera' },
          reply: 'Vera smiles without warmth. "A smart animal knows when the fence is a friend." Rook escorts you out. The money arrives before you reach the street.' },
        { label: 'Walk away', sub: '+Reputation · +Heat', effects: { heat: 15, rep: 8, flag: 'rivalVera' },
          reply: '"Then we are competitors," Vera says. "How refreshing. I haven\'t had one survive past winter." Rook memorizes your face.' }
      ]
    },
    objective: { type: 'sellQuality', target: 80, label: 'Sell 80g of quality 70+' },
    reward: { dirty: 0, clean: 3000, rep: 10, heat: 4 },
    nextHint: 'Grow Blue Cipher, tend it well, and sell premium product.'
  },
  {
    id: 'm8', act: 'ACT III', title: 'Bad Chemistry', place: 'Ashgrove Apartments · 4B',
    lines: [
      { s: 'narrator', t: 'The knock is polite. That is how you know it is serious.' },
      { s: 'marlow', t: 'Detective Ada Marlow. Your aunt\'s apartment had a curious electricity bill.' },
      { s: 'milo', t: 'She liked lamps.' },
      { s: 'marlow', t: 'So do I. The kind with batteries and a warrant. I\'ll be watching, Mr. Vance.' },
      { s: 'milo', t: 'Is that a threat?' },
      { s: 'marlow', t: 'It\'s an invitation. To make better choices. I don\'t expect you\'ll accept.' },
      { s: 'narrator', t: 'She leaves a card on the counter. On the back: a phone number and the word "talk".' }
    ],
    choice: {
      prompt: 'Marlow is giving you a chance to cooperate.',
      options: [
        { label: 'Become an informant', sub: 'Heat -30 · Dangerous promise', effects: { heat: -30, rep: -2, flag: 'informant' },
          reply: 'You tell her about a shipment that isn\'t yours. She writes it down. Somewhere in the city, a stranger\'s life gets shorter.' },
        { label: 'Lawyer up', sub: '-$600 · +Heat', effects: { dirty: -600, heat: 5, flag: 'lawyered' },
          reply: 'Lenny arrives in twelve minutes with a briefcase and a smoothie. "Don\'t talk to cops. Talk to me. I bill by the syllable."' }
      ]
    },
    objective: { type: 'heatBelow', target: 30, label: 'Get heat below 30%' },
    reward: { dirty: 0, clean: 2000, rep: 6, heat: 0 },
    nextHint: 'Use LAUNDER or the HEAT panel to cool police interest.'
  },
  {
    id: 'm9', act: 'ACT III', title: 'Warehouse 9', place: 'Pier 9 · East Docks',
    lines: [
      { s: 'dex', t: 'Pier Nine. Forty thousand square feet of plausible deniability.' },
      { s: 'milo', t: 'We can move real weight here.' },
      { s: 'dex', t: 'We can move the whole city. I already found buyers who don\'t ask questions.' },
      { s: 'milo', t: 'Buyers like who?' },
      { s: 'dex', t: 'Relax. I vet them. You grow, I sell. That was the deal.' },
      { s: 'narrator', t: 'Dex is smiling. He has been smiling a lot lately. You tell yourself it means nothing.' }
    ],
    objective: { type: 'ownProperty', property: 'warehouse', label: 'Buy the Pier 9 warehouse' },
    reward: { dirty: 0, clean: 4000, rep: 12, heat: 5 },
    nextHint: 'Launder serious cash and buy Pier 9 in PROPERTIES.'
  },
  {
    id: 'm10', act: 'ACT III', title: 'Cracks in the Glass', place: 'Pier 9 · Office',
    lines: [
      { s: 'narrator', t: 'Money changes people. Usually into the person they were pretending not to be.' },
      { s: 'bea', t: 'Dex has been making calls. Not to buyers. To Vera.' },
      { s: 'milo', t: 'He wouldn\'t.' },
      { s: 'bea', t: 'He would. The question is what you do before he finishes dialing.' },
      { s: 'priya', t: 'There\'s a second set of books in his desk. One for you, one for the people he\'s selling you to.' },
      { s: 'milo', t: 'We grew up together.' },
      { s: 'bea', t: 'Then he knows exactly where to put the knife.' }
    ],
    choice: {
      prompt: 'Dex is planning something. How do you handle it?',
      options: [
        { label: 'Confront him', sub: 'Loyalty · Uncertain', effects: { rep: 4, flag: 'confrontedDex' },
          reply: 'Dex cries. Actually cries. He says Nico\'s debt collectors found him first. You want to believe him. You almost do.' },
        { label: 'Set a trap', sub: '+Heat · Prepare for betrayal', effects: { heat: 10, rep: 2, flag: 'trappedDex' },
          reply: 'You plant a false ledger and a very real camera. If Dex wants to sell you, he\'ll sell a lie.' }
      ]
    },
    objective: { type: 'launder', target: 10000, label: 'Launder $10,000' },
    reward: { dirty: 0, clean: 6000, rep: 8, heat: 0, raid: true },
    nextHint: 'Wash ten thousand dollars. The city is watching.'
  },
  {
    id: 'm11', act: 'ACT IV', title: 'Laundry Day', place: 'Kestrel Legal · Downtown',
    lines: [
      { s: 'lenny', t: 'You\'re not a dealer anymore. You\'re an institution. Institutions have front porches.' },
      { s: 'milo', t: 'You want me to buy a business.' },
      { s: 'lenny', t: 'Buy a legitimate business, wash your money in public, and smile for the cameras.' },
      { s: 'lenny', t: 'The DEA doesn\'t bust successful businessmen. They wait for them to get sloppy. So don\'t.' },
      { s: 'milo', t: 'And Dex?' },
      { s: 'lenny', t: 'Dex is a loose thread. Threads get pulled. Empires unravel. Buy a car wash.' }
    ],
    objective: { type: 'ownFront', target: 1, label: 'Buy a legitimate front' },
    reward: { dirty: 0, clean: 8000, rep: 10, heat: -8 },
    nextHint: 'Open LAUNDER and acquire a front like Sunshine Car Wash.'
  },
  {
    id: 'm12', act: 'ACT IV', title: 'The Aerie', place: 'The Aerie · Top floor',
    lines: [
      { s: 'narrator', t: 'The elevator opens onto marble, glass, and a city that looks like a map of everything you own.' },
      { s: 'vera', t: 'From a dead woman\'s apartment to the top of the city. You should be proud.' },
      { s: 'milo', t: 'I\'m not done.' },
      { s: 'vera', t: 'No. You\'re at the part where empires eat each other.' },
      { s: 'vera', t: 'One last deal, Milo. Merge with me, or burn with the rest of them.' },
      { s: 'milo', t: 'You burned my friend. You put a price on my life.' },
      { s: 'vera', t: 'And yet here you are, wearing a better suit than the one you died in.' }
    ],
    objective: { type: 'ownProperty', property: 'empire', label: 'Buy The Aerie penthouse' },
    reward: { dirty: 0, clean: 10000, rep: 15, heat: 8 },
    nextHint: 'The Aerie costs $50,000 clean. Launder everything you have.'
  },
  {
    id: 'm13', act: 'ACT IV', title: 'Empire', place: 'The Aerie · Rooftop',
    lines: [
      { s: 'milo', t: 'Every empire thinks it\'s permanent. That\'s how you know where to hit it.' },
      { s: 'vera', t: 'You think you\'re different from me?' },
      { s: 'milo', t: 'No. I think I\'m better at it.' },
      { s: 'vera', t: 'One last deal, Milo. Merge, or burn.' },
      { s: 'rook', t: 'Say the word. I\'ve been waiting a long time for this.' },
      { s: 'narrator', t: 'Below, the city glitters. Above, the sky is clear. Somewhere, a police radio crackles.' }
    ],
    choice: {
      prompt: 'The final decision.',
      options: [
        { label: 'Merge with Vera', sub: 'A throne with two shadows', effects: { clean: 20000, heat: -20, rep: 8, flag: 'merged' },
          reply: 'You sign. Vera pours two glasses of something older than both of you. The city gets a new king and queen. Neither of you sleeps well.' },
        { label: 'Burn it down', sub: 'War · +Heat · Total control', effects: { heat: 20, rep: 15, flag: 'war' },
          reply: 'You slide the false ledger across the table. Rook reads it. Then he reads Vera\'s face. For the first time, the queen looks uncertain.' }
      ]
    },
    objective: { type: 'sellGrams', target: 300, label: 'Sell 300 grams as the empire' },
    reward: { dirty: 25000, clean: 25000, rep: 20, heat: -30, ending: true },
    nextHint: 'Flood the city. Sell 300 grams to complete your empire.'
  }
];
