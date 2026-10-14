/* Part 1 of the lecture: next-token bars, generation loop, temperature lab */
(function () {
  const { h } = Deck;
  const G = () => (window.DECK_DATA && window.DECK_DATA.ex) || null;
  const missing = (host) => host.appendChild(h("div", { class: "abs", style: { left: 0, top: "200px", fontSize: "24px", color: "#BF3417" } }, "Example numbers not loaded (data/examples.js). Run scripts/build_examples.py."));

  /* bar list: rows = [{t, p}], returns {el, set(rows, maxP, chosenIndex)} */
  function barList(parent, x, y, n, opts) {
    opts = opts || {};
    const rowH = opts.rowH || 40, maxW = opts.maxW || 560;
    const el = h("div", { class: "bars", style: { left: x + "px", top: y + "px" } });
    const rows = [];
    for (let i = 0; i < n; i++) {
      const r = h("div", { class: "bar-row", style: { top: i * rowH + "px" } }, h("div", { class: "w" }), h("div", { class: "b", style: { width: "0px" } }), h("div", { class: "v" }));
      el.appendChild(r); rows.push(r);
    }
    parent.appendChild(el);
    return {
      el, rows,
      set(data, maxP, chosen, digits) {
        rows.forEach((r, i) => {
          const d = data[i];
          if (!d) { r.style.opacity = 0; return; }
          r.style.opacity = 1;
          r.children[0].innerHTML = Deck.tokHTML(d.t);
          r.children[1].style.width = Math.max(2, (d.p / maxP) * maxW) + "px";
          r.children[2].textContent = Deck.pct(d.p, digits == null ? 1 : digits);
          r.classList.toggle("chosen", chosen === i);
        });
      },
      zero() { rows.forEach((r) => { r.children[1].style.width = "0px"; r.children[2].textContent = ""; }); },
    };
  }
  Deck.barList = barList;

  /* ---------- An LLM predicts the next token ---------- */
  Deck.components.NextTokenBars = {
    steps: 5,
    mount(host, ctx) {
      const g = G(); if (!g) return missing(host), {};
      const D = g[ctx.fm.dataset || "last_person"];
      const prompt = h("div", { class: "ntb-prompt", style: { left: "0px", top: "20px" } }, D.prompt, h("span", { class: "blank" }));
      host.appendChild(prompt);
      const chips = h("div", { class: "chips abs show-on", style: { left: "0px", top: "100px", width: "520px" } });
      D.tokens.forEach((t, i) => chips.appendChild(Deck.chip(t, i, { id: D.ids[i] })));
      host.appendChild(chips);
      const arrow = h("div", { class: "abs show-on", style: { left: "200px", top: "190px", fontSize: "44px", color: "#5F6379" } }, "↓");
      host.appendChild(arrow);
      const box = h("div", { class: "model-box show-on", style: { left: "40px", top: "260px", width: "380px", height: "190px" } }, h("div", {}, "Large language model", h("div", { style: { fontSize: "17px", fontWeight: 400, marginTop: "8px", opacity: 0.9 } }, "Billions of numbers set by training")));
      host.appendChild(box);
      const toBars = h("div", { class: "abs show-on", style: { left: "470px", top: "320px", fontSize: "44px", color: "#5F6379" } }, "→");
      host.appendChild(toBars);
      const top = D.top.slice(0, 12);
      const bars = barList(host, 600, 0, 12, { rowH: 41, maxW: 520 });
      const tail = h("div", { class: "abs show-on", style: { left: "600px", top: "505px", width: "870px" } });
      const strip = Deck.svg(870, 50, tail);
      for (let k = 0; k < 290; k++) {
        const v = Math.max(1, 34 * Math.exp(-k / 26));
        Deck.s("rect", { x: k * 3, y: 46 - v, width: 2, height: v, fill: "#F4A51C", opacity: 0.85 }, strip);
      }
      const rest = 1 - top.reduce((a, r) => a + r.p, 0);
      tail.appendChild(h("div", { style: { fontSize: "21px", marginTop: "10px", color: "#4A4F6E" } },
        h("b", { style: { color: "#232748" } }, Deck.fmt(g.vocab_size) + " tokens"), ` in the vocabulary (GPT-2's size). The other ${Deck.fmt(g.vocab_size - 12)} share ${Deck.pct(rest, 0)} of the probability.`));
      host.appendChild(tail);
      return {
        update(k) {
          chips.classList.toggle("off-up", k < 1);
          arrow.classList.toggle("off", k < 1);
          box.classList.toggle("off-up", k < 2);
          toBars.classList.toggle("off", k < 3);
          if (k >= 3) bars.set(top, top[0].p, null); else bars.zero();
          bars.el.style.opacity = k >= 3 ? 1 : 0;
          tail.classList.toggle("off-up", k < 4);
        },
      };
    },
  };

  /* ---------- Generating a reply one token at a time ---------- */
  Deck.components.GenerationLoop = {
    steps: 5,
    mount(host, ctx) {
      const g = G(); if (!g) return missing(host), {};
      const P = g.gen_loop;
      const steps = P.steps;
      const line = h("div", { class: "textline", style: { left: "0px", top: "10px", width: "1472px" } });
      host.appendChild(line);
      const counter = h("div", { class: "counter", style: { right: "0px", top: "120px" } }, "Generation step", h("b", {}, "0"));
      host.appendChild(counter);
      const box = h("div", { class: "model-box", style: { left: "0px", top: "210px", width: "330px", height: "170px" } }, "Large language model");
      host.appendChild(box);
      const arrow = h("div", { class: "abs", style: { left: "380px", top: "260px", fontSize: "44px", color: "#5F6379" } }, "→");
      host.appendChild(arrow);
      const bars = barList(host, 480, 170, 8, { rowH: 46, maxW: 480 });
      const loopNote = h("div", { class: "abs", style: { left: "0px", top: "420px", width: "400px", fontSize: "20px", color: "#4A4F6E", lineHeight: 1.4 } },
        "Chosen token (pink) is added to the end of the text. Then the whole text goes back in.");
      host.appendChild(loopNote);
      let timer = null;
      function render(n, flash) {
        // n = number of generated tokens shown
        line.innerHTML = "";
        line.appendChild(h("span", { style: { fontWeight: 600 } }, P.prompt));
        for (let i = 0; i < n; i++) {
          const sp = h("span", { class: "tk" + (flash && i === n - 1 ? " new" : "") });
          sp.textContent = steps[i].chosen.t;
          line.appendChild(sp);
        }
        counter.querySelector("b").textContent = String(n);
      }
      function showStep(i) {
        if (i >= steps.length) i = steps.length - 1;
        bars.el.style.opacity = 1;
        const st = steps[i];
        const ci = st.top.findIndex((r) => r.id === st.chosen.id);
        const rows = st.top.slice(0, 8);
        if (ci < 0 || ci >= 8) rows[7] = { t: st.chosen.t, p: st.chosen.p };
        bars.set(rows, st.top[0].p, ci >= 0 && ci < 8 ? ci : 7);
        counter.querySelector("b").textContent = String(i + 1);
      }
      return {
        update(k, animate) {
          clearInterval(timer);
          if (k === 0) { render(0); bars.el.style.opacity = 0; return; }
          if (k <= 3) { render(k - 1, k > 1); showStep(k - 1); return; }
          if (k === 4 && animate) {
            let n = 3;
            render(n, true); showStep(n);
            timer = setInterval(() => {
              n++; render(n, true); showStep(n);
              if (n >= steps.length) clearInterval(timer);
            }, 520);
            return;
          }
          render(steps.length, false); showStep(steps.length);
        },
        destroy() { clearInterval(timer); },
      };
    },
  };

  /* ---------- Temperature and sampling ---------- */
  Deck.components.TemperatureLab = {
    steps: 5,
    mount(host, ctx) {
      const g = G(); if (!g) return missing(host), {};
      const D = g.temperature;
      const z = new Float64Array(D.head.length + D.tail.n);
      D.head.forEach((r, i) => (z[i] = r.z));
      for (let i = 0; i < D.tail.n; i++) z[D.head.length + i] = D.tail.z0 - D.tail.a * Math.log(1 + i / D.tail.k);
      const order = Array.from(z.keys()).sort((a, b) => z[b] - z[a]);
      const top = order.slice(0, 12);
      const prompt = h("div", { class: "ntb-prompt", style: { left: "0px", top: "0px", fontSize: "32px" } }, D.prompt, h("span", { class: "blank" }));
      host.appendChild(prompt);
      const ctrl = h("div", { class: "tl-ctrl", style: { left: "0px", top: "70px" } });
      const range = h("input", { type: "range", min: 0, max: 2, step: 0.05, value: 1 });
      const tval = h("span", { class: "val" }, "1.0");
      const tp = h("label", { style: { marginLeft: "26px", display: "flex", gap: "8px", alignItems: "center" } }, h("input", { type: "checkbox" }), "Top-p 0.9");
      ctrl.append(h("span", { style: { fontWeight: 600 } }, "Temperature"), range, tval, tp);
      host.appendChild(ctrl);
      const bars = barList(host, 0, 130, 12, { rowH: 38, maxW: 330 });
      const tailNote = h("div", { class: "abs", style: { left: "0px", top: "600px", fontSize: "18px", color: "#4A4F6E" } });
      host.appendChild(tailNote);
      const panel = h("div", { class: "panel", style: { left: "720px", top: "0px", width: "752px", height: "400px", padding: "16px 20px" } });
      const ptitle = h("div", { class: "ptitle" });
      const list = h("div", { class: "gen-list", style: { left: "20px", right: "20px", top: "50px", bottom: "14px" } });
      panel.append(ptitle, list);
      host.appendChild(panel);
      const words = D.head.map((r) => r.t);
      let T = 1, useTP = false;
      function draw() {
        const p = new Float64Array(z.length);
        if (T <= 0.001) { p[order[0]] = 1; }
        else {
          let m = -Infinity; for (let i = 0; i < z.length; i++) if (z[i] / T > m) m = z[i] / T;
          let sum = 0; for (let i = 0; i < z.length; i++) { p[i] = Math.exp(z[i] / T - m); sum += p[i]; }
          for (let i = 0; i < z.length; i++) p[i] /= sum;
        }
        let kept = z.length;
        if (useTP && T > 0.001) {
          let c = 0, j = 0;
          for (; j < order.length; j++) { c += p[order[j]]; if (c >= 0.9) break; }
          kept = j + 1;
          const keep = new Set(order.slice(0, kept));
          let sum = 0; for (let i = 0; i < z.length; i++) { if (!keep.has(i)) p[i] = 0; sum += p[i]; }
          for (let i = 0; i < z.length; i++) p[i] /= sum;
        }
        const rows = top.map((i) => ({ t: words[i], p: p[i] }));
        bars.set(rows, Math.max(rows[0].p, 0.0001), null, rows[0].p > 0.995 ? 0 : 1);
        const shown = rows.reduce((a, r) => a + r.p, 0);
        tailNote.innerHTML = `The other ${Deck.fmt(z.length - 12)} tokens share <b>${Deck.pct(Math.max(0, 1 - shown), 1)}</b>` + (useTP && T > 0.001 ? ` · top-p keeps <b>${Deck.fmt(kept)}</b> tokens` : "");
        tval.textContent = T.toFixed(2).replace(/0$/, "");
      }
      function setGens(name) {
        const gens = D.generations[name] || [];
        ptitle.textContent = `Example replies · ${name}` + (gens.length > 1 ? ` · ${gens.length} runs` : " · every run is the same");
        list.innerHTML = "";
        gens.forEach((gg) => list.appendChild(h("div", { class: "g" }, h("span", { class: "p" }, "…I should"), gg)));
      }
      const presets = [null, [0, false, "T=0"], [0.7, false, "T=0.7"], [1.6, false, "T=1.6"], [2.0, false, "T=2.0"], [1.6, true, "T=1.6, top-p 0.9"]];
      range.addEventListener("input", () => {
        T = +range.value; draw();
        const names = Object.keys(D.generations).filter((n) => /^T=[\d.]+$/.test(n));
        const best = names.reduce((a, n) => (Math.abs(+n.slice(2) - T) < Math.abs(+a.slice(2) - T) ? n : a), names[0]);
        setGens(useTP && D.generations[best + ", top-p 0.9"] ? best + ", top-p 0.9" : best);
      });
      tp.querySelector("input").addEventListener("change", (e) => { useTP = e.target.checked; range.dispatchEvent(new Event("input")); });
      return {
        update(k) {
          const pr = presets[k] || [1, false, "T=1.2"];
          if (k === 0) { T = 1; useTP = false; setGens("T=1.2"); }
          else { T = pr[0]; useTP = pr[1]; setGens(pr[2]); }
          range.value = T; tp.querySelector("input").checked = useTP;
          draw();
          panel.style.opacity = k === 0 ? 0 : 1;
        },
      };
    },
  };
})();
