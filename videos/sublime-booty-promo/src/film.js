      // Sublime Booty by Chris — shared timeline for both formats. FMT is "land" or "port".
      const FMT = "{{FMT}}";
      const P = FMT === "port";

      const W = P ? 1080 : 1920, H = P ? 1920 : 1080;
      // delivery map camera states (viewBox): a = Maradi close-up, b = whole Niger, c = Africa
      const MAPVB = P
        ? { a: "510 461 64 58", b: "290 215 460 417", c: "-76.5 -10 1653 1500" }
        : { a: "507 462.2 70 55.6", b: "250 200 520 413", c: "-194.5 -10 1889 1500" };
      window.MAPVB = MAPVB;

      const tl = gsap.timeline({ paused: true });
      /*{{MOTION}}*/
      window.__timelines["main"] = tl;
