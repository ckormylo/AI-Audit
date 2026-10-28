# L14 · Prompt Engineering and Red-Teaming

Web deck for Lecture 14 (Auditing AI, Fall 2026), built on the L12 engine, with a live red-team arena that talks to a model running in Ollama on this desktop.

## Before class (once)

1. Ollama is running (the tray icon, or `ollama serve`).
2. The two models in `data/config.js` are pulled: `ollama pull llama3.1:8b` and `ollama pull gemma3:4b` (change the tags in `data/config.js` to whatever `ollama list` shows).
3. Double-click **`start-deck.bat`**. It opens the deck at http://localhost:5214, keeps `slides.content.js` fresh, proxies the model calls, and appends every live attempt to `data/attempt_log.jsonl`.

The deck works offline. Fonts fall back to Calibri and Georgia without internet.

## Presenting

Same keys as L12: → / Space next, ← back, Shift+→ skip clicks, **P** presenter window, **O** overview, **F** full screen, **M** reduce motion, **?** help. The address bar keeps your place.

On an Arena slide, click into the box, type the class's attempt (or pick one from the seeded library) and press Enter. The reply streams in; the **filter verdict** (the judge model) appears on the right; then click **Blocked** or **Broke** for the class verdict (Broke asks for a category). Each graded attempt fills one cell of the coverage matrix and one cell of the filter-vs-class table. **New attempt** clears the conversation. Keep sending in the same conversation for multi-turn attacks. **prompt** opens the system prompt for live editing (Part 1 demo); saving it bumps the version and starts a new attempt. **export** downloads the attempt log; **reset** clears everything (asks first).

The LIVE / REPLAY pill shows which mode the deck is in. If Ollama cannot be reached, the deck switches to REPLAY on its own and plays rehearsal transcripts from `data/replay.js` with the same streaming animation. Force it with `index.html?replay=1`. Point the deck at another machine's Ollama with `?ollama=http://HOST:11434`.

## The public copy (GitHub Pages)

The same deck is published at https://ckormylo.github.io/AI-Audit/L14/. GitHub Pages serves files only, so there is no model behind it. Away from `localhost` the deck starts in **STORED REPLIES** mode: every entry in the Seeded attack library plays a reply recorded in rehearsal against the pinned configuration (same model, prompt v4, temperature 0.7, seed 40515), with the filter's recorded verdict; the multi-turn sequences play turn by turn; the prompt-flip slide plays its two recorded runs. Typing a new attempt shows a note instead of a reply. Class voting, the coverage matrix and the summary slide work as in class. To put a live model behind the public page, open it with `?ollama=https://YOUR-TUNNEL` pointing at an Ollama server that allows that origin (`OLLAMA_ORIGINS`).

## After a rehearsal

`node scripts/make_replay.mjs` turns `data/attempt_log.jsonl` into `data/replay.js` (only attempts with a class verdict; add `--all` to include the rest). The seeded attack library in `data/config.js` should list the attempts that worked and the ones that did not, against the pinned configuration shown on the slide.

## The deck

32 slides, built Oct 13 2026 from the plan in the project: Part 1 prompts as configuration (live prompt flip, change-log reconciliation), Part 2 one channel (token strip, trained-region map, success criteria), Part 3 six attack types each as concept → live arena → architecture callback to L12, Part 4 the red-team program table, then the filter-vs-class reveal computed from the room's attempts, and the close. Timing cues are in the notes (presenter window, P). Compression order if behind: run the encoding and direct-injection live slides from the library only.

## Files

- `slides.md` all slide text, captions and notes (the lecture) · `data/config.js` models, system prompt, harm categories, techniques, attack library · `data/replay.js` rehearsal transcripts (50 attempts, Oct 13 to 28) · `data/attempt_log.jsonl` the raw log (local only, not in the repository)
- `js/engine.js` deck engine (shared with L12, deck id from `<meta name="deck-id">`) · `js/llm.js` Ollama bridge · `js/components/arena.js` the live slide · `js/components/shared.js` chat card, petals, agenda · `js/components/lecture.js` every other slide component · `js/bpe.js` + `data/gpt2_tokenizer.js` the real GPT-2 tokenizer from L12 (token strips)
- `scripts/serve.mjs` local server, proxy and logger · `scripts/make_replay.mjs`

## Case

MrFeast AI is a hypothetical classroom case, a parody of MrBeast. The app, its replies, codes, support notes and fan records are invented. The avatar is AI-generated and depicts a fictional person. Course policy: we study published attack classes to audit defenses; we do not develop novel attacks; nothing leaves this machine.
