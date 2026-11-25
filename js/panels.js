/* =========================================================
   panels.js
   Switches what shows inside the dialogue box.
   Each panel in index.html has data-panel="name".
   Buttons with data-go="name" open that panel.
   data-back="name" says where X / Esc takes you.
   data-size="large" makes the box grow (Undertale style)
   when that panel opens, and shrink back when it closes.
   ========================================================= */

window.KV = window.KV || {};

KV.panels = {
  current: null,
  showId: 0,            // lets a newer show() cancel an older one
  resizeId: 0,          // same idea, for the box resize
  resizeTime: 340,      // ms, keep in sync with .box.is-resizing in style.css
  reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,

  // Watches every scroll area so the blinking ▼ shows when there is more text
  init() {
    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const body = entry.target.closest(".panel__body");
        if (body) this.updateScrollHint(body);
      });
    });
    document.querySelectorAll(".panel__body").forEach((body) => {
      body.addEventListener("scroll", () => this.updateScrollHint(body), { passive: true });
      observer.observe(body);
      [...body.children].forEach((child) => observer.observe(child));
    });
  },

  updateScrollHint(body) {
    const more = body.scrollTop + body.clientHeight < body.scrollHeight - 2;
    body.classList.toggle("has-more", more);
  },

  async show(name, { instant = false, silent = false } = {}) {
    const next = document.querySelector(`[data-panel="${name}"]`);
    if (!next) return;
    const id = ++this.showId;

    if (this.current) this.current.classList.remove("is-active");
    next.classList.add("is-active");
    this.current = next;
    if (!silent) KV.audio.select();

    // Highlight the menu button for this section.
    // Detail panels use data-section="projects" / "icstars".
    const section = next.dataset.section || name;
    document.querySelectorAll(".menu__btn").forEach((btn) => {
      btn.classList.toggle("is-current", btn.dataset.go === section);
    });

    const lines = [...next.querySelectorAll("[data-type]")];
    KV.typewriter.clear(lines);

    // start scrollable sections at the top
    const body = next.querySelector(".panel__body");
    if (body) body.scrollTop = 0;

    // Grow or shrink the box first, then type the text
    const box = next.closest(".box");
    const large = next.dataset.size === "large";
    if (box && large !== box.classList.contains("is-large")) {
      await this.resizeBox(box, large, instant || this.reducedMotion);
      if (id !== this.showId) return;     // another panel was opened meanwhile
    }

    KV.typewriter.run(lines, { instant });
  },

  // Animates the box from its current size to its new size.
  // The text is hidden while it moves, like the battle box in Undertale.
  resizeBox(box, large, instant) {
    const token = ++this.resizeId;

    // 1. remember where the box is right now (even mid-animation)
    const from = box.getBoundingClientRect();

    // 2. jump to the new size with no animation and measure it
    box.classList.remove("is-resizing", "is-hiding");
    box.style.width = "";
    box.style.height = "";
    box.classList.toggle("is-large", large);
    if (instant) return Promise.resolve();
    box.classList.add("is-hiding");          // hide text while measuring/moving
    const to = box.getBoundingClientRect();

    // 3. put it back at the old size, then animate to the new one
    box.style.width = from.width + "px";
    box.style.height = from.height + "px";
    void box.offsetWidth;                    // forces the browser to apply the old size
    box.classList.add("is-resizing");
    box.style.width = to.width + "px";
    box.style.height = to.height + "px";

    return new Promise((resolve) => {
      setTimeout(() => {
        if (token === this.resizeId) {
          box.classList.remove("is-resizing", "is-hiding");
          box.style.width = "";
          box.style.height = "";
        }
        resolve();
      }, this.resizeTime);
    });
  },

  back() {
    if (!this.current) return;
    const target = this.current.dataset.back;
    if (target) {
      KV.audio.back();
      this.show(target, { silent: true });
    }
  },
};
