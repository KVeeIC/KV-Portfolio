/* =========================================================
   audio.js
   Tiny retro sound effects made with the Web Audio API.
   No sound files needed. Sound is OFF until the visitor
   turns it on with the SOUND button. Soon to be replaced with the actual sound bites from the real game.
   ========================================================= */

window.KV = window.KV || {};

KV.audio = {
  enabled: false,
  ctx: null,

  // Remember the visitor's choice between visits
  init() {
    try {
      this.enabled = localStorage.getItem("kv-sound") === "on";
    } catch (e) {
      this.enabled = false;
    }
    this.updateButton();
  },

  toggle() {
    this.enabled = !this.enabled;
    try {
      localStorage.setItem("kv-sound", this.enabled ? "on" : "off");
    } catch (e) {
      /* storage blocked, that is fine */
    }
    this.updateButton();
    if (this.enabled) this.select();
  },

  updateButton() {
    const label = document.getElementById("sound-state");
    const btn = document.querySelector('[data-action="sound"]');
    if (label) label.textContent = this.enabled ? "ON" : "OFF";
    if (btn) btn.setAttribute("aria-pressed", String(this.enabled));
  },

  // Plays one short square wave beep
  beep(freq, duration = 0.06, volume = 0.05, type = "square") {
    if (!this.enabled) return;
    try {
      if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.connect(gain).connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      /* audio not supported */
    }
  },

  // Named sounds used around the site
  type()   { this.beep(520 + Math.random() * 60, 0.03, 0.025); },
  move()   { this.beep(880, 0.04, 0.03); },
  select() { this.beep(660, 0.05); setTimeout(() => this.beep(990, 0.07), 50); },
  back()   { this.beep(440, 0.06); },
  blink()  { this.beep(1200, 0.05, 0.04); },
  alert()  { this.beep(740, 0.12, 0.05, "triangle"); },
};
