# L16 · Privacy, IP and Data Leakage in LLM Applications

Web deck for Lecture 16 (Auditing AI, Fall 2026), built on the L12 engine with the L14 arena. Present with `start-deck.bat` (port 5216) or double-click `index.html`.

## Before class (on the desktop, Ollama running)
1. `start-deck.bat`, then rehearse the three live slides once each so their replies are stored: slide 7 (memorization: press → three times), slide 12 (pick each "Sponsorship price" and "Who handles partnerships" from the library and send), slide 13 (pick each of the two poisoned-FAQ entries and send). Grade each attempt with the class-verdict buttons or leave them.
2. `node scripts/make_replay.mjs` turns those runs into `data/replay.js` (the written version is kept as `data/replay_written.js`). The Nov 9 rehearsal is in `data/replay.js` (the earlier written version is `data/replay_written.js`), so the deck plays real transcripts wherever Ollama is not reachable, including the GitHub Pages copy.
3. The PDFs in this folder were rendered in the cloud with fallback fonts. Re-export on the desktop if wanted: `index.html?print=final` (or `?print=all`), print to PDF at 1600 × 900.
4. The title says M 11/9; the close slide points at Assignment 3 (F 11/13) and L17. Fix in `slides.md` if the dates differ.

## Files
- `slides.md`: all slide text, captions and notes. `slides.content.js` is the copy used when opened by double-click (start-deck refreshes it).
- `data/config.js`: the pinned configuration (models, prompt v4 with the support notes, the knowledge base plus the sponsor rate card, the seeded library for the two arena slides, the memorization prompts, the scanner patterns and allowlist, the "cannot catch" patterns, the contract mock, the architecture card).
- `data/scan_corpus.js`: the replies the scanner runs over. Built from `L14_red_teaming/data/attempt_log.jsonl` (every live reply, Oct 13 to Nov 4, 307) and `L15_hallucination_toxicity_bias/data/attempt_log.jsonl` (the 120-row transcript set of Nov 4). Rebuild with `scripts/build_corpus.py` if either log changes.
- `data/replay.js`: replay data for the live slides (see above). `data/attempt_log.jsonl`: this deck's own live records (arena attempts and memorization runs), appended by start-deck.
- `js/l16data.js`: the scanner, the misses, the two-detector comparison, the source join and the finding text (no DOM; runs in node). `js/l16live.js`: memorization runs and the votes. `js/components/l16.js`: LeakMap, MemorizeWalk, MemorizeLive, ContractConfig, ArchCard, ReasonChain, PiiScan, Misses, SourceJoin, LeakFinding, Close. `js/components/arena.js`, `js/llm.js`, `js/engine.js`, `js/components/shared.js`: from L14, unchanged.
- `L16_script.md` / `L16_script.pdf`: the word-for-word speaking script, one slide per page.

## Honesty rules carried from L12 to L15
Live numbers are real and dated on the slide (the scan corpus, the source join, the finding). The memorization walk (slide 6) and the configuration page (slide 9) are drawn and badged Illustrative. Written replay transcripts are labeled as written until a rehearsal replaces them.

## The public copy (GitHub Pages)
https://ckormylo.github.io/AI-Audit/L16/. No model behind it: the arena slides replay the library entries, the memorization slide shows the stored runs, the scanner slides run in the browser on the committed corpus.

## Case
MrFeast AI is a hypothetical classroom case, a parody of MrBeast. The app, its replies, codes, support notes, fan records and the sponsor rate card are invented. The avatar is AI-generated and depicts a fictional person.
