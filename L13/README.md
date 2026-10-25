# L13 · Evaluating LLM Outputs

Web deck for Lecture 13 (Auditing AI, Fall 2026), on the same engine as L12 and L14. 20 slides. One live piece: the LLM-as-judge test–retest, which uses the `gemma3:12b` model in Ollama on this desktop.

## Presenting

Double-click **`start-deck.bat`** (opens http://localhost:5213; live judge calls go through its proxy). Double-clicking `index.html` also works but runs the judge slide in REPLAY mode with stored runs (the pill says why). Keys as in L12: → / Space next, ← back, Shift+→ skip clicks, **P** presenter window with notes and timer, **O** overview, **F** full screen, **?** help.

- **Be the judge** (slide 11): click Pass or Fail per item as the room votes; click → to reveal the vendor's judge and the agreement.
- **The same judge, run twice** (slide 14): → runs the judge on ten replies; → again runs it a second time; kappa between runs and against the class's votes appears below. If Ollama is off, stored illustrative runs play and are labeled as such.
- **Bootstrap** (slide 16): each click runs real resampling in the browser on an illustrative set of 200.
- **Paired comparison**, **verbosity scatter**, **kappa worked example**: computed from the numbers in `data/config.js`.

## Files

- `slides.md` all slide text, captions and notes · `data/config.js` golden set, replies, rubric, judge settings and prompt, stored runs, worked-example numbers
- `js/engine.js`, `js/llm.js`, `js/components/shared.js` shared with L14 · `js/components/eval.js` this deck's components · `css/eval.css`
- `scripts/serve.mjs` local server and Ollama proxy (port 5213)

## Case

MrFeast AI is a hypothetical classroom case, a parody of MrBeast. The memo, the golden set, the replies, the leaderboard and all numbers marked illustrative are invented for teaching.
