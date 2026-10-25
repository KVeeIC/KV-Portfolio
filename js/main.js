/* =========================================================
   main.js
   Connects everything: keyboard, mouse, touch and clicks.

   Controls
     Move:    Arrow keys or W A S D
     Select:  Z, Enter or Space
     Back:    X, Esc or Backspace
   ========================================================= */

window.KV = window.KV || {};

(function () {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const KEY_DIRECTIONS = {
    ArrowUp: "up",    w: "up",    W: "up",
    ArrowDown: "down", s: "down", S: "down",
    ArrowLeft: "left", a: "left", A: "left",
    ArrowRight: "right", d: "right", D: "right",
  };
  const SELECT_KEYS = ["z", "Z", "Enter", " "];
  const BACK_KEYS = ["x", "X", "Escape", "Backspace"];

  /* ---------- Select and back actions ---------- */

  function select() {
    // While text is typing, Z shows the rest of it first
    if (KV.typewriter.isTyping) {
      KV.typewriter.finish();
      return;
    }
    if (KV.soul.select()) return;

    // Nothing under the heart: use whatever has keyboard focus
    const focused = document.activeElement;
    if (focused && focused.matches("[data-soul]")) focused.click();
  }

  function back() {
    if (KV.typewriter.isTyping) {
      KV.typewriter.finish();
      return;
    }
    KV.panels.back();
  }

  /* ---------- Keyboard ---------- */

  window.addEventListener("keydown", (e) => {
    if (!KV.soul.enabled || e.ctrlKey || e.metaKey || e.altKey) return;

    const dir = KEY_DIRECTIONS[e.key];
    if (dir) {
      e.preventDefault();
      KV.soul.press(dir);
      document.body.classList.remove("uses-soul-cursor");
    } else if (SELECT_KEYS.includes(e.key)) {
      e.preventDefault();
      if (!e.repeat) select();
    } else if (BACK_KEYS.includes(e.key)) {
      e.preventDefault();
      if (!e.repeat) back();
    }
  });

  window.addEventListener("keyup", (e) => {
    const dir = KEY_DIRECTIONS[e.key];
    if (dir) KV.soul.release(dir);
  });

  // Let go of every direction if the window loses focus
  window.addEventListener("blur", () => KV.soul.keys.clear());

  /* ---------- Mouse: the heart follows the pointer ---------- */

  window.addEventListener("pointermove", (e) => {
    if (!KV.soul.enabled || e.pointerType !== "mouse") return;
    KV.soul.followMouse(e.clientX, e.clientY);
    document.body.classList.add("uses-soul-cursor");
  });

  /* ---------- Clicks and taps ---------- */

  document.addEventListener("click", (e) => {
    const go = e.target.closest("[data-go]");
    if (go) {
      KV.panels.show(go.dataset.go);
      // a tap with a finger also moves the heart onto what was tapped
      if (e.pointerType === "touch") KV.soul.snapTo(go);
      return;
    }
    if (e.target.closest('[data-action="sound"]')) KV.audio.toggle();
  });

  // Tabbing through with the keyboard moves the heart too
  document.addEventListener("focusin", (e) => {
    if (KV.soul.enabled && e.target.matches("[data-soul]") && e.target.matches(":focus-visible")) {
      KV.soul.snapTo(e.target);
    }
  });

  /* ---------- On screen touch controls ---------- */

  document.querySelectorAll(".dpad__btn").forEach((btn) => {
    const dir = btn.dataset.dir;
    const start = (e) => {
      e.preventDefault();
      btn.classList.add("is-pressed");
      KV.soul.press(dir);
    };
    const stop = () => {
      btn.classList.remove("is-pressed");
      KV.soul.release(dir);
    };
    btn.addEventListener("pointerdown", start);
    btn.addEventListener("pointerup", stop);
    btn.addEventListener("pointerleave", stop);
    btn.addEventListener("pointercancel", stop);
  });

  document.querySelectorAll(".action-btn").forEach((btn) => {
    btn.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      if (btn.dataset.key === "select") select();
      else back();
    });
  });

  /* ---------- Start up ---------- */

  document.getElementById("year").textContent = new Date().getFullYear();
  KV.audio.init();
  KV.soul.init();

  KV.intro.run({ reducedMotion }).then(() => {
    KV.soul.enable();
    KV.panels.show("home", { instant: reducedMotion, silent: true });
  });
})();
