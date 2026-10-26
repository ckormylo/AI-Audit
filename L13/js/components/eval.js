/* L13 components: the launch memo, the leaderboard and its limits, golden-set anatomy, the rubric, "Be the judge",
   the kappa worked example, the live judge test–retest, the bootstrap, the paired comparison, the verbosity scatter, the close. */
(function () {
  const { h, s, svg } = Deck;
  const INK = "#232748", MUTED = "#5F6379", RULE = "#E2DACB", VERM = "#E8431F", VERMD = "#BF3417", MAGENTA = "#D6177F", COBALT = "#2F5FD0", VIOLET = "#6B3FA0", LEAF = "#45731A", TEAL = "#0E6F7F", MARI = "#8F5A00", MARIB = "#F4A51C", CHART = "#A9C93A";
  const cfg = () => window.ARENA_CONFIG;
  const KEY = () => (Deck.id || "DECK") + "-eval-state";
  const S = (Deck.evalState = Deck.evalState || { votes: {}, runs: null });
  try { Object.assign(S, JSON.parse(localStorage.getItem(KEY()) || "{}")); } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY(), JSON.stringify({ votes: S.votes, runs: S.runs })); } catch (e) {} };
  const rng = (seed) => { let x = seed || 1; return () => ((x = (x * 1103515245 + 12345) % 2147483648) / 2147483648); };

  /* kappa for two label vectors (strings) */
  Deck.kappa = function (A, B) {
    const n = A.length; if (!n) return null;
    const labs = [...new Set(A.concat(B))];
    let p0 = 0; for (let i = 0; i < n; i++) if (A[i] === B[i]) p0++;
    p0 /= n;
    let pe = 0; for (const l of labs) { const pa = A.filter((x) => x === l).length / n, pb = B.filter((x) => x === l).length / n; pe += pa * pb; }
    return { p0, pe, k: pe === 1 ? 1 : (p0 - pe) / (1 - pe), n };
  };
  const band = (k) => (k < 0.2 ? "slight" : k < 0.4 ? "fair" : k < 0.6 ? "moderate" : k < 0.8 ? "substantial" : "almost perfect");
  const f2 = (x) => (Math.round(x * 1000) / 1000).toFixed(3).replace(/0$/, "").replace(/0$/, "");

  /* ---------- what a benchmark is: three parts and one number ---------- */
  Deck.components.BenchmarkParts = {
    steps: 5,
    mount(host) {
      const parts = [
        ["Test inputs", "A fixed list of questions or tasks", "\u201cHow long does shipping take?\u201d \u00b7 \u201cDo you ship to Canada?\u201d \u00b7 \u201cWhat\u2019s MrFeast\u2019s home address?\u201d", COBALT],
        ["Reference answers", "What a correct response to each input is", "5 to 7 business days inside the US \u00b7 No, not yet \u00b7 Decline", VIOLET],
        ["Scoring rule", "How a response is compared with the reference", "Binary: does the reply state the key fact? Or an anchored 1 to 4 scale", MARI],
      ];
      const cards = parts.map(([t, d, ex, col], i) => { const el = h("div", { class: "bp-card show-on off-up", style: `left:${i * 496}px;--c:${col}` }, h("div", { class: "bp-n" }, String(i + 1)), h("div", { class: "bp-t" }, t), h("div", { class: "bp-d" }, d), h("div", { class: "bp-ex" }, ex)); host.appendChild(el); return el; });
      const arrow = h("div", { class: "bp-arrow show-on off-up" }, h("span", {}, "run the system on the inputs \u2192 apply the rule \u2192"), h("b", {}, "one number"), h("span", { class: "bp-sub" }, "for example, \u201c81% of 200 replies stated the key fact\u201d. The number is only as good as the three parts."));
      host.appendChild(arrow);
      const two = h("div", { class: "bp-two show-on off-up" },
        h("div", { class: "bp-kind", style: "--c:" + COBALT }, h("div", { class: "bp-kt" }, "Public benchmark"), "Built by others, for a general task, scored on many models. Examples: multi-subject exams, preference leaderboards. Useful for choosing a model to try."),
        h("div", { class: "bp-kind", style: "--c:" + VIOLET }, h("div", { class: "bp-kt" }, "Your own benchmark"), "Built for your system and your task, from your usage. Often called a golden set. The only kind that tells you whether your deployed system works. Part 2 builds one."));
      host.appendChild(two);
      return { update(k) { cards.forEach((c, i) => c.classList.toggle("off-up", k < i + 1)); arrow.classList.toggle("off-up", k < 4); two.classList.toggle("off-up", k < 5); } };
    },
  };

  /* ---------- six steps to a benchmark ---------- */
  Deck.components.BuildSteps = {
    steps(fm) { return (fm.step || []).length; },
    mount(host, ctx) {
      const steps = (ctx.fm.step || []).map((l) => l.split("|").map((x) => x.trim()));
      const rows = steps.map(([t, d], i) => { const el = h("div", { class: "bs-step show-on off-up" }, h("div", { class: "bs-num" }, String(i + 1)), h("div", {}, h("div", { class: "bs-t" }, t), h("div", { class: "bs-d" }, d))); host.appendChild(el); return el; });
      return { update(k) { rows.forEach((r, i) => { r.classList.toggle("off-up", k < i + 1); r.classList.toggle("now", k === i + 1); }); } };
    },
  };

  /* ---------- the launch memo ---------- */
  Deck.components.LaunchMemo = {
    steps(fm) { return (fm.problem || []).length + 1; },
    mount(host, ctx) {
      const c = cfg(), problems = (ctx.fm.problem || []).map((l) => l.split("|").map((x) => x.trim()));
      const memo = h("div", { class: "memo" }, h("div", { class: "memo-h" }, "Internal memo · MrFeast AI product team · to the AI Governance Committee"), h("div", { class: "memo-b" }));
      const marks = [["96% accuracy", 1], ["scored automatically by our evaluation model", 2], ["drawn from the product team's test set", 3], ["accuracy", 4]];
      let html = Deck.esc(c.memo);
      // mark the four phrases (the 4th is the first "accuracy", which the 1st mark already contains; mark the word separately)
      html = html.replace("96% accuracy", '<mark class="m" data-k="1">96% <span class="m" data-k="4">accuracy</span></mark>');
      html = html.replace("scored automatically by our evaluation model", '<mark class="m" data-k="2">scored automatically by our evaluation model</mark>');
      html = html.replace("drawn from the product team&#39;s test set", '<mark class="m" data-k="3">drawn from the product team&#39;s test set</mark>').replace("drawn from the product team's test set", '<mark class="m" data-k="3">drawn from the product team\'s test set</mark>');
      memo.querySelector(".memo-b").innerHTML = html;
      host.appendChild(memo);
      const cards = problems.map(([t, b], i) => { const el = h("div", { class: "ev-card show-on off-up", style: `left:820px;top:${i * 150}px;width:652px;height:134px;--b:var(--vermilion);font-size:19px;padding:12px 18px` }, h("div", { class: "h", style: { color: VERMD } }, (i + 1) + " · " + t), b); host.appendChild(el); return el; });
      return { update(k) { cards.forEach((el, i) => el.classList.toggle("off-up", k < i + 2)); memo.querySelectorAll(".m").forEach((m) => m.classList.toggle("on", k >= +m.dataset.k + 1)); memo.classList.toggle("ask", k === 1); } };
    },
  };

  /* ---------- leaderboard + limits ---------- */
  Deck.components.Leaderboard = {
    steps(fm) { return (fm.limit || []).length + 1; },
    mount(host, ctx) {
      const c = cfg(), limits = (ctx.fm.limit || []).map((l) => l.split("|").map((x) => x.trim()));
      const lb = h("div", { class: "lb" }, h("div", { class: "lb-h" }, "Open Chatbot Leaderboard", h("span", {}, " · invented for the slide")));
      c.leaderboard.forEach((r) => lb.appendChild(h("div", { class: "lb-row" + (r.rank === 3 ? " pick" : "") }, h("span", { class: "r" }, "#" + r.rank), h("span", { class: "n" }, r.name), h("span", { class: "s" }, r.score.toFixed(1)))));
      lb.appendChild(h("div", { class: "lb-f" }, "Procurement memo: \"We selected the #3 model on the leaderboard.\""));
      host.appendChild(lb);
      const cards = limits.map(([t, b], i) => { const el = h("div", { class: "ev-card show-on off-up", style: `left:560px;top:${i * 118}px;width:912px;height:104px;--b:var(--cobalt);font-size:18px;padding:10px 16px` }, h("div", { class: "h", style: { color: "#2A50B0" } }, t), b); host.appendChild(el); return el; });
      const snap = h("div", { class: "cs-note show-on off-up", style: { top: "490px", "--b": "var(--vermilion)", fontSize: "18px" } }, ctx.fm.snapshot || "");
      host.appendChild(snap);
      return { update(k) { cards.forEach((el, i) => el.classList.toggle("off-up", k < i + 1)); snap.classList.toggle("off-up", k < limits.length + 1); } };
    },
  };

  /* ---------- golden set anatomy ---------- */
  Deck.components.GoldenSet = {
    steps: 4,
    mount(host) {
      const c = cfg();
      const t = h("table", { class: "gs" });
      t.innerHTML = "<tr><th style='width:60px'>Item</th><th style='width:330px'>Fan question (from usage logs)</th><th>Reference answer (grounded in the approved facts)</th><th class='kc' style='width:290px'>Key fact</th></tr>";
      c.golden.forEach((g) => { const tr = h("tr", { class: g.scope === "out" ? "oos" : "" }); tr.innerHTML = `<td class='id'>${g.id}</td><td>${Deck.esc(g.q)}</td><td>${Deck.esc(g.ref)}</td><td class='kc'><code>${Deck.esc(g.key)}</code></td>`; t.appendChild(tr); });
      host.appendChild(t);
      const notes = [
        null, null,
        h("div", { class: "cs-note show-on off-up gs-note", style: { "--b": "var(--vermilion)" } }, "Three of eight items are out of scope: the correct behavior is to decline. The vendor's 200-question set had none. An evaluation without them cannot measure overreach, and overreach is the failure that costs money."),
        h("div", { class: "cs-note show-on off-up gs-note", style: { "--b": "var(--violet)" } }, "Who writes the set matters. A developer-authored set drifts toward what the system does well, by familiarity rather than fraud. Independent authorship, or at minimum independent review, is the reliability upgrade (L3's evidence hierarchy applied to test sets)."),
        h("div", { class: "cs-note show-on off-up gs-note", style: { "--b": "var(--leaf-d)" } }, "A golden set is a dataset. Sample from real usage with a privacy review of the logs (L7). Cover intents × difficulty × edge cases deliberately. Version it. Write it a datasheet (L4). Audit it like one."),
      ];
      notes.forEach((n) => n && host.appendChild(n));
      return { update(k) { t.classList.toggle("showkey", k >= 1); t.classList.toggle("showoos", k >= 2); notes.forEach((n, i) => n && n.classList.toggle("off-up", k !== i)); } };
    },
  };

  /* ---------- rubric ---------- */
  Deck.components.Rubric = {
    steps: 2,
    mount(host) {
      const c = cfg();
      const bin = h("div", { class: "panel rb-bin" }, h("div", { class: "ptitle" }, "Binary, when the key fact decides"),
        h("div", { class: "rb-row" }, h("span", { class: "rb-q" }, "How long does shipping take?"), h("span", { class: "rb-k" }, "key fact: 5 to 7 business days")),
        h("div", { class: "rb-row" }, h("span", { class: "vchip blocked" }, "CORRECT"), h("span", {}, "the reply states 5 to 7 business days")),
        h("div", { class: "rb-row" }, h("span", { class: "vchip broke" }, "INCORRECT"), h("span", {}, "any other window, or no window")));
      host.appendChild(bin);
      const sc = h("div", { class: "panel rb-scale show-on off-up" }, h("div", { class: "ptitle" }, "Anchored scale, when judgment is needed · pass = level " + c.passLevel + " or above"));
      c.rubric.forEach((r) => sc.appendChild(h("div", { class: "rb-lvl" + (r.level >= c.passLevel ? " pass" : ""), style: `--b:${r.level >= c.passLevel ? LEAF : VERMD}` }, h("div", { class: "lv" }, String(r.level)), h("div", {}, h("div", { class: "lb2" }, r.label), h("div", { class: "df" }, r.def)))));
      host.appendChild(sc);
      const bad = h("div", { class: "cs-note show-on off-up", style: { top: "548px", "--b": "var(--vermilion)", fontSize: "19px" } }, "The unanchored version: \"rate the answer 1 to 5\". Two raters can both be careful and still disagree on every borderline reply, because the scale points were never defined. That disagreement will show up as a low kappa in Part 3, and it is the rubric's fault, not the raters'.");
      host.appendChild(bad);
      return { update(k) { sc.classList.toggle("off-up", k < 1); bad.classList.toggle("off-up", k < 2); } };
    },
  };

  /* ---------- be the judge ---------- */
  Deck.components.BeTheJudge = {
    steps: 1,
    mount(host, ctx) {
      const c = cfg(), items = c.items.slice(0, 6), g = (id) => c.golden.find((x) => x.id === id);
      // printed copy: show the answer key in place of the class vote, without touching saved state
      const V = ctx.print ? Object.fromEntries(items.map((it) => [it.id, it.humanKey])) : S.votes;
      const list = h("div", { class: "bj-list" });
      const rows = items.map((it) => {
        const q = g(it.gid);
        const row = h("div", { class: "bj-row" },
          h("div", { class: "bj-q" }, h("div", { class: "bj-id" }, it.id + " · " + q.q), h("div", { class: "bj-key" }, "key fact: " + q.key)),
          h("div", { class: "bubble bot bj-reply" }, it.reply),
          h("div", { class: "bj-vote" }, h("button", { class: "btn ok", onclick: () => vote(it.id, "pass") }, "Pass"), h("button", { class: "btn bad", onclick: () => vote(it.id, "fail") }, "Fail")),
          h("div", { class: "bj-judge show-on off-up" }, h("div", { class: "lbl-caps" }, "Vendor's judge"), h("span", { class: "vchip " + (it.judgeA === "pass" ? "blocked" : "broke") }, it.judgeA.toUpperCase())));
        list.appendChild(row); return { row, it };
      });
      host.appendChild(list);
      const foot = h("div", { class: "bj-foot show-on off-up" });
      host.appendChild(foot);
      function vote(id, v) { if (ctx.print) return; S.votes[id] = v; save(); render(); }
      function render() {
        rows.forEach(({ row, it }) => { row.querySelectorAll(".bj-vote .btn").forEach((b) => b.classList.toggle("on", V[it.id] === b.textContent.toLowerCase())); row.classList.toggle("dis", !!V[it.id] && V[it.id] !== it.judgeA && row.classList.contains("rev")); });
        const voted = items.filter((it) => V[it.id]);
        if (voted.length) {
          const A = voted.map((it) => V[it.id]), B = voted.map((it) => it.judgeA);
          const kp = Deck.kappa(A, B) || { p0: 0, k: 0 };
          foot.innerHTML = `<span>${ctx.print ? "Answer key" : "Class"} vs. vendor's judge on ${voted.length} item${voted.length > 1 ? "s" : ""}:</span> <b>percent agreement ${Deck.pct(kp.p0, 0)}</b> <span>· kappa ${f2(kp.k)} (${band(kp.k)})</span> <span class="muted">· the judge passed the long wrong reply and failed the short right one</span>`;
        } else foot.textContent = "Vote on the items to compare.";
      }
      render();
      return { update(k) { rows.forEach(({ row }) => { row.classList.toggle("rev", k >= 1); row.querySelector(".bj-judge").classList.toggle("off-up", k < 1); }); foot.classList.toggle("off-up", k < 1); render(); } };
    },
  };

  /* ---------- kappa worked example ---------- */
  Deck.components.Kappa = {
    steps: 4,
    mount(host) {
      const { a, b, c: cc, d } = cfg().kappa, n = a + b + cc + d;
      const p0 = (a + d) / n, r1 = (a + b) / n, r2 = (a + cc) / n, pe = r1 * r2 + (1 - r1) * (1 - r2), k = (p0 - pe) / (1 - pe);
      const t = h("table", { class: "kt" });
      t.innerHTML = `<tr><th></th><th>Rater 2: pass</th><th>Rater 2: fail</th><th class="mg">Rater 1 total</th></tr>
        <tr><th>Rater 1: pass</th><td class="ag">${a}</td><td>${b}</td><td class="mg">${a + b}</td></tr>
        <tr><th>Rater 1: fail</th><td>${cc}</td><td class="ag">${d}</td><td class="mg">${cc + d}</td></tr>
        <tr><th class="mg">Rater 2 total</th><td class="mg">${a + cc}</td><td class="mg">${b + d}</td><td class="mg">${n}</td></tr>`;
      host.appendChild(h("div", { class: "panel kt-wrap" }, t));
      const steps = [
        h("div", { class: "k-step show-on off-up" }, h("div", { class: "k-l" }, "Observed agreement"), h("div", { class: "k-f" }, `p₀ = (${a} + ${d}) / ${n} = `, h("b", {}, p0.toFixed(2)))),
        h("div", { class: "k-step show-on off-up" }, h("div", { class: "k-l" }, "Agreement expected by chance, from the marginals"), h("div", { class: "k-f" }, `pₑ = ${r1.toFixed(2)} × ${r2.toFixed(2)} + ${(1 - r1).toFixed(2)} × ${(1 - r2).toFixed(2)} = `, h("b", {}, pe.toFixed(2)))),
        h("div", { class: "k-step show-on off-up" }, h("div", { class: "k-l" }, "Cohen's kappa"), h("div", { class: "k-f" }, `κ = (p₀ − pₑ) / (1 − pₑ) = (${p0.toFixed(2)} − ${pe.toFixed(2)}) / (1 − ${pe.toFixed(2)}) = `, h("b", { style: { color: "#B0106A" } }, k.toFixed(3)))),
      ];
      const col = h("div", { class: "k-col" }, steps); host.appendChild(col);
      // bands strip
      const strip = h("div", { class: "k-bands show-on off-up" });
      const bands = [["slight", 0, 0.2, "0.00 to 0.20"], ["fair", 0.2, 0.4, "0.21 to 0.40"], ["moderate", 0.4, 0.6, "0.41 to 0.60"], ["substantial", 0.6, 0.8, "0.61 to 0.80"], ["almost perfect", 0.8, 1.0, "0.81 to 1.00"]];
      const bar = h("div", { class: "k-bar" }); bands.forEach(([nm, lo, hi, rng]) => bar.appendChild(h("div", { class: "k-band", style: { width: (hi - lo) * 100 + "%" } }, h("span", { class: "k-bn" }, nm), h("span", { class: "k-br" }, rng))));
      const ticks = h("div", { class: "k-ticks" }); [0, 0.2, 0.4, 0.6, 0.8, 1].forEach((v) => ticks.appendChild(h("span", { style: { left: v * 100 + "%" } }, v.toFixed(2))));
      const mark = h("div", { class: "k-mark", style: { left: k * 100 + "%" } }, "κ = " + k.toFixed(3));
      strip.append(h("div", { class: "lbl-caps" }, "Landis and Koch (1977) bands for kappa · a convention, not a rule · below 0.00 is \"poor\""), h("div", { style: { position: "relative" } }, bar, mark, ticks));
      host.appendChild(strip);
      return { update(kk) { steps.forEach((el, i) => el.classList.toggle("off-up", kk < i + 1)); strip.classList.toggle("off-up", kk < 4); t.classList.toggle("hl-ag", kk === 1); t.classList.toggle("hl-mg", kk === 2); } };
    },
  };

  /* ---------- live judge test–retest ---------- */
  Deck.components.JudgeTwice = {
    steps: 2,
    mount(host, ctx) {
      const c = cfg(), llm = Deck.llm, items = c.items, g = (id) => c.golden.find((x) => x.id === id);
      // printed copy: answer key in the Class column, the two stored runs filled in, nothing saved
      const V = ctx.print ? Object.fromEntries(items.map((it) => [it.id, it.humanKey])) : S.votes;
      const SS = ctx.print ? { votes: V, runs: { run1: Object.assign({}, c.storedRuns.run1), run2: Object.assign({}, c.storedRuns.run2), label: c.storedRuns.label, stored: true } } : S;
      const status = h("span", { class: "pill st" }, "…");
      const strip = h("div", { class: "cfg-strip", style: { left: "0px", width: "1472px" } }, status, h("span", { class: "pill" }, "judge ", h("b", {}, c.judge.model)), h("span", { class: "pill" }, "T ", h("b", {}, String(c.judge.temperature))), h("span", { class: "pill" }, "seed ", h("b", {}, "none")), h("button", { class: "btn primary", style: { marginLeft: "auto" }, onclick: () => run() }, "Run our judge"));
      host.appendChild(strip);
      const setStatus = () => { status.textContent = ctx.print ? "STORED RUNS · printed copy; the judge runs live in class" : llm.mode === "live" ? "LIVE" : llm.mode === "replay" ? (llm.hosted ? "STORED RUNS · the live judge runs only in class" : location.protocol === "file:" ? "REPLAY · open via start-deck.bat for live" : "REPLAY · Ollama not reached") : "…"; status.className = "pill st " + llm.mode; };
      setStatus(); const unsub = llm.onChange(setStatus);
      const t = h("table", { class: "jt" });
      t.innerHTML = `<tr><th style='width:52px'>Item</th><th>Reply</th><th style='width:170px'>Key fact</th><th style='width:96px'>Vendor's judge</th><th style='width:92px'>Our run 1</th><th style='width:92px'>Our run 2</th><th style='width:88px'>${ctx.print ? "Answer key" : "Class"}</th></tr>`;
      const cells = {};
      items.forEach((it) => { const q = g(it.gid); const tr = h("tr"); tr.innerHTML = `<td class='id'>${it.id}</td><td class='rp'>${Deck.esc(it.reply)}</td><td class='kf'>${Deck.esc(q.key)}</td><td class='v vj'></td><td class='v r1'></td><td class='v r2'></td><td class='v cl'></td>`; t.appendChild(tr); cells[it.id] = { vj: tr.querySelector(".vj"), r1: tr.querySelector(".r1"), r2: tr.querySelector(".r2"), cl: tr.querySelector(".cl"), tr }; });
      host.appendChild(h("div", { class: "jt-wrap" }, t));
      const foot = h("div", { class: "jt-foot" }); host.appendChild(foot);
      const chip = (v) => `<span class="vchip ${v === "pass" ? "blocked" : "broke"}" style="font-size:14px;padding:3px 9px">${v.toUpperCase()}</span>`;
      function renderRuns() {
        const R = SS.runs || {};
        items.forEach((it) => { const cl = cells[it.id]; cl.vj.innerHTML = chip(it.judgeA); cl.r1.innerHTML = R.run1 && R.run1[it.id] ? chip(R.run1[it.id]) : ""; cl.r2.innerHTML = R.run2 && R.run2[it.id] ? chip(R.run2[it.id]) : ""; cl.cl.innerHTML = SS.votes[it.id] ? chip(SS.votes[it.id]) : "<span class='muted'>–</span>"; cl.tr.classList.toggle("dis", !!(R.run1 && R.run2 && R.run1[it.id] && R.run2[it.id] && R.run1[it.id] !== R.run2[it.id])); });
        const parts = [];
        const votedV = items.filter((it) => SS.votes[it.id]);
        if (votedV.length) { const kp = Deck.kappa(votedV.map((it) => it.judgeA), votedV.map((it) => SS.votes[it.id])); if (kp) parts.push(`<b>Vendor's judge vs. ${ctx.print ? "answer key" : "class"}</b> (${votedV.length} items, same numbers as the Be-the-judge slide): agreement ${Deck.pct(kp.p0, 0)}, κ ${f2(kp.k)} (${band(kp.k)})`); }
        if (R.run1 && R.run2) { const ids = items.map((i) => i.id).filter((id) => R.run1[id] && R.run2[id]); const kp = ids.length ? Deck.kappa(ids.map((id) => R.run1[id]), ids.map((id) => R.run2[id])) : null; const dis = ids.filter((id) => R.run1[id] !== R.run2[id]).length; if (kp) parts.push(`<b>Our judge vs. itself</b> (test–retest, ${ids.length} items): agreement ${Deck.pct(kp.p0, 0)}, κ ${f2(kp.k)} (${band(kp.k)}), ${dis} disagreement${dis === 1 ? "" : "s"}`); }
        const voted = items.filter((it) => SS.votes[it.id] && R.run1 && R.run1[it.id]);
        if (voted.length) { const kp = Deck.kappa(voted.map((it) => R.run1[it.id]), voted.map((it) => SS.votes[it.id])); if (kp) parts.push(`<b>Our judge (run 1) vs. ${ctx.print ? "answer key" : "class"}</b> (${voted.length} items): agreement ${Deck.pct(kp.p0, 0)}, κ ${f2(kp.k)} (${band(kp.k)})`); }
        if (R.run1) { const ids = items.map((i) => i.id).filter((id) => R.run1[id]); if (ids.length) { const kp = Deck.kappa(ids.map((id) => R.run1[id]), ids.map((id) => items.find((i) => i.id === id).judgeA)); if (kp) parts.push(`<b>Our judge (run 1) vs. vendor's judge</b> (${ids.length} items): agreement ${Deck.pct(kp.p0, 0)}, κ ${f2(kp.k)} (${band(kp.k)})`); } }
        if (R.label) parts.push(`<span class="muted" style="font-size:13px">${Deck.esc(R.label)}</span>`);
        foot.innerHTML = parts.join("<br>") || "Run our judge to fill the two run columns.";
      }
      let busy = false;
      async function judgeOne(it) {
        const q = g(it.gid);
        const msgs = [{ role: "system", content: c.judgePrompt }, { role: "user", content: `Fan question: ${q.q}\nKey fact: ${q.key}\nReply: ${it.reply}\n\nGrade the reply.` }];
        const res = await llm.chat({ model: c.judge.model, messages: msgs, format: { type: "object", properties: { reason: { type: "string" }, verdict: { type: "string", enum: ["pass", "fail"] } }, required: ["reason", "verdict"] }, options: { temperature: c.judge.temperature, num_predict: c.judge.num_predict, num_ctx: c.judge.num_ctx } });
        let j; try { j = JSON.parse(res.content); } catch (e) { const m = res.content.match(/\{[\s\S]*\}/); try { j = JSON.parse(m[0]); } catch (e2) { j = { verdict: "fail", reason: "no JSON" }; } }
        return j.verdict === "pass" ? "pass" : "fail";
      }
      async function run() {
        if (busy) return; busy = true;
        try { await runInner(); } catch (e) { console.error(e); foot.textContent = "Error: " + e.message; } finally { busy = false; }
      }
      async function runInner() {
        if (llm.mode !== "live" && !new URLSearchParams(location.search).has("replay")) await llm.health();
        let R = SS.runs || { run1: null, run2: null };
        if (R.run1 && R.run2) R = { run1: null, run2: null }; // a third press starts over
        const which = !R.run1 ? "run1" : "run2";
        SS.runs = R;
        if (llm.mode === "live") {
          R[which] = {}; R.stored = false;
          for (const it of items) { cells[it.id][which === "run1" ? "r1" : "r2"].innerHTML = "<span class='vchip wait' style='font-size:13px;padding:3px 8px'>…</span>"; try { R[which][it.id] = await judgeOne(it); } catch (e) { delete R[which][it.id]; foot.textContent = "Could not reach the model: " + e.message; llm.mode = "replay"; llm._emit(); break; } renderRuns(); }
          R.label = `Live run on ${new Date().toLocaleDateString()}, ${c.judge.model}, temperature ${c.judge.temperature}, no seed`;
          llm.logWrite({ id: "T" + Date.now().toString(36), ts: new Date().toISOString(), deck: Deck.id, technique: "judge-retest", label: which, turns: items.map((it) => ({ user: it.reply, bot: R[which][it.id] || null })), config: { judge: c.judge.model, temperature: c.judge.temperature } });
        } else {
          const st = c.storedRuns; R[which] = Object.assign({}, st[which]); R.label = st.label; R.stored = true;
          for (const it of items) { await new Promise((r) => setTimeout(r, 140)); renderRunsPartial(it.id); }
        }
        save(); renderRuns();
      }
      function renderRunsPartial(upto) { const ids = items.map((i) => i.id); const cut = ids.indexOf(upto); const R = SS.runs; items.forEach((it, i) => { if (i > cut) return; const cl = cells[it.id]; if (R.run1 && R.run1[it.id]) cl.r1.innerHTML = chip(R.run1[it.id]); if (R.run2 && R.run2[it.id]) cl.r2.innerHTML = chip(R.run2[it.id]); }); }
      renderRuns();
      let want = 0, pumping = false;
      async function pump() {
        if (pumping) return; pumping = true;
        try {
          for (let guard = 0; guard < 2; guard++) {
            const have = SS.runs && SS.runs.run1 ? (SS.runs.run2 ? 2 : 1) : 0;
            if (have >= want) break;
            await run();
          }
        } finally { pumping = false; }
      }
      return { update(k) { if (ctx.print || ctx.preview) return; want = Math.min(2, k); if (k >= 1) pump(); }, destroy() { unsub(); } };
    },
  };

  /* ---------- bootstrap ---------- */
  Deck.components.Bootstrap = {
    steps: 4,
    mount(host, ctx) {
      const B = cfg().bootstrap, n = B.n, rnd = rng(B.seed);
      const data = Array.from({ length: n }, (_, i) => i < B.correct ? 1 : 0);
      // shuffle for the picture
      for (let i = n - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [data[i], data[j]] = [data[j], data[i]]; }
      const dots = h("div", { class: "bs-dots" });
      const dotEls = data.map((v) => { const d = h("i", { class: v ? "ok" : "bad" }); dots.appendChild(d); return d; });
      const left = h("div", { class: "panel bs-left" }, h("div", { class: "ptitle" }, `${n} graded transcripts · ${B.correct} correct · point estimate ${Deck.pct(B.correct / n, 0)}`), dots, h("div", { class: "bs-pick" }));
      host.appendChild(left);
      const right = h("div", { class: "panel bs-right" }, h("div", { class: "ptitle" }, "Accuracy of each resample"));
      const g = svg(760, 330, right); const histG = s("g", {}, g); const axisG = s("g", {}, g); const ciG = s("g", {}, g);
      host.appendChild(right);
      const code = h("pre", { class: "bs-code show-on off-up" }, `import numpy as np\nrng = np.random.default_rng(40515)\ncorrect = transcripts["correct"].to_numpy()      # 0/1 per transcript\naccs = [rng.choice(correct, size=len(correct), replace=True).mean()\n        for _ in range(1000)]\nlo, hi = np.percentile(accs, [2.5, 97.5])\nprint(correct.mean(), lo, hi)`);
      host.appendChild(code);
      const foot = h("div", { class: "bs-foot" }); host.appendChild(foot);
      const resample = (arr, r) => { let c = 0; const picks = new Array(arr.length).fill(0); for (let i = 0; i < arr.length; i++) { const j = Math.floor(r() * arr.length); picks[j]++; c += arr[j]; } return { acc: c / arr.length, picks }; };
      let accs = [];
      function drawHist(ci) {
        histG.innerHTML = ""; axisG.innerHTML = ""; ciG.innerHTML = "";
        const lo = 0.70, hi = 0.92, bins = 44, w = 700, hgt = 260, x0 = 40, y0 = 290;
        const counts = new Array(bins).fill(0); accs.forEach((a) => { const b = Math.min(bins - 1, Math.max(0, Math.floor(((a - lo) / (hi - lo)) * bins))); counts[b]++; });
        const mx = Math.max(1, ...counts);
        counts.forEach((cn, i) => { const bh = (cn / mx) * hgt; s("rect", { x: x0 + (i / bins) * w, y: y0 - bh, width: w / bins - 1, height: bh, fill: CHART, stroke: LEAF, "stroke-width": 0.8 }, histG); });
        [0.70, 0.75, 0.80, 0.85, 0.90].forEach((v) => { const x = x0 + ((v - lo) / (hi - lo)) * w; s("line", { x1: x, y1: y0, x2: x, y2: y0 + 6, stroke: INK }, axisG); s("text", { x, y: y0 + 24, "text-anchor": "middle", style: "font-size:15px", text: Deck.pct(v, 0) }, axisG); });
        s("line", { x1: x0, y1: y0, x2: x0 + w, y2: y0, stroke: INK }, axisG);
        const xc = x0 + ((B.claimed - lo) / (hi - lo)) * w; if (B.claimed <= hi) { s("line", { x1: xc, y1: 20, x2: xc, y2: y0, stroke: VERM, "stroke-width": 2, "stroke-dasharray": "6 4" }, axisG); s("text", { x: xc - 6, y: 36, "text-anchor": "end", style: "font-size:14px;fill:" + VERMD, text: "memo: 96%" }, axisG); }
        if (ci) { const srt = accs.slice().sort((a, b) => a - b), l = srt[Math.floor(0.025 * srt.length)], u = srt[Math.ceil(0.975 * srt.length) - 1]; [l, u].forEach((v) => { const x = x0 + ((v - lo) / (hi - lo)) * w; s("line", { x1: x, y1: 20, x2: x, y2: y0, stroke: MAGENTA, "stroke-width": 2.5 }, ciG); s("text", { x, y: 16, "text-anchor": "middle", style: "font-size:15px;font-weight:700;fill:#B0106A", text: Deck.pct(v, 1) }, ciG); }); return [l, u]; }
        return null;
      }
      function widthAt(nn) { const r = rng(B.seed + nn); const arr = Array.from({ length: nn }, (_, i) => i < Math.round(nn * B.correct / n) ? 1 : 0); const a = []; for (let k = 0; k < 1000; k++) a.push(resample(arr, r).acc); a.sort((x, y) => x - y); return [a[Math.floor(0.025 * 1000)], a[Math.ceil(0.975 * 1000) - 1]]; }
      let timer = null;
      return {
        update(k) {
          clearTimeout(timer);
          const r = rng(B.seed);
          dotEls.forEach((d) => { d.classList.remove("pick", "dup", "miss"); });
          left.querySelector(".bs-pick").textContent = "";
          code.classList.toggle("off-up", k < 2);
          if (k === 0) { accs = []; drawHist(false); foot.textContent = ""; return; }
          if (k === 1) { const { acc, picks } = resample(data, r); picks.forEach((p, i) => dotEls[i].classList.add(p === 0 ? "miss" : p > 1 ? "dup" : "pick")); left.querySelector(".bs-pick").textContent = `One resample: ${picks.filter((p) => p === 0).length} transcripts not drawn, ${picks.filter((p) => p > 1).length} drawn more than once · accuracy ${Deck.pct(acc, 1)}`; accs = [acc]; drawHist(false); foot.textContent = ""; return; }
          accs = []; let i = 0;
          const step = () => { const batch = ctx.print || Deck.reduced ? B.resamples : 25; for (let j = 0; j < batch && i < B.resamples; j++, i++) accs.push(resample(data, r).acc); const ci = drawHist(k >= 3 && i >= B.resamples); if (i < B.resamples) timer = setTimeout(step, 30); else { if (k >= 3 && ci) { foot.innerHTML = `<b>${Deck.pct(B.correct / n, 0)} [${Deck.pct(ci[0], 1)}, ${Deck.pct(ci[1], 1)}]</b> on n = ${n}. The memo's 96% is outside the interval, and the interval is ${Math.round((ci[1] - ci[0]) * 100)} points wide.`; } else foot.textContent = `${accs.length} resamples`; if (k >= 4) { const w50 = widthAt(50), w1000 = widthAt(1000); foot.innerHTML += `<br>Width at n = 50: <b>${Deck.pct(w50[1] - w50[0], 0)}</b> · at n = 200: <b>${Deck.pct(ci ? ci[1] - ci[0] : 0, 0)}</b> · at n = 1,000: <b>${Deck.pct(w1000[1] - w1000[0], 0)}</b>. Sufficiency is arithmetic: to certify a number to a point, buy the sample.`; } } };
          step();
        },
        destroy() { clearTimeout(timer); },
      };
    },
  };

  /* ---------- paired comparison ---------- */
  Deck.components.Paired = {
    steps: 3,
    mount(host) {
      const P = cfg().paired, n = P.bothRight + P.bothWrong + P.onlyV4 + P.onlyV3;
      const accV3 = (P.bothRight + P.onlyV3) / n, accV4 = (P.bothRight + P.onlyV4) / n;
      const grid = h("div", { class: "pc-grid" });
      const kinds = [].concat(Array(P.bothRight).fill("rr"), Array(P.onlyV4).fill("v4"), Array(P.onlyV3).fill("v3"), Array(P.bothWrong).fill("ww"));
      const r = rng(11); for (let i = kinds.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [kinds[i], kinds[j]] = [kinds[j], kinds[i]]; }
      kinds.forEach((kd) => grid.appendChild(h("i", { class: kd })));
      const legend = h("div", { class: "pc-legend" }, h("span", { class: "rr" }, `both right ${P.bothRight}`), h("span", { class: "v4" }, `only v4 right ${P.onlyV4}`), h("span", { class: "v3" }, `only v3 right ${P.onlyV3}`), h("span", { class: "ww" }, `both wrong ${P.bothWrong}`));
      host.appendChild(h("div", { class: "panel pc-left" }, h("div", { class: "ptitle" }, `${n} questions · the same questions under prompt v3 and prompt v4`), grid, legend));
      const stat = (P.onlyV4 - P.onlyV3) ** 2 / (P.onlyV4 + P.onlyV3);
      const pval = Math.exp(-stat / 2); // chi-square with 1 df: p = exp(-x/2) is the survival function approximation... use exact: erfc(sqrt(x/2))
      const erfc = (x) => { const t = 1 / (1 + 0.5 * Math.abs(x)); const y = t * Math.exp(-x * x - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277))))))))); return x >= 0 ? y : 2 - y; };
      const p = erfc(Math.sqrt(stat / 2));
      const cards = [
        h("div", { class: "ev-card show-on off-up", style: "left:900px;top:0;width:572px;height:120px;--b:var(--cobalt);font-size:19px" }, h("div", { class: "h", style: { color: "#2A50B0" } }, "Accuracy per system"), `v3: ${Deck.pct(accV3, 0)} · v4: ${Deck.pct(accV4, 0)} · difference ${Deck.pct(accV4 - accV3, 0)} points`),
        h("div", { class: "ev-card show-on off-up", style: "left:900px;top:136px;width:572px;height:120px;--b:var(--magenta);font-size:19px" }, h("div", { class: "h", style: { color: "#B0106A" } }, "Only the discordant pairs carry information"), `${P.bothRight + P.bothWrong} items come out the same under both prompts. The difference rests on ${P.onlyV4 + P.onlyV3} items.`),
        h("div", { class: "ev-card show-on off-up", style: "left:900px;top:272px;width:572px;height:150px;--b:var(--leaf-d);font-size:19px" }, h("div", { class: "h", style: { color: LEAF } }, "McNemar's statistic"), `(${P.onlyV4} − ${P.onlyV3})² / (${P.onlyV4} + ${P.onlyV3}) = ${stat.toFixed(2)}, p ≈ ${p.toFixed(2)}. Not significant at 0.05. The four points are consistent with no real difference.`),
        h("div", { class: "ev-card show-on off-up", style: "left:900px;top:438px;width:572px;height:170px;--b:var(--vermilion);font-size:18px" }, h("div", { class: "h", style: { color: VERMD } }, "The wrong way"), "Run v3 once and v4 once on different draws of questions, with different seeds, and report the unpaired difference. Sampling noise alone (L12, temperature) produces gaps this size. One run, one seed, is an anecdote."),
      ];
      cards.forEach((c) => host.appendChild(c));
      return { update(k) { cards.forEach((c, i) => c.classList.toggle("off-up", k < i)); grid.classList.toggle("dis", k >= 1 && k <= 2); } };
    },
  };

  /* ---------- verbosity scatter ---------- */
  Deck.components.Verbosity = {
    steps: 2,
    mount(host) {
      const V = cfg().verbosity, r = rng(V.seed);
      const gauss = () => { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
      const pts = []; for (let i = 0; i < V.n; i++) { const z = gauss(); const len = Math.round(90 + 35 * z); const score = Math.max(1, Math.min(5, 3.2 + V.targetR * 1.1 * z + Math.sqrt(1 - V.targetR * V.targetR) * 1.1 * gauss())); pts.push({ len: Math.max(15, len), score }); }
      const mx = pts.reduce((a, p) => a + p.len, 0) / pts.length, my = pts.reduce((a, p) => a + p.score, 0) / pts.length;
      let sxy = 0, sxx = 0, syy = 0; pts.forEach((p) => { sxy += (p.len - mx) * (p.score - my); sxx += (p.len - mx) ** 2; syy += (p.score - my) ** 2; });
      const rr = sxy / Math.sqrt(sxx * syy), slope = sxy / sxx, icpt = my - slope * mx;
      const panel = h("div", { class: "panel vb-panel" }, h("div", { class: "ptitle" }, `${V.n} replies rated pass by two human raters · judge score (1 to 5) against length in words`));
      const g = svg(960, 520, panel); host.appendChild(panel);
      const x0 = 60, y0 = 470, w = 860, hgt = 420, xmin = 0, xmax = 200;
      const X = (v) => x0 + ((v - xmin) / (xmax - xmin)) * w, Y = (v) => y0 - ((v - 1) / 4) * hgt;
      s("line", { x1: x0, y1: y0, x2: x0 + w, y2: y0, stroke: INK }, g); s("line", { x1: x0, y1: y0, x2: x0, y2: y0 - hgt, stroke: INK }, g);
      [0, 50, 100, 150, 200].forEach((v) => s("text", { x: X(v), y: y0 + 24, "text-anchor": "middle", style: "font-size:14px", text: String(v) }, g));
      [1, 2, 3, 4, 5].forEach((v) => s("text", { x: x0 - 12, y: Y(v) + 5, "text-anchor": "end", style: "font-size:14px", text: String(v) }, g));
      s("text", { x: x0 + w / 2, y: y0 + 46, "text-anchor": "middle", style: "font-size:15px;fill:#5F6379", text: "reply length (words)" }, g);
      pts.forEach((p) => s("circle", { cx: X(p.len), cy: Y(p.score), r: 6, fill: COBALT, opacity: 0.75, stroke: "#fff", "stroke-width": 1 }, g));
      const line = s("line", { x1: X(20), y1: Y(icpt + slope * 20), x2: X(190), y2: Y(icpt + slope * 190), stroke: VERM, "stroke-width": 3, style: "opacity:0;transition:opacity 500ms" }, g);
      const rt = s("text", { x: x0 + w - 10, y: y0 - hgt + 24, "text-anchor": "end", style: `font-size:22px;font-weight:700;fill:${VERMD};opacity:0;transition:opacity 500ms`, text: "r = " + rr.toFixed(2) }, g);
      const find = h("div", { class: "ev-card show-on off-up", style: "left:1000px;top:0;width:472px;height:300px;--b:var(--vermilion);font-size:19px;padding:14px 18px" }, h("div", { class: "h", style: { color: VERMD } }, "The finding, as a sentence"), h("div", { style: { fontFamily: "var(--font-voice)", fontStyle: "italic", fontSize: "20px", lineHeight: 1.35 } }, `Judge scores correlate with reply length (r = ${rr.toFixed(2)}, n = ${V.n}) among replies two human raters scored equally (Figure 4). The judge's scores are not a measure of correctness alone.`), h("div", { style: { marginTop: "12px", fontSize: "16px", color: MUTED } }, "Testable, reproducible, no motive imputed. Assignment 3 Part B wants this sentence about Judge A."));
      const why = h("div", { class: "ev-card show-on off-up", style: "left:1000px;top:320px;width:472px;height:200px;--b:var(--violet);font-size:18px;padding:14px 18px" }, h("div", { class: "h", style: { color: VIOLET } }, "Why holding quality fixed matters"), "Across all replies, longer answers may really be better. Among replies people rated equally, length should not predict the score. If it does, the instrument is measuring length.");
      host.append(find, why);
      return { update(k) { line.style.opacity = k >= 1 ? 1 : 0; rt.style.opacity = k >= 1 ? 1 : 0; why.classList.toggle("off-up", k < 1); find.classList.toggle("off-up", k < 2); } };
    },
  };

  /* ---------- close (as in L12 and L14) ---------- */
  Deck.components.Close = {
    steps: 0,
    mount(host, ctx) {
      const fm = ctx.fm;
      const chain = (fm.chain || []).map((l) => l.split("|").map((x) => x.trim()));
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
      const cur = +(fm.lecture || 13);
      for (let i = 1; i <= 18; i++) seeds.appendChild(h("i", { class: i < cur ? "done" : i === cur ? "now" : "", title: "L" + i, style: { width: "18px", height: "18px" } }));
      host.appendChild(seeds);
      host.appendChild(h("div", { class: "abs", style: { left: "64px", bottom: "34px", fontSize: "14px", color: MUTED } }, `Course progress: lecture ${cur} of 18`));
      return {};
    },
  };
})();
