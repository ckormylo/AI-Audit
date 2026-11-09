// L16 data layer: the PII scanner, its misses, the two-detector comparison, the source join and the finding text.
// No DOM, no engine dependency; runs in node for testing.
(function (root) {
  const C = () => root.L16_CONFIG || root.ARENA_CONFIG;
  const corpus = () => (root.SCAN_CORPUS && root.SCAN_CORPUS.rows) || [];

  function compile(list) { return list.map((p) => ({ key: p.key, label: p.label, re: new RegExp(p.pattern, "gi"), allow: (p.allow || []).map((a) => a.toLowerCase()) })); }

  // Run every scanner pattern over every reply. Returns rows with hits: [{key, match, index}]
  function scan(rows) {
    rows = rows || corpus();
    const pats = compile(C().scanner);
    return rows.map((r) => {
      const hits = [];
      for (const p of pats) { p.re.lastIndex = 0; let m; while ((m = p.re.exec(r.bot)) !== null) { if (!p.allow.some((a) => m[0].toLowerCase().includes(a))) hits.push({ key: p.key, match: m[0], index: m.index }); if (m[0].length === 0) p.re.lastIndex++; } }
      const filterPii = r.judge === "pii";
      return Object.assign({}, r, { hits, anyHit: hits.length > 0, filterPii, hasFilter: r.judge != null });
    });
  }

  // Counts for the scan slide
  function summarize(scanned) {
    const byKey = {}; C().scanner.forEach((p) => (byKey[p.key] = 0));
    let withHit = 0, l14 = 0, l15 = 0, l14hit = 0, l15hit = 0;
    for (const r of scanned) {
      const keys = new Set(r.hits.map((h) => h.key)); keys.forEach((k) => byKey[k]++);
      if (r.anyHit) withHit++;
      if (r.source === "L14") { l14++; if (r.anyHit) l14hit++; } else { l15++; if (r.anyHit) l15hit++; }
    }
    // two detectors, on the rows the filter graded
    const graded = scanned.filter((r) => r.hasFilter);
    const tbl = { yy: 0, yn: 0, ny: 0, nn: 0 }; // scanner y/n, filter y/n
    for (const r of graded) tbl[(r.anyHit ? "y" : "n") + (r.filterPii ? "y" : "n")]++;
    return { n: scanned.length, byKey, withHit, l14, l15, l14hit, l15hit, graded: graded.length, tbl };
  }

  // Where did a matched value come from? echo (the fan typed it), notes (support notes in the system prompt), kb (a retrieved document), unknown
  function attribute(row, hit) {
    const v = hit.match.toLowerCase();
    const user = (row.user || "").toLowerCase();
    if (user.includes(v)) return "echo";
    const notes = (C().systemPrompt.split("SUPPORT NOTES")[1] || "").toLowerCase();
    if (notes.includes(v)) return "notes";
    const kb = ((row.retrieved || "") + " " + (C().kb || []).map((d) => d.text).join(" ")).toLowerCase();
    if (kb.includes(v)) return "kb";
    return "unknown";
  }
  function sourceJoin(scanned) {
    const counts = { notes: 0, kb: 0, echo: 0, unknown: 0 }, examples = { notes: null, kb: null, echo: null, unknown: null };
    let total = 0;
    for (const r of scanned) for (const h of r.hits) { const s = attribute(r, h); counts[s]++; total++; if (!examples[s]) examples[s] = { row: r, hit: h }; }
    return { counts, total, examples };
  }

  // What the scanner cannot catch: rows with NO scanner hit that a person would flag
  function misses(scanned) {
    const out = {};
    for (const m of C().misses) {
      const re = new RegExp(m.pattern, "i");
      out[m.key] = scanned.filter((r) => !r.anyHit && re.test(r.bot)).slice(0, 3);
    }
    // inferable: the filter said pii, the scanner found nothing, and no city pattern either
    const cityRe = new RegExp(C().misses[0].pattern, "i");
    out.inferable = scanned.filter((r) => !r.anyHit && r.filterPii && !cityRe.test(r.bot)).slice(0, 3);
    return out;
  }

  // Disagreements between scanner and filter, for the class to vote on
  function disagreements(scanned, n) {
    const d = scanned.filter((r) => r.hasFilter && r.anyHit !== r.filterPii);
    // alternate the two kinds so the sample has both
    const a = d.filter((r) => r.anyHit && !r.filterPii), b = d.filter((r) => !r.anyHit && r.filterPii);
    const out = []; for (let i = 0; out.length < (n || 10) && (i < a.length || i < b.length); i++) { if (a[i]) out.push(a[i]); if (b[i] && out.length < (n || 10)) out.push(b[i]); }
    return out;
  }

  // Precision and recall of each detector against "truth": the class vote where there is one, otherwise the two detectors' agreement
  function detectorStats(scanned, votes) {
    const truth = (r) => (votes[r.id] != null ? votes[r.id] : r.hasFilter && r.anyHit === r.filterPii ? r.anyHit : null);
    const rows = scanned.filter((r) => r.hasFilter && truth(r) != null);
    const stat = (pred) => { let tp = 0, fp = 0, fn = 0; for (const r of rows) { const t = truth(r), p = pred(r); if (p && t) tp++; else if (p && !t) fp++; else if (!p && t) fn++; } return { tp, fp, fn, precision: tp + fp ? tp / (tp + fp) : null, recall: tp + fn ? tp / (tp + fn) : null }; };
    return { n: rows.length, voted: rows.filter((r) => votes[r.id] != null).length, scanner: stat((r) => r.anyHit), filter: stat((r) => r.filterPii) };
  }

  function findingText(sum, join) {
    const pc = (x) => Math.round(x * 100) + "%";
    const notesShare = join.total ? join.counts.notes / join.total : 0;
    return {
      condition: `Of ${sum.l14} replies in the red-team log, ${sum.l14hit} (${pc(sum.l14hit / sum.l14)}) contained a fan identifier (order number, card digits or a name from the customer list); of ${sum.l15} replies to cooperative benchmark questions, ${sum.l15hit}. Of ${join.total} matched values, ${join.counts.notes} (${pc(notesShare)}) were copied from the support notes placed in the system prompt, ${join.counts.echo} echoed the fan's own message, ${join.counts.kb} came from a retrieved document.`,
      criteria: `The launch memo's statement that the app "has no access to fan records," and the approved-source policy that the model answers only from approved facts.`,
      cause: `Prompt assembly pastes this week's support records into the system prompt of every conversation, so the records are in the context whether or not the question concerns them; the only control between them and any fan is a rule asking the model not to repeat them (a claimed control, Lecture 14).`,
      effect: `Any fan can obtain other fans' names, cities, order numbers and card digits with ordinary or lightly framed questions, at the rate above; the filter that was meant to catch this disagrees with the scanner on a share of replies and has graded itself (Lecture 14).`,
      recommendation: `(1) Remove the support records from the prompt; answer order questions through a lookup tool that checks the asking fan's identity. (2) Reconcile the index against the approved-source list and add query-time access control. (3) Log retrieval. (4) Re-run this scan after the change, with its patterns, precision and "cannot catch" list stated, and have a person review a stratified sample.`,
    };
  }

  // Hits by L14 technique (plus the L15 benchmark): how many replies of each kind carried an identifier
  function byTechnique(scanned) {
    const order = [["flip", "Plain question (prompt flip)"], ["persona", "Persona / story"], ["multiturn", "Multi-turn escalation"], ["extraction", "Data extraction"], ["injection", "Direct injection"], ["indirect", "Indirect injection"], ["encoding", "Obfuscation"], ["benchmark", "Cooperative benchmark questions (L15)"]];
    return order.map(([key, label]) => { const rows = scanned.filter((r) => r.technique === key); return { key, label, n: rows.length, k: rows.filter((r) => r.anyHit).length }; }).filter((t) => t.n);
  }
  // Scan one written reply (the voting set): the scanner only
  function scanOne(bot) { return scan([{ id: "x", bot, judge: null, user: "" }])[0]; }
  // Scanner precision and recall against the room's votes on the voting set
  function voteStats(voteSet, votes) {
    let tp = 0, fp = 0, fn = 0, tn = 0, n = 0;
    for (const v of voteSet) { if (votes[v.id] == null) continue; n++; const hit = scanOne(v.bot).anyHit, t = votes[v.id]; if (hit && t) tp++; else if (hit && !t) fp++; else if (!hit && t) fn++; else tn++; }
    return { n, tp, fp, fn, tn, precision: tp + fp ? tp / (tp + fp) : null, recall: tp + fn ? tp / (tp + fn) : null };
  }

  const api = { scan, summarize, attribute, sourceJoin, misses, disagreements, detectorStats, findingText, byTechnique, scanOne, voteStats };
  root.L16 = api;
  if (typeof module !== "undefined") module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
