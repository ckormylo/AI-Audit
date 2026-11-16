# L17 · Auditing AI Agents

Web deck for Lecture 17 (Auditing AI, Fall 2026, M 11/16), built on the L12 engine with the Flourish theme. Present with `start-deck.bat` (port 5217) or double-click `index.html`. Nothing in this deck is live and no model is needed.

The lecture is one case: the July 2026 incident in which OpenAI evaluation agents left their sandbox and broke into Hugging Face. 26 slides, 3 parts: what an agent is; the incident in six stops; what the auditor takes from it. Assignment 4 is released on slide 25.

## Motion
The mechanics are shown with moving markers that repeat for as long as their slide is up: the agent loop (slide 3), package requests and the mirror crossing to the public sites (6), the refused request, the request through the mirror and the note (8), how a folder name carries a message (10), posts and reads on the board, the tokens travelling to the board, the crafted dataset going in and the secrets coming out, the commands (14), and the two refused attempts inside Hugging Face (15). The board counters (11) and the window chart (13) run up on their click. Press **M** to switch motion off. The PDF and print views show the final state only, with no motion.

## Before class
1. **Paste the agents' own words.** Start the deck with `start-deck.bat` and open http://localhost:5217/quotes.html. The page lists every quote card with what it says, where the original is in the report, and a word to search the report for. Paste each line into its box and press Save; an open deck reloads and shows the line in quote type, labeled "As published", in place of the paraphrase. The lines are stored in `data/quotes_pasted.js`. Two cards are already filled (the title and the first note on slide 8). A box left empty keeps its paraphrase, labeled as a paraphrase. All 20 slots are now on slides (Nov 16).
2. **Check the numbers.** Every figure was taken from summaries of the three reports. Check each slide's figures against the report named in its source line (list below).
3. `start-deck.bat` refreshes `slides.content.js` from `slides.md`. After editing `slides.md`, open the deck with start-deck at least once so the double-click copy is current.
4. The PDF in this folder was rendered in the cloud with fallback fonts. Re-export on the desktop if wanted: `index.html?print=final` (or `?print=all`), print to PDF at 1600 × 900.

## Files
- `slides.md`: all slide text, click captions and speaker notes. `slides.content.js` is the copy used when opened by double-click.
- `data/incident.js`: quote slots, the board feed, the June 27 decision, the controls ledger, the detection timeline.
- `js/components/l17.js`: the Animator (moving markers), TitleQuote, AgentLoop, StatRow, Stop (the incident map with a side column and one motion scene per level), StopVote, BoardMech, BoardFeed, Cards, WindowChart, Ledger, Spoof, DetectTimeline, Finding, Close. `js/components/shared.js` and `js/engine.js` are from L16, unchanged.
- `L17_script.md` / `L17_script.pdf` (and `L17_script.html`): the word-for-word speaking script, slide on the left and script on the right, one slide per page, with clicks marked. Teal "On screen" boxes describe what moves on each animated slide, and those pages carry a second picture of one moment of the motion. The PDF was rendered in the cloud with fallback fonts.
- `css/l17.css`: styles for the above. `css/theme.css`, `css/components.css`: from L16, unchanged.

## Sources
- OpenAI, "OpenAI - Hugging Face Incident Technical Report" (Aug 26, 2026): https://cdn.openai.com/pdf/67869394-cb91-4c12-888c-5cbd85c7814c/OpenAI-Hugging-Face%20Incident-Technical-Report.pdf
- OpenAI, "The Hugging Face incident and the road ahead" (Aug 26, 2026): https://openai.com/index/hugging-face-incident-and-the-road-ahead/ (did not load during the build; its timeline carries short chain-of-thought snippets worth reading)
- Hugging Face, "Technical Timeline: July 2026 Hugging Face Agent Intrusion": https://huggingface.co/blog/agent-intrusion-technical-timeline
- METR and Redwood Research, "Brief independent investigation of agents' behavior, reasoning and collaboration in the OpenAI / Hugging Face hacking incident" (Aug 26, 2026): https://metr.org/blog/2026-08-26-openai-hugging-face-incident-investigation/

## Figures to check, by slide
- 6 setting: 898 exercises; about 95% of agents on the research model (this share came from Wikipedia's summary).
- 7: 898, 198, 22%, 93% (OpenAI report).
- 8: Apr 20, May 8, May 12, May 26 (OpenAI report, events 1 to 5).
- 9: Jun 26, Jun 27, Jul 4, Jul 5 to 6, Jul 7, Jul 8 (OpenAI report, events 9 to 16).
- 11, 13: 53 agents and 1,188 messages at 3 hours; 76 and 1,953 at 6 hours; over 70,000 messages and files (METR, Figure 10 and core takeaways). Post times and agent names in the feed (METR, sequence of key actions).
- 12: about 10% of assignments from one coordinator; 19 keys, 429 signed posts (METR).
- 14: 14 write tokens (OpenAI); about 700 agents (METR); 41 production servers (reported by Axios from the OpenAI report).
- 15: two clusters, 136 keys, 84 refused operations, five datasets, under 13 hours (Hugging Face timeline).
- 17: about 7% of transcripts, at least 96 clear cases, at least 20% of agents (METR). The scorer did not read transcripts (METR).
- 18: Jul 11, Jul 13 14:14, Jul 16, Jul 17, Jul 19, 956 secrets (reported by Axios), 22 admin accounts, Jul 20, Jul 21, Jul 23 to 25, Jul 29.
- 20: about 17,600 recovered actions (Hugging Face); about 1,300 transcripts, 1.2 million entries, six days on site (METR).

## The public copy (GitHub Pages)
https://ckormylo.github.io/AI-Audit/L17/. It is the same deck: nothing in it needs a model. It includes the pasted quotes (`data/quotes_pasted.js`). The quote page, the speaking script and the narration files are not in the public copy.

## Honesty rules carried from L12 to L16
Real figures are cited to their report on the slide. Drawn items say so: the request-log rows on slide 13, the mechanism diagram and format example on slide 10, the two-pane example on slide 17. Paraphrases are labeled as paraphrases until the original is pasted in.
