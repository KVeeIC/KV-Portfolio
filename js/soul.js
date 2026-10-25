/* =========================================================
   soul.js
   The red heart is the SOUL used to move around the page.
   Anything with the attribute data-soul can be selected:
   move the heart on top of it and press Z (or Enter).
   ========================================================= */

window.KV = window.KV || {};

KV.soul = {
  el: null,
  x: 0,                 // center of the heart, in screen pixels
  y: 0,
  speed: 300,           // pixels per second with the keyboard
  enabled: false,
  hovered: null,        // the data-soul element under the heart
  mode: "keys",         // "keys" or "mouse"
  mouse: { x: 0, y: 0 },
  keys: new Set(),      // directions being held: up, down, left, right
  lastTime: 0,

  init() {
    this.el = document.getElementById("soul");
    this.size = this.el.offsetWidth || 32;
    requestAnimationFrame((t) => this.loop(t));
  },

  /* ---------- placing and showing ---------- */

  show() { this.el.classList.add("is-visible"); },
  hide() { this.el.classList.remove("is-visible"); },

  place(x, y) {
    this.x = x;
    this.y = y;
    this.render();
  },

  render() {
    const half = this.size / 2;
    this.el.style.transform = `translate(${Math.round(this.x - half)}px, ${Math.round(this.y - half)}px)`;
  },

  // Animated jump to a spot (used by the intro). Returns a promise.
  flyTo(x, y, instant = false) {
    return new Promise((resolve) => {
      if (instant) {
        this.place(x, y);
        return resolve();
      }
      this.el.classList.add("is-flying");
      this.place(x, y);
      setTimeout(() => {
        this.el.classList.remove("is-flying");
        resolve();
      }, 820);
    });
  },

  // Jump straight onto an element (used for clicks, taps and Tab focus)
  snapTo(element) {
    const r = element.getBoundingClientRect();
    this.mode = "keys";
    this.place(r.left + r.width / 2, r.top + r.height / 2);
  },

  enable() {
    this.enabled = true;
  },

  /* ---------- input ---------- */

  press(dir)   { this.keys.add(dir); this.mode = "keys"; },
  release(dir) { this.keys.delete(dir); },

  followMouse(x, y) {
    this.mouse.x = x;
    this.mouse.y = y;
    this.mode = "mouse";
  },

  /* ---------- main loop (runs every frame) ---------- */

  loop(time) {
    const dt = Math.min((time - this.lastTime) / 1000, 0.05);
    this.lastTime = time;

    if (this.enabled) {
      this.move(dt);
      this.checkHover();
    }
    requestAnimationFrame((t) => this.loop(t));
  },

  move(dt) {
    let dx = 0;
    let dy = 0;
    if (this.keys.has("left"))  dx -= 1;
    if (this.keys.has("right")) dx += 1;
    if (this.keys.has("up"))    dy -= 1;
    if (this.keys.has("down"))  dy += 1;

    if (dx || dy) {
      // same speed when moving diagonally
      const length = Math.hypot(dx, dy);
      this.x += (dx / length) * this.speed * dt;
      this.y += (dy / length) * this.speed * dt;
      this.autoScroll(dy, dt);
    } else if (this.mode === "mouse") {
      // glide toward the mouse
      this.x += (this.mouse.x - this.x) * 0.45;
      this.y += (this.mouse.y - this.y) * 0.45;
    } else {
      return;
    }

    // keep the heart on screen
    const half = this.size / 2;
    this.x = Math.max(half, Math.min(window.innerWidth - half, this.x));
    this.y = Math.max(half, Math.min(window.innerHeight - half, this.y));
    this.render();
  },

  // On small screens the page can be taller than the window,
  // so scroll when the heart pushes against the top or bottom.
  autoScroll(dy, dt) {
    const edge = 60;
    if (dy > 0 && this.y > window.innerHeight - edge) window.scrollBy(0, this.speed * dt);
    if (dy < 0 && this.y < edge) window.scrollBy(0, -this.speed * dt);
  },

  // Finds the selectable element under the center of the heart
  checkHover() {
    const under = document.elementFromPoint(this.x, this.y);
    const target = under ? under.closest("[data-soul]") : null;
    if (target === this.hovered) return;

    if (this.hovered) this.hovered.classList.remove("is-soul-hover");
    this.hovered = target;
    if (target) {
      target.classList.add("is-soul-hover");
      KV.audio.move();
    }
  },

  // Called when Z or Enter is pressed. Returns true if something was selected.
  select() {
    if (!this.hovered) return false;
    this.hovered.click();
    return true;
  },
};
