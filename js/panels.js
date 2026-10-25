/* =========================================================
   panels.js
   Switches what shows inside the dialogue box.
   Each panel in index.html has data-panel="name".
   Buttons with data-go="name" open that panel.
   data-back="name" says where X / Esc takes you.
   ========================================================= */

window.KV = window.KV || {};

KV.panels = {
  current: null,

  show(name, { instant = false, silent = false } = {}) {
    const next = document.querySelector(`[data-panel="${name}"]`);
    if (!next) return;

    if (this.current) this.current.classList.remove("is-active");
    next.classList.add("is-active");
    this.current = next;
    if (!silent) KV.audio.select();

    // Highlight the menu button for this section.
    // Project detail panels use data-section="projects".
    const section = next.dataset.section || name;
    document.querySelectorAll(".menu__btn").forEach((btn) => {
      btn.classList.toggle("is-current", btn.dataset.go === section);
    });

    const lines = [...next.querySelectorAll("[data-type]")];
    KV.typewriter.run(lines, { instant });
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
