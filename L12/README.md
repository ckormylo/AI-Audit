# L12 · How Large Language Models Work

A self-contained web deck for Lecture 12 (Auditing AI, Fall 2026). No installs, no internet needed in class (fonts fall back to Calibri and Georgia when offline).

## Presenting

- **Double-click `index.html`.** The deck opens in your browser. Press **F** for full screen.
- **→, Space, Page Down or a clicker** advance one click; **←** goes back. **Shift + →** skips to the next slide.
- **P** opens the presenter window (speaker notes, timer, next-slide preview). Drag it to your laptop screen; arrow keys in either window drive both.
- **O** shows all slides; click one to jump. **M** turns animations off. **?** shows these keys.
- The address bar keeps your place (`#/slide/click`), so a reload returns to the same spot.

## Editing text

All slide text is in **`slides.md`**: titles, captions for each click, card text, speaker notes. The top of that file explains the format.

1. Double-click **`start-deck.bat`** (Windows) or `start-deck.command` (Mac). It opens the deck at http://localhost:5212.
2. Edit `slides.md` in any text editor and save. The deck reloads on its own and stays on the same slide.
3. When you close the start window, `slides.content.js` already holds your latest text, so double-clicking `index.html` shows it too.

If you edit `slides.md` without running the start script, run `node scripts/serve.mjs --once` afterwards (or just run the start script once) so `index.html` picks up the change.

## PDF for Canvas

With the deck open, add `?print=all` to the address (for example `index.html?print=all`), then print to PDF with **landscape, no margins, background graphics on**. Every click state becomes a page. `?print=final` gives one page per slide. A ready-made PDF is in this folder.

## Where the numbers come from

| What | Source | File |
| --- | --- | --- |
| Next-token probabilities, the generation loop, temperature replies, the embedding map, attention weights, head patterns, output scores, pretraining guesses, the base-model reply | Written for teaching, to show each mechanism cleanly. Labeled "Illustrative" on each slide | `data/examples.js`, made by `scripts/build_examples.py` |
| Token splits, token IDs, token counts by language | GPT-2's real tokenizer (a lookup, not a model output) | `data/gpt2_tokenizer.js`, `js/bpe.js` |
| Tiny live-trained model | `js/tinymodel.js`, trained in the browser on invented titles; saved run in `data/tiny_snapshots.js` | `data/tiny_corpus.js` |
| GPT-3 sizes and training mix | Brown et al. 2020 | slide text, `scripts/build_examples.py` |
| One training step, the feed-forward questions, the preference-training scores | Illustrative, labeled on the slide | slide text |

To change an illustrative number, edit `scripts/build_examples.py` and run `python3 scripts/build_examples.py`. Attention weights on the query-key slide are computed from the scores in that file, so they always add up to 100%.

## Case

MrFeast AI is a hypothetical classroom case, a parody of MrBeast. The app, its replies, briefs, offers and codes are invented. The avatar (`assets/mrfeast-avatar.jpg`) is AI-generated with ChatGPT Images 2.5 and depicts a fictional person.

## Hosting

The folder is a static site. It can go on GitHub Pages as is (upload the folder and enable Pages), or be shared as a private link.
