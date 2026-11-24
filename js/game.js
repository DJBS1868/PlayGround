import {
  REPAIRS, DAY_ORDERS, TOOLS, TOOL_ORDER, CUSTOMERS, PHONES,
  WALKIN_QUOTES, RANKS,
} from './data.js'
import { sfx, vibrate } from './audio.js'

/* ============================================================
   Helpers
   ============================================================ */

const $ = (sel, root = document) => root.querySelector(sel)
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)]
const clamp = (n, min, max) => Math.min(max, Math.max(min, n))
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)]
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const money = (n) => '$' + Math.round(n).toLocaleString('en-US')

const SAVE_KEY = 'screwed-shop-save-v1'

const TYPE_TAG = {
  screen: 'SCREEN',
  battery: 'BATTERY',
  charge: 'CHARGE',
  speaker: 'AUDIO',
  camera: 'CAMERA',
  water: 'WATER',
  buttons: 'BUTTONS',
  backglass: 'BACK',
}

const TYPE_ISSUE = {
  screen: 'Cracked screen',
  battery: 'Battery dies early',
  charge: 'Will not charge',
  speaker: 'No sound',
  camera: 'Blurry camera',
  water: 'Water damage',
  buttons: 'Sticky power button',
  backglass: 'Shattered back',
}

const TYPE_ICON = {
  screen: '💥',
  battery: '🪫',
  charge: '⚡',
  speaker: '🔇',
  camera: '📷',
  water: '💧',
  buttons: '⏻',
  backglass: '🪞',
}

const SCREEN_ALERT = {
  screen: { icon: '💥', text: 'GLASS / SHATTERED' },
  battery: { icon: '🪫', text: 'BATTERY / SERVICE' },
  charge: { icon: '⚡', text: 'PORT / FAULT' },
  speaker: { icon: '🔇', text: 'AUDIO / NO SOUND' },
  camera: { icon: '📷', text: 'CAMERA / BLURRY' },
  water: { icon: '💧', text: 'LIQUID / DETECTED' },
  buttons: { icon: '⏻', text: 'POWER / STUCK' },
  backglass: { icon: '🪞', text: 'BACK / SHATTERED' },
}

const PART_LABEL = {
  screen: 'screen',
  battery: 'battery',
  camera: 'camera',
  speaker: 'speaker',
  port: 'port flex',
  button: 'power flex',
  backglass: 'back glass',
}

const PART_CHIP = {
  screen: 'chip-screen',
  battery: 'chip-battery',
  camera: 'chip-camera',
  speaker: 'chip-speaker',
  port: 'chip-port',
  button: 'chip-button',
  backglass: 'chip-backglass',
}

const TEST_META = {
  touch: { icon: '☝', label: 'TOUCH TEST', sub: 'TAP TO RUN' },
  battery: { icon: '🔋', label: 'BATTERY TEST', sub: 'TAP TO RUN' },
  speaker: { icon: '♪', label: 'SOUND TEST', sub: 'TAP TO RUN' },
  camera: { icon: '📷', label: 'CAMERA TEST', sub: 'TAP TO RUN' },
}

const DOM = {
  app: $('#app'),
  phone: $('#phone'),
  phoneWrap: $('#phoneWrap'),
  screen: $('#deviceScreen'),
  cracked: $('#cracked'),
  backCracked: $('#backCracked'),
  alertIco: $('#alertIco'),
  alertText: $('#alertText'),
  screenAlert: $('#screenAlert'),
  testLayer: $('#testLayer'),
  bootMark: $('#bootMark'),
  screenFlash: $('#screenFlash'),
  targetsFront: $('#targetsFront'),
  targetsBack: $('#targetsBack'),
  installFront: $('#installSlotFront'),
  installBack: $('#installSlotBack'),
  screenBadge: $('#screenBadge'),
  powerBtn: $('#powerBtn'),
  tools: $('#tools'),
  guide: $('#guide'),
  stepCounter: $('#stepCounter'),
  stepLabel: $('#stepLabel'),
  stepHint: $('#stepHint'),
  stepDots: $('#stepDots'),
  helpBtn: $('#helpBtn'),
  toolHint: $('#toolHint'),
  jobQuality: $('#jobQuality'),
  bench: $('#bench'),
  toast: $('#toast'),
  fxLayer: $('#fxLayer'),
  dragLayer: $('#dragLayer'),
  partsTray: $('#partsTray'),
  trayEmpty: $('#trayEmpty'),
  newPartChip: $('#newPartChip'),
  chipVisual: $('#chipVisual'),
  chipLabel: $('#chipLabel'),
  cableWrap: $('#cableWrap'),
  cable: $('#cable'),
  heatMeter: $('#heatMeter'),
  heatFill: $('#heatFill'),
  heatLabel: $('#heatLabel'),
  gestureHint: $('#gestureHint'),
  introDay: $('#introDay'),
  introCash: $('#introCash'),
  introTicket: $('#introTicket'),
  introAvatar: $('#introAvatar'),
  introName: $('#introName'),
  introDevice: $('#introDevice'),
  introIssue: $('#introIssue'),
  introQuote: $('#introQuote'),
  introProblem: $('#introProblem'),
  introRepair: $('#introRepair'),
  introDifficulty: $('#introDifficulty'),
  introFee: $('#introFee'),
  introBadge: $('#introBadge'),
  introNote: $('#introNote'),
  miniPhone: $('#miniPhone'),
  miniAlert: $('#miniAlert'),
  workDay: $('#workDay'),
  workCash: $('#workCash'),
  workAvatar: $('#workAvatar'),
  workName: $('#workName'),
  workIssue: $('#workIssue'),
  workTag: $('#workTag'),
  titleContinue: $('#continueBtn'),
  titleNew: $('#newBtn'),
  titleReset: $('#resetBtn'),
  startRepairBtn: $('#startRepairBtn'),
  nextDayBtn: $('#nextDayBtn'),
  summaryAvatar: $('#summaryAvatar'),
  summaryEyebrow: $('#summaryEyebrow'),
  summaryTitle: $('#summaryTitle'),
  summaryStars: $('#summaryStars'),
  summaryQuote: $('#summaryQuote'),
  payFee: $('#payFee'),
  payTip: $('#payTip'),
  payBonus: $('#payBonus'),
  perfectRow: $('#perfectRow'),
  payTotal: $('#payTotal'),
  sumCash: $('#sumCash'),
  sumStars: $('#sumStars'),
  summaryNext: $('#summaryNext'),
  fixedStamp: $('#fixedStamp'),
  finaleTitle: $('#finaleTitle'),
  finaleBlurb: $('#finaleBlurb'),
  finaleCash: $('#finaleCash'),
  finaleStars: $('#finaleStars'),
  finalePerfect: $('#finalePerfect'),
  endlessBtn: $('#endlessBtn'),
  restartBtn: $('#restartBtn'),
  soundButtons: $$('.sound-btn'),
  screens: $$('.screen'),
}

/* ============================================================
   Save state
   ============================================================ */

const DEFAULT_SAVE = {
  day: 1,
  cash: 0,
  stars: 0,
  perfect: 0,
  sound: true,
  done: false,
  endless: false,
  lastType: null,
}

function readSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    return { ...DEFAULT_SAVE, ...JSON.parse(raw) }
  } catch {
    return null
  }
}

let save = readSave() || { ...DEFAULT_SAVE }
let hasStoredSave = !!readSave()

function persist() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save))
    hasStoredSave = true
  } catch {
    /* private mode etc. — the game still works */
  }
}

/* ============================================================
   Runtime state
   ============================================================ */

let job = null
let stepIndex = 0
let currentStep = null
let selectedTool = null
let busy = false
let currentHits = []
let stepState = { taps: 0, heat: 0, spots: 0, cleared: new Set(), done: false }
let toastTimer = null
let titleResetArmed = false
let titleResetTimer = null
let closeHandler = null

/* ============================================================
   Sound + screens
   ============================================================ */

function syncSoundUI() {
  DOM.soundButtons.forEach((btn) => {
    const use = $('use', btn)
    if (use) use.setAttribute('href', save.sound ? '#ico-sound-on' : '#ico-sound-off')
    btn.setAttribute('aria-label', save.sound ? 'Mute sound' : 'Unmute sound')
  })
}

function toggleSound() {
  sfx.init()
  save.sound = !save.sound
  sfx.setEnabled(save.sound)
  persist()
  syncSoundUI()
  if (save.sound) {
    sfx.select()
    vibrate(10)
  }
}

function showScreen(name) {
  DOM.screens.forEach((screen) => {
    const active = screen.id === `screen-${name}`
    screen.classList.toggle('is-active', active)
    screen.setAttribute('aria-hidden', active ? 'false' : 'true')
  })
}

function toast(message, bad = false, ms = 2300) {
  clearTimeout(toastTimer)
  DOM.toast.textContent = message
  DOM.toast.classList.toggle('bad', bad)
  DOM.toast.classList.add('show')
  toastTimer = setTimeout(() => DOM.toast.classList.remove('show'), ms)
}

/* ============================================================
   Title
   ============================================================ */

function renderTitle() {
  const hasSave = hasStoredSave
  DOM.titleContinue.hidden = !hasSave
  DOM.titleNew.hidden = hasSave
  DOM.titleReset.hidden = !hasSave

  if (hasSave) {
    DOM.titleContinue.textContent = save.done ? 'See the results' : `Continue · Day ${save.day}`
    DOM.titleReset.textContent = 'Start over'
    titleResetArmed = false
  } else {
    DOM.titleNew.textContent = 'Open the shop'
  }
  showScreen('title')
}

function resetGame() {
  try { localStorage.removeItem(SAVE_KEY) } catch { /* ignore */ }
  save = { ...DEFAULT_SAVE }
  hasStoredSave = false
  job = null
  sfx.setEnabled(save.sound)
  syncSoundUI()
  titleResetArmed = false
  renderTitle()
  sfx.select()
}

function armReset() {
  if (!hasStoredSave) return
  if (!titleResetArmed) {
    titleResetArmed = true
    DOM.titleReset.textContent = 'Tap again to wipe the shop'
    clearTimeout(titleResetTimer)
    titleResetTimer = setTimeout(() => {
      titleResetArmed = false
      DOM.titleReset.textContent = 'Start over'
    }, 3200)
    return
  }
  clearTimeout(titleResetTimer)
  resetGame()
}

/* ============================================================
   Orders / day intro
   ============================================================ */

function makeWalkin(day) {
  const types = Object.keys(REPAIRS)
  let type = rand(types)
  for (let i = 0; i < 5 && type === save.lastType; i++) type = rand(types)
  const customer = rand(CUSTOMERS)
  const phone = rand(PHONES)
  const fee = 60 + Math.round(Math.random() * 35) + Math.min(50, Math.max(0, day - 10) * 5)
  const quotes = WALKIN_QUOTES[type]
  return {
    type,
    customer: { ...customer },
    phone: { ...phone },
    issue: TYPE_ISSUE[type],
    problem: quotes[0],
    quote: rand(quotes),
    fee,
    walkin: true,
  }
}

function beginDay(day) {
  save.day = day
  persist()
  const order = day <= DAY_ORDERS.length ? DAY_ORDERS[day - 1] : makeWalkin(day)
  job = {
    day,
    order,
    repair: REPAIRS[order.type],
    mistakes: 0,
  }
  renderIntro()
  showScreen('intro')
}

function isNewRepair(order) {
  if (order.walkin) return false
  const dayIndex = DAY_ORDERS.indexOf(order)
  if (dayIndex < 0) return false
  return !DAY_ORDERS.slice(0, dayIndex).some((o) => o.type === order.type)
}

function renderIntro() {
  const { order, repair, day } = job
  const tint = order.customer.tint
  DOM.introDay.textContent = day
  DOM.introCash.textContent = Math.round(save.cash).toLocaleString('en-US')
  DOM.introTicket.textContent = `#${String(day).padStart(3, '0')}`

  DOM.introAvatar.style.setProperty('--tint', tint)
  $('span', DOM.introAvatar).textContent = order.customer.emoji
  DOM.introName.textContent = order.customer.name
  DOM.introDevice.textContent = `${order.phone.model} · Workshop special`
  DOM.introIssue.textContent = TYPE_TAG[order.type]
  DOM.introQuote.textContent = `“${order.quote}”`
  DOM.introProblem.textContent = order.issue
  DOM.introRepair.textContent = repair.title
  DOM.introFee.textContent = money(order.fee)
  DOM.introNote.textContent = repair.intro

  DOM.introDifficulty.innerHTML = Array.from({ length: 3 }, (_, i) =>
    `<svg class="ico ${i < repair.difficulty ? '' : 'off'}" aria-hidden="true"><use href="#ico-wrench"></use></svg>`
  ).join('')

  DOM.miniPhone.classList.remove('has-crack', 'back-view')
  if (order.type === 'screen') DOM.miniPhone.classList.add('has-crack')
  if (order.type === 'backglass') DOM.miniPhone.classList.add('has-crack', 'back-view')
  DOM.miniPhone.style.setProperty('--mini-a', order.phone.wallpaper[0])
  DOM.miniPhone.style.setProperty('--mini-b', order.phone.wallpaper[1])
  DOM.miniPhone.style.setProperty('--mini-device', order.phone.color)
  DOM.miniAlert.textContent = TYPE_ICON[order.type]

  DOM.introBadge.hidden = false
  if (isNewRepair(order)) {
    DOM.introBadge.textContent = 'NEW REPAIR'
    DOM.introBadge.style.opacity = '1'
  } else {
    DOM.introBadge.textContent = 'BOOKED IN'
    DOM.introBadge.style.opacity = '.55'
  }
}

/* ============================================================
   Workbench reset
   ============================================================ */

function resetBenchVisuals() {
  const p = DOM.phone
  p.className = 'phone'
  DOM.app.style.setProperty('--device', job.order.phone.color)
  DOM.app.style.setProperty('--device-deep', job.order.phone.deep)
  DOM.app.style.setProperty('--wp-a', job.order.phone.wallpaper[0])
  DOM.app.style.setProperty('--wp-b', job.order.phone.wallpaper[1])

  p.classList.add(`issue-${job.order.type}`)
  if (job.order.type === 'backglass') p.classList.add('view-back')

  DOM.targetsFront.innerHTML = ''
  DOM.targetsBack.innerHTML = ''
  DOM.installFront.classList.remove('show')
  DOM.installBack.classList.remove('show')
  DOM.installFront.className = 'install-slot'
  DOM.installBack.className = 'install-slot'
  DOM.screenBadge.hidden = true
  DOM.testLayer.innerHTML = ''
  DOM.cableWrap.hidden = true
  DOM.cableWrap.style.bottom = ''
  DOM.cable.classList.remove('plugged', 'dragging')
  DOM.cable.style.transform = ''
  DOM.cable.style.transition = ''
  DOM.heatMeter.hidden = true
  DOM.heatFill.style.width = '0%'
  DOM.heatLabel.textContent = 'HEATING'
  DOM.gestureHint.hidden = true
  DOM.toast.classList.remove('show')
  DOM.trayEmpty.hidden = false
  DOM.newPartChip.hidden = true
  DOM.newPartChip.classList.remove('dragging', 'ready')
  DOM.newPartChip.removeAttribute('data-part')
  DOM.partsTray.style.opacity = ''

  $$('.part', DOM.phone).forEach((el) => {
    el.classList.remove('is-removed', 'is-new')
    el.style.opacity = ''
  })
  $$('.screw', DOM.phone).forEach((el) => el.classList.remove('is-out'))
  $$('.corrosion, .adhesive', DOM.phone).forEach((el) => el.classList.remove('is-clean'))
  DOM.screenFlash.classList.remove('flash')

  p.classList.remove(
    'open', 'screen-laid', 'screen-gone', 'screen-off', 'screen-new',
    'testing', 'booting', 'screws-out', 'show-corrosion', 'back-open',
    'back-glass-gone', 'repaired', 'screen-closable'
  )

  const alert = SCREEN_ALERT[job.order.type]
  DOM.alertIco.textContent = alert.icon
  DOM.alertText.textContent = alert.text
  DOM.screenAlert.classList.remove('alert-off')

  if (closeHandler) {
    DOM.screen.removeEventListener('pointerdown', closeHandler)
    DOM.phone.removeEventListener('pointerdown', closeHandler)
    closeHandler = null
  }
}

function startJob() {
  if (!job) return
  job.mistakes = 0
  stepIndex = 0
  selectedTool = null
  busy = false
  resetBenchVisuals()

  DOM.workDay.textContent = job.day
  DOM.workCash.textContent = Math.round(save.cash).toLocaleString('en-US')
  DOM.workAvatar.style.setProperty('--tint', job.order.customer.tint)
  $('span', DOM.workAvatar).textContent = job.order.customer.emoji
  DOM.workName.textContent = job.order.customer.name
  DOM.workIssue.textContent = job.order.issue
  DOM.workTag.textContent = TYPE_TAG[job.order.type]
  renderQuality()
  renderTools()
  renderStepDots()
  showScreen('work')
  sfx.select()
  enterStep(0)
}

/* ============================================================
   HUD / tools / guide
   ============================================================ */

function qualityRating() {
  if (!job) return 3
  if (job.mistakes === 0) return 3
  if (job.mistakes <= 2) return 2
  return 1
}

function renderQuality() {
  const rating = qualityRating()
  $$('.q-star', DOM.jobQuality).forEach((star, i) => {
    star.classList.toggle('lost', i >= rating)
  })
}

function toolIcon(id) {
  return `<svg class="ico tool-ico" aria-hidden="true"><use href="#ico-${TOOLS[id].icon}"></use></svg>`
}

function renderTools() {
  DOM.tools.innerHTML = TOOL_ORDER.map((id) => `
    <button class="tool" type="button" data-tool="${id}" aria-label="${TOOLS[id].full}">
      ${toolIcon(id)}
      <span class="tool-name">${TOOLS[id].name}</span>
      <span class="tool-check">✓</span>
    </button>
  `).join('')
  $$('.tool', DOM.tools).forEach((btn) => {
    btn.addEventListener('click', () => selectTool(btn.dataset.tool))
  })
}

function renderStepDots() {
  DOM.stepDots.innerHTML = job.repair.steps.map(() => '<span class="step-dot"></span>').join('')
  updateStepDots()
}

function updateStepDots() {
  $$('.step-dot', DOM.stepDots).forEach((dot, i) => {
    dot.classList.toggle('done', i < stepIndex)
    dot.classList.toggle('current', i === stepIndex)
  })
}

function setToolUI() {
  $$('.tool', DOM.tools).forEach((btn) => {
    btn.classList.toggle('selected', btn.dataset.tool === selectedTool)
  })
}

function clearToolStates() {
  $$('.tool', DOM.tools).forEach((btn) => {
    btn.classList.remove('selected', 'hinted', 'wrong', 'done')
  })
}

function selectTool(id) {
  if (!job || !currentStep || busy) return
  sfx.init()

  if (selectedTool === id) return

  const step = currentStep
  selectedTool = id
  sfx.select()
  setToolUI()

  if (!step.tool) {
    selectedTool = null
    setTimeout(() => setToolUI(), 120)
    toast('No tool needed for this one. Use your finger.')
    return
  }

  if (id === step.tool) {
    $$('.tool', DOM.tools).forEach((btn) => btn.classList.remove('hinted'))
    refreshArmed()
    return
  }

  // Wrong tool: costs quality, then helps out.
  job.mistakes++
  renderQuality()
  sfx.wrong()
  vibrate([25, 35, 25])
  const btn = $(`.tool[data-tool="${id}"]`, DOM.tools)
  if (btn) {
    btn.classList.add('wrong')
    setTimeout(() => btn.classList.remove('wrong'), 420)
  }
  const correct = TOOLS[step.tool]
  const hint = step.hint || 'Look at the glowing spot.'
  DOM.stepHint.innerHTML = `${hint} <strong>Try the ${correct.name.toLowerCase()}.</strong>`
  const hintBtn = $(`.tool[data-tool="${step.tool}"]`, DOM.tools)
  if (hintBtn) hintBtn.classList.add('hinted')
  toast(`${correct.full} is the one for this.`, true)
  refreshArmed()
}

function helpWithStep() {
  if (!currentStep || busy) return
  sfx.init()
  sfx.select()
  if (currentStep.tool) {
    const tool = TOOLS[currentStep.tool]
    const btn = $(`.tool[data-tool="${currentStep.tool}"]`, DOM.tools)
    if (btn) {
      btn.classList.add('hinted')
      setTimeout(() => btn.classList.remove('hinted'), 4200)
    }
    DOM.stepHint.innerHTML = `${currentStep.hint} <strong>Use the ${tool.name.toLowerCase()}.</strong>`
    toast(`The ${tool.full.toLowerCase()} will do it.`)
  } else {
    toast(currentStep.hint)
  }
}

/* ============================================================
   Step lifecycle
   ============================================================ */

function clearTargets() {
  DOM.targetsFront.innerHTML = ''
  DOM.targetsBack.innerHTML = ''
  currentHits = []
}

function currentFace() {
  return DOM.phone.classList.contains('view-back') ? 'back' : 'front'
}

function addHit({ cls = '', face = 'front', tag = '', tagBelow = false, tagRight = false, styles = {} } = {}) {
  const hit = document.createElement('div')
  hit.className = `hit ${cls}`.trim()
  Object.assign(hit.style, styles)
  if (tag) {
    const chip = document.createElement('span')
    chip.className = `hit-tag ${tagBelow ? 'tag-below' : ''} ${tagRight ? 'tag-right' : ''}`.trim()
    chip.textContent = tag
    hit.appendChild(chip)
  }
  const layer = face === 'back' ? DOM.targetsBack : DOM.targetsFront
  layer.appendChild(hit)
  currentHits.push(hit)
  return hit
}

function markArmed() {
  const step = currentStep
  if (!step) return
  const armed = !step.tool || selectedTool === step.tool
  currentHits.forEach((hit) => hit.classList.toggle('armed', armed))
  if (step.action === 'install') {
    DOM.newPartChip.classList.toggle('ready', armed)
    DOM.partsTray.style.opacity = armed ? '1' : '.62'
  }
  DOM.bench.dataset.tool = selectedTool || ''
}

function refreshArmed() {
  markArmed()
}

function activeSlot(part) {
  const back = DOM.phone.classList.contains('view-back')
  const slot = back ? DOM.installBack : DOM.installFront
  slot.className = `install-slot slot-${part} show`
  return slot
}

function hideSlots() {
  DOM.installFront.className = 'install-slot'
  DOM.installBack.className = 'install-slot'
  DOM.newPartChip.hidden = true
  DOM.newPartChip.classList.remove('ready')
  DOM.trayEmpty.hidden = false
  DOM.partsTray.style.opacity = ''
}

function getPartEl(part) {
  if (part === 'screen') return DOM.screen
  return $(`[data-part="${part}"]`, DOM.phone)
}

function setTrayChip(part) {
  DOM.trayEmpty.hidden = true
  DOM.newPartChip.hidden = false
  DOM.newPartChip.dataset.part = part
  DOM.newPartChip.classList.remove('dragging')
  DOM.chipVisual.className = `chip-visual ${PART_CHIP[part]}`
  DOM.chipLabel.textContent = `NEW ${PART_LABEL[part].toUpperCase()}`
  DOM.newPartChip.classList.remove('ready')
}

function setScreenClosable(on) {
  if (!on) {
    if (closeHandler) {
      DOM.screen.removeEventListener('pointerdown', closeHandler)
      DOM.phone.removeEventListener('pointerdown', closeHandler)
      closeHandler = null
    }
    DOM.phone.classList.remove('screen-closable')
    DOM.screenBadge.hidden = true
    return
  }
  DOM.phone.classList.add('screen-closable')
  DOM.screenBadge.hidden = false
  closeHandler = (event) => {
    if (busy || !currentStep || currentStep.action !== 'close') return
    event.preventDefault()
    event.stopPropagation()
    sfx.click()
    completeStep()
  }
  DOM.screen.addEventListener('pointerdown', closeHandler)
  DOM.phone.addEventListener('pointerdown', closeHandler)
}

function enterStep(index) {
  if (!job) return
  stepIndex = index
  currentStep = job.repair.steps[index]
  const step = currentStep
  busy = false
  selectedTool = null
  setToolUI()
  clearToolStates()
  clearTargets()
  hideSlots()
  setScreenClosable(false)
  DOM.cableWrap.hidden = true
  DOM.heatMeter.hidden = true
  DOM.gestureHint.hidden = true
  DOM.phone.classList.remove('testing', 'booting', 'screen-closable')
  DOM.testLayer.innerHTML = ''
  DOM.screenFlash.classList.remove('flash')
  DOM.toast.classList.remove('show')

  stepState = { taps: 0, heat: 0, spots: 0, cleared: new Set(), done: false }

  // Screws reappear for every screw step (old ones out, new ones in).
  $$('.screw', DOM.phone).forEach((el) => el.classList.remove('is-out'))
  DOM.phone.classList.remove('screws-out')

  DOM.stepCounter.textContent = `STEP ${index + 1} / ${job.repair.steps.length}`
  DOM.stepLabel.textContent = step.label
  DOM.stepHint.textContent = step.hint
  DOM.toolHint.textContent = step.tool
    ? 'Pick a tool, then follow the glow'
    : 'No tool needed — use your finger'
  DOM.helpBtn.classList.remove('pulse')
  DOM.helpBtn.classList.toggle('pulse', index === 0)
  updateStepDots()

  if (step.action === 'screw') {
    DOM.stepHint.textContent = step.hint + ' (0/' + step.count + ')'
  }

  setupStepTargets(step)

  const armed = !step.tool || selectedTool === step.tool
  currentHits.forEach((hit) => hit.classList.toggle('armed', armed))
  markArmed()
}

function setupStepTargets(step) {
  switch (step.action) {
    case 'heat':
      setupHeat(step)
      break
    case 'screw':
      setupScrews(step)
      break
    case 'pry':
      setupPry(step)
      break
    case 'tap':
      setupTap(step)
      break
    case 'remove':
      setupRemove(step)
      break
    case 'install':
      setupInstall(step)
      break
    case 'scrub':
      setupScrub(step)
      break
    case 'hold':
      setupHold(step)
      break
    case 'plug':
      setupPlug(step)
      break
    case 'test':
      setupTest(step)
      break
    case 'close':
      setScreenClosable(true)
      break
    case 'flip':
      setupFlip(step)
      break
    default:
      break
  }
}
/* ============================================================
   Step interactions
   ============================================================ */

function requireArmed() {
  if (busy || !currentStep) return false
  if (!currentStep.tool) return true
  if (!selectedTool) {
    sfx.click()
    toast('Pick a tool from the tray first.')
    return false
  }
  if (selectedTool !== currentStep.tool) {
    sfx.click()
    toast('That tool is not doing much here. Try another.')
    return false
  }
  return true
}

function sparkBurst(clientX, clientY, count = 8, warm = false) {
  const rect = DOM.bench.getBoundingClientRect()
  const x = clientX - rect.left
  const y = clientY - rect.top
  for (let i = 0; i < count; i++) {
    const spark = document.createElement('span')
    spark.className = 'spark-fx'
    spark.style.left = x + 'px'
    spark.style.top = y + 'px'
    spark.style.background = warm ? '#ffb457' : '#7de3c1'
    spark.style.setProperty('--dx', `${(Math.random() - .5) * 46}px`)
    spark.style.setProperty('--dy', `${(Math.random() - .7) * 38}px`)
    spark.style.animationDelay = `${Math.random() * .06}s`
    DOM.fxLayer.appendChild(spark)
    setTimeout(() => spark.remove(), 850)
  }
}

function floatNote(text, clientX, clientY, warm = false) {
  const rect = DOM.bench.getBoundingClientRect()
  const note = document.createElement('span')
  note.className = `float-note ${warm ? 'warm' : ''}`.trim()
  note.textContent = text
  note.style.left = clientX - rect.left + 'px'
  note.style.top = clientY - rect.top + 'px'
  DOM.fxLayer.appendChild(note)
  setTimeout(() => note.remove(), 1200)
}

function spawnConfetti(count = 30) {
  const host = $('.screen.is-active') || DOM.app
  const layer = document.createElement('div')
  layer.className = 'fx-layer confetti-layer'
  const colors = ['#ffb457', '#7de3c1', '#ff7164', '#8ab8ff', '#f8edd9', '#ffd98e']
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('span')
    piece.className = 'confetti'
    piece.style.left = `${Math.random() * 100}%`
    piece.style.background = rand(colors)
    piece.style.animationDelay = `${Math.random() * .35}s`
    piece.style.animationDuration = `${1.3 + Math.random() * .9}s`
    piece.style.setProperty('--dx', `${(Math.random() - .5) * 120}px`)
    piece.style.setProperty('--rot', `${180 + Math.random() * 480}deg`)
    piece.style.width = `${4 + Math.random() * 4}px`
    layer.appendChild(piece)
  }
  host.appendChild(layer)
  setTimeout(() => layer.remove(), 2800)
}

/* ---------- heat ---------- */

function setupHeat(step) {
  const face = step.zone === 'back' ? 'back' : 'front'
  const zoneClass = step.zone === 'back' ? 'heat-back' : step.zone === 'board' ? 'heat-board' : 'heat-front'
  const hit = addHit({
    cls: `hit-heat ${zoneClass}`,
    face,
    tag: 'SWEEP',
    tagBelow: step.zone !== 'back',
  })
  const squiggle = document.createElement('span')
  squiggle.className = 'heat-squiggles'
  squiggle.textContent = step.zone === 'board' ? '≋  ≋  ≋' : '≈  ≈  ≈'
  hit.appendChild(squiggle)
  bindHeat(hit, step)
}

function bindHeat(hit, step) {
  const threshold = step.zone === 'board' ? 210 : 270
  let heating = false
  let finished = false
  let raf = null
  let lastTs = 0
  let lastX = 0
  let lastY = 0
  let lastSizzle = 0

  const update = () => {
    const p = clamp(stepState.heat / threshold, 0, 1)
    DOM.heatFill.style.width = `${Math.round(p * 100)}%`
    DOM.heatLabel.textContent = p >= 1 ? 'DONE' : `HEAT ${Math.round(p * 100)}%`
  }

  const finish = () => {
    if (finished) return
    finished = true
    heating = false
    cancelAnimationFrame(raf)
    stepState.heat = threshold
    update()
    hit.classList.remove('armed')
    sfx.pop()
    vibrate(15)
    const rect = hit.getBoundingClientRect()
    sparkBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 10, true)
    setTimeout(() => completeStep(), 240)
  }

  const loop = (ts) => {
    if (!heating) return
    if (!lastTs) lastTs = ts
    const dt = Math.min(50, ts - lastTs)
    lastTs = ts
    stepState.heat += dt * 0.006
    update()
    if (stepState.heat >= threshold) {
      finish()
      return
    }
    raf = requestAnimationFrame(loop)
  }

  hit.addEventListener('pointerdown', (event) => {
    if (busy || finished) return
    if (!requireArmed()) return
    event.preventDefault()
    try { hit.setPointerCapture(event.pointerId) } catch { /* ignore */ }
    heating = true
    lastTs = 0
    lastX = event.clientX
    lastY = event.clientY
    DOM.heatMeter.hidden = false
    sfx.heatTick()
    update()
    raf = requestAnimationFrame(loop)
  })

  hit.addEventListener('pointermove', (event) => {
    if (!heating || finished) return
    const dx = event.clientX - lastX
    const dy = event.clientY - lastY
    lastX = event.clientX
    lastY = event.clientY
    stepState.heat += Math.hypot(dx, dy)
    update()
    if (performance.now() - lastSizzle > 150) {
      lastSizzle = performance.now()
      sfx.heatTick()
      if (Math.random() > .55) {
        sparkBurst(event.clientX, event.clientY, 2, true)
      }
    }
    if (stepState.heat >= threshold) finish()
  })

  const stop = () => {
    if (!heating) return
    heating = false
    cancelAnimationFrame(raf)
    if (!finished && stepState.heat > 0) {
      toast('Keep sweeping until the meter fills.', false, 1400)
    }
  }
  hit.addEventListener('pointerup', stop)
  hit.addEventListener('pointercancel', stop)
}

/* ---------- screws ---------- */

function setupScrews(step) {
  const positions = [
    { left: '21%', top: '96%' },
    { left: '79%', top: '96%' },
  ]
  positions.slice(0, step.count || 2).forEach((pos, index) => {
    const hit = addHit({ cls: 'hit-screw', styles: pos })
    const dot = document.createElement('span')
    dot.className = 'screw-dot'
    hit.appendChild(dot)
    hit.addEventListener('pointerdown', (event) => {
      if (busy || hit.dataset.done) return
      if (!requireArmed()) return
      event.preventDefault()
      hit.dataset.done = '1'
      hit.classList.remove('armed')
      const screw = $(`.screw[data-screw="${index}"]`, DOM.phone)
      if (screw) screw.classList.add('is-out')
      stepState.taps++
      sfx.screw()
      vibrate(8)
      sparkBurst(event.clientX, event.clientY, 6, true)
      DOM.stepHint.textContent = stepState.taps >= step.count
        ? 'Both screws are out.'
        : `One screw out. ${step.count - stepState.taps} to go.`
      if (stepState.taps >= step.count) {
        DOM.phone.classList.add('screws-out')
        setTimeout(() => completeStep(), 320)
      }
    })
  })
}

/* ---------- pry ---------- */

function setupPry(step) {
  const face = currentFace()
  const hit = addHit({ cls: 'hit-pry', face, tag: 'DRAG UP' })
  const cup = document.createElement('div')
  cup.className = 'cup-visual'
  cup.innerHTML = '<span class="cup-handle"></span><span class="cup-body"></span>'
  hit.appendChild(cup)
  bindPry(hit, cup)
}

function bindPry(hit, cup) {
  let dragging = false
  let startY = 0
  let dy = 0
  hit.addEventListener('pointerdown', (event) => {
    if (busy) return
    if (!requireArmed()) return
    event.preventDefault()
    try { hit.setPointerCapture(event.pointerId) } catch { /* ignore */ }
    dragging = true
    startY = event.clientY
    dy = 0
    hit.classList.add('armed')
  })
  hit.addEventListener('pointermove', (event) => {
    if (!dragging) return
    dy = clamp(event.clientY - startY, -110, 8)
    cup.style.transform = `translate(-50%, calc(-50% + ${dy}px))`
    if (dy < -30) cup.style.filter = 'drop-shadow(0 8px 10px rgba(0,0,0,.4))'
  })
  const release = () => {
    if (!dragging) return
    dragging = false
    if (dy < -52) {
      sfx.pop()
      vibrate(12)
      hit.style.opacity = '0'
      completeStep()
    } else {
      cup.style.transition = 'transform .22s ease'
      cup.style.transform = 'translate(-50%, -50%)'
      setTimeout(() => { cup.style.transition = '' }, 240)
      toast('Pull the cup a little further up.')
    }
  }
  hit.addEventListener('pointerup', release)
  hit.addEventListener('pointercancel', release)
}

/* ---------- connector taps ---------- */

function setupTap(step) {
  const face = currentFace()
  const hit = addHit({ cls: `hit-tap tap-${step.part}`, face, tag: 'TAP' })
  const ripple = document.createElement('span')
  ripple.className = 'tap-ripple'
  hit.appendChild(ripple)
  const dot = document.createElement('span')
  dot.className = 'connector-dot'
  hit.appendChild(dot)

  hit.addEventListener('pointerdown', (event) => {
    if (busy) return
    if (!requireArmed()) return
    event.preventDefault()
    hit.classList.remove('armed')
    sfx.pop()
    vibrate(10)
    sparkBurst(event.clientX, event.clientY, 9)
    if (step.part === 'battery-connector') {
      floatNote('POWER OK', event.clientX, event.clientY - 10)
    } else {
      floatNote('CLICK', event.clientX, event.clientY - 10)
    }
    completeStep()
  })
}

/* ---------- remove ---------- */

function makePartGhost(part, note) {
  const ghost = document.createElement('div')
  ghost.className = 'drag-ghost'
  ghost.style.width = '64px'
  ghost.style.setProperty('--device', job.order.phone.color)
  ghost.style.setProperty('--device-deep', job.order.phone.deep)
  ghost.style.setProperty('--wp-a', job.order.phone.wallpaper[0])
  ghost.style.setProperty('--wp-b', job.order.phone.wallpaper[1])
  ghost.innerHTML = `<div class="chip-visual ${PART_CHIP[part]}"></div><div class="drag-note">${note}</div>`
  return ghost
}

function setupRemove(step) {
  const face = currentFace()
  const hit = addHit({
    cls: `hit-remove rem-${step.part}`,
    face,
    tag: 'SWIPE AWAY',
    tagBelow: step.part === 'screen' || step.part === 'backglass',
  })
  const grip = document.createElement('span')
  grip.className = 'drag-grip'
  grip.textContent = 'GRAB'
  hit.appendChild(grip)
  bindRemoveDrag(hit, step.part)
}

function bindRemoveDrag(hit, part) {
  hit.addEventListener('pointerdown', (event) => {
    if (busy) return
    if (!requireArmed()) return
    event.preventDefault()
    const partEl = getPartEl(part)
    if (!partEl) return
    const ghost = makePartGhost(part, 'SWIPE AWAY')
    document.body.appendChild(ghost)
    ghost.style.left = `${event.clientX}px`
    ghost.style.top = `${event.clientY}px`
    partEl.style.opacity = '.32'
    hit.style.opacity = '1'
    let x = event.clientX
    let y = event.clientY
    let moved = 0

    const move = (ev) => {
      x = ev.clientX
      y = ev.clientY
      moved = Math.hypot(x - event.clientX, y - event.clientY)
      ghost.style.left = `${x}px`
      ghost.style.top = `${y}px`
    }
    const up = (ev) => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      ghost.remove()
      partEl.style.opacity = ''
      if (moved > 52) {
        sfx.drop()
        vibrate(14)
        floatNote(`OLD ${PART_LABEL[part].toUpperCase()}`, ev.clientX ?? x, (ev.clientY ?? y) - 18, true)
        completeStep()
      } else {
        toast('Swipe the part away to pull it out.')
      }
    }
    window.addEventListener('pointermove', move, { passive: false })
    window.addEventListener('pointerup', up, { once: true })
    window.addEventListener('pointercancel', up, { once: true })
  })
}

/* ---------- install ---------- */

function setupInstall(step) {
  setTrayChip(step.part)
  const slot = activeSlot(step.part)
  DOM.newPartChip.onpointerdown = (event) => beginInstallDrag(event, step.part, slot)
  markArmed()
}

function insideRect(x, y, rect, pad = 18) {
  return x >= rect.left - pad && x <= rect.right + pad && y >= rect.top - pad && y <= rect.bottom + pad
}

function beginInstallDrag(event, part, slot) {
  if (busy) return
  if (!requireArmed()) return
  event.preventDefault()
  const chip = DOM.newPartChip
  const ghost = makePartGhost(part, 'DROP IN THE OUTLINE')
  document.body.appendChild(ghost)
  ghost.style.left = `${event.clientX}px`
  ghost.style.top = `${event.clientY}px`
  chip.classList.add('dragging')
  let x = event.clientX
  let y = event.clientY
  let moved = 0
  slot.classList.add('hot')

  const move = (ev) => {
    x = ev.clientX
    y = ev.clientY
    moved = Math.hypot(x - event.clientX, y - event.clientY)
    ghost.style.left = `${x}px`
    ghost.style.top = `${y}px`
    const rect = slot.getBoundingClientRect()
    ghost.classList.toggle('over', insideRect(x, y, rect, 24))
  }
  const finish = (ev) => {
    window.removeEventListener('pointermove', move)
    window.removeEventListener('pointerup', finish)
    window.removeEventListener('pointercancel', finish)
    ghost.remove()
    chip.classList.remove('dragging')
    slot.classList.remove('hot')
    const cx = ev?.clientX ?? x
    const cy = ev?.clientY ?? y
    if (!moved) {
      toast('Drag the new part into the green outline.')
      return
    }
    if (insideRect(cx, cy, slot.getBoundingClientRect(), 24)) {
      chip.hidden = true
      DOM.newPartChip.classList.remove('ready')
      slot.classList.remove('show')
      sfx.duct()
      vibrate(12)
      const r = slot.getBoundingClientRect()
      sparkBurst(r.left + r.width / 2, r.top + r.height / 2, 12)
      completeStep()
    } else {
      toast('Line it up with the outline and drop it inside.')
    }
  }
  window.addEventListener('pointermove', move, { passive: false })
  window.addEventListener('pointerup', finish, { once: true })
  window.addEventListener('pointercancel', finish, { once: true })
}

/* ---------- scrub ---------- */

function setupScrub(step) {
  DOM.phone.classList.add('show-corrosion')
  const back = currentFace() === 'back'
  const spots = $$(back ? '.phone-face.back .adhesive' : '.internals .corrosion', DOM.phone).slice(0, step.spots || 3)
  spots.forEach((spot) => spot.classList.remove('is-clean'))
  stepState.cleared = new Set()
  stepState.spots = spots.length

  const hit = addHit({
    cls: `hit-scrub ${back ? 'scrub-back' : 'scrub-front'}`,
    face: back ? 'back' : 'front',
    tag: 'SCRUB',
  })

  let scrubbing = false
  let lastSound = 0

  const scrubAt = (clientX, clientY) => {
    if (!requireArmed()) return
    spots.forEach((spot, index) => {
      if (stepState.cleared.has(index)) return
      const rect = spot.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      if (Math.hypot(clientX - cx, clientY - cy) < 30) {
        stepState.cleared.add(index)
        spot.classList.add('is-clean')
        sfx.scrub()
        sparkBurst(cx, cy, 7)
        DOM.stepHint.textContent = `Spot cleaned. ${stepState.spots - stepState.cleared.size} to go.`
        if (performance.now() - lastSound > 80) lastSound = performance.now()
        if (stepState.cleared.size >= stepState.spots) {
          setTimeout(() => completeStep(), 360)
        }
      }
    })
  }

  hit.addEventListener('pointerdown', (event) => {
    if (busy) return
    if (!requireArmed()) return
    event.preventDefault()
    scrubbing = true
    try { hit.setPointerCapture(event.pointerId) } catch { /* ignore */ }
    scrubAt(event.clientX, event.clientY)
  })
  hit.addEventListener('pointermove', (event) => {
    if (!scrubbing) return
    scrubbing = true
    scrubAt(event.clientX, event.clientY)
    if (performance.now() - lastSound > 120) {
      lastSound = performance.now()
      sfx.scrub()
    }
  })
  const end = () => { scrubbing = false }
  hit.addEventListener('pointerup', end)
  hit.addEventListener('pointercancel', end)
}

/* ---------- hold ---------- */

function setupHold(step) {
  const face = currentFace()
  const hit = addHit({ cls: 'hit-hold', face, tag: 'PRESS & HOLD' })
  const ring = document.createElement('div')
  ring.className = 'hold-ring'
  ring.style.setProperty('--p', '0')
  hit.appendChild(ring)
  bindHold(hit, ring, 1050)
}

function bindHold(hit, ring, duration) {
  let raf = null
  let start = 0
  let done = false
  let holding = false

  const tick = (ts) => {
    if (!holding || done) return
    if (!start) start = ts
    const p = clamp((ts - start) / duration, 0, 1)
    ring.style.setProperty('--p', `${p}`)
    if (p >= 1) {
      done = true
      holding = false
      cancelAnimationFrame(raf)
      sfx.drop()
      vibrate([15, 30, 15])
      const rect = hit.getBoundingClientRect()
      sparkBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 14)
      completeStep()
      return
    }
    raf = requestAnimationFrame(tick)
  }

  hit.addEventListener('pointerdown', (event) => {
    if (busy || done) return
    if (!requireArmed()) return
    event.preventDefault()
    try { hit.setPointerCapture(event.pointerId) } catch { /* ignore */ }
    holding = true
    start = 0
    raf = requestAnimationFrame(tick)
  })
  const cancel = () => {
    if (done) return
    holding = false
    start = 0
    cancelAnimationFrame(raf)
    ring.style.setProperty('--p', '0')
  }
  hit.addEventListener('pointerup', cancel)
  hit.addEventListener('pointercancel', cancel)
  hit.addEventListener('pointerleave', cancel)
}

/* ---------- charging cable ---------- */

function setupPlug(step) {
  DOM.phone.classList.add('screen-off')
  DOM.phone.classList.remove('repaired')
  DOM.cableWrap.hidden = false
  DOM.cable.classList.remove('plugged', 'dragging')
  DOM.cable.style.transform = ''
  DOM.gestureHint.hidden = false
  DOM.gestureHint.textContent = 'DRAG THE CABLE INTO THE PORT'
  DOM.gestureHint.style.bottom = '154px'

  // Park the plug just below the charging port so the upward drag reads clearly.
  const port = $('.part.port', DOM.phone)
  if (port) {
    const portRect = port.getBoundingClientRect()
    const benchRect = DOM.bench.getBoundingClientRect()
    const cableHeight = DOM.cable.offsetHeight || 123
    const plugTop = portRect.bottom + 12
    const wrapBottom = plugTop + 10 + cableHeight
    DOM.cableWrap.style.bottom = `${Math.round(benchRect.bottom - wrapBottom)}px`
  }

  let plugged = false
  DOM.cable.onpointerdown = (event) => {
    if (busy || plugged) return
    if (!requireArmed()) return
    event.preventDefault()
    sfx.duct()
    DOM.cable.classList.add('dragging')
    DOM.gestureHint.hidden = true
    const startY = event.clientY
    let dy = 0
    DOM.cable.style.transition = 'none'

    const move = (ev) => {
      dy = clamp(ev.clientY - startY, -100, 6)
      DOM.cable.style.transform = `translate(-50%, ${dy}px)`
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      DOM.cable.classList.remove('dragging')
      DOM.cable.style.transition = ''
      if (dy < -52) {
        plugged = true
        DOM.cable.style.transform = ''
        DOM.cable.classList.add('plugged')
        sfx.duct()
        vibrate(20)
        DOM.phone.classList.remove('screen-off')
        DOM.phone.classList.add('repaired')
        DOM.testLayer.innerHTML = `
          <span class="test-title">POWER DELIVERY</span>
          <div class="charge-result"><span>⚡</span><b>CHARGING</b><small>8% and climbing</small></div>
        `
        DOM.phone.classList.add('testing')
        const port = $('.part.port', DOM.phone)
        if (port) {
          port.style.boxShadow = '0 0 12px rgba(255, 200, 90, .6)'
          setTimeout(() => { port.style.boxShadow = '' }, 1500)
        }
        setTimeout(() => {
          DOM.phone.classList.remove('testing')
          completeStep()
        }, 950)
      } else {
        DOM.cable.style.transform = ''
        toast('Push the cable all the way up into the port.')
      }
    }
    window.addEventListener('pointermove', move, { passive: false })
    window.addEventListener('pointerup', up, { once: true })
    window.addEventListener('pointercancel', up, { once: true })
  }
}

/* ---------- flip ---------- */

function setupFlip(step) {
  const hit = addHit({ cls: 'hit-flip', face: 'back' })
  const badge = document.createElement('span')
  badge.className = 'flip-badge'
  badge.textContent = 'TURN IT OVER'
  hit.appendChild(badge)
  hit.addEventListener('pointerdown', (event) => {
    if (busy) return
    event.preventDefault()
    sfx.flip()
    vibrate(12)
    hit.classList.remove('armed')
    completeStep()
  })
}

/* ---------- tests ---------- */

function setupTest(step) {
  DOM.phone.classList.add('repaired')
  DOM.phone.classList.remove('screen-off', 'booting')
  DOM.screenAlert.classList.add('alert-off')

  if (step.test === 'power') {
    DOM.phone.classList.remove('testing')
    DOM.phone.classList.add('screen-off')
    const hit = addHit({ cls: 'hit-power', face: 'front', tag: 'PRESS' })
    let running = false
    hit.addEventListener('pointerdown', async (event) => {
      if (busy || running) return
      running = true
      hit.classList.remove('armed')
      hit.style.opacity = '0'
      event.preventDefault()
      sfx.boot()
      vibrate(18)
      DOM.phone.classList.add('booting', 'screen-off')
      await wait(980)
      DOM.phone.classList.remove('booting', 'screen-off')
      DOM.phone.classList.add('repaired')
      sfx.chime()
      await wait(650)
      completeStep()
    })
    return
  }

  DOM.phone.classList.add('testing')
  const meta = TEST_META[step.test] || TEST_META.touch
  DOM.testLayer.innerHTML = `
    <span class="test-title">DIAGNOSTICS</span>
    <button class="test-target" type="button" aria-label="${meta.label}">
      <span class="tt-ico">${meta.icon}</span>
      <span class="tt-label">${meta.label}</span>
      <span class="tt-sub">${meta.sub}</span>
    </button>
  `
  let running = false
  $('.test-target', DOM.testLayer)?.addEventListener('click', async () => {
    if (busy || running) return
    running = true
    sfx.pop()
    await runTest(step.test)
    running = false
  })
}

async function runTest(kind) {
  DOM.testLayer.innerHTML = `<span class="test-title">RUNNING TEST</span>`
  if (kind === 'camera') {
    DOM.screenFlash.classList.remove('flash')
    void DOM.screenFlash.offsetWidth
    DOM.screenFlash.classList.add('flash')
    sfx.shutter()
    vibrate(20)
    await wait(420)
    DOM.testLayer.innerHTML = `
      <div class="test-result">
        <span class="tr-ico">📸</span>
        <b>PHOTO OK</b>
        <small>Sharp and colour-accurate</small>
      </div>
    `
  } else if (kind === 'speaker') {
    sfx.chime()
    vibrate([10, 40, 10])
    DOM.testLayer.innerHTML = `
      <div class="test-result">
        <span class="tr-ico">♪ ♫</span>
        <b>SOUND OK</b>
        <small>100% less bee</small>
      </div>
    `
  } else if (kind === 'battery') {
    sfx.star(1)
    DOM.testLayer.innerHTML = `
      <div class="test-result">
        <span class="tr-ico">🔋</span>
        <b>100%</b>
        <small>All-day capacity restored</small>
      </div>
    `
  } else {
    sfx.pop()
    DOM.testLayer.innerHTML = `
      <div class="test-result">
        <span class="tr-ico">☝</span>
        <b>TOUCH OK</b>
        <small>Every pixel responds</small>
      </div>
    `
  }
  await wait(1050)
  completeStep()
}

/* ---------- completion ---------- */

function applyStepEffect(step) {
  const p = DOM.phone
  switch (step.action) {
    case 'heat': {
      const rect = DOM.phone.getBoundingClientRect()
      floatNote(step.zone === 'board' ? 'DRY' : 'WARM', rect.left + rect.width / 2, rect.top + rect.height * .22)
      break
    }
    case 'screw':
      p.classList.add('screws-out')
      break
    case 'pry': {
      if (job.order.type === 'backglass') {
        p.classList.add('back-open')
      } else {
        p.classList.add('open', 'screen-off')
      }
      sfx.openPhone()
      vibrate(12)
      break
    }
    case 'tap':
      sfx.pop()
      break
    case 'remove': {
      const partEl = getPartEl(step.part)
      if (partEl) partEl.classList.add('is-removed')
      if (step.part === 'screen') p.classList.add('screen-gone')
      if (step.part === 'backglass') p.classList.add('back-glass-gone')
      sfx.drop()
      break
    }
    case 'install': {
      const partEl = getPartEl(step.part)
      if (partEl) {
        partEl.classList.remove('is-removed')
        partEl.classList.add('is-new')
      }
      if (step.part === 'screen') {
        p.classList.remove('screen-gone')
        p.classList.add('screen-laid', 'screen-new')
        p.classList.remove('testing')
      }
      if (step.part === 'backglass') {
        p.classList.remove('back-glass-gone', 'back-open')
        p.classList.add('repaired')
      }
      sfx.duct()
      const rect = DOM.phone.getBoundingClientRect()
      floatNote(`NEW ${PART_LABEL[step.part].toUpperCase()}`, rect.left + rect.width / 2, rect.top + rect.height * .55)
      break
    }
    case 'close':
      p.classList.remove('open', 'screen-laid')
      p.classList.add('screen-off')
      sfx.closePhone()
      vibrate(10)
      break
    case 'scrub':
      sfx.scrub()
      break
    case 'hold':
      sfx.drop()
      break
    case 'flip':
      p.classList.remove('view-back')
      sfx.flip()
      break
    case 'test':
      p.classList.remove('testing', 'booting', 'screen-off')
      p.classList.add('repaired')
      break
    case 'plug':
      p.classList.remove('screen-off')
      p.classList.add('repaired')
      break
    default:
      break
  }
}

async function completeStep() {
  if (busy || !currentStep) return
  const step = currentStep
  busy = true
  currentHits.forEach((hit) => hit.classList.remove('armed'))
  applyStepEffect(step)
  const delay = step.action === 'pry' ? 800 : step.action === 'close' ? 520 : 620
  await wait(delay)
  if (!job) return
  stepIndex++
  if (stepIndex >= job.repair.steps.length) {
    await finishJob()
  } else {
    enterStep(stepIndex)
  }
}

/* ============================================================
   Finish / summary / finale
   ============================================================ */

async function finishJob() {
  busy = true
  currentHits = []
  DOM.targetsFront.innerHTML = ''
  DOM.targetsBack.innerHTML = ''
  DOM.heatMeter.hidden = true
  DOM.gestureHint.hidden = true
  DOM.screenBadge.hidden = true
  sfx.success()
  spawnConfetti(34)
  vibrate([20, 30, 20, 30, 60])
  await wait(1250)

  const quality = qualityRating()
  const tip = quality === 3 ? 25 : quality === 2 ? 12 : 0
  const bonus = job.mistakes === 0 ? 15 : 0
  const total = job.order.fee + tip + bonus

  save.cash += total
  save.stars += quality
  if (bonus) save.perfect++
  save.lastType = job.order.type
  save.day = job.day + 1
  if (job.day === DAY_ORDERS.length) save.done = true
  persist()

  renderSummary({ quality, tip, bonus, total })
  showScreen('summary')
  busy = false
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function renderSummary({ quality, tip, bonus, total }) {
  const { order, repair, mistakes } = job
  DOM.summaryAvatar.style.setProperty('--tint', order.customer.tint)
  $('span', DOM.summaryAvatar).textContent = order.customer.emoji

  DOM.summaryEyebrow.textContent = quality === 3 ? 'PERFECT REPAIR' : quality === 2 ? 'GOOD WORK' : 'JOB COMPLETE'
  DOM.summaryTitle.textContent = quality === 3 ? 'Good as new.' : quality === 2 ? 'It lives!' : 'Well… it works.'
  DOM.summaryQuote.textContent = `“${quality === 3 ? (order.reaction || pick(repair.reactions.good)) : quality === 2 ? pick(repair.reactions.ok) : pick(repair.reactions.bad)}”`

  $$('.ico', DOM.summaryStars).forEach((star, i) => {
    star.classList.remove('on')
    star.style.animation = 'none'
    void star.offsetWidth
    star.style.animation = ''
    star.classList.toggle('on', i < quality)
  })

  DOM.payFee.textContent = money(order.fee)
  DOM.payTip.textContent = tip ? `+${money(tip)}` : '$0'
  DOM.payBonus.textContent = `+${money(bonus)}`
  DOM.perfectRow.hidden = bonus === 0
  DOM.payTotal.textContent = money(total)
  DOM.sumCash.textContent = money(save.cash)
  DOM.sumStars.textContent = String(save.stars)

  const lastDay = job.day === DAY_ORDERS.length
  DOM.summaryNext.textContent = lastDay
    ? 'Last customer of the week. Time to count the haul.'
    : job.day >= DAY_ORDERS.length
      ? 'Another walk-in is already at the door.'
      : `Next up: Day ${job.day + 1}. A new customer, a new problem.`

  DOM.nextDayBtn.innerHTML = lastDay
    ? 'See final results <svg class="ico"><use href="#ico-arrow"></use></svg>'
    : 'Next customer <svg class="ico"><use href="#ico-arrow"></use></svg>'

  DOM.fixedStamp.textContent = mistakes === 0 ? 'PERFECT' : 'FIXED'

  setTimeout(() => {
    for (let i = 0; i < quality; i++) {
      setTimeout(() => sfx.star(i), 120 + i * 170)
    }
    setTimeout(() => sfx.cash(), 640)
  }, 260)
}

function renderFinale() {
  const days = Math.min(save.day - 1, DAY_ORDERS.length)
  const possible = Math.max(1, days * 3)
  const ratio = save.stars / possible
  const rank = RANKS.find((r) => ratio >= r.min) || RANKS[RANKS.length - 1]
  DOM.finaleTitle.innerHTML = rank.title.replace(' ', '<br/>')
  DOM.finaleBlurb.textContent = rank.blurb
  DOM.finaleCash.textContent = money(save.cash)
  DOM.finaleStars.textContent = `${save.stars}/${possible}`
  DOM.finalePerfect.textContent = String(save.perfect)
  showScreen('finale')
  spawnConfetti(46)
  sfx.success()
  setTimeout(() => sfx.chime(), 500)
  vibrate([20, 40, 20, 40, 80])
}

/* ============================================================
   Wiring
   ============================================================ */

function nextDay() {
  if (!job) return
  sfx.select()
  if (job.day === DAY_ORDERS.length) {
    save.done = true
    persist()
    renderFinale()
    return
  }
  showScreen('intro')
  beginDay(job.day + 1)
}

function startEndless() {
  if (!hasStoredSave) {
    persist()
  }
  save.done = false
  save.endless = true
  save.day = DAY_ORDERS.length + 1
  persist()
  sfx.select()
  beginDay(DAY_ORDERS.length + 1)
}

function wire() {
  syncSoundUI()

  DOM.titleContinue.addEventListener('click', () => {
    sfx.init()
    sfx.select()
    if (save.done) {
      renderFinale()
      return
    }
    beginDay(save.day)
  })

  DOM.titleNew.addEventListener('click', () => {
    sfx.init()
    sfx.select()
    beginDay(1)
  })

  DOM.titleReset.addEventListener('click', () => {
    sfx.init()
    armReset()
  })

  DOM.startRepairBtn.addEventListener('click', () => {
    sfx.init()
    startJob()
  })

  DOM.nextDayBtn.addEventListener('click', nextDay)
  DOM.endlessBtn.addEventListener('click', startEndless)
  DOM.restartBtn.addEventListener('click', resetGame)
  DOM.helpBtn.addEventListener('click', helpWithStep)

  DOM.soundButtons.forEach((btn) => btn.addEventListener('click', toggleSound))

  document.addEventListener('pointerdown', () => sfx.init(), { once: true })

  // The game is portrait-only on phones; avoid accidental pull-to-refresh/scroll.
  document.addEventListener('touchmove', (event) => {
    if (event.touches.length > 1) event.preventDefault()
  }, { passive: false })

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      DOM.toast.classList.remove('show')
    }
  })
}

function init() {
  sfx.setEnabled(save.sound)
  wire()
  renderTitle()
  if (save.done) {
    DOM.titleContinue.textContent = 'See the results'
  }
}

init()
