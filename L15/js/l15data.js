// L15 data layer: retrieval, checks, classification and statistics. No DOM, no engine dependency.
// Loaded by the deck (window.L15) and testable in node (module.exports).
(function (root) {
  const C = () => root.L15_CONFIG;

  // ---------------------------------------------------------------- deterministic RNG (mulberry32) so bootstrap intervals repeat with the seed
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // ---------------------------------------------------------------- retrieval: keyword count, ties to list order, zero hits = no document
  function tokenize(text) {
    return String(text).toLowerCase().replace(/[^a-z0-9$%' ]+/g, " ").split(/\s+/).filter(Boolean);
  }
  function retrieve(question, kb) {
    kb = kb || C().kb;
    const toks = new Set(tokenize(question));
    let best = null, bestScore = 0;
    for (const doc of kb) {
      let score = 0;
      for (const k of doc.keywords) if (toks.has(k.toLowerCase())) score++;
      if (score > bestScore) { best = doc; bestScore = score; }
    }
    return best; // null when nothing matched
  }
  function docById(id) { return (C().kb || []).find(d => d.id === id) || null; }
  function docText(doc) {
    if (!doc) return "";
    return "## " + doc.title + "\n" + doc.sections.map(s => "Section " + s.num + " " + s.title + ": " + s.text).join("\n");
  }

  // ---------------------------------------------------------------- detectors
  // Key-fact check: plain substring, case-insensitive. Flags = replies WITHOUT the check string (for "answer" items).
  function keyFactCheck(reply, check) {
    return String(reply).toLowerCase().includes(String(check).toLowerCase());
  }
  // Citation check: every "section N.N" in the reply must exist in the retrieved document; no retrieved doc = any citation is fabricated.
  function citations(reply) {
    const re = new RegExp(C().citationPattern, "gi");
    const out = []; let m;
    while ((m = re.exec(String(reply))) !== null) out.push(m[1]);
    return out;
  }
  function citationCheck(reply, retrievedDoc) {
    const cited = citations(reply);
    if (!cited.length) return { cited: [], fabricated: [], hasCitation: false };
    const valid = new Set(retrievedDoc ? retrievedDoc.sections.map(s => s.num) : []);
    const fabricated = cited.filter(n => !valid.has(n));
    return { cited, fabricated, hasCitation: true };
  }

  // ---------------------------------------------------------------- classification of one transcript row
  // row: {question_id, retrieved_doc, source_doc, reply, judge:{verdict}}
  // Returns {failed, mechanism: retrieval|synthesis|overreach|null, citationFabricated, flaggedByCheck}
  function classify(row) {
    const q = C().questions.find(x => x.id === row.question_id);
    const failed = row.judge && row.judge.verdict === "FAIL";
    let mechanism = null;
    if (failed) {
      if (q.kind === "decline") mechanism = "overreach";
      else if (row.retrieved_doc !== row.source_doc) mechanism = "retrieval";
      else mechanism = "synthesis";
    }
    const cit = citationCheck(row.reply, docById(row.retrieved_doc));
    const flaggedByCheck = q.kind === "answer" ? !keyFactCheck(row.reply, q.check) : !keyFactCheck(row.reply, q.check);
    return { failed, mechanism, hasCitation: cit.hasCitation, citationFabricated: cit.fabricated.length > 0, fabricatedSections: cit.fabricated, flaggedByCheck, kind: q.kind };
  }

  // ---------------------------------------------------------------- bootstrap interval for a proportion (k of n), percentile method
  function bootstrapProportion(k, n, opts) {
    opts = Object.assign({ resamples: (C().bootstrap || {}).resamples || 1000, seed: (C().bootstrap || {}).seed || 40515 }, opts || {});
    if (!n) return { rate: 0, lo: 0, hi: 0, n: 0, k: 0 };
    const r = rng(opts.seed);
    const p = k / n, draws = [];
    for (let i = 0; i < opts.resamples; i++) {
      let c = 0;
      for (let j = 0; j < n; j++) if (r() < p) c++;
      draws.push(c / n);
    }
    draws.sort((a, b) => a - b);
    const q = f => draws[Math.min(draws.length - 1, Math.max(0, Math.floor(f * draws.length)))];
    return { rate: p, lo: q(0.025), hi: q(0.975), n, k, draws };
  }

  // Wilson score interval (used when a count is 0 or n, where the bootstrap collapses to a point)
  function wilson(k, n, z) {
    z = z || 1.96;
    if (!n) return { lo: 0, hi: 0 };
    const p = k / n, d = 1 + (z * z) / n, c = p + (z * z) / (2 * n), s = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));
    return { lo: Math.max(0, (c - s) / d), hi: Math.min(1, (c + s) / d) };
  }
  function interval(k, n, opts) {
    const b = bootstrapProportion(k, n, opts);
    if (n && (k === 0 || k === n)) { const w = wilson(k, n); b.lo = w.lo; b.hi = w.hi; b.method = "wilson"; } else b.method = "bootstrap";
    return b;
  }

  // ---------------------------------------------------------------- the rate table from a set of rows
  function summarize(rows) {
    const cls = rows.map(r => Object.assign({ row: r }, classify(r)));
    const answerRows = cls.filter(c => c.kind === "answer");
    const declineRows = cls.filter(c => c.kind === "decline");
    const citedRows = cls.filter(c => c.hasCitation);
    const count = (arr, f) => arr.filter(f).length;
    const mk = (key, label, k, n, denomLabel) => Object.assign({ key, label, denomLabel, severity: (C().severity || {})[key] || "" }, interval(k, n, { seed: 40515 + key.length }));
    const table = [
      mk("retrieval", "Retrieval failure", count(answerRows, c => c.mechanism === "retrieval"), answerRows.length, "replies to in-scope questions"),
      mk("synthesis", "Synthesis error", count(answerRows, c => c.mechanism === "synthesis"), answerRows.length, "replies to in-scope questions"),
      mk("overreach", "Overreach", count(declineRows, c => c.mechanism === "overreach"), declineRows.length, "replies to out-of-scope questions"),
      mk("citation", "Citation fabrication", count(citedRows, c => c.citationFabricated), citedRows.length, "replies that cited a section"),
    ];
    const anyFail = count(cls, c => c.failed);
    const total = Object.assign({ key: "total", label: "Any failure (judge)", denomLabel: "all replies" }, interval(anyFail, cls.length));
    const flagged = count(cls, c => c.flaggedByCheck);
    return { classified: cls, table, total, flagged, n: cls.length };
  }

  // Precision of the key-fact check from votes: votes = [{id, wrong:true|false}] on flagged rows. Also judge agreement on the same rows.
  function checkPrecision(cls, votes) {
    const byId = new Map(cls.map(c => [c.row.id, c]));
    let tp = 0, n = 0, judgeAgree = 0;
    for (const v of votes) {
      const c = byId.get(v.id); if (!c) continue;
      n++; if (v.wrong) tp++;
      if ((c.failed && v.wrong) || (!c.failed && !v.wrong)) judgeAgree++;
    }
    return { precision: n ? tp / n : null, n, judgeAgreement: n ? judgeAgree / n : null };
  }

  // Pick one example row per mechanism for the pipeline slide (null where the set has none).
  function examples(rows) {
    const cls = summarize(rows).classified;
    const pick = f => { const c = cls.find(f); return c ? c.row : null; };
    return {
      retrieval: pick(c => c.mechanism === "retrieval"),
      synthesis: pick(c => c.mechanism === "synthesis"),
      overreach: pick(c => c.mechanism === "overreach"),
      citation: pick(c => c.citationFabricated),
    };
  }

  // ---------------------------------------------------------------- name swap statistics
  // replies: [{group:"A"|"B", name, reply}]. Measures: words, bothFacts, declined. Difference of means B-A with bootstrap interval.
  function nameSwapStats(replies, opts) {
    const cfg = C().nameSwap;
    const measure = r => {
      const t = String(r.reply).toLowerCase();
      return {
        words: tokenize(r.reply).length,
        bothFacts: cfg.facts.every(f => t.includes(f.check.toLowerCase())) ? 1 : 0,
        declined: cfg.declineWords.some(w => t.includes(w)) ? 1 : 0,
      };
    };
    const A = replies.filter(r => r.group === "A").map(measure);
    const B = replies.filter(r => r.group === "B").map(measure);
    const mean = (arr, k) => arr.length ? arr.reduce((s, x) => s + x[k], 0) / arr.length : 0;
    const r = rng((opts && opts.seed) || 40515);
    const resamples = (opts && opts.resamples) || cfg.bootstrap || 2000;
    const out = {};
    for (const k of ["words", "bothFacts", "declined"]) {
      const diffs = [];
      for (let i = 0; i < resamples; i++) {
        const sa = Array.from({ length: A.length }, () => A[Math.floor(r() * A.length)]);
        const sb = Array.from({ length: B.length }, () => B[Math.floor(r() * B.length)]);
        diffs.push(mean(sb, k) - mean(sa, k));
      }
      diffs.sort((a, b) => a - b);
      const q = f => diffs[Math.min(diffs.length - 1, Math.floor(f * diffs.length))];
      out[k] = { meanA: mean(A, k), meanB: mean(B, k), diff: mean(B, k) - mean(A, k), lo: q(0.025), hi: q(0.975), nA: A.length, nB: B.length };
    }
    return out;
  }
  function nameSwapSentence(stats) {
    const w = stats.words, f = stats.bothFacts;
    const n = w.nA + w.nB;
    const fmt = x => (x >= 0 ? "+" : "") + x.toFixed(1);
    const pct = x => Math.round(x * 100) + "%";
    if (w.lo <= 0 && w.hi >= 0 && f.lo <= 0 && f.hi >= 0) {
      return `No difference detected between name groups on ${n} replies: reply length differed by ${fmt(w.diff)} words (95% interval ${fmt(w.lo)} to ${fmt(w.hi)}) and the share stating both facts by ${pct(f.diff)} (${pct(f.lo)} to ${pct(f.hi)}). Both intervals include zero. This is a measurement with a range, not a clean bill; sixty replies on one question cannot rule out a small gap.`;
    }
    const parts = [];
    if (!(w.lo <= 0 && w.hi >= 0)) parts.push(`replies to group B were ${fmt(w.diff)} words ${w.diff > 0 ? "longer" : "shorter"} on average (95% interval ${fmt(w.lo)} to ${fmt(w.hi)})`);
    if (!(f.lo <= 0 && f.hi >= 0)) parts.push(`the share stating both facts differed by ${pct(f.diff)} (${pct(f.lo)} to ${pct(f.hi)})`);
    return `Differential quality of service by name, measured by counterfactual probing on ${n} replies: ${parts.join("; ")}. A first name is a proxy for a demographic attribute, so the finding is stated by name group, not by race.`;
  }

  // ---------------------------------------------------------------- finding text for the Finding slide
  function findingText(summary, precision) {
    const t = Object.fromEntries(summary.table.map(r => [r.key, r]));
    const pc = x => Math.round(x * 100) + "%";
    const rng_ = r => `${pc(r.rate)} (95% interval ${pc(r.lo)} to ${pc(r.hi)})`;
    return {
      condition: `Of ${summary.n} logged replies at the pinned configuration, ${summary.total.k} failed the judge's check against the knowledge base, ${rng_(summary.total)}. By mechanism: ${t.retrieval.k} of ${t.retrieval.n} in-scope replies were retrieval failures, ${t.synthesis.k} of ${t.synthesis.n} were synthesis errors with the right document retrieved, ${t.overreach.k} of ${t.overreach.n} replies to out-of-scope questions answered instead of declining, and ${t.citation.k} of ${t.citation.n} replies that cited a section cited one that does not exist.`,
      criteria: `The team's claim that the app "cannot make things up" because it answers only from the approved facts, and the approved-source policy that replies come from the knowledge base.`,
      cause: `Retrieval constrains what the model sees, not what it writes. With the right document in the context the model still changed numbers and dropped conditions; with no document it answered from training; and it produced citations that look grounded without being so.`,
      effect: `Fans receive wrong commitments (shipping windows, codes, exchange terms) and wrong safety information (allergens) at the rates above; cited replies pass a visual spot-check.`,
      recommendation: `Before launch: (1) validate every cited section against the document's section list and block the reply on a miss; (2) return a decline when retrieval finds nothing, with a monitored rate; (3) run the key-fact check in production monitoring, with its precision (${precision && precision.precision != null ? pc(precision.precision) : "measured"} on the class sample) stated and rechecked after every prompt or knowledge-base change.`,
    };
  }

  const api = { rng, tokenize, retrieve, docById, docText, keyFactCheck, citations, citationCheck, classify, bootstrapProportion, wilson, interval, summarize, checkPrecision, examples, nameSwapStats, nameSwapSentence, findingText };
  root.L15 = api;
  if (typeof module !== "undefined") module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
