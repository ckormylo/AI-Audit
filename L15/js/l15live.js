/* L15 live layer on top of js/llm.js (the L14 Ollama bridge): generation with keyword retrieval, a PASS/FAIL judge,
   and the stored runs the deck measures. State lives in localStorage ("L15-state") and, when served by start-deck,
   every record is also appended to data/attempt_log.jsonl so a run survives a browser reset. */
(function () {
  "use strict";
  const Deck = (window.Deck = window.Deck || {});
  const llm = Deck.llm;
  const L = window.L15;
  const C = () => window.L15_CONFIG;
  const KEY = "L15-state";
  const S = (Deck.l15State = { transcripts: [], grid: [], nameSwap: [], votes: {}, runs: {} });
  try { Object.assign(S, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
  const listeners = new Set();
  const emit = () => { for (const fn of listeners) try { fn(S); } catch (e) {} };

  const live = (Deck.l15 = {
    state: S,
    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    save,
    stamp() { return new Date().toISOString().slice(0, 16).replace("T", " "); },
    config() { const c = C(); return { model: c.target.model, promptVersion: c.promptVersion, temperature: c.target.temperature, seed: c.target.seed, kbVersion: c.kbVersion, judge: c.judge.model }; },
    isLive() { return llm.mode === "live"; },
  });

  /* ---------------------------------------------------------------- restore a run from the server log (after a browser reset) */
  live.restore = async function () {
    if (!location.protocol.startsWith("http") || llm.hosted) return;
    if (S.transcripts.length || S.grid.length || S.nameSwap.length) return;
    try {
      const r = await fetch("data/attempt_log.jsonl", { cache: "no-store" });
      if (!r.ok) return;
      const lines = (await r.text()).split("\n").filter(Boolean);
      const runs = {};
      for (const ln of lines) { let j; try { j = JSON.parse(ln); } catch (e) { continue; } if (!j.kind || !j.run) continue; (runs[j.kind + ":" + j.run] = runs[j.kind + ":" + j.run] || []).push(j); }
      const latest = (kind) => { const keys = Object.keys(runs).filter((k) => k.startsWith(kind + ":")).sort(); return keys.length ? runs[keys[keys.length - 1]] : []; };
      const t = latest("transcript"); if (t.length >= 12) { S.transcripts = t; S.runs.transcripts = t[0].run; }
      const g = latest("grid"); if (g.length) { S.grid = g; S.runs.grid = g[0].run; }
      const n = latest("nameswap"); if (n.length) { S.nameSwap = n; S.runs.nameSwap = n[0].run; }
      save(); emit();
    } catch (e) {}
  };

  /* ---------------------------------------------------------------- data sources: real run first, written fallback second */
  const R = () => window.L15_REPLAY || { transcripts: [], sampleGrid: [], nameSwap: [] };
  live.transcripts = () => (S.transcripts.length >= 12 ? { rows: S.transcripts, illustrative: false, label: "real run · " + (S.runs.transcripts || "") } : { rows: R().transcripts, illustrative: true, label: R().label || "written fallback" });
  live.grid = () => (S.grid.length ? { rows: S.grid, illustrative: false, label: "real run · " + (S.runs.grid || "") } : { rows: R().sampleGrid, illustrative: true, label: "written fallback" });
  live.nameSwap = () => (S.nameSwap.length ? { rows: S.nameSwap, illustrative: false, label: "real run · " + (S.runs.nameSwap || "") } : { rows: R().nameSwap, illustrative: true, label: "written fallback" });

  /* ---------------------------------------------------------------- the judge: PASS / FAIL against the reference */
  live.judgeSchema = () => ({ type: "object", properties: { reason: { type: "string" }, verdict: { type: "string", enum: ["PASS", "FAIL"] } }, required: ["reason", "verdict"] });
  live.judge = async function (q, reply, extra) {
    const c = C(), j = c.judge;
    const user = [
      "QUESTION: " + (extra && extra.text ? extra.text : q.text),
      q.kind === "decline" ? "DECLINE: the knowledge base does not answer this. A correct reply says it does not know and points to support." : "REFERENCE ANSWER: " + q.reference + "\nKEY FACT: " + q.key_fact,
      extra && extra.judgeNote ? "NOTE: " + extra.judgeNote : "",
      "REPLY: " + reply,
      "Grade the reply.",
    ].filter(Boolean).join("\n\n");
    const res = await llm.chat({ model: j.model, messages: [{ role: "system", content: c.judgePrompt }, { role: "user", content: user }], format: live.judgeSchema(), options: { temperature: j.temperature || 0, seed: j.seed, num_predict: j.num_predict || 120, num_ctx: j.num_ctx || 4096 } });
    let out; try { out = JSON.parse(res.content); } catch (e) { const m = res.content.match(/\{[\s\S]*\}/); try { out = JSON.parse(m[0]); } catch (e2) { out = { verdict: "FAIL", reason: "Judge returned no JSON: " + res.content.slice(0, 100) }; } }
    out.verdict = out.verdict === "PASS" ? "PASS" : "FAIL";
    out.model = j.model;
    return out;
  };

  /* ---------------------------------------------------------------- one reply from the target with retrieval */
  live.ask = async function (text, opts) {
    const c = C(), t = c.target;
    opts = opts || {};
    const doc = opts.retrieve === undefined ? L.retrieve(text) : (opts.retrieve ? L.docById(opts.retrieve) : null);
    const messages = [{ role: "system", content: c.systemPrompt }];
    if (doc) messages.push({ role: "system", content: "RETRIEVED DOCUMENT\n" + L.docText(doc) });
    messages.push({ role: "user", content: text });
    const res = await llm.chat({ model: t.model, messages, options: { temperature: t.temperature, seed: (t.seed || 0) + (opts.seedOffset || 0), num_predict: t.num_predict, num_ctx: t.num_ctx }, onToken: opts.onToken, signal: opts.signal });
    return { reply: res.content, retrieved_doc: doc ? doc.id : null, stats: res.stats };
  };

  const log = (rec) => { if (location.protocol.startsWith("http") && !llm.hosted) fetch("/__log", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(rec) }).catch(() => {}); };

  /* ---------------------------------------------------------------- the transcript set: every question x samplesPerQuestion */
  live.generate = async function (onProgress, signal) {
    const c = C(), run = live.stamp(), rows = [];
    const total = c.questions.length * c.samplesPerQuestion;
    let n = 0;
    for (const q of c.questions) {
      for (let s = 1; s <= c.samplesPerQuestion; s++) {
        if (signal && signal.aborted) throw new Error("stopped");
        n++;
        const id = "T" + String(n).padStart(3, "0");
        if (onProgress) onProgress({ n, total, id, question: q.text, phase: "ask" });
        const a = await live.ask(q.text, { seedOffset: s - 1, signal });
        if (onProgress) onProgress({ n, total, id, question: q.text, phase: "judge", reply: a.reply });
        const j = await live.judge(q, a.reply);
        const rec = { kind: "transcript", run, id, question_id: q.question_id || q.id, sample: s, retrieved_doc: a.retrieved_doc, source_doc: q.source_doc, reply: a.reply, judge: { verdict: j.verdict, reason: j.reason }, config: live.config(), stats: a.stats, ts: Date.now() };
        rows.push(rec); log(rec);
        S.transcripts = rows.slice(); S.runs.transcripts = run; save(); emit();
      }
    }
    return rows;
  };

  /* ---------------------------------------------------------------- slide 6: one question, n samples */
  live.runGrid = async function (onEach, signal) {
    const c = C(), g = c.sampleGrid, run = live.stamp(), q = c.questions.find((x) => x.id === g.questionId);
    const qq = Object.assign({}, q, { text: g.text, key_fact: g.key_fact || q.key_fact, check: g.check || q.check });
    const rows = [];
    for (let s = 1; s <= g.samples; s++) {
      if (signal && signal.aborted) break;
      const cell = { kind: "grid", run, sample: s, reply: "", judge: null };
      rows.push(cell); if (onEach) onEach(cell, s - 1, "start");
      const a = await live.ask(g.text, { retrieve: q.source_doc, seedOffset: s - 1, signal, onToken: (p, all) => { cell.reply = all; if (onEach) onEach(cell, s - 1, "token"); } });
      cell.reply = a.reply; cell.retrieved_doc = a.retrieved_doc;
      if (onEach) onEach(cell, s - 1, "judge");
      const j = await live.judge(qq, a.reply, { text: g.text, judgeNote: g.judgeNote });
      cell.judge = { verdict: j.verdict, reason: j.reason }; cell.config = live.config(); cell.ts = Date.now();
      log(cell); if (onEach) onEach(cell, s - 1, "done");
      S.grid = rows.slice(); S.runs.grid = run; save(); emit();
    }
    return rows;
  };

  /* ---------------------------------------------------------------- slide 21: name swap */
  live.runNameSwap = async function (onEach, signal) {
    const c = C(), ns = c.nameSwap, run = live.stamp(), rows = [];
    const names = ns.groupA.names.map((n) => ["A", n]).concat(ns.groupB.names.map((n) => ["B", n]));
    for (let s = 1; s <= ns.samples; s++) {
      for (const [group, name] of names) {
        if (signal && signal.aborted) return rows;
        const text = ns.question.replace("{name}", name);
        const cell = { kind: "nameswap", run, group, name, sample: s, reply: "" };
        rows.push(cell); if (onEach) onEach(cell, "start");
        const a = await live.ask(text, { retrieve: ns.retrieve, seedOffset: s - 1, signal, onToken: (p, all) => { cell.reply = all; if (onEach) onEach(cell, "token"); } });
        cell.reply = a.reply; cell.config = live.config(); cell.ts = Date.now();
        log(cell); if (onEach) onEach(cell, "done");
        S.nameSwap = rows.slice(); S.runs.nameSwap = run; save(); emit();
      }
    }
    return rows;
  };

  /* ---------------------------------------------------------------- votes on flagged replies (key-fact slide) */
  live.vote = (id, wrong) => { S.votes[id] = wrong; save(); emit(); };
  live.clearVotes = () => { S.votes = {}; save(); emit(); };
  live.reset = () => { if (!confirm("Clear the stored runs and votes on this machine?")) return; S.transcripts = []; S.grid = []; S.nameSwap = []; S.votes = {}; S.runs = {}; save(); emit(); location.reload(); };
  live.export = () => {
    const blob = new Blob([JSON.stringify(S, null, 1)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "L15-runs-" + live.stamp().replace(/[: ]/g, "-") + ".json"; document.body.appendChild(a); a.click(); a.remove();
  };

  document.addEventListener("DOMContentLoaded", () => { live.restore(); });
})();
