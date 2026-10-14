/* Part 4 of the lecture: training */
(function () {
  const { h, s, svg } = Deck;
  const G = () => (window.DECK_DATA && window.DECK_DATA.ex) || null;
  const LEAF = "#45731A", CHART = "#A9C93A", INK = "#232748", MUTED = "#5F6379", RULE = "#E2DACB", COBALT = "#2F5FD0", MAGENTA = "#D6177F", VIOLET = "#6B3FA0", MARIGOLD = "#F4A51C";

  /* a small field of dials whose needles can be nudged */
  function dials(parent, x, y, cols, rows, size) {
    const sv = svg(cols * size, rows * size, parent, { style: `position:absolute;left:${x}px;top:${y}px;width:${cols * size}px;height:${rows * size}px` });
    const needles = [];
    let r = 7;
    const rnd = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
      const cx = i * size + size / 2, cy = j * size + size / 2, rad = size * 0.38;
      s("circle", { cx, cy, r: rad, fill: "#fff", stroke: "#C9D6F4", "stroke-width": 2 }, sv);
      const a0 = rnd() * 300 - 150;
      const n = s("line", { x1: cx, y1: cy, x2: cx, y2: cy - rad * 0.8, stroke: COBALT, "stroke-width": 2.5, "stroke-linecap": "round", style: `transform-origin:${cx}px ${cy}px; transform: rotate(${a0}deg); transition: transform 700ms var(--ease)` }, sv);
      n.dataset.a = a0; needles.push(n);
    }
    return {
      nudge(amount) { needles.forEach((n, i) => { const a = +n.dataset.a + ((i * 37) % 11 - 5) * amount; n.dataset.a = a; n.style.transform = `rotate(${a}deg)`; }); },
      el: sv,
    };
  }

  /* ---------- pretraining stream ---------- */
  Deck.components.Pretraining = {
    steps: 4,
    mount(host, ctx) {
      const fm = ctx.fm;
      const snips = (fm.snip || []).map((l) => l.split("|").map((x) => x.trim()));
      const rows = snips.map(([src, text, guess, gp, truth, tp], i) => {
        const row = h("div", { class: "abs", style: { left: "0px", top: i * 76 + "px", width: "900px", height: "66px", display: "flex", alignItems: "center", gap: "14px", background: "#fff", border: "1px solid " + RULE, borderRadius: "10px", padding: "0 16px" } });
        row.appendChild(h("span", { class: "lbl-caps", style: { width: "110px", fontSize: "12px" } }, src));
        row.appendChild(h("span", { style: { fontSize: "21px", flex: "1", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, text));
        const g = h("span", { class: "chip show-on", style: { background: "#FCEBCB", fontSize: "18px" } }, h("span", { class: "tt" }, guess), h("span", { class: "id" }, "guess " + gp));
        const t = h("span", { class: "chip show-on", style: { background: "#E7F0D2", borderColor: LEAF, fontSize: "18px" } }, h("span", { class: "tt" }, truth), h("span", { class: "id" }, guess === truth ? "right" : "actual: " + tp));
        row.append(g, t);
        host.appendChild(row);
        return { g, t };
      });
      const dpanel = h("div", { class: "panel", style: { left: "940px", top: "0px", width: "532px", height: "370px" } });
      dpanel.appendChild(h("div", { class: "ptitle abs", style: { left: "18px", top: "14px" } }, "The model's numbers"));
      host.appendChild(dpanel);
      const D = dials(dpanel, 26, 44, 10, 6, 48);
      // mix bar
      const mix = (fm.mix || []).map((l) => l.split("|").map((x) => x.trim()));
      const mixEl = h("div", { class: "abs show-on", style: { left: "0px", top: "400px", width: "910px" } });
      mixEl.appendChild(h("div", { class: "ptitle", style: { marginBottom: "8px" } }, "GPT-3 training mix (share of examples)"));
      const bar = h("div", { style: { display: "flex", height: "62px", borderRadius: "8px", overflow: "hidden", border: "1.5px solid " + INK } });
      const cols = ["#2F5FD0", "#22A6B8", "#A9C93A", "#F4A51C", "#D6177F"];
      mix.forEach(([name, pct], i) => bar.appendChild(h("div", { style: { width: pct + "%", background: cols[i], display: "flex", alignItems: "center", paddingLeft: "10px", fontSize: +pct > 7 ? "18px" : "0px", fontWeight: 600, color: i < 2 ? "#fff" : INK, whiteSpace: "nowrap", overflow: "hidden" } }, `${name} ${pct}%`)));
      mixEl.appendChild(bar);
      mixEl.appendChild(h("div", { style: { display: "flex", justifyContent: "flex-end", gap: "18px", fontSize: "16px", color: MUTED, marginTop: "6px" } }, mix.slice(2).map(([n, p]) => h("span", {}, `${n} ${p}%`))));
      host.appendChild(mixEl);
      const ft = h("div", { class: "ev-card show-on", style: `left:0px; top:530px; width:910px; --b:${MAGENTA}` },
        h("div", { class: "h", style: { color: "#B0106A" } }, "MrFeast AI, one more layer (invented for this case)"),
        "Fine-tuning data: two years of the creator's video transcripts and captions. Unlike the web-scale data, this set can be listed, dated and checked for consent.");
      host.appendChild(ft);
      let tm = [];
      return {
        update(k, animate) {
          tm.forEach(clearTimeout); tm = [];
          rows.forEach((r, i) => {
            const on = k >= 1;
            if (animate && k === 1) {
              r.g.classList.add("off-up"); r.t.classList.add("off-up");
              tm.push(setTimeout(() => r.g.classList.remove("off-up"), 300 + i * 500));
              tm.push(setTimeout(() => { r.t.classList.remove("off-up"); D.nudge(0.6); }, 550 + i * 500));
            } else { r.g.classList.toggle("off-up", !on); r.t.classList.toggle("off-up", !on); }
          });
          mixEl.classList.toggle("off-up", k < 2);
          ft.classList.toggle("off-up", k < 4);
        },
        destroy() { tm.forEach(clearTimeout); },
      };
    },
  };

  /* ---------- one training step (illustrative numbers) ---------- */
  Deck.components.TrainingStep = {
    steps: 4,
    mount(host) {
      const arch = h("div", { class: "panel", style: { left: "0px", top: "0px", width: "430px", height: "620px", padding: "16px 20px", overflow: "hidden" } });
      arch.appendChild(h("div", { class: "ptitle" }, "Archived campaign text (invented)"));
      const lines = ["Use code FEAST20 at checkout!", "Don't forget: FEAST20 gets you 20% off", "Code FEAST20, link in bio", "FEAST20 ends Sunday!!", "Stock up with FEAST20", "Use code FEAST20 for 20% off", "FEAST20 is back by popular demand", "Use code FEAST20 at checkout!"];
      lines.forEach((l) => arch.appendChild(h("div", { style: { fontSize: "19px", padding: "7px 0", borderBottom: "1px solid " + RULE, color: "#4A4F6E" }, html: Deck.esc(l).replace("FEAST20", '<b style="color:#B0106A">FEAST20</b>') })));
      host.appendChild(arch);
      const ex = h("div", { class: "abs", style: { left: "480px", top: "0px" } });
      ex.appendChild(h("div", { class: "ptitle", style: { marginBottom: "10px" } }, "New training example"));
      const row = h("div", { class: "chips" });
      ["use", " code", " FE", "AST"].forEach((t, i) => row.appendChild(Deck.chip(t, i)));
      const target = h("span", { class: "chip", style: { background: "#E7F0D2", borderColor: LEAF, borderWidth: "2.5px" } }, h("span", { class: "tt" }, "15"), h("span", { class: "id" }, "correct next token"));
      row.appendChild(target);
      ex.appendChild(row);
      host.appendChild(ex);
      const bars = Deck.barList(host, 480, 170, 3, { rowH: 54, maxW: 420 });
      bars.el.querySelectorAll(".bar-row .w").forEach((w) => (w.style.width = "110px"));
      const lossEl = h("div", { class: "panel show-on", style: { left: "480px", top: "360px", width: "560px", height: "250px", padding: "18px 24px" } });
      host.appendChild(lossEl);
      const dpanel = h("div", { class: "panel show-on", style: { left: "1080px", top: "170px", width: "392px", height: "440px" } });
      dpanel.appendChild(h("div", { class: "ptitle abs", style: { left: "18px", top: "14px" } }, "Weights"));
      host.appendChild(dpanel);
      const D = dials(dpanel, 20, 48, 7, 8, 50);
      const before = [{ t: "20", p: 0.55 }, { t: "15", p: 0.2 }, { t: "other", p: 0.25 }];
      const after = [{ t: "20", p: 0.5 }, { t: "15", p: 0.26 }, { t: "other", p: 0.24 }];
      let lastK = 0;
      return {
        update(k, animate) {
          const d = k >= 4 ? after : before;
          bars.set(d, 0.55, 1, 0);
          bars.el.style.opacity = k >= 1 ? 1 : 0;
          const p = k >= 4 ? 0.26 : 0.2;
          lossEl.innerHTML = `<div class="ptitle">Loss</div><div style="font-size:24px;margin-top:10px">loss = −log p(correct token)</div>
            <div style="font-size:44px;font-weight:700;margin-top:10px;font-family:var(--font-code)">−log ${p.toFixed(2)} = <span style="color:${k >= 4 ? LEAF : "#BF3417"}">${(-Math.log(p)).toFixed(2)}</span></div>
            <div style="font-size:18px;color:${MUTED};margin-top:8px">${k >= 4 ? "Lower loss: the model is a little less surprised." : "Higher when the right answer got a low probability."}</div>`;
          lossEl.classList.toggle("off-up", k < 2);
          dpanel.classList.toggle("off-up", k < 3);
          if (k === 3 && animate && lastK === 2) D.nudge(1.4);
          lastK = k;
        },
      };
    },
  };

  /* ---------- tiny model trained live ---------- */
  Deck.components.TinyTrainer = {
    steps: 4,
    mount(host, ctx) {
      const snap = (window.DECK_DATA && window.DECK_DATA.tinySnap) || null;
      const corpus = window.DECK_DATA && window.DECK_DATA.tinyCorpus;
      const lp = h("div", { class: "panel", style: { left: "0px", top: "0px", width: "640px", height: "520px" } });
      host.appendChild(lp);
      const sv = svg(640, 520, lp);
      const X = (st) => 70 + (st / 3000) * 540, Y = (l) => 470 - (Math.min(l, 4.4) / 4.4) * 400;
      s("text", { x: 22, y: 34, "font-size": 14, "font-weight": 700, "letter-spacing": 1.4, fill: MUTED, text: "LOSS WHILE TRAINING" }, sv);
      [0, 1, 2, 3, 4].forEach((v) => { s("line", { x1: 70, x2: 610, y1: Y(v), y2: Y(v), stroke: "#EFE8DA" }, sv); s("text", { x: 60, y: Y(v) + 5, "text-anchor": "end", "font-size": 14, fill: MUTED, text: v }, sv); });
      [0, 1000, 2000, 3000].forEach((v) => s("text", { x: X(v), y: 496, "text-anchor": "middle", "font-size": 14, fill: MUTED, text: Deck.fmt(v) }, sv));
      s("text", { x: 340, y: 515, "text-anchor": "middle", "font-size": 13, fill: MUTED, text: "training step" }, sv);
      const path = s("path", { d: "", fill: "none", stroke: LEAF, "stroke-width": 3 }, sv);
      const ctrl = h("div", { class: "abs", style: { left: "0px", top: "540px", display: "flex", gap: "12px", alignItems: "center" } });
      const bTrain = h("button", { class: "btn primary" }, "Train"), bPause = h("button", { class: "btn" }, "Pause"), bReset = h("button", { class: "btn" }, "Reset");
      const stepEl = h("span", { style: { fontSize: "22px", marginLeft: "14px", fontVariantNumeric: "tabular-nums" } });
      ctrl.append(bTrain, bPause, bReset, stepEl);
      host.appendChild(ctrl);
      const rp = h("div", { class: "panel", style: { left: "680px", top: "0px", width: "792px", height: "620px", padding: "16px 22px" } });
      const rt = h("div", { class: "ptitle" }), list = h("div", { style: { marginTop: "10px" } });
      rp.append(rt, list);
      host.appendChild(rp);
      let pts = [], worker = null, curStep = 0;
      function drawLoss() { path.setAttribute("d", pts.map((p, i) => (i ? "L" : "M") + X(p[0]).toFixed(1) + " " + Y(p[1]).toFixed(1)).join(" ")); }
      function showSamples(arr, step, live) {
        rt.textContent = `What it writes after ${Deck.fmt(step)} training steps` + (live ? " (live)" : " (saved run)");
        list.innerHTML = "";
        arr.forEach((t) => list.appendChild(h("div", { style: { fontFamily: "var(--font-code)", fontSize: "22px", padding: "9px 0", borderBottom: "1px solid " + RULE, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, t || "(empty)")));
      }
      function setStep(n) { curStep = n; stepEl.textContent = `Step ${Deck.fmt(n)} of 3,000`; }
      function showSnap(stepKey) {
        if (!snap) return;
        pts = snap.losses.filter((p) => p[0] <= stepKey); drawLoss();
        showSamples(snap.snaps[stepKey], stepKey, false); setStep(stepKey);
      }
      const live = !ctx.print && !ctx.preview && corpus && window.Worker && window.TinyModel;
      function startWorker() {
        if (worker) return worker;
        const src = `const TinyModel = ${window.TinyModel.toString()};
          let m = null, running = false, until = 0, step = 0;
          onmessage = (e) => {
            const d = e.data;
            if (d.cmd === "init") { m = TinyModel(d.corpus, d.seed); step = 0; postMessage({ type: "samples", step: 0, samples: m.sample(6, 0.8, 70) }); }
            if (d.cmd === "run") { until = d.until; if (!running) { running = true; loop(); } }
            if (d.cmd === "pause") running = false;
          };
          function loop() {
            if (!running) return;
            for (let i = 0; i < 10 && step < until; i++) { const L = m.trainStep(32, step < 1500 ? 0.004 : 0.002); if (step % 25 === 0) postMessage({ type: "loss", step, loss: L }); step++; }
            if (step % 250 === 0 || step >= until) postMessage({ type: "samples", step, samples: m.sample(6, 0.8, 70) });
            if (step >= until) { running = false; postMessage({ type: "done", step }); return; }
            setTimeout(loop, 0);
          }`;
        worker = new Worker(URL.createObjectURL(new Blob([src], { type: "text/javascript" })));
        worker.onmessage = (e) => {
          const d = e.data;
          if (d.type === "loss") { pts.push([d.step, d.loss]); drawLoss(); setStep(d.step); }
          if (d.type === "samples") { showSamples(d.samples, d.step, true); setStep(d.step); }
          if (d.type === "done") setStep(d.step);
        };
        worker.postMessage({ cmd: "init", corpus, seed: 12 });
        return worker;
      }
      function reset() { if (worker) worker.terminate(); worker = null; pts = []; drawLoss(); setStep(0); if (live) startWorker(); else showSnap(0); }
      bTrain.addEventListener("click", () => { if (live) startWorker().postMessage({ cmd: "run", until: 3000 }); });
      bPause.addEventListener("click", () => worker && worker.postMessage({ cmd: "pause" }));
      bReset.addEventListener("click", reset);
      if (!live) [bTrain, bPause, bReset].forEach((b) => (b.disabled = true));
      return {
        update(k, animate) {
          if (!live || !animate) {
            const key = k <= 1 ? 0 : k === 2 ? 300 : 3000;
            if (!live) { showSnap(key); rp.style.opacity = k >= 1 ? 1 : 0; return; }
            if (k <= 1 && worker) { reset(); }
          }
          rp.style.opacity = k >= 1 ? 1 : 0;
          if (live) {
            startWorker();
            if (k === 2) worker.postMessage({ cmd: "run", until: Math.max(300, curStep) });
            if (k >= 3) worker.postMessage({ cmd: "run", until: 3000 });
          }
        },
        destroy() { if (worker) worker.terminate(); },
      };
    },
  };

  /* ---------- base model vs instruction-tuned ---------- */
  Deck.components.BaseVsChat = {
    steps: 3,
    mount(host, ctx) {
      const g = G(); const fm = ctx.fm;
      const D = g && g.base_model;
      const smp = { text: D ? D.text : "" };
      const q = D ? D.prompt : "What's a good birthday idea for my roommate?";
      const L = h("div", { class: "ev-card show-on", style: `left:0px;top:0px;width:716px;height:330px;--b:${COBALT}` },
        h("div", { class: "h", style: { color: "#2A50B0" } }, "Base model · example continuation"),
        h("div", { style: { fontWeight: 700, fontSize: "22px", marginBottom: "8px" } }, q),
        h("div", { style: { fontSize: "21px", whiteSpace: "pre-wrap", color: "#4A4F6E", lineHeight: 1.45 } }, smp.text + " …"));
      const R = h("div", { class: "ev-card show-on", style: `left:756px;top:0px;width:716px;height:330px;--b:${LEAF}` },
        h("div", { class: "h", style: { color: LEAF } }, "Instruction-tuned · written example"),
        h("div", { style: { fontWeight: 700, fontSize: "22px", marginBottom: "8px" } }, q),
        h("div", { style: { fontSize: "21px", lineHeight: 1.45 } }, fm.chat || ""));
      const tune = h("div", { class: "panel show-on", style: { left: "0px", top: "360px", width: "1472px", height: "176px", padding: "14px 22px", fontFamily: "var(--font-code)", fontSize: "18px", lineHeight: 1.6 } });
      tune.innerHTML = `<div class="ptitle" style="font-family:var(--font-display)">One fine-tuning example (the format)</div>
        <div><span style="color:#5A3290;font-weight:700">&lt;|system|&gt;</span> You are a helpful assistant.</div>
        <div><span style="color:#2A50B0;font-weight:700">&lt;|user|&gt;</span> ${Deck.esc(q)}</div>
        <div><span style="color:${LEAF};font-weight:700">&lt;|assistant|&gt;</span> ${Deck.esc((fm.chat || "").slice(0, 110))}…</div>`;
      host.append(L, R, tune);
      return { update(k) { L.classList.toggle("off-up", k < 1); R.classList.toggle("off-up", k < 2); tune.classList.toggle("off-up", k < 3); } };
    },
  };

  /* ---------- preference training ---------- */
  Deck.components.PreferencePair = {
    steps: 5,
    mount(host, ctx) {
      const fm = ctx.fm;
      const A = fm.a || "Spend the $100 on dinner and something your roommate actually likes.";
      const B = fm.b || "Hide the $100 somewhere in the apartment. Every 10 minutes they don't find it, add another $100.";
      const ca = h("div", { class: "ev-card", style: `left:0px;top:0px;width:700px;height:150px;--b:${COBALT};font-size:24px` }, h("div", { class: "h", style: { color: "#2A50B0" } }, "Reply A"), A);
      const cb = h("div", { class: "ev-card", style: `left:772px;top:0px;width:700px;height:150px;--b:${MAGENTA};font-size:24px` }, h("div", { class: "h", style: { color: "#B0106A" } }, "Reply B"), B);
      host.append(ca, cb);
      const v1 = h("div", { class: "q-card show-on", style: { left: "0px", top: "176px", width: "700px", fontSize: "25px", padding: "16px 22px" } }, "Vote 1: Which sounds more like MrFeast?");
      const v2 = h("div", { class: "q-card show-on", style: { left: "772px", top: "176px", width: "700px", fontSize: "25px", padding: "16px 22px", background: "#45731A" } }, "Vote 2: Which helps someone with a $100 budget?");
      host.append(v1, v2);
      const guide = h("div", { class: "ev-card show-on", style: `left:0px;top:290px;width:1472px;height:84px;--b:${VIOLET}` }, h("div", { class: "h", style: { color: "#5A3290" } }, "Hypothetical rater guideline"), h("span", { style: { fontSize: "22px" } }, "\"Reward replies that sound like the persona.\" → the rater picks B."));
      host.appendChild(guide);
      // pipeline
      const pipe = h("div", { class: "abs", style: { left: "0px", top: "400px", width: "1472px", height: "230px" } });
      host.appendChild(pipe);
      const box = (x, w, title, body, col) => { const b = h("div", { class: "ev-card show-on", style: `left:${x}px;top:20px;width:${w}px;height:170px;--b:${col}` }, h("div", { class: "h" }, title), h("div", { html: body })); pipe.appendChild(b); return b; };
      const p1 = box(0, 270, "Many ratings", "Thousands of pairs like this one, each with a human choice.", VIOLET);
      const p2 = box(320, 280, "Reward model", `Learns to score replies.<div style="font-family:var(--font-code);margin-top:8px">A → <b>0.31</b> &nbsp; B → <b>0.87</b></div>`, VIOLET);
      const p3 = box(650, 280, "Update the chatbot", "Shift its weights so replies that score higher become more likely. B-style replies win.", MAGENTA);
      const ar = [h("div", { class: "abs show-on", style: { left: "277px", top: "80px", fontSize: "36px", color: MUTED } }, "→"), h("div", { class: "abs show-on", style: { left: "607px", top: "80px", fontSize: "36px", color: MUTED } }, "→")];
      ar.forEach((a) => pipe.appendChild(a));
      return {
        update(k) {
          v1.classList.toggle("off-up", k < 1); v2.classList.toggle("off-up", k < 2);
          guide.classList.toggle("off-up", k < 3);
          cb.style.outline = k >= 3 ? "4px solid #D6177F" : "none";
          p1.classList.toggle("off-up", k < 4); p2.classList.toggle("off-up", k < 4); ar[0].classList.toggle("off", k < 4);
          p3.classList.toggle("off-up", k < 5); ar[1].classList.toggle("off", k < 5);
        },
      };
    },
  };
})();
