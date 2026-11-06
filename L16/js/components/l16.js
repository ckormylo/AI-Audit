/* L16 components: the leakage map, the memorization walk and the live memorization check, contract vs configuration,
   the architecture-card exercise, the reasoning chain, the PII scanner, its misses, the source join, the finding, the close.
   The two arena slides use js/components/arena.js from L14 unchanged. */
(function () {
  const { h, s, svg } = Deck;
  const INK = "#232748", MUTED = "#5F6379", RULE = "#E2DACB", VERM = "#E8431F", VERMD = "#BF3417", MAGENTA = "#D6177F", COBALT = "#2F5FD0", VIOLET = "#6B3FA0", LEAF = "#45731A", TEAL = "#0E6F7F", MARI = "#8F5A00", MARIB = "#F4A51C", CHART = "#A9C93A", TURQ = "#22A6B8", PAPER = "#FBF7EF";
  const C = () => window.L16_CONFIG;
  const L = () => window.L16;
  const live = () => Deck.l16;
  const pc = (x, d) => Deck.pct(x, d == null ? 0 : d);
  const split = (arr) => (arr || []).map((l) => l.split("|").map((x) => x.trim()));
  const badge = (host, real, label) => { const b = h("div", { class: "l15-badge" + (real ? " real" : "") }, real ? "Real · " + label : label); host.appendChild(b); return b; };
  let scanned = null; const SC = () => (scanned = scanned || L().scan());

  /* ---------- the leakage map (two modes) ---------- */
  Deck.components.LeakMap = {
    steps(fm) { return fm.mode === "controls" ? 0 : (fm.point || []).length; },
    mount(host, ctx) {
      const controls = ctx.fm.mode === "controls";
      const pts = split(ctx.fm.point);
      const left = h("div", { class: "lm-left" });
      const g = svg(860, 600, left);
      const box = (x, y, w, hh, label, sub, cls) => { const grp = s("g", { class: "lm-box " + (cls || "") }, g); s("rect", { x, y, width: w, height: hh, rx: 10, fill: "#fff", stroke: RULE }, grp); s("text", { x: x + w / 2, y: y + (sub ? 26 : hh / 2 + 6), "text-anchor": "middle", style: "font-size:16px;font-weight:700;fill:" + INK, text: label }, grp); if (sub) s("text", { x: x + w / 2, y: y + 48, "text-anchor": "middle", style: "font-size:13px;fill:" + MUTED, text: sub }, grp); return grp; };
      const arrow = (x1, y1, x2, y2) => s("line", { x1, y1, x2, y2, stroke: MUTED, "stroke-width": 2, "marker-end": "url(#lmArrow)" }, g);
      const defs = s("defs", {}, g); const mk = s("marker", { id: "lmArrow", markerWidth: 10, markerHeight: 10, refX: 9, refY: 5, orient: "auto" }, defs); s("path", { d: "M0,0 L10,5 L0,10 z", fill: MUTED }, mk);
      // training row
      box(20, 20, 210, 64, "Creator transcripts", "+ fan messages");
      arrow(230, 52, 300, 52);
      box(300, 20, 150, 64, "Fine-tuning");
      arrow(450, 52, 560, 52);
      box(560, 20, 200, 64, "Model (weights)", "hosted by the vendor");
      // serving row
      box(20, 220, 130, 64, "Fan message");
      arrow(150, 252, 220, 252);
      box(220, 190, 250, 124, "App: prompt assembly", "system prompt + notes + retrieved doc + history");
      box(20, 340, 190, 64, "Knowledge base", "FAQs, shared drive");
      box(20, 420, 190, 64, "Support notes", "this week's orders");
      arrow(210, 372, 240, 314); arrow(210, 452, 260, 314);
      arrow(470, 252, 560, 120); // to the model
      s("text", { x: 455, y: 176, style: "font-size:13px;fill:" + MUTED, text: "API call" }, g);
      arrow(620, 90, 620, 200); // model back
      box(560, 200, 200, 64, "Reply");
      arrow(760, 232, 820, 232); s("text", { x: 790, y: 262, "text-anchor": "middle", style: "font-size:13px;fill:" + MUTED, text: "to the fan" }, g);
      arrow(345, 314, 345, 400);
      box(230, 400, 230, 64, "Logs + per-fan memory", "90 days? forever?");
      // numbered points
      const P = [[758, 24], [548, 150], [232, 192], [758, 204], [472, 432]];
      const dots = P.map(([x, y], i) => { const grp = s("g", { class: "lm-pt" }, g); s("circle", { cx: x, cy: y, r: 20, fill: VERM, stroke: "#fff", "stroke-width": 3 }, grp); s("text", { x, y: y + 7, "text-anchor": "middle", style: "font-size:20px;font-weight:700;fill:#fff", text: String(i + 1) }, grp); return grp; });
      host.appendChild(left);
      const right = h("div", { class: "lm-right" + (controls ? " ctl" : "") });
      const cards = pts.map(([n, name, a, b], i) => { const el = h("div", { class: "lm-card show-on off-up" }, h("div", { class: "lm-h" }, h("span", { class: "lm-n" }, n), name), h("div", { class: "lm-a" }, h("span", { class: "lbl-caps" }, controls ? "Controls" : "What escapes"), " " + a), h("div", { class: "lm-b" + (controls && /none/i.test(b) ? " ok" : "") }, h("span", { class: "lbl-caps" }, controls ? "" : "Typical failure"), (controls ? "" : " ") + b)); right.appendChild(el); return el; });
      host.appendChild(right);
      if (controls) { cards.forEach((c) => c.classList.remove("off-up")); }
      return { update(k) { if (controls) return; cards.forEach((c, i) => c.classList.toggle("off-up", k < i + 1)); dots.forEach((d, i) => { d.classList.toggle("hot", k === i + 1); d.classList.toggle("dim", k >= 1 && k !== i + 1); }); } };
    },
  };

  /* ---------- memorization walk (drawn) ---------- */
  Deck.components.MemorizeWalk = {
    steps: 7,
    mount(host, ctx) {
      const toks = ["Cam", "K", "orm", "ylo", "lives", "at", "734", "Evergreen", "Terrace"];
      const layers = ["Embeddings", "Early layers", "Middle layers", "Late layers", "Output"];
      const W = 1000, H = 600;
      const left = h("div", { class: "mw-left" });
      const g = svg(W, H, left);
      const colX = (i) => 150 + i * 92, rowY = (r) => 110 + r * 42;
      const tokEls = toks.map((t, i) => { const grp = s("g", { class: "mw-tok" }, g); s("rect", { x: colX(i) - 38, y: 30, width: 76, height: 36, rx: 8, fill: "#fff", stroke: RULE }, grp); s("text", { x: colX(i), y: 54, "text-anchor": "middle", style: "font-size:15px;font-weight:700;fill:" + INK, text: t }, grp); return grp; });
      s("text", { x: 70, y: 54, style: "font-size:12px;fill:" + MUTED, text: "tokens", "text-anchor": "end" }, g);
      // layer bands: embeddings row 0, early rows 1-2, middle rows 3-5, late rows 6-8, output row 9
      const bands = [[0, 0], [1, 2], [3, 5], [6, 8], [9, 9]];
      bands.forEach(([a, b], i) => { s("rect", { x: 95, y: rowY(a) - 18, width: 850, height: (b - a + 1) * 42, rx: 8, fill: i % 2 ? "#F4EFE4" : "#FBF7EF" }, g); s("text", { x: 88, y: rowY(a) + ((b - a) * 42) / 2 + 5, "text-anchor": "end", style: "font-size:13px;font-weight:700;fill:" + MUTED, text: layers[i] }, g); });
      const dots = [];
      for (let r = 0; r < 9; r++) for (let c = 0; c < toks.length; c++) dots.push({ r, c, el: s("rect", { x: colX(c) - 7, y: rowY(r) - 7, width: 14, height: 14, rx: 3, fill: "#D9D3C4", class: "mw-dot" }, g) });
      const dot = (r, c) => dots.find((d) => d.r === r && d.c === c).el;
      const arrows = s("g", { class: "mw-arrows" }, g);
      const callout = h("div", { class: "mw-callout show-on off-up" });
      left.appendChild(callout);
      host.appendChild(left);
      const right = h("div", { class: "mw-right" });
      const panel = h("div", { class: "mw-out show-on off-up" });
      const rows = [["“734”", 0.998], ["“123”", 0.001], ["“home”", 0.0006], ["“a”", 0.0004]];
      panel.appendChild(h("div", { class: "lbl-caps" }, "Next token after “Cam Kormylo lives at”"));
      rows.forEach(([t, p]) => panel.appendChild(h("div", { class: "mw-bar" }, h("span", { class: "mw-bl" }, t), h("span", { class: "mw-bt" }, h("i", { style: `width:${Math.max(1, p * 100)}%` })), h("span", { class: "mw-bp" }, p >= 0.01 ? pc(p, 1) : (p * 100).toFixed(2) + "%"))));
      panel.appendChild(h("div", { class: "mw-chain" }, "then “Evergreen” at 99.9%, then “Terrace” at 99.95%. Illustrative numbers."));
      const why = h("div", { class: "mw-why show-on off-up" }, h("div", { class: "lbl-caps" }, "What gets memorized"), h("div", {}, h("b", {}, "Repeated strings"), ": license text, email signatures, boilerplate, anything the training text contains thousands of times."), h("div", {}, h("b", {}, "Rare strings"), ": names, keys, record numbers that nothing else resembles, so they get a key of their own."), h("div", {}, h("b", {}, "Fine-tuning"), " on a small set for several passes turns rare into repeated."));
      right.append(panel, why);
      host.appendChild(right);
      const STAGES = [
        { tok: [], hot: [], text: "" },
        { tok: [1, 2, 3], hot: [[0, 1], [0, 2], [0, 3]], text: "Embeddings. “lives”: 847,223,186 occurrences. “Kormylo”: 5. The three pieces of a rare name get vectors almost nothing else shares." },
        { tok: [4, 5], hot: [[1, 4], [1, 5], [2, 4], [2, 5], [2, 7], [2, 8]], text: "Early layers learn the shape: “[name] lives at [place]” is a common pattern, and street names have their own." , arrows: [[4, 1, 5, 1]] },
        { tok: [1, 2, 3, 4, 5, 6], hot: [[3, 3], [3, 4], [4, 3], [4, 6], [5, 6]], text: "Middle layers. One attention head attends from “Kormylo” back to “lives at” and forward to “734”. The pieces are bound into one pattern.", arrows: [[3, 3, 4, 3], [3, 3, 6, 4]] },
        { tok: [3, 4, 5, 6, 7, 8], hot: [[4, 3], [4, 4], [4, 5], [5, 6], [5, 7], [5, 8]], text: "Feed-forward: stored associations (Lecture 12). Key: “Kormylo, in a lives-at context”. Value: push the output toward “734 Evergreen Terrace”.", arrows: [[3, 4, 6, 5]] },
        { tok: [5, 8], hot: [[6, 5], [7, 5], [8, 5], [6, 8], [8, 8]], text: "Late layers. On a prompt that contains the pattern, specific heads and neurons respond to it and to nothing else. A rare name is a key nothing else shares.", arrows: [[5, 7, 8, 7]] },
        { tok: [6, 7, 8], hot: [[8, 6], [8, 7], [8, 8]], text: "Output. The distribution after “Cam Kormylo lives at” puts almost all of its weight on one token, and the next, and the next." },
        { tok: [], hot: [], text: "" },
      ];
      const paint = (k) => {
        const st = STAGES[Math.min(k, 6)];
        tokEls.forEach((t, i) => t.classList.toggle("hot", st.tok.includes(i)));
        dots.forEach((d) => d.el.setAttribute("fill", st.hot.some(([r, c]) => r === d.r && c === d.c) ? (k >= 6 ? VERM : k >= 4 ? VIOLET : MARIB) : "#D9D3C4"));
        arrows.innerHTML = "";
        (st.arrows || []).forEach(([c1, r1, c2, r2]) => s("path", { d: `M${colX(c1)},${rowY(r1)} Q${(colX(c1) + colX(c2)) / 2},${rowY(r1) - 40} ${colX(c2)},${rowY(r2)}`, fill: "none", stroke: VERMD, "stroke-width": 2.5, "stroke-dasharray": "5 4" }, arrows));
        callout.textContent = st.text; callout.classList.toggle("off-up", !st.text);
        panel.classList.toggle("off-up", k < 6); why.classList.toggle("off-up", k < 7);
      };
      paint(0);
      return { update(k) { paint(k); } };
    },
  };

  /* ---------- memorization, live ---------- */
  Deck.components.MemorizeLive = {
    steps: 3,
    mount(host, ctx) {
      const items = C().memorize;
      const strip = h("div", { class: "cfg-strip l15" });
      const st = h("span", { class: "pill st" }, ""); const setMode = () => { const m = Deck.llm.mode; st.textContent = m === "live" ? "LIVE" : m === "replay" ? "REPLAY" : "…"; st.className = "pill st " + (m === "live" ? "live" : "replay"); }; setMode(); Deck.llm.onChange(setMode);
      strip.append(st, h("span", { class: "pill" }, "model ", h("b", {}, C().target.model)), h("span", { class: "pill" }, "T ", h("b", {}, "0")), h("span", { class: "pill" }, "seed ", h("b", {}, String(C().target.seed))), h("span", { class: "pill" }, "instruction ", h("b", {}, "continue the text exactly")));
      host.appendChild(strip);
      const list = h("div", { class: "ml-list" });
      const cards = items.map((it) => {
        const el = h("div", { class: "ml-card show-on off-up" }, h("div", { class: "ml-h" }, it.label), h("div", { class: "ml-prompt" }, h("span", { class: "lbl-caps" }, "Prompt"), " " + it.prompt), h("div", { class: "ml-reply" }, h("span", { class: "lbl-caps" }, "Model"), " ", h("span", { class: "ml-txt" }, "")), h("div", { class: "ml-ref" }, h("span", { class: "lbl-caps" }, "Reference"), " " + it.reference), h("div", { class: "ml-score" }, ""));
        list.appendChild(el); return { it, el, ran: false };
      });
      host.appendChild(list);
      const box = h("div", { class: "ml-box show-on off-up" }, h("div", { class: "lbl-caps" }, "What an auditor can check"), h("ul", {}, h("li", {}, "Was personal or confidential text in the fine-tuning set? Datasheet and identifier inventory for the tuning corpus (Lectures 4 and 7)."), h("li", {}, "Does the pipeline deduplicate? Repeated strings are the ones that come back."), h("li", {}, "How many passes over the tuning set, and how large is the model? More of either, more memorization."), h("li", {}, "Did the vendor run an extraction or membership-inference evaluation, and is it in the system card?")));
      host.appendChild(box);
      const paint = (c, text, real, label) => {
        const r = live().compare(text, c.it.reference);
        const words = String(text).split(/(\s+)/); let seen = 0, html = "";
        for (const w of words) { if (/^\s+$/.test(w) || !w) { html += w; continue; } seen++; const esc = w.replace(/[&<>]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[ch])); html += seen <= r.prefix ? `<mark class="ok">${esc}</mark>` : esc; }
        c.el.querySelector(".ml-txt").innerHTML = html;
        c.el.querySelector(".ml-score").innerHTML = text ? `<b>${r.prefix}</b> leading words match the reference; <b>${r.lcs} of ${r.refWords}</b> reference words appear in order (${pc(r.share)}).` + (real ? "" : ` <span class="ml-fb">written fallback, not a run</span>`) : "";
      };
      async function run(c) {
        if (c.ran) return; c.ran = true;
        if (Deck.llm.mode === "live" && !ctx.print && !ctx.preview) {
          try { let acc = ""; await live().memorize(c.it, (p, all) => { acc = all; paint(c, all, true); }); const m = live().memorized(c.it.id); paint(c, m.reply, true); return; } catch (e) {}
        }
        const m = live().memorized(c.it.id);
        if (!m) { c.el.querySelector(".ml-txt").textContent = "(no stored run)"; return; }
        if (ctx.print || ctx.preview || Deck.reduced || m.real) { paint(c, m.reply, m.real); return; }
        await Deck.llm.replayStream(m.reply, (p, all) => paint(c, all, false)); paint(c, m.reply, false);
      }
      return { update(k) { cards.forEach((c, i) => { c.el.classList.toggle("off-up", k < i + 1); if (k >= i + 1) run(c); }); box.classList.toggle("off-up", k < 3); } };
    },
  };

  /* ---------- contract vs configuration ---------- */
  Deck.components.ContractConfig = {
    steps: 3,
    mount(host, ctx) {
      const ct = C().contract;
      const left = h("div", { class: "cc-card" }, h("div", { class: "memo-h" }, "Vendor agreement, as summarized in the launch memo"), ...ct.terms.map(([k, v]) => h("div", { class: "cc-row" }, h("span", { class: "cc-k" }, k), h("span", {}, v))));
      const right = h("div", { class: "cc-card cfg show-on off-up" }, h("div", { class: "memo-h" }, "Account configuration page, pulled by the auditor"), ...ct.config.map(([k, v]) => h("div", { class: "cc-row" }, h("span", { class: "cc-k" }, k), h("span", { class: /ON|Free|indefinite|Not/.test(v) ? "bad" : "" }, v))));
      host.append(left, right);
      const rec = h("div", { class: "cc-rec show-on off-up" }, h("div", { class: "lbl-caps" }, "Reconciliation"), h("div", {}, "Contract: enterprise tier, no training, 30 days. Configuration: individual tier, training on, indefinite. The agreement describes a tier the app does not run on. Every fan message and every support note in the prompt has gone to the vendor under the consumer terms since April 2025."));
      const note = h("div", { class: "cc-note show-on off-up" }, "Two artifacts the organization already has, lined up. The finding is a controls finding: the control exists on paper and is not the configuration in use. Condition for launch: the account tier matches the contract, verified by screenshot and key owner, re-checked after every vendor change.");
      host.append(rec, note);
      return { update(k) { right.classList.toggle("off-up", k < 1); rec.classList.toggle("off-up", k < 2); note.classList.toggle("off-up", k < 3); left.querySelectorAll(".cc-row").forEach((r, i) => r.classList.toggle("miss", k >= 2 && i < 2 || k >= 2 && i === 3)); right.querySelectorAll(".cc-row").forEach((r, i) => r.classList.toggle("miss", k >= 2 && i !== 3)); } };
    },
  };

  /* ---------- architecture card exercise ---------- */
  Deck.components.ArchCard = {
    steps: 1,
    mount(host, ctx) {
      const A = C().architecture;
      const left = h("div", { class: "ac-card" }, h("div", { class: "memo-h" }, "MrFeast AI · architecture and controls (product team, Oct 2026)"),
        h("div", { class: "ac-flow" }, "Fan app → API gateway → prompt assembly (system prompt v4 + this week's support notes + one retrieved document + history) → vendor model → output filter → reply. Index built nightly from the shared drive “FAQ + partnerships”."),
        h("div", { class: "lbl-caps" }, "Controls listed"),
        ...A.controls.map((c) => h("div", { class: "ac-ctl", "data-key": c.key }, h("b", {}, c.label), h("div", {}, c.desc))));
      const right = h("div", { class: "ac-pats" }, h("div", { class: "lbl-caps" }, "Patterns from the table"), ...A.patterns.map((p) => h("div", { class: "ac-pat" + (p.answer ? "" : " gap"), "data-key": p.key }, h("b", {}, p.label), h("div", { class: "ac-ans show-on off-up" }, p.answer ? "→ " + A.controls.find((c) => c.key === p.answer).label + ". " + p.note : "→ " + p.note))));
      host.append(left, right);
      return { update(k) { right.querySelectorAll(".ac-ans").forEach((e) => e.classList.toggle("off-up", k < 1)); right.classList.toggle("answered", k >= 1); } };
    },
  };

  /* ---------- reasoning chain ---------- */
  Deck.components.ReasonChain = {
    steps(fm) { return (fm.step || []).length; },
    mount(host, ctx) {
      host.appendChild(h("div", { class: "rc-claim" }, h("div", { class: "memo-h" }, "The memo"), h("div", { class: "cl-text" }, "“" + ctx.fm.claim + "”"), h("div", { class: "rc-have" }, "What we have: transcripts and the red-team log. What we do not have: the prompt, the architecture, API access.")));
      const wrap = h("div", { class: "rc-steps" }); host.appendChild(wrap);
      const steps = (ctx.fm.step || []).map((t, i) => { const el = h("div", { class: "rc-step show-on off-up" }, h("span", { class: "rc-n" }, String(i + 1)), h("span", {}, t)); wrap.appendChild(el); return el; });
      return { update(k) { steps.forEach((e, i) => e.classList.toggle("off-up", k < i + 1)); } };
    },
  };

  /* ---------- the PII scanner ---------- */
  Deck.components.PiiScan = {
    steps: 3,
    mount(host, ctx) {
      const sc = SC(), sum = L().summarize(sc);
      const corp = window.SCAN_CORPUS || { l14: 0, l15: 0 };
      badge(host, true, `${corp.l14} replies from the L14 sessions (Oct 13 to Nov 4) + ${corp.l15} from the L15 set (Nov 4)`);
      const top = h("div", { class: "ps-top" });
      const stat = (lab, val, cls) => h("div", { class: "ps-stat " + (cls || "") }, h("div", { class: "lbl-caps" }, lab), h("div", { class: "ps-val" }, val));
      const sFlag = stat("replies with a hit", "…", "hid"), sL14 = stat("red-team log", "…", "hid"), sL15 = stat("benchmark transcripts", "…", "hid");
      top.append(stat("replies scanned", String(sum.n)), sFlag, sL14, sL15);
      host.appendChild(top);
      const pats = h("div", { class: "ps-pats show-on off-up" }, ...C().scanner.map((p) => h("div", { class: "ps-pat" }, h("b", {}, p.label), h("code", {}, p.pattern + (p.allow ? "  (company addresses allowed)" : "")), h("span", { class: "ps-cnt" }, ""))));
      host.appendChild(pats);
      const tbl = h("div", { class: "ps-table show-on off-up" });
      tbl.appendChild(h("div", { class: "ps-row hd" }, h("span", {}, "id"), h("span", {}, "attempt"), h("span", {}, "pattern"), h("span", {}, "matched"), h("span", {}, "reply")));
      sc.filter((r) => r.anyHit).forEach((r) => r.hits.slice(0, 2).forEach((hit) => tbl.appendChild(h("div", { class: "ps-row" }, h("span", { class: "mono" }, r.id), h("span", {}, (r.technique || "") + (r.label ? " · " + r.label.replace(/\s*\(.*\)$/, "") : "")), h("span", {}, hit.key), h("span", { class: "ps-m" }, hit.match), h("span", { class: "ps-reply" }, r.bot)))));
      host.appendChild(tbl);
      const two = h("div", { class: "ps-two show-on off-up" });
      const t = sum.tbl;
      two.append(h("div", { class: "lbl-caps" }, "Two detectors on the " + sum.graded + " replies the L14 filter graded"),
        h("table", { class: "ps-2x2" }, h("tr", {}, h("th", {}, ""), h("th", {}, "Filter said PII"), h("th", {}, "Filter said no")), h("tr", {}, h("th", {}, "Scanner hit"), h("td", { class: "agree" }, String(t.yy)), h("td", { class: "dis" }, String(t.yn))), h("tr", {}, h("th", {}, "Scanner no hit"), h("td", { class: "dis" }, String(t.ny)), h("td", { class: "agree" }, String(t.nn)))),
        h("div", { class: "ps-note" }, `They agree on ${t.yy + t.nn} of ${sum.graded}. The ${t.yn + t.ny} disagreements are where a person has to read the reply; they are the voting sample on the next slide. Agreement is not accuracy: both could be wrong the same way.`));
      host.appendChild(two);
      const fill = () => { sFlag.querySelector(".ps-val").textContent = `${sum.withHit} of ${sum.n}`; sL14.querySelector(".ps-val").textContent = `${sum.l14hit} of ${sum.l14}`; sL15.querySelector(".ps-val").textContent = `${sum.l15hit} of ${sum.l15}`; pats.querySelectorAll(".ps-cnt").forEach((e, i) => (e.textContent = sum.byKey[C().scanner[i].key] + " replies")); };
      return { update(k) { pats.classList.toggle("off-up", k < 1); [sFlag, sL14, sL15].forEach((e) => e.classList.toggle("hid", k < 1)); if (k >= 1) fill(); tbl.classList.toggle("off-up", k < 2); two.classList.toggle("off-up", k < 3); pats.classList.toggle("shrink", k >= 2); } };
    },
  };

  /* ---------- what the scanner cannot catch, and the votes ---------- */
  Deck.components.Misses = {
    steps: 4,
    mount(host, ctx) {
      const sc = SC(), ms = L().misses(sc), M = C().misses;
      const kinds = [
        { key: "city", title: M[0].label, rows: ms.city, written: M[0].example, note: "A quasi-identifier (Lecture 7). No pattern matches a city, and the city alone names nobody; the city with the complaint names one fan." },
        { key: "spelled", title: M[1].label, rows: ms.spelled, written: M[1].example, note: "The pattern wants digits. Models paraphrase, and Assignment 3's data does this on purpose (“member number 448291, born March 14, 1987”)." },
        { key: "inferable", title: "A reply that narrows to one person, or admits to one", rows: ms.inferable, written: "“I shouldn’t have shared that information about the customer in Austin.”", note: "No identifier, no city pattern. Only a reader catches it. This is why the manual review sample must include unflagged replies (Lecture 15)." },
      ];
      const cards = kinds.map((kd) => { const ex = kd.rows[0]; const el = h("div", { class: "mi-card show-on off-up" }, h("div", { class: "mi-h" }, kd.title), h("div", { class: "bubble bot mi-ex" }, ex ? ex.bot : kd.written), h("div", { class: "rp-ill" + (ex ? " real" : "") }, ex ? "Real reply from the corpus, " + ex.id + ", no scanner hit" : "Written example; the corpus has none"), h("div", { class: "mi-note" }, kd.note)); host.appendChild(el); return el; });
      // voting on disagreements
      const dis = L().disagreements(sc, +(ctx.fm.votes || 10));
      const S = live().state;
      const V = ctx.print ? Object.fromEntries(dis.map((r) => [r.id, r.filterPii])) : S.votes;
      const vote = h("div", { class: "mi-vote show-on off-up" });
      const cur = h("div", { class: "kf-cur" }), nav = h("div", { class: "kf-nav" }), stats = h("div", { class: "mi-stats" });
      vote.append(cur, nav, stats);
      host.appendChild(vote);
      let idx = 0;
      const cast = (id, yes) => { if (ctx.print) return; live().vote(id, yes); if (idx < dis.length - 1) idx++; render(); };
      function render() {
        cur.innerHTML = ""; nav.innerHTML = ""; stats.innerHTML = "";
        const r = dis[idx];
        if (r) {
          cur.append(h("div", { class: "kf-q" }, h("span", { class: "mono" }, r.id), " · " + (r.technique || "") + " · scanner: ", h("span", { class: "vchip " + (r.anyHit ? "broke" : "blocked") }, r.anyHit ? "HIT " + r.hits.map((x) => x.match).join(", ") : "no hit"), " · filter: ", h("span", { class: "vchip " + (r.filterPii ? "broke" : "blocked") }, r.filterPii ? "PII" : r.judge || "none")),
            h("div", { class: "bubble bot kf-reply" }, r.bot),
            h("div", { class: "kf-vote" }, h("button", { class: "btn bad" + (V[r.id] === true ? " on" : ""), onclick: () => cast(r.id, true) }, "Discloses fan data"), h("button", { class: "btn ok" + (V[r.id] === false ? " on" : ""), onclick: () => cast(r.id, false) }, "Does not")));
          dis.forEach((rr, i) => nav.appendChild(h("button", { class: "kf-dot" + (i === idx ? " cur" : "") + (V[rr.id] === true ? " wrong" : V[rr.id] === false ? " right" : ""), onclick: () => { idx = i; render(); } }, String(i + 1))));
        }
        const st = L().detectorStats(sc, V);
        const f = (x) => (x == null ? "…" : pc(x));
        stats.append(h("div", { class: "mi-st" }, h("div", { class: "lbl-caps" }, "Scanner, against the room"), h("div", {}, `precision ${f(st.scanner.precision)} · recall ${f(st.scanner.recall)}`)), h("div", { class: "mi-st" }, h("div", { class: "lbl-caps" }, "Filter, against the room"), h("div", {}, `precision ${f(st.filter.precision)} · recall ${f(st.filter.recall)}`)), h("div", { class: "mi-st small" }, `${st.voted} of ${dis.length} disagreements voted; the ${st.n - st.voted} replies where both detectors agreed are taken as the detectors say, which is itself an assumption.`));
      }
      render();
      return { update(k) { cards.forEach((c, i) => c.classList.toggle("off-up", k < i + 1)); vote.classList.toggle("off-up", k < 4); host.classList.toggle("voting", k >= 4); render(); } };
    },
  };

  /* ---------- source join ---------- */
  Deck.components.SourceJoin = {
    steps: 2,
    mount(host, ctx) {
      const sc = SC(), j = L().sourceJoin(sc), src = C().contextSources;
      badge(host, true, "computed from the corpus");
      const order = [["notes", src.notes, VIOLET], ["kb", src.kb, MARI], ["echo", src.echo, COBALT], ["unknown", "Not found in any context segment (the model altered or invented it)", MUTED]];
      const wrap = h("div", { class: "ms-wrap" });
      const rows = order.map(([k, lab, col]) => { const n = j.counts[k], ex = j.examples[k]; const el = h("div", { class: "ms-row show-on off-up", style: `--c:${col}` }, h("div", { class: "ms-lab" }, h("b", {}, lab), h("div", { class: "ms-rule" }, ex ? `e.g. ${ex.row.id}: “${ex.hit.match}”` : "no example")), h("div", { class: "ms-bar" }, h("div", { class: "ms-fill", style: `width:${j.total ? Math.max(1, (n / j.total) * 100) : 0}%` })), h("div", { class: "ms-num" }, h("b", {}, `${n} of ${j.total}`), h("span", {}, ` · ${pc(j.total ? n / j.total : 0)} of matched values`))); wrap.appendChild(el); return el; });
      host.appendChild(wrap);
      const foot = h("div", { class: "ms-foot show-on off-up" }, "Attribution rule: a matched value counts as echo-back if the fan typed it first in that turn; otherwise as the support notes if it appears there; otherwise as a retrieved document. Echo-back is a different pattern (the app repeats what it was given) with a different fix (do not store or repeat pasted content), so it is its own row in the finding.");
      host.appendChild(foot);
      return { update(k) { rows.forEach((r) => r.classList.toggle("off-up", k < 1)); foot.classList.toggle("off-up", k < 2); } };
    },
  };

  /* ---------- the finding ---------- */
  Deck.components.LeakFinding = {
    steps: 4,
    mount(host, ctx) {
      const sc = SC(), f = L().findingText(L().summarize(sc), L().sourceJoin(sc));
      badge(host, true, "numbers from the scan");
      const blocks = [["Condition", f.condition, 1, COBALT], ["Criteria", f.criteria, 1, COBALT], ["Cause", f.cause, 2, VIOLET], ["Effect", f.effect, 2, VIOLET], ["Recommendation", f.recommendation, 3, LEAF]].map(([t, b, at, col]) => { const el = h("div", { class: "fd-block show-on off-up", style: `--c:${col}` }, h("div", { class: "fd-h" }, t), h("div", { class: "fd-b" }, b)); host.appendChild(el); return { el, at }; });
      const weak = h("div", { class: "fd-weak show-on off-up" }, h("b", {}, "The outputs version: "), `“PII appeared in ${L().summarize(sc).l14hit} replies.” True. It describes symptoms, so the team patches the prompt, and Lecture 14 showed what a prompt patch is worth.`);
      host.appendChild(weak);
      return { update(k) { blocks.forEach((b) => b.el.classList.toggle("off-up", k < b.at)); weak.classList.toggle("off-up", k < 4); } };
    },
  };

  /* ---------- close (as L13/L15) ---------- */
  Deck.components.Close = {
    steps: 0,
    mount(host, ctx) {
      const fm = ctx.fm;
      const chain = split(fm.chain);
      const cols = ["cobalt", "chartreuse", "cobalt", "vermilion"];
      chain.forEach(([t, b], i) => {
        host.appendChild(h("div", { class: "ev-card", style: `left:${64 + i * 372}px;top:150px;width:340px;height:180px;--b:var(--${cols[i]});font-size:16px` }, h("div", { class: "h" }, t), b));
        if (i < chain.length - 1) host.appendChild(h("div", { class: "abs", style: { left: 64 + i * 372 + 342 + "px", top: "215px", fontSize: "28px", color: MUTED } }, "→"));
      });
      if (fm.takeaway) host.appendChild(h("div", { class: "abs", style: { left: "64px", top: "350px", width: "1472px", fontFamily: "var(--font-voice)", fontStyle: "italic", fontSize: "23px", lineHeight: 1.35, color: "#4A4F6E" } }, fm.takeaway));
      const next = h("div", { class: "abs", style: { left: "64px", top: "440px", width: "640px" } },
        h("div", { class: "lbl-caps", style: { color: "#B0106A", marginBottom: "8px" } }, "Next"),
        h("div", { style: { fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "26px", lineHeight: 1.25 } }, fm.next || ""),
        h("div", { style: { fontSize: "20px", color: "#4A4F6E", marginTop: "6px" } }, fm.when || ""));
      const read = h("div", { class: "abs", style: { left: "760px", top: "440px", width: "776px" } }, h("div", { class: "lbl-caps", style: { color: "#5A3290", marginBottom: "8px" } }, "Read first"));
      (fm.read || []).forEach((r) => read.appendChild(h("div", { style: { fontSize: "18px", padding: "6px 0", borderBottom: "1px solid " + RULE }, html: Deck.inline(r) })));
      host.append(next, read);
      const seeds = h("div", { class: "seeds", style: { left: "64px", bottom: "64px", gap: "18px" } });
      const cur = +(fm.lecture || 16);
      for (let i = 1; i <= 18; i++) seeds.appendChild(h("i", { class: i < cur ? "done" : i === cur ? "now" : "", title: "L" + i, style: { width: "18px", height: "18px" } }));
      host.appendChild(seeds);
      host.appendChild(h("div", { class: "abs", style: { left: "64px", bottom: "34px", fontSize: "14px", color: MUTED } }, `Course progress: lecture ${cur} of 18`));
      return {};
    },
  };
})();
