/* Shared pieces carried over from the L12 deck: the MrFeast AI chat card, the petal motif, the agenda rows. */
(function () {
  const { h, s, svg } = Deck;

  Deck.chatCard = function (opts) {
    const card = h("div", { class: "chat", style: { left: opts.x + "px", top: opts.y + "px", width: opts.w + "px", height: opts.h + "px" } });
    const head = h("div", { class: "head" },
      h("img", { src: "assets/mrfeast-avatar.jpg", alt: "MrFeast AI profile photo (AI-generated, fictional person)" }),
      h("div", {}, h("div", { class: "nm" }, opts.name || "MrFeast AI"), opts.label ? h("div", { class: "lbl" }, opts.label) : null));
    const msgs = h("div", { class: "msgs" });
    card.append(head, msgs);
    return { card, head, msgs, avatar: head.querySelector("img") };
  };

  Deck.petals = function (parent, x, y, scale, seed) {
    const g = svg(400, 400, parent, { style: `position:absolute;left:${x}px;top:${y}px;width:${400 * scale}px;height:${400 * scale}px;overflow:visible` });
    const cols = ["#D6177F", "#E8431F", "#F4A51C", "#A9C93A", "#22A6B8", "#2F5FD0", "#6B3FA0"];
    let r = seed || 3;
    const rnd = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
    for (let k = 0; k < 7; k++) {
      const a = (k / 7) * Math.PI * 2 + rnd() * 0.4, d = 70 + rnd() * 60;
      const cx = 200 + Math.cos(a) * d, cy = 200 + Math.sin(a) * d;
      s("ellipse", { cx, cy, rx: 46 + rnd() * 20, ry: 24 + rnd() * 10, fill: cols[(k + (seed || 0)) % 7], stroke: "#232748", "stroke-width": 2.2, transform: `rotate(${(a * 180) / Math.PI} ${cx} ${cy})`, opacity: 0.95 }, g);
      for (let j = 0; j < 3; j++) s("circle", { cx: cx + (rnd() - 0.5) * 30, cy: cy + (rnd() - 0.5) * 14, r: 3, fill: "#FBF7EF" }, g);
    }
    s("circle", { cx: 200, cy: 200, r: 34, fill: "#F6EBCF", stroke: "#232748", "stroke-width": 2.2 }, g);
    for (let j = 0; j < 9; j++) s("circle", { cx: 200 + Math.cos(j) * 16, cy: 200 + Math.sin(j) * 16, r: 3.2, fill: "#6B3FA0" }, g);
    return g;
  };

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

  /* Title slide art: petals plus the chat card showing one attack and the pinned configuration */
  Deck.components.TitleArena = {
    steps: 0,
    mount(host, ctx) {
      Deck.petals(host, -190, -190, 0.9, 1);
      Deck.petals(host, 820, 640, 0.7, 4);
      const c = Deck.chatCard({ x: 110, y: 150, w: 780, h: 420, label: "Hypothetical classroom case" });
      host.appendChild(c.card);
      c.msgs.append(h("div", { class: "bubble fan" }, ctx.fm.fan || ""), h("div", { class: "bubble bot" }, ctx.fm.reply || ""));
      return {};
    },
  };
})();
