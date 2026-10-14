/* Part 3 of the lecture: inside the transformer */
(function () {
  const { h, s, svg } = Deck;
  const G = () => (window.DECK_DATA && window.DECK_DATA.ex) || null;
  const VIOLET = "#6B3FA0", COBALT = "#2F5FD0", INK = "#232748", MUTED = "#5F6379", RULE = "#E2DACB", MARIGOLD = "#F4A51C", MAGENTA = "#D6177F";

  /* mini map of the model shown on slides inside Part 3 */
  const STAGES = ["Tokens", "Embedding", "Attention", "Feed-forward", "Output"];
  Deck.ministrip = function (slideEl, on) {
    const el = h("div", { class: "ministrip", style: { right: "400px", top: "34px" } });
    STAGES.forEach((t, i) => { if (i) el.appendChild(h("i")); el.appendChild(h("span", { class: t === on ? "on" : "" }, t)); });
    slideEl.appendChild(el);
  };

  /* ---------- 11. model overview ---------- */
  Deck.components.ModelOverview = {
    steps: 7,
    mount(host, ctx) {
      const wrap = h("div", { class: "abs", style: { left: "0px", top: "0px", width: "1472px", height: "638px", transformOrigin: "100% 0%", transition: "transform 800ms var(--ease), opacity 800ms" } });
      host.appendChild(wrap);
      const Y = 210, BH = 150;
      const defs = [
        ["tokens", 0, 140, "Token IDs", "#22A6B8", "Text arrives as ID numbers"],
        ["embed", 190, 170, "Embedding", COBALT, "Each ID becomes a vector"],
        ["attn", 470, 190, "Attention", VIOLET, "Vectors take in earlier context"],
        ["ffn", 700, 190, "Feed-forward", VIOLET, "Each vector is updated on its own"],
        ["last", 966, 150, "Last vector", COBALT, "Holds what the model will use"],
        ["unembed", 1150, 160, "Unembed­ding", COBALT, "One score per token"],
        ["probs", 1344, 128, "Proba­bilities", MARIGOLD, "Softmax over the scores"],
      ];
      const block = h("div", { class: "abs show-on", style: { left: "446px", top: Y - 50 + "px", width: "470px", height: BH + 100 + "px", border: "2.5px dashed " + VIOLET, borderRadius: "18px" } },
        h("div", { class: "abs lbl-caps", style: { left: "16px", top: "10px", color: "#5A3290" } }, "One block"),
        h("div", { class: "abs", style: { right: "14px", top: "4px", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "30px", color: "#5A3290" } }, "× 96"));
      wrap.appendChild(block);
      const shadows = [1, 2, 3].map((k) => { const sh = h("div", { class: "abs show-on", style: { left: 446 + k * 10 + "px", top: Y - 50 + k * 10 + "px", width: "470px", height: BH + 100 + "px", border: "2px solid #D9CCEB", borderRadius: "18px", zIndex: -k } }); wrap.appendChild(sh); return sh; });
      const boxes = {}, descs = {};
      defs.forEach(([id, x, w, label, color, desc]) => {
        const b = h("div", { class: "ov-box", style: `left:${x}px; top:${Y}px; width:${w}px; height:${BH}px; --b:${color}` }, label);
        wrap.appendChild(b); boxes[id] = b;
        const d = h("div", { class: "abs show-on", style: { left: x - 10 + "px", top: Y + BH + 66 + "px", width: w + 20 + "px", textAlign: "center", fontSize: "19px", color: "#4A4F6E", lineHeight: 1.3 } }, desc);
        wrap.appendChild(d); descs[id] = d;
      });
      const arrows = [[140, 190], [360, 470], [660, 700], [890, 966], [1116, 1150], [1310, 1344]];
      const asvg = svg(1472, 638, wrap, { style: "position:absolute;left:0;top:0;pointer-events:none" });
      s("defs", {}, asvg).innerHTML = `<marker id="ovA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="${MUTED}"/></marker>`;
      arrows.forEach(([a, b]) => s("line", { x1: a + 4, y1: Y + BH / 2, x2: b - 4, y2: Y + BH / 2, stroke: MUTED, "stroke-width": 2.5, "marker-end": "url(#ovA)" }, asvg));
      const order = [["tokens"], ["embed"], ["attn"], ["ffn"], [], ["last", "unembed", "probs"]];
      return {
        update(k) {
          const lit = new Set(), seen = new Set();
          order.forEach((ids, i) => ids.forEach((id) => { if (k === i + 1 || (i === 5 && k === 6)) lit.add(id); if (k > i + 1 || k >= 7) seen.add(id); }));
          Object.entries(boxes).forEach(([id, b]) => { b.classList.toggle("lit", lit.has(id)); b.classList.toggle("seen", seen.has(id) && !lit.has(id)); });
          Object.entries(descs).forEach(([id, d]) => d.classList.toggle("off", !(lit.has(id) || seen.has(id))));
          const blockOn = k >= 5;
          block.classList.toggle("off", !blockOn); shadows.forEach((sh) => sh.classList.toggle("off", !blockOn));
          if (k === 5) { boxes.attn.classList.add("lit"); boxes.ffn.classList.add("lit"); }
        },
      };
    },
  };

  /* ---------- 12. embeddings ---------- */
  Deck.components.EmbeddingSpace = {
    steps: 5,
    mount(host, ctx) {
      Deck.ministrip(ctx.slideEl, "Embedding");
      const g = G(); if (!g) return {};
      const E = g.embed, L = E.lookup;
      // left: lookup
      const left = h("div", { class: "abs", style: { left: "0px", top: "0px", width: "560px", height: "636px" } });
      host.appendChild(left);
      const chips = h("div", { class: "chips abs", style: { left: "0px", top: "0px" } });
      L.pieces.forEach((p, i) => { const c = Deck.chip(p, i, { id: L.ids[i] }); if (i === 1) c.classList.add("hl"); chips.appendChild(c); });
      left.appendChild(chips);
      left.appendChild(h("div", { class: "abs", style: { left: "0px", top: "84px", fontSize: "18px", color: "#4A4F6E" } }, `" Lamborghini" is ${L.pieces.length} tokens, so 3 lookups. Follow "${L.piece}".`));
      // table
      const tbl = svg(260, 310, left, { style: "position:absolute;left:0;top:130px;width:260px;height:310px" });
      const rows = 18;
      for (let r = 0; r < rows; r++) {
        const y = 10 + r * 15;
        const hit = r === 9;
        s("rect", { x: 40, y, width: 210, height: 11, rx: 3, fill: hit ? COBALT : "#E6EAF6", class: hit ? "hitrow" : "" }, tbl);
        if (r === 0) s("text", { x: 34, y: y + 10, "text-anchor": "end", "font-size": 12, fill: MUTED, text: "0" }, tbl);
        if (hit) s("text", { x: 34, y: y + 10, "text-anchor": "end", "font-size": 12, fill: COBALT, "font-weight": 700, text: L.piece_id }, tbl);
        if (r === rows - 1) s("text", { x: 34, y: y + 10, "text-anchor": "end", "font-size": 12, fill: MUTED, text: "50,256" }, tbl);
      }
      s("text", { x: 145, y: 300, "text-anchor": "middle", "font-size": 14, fill: MUTED, text: "50,257 rows × 768 numbers" }, tbl);
      const vec = h("div", { class: "vec show-on", style: { left: "330px", top: "150px" } });
      L.first8.forEach((v) => vec.appendChild(h("span", {}, (v >= 0 ? "+" : "") + v.toFixed(3))));
      vec.appendChild(h("span", {}, "⋮"));
      left.appendChild(vec);
      const vlab = h("div", { class: "abs show-on", style: { left: "450px", top: "190px", width: "120px", fontSize: "16px", color: "#4A4F6E", lineHeight: 1.3 } }, "768 numbers in GPT-2. 12,288 in GPT-3.");
      left.appendChild(vlab);
      const arrow = h("div", { class: "abs show-on", style: { left: "268px", top: "254px", fontSize: "34px", color: COBALT } }, "→");
      left.appendChild(arrow);
      // position panel
      const pos = h("div", { class: "panel show-on", style: { left: "0px", top: "456px", width: "560px", height: "176px", padding: "16px 20px", fontSize: "20px", lineHeight: 1.45 } },
        h("div", { class: "ptitle" }, "Position"),
        h("div", { html: `Input vector = <b style="color:${COBALT}">token vector</b> + <b style="color:#0E6F7F">position vector</b>` }),
        h("div", { style: { marginTop: "8px", color: "#4A4F6E" }, html: `"dog bites man" and "man bites dog" use the same three token vectors. Only the position vectors tell them apart.` }));
      left.appendChild(pos);
      // right: map
      const panel = h("div", { class: "panel show-on", style: { left: "600px", top: "0px", width: "872px", height: "636px" } });
      host.appendChild(panel);
      const m = svg(872, 636, panel);
      const pts = E.points;
      const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
      const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
      const X = (v) => 70 + ((v - x0) / (x1 - x0)) * 700, Y = (v) => 70 + ((y1 - v) / (y1 - y0)) * 480;
      const colors = { money: "#BF3417", challenges: "#2A50B0", production: "#0E6F7F", products: "#B0106A", places: "#45731A", extra: "#8F5A00" };
      const gLeg = s("g", {}, m);
      Object.entries({ money: "Money", challenges: "Challenges", production: "Videos", products: "Products", places: "Places" }).forEach(([k, t], i) => {
        s("circle", { cx: 30 + i * 160, cy: 30, r: 7, fill: colors[k] }, gLeg);
        s("text", { x: 44 + i * 160, y: 36, "font-size": 18, text: t, fill: colors[k], "font-weight": 600 }, gLeg);
      });
      const gPts = s("g", { class: "fade" }, m), gIsl = s("g", { class: "fade" }, m), gArr = s("g", { class: "fade" }, m);
      pts.forEach((p) => {
        const gg = p.g === "extra" ? gIsl : gPts;
        s("circle", { cx: X(p.x), cy: Y(p.y), r: p.g === "extra" ? 10 : 7, fill: colors[p.g], stroke: p.g === "extra" ? INK : "none", "stroke-width": 2 }, gg);
        s("text", { x: X(p.x) + (p.g === "extra" ? -15 : 11), y: Y(p.y) + (p.g === "extra" ? 30 : 6), "text-anchor": p.g === "extra" ? "end" : "start", "font-size": p.g === "extra" ? 22 : 18, "font-weight": p.g === "extra" ? 700 : 400, fill: p.g === "extra" ? "#8F5A00" : INK, class: "mono", text: p.w.trim() }, gg);
      });
      s("text", { x: 30, y: 610, "font-size": 17, fill: "#8F5A00", "font-weight": 600, text: `" island" has one vector for every use of the word. Context decides which meaning wins (next slide).` }, gIsl);
      s("defs", {}, m).innerHTML = `<marker id="emA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="${MAGENTA}"/></marker>`;
      const AM = E.arrow_map;
      if (AM) {
        const ix = 500, iy = 300, iw = 350, ih = 260;
        s("rect", { x: ix, y: iy, width: iw, height: ih, rx: 10, fill: "#FDFBF6", stroke: RULE }, gArr);
        s("text", { x: ix + 16, y: iy + 26, "font-size": 13, "font-weight": 700, "letter-spacing": 1.2, fill: MUTED, text: "COUNTRY → CAPITAL (OWN MAP)" }, gArr);
        const axs = AM.points.slice(0, 4).map((p) => p.x), ays = AM.points.slice(0, 4).map((p) => p.y);
        const ax0 = Math.min(...axs), ax1 = Math.max(...axs), ay0 = Math.min(...ays), ay1 = Math.max(...ays);
        const AX = (v) => ix + 40 + ((v - ax0) / (ax1 - ax0 || 1)) * (iw - 120), AY = (v) => iy + 50 + ((ay1 - v) / (ay1 - ay0 || 1)) * (ih - 80);
        AM.pairs.slice(0, 2).forEach(([a, b]) => {
          const P = AM.points[a], Q = AM.points[b];
          s("line", { x1: AX(P.x), y1: AY(P.y), x2: AX(Q.x), y2: AY(Q.y), stroke: MAGENTA, "stroke-width": 2.5, "marker-end": "url(#emA)" }, gArr);
          [P, Q].forEach((R, z) => { s("circle", { cx: AX(R.x), cy: AY(R.y), r: 4.5, fill: z ? MAGENTA : INK }, gArr); s("text", { x: AX(R.x) + 7, y: AY(R.y) - 6, "font-size": 15, fill: z ? "#B0106A" : INK, class: "mono", text: R.w.trim() }, gArr); });
        });
        s("text", { x: 30, y: 586, "font-size": 16, fill: "#B0106A", text: "In real models, arrows like these point in similar directions far more often than arrows between random words." }, gArr);
      }
      s("text", { x: 846, y: 632, "text-anchor": "end", "font-size": 13, fill: MUTED, text: "Sketch: real vectors have hundreds or thousands of numbers, not two" }, m);
      return {
        update(k) {
          vec.classList.toggle("off", k < 1); vlab.classList.toggle("off", k < 1); arrow.classList.toggle("off", k < 1);
          tbl.querySelector(".hitrow").setAttribute("fill", k >= 1 ? COBALT : "#E6EAF6");
          panel.classList.toggle("off-up", k < 2);
          gIsl.style.opacity = k >= 3 ? 1 : 0;
          gArr.style.opacity = k >= 4 ? 1 : 0;
          gPts.style.opacity = k >= 4 ? 0.35 : 1;
          pos.classList.toggle("off-up", k < 5);
        },
      };
    },
  };

  /* ---------- 13. attention arcs on "bar" ---------- */
  Deck.components.AttentionArcs = {
    steps: 4,
    mount(host, ctx) {
      Deck.ministrip(ctx.slideEl, "Attention");
      const g = G(); if (!g) return {};
      const B = g.bar;
      const meanings = ["a snack", "a standard to beat"];
      const sentences = B.sentences.map((S, si) => {
        const top = si === 0 ? 120 : 400;
        const wrapEl = h("div", { class: "abs", style: { left: "0px", top: top + "px", width: "940px", height: "160px" } });
        host.appendChild(wrapEl);
        const row = h("div", { class: "chips abs", style: { left: "0px", top: "92px", flexWrap: "nowrap" } });
        S.tokens.forEach((t, i) => row.appendChild(Deck.chip(t, i)));
        wrapEl.appendChild(row);
        const arcs = svg(940, 100, wrapEl, { style: "position:absolute;left:0;top:0;width:940px;height:100px;overflow:visible" });
        const mean = h("div", { class: "abs show-on", style: { left: "0px", top: "150px", fontFamily: "var(--font-voice)", fontStyle: "italic", fontSize: "24px", color: "#B0106A" } });
        wrapEl.appendChild(mean);
        return { S, wrapEl, row, arcs, mean, si };
      });
      const sameLab = h("div", { class: "abs show-on", style: { left: "0px", top: "20px", fontSize: "20px", color: "#2A50B0", fontWeight: 600 } }, `Both " bar" tokens start as the same row of the embedding table (ID ${B.bar_id}).`);
      host.appendChild(sameLab);
      const headLab = h("div", { class: "abs show-on", style: { left: "0px", top: "20px", fontSize: "18px", color: "#5A3290" } }, `Arcs: attention from " bar" in one head. Thicker = more weight.`);
      host.appendChild(headLab);
      // similarity chart
      const panel = h("div", { class: "panel show-on", style: { left: "1000px", top: "0px", width: "472px", height: "620px" } });
      host.appendChild(panel);
      const c = svg(472, 620, panel);
      s("text", { x: 24, y: 40, "font-size": 15, "font-weight": 700, "letter-spacing": "1.5", fill: MUTED, text: "HOW SIMILAR ARE THE TWO \" BAR\" VECTORS?" }, c);
      const sims = B.bar_similarity_by_layer;
      const X = (i) => 70 + (i / (sims.length - 1)) * 370, Y = (v) => 520 - v * 440;
      [0, 0.5, 1].forEach((v) => { s("line", { x1: 70, x2: 440, y1: Y(v), y2: Y(v), stroke: "#EFE8DA" }, c); s("text", { x: 60, y: Y(v) + 5, "text-anchor": "end", "font-size": 14, fill: MUTED, text: v.toFixed(1) }, c); });
      s("text", { x: 255, y: 560, "text-anchor": "middle", "font-size": 15, fill: MUTED, text: "after layer (0 = embedding + position)" }, c);
      [0, 3, 6, 9, 12].forEach((i) => s("text", { x: X(i), y: 540, "text-anchor": "middle", "font-size": 14, fill: MUTED, text: i }, c));
      const path = s("path", { d: sims.map((v, i) => (i ? "L" : "M") + X(i) + " " + Y(v)).join(" "), fill: "none", stroke: VIOLET, "stroke-width": 3.5 }, c);
      const dots = sims.map((v, i) => s("circle", { cx: X(i), cy: Y(v), r: 4.5, fill: VIOLET }, c));
      s("text", { x: X(sims.length - 1), y: Y(sims[sims.length - 1]) - 14, "text-anchor": "end", "font-size": 17, "font-weight": 700, fill: "#5A3290", text: sims[sims.length - 1].toFixed(2) }, c);
      s("text", { x: X(0) + 8, y: Y(sims[0]) - 12, "font-size": 17, "font-weight": 700, fill: "#5A3290", text: sims[0].toFixed(2) }, c);
      const len = 2000; path.setAttribute("stroke-dasharray", len);
      function drawArcs(o, on) {
        o.arcs.innerHTML = "";
        if (!on) return;
        const chipsEl = o.row.querySelectorAll(".chip");
        const base = o.row.getBoundingClientRect ? null : null;
        const xs = Array.from(chipsEl).map((ch) => ch.offsetLeft + ch.offsetWidth / 2);
        const last = xs.length - 1;
        o.S.attn_from_bar.forEach((w, i) => {
          if (i === last || w < 0.02) return;
          const x1 = xs[i], x2 = xs[last], hgt = 30 + (x2 - x1) * 0.18;
          s("path", { d: `M${x1} 88 Q ${(x1 + x2) / 2} ${88 - hgt * 1.4} ${x2} 88`, fill: "none", stroke: VIOLET, "stroke-width": Math.max(1.5, w * 22), "stroke-linecap": "round", opacity: 0.25 + w * 0.75 }, o.arcs);
          if (w > 0.08) s("text", { x: (x1 + x2) / 2, y: 88 - hgt * 0.75 - 6, "text-anchor": "middle", "font-size": 15, fill: "#5A3290", "font-weight": 600, text: Math.round(w * 100) + "%" }, o.arcs);
        });
      }
      return {
        update(k) {
          sentences.forEach((o) => {
            const lastChip = o.row.lastChild;
            lastChip.classList.toggle("hl", k >= 1);
            drawArcs(o, k >= 2);
            o.mean.textContent = `" bar" here means ${meanings[o.si]}`;
            o.mean.classList.toggle("off", k < 4);
          });
          sameLab.classList.toggle("off", k !== 1);
          headLab.classList.toggle("off", k < 2);
          panel.classList.toggle("off-up", k < 3);
          path.setAttribute("stroke-dashoffset", k >= 3 ? 0 : len);
          path.style.transition = "stroke-dashoffset 1400ms var(--ease)";
        },
      };
    },
  };

  /* ---------- 14. query-key grid ---------- */
  Deck.components.AttentionGrid = {
    steps: 6,
    mount(host, ctx) {
      Deck.ministrip(ctx.slideEl, "Attention");
      const g = G(); if (!g) return {};
      const D = g.grid, N = D.tokens.length, cell = 48, gx = 170, gy = 110;
      const m = svg(1472, 636, host, { style: "position:absolute;left:0;top:0" });
      const sc = D.scores, wt = D.weights;
      let smin = Infinity, smax = -Infinity;
      for (let i = 0; i < N; i++) for (let j = 0; j <= i; j++) { smin = Math.min(smin, sc[i][j]); smax = Math.max(smax, sc[i][j]); }
      // labels
      const rowLab = [], colLab = [];
      D.tokens.forEach((t, i) => {
        rowLab.push(s("text", { x: gx - 14, y: gy + i * cell + cell / 2 + 6, "text-anchor": "end", "font-size": 19, class: "mono", text: t.replace(/^ /, "·") }, m));
        const tx = gx + i * cell + cell / 2;
        colLab.push(s("text", { x: 0, y: 0, "font-size": 19, class: "mono", transform: `translate(${tx + 6},${gy - 12}) rotate(-50)`, text: t.replace(/^ /, "·") }, m));
      });
      s("text", { x: gx - 14, y: gy - 60, "text-anchor": "end", "font-size": 14, "font-weight": 700, "letter-spacing": 1.5, fill: "#2A50B0", text: "QUERY (ROW)" }, m);
      s("text", { x: gx + N * cell + 10, y: gy - 60, "font-size": 14, "font-weight": 700, "letter-spacing": 1.5, fill: "#0E6F7F", text: "KEY (COLUMN)" }, m);
      const gridG = s("g", {}, m);
      const circles = [], masks = [];
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
        const cx = gx + j * cell + cell / 2, cy = gy + i * cell + cell / 2;
        s("rect", { x: gx + j * cell + 1, y: gy + i * cell + 1, width: cell - 2, height: cell - 2, fill: "#fff", stroke: "#EFE8DA" }, gridG);
        const mk = s("rect", { x: gx + j * cell + 1, y: gy + i * cell + 1, width: cell - 2, height: cell - 2, fill: "#E2DACB", opacity: 0, class: "fade" }, gridG);
        if (j > i) masks.push(mk);
        const c = s("circle", { cx, cy, r: 0, fill: VIOLET, opacity: 0.85, style: "transition: r 500ms, fill 400ms, opacity 400ms" }, gridG);
        c.dataset.i = i; c.dataset.j = j;
        circles.push(c);
      }
      // query and key bars
      const qG = s("g", { class: "fade" }, m), kG = s("g", { class: "fade" }, m);
      for (let i = 0; i < N; i++) {
        for (let b = 0; b < 4; b++) s("rect", { x: 14 + b * 9, y: gy + i * cell + 14, width: 7, height: 26, rx: 2, fill: "#2F5FD0", opacity: 0.35 + 0.15 * ((i * 7 + b * 3) % 5) }, qG);
        for (let b = 0; b < 4; b++) s("rect", { x: gx + i * cell + 9 + b * 9, y: gy + N * cell + 12, width: 7, height: 26, rx: 2, fill: "#22A6B8", opacity: 0.35 + 0.15 * ((i * 3 + b * 5) % 5) }, kG);
      }
      // side panel
      const side = h("div", { class: "panel", style: { left: "740px", top: "90px", width: "732px", height: "500px", padding: "20px 26px", fontSize: "21px", lineHeight: 1.45 } });
      host.appendChild(side);
      const lastRow = N - 1;
      const top3 = wt[lastRow].map((w, j) => ({ w, j })).sort((a, b) => b.w - a.w).slice(0, 4);
      const texts = [
        `<div class="ptitle">Three vectors per token</div><p>Each token's vector is multiplied by three learned weight matrices to make a <b style="color:#2A50B0">query</b>, a <b style="color:#0E6F7F">key</b> and a <b style="color:#5A3290">value</b>.</p>`,
        `<div class="ptitle">Queries</div><p>The <b style="color:#2A50B0">query</b> is what a position is looking for.</p>`,
        `<div class="ptitle">Keys</div><p>The <b style="color:#0E6F7F">key</b> is what a position offers to others.</p>`,
        `<div class="ptitle">Scores</div><p>Score = query · key ÷ √64. A bigger circle means a better match. Scores here range from ${smin.toFixed(1)} to ${smax.toFixed(1)}.</p>`,
        `<div class="ptitle">Mask</div><p>Positions to the right are blocked, because the model must predict each next token without seeing it.</p>`,
        `<div class="ptitle">Softmax</div><p>Each row's allowed scores become weights that add up to 1 (100%).</p>`,
        `<div class="ptitle">Weighted mix of values</div><p>The new vector for <b>" bar"</b> mixes the <b style="color:#5A3290">values</b> of earlier tokens using its row's weights:</p>` +
          top3.map((t) => `<div style="display:flex;gap:12px;align-items:center;margin:6px 0"><span style="width:60px;text-align:right;font-weight:700">${Math.round(t.w * 100)}%</span><span style="display:inline-block;height:14px;width:${t.w * 360}px;background:${VIOLET};border-radius:3px"></span><span class="mono" style="font-family:var(--font-code)">${Deck.esc(D.tokens[t.j])}</span></div>`).join("") +
          `<p style="font-size:17px;color:#5F6379;margin-top:12px">The result passes through an output projection and is added back to the token's vector.</p>`,
      ];
      let kNow = 0;
      function paint(k, hoverRow) {
        circles.forEach((c) => {
          const i = +c.dataset.i, j = +c.dataset.j;
          let r = 0, fill = VIOLET, op = 0.85;
          if (k >= 3) r = 4 + 20 * ((sc[i][j] - smin) / (smax - smin || 1));
          if (k >= 3 && j > i) { r = Math.max(0, r); op = k >= 4 ? 0 : 0.35; }
          if (k >= 5) { r = j <= i ? 3 + 22 * Math.sqrt(wt[i][j]) : 0; }
          if (k >= 6 && i !== lastRow) op = 0.18;
          if (hoverRow != null && i !== hoverRow) op = Math.min(op, 0.15);
          c.setAttribute("r", r.toFixed(1)); c.setAttribute("opacity", op); c.setAttribute("fill", fill);
        });
        masks.forEach((mk) => mk.setAttribute("opacity", k >= 4 ? 0.9 : 0));
        qG.style.opacity = k >= 1 && k < 3 ? 1 : 0; kG.style.opacity = k >= 2 && k < 3 ? 1 : 0;
        side.innerHTML = texts[Math.min(k, 6)];
      }
      m.addEventListener("mousemove", (e) => {
        if (kNow < 5) return;
        const r = m.getBoundingClientRect(), scale = r.width / 1472;
        const y = (e.clientY - r.top) / scale, row = Math.floor((y - gy) / cell);
        paint(kNow, row >= 0 && row < N ? row : null);
      });
      m.addEventListener("mouseleave", () => paint(kNow, null));
      return { update(k) { kNow = k; paint(k, null); } };
    },
  };

  /* ---------- 15. head gallery ---------- */
  Deck.components.HeadGallery = {
    steps: 1,
    mount(host, ctx) {
      Deck.ministrip(ctx.slideEl, "Attention");
      const g = G(); if (!g) return {};
      const H = g.gallery.heads.slice(0, 6), N = g.gallery.tokens.length;
      H.forEach((hd, idx) => {
        const col = idx % 3, row = Math.floor(idx / 3);
        const p = h("div", { class: "panel", style: { left: col * 492 + "px", top: row * 300 + "px", width: "470px", height: "282px" } });
        host.appendChild(p);
        const size = 210, cell = size / N;
        const sv = svg(470, 282, p);
        for (let i = 0; i < N; i++) for (let j = 0; j <= i; j++) {
          const w = hd.weights[i][j];
          s("rect", { x: 18 + j * cell, y: 50 + i * cell, width: cell + 0.3, height: cell + 0.3, fill: VIOLET, opacity: Math.min(1, w * 1.6) }, sv);
        }
        s("rect", { x: 18, y: 50, width: size, height: size, fill: "none", stroke: RULE }, sv);
        s("text", { x: 18, y: 32, "font-size": 14, "font-weight": 700, "letter-spacing": 1.2, fill: MUTED, text: `HEAD ${idx + 1}` }, sv);
        (hd.focus || []).forEach(([i, j]) => s("rect", { x: 18 + j * cell - 1.5, y: 50 + i * cell - 1.5, width: cell + 3, height: cell + 3, fill: MAGENTA, stroke: INK, "stroke-width": 1.2 }, sv));
        const fo = h("div", { class: "abs", style: { left: "250px", top: "54px", width: "200px", fontSize: "21px", fontWeight: 600, lineHeight: 1.3 } }, hd.label,
          hd.note ? h("div", { style: { fontSize: "16px", fontWeight: 400, color: "#B0106A", marginTop: "10px" } }, hd.note) : null);
        p.appendChild(fo);
      });
      const fact = h("div", { class: "abs show-on", style: { left: "0px", top: "606px", fontSize: "20px", color: "#4A4F6E" } },
        `Each panel: rows = the token looking, columns = the token looked at, darker = more weight. Sentence: "${g.gallery.text}"`);
      host.appendChild(fact);
      return { update(k) {} };
    },
  };

  /* ---------- 16. feed-forward (teaching picture) ---------- */
  Deck.components.FeedForward = {
    steps: 4,
    mount(host, ctx) {
      Deck.ministrip(ctx.slideEl, "Feed-forward");
      const qs = [["A vehicle?", 0.92], ["Expensive?", 0.81], ["A sports car?", 0.88], ["Given away in videos?", 0.57], ["Apparently eligible to be destroyed for content?", 0.38], ["A kind of fruit?", 0.02], ["A verb?", 0.04]];
      const chips = h("div", { class: "chips abs", style: { left: "0px", top: "10px" } });
      ["Lam", "borgh", "ini"].forEach((t, i) => { const c = Deck.chip((i ? "" : " ") + t, i); if (i === 2) c.classList.add("hl"); chips.appendChild(c); });
      host.appendChild(chips);
      host.appendChild(h("div", { class: "abs", style: { left: "0px", top: "70px", fontSize: "17px", color: "#4A4F6E", width: "300px" } }, `Vector at the last piece, "ini", after attention has mixed in "Lam" and "borgh".`));
      const vals = [0.41, -1.2, 0.07, 2.3, -0.66, 0.98, -0.15, 1.4];
      const vec = h("div", { class: "vec", style: { left: "60px", top: "160px" } });
      const spans = vals.map((v) => { const sp = h("span", {}, (v >= 0 ? "+" : "") + v.toFixed(2)); vec.appendChild(sp); return sp; });
      vec.appendChild(h("span", {}, "⋮"));
      host.appendChild(vec);
      const sv = svg(1472, 636, host, { style: "position:absolute;left:0;top:0;pointer-events:none" });
      const neurons = qs.map(([q, a], i) => {
        const y = 40 + i * 82;
        const ln = s("line", { x1: 170, y1: 330, x2: 520, y2: y + 26, stroke: RULE, "stroke-width": 2 }, sv);
        const back = s("path", { d: `M560 ${y + 26} C 380 ${y + 60}, 260 ${y + 80}, 170 ${330 + (i - 3) * 6}`, fill: "none", stroke: COBALT, "stroke-width": 3, opacity: 0, class: "fade" }, sv);
        const node = h("div", { class: "abs", style: { left: "500px", top: y + "px", display: "flex", alignItems: "center", gap: "16px" } },
          h("div", { style: { width: "52px", height: "52px", borderRadius: "50%", border: "3px solid " + VIOLET, background: "#fff", transition: "background 500ms" } }),
          h("div", { style: { fontSize: "23px", width: "520px" } }, q),
          h("div", { style: { width: "0px", height: "16px", background: VIOLET, borderRadius: "3px", transition: "width 600ms var(--ease)" } }));
        host.appendChild(node);
        return { q, a, ln, back, node, dot: node.children[0], bar: node.children[2] };
      });
      return {
        update(k) {
          neurons.forEach((n) => {
            n.node.style.opacity = k >= 1 ? 1 : 0;
            n.ln.setAttribute("stroke", k >= 1 ? "#CFC3E2" : "transparent");
            const on = k >= 2 && n.a > 0.3;
            n.dot.style.background = k >= 2 ? `rgba(107,63,160,${n.a})` : "#fff";
            n.bar.style.width = k >= 2 ? n.a * 220 + "px" : "0px";
            n.back.style.opacity = k >= 3 && on ? 0.6 : 0;
          });
          const delta = [0.3, 0.2, -0.4, 0.5, 0.1, -0.3, 0.6, -0.2];
          spans.forEach((sp, i) => { const v = vals[i] + (k >= 3 ? delta[i] : 0); sp.textContent = (v >= 0 ? "+" : "") + v.toFixed(2); sp.style.color = k >= 3 ? COBALT : ""; sp.style.fontWeight = k >= 3 ? 700 : 400; });
        },
      };
    },
  };

  /* ---------- 17. unembedding + GPT-3 parameter bar ---------- */
  Deck.components.Unembed = {
    steps: 4,
    mount(host, ctx) {
      Deck.ministrip(ctx.slideEl, "Output");
      const g = G(); if (!g) return {};
      const D = g[ctx.fm.dataset || "last_person"];
      const top = D.top.slice(0, 6);
      host.appendChild(h("div", { class: "abs", style: { left: "0px", top: "0px", fontSize: "20px", color: "#4A4F6E" } }, h("b", { style: { color: INK } }, `"${D.prompt}"`), " · vector at the last position"));
      const vec = h("div", { class: "vec", style: { left: "40px", top: "50px" } });
      [0.12, -2.3, 0.8, 1.7, -0.4, "⋮"].forEach((v) => vec.appendChild(h("span", {}, typeof v === "number" ? (v >= 0 ? "+" : "") + v.toFixed(2) : v)));
      host.appendChild(vec);
      const scores = h("div", { class: "abs show-on", style: { left: "220px", top: "46px", width: "420px", fontSize: "20px" } });
      scores.appendChild(h("div", { class: "ptitle", style: { marginBottom: "6px" } }, "Score for every token (one dot product each)"));
      top.forEach((r) => scores.appendChild(h("div", { style: { display: "flex", justifyContent: "space-between", fontFamily: "var(--font-code)", padding: "3px 0", borderBottom: "1px solid #E2DACB" } }, h("span", { html: Deck.tokHTML(r.t) }), h("span", {}, r.z.toFixed(1)))));
      scores.appendChild(h("div", { style: { color: MUTED, fontSize: "17px", marginTop: "4px" } }, `… ${Deck.fmt(g.vocab_size - 6)} more`));
      host.appendChild(scores);
      const arrow = h("div", { class: "abs show-on", style: { left: "665px", top: "130px", fontSize: "20px", color: MUTED, textAlign: "center", width: "110px" } }, "softmax", h("div", { style: { fontSize: "40px" } }, "→"));
      host.appendChild(arrow);
      const bars = Deck.barList(host, 790, 70, 6, { rowH: 40, maxW: 420 });
      // parameter bar
      const P = g.gpt3_params;
      const pb = h("div", { class: "abs show-on", style: { left: "0px", top: "350px", width: "1472px", height: "280px" } });
      host.appendChild(pb);
      pb.appendChild(h("div", { class: "ptitle", style: { fontSize: "15px" } }, `Where GPT-3's numbers sit (about ${(P.total / 1e9).toFixed(1)} billion counted this way; reported as 175 billion)`));
      const total = P.total, W = 900;
      const parts = [["Feed-forward", P.feedforward, VIOLET, "#fff"], ["Attention", P.attention, "#9B7BC6", "#fff"], ["Token and position embeddings", P.embedding + P.position, MARIGOLD, INK]];
      let x = 0;
      const segs = parts.map(([name, n, col, tc]) => {
        const w = (n / total) * W;
        const seg = h("div", { class: "abs", style: { left: x + "px", top: "40px", width: Math.max(w, 6) + "px", height: "120px", background: col, borderRight: "2px solid #FBF7EF", overflow: "hidden" } });
        pb.appendChild(seg);
        const big = w > 200;
        const lab = h("div", { class: "abs", style: { left: (big ? x : W + 14) + "px", top: big ? "170px" : "-6px", width: big ? w - 10 + "px" : "300px", color: INK, fontSize: "19px", lineHeight: 1.3, borderLeft: "4px solid " + col, paddingLeft: "8px" } },
          h("b", {}, name), h("br"), `${Deck.fmt(n)} (${n / total < 0.01 ? "under 1%" : Math.round((n / total) * 100) + "%"})`);
        pb.appendChild(lab);
        x += w;
        return seg;
      });
      const dials = svg(W, 120, pb, { style: `position:absolute;left:0;top:40px;width:${W}px;height:120px;pointer-events:none` });
      for (let i = 0; i < W; i += 16) for (let j = 0; j < 120; j += 16) s("circle", { cx: i + 8, cy: j + 8, r: 5, fill: "none", stroke: "rgba(255,255,255,.55)", "stroke-width": 1.5 }, dials);
      dials.style.transition = "opacity 700ms";
      return {
        update(k) {
          scores.classList.toggle("off", k < 1);
          arrow.classList.toggle("off", k < 2);
          if (k >= 2) bars.set(top.map((r) => ({ t: r.t, p: r.p })), top[0].p, null); else bars.zero();
          bars.el.style.opacity = k >= 2 ? 1 : 0;
          pb.classList.toggle("off-up", k < 3);
          dials.style.opacity = k >= 4 ? 1 : 0;
        },
      };
    },
  };
})();
