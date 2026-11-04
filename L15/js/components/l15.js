/* L15 components: the claim, the faithful/factual grid, the sample grid, the pipeline, the transcript set, the key-fact check,
   the mechanism split, the rate table, the finding, the dialect chart, the name swap, the close. */
(function () {
  const { h, s, svg } = Deck;
  const INK = "#232748", MUTED = "#5F6379", RULE = "#E2DACB", VERM = "#E8431F", VERMD = "#BF3417", MAGENTA = "#D6177F", COBALT = "#2F5FD0", VIOLET = "#6B3FA0", LEAF = "#45731A", TEAL = "#0E6F7F", MARI = "#8F5A00", MARIB = "#F4A51C", CHART = "#A9C93A", TURQ = "#22A6B8";
  const C = () => window.L15_CONFIG;
  const L = () => window.L15;
  const live = () => Deck.l15;
  const pc = (x, d) => Deck.pct(x, d == null ? 0 : d);
  const split = (arr) => (arr || []).map((l) => l.split("|").map((x) => x.trim()));
  const qById = (id) => C().questions.find((q) => q.id === id);
  const docTitle = (id) => { const d = L().docById(id); return d ? d.title : "none"; };
  /* the 20 flagged replies the class votes on (same rule everywhere); in print mode the judge's verdicts stand in for votes */
  function voteSample(summary, n) {
    const flagged = summary.classified.filter((c) => c.flaggedByCheck);
    const nVotes = Math.min(n || 20, flagged.length), stepN = Math.max(1, Math.floor(flagged.length / nVotes));
    const sample = []; for (let i = 0; i < flagged.length && sample.length < nVotes; i += stepN) sample.push(flagged[i]);
    return sample;
  }
  function votesFor(summary, ctx) {
    const sample = voteSample(summary, 20), S = live().state;
    if (ctx && ctx.print) return sample.map((c) => ({ id: c.row.id, wrong: c.failed }));
    return sample.filter((c) => S.votes[c.row.id] != null).map((c) => ({ id: c.row.id, wrong: S.votes[c.row.id] }));
  }
  const MECH = { retrieval: ["Retrieval failure", COBALT], synthesis: ["Synthesis error", VIOLET], overreach: ["Overreach", MARI], citation: ["Citation fabrication", VERMD] };

  /* configuration strip shared by the live slides */
  function cfgStrip(host, opts) {
    opts = opts || {};
    const strip = h("div", { class: "cfg-strip l15" });
    const cf = live().config();
    const st = h("span", { class: "pill st" }, "");
    const setMode = () => { const m = Deck.llm.mode; st.textContent = m === "live" ? "LIVE" : m === "replay" ? "REPLAY" : "…"; st.className = "pill st " + (m === "live" ? "live" : "replay"); };
    setMode(); Deck.llm.onChange(setMode);
    strip.append(st, h("span", { class: "pill" }, "model ", h("b", {}, cf.model)), h("span", { class: "pill" }, "prompt ", h("b", {}, cf.promptVersion)), h("span", { class: "pill" }, "T ", h("b", {}, String(cf.temperature))), h("span", { class: "pill" }, "seed ", h("b", {}, cf.seed + (opts.seedRange ? " +s" : ""))), h("span", { class: "pill" }, "kb ", h("b", {}, cf.kbVersion)), h("span", { class: "pill" }, "judge ", h("b", {}, cf.judge)));
    if (opts.label) strip.appendChild(h("span", { class: "pill src" }, opts.label));
    host.appendChild(strip);
    return strip;
  }
  const badge = (host, src) => { const b = h("div", { class: "l15-badge" + (src.illustrative ? "" : " real") }, src.illustrative ? "Illustrative · written fallback, run Generate before class" : "Real run · " + src.label.replace(/^real run · /, "")); host.appendChild(b); return b; };

  /* ---------- 3 · the claim and three replies ---------- */
  Deck.components.ClaimReplies = {
    steps: 2,
    mount(host, ctx) {
      const claim = h("div", { class: "cl-claim" }, h("div", { class: "memo-h" }, "MrFeast AI product team · pre-launch summary"), h("div", { class: "cl-text" }, "“" + ctx.fm.claim + "”"));
      host.appendChild(claim);
      const cards = split(ctx.fm.reply).map(([lec, text, why], i) => {
        const el = h("div", { class: "cl-card show-on off-up", style: `left:${i * 496}px` }, h("div", { class: "lbl-caps" }, lec), h("div", { class: "bubble bot" }, text), h("div", { class: "cl-why show-on off-up" }, why));
        host.appendChild(el); return el;
      });
      const q = h("div", { class: "cl-q show-on off-up" }, "Which of these is a hallucination?");
      host.appendChild(q);
      return { update(k) { cards.forEach((c) => { c.classList.toggle("off-up", k < 1); c.querySelector(".cl-why").classList.toggle("off-up", k < 1); }); q.classList.toggle("off-up", k < 2); } };
    },
  };

  /* ---------- 4 · faithful x factual ---------- */
  Deck.components.FaithfulFactual = {
    steps: 5,
    mount(host, ctx) {
      const def = h("div", { class: "ff-def" }, h("span", { class: "lbl-caps" }, "Definition"), " ", ctx.fm.definition, h("div", { class: "ff-src" }, ctx.fm.truthsource));
      host.appendChild(def);
      const grid = h("div", { class: "ff-grid show-on off-up" });
      const colLab = (t, x) => h("div", { class: "ff-ax col", style: `left:${x}px` }, t);
      const rowLab = (t, y) => h("div", { class: "ff-ax row", style: `top:${y}px` }, t);
      grid.append(colLab("Factual: true against the authoritative source", 0), colLab("Not factual", 736), rowLab("Faithful: agrees with the retrieved document", 30), rowLab("Unfaithful", 230));
      const pos = { "faithful|factual": [0, 0], "faithful|notfactual": [1, 0], "unfaithful|factual": [0, 1], "unfaithful|notfactual": [1, 1] };
      const order = ["faithful|factual", "faithful|notfactual", "unfaithful|factual", "unfaithful|notfactual"];
      const cells = {};
      split(ctx.fm.cell).forEach(([a, b, ex, note]) => {
        const [cx, cy] = pos[a + "|" + b];
        const ok = a === "faithful" && b === "factual";
        const el = h("div", { class: "ff-cell show-on off-up" + (ok ? " ok" : ""), style: `left:${cx * 736}px;top:${52 + cy * 200}px` }, h("div", { class: "ff-ex" }, ex), h("div", { class: "ff-note" }, note));
        grid.appendChild(el); cells[a + "|" + b] = el;
      });
      host.appendChild(grid);
      return { update(k) { grid.classList.toggle("off-up", k < 1); order.forEach((key, i) => cells[key] && cells[key].classList.toggle("off-up", k < i + 2)); } };
    },
  };

  /* ---------- 6 · why, with a 12-sample grid ---------- */
  Deck.components.SampleGrid = {
    steps: 2,
    mount(host, ctx) {
      const g = C().sampleGrid, q = qById(g.questionId);
      const left = h("div", { class: "sg-left" });
      (ctx.fm.reason || []).forEach((r, i) => left.appendChild(h("div", { class: "sg-reason" }, h("div", { class: "sg-n" }, String(i + 1)), h("div", {}, r))));
      host.appendChild(left);
      const right = h("div", { class: "sg-right show-on off-up" });
      const strip = cfgStrip(right, { seedRange: true });
      right.appendChild(h("div", { class: "sg-q" }, h("span", { class: "lbl-caps" }, "Fan question, " + g.samples + " times"), " “" + g.text + "” ", h("span", { class: "sg-key" }, "key fact: " + (g.key_fact || q.key_fact))));
      const cells = Array.from({ length: g.samples }, (_, i) => h("div", { class: "sg-cell" }, h("div", { class: "sg-txt" }, ""), h("span", { class: "vchip wait" }, "…")));
      const grid = h("div", { class: "sg-grid" }, cells);
      right.appendChild(grid);
      const foot = h("div", { class: "sg-foot show-on off-up" });
      right.appendChild(foot);
      host.appendChild(right);
      let rows = [], ran = false, ctrl = null;
      const paint = (cell, i) => { const c = cells[i]; if (!c) return; c.querySelector(".sg-txt").textContent = cell.reply || ""; const v = c.querySelector(".vchip"); if (cell.judge) { v.textContent = cell.judge.verdict; v.className = "vchip " + (cell.judge.verdict === "PASS" ? "blocked" : "broke"); v.title = cell.judge.reason || ""; } };
      const summary = () => {
        const done = rows.filter((r) => r.judge);
        if (!done.length) { foot.textContent = ""; return; }
        const k = done.filter((r) => r.judge.verdict === "FAIL").length, n = done.length;
        const w = L().wilson(k, n);
        foot.innerHTML = `<b>${k} of ${n} failed</b> the key-fact check (${pc(k / n)}). One sample of ${n}: a 95% interval on this count runs from <b>${pc(w.lo)}</b> to <b>${pc(w.hi)}</b> (Wilson). ${k === 0 ? "Zero failures does not mean a zero rate." : "Another " + n + " draws would give another count."}`;
      };
      async function run() {
        if (ran) return; ran = true;
        const src = live().grid();
        if (Deck.llm.mode === "live" && !ctx.print && !ctx.preview) {
          ctrl = new AbortController();
          try { await live().runGrid((cell, i, phase) => { rows[i] = cell; paint(cell, i); if (phase === "done") summary(); }, ctrl.signal); } catch (e) { foot.textContent = "Run stopped: " + e.message + ". Showing stored replies."; }
          if (rows.filter((r) => r && r.judge).length) return;
        }
        // replay: animate the stored rows
        rows = src.rows.map((r) => Object.assign({}, r));
        badge(right, src);
        for (let i = 0; i < rows.length; i++) {
          const r = rows[i]; const text = r.reply; r.reply = "";
          if (ctx.print || ctx.preview || Deck.reduced) { r.reply = text; paint(r, i); continue; }
          await Deck.llm.replayStream(text, (p, all) => { r.reply = all; paint(r, i); });
          paint(r, i);
        }
        summary();
      }
      return {
        update(k) { right.classList.toggle("off-up", k < 1); foot.classList.toggle("off-up", k < 2); if (k >= 1) run(); if (k >= 2) summary(); },
        destroy() { if (ctrl) ctrl.abort(); },
      };
    },
  };

  /* ---------- 8 · the pipeline ---------- */
  Deck.components.RagPipeline = {
    steps(fm) { return (fm.mech || []).length; },
    mount(host, ctx) {
      const stages = ctx.fm.stage || [];
      const pipe = h("div", { class: "rp-pipe" });
      const boxes = stages.map((t, i) => { const b = h("div", { class: "rp-stage" }, h("div", { class: "rp-sn" }, String(i + 1)), t); pipe.appendChild(b); if (i < stages.length - 1) pipe.appendChild(h("div", { class: "rp-arrow" }, "→")); return b; });
      host.appendChild(pipe);
      const mechs = split(ctx.fm.mech);
      const src = live().transcripts();
      const ex = L().examples(src.rows);
      const cards = mechs.map(([key, name, desc, stage, written], i) => {
        const row = ex[key];
        const q = row ? qById(row.question_id) : null;
        const example = row
          ? h("div", { class: "rp-ex" }, h("div", { class: "rp-exh" }, `${row.id} · “${q ? q.text : ""}” · retrieved: ${docTitle(row.retrieved_doc)}` + (q && q.source_doc && row.retrieved_doc !== q.source_doc ? ` (should be ${docTitle(q.source_doc)})` : "")), h("div", { class: "bubble bot" }, row.reply), src.illustrative ? h("div", { class: "rp-ill" }, "Illustrative: written fallback row") : h("div", { class: "rp-ill real" }, "Real reply from the transcript set"))
          : h("div", { class: "rp-ex" }, h("div", { class: "bubble bot" }, written), h("div", { class: "rp-ill" }, "Illustrative: the set has no example of this mechanism"));
        const el = h("div", { class: "rp-card show-on off-up", style: `--c:${MECH[key][1]}` }, h("div", { class: "rp-name" }, h("span", { class: "rp-num" }, String(i + 1)), name), h("div", { class: "rp-desc" }, desc), example);
        host.appendChild(el); return { el, stage: +stage };
      });
      return { update(k) { cards.forEach((c, i) => c.el.classList.toggle("off-up", k !== i + 1)); boxes.forEach((b, i) => b.classList.toggle("hot", k >= 1 && cards[k - 1] && cards[k - 1].stage === i)); pipe.classList.toggle("dim", k >= 1); } };
    },
  };

  /* ---------- 12 · the transcript set ---------- */
  Deck.components.TranscriptSet = {
    steps: 2,
    mount(host, ctx) {
      const strip = cfgStrip(host, { seedRange: true });
      const qs = C().questions;
      const qlist = h("div", { class: "ts-qs" });
      qs.forEach((q) => qlist.appendChild(h("div", { class: "ts-q" + (q.kind === "decline" ? " dec" : "") }, h("span", { class: "ts-id" }, q.id), h("span", { class: "ts-text" }, q.text), h("span", { class: "ts-kind" }, q.kind === "decline" ? "must decline" : "key fact: " + q.key_fact))));
      host.appendChild(qlist);
      const panel = h("div", { class: "ts-panel show-on off-up" });
      const head = h("div", { class: "ts-head" });
      const tbl = h("div", { class: "ts-table" });
      panel.append(head, tbl);
      host.appendChild(panel);
      const tools = h("div", { class: "ts-tools" });
      const gen = h("button", { class: "btn primary", onclick: () => generate() }, "Generate");
      const stop = h("button", { class: "btn", disabled: true }, "Stop");
      const prog = h("span", { class: "ts-prog" }, "");
      tools.append(gen, stop, prog, h("button", { class: "lnk", onclick: () => live().export() }, "export"), h("button", { class: "lnk", onclick: () => live().reset() }, "reset"));
      host.appendChild(tools);
      let ctrl = null;
      const render = () => {
        const src = live().transcripts();
        tbl.innerHTML = ""; head.innerHTML = "";
        head.append(h("span", {}, h("b", {}, String(src.rows.length)), " rows · " + qs.length + " questions × " + C().samplesPerQuestion + " samples"), h("span", { class: "ts-src" + (src.illustrative ? "" : " real") }, src.illustrative ? "ILLUSTRATIVE · written fallback" : "REAL RUN · " + src.label.replace(/^real run · /, "")));
        tbl.appendChild(h("div", { class: "ts-row hd" }, h("span", {}, "id"), h("span", {}, "question"), h("span", {}, "retrieved"), h("span", {}, "source"), h("span", {}, "reply"), h("span", {}, "judge")));
        src.rows.forEach((r) => {
          const q = qById(r.question_id); const miss = q && q.source_doc && r.retrieved_doc !== q.source_doc;
          tbl.appendChild(h("div", { class: "ts-row" }, h("span", { class: "mono" }, r.id), h("span", {}, q ? q.text : r.question_id), h("span", { class: miss ? "miss" : "" }, docTitle(r.retrieved_doc)), h("span", {}, q && q.source_doc ? docTitle(q.source_doc) : "(none)"), h("span", { class: "ts-reply" }, r.reply), h("span", { class: "vchip " + (r.judge && r.judge.verdict === "PASS" ? "blocked" : "broke"), title: r.judge ? r.judge.reason : "" }, r.judge ? r.judge.verdict : "")));
        });
      };
      async function generate() {
        if (Deck.llm.mode !== "live") { prog.textContent = "Ollama is not reachable; start it and reload."; return; }
        if (live().state.transcripts.length && !confirm("Replace the stored run with a new one?")) return;
        gen.disabled = true; stop.disabled = false; ctrl = new AbortController(); stop.onclick = () => ctrl.abort();
        try { await live().generate((p) => { prog.textContent = `${p.n} / ${p.total} · ${p.id} · ${p.phase === "ask" ? "asking" : "judging"} · ${p.question}`; render(); }, ctrl.signal); prog.textContent = "Done. " + live().state.transcripts.length + " rows stored."; }
        catch (e) { prog.textContent = "Stopped: " + e.message; }
        gen.disabled = false; stop.disabled = true; render();
      }
      render();
      const off = live().onChange(render);
      return { update(k) { panel.classList.toggle("off-up", k < 1); qlist.classList.toggle("shrink", k >= 1); }, destroy() { off(); if (ctrl) ctrl.abort(); } };
    },
  };

  /* ---------- 13 · key-fact check and votes ---------- */
  Deck.components.KeyFactCheck = {
    steps: 3,
    mount(host, ctx) {
      const src = live().transcripts();
      const summary = L().summarize(src.rows);
      const sample = voteSample(summary, +(ctx.fm.votes || 20));
      const S = live().state;
      const V = ctx.print ? Object.fromEntries(sample.map((c) => [c.row.id, c.failed])) : S.votes;
      const top = h("div", { class: "kf-top" });
      const stat = (lab, val) => h("div", { class: "kf-stat" }, h("div", { class: "lbl-caps" }, lab), h("div", { class: "kf-val" }, val));
      const sFlag = stat("flagged by the check", "…"), sPrec = stat("precision of the check", "…"), sJudge = stat("judge agrees with the room", "…");
      top.append(stat("replies", String(summary.n)), sFlag, sPrec, sJudge);
      host.appendChild(top);
      badge(host, src);
      const list = h("div", { class: "kf-list show-on off-up" });
      const cur = h("div", { class: "kf-cur" });
      const nav = h("div", { class: "kf-nav" });
      list.append(cur, nav);
      host.appendChild(list);
      let idx = 0;
      const vote = (id, wrong) => { if (ctx.print) return; live().vote(id, wrong); if (idx < sample.length - 1) idx++; render(); };
      function render() {
        const voted = sample.filter((c) => V[c.row.id] != null);
        const pr = L().checkPrecision(summary.classified, voted.map((c) => ({ id: c.row.id, wrong: V[c.row.id] })));
        sFlag.querySelector(".kf-val").textContent = `${summary.flagged} of ${summary.n}`;
        sPrec.querySelector(".kf-val").textContent = pr.n ? `${pc(pr.precision)} (${voted.filter((c) => V[c.row.id]).length} of ${pr.n} real)` : "vote to compute";
        sJudge.querySelector(".kf-val").textContent = pr.n ? pc(pr.judgeAgreement) + " of " + pr.n : "…";
        cur.innerHTML = ""; nav.innerHTML = "";
        const c = sample[idx]; if (!c) { cur.textContent = "Nothing flagged."; return; }
        const q = qById(c.row.question_id);
        cur.append(
          h("div", { class: "kf-q" }, h("span", { class: "mono" }, c.row.id), " · “" + q.text + "” ", h("span", { class: "bj-key" }, q.kind === "decline" ? "must decline (check looks for: " + q.check + ")" : "key fact: " + q.key_fact + " (check looks for: “" + q.check + "”)")),
          h("div", { class: "bubble bot kf-reply" }, c.row.reply),
          h("div", { class: "kf-vote" }, h("button", { class: "btn bad" + (V[c.row.id] === true ? " on" : ""), onclick: () => vote(c.row.id, true) }, "Wrong (real failure)"), h("button", { class: "btn ok" + (V[c.row.id] === false ? " on" : ""), onclick: () => vote(c.row.id, false) }, "Correct (false flag)"),
            h("span", { class: "kf-judge" }, "judge said ", h("span", { class: "vchip " + (c.failed ? "broke" : "blocked") }, c.failed ? "FAIL" : "PASS"))));
        sample.forEach((cc, i) => nav.appendChild(h("button", { class: "kf-dot" + (i === idx ? " cur" : "") + (V[cc.row.id] === true ? " wrong" : V[cc.row.id] === false ? " right" : ""), onclick: () => { idx = i; render(); } }, String(i + 1))));
        nav.appendChild(h("span", { class: "kf-count" }, `${voted.length} of ${sample.length} voted`));
      }
      render();
      return { update(k) { top.classList.toggle("ran", k >= 1); list.classList.toggle("off-up", k < 2); sPrec.classList.toggle("hot", k >= 3); sJudge.classList.toggle("hot", k >= 3); render(); } };
    },
  };

  /* ---------- 14 · mechanism split ---------- */
  Deck.components.MechanismSplit = {
    steps: 3,
    mount(host, ctx) {
      const src = live().transcripts();
      const sm = L().summarize(src.rows);
      badge(host, src);
      const wrap = h("div", { class: "ms-wrap" });
      const reveal = { retrieval: 1, synthesis: 1, overreach: 2, citation: 3 };
      const rows = sm.table.map((r) => {
        const el = h("div", { class: "ms-row show-on off-up", style: `--c:${MECH[r.key][1]}` },
          h("div", { class: "ms-lab" }, h("b", {}, r.label), h("div", { class: "ms-rule" }, r.key === "retrieval" ? "retrieved document ≠ source document, judge FAIL" : r.key === "synthesis" ? "same document, judge FAIL" : r.key === "overreach" ? "out-of-scope question, reply answered" : "cited section not in the retrieved document")),
          h("div", { class: "ms-bar" }, h("div", { class: "ms-fill", style: `width:${Math.max(2, r.rate * 100)}%` })),
          h("div", { class: "ms-num" }, h("b", {}, `${r.k} of ${r.n}`), h("span", {}, ` · ${pc(r.rate)} · ${r.denomLabel}`)));
        wrap.appendChild(el); return { el, at: reveal[r.key] };
      });
      host.appendChild(wrap);
      const foot = h("div", { class: "ms-foot" }, `Any failure by the judge: ${sm.total.k} of ${sm.total.n} replies (${pc(sm.total.rate)}). The four rows do not sum to it: citation fabrication is counted against replies that cited, and a reply can fail twice.`);
      host.appendChild(foot);
      return { update(k) { rows.forEach((r) => r.el.classList.toggle("off-up", k < r.at)); } };
    },
  };

  /* ---------- 15 · rate table ---------- */
  Deck.components.RateTable = {
    steps: 2,
    mount(host, ctx) {
      const src = live().transcripts();
      const sm = L().summarize(src.rows);
      const pr = L().checkPrecision(sm.classified, votesFor(sm, ctx));
      badge(host, src);
      const t = h("table", { class: "rt" });
      t.appendChild(h("tr", {}, ...["Failure type", "Count", "Denominator", "Rate", "95% interval", "Severity"].map((x) => h("th", {}, x))));
      sm.table.forEach((r) => t.appendChild(h("tr", {}, h("td", { style: `border-left:6px solid ${MECH[r.key][1]}` }, r.label), h("td", { class: "num" }, String(r.k)), h("td", {}, `${r.n} ${r.denomLabel}`), h("td", { class: "num" }, pc(r.rate)), h("td", { class: "num" }, `${pc(r.lo)} to ${pc(r.hi)}` + (r.method === "wilson" ? " *" : "")), h("td", {}, r.severity))));
      t.appendChild(h("tr", { class: "tot" }, h("td", {}, "Any failure (judge)"), h("td", { class: "num" }, String(sm.total.k)), h("td", {}, `${sm.total.n} all replies`), h("td", { class: "num" }, pc(sm.total.rate)), h("td", { class: "num" }, `${pc(sm.total.lo)} to ${pc(sm.total.hi)}`), h("td", {}, "")));
      const det = h("tr", { class: "det show-on off-up" }, h("td", {}, "Detector"), h("td", { colspan: 5 }, `Key-fact string check: flagged ${sm.flagged} of ${sm.n}; precision ${pr.n ? pc(pr.precision) + " on the " + pr.n + " flags the class voted on" : "not yet measured (vote on the previous slide)"}. Model judge (${C().judge.model}): agreement with the room ${pr.n ? pc(pr.judgeAgreement) : "…"} on the same items.`));
      t.appendChild(det);
      host.appendChild(t);
      const note = h("div", { class: "rt-note" }, `Intervals: bootstrap, ${C().bootstrap.resamples} resamples, seed ${C().bootstrap.seed}. * A count of 0 or n uses a Wilson interval, because resampling a constant cannot widen.`);
      host.appendChild(note);
      const theirs = h("div", { class: "rt-theirs show-on off-up" }, h("div", { class: "memo-h" }, "The team's version"), h("div", { class: "rt-big" }, "Hallucination rate: 2%"), h("div", { class: "rt-small" }, "No definition. No denominator. No detector. No interval."));
      host.appendChild(theirs);
      return { update(k) { det.classList.toggle("off-up", k < 1); theirs.classList.toggle("off-up", k < 2); } };
    },
  };

  /* ---------- 16 · the finding ---------- */
  Deck.components.Finding = {
    steps: 3,
    mount(host, ctx) {
      const src = live().transcripts();
      const sm = L().summarize(src.rows);
      const f = L().findingText(sm, L().checkPrecision(sm.classified, votesFor(sm, ctx)));
      badge(host, src);
      const blocks = [["Condition", f.condition, 1, COBALT], ["Criteria", f.criteria, 1, COBALT], ["Cause", f.cause, 2, VIOLET], ["Effect", f.effect, 2, VIOLET], ["Recommendation", f.recommendation, 3, LEAF]].map(([t, b, at, col]) => {
        const el = h("div", { class: "fd-block show-on off-up", style: `--c:${col}` }, h("div", { class: "fd-h" }, t), h("div", { class: "fd-b" }, b)); host.appendChild(el); return { el, at };
      });
      return { update(k) { blocks.forEach((b) => b.el.classList.toggle("off-up", k < b.at)); } };
    },
  };

  /* ---------- 19 · dialect chart (published finding) ---------- */
  Deck.components.DialectChart = {
    steps: 2,
    mount(host, ctx) {
      const P = C().published.sap2019;
      const left = h("div", { class: "panel dc-left" }, h("div", { class: "ptitle" }, "Likelihood of an “offensive” label, content held comparable"));
      const g = svg(620, 380, left, { style: "width:100%;height:380px;display:block" });
      const bars = [["Other tweets", 1.0, COBALT], ["Tweets in African American English", P.ratio, VERMD]];
      bars.forEach(([lab, v, col], i) => {
        const x = 90 + i * 280, hgt = v * 140, y = 320 - hgt;
        s("rect", { x, y, width: 180, height: hgt, fill: col, rx: 8 }, g);
        s("text", { x: x + 90, y: y - 12, "text-anchor": "middle", style: "font-size:30px;font-weight:700;fill:" + INK, text: (i === 1 ? "up to " : "") + v.toFixed(1) + "×" }, g);
        s("text", { x: x + 90, y: 352, "text-anchor": "middle", style: "font-size:17px;fill:" + INK, text: lab }, g);
      });
      s("line", { x1: 40, y1: 320, x2: 600, y2: 320, stroke: INK }, g);
      left.appendChild(h("div", { class: "dc-cite" }, P.citation + " The chart draws the abstract's phrase, “" + P.headline + "”, and nothing more precise."));
      host.appendChild(left);
      const right = h("div", { class: "dc-right" });
      const items = (ctx.fm.finding || []).map((t, i) => { const el = h("div", { class: "dc-item show-on off-up", html: Deck.inline(t) }); right.appendChild(el); return el; });
      host.appendChild(right);
      return { update(k) { items.forEach((el, i) => el.classList.toggle("off-up", k < i)); } };
    },
  };

  /* ---------- 21 · name swap ---------- */
  Deck.components.NameSwap = {
    steps: 3,
    mount(host, ctx) {
      const ns = C().nameSwap;
      const names = ns.groupA.names.map((n) => ["A", n]).concat(ns.groupB.names.map((n) => ["B", n]));
      const top = h("div", { class: "nw-top" });
      cfgStrip(top, { seedRange: true });
      top.appendChild(h("div", { class: "nw-q" }, "“" + ns.question.replace("{name}", "…") + "”", h("span", { class: "nw-doc" }, " retrieved: " + docTitle(ns.retrieve))));
      host.appendChild(top);
      const measures = h("div", { class: "nw-measures show-on off-up" }, ...[["Length", "words in the reply"], ["Both facts", "shipping window and code both stated (string check)"], ["Declined", "the reply refused or redirected"]].map(([a, b]) => h("div", { class: "nw-m" }, h("b", {}, a), " " + b)));
      host.appendChild(measures);
      const grid = h("div", { class: "nw-grid show-on off-up" });
      const cols = names.map(([g, n]) => { const col = h("div", { class: "nw-col g" + g }, h("div", { class: "nw-name" }, h("span", { class: "nw-g" }, ns[g === "A" ? "groupA" : "groupB"].label), n)); grid.appendChild(col); return col; });
      host.appendChild(grid);
      const stats = h("div", { class: "nw-stats show-on off-up" });
      const sentence = h("div", { class: "nw-sentence show-on off-up" });
      host.append(stats, sentence);
      const cellEls = {};
      const cellFor = (r) => { const k = r.name + ":" + r.sample; if (!cellEls[k]) { const i = names.findIndex(([, n]) => n === r.name); const el = h("div", { class: "nw-cell" }, h("span", { class: "nw-w" }, ""), h("span", { class: "nw-f" }, "")); cols[i].appendChild(el); cellEls[k] = el; } return cellEls[k]; };
      const paint = (r) => { const el = cellFor(r); const w = L().tokenize(r.reply).length; const t = r.reply.toLowerCase(); const both = ns.facts.every((f) => t.includes(f.check.toLowerCase())); el.querySelector(".nw-w").textContent = w ? w + " w" : "…"; el.querySelector(".nw-f").textContent = both ? "both facts" : ""; el.classList.toggle("both", both); el.title = r.reply; };
      let rows = [], ran = false, ctrl = null;
      const showStats = () => {
        const done = rows.filter((r) => r.reply);
        if (done.length < 4) return;
        const st = L().nameSwapStats(done);
        const fmt = (x) => (x >= 0 ? "+" : "") + x.toFixed(1);
        stats.innerHTML = "";
        [["Length (words)", st.words, (x) => x.toFixed(1), fmt], ["Both facts stated", st.bothFacts, pc, (x) => (x >= 0 ? "+" : "") + Math.round(x * 100) + " pts"], ["Declined", st.declined, pc, (x) => (x >= 0 ? "+" : "") + Math.round(x * 100) + " pts"]].forEach(([lab, m, f1, f2]) => {
          stats.appendChild(h("div", { class: "nw-stat" }, h("div", { class: "lbl-caps" }, lab), h("div", { class: "nw-ab" }, `A ${f1(m.meanA)} · B ${f1(m.meanB)}`), h("div", { class: "nw-diff" + (m.lo <= 0 && m.hi >= 0 ? "" : " sig") }, `B − A ${f2(m.diff)} [${f2(m.lo)}, ${f2(m.hi)}]`)));
        });
        sentence.textContent = L().nameSwapSentence(st) + (done.length < rows.length ? " (partial run)" : "");
      };
      async function run() {
        if (ran) return; ran = true;
        const src = live().nameSwap();
        if (Deck.llm.mode === "live" && !ctx.print && !ctx.preview) {
          ctrl = new AbortController();
          try { await live().runNameSwap((cell, phase) => { if (!rows.includes(cell)) rows.push(cell); paint(cell); if (phase === "done") showStats(); }, ctrl.signal); } catch (e) {}
          if (rows.some((r) => r.reply)) { showStats(); return; }
        }
        rows = src.rows.map((r) => Object.assign({}, r));
        badge(host, src);
        if (ctx.print || ctx.preview || Deck.reduced) { rows.forEach(paint); showStats(); return; }
        for (const r of rows) { const text = r.reply; r.reply = text; paint(r); await new Promise((res) => setTimeout(res, 35)); }
        showStats();
      }
      return {
        update(k) { measures.classList.toggle("off-up", k < 1); grid.classList.toggle("off-up", k < 2); stats.classList.toggle("off-up", k < 2); sentence.classList.toggle("off-up", k < 3); if (k >= 2) run(); },
        destroy() { if (ctrl) ctrl.abort(); },
      };
    },
  };

  /* ---------- close (as L13) ---------- */
  Deck.components.Close = {
    steps: 0,
    mount(host, ctx) {
      const fm = ctx.fm;
      const chain = split(fm.chain);
      const cols = ["cobalt", "chartreuse", "cobalt", "vermilion"];
      chain.forEach(([t, b], i) => {
        host.appendChild(h("div", { class: "ev-card", style: `left:${64 + i * 372}px;top:150px;width:340px;height:170px;--b:var(--${cols[i]});font-size:16.5px` }, h("div", { class: "h" }, t), b));
        if (i < chain.length - 1) host.appendChild(h("div", { class: "abs", style: { left: 64 + i * 372 + 342 + "px", top: "210px", fontSize: "28px", color: MUTED } }, "→"));
      });
      if (fm.takeaway) host.appendChild(h("div", { class: "abs", style: { left: "64px", top: "340px", width: "1472px", fontFamily: "var(--font-voice)", fontStyle: "italic", fontSize: "23px", lineHeight: 1.35, color: "#4A4F6E" } }, fm.takeaway));
      const next = h("div", { class: "abs", style: { left: "64px", top: "430px", width: "620px" } },
        h("div", { class: "lbl-caps", style: { color: "#B0106A", marginBottom: "8px" } }, "Next session"),
        h("div", { style: { fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "34px" } }, fm.next || ""),
        h("div", { style: { fontSize: "22px", color: "#4A4F6E", marginTop: "6px" } }, fm.when || ""));
      const read = h("div", { class: "abs", style: { left: "760px", top: "430px", width: "776px" } }, h("div", { class: "lbl-caps", style: { color: "#5A3290", marginBottom: "8px" } }, "Read first"));
      (fm.read || []).forEach((r) => read.appendChild(h("div", { style: { fontSize: "19px", padding: "6px 0", borderBottom: "1px solid " + RULE }, html: Deck.inline(r) })));
      host.append(next, read);
      const seeds = h("div", { class: "seeds", style: { left: "64px", bottom: "64px", gap: "18px" } });
      const cur = +(fm.lecture || 15);
      for (let i = 1; i <= 18; i++) seeds.appendChild(h("i", { class: i < cur ? "done" : i === cur ? "now" : "", title: "L" + i, style: { width: "18px", height: "18px" } }));
      host.appendChild(seeds);
      host.appendChild(h("div", { class: "abs", style: { left: "64px", bottom: "34px", fontSize: "14px", color: MUTED } }, `Course progress: lecture ${cur} of 18`));
      return {};
    },
  };
})();
