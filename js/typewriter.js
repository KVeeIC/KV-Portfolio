/* =========================================================
   typewriter.js
   Types out dialogue lines one letter at a time.
   Press X while it types to show the full text right away.
   ========================================================= */

window.KV = window.KV || {};

KV.typewriter = {
  speed: 22,          // milliseconds per letter (lower is faster)
  isTyping: false,
  runId: 0,           // lets a new run cancel an old one
  lines: [],

  // Splits each line into a hidden full copy (for screen readers)
  // and a visible part that gets typed out.
  prepare(line) {
    if (line.dataset.full) return;
    line.dataset.full = line.textContent.trim();
    line.textContent = "";

    const srCopy = document.createElement("span");
    srCopy.className = "sr-only";
    srCopy.textContent = line.dataset.full;

    const visible = document.createElement("span");
    visible.className = "line__visible";
    visible.setAttribute("aria-hidden", "true");

    line.append(srCopy, visible);
  },

  // Types every line in order. Returns a promise that resolves when done.
  async run(lines, { instant = false } = {}) {
    const id = ++this.runId;
    this.lines = lines;
    lines.forEach((line) => {
      this.prepare(line);
      line.querySelector(".line__visible").textContent = "";
      line.classList.remove("is-typing");
    });

    if (instant) {
      this.finish();
      return;
    }

    this.isTyping = true;
    for (const line of lines) {
      const visible = line.querySelector(".line__visible");
      const text = line.dataset.full;
      line.classList.add("is-typing");

      for (let i = 1; i <= text.length; i++) {
        if (id !== this.runId) return;          // a newer run took over
        visible.textContent = text.slice(0, i);
        const char = text[i - 1];
        if (i % 2 === 0 && char !== " ") KV.audio.type();
        // small pause after punctuation feels more natural
        const pause = ".!?".includes(char) ? 160 : ",".includes(char) ? 80 : 0;
        await this.wait(this.speed + pause);
      }
      line.classList.remove("is-typing");
    }
    if (id === this.runId) this.isTyping = false;
  },

  // Skip to the end: show all text now
  finish() {
    this.runId++;
    this.lines.forEach((line) => {
      this.prepare(line);
      line.querySelector(".line__visible").textContent = line.dataset.full;
      line.classList.remove("is-typing");
    });
    this.isTyping = false;
  },

  wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },
};
