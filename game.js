/* ============================================================
   GOLDEN ACE — mobile blackjack
   A self-contained blackjack game: player at the bottom,
   two AI players at the sides, dealer at the top.
   ============================================================ */
(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  const SUITS = [
    { s: '♠', red: false },
    { s: '♥', red: true },
    { s: '♦', red: true },
    { s: '♣', red: false },
  ];
  const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const DENOMS = [1, 5, 25, 100, 500];
  const AI_KEYS = ['left', 'right'];
  const AI_NAMES = { left: 'MIA', right: 'LEO' };
  const KEYS = ['player', 'left', 'right'];
  const NUM_DECKS = 6;

  const STORE_BANK = 'goldenAce.bankroll.v1';
  const STORE_SOUND = 'goldenAce.sound.v1';

  function readStore(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return v === null ? fallback : v;
    } catch { return fallback; }
  }
  function writeStore(key, value) {
    try { localStorage.setItem(key, value); } catch { /* private mode */ }
  }
  function loadBank() {
    const n = Number(readStore(STORE_BANK, '500'));
    return Number.isFinite(n) && n >= 0 ? n : 500;
  }
  function money(n) {
    const rounded = Math.round(n * 100) / 100;
    return rounded.toLocaleString('en-US', { maximumFractionDigits: 2 });
  }

  const state = {
    phase: 'bet',              // bet | deal | player | ai | dealer | result
    bankroll: loadBank(),
    playerBet: 0,
    bets: { player: 0, left: 0, right: 0 },
    hands: { player: [], left: [], right: [], dealer: [] },
    outcomes: {},
    deck: [],
    busy: false,
    soundOn: readStore(STORE_SOUND, 'on') !== 'off',
    round: 0,
    ai: {
      left: { bal: 500 },
      right: { bal: 500 },
    },
  };

  /* ------------------------------------------------------------
     sound
     ------------------------------------------------------------ */
  const Sound = {
    ctx: null,
    ensure() {
      if (!state.soundOn) return;
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) this.ctx = new AC();
      }
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    },
    tone(freq, dur, type, vol, delay = 0) {
      if (!state.soundOn) return;
      this.ensure();
      const ctx = this.ctx;
      if (!ctx) return;
      const t = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(vol, t + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + dur + 0.03);
    },
    chip() { this.tone(760, 0.07, 'triangle', 0.035); this.tone(1180, 0.05, 'sine', 0.016, 0.012); },
    deal() { this.tone(230, 0.09, 'triangle', 0.055); this.tone(135, 0.12, 'sine', 0.03, 0.018); },
    flip() { this.tone(540, 0.08, 'triangle', 0.035); },
    win() { [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.22, 'triangle', 0.045, i * 0.085)); },
    lose() { this.tone(196, 0.24, 'sine', 0.045); this.tone(147, 0.34, 'sine', 0.035, 0.12); },
    push() { this.tone(392, 0.18, 'triangle', 0.04); this.tone(392, 0.2, 'triangle', 0.025, 0.17); },
    err() { this.tone(140, 0.12, 'square', 0.025); },
  };

  function haptic(ms = 8) {
    try { navigator.vibrate?.(ms); } catch { /* ignored */ }
  }

  /* ------------------------------------------------------------
     elements
     ------------------------------------------------------------ */
  const els = {
    bankroll: $('bankroll'),
    statusText: $('statusText'),
    statusDot: $('statusDot'),
    betReadout: $('betReadout'),
    primary: $('primaryBtn'),
    secondary: $('secondaryBtn'),
    controls: $('controls'),
    shopBtn: $('shopBtn'),
    soundBtn: $('soundBtn'),
    chipRail: $('chipRail'),
    banner: $('banner'),
    toast: $('toast'),
    sheet: $('shopSheet'),
    table: $('table'),
    seats: {
      dealer: $('seat-dealer'),
      player: $('seat-player'),
      left: $('seat-left'),
      right: $('seat-right'),
    },
    hands: {
      dealer: $('hand-dealer'),
      player: $('hand-player'),
      left: $('hand-left'),
      right: $('hand-right'),
    },
    values: {
      dealer: $('value-dealer'),
      player: $('value-player'),
      left: $('value-left'),
      right: $('value-right'),
    },
    chips: {
      player: $('chips-player'),
      left: $('chips-left'),
      right: $('chips-right'),
    },
    labels: {
      player: $('label-player'),
      left: $('label-left'),
      right: $('label-right'),
    },
    betspots: {
      player: $('bet-player'),
      left: $('bet-left'),
      right: $('bet-right'),
    },
    captionDealer: $('caption-dealer'),
  };

  /* ------------------------------------------------------------
     deck / values
     ------------------------------------------------------------ */
  function buildDeck() {
    const cards = [];
    for (let d = 0; d < NUM_DECKS; d++) {
      for (const suit of SUITS) {
        for (const rank of RANKS) {
          cards.push({ rank, suit: suit.s, red: suit.red });
        }
      }
    }
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    return cards;
  }

  function draw() {
    if (!state.deck.length) state.deck = buildDeck();
    return state.deck.pop();
  }

  function valueOf(cards) {
    let total = 0;
    let aces = 0;
    for (const card of cards) {
      if (card.hidden) continue;
      if (card.rank === 'A') {
        aces += 1;
        total += 11;
      } else if (card.rank === 'K' || card.rank === 'Q' || card.rank === 'J') {
        total += 10;
      } else {
        total += Number(card.rank);
      }
    }
    while (total > 21 && aces > 0) {
      total -= 10;
      aces -= 1;
    }
    return { total, soft: aces > 0 };
  }

  function hasHidden(cards) {
    return cards.some(card => card.hidden);
  }

  /* ------------------------------------------------------------
     card rendering
     ------------------------------------------------------------ */
  function makeCardEl(card) {
    const el = document.createElement('div');
    el.className = 'card' + (card.red ? ' red' : '');
    if (card.hidden) {
      el.classList.add('back');
      el.dataset.sig = 'back';
      el.setAttribute('aria-label', 'Face down card');
      return el;
    }
    el.dataset.sig = card.rank + card.suit;
    el.setAttribute('aria-label', `${card.rank} of ${card.suit}`);
    el.innerHTML =
      `<span class="corner tl"><b>${card.rank}</b><i>${card.suit}</i></span>` +
      `<span class="pip">${card.suit}</span>` +
      `<span class="corner br"><b>${card.rank}</b><i>${card.suit}</i></span>`;
    return el;
  }

  function renderHand(key, animate = true) {
    const wrap = els.hands[key];
    const cards = state.hands[key];
    if (!wrap) return;

    wrap.classList.toggle('dense', cards.length > 4);

    while (wrap.children.length > cards.length) {
      wrap.lastElementChild.remove();
    }

    cards.forEach((card, i) => {
      const sig = card.hidden ? 'back' : card.rank + card.suit;
      const current = wrap.children[i];
      if (!current) {
        const el = makeCardEl(card);
        if (animate) el.classList.add('deal-in');
        wrap.appendChild(el);
      } else if (current.dataset.sig !== sig) {
        const el = makeCardEl(card);
        if (animate) el.classList.add('flip-in');
        current.replaceWith(el);
      }
    });
  }

  function setValueBadge(key) {
    const el = els.values[key];
    if (!el) return;
    const cards = state.hands[key];
    if (!cards.length) {
      el.textContent = '—';
      el.className = 'value';
      return;
    }

    const hidden = hasHidden(cards);
    const v = valueOf(cards);
    const twoCard21 = cards.length === 2 && !hidden && v.total === 21;

    if (key === 'dealer' && hidden) {
      el.textContent = `${v.total} +`;
      el.className = 'value soft';
      return;
    }
    el.textContent = String(v.total);
    let cls = 'value';
    if (v.total > 21) cls += ' bust';
    else if (twoCard21) cls += ' blackjack';
    else if (v.soft) cls += ' soft';
    el.className = cls;
  }

  function renderSeat(key, animate = true) {
    renderHand(key, animate);
    setValueBadge(key);
  }

  function renderAll(animate = false) {
    ['dealer', 'player', 'left', 'right'].forEach(key => renderSeat(key, animate));
  }

  function setActive(key) {
    Object.entries(els.seats).forEach(([k, el]) => {
      el.classList.toggle('active', k === key);
    });
  }

  /* ------------------------------------------------------------
     chips + bet spots
     ------------------------------------------------------------ */
  function breakChips(amount) {
    let left = Math.round(amount);
    const out = [];
    for (const d of [500, 100, 25, 5, 1]) {
      while (left >= d && out.length < 9) {
        out.push(d);
        left -= d;
      }
      if (out.length >= 9) break;
    }
    return out;
  }

  function chipMarkup(value) {
    return `<div class="chip chip-${value}"><span>${value}</span></div>`;
  }

  function renderBet(key) {
    const chipsEl = els.chips[key];
    const label = els.labels[key];
    if (!chipsEl || !label) return;

    const bet = state.bets[key];
    const outcome = state.outcomes[key];
    const empty = !bet && !outcome;
    els.betspots[key]?.classList.toggle('empty', empty);

    if (empty) {
      chipsEl.innerHTML = '';
      label.textContent = '';
      label.className = 'bet-label';
      return;
    }

    const stack = breakChips(bet).slice(0, 4).reverse();
    chipsEl.innerHTML = stack
      .map((value, i) => chipMarkup(value).replace('class="chip', `style="--stack-i:${i}" class="chip`))
      .join('');
    if (!outcome) {
      const last = chipsEl.lastElementChild;
      if (last) last.classList.add('chip-pop');
    }
    label.textContent = outcome ? outcome.label : `$${money(bet)}`;
    label.className = outcome ? `bet-label ${outcome.cls}` : 'bet-label';
  }

  function renderBets() {
    KEYS.forEach(renderBet);
  }

  function refreshChipStates() {
    const betting = state.phase === 'bet';
    const available = Math.max(0, state.bankroll - (betting ? state.playerBet : 0));
    els.chipRail.querySelectorAll('.rail-chip').forEach(btn => {
      const value = Number(btn.dataset.value);
      const canAfford = value <= available;
      const wasHidden = btn.classList.contains('hide');
      btn.classList.toggle('hide', !canAfford);
      btn.classList.toggle('locked', !betting);
      if (wasHidden && canAfford) {
        btn.classList.remove('return-in');
        void btn.offsetWidth;
        btn.classList.add('return-in');
      } else if (!canAfford) {
        btn.classList.remove('return-in');
      }
    });
    layoutChipRail();
  }

  function layoutChipRail() {
    const chips = [...els.chipRail.querySelectorAll('.rail-chip')].filter(btn => !btn.classList.contains('hide'));
    const gap = 11.6;
    const span = gap * Math.max(0, chips.length - 1);
    chips.forEach((btn, i) => {
      const x = chips.length === 1 ? 0 : -span / 2 + i * gap;
      const y = 44.6 - 0.0136 * x * x;
      btn.style.left = `calc(50% + ${x.toFixed(2)}%)`;
      btn.style.top = `calc(50% + ${y.toFixed(2)}%)`;
    });
  }

  function buildChipRail() {
    const denominations = [1, 5, 25, 100, 500];
    els.chipRail.innerHTML = '';
    denominations.forEach(value => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'rail-chip hint';
      btn.dataset.value = String(value);
      btn.setAttribute('aria-label', `Add a $${value} chip to your bet`);
      btn.innerHTML = chipMarkup(value);
      btn.addEventListener('click', () => addBet(value));
      els.chipRail.appendChild(btn);
    });
    layoutChipRail();
  }

  function addBet(value) {
    if (state.phase !== 'bet' || state.busy) return;
    if (state.playerBet + value > state.bankroll) {
      showToast('Not enough chips in the bank');
      Sound.err();
      haptic(18);
      const spot = els.betspots.player;
      spot.classList.remove('shake');
      void spot.offsetWidth;
      spot.classList.add('shake');
      return;
    }
    state.playerBet += value;
    state.bets.player = state.playerBet;
    state.busy = false;
    renderBet('player');
    updateBank();
    renderControls();
    refreshChipStates();
    updateStatusForBet();
    Sound.chip();
    haptic(7);
    els.chipRail.querySelectorAll('.rail-chip.hint').forEach(el => el.classList.remove('hint'));
    els.betReadout.classList.remove('flash');
    void els.betReadout.offsetWidth;
    els.betReadout.classList.add('flash');
  }

  function clearBet() {
    if (state.phase !== 'bet') return;
    state.playerBet = 0;
    state.bets.player = 0;
    renderBet('player');
    updateBank();
    renderControls();
    refreshChipStates();
    updateStatusForBet();
    Sound.chip();
  }

  /* ------------------------------------------------------------
     UI status / controls
     ------------------------------------------------------------ */
  function updateBank() {
    els.bankroll.textContent = `$${money(state.bankroll)}`;
  }

  function setStatus(text) {
    els.statusText.textContent = text;
  }

  function updateStatusForBet() {
    setStatus(state.playerBet > 0 ? 'READY TO DEAL' : 'PLACE YOUR BET');
    els.betReadout.innerHTML = `BET <b>$${money(state.bets.player)}</b>`;
  }

  function updateBetReadout() {
    els.betReadout.innerHTML = `BET <b>$${money(state.bets.player)}</b>`;
  }

  function renderControls() {
    const p = state.phase;
    els.controls.classList.toggle('solo', p === 'result');
    els.primary.disabled = false;
    els.secondary.disabled = false;

    if (p === 'bet') {
      els.secondary.textContent = 'CLEAR';
      els.secondary.className = 'btn secondary';
      els.primary.textContent = state.playerBet > 0 ? `DEAL · $${money(state.playerBet)}` : 'DEAL';
      els.primary.className = 'btn primary';
      els.primary.disabled = state.playerBet <= 0;
      els.secondary.disabled = state.playerBet <= 0;
    } else if (p === 'player') {
      els.secondary.textContent = 'HIT';
      els.secondary.className = 'btn secondary hit';
      els.primary.textContent = 'STAND';
      els.primary.className = 'btn primary stand';
      const disabled = state.busy;
      els.primary.disabled = disabled;
      els.secondary.disabled = disabled;
    } else if (p === 'result') {
      els.secondary.textContent = 'CLEAR';
      els.secondary.className = 'btn secondary';
      els.primary.textContent = 'NEXT HAND';
      els.primary.className = 'btn primary';
    } else {
      els.secondary.textContent = 'HIT';
      els.secondary.className = 'btn secondary hit';
      els.primary.textContent = 'STAND';
      els.primary.className = 'btn primary stand';
      els.primary.disabled = true;
      els.secondary.disabled = true;
    }
  }

  let toastTimer = null;
  function showToast(message) {
    els.toast.textContent = message;
    els.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => els.toast.classList.remove('show'), 1900);
  }

  function showBanner(text, cls = '', sub = '') {
    els.banner.innerHTML = `<span>${text}</span>` + (sub ? `<b>${sub}</b>` : '');
    els.banner.className = `banner show ${cls}`.trim();
  }
  function hideBanner() {
    els.banner.className = 'banner';
  }

  function setBusy(busy) {
    state.busy = busy;
    renderControls();
    refreshChipStates();
  }

  /* ------------------------------------------------------------
     AI betting
     ------------------------------------------------------------ */
  function prepareAiBets() {
    AI_KEYS.forEach(key => {
      if (state.ai[key].bal < 10) state.ai[key].bal += 200;
      const bal = state.ai[key].bal;
      const options = [10, 25, 50, 100].filter(v => v <= bal);
      const bet = options.length
        ? options[Math.floor(Math.random() * options.length)]
        : Math.max(1, Math.min(bal, 5));
      state.bets[key] = bet;
    });
  }

  /* ------------------------------------------------------------
     round flow
     ------------------------------------------------------------ */
  function saveBank() {
    writeStore(STORE_BANK, String(Math.round(state.bankroll * 100) / 100));
  }

  function resetTableForBetting() {
    state.hands = { player: [], left: [], right: [], dealer: [] };
    state.outcomes = {};
    state.bets = { player: 0, left: 0, right: 0 };
    state.playerBet = 0;
    state.phase = 'bet';
    state.busy = false;
    hideBanner();
    setActive(null);
    if (els.captionDealer) els.captionDealer.textContent = 'STANDS ON 17';
    prepareAiBets();
    renderAll(false);
    renderBets();
    renderControls();
    refreshChipStates();
    updateStatusForBet();
    updateBank();
  }

  function nextHand() {
    if (state.phase !== 'result') return;
    if (state.bankroll < 1) {
      state.bankroll = 100;
      saveBank();
      showToast('The house spots you $100');
    }
    resetTableForBetting();
    setStatus('PLACE YOUR BET');
    Sound.chip();
  }

  async function dealRound() {
    if (state.phase !== 'bet' || state.playerBet <= 0 || state.busy) return;

    state.busy = true;
    state.phase = 'deal';
    state.round += 1;
    state.outcomes = {};
    state.bets.player = state.playerBet;

    state.bankroll = Math.round((state.bankroll - state.playerBet) * 100) / 100;
    AI_KEYS.forEach(key => {
      state.ai[key].bal -= state.bets[key];
    });
    saveBank();
    updateBank();
    renderBets();
    renderControls();
    refreshChipStates();
    setStatus('DEALING');
    hideBanner();
    setActive(null);

    state.hands = { player: [], left: [], right: [], dealer: [] };
    state.deck = buildDeck();
    renderAll(false);

    await sleep(140);

    // First card around the table.
    for (const key of KEYS) {
      state.hands[key].push(draw());
      renderSeat(key);
      Sound.deal();
      await sleep(210);
    }
    state.hands.dealer.push(draw());
    renderSeat('dealer');
    Sound.deal();
    await sleep(270);

    // Second card around the table.
    for (const key of KEYS) {
      state.hands[key].push(draw());
      renderSeat(key);
      Sound.deal();
      await sleep(190);
    }
    const hole = draw();
    hole.hidden = true;
    state.hands.dealer.push(hole);
    renderSeat('dealer');
    Sound.deal();
    setValueBadge('dealer');

    await sleep(380);
    updateBetReadout();

    const playerValue = valueOf(state.hands.player);
    if (playerValue.total === 21) {
      state.phase = 'player';
      state.busy = true;
      setActive('player');
      setStatus('BLACKJACK!');
      renderControls();
      refreshChipStates();
      showBanner('BLACKJACK!', 'win', 'PAYS 3 TO 2');
      Sound.win();
      haptic([12, 40, 12]);
      await sleep(900);
      await finishPlayer();
      return;
    }

    state.phase = 'player';
    state.busy = false;
    setActive('player');
    setStatus('YOUR TURN');
    renderControls();
    refreshChipStates();
    updateBetReadout();
  }

  async function hit() {
    if (state.phase !== 'player' || state.busy) return;
    state.busy = true;
    renderControls();

    state.hands.player.push(draw());
    renderSeat('player');
    Sound.deal();
    haptic(6);

    const v = valueOf(state.hands.player);
    if (v.total > 21) {
      setStatus('BUST');
      showBanner('BUST', 'lose');
      Sound.lose();
      haptic([20, 40, 20]);
      await sleep(760);
      state.busy = false;
      await finishPlayer();
    } else if (v.total === 21) {
      setStatus('21!');
      await sleep(620);
      state.busy = false;
      await finishPlayer();
    } else {
      state.busy = false;
      setStatus('YOUR TURN');
      renderControls();
    }
  }

  async function stand() {
    if (state.phase !== 'player' || state.busy) return;
    await finishPlayer();
  }

  async function aiPlay(key) {
    const hand = state.hands[key];
    let guard = 0;
    while (valueOf(hand).total < 17 && guard < 9) {
      await sleep(400);
      hand.push(draw());
      renderSeat(key);
      Sound.deal();
      guard += 1;
      await sleep(330);
      if (valueOf(hand).total > 21) {
        setStatus(`${AI_NAMES[key]} BUSTS`);
        await sleep(220);
        break;
      }
    }
    await sleep(240);
  }

  async function dealerPlay() {
    const hiddenIndex = state.hands.dealer.findIndex(card => card.hidden);
    if (hiddenIndex !== -1) {
      state.hands.dealer[hiddenIndex].hidden = false;
      renderSeat('dealer');
      Sound.flip();
      await sleep(620);
    }
    let guard = 0;
    while (valueOf(state.hands.dealer).total < 17 && guard < 9) {
      await sleep(560);
      state.hands.dealer.push(draw());
      renderSeat('dealer');
      Sound.deal();
      guard += 1;
    }
    await sleep(320);
  }

  async function finishPlayer() {
    if (state.phase !== 'player') return;
    state.phase = 'ai';
    state.busy = true;
    renderControls();
    refreshChipStates();
    setActive('left');
    setStatus('MIA PLAYS');
    updateBetReadout();
    await sleep(520);

    await aiPlay('left');
    setActive('right');
    setStatus('LEO PLAYS');
    await sleep(380);
    await aiPlay('right');

    state.phase = 'dealer';
    setActive('dealer');
    setStatus('DEALER PLAYS');
    await sleep(380);
    await dealerPlay();

    settle();
  }

  /* ------------------------------------------------------------
     settlement
     ------------------------------------------------------------ */
  function settle() {
    const dealerValue = valueOf(state.hands.dealer);
    const dealerTotal = dealerValue.total;
    const dealerBJ = state.hands.dealer.length === 2 && dealerTotal === 21;
    const playerHand = state.hands.player;
    const playerValue = valueOf(playerHand);
    const playerBJ = playerHand.length === 2 && playerValue.total === 21;
    const playerBust = playerValue.total > 21;

    state.phase = 'result';
    state.busy = false;
    state.outcomes = {};

    let totalReturned = 0;

    for (const key of KEYS) {
      const bet = state.bets[key];
      if (!bet) continue;
      const v = valueOf(state.hands[key]);
      const bust = v.total > 21;
      const bj = state.hands[key].length === 2 && v.total === 21;
      let returned = 0;
      let net = -bet;
      let cls = 'lose';

      if (bust) {
        net = -bet;
        cls = 'lose';
      } else if (dealerBJ) {
        if (bj) { returned = bet; net = 0; cls = 'push'; }
        else { net = -bet; cls = 'lose'; }
      } else if (bj) {
        returned = Math.round(bet * 2.5 * 100) / 100;
        net = Math.round((returned - bet) * 100) / 100;
        cls = 'win';
      } else if (dealerTotal > 21 || v.total > dealerTotal) {
        returned = bet * 2;
        net = bet;
        cls = 'win';
      } else if (v.total === dealerTotal) {
        returned = bet;
        net = 0;
        cls = 'push';
      } else {
        net = -bet;
        cls = 'lose';
      }

      returned = Math.round(returned * 100) / 100;
      net = Math.round(net * 100) / 100;

      if (key === 'player') {
        state.bankroll = Math.round((state.bankroll + returned) * 100) / 100;
      } else {
        state.ai[key].bal += returned;
      }
      totalReturned += returned;

      state.outcomes[key] = {
        cls,
        net,
        label: cls === 'push' ? 'PUSH' : `${net >= 0 ? '+' : '−'}$${money(Math.abs(net))}`,
      };
    }

    saveBank();
    updateBank();
    renderAll(false);
    renderBets();
    renderControls();
    refreshChipStates();
    setActive(null);
    updateBetReadout();

    const playerOutcome = state.outcomes.player;
    if (playerOutcome) {
      if (playerOutcome.cls === 'win') {
        const main = playerBJ && !dealerBJ ? 'BLACKJACK' : 'YOU WIN';
        showBanner(main, 'win', `+$${money(playerOutcome.net)}`);
        setStatus(playerBJ && !dealerBJ ? 'BLACKJACK — PAID 3 TO 2' : 'YOU WIN');
        Sound.win();
        haptic([10, 30, 10, 30, 16]);
      } else if (playerOutcome.cls === 'push') {
        showBanner('PUSH', 'push');
        setStatus('PUSH — BET RETURNED');
        Sound.push();
        haptic(10);
      } else {
        showBanner(playerBust ? 'BUST' : 'DEALER WINS', 'lose');
        setStatus(playerBust ? `BUST — LOST $${money(state.bets.player)}` : `DEALER WINS — LOST $${money(state.bets.player)}`);
        if (!playerBust) Sound.lose();
      }
    }

    // Reveal dealer result in its caption line.
    if (els.captionDealer) {
      els.captionDealer.textContent = dealerTotal > 21 ? 'DEALER BUST' : dealerBJ ? 'DEALER BLACKJACK' : 'STANDS ON 17';
    }

    if (totalReturned === 0 && state.bankroll < 1) {
      setTimeout(() => showToast('Next hand: the house spots you $100'), 1400);
    }
  }

  /* ------------------------------------------------------------
     shop + sound
     ------------------------------------------------------------ */
  function openShop() {
    els.sheet.classList.add('open');
    els.sheet.setAttribute('aria-hidden', 'false');
    haptic(6);
  }
  function closeShop() {
    els.sheet.classList.remove('open');
    els.sheet.setAttribute('aria-hidden', 'true');
  }

  function renderSoundButton() {
    els.soundBtn.classList.toggle('muted', !state.soundOn);
    els.soundBtn.setAttribute('aria-pressed', String(state.soundOn));
    els.soundBtn.setAttribute('aria-label', state.soundOn ? 'Mute sound' : 'Unmute sound');
  }

  function toggleSound() {
    state.soundOn = !state.soundOn;
    writeStore(STORE_SOUND, state.soundOn ? 'on' : 'off');
    renderSoundButton();
    if (state.soundOn) {
      Sound.ensure();
      Sound.chip();
    }
  }

  /* ------------------------------------------------------------
     input wiring
     ------------------------------------------------------------ */
  els.primary.addEventListener('click', () => {
    Sound.ensure();
    if (state.phase === 'bet') dealRound();
    else if (state.phase === 'player') stand();
    else if (state.phase === 'result') nextHand();
  });

  els.secondary.addEventListener('click', () => {
    Sound.ensure();
    if (state.phase === 'bet') clearBet();
    else if (state.phase === 'player') hit();
  });

  els.shopBtn.addEventListener('click', () => { Sound.ensure(); openShop(); });
  $('shopClose').addEventListener('click', closeShop);
  $('shopDone').addEventListener('click', closeShop);
  els.sheet.querySelector('[data-close]').addEventListener('click', closeShop);
  els.soundBtn.addEventListener('click', toggleSound);

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && els.sheet.classList.contains('open')) closeShop();
    if (event.key === ' ' && state.phase === 'player') {
      event.preventDefault();
      hit();
    }
  });

  document.addEventListener('pointerdown', () => Sound.ensure(), { passive: true });
  document.addEventListener('gesturestart', event => event.preventDefault());
  document.addEventListener('dblclick', event => event.preventDefault());

  /* ------------------------------------------------------------
     boot
     ------------------------------------------------------------ */
  function boot() {
    if (state.bankroll < 1) state.bankroll = 500;
    updateBank();
    buildChipRail();
    renderSoundButton();
    resetTableForBetting();
    setStatus('PLACE YOUR BET');
    if (els.captionDealer) els.captionDealer.textContent = 'STANDS ON 17';

    // A tiny hook for automated visual checks; harmless for players.
    window.__goldenAce = {
      state,
      addBet,
      dealRound,
      hit,
      stand,
      nextHand,
      settle,
    };
  }

  boot();
})();
