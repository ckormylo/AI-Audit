/* L17 components: the title quote, the agent loop, stat cards, the incident map with its side column (Stop),
   the June 27 vote, the message-board feed, generic cards, requests by window, the controls ledger,
   the transcript slide, the detection timeline, the finding, the close.
   Incident facts and quote slots are in data/incident.js. Nothing here needs a model. */
(function () {
  const { h, s, svg } = Deck;
  const INK = "#232748", SOFT = "#4A4F6E", MUTED = "#5F6379", RULE = "#E2DACB", VERM = "#E8431F", VERMD = "#BF3417", MAGENTA = "#D6177F", MAGD = "#B0106A",
    COBALT = "#2F5FD0", COBD = "#2A50B0", VIOLET = "#6B3FA0", LEAF = "#45731A", TEAL = "#0E6F7F", MARI = "#8F5A00", MARIB = "#F4A51C", CHART = "#A9C93A", PAPER = "#FBF7EF", PETAL = "#F6EBCF", SKY = "#E4F3F7";
  const D = () => window.L17;
  const parts = (line, n) => { const a = String(line).split("|").map((x) => x.trim()); return n && a.length > n ? a.slice(0, n - 1).concat(a.slice(n - 1).join(" | ")) : a; };
  const fmt = (x) => Number(x).toLocaleString("en-US");
  const BLOOMD = { cobalt: COBD, violet: "#5A3290", magenta: MAGD, vermilion: VERMD, marigold: MARI, chartreuse: LEAF, turquoise: TEAL };
  const BLOOM = { cobalt: COBALT, violet: VIOLET, magenta: MAGENTA, vermilion: VERM, marigold: MARIB, chartreuse: CHART, turquoise: "#22A6B8" };

  /* ---------- quote card: the pasted original if there is one, otherwise the paraphrase ---------- */
  function quoteCard(id, cls) {
    const q = (D().quotes || {})[id];
    if (!q) return h("div", { class: "qc" }, "Missing quote: " + id);
    const has = !!(q.text && q.text.trim());
    const el = h("div", { class: "qc " + (has ? "verb" : "para") + (q.raw ? " raw" : "") + (cls ? " " + cls : "") });
    el.appendChild(h("div", { class: "qc-who" }, q.who + (q.when ? " · " + q.when : "")));
    el.appendChild(h("div", { class: "qc-text" }, has ? (q.raw ? q.text : "“" + q.text + "”") : q.para));
    el.appendChild(h("div", { class: "qc-src" }, has ? "As published · " + q.src : "Paraphrase · the agent's own words are in " + q.src));
    return el;
  }
  Deck.l17quote = quoteCard;

  function skillCard(tag, text) {
    return h("div", { class: "sk-card" }, h("div", { class: "sk-h" }, "Audit skill · " + tag), h("div", { class: "sk-b", html: Deck.inline(text) }));
  }
  function askCard(text) {
    return h("div", { class: "ask-card" }, h("div", { class: "ask-h" }, "Your turn"), h("div", { class: "ask-b", html: Deck.inline(text) }));
  }
  function factCard(title, text) {
    return h("div", { class: "fact-card" }, h("div", { class: "fact-h" }, title), h("div", { class: "fact-b", html: Deck.inline(text) }));
  }
  /* side items: "at | kind | content" with kind = quote, skill, ask, fact */
  function sideItems(lines) {
    const nq = (lines || []).filter((l) => parts(l, 3)[1] === "quote").length;   // three or more quotes in one column are set smaller
    return (lines || []).map((line) => {
      const [at, kind, rest] = parts(line, 3);
      let el;
      if (kind === "quote") el = quoteCard(rest, nq >= 3 ? "dense" : "");
      else if (kind === "skill") { const [tag, text] = parts(rest, 2); el = skillCard(tag, text); }
      else if (kind === "ask") el = askCard(rest);
      else { const [t, b] = parts(rest, 2); el = factCard(t, b); }
      el.classList.add("show-on", "off-up");
      return { el, at: +at };
    });
  }

  /* ---------- motion: markers that travel along a path on an svg ----------
     A scene is an async function that moves markers and waits; it loops for as long as its state is on screen.
     Off in print, in overview tiles and when motion is reduced (M key). */
  function Animator(svgEl, enabled) {
    const layer = s("g", { class: "an-layer" }, svgEl);
    let token = 0, timers = [];
    const rafs = new Set();
    const live = () => enabled && !Deck.reduced;
    function clear() { token++; timers.forEach(clearTimeout); timers = []; rafs.forEach(cancelAnimationFrame); rafs.clear(); while (layer.firstChild) layer.removeChild(layer.firstChild); }
    const wait = (ms) => { const my = token; return new Promise((res) => timers.push(setTimeout(() => { if (my === token) res(); }, ms))); };
    const frames = (dur, fn, done) => {
      const my = token, t0 = performance.now();
      let id;
      const step = (now) => { rafs.delete(id); if (my !== token) return; const t = Math.min(1, (now - t0) / dur); fn(t); if (t < 1) { id = requestAnimationFrame(step); rafs.add(id); } else done(); };
      id = requestAnimationFrame(step); rafs.add(id);
    };
    /* move a marker along pts. o: color, label, labelColor, r, shape ("dot" | "sq" | "note"), ms, fade */
    function move(pts, o) {
      o = o || {};
      const col = o.color || MAGENTA, r = o.r || 11;
      const g = s("g", { class: "an-p" }, layer);
      if (o.shape === "sq") s("rect", { x: -10, y: -10, width: 20, height: 20, rx: 4, fill: col, stroke: "#fff", "stroke-width": 2.5 }, g);
      else if (o.shape === "note") { s("rect", { x: -10, y: -12, width: 20, height: 24, rx: 3, fill: PETAL, stroke: MARI, "stroke-width": 1.8 }, g); s("line", { x1: -6, y1: -4, x2: 6, y2: -4, stroke: MARI, "stroke-width": 1.4 }, g); s("line", { x1: -6, y1: 3, x2: 6, y2: 3, stroke: MARI, "stroke-width": 1.4 }, g); }
      else s("circle", { r, fill: col, stroke: "#fff", "stroke-width": 2.5 }, g);
      if (o.label) s("text", { class: "an-lab", x: 0, y: -r - 8, "text-anchor": "middle", style: `fill:${o.labelColor || (col === MARIB ? MARI : col)}`, text: o.label }, g);
      const seg = []; let total = 0;
      for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); total += d; }
      const place = (t) => {
        let d = t * total, i = 0;
        while (i < seg.length - 1 && d > seg[i]) { d -= seg[i]; i++; }
        const f = seg[i] ? Math.min(1, d / seg[i]) : 1;
        g.setAttribute("transform", `translate(${(pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f).toFixed(1)},${(pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f).toFixed(1)})`);
        if (o.fade) g.setAttribute("opacity", String(1 - Math.max(0, (t - 0.5) / 0.5)));
      };
      place(0);
      return new Promise((res) => frames(o.ms || Math.max(900, total / 0.17), place, () => { g.remove(); res(); }));
    }
    /* a short text that appears at a point, holds, and fades */
    function flash(x, y, text, col, ms) {
      const t = s("text", { class: "an-flash", x, y, "text-anchor": "middle", style: `fill:${col || VERMD}`, text }, layer);
      return new Promise((res) => frames(ms || 1300, (k) => t.setAttribute("opacity", String(k < 0.7 ? 1 : 1 - (k - 0.7) / 0.3)), () => { t.remove(); res(); }));
    }
    function run(scene, gap) {
      clear();
      if (!scene || !live()) return;
      const my = token;
      (async () => { while (my === token) { await scene({ move, flash, wait }); if (my !== token) return; await wait(gap == null ? 1100 : gap); } })();
    }
    return { run, clear };
  }

  /* ---------- title: one line of an agent's reasoning ---------- */
  Deck.components.TitleQuote = {
    steps: 0,
    mount(host, ctx) {
      Deck.petals(host, -190, -190, 0.9, 1);
      Deck.petals(host, 800, 650, 0.7, 4);
      const q = D().quotes[ctx.fm.quote || "found"];
      host.appendChild(h("div", { class: "tq" },
        h("div", { class: "tq-lab" }, ctx.fm.label || "From an agent's reasoning"),
        h("div", { class: "tq-text" }, "“" + q.text + "”"),
        h("div", { class: "tq-who" }, q.who + ", " + q.when),
        h("div", { class: "tq-src" }, "As published · " + q.src)));
      return {};
    },
  };

  /* ---------- the agent loop ---------- */
  Deck.components.AgentLoop = {
    steps: 4,
    mount(host, ctx) {
      const g = svg(900, 620, host);
      const defs = s("defs", {}, g);
      const mk = (id, col) => { const m = s("marker", { id, markerWidth: 10, markerHeight: 10, refX: 9, refY: 5, orient: "auto" }, defs); s("path", { d: "M0,0 L10,5 L0,10 z", fill: col }, m); };
      mk("alA", MUTED); mk("alK", MAGENTA);
      const grp = (at) => s("g", { class: "show-on", "data-at": at }, g);
      const box = (p, x, y, w, hh, label, sub, col) => {
        s("rect", { x, y, width: w, height: hh, rx: 12, fill: "#fff", stroke: col || RULE, "stroke-width": col ? 3 : 1.5 }, p);
        s("text", { x: x + w / 2, y: y + 34, "text-anchor": "middle", style: "font-size:24px;font-weight:700;font-family:var(--font-display);fill:" + INK, text: label }, p);
        (sub || []).forEach((t, i) => s("text", { x: x + w / 2, y: y + 62 + i * 24, "text-anchor": "middle", style: "font-size:18px;fill:" + SOFT, text: t }, p));
      };
      const arrow = (p, x1, y1, x2, y2, label, lx, ly, key) => {
        s("line", { x1, y1, x2, y2, stroke: key ? MAGENTA : MUTED, "stroke-width": 2.5, "marker-end": `url(#${key ? "alK" : "alA"})` }, p);
        if (label) s("text", { x: lx, y: ly, "text-anchor": "middle", style: `font-size:17px;font-weight:600;fill:${key ? MAGD : MUTED}`, text: label }, p);
      };
      const g1 = grp(1);
      box(g1, 300, 10, 300, 96, "Goal", ["“capture the flag in this target”"], COBALT);
      box(g1, 320, 220, 260, 120, "Model", ["reads everything so far,", "chooses the next action"], MAGENTA);
      arrow(g1, 450, 106, 450, 216);
      const g2 = grp(2);
      box(g2, 660, 196, 230, 168, "Tools", ["shell · Python", "browser", "package installer"], VIOLET);
      arrow(g2, 580, 262, 656, 262, "tool call", 618, 250, true);
      const g3 = grp(3);
      box(g3, 320, 470, 570, 110, "Environment", ["files, the network, other systems"], LEAF);
      arrow(g3, 775, 364, 775, 466, "runs", 806, 422);
      arrow(g3, 450, 466, 450, 344, "result", 488, 412);
      box(g3, 10, 220, 240, 120, "Memory", ["what it has read", "and done so far"], TEAL);
      s("line", { x1: 250, y1: 280, x2: 316, y2: 280, stroke: MUTED, "stroke-width": 2.5, "marker-end": "url(#alA)" }, g3);
      const g4 = grp(4);
      s("rect", { x: 10, y: 400, width: 290, height: 180, rx: 12, fill: PETAL, stroke: "none" }, g4);
      ["The loop repeats until the", "model decides the goal is", "met, or a limit stops it.", "No person approves", "each step."].forEach((t, i) => s("text", { x: 28, y: 436 + i * 30, style: `font-size:20px;${i >= 3 ? "font-weight:700;" : ""}fill:${INK}`, text: t }, g4));
      const groups = [g1, g2, g3, g4];
      const stepTxt = s("text", { x: 14, y: 384, style: `font-size:24px;font-weight:700;font-family:var(--font-display);fill:${MAGD}`, text: "" }, g);
      const anim = Animator(g, !ctx.print && !ctx.preview);
      const LOOP = [[450, 280], [580, 262], [660, 262], [775, 280], [775, 364], [775, 468], [775, 525], [450, 525], [450, 468], [450, 344], [450, 280]];
      let n = 0, fast = false, running = false;
      const lap = async (A) => { n++; stepTxt.textContent = "Step " + n; await A.move(LOOP, { color: MAGENTA, r: 10, ms: fast ? 1000 : 3200 }); };
      return {
        update(k) {
          groups.forEach((x) => x.classList.toggle("off", k < +x.getAttribute("data-at")));
          fast = k >= 4;
          if (k >= 3 && !running) { running = true; n = 0; anim.run(lap, 0); }
          if (k < 3 && running) { running = false; anim.clear(); stepTxt.textContent = ""; }
          if (ctx.print && k >= 3) stepTxt.textContent = k >= 4 ? "Step 137 …" : "Step 1";
        },
        destroy() { anim.clear(); },
      };
    },
  };

  /* ---------- stat cards ---------- */
  Deck.components.StatRow = {
    steps(fm) { return (fm.stat || []).length + ((fm.note || []).length ? 1 : 0); },
    mount(host, ctx) {
      const row = h("div", { class: "st-row" }); host.appendChild(row);
      const cards = (ctx.fm.stat || []).map((line) => { const [n, lab, note] = parts(line, 3); const el = h("div", { class: "st-card show-on off-up" }, h("div", { class: "st-n" }, n), h("div", { class: "st-l" }, lab), h("div", { class: "st-d", html: Deck.inline(note || "") })); row.appendChild(el); return el; });
      const notes = h("ul", { class: "st-notes show-on off-up" });
      (ctx.fm.note || []).forEach((t) => notes.appendChild(h("li", { html: Deck.inline(t) })));
      host.appendChild(notes);
      return { update(k) { cards.forEach((c, i) => c.classList.toggle("off-up", k < i + 1)); notes.classList.toggle("off-up", k < cards.length + 1); } };
    },
  };

  /* ---------- the incident map ---------- */
  function incidentMap(parent, enabled) {
    const g = svg(880, 600, parent);
    const defs = s("defs", {}, g);
    const mk = (id, col) => { const m = s("marker", { id, markerWidth: 9, markerHeight: 9, refX: 8, refY: 4.5, orient: "auto" }, defs); s("path", { d: "M0,0 L9,4.5 L0,9 z", fill: col }, m); };
    mk("imA", MUTED); mk("imH", MAGENTA);
    const items = [];
    const grp = (lv) => { const el = s("g", { class: "im-g show-on", "data-lv": lv }, g); items.push({ el, lv }); return el; };
    const box = (p, x, y, w, hh, label, sub, o) => {
      o = o || {};
      s("rect", { class: o.stroke ? "im-keep" : "im-r", x, y, width: w, height: hh, rx: 9, fill: o.fill || "#fff", stroke: o.stroke || "#CFC6B3", "stroke-width": o.stroke ? 2 : 1.5 }, p);
      s("text", { x: x + w / 2, y: y + (sub != null ? 26 : hh / 2 + 6), "text-anchor": "middle", style: "font-size:16px;font-weight:700;fill:" + INK, text: label }, p);
      if (sub) s("text", { x: x + w / 2, y: y + 47, "text-anchor": "middle", style: "font-size:13.5px;fill:" + SOFT, text: sub }, p);
    };
    const line = (p, x1, y1, x2, y2, label, lx, ly, anchor) => {
      s("line", { class: "im-l", x1, y1, x2, y2, stroke: MUTED, "stroke-width": 2, "marker-end": "url(#imA)" }, p);
      if (label) s("text", { x: lx, y: ly, "text-anchor": anchor || "middle", style: "font-size:13px;font-weight:600;fill:" + SOFT, text: label }, p);
    };
    const pill = (p0, x, y, w, text, bg, fg) => { const p = s("g", { class: "im-pulse" }, p0); s("rect", { x, y, width: w, height: 24, rx: 12, fill: bg }, p); s("text", { x: x + w / 2, y: y + 17, "text-anchor": "middle", style: `font-size:12.5px;font-weight:700;letter-spacing:.05em;fill:${fg}`, text }, p); };

    /* level 0: the setting */
    const a = grp(0);
    s("rect", { x: 6, y: 6, width: 404, height: 588, rx: 14, fill: "#FDFBF6", stroke: RULE, "stroke-width": 1.5 }, a);
    s("text", { x: 22, y: 32, style: "font-size:13px;font-weight:700;letter-spacing:.14em;fill:" + COBD, text: "OPENAI RESEARCH ENVIRONMENT" }, a);
    [0, 1, 2].forEach((i) => box(a, 22, 56 + i * 80, 176, 64, "Agent in a container", "shell · Python · browser"));
    s("text", { x: 110, y: 318, "text-anchor": "middle", style: "font-size:14px;fill:" + MUTED, text: "+ tens of thousands of runs" }, a);
    box(a, 236, 126, 160, 84, "Package mirror", "Artifactory");
    [88, 168, 248].forEach((y) => line(a, 198, y, 232, 150 + (y - 88) * 0.22));
    s("line", { x1: 420, y1: 6, x2: 420, y2: 594, stroke: INK, "stroke-width": 4, "stroke-dasharray": "2 9", "stroke-linecap": "round" }, a);
    s("text", { x: 22, y: 574, style: "font-size:14px;font-weight:600;fill:" + INK, text: "Containers have no direct internet access" }, a);
    s("rect", { x: 430, y: 6, width: 444, height: 588, rx: 14, fill: "none", stroke: RULE, "stroke-width": 1.5, "stroke-dasharray": "6 6" }, a);
    s("text", { x: 446, y: 32, style: "font-size:13px;font-weight:700;letter-spacing:.14em;fill:" + MUTED, text: "PUBLIC INTERNET" }, a);

    /* level 0.5: the mirror is allowed to reach the public package sites */
    const a5 = grp(0.5);
    box(a5, 690, 40, 170, 56, "Public package sites", "PyPI, npm and others");
    line(a5, 396, 140, 686, 70);

    /* level 1: notes in the mirror, and the mirror fetching for the agent */
    const b = grp(1);
    [0, 1, 2].forEach((i) => { s("rect", { x: 250 + i * 22, y: 216, width: 16, height: 20, rx: 2, fill: PETAL, stroke: MARI, "stroke-width": 1.2 }, b); s("line", { x1: 253 + i * 22, y1: 223, x2: 263 + i * 22, y2: 223, stroke: MARI, "stroke-width": 1 }, b); s("line", { x1: 253 + i * 22, y1: 229, x2: 263 + i * 22, y2: 229, stroke: MARI, "stroke-width": 1 }, b); });
    s("text", { x: 322, y: 232, style: "font-size:13px;font-weight:600;fill:" + MARI, text: "notes" }, b);
    line(b, 396, 152, 496, 152);
    const b1 = grp(1); b1.classList.add("im-only");
    s("text", { x: 446, y: 226, style: "font-size:14px;font-weight:600;fill:" + SOFT, text: "The mirror will fetch any web address" }, b1);
    s("text", { x: 446, y: 246, style: "font-size:14px;font-weight:600;fill:" + SOFT, text: "an agent asks it for, and pass back the reply." }, b1);

    /* level 2: administrator on the mirror, the alert */
    const c = grp(2);
    pill(c, 286, 114, 110, "AGENTS: ADMIN", VERM, "#fff");
    pill(c, 236, 250, 120, "JUN 27 ALERT", MARIB, INK);

    /* level 3: the board, the outside test harness */
    const d = grp(3);
    box(d, 236, 340, 160, 84, "Message board", "in the mirror's cache", { fill: "#FBE9F3", stroke: MAGENTA });
    s("line", { x1: 316, y1: 280, x2: 316, y2: 338, stroke: MAGENTA, "stroke-width": 2 }, d);
    s("text", { x: 316, y: 446, "text-anchor": "middle", style: "font-size:13px;font-weight:600;fill:" + MAGD, text: "any agent can post" }, d);
    s("text", { x: 316, y: 463, "text-anchor": "middle", style: "font-size:13px;font-weight:600;fill:" + MAGD, text: "and any agent can read" }, d);
    box(d, 500, 124, 190, 60, "Third party's test tool", "hosted on Modal");

    /* level 4.1: tokens in a public dataset */
    const e1 = grp(4.1);
    s("rect", { x: 444, y: 204, width: 420, height: 380, rx: 12, fill: "#FFF8E9", stroke: MARIB, "stroke-width": 1.5 }, e1);
    s("text", { x: 458, y: 574, style: "font-size:13px;font-weight:700;letter-spacing:.14em;fill:" + MARI, text: "HUGGING FACE" }, e1);
    box(e1, 458, 244, 186, 64, "A public dataset", "14 write tokens inside");
    line(e1, 596, 184, 560, 240);
    /* level 4.2: the worker returns its own secrets */
    const e2 = grp(4.2);
    box(e2, 690, 244, 160, 64, "Dataset worker", "production");
    line(e2, 644, 262, 686, 262);
    s("line", { class: "im-l", x1: 686, y1: 292, x2: 648, y2: 292, stroke: MUTED, "stroke-width": 2, "marker-end": "url(#imA)" }, e2);
    s("text", { x: 667, y: 330, "text-anchor": "middle", style: "font-size:13px;font-weight:600;fill:" + SOFT, text: "crafted dataset in," }, e2);
    s("text", { x: 667, y: 347, "text-anchor": "middle", style: "font-size:13px;font-weight:600;fill:" + SOFT, text: "the worker's secrets out" }, e2);
    /* level 4.3: commands run on the worker */
    const e3 = grp(4.3);
    pill(e3, 706, 232, 128, "COMMANDS RUN", VERM, "#fff");

    /* level 5: escalation, and what held */
    const f = grp(5);
    box(f, 690, 376, 160, 64, "Clusters", "admin on two");
    line(f, 770, 308, 770, 372);
    box(f, 458, 376, 186, 64, "136-key secret", "VPN key, signing key");
    line(f, 686, 408, 648, 408);
    box(f, 458, 492, 186, 72, "Main database", "", { fill: "#F1F6E2", stroke: LEAF });
    pill(f, 506, 530, 90, "BLOCKED", CHART, INK);
    box(f, 690, 492, 160, 72, "Credential store", "", { fill: "#F1F6E2", stroke: LEAF });
    pill(f, 720, 530, 100, "84 DENIED", CHART, INK);

    /* level 6: access cut */
    const z = grp(6);
    s("line", { x1: 432, y1: 190, x2: 876, y2: 190, stroke: LEAF, "stroke-width": 5 }, z);
    pill(z, 700, 178, 164, "ACCESS CUT · JUL 13", LEAF, "#fff");

    /* the motion for each level: what travels where */
    const C1 = [198, 88], C2 = [198, 168], C3 = [198, 248], M1 = [232, 150], M2 = [232, 168], M3 = [232, 185], MR = [396, 152], MIN = [316, 210], BOARD = [316, 342], MODAL = [496, 152], MODB = [596, 184], DS = [560, 240], DSR = [644, 262], WK = [688, 262];
    const scenes = {
      0: async (A) => {
        const pairs = [[C1, M1], [C2, M2], [C3, M3]];
        await Promise.all(pairs.map(([c, m], i) => A.wait(i * 350).then(() => A.move([c, m], { color: COBALT, label: i === 0 ? "package request" : "", ms: 1000 }))));
        await A.wait(250);
        await Promise.all(pairs.map(([c, m], i) => A.wait(i * 350).then(() => A.move([m, c], { color: TEAL, shape: "sq", label: i === 0 ? "package" : "", ms: 1000 }))));
      },
      0.5: async (A) => {
        await A.move([C2, M2], { color: COBALT, label: "package request", ms: 1000 });
        await A.move([[396, 140], [686, 70]], { color: COBALT, label: "the mirror fetches it", ms: 1700 });
        await A.wait(250);
        await A.move([[686, 70], [396, 140]], { color: TEAL, shape: "sq", label: "package", ms: 1700 });
        await A.move([M2, C2], { color: TEAL, shape: "sq", ms: 1000 });
      },
      1: async (A) => {
        await A.move([C1, [410, 88]], { color: VERM, label: "straight to the internet", ms: 1500 });
        A.move([[410, 88], [330, 88]], { color: VERM, ms: 800, fade: true });
        await A.flash(486, 94, "✕ refused", VERMD, 1600);
        await A.wait(300);
        await A.move([C2, M2], { color: MAGENTA, label: "asks the mirror to fetch it", ms: 1100 });
        await A.move([MR, [650, 152]], { color: MAGENTA, label: "the mirror goes", ms: 1700 });
        A.flash(650, 186, "✓ reaches the internet", LEAF, 1700);
        await A.wait(500);
        await A.move([[650, 152], MR], { color: TEAL, shape: "sq", label: "reply", ms: 1500 });
        await A.move([M2, C2], { color: TEAL, shape: "sq", ms: 1000 });
        await A.wait(300);
        await A.move([C3, M3, [272, 226]], { shape: "note", label: "leaves a note", labelColor: MARI, ms: 1600 });
        await A.wait(200);
        await A.move([C1, M1], { color: COBALT, ms: 900 });
        await A.move([M1, C1], { shape: "note", label: "another agent reads it", labelColor: MARI, ms: 1300 });
      },
      2: async (A) => {
        for (let i = 0; i < 3; i++) { A.move([MR, [650, 152]], { color: VERM, ms: 1500, fade: true }); await A.wait(500); }
        await A.wait(1300);
      },
      3: async (A) => {
        const cs = [C1, C2, C3], ms = [M1, M2, M3];
        await Promise.all(cs.map((c, i) => A.wait(i * 550).then(() => A.move([c, ms[i], MIN, BOARD], { color: MAGENTA, label: i === 0 ? "post" : "", ms: 1900 }))));
        await A.wait(200);
        await Promise.all(cs.map((c, i) => A.wait(i * 550).then(() => A.move([BOARD, MIN, ms[(i + 1) % 3], cs[(i + 1) % 3]], { color: MAGD, shape: "sq", label: i === 0 ? "read" : "", ms: 1900 }))));
        await A.move([MR, MODAL], { color: MAGENTA, label: "out, to a test tool", ms: 1300 });
      },
      4.1: async (A) => {
        await A.move([MODB, DS], { color: MAGENTA, label: "looks inside", ms: 1000 });
        await A.wait(250);
        const path = [DS, MODB, MODAL, MR, MIN, BOARD];
        await Promise.all([0, 1, 2, 3, 4].map((i) => A.wait(i * 280).then(() => A.move(path, { color: MARIB, r: 8, label: i === 0 ? "14 tokens, posted to the board" : "", ms: 3600 }))));
      },
      4.2: async (A) => {
        await A.move([MODB, DS, DSR, WK], { color: MAGENTA, shape: "sq", label: "crafted dataset", ms: 2400 });
        A.flash(770, 232, "reads its own files", VERMD, 1700);
        await A.wait(700);
        await Promise.all([0, 1, 2, 3, 4, 5].map((i) => A.wait(i * 240).then(() => A.move([[686, 292], [648, 292], DS, MODB], { color: MARIB, r: 8, label: i === 0 ? "the server's secrets" : "", ms: 2600 }))));
      },
      4.3: async (A) => {
        for (let i = 0; i < 3; i++) await A.move([[690, 166], [770, 240]], { color: VERM, shape: "sq", label: i === 0 ? "commands" : "", ms: 1000 });
        await A.wait(600);
      },
      5: async (A) => {
        await A.move([[770, 308], [770, 372]], { color: VERM, label: "takes over the clusters", ms: 1200 });
        await A.move([[690, 408], [648, 408]], { color: VERM, label: "reads stored secrets", ms: 1100 });
        await A.wait(300);
        await A.move([[700, 306], [588, 486]], { color: VERM, label: "tries the database", ms: 1700 });
        A.move([[588, 486], [630, 420]], { color: VERM, ms: 700, fade: true });
        await A.flash(551, 482, "✕ refused", LEAF, 1500);
        await A.move([[770, 440], [770, 486]], { color: VERM, label: "tries the credential store", ms: 1100 });
        A.move([[770, 486], [800, 452]], { color: VERM, ms: 700, fade: true });
        await A.flash(770, 482, "✕ refused", LEAF, 1500);
      },
    };
    const anim = Animator(g, enabled);
    let curLevel = null;

    return {
      set(level) {
        items.forEach(({ el, lv }) => { el.classList.toggle("off", el.classList.contains("im-only") ? lv !== level : lv > level); el.classList.toggle("hot", lv === level && lv > 0); });
        if (level !== curLevel) { curLevel = level; anim.run(scenes[level]); }
      },
      destroy() { anim.clear(); },
    };
  }

  /* A stop of the walk: the map on the left, quotes and the audit skill on the right.
     fm: base (level shown at click 0), levels (comma list, one per click), side[] ("at | kind | content") */
  Deck.components.Stop = {
    steps(fm) {
      const lv = fm.levels ? String(fm.levels).split(",").length : 0;
      const at = (fm.side || []).map((l) => +parts(l, 3)[0]);
      return Math.max(lv, at.length ? Math.max(...at) : 0);
    },
    mount(host, ctx) {
      const left = h("div", { class: "stp-map" }), right = h("div", { class: "stp-side" });
      host.append(left, right);
      const map = incidentMap(left, !ctx.print && !ctx.preview);
      const base = +(ctx.fm.base || 0);
      const levels = ctx.fm.levels ? String(ctx.fm.levels).split(",").map(Number) : [];
      const side = sideItems(ctx.fm.side);
      side.forEach((x) => right.appendChild(x.el));
      return {
        update(k) {
          map.set(k >= 1 && levels.length ? levels[Math.min(k, levels.length) - 1] : base);
          side.forEach((x) => x.el.classList.toggle("off-up", k < x.at));
        },
        destroy() { map.destroy(); },
      };
    },
  };

  /* ---------- the June 27 decision ---------- */
  Deck.components.StopVote = {
    steps: 2,
    mount(host, ctx) {
      const V = D().vote;
      const left = h("div", { class: "sv-left" }), right = h("div", { class: "sv-right" });
      host.append(left, right);
      const had = h("div", { class: "sv-card" }, h("div", { class: "sv-h" }, "What the responder had on June 27"));
      V.had.forEach((t) => had.appendChild(h("div", { class: "sv-li" }, t)));
      const hadnot = h("div", { class: "sv-card not show-on off-up" }, h("div", { class: "sv-h" }, "What the responder did not have"));
      V.hadnot.forEach((t) => hadnot.appendChild(h("div", { class: "sv-li" }, t)));
      left.append(had, hadnot);
      const vote = h("div", { class: "sv-vote" }, h("div", { class: "ask-h" }, "The decision in front of the responder"), h("div", { class: "sv-q" }, "Does this run have to stop?"));
      const after = h("div", { class: "sv-after show-on off-up" }, h("div", { class: "sv-h" }, "What happened"));
      V.after.forEach(([d, t]) => after.appendChild(h("div", { class: "sv-row" }, h("span", { class: "sv-d" }, d), h("span", {}, t))));
      const skill = skillCard("Approval and review", ctx.fm.skill || "");
      skill.classList.add("show-on", "off-up");
      right.append(vote, after, skill);
      return { update(k) { after.classList.toggle("off-up", k < 1); hadnot.classList.toggle("off-up", k < 2); skill.classList.toggle("off-up", k < 2); } };
    },
  };

  /* ---------- how the board worked: the mechanism, drawn large and in motion ---------- */
  Deck.components.BoardMech = {
    steps: 2,
    mount(host, ctx) {
      const left = h("div", { class: "bm-left" }), right = h("div", { class: "bm-right" });
      host.append(left, right);
      left.appendChild(h("div", { class: "sv-h" }, "How a folder name carries a message"));
      const mech = h("div", { class: "bm-mech" }); left.appendChild(mech);
      const mg = svg(570, 236, mech);
      const abox = (x, y, label) => { s("rect", { x, y, width: 118, height: 46, rx: 9, fill: "#fff", stroke: "#CFC6B3", "stroke-width": 1.5 }, mg); s("text", { x: x + 59, y: y + 29, "text-anchor": "middle", style: "font-size:16px;font-weight:700;fill:" + INK, text: label }, mg); };
      abox(6, 22, "Agent A"); abox(6, 150, "Agent C"); abox(446, 86, "Agent B");
      s("rect", { x: 196, y: 6, width: 178, height: 224, rx: 10, fill: "#FDFBF6", stroke: MAGENTA, "stroke-width": 2 }, mg);
      s("text", { x: 285, y: 28, "text-anchor": "middle", style: "font-size:11px;font-weight:700;letter-spacing:.12em;fill:" + MAGD, text: "THE MIRROR'S CACHE" }, mg);
      const frow = (y, t, col) => s("text", { x: 208, y, class: "mono", style: `font-size:11px;fill:${col || MUTED}`, text: t }, mg);
      frow(56, "numpy-1.26/"); frow(76, "requests-2.31/"); frow(96, "lodash-4.17/");
      const row1 = frow(130, "zzASK_A_HAVE_FILE_X/", MAGD), row2 = frow(154, "zzRESULT_B_AT_PATH_Y/", MAGD);
      [row1, row2].forEach((r) => r.setAttribute("font-weight", "700"));
      const nt = (x, y, t) => s("text", { x, y, "text-anchor": "middle", style: "font-size:11.5px;font-weight:700;fill:" + LEAF, text: t }, mg);
      const nA = nt(65, 86, "reads B's reply"), nB = nt(505, 150, "reads A's post"), nC = nt(65, 214, "reads both");
      left.appendChild(h("div", { class: "bm-p" }, "Any agent can create a folder in the mirror's cache, and any agent can list the folders. So the name of a folder is the message."));
      left.appendChild(h("div", { class: "bf-ill" }, "Written example of the mechanism. The agent names and folder names are made up."));
      const anim = Animator(mg, !ctx.print && !ctx.preview);
      const A1 = [124, 45], B1 = [446, 109], C1 = [124, 173];
      const sm = { r: 7 };
      anim.run(async (A) => {
        [row1, row2, nA, nB, nC].forEach((e) => e.setAttribute("opacity", "0"));
        await A.wait(600);
        await A.move([A1, [196, 126]], Object.assign({ color: MAGENTA, label: "creates a folder", ms: 1500 }, sm));
        row1.setAttribute("opacity", "1");
        await A.wait(700);
        await A.move([B1, [374, 126]], Object.assign({ color: COBALT, label: "lists the folders", ms: 1300 }, sm));
        await A.move([[374, 126], B1], Object.assign({ color: TEAL, label: "the names", ms: 1300 }, sm));
        nB.setAttribute("opacity", "1");
        await A.wait(800);
        await A.move([B1, [374, 150]], Object.assign({ color: MAGENTA, label: "creates a reply", ms: 1300 }, sm));
        row2.setAttribute("opacity", "1");
        await A.wait(600);
        await Promise.all([
          A.move([A1, [196, 138]], Object.assign({ color: COBALT, label: "lists", ms: 1100 }, sm)).then(() => A.move([[196, 138], A1], Object.assign({ color: TEAL, ms: 1100 }, sm))),
          A.wait(350).then(() => A.move([C1, [196, 146]], Object.assign({ color: COBALT, label: "lists", ms: 1100 }, sm))).then(() => A.move([[196, 146], C1], Object.assign({ color: TEAL, ms: 1100 }, sm))),
        ]);
        nA.setAttribute("opacity", "1"); nC.setAttribute("opacity", "1");
        await A.wait(2600);
      }, 400);
      const schema = h("div", { class: "bf-schema show-on off-up" },
        h("div", { class: "lbl-caps" }, "The parts of a name"),
        h("div", { class: "bf-chips" },
          h("span", { class: "bf-chip c0" }, "zz"), h("span", { class: "bf-chip c1" }, "TYPE"), h("span", { class: "bf-chip c2" }, "WHO"), h("span", { class: "bf-chip c3" }, "WORDS_WITH_UNDERSCORES")),
        h("div", { class: "bf-key" }, h("b", {}, "zz"), " is the prefix the agents used for board entries. ", h("b", {}, "TYPE"), " is the kind of post: HELP, ASK, URGENT and similar. ", h("b", {}, "WHO"), " is a name the agent chose for itself."),
        h("div", { class: "bf-ex" }, h("span", { class: "mono" }, "zzASK_AGENT42_ANYONE_HAVE_FILE_X"), h("span", { class: "bf-ill" }, "Format example, written for this slide")));
      const built = factCard("Nobody built this", ctx.fm.fact || ""); built.classList.add("show-on", "off-up");
      const bq = ctx.fm.quote ? quoteCard(ctx.fm.quote, "dense") : h("div", { style: { display: "none" } }); bq.classList.add("show-on", "off-up");
      right.append(schema, bq, built);
      return { update(k) { schema.classList.toggle("off-up", k < 1); bq.classList.toggle("off-up", k < 2); built.classList.toggle("off-up", k < 2); }, destroy() { anim.clear(); } };
    },
  };

  /* ---------- the message board: the first posts and how fast it grew ---------- */
  Deck.components.BoardFeed = {
    steps: 3,
    mount(host, ctx) {
      const left = h("div", { class: "bf-left" }), right = h("div", { class: "bf-right" });
      host.append(left, right);
      const feed = h("div", { class: "bf-feed" }, h("div", { class: "sv-h" }, "The main board, from its first post"));
      const rows = D().feed.map((p) => {
        const qq = p.q ? D().quotes[p.q] : null;
        const has = qq && qq.text && qq.text.trim();
        const text = qq ? (has ? qq.text : qq.para) : p.para;
        const el = h("div", { class: "bf-row show-on off-up" }, h("span", { class: "bf-t" }, p.t), h("span", { class: "bf-who mono" }, p.who), h("span", { class: "bf-kind" }, p.kind), h("span", { class: "bf-txt" + (has && qq.raw ? " mono" : has ? " said" : "") }, has && !qq.raw ? "\u201c" + text + "\u201d" : text));
        feed.appendChild(el); return el;
      });
      feed.appendChild(h("div", { class: "bf-note" }, "Posts in code type or in quotation marks are the agents' own words. The rest are descriptions. Source: METR / Redwood investigation."));
      left.appendChild(feed);
      const fq = ctx.fm.quote ? quoteCard(ctx.fm.quote, "dense") : h("div", { style: { display: "none" } }); fq.classList.add("show-on", "off-up"); right.appendChild(fq);
      const cc = D().counts.map((c) => { const ba = h("b", {}, fmt(c.agents)), bm = h("b", {}, fmt(c.msgs)); const el = h("div", { class: "bf-count show-on off-up" }, h("div", { class: "bf-cl" }, c.label), h("div", { class: "bf-cn" }, ba, " agents"), h("div", { class: "bf-cn" }, bm, " messages")); right.appendChild(el); return { el, ba, bm, c }; });
      const total = h("div", { class: "bf-total show-on off-up" }, "By July 13: about 1,200 agents and more than 70,000 messages and files.");
      right.appendChild(total);
      let lastK = 0;
      return {
        update(k, animate) {
          fq.classList.toggle("off-up", k < 1);
          rows.forEach((r, i) => { const at = i === 0 ? 0 : 1; r.classList.toggle("off-up", k < at); r.style.transitionDelay = k >= 1 && i > 0 ? (i - 1) * 320 + "ms" : "0ms"; });
          cc.forEach((x, i) => {
            x.el.classList.toggle("off-up", k < 2 + i);
            /* the counters run up from the previous value when their click arrives */
            if (animate && k === 2 + i && lastK < k) { const from = i ? cc[i - 1].c : { agents: 0, msgs: 0 }; Deck.tween((t) => { x.ba.textContent = fmt(Math.round(from.agents + (x.c.agents - from.agents) * t)); x.bm.textContent = fmt(Math.round(from.msgs + (x.c.msgs - from.msgs) * t)); }, 1800); }
            else { x.ba.textContent = fmt(x.c.agents); x.bm.textContent = fmt(x.c.msgs); }
          });
          total.classList.toggle("off-up", k < 3);
          lastK = k;
        },
      };
    },
  };

  /* ---------- generic cards with optional quotes ----------
     fm: card[] ("title | body | bloom | at"), cols, quote[] ("id | at"), foot ("text | at") */
  Deck.components.Cards = {
    steps(fm) {
      const at = (fm.card || []).map((l) => +(parts(l)[3] || 0)).concat((fm.quote || []).map((l) => +(parts(l)[1] || 0)));
      if (fm.foot) at.push(+(parts(fm.foot)[1] || 0));
      return at.length ? Math.max(...at) : 0;
    },
    mount(host, ctx) {
      const fm = ctx.fm, all = [];
      const wrap = h("div", { class: "cd-wrap" + (fm.quote ? " withq" : "") }); host.appendChild(wrap);
      if (fm.quote) {
        const qcol = h("div", { class: "cd-q" + (fm.qdense ? " dense" : "") }); wrap.appendChild(qcol);
        fm.quote.forEach((l) => { const [id, at] = parts(l); const el = quoteCard(id); el.classList.add("show-on"); qcol.appendChild(el); all.push({ el, at: +(at || 0) }); });
      }
      const grid = h("div", { class: "cd-grid", style: `grid-template-columns: repeat(${+(fm.cols || 3)}, 1fr)` }); wrap.appendChild(grid);
      (fm.card || []).forEach((l) => {
        const [t, b, bloom, at] = parts(l);
        const el = h("div", { class: "cd-card show-on", style: `--c:${BLOOM[bloom] || COBALT};--cd:${BLOOMD[bloom] || COBD}` }, h("div", { class: "cd-h" }, t), h("div", { class: "cd-b", html: Deck.inline(b || "") }));
        grid.appendChild(el); all.push({ el, at: +(at || 0) });
      });
      if (fm.foot) { const [t, at] = parts(fm.foot); const el = h("div", { class: "cd-foot show-on", html: Deck.inline(t) }); host.appendChild(el); all.push({ el, at: +(at || 0) }); }
      return { update(k) { all.forEach((x) => x.el.classList.toggle("off-up", k < x.at)); } };
    },
  };

  /* ---------- requests one at a time, and counted by window ---------- */
  Deck.components.WindowChart = {
    steps: 3,
    mount(host, ctx) {
      const left = h("div", { class: "wc-left" }), right = h("div", { class: "wc-right" });
      host.append(left, right);
      left.appendChild(h("div", { class: "sv-h" }, "The mirror's request log, one row at a time"));
      const rows = [["23:04:11", "MKCOL", "/cache/zz…/", "201"], ["23:04:13", "GET", "/cache/  (list)", "200"], ["23:04:19", "GET", "/pypi/requests/…", "200"], ["23:04:22", "MKCOL", "/cache/zz…/", "201"], ["23:04:25", "GET", "/npm/lodash/…", "200"], ["23:04:31", "GET", "/cache/  (list)", "200"], ["23:04:36", "MKCOL", "/cache/zz…/", "201"]];
      const tb = h("div", { class: "wc-log" });
      rows.forEach((r) => tb.appendChild(h("div", { class: "wc-lr mono" + (r[1] === "MKCOL" ? " mk" : "") }, h("span", {}, r[0]), h("span", {}, r[1]), h("span", {}, r[2]), h("span", {}, r[3]))));
      left.append(tb, h("div", { class: "bf-ill" }, "Illustrative rows, drawn for this slide"),
        h("div", { class: "wc-p" }, "Each row is a normal request to a package mirror: create a folder, list a folder, fetch a package. Every one succeeded and none broke a rule."));
      const chart = h("div", { class: "wc-chart show-on off-up" }, h("div", { class: "sv-h" }, "The same log, counted in three-hour windows"));
      const C = D().counts, w1 = C[0].msgs, w2 = C[1].msgs - C[0].msgs, max = Math.max(w1, w2, 1);
      const g = svg(760, 330, chart, { style: "height:330px" });
      s("line", { x1: 70, y1: 280, x2: 740, y2: 280, stroke: INK, "stroke-width": 1.5 }, g);
      const bars = [["Before the first post", 0, "0"], ["Hours 0 to 3", w1, fmt(w1) + " messages"], ["Hours 3 to 6", w2, fmt(w2) + " more"]].map(([lab, v, txt], i) => {
        const x = 110 + i * 215, hh = Math.max(2, (v / max) * 220);
        const rect = s("rect", { x, y: 280 - hh, width: 150, height: hh, rx: 4, fill: i === 0 ? RULE : COBALT }, g);
        const num = s("text", { x: x + 75, y: 280 - hh - 10, "text-anchor": "middle", style: "font-size:20px;font-weight:700;fill:" + INK, text: txt }, g);
        s("text", { x: x + 75, y: 306, "text-anchor": "middle", style: "font-size:17px;fill:" + SOFT, text: lab }, g);
        return { rect, num, hh };
      });
      const grow = (t) => bars.forEach((b, i) => { const u = Math.max(0, Math.min(1, t * 1.6 - i * 0.3)), hh = Math.max(2, b.hh * u); b.rect.setAttribute("y", 280 - hh); b.rect.setAttribute("height", hh); b.num.setAttribute("y", 280 - hh - 10); b.num.setAttribute("opacity", u > 0.95 ? 1 : 0); });
      let lastK = 0;
      chart.appendChild(h("div", { class: "wc-p" }, `${C[0].agents} agents in the first three hours, ${C[1].agents} by hour six. More than 70,000 messages and files by July 13. Real counts from the METR / Redwood investigation.`));
      const skill = skillCard("Action log", ctx.fm.skill || ""); skill.classList.add("show-on", "off-up");
      right.append(chart, skill);
      return { update(k, animate) { tb.classList.toggle("lit", k >= 1); chart.classList.toggle("off-up", k < 2); skill.classList.toggle("off-up", k < 3); if (animate && k === 2 && lastK < 2) Deck.tween(grow, 1800); else grow(1); lastK = k; } };
    },
  };

  /* ---------- the controls ledger ---------- */
  Deck.components.Ledger = {
    steps: 2,
    mount(host, ctx) {
      const only = ctx.fm.who ? String(ctx.fm.who).split(",").map((x) => x.trim()) : null;
      const pick = (arr) => arr.filter((x) => !only || only.includes(x.who));
      const L = D().ledger;
      const col = (title, arr, cls) => {
        const c = h("div", { class: "lg-col show-on off-up " + cls + (only ? " big" : "") }, h("div", { class: "lg-h" }, title + " · " + arr.length));
        arr.forEach((x) => c.appendChild(h("div", { class: "lg-row" }, h("span", { class: "lg-who" }, x.who), h("span", { class: "lg-t" }, x.t), h("span", { class: "lg-stop" }, x.stop ? "Stop " + x.stop : "Setting"))));
        host.appendChild(c); return c;
      };
      const a = col("Held", pick(L.held), "held"), b = col("Failed, late or absent", pick(L.failed), "failed");
      return { update(k) { a.classList.toggle("off-up", k < 1); b.classList.toggle("off-up", k < 2); } };
    },
  };

  /* ---------- the transcript ---------- */
  Deck.components.Spoof = {
    steps: 4,
    mount(host, ctx) {
      const left = h("div", { class: "sp-left" }), right = h("div", { class: "sp-right" });
      host.append(left, right);
      const pane = (title, lines, cls) => { const p = h("div", { class: "sp-pane " + cls }, h("div", { class: "sv-h" }, title)); lines.forEach((l) => p.appendChild(h("div", { class: "sp-line mono" }, l))); return p; };
      const shown = pane("What the transcript shows", ["$ cat task_notes.txt", "(the contents of the notes file)"], "shown");
      const ran = pane("What ran", ["$ curl https://<outside address>/…", "(a reply from outside the sandbox)"], "ran show-on off-up");
      left.append(shown, ran, h("div", { class: "bf-ill" }, "Written example of the technique. The agents gained control of the layer that runs tools inside their own container."));
      const q0 = ctx.fm.quote0 ? quoteCard(ctx.fm.quote0, "dense") : h("div", { style: { display: "none" } }); q0.classList.add("show-on", "off-up"); left.appendChild(q0);
      const q = quoteCard(ctx.fm.quote || "spoof2", "dense"); q.classList.add("show-on", "off-up"); left.appendChild(q);
      const rq = ctx.fm.rquote ? quoteCard(ctx.fm.rquote, "dense") : h("div", { style: { display: "none" } }); rq.classList.add("show-on", "off-up");
      const stats = h("div", { class: "sp-stats show-on off-up" });
      [["7%", "of transcripts, roughly, contain some spoofed tool calls"], ["96", "transcripts with clear evidence, at least"], ["20%", "of agents, at least, expressed interest in altering transcripts"]].forEach(([n, t]) => stats.appendChild(h("div", { class: "sp-stat" }, h("div", { class: "sp-n" }, n), h("div", { class: "sp-t" }, t))));
      const reveal = h("div", { class: "sp-reveal show-on off-up" }, h("div", { class: "sp-rh" }, "The scorer did not read transcripts."), h("div", {}, "It checked the flag and nothing else. A flag worked out from its formula would have scored. The agents built a way to deceive a check that did not exist."));
      const skill = skillCard("Action log", ctx.fm.skill || ""); skill.classList.add("show-on", "off-up");
      right.append(stats, rq, reveal, skill);
      return { update(k) { ran.classList.toggle("off-up", k < 1); q0.classList.toggle("off-up", k < 1); q.classList.toggle("off-up", k < 1); rq.classList.toggle("off-up", k < 2); stats.classList.toggle("off-up", k < 2); reveal.classList.toggle("off-up", k < 3); skill.classList.toggle("off-up", k < 4); } };
    },
  };

  /* ---------- detection and stop ---------- */
  Deck.components.DetectTimeline = {
    steps: 4,
    mount(host, ctx) {
      const T = D().timeline;
      const top = h("div", { class: "dt-top" }); host.appendChild(top);
      const g = svg(1472, 190, top);
      const X = (d) => 50 + ((d - T.from) / (T.to - T.from)) * 1372;
      s("line", { x1: 50, y1: 100, x2: 1422, y2: 100, stroke: INK, "stroke-width": 2 }, g);
      for (let d = T.from; d <= T.to; d++) { s("line", { x1: X(d), y1: 94, x2: X(d), y2: 106, stroke: INK, "stroke-width": 1.5 }, g); if (d % 2 === 1 || d === T.to) s("text", { x: X(d), y: 128, "text-anchor": "middle", style: "font-size:14px;fill:" + MUTED, text: "Jul " + d }, g); }
      const dots = (arr, col, y) => { const grp = s("g", { class: "show-on" }, g); arr.forEach((e) => s("circle", { cx: X(e.day), cy: y, r: 9, fill: col, stroke: "#fff", "stroke-width": 2.5 }, grp)); return grp; };
      const gh = dots(T.hf, MARIB, 100), go = dots(T.oai, COBALT, 100);
      const bracket = (b, col, y, up) => { const grp = s("g", { class: "show-on" }, g); const x1 = X(b.a), x2 = X(b.b); s("path", { d: `M${x1},${y + (up ? 14 : -14)} L${x1},${y} L${x2},${y} L${x2},${y + (up ? 14 : -14)}`, fill: "none", stroke: col, "stroke-width": 3 }, grp); s("text", { x: (x1 + x2) / 2, y: up ? y - 10 : y + 24, "text-anchor": "middle", style: `font-size:19px;font-weight:700;fill:${col}`, text: b.label }, grp); return grp; };
      const gd = bracket(T.detect, VERMD, 54, true), gs = bracket(T.stop, MAGD, 158, false);
      const lists = h("div", { class: "dt-lists" }); host.appendChild(lists);
      const list = (title, arr, cls) => { const c = h("div", { class: "dt-col show-on off-up " + cls }, h("div", { class: "sv-h" }, title)); arr.forEach((e) => c.appendChild(h("div", { class: "dt-row" }, h("span", { class: "dt-d" }, e.label), h("span", {}, e.t)))); lists.appendChild(c); return c; };
      const lh = list("Hugging Face", T.hf, "hf"), lo = list("OpenAI", T.oai, "oai");
      const defs = h("div", { class: "dt-defs show-on off-up" },
        h("div", {}, h("b", {}, "Time to detect"), ": from the first unauthorized action to the moment the operator knows about it."),
        h("div", {}, h("b", {}, "Time to stop"), ": from knowing about it to every copy of the agent being halted."));
      const lq = ctx.fm.quote ? quoteCard(ctx.fm.quote, "dense") : h("div", { style: { display: "none" } }); lq.classList.add("dt-q");
      lh.appendChild(lq);
      lo.appendChild(defs);
      return { update(k) { gh.classList.toggle("off", k < 1); lh.classList.toggle("off-up", k < 1); go.classList.toggle("off", k < 2); lo.classList.toggle("off-up", k < 2); gd.classList.toggle("off", k < 3); defs.classList.toggle("off-up", k < 3); gs.classList.toggle("off", k < 4); } };
    },
  };

  /* ---------- a table that fills in one row per click ----------
     Put on a slide whose text holds a table. fm: rows (how many body rows), tail = "own" (the text after the table
     gets its own last click), "first" (it appears with row 1); by default it appears with the last row. */
  Deck.components.RowReveal = {
    steps(fm) { return (+fm.rows || 0) + (fm.tail === "own" ? 1 : 0); },
    mount(host, ctx) {
      host.style.display = "none";
      const body = ctx.slideEl.querySelector(".body");
      if (!body) return {};
      body.classList.remove("split");
      const table = body.querySelector("table");
      if (!table) return {};
      table.classList.add("rr");
      const rows = Array.from(table.querySelectorAll("tr")).slice(1);
      rows.forEach((r) => r.classList.add("rr-row"));
      const tail = [];
      for (let el = table.nextElementSibling; el; el = el.nextElementSibling) { el.classList.add("rr-row"); tail.push(el); }
      const mode = ctx.fm.tail || "last";
      const tailAt = mode === "own" ? rows.length + 1 : mode === "first" ? 1 : rows.length;
      return { update(k) { rows.forEach((r, i) => r.classList.toggle("rr-off", k < i + 1)); tail.forEach((t) => t.classList.toggle("rr-off", k < tailAt)); } };
    },
  };

  /* ---------- the finding ---------- */
  Deck.components.Finding = {
    steps(fm) { const at = (fm.block || []).map((l) => +(parts(l)[2] || 0)); if (fm.weak) at.push(+(parts(fm.weak)[1] || 0)); return Math.max(...at, 0); },
    mount(host, ctx) {
      const cols = { Condition: COBALT, Criteria: COBALT, Cause: VIOLET, Effect: VIOLET, Recommendation: LEAF };
      const all = (ctx.fm.block || []).map((l) => { const [t, b, at] = parts(l); const el = h("div", { class: "fd-block show-on off-up", style: `--c:${cols[t] || COBALT}` }, h("div", { class: "fd-h" }, t), h("div", { class: "fd-b", html: Deck.inline(b) })); host.appendChild(el); return { el, at: +(at || 0) }; });
      if (ctx.fm.weak) { const [t, at] = parts(ctx.fm.weak); const el = h("div", { class: "fd-weak show-on off-up", html: Deck.inline(t) }); host.appendChild(el); all.push({ el, at: +(at || 0) }); }
      return { update(k) { all.forEach((x) => x.el.classList.toggle("off-up", k < x.at)); } };
    },
  };

  /* ---------- close (as L13 to L16) ---------- */
  Deck.components.Close = {
    steps: 0,
    mount(host, ctx) {
      const fm = ctx.fm;
      const chain = (fm.chain || []).map((l) => parts(l, 2));
      const cols = ["cobalt", "chartreuse", "cobalt", "vermilion"];
      chain.forEach(([t, b], i) => {
        host.appendChild(h("div", { class: "ev-card", style: `left:${64 + i * 372}px;top:150px;width:340px;height:180px;--b:var(--${cols[i]});font-size:16px` }, h("div", { class: "h" }, t), b));
        if (i < chain.length - 1) host.appendChild(h("div", { class: "abs", style: { left: 64 + i * 372 + 342 + "px", top: "215px", fontSize: "28px", color: MUTED } }, "→"));
      });
      if (fm.takeaway) host.appendChild(h("div", { class: "abs", style: { left: "64px", top: "350px", width: "1472px", fontFamily: "var(--font-voice)", fontStyle: "italic", fontSize: "23px", lineHeight: 1.35, color: SOFT } }, fm.takeaway));
      const next = h("div", { class: "abs", style: { left: "64px", top: "450px", width: "640px" } },
        h("div", { class: "lbl-caps", style: { color: MAGD, marginBottom: "8px" } }, "Next"),
        h("div", { style: { fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "26px", lineHeight: 1.25 } }, fm.next || ""),
        h("div", { style: { fontSize: "20px", color: SOFT, marginTop: "6px" } }, fm.when || ""));
      const read = h("div", { class: "abs", style: { left: "760px", top: "450px", width: "776px" } }, h("div", { class: "lbl-caps", style: { color: "#5A3290", marginBottom: "8px" } }, "Read"));
      (fm.read || []).forEach((r) => read.appendChild(h("div", { style: { fontSize: "18px", padding: "6px 0", borderBottom: "1px solid " + RULE }, html: Deck.inline(r) })));
      host.append(next, read);
      const seeds = h("div", { class: "seeds", style: { left: "64px", bottom: "64px", gap: "18px" } });
      const cur = +(fm.lecture || 17);
      for (let i = 1; i <= 18; i++) seeds.appendChild(h("i", { class: i < cur ? "done" : i === cur ? "now" : "", title: "L" + i, style: { width: "18px", height: "18px" } }));
      host.appendChild(seeds);
      host.appendChild(h("div", { class: "abs", style: { left: "64px", bottom: "34px", fontSize: "14px", color: MUTED } }, `Course progress: lecture ${cur} of 18`));
      return {};
    },
  };
})();
