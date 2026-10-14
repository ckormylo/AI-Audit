/* GPT-2 byte-level BPE tokenizer in plain JavaScript (same algorithm as OpenAI's encoder.py). */
(function () {
  const T = (window.Deck.bpe = {});
  let enc = null, ranks = null, b2u = null, u2b = null, vocab = null, cache = new Map();
  const PAT = /'s|'t|'re|'ve|'m|'ll|'d| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu;

  function init() {
    if (enc) return true;
    const d = window.DECK_DATA && window.DECK_DATA.gpt2tok;
    if (!d) return false;
    vocab = d.vocab;
    enc = new Map(vocab.map((t, i) => [t, i]));
    ranks = new Map(d.merges.split("\n").map((m, i) => [m, i]));
    const bs = [];
    for (let i = 33; i <= 126; i++) bs.push(i);
    for (let i = 161; i <= 172; i++) bs.push(i);
    for (let i = 174; i <= 255; i++) bs.push(i);
    const cs = bs.slice();
    let n = 0;
    for (let b = 0; b < 256; b++) if (!bs.includes(b)) { bs.push(b); cs.push(256 + n); n++; }
    b2u = {}; u2b = {};
    bs.forEach((b, i) => { b2u[b] = String.fromCharCode(cs[i]); u2b[String.fromCharCode(cs[i])] = b; });
    return true;
  }
  T.ready = init;

  function bpe(token) {
    if (cache.has(token)) return cache.get(token);
    let word = Array.from(token);
    while (word.length > 1) {
      let best = null, bestRank = Infinity;
      for (let i = 0; i < word.length - 1; i++) {
        const r = ranks.get(word[i] + " " + word[i + 1]);
        if (r !== undefined && r < bestRank) { bestRank = r; best = i; }
      }
      if (best === null) break;
      const a = word[best], b = word[best + 1], out = [];
      for (let i = 0; i < word.length; i++) {
        if (i < word.length - 1 && word[i] === a && word[i + 1] === b) { out.push(a + b); i++; }
        else out.push(word[i]);
      }
      word = out;
    }
    cache.set(token, word);
    return word;
  }

  const te = new TextEncoder(), td = new TextDecoder("utf-8", { fatal: false });
  /* returns [{id, text}] where text is the decoded piece (partial UTF-8 shown as a byte marker) */
  T.encode = function (text) {
    if (!init()) return null;
    const out = [];
    for (const m of text.matchAll(PAT)) {
      const u = Array.from(te.encode(m[0])).map((b) => b2u[b]).join("");
      for (const t of bpe(u)) out.push({ id: enc.get(t), text: T.decode1(t) });
    }
    return out;
  };
  T.decode1 = function (t) {
    const bytes = Uint8Array.from(Array.from(t).map((c) => u2b[c]));
    const s = td.decode(bytes);
    return s.includes("�") ? "‹" + Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join(" ") + "›" : s;
  };
  T.text = (id) => (init() ? T.decode1(vocab[id]) : "");
  T.size = () => (init() ? vocab.length : 0);
})();
