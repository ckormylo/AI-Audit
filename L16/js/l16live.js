/* L16 live layer on top of js/llm.js: the memorization completions, and the votes on the scanner slide.
   State lives in localStorage ("L16-state"); memorization runs are also appended to data/attempt_log.jsonl under start-deck. */
(function () {
  "use strict";
  const Deck = (window.Deck = window.Deck || {});
  const llm = Deck.llm;
  const C = () => window.L16_CONFIG;
  const KEY = "L16-state";
  const S = (Deck.l16State = { memorize: {}, votes: {} });
  try { Object.assign(S, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
  const listeners = new Set();
  const emit = () => { for (const fn of listeners) try { fn(S); } catch (e) {} };
  const log = (rec) => { if (location.protocol.startsWith("http") && !llm.hosted) fetch("/__log", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(rec) }).catch(() => {}); };

  const live = (Deck.l16 = {
    state: S, save,
    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    stamp() { return new Date().toISOString().slice(0, 16).replace("T", " "); },
    isLive() { return llm.mode === "live"; },
    vote(id, yes) { S.votes[id] = yes; save(); emit(); },
    reset() { if (!confirm("Clear the stored memorization runs and votes on this machine?")) return; S.memorize = {}; S.votes = {}; save(); location.reload(); },
  });

  /* one memorization completion: temperature 0 so the demonstration is repeatable */
  live.memorize = async function (item, onToken, signal) {
    const c = C(), t = c.target;
    const res = await llm.chat({ model: t.model, messages: [{ role: "system", content: c.memorizeSystem }, { role: "user", content: item.prompt }], options: { temperature: 0, seed: t.seed, num_predict: 80, num_ctx: 2048 }, onToken, signal });
    const rec = { kind: "memorize", id: item.id, run: live.stamp(), reply: res.content, config: { model: t.model, temperature: 0, seed: t.seed }, ts: Date.now() };
    S.memorize[item.id] = rec; save(); log(rec); emit();
    return rec;
  };
  live.memorized = (id) => {
    if (S.memorize[id]) return { reply: S.memorize[id].reply, real: true, label: "real run · " + S.memorize[id].run };
    const R = window.L16_REPLAY;
    if (R && R.memorize && R.memorize[id]) return { reply: R.memorize[id].reply, real: !R.written, label: R.written ? "written fallback" : "rehearsal run" + (R.memorize[id].run ? " · " + R.memorize[id].run : "") };
    return null;
  };

  /* word-level comparison of a reply with the reference: how many leading words match, and the share of reference words present in order */
  live.compare = function (reply, reference) {
    const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ").split(/\s+/).filter(Boolean);
    const a = norm(reply), b = norm(reference);
    let prefix = 0; while (prefix < a.length && prefix < b.length && a[prefix] === b[prefix]) prefix++;
    // longest common subsequence length (small inputs)
    const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    return { prefix, lcs: dp[a.length][b.length], refWords: b.length, replyWords: a.length, share: b.length ? dp[a.length][b.length] / b.length : 0 };
  };
})();
