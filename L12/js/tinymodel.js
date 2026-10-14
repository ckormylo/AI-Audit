/* Tiny character-level language model (MLP over the last 8 characters).
   Same code runs in the browser (inside a Web Worker) and in Node (scripts/tiny_snapshots.mjs).
   Deterministic: seeded random numbers. */
(function (root) {
  function TinyModel(corpus, seed) {
    const C = 8, E = 12, H = 160;
    const chars = Array.from(new Set(corpus)).sort();
    const V = chars.length, idx = new Map(chars.map((c, i) => [c, i]));
    const data = Int32Array.from(Array.from(corpus).map((c) => idx.get(c)));
    let s = seed >>> 0 || 1;
    const rnd = () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const gauss = () => Math.sqrt(-2 * Math.log(rnd() + 1e-12)) * Math.cos(2 * Math.PI * rnd());
    const init = (n, sc) => Float32Array.from({ length: n }, () => gauss() * sc);
    const P = { emb: init(V * E, 0.5), W1: init(C * E * H, 1 / Math.sqrt(C * E)), b1: new Float32Array(H), W2: init(H * V, 0.5 / Math.sqrt(H)), b2: new Float32Array(V) };
    const M = {}, Vv = {};
    for (const k in P) { M[k] = new Float32Array(P[k].length); Vv[k] = new Float32Array(P[k].length); }
    let step = 0;
    const NL = idx.get("\n");

    function forward(ctx, x, hpre, hh, logits) {
      for (let c = 0; c < C; c++) for (let e = 0; e < E; e++) x[c * E + e] = P.emb[ctx[c] * E + e];
      for (let j = 0; j < H; j++) { let a = P.b1[j]; for (let i = 0; i < C * E; i++) a += x[i] * P.W1[i * H + j]; hpre[j] = a; hh[j] = Math.tanh(a); }
      for (let v = 0; v < V; v++) { let a = P.b2[v]; for (let j = 0; j < H; j++) a += hh[j] * P.W2[j * V + v]; logits[v] = a; }
    }
    const x = new Float32Array(C * E), hpre = new Float32Array(H), hh = new Float32Array(H), logits = new Float32Array(V), probs = new Float32Array(V);
    const G = {}; for (const k in P) G[k] = new Float32Array(P[k].length);
    const dh = new Float32Array(H), dx = new Float32Array(C * E), ctx = new Int32Array(C);

    function trainStep(batch, lr) {
      for (const k in G) G[k].fill(0);
      let loss = 0;
      for (let b = 0; b < batch; b++) {
        const pos = C + Math.floor(rnd() * (data.length - C - 1));
        for (let c = 0; c < C; c++) ctx[c] = data[pos - C + c];
        const y = data[pos];
        forward(ctx, x, hpre, hh, logits);
        let m = -Infinity; for (let v = 0; v < V; v++) m = Math.max(m, logits[v]);
        let z = 0; for (let v = 0; v < V; v++) { probs[v] = Math.exp(logits[v] - m); z += probs[v]; }
        for (let v = 0; v < V; v++) probs[v] /= z;
        loss += -Math.log(probs[y] + 1e-12);
        probs[y] -= 1;
        dh.fill(0);
        for (let v = 0; v < V; v++) { const g = probs[v] / batch; G.b2[v] += g; for (let j = 0; j < H; j++) { G.W2[j * V + v] += hh[j] * g; dh[j] += P.W2[j * V + v] * g; } }
        dx.fill(0);
        for (let j = 0; j < H; j++) { const g = dh[j] * (1 - hh[j] * hh[j]); G.b1[j] += g; for (let i = 0; i < C * E; i++) { G.W1[i * H + j] += x[i] * g; dx[i] += P.W1[i * H + j] * g; } }
        for (let c = 0; c < C; c++) for (let e = 0; e < E; e++) G.emb[ctx[c] * E + e] += dx[c * E + e];
      }
      step++;
      const b1 = 0.9, b2 = 0.999, eps = 1e-8, c1 = 1 - Math.pow(b1, step), c2 = 1 - Math.pow(b2, step);
      for (const k in P) { const p = P[k], g = G[k], m = M[k], v = Vv[k]; for (let i = 0; i < p.length; i++) { m[i] = b1 * m[i] + (1 - b1) * g[i]; v[i] = b2 * v[i] + (1 - b2) * g[i] * g[i]; p[i] -= (lr * (m[i] / c1)) / (Math.sqrt(v[i] / c2) + eps); } }
      return loss / batch;
    }
    function sample(n, temp, maxLen) {
      const out = [];
      for (let k = 0; k < n; k++) {
        // start from the last characters before a real line break, as in training
        let st; do { st = C + 1 + Math.floor(rnd() * (data.length - C - 2)); } while (data[st - 1] !== NL);
        const c = Int32Array.from(data.subarray(st - C, st));
        let str = "";
        for (let t = 0; t < (maxLen || 70); t++) {
          forward(c, x, hpre, hh, logits);
          let m = -Infinity; for (let v = 0; v < V; v++) m = Math.max(m, logits[v] / temp);
          let z = 0; for (let v = 0; v < V; v++) { probs[v] = Math.exp(logits[v] / temp - m); z += probs[v]; }
          let r = rnd() * z, ch = 0;
          for (; ch < V - 1; ch++) { r -= probs[ch]; if (r <= 0) break; }
          if (ch === NL) break;
          str += chars[ch];
          for (let q = 0; q < C - 1; q++) c[q] = c[q + 1];
          c[C - 1] = ch;
        }
        out.push(str);
      }
      return out;
    }
    return { trainStep, sample, get step() { return step; }, vocab: V, params: P.emb.length + P.W1.length + P.b1.length + P.W2.length + P.b2.length };
  }
  root.TinyModel = TinyModel;
})(typeof self !== "undefined" ? self : globalThis);
