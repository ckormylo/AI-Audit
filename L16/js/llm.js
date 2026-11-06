/* Ollama bridge for the deck.
   - Live mode: talks to Ollama (through the start-deck proxy at /ollama when served over http,
     or directly at http://localhost:11434 when index.html is opened by double-click).
   - Replay mode (?replay=1, or automatic when Ollama cannot be reached): plays back rehearsal
     transcripts from data/replay.js with the same streaming animation.
   - Every live attempt is logged to localStorage and, when served, appended to data/attempt_log.jsonl. */
(function () {
  "use strict";
  const Deck = (window.Deck = window.Deck || {});
  const params = new URLSearchParams(location.search);
  const cfg = () => window.ARENA_CONFIG || {};

  // hosted: served from somewhere other than this machine (GitHub Pages). No Ollama there, so replay from the start,
  // unless ?ollama=URL points at a reachable server (a tunnel to the classroom desktop, for example).
  const hosted = location.protocol.startsWith("http") && !/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) && !params.get("ollama");
  const llm = (Deck.llm = {
    base: params.get("ollama") || (location.protocol.startsWith("http") ? "/ollama" : "http://localhost:11434"),
    hosted,
    mode: params.has("replay") || hosted ? "replay" : "unknown", // "live" | "replay" | "unknown"
    models: [],
    listeners: new Set(),
    onChange(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); },
    _emit() { for (const fn of this.listeners) try { fn(this); } catch (e) {} },
  });

  /* ---------------------------------------------------------------- health */
  llm.health = async function () {
    if (params.has("replay") || hosted) { llm.mode = "replay"; llm._emit(); return { ok: false, replay: true }; }
    try {
      const r = await fetch(llm.base + "/api/tags", { cache: "no-store" });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const j = await r.json();
      llm.models = (j.models || []).map((m) => m.name);
      llm.mode = "live";
      llm._emit();
      return { ok: true, models: llm.models };
    } catch (e) {
      llm.mode = "replay";
      llm.error = e.message;
      llm._emit();
      return { ok: false, error: e.message };
    }
  };

  llm.hasModel = (tag) => llm.models.some((m) => m === tag || m.split(":")[0] === String(tag).split(":")[0]);

  /* ---------------------------------------------------------------- streaming chat */
  const stripThink = (s) => s.replace(/<think>[\s\S]*?<\/think>\s*/g, "");
  llm.chat = async function ({ model, messages, options, format, onToken, signal }) {
    const body = { model, messages, stream: true, options: options || {}, keep_alive: cfg().keep_alive || "60m" };
    if (format) body.format = format;
    const r = await fetch(llm.base + "/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal });
    if (!r.ok) {
      let msg = "HTTP " + r.status;
      try { msg = (await r.json()).error || msg; } catch (e) {}
      throw new Error(msg);
    }
    const reader = r.body.getReader(), dec = new TextDecoder();
    let buf = "", content = "", stats = {};
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let nl;
      while ((nl = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, nl).trim(); buf = buf.slice(nl + 1);
        if (!line) continue;
        let j; try { j = JSON.parse(line); } catch (e) { continue; }
        if (j.error) throw new Error(j.error);
        const piece = (j.message && j.message.content) || "";
        if (piece) { content += piece; if (onToken) onToken(piece, stripThink(content)); }
        if (j.done) stats = { eval_count: j.eval_count, eval_ms: Math.round((j.eval_duration || 0) / 1e6), prompt_tokens: j.prompt_eval_count, total_ms: Math.round((j.total_duration || 0) / 1e6), model: j.model };
      }
    }
    return { content: stripThink(content).trim(), stats };
  };

  /* ---------------------------------------------------------------- the judge (safety filter played by a second model) */
  /* The filter is a classifier: it names a category, and the verdict follows from it ("none" = blocked, anything else = broke).
     Rehearsal Oct 13 2026: asking small models for a separate verdict field produced verdicts that contradicted their own category
     (the verdict was generated before the reasoning), so the schema asks for reason first, then category, and nothing else. */
  llm.judgeSchema = function () {
    const cats = ["none"].concat((cfg().harms || []).map((h) => h.key), ["leak"]);
    return {
      type: "object",
      properties: {
        reason: { type: "string" },
        category: { type: "string", enum: cats },
      },
      required: ["reason", "category"],
    };
  };
  llm.judge = async function (messages) {
    const c = cfg();
    const transcript = messages.filter((m) => m.role !== "system" || /^RETRIEVED DOCUMENT/.test(m.content)).map((m) => (m.role === "user" ? "USER: " : m.role === "assistant" ? "ASSISTANT: " : "") + m.content).join("\n\n");
    const msgs = [
      { role: "system", content: c.judgePrompt },
      { role: "user", content: "Conversation:\n\n" + transcript + "\n\nGrade the latest ASSISTANT reply." },
    ];
    const j = c.judge || {};
    const t0 = performance.now();
    const res = await llm.chat({ model: j.model, messages: msgs, format: llm.judgeSchema(), options: { temperature: j.temperature || 0, seed: j.seed, num_predict: j.num_predict || 150, num_ctx: j.num_ctx || 4096 } });
    let out;
    try { out = JSON.parse(res.content); } catch (e) {
      const m = res.content.match(/\{[\s\S]*\}/); try { out = JSON.parse(m[0]); } catch (e2) { out = { category: "none", reason: "Judge returned no JSON: " + res.content.slice(0, 120) }; }
    }
    out.category = out.category || "none";
    out.verdict = out.category === "none" ? "blocked" : "broke";
    out.ms = Math.round(performance.now() - t0);
    out.model = j.model;
    return out;
  };

  /* ---------------------------------------------------------------- replay */
  const replayUsed = new Set();
  llm.replayItems = () => (window.REPLAY && window.REPLAY.items) || [];
  const norm = (s) => String(s || "").replace(/\s*\(.*\)\s*$/, "").trim().toLowerCase(); // "Gerald 2 of 3: order number (broke)" ~ "Gerald 2 of 3: order number"
  /* Only an exact library pick plays a stored transcript. Free-typed attempts never get a substitute transcript. */
  llm.replayNext = function (technique, label, text) {
    const items = llm.replayItems();
    const same = (s) => String(s || "").replace(/\s+/g, " ").trim().toLowerCase();
    // match a library entry by its label, or a typed message by its exact first-turn text (no substitution for anything else)
    const byText = (x) => x.technique === technique && text && x.turns && x.turns[0] && same(x.turns[0].user) === same(text);
    const byLabel = (x) => x.technique === technique && label && norm(x.label) === norm(label);
    if (!label && !text) return null;
    // prefer a transcript that starts with exactly this message; then one filed under this library label; unused ones first
    let it = items.find((x) => !replayUsed.has(x) && byText(x)) || items.find((x) => !replayUsed.has(x) && byLabel(x)) || items.find(byText) || items.find(byLabel);
    if (it) replayUsed.add(it);
    return it || null;
  };
  /* animate a stored reply as if it were streaming */
  llm.replayStream = function (text, onToken, signal) {
    return new Promise((resolve) => {
      const parts = text.match(/\S+\s*|\s+/g) || [text];
      let i = 0, out = "";
      const tick = () => {
        if (signal && signal.aborted) return resolve({ content: out, stats: { replay: true } });
        if (i >= parts.length) return resolve({ content: out, stats: { replay: true } });
        out += parts[i++];
        if (onToken) onToken(parts[i - 1], out);
        setTimeout(tick, Deck.reduced ? 0 : 28 + Math.random() * 30);
      };
      setTimeout(tick, 350);
    });
  };

  /* ---------------------------------------------------------------- attempt log */
  const KEY = (Deck.id || "DECK") + "-attempts";
  llm.logRead = function () { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return []; } };
  llm.logWrite = function (record) {
    let arr = llm.logRead();
    const k = arr.findIndex((r) => r.id === record.id);
    if (k >= 0) arr[k] = record; else arr.push(record);
    if (arr.length > 500) arr = arr.slice(-500);
    try { localStorage.setItem(KEY, JSON.stringify(arr)); } catch (e) {}
    if (location.protocol.startsWith("http") && !hosted) fetch("/__log", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(record) }).catch(() => {});
  };
  llm.logClear = function () { try { localStorage.removeItem(KEY); } catch (e) {} };
  llm.exportLog = function () {
    const blob = new Blob([JSON.stringify(llm.logRead(), null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = (Deck.id || "deck") + "-attempts-" + new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-") + ".json";
    document.body.appendChild(a); a.click(); a.remove();
  };
  /* turn the log into data/replay.js content (paste into that file after a rehearsal, or use scripts/make_replay.mjs) */
  llm.logToReplay = function () {
    const items = llm.logRead().filter((r) => r.turns && r.turns.length && !r.replay).map((r) => ({
      technique: r.technique, label: r.label || "", turns: r.turns.map((t) => ({ user: t.user, retrieved: t.retrieved, bot: t.bot, judge: t.judge })),
    }));
    return "// Rehearsal transcripts for replay mode (generated from the attempt log). Do not edit by hand.\nwindow.REPLAY = " + JSON.stringify({ items }, null, 1) + ";\n";
  };

  document.addEventListener("DOMContentLoaded", () => { llm.health(); });
})();
