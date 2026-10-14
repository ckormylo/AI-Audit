/* Part 2 of the lecture: tokens (tokenizer, BPE merges, IDs, language cost) */
(function () {
  const { h } = Deck;
  const G = () => (window.DECK_DATA && window.DECK_DATA.ex) || null;
  function chipRow(text, opts) {
    opts = opts || {};
    const row = h("div", { class: "chips" });
    const toks = Deck.bpe.encode(text) || [];
    toks.forEach((t, i) => row.appendChild(Deck.chip(t.text, i, { id: opts.ids === false ? null : t.id })));
    return { row, toks };
  }

  /* ---------- live tokenizer ---------- */
  Deck.components.Tokenizer = {
    steps: 4,
    mount(host, ctx) {
      const fm = ctx.fm;
      if (!Deck.bpe.ready()) { host.appendChild(h("div", {}, "Tokenizer data not loaded (data/gpt2_tokenizer.js).")); return {}; }
      const ta = h("textarea", { class: "tok-input", style: { left: "0px", top: "0px", width: "1472px", height: "96px" }, spellcheck: "false" });
      ta.value = fm.text;
      host.appendChild(ta);
      const stats = h("div", { class: "tok-stats", style: { left: "0px", top: "108px" } });
      host.appendChild(stats);
      const out = h("div", { class: "tok-out", style: { left: "0px", top: "148px", width: "1472px", height: "200px" } });
      host.appendChild(out);
      const cmp = h("div", { class: "abs show-on", style: { left: "0px", top: "360px", width: "1472px" } });
      const presets = fm.preset || [];
      const colW = 736;
      presets.forEach((p, i) => {
        const r = chipRow(p);
        const el = h("div", { class: "cmp-row abs", style: { left: (i % 2) * colW + "px", top: Math.floor(i / 2) * 66 + "px" } },
          h("div", { class: "src", style: { width: "190px" } }, p), r.row, h("div", { style: { fontSize: "17px", color: "#5F6379" } }, r.toks.length + (r.toks.length === 1 ? " token" : " tokens")));
        el.style.cursor = "pointer";
        el.addEventListener("click", () => { ta.value = p; render(); });
        cmp.appendChild(el);
      });
      host.appendChild(cmp);
      const tryIt = h("div", { class: "abs show-on", style: { right: "0px", top: "108px", fontSize: "19px", color: "#0E6F7F", fontWeight: 600 } }, "Click in the box and type. Arrow keys drive the slides again once you click outside it.");
      host.appendChild(tryIt);
      let kNow = 0;
      function render() {
        const toks = Deck.bpe.encode(ta.value) || [];
        stats.innerHTML = `<b>${toks.length}</b> tokens · ${Array.from(ta.value).length} characters`;
        out.innerHTML = "";
        const row = h("div", { class: "chips" });
        toks.forEach((t, i) => {
          const c = Deck.chip(t.text, i, { id: t.id });
          if (kNow === 2 && /^ [A-Za-z]+$/.test(t.text)) c.classList.add("hl");
          row.appendChild(c);
        });
        out.appendChild(row);
        out.style.opacity = kNow >= 1 ? 1 : 0;
        stats.style.opacity = kNow >= 1 ? 1 : 0;
      }
      ta.addEventListener("input", render);
      ta.addEventListener("keydown", (e) => e.stopPropagation());
      return {
        update(k) {
          kNow = k;
          if (k < 4) ta.value = fm.text;
          render();
          cmp.classList.toggle("off-up", k < 3);
          tryIt.classList.toggle("off", k < 4);
        },
      };
    },
  };

  /* ---------- BPE merges on a small corpus ---------- */
  function bpeStates(lines, nMerges) {
    const counts = new Map(), order = [];
    lines.forEach((l) => l.split(/\s+/).filter(Boolean).forEach((w) => { if (!counts.has(w)) order.push(w); counts.set(w, (counts.get(w) || 0) + 1); }));
    let words = order.map((w) => ({ w, n: counts.get(w), parts: Array.from(w) }));
    const states = [{ words: words.map((x) => ({ w: x.w, n: x.n, parts: x.parts.slice() })), merge: null }];
    for (let m = 0; m < nMerges; m++) {
      const pc = new Map(), first = [];
      words.forEach((x) => { for (let i = 0; i < x.parts.length - 1; i++) { const key = x.parts[i] + "\u0000" + x.parts[i + 1]; if (!pc.has(key)) first.push(key); pc.set(key, (pc.get(key) || 0) + x.n); } });
      if (!first.length) break;
      let best = first[0];
      first.forEach((k) => { if (pc.get(k) > pc.get(best)) best = k; });
      const [a, b] = best.split("\u0000");
      words = words.map((x) => {
        const p = [];
        for (let i = 0; i < x.parts.length; i++) { if (i < x.parts.length - 1 && x.parts[i] === a && x.parts[i + 1] === b) { p.push(a + b); i++; } else p.push(x.parts[i]); }
        return { w: x.w, n: x.n, parts: p };
      });
      states.push({ words: words.map((x) => ({ w: x.w, n: x.n, parts: x.parts.slice() })), merge: { a, b, count: pc.get(best) } });
    }
    return states;
  }
  Deck.components.BpeMerges = {
    steps: 7,
    mount(host, ctx) {
      const states = bpeStates(ctx.fm.corpus || [], 30);
      const area = h("div", { class: "abs", style: { left: "0px", top: "0px", width: "1010px", display: "flex", flexWrap: "wrap", alignContent: "flex-start" } });
      host.appendChild(area);
      const vocab = h("div", { class: "abs", style: { left: "0px", top: "560px", fontSize: "21px", color: "#4A4F6E" } });
      host.appendChild(vocab);
      const table = h("div", { class: "merge-table panel", style: { left: "1060px", top: "0px", width: "412px", height: "636px", padding: "14px 18px", overflow: "hidden" } });
      host.appendChild(table);
      const base = new Set(); states[0].words.forEach((x) => x.parts.forEach((c) => base.add(c)));
      return {
        update(k) {
          const idx = k <= 6 ? k : states.length - 1;
          const st = states[idx];
          const latest = st.merge ? st.merge.a + st.merge.b : null;
          area.innerHTML = "";
          st.words.forEach((x) => {
            const w = h("div", { class: "bpe-word" });
            x.parts.forEach((p, i) => { const c = Deck.chip(p, i); if (p === latest) c.classList.add("merge"); w.appendChild(c); });
            w.appendChild(h("span", { style: { fontSize: "17px", color: "#5F6379", marginLeft: "4px" } }, "×" + x.n));
            area.appendChild(w);
          });
          table.innerHTML = `<div class="ptitle" style="margin-bottom:8px">Merge table</div>`;
          const shown = states.slice(1, idx + 1);
          const start = Math.max(0, shown.length - 16);
          if (start > 0) table.appendChild(h("div", { style: { color: "#5F6379", fontSize: "16px", padding: "4px 0" } }, `… ${start} earlier merges`));
          shown.slice(start).forEach((s, j) => {
            const n = start + j + 1;
            table.appendChild(h("div", { class: "mr" + (n === idx ? " latest" : "") }, h("span", { class: "k" }, n + "."),
              h("span", { html: Deck.tokHTML(s.merge.a) + " + " + Deck.tokHTML(s.merge.b) + " → <b>" + Deck.tokHTML(s.merge.a + s.merge.b) + "</b>" }),
              h("span", { style: { marginLeft: "auto", color: "#5F6379", fontFamily: "var(--font-body)", fontSize: "15px" } }, "seen " + s.merge.count + "×")));
          });
          const nTok = st.words.reduce((a, x) => a + x.parts.length * x.n, 0);
          vocab.innerHTML = `Vocabulary: <b>${base.size}</b> characters + <b>${idx}</b> merges = <b>${base.size + idx}</b> tokens · the corpus is now <b>${nTok}</b> tokens long`;
        },
      };
    },
  };

  /* ---------- token IDs only ---------- */
  Deck.components.TokenIds = {
    steps: 4,
    mount(host, ctx) {
      const lines = ctx.fm.line || [];
      const blocks = lines.map((ln, i) => {
        const b = h("div", { class: "abs show-on", style: { left: "0px", top: i * 205 + "px", width: "1472px" } });
        const txt = h("div", { style: { fontSize: "34px", fontWeight: 600, marginBottom: "12px" } }, ln);
        const r = chipRow(ln);
        r.row.style.gap = "6px";
        b.append(txt, r.row);
        host.appendChild(b);
        return { b, txt, r };
      });
      const note = h("div", { class: "abs show-on", style: { left: "900px", top: "205px", width: "560px", fontSize: "21px", color: "#B0106A", fontWeight: 600 } });
      const sb = (Deck.bpe.encode(" strawberry") || [{ id: "?" }])[0];
      note.textContent = `" strawberry" = one token, ID ${sb.id}. No letters inside.`;
      host.appendChild(note);
      function letters(bl, on) {
        bl.r.row.querySelectorAll(".chip").forEach((c) => {
          c.querySelector(".tt").style.opacity = on ? 1 : 0.12;
          c.querySelector(".id").style.cssText = on ? "" : "font-size:22px;color:#232748;font-weight:700";
        });
      }
      return {
        update(k) {
          blocks.forEach((bl, i) => {
            const vis = i === 0 ? true : k >= i + 1;
            bl.b.classList.toggle("off-up", !vis);
            bl.r.row.style.opacity = (i === 0 ? k >= 1 : vis) ? 1 : 0;
            letters(bl, !(k >= 1 && (i === 0 || vis)));
          });
          blocks[1] && blocks[1].r.row.querySelectorAll(".chip").forEach((c) => c.classList.toggle("hl", k >= 2 && c.textContent.includes("strawberry")));
          note.classList.toggle("off", k < 2);
        },
      };
    },
  };

  /* ---------- token counts by language ---------- */
  Deck.components.LanguageCost = {
    steps: 2,
    mount(host, ctx) {
      const g = G(); if (!g) return {};
      const rows = g.languages.rows;
      const en = rows[0].tokens, max = Math.max(...rows.map((r) => r.tokens));
      const els = rows.map((r, i) => {
        const el = h("div", { class: "lc-row", style: { top: i * 74 + "px" } }, h("div", { class: "lang" }, r.lang),
          h("div", { class: "txt", dir: "auto" }, r.text), h("div", { class: "bar", style: { width: "0px" } }),
          h("div", { class: "num" }, String(r.tokens)), h("div", { style: { marginLeft: "12px", fontSize: "18px", color: "#5F6379" } }, i ? `${(r.tokens / en).toFixed(1)}× English` : "baseline"));
        host.appendChild(el); return el;
      });
      const worst = rows.reduce((a, r) => (r.tokens > a.tokens ? r : a), rows[0]);
      const c1 = h("div", { class: "callout show-on", style: { left: "0px", top: "466px", width: "560px" } }, h("b", {}, "Cost. "), `The app pays per token. The ${worst.lang} message costs ${(worst.tokens / en).toFixed(1)} times as much as the English one.`);
      const c2 = h("div", { class: "callout show-on", style: { left: "590px", top: "466px", width: "300px" } }, h("b", {}, "Capacity. "), "The context window is counted in tokens, so less of the conversation fits.");
      host.append(c1, c2);
      return {
        update(k) {
          els.forEach((el, i) => {
            el.querySelector(".bar").style.width = k >= 1 ? (rows[i].tokens / max) * 480 + "px" : "0px";
            el.querySelector(".bar").style.opacity = k >= 1 ? 1 : 0;
            el.querySelector(".num").style.opacity = k >= 1 ? 1 : 0;
            el.lastChild.style.opacity = k >= 1 ? 1 : 0;
          });
          c1.classList.toggle("off-up", k < 2); c2.classList.toggle("off-up", k < 2);
        },
      };
    },
  };
})();
