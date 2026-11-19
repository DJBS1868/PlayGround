(() => {
  "use strict";

  const $ = (sel, el = document) => el.querySelector(sel);
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const fmt = (n) => "$" + Math.max(0, Math.round(n)).toLocaleString("en-US");

  const SUITS = [
    { key: "S", symbol: "♠", color: "black" },
    { key: "H", symbol: "♥", color: "red" },
    { key: "D", symbol: "♦", color: "red" },
    { key: "C", symbol: "♣", color: "black" },
  ];
  const RANKS = [
    { rank: "A", value: 11 },
    { rank: "2", value: 2 }, { rank: "3", value: 3 }, { rank: "4", value: 4 },
    { rank: "5", value: 5 }, { rank: "6", value: 6 }, { rank: "7", value: 7 },
    { rank: "8", value: 8 }, { rank: "9", value: 9 }, { rank: "10", value: 10 },
    { rank: "J", value: 10 }, { rank: "Q", value: 10 }, { rank: "K", value: 10 },
  ];
  const CHIP_VALUES = [1, 5, 25, 100, 500];
  const AI_SEATS = ["left", "right"];

  const el = {
    stage: $("#stage"),
    tableWrap: $("#tableWrap"),
    felt: $("#felt"),
    shoe: $("#shoe"),
    tray: $("#trayChips"),
    trayHint: $("#trayHint"),
    bankroll: $("#bankroll"),
    handNo: $("#handNo"),
    playerBank: $("#playerBank"),
    leftBank: $("#leftBank"),
    rightBank: $("#rightBank"),
    betValue: $("#betValue"),
    dealBtn: $("#dealBtn"),
    hitBtn: $("#hitBtn"),
    standBtn: $("#standBtn"),
    nextBtn: $("#nextBtn"),
    clearBtn: $("#clearBetBtn"),
    shopBtn: $("#shopBtn"),
    shopModal: $("#shopModal"),
    soundBtn: $("#soundBtn"),
    hint: $("#hint"),
    trayTitle: $("#trayTitle"),
    callout: $("#betCallout"),
    banner: $("#banner"),
    bannerEyebrow: $("#bannerEyebrow"),
    bannerTitle: $("#bannerTitle"),
    bannerSub: $("#bannerSub"),
    toast: $("#toast"),
    live: $("#live"),
    playerBetStack: $("#playerBetStack"),
    leftBetStack: $("#leftBetStack"),
    rightBetStack: $("#rightBetStack"),
    hands: {
      player: $("#playerHand"),
      left: $("#leftHand"),
      right: $("#rightHand"),
      dealer: $("#dealerHand"),
    },
    totals: {
      player: $("#playerTotal"),
      left: $("#leftTotal"),
      right: $("#rightTotal"),
      dealer: $("#dealerTotal"),
    },
    bubbles: {
      player: $("#playerBubble"),
      left: $("#leftBubble"),
      right: $("#rightBubble"),
      dealer: $("#dealerBubble"),
    },
    seats: {
      player: $("#playerSeat"),
      left: $("#leftSeat"),
      right: $("#rightSeat"),
      dealer: $("#dealerSeat"),
    },
  };

  const state = {
    phase: "bet",        // bet | dealing | player | ai | dealer | resolve
    busy: false,
    round: 0,
    bankroll: 1000,
    bet: 0,
    betChips: [],
    hands: { player: [], left: [], right: [], dealer: [] },
    shoe: [],
    dealerHidden: false,
    hiddenCardEl: null,
    activeSeat: null,
    sound: true,
    results: {},
    ai: {
      left: { name: "Nova", bank: 750, bet: 0 },
      right: { name: "Kai", bank: 750, bet: 0 },
    },
  };

  /* ---------------- sound ---------------- */
  let audio = null;
  function ctx() {
    if (!audio) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audio = new AC();
    }
    if (audio && audio.state === "suspended") audio.resume();
    return audio;
  }
  function tone(freq, dur = 0.07, type = "sine", gain = 0.035, delay = 0) {
    if (!state.sound) return;
    const ac = ctx();
    if (!ac) return;
    const t = ac.currentTime + delay;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(ac.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }
  const sfx = {
    chip() { tone(1040, 0.045, "triangle", 0.03); tone(1480, 0.05, "triangle", 0.018, 0.03); },
    card() { tone(240, 0.055, "triangle", 0.022); tone(180, 0.05, "sine", 0.018, 0.02); },
    deal() { tone(300, 0.05, "sine", 0.02); },
    win() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.22, "sine", 0.03, i * 0.075)); },
    blackjack() { [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, 0.3, "sine", 0.032, i * 0.08)); },
    lose() { tone(196, 0.22, "sine", 0.026); tone(147, 0.3, "sine", 0.022, 0.12); },
    push() { tone(392, 0.16, "sine", 0.022); tone(392, 0.16, "sine", 0.018, 0.14); },
    click() { tone(620, 0.04, "square", 0.012); },
  };

  /* ---------------- shoe & cards ---------------- */
  function buildShoe() {
    const cards = [];
    for (let d = 0; d < 6; d++) {
      for (const s of SUITS) for (const r of RANKS) cards.push({ ...r, suit: s.symbol, color: s.color });
    }
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    state.shoe = cards;
  }
  function drawCard() {
    if (state.shoe.length < 30) buildShoe();
    return state.shoe.pop();
  }
  function evalHand(cards) {
    let total = 0, aces = 0;
    for (const c of cards) {
      if (c.rank === "A") { total += 11; aces++; }
      else total += c.value;
    }
    while (total > 21 && aces > 0) { total -= 10; aces--; }
    return { total, soft: aces > 0, bust: total > 21, blackjack: cards.length === 2 && total === 21 };
  }

  function cardMarkup(card) {
    const court = ["J", "Q", "K"].includes(card.rank);
    const center = court
      ? `<div class="court"><span class="letter">${card.rank}</span><span class="suit">${card.suit}</span></div>`
      : `<span class="pip">${card.suit}</span>`;
    return `
      <div class="corner tl"><span class="rank">${card.rank}</span><span class="suit">${card.suit}</span></div>
      ${center}
      <div class="corner br"><span class="rank">${card.rank}</span><span class="suit">${card.suit}</span></div>`;
  }

  function makeCardEl(card) {
    const div = document.createElement("div");
    div.className = `card ${card.color}${card.rank === "A" ? " ace" : ""}`;
    div.innerHTML = cardMarkup(card);
    div.setAttribute("aria-label", `${card.rank} of ${card.suit}`);
    return div;
  }
  function makeBackEl() {
    const div = document.createElement("div");
    div.className = "card card--back";
    div.innerHTML = `<span class="back-logo">VA</span>`;
    div.setAttribute("aria-label", "Face-down card");
    return div;
  }

  function animateDeal(cardEl) {
    const shoeRect = el.shoe.getBoundingClientRect();
    const r = cardEl.getBoundingClientRect();
    const dx = shoeRect.left + shoeRect.width / 2 - (r.left + r.width / 2);
    const dy = shoeRect.top + shoeRect.height / 2 - (r.top + r.height / 2);
    cardEl.animate(
      [
        { transform: `translate(${dx}px, ${dy}px) rotate(${dx > 0 ? -14 : 14}deg) scale(.8)`, opacity: 0.15, filter: "brightness(1.5)" },
        { transform: "none", opacity: 1, filter: "brightness(1)" },
      ],
      { duration: 380, easing: "cubic-bezier(.2,.85,.25,1)" }
    );
    sfx.card();
  }

  async function dealCardTo(seat, hidden = false) {
    const card = drawCard();
    state.hands[seat].push(card);
    const cardEl = hidden ? makeBackEl() : makeCardEl(card);
    el.hands[seat].appendChild(cardEl);
    if (hidden) {
      state.dealerHidden = true;
      state.hiddenCardEl = cardEl;
    }
    el.hands[seat].classList.toggle("is-stacked", state.hands[seat].length >= 4);
    animateDeal(cardEl);
    updateTotal(seat);
    await wait(120);
  }

  /* ---------------- totals ---------------- */
  function updateTotal(seat) {
    const node = el.totals[seat];
    const cards = state.hands[seat];
    if (!cards.length) {
      node.classList.remove("show");
      node.innerHTML = "";
      return;
    }
    let value, isHidden = false;
    if (seat === "dealer" && state.dealerHidden) {
      value = evalHand(cards.slice(0, 1));
      isHidden = true;
    } else {
      value = evalHand(cards);
    }
    node.classList.toggle("is-bust", !isHidden && value.bust);
    node.classList.toggle("is-blackjack", !isHidden && value.blackjack);
    node.innerHTML = `${value.total}${isHidden ? '<span class="q">+?</span>' : ""}`;
    node.classList.add("show");
  }
  function updateAllTotals() {
    for (const seat of ["player", "left", "right", "dealer"]) updateTotal(seat);
  }

  /* ---------------- chips & bets ---------------- */
  function chipHtml(value, extra = "", showLabel = true) {
    return `<span class="chip chip--${value} ${extra}">${showLabel ? `<span class="chip-label">${value}</span>` : ""}</span>`;
  }

  const trayKey = { key: "" };
  function renderTray(force = false) {
    const key = `${state.phase}|${state.bet}|${state.bankroll}`;
    if (!force && key === trayKey.key) return;
    trayKey.key = key;
    el.tray.innerHTML = "";
    for (const value of CHIP_VALUES) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tray-slot";
      btn.dataset.value = String(value);
      btn.setAttribute("aria-label", `Bet ${fmt(value)}`);
      btn.disabled = state.phase !== "bet" || state.bet + value > state.bankroll;
      btn.innerHTML = `<span class="mini">${chipHtml(value, "", false)}${chipHtml(value, "", false)}${chipHtml(value)}</span>`;
      btn.addEventListener("click", () => addChip(value, btn));
      el.tray.appendChild(btn);
    }
    el.trayHint.style.opacity = state.phase === "bet" ? "" : "0";
  }

  function renderBetStack(node, chips, total) {
    node.innerHTML = "";
    if (!chips.length) return;
    const stack = document.createElement("div");
    stack.className = "stack";
    const shown = chips.slice(-7);
    shown.forEach((value, i) => {
      const c = document.createElement("span");
      c.className = `chip chip--${value}`;
      c.style.setProperty("--i", i);
      c.innerHTML = `<span class="chip-label">${value}</span>`;
      stack.appendChild(c);
    });
    const label = document.createElement("span");
    label.className = "stack-total";
    label.textContent = fmt(total);
    stack.appendChild(label);
    node.appendChild(stack);
  }

  function splitIntoStacks(amount) {
    const out = [];
    let left = amount;
    for (const v of [500, 100, 25, 5, 1]) {
      while (left >= v && out.length < 6) { out.push(v); left -= v; }
    }
    return out.reverse();
  }

  function renderPlayerBet() {
    renderBetStack(el.playerBetStack, state.betChips, state.bet);
    el.betValue.textContent = fmt(state.bet);
  }

  function renderAIBets() {
    for (const seat of AI_SEATS) {
      renderBetStack(el[`${seat}BetStack`], splitIntoStacks(state.ai[seat].bet), state.ai[seat].bet);
    }
  }

  function flyChip(fromEl, value) {
    const from = fromEl.getBoundingClientRect();
    const to = el.playerBetStack.getBoundingClientRect();
    const chip = document.createElement("span");
    chip.className = `chip chip--${value} flying-chip`;
    chip.innerHTML = `<span class="chip-label">${value}</span>`;
    chip.style.left = from.left + from.width / 2 + "px";
    chip.style.top = from.top + from.height / 2 + "px";
    document.body.appendChild(chip);
    const animation = chip.animate(
      [
        { transform: "translate(-50%, -50%) scale(1.12)", opacity: 1 },
        { transform: `translate(calc(-50% + ${to.left + to.width / 2 - from.left - from.width / 2}px), calc(-50% + ${to.top + to.height / 2 - from.top - from.height / 2}px)) scale(.72)`, opacity: 0.4 },
      ],
      { duration: 430, easing: "cubic-bezier(.25,.75,.25,1)" }
    );
    animation.onfinish = () => chip.remove();
  }

  function addChip(value, sourceEl) {
    if (state.phase !== "bet" || state.busy) return;
    if (state.bet + value > state.bankroll) return;
    state.bet += value;
    state.betChips.push(value);
    flyChip(sourceEl, value);
    sfx.chip();
    renderPlayerBet();
    updateControls();
    setHint("");
  }

  function clearBet() {
    if (state.phase !== "bet" || state.busy) return;
    state.bet = 0;
    state.betChips = [];
    sfx.click();
    renderPlayerBet();
    updateControls();
    setHint("Tap a chip on the rail to place your bet");
  }

  /* ---------------- UI helpers ---------------- */
  let bankDisplay = 1000;
  let bankAnimation = null;
  function updateBankroll(immediate = false) {
    el.playerBank.textContent = fmt(state.bankroll);
    const start = bankDisplay;
    const end = state.bankroll;
    if (immediate || start === end) {
      bankDisplay = end;
      el.bankroll.textContent = fmt(end);
      return;
    }
    if (bankAnimation) cancelAnimationFrame(bankAnimation);
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / 480);
      const eased = 1 - Math.pow(1 - p, 3);
      bankDisplay = Math.round(start + (end - start) * eased);
      el.bankroll.textContent = fmt(bankDisplay);
      if (p < 1) bankAnimation = requestAnimationFrame(step);
    };
    bankAnimation = requestAnimationFrame(step);
  }

  function updateAI() {
    el.leftBank.textContent = fmt(state.ai.left.bank);
    el.rightBank.textContent = fmt(state.ai.right.bank);
  }

  function setHint(text) {
    if (!el.hint) return;
    if (text) {
      el.hint.textContent = text;
      el.hint.classList.remove("fade");
    } else {
      el.hint.classList.add("fade");
    }
  }

  function announce(text) {
    el.live.textContent = text;
  }

  let toastTimer = null;
  function toast(text) {
    el.toast.textContent = text;
    el.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.toast.classList.remove("show"), 2400);
  }

  let bubbleTimers = {};
  function setBubble(seat, text, tone = "", sticky = false) {
    const node = el.bubbles[seat];
    clearTimeout(bubbleTimers[seat]);
    if (!text) { node.classList.remove("show"); return; }
    node.textContent = text;
    node.className = `bubble show ${tone}`;
    if (!sticky) {
      bubbleTimers[seat] = setTimeout(() => node.classList.remove("show"), 4200);
    }
  }
  function clearBubbles() {
    for (const seat of Object.keys(el.bubbles)) {
      clearTimeout(bubbleTimers[seat]);
      el.bubbles[seat].classList.remove("show");
    }
  }

  function setActive(seat) {
    state.activeSeat = seat;
    for (const key of Object.keys(el.seats)) el.seats[key].classList.toggle("active", key === seat);
  }

  let bannerTimer = null;
  function showBanner({ eyebrow, title, sub, tone = "" }) {
    clearTimeout(bannerTimer);
    el.bannerEyebrow.textContent = eyebrow;
    el.bannerTitle.textContent = title;
    el.bannerSub.textContent = sub;
    el.banner.className = `banner ${tone}`;
    el.banner.hidden = false;
    requestAnimationFrame(() => el.banner.classList.add("show"));
    bannerTimer = setTimeout(hideBanner, 3000);
  }
  function hideBanner() {
    el.banner.classList.remove("show");
    setTimeout(() => { if (!el.banner.classList.contains("show")) el.banner.hidden = true; }, 280);
  }

  function updateControls() {
    const p = state.phase;
    el.dealBtn.hidden = p !== "bet";
    el.hitBtn.hidden = p !== "player";
    el.standBtn.hidden = p !== "player";
    el.nextBtn.hidden = p !== "resolve";
    el.hitBtn.disabled = state.busy;
    el.standBtn.disabled = state.busy;
    el.dealBtn.disabled = state.busy || state.bet <= 0 || state.bet > state.bankroll;
    el.nextBtn.disabled = state.busy;
    el.clearBtn.disabled = state.busy || state.bet <= 0 || p !== "bet";
    el.betValue.textContent = fmt(state.bet);
    el.stage.classList.toggle("is-betting", p === "bet");
    if (el.trayTitle) el.trayTitle.textContent = p === "bet" ? "YOUR CHIPS · TAP TO BET" : "YOUR CHIPS · IN PLAY";
    if (el.callout) el.callout.textContent = state.bet > 0 ? "Deal when you're ready" : "Place your bet";
    renderTray();
  }

  /* ---------------- round flow ---------------- */
  function resetTableForRound() {
    for (const seat of Object.keys(el.hands)) el.hands[seat].innerHTML = "";
    for (const seat of Object.keys(state.hands)) state.hands[seat] = [];
    for (const seat of Object.keys(el.totals)) {
      el.totals[seat].className = `total total-${seat}`;
      el.totals[seat].innerHTML = "";
    }
    el.playerBetStack.innerHTML = "";
    el.leftBetStack.innerHTML = "";
    el.rightBetStack.innerHTML = "";
    state.dealerHidden = false;
    state.hiddenCardEl = null;
    state.results = {};
    clearBubbles();
    setActive(null);
  }

  function chooseAIBet(ai) {
    if (ai.bank < 5) ai.bank += 500;
    const options = [5, 5, 10, 10, 25, 25, 50, 100];
    const affordable = options.filter((v) => v <= ai.bank);
    return affordable[Math.floor(Math.random() * affordable.length)] || 0;
  }

  async function startRound() {
    if (state.phase !== "bet" || state.busy) return;
    if (state.bet <= 0 || state.bet > state.bankroll) return;
    state.busy = true;
    state.phase = "dealing";
    state.round++;
    el.handNo.textContent = "#" + String(state.round).padStart(2, "0");
    hideBanner();
    resetTableForRound();
    renderPlayerBet();
    setHint("Dealing…");
    ctx();

    state.bankroll -= state.bet;
    updateBankroll();

    for (const seat of AI_SEATS) {
      const bet = chooseAIBet(state.ai[seat]);
      state.ai[seat].bet = bet;
      state.ai[seat].bank -= bet;
    }
    updateAI();
    renderAIBets();

    buildShoeIfNeeded();
    updateControls();
    announce("Cards are being dealt.");

    for (let pass = 0; pass < 2; pass++) {
      for (const seat of ["player", "left", "right", "dealer"]) {
        const hidden = pass === 1 && seat === "dealer";
        await dealCardTo(seat, hidden);
        await wait(190);
      }
    }

    state.busy = false;
    state.phase = "player";
    updateControls();
    setActive("player");
    renderPlayerBet();

    if (evalHand(state.hands.player).blackjack) {
      state.busy = true;
      updateControls();
      setBubble("player", "Blackjack!", "good");
      announce("Blackjack! You have 21.");
      setHint("");
      await wait(800);
      await endPlayerTurn();
    } else {
      setHint("");
      announce(`Your hand is ${evalHand(state.hands.player).total}. Hit or stand.`);
      sfx.deal();
    }
  }

  function buildShoeIfNeeded() {
    if (!state.shoe.length) buildShoe();
  }

  async function playerHit() {
    if (state.phase !== "player" || state.busy) return;
    state.busy = true;
    updateControls();
    setHint("");
    await dealCardTo("player");
    const hand = evalHand(state.hands.player);
    announce(`You drew. Total ${hand.total}.`);
    if (hand.bust) {
      setBubble("player", "Bust", "bad");
      sfx.lose();
      await wait(650);
      await endPlayerTurn();
      return;
    }
    if (hand.total === 21) {
      setBubble("player", "21", "good");
      await wait(500);
      await endPlayerTurn();
      return;
    }
    state.busy = false;
    updateControls();
    setHint("");
  }

  async function playerStand() {
    if (state.phase !== "player" || state.busy) return;
    state.busy = true;
    setBubble("player", "Stand", "dim");
    updateControls();
    await wait(250);
    await endPlayerTurn();
  }

  async function endPlayerTurn() {
    state.busy = true;
    setActive(null);
    state.phase = "ai";
    updateControls();
    setHint("");

    for (const seat of AI_SEATS) {
      await playAI(seat);
    }

    state.phase = "dealer";
    updateControls();
    await dealerTurn();
    await settleRound();
  }

  async function playAI(seat) {
    const ai = state.ai[seat];
    setActive(seat);
    setBubble(seat, "Thinking", "dim");
    await wait(420);
    let hand = evalHand(state.hands[seat]);
    if (hand.blackjack) {
      setBubble(seat, "Blackjack!", "good");
      await wait(550);
      setActive(null);
      return;
    }
    while (hand.total < 17) {
      setBubble(seat, "Hit", "dim");
      await wait(300);
      await dealCardTo(seat);
      await wait(440);
      hand = evalHand(state.hands[seat]);
    }
    if (hand.bust) {
      setBubble(seat, "Bust", "bad");
      sfx.lose();
    } else {
      setBubble(seat, "Stand", "dim");
    }
    await wait(480);
    setActive(null);
  }

  async function dealerTurn() {
    setActive("dealer");
    setHint("");
    await wait(300);
    if (state.dealerHidden) {
      setBubble("dealer", "Revealing…", "dim");
      await revealHole();
      await wait(420);
    }
    const allBusted = ["player", ...AI_SEATS].every((seat) => evalHand(state.hands[seat]).bust);
    let hand = evalHand(state.hands.dealer);
    if (allBusted) {
      setBubble("dealer", "Takes the bets", "dim");
      await wait(650);
      setActive(null);
      return;
    }
    while (hand.total < 17) {
      setBubble("dealer", "Hit", "dim");
      await wait(320);
      await dealCardTo("dealer");
      await wait(500);
      hand = evalHand(state.hands.dealer);
    }
    if (hand.bust) {
      setBubble("dealer", "Bust", "bad", true);
    } else if (hand.blackjack) {
      setBubble("dealer", "Blackjack", "bad", true);
    } else {
      setBubble("dealer", `Stand · ${hand.total}`, "dim", true);
    }
    await wait(650);
    setActive(null);
  }

  async function revealHole() {
    state.dealerHidden = false;
    const hiddenEl = state.hiddenCardEl;
    const realCard = state.hands.dealer[1];
    if (!hiddenEl || !realCard) { updateTotal("dealer"); return; }
    const anim = hiddenEl.animate(
      [{ transform: "rotateY(0deg)" }, { transform: "rotateY(90deg)" }],
      { duration: 160, easing: "ease-in", fill: "forwards" }
    );
    await anim.finished.catch(() => {});
    const faceEl = makeCardEl(realCard);
    faceEl.style.transform = "rotateY(-90deg)";
    hiddenEl.replaceWith(faceEl);
    faceEl.animate(
      [{ transform: "rotateY(-90deg)" }, { transform: "rotateY(0deg)" }],
      { duration: 240, easing: "ease-out", fill: "forwards" }
    );
    faceEl.style.transform = "rotateY(0deg)";
    state.hiddenCardEl = null;
    sfx.card();
    updateTotal("dealer");
  }

  function settleHand(seat, dealerHand) {
    const hand = evalHand(state.hands[seat]);
    const bet = seat === "player" ? state.bet : state.ai[seat].bet;
    if (hand.bust) return { key: "lose", net: -bet, payout: 0, label: "Bust" };
    if (hand.blackjack && !dealerHand.blackjack) {
      const net = Math.round(bet * 1.5);
      return { key: "blackjack", net, payout: bet + net, label: "Blackjack" };
    }
    if (hand.blackjack && dealerHand.blackjack) return { key: "push", net: 0, payout: bet, label: "Push" };
    if (dealerHand.blackjack) return { key: "lose", net: -bet, payout: 0, label: "Lose" };
    if (dealerHand.bust) return { key: "win", net: bet, payout: bet * 2, label: "Win" };
    if (hand.total > dealerHand.total) return { key: "win", net: bet, payout: bet * 2, label: "Win" };
    if (hand.total === dealerHand.total) return { key: "push", net: 0, payout: bet, label: "Push" };
    return { key: "lose", net: -bet, payout: 0, label: "Lose" };
  }

  async function settleRound() {
    state.phase = "resolve";
    state.busy = true;
    updateControls();
    setHint("");
    await wait(300);

    const dealerHand = evalHand(state.hands.dealer);
    const results = {};
    for (const seat of ["player", ...AI_SEATS]) {
      results[seat] = settleHand(seat, dealerHand);
      const res = results[seat];
      if (seat === "player") {
        state.bankroll += res.payout;
        updateBankroll();
      } else {
        state.ai[seat].bank += res.payout;
      }
    }
    state.results = results;
    updateAI();

    for (const seat of AI_SEATS) {
      const res = results[seat];
      const tone = res.key === "win" || res.key === "blackjack" ? "good" : res.key === "push" ? "dim" : "bad";
      const label = res.key === "win" ? `Win +${fmt(res.net)}` : res.key === "blackjack" ? `21 +${fmt(res.net)}` : res.key === "push" ? "Push" : seat === "left" || seat === "right" ? (res.label === "Bust" ? "Bust" : `−${fmt(-res.net)}`) : res.label;
      setBubble(seat, label, tone, true);
    }

    const p = results.player;
    const playerTone = p.key === "win" || p.key === "blackjack" ? "good" : p.key === "push" ? "dim" : "bad";
    setBubble("player", p.key === "blackjack" ? "Blackjack!" : p.key === "win" ? `Win +${fmt(p.net)}` : p.key === "push" ? "Push" : p.label === "Bust" ? "Bust" : `−${fmt(-p.net)}`, playerTone, true);
    const betLabel = document.getElementById("betLabel");
    betLabel.textContent = "Result";
    document.getElementById("betPanel").className = "bet-panel result " + (p.key === "win" || p.key === "blackjack" ? "is-win" : p.key === "push" ? "is-push" : "is-lose");
    updateAllTotals();
    updateControls();
    el.betValue.textContent = p.net > 0 ? "+" + fmt(p.net) : p.net < 0 ? "−" + fmt(-p.net) : "Push";
    state.busy = false;
    el.nextBtn.disabled = false;
    setHint("");
    announce(`Dealer has ${dealerHand.total}. ` + (p.key === "blackjack" ? `Blackjack! You win ${fmt(p.net)}.` : p.key === "win" ? `You win ${fmt(p.net)}.` : p.key === "push" ? "Push." : `You lose ${fmt(state.bet)}.`));

    if (p.key === "blackjack") {
      showBanner({ eyebrow: "Natural 21 • pays 3 to 2", title: "Blackjack", sub: `+${fmt(p.net)}`, tone: "win" });
      sfx.blackjack();
    } else if (p.key === "win") {
      showBanner({ eyebrow: "Hand complete", title: "You win", sub: `+${fmt(p.net)}`, tone: "win" });
      sfx.win();
    } else if (p.key === "push") {
      showBanner({ eyebrow: "Hand complete", title: "Push", sub: "Bet returned" });
      sfx.push();
    } else if (p.label === "Bust") {
      showBanner({ eyebrow: `Dealer ${dealerHand.total}`, title: "Bust", sub: `−${fmt(state.bet)}`, tone: "lose" });
      sfx.lose();
    } else {
      showBanner({ eyebrow: `Dealer ${dealerHand.total} • You ${evalHand(state.hands.player).total}`, title: "Dealer wins", sub: `−${fmt(state.bet)}`, tone: "lose" });
      sfx.lose();
    }
  }

  function nextRound() {
    if (state.phase !== "resolve" || state.busy) return;
    state.phase = "bet";
    state.busy = false;
    state.bet = 0;
    state.betChips = [];
    const betLabel = document.getElementById("betLabel");
    betLabel.textContent = "Your bet";
    document.getElementById("betPanel").className = "bet-panel";
    state.dealerHidden = false;
    state.hiddenCardEl = null;
    for (const seat of AI_SEATS) state.ai[seat].bet = 0;
    resetTableForRound();
    hideBanner();
    updateAllTotals();
    if (state.bankroll < 1) {
      state.bankroll = 500;
      updateBankroll();
      toast("The house spots you $500. Welcome back.");
    }
    updateAI();
    renderPlayerBet();
    renderTray(true);
    updateControls();
    setHint("Tap a chip on the rail to place your bet");
    announce("Place your bet.");
    el.handNo.textContent = "#" + String(state.round + 1).padStart(2, "0");
  }

  /* ---------------- layout ---------------- */
  function fitLayout() {
    if (!el.stage.clientWidth) return;
    const sw = el.stage.clientWidth;
    const sh = el.stage.clientHeight;
    const mobile = window.innerWidth <= 700;
    let w, h;
    if (mobile) {
      w = Math.min(sw - 30, 366);
      h = Math.min(sh - 128, w * 1.06);
      w = Math.min(w, h / 1.06);
      if (w < 250) { w = 250; h = w * 1.06; }
    } else {
      const maxW = Math.min(sw - 240, 1020);
      const maxH = sh - 108;
      w = Math.min(maxW, maxH * 1.78);
      w = Math.max(w, 520);
      h = w / 1.78;
    }
    el.tableWrap.style.width = Math.round(w) + "px";
    el.tableWrap.style.height = Math.round(h) + "px";
  }

  /* ---------------- modal / misc ---------------- */
  function openShop() {
    el.shopModal.classList.add("open");
    el.shopModal.setAttribute("aria-hidden", "false");
    sfx.click();
  }
  function closeShop() {
    el.shopModal.classList.remove("open");
    el.shopModal.setAttribute("aria-hidden", "true");
  }

  function toggleSound() {
    state.sound = !state.sound;
    el.soundBtn.classList.toggle("is-muted", !state.sound);
    el.soundBtn.setAttribute("aria-label", state.sound ? "Mute sound" : "Unmute sound");
    if (state.sound) {
      ctx();
      sfx.click();
    }
  }

  function bindEvents() {
    el.dealBtn.addEventListener("click", startRound);
    el.hitBtn.addEventListener("click", playerHit);
    el.standBtn.addEventListener("click", playerStand);
    el.nextBtn.addEventListener("click", nextRound);
    el.clearBtn.addEventListener("click", clearBet);
    el.shopBtn.addEventListener("click", openShop);
    el.soundBtn.addEventListener("click", toggleSound);
    el.shopModal.addEventListener("click", (e) => {
      if (e.target.closest("[data-close]")) closeShop();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeShop();
      if (el.shopModal.classList.contains("open")) return;
      if (e.key === "h" || e.key === "H") { if (state.phase === "player") playerHit(); }
      if (e.key === "s" || e.key === "S") { if (state.phase === "player") playerStand(); }
      if ((e.key === "Enter" || e.key === " ")) {
        if (document.activeElement && document.activeElement.tagName === "BUTTON") return;
        if (state.phase === "bet" && state.bet > 0) { e.preventDefault(); startRound(); }
        else if (state.phase === "resolve") { e.preventDefault(); nextRound(); }
      }
    });
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(fitLayout, 80);
    });
  }

  /* ---------------- init ---------------- */
  function init() {
    buildShoe();
    resetTableForRound();
    updateControls();
    updateAI();
    updateBankroll(true);
    renderPlayerBet();
    fitLayout();
    bindEvents();
    requestAnimationFrame(fitLayout);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitLayout);
    window.addEventListener("load", fitLayout);
    setHint("Tap a chip on the rail to place your bet");
    announce("Welcome to the Velvet Ace. Place a bet to begin.");
  }

  init();
})();
