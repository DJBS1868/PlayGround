// GREEN EMPIRE — bootstrap: engine, renderer, interface, audio, main loop.
import { Game } from './game.js';
import { Renderer } from './render.js';
import { UI } from './ui.js';
import { Audio } from './audio.js';

const game = new Game();
let loaded = false;
try { loaded = game.load(); } catch (err) { console.warn('Save load skipped', err); }

const canvas = document.getElementById('scene');
const renderer = new Renderer(canvas, game);
const audio = new Audio(game);
const ui = new UI(game, renderer, audio);

// The world waits behind the splash screen until the player enters.
game.setPaused(true);

if (loaded) {
  const btn = document.getElementById('btnStartText');
  if (btn) btn.textContent = 'CONTINUE THE EMPIRE';
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(Math.max(0, (now - last) / 1000), 0.05);
  last = now;

  if (ui.splashDone) game.update(dt);
  renderer.draw(dt);
  ui.sync(dt);

  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Save on page exit; the game also autosaves every 12 seconds.
window.addEventListener('pagehide', () => game.save());
window.addEventListener('beforeunload', () => game.save());

// Helpful for local debugging and automated checks.
window.__GREEN_EMPIRE__ = { game, renderer, ui, audio, loaded };
