      // Sublime Booty by Chris — shared timeline for both formats. FMT is "land" or "port".
      const FMT = "{{FMT}}";
      const P = FMT === "port";

      // seeded PRNG so the bokeh field is identical on every render
      let seed = 20261019;
      const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
      const W = P ? 1080 : 1920, H = P ? 1920 : 1080;
      const bokeh = document.getElementById("bokeh");
      for (let i = 0; i < 34; i++) {
        const d = 6 + Math.pow(rnd(), 2.2) * 70;
        const gold = rnd() < 0.35;
        const el = document.createElement("div");
        el.className = "bk";
        el.style.cssText = `width:${d}px;height:${d}px;left:${rnd() * W}px;top:${rnd() * H}px;` +
          `opacity:${0.18 + rnd() * 0.5};filter:blur(${d > 30 ? 6 : 1.5}px);` +
          `background:radial-gradient(circle, ${gold ? "rgba(255,240,190,.95)" : "rgba(255,210,228,.95)"} 0%, ${gold ? "rgba(240,207,120,0)" : "rgba(255,45,122,0)"} 70%)`;
        bokeh.appendChild(el);
      }

      const tl = gsap.timeline({ paused: true });
      /*{{MOTION}}*/
      window.__timelines["main"] = tl;
