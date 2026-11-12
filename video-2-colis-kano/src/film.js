/* =====================================================================
   Allô Multi-Services Maradi · Vidéo 2 « Le voyage d'un colis »
   UNE seule timeline pour les deux formats. Les positions dépendent de V
   (vertical 1080x1920) ; tous les temps viennent des mots de la voix off.
   ===================================================================== */
(function () {
  const V = window.__FMT === 'v';
  const D = window.__DATA;
  const W = V ? 1080 : 1920, H = V ? 1920 : 1080, DUR = D.dur;
  const P = D.pts;
  const words = D.words;
  const T = (txt, n = 1) => { let k = 0; for (const w of words) if (w.text === txt && ++k === n) return w.start; throw new Error('mot ' + txt); };
  const q = (s) => document.querySelector(s);
  const qa = (s) => Array.from(document.querySelectorAll(s));
  const set = (t, v) => gsap.set(t, v);
  const E = { io: 'power2.inOut', io3: 'power3.inOut', out: 'expo.out', o3: 'power3.out', o2: 'power2.out', back: 'back.out(1.6)', backS: 'back.out(1.2)', in: 'power2.in', in3: 'power3.in', sine: 'sine.inOut' };
  const tl = gsap.timeline({ paused: true });
  const pick = (v, h) => (V ? v : h);

  /* ---------- repères temporels (voix) ---------- */
  const t = {
    mais: T('mais'), dispo: T('disponible'), voici: T('Voici'), hadiza: T('Hadiza,'), maradi1: T('à Maradi.'),
    marchandise: T('marchandise'), chauffeur1: T('chauffeur,'), mais2: T('mais', 2), quitter: T('quitter'),
    alors: T('Alors,'), appelle: T('appelle'), allo: T('Allô'), whatsapp: T('WhatsApp,'), numero: T('numéro'),
    photo: T('photo'), colisDot: T('colis.'), notre: T('Notre'), appelle2: T('appelle', 2), chauffeur3: T('chauffeur', 2),
    organise: T('organise'), recup: T('récupération.'), le: T('Le'), recupere: T('récupéré,'), verifie: T('vérifié,'),
    reemballe: T('réemballé'), puis: T('Puis'), livre: T('livré'), expedie: T('expédié'), niamey: T('Niamey,'),
    zinder: T('Zinder,'), tahoua: T('Tahoua,'), agadez: T('Agadez'), toutes: T('toutes'), niger: T('Niger'),
    sousRegion: T('sous-région.'), hadiza2: T('Hadiza'), confirmation: T('confirmation :'), charge: T('charge.'),
    les: T('Les'), livraison: T('Livraison'), p1: T('1 000'), expedition: T('Expédition'), p2: T('1 500'),
    ouverture: T('Ouverture'), p3: T('2 000'), et: T('Et'), facture: T('facture'), votre2: T('Votre', 2),
    appelez: T('Appelez'), ecrivez: T('écrivez'), wa2: T('WhatsApp au'), n74: T('74'), n58: T('58'), n18: T('18'), n24: T('24.'),
    allo3: T('Allô', 2), tous: T('Tous'),
  };

  /* =====================================================================
     MISE EN PAGE STATIQUE (par format)
     ===================================================================== */
  const TXT = pick({ l: 80, t: 230, w: 920 }, { l: 110, t: 250, w: 720 });
  const TXT_TK = pick({ l: 190, t: 230, w: 840 }, { l: 110, t: 250, w: 720 }); // scènes avec traqueur
  const FS = pick({ title: 80, sub: 34, kick: 28, num: 52, chip: 32, chipIc: 58, chipPad: '14px 30px 14px 14px' },
                  { title: 70, sub: 29, kick: 24, num: 46, chip: 27, chipIc: 50, chipPad: '12px 26px 12px 12px' });
  set('.title', { fontSize: FS.title });
  set('.sub', { fontSize: FS.sub, marginTop: 22 });
  set('.kicker', { fontSize: FS.kick, marginBottom: 18 });
  set('.kicker .num', { width: FS.num, height: FS.num, fontSize: FS.num * 0.52 });
  set('.chip', { fontSize: FS.chip, padding: FS.chipPad });
  set('.chip .ic', { width: FS.chipIc, height: FS.chipIc });
  set('.chip .ic svg', { width: FS.chipIc * 0.55, height: FS.chipIc * 0.55 });
  const box = (sel, b) => set(sel, { position: 'absolute', left: b.l, top: b.t, width: b.w });

  // fond
  set('#bgWrap', { opacity: 1 });

  /* ---------- carte : caméra ---------- */
  const mapG = q('#mapG');
  set(mapG, { svgOrigin: '0 0' });
  const cam = (fx, fy, s, ax, ay) => ({ x: ax - fx * s, y: ay - fy * s, scale: s });
  const A1 = pick([540, 1200], [1300, 570]);            // ancre S1
  const A2 = pick([540, 700], [1360, 470]);             // ancre S2 (Maradi)
  const A7 = pick([540, 1040], [1330, 545]);            // ancre S7 (vue large)
  const mid = [(P.kano[0] + P.maradi[0]) / 2, (P.kano[1] + P.maradi[1]) / 2];
  const S1 = pick(2.9, 2.6), S2 = pick(3.3, 3.0), S7a = pick(0.67, 0.69), S7b = pick(0.62, 0.64), S7c = pick(0.58, 0.6);
  const F7 = [1215, 1090];
  set(mapG, cam(mid[0] + 18, mid[1] + 20, S1 * 0.94, A1[0], A1[1]));
  set(['#lblNiger', '#lblNigeria', '#wide', '#dotsAll', '#arrows'], { opacity: 0 });
  set('.rd', { opacity: 0, scale: 0, transformOrigin: '50% 50%' });
  set('#pinMaradi .pinS', { scale: 0, svgOrigin: '0 0' });
  set('#pinKano .pinS', { scale: 0.4, svgOrigin: '0 0' });
  set('#miniBox', { scale: 0, svgOrigin: '0 0' });

  /* ---------- S1 ---------- */
  if (V) {
    box('#s1a', { l: 80, t: 250, w: 920 }); set('#s1a', { fontSize: 86 });
    box('#s1b', { l: 80, t: 450, w: 900 }); set('#s1b', { fontSize: 60, color: '#0B44B3' });
    set('#s1chip', { position: 'absolute', left: 80, top: 625 });
  } else {
    box('#s1a', { l: 110, t: 250, w: 760 }); set('#s1a', { fontSize: 78 });
    box('#s1b', { l: 110, t: 470, w: 720 }); set('#s1b', { fontSize: 54, color: '#0B44B3' });
    set('#s1chip', { position: 'absolute', left: 110, top: 660 });
  }

  /* ---------- S2 : Hadiza ---------- */
  if (V) {
    set('#hCard', { left: 120, top: 850, width: 840, height: 380 });
    set('#hPhoto', { left: 0, top: 0, width: 340, height: 380 });
    set('#hInfo', { left: 380, top: 110, width: 430 });
    set('#hName', { fontSize: 96 });
    set('#s2c1', { position: 'absolute', left: 120, top: 1262 });
    set('#s2c2', { position: 'absolute', left: 120, top: 1362 });
  } else {
    set('#hCard', { left: 110, top: 220, width: 720, height: 360 });
    set('#hPhoto', { left: 0, top: 0, width: 300, height: 360 });
    set('#hInfo', { left: 340, top: 100, width: 360 });
    set('#hName', { fontSize: 86 });
    set('#s2c1', { position: 'absolute', left: 110, top: 630 });
    set('#s2c2', { position: 'absolute', left: 110, top: 726 });
  }
  set('#hKick', { fontSize: pick(26, 22) });

  /* ---------- téléphone (S3-S4) ---------- */
  const PH = pick({ cx: 615, cy: 1000, s: 1.16 }, { cx: 1390, cy: 548, s: 0.86 });
  set('#phoneWrap', { left: PH.cx - 200, top: PH.cy - 410, scale: PH.s, transformOrigin: '50% 50%' });
  box('#p1', TXT_TK); box('#p2', TXT_TK);
  if (V) { set('.p-s', { display: 'none' }); set('.p-list', { display: 'none' }); }
  else { set('.p-list', { display: 'flex', flexDirection: 'column', gap: 16, marginTop: 34, alignItems: 'flex-start' }); }
  set('#scrWa', { xPercent: 100 }); set('#scrCall', { opacity: 0 });
  set(['#b1', '#b2', '#b3', '#b4', '#b5'], { opacity: 0, y: 26, scale: 0.94, transformOrigin: '100% 100%' });
  set('#b2', { transformOrigin: '0% 100%' });

  /* ---------- traqueur ---------- */
  const TKP = [];
  if (V) {
    set('#tracker', { left: 34, top: 590, width: 112, height: 900, background: '#fff', borderRadius: 56, boxShadow: '0 24px 50px rgba(11,26,79,.16)' });
    set('.tk-txt', { display: 'none' });
    set('#tkLine', { left: 54, top: 90, width: 4, height: 720, '--dir': '180deg' });
    set('#tkFill', { left: 53, top: 90, width: 6, height: 720, scaleY: 0, transformOrigin: '50% 0%' });
    for (let i = 0; i < 5; i++) { set(`#tk${i + 1}`, { left: 20, top: 54 + i * 180 }); TKP.push([34 + 56, 590 + 54 + i * 180 + 36]); }
    set('.tk-dot', { width: 72, height: 72, fontSize: 32 });
  } else {
    set('#tracker', { left: 110, top: 34, width: 1700, height: 112, background: '#fff', borderRadius: 56, boxShadow: '0 24px 50px rgba(11,26,79,.14)' });
    set('#tkLine', { left: 50, top: 104, width: 1600, height: 4, '--dir': '90deg' });
    set('#tkFill', { left: 50, top: 103, width: 1600, height: 6, scaleX: 0, transformOrigin: '0% 50%' });
    for (let i = 0; i < 5; i++) { set(`#tk${i + 1}`, { left: 30 + i * 336, top: 22, gap: 14 }); TKP.push([110 + 30 + i * 336 + 32, 34 + 22 + 32]); }
    set('.tk-dot', { width: 64, height: 64, fontSize: 28 });
    set('.tk-lbl', { fontSize: 21 }); set('.tk-st', { fontSize: 16, marginTop: 2 });
  }
  set('.tk-dot', { border: '4px solid #fff' });
  set('.tk-step', { opacity: 0.42 });
  set('#tracker', { opacity: 0 });

  /* ---------- S5 ---------- */
  const S5 = pick({ ag: [380, 1010, 270], dr: [870, 1010, 220] }, { ag: [1110, 480, 250], dr: [1660, 480, 210] });
  set('#s5agent', { left: S5.ag[0] - S5.ag[2] / 2, top: S5.ag[1] - S5.ag[2] / 2, width: S5.ag[2], height: S5.ag[2] });
  set('#s5drv', { left: S5.dr[0] - S5.dr[2] / 2, top: S5.dr[1] - S5.dr[2] / 2, width: S5.dr[2], height: S5.dr[2] });
  ['#wv1', '#wv2', '#wv3'].forEach((w) => set(w, { left: S5.ag[0] - S5.ag[2] / 2, top: S5.ag[1] - S5.ag[2] / 2, width: S5.ag[2], height: S5.ag[2], opacity: 0 }));
  {
    const x1 = S5.ag[0] + S5.ag[2] / 2 + 14, x2 = S5.dr[0] - S5.dr[2] / 2 - 14, y = S5.ag[1];
    q('#s5path').setAttribute('d', `M${x1},${y} Q${(x1 + x2) / 2},${y - pick(150, 130)} ${x2},${y}`);
    set('#s5link', { left: 0, top: 0 });
  }
  box('#s5txt', TXT_TK); set('#s5txt', { width: TXT_TK.w });
  set('#s5c1', { position: 'absolute', left: pick(200, 1000), top: pick(1230, 700) });
  set('#s5c2', { position: 'absolute', left: pick(200, 1000), top: pick(1328, 796) });
  set('#s5in', { opacity: 0 });
  set('#morph', { left: TKP[2][0] - 50, top: TKP[2][1] - 50, width: 100, height: 100, scale: 0, opacity: 1, transformOrigin: '50% 50%' });

  /* ---------- carton héros ---------- */
  const HB = { s6: pick([605, 1000, 0.95], [1390, 500, 0.86]), s11: pick([540, 1060, 1.05], [1390, 520, 0.95]), s13: pick([540, 1060, 0.98], [1360, 560, 1.2]) };
  const placeBox = (c) => ({ left: c[0] - 300, top: c[1] - 300 });
  set('#heroBoxPos', { ...placeBox(HB.s6), scale: HB.s6[2], transformOrigin: '50% 50%', opacity: 0 });
  set('#hb-lid', { svgOrigin: '300 225' });
  set('#zoomDark', { opacity: 0 });

  /* ---------- S6 ---------- */
  box('#s6txt', TXT_TK);
  set('.ck', { fontSize: pick(34, 30), padding: pick('12px 30px 12px 12px', '12px 28px 12px 12px') });
  set('.ck .bx', { width: pick(56, 50), height: pick(56, 50) });
  set('.ck .bx svg', { width: 30, height: 30 });
  set('#ck0', { position: 'absolute', left: pick(330, 1210), top: pick(1350, 790), opacity: 0 });
  if (V) { set('#agentCard', { left: 330, top: 560, width: 540, height: 620 }); set('#ckList', { left: 200, top: 1210, gap: 14 }); }
  else { set('#agentCard', { left: 1130, top: 190, width: 540, height: 660 }); set('#ckList', { left: 110, top: 480, gap: 18 }); }
  set('#s6b', { opacity: 0 });
  set(['#ck1', '#ck2', '#ck3'], { opacity: 0, x: -30 });

  /* ---------- ruban adhésif (wipe) ---------- */
  const TAPE_W = Math.hypot(W, H) * 1.25, TAPE_H = pick(1400, 1000);
  set('#tape', { left: (W - TAPE_W) / 2, top: (H - TAPE_H) / 2, width: TAPE_W, height: TAPE_H, rotation: -16, x: -TAPE_W * 1.08, transformOrigin: '50% 50%' });
  {
    const rows = []; const rowTxt = 'ALLÔ <b>MULTI-SERVICES</b> MARADI · VOS COLIS ENTRE DE BONNES MAINS · ';
    for (let i = 0; i < 9; i++) rows.push(`<div class="row" style="font-size:${pick(84, 64)}px;line-height:1.5;transform:translateX(${-(i % 3) * 180}px)">${rowTxt.repeat(4)}</div>`);
    q('#tape').innerHTML = rows.join('');
  }

  /* ---------- S7 ---------- */
  if (V) {
    set('#s7txt', { left: 80, top: 230, width: 920 });
    set('#s7t', { fontSize: 78, marginTop: 22 });
    set('#delivCard', { left: 560, top: 1110, width: 420, height: 290 });
  } else {
    set('#s7txt', { left: 110, top: 250, width: 640 });
    set('#s7t', { fontSize: 74, marginTop: 24 });
    set('#delivCard', { left: 1360, top: 600, width: 400, height: 270 });
  }
  set(['#s7c1', '#s7t', '#s7s', '#delivCard'], { opacity: 0 });
  set('#wide .wpS', { scale: 0, svgOrigin: '0 0' });
  set('.xc', { scale: 0, opacity: 0, transformOrigin: '50% 50%' });
  set('.sd', { opacity: 0, scale: 0, transformOrigin: '50% 50%' });
  set('[id^="ah-"] path', { scale: 0, svgOrigin: '0 0' });
  qa('#arrows path.arrow').forEach((p) => { p.setAttribute('stroke-dasharray', '1 1'); p.setAttribute('stroke-dashoffset', '1'); p.style.strokeWidth = '13'; });

  /* ---------- S8 ---------- */
  box('#s8txt', TXT_TK);
  const PH2 = pick({ cx: 650, cy: 1000, s: 1.12 }, { cx: 1400, cy: 545, s: 0.86 });
  set('#phone2Wrap', { left: PH2.cx - 200, top: PH2.cy - 410, scale: PH2.s, transformOrigin: '50% 50%' });
  set('#s8ava', pick({ left: 175, top: 1180, width: 230, height: 230 }, { left: 990, top: 600, width: 210, height: 210 }));
  set('#notif', { y: -160, opacity: 0 });
  set('#bigOk', { scale: 0 });

  /* ---------- S9 : tarifs ---------- */
  if (V) {
    set('#tarifHead', { left: 80, top: 230, gap: 14 });
    set('#th1', { fontSize: 74, padding: '10px 40px 14px' }); set('#th2', { fontSize: 38, padding: '10px 32px' });
    set('#cardStage', { left: 90, top: 520, width: 900, height: 700 });
    set('.tCard', { left: 0, top: 0, width: 900, height: 700 });
    set('.tCard .ic', { left: 56, top: 56, width: 100, height: 100 });
    set('.tCard h3', { left: 56, top: 186, width: 790, fontSize: 52 });
    set('.tCard p', { left: 56, top: 332, width: 500, fontSize: 30 });
    set('.tCard .ph', { left: 600, top: 330, width: 250, height: 250 });
    set('.tCard .from', { left: 56, top: 500, fontSize: 32 });
    set('.tCard .badge', { left: 56, top: 552, fontSize: 82, padding: '4px 36px 10px' });
    set('#miniList', { left: 90, top: 1262, width: 900, height: 90 });
    set('.mini', { top: 0, width: 288, height: 90, padding: '0 12px 0 20px', fontSize: 0 });
    [0, 1, 2].forEach((i) => set(`#mn${i + 1}`, { left: i * 306 }));
    set('.mini .mt', { fontSize: 20, width: 130, lineHeight: 1.15 });
    set('.mini .pr', { fontSize: 28, padding: '8px 14px', whiteSpace: 'nowrap' });
  } else {
    set('#tarifHead', { left: 110, top: 220, gap: 14 });
    set('#th1', { fontSize: 68, padding: '8px 36px 12px' }); set('#th2', { fontSize: 32, padding: '8px 28px' });
    set('#cardStage', { left: 870, top: 180, width: 960, height: 660 });
    set('.tCard', { left: 0, top: 0, width: 960, height: 660 });
    set('.tCard .ic', { left: 52, top: 52, width: 92, height: 92 });
    set('.tCard h3', { left: 52, top: 170, width: 560, fontSize: 46 });
    set('.tCard p', { left: 52, top: 334, width: 540, fontSize: 25 });
    set('.tCard .ph', { left: 650, top: 52, width: 258, height: 320 });
    set('.tCard .from', { left: 52, top: 470, fontSize: 30 });
    set('.tCard .badge', { left: 52, top: 516, fontSize: 76, padding: '4px 34px 10px' });
    set('#miniList', { left: 110, top: 470, width: 640, height: 330 });
    set('.mini', { left: 0, width: 640, height: 92, padding: '0 14px 0 28px', fontSize: 27 });
    [0, 1, 2].forEach((i) => set(`#mn${i + 1}`, { top: i * 110 }));
    set('.mini .pr', { fontSize: 32, padding: '8px 22px', whiteSpace: 'nowrap' });
  }
  set('.tCard', { transformPerspective: 2200, transformOrigin: '50% 50%' });
  set('#tc1', { rotationX: -28, y: 120, opacity: 0 });
  set(['#tc2', '#tc3'], { rotationY: 90, opacity: 1 });
  set(['#th1', '#th2'], { x: pick(-700, -900) });
  set('.mini', { opacity: 0, y: 30 });

  /* ---------- S10 : facture ---------- */
  if (V) {
    set('#s10txt', { left: 80, top: 230, width: 920 });
    set('#printer', { left: 170, top: 640, width: 740, height: 64 });
    set('#invWrap', { left: 200, top: 680, width: 680, height: 760 });
  } else {
    set('#s10txt', { left: 110, top: 280, width: 700 });
    set('#printer', { left: 990, top: 120, width: 760, height: 62 });
    set('#invWrap', { left: 1030, top: 156, width: 680, height: 740 });
  }
  set('#invoice', { left: 0, top: 0, width: '100%', yPercent: -102 });
  set('#invoice .hdr', { padding: '26px 34px', fontSize: 30 });
  set('#invLogo', { height: 66 });
  set('#invoice .row', { padding: '26px 34px', fontSize: 27 });
  set('#invoice .row .v svg', { width: 34, height: 34 });
  set('#invoice .tot', { padding: '30px 34px', fontSize: 30 });
  set(['#s10t', '#s10s', '#printer'], { opacity: 0 });

  /* ---------- S11 ---------- */
  set('#s11t', pick({ left: 80, top: 300, width: 920, fontSize: 92 }, { left: 110, top: 330, width: 760, fontSize: 92, textAlign: 'left' }));
  set('#s11t', { opacity: 0 });

  /* ---------- S12 : CTA ---------- */
  set('#ctaWrap', pick({ left: 60, top: 600, width: 960, gap: 34 }, { left: 260, top: 190, width: 1400, gap: 30 }));
  set('.ctaBtn', { fontSize: pick(40, 38), padding: pick('18px 40px 18px 22px', '16px 38px 16px 20px') });
  set('.ctaBtn .ci', { display: 'grid', placeItems: 'center', width: pick(64, 58), height: pick(64, 58), borderRadius: '50%', background: 'rgba(255,255,255,.18)' });
  set('#ctaNum', { fontSize: pick(112, 150), marginTop: pick(10, 6), whiteSpace: 'nowrap' });
  set('#ctaNum .pfx', { fontSize: pick(46, 62), color: '#0B44B3' });
  set('#ctaLine', { width: pick(820, 1000), height: 14, borderRadius: 7, background: '#FDCB05', scaleX: 0, transformOrigin: '0% 50%' });
  set('#ctaAlt', { fontSize: pick(32, 30), marginTop: 6 });
  set(['#cb1', '#cb2', '#ctaNum .pfx', '.pair', '#ctaAlt', '#ctaAddr'], { opacity: 0, y: 30 });

  /* ---------- S13 ---------- */
  set('#endLogo', pick({ left: 190, top: 250, width: 700 }, { left: 150, top: 220, width: 680 }));
  set('#endSlogan', pick({ left: 30, top: 1385, width: 1020, fontSize: 58 }, { left: 110, top: 640, width: 860, fontSize: 52 }));
  set('#endNum', pick({ left: 315, top: 1500 }, { left: 300, top: 770 }));
  set('#endNum .mont', { fontSize: pick(46, 44) });
  set(['#endLogo', '#endSlogan', '#endNum'], { opacity: 0 });

  /* =====================================================================
     TIMELINE
     ===================================================================== */
  // --- dérive permanente du fond (jamais de plan statique)
  tl.to('#bg', { x: -88, y: -132, duration: DUR, ease: E.sine }, 0);
  tl.to('#blobA', { x: 260, y: 180, duration: DUR / 2, ease: E.sine, yoyo: true, repeat: 1 }, 0);
  tl.to('#blobB', { x: -220, y: -160, duration: DUR / 2, ease: E.sine, yoyo: true, repeat: 1 }, 0);

  // ================= S1 · accroche (0 → 6.06)
  tl.fromTo('#s1a', { opacity: 0.2, y: 34 }, { opacity: 1, y: 0, duration: 0.75, ease: E.o3 }, 0);
  tl.to(mapG, { ...cam(mid[0] + 4, mid[1] + 6, S1, A1[0], A1[1]), duration: t.voici - 0.1, ease: E.sine }, 0);
  tl.to('#pinKano .pinS', { scale: 1, duration: 0.7, ease: 'back.out(2)' }, 0);
  tl.to('#miniBox', { scale: 1, duration: 0.6, ease: E.back }, 0.35);
  tl.to('#pinMaradi .pinS', { scale: 1, duration: 0.6, ease: 'back.out(2)' }, 1.6);
  tl.fromTo('#s1b', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: E.o3 }, t.mais - 0.05);
  tl.fromTo('#s1chip', { opacity: 0, y: 24, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: E.backS }, t.dispo);
  // le carton suit le pointillé Kano -> Maradi (1.0 → à Maradi)
  const RS = D.routeSamples;
  const boxStart = 1.0, boxEnd = t.maradi1 + 0.1;
  tl.to('#miniBoxPos', { keyframes: { x: RS.map((p) => p[0]), y: RS.map((p) => p[1]), easeEach: 'none' }, duration: boxEnd - boxStart, ease: 'sine.inOut' }, boxStart);
  tl.to('.rd', { opacity: 1, scale: 1, duration: 0.25, ease: E.back, stagger: { each: (boxEnd - boxStart) / 27, ease: 'sine.inOut' } }, boxStart + 0.1);
  tl.to(['#s1a', '#s1b', '#s1chip'], { opacity: 0, y: -40, duration: 0.4, ease: E.in, stagger: 0.05 }, t.voici - 0.25);

  // ================= S2 · Hadiza (travelling caméra le long du pointillé)
  tl.to(mapG, { ...cam(P.maradi[0], P.maradi[1], S2, A2[0], A2[1]), duration: t.maradi1 - t.voici + 0.4, ease: E.io3 }, t.voici - 0.05);
  tl.to(mapG, { ...cam(P.maradi[0], P.maradi[1], S2 * 1.05, A2[0], A2[1]), duration: t.alors - (t.maradi1 + 0.35), ease: E.sine }, t.maradi1 + 0.35);
  tl.to('#pinMaradi .pinS', { scale: 1.35, duration: 0.25, ease: E.o2, yoyo: true, repeat: 1 }, t.maradi1);
  tl.fromTo('#hCard', { opacity: 0, y: 60, scale: 0.9, transformOrigin: pick('50% 0%', '0% 50%') }, { opacity: 1, y: 0, scale: 1, duration: 0.75, ease: E.backS }, t.hadiza - 0.1);
  tl.fromTo('#hPhoto img', { scale: 1.18 }, { scale: 1.02, duration: t.alors - t.hadiza, ease: E.sine }, t.hadiza);
  tl.fromTo(['#hKick', '#hName'], { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.5, ease: E.o3, stagger: 0.07 }, t.hadiza + 0.15);
  tl.fromTo('#s2c1', { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.55, ease: E.o3 }, t.marchandise - 0.1);
  tl.fromTo('#s2c2', { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.55, ease: E.o3 }, t.mais2);
  tl.to('#s2c2 .ic', { rotation: -12, duration: 0.18, ease: E.sine, yoyo: true, repeat: 3 }, t.quitter);
  tl.to(['#hCard', '#s2c1', '#s2c2'], { opacity: 0, y: 40, duration: 0.35, ease: E.in, stagger: 0.04 }, t.alors - 0.2);

  // ================= S2 → S3 · zoom-out de la carte vers le téléphone (raccord épingle)
  const sB = pick(2.94, 2.67);
  const pinScr = [A2[0], A2[1]];
  const startX = pinScr[0] - PH.cx, startY = pinScr[1] + 47.5 * sB - PH.cy;
  set('#phoneWrap', { x: startX, y: startY, scale: sB, opacity: 0 });
  tl.to('#phoneWrap', { opacity: 1, duration: 0.18, ease: 'none' }, t.alors - 0.12);
  tl.to('#mapLayer', { opacity: 0, duration: 0.3, ease: E.io }, t.alors - 0.02);
  tl.to('#phoneWrap', { x: 0, y: 0, scale: PH.s, duration: 0.95, ease: E.io3 }, t.alors);
  tl.fromTo('#locPin', { y: 0 }, { y: -18, duration: 0.3, ease: E.o2, yoyo: true, repeat: 1 }, t.alors + 0.2);
  tl.to('#scrCall', { opacity: 1, duration: 0.35, ease: E.io }, t.appelle);
  tl.fromTo('#scrCall .ava', { scale: 0.7 }, { scale: 1, duration: 0.6, ease: E.back }, t.appelle);
  tl.fromTo('#callPulse', { scale: 1, opacity: 0.9 }, { scale: 1.9, opacity: 0, duration: 0.9, ease: E.o2, repeat: 2 }, t.allo);
  tl.to('#phoneWrap', { y: -12, duration: 1.4, ease: E.sine, yoyo: true, repeat: 3 }, t.alors + 1.0);
  // texte étape 1
  tl.fromTo('#p1 > *', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.55, ease: E.o3, stagger: 0.07 }, t.alors + 0.35);

  // ================= traqueur
  tl.fromTo('#tracker', { opacity: 0, x: pick(-160, 0), y: pick(0, -120) }, { opacity: 1, x: 0, y: 0, duration: 0.6, ease: E.o3 }, t.alors + 0.25);
  const fillTo = (i, at) => tl.to('#tkFill', V ? { scaleY: i / 4, duration: 0.6, ease: E.io3 } : { scaleX: i / 4, duration: 0.6, ease: E.io3 }, at);
  function activate(i, at) {
    const s = `#tk${i}`;
    tl.to(s, { opacity: 1, duration: 0.25, ease: E.o2 }, at);
    tl.fromTo(`${s} .tk-dot`, { scale: 1 }, { scale: 1.22, duration: 0.22, ease: E.o2, yoyo: true, repeat: 1 }, at);
    tl.fromTo(`${s} .tk-ring`, { scale: 0.7, opacity: 1 }, { scale: 1.5, opacity: 0, duration: 0.7, ease: E.o2 }, at);
    tl.to(`${s} .ok`, { opacity: 1, duration: 0.3, ease: E.o2 }, at + 0.4);
    fillTo(i - 1, at);
  }
  activate(1, t.appelle);

  // ================= S4 · WhatsApp
  tl.to('#scrCall', { xPercent: -100, duration: 0.55, ease: E.io3 }, t.whatsapp - 0.2);
  tl.to('#scrWa', { xPercent: 0, duration: 0.55, ease: E.io3 }, t.whatsapp - 0.2);
  tl.to('#p1 > *', { opacity: 0, y: -24, duration: 0.3, ease: E.in, stagger: 0.04 }, t.whatsapp - 0.25);
  tl.fromTo('#p2 > .kicker, #p2 > .title', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.55, ease: E.o3, stagger: 0.07 }, t.whatsapp + 0.05);
  const bub = (s, at) => tl.to(s, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: E.backS }, at);
  bub('#b1', t.whatsapp + 0.2); bub('#b2', t.whatsapp + 0.75); bub('#b3', t.numero); bub('#b4', t.photo - 0.05); bub('#b5', t.colisDot + 0.05);
  tl.fromTo('#b4 .ph svg', { scale: 0.6, rotation: -8 }, { scale: 1, rotation: 0, duration: 0.6, ease: E.back }, t.photo);
  if (!V) {
    set(['#li1', '#li2', '#li3'], { opacity: 0, x: -30 });
    tl.to('#li1', { opacity: 1, x: 0, duration: 0.45, ease: E.o3 }, t.numero);
    tl.to('#li2', { opacity: 1, x: 0, duration: 0.45, ease: E.o3 }, t.photo);
    tl.to('#li3', { opacity: 1, x: 0, duration: 0.45, ease: E.o3 }, t.colisDot + 0.05);
  }
  activate(2, t.numero);

  // ================= S4 → S5 · la pastille 3 se transforme en scène plein écran
  tl.to('#tk3', { opacity: 1, duration: 0.2 }, t.notre - 0.45);
  tl.to('#morph', { scale: pick(31, 28), duration: 0.5, ease: E.in3 }, t.notre - 0.35);
  tl.set('#s5in', { opacity: 1 }, t.notre + 0.1);
  tl.to('#morph', { opacity: 0, duration: 0.3, ease: E.io }, t.notre + 0.12);
  tl.fromTo('#s5txt > *', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.55, ease: E.o3, stagger: 0.08 }, t.notre + 0.15);
  tl.fromTo('#s5agent', { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: E.back }, t.notre + 0.2);
  tl.fromTo('#s5drv', { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: E.back }, t.chauffeur3 - 0.15);
  tl.fromTo('#s5path', { strokeDashoffset: 0, opacity: 0 }, { strokeDashoffset: -360, opacity: 1, duration: t.recup - t.appelle2 + 0.8, ease: E.sine }, t.appelle2);
  tl.fromTo(['#wv1', '#wv2', '#wv3'], { scale: 1, opacity: 0.85 }, { scale: 2.1, opacity: 0, duration: 1.2, ease: E.o2, stagger: 0.4, repeat: 1 }, t.appelle2);
  tl.fromTo('#s5c1', { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.5, ease: E.backS }, t.chauffeur3 + 0.1);
  tl.fromTo('#s5c2', { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.5, ease: E.backS }, t.organise);
  tl.to('#s5drv', { y: -10, duration: 0.7, ease: E.sine, yoyo: true, repeat: 3 }, t.organise);
  activate(3, t.appelle2);

  // ================= S5 → S6 · le panneau marine remonte, le carton tombe
  tl.to('#s5in', { y: -H, duration: 0.55, ease: E.io3 }, t.le - 0.15);
  tl.set('#heroBoxPos', { opacity: 1 }, t.le - 0.1);
  tl.fromTo('#heroBox', { y: -pick(1200, 900) }, { y: 0, duration: 0.6, ease: 'back.out(1.1)' }, t.le - 0.1);
  tl.fromTo('#s6txt > *', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.55, ease: E.o3, stagger: 0.07 }, t.le + 0.05);
  tl.fromTo('#ck0', { opacity: 0, y: 26, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: E.back }, t.recupere);
  activate(4, t.recupere);
  // zoom-through dans le carton qui s'ouvre
  tl.to('#hb-lid', { y: -190, x: 40, rotation: -10, duration: 0.45, ease: E.o3 }, t.verifie - 0.15);
  tl.to('#hb-lid', { opacity: 0, duration: 0.2, ease: E.io }, t.verifie + 0.2);
  tl.to('#ck0', { opacity: 0, duration: 0.2, ease: E.io }, t.verifie);
  const inside = [HB.s6[0] - 300 + 300, HB.s6[1] - 300 + 225];
  tl.set('#heroBoxPos', { transformOrigin: '50% 37.5%' }, t.verifie - 0.02);
  tl.to('#heroBoxPos', { scale: HB.s6[2] * pick(24, 16), x: W / 2 - inside[0], y: H / 2 - inside[1], duration: 0.55, ease: E.in3 }, t.verifie + 0.05);
  tl.to('#zoomDark', { opacity: 1, duration: 0.12, ease: 'none' }, t.verifie + 0.48);
  tl.set('#heroBoxPos', { opacity: 0 }, t.verifie + 0.62);
  tl.set('#s6b', { opacity: 1 }, t.verifie + 0.6);
  tl.to('#zoomDark', { opacity: 0, duration: 0.35, ease: E.io }, t.verifie + 0.62);
  tl.fromTo('#agentCard', { scale: 1.25 }, { scale: 1, duration: 0.9, ease: E.out }, t.verifie + 0.6);
  tl.to('#ck1', { opacity: 1, x: 0, duration: 0.4, ease: E.o3 }, t.verifie + 0.65);
  tl.to('#ck2', { opacity: 1, x: 0, duration: 0.4, ease: E.o3 }, t.verifie + 0.78);
  tl.to('#ck3', { opacity: 1, x: 0, duration: 0.4, ease: E.backS }, t.reemballe);
  tl.fromTo('#ck3 .bx', { scale: 0.4 }, { scale: 1, duration: 0.45, ease: 'back.out(2.2)' }, t.reemballe + 0.05);
  tl.to('#agentCard', { y: -10, duration: 0.8, ease: E.sine, yoyo: true, repeat: 1 }, t.reemballe);

  // ================= S6 → S7 · le ruban adhésif traverse l'écran (wipe)
  tl.to('#tape', { x: 0, duration: 0.42, ease: E.in }, t.puis - 0.42);
  tl.set('#mapLayer', { opacity: 1 }, t.puis - 0.02);
  tl.set(['#s6a', '#heroBoxPos'], { opacity: 0 }, t.puis - 0.02);
  if (V) {
    tl.to('#tracker', { opacity: 0, x: -160, duration: 0.3, ease: E.in }, t.puis - 0.4);
    tl.to('#tracker', { opacity: 1, x: 0, duration: 0.5, ease: E.o3 }, t.hadiza2);
  }
  tl.set(['#pinKano', '#pinMaradi', '#miniBoxPos', '#routeTrack', '#route', '#routeDots', '#clNiger', '#clNigeria'], { opacity: 0 }, t.puis - 0.02);
  tl.set(['#lblNiger', '#lblNigeria', '#wide', '#dotsAll', '#arrows'], { opacity: 1 }, t.puis - 0.02);
  tl.set(mapG, cam(F7[0], F7[1], S7a, A7[0], A7[1]), t.puis - 0.02);
  tl.to('#tape', { x: TAPE_W * 1.08, duration: 0.5, ease: E.o2 }, t.puis + 0.02);
  tl.to(mapG, { ...cam(F7[0], F7[1], S7b, A7[0], A7[1]), duration: t.sousRegion - t.puis - 0.3, ease: E.sine }, t.puis);
  tl.to(mapG, { ...cam(F7[0] - 20, F7[1] + 10, S7c, A7[0], A7[1]), duration: 1.2, ease: E.io }, t.sousRegion - 0.35);
  tl.to('#wp-maradi .wpS', { scale: 1, duration: 0.6, ease: 'back.out(2)' }, t.puis + 0.2);
  tl.fromTo('#wp-maradi .wpRing', { scale: 0.6, opacity: 1, svgOrigin: '0 0' }, { scale: 2.2, opacity: 0, duration: 1.0, ease: E.o2, repeat: 2 }, t.livre);
  tl.fromTo('#s7c1', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, ease: E.backS }, t.livre);
  tl.fromTo('#delivCard', { opacity: 0, scale: 0.6, rotation: -6, transformOrigin: '0% 0%' }, { opacity: 1, scale: 1, rotation: 2, duration: 0.6, ease: E.backS }, t.livre + 0.05);
  tl.to('#delivCard', { opacity: 0, scale: 0.3, duration: 0.4, ease: E.in }, t.expedie - 0.15);
  tl.fromTo('#s7t', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.55, ease: E.o3 }, t.expedie);
  const draw = (k, at) => {
    tl.to(`#ar-${k}`, { strokeDashoffset: 0, duration: 0.55, ease: E.io }, at - 0.45);
    tl.to(`#ah-${k} path`, { scale: 1, duration: 0.3, ease: 'back.out(2.4)' }, at + 0.05);
    tl.to(`#wp-${k} .wpS`, { scale: 1, duration: 0.5, ease: 'back.out(2)' }, at);
  };
  draw('niamey', t.niamey); draw('zinder', t.zinder); draw('tahoua', t.tahoua); draw('agadez', t.agadez);
  tl.to('.xc', { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(2.4)', stagger: 0.09 }, t.toutes);
  tl.fromTo('#map-niger', { fill: '#FFFFFF' }, { fill: '#FFF4C2', duration: 0.5, ease: E.io, yoyo: true, repeat: 1 }, t.niger - 0.1);
  tl.fromTo('#s7s', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, ease: E.o3 }, t.toutes);
  const SUBK = ['sr_nigeria', 'sr_benin', 'sr_togo', 'sr_burkina', 'sr_mali', 'sr_tchad'];
  SUBK.forEach((k, i) => {
    const at = t.sousRegion - 0.45 + i * 0.1;
    tl.to(`.sd-${k}`, { opacity: 1, scale: 1, duration: 0.18, ease: E.o2, stagger: 0.025 }, at);
    tl.to(`#wp-${k} .wpS`, { scale: 1, duration: 0.45, ease: 'back.out(2)' }, at + 0.42);
  });

  // ================= S7 → S8 · la carte s'efface, le téléphone de Hadiza monte
  tl.to('#mapLayer', { opacity: 0, y: pick(260, 0), x: pick(0, -260), duration: 0.5, ease: E.in }, t.hadiza2 - 0.2);
  tl.to('#s7txt', { opacity: 0, y: -30, duration: 0.35, ease: E.in }, t.hadiza2 - 0.2);
  tl.fromTo('#phone2Wrap', { y: pick(1250, 0), x: pick(0, 900) }, { y: 0, x: 0, duration: 0.75, ease: E.o3 }, t.hadiza2 - 0.15);
  tl.fromTo('#s8ava', { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.6, ease: E.back }, t.hadiza2 + 0.15);
  tl.fromTo('#s8txt > *', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.55, ease: E.o3, stagger: 0.07 }, t.hadiza2 + 0.2);
  tl.to('#notif', { y: 0, opacity: 1, duration: 0.55, ease: E.backS }, t.confirmation);
  activate(5, t.confirmation);
  tl.to('#bigOk', { scale: 1, duration: 0.55, ease: 'back.out(2.2)' }, t.charge - 0.05);
  tl.fromTo('#bigOk svg', { rotation: -25 }, { rotation: 0, duration: 0.55, ease: E.backS }, t.charge - 0.05);
  tl.to('#phone2Wrap', { y: -14, duration: 1.2, ease: E.sine, yoyo: true, repeat: 1 }, t.confirmation + 0.4);
  // sortie S8 + traqueur
  tl.to(['#s8txt', '#s8ava'], { opacity: 0, y: -40, duration: 0.35, ease: E.in, stagger: 0.04 }, t.les - 0.3);
  tl.to('#phone2Wrap', { y: pick(-1300, 0), x: pick(0, 1000), duration: 0.5, ease: E.in3 }, t.les - 0.3);
  tl.to('#tracker', { opacity: 0, x: pick(-160, 0), y: pick(0, -130), duration: 0.45, ease: E.in }, t.les - 0.3);

  // ================= S9 · tarifs (flip 3D d'une carte à la suivante)
  tl.to('#th1', { x: 0, duration: 0.6, ease: E.out }, t.les);
  tl.to('#th2', { x: 0, duration: 0.6, ease: E.out }, t.les + 0.12);
  tl.to('#tc1', { rotationX: 0, y: 0, opacity: 1, duration: 0.7, ease: E.backS }, t.livraison - 0.15);
  const pulse = (s, at) => tl.fromTo(s, { scale: 1 }, { scale: 1.12, duration: 0.2, ease: E.o2, yoyo: true, repeat: 1, transformOrigin: '0% 50%' }, at);
  const mini = (s, at) => tl.to(s, { opacity: 1, y: 0, duration: 0.45, ease: E.backS }, at);
  pulse('#tc1 .badge', t.p1); mini('#mn1', t.p1 + 0.15);
  tl.to('#tc1', { rotationY: -90, duration: 0.28, ease: E.in }, t.expedition - 0.28);
  tl.to('#tc2', { rotationY: 0, duration: 0.42, ease: E.o3 }, t.expedition);
  pulse('#tc2 .badge', t.p2); mini('#mn2', t.p2 + 0.15);
  tl.to('#tc2', { rotationY: -90, duration: 0.28, ease: E.in }, t.ouverture - 0.28);
  tl.to('#tc3', { rotationY: 0, duration: 0.42, ease: E.o3 }, t.ouverture);
  pulse('#tc3 .badge', t.p3); mini('#mn3', t.p3 + 0.15);
  tl.fromTo('.tCard .ph img', { scale: 1.15 }, { scale: 1, duration: 3.5, ease: E.sine, stagger: 4 }, t.livraison);
  // sortie
  tl.to('#cardStage', { x: pick(-1100, -1300), duration: 0.5, ease: E.in3 }, t.et - 0.2);
  tl.to(['#tarifHead', '.mini'], { opacity: 0, y: -30, duration: 0.35, ease: E.in, stagger: 0.04 }, t.et - 0.25);

  // ================= S10 · facture
  tl.fromTo('#printer', { opacity: 0, y: -60 }, { opacity: 1, y: 0, duration: 0.4, ease: E.o3 }, t.et - 0.05);
  tl.to('#invoice', { yPercent: 0, duration: 1.1, ease: E.o2 }, t.facture - 0.15);
  tl.fromTo('#s10t', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, ease: E.o3 }, t.et + 0.05);
  tl.fromTo('#s10s', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, ease: E.o3 }, t.et + 0.2);
  tl.to(['#invWrap', '#printer'], { y: pick(1300, 1000), duration: 0.45, ease: E.in3 }, t.votre2 - 0.2);
  tl.to('#s10txt', { opacity: 0, y: -30, duration: 0.3, ease: E.in }, t.votre2 - 0.2);

  // ================= S11 · « Votre colis, on s'en occupe ! »
  tl.set('#hb-lid', { y: 0, x: 0, rotation: 0, opacity: 1 }, t.votre2 - 0.3);
  tl.set('#heroBoxPos', { ...placeBox(HB.s11), x: 0, y: 0, scale: HB.s11[2], transformOrigin: '50% 50%', opacity: 1 }, t.votre2 - 0.3);
  tl.fromTo('#heroBox', { y: -pick(1100, 800), scale: 0.6 }, { y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.4)', immediateRender: false }, t.votre2 - 0.15);
  tl.fromTo('#s11t', { opacity: 0, scale: 0.85, transformOrigin: pick('50% 50%', '0% 50%') }, { opacity: 1, scale: 1, duration: 0.55, ease: E.back }, t.votre2 + 0.05);
  tl.to('#heroBox', { rotation: 3, duration: 0.5, ease: E.sine, yoyo: true, repeat: 1 }, t.votre2 + 0.5);
  tl.to('#s11t', { opacity: 0, y: -30, duration: 0.3, ease: E.in }, t.appelez - 0.2);
  tl.to('#heroBoxPos', { opacity: 0, scale: HB.s11[2] * 0.5, duration: 0.35, ease: E.in }, t.appelez - 0.2);

  // ================= S12 · CTA
  tl.to('#cb1', { opacity: 1, y: 0, duration: 0.45, ease: E.backS }, t.appelez);
  tl.to('#cb2', { opacity: 1, y: 0, duration: 0.45, ease: E.backS }, t.ecrivez);
  tl.to('#ctaNum .pfx', { opacity: 1, y: 0, duration: 0.45, ease: E.o3 }, t.wa2);
  [['#n1', t.n74], ['#n2', t.n58], ['#n3', t.n18], ['#n4', t.n24]].forEach(([s, at], i) => {
    tl.to(s, { opacity: 1, y: 0, duration: 0.4, ease: 'back.out(2)' }, at - 0.05);
    tl.to('#ctaLine', { scaleX: (i + 1) / 4, duration: 0.4, ease: E.io3 }, at);
  });
  tl.to('#ctaAddr', { opacity: 1, y: 0, duration: 0.45, ease: E.backS }, t.n74 + 0.6);
  tl.to('#ctaAlt', { opacity: 1, y: 0, duration: 0.45, ease: E.o3 }, t.n58 + 0.6);
  tl.to('#ctaWrap', { y: -8, duration: 1.2, ease: E.sine, yoyo: true, repeat: 1 }, t.appelez + 1.0);
  tl.to('#ctaWrap', { opacity: 0, scale: 0.94, duration: 0.35, ease: E.in }, t.allo3 - 0.15);

  // ================= S13 · le carton se referme, logo, recul caméra
  tl.set('#hb-lid', { y: -200, x: 30, rotation: -8, opacity: 1 }, t.allo3 - 0.12);
  tl.set('#heroBoxPos', { ...placeBox(HB.s13), x: 0, y: 0, scale: HB.s13[2] * 1.15, opacity: 1 }, t.allo3 - 0.12);
  tl.set('#hb-g g[transform^="matrix"]', { opacity: 0 }, t.allo3 - 0.12);
  tl.fromTo('#heroBox', { y: pick(900, 700), scale: 0.8, rotation: 0 }, { y: 0, scale: 1, rotation: 0, duration: 0.5, ease: E.o3, immediateRender: false }, t.allo3 - 0.1);
  tl.to('#hb-lid', { y: 0, x: 0, rotation: 0, duration: 0.42, ease: 'back.out(1.3)' }, t.allo3 + 0.3);
  tl.to('#hb-g g[transform^="matrix"]', { opacity: 1, duration: 0.45, ease: E.o2 }, t.allo3 + 0.75);
  tl.to('#heroBoxPos', { scale: HB.s13[2] * 0.82, duration: DUR - t.allo3 - 0.1, ease: E.o2 }, t.allo3 + 0.1);
  tl.fromTo('#endLogo', { opacity: 0, y: -30, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: E.backS }, t.allo3 + 0.65);
  tl.fromTo('#endSlogan', { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.7, ease: E.o3 }, t.tous - 0.05);
  tl.fromTo('#endNum', { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.6, ease: E.backS }, t.tous + 0.8);
  tl.to('#endLogo', { y: -8, duration: 1.4, ease: E.sine, yoyo: true, repeat: 1 }, t.tous + 0.6);

  /* =====================================================================
     SOUS-TITRES MOT À MOT (zone sûre)
     ===================================================================== */
  const caps = q('#caps');
  set(caps, V ? { bottom: 272, height: 0 } : { bottom: 62, height: 0 });
  const capFs = pick(46, 40), capMax = pick(920, 1460), maxW = pick(5, 7);
  const capWords = words.filter((w) => w.start < t.tous - 0.02);
  const groups = []; let g = [];
  capWords.forEach((w, i) => {
    g.push(w);
    const nx = capWords[i + 1];
    const brk = /[.,?!:;]$/.test(w.text) || g.length >= maxW || !nx || nx.start - w.end > 0.45;
    if (brk) { groups.push(g); g = []; }
  });
  groups.forEach((grp, gi) => {
    const el = document.createElement('div');
    el.className = 'cap';
    el.style.fontSize = capFs + 'px';
    el.style.maxWidth = capMax + 'px';
    el.style.left = '50%';
    el.style.width = 'max-content';
    el.innerHTML = grp.map((w) => `<span class="w">${w.text.replace(/ /g, '&nbsp;')}</span>`).join(' ');
    caps.appendChild(el);
    const a = grp[0].start - 0.08;
    const nxt = groups[gi + 1];
    const b = nxt ? Math.min(nxt[0].start - 0.1, grp[grp.length - 1].end + 0.9) : Math.min(grp[grp.length - 1].end + 0.6, t.tous - 0.05);
    set(el, { xPercent: -50 });
    tl.fromTo(el, { opacity: 0, y: 14, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.16, ease: E.o2 }, a);
    tl.to(el, { opacity: 0, duration: 0.08, ease: 'power1.in' }, Math.max(a + 0.2, b));
    const spans = el.querySelectorAll('.w');
    grp.forEach((w, wi) => {
      tl.set(spans[wi], { color: '#FDCB05' }, w.start);
      tl.set(spans[wi], { color: '#FFFFFF' }, Math.max(w.start + 0.05, grp[wi + 1] ? grp[wi + 1].start : w.end + 0.15));
    });
  });

  window.__timelines['main'] = tl;
})();
