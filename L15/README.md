# L15 · Hallucination, Toxicity and Bias in Generated Text

Same engine, theme and Ollama bridge as L13 and L14. Present with `start-deck.bat` (port 5215) or double-click `index.html`.

## Files
- `slides.md`: all slide text, click captions and speaker notes. Edit this file; the deck reloads under start-deck. `slides.content.js` is the copy used when the deck is opened by double-click (the start script refreshes it).
- `data/config.js`: the pinned configuration (models, prompt v5-rag, knowledge base with numbered sections, the 12 benchmark questions, judge prompt, name-swap settings, the published Sap et al. 2019 numbers).
- `data/attempt_log.jsonl`: every live record (transcript rows, sample-grid replies, name-swap replies), appended by start-deck's `/__log` endpoint. The deck keeps the current runs in localStorage (`L15-state`) and restores the latest run from this file after a browser reset. **reset** on the transcript slide clears the browser copy; delete the file to forget the runs entirely.
- `data/replay.js`: written fallback for the three live slides (transcript set, sample grid, name swap), labeled Illustrative. Shown only when no real run exists or Ollama is down. Rebuild with `python scripts/make_illustrative.py`.
- `js/l15data.js`: retrieval, key-fact check, citation check, mechanism classification, bootstrap, name-swap statistics, finding text. No DOM, so it runs in node too.
- `js/components/l15.js`: the slide components (ClaimReplies, FaithfulFactual, SampleGrid, RagPipeline, TranscriptSet, KeyFactCheck, MechanismSplit, RateTable, Finding, DialectChart, NameSwap). TitleArena, Agenda and Close come from the shared components.
- `L15_script.md`: word-for-word speaking script, one slide per section, `[click]` marks. `L15_script.pdf` is the two-column version (slide left, script right).

## Before class (on the desktop, Ollama running)
1. `start-deck.bat`, open the deck, go to the "transcript set" slide, press **Generate**. About three minutes: 12 questions x 10 samples through llama3.1:8b with keyword retrieval, each reply graded by gemma3:12b. The date and configuration pills update; the Illustrative badge disappears on every Part 3 slide.
2. Go to the "why" slide and the "name swap" slide and run each once (→). The runs are stored and replay if Ollama is off in class.
3. The PDFs in this folder (`L15_Hallucination_Toxicity_Bias_slides.pdf`, `L15_script.pdf`) were rendered in the cloud with fallback fonts and the written fallback data. For the real fonts and the real numbers, re-export on the desktop after the Generate run: open `index.html?print=final` (or `?print=all` for every click state) in Chrome and print to PDF at 1600 x 900.
4. The title says W 11/4 and the close slide says "Next class" for L16; fix both in `slides.md` if the dates differ.

## The public copy (GitHub Pages)

The same deck is published at https://ckormylo.github.io/AI-Audit/L15/. GitHub Pages serves files only, so there is no model behind it: the deck starts in REPLAY and the three live slides play the replies in `data/replay.js`. After a real run on the desktop, `node scripts/make_replay.mjs` replaces that file with the latest transcript set, sample grid and name-swap replies from `data/attempt_log.jsonl` (the written fallback is kept as `data/replay_written_fallback.js`); commit it and the public copy shows the real numbers.

## Live slides and what they call
- `why` (SampleGrid): 12 calls to the target with the Shipping FAQ retrieved, 12 judge calls.
- `transcripts` (TranscriptSet): Generate button, 120 target calls with retrieval, 120 judge calls; appends to `data/attempt_log.jsonl`.
- `keyfact` (KeyFactCheck): no model calls; string check plus class votes (stored in localStorage `L15-state`).
- `split`, `ratetable`, `finding`: computed from the set, no model calls.
- `nameswap` (NameSwap): 60 target calls with the Shipping FAQ retrieved; no judge (facts are string-checked, by design, so the detector is visible).

## Honesty rules carried from L12 to L14
Live numbers are real and dated on the slide. Written examples carry an Illustrative badge. The Sap et al. (2019) slide draws the paper's headline ratio ("up to two times") and cites it; nothing on that slide is measured here.
