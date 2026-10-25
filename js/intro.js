/* =========================================================
   intro.js
   The loading screen and "battle start" transition:
     1. KV sprite shows while the page loads
     2. A "!" pops up over the sprite
     3. The sprite vanishes and the heart blinks in its place
     4. The heart jumps down to the menu as the site fades in
   ========================================================= */

window.KV = window.KV || {};

KV.intro = {
  minTime: 2200,     // shortest time the loading screen stays up (ms)

  async run({ reducedMotion = false } = {}) {
    const loader = document.getElementById("loader");
    const sprite = document.getElementById("loader-sprite");
    const bar = document.getElementById("loader-bar");
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));

    // Fake progress bar that fills while we wait
    let progress = 0;
    const timer = setInterval(() => {
      progress = Math.min(progress + 8 + Math.random() * 12, 90);
      bar.style.width = progress + "%";
    }, 200);

    // Wait for images and fonts, plus a minimum time so the sprite is seen.
    // After everything has loaded, any key or tap skips the wait.
    const pageLoaded = new Promise((resolve) => {
      if (document.readyState === "complete") resolve();
      else window.addEventListener("load", resolve, { once: true });
    });
    const minWait = wait(reducedMotion ? 300 : this.minTime);
    const skip = new Promise((resolve) => {
      pageLoaded.then(() => {
        window.addEventListener("keydown", resolve, { once: true });
        window.addEventListener("pointerdown", resolve, { once: true });
      });
    });
    await Promise.all([pageLoaded, Promise.race([minWait, skip])]);

    clearInterval(timer);
    bar.style.width = "100%";
    await wait(reducedMotion ? 0 : 350);

    // Step 2: the "!" alert
    loader.classList.add("is-encounter");
    if (!reducedMotion) {
      loader.classList.add("is-alert");
      KV.audio.alert();
      await wait(550);
      loader.classList.remove("is-alert");
    }

    // Step 3: sprite disappears, heart blinks over its chest
    const r = sprite.getBoundingClientRect();
    KV.soul.place(r.left + r.width / 2, r.top + r.height * 0.56);
    sprite.classList.add("is-hidden");

    if (!reducedMotion) {
      for (let i = 0; i < 3; i++) {
        KV.soul.show();
        KV.audio.blink();
        await wait(130);
        KV.soul.hide();
        await wait(110);
      }
    }
    KV.soul.show();

    // Step 4: fade the site in and fly the heart to its start spot
    document.body.classList.add("is-ready");
    loader.classList.add("is-done");

    const box = document.querySelector(".box").getBoundingClientRect();
    await KV.soul.flyTo(box.left + box.width / 2, box.bottom - 24, reducedMotion);

    loader.remove();
  },
};
