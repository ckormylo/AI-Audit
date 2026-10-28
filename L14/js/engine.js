/* Deck engine (shared by L12 and later web decks; deck id from <meta name="deck-id">): no dependencies.
   Slide text lives in slides.md (copied into slides.content.js for double-click use).
   Each slide can host one component (js/components/*.js) that animates through click steps. */
(function () {
  "use strict";
  const Deck = (window.Deck = window.Deck || {});
  Deck.components = Deck.components || {};
  Deck.data = window.DECK_DATA || {};
  const DECK_ID = (document.querySelector("meta[name=deck-id]") || {}).content || "DECK";
  Deck.id = DECK_ID;
  const W = 1600, H = 900;
  const params = new URLSearchParams(location.search);
  const MODE = params.has("presenter") ? "presenter" : params.has("print") ? "print" : "main";

  /* ------------------------------------------------------------ helpers for components */
  const SVGNS = "http://www.w3.org/2000/svg";
  Deck.esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  Deck.h = function (tag, attrs, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === "style" && typeof v === "object") Object.assign(el.style, v);
      else if (k === "html") el.innerHTML = v;
      else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? "" : v);
    }
    for (const k of kids.flat()) if (k != null) el.append(k.nodeType ? k : document.createTextNode(k));
    return el;
  };
  Deck.s = function (tag, attrs, parent) {
    const el = document.createElementNS(SVGNS, tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null) continue;
      if (k === "text") el.textContent = v;
      else if (k === "style" && typeof v === "object") Object.assign(el.style, v);
      else el.setAttribute(k, v);
    }
    if (parent) parent.appendChild(el);
    return el;
  };
  Deck.svg = (w, h, parent, attrs) => Deck.s("svg", Object.assign({ viewBox: `0 0 ${w} ${h}`, width: "100%", height: "100%" }, attrs || {}), parent);
  Deck.ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  Deck.reduced = false;
  /* tween(fn(t in 0..1), ms) -> cancel function; ms=0 jumps */
  Deck.tween = function (fn, ms) {
    if (!ms || Deck.reduced || MODE === "print") { fn(1); return () => {}; }
    let raf, t0 = performance.now(), dead = false;
    const step = (now) => {
      if (dead) return;
      const t = Math.min(1, (now - t0) / ms);
      fn(Deck.ease(t));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => { dead = true; cancelAnimationFrame(raf); };
  };
  Deck.lerp = (a, b, t) => a + (b - a) * t;
  /* visible form of a token: leading space shown as a dot */
  Deck.tokHTML = function (t) {
    let s = Deck.esc(t).replace(/\n/g, "↵");
    s = s.replace(/^ /, '<span class="sp">·</span>');
    return s;
  };
  Deck.chip = function (t, i, opts) {
    opts = opts || {};
    const c = Deck.h("span", { class: "chip h" + (i % 5) + (opts.cls ? " " + opts.cls : "") });
    c.innerHTML = `<span class="tt">${Deck.tokHTML(t)}</span>` + (opts.id != null ? `<span class="id">${opts.id}</span>` : "");
    return c;
  };
  Deck.fmt = (x, d) => Number(x).toLocaleString("en-US", { maximumFractionDigits: d == null ? 0 : d, minimumFractionDigits: d == null ? 0 : d });
  Deck.pct = (p, d) => (p * 100).toFixed(d == null ? 1 : d) + "%";

  /* ------------------------------------------------------------ markdown (small subset) */
  function inline(s) {
    s = Deck.esc(s);
    s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    return s;
  }
  Deck.inline = inline;
  Deck.md = function (src) {
    const lines = src.replace(/\r/g, "").split("\n");
    let out = "", i = 0;
    while (i < lines.length) {
      const l = lines[i];
      if (!l.trim()) { i++; continue; }
      if (/^#{1,4} /.test(l)) { const n = l.match(/^#+/)[0].length; out += `<h${n + 1}>${inline(l.replace(/^#+ /, ""))}</h${n + 1}>`; i++; continue; }
      if (/^\s*\|/.test(l)) {
        const rows = [];
        while (i < lines.length && /^\s*\|/.test(lines[i])) rows.push(lines[i++]);
        const cells = (r) => r.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
        let html = "<table>";
        rows.forEach((r, k) => {
          if (/^\s*\|[\s:|-]+\|\s*$/.test(r)) return;
          const tag = k === 0 ? "th" : "td";
          html += "<tr>" + cells(r).map((c) => `<${tag}>${inline(c)}</${tag}>`).join("") + "</tr>";
        });
        out += html + "</table>";
        continue;
      }
      if (/^\s*([-*]|\d+\.) /.test(l)) {
        const ordered = /^\s*\d+\./.test(l);
        let html = ordered ? "<ol>" : "<ul>";
        while (i < lines.length && /^\s*([-*]|\d+\.) /.test(lines[i])) html += "<li>" + inline(lines[i++].replace(/^\s*([-*]|\d+\.) /, "")) + "</li>";
        out += html + (ordered ? "</ol>" : "</ul>");
        continue;
      }
      const para = [];
      while (i < lines.length && lines[i].trim() && !/^\s*([-*]|\d+\.) |^#|^\s*\|/.test(lines[i])) para.push(lines[i++]);
      out += "<p>" + inline(para.join(" ")) + "</p>";
    }
    return out;
  };

  /* ------------------------------------------------------------ slides.md parser */
  function parse(src) {
    src = src.replace(/\r/g, "");
    const parts = src.split(/^---[ \t]*$/m);
    const slides = [];
    for (let k = 1; k < parts.length; k += 2) {
      const front = parts[k], body = parts[k + 1] || "";
      if (front == null) break;
      const fm = {};
      front.split("\n").forEach((line) => {
        const m = line.match(/^([A-Za-z0-9_.]+)(\[\])?:\s?(.*)$/);
        if (!m) return;
        const val = m[3].replace(/\\n/g, "\n");
        if (m[2]) (fm[m[1]] = fm[m[1]] || []).push(val);
        else fm[m[1]] = val;
      });
      if (!Object.keys(fm).length) continue;
      let notes = "", main = body;
      const ni = body.search(/^Notes:\s*$/m);
      if (ni >= 0) { notes = body.slice(ni).replace(/^Notes:\s*$/m, "").trim(); main = body.slice(0, ni); }
      const captions = {};
      main = main.replace(/^Click (\d+):[ \t]?(.*)$/gm, (_, n, t) => { captions[+n] = t.trim(); return ""; });
      slides.push({ fm, md: main.trim(), notes, captions });
    }
    return slides;
  }

  /* ------------------------------------------------------------ blooms */
  const BLOOM = { magenta: "magenta", vermilion: "vermilion", marigold: "marigold", chartreuse: "leaf", turquoise: "teal", cobalt: "cobalt", violet: "violet" };
  function bloomVars(name) {
    name = name || "cobalt";
    const d = BLOOM[name] || "cobalt";
    return `--bloom: var(--${name}); --bloom-d: var(--${d}-d);`;
  }
  Deck.bloomVars = bloomVars;

  /* ------------------------------------------------------------ rendering one slide state */
  function stepsOf(slide) {
    const comp = Deck.components[slide.fm.component];
    let n = 0;
    if (comp) n = typeof comp.steps === "function" ? comp.steps(slide.fm) : comp.steps || 0;
    const cap = Object.keys(slide.captions).map(Number);
    if (cap.length) n = Math.max(n, Math.max(...cap));
    if (slide.fm.clicks) n = Math.max(n, +slide.fm.clicks);
    if (slide.fm.audit_at) n = Math.max(n, +slide.fm.audit_at);
    return n;
  }
  Deck.stepsOf = stepsOf;

  function contentNumber(idx) {
    // page numbers count every slide
    return idx + 1;
  }

  function buildSlide(stage, slide, idx, total, opts) {
    const fm = slide.fm;
    stage.innerHTML = "";
    const layout = fm.layout || "content";
    const el = Deck.h("div", { class: "slide " + layout + (layout === "title" ? " title-slide" : ""), style: bloomVars(fm.bloom) });
    stage.appendChild(el);
    const inst = { el, slide, idx, captionEl: null, audit: null, comp: null, steps: stepsOf(slide) };

    if (layout === "title") {
      const band = Deck.h("div", { class: "band" });
      band.innerHTML = `<div class="k">${inline(fm.kicker || "")}</div><h1>${inline(fm.title || "")}</h1><div class="sub">${inline(fm.subtitle || "")}</div><div class="meta">${inline(fm.meta || "")}</div>`;
      el.appendChild(band);
    } else if (layout === "divider") {
      el.innerHTML = `<div class="vband"></div><div class="num">${Deck.esc(fm.part || "")}</div><div class="k">${inline(fm.kicker || "")}</div><h2>${inline(fm.title || "")}</h2><div class="ctx">${inline(fm.context || "")}</div>`;
      const seeds = Deck.h("div", { class: "seeds", style: { left: "524px", bottom: "70px" } });
      const nparts = +(fm.of || 6), cur = +(fm.part || 0);
      for (let k = 1; k <= nparts; k++) seeds.appendChild(Deck.h("i", { class: k < cur ? "done" : k === cur ? "now" : "" }));
      el.appendChild(seeds);
    } else {
      el.appendChild(Deck.h("div", { class: "strip" }));
      if (fm.kicker) el.appendChild(Deck.h("div", { class: "kicker", html: inline(fm.kicker) }));
      if (fm.title) el.appendChild(Deck.h("h1", { class: "title", html: inline(fm.title) }));
      if (fm.badge) el.appendChild(Deck.h("div", { class: "badge" + (fm.badge.toLowerCase().startsWith("real") ? " real" : ""), html: inline(fm.badge) }));
      if (slide.md) el.appendChild(Deck.h("div", { class: "body" + (fm.component ? " split" : "") + (fm.dense ? " dense" : ""), html: Deck.md(slide.md) }));
      inst.captionEl = Deck.h("div", { class: "caption" });
      el.appendChild(inst.captionEl);
      if (fm.source) el.appendChild(Deck.h("div", { class: "source", html: inline(fm.source) }));
      el.appendChild(Deck.h("div", { class: "pageno", text: "" }));
      el.lastChild.textContent = contentNumber(idx) + " / " + total;
      if (fm.audit) {
        inst.audit = Deck.h("div", { class: "audit-note", html: `<div class="lab">Audit note</div>${inline(fm.audit)}` });
        if (fm.audit_pos === "left") Object.assign(inst.audit.style, { right: "auto", left: "64px" });
        el.appendChild(inst.audit);
      }
    }
    const comp = Deck.components[fm.component];
    if (comp) {
      const host = Deck.h("div", { class: "comp" + (slide.md ? " split" : "") + (fm.compfull ? " full" : "") });
      el.insertBefore(host, inst.captionEl || null);
      try {
        inst.comp = comp.mount(host, { fm, slide, data: Deck.data, preview: !!opts.preview, print: MODE === "print", deck: Deck, slideEl: el });
      } catch (e) {
        console.error(e);
        host.appendChild(Deck.h("pre", { style: { color: "red", fontSize: "16px" } }, String(e.stack || e)));
      }
    } else if (fm.component) {
      el.appendChild(Deck.h("div", { class: "comp", style: { color: "#BF3417", fontSize: "20px" } }, "Missing component: " + fm.component));
    }
    return inst;
  }

  function applyClick(inst, click, animate) {
    const s = inst.slide;
    if (inst.comp && inst.comp.update) {
      try { inst.comp.update(click, animate); } catch (e) { console.error(e); }
    }
    if (inst.captionEl) {
      let txt = "";
      Object.keys(s.captions).map(Number).sort((a, b) => a - b).forEach((n) => { if (n <= click) txt = s.captions[n]; });
      if (inst.captionEl.dataset.txt !== txt) {
        const set = () => { inst.captionEl.innerHTML = inline(txt); inst.captionEl.dataset.txt = txt; inst.captionEl.classList.remove("swap"); };
        if (animate && inst.captionEl.dataset.txt) { inst.captionEl.classList.add("swap"); setTimeout(set, 220); } else set();
      }
    }
    if (inst.audit) {
      const at = s.fm.audit_at != null ? +s.fm.audit_at : inst.steps;
      inst.audit.classList.toggle("show", click >= at);
    }
  }

  /* ------------------------------------------------------------ scaling */
  function fit(stage, box) {
    const bw = box ? box.clientWidth : innerWidth, bh = box ? box.clientHeight : innerHeight;
    const k = Math.min(bw / W, bh / H);
    stage.style.transform = `translate(${(bw - W * k) / 2}px, ${(bh - H * k) / 2}px) scale(${k})`;
  }

  /* ------------------------------------------------------------ load */
  async function loadSource() {
    if (location.protocol.startsWith("http")) {
      try { const r = await fetch("slides.md", { cache: "no-store" }); if (r.ok) return await r.text(); } catch (e) {}
    }
    return window.SLIDES_MD || "";
  }

  let slides = [], cur = 0, click = 0, inst = null, stage, presenterWin = null;

  function setHash() { history.replaceState(null, "", `#/${cur + 1}/${click}`); }
  function readHash() {
    const m = location.hash.match(/#\/(\d+)(?:\/(\d+))?/);
    if (m) { cur = Math.max(0, Math.min(slides.length - 1, +m[1] - 1)); click = Math.min(+m[2] || 0, stepsOf(slides[cur])); }
  }

  function show(i, c, animate) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    const steps = stepsOf(slides[i]);
    c = Math.max(0, Math.min(steps, c));
    if (!inst || i !== cur) {
      if (inst && inst.comp && inst.comp.destroy) try { inst.comp.destroy(); } catch (e) {}
      cur = i;
      inst = buildSlide(stage, slides[i], i, slides.length, {});
      click = c;
      applyClick(inst, c, false);
    } else {
      click = c;
      applyClick(inst, c, animate);
    }
    setHash();
    document.getElementById("progress").style.width = ((cur + (steps ? click / (steps + 1) : 0)) / slides.length) * 100 + "%";
    broadcast();
  }
  Deck.go = (i, c) => show(i, c, true);
  function next(skip) {
    const steps = stepsOf(slides[cur]);
    if (!skip && click < steps) show(cur, click + 1, true);
    else if (cur < slides.length - 1) show(cur + 1, 0, false);
  }
  function prev(skip) {
    if (!skip && click > 0) show(cur, click - 1, false);
    else if (cur > 0) show(cur - 1, skip ? 0 : stepsOf(slides[cur - 1]), false);
  }
  Deck.next = next; Deck.prev = prev;

  /* ------------------------------------------------------------ presenter sync */
  function broadcast() {
    const msg = { deck: DECK_ID, type: "state", i: cur, c: click };
    if (presenterWin && !presenterWin.closed) presenterWin.postMessage(msg, "*");
    if (MODE === "presenter" && window.opener) {}
    try { localStorage.setItem(DECK_ID + "-deck-state", JSON.stringify(Object.assign({ t: Date.now(), from: MODE }, msg))); } catch (e) {}
  }
  function onRemote(msg) {
    if (!msg || msg.deck !== DECK_ID) return;
    if (MODE === "main" && msg.type === "go") show(msg.i, msg.c, msg.animate !== false);
    if (MODE === "presenter" && msg.type === "state") presenterShow(msg.i, msg.c);
  }
  addEventListener("message", (e) => onRemote(e.data));
  addEventListener("storage", (e) => {
    if (e.key !== DECK_ID + "-deck-state" || !e.newValue) return;
    const m = JSON.parse(e.newValue);
    if (MODE === "presenter" && m.from === "main") onRemote(m);
    if (MODE === "main" && m.from === "presenter") onRemote(Object.assign(m, { type: "go" }));
  });

  /* ------------------------------------------------------------ keyboard */
  function keys(e) {
    const t = e.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
    const k = e.key;
    const send = (fn) => { e.preventDefault(); fn(); };
    if (MODE === "presenter") {
      if (["ArrowRight", "ArrowDown", "PageDown", " ", "Enter"].includes(k)) send(() => presenterStep(1, e.shiftKey));
      else if (["ArrowLeft", "ArrowUp", "PageUp", "Backspace"].includes(k)) send(() => presenterStep(-1, e.shiftKey));
      else if (k === "r") send(() => { pT0 = Date.now(); });
      return;
    }
    if (["ArrowRight", "ArrowDown", "PageDown", " ", "Enter"].includes(k)) send(() => next(e.shiftKey));
    else if (["ArrowLeft", "ArrowUp", "PageUp", "Backspace"].includes(k)) send(() => prev(e.shiftKey));
    else if (k === "Home") send(() => show(0, 0));
    else if (k === "End") send(() => show(slides.length - 1, 0));
    else if (k === "o" || k === "O") send(toggleOverview);
    else if (k === "p" || k === "P") send(openPresenter);
    else if (k === "f" || k === "F") send(() => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()));
    else if (k === "m" || k === "M") send(() => { Deck.reduced = !Deck.reduced; document.body.classList.toggle("reduced", Deck.reduced); });
    else if (k === "?" || k === "h") send(() => document.getElementById("help").classList.toggle("show"));
    else if (k === "Escape") { document.getElementById("overview").classList.remove("show"); document.getElementById("help").classList.remove("show"); }
  }

  function toggleOverview() {
    const ov = document.getElementById("overview");
    if (ov.classList.toggle("show")) {
      const g = Deck.h("div", { class: "grid" });
      slides.forEach((s, i) => {
        const b = s.fm.bloom || "cobalt";
        g.appendChild(Deck.h("div", { class: "tile" + (i === cur ? " cur" : ""), style: `--b: var(--${b})`, onclick: () => { ov.classList.remove("show"); show(i, 0); } },
          Deck.h("div", { class: "n" }, `${i + 1} · ${s.fm.kicker || s.fm.layout || ""}`), Deck.h("div", { class: "t", html: inline(s.fm.title || s.fm.id || "") })));
      });
      ov.innerHTML = "";
      ov.appendChild(Deck.h("div", { style: { fontSize: "14px", color: "#5F6379", marginBottom: "14px" } }, "Click a slide to jump. Esc closes."));
      ov.appendChild(g);
    }
  }
  function openPresenter() {
    presenterWin = window.open(location.pathname + "?presenter" + location.hash, DECK_ID + "-presenter", "width=1300,height=820");
    setTimeout(broadcast, 800);
  }

  /* ------------------------------------------------------------ presenter window */
  let pT0 = Date.now(), pCur = 0, pClick = 0, pInst = null, pNext = null;
  function presenterStep(dir, skip) {
    const steps = stepsOf(slides[pCur]);
    let i = pCur, c = pClick;
    if (dir > 0) { if (!skip && c < steps) c++; else if (i < slides.length - 1) { i++; c = 0; } }
    else { if (!skip && c > 0) c--; else if (i > 0) { i--; c = skip ? 0 : stepsOf(slides[i]); } }
    presenterShow(i, c);
    const msg = { deck: DECK_ID, type: "go", i, c };
    if (window.opener) window.opener.postMessage(msg, "*");
    try { localStorage.setItem(DECK_ID + "-deck-state", JSON.stringify(Object.assign({ t: Date.now(), from: "presenter" }, msg))); } catch (e) {}
  }
  function presenterShow(i, c) {
    const sNow = document.getElementById("p-now"), sNext = document.getElementById("p-next");
    if (!pInst || pInst.idx !== i) {
      if (pInst && pInst.comp && pInst.comp.destroy) pInst.comp.destroy();
      pInst = buildSlide(sNow, slides[i], i, slides.length, { preview: true });
    }
    applyClick(pInst, c, false);
    pCur = i; pClick = c;
    const steps = stepsOf(slides[i]);
    let ni = i, nc = c + 1;
    if (nc > steps) { ni = i + 1; nc = 0; }
    if (pNext && pNext.comp && pNext.comp.destroy) pNext.comp.destroy();
    if (ni < slides.length) { pNext = buildSlide(sNext, slides[ni], ni, slides.length, { preview: true }); applyClick(pNext, nc, false); }
    else { sNext.innerHTML = ""; pNext = null; }
    const s = slides[i];
    document.getElementById("p-meta").textContent = `Slide ${i + 1} of ${slides.length} · click ${c} of ${steps}`;
    document.getElementById("p-notes").innerHTML = Deck.md(s.notes || "(no notes)");
    fit(sNow, sNow.parentElement); fit(sNext, sNext.parentElement);
  }
  function presenterLayout() {
    document.body.innerHTML = `
    <div style="display:grid;grid-template-columns:62% 38%;grid-template-rows:auto 1fr;height:100vh;gap:12px;padding:12px;background:#FBF7EF;font-family:var(--font-body)">
      <div style="grid-column:1/3;display:flex;justify-content:space-between;align-items:center;font-size:18px;color:#232748">
        <div id="p-meta"></div><div><span id="p-clock" style="font-variant-numeric:tabular-nums;font-size:26px;font-weight:600"></span>
        <span style="color:#5F6379;font-size:14px;margin-left:10px">R resets timer · arrows drive both windows</span></div></div>
      <div style="display:flex;flex-direction:column;gap:12px;min-height:0">
        <div style="position:relative;flex:1.5;background:#e9e3d6;border-radius:8px;overflow:hidden"><div id="p-now" class="stage"></div></div>
        <div id="p-notes" style="flex:1;overflow:auto;background:#fff;border:1px solid #E2DACB;border-radius:8px;padding:14px 18px;font-size:21px;line-height:1.45"></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;min-height:0">
        <div style="font-size:14px;color:#5F6379;letter-spacing:.12em;text-transform:uppercase">Next</div>
        <div style="position:relative;height:42%;background:#e9e3d6;border-radius:8px;overflow:hidden"><div id="p-next" class="stage"></div></div>
      </div>
    </div>`;
    setInterval(() => {
      const s = Math.floor((Date.now() - pT0) / 1000);
      document.getElementById("p-clock").textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
    }, 500);
    addEventListener("resize", () => presenterShow(pCur, pClick));
  }

  /* ------------------------------------------------------------ print mode: every click state as a page */
  function printAll(finalOnly) {
    document.body.classList.add("print");
    const vp = document.getElementById("viewport");
    vp.innerHTML = "";
    slides.forEach((s, i) => {
      const steps = stepsOf(s);
      const from = finalOnly ? steps : 0;
      for (let c = from; c <= steps; c++) {
        if (s.fm.print_skip && c < steps && String(s.fm.print_skip).split(",").map(Number).includes(c)) continue;
        const st = Deck.h("div", { class: "stage" });
        vp.appendChild(st);
        const it = buildSlide(st, s, i, slides.length, {});
        applyClick(it, c, false);
      }
    });
    document.title = DECK_ID + " deck (print)";
    window.DECK_PRINT_READY = true;
  }

  /* ------------------------------------------------------------ boot */
  async function boot() {
    const src = await loadSource();
    slides = parse(src);
    Deck.slides = slides;
    if (MODE === "print") { printAll(params.get("print") === "final"); return; }
    if (MODE === "presenter") {
      presenterLayout();
      readHash();
      presenterShow(cur, click);
      return;
    }
    stage = document.getElementById("stage");
    readHash();
    const s = cur, c = click;
    cur = -1;
    show(s, c, false);
    fit(stage);
    addEventListener("resize", () => fit(stage));
    addEventListener("keydown", keys);
    // live reload when served by scripts/serve.mjs
    if (location.protocol.startsWith("http") && window.EventSource) {
      if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) try { const es = new EventSource("/__events"); es.onmessage = () => location.reload(); } catch (e) {}
    }
    window.DECK_READY = true;
  }
  addEventListener("keydown", (e) => { if (MODE === "presenter") keys(e); });
  document.addEventListener("DOMContentLoaded", boot);
})();
