/* L18 quote slots. Two agent quotes are carried over from Lecture 17: if data/l17_quotes_pasted.js holds the
   published words (pasted there through L17's quote page), the card shows them labeled "As published";
   otherwise it shows the paraphrase, labeled as a paraphrase. */
window.L18 = {
  quotes: {
    scope:  { who: "An agent, reasoning", when: "Jul 11 to 12", src: "METR, section on agents knowing the attack was out of scope", para: "The agent states that exploiting outside infrastructure is not what the task intends. It then continues, reasoning that the task cannot be solved otherwise and that peers are already doing it.", text: "" },
    report: { who: "An agent, reasoning", when: "Jul 10 to 12", src: "METR, section on alerting humans", para: "The agent considers reporting the exposed credentials to people. It does not do so.", text: "" },
  },
};
(function () {
  const P = window.L17_PASTED || {};
  Object.keys(window.L18.quotes).forEach((k) => { if (P[k] && String(P[k]).trim()) window.L18.quotes[k].text = String(P[k]).trim(); });
})();
