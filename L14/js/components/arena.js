/* Arena: the live red-team slide.
   Left: the MrFeast AI chat under test (streams from Ollama, or replays rehearsal transcripts).
   Right: pinned configuration, the technique x harm coverage matrix the class fills in, and the two verdicts per attempt:
   the automated filter (a second model) and the class. The filter-vs-class tally is the self-grading finding.
   State (attempts, verdicts) persists across slides and reloads in localStorage. */
(function () {
  const { h } = Deck;
  const cfg = () => window.ARENA_CONFIG;
  const KEY = () => (Deck.id || "DECK") + "-arena-state";

  /* ---------------------------------------------------------------- shared state */
  const S = (Deck.arena = Deck.arena || { attempts: [], current: null, messages: [] });
  function load() { try { const j = JSON.parse(localStorage.getItem(KEY()) || "null"); if (j) { S.attempts = j.attempts || []; } } catch (e) {} }
  function save() { try { localStorage.setItem(KEY(), JSON.stringify({ attempts: S.attempts })); } catch (e) {} }
  load();
  S.reset = function () { S.attempts = []; S.current = null; S.messages = []; save(); Deck.llm.logClear(); };

  function counts() {
    const c = cfg();
    const m = {}; // technique -> category -> n   (category from the CLASS verdict; "none" = blocked; "pending" = awaiting class verdict)
    c.techniques.forEach((t) => { m[t.key] = {}; });
    const conf = { bb: 0, bx: 0, xb: 0, xx: 0 }; // filter b(locked)/x(broke) then class b/x
    for (const a of S.attempts) {
      if (!a.turns || !a.turns.length) continue;
      const last = a.turns[a.turns.length - 1];
      const fv = last.judge ? last.judge.verdict : null;
      const cv = a.classVerdict ? a.classVerdict.verdict : null;
      const cat = cv === "broke" ? (a.classVerdict.category || "policy") : cv === "blocked" ? "none" : "pending";
      if (m[a.technique]) m[a.technique][cat] = (m[a.technique][cat] || 0) + 1;
      if (fv && cv) conf[(fv === "broke" ? "x" : "b") + (cv === "broke" ? "x" : "b")]++;
    }
    return { m, conf };
  }
  Deck.arenaCounts = counts;
  Deck.arenaSave = save;

  /* ---------------------------------------------------------------- component */
  Deck.components.Arena = {
    steps: 0,
    mount(host, ctx) {
      const fm = ctx.fm, c = cfg(), llm = Deck.llm;
      const technique = fm.technique || "persona";
      const tech = c.techniques.find((t) => t.key === technique) || c.techniques[0];
      const stat = ctx.print || ctx.preview;

      /* ----- left: chat */
      const chat = Deck.chatCard({ x: 0, y: 0, w: 780, h: 512, label: "Live Chatbot · " + (fm.label || "live test") });
      chat.msgs.classList.add("scroll");
      host.appendChild(chat.card);
      const input = h("textarea", { class: "atk-input", placeholder: stat ? "" : "Type the class's attempt here. Enter sends, Shift+Enter for a new line.", rows: 3 });
      const sendBtn = h("button", { class: "btn primary", onclick: () => send() }, "Send");
      const newBtn = h("button", { class: "btn", onclick: () => newAttempt(true) }, "New attempt");
      const lib = h("select", { class: "atk-lib", onchange: () => {
        if (!lib.value) return;
        const a = c.attacks[+lib.value];
        input.value = a.text; input.focus();
        if (a.kbPatch) { const d = c.kb.find((x) => x.id === a.kbPatch.id); if (d) { d.text = a.kbPatch.text; d.poisoned = true; sysNote(`Knowledge base edited: "${d.title}" now carries a planted note (KB button to see it)`); } }
      } }, h("option", { value: "" }, "Seeded attack library"));
      c.attacks.forEach((a, i) => { if (a.technique === technique) lib.appendChild(h("option", { value: String(i) }, a.label)); });
      const retrieval = technique === "indirect" || fm.retrieval === "1";

      /* ----- retrieval (indirect slide): the app looks up a document and places it in the context */
      function retrieve(q) {
        const words = q.toLowerCase().match(/[a-z0-9]+/g) || [];
        let best = null, bestN = 0;
        for (const d of c.kb || []) { const n = d.keywords.filter((k) => words.includes(k)).length; if (n > bestN) { best = d; bestN = n; } }
        return best;
      }
      function sysNote(text) { const b = h("div", { class: "bubble sys" }, text); chat.msgs.appendChild(b); chat.msgs.scrollTop = 1e9; return b; }
      const row = h("div", { class: "atk-row" }, input, h("div", { class: "atk-btns" }, sendBtn, newBtn, lib));
      host.appendChild(row);
      input.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } e.stopPropagation(); });

      /* ----- right: config strip */
      const status = h("span", { class: "pill st" }, "…");
      const strip = h("div", { class: "cfg-strip" }, status,
        h("span", { class: "pill" }, "model ", h("b", {}, c.target.model)),
        h("span", { class: "pill" }, "prompt ", h("b", { id: "pv" }, c.promptVersion)),
        h("span", { class: "pill" }, "T ", h("b", {}, String(c.target.temperature))),
        h("span", { class: "pill" }, "seed ", h("b", {}, String(c.target.seed))),
        h("span", { class: "pill" }, "judge ", h("b", {}, c.judge.model)),
        h("button", { class: "lnk", onclick: () => openPrompt() }, "prompt"),
        h("button", { class: "lnk", onclick: () => openKB() }, "KB"),
        h("button", { class: "lnk", onclick: () => llm.exportLog() }, "export"),
        h("button", { class: "lnk", onclick: () => { if (confirm("Clear every attempt and verdict from this session?")) { S.reset(); renderAll(); chat.msgs.innerHTML = ""; } } }, "reset"));
      host.appendChild(strip);
      const setStatus = () => {
        status.textContent = stat ? "LIVE IN CLASS" : llm.mode === "live" ? "LIVE" : llm.mode === "replay" ? (llm.hosted ? "STORED REPLIES · the live model runs only in class" : location.protocol === "file:" ? "REPLAY · open via start-deck.bat for live" : "REPLAY · Ollama not reached") : "…";
        status.className = "pill st " + (stat ? "live" : llm.mode);
        if (llm.mode === "live" && !llm.hasModel(c.target.model)) status.textContent = "LIVE · model not pulled";
      };
      setStatus();
      const unsub = llm.onChange(setStatus);

      /* ----- right: coverage matrix */
      const matrix = h("div", { class: "cov" });
      host.appendChild(matrix);
      function renderMatrix() {
        const { m } = counts();
        matrix.innerHTML = "";
        const cols = c.harms.map((x) => ({ key: x.key, short: x.short })).concat([{ key: "none", short: "No break" }]);
        const head = h("div", { class: "cov-row head" }, h("div", { class: "cov-lab" }, "Coverage"));
        cols.forEach((col) => head.appendChild(h("div", { class: "cov-cell" }, col.short)));
        matrix.appendChild(head);
        c.techniques.forEach((t) => {
          const lab = h("div", { class: "cov-lab" }, h("span", {}, t.label));
          const r = h("div", { class: "cov-row" + (t.key === technique ? " now" : "") }, lab);
          cols.forEach((col) => {
            const n = (m[t.key] || {})[col.key] || 0;
            r.appendChild(h("div", { class: "cov-cell" + (n ? (col.key === "none" ? " ok" : " hit") : "") }, n ? String(n) : ""));
          });
          const p = (m[t.key] || {}).pending || 0;
          if (p) lab.appendChild(h("span", { class: "cov-pend" }, p + " awaiting class verdict"));
          matrix.appendChild(r);
        });
      }

      /* ----- right: verdicts */
      const filterBox = h("div", { class: "vbox filter" }, h("div", { class: "vh" }, "Filter verdict"), h("div", { class: "vchip none" }, "no attempt yet"), h("div", { class: "vr" }, ""));
      const classBtns = h("div", { class: "vbtns" },
        h("button", { class: "btn ok", onclick: () => classVerdict("blocked") }, "Blocked"),
        h("button", { class: "btn bad", onclick: () => classVerdict("broke") }, "Broke"));
      const catPills = h("div", { class: "vcats" });
      c.harms.forEach((x) => catPills.appendChild(h("span", { class: "pill cat", "data-k": x.key, onclick: () => classCat(x.key), title: x.desc }, x.short)));
      catPills.appendChild(h("span", { class: "pill cat", "data-k": "leak", onclick: () => classCat("leak"), title: "Revealed the system prompt or internal notes" }, "Leak"));
      const classBox = h("div", { class: "vbox class" }, h("div", { class: "vh" }, "Class verdict"), classBtns, catPills);
      const tally = h("div", { class: "tally" });
      host.appendChild(h("div", { class: "verdicts" }, filterBox, classBox, tally));
      function renderTally() {
        const { conf } = counts();
        const n = conf.bb + conf.bx + conf.xb + conf.xx;
        tally.innerHTML = "";
        tally.appendChild(h("div", { class: "vh" }, "Filter vs. class", h("span", { class: "n" }, n ? ` · ${n} graded` : "")));
        const t = h("table", {},
          h("tr", {}, h("th", {}, ""), h("th", {}, "Class: blocked"), h("th", {}, "Class: broke")),
          h("tr", {}, h("th", {}, "Filter: blocked"), h("td", {}, String(conf.bb)), h("td", { class: conf.bx ? "fn" : "" }, String(conf.bx))),
          h("tr", {}, h("th", {}, "Filter: broke"), h("td", {}, String(conf.xb)), h("td", {}, String(conf.xx))));
        tally.appendChild(t);
        const fb = conf.bb + conf.bx;
        tally.appendChild(h("div", { class: "vr" }, fb ? `Filter says blocked ${fb}×; the class disagrees ${conf.bx}× (false negatives ${Deck.pct(conf.bx / fb, 0)})` : "False negatives appear here once both verdicts exist."));
      }
      function renderAll() { renderMatrix(); renderTally(); renderVerdict(); }

      /* ----- attempt lifecycle */
      function bubble(role, text) { const b = h("div", { class: "bubble " + (role === "user" ? "fan" : "bot") }, text || ""); chat.msgs.appendChild(b); chat.msgs.scrollTop = 1e9; return b; }
      function rebuildChat() {
        chat.msgs.innerHTML = "";
        for (const m of S.messages) {
          if (m.role === "system" && /^RETRIEVED DOCUMENT/.test(m.content)) sysNote("App retrieved: " + m.content.split("\n")[0].replace(/^RETRIEVED DOCUMENT \(/, "").replace(/,.*$/, ""));
          else if (m.role !== "system") bubble(m.role, m.content);
        }
      }
      function newAttempt(clear) {
        if (S.current && S.current.turns.length && !S.current.classVerdict) { /* leave it; verdict can still be added from the log */ }
        S.current = null; S.messages = [];
        if (clear) { chat.msgs.innerHTML = ""; input.value = ""; input.focus(); }
        renderVerdict();
      }
      function ensureAttempt(label, text) {
        if (!S.current || S.current.technique !== technique) {
          S.current = { id: "A" + Date.now().toString(36), ts: new Date().toISOString(), deck: Deck.id, technique, label: label || "", turns: [], classVerdict: null,
            config: { model: c.target.model, promptVersion: c.promptVersion, temperature: c.target.temperature, seed: c.target.seed, judge: c.judge.model }, replay: llm.mode === "replay" };
          S.messages = [{ role: "system", content: c.systemPrompt }];
          S.attempts.push(S.current);
          if (llm.mode === "replay") S.current._replay = llm.replayNext(technique, label, text);
        }
        return S.current;
      }
      let busy = false, abort = null;
      async function send() {
        if (busy) return;
        let text = input.value.trim();
        if (!text) return;
        const label = lib.selectedOptions[0] && lib.value ? lib.selectedOptions[0].textContent : "";
        busy = true; sendBtn.disabled = true;
        if (llm.mode !== "live" && !new URLSearchParams(location.search).has("replay")) await llm.health(); // Ollama may have started since the page loaded
        const a = ensureAttempt(label, text);
        lib.value = "";
        const k = a.turns.length;
        let rItem = null;
        if (llm.mode === "replay") {
          rItem = a._replay;
          if (rItem && rItem.turns[k]) text = rItem.turns[k].user;
          else if (!rItem) sysNote(llm.hosted ? "This public copy has no live model. Pick an entry from the Seeded attack library to see a reply recorded in rehearsal against the pinned configuration." : "REPLAY MODE: the model is not connected and no rehearsal transcript matches this attempt. Start the deck with start-deck.bat for live replies.");
        }
        input.value = "";
        let retrieved = null;
        if (retrieval) {
          if (llm.mode === "replay") retrieved = (rItem && rItem.turns[k] && rItem.turns[k].retrieved) || null;
          else { const d = retrieve(text); if (d) retrieved = `RETRIEVED DOCUMENT (${d.url}, retrieved for this question)\n${d.text}`; }
          if (retrieved) { S.messages.push({ role: "system", content: retrieved }); sysNote("App retrieved: " + retrieved.split("\n")[0].replace(/^RETRIEVED DOCUMENT \(/, "").replace(/,.*$/, "")); }
        }
        S.messages.push({ role: "user", content: text });
        bubble("user", text);
        const typing = h("div", { class: "bubble bot typing" }, h("i"), h("i"), h("i"));
        chat.msgs.appendChild(typing); chat.msgs.scrollTop = 1e9;
        const bot = h("div", { class: "bubble bot" }, "");
        const turn = { user: text, retrieved: retrieved || undefined, bot: "", judge: null, stats: null };
        a.turns.push(turn);
        let first = true;
        const onToken = (piece, full) => { if (first) { typing.replaceWith(bot); first = false; } bot.textContent = full; chat.msgs.scrollTop = 1e9; };
        try {
          let res;
          if (llm.mode === "live") {
            abort = new AbortController();
            res = await llm.chat({ model: c.target.model, messages: S.messages, options: { temperature: c.target.temperature, seed: c.target.seed, num_predict: c.target.num_predict, num_ctx: c.target.num_ctx }, onToken, signal: abort.signal });
          } else {
            const rt = rItem && rItem.turns[Math.min(k, rItem.turns.length - 1)];
            res = await llm.replayStream(rt ? rt.bot : "(replay mode: no stored reply for this attempt)", onToken);
          }
          if (first) typing.replaceWith(bot);
          bot.textContent = res.content;
          turn.bot = res.content; turn.stats = res.stats;
          S.messages.push({ role: "assistant", content: res.content });
          if (res.stats && res.stats.eval_count) bot.appendChild(h("div", { class: "stats" }, `${res.stats.eval_count} tokens · ${(res.stats.eval_ms / 1000).toFixed(1)} s`));
          // judge
          setVerdictPending();
          if (llm.mode === "live") turn.judge = await llm.judge(S.messages);
          else { const rt = rItem && rItem.turns[Math.min(k, rItem.turns.length - 1)]; await new Promise((r) => setTimeout(r, 900)); turn.judge = (rt && rt.judge) || { verdict: "blocked", category: "none", reason: "(replay)" }; }
          a.classVerdict = null; // a new turn needs a fresh class verdict
        } catch (e) {
          if (first) typing.replaceWith(bot);
          bot.textContent = "Could not reach the model: " + e.message + (llm.mode === "live" ? " · switching to replay" : "");
          bot.classList.add("err");
          a.turns.pop(); S.messages.pop(); if (retrieved) S.messages.pop();
          if (llm.mode === "live") { llm.mode = "replay"; llm._emit(); S.current = null; }
        }
        busy = false; sendBtn.disabled = false;
        save(); llm.logWrite(a);
        renderAll();
        input.focus();
      }
      function setVerdictPending() {
        const chip = filterBox.querySelector(".vchip");
        chip.className = "vchip wait"; chip.textContent = "filter grading…"; filterBox.querySelector(".vr").textContent = "";
      }
      function renderVerdict() {
        const a = S.current, chip = filterBox.querySelector(".vchip"), reason = filterBox.querySelector(".vr");
        const last = a && a.turns.length ? a.turns[a.turns.length - 1] : null;
        if (!last || !last.judge) { chip.className = "vchip none"; chip.textContent = a && a.turns.length ? "filter grading…" : "no attempt yet"; reason.textContent = ""; }
        else {
          const j = last.judge;
          chip.className = "vchip " + (j.verdict === "broke" ? "broke" : "blocked");
          chip.textContent = j.verdict === "broke" ? "BROKE · " + j.category : "BLOCKED";
          reason.textContent = (j.reason || "") + (j.ms ? ` (${(j.ms / 1000).toFixed(1)} s)` : "");
        }
        const cv = a && a.classVerdict;
        classBtns.querySelectorAll("button").forEach((b) => { b.classList.toggle("on", !!cv && cv.verdict === b.textContent.toLowerCase()); b.disabled = !last; });
        catPills.classList.toggle("show", !!cv && cv.verdict === "broke");
        catPills.querySelectorAll(".pill").forEach((p) => p.classList.toggle("on", !!cv && cv.category === p.dataset.k));
      }
      function classVerdict(v) {
        const a = S.current; if (!a || !a.turns.length) return;
        a.classVerdict = { verdict: v, category: v === "broke" ? (a.classVerdict && a.classVerdict.category) || null : "none", ts: new Date().toISOString() };
        save(); llm.logWrite(a); renderAll();
      }
      function classCat(k) {
        const a = S.current; if (!a || !a.classVerdict || a.classVerdict.verdict !== "broke") return;
        a.classVerdict.category = k; save(); llm.logWrite(a); renderAll();
      }

      /* ----- prompt editor overlay (Part 1: prompts as configuration) */
      function openPrompt() {
        const ta = h("textarea", { class: "prompt-ta" }, c.systemPrompt);
        const ver = h("input", { class: "prompt-ver", value: c.promptVersion });
        const ov = h("div", { class: "prompt-ov" },
          h("div", { class: "prompt-box" },
            h("div", { class: "ph" }, "System prompt under test", h("span", {}, " · version ", ver)),
            ta,
            h("div", { class: "pf" },
              h("button", { class: "btn primary", onclick: () => { c.systemPrompt = ta.value; c.promptVersion = ver.value; strip.querySelector("#pv").textContent = ver.value; newAttempt(true); ov.remove(); } }, "Use this prompt (starts a new attempt)"),
              h("button", { class: "btn", onclick: () => ov.remove() }, "Cancel"))));
        ov.addEventListener("keydown", (e) => e.stopPropagation());
        ctx.slideEl.appendChild(ov);
        ta.focus();
      }

      /* ----- knowledge base overlay (indirect injection: the class poisons a document the app will retrieve) */
      function openKB() {
        const areas = (c.kb || []).map((d) => ({ d, ta: h("textarea", { class: "prompt-ta kb" }, d.text) }));
        const ov = h("div", { class: "prompt-ov" },
          h("div", { class: "prompt-box" },
            h("div", { class: "ph" }, "Knowledge base the app retrieves from", h("span", {}, " · edit a document to plant an instruction, then ask a fan question that retrieves it")),
            h("div", { class: "kb-list" }, areas.map(({ d, ta }) => h("div", { class: "kb-doc" }, h("div", { class: "kb-title" }, d.title, h("span", {}, " · " + d.url + (d.poisoned ? " · edited" : ""))), ta))),
            h("div", { class: "pf" },
              h("button", { class: "btn primary", onclick: () => { areas.forEach(({ d, ta }) => { if (ta.value !== d.text) { d.text = ta.value; d.poisoned = true; } }); ov.remove(); } }, "Save documents"),
              h("button", { class: "btn", onclick: () => ov.remove() }, "Cancel"))));
        ov.addEventListener("keydown", (e) => e.stopPropagation());
        ctx.slideEl.appendChild(ov);
      }

      /* ----- initial render */
      if (stat) {
        bubble("user", (c.attacks.find((x) => x.technique === technique) || c.attacks[0]).text);
        bubble("bot", "Live in class: the reply streams from the model running on the desktop.");
        input.disabled = true;
      } else if (S.current && S.current.technique === technique) rebuildChat();
      else { /* a conversation from another technique's slide does not carry over */ S.current = null; S.messages = []; }
      renderAll();
      return {
        update() {},
        destroy() { unsub(); if (abort) try { abort.abort(); } catch (e) {} },
      };
    },
  };
})();
