/* Title loop, agenda, opening chat (slides 1-3) + shared chat card */
(function () {
  const { h, s, svg } = Deck;

  /* ---------- shared: the MrFeast AI chat card ---------- */
  Deck.chatCard = function (opts) {
    const card = h("div", { class: "chat", style: { left: opts.x + "px", top: opts.y + "px", width: opts.w + "px", height: opts.h + "px" } });
    const head = h("div", { class: "head" },
      h("img", { src: "assets/mrfeast-avatar.jpg", alt: "MrFeast AI profile photo (AI-generated, fictional person)" }),
      h("div", {}, h("div", { class: "nm" }, opts.name || "MrFeast AI"), opts.label ? h("div", { class: "lbl" }, opts.label) : null));
    const msgs = h("div", { class: "msgs" });
    card.append(head, msgs);
    return { card, head, msgs, avatar: head.querySelector("img") };
  };

  /* ---------- decorative petal cluster (Flourish motif, edges only) ---------- */
  Deck.petals = function (parent, x, y, scale, seed) {
    const g = svg(400, 400, parent, { style: `position:absolute;left:${x}px;top:${y}px;width:${400 * scale}px;height:${400 * scale}px;overflow:visible` });
    const cols = ["#D6177F", "#E8431F", "#F4A51C", "#A9C93A", "#22A6B8", "#2F5FD0", "#6B3FA0"];
    let r = seed || 3;
    const rnd = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
    for (let k = 0; k < 7; k++) {
      const a = (k / 7) * Math.PI * 2 + rnd() * 0.4, d = 70 + rnd() * 60;
      const cx = 200 + Math.cos(a) * d, cy = 200 + Math.sin(a) * d;
      const e = s("ellipse", { cx, cy, rx: 46 + rnd() * 20, ry: 24 + rnd() * 10, fill: cols[(k + (seed || 0)) % 7], stroke: "#232748", "stroke-width": 2.2, transform: `rotate(${(a * 180) / Math.PI} ${cx} ${cy})`, opacity: 0.95 }, g);
      for (let j = 0; j < 3; j++) s("circle", { cx: cx + (rnd() - 0.5) * 30, cy: cy + (rnd() - 0.5) * 14, r: 3, fill: "#FBF7EF" }, g);
    }
    s("circle", { cx: 200, cy: 200, r: 34, fill: "#F6EBCF", stroke: "#232748", "stroke-width": 2.2 }, g);
    for (let j = 0; j < 9; j++) s("circle", { cx: 200 + Math.cos(j) * 16, cy: 200 + Math.sin(j) * 16, r: 3.2, fill: "#6B3FA0" }, g);
    return g;
  };

  /* ---------- 1. title loop ---------- */
  Deck.components.TitleLoop = {
    steps: 0,
    mount(host, ctx) {
      const fm = ctx.fm;
      Deck.petals(host, -190, -190, 0.9, 1);
      Deck.petals(host, 820, 640, 0.7, 4);
      const c = Deck.chatCard({ x: 110, y: 120, w: 540, h: 330, label: "Hypothetical classroom case" });
      host.appendChild(c.card);
      const fan = h("div", { class: "bubble fan" }, fm.fan);
      const bot = h("div", { class: "bubble bot" }, "");
      c.msgs.append(fan, bot);
      const toks = (Deck.bpe.encode(fm.fan) || fm.fan.split(/(?= )/).map((t) => ({ text: t }))).slice(0, 12);
      const row = h("div", { class: "chips abs", style: { left: "110px", top: "500px", width: "560px" } });
      toks.forEach((t, i) => row.appendChild(Deck.chip(t.text, i)));
      host.appendChild(row);
      // layer stack
      const stack = h("div", { class: "abs", style: { left: "740px", top: "150px", width: "230px", height: "300px" } });
      const layers = [];
      for (let k = 0; k < 6; k++) {
        const L = h("div", { class: "abs", style: { left: k * 10 + "px", top: k * 12 + "px", width: "190px", height: "220px", borderRadius: "14px", background: "#fff", border: "2px solid #2F5FD0", transition: "background 180ms" } });
        stack.appendChild(L); layers.push(L);
      }
      stack.appendChild(h("div", { class: "abs lbl-caps", style: { left: "56px", top: "300px", color: "#2A50B0" } }, "Layers"));
      host.appendChild(stack);
      const out = h("span", { class: "chip abs", style: { left: "960px", top: "260px", background: "#F4A51C", opacity: 0, transition: "all 600ms cubic-bezier(.45,.05,.25,1)" } }, "");
      host.appendChild(out);
      const replyToks = (Deck.bpe.encode(fm.reply) || fm.reply.split(/(?= )/).map((t) => ({ text: t }))).map((t) => t.text);
      // static state for print / presenter
      if (ctx.print || ctx.preview) { bot.textContent = fm.reply + " …"; return {}; }
      let timers = [], dead = false;
      const at = (ms, fn) => timers.push(setTimeout(() => !dead && fn(), ms));
      function cycle() {
        bot.textContent = "";
        row.querySelectorAll(".chip").forEach((ch) => (ch.style.opacity = 0));
        let t = 200;
        row.querySelectorAll(".chip").forEach((ch, i) => at((t += 90), () => (ch.style.opacity = 1)));
        t += 500;
        replyToks.forEach((tok, k) => {
          for (let L = 0; L < layers.length; L++) {
            at(t + L * 90, () => (layers[L].style.background = "#C9D6F4"));
            at(t + L * 90 + 160, () => (layers[L].style.background = "#fff"));
          }
          at(t + 600, () => { out.innerHTML = Deck.tokHTML(tok); Object.assign(out.style, { left: "960px", top: "260px", opacity: 1, transform: "scale(1)" }); });
          at(t + 1150, () => Object.assign(out.style, { left: "430px", top: "330px", opacity: 0, transform: "scale(.7)" }));
          at(t + 1600, () => { bot.textContent += tok; });
          t += 1500;
        });
        at(t + 3500, cycle);
      }
      cycle();
      return { destroy() { dead = true; timers.forEach(clearTimeout); } };
    },
  };

  /* ---------- 2. agenda ---------- */
  Deck.components.Agenda = {
    steps: 0,
    mount(host, ctx) {
      (ctx.fm.row || []).forEach((r, i) => {
        const [n, t, d, b] = r.split("|").map((x) => x.trim());
        const row = h("div", { class: "agenda-row", style: `top:${i * 122}px; --b: var(--${b === "chartreuse" ? "leaf-d" : b === "turquoise" ? "teal-d" : b || "cobalt"})` },
          h("div", { class: "n" }, n), h("div", { class: "t" }, t), h("div", { class: "d" }, d));
        host.appendChild(row);
      });
      return {};
    },
  };

  /* ---------- 3. opening chat ---------- */
  Deck.components.ChatOpening = {
    steps: 4,
    mount(host, ctx) {
      const fm = ctx.fm;
      const c = Deck.chatCard({ x: 0, y: 0, w: 760, h: 630, name: fm.name, label: fm.label });
      host.appendChild(c.card);
      const fan = h("div", { class: "bubble fan hidden" }, fm.fan);
      const typing = h("div", { class: "bubble bot hidden typing" }, h("i"), h("i"), h("i"));
      const bot = h("div", { class: "bubble bot hidden" }, fm.bot);
      c.msgs.append(fan, typing, bot);
      const blooms = ["cobalt", "turquoise", "violet"];
      const cards = (fm.card || []).map((t, i) => {
        const el = h("div", { class: "src-card show-on off-up", style: `top:${i * 112}px; --b: var(--${blooms[i]})` }, h("div", { class: "ic" }, String(i + 1)), t);
        host.appendChild(el); return el;
      });
      const q = h("div", { class: "q-card show-on off-up", style: { top: "372px" } }, fm.question);
      host.appendChild(q);
      let tm = null;
      return {
        update(k, animate) {
          clearTimeout(tm);
          fan.classList.toggle("hidden", k < 1);
          if (k >= 2) {
            if (animate && bot.classList.contains("hidden")) {
              typing.classList.remove("hidden");
              tm = setTimeout(() => { typing.classList.add("hidden"); typing.style.display = "none"; bot.classList.remove("hidden"); }, 1100);
            } else { typing.classList.add("hidden"); typing.style.display = "none"; bot.classList.remove("hidden"); }
          } else { typing.classList.add("hidden"); typing.style.display = ""; bot.classList.add("hidden"); }
          cards.forEach((el) => el.classList.toggle("off-up", k < 3));
          q.classList.toggle("off-up", k < 4);
        },
        destroy() { clearTimeout(tm); },
      };
    },
  };
})();
