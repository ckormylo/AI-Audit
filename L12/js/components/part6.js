/* Part 5 of the lecture: from model to chatbot, plus the close slide */
(function () {
  const { h, s, svg } = Deck;
  const INK = "#232748", MUTED = "#5F6379", RULE = "#E2DACB", VERM = "#E8431F", MAGENTA = "#D6177F", COBALT = "#2F5FD0", VIOLET = "#6B3FA0", LEAF = "#45731A", TEAL = "#0E6F7F", MARI = "#8F5A00";

  /* ---------- what the model actually sees ---------- */
  Deck.components.ContextWindow = {
    steps: 5,
    mount(host, ctx) {
      const fm = ctx.fm;
      const c = Deck.chatCard({ x: 0, y: 0, w: 470, h: 630, label: "Hypothetical classroom case" });
      host.appendChild(c.card);
      c.msgs.append(h("div", { class: "bubble fan", style: { fontSize: "18px" } }, fm.fan), h("div", { class: "bubble bot", style: { fontSize: "18px" } }, fm.bot));
      const panel = h("div", { class: "panel", style: { left: "510px", top: "0px", width: "962px", height: "556px", padding: "14px 18px", overflow: "hidden" } });
      panel.appendChild(h("div", { class: "ptitle", style: { marginBottom: "8px" } }, "What the model receives: one strip of tokens"));
      const col = h("div", { style: { display: "flex", flexDirection: "column", gap: "8px" } });
      panel.appendChild(col);
      host.appendChild(panel);
      const segs = [
        [1, "Persona instructions", VIOLET, fm.sys_persona],
        [2, "Engagement and promotion instructions", MAGENTA, fm.sys_promo],
        [3, "Limits", LEAF, fm.sys_limits],
        [4, "Retrieved: archived campaign brief", MARI, fm.brief_old],
        [4, "Retrieved: current campaign brief", MARI, fm.brief_new],
        [5, "Memory and conversation", TEAL, fm.memory + "\nUser: " + fm.fan + "\nAssistant:"],
      ];
      let total = 0;
      const segEls = segs.map(([at, label, color, text]) => {
        const box = h("div", { class: "show-on", style: { borderLeft: `4px solid ${color}`, paddingLeft: "10px" } });
        box.appendChild(h("div", { class: "seg-label", style: { position: "static", color, marginBottom: "3px" } }, label));
        const row = h("div", { class: "chips", style: { gap: "3px 2px" } });
        if (at === 1) { const av = h("span", { class: "chip", style: { padding: "2px 4px", background: "#fff" } }); av.appendChild(h("img", { src: "assets/mrfeast-avatar.jpg", style: { width: "26px", height: "26px", borderRadius: "50%", display: "block" } })); row.appendChild(av); av.classList.add("avchip"); }
        const toks = Deck.bpe.encode(text || "") || [];
        toks.forEach((t, i) => { const ch = Deck.chip(t.text, i); ch.style.fontSize = "14px"; ch.style.padding = "1px 3px"; ch.style.borderRadius = "4px"; row.appendChild(ch); });
        box.appendChild(row);
        col.appendChild(box);
        return { at, box, n: toks.length };
      });
      // flying avatar
      const fly = h("img", { src: "assets/mrfeast-avatar.jpg", class: "abs", style: { left: "18px", top: "14px", width: "54px", height: "54px", borderRadius: "50%", transition: "all 900ms var(--ease)", zIndex: 5, opacity: 0 } });
      host.appendChild(fly);
      const gauge = h("div", { class: "abs", style: { left: "510px", top: "570px", width: "962px", height: "60px" } });
      host.appendChild(gauge);
      return {
        update(k, animate) {
          let used = 0;
          segEls.forEach((sg) => { const on = k >= sg.at; sg.box.classList.toggle("off-up", !on); sg.box.style.display = on || ctx.print ? "" : "none"; if (on) used += sg.n; });
          const av = panel.querySelector(".avchip");
          if (k === 1 && animate) {
            av.style.visibility = "hidden";
            Object.assign(fly.style, { left: "18px", top: "14px", width: "54px", height: "54px", opacity: 1 });
            requestAnimationFrame(() => requestAnimationFrame(() => {
              const r = av.getBoundingClientRect(), hr = host.getBoundingClientRect(), sc = hr.width / host.offsetWidth;
              Object.assign(fly.style, { left: (r.left - hr.left) / sc + 4 + "px", top: (r.top - hr.top) / sc + 2 + "px", width: "26px", height: "26px" });
              setTimeout(() => { fly.style.opacity = 0; av.style.visibility = "visible"; }, 950);
            }));
          } else { fly.style.opacity = 0; if (av) av.style.visibility = "visible"; }
          c.avatar.style.opacity = k >= 1 ? 0.35 : 1;
          const win = 2048;
          gauge.innerHTML = k >= 5 ? `<div style="display:flex;align-items:center;gap:14px;font-size:18px"><div style="flex:1;height:22px;border-radius:6px;background:#fff;border:1.5px solid ${INK};overflow:hidden;display:flex">
            <div style="width:${(used / win) * 100}%;background:${TEAL}"></div><div style="flex:1"></div><div style="width:${(256 / win) * 100}%;background:repeating-linear-gradient(45deg,#F6EBCF,#F6EBCF 6px,#fff 6px,#fff 12px);border-left:1.5px solid ${INK}"></div></div>
            <div style="width:430px">This prompt: <b>${used}</b> tokens. GPT-3's window: <b>2,048</b>, with room kept for the reply.</div></div>` : "";
        },
      };
    },
  };

  /* ---------- why a fluent answer can be wrong ---------- */
  Deck.components.Evidence = {
    steps: 5,
    mount(host, ctx) {
      const fm = ctx.fm;
      const bub = h("div", { class: "abs", style: { left: "0px", top: "0px", width: "880px", display: "flex", gap: "14px", alignItems: "flex-start" } },
        h("img", { src: "assets/mrfeast-avatar.jpg", style: { width: "56px", height: "56px", borderRadius: "50%" } }),
        h("div", { class: "bubble bot", style: { maxWidth: "800px", fontSize: "22px" } }));
      const text = Deck.esc(fm.bot || "");
      bub.lastChild.innerHTML = text.replace(fm.hl1, `<mark class="hl hloff" data-k="1">${Deck.esc(fm.hl1)}</mark>`).replace(fm.hl2, `<mark class="hl hloff" data-k="2">${Deck.esc(fm.hl2)}</mark>`);
      host.appendChild(bub);
      const tags = h("div", { class: "abs show-on", style: { left: "70px", top: "175px", display: "flex", gap: "12px", fontSize: "18px" } },
        h("span", { class: "pill", style: { background: "#FBE0D8", cursor: "default" } }, "\"Double it\": ignores the $100 budget (instruction failure)"),
        h("span", { class: "pill", style: { background: "#FBE0D8", cursor: "default" } }, "The code: a factual claim"));
      host.appendChild(tags);
      const ev = (fm.ev || []).map((l, i) => {
        const [title, body] = l.split("|").map((x) => x.trim());
        const el = h("div", { class: "ev-card show-on", style: `left:920px;top:${i * 92}px;width:552px;height:84px;--b:${COBALT};font-size:18px;padding:10px 16px` }, h("div", { class: "h", style: { color: "#2A50B0" } }, title), body);
        host.appendChild(el); return el;
      });
      const srcs = (fm.src || []).map((l, i) => {
        const [title, body, col] = l.split("|").map((x) => x.trim());
        const el = h("div", { class: "ev-card show-on", style: `left:${i * 372}px;top:290px;width:356px;height:150px;--b:var(--${col || "violet"});font-size:18px` }, h("div", { class: "h" }, title), body);
        host.appendChild(el); return el;
      });
      const q = h("div", { class: "q-card show-on", style: { left: "0px", top: "462px", width: "1472px", fontSize: "26px", padding: "14px 24px" } }, fm.question || "");
      const nx = h("div", { class: "ev-card show-on", style: `left:0px;top:548px;width:1472px;height:82px;--b:${LEAF};font-size:20px` }, h("div", { class: "h", style: { color: LEAF } }, "Next audit steps"), fm.next || "");
      host.append(q, nx);
      return {
        update(k) {
          host.querySelectorAll("mark.hl").forEach((m) => m.classList.toggle("hloff", k < 1));
          tags.classList.toggle("off-up", k < 1);
          ev.forEach((e) => e.classList.toggle("off-up", k < 2));
          srcs.forEach((e) => e.classList.toggle("off-up", k < 3));
          q.classList.toggle("off-up", k < 4);
          nx.classList.toggle("off-up", k < 5);
        },
      };
    },
  };

  /* ---------- what an auditor can observe ---------- */
  Deck.components.ObserveTable = {
    steps: 0,
    mount(host, ctx) {
      const t = h("table", { class: "obs-table" });
      t.innerHTML = "<tr><th>Part of the system</th><th>Usual access for the app's auditor</th><th>Evidence to request</th></tr>" +
        (ctx.fm.row || []).map((r) => { const c = r.split("|").map((x) => x.trim()); const hi = /^(usually|yes)/i.test(c[1]); return `<tr class="${hi ? "hi" : ""}"><td>${Deck.inline(c[0])}</td><td class="acc" style="color:${hi ? LEAF : "#BF3417"}">${Deck.inline(c[1])}</td><td>${Deck.inline(c[2])}</td></tr>`; }).join("");
      host.appendChild(t);
      return {};
    },
  };

  /* ---------- close ---------- */
  Deck.components.Close = {
    steps: 0,
    mount(host, ctx) {
      const fm = ctx.fm;
      const chain = (fm.chain || []).map((l) => l.split("|").map((x) => x.trim()));
      const cols = ["cobalt", "chartreuse", "cobalt", "vermilion"];
      chain.forEach(([t, b], i) => {
        host.appendChild(h("div", { class: "ev-card", style: `left:${64 + i * 372}px;top:160px;width:340px;height:132px;--b:var(--${cols[i]});font-size:18px` }, h("div", { class: "h" }, t), b));
        if (i < chain.length - 1) host.appendChild(h("div", { class: "abs", style: { left: 64 + i * 372 + 342 + "px", top: "200px", fontSize: "28px", color: MUTED } }, "→"));
      });
      if (fm.takeaway) host.appendChild(h("div", { class: "abs", style: { left: "64px", top: "312px", width: "1472px", fontFamily: "var(--font-voice)", fontStyle: "italic", fontSize: "25px", color: "#4A4F6E" } }, fm.takeaway));
      const next = h("div", { class: "abs", style: { left: "64px", top: "380px", width: "620px" } },
        h("div", { class: "lbl-caps", style: { color: "#B0106A", marginBottom: "8px" } }, "Next session"),
        h("div", { style: { fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "34px" } }, fm.next || ""),
        h("div", { style: { fontSize: "22px", color: "#4A4F6E", marginTop: "6px" } }, fm.when || ""));
      const read = h("div", { class: "abs", style: { left: "760px", top: "380px", width: "776px" } }, h("div", { class: "lbl-caps", style: { color: "#5A3290", marginBottom: "8px" } }, "Read first"));
      (fm.read || []).forEach((r) => read.appendChild(h("div", { style: { fontSize: "20px", padding: "6px 0", borderBottom: "1px solid " + RULE }, html: Deck.inline(r) })));
      host.append(next, read);
      const seeds = h("div", { class: "seeds", style: { left: "64px", bottom: "64px", gap: "18px" } });
      const cur = +(fm.lecture || 12);
      for (let i = 1; i <= 18; i++) seeds.appendChild(h("i", { class: i < cur ? "done" : i === cur ? "now" : "", title: "L" + i, style: { width: "18px", height: "18px" } }));
      host.appendChild(seeds);
      host.appendChild(h("div", { class: "abs", style: { left: "64px", bottom: "34px", fontSize: "14px", color: MUTED } }, `Course progress: lecture ${cur} of 18`));
      return {};
    },
  };
})();
