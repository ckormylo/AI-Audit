/* L18 components. Helpers, quote cards, motion, stat cards, cards, row-by-row tables and the finding are carried from L17.
   New here: the title headline, the inventory reconciliation, survey bars, the reviewer chart, the before-and-after bars,
   the two-line chart, the accountability chain, the timeline, the debate, the course chain and the policy sentence.
   Figures and quote slots are in data/l18.js. Nothing here needs a model. */
(function () {
  const { h, s, svg } = Deck;
  const INK = "#232748", SOFT = "#4A4F6E", MUTED = "#5F6379", RULE = "#E2DACB", VERM = "#E8431F", VERMD = "#BF3417", MAGENTA = "#D6177F", MAGD = "#B0106A",
    COBALT = "#2F5FD0", COBD = "#2A50B0", VIOLET = "#6B3FA0", LEAF = "#45731A", TEAL = "#0E6F7F", MARI = "#8F5A00", MARIB = "#F4A51C", CHART = "#A9C93A", PAPER = "#FBF7EF", PETAL = "#F6EBCF", SKY = "#E4F3F7";
  const D = () => window.L18;
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
    el.appendChild(h("div", { class: "qc-src" }, has ? "As published · " + q.src : "Paraphrase · " + q.src));
    return el;
  }
  Deck.l18quote = quoteCard;

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


  Deck.components.Cards = {
    steps(fm) {
      const at = (fm.card || []).map((l) => +(parts(l)[3] || 0)).concat((fm.quote || []).map((l) => +(parts(l)[1] || 0)));
      if (fm.foot) at.push(+(parts(fm.foot)[1] || 0));
      return at.length ? Math.max(...at) : 0;
    },
    mount(host, ctx) {
      const fm = ctx.fm, all = [];
      if (fm.big) host.classList.add("cd-big");
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
      table.classList.add("rr"); if (ctx.fm.big) body.classList.add("rr-big");
      const rows = Array.from(table.querySelectorAll("tr")).slice(1);
      rows.forEach((r) => r.classList.add("rr-row"));
      const tail = [];
      for (let el = table.nextElementSibling; el; el = el.nextElementSibling) { el.classList.add("rr-row"); tail.push(el); }
      const mode = ctx.fm.tail || "last";
      const tailAt = mode === "own" ? rows.length + 1 : mode === "first" ? 1 : rows.length;
      return { update(k) { rows.forEach((r, i) => r.classList.toggle("rr-off", k < i + 1)); tail.forEach((t) => t.classList.toggle("rr-off", k < tailAt)); } };
    },
  };


  Deck.components.Finding = {
    steps(fm) { const at = (fm.block || []).map((l) => +(parts(l)[2] || 0)); if (fm.weak) at.push(+(parts(fm.weak)[1] || 0)); return Math.max(...at, 0); },
    mount(host, ctx) {
      const cols = { Condition: COBALT, Criteria: COBALT, Cause: VIOLET, Effect: VIOLET, Recommendation: LEAF, "Recommendation A": VERMD, "Recommendation B": LEAF };
      if (ctx.fm.compact) host.classList.add("fd-compact");
      const all = (ctx.fm.block || []).map((l) => { const [t, b, at] = parts(l); const el = h("div", { class: "fd-block show-on off-up", style: `--c:${cols[t] || COBALT}` }, h("div", { class: "fd-h" }, t), h("div", { class: "fd-b", html: Deck.inline(b) })); host.appendChild(el); return { el, at: +(at || 0) }; });
      if (ctx.fm.weak) { const [t, at] = parts(ctx.fm.weak); const el = h("div", { class: "fd-weak show-on off-up", html: Deck.inline(t) }); host.appendChild(el); all.push({ el, at: +(at || 0) }); }
      return { update(k) { all.forEach((x) => x.el.classList.toggle("off-up", k < x.at)); } };
    },
  };


  const anim = (ctx) => !ctx.print && !ctx.preview;
  const sized = (g, w, hh) => { g.setAttribute("width", w); g.setAttribute("height", hh); g.style.display = "block"; return g; };
  const countTo = (el, to, ms, suffix) => {
    const t0 = performance.now();
    const step = (now) => { const t = Math.min(1, (now - t0) / ms); el.textContent = Math.round(to * t) + (suffix || ""); if (t < 1 && el.isConnected) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };

  /* ---------- title: a headline card ---------- */
  Deck.components.TitleNews = {
    steps: 0,
    mount(host, ctx) {
      Deck.petals(host, -190, -190, 0.9, 2);
      Deck.petals(host, 800, 650, 0.7, 5);
      host.appendChild(h("div", { class: "tq" },
        h("div", { class: "tq-lab" }, ctx.fm.label || ""),
        h("div", { class: "tn-text" }, ctx.fm.head || ""),
        h("div", { class: "tq-who" }, ctx.fm.sub || ""),
        h("div", { class: "tq-src" }, ctx.fm.src || "")));
      return {};
    },
  };

  /* ---------- testing the inventory: three record sources matched against the list ---------- */
  Deck.components.Reconcile = {
    steps: 3,
    mount(host, ctx) {
      const fm = ctx.fm;
      const g = sized(svg(916, 430, host), 916, 430);
      const box = (x, y, w, hh, title, sub, col, fill) => {
        const grp = s("g", { class: "show-on" }, g);
        s("rect", { x, y, width: w, height: hh, rx: 12, fill: fill || "#fff", stroke: col, "stroke-width": 2.5 }, grp);
        s("text", { x: x + w / 2, y: y + (sub ? hh / 2 - 6 : hh / 2 + 7), "text-anchor": "middle", style: `font-family:var(--font-display);font-weight:700;font-size:20px;fill:${INK}`, text: title }, grp);
        if (sub) s("text", { x: x + w / 2, y: y + hh / 2 + 20, "text-anchor": "middle", style: `font-size:15px;fill:${MUTED}`, text: sub }, grp);
        return grp;
      };
      const srcY = [20, 160, 300];
      const srcs = (fm.src || []).map((l, i) => { const [t, sub] = parts(l); return box(8, srcY[i], 258, 100, t, sub, COBALT); });
      const lines = s("g", { class: "show-on" }, g);
      srcY.forEach((y) => s("path", { d: `M266,${y + 50} L372,215`, fill: "none", stroke: "#B9B2A3", "stroke-width": 2 }, lines));
      s("path", { d: "M548,200 L604,110", fill: "none", stroke: "#B9B2A3", "stroke-width": 2 }, lines);
      s("path", { d: "M548,230 L604,320", fill: "none", stroke: "#B9B2A3", "stroke-width": 2 }, lines);
      const match = box(372, 165, 176, 100, "Match", "against the inventory", VIOLET, "#F4EEFA");
      // the two result boxes
      const inv = s("g", {}, g);
      s("rect", { x: 604, y: 20, width: 306, height: 180, rx: 12, fill: "#F3F8E6", stroke: LEAF, "stroke-width": 2.5 }, inv);
      s("text", { x: 624, y: 50, style: `font-family:var(--font-display);font-weight:700;font-size:15px;letter-spacing:.1em;fill:${LEAF}`, text: "IN THE AI INVENTORY" }, inv);
      const nInv = s("text", { x: 624, y: 120, style: `font-family:var(--font-display);font-weight:300;font-size:74px;fill:${LEAF}`, text: String(fm.listed || 6) }, inv);
      s("text", { x: 726, y: 116, style: `font-size:19px;fill:${INK}`, text: "systems listed" }, inv);
      const invNote = s("text", { class: "show-on", x: 624, y: 170, style: `font-size:16px;fill:${MUTED}`, text: "All " + (fm.listed || 6) + " were found in the records" }, inv);
      const out = s("g", { class: "show-on" }, g);
      s("rect", { x: 604, y: 230, width: 306, height: 190, rx: 12, fill: "#FFF3EF", stroke: VERMD, "stroke-width": 2.5 }, out);
      s("text", { x: 624, y: 260, style: `font-family:var(--font-display);font-weight:700;font-size:15px;letter-spacing:.06em;fill:${VERMD}`, text: "IN USE, NOT IN THE INVENTORY" }, out);
      const outv = s("g", { class: "show-on" }, g);
      const nOut = s("text", { x: 624, y: 330, style: `font-family:var(--font-display);font-weight:300;font-size:74px;fill:${VERMD}`, text: String(fm.unlisted || 13) }, outv);
      (fm.ex || []).forEach((t, i) => s("text", { x: 624, y: 362 + i * 21, style: `font-size:15px;fill:${INK}`, text: t }, outv));
      const fact = h("div", { class: "fact-card show-on off-up rc-fact" }, h("div", { class: "fact-h" }, fm.facth || ""), h("div", { class: "fact-b", html: Deck.inline(fm.fact || "") }));
      host.appendChild(fact);
      const an = Animator(g, anim(ctx));
      const scene = async (a) => {
        const dest = [[756, 110], [756, 320], [756, 320], [756, 110], [756, 320]];
        for (let i = 0; i < 5; i++) {
          const y = srcY[i % 3] + 50, d = dest[i], bad = d[1] > 200;
          await a.move([[266, y], [372, 215], [460, 215]], { color: COBALT, ms: 900 });
          await a.move([[548, bad ? 230 : 200], [604, d[1]], d], { color: bad ? VERM : CHART, ms: 800, fade: true });
        }
      };
      let last = -1;
      return {
        update(k, animate) {
          srcs.forEach((x) => x.classList.toggle("off", k < 1)); lines.classList.toggle("off", k < 1); match.classList.toggle("off", k < 1);
          out.classList.toggle("off", k < 1); outv.classList.toggle("off", k < 2); invNote.classList.toggle("off", k < 2);
          fact.classList.toggle("off-up", k < 3);
          if (k >= 1) an.run(scene, 900); else an.clear();
          if (k === 2 && last < 2 && animate && anim(ctx)) countTo(nOut, +(fm.unlisted || 13), 900); else nOut.textContent = String(fm.unlisted || 13);
          last = k;
        },
        destroy() { an.clear(); },
      };
    },
  };

  /* ---------- survey bars: the figure, the question asked, who paid for the survey ---------- */
  Deck.components.SurveyBars = {
    steps(fm) { return (fm.bar || []).length + (fm.check ? 1 : 0); },
    mount(host, ctx) {
      const fm = ctx.fm;
      const wrap = h("div", { class: "sb-wrap" }); host.appendChild(wrap);
      const rows = (fm.bar || []).map((l) => {
        const [pct, q, who] = parts(l, 3);
        const fill = h("div", { class: "sb-fill" });
        const num = h("div", { class: "sb-n" }, pct + "%");
        const row = h("div", { class: "sb-row show-on" }, num,
          h("div", { class: "sb-mid" }, h("div", { class: "sb-track" }, fill), h("div", { class: "sb-q", html: Deck.inline(q) }), h("div", { class: "sb-who", html: Deck.inline(who) })));
        wrap.appendChild(row);
        return { row, fill, num, pct: +pct };
      });
      let chk = null;
      if (fm.check) { const [t, b] = parts(fm.check, 2); chk = h("div", { class: "sk-card show-on off-up sb-chk" }, h("div", { class: "sk-h" }, t), h("div", { class: "sk-b", html: Deck.inline(b) })); host.appendChild(chk); }
      let last = 0;
      return {
        update(k, animate) {
          rows.forEach((r, i) => {
            const on = k >= i + 1;
            r.row.classList.toggle("off", !on);
            r.fill.style.transition = animate && anim(ctx) ? "width 1s ease-out" : "none";
            r.fill.style.width = on ? r.pct + "%" : "0%";
            if (on && animate && anim(ctx) && last < i + 1) countTo(r.num, r.pct, 900, "%"); else r.num.textContent = r.pct + "%";
          });
          if (chk) chk.classList.toggle("off-up", k < rows.length + 1);
          last = k;
        },
      };
    },
  };

  /* ---------- three reviewers: override rate against time per decision ---------- */
  Deck.components.ReviewerChart = {
    steps: 4,
    mount(host, ctx) {
      const fm = ctx.fm;
      const W = 916, H = 400, L = 86, R = 30, T = 24, B = 62;
      const g = sized(svg(W, H, host), W, H);
      const ticks = [[1, "1 sec"], [10, "10 sec"], [60, "1 min"], [600, "10 min"]];
      const X = (sec) => L + (Math.log10(sec) / Math.log10(900)) * (W - L - R);
      const Y = (p) => T + (1 - p / 60) * (H - T - B);
      s("rect", { x: L, y: T, width: W - L - R, height: H - T - B, fill: "#fff", stroke: RULE, "stroke-width": 1.5 }, g);
      [0, 20, 40, 60].forEach((p) => { s("line", { x1: L, y1: Y(p), x2: W - R, y2: Y(p), stroke: RULE, "stroke-width": 1 }, g); s("text", { x: L - 10, y: Y(p) + 5, "text-anchor": "end", style: `font-size:15px;fill:${MUTED}`, text: p + "%" }, g); });
      ticks.forEach(([v, t]) => { s("line", { x1: X(v), y1: H - B, x2: X(v), y2: H - B + 7, stroke: INK, "stroke-width": 1.5 }, g); s("text", { x: X(v), y: H - B + 26, "text-anchor": "middle", style: `font-size:15px;fill:${MUTED}`, text: t }, g); });
      s("text", { x: (L + W - R) / 2, y: H - 8, "text-anchor": "middle", style: `font-size:16px;font-weight:700;fill:${INK}`, text: "Time per decision" }, g);
      s("text", { x: 20, y: (T + H - B) / 2, "text-anchor": "middle", transform: `rotate(-90 20 ${(T + H - B) / 2})`, style: `font-size:16px;font-weight:700;fill:${INK}`, text: "Override rate" }, g);
      const cols = [VERM, MARIB, CHART], dcols = [VERMD, MARI, LEAF];
      const pts = (fm.rev || []).map((l, i) => {
        const [name, sec, pct, note, dx, dy] = parts(l);
        const grp = s("g", { class: "show-on rv-pt" }, g);
        const x = X(+sec), y = Y(+pct);
        s("circle", { cx: x, cy: y, r: 26, fill: cols[i], opacity: 0.22 }, grp);
        s("circle", { cx: x, cy: y, r: 13, fill: cols[i], stroke: "#fff", "stroke-width": 3 }, grp);
        const tx = x + (+dx || 24), ty = y + (+dy || -18);
        s("text", { x: tx, y: ty, style: `font-family:var(--font-display);font-weight:700;font-size:18px;fill:${dcols[i]}`, text: name }, grp);
        s("text", { x: tx, y: ty + 21, style: `font-size:15.5px;fill:${INK}`, text: note }, grp);
        return grp;
      });
      const guide = h("div", { class: "sk-card show-on off-up rv-guide" }, h("div", { class: "sk-h" }, fm.guideh || "How to read it"), h("div", { class: "sk-b", html: Deck.inline(fm.guide || "") }));
      host.appendChild(guide);
      return { update(k) { pts.forEach((p, i) => p.classList.toggle("off", k < i + 1)); guide.classList.toggle("off-up", k < 4); } };
    },
  };

  /* ---------- two bars, before and after ---------- */
  Deck.components.BarPair = {
    steps(fm) { return (fm.bar || []).length + (fm.note ? 1 : 0); },
    mount(host, ctx) {
      const fm = ctx.fm, max = +(fm.max || 40);
      const wrap = h("div", { class: "bp-wrap" }); host.appendChild(wrap);
      const bars = (fm.bar || []).map((l) => {
        const [label, val, bloom] = parts(l);
        const fill = h("div", { class: "bp-fill", style: `background:${BLOOM[bloom] || COBALT}` });
        const num = h("div", { class: "bp-n", style: `color:${BLOOMD[bloom] || COBD}` }, val + "%");
        const col = h("div", { class: "bp-col show-on" }, num, h("div", { class: "bp-track" }, fill), h("div", { class: "bp-l", html: Deck.inline(label) }));
        wrap.appendChild(col);
        return { col, fill, val: +val };
      });
      let note = null;
      if (fm.note) { const [t, b] = parts(fm.note, 2); note = h("div", { class: "fact-card show-on off-up bp-note" }, h("div", { class: "fact-h" }, t), h("div", { class: "fact-b", html: Deck.inline(b) })); host.appendChild(note); }
      return {
        update(k, animate) {
          bars.forEach((b, i) => { const on = k >= i + 1; b.col.classList.toggle("off", !on); b.fill.style.transition = animate && anim(ctx) ? "height 1s ease-out" : "none"; b.fill.style.height = on ? (b.val / max) * 100 + "%" : "0%"; });
          if (note) note.classList.toggle("off-up", k < bars.length + 1);
        },
      };
    },
  };

  /* ---------- two lines from a common start (endpoints from the source; the path between is drawn straight) ---------- */
  Deck.components.Slope = {
    steps(fm) { return 1 + (fm.card || []).length; },
    mount(host, ctx) {
      const fm = ctx.fm;
      const W = 916, H = 330, x0 = 150, x1 = 640;
      const g = sized(svg(W, H, host), W, H);
      const Y = (v) => 165 - (v - 100) * 9;
      s("line", { x1: x0, y1: 20, x2: x0, y2: H - 40, stroke: RULE, "stroke-width": 2 }, g);
      s("line", { x1: x1, y1: 20, x2: x1, y2: H - 40, stroke: RULE, "stroke-width": 2 }, g);
      s("line", { x1: x0, y1: Y(100), x2: x1, y2: Y(100), stroke: "#C9C2B2", "stroke-width": 1.5, "stroke-dasharray": "5 6" }, g);
      s("text", { x: x0, y: H - 14, "text-anchor": "middle", style: `font-size:16px;font-weight:700;fill:${INK}`, text: fm.from || "" }, g);
      s("text", { x: x1, y: H - 14, "text-anchor": "middle", style: `font-size:16px;font-weight:700;fill:${INK}`, text: fm.to || "" }, g);
      s("text", { x: x0 - 14, y: Y(100) + 6, "text-anchor": "end", style: `font-size:16px;fill:${MUTED}`, text: "Start = 100" }, g);
      const grp = s("g", { class: "show-on" }, g);
      const paths = (fm.line || []).map((l) => {
        const [label, end, bloom, sub] = parts(l);
        const col = BLOOM[bloom] || COBALT, dcol = BLOOMD[bloom] || COBD;
        const p = s("path", { d: `M${x0},${Y(100)} L${x1},${Y(+end)}`, fill: "none", stroke: col, "stroke-width": 6, "stroke-linecap": "round" }, grp);
        s("circle", { cx: x1, cy: Y(+end), r: 10, fill: col, stroke: "#fff", "stroke-width": 3 }, grp);
        s("text", { x: x1 + 22, y: Y(+end) - 2, style: `font-family:var(--font-display);font-weight:700;font-size:24px;fill:${dcol}`, text: sub }, grp);
        s("text", { x: x1 + 22, y: Y(+end) + 21, style: `font-size:16px;fill:${INK}`, text: label }, grp);
        return p;
      });
      s("circle", { cx: x0, cy: Y(100), r: 9, fill: INK }, grp);
      const cards = h("div", { class: "sl-cards" }); host.appendChild(cards);
      const cs = (fm.card || []).map((l) => { const [t, b] = parts(l, 2); const el = h("div", { class: "fact-card show-on off-up" }, h("div", { class: "fact-h" }, t), h("div", { class: "fact-b", html: Deck.inline(b) })); cards.appendChild(el); return el; });
      let last = 0;
      return {
        update(k, animate) {
          grp.classList.toggle("off", k < 1);
          paths.forEach((p) => {
            const len = p.getTotalLength ? p.getTotalLength() : 520;
            p.style.transition = "none"; p.style.strokeDasharray = String(len);
            if (k >= 1 && last < 1 && animate && anim(ctx)) { p.style.strokeDashoffset = String(len); requestAnimationFrame(() => { p.style.transition = "stroke-dashoffset 1.4s ease-out"; p.style.strokeDashoffset = "0"; }); }
            else p.style.strokeDashoffset = "0";
          });
          cs.forEach((c, i) => c.classList.toggle("off-up", k < i + 2));
          last = k;
        },
      };
    },
  };

  /* ---------- who answers: a chain of parties, and where the blame comes to rest ---------- */
  Deck.components.BlameChain = {
    steps: 4,
    mount(host, ctx) {
      const fm = ctx.fm;
      const links = (fm.link || []).map((l) => parts(l));
      const n = links.length, W = 1472, bw = 214, gap = (W - n * bw) / (n - 1), top = 34, bh = 92;
      const g = sized(svg(W, 170, host), W, 170);
      const cx = (i) => i * (bw + gap) + bw / 2;
      const boxes = links.map(([t, sub], i) => {
        const grp = s("g", { class: "bc-box" }, g);
        s("rect", { class: "bc-r", x: i * (bw + gap), y: top, width: bw, height: bh, rx: 12, fill: "#fff", stroke: "#B9B2A3", "stroke-width": 2.5 }, grp);
        s("text", { x: cx(i), y: top + 38, "text-anchor": "middle", style: `font-family:var(--font-display);font-weight:700;font-size:19px;fill:${INK}`, text: t }, grp);
        s("text", { x: cx(i), y: top + 64, "text-anchor": "middle", style: `font-size:14.5px;fill:${MUTED}`, text: sub || "" }, grp);
        if (i < n - 1) s("line", { x1: i * (bw + gap) + bw + 4, y1: top + bh / 2, x2: (i + 1) * (bw + gap) - 4, y2: top + bh / 2, stroke: "#B9B2A3", "stroke-width": 2 }, grp);
        return grp;
      });
      const land = +(fm.land || 1), agent = +(fm.agent || 0);
      const mark = s("g", { class: "show-on" }, g);
      s("path", { d: `M${cx(land) - 14},${top - 26} L${cx(land) + 14},${top - 26} L${cx(land)},${top - 6} Z`, fill: VERM }, mark);
      s("text", { x: cx(land), y: top - 34 + 0, "text-anchor": "middle", style: `font-family:var(--font-display);font-weight:700;font-size:14px;letter-spacing:.1em;fill:${VERMD}`, text: "" }, mark);
      const lab = s("text", { class: "show-on", x: cx(land), y: top + bh + 30, "text-anchor": "middle", style: `font-family:var(--font-display);font-weight:700;font-size:15px;letter-spacing:.08em;fill:${VERMD}`, text: fm.landlabel || "BLAME COMES TO REST HERE" }, g);
      const an = Animator(g, anim(ctx));
      const grid = h("div", { class: "bc-grid" }); host.appendChild(grid);
      const left = h("div", { class: "bc-col" }), right = h("div", { class: "bc-col" }); grid.append(left, right);
      const mk = (line) => { const [t, b] = parts(line, 2); return h("div", { class: "fact-card show-on off-up" }, h("div", { class: "fact-h" }, t), h("div", { class: "fact-b", html: Deck.inline(b) })); };
      const d1 = mk(fm.def1 || " | "), d2 = mk(fm.def2 || " | "); d2.classList.add("bc-red"); left.append(d1, d2);
      const qs = (fm.quote || []).map((id) => { const el = quoteCard(id, "dense"); el.classList.add("show-on", "off-up"); right.appendChild(el); return el; });
      const own = h("div", { class: "sk-card show-on off-up" }, h("div", { class: "sk-h" }, fm.ownh || ""), h("div", { class: "sk-b", html: Deck.inline(fm.own || "") })); right.appendChild(own);
      const scene = async (a) => { await a.move([[cx(n - 1), top - 16], [cx(land), top - 16]], { color: VERM, ms: 2600, label: "blame", labelColor: VERMD }); await a.wait(1600); };
      return {
        update(k) {
          d1.classList.toggle("off-up", k < 1); d2.classList.toggle("off-up", k < 2);
          mark.classList.toggle("off", k < 2); lab.classList.toggle("off", k < 2);
          boxes.forEach((b, i) => { b.classList.toggle("hot", k >= 2 && i === land); b.classList.toggle("ag", k >= 3 && i === agent); });
          qs.forEach((q) => q.classList.toggle("off-up", k < 3)); own.classList.toggle("off-up", k < 4);
          if (k === 2) an.run(scene, 600); else an.clear();
        },
        destroy() { an.clear(); },
      };
    },
  };

  /* ---------- a timeline of dated events (evenly spaced, not to scale) ---------- */
  Deck.components.Timeline = {
    steps(fm) { const at = (fm.ev || []).map((l) => +(parts(l)[3] || 0)); if (fm.foot) at.push(+(parts(fm.foot, 2)[0] || 0)); return Math.max(...at, 0); },
    mount(host, ctx) {
      const fm = ctx.fm, evs = (fm.ev || []).map((l) => parts(l)), n = evs.length, W = 1472, cw = W / n;
      const g = sized(svg(W, 70, host), W, 70);
      s("line", { x1: 20, y1: 36, x2: W - 20, y2: 36, stroke: INK, "stroke-width": 3 }, g);
      const dots = evs.map(([d, t, bloom], i) => s("circle", { class: "show-on", cx: cw * i + cw / 2, cy: 36, r: 13, fill: BLOOM[bloom] || COBALT, stroke: "#fff", "stroke-width": 3 }, g));
      const row = h("div", { class: "tl-row", style: `grid-template-columns: repeat(${n}, 1fr)` }); host.appendChild(row);
      const cards = evs.map(([d, t, bloom]) => { const el = h("div", { class: "tl-card show-on", style: `--c:${BLOOM[bloom] || COBALT};--cd:${BLOOMD[bloom] || COBD}` }, h("div", { class: "tl-d" }, d), h("div", { class: "tl-t", html: Deck.inline(t) })); row.appendChild(el); return el; });
      let foot = null, footAt = 0;
      if (fm.foot) { const [at, t] = parts(fm.foot, 2); footAt = +at; foot = h("div", { class: "cd-foot show-on off-up", html: Deck.inline(t) }); host.appendChild(foot); }
      host.appendChild(h("div", { class: "tl-note" }, "Evenly spaced. Not to scale."));
      return { update(k) { evs.forEach((e, i) => { const off = k < +(e[3] || 0); dots[i].classList.toggle("off", off); cards[i].classList.toggle("off-up", off); }); if (foot) foot.classList.toggle("off-up", k < footAt); } };
    },
  };

  /* ---------- the debate: a motion, two positions, the format ---------- */
  Deck.components.Debate = {
    steps: 3,
    mount(host, ctx) {
      const fm = ctx.fm;
      host.appendChild(h("div", { class: "db-motion" }, h("div", { class: "db-lab" }, "The motion"), h("div", { class: "db-text" }, "“" + (fm.motion || "") + "”")));
      const row = h("div", { class: "db-row" }); host.appendChild(row);
      const pos = (fm.pos || []).map((l, i) => { const [t, b] = parts(l, 2); const el = h("div", { class: "db-pos show-on off-up " + (i ? "b" : "a") }, h("div", { class: "db-h" }, t), h("div", { class: "db-b", html: Deck.inline(b) })); row.appendChild(el); return el; });
      const steps = h("div", { class: "db-format show-on off-up" });
      (fm.step || []).forEach((l) => { const [t, b] = parts(l, 2); steps.appendChild(h("div", { class: "db-step" }, h("b", {}, t), h("span", {}, b))); });
      host.appendChild(steps);
      return { update(k) { pos.forEach((p, i) => p.classList.toggle("off-up", k < i + 1)); steps.classList.toggle("off-up", k < 3); } };
    },
  };

  /* ---------- the course as a chain of stages ---------- */
  Deck.components.CourseChain = {
    steps(fm) { return Math.max(...(fm.stage || []).map((l) => +(parts(l)[4] || 0)), 0) + (fm.foot ? 1 : 0); },
    mount(host, ctx) {
      const fm = ctx.fm, st = (fm.stage || []).map((l) => parts(l));
      const row = h("div", { class: "cc-row", style: `grid-template-columns: repeat(${st.length}, 1fr)` }); host.appendChild(row);
      const cards = st.map(([name, lec, what, bloom], i) => {
        const el = h("div", { class: "cc-card show-on", style: `--c:${BLOOM[bloom] || COBALT};--cd:${BLOOMD[bloom] || COBD}` },
          h("div", { class: "cc-n" }, String(i + 1)), h("div", { class: "cc-h" }, name), h("div", { class: "cc-l" }, lec), h("div", { class: "cc-w", html: Deck.inline(what) }));
        row.appendChild(el); return el;
      });
      const last = Math.max(...st.map((x) => +(x[4] || 0)), 0);
      let foot = null;
      if (fm.foot) { foot = h("div", { class: "cd-foot show-on off-up", html: Deck.inline(fm.foot) }); host.appendChild(foot); }
      return { update(k) { cards.forEach((c, i) => c.classList.toggle("off-up", k < +(st[i][4] || 0))); if (foot) foot.classList.toggle("off-up", k < last + 1); } };
    },
  };

  /* ---------- one sentence of a policy, one word marked, two readings ---------- */
  Deck.components.Clause = {
    steps: 4,
    mount(host, ctx) {
      const fm = ctx.fm;
      const sent = h("div", { class: "cl-sent" });
      const i = (fm.sentence || "").indexOf(fm.word || "\u0000");
      const mark = h("span", { class: "cl-mark" }, fm.word || "");
      if (i >= 0) sent.append((fm.sentence || "").slice(0, i), mark, (fm.sentence || "").slice(i + (fm.word || "").length)); else sent.append(fm.sentence || "");
      host.appendChild(h("div", { class: "cl-card" }, h("div", { class: "cl-lab" }, fm.label || ""), sent));
      host.classList.add("cd-big");
      const row = h("div", { class: "cl-row" }); host.appendChild(row);
      const rd = (fm.reading || []).map((l) => { const [t, b] = parts(l, 2); const el = h("div", { class: "cd-card show-on off-up", style: `--c:${VIOLET};--cd:#5A3290` }, h("div", { class: "cd-h" }, t), h("div", { class: "cd-b", html: Deck.inline(b) })); row.appendChild(el); return el; });
      const pt = h("div", { class: "cd-foot show-on off-up", html: Deck.inline(fm.point || "") }); host.appendChild(pt);
      return { update(k) { mark.classList.toggle("on", k >= 1); rd.forEach((r, j) => r.classList.toggle("off-up", k < j + 2)); pt.classList.toggle("off-up", k < 4); } };
    },
  };
})();
