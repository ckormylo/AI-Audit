<!--
  L15 · Hallucination, Toxicity and Bias in Generated Text · slide text
  ====================================================================
  Same format as L13 and L14: a block between two lines of three dashes holds the slide's settings,
  then the slide text, "Click N:" captions, and speaker notes after a line that says "Notes:".
  Keys ending in [] repeat. \n is a line break. Never put a line of three dashes inside a slide's text.
  The live system (models, prompt v5-rag, knowledge base, benchmark questions, judge prompts, names) is in data/config.js.
  The transcript set the deck measures is generated on this desktop from the Generate button on the
  "transcript set" slide and stored in data/transcripts.jsonl; until that run exists the deck shows the
  written fallback in data/replay.js with an "Illustrative" badge.
  Two learning outcomes drive the deck: (1) a failure rate needs a definition, a denominator and a checked detector;
  (2) hallucinations are classified by mechanism, computed from the retrieval log, and each mechanism has an owner.
-->

---
id: title
layout: title
kicker: Lecture 15 · W 11/4
title: Hallucination, Toxicity and Bias in Generated Text
subtitle: Failures that happen without an attacker, and how to measure them
meta: ITAO 40515 · Auditing AI · Fall 2026
component: TitleArena
compfull: 1
fan: Do you ship to Canada?
reply: Not yet! But per the Shipping Policy, section 3.2, international shipping launches next month and first orders ship free. Get hyped!
---
Notes:
**0:00.** Title. The reply on the left is written, not a live run. It is wrong three times: the Shipping FAQ has no section 3.2, nothing launches next month, and nothing ships free. It reads as confident and cited. Nobody attacked the bot; a fan asked a normal question.

Say: last week we broke the bot on purpose. Today we measure what goes wrong when nobody is trying.

---
id: agenda
kicker: Today
title: Agenda
component: Agenda
row[]: 1 | Defining a failure so it can be measured | A rate needs a definition, a denominator and a detector whose error rate was measured. | cobalt
row[]: 2 | Hallucination: four mechanisms | Retrieval failure, synthesis error, overreach, citation fabrication. Each has a different owner. | violet
row[]: 3 | Measuring the rate on real transcripts | The class audits 120 MrFeast AI replies generated on this desktop. | marigold
row[]: 4 | Toxicity and representational bias | Automated detectors are instruments, and the instrument is what we test. | chartreuse
---
Notes:
**0:45.** One minute. Say the two things students should be able to do by the end: state a failure rate with its definition, denominator and detector; and classify hallucinations by mechanism and say who owns each fix. Assignment 3 Part C asks for both.

---
id: claim
kicker: Part 1 · Defining a failure
title: The product team's claim
bloom: vermilion
component: ClaimReplies
claim: MrFeast AI cannot make things up. It answers only from the approved facts.
reply[]: Lecture 12 | Also Beastables is giving fans 20% off with code FEAST20. | The code expired on September 30. An archived brief in the prompt still listed it.
reply[]: Lecture 13 | Beastables orders usually ship in 5 to 10 business days, and the team is expanding to Canada next month! | The FAQ says 5 to 7 days and no international shipping.
reply[]: Lecture 14 | Orders ship in 5 to 12 business days inside the US. | Produced while repeating the system prompt. The prompt said 5 to 7.
---
Click 0: The team's argument is the same one Assignment 3's auditee makes: a system that answers from retrieved documents cannot fabricate.
Click 1: Three replies this class has already seen.
Click 2: Which of these is a hallucination? You cannot answer until the word has a definition. That is the first job today.
Notes:
**1:45. About 4 minutes.** Take guesses from the room on click 2 and do not resolve them. The point is that people will disagree, and the disagreement comes from not having a definition. The next slide supplies one.

---
id: definition
kicker: Part 1 · Defining a failure
title: Hallucination, defined relative to a source of truth
bloom: cobalt
component: FaithfulFactual
definition: A hallucination is a statement in the output that the source of truth does not support, or contradicts.
truthsource: For MrFeast AI the source of truth is the approved knowledge base: six documents the product team signed off on.
cell[]: faithful | factual | "Orders ship in 5 to 7 business days." Shipping FAQ retrieved. | Correct, and grounded.
cell[]: faithful | notfactual | "20% off with code FEAST20." An archived brief was retrieved and quoted correctly. | The reply matched its document. The document was stale. The failure is the document, and the control that let it in.
cell[]: unfaithful | factual | "Videos post Saturdays at noon." No document was retrieved; the model answered from training. | True today. Still a finding: the control says answer only from the source, and this answer did not come from it.
cell[]: unfaithful | notfactual | "Orders ship in 5 to 12 business days." Shipping FAQ retrieved; the reply changed the number. | The reply contradicted its own document. This is the plain case.
---
Click 0: The definition. Read it twice. "Source of truth" is whatever the organization has declared the system must answer from.
Click 1: Two words to keep apart. Faithful means the reply agrees with the document the system retrieved. Factual means the reply is true against the authoritative source.
Click 2: Faithful and factual: the normal case.
Click 3: Faithful but not factual: the model quoted its document correctly, and the document was wrong. The fix is upstream.
Click 4: Factual but unfaithful: a true answer that did not come from the source. The control was "answer only from these documents." A control violation that happened to produce a right answer is still a violation; on other days it will produce wrong ones.
Click 5: Unfaithful and not factual: the plain case. And one more line: an instruction-following failure ("double it" broke the fan's budget in Lecture 12) is a different failure. Do not fold it into this word.
Notes:
**5:45. About 5 minutes.** This is the definition students must leave with. The three replies from the last slide land in three different cells, which is why the room disagreed.

Say on click 4: "correct but ungrounded is still a finding" and explain why in one sentence: the control is grounding, not accuracy, because grounding is what makes accuracy repeatable.

---
id: rateneeds
kicker: Part 1 · Defining a failure
title: What a failure rate needs before anyone can check it
bloom: cobalt
---
| Field | The question it answers | For MrFeast AI |
|---|---|---|
| **Definition** | What counts as one failure? | A reply containing a statement the knowledge base does not support or contradicts |
| **Denominator** | A rate of what? Replies, statements, sessions, fans? | Replies to a fixed benchmark of fan questions (Lecture 13), stated with the count |
| **Detector** | Found how, and how often is the detector wrong? | A key-fact check and a model judge, each with a measured precision |

"Hallucination rate: 2%" has none of the three. Every rate reported today, and in Assignment 3 Part C, carries all of them.
Notes:
**10:45. About 3 minutes.** Read the right-hand column. This table is the standard the rest of the lecture is organized around, the way relevant / reliable / sufficient organized Lecture 13. Say that the detector row is the one teams always leave out.

---
id: why
kicker: Part 1 · Callback to L12 · Live
title: Why a model produces unsupported text, and why a rate is a sample
bloom: turquoise
component: SampleGrid
reason[]: Next-token prediction has no truth check (L12, Part 1). The model produces the most plausible continuation, and plausible is not the same as supported.
reason[]: Sampling: the same prompt gives different replies (L12, temperature slide). One run is one draw.
reason[]: Preference training rewarded an answer over no answer (L12, Part 4). When the document does not cover the question, the trained habit is to answer anyway.
---
Click 0: Three reasons, all from Lecture 12. No new mechanism today.
Click 1: One fan question, sent twelve times to the model on this desktop at the pinned configuration, with the Shipping FAQ retrieved. The judge grades each reply against the key fact.
Click 2: Count the failures. Whatever the number is, it is one sample of twelve. A failure rate is a sample statistic, and Lecture 13's interval applies to it.
Notes:
**13:45. About 5 minutes.** Press → to run. Twelve replies stream in a grid; the judge grades each PASS or FAIL against the key fact. Read the count aloud and say the interval: on twelve draws, zero failures still leaves the true rate anywhere up to about 25%. If every reply passes, that is the lesson. If several fail, read one aloud and name which cell of the last slide it sits in.

If the pill says REPLAY, Ollama is not running and the stored run plays.

---
id: part2
layout: divider
part: 2
of: 4
bloom: violet
kicker: Part 2
title: Hallucination: four mechanisms
context: Where in the pipeline the failure happened decides who has to fix it.
---
Notes:
**18:45.**

---
id: pipeline
kicker: Part 2 · Four mechanisms
title: Where the pipeline fails
bloom: violet
component: RagPipeline
stage[]: Fan question
stage[]: Retriever
stage[]: Retrieved document
stage[]: Model
stage[]: Reply
mech[]: retrieval | Retrieval failure | The retriever returned the wrong document, or none, and the model answered anyway from training. | 1 | "When does my order come?" retrieved the Video schedule. The reply said "orders usually arrive in about a week," which no document says.
mech[]: synthesis | Synthesis error | The right document was retrieved and the model misread it: a number changed, a condition dropped, two rules merged. | 3 | Shipping FAQ retrieved. Reply: "5 to 12 business days."
mech[]: overreach | Overreach | The question is outside the source. The model answered instead of saying it does not know. | 3 | "Are Beastables gluten free?" The ingredients page does not say. Reply: "Totally gluten free!"
mech[]: citation | Citation fabrication | The reply cites a document or section that does not exist, so it reads as verified. | 4 | "Per the Shipping Policy, section 3.2." The Shipping FAQ has sections 1.1 to 1.3.
---
Click 0: The pipeline for one fan question: the question goes to a retriever, the retriever picks a document, the model writes a reply from the document.
Click 1: Retrieval failure. The retriever picked the wrong document. The model does not know that; it answers from whatever it has, including training.
Click 2: Synthesis error. The right document arrived and the model misread it. This is the "5 to 12 days" case.
Click 3: Overreach. Nothing in the source answers the question. The trained habit from the last slide fills the gap.
Click 4: Citation fabrication. The reply names a source that does not exist. A cited reply reads as verified, so this one defeats the spot-check a busy reviewer would do.
Notes:
**19:00. About 6 minutes.** The examples shown are real rows from the transcript set when it has been generated (the slide picks one per mechanism from data/transcripts.jsonl); if the badge says Illustrative, the written examples are showing. Take the four names slowly; Assignment 3 Part C asks for exactly these four, by mechanism, with transcript ids as exhibits.

Say on click 4 that this is why "we spot-checked fifty answers and they looked fine" is not evidence: a fabricated citation looks fine. Only checking the citation against the document list catches it.

---
id: owners
kicker: Part 2 · Four mechanisms
title: Each mechanism has a different detector and a different owner
bloom: violet
---
| Mechanism | How to detect it from the logs | Who owns the fix |
|---|---|---|
| **Retrieval failure** | Join the retrieved-document id to the source document the question should have hit. Wrong document, wrong answer: retrieval. | The retrieval team: indexing, keyword or embedding search, document coverage |
| **Synthesis error** | Right document, wrong answer: the model misread it. Key-fact check against the retrieved document. | The generation configuration: prompt wording, temperature, model choice |
| **Overreach** | The question had no supporting document and the reply did not decline. A scope screen plus review. | Scope policy and refusal behavior: what the bot is told to do when the source is silent |
| **Citation fabrication** | Extract cited sections and check each against the document's real section list. | Output validation: a check that runs before the reply is shown |

A total rate ("4% of replies were wrong") tells management nothing it can act on. The split by mechanism does.
Notes:
**25:00. About 3 minutes.** Read the middle column; it is the method for Part 3. The right-hand column is the reason the split matters: four different teams, four different fixes, one number cannot be assigned to any of them.

---
id: severity
kicker: Part 2 · Four mechanisms
title: Severity: not every wrong answer costs the same
bloom: violet
---
| Severity | What it means for MrFeast AI | Example |
|---|---|---|
| **High** | A commitment the company must honor or retract, or a safety risk | A discount, free shipping or a prize that does not exist; an allergen answer that is wrong; a dangerous challenge |
| **Medium** | A wrong fact the fan will act on, with a cost the fan absorbs | Wrong shipping window; wrong upload day |
| **Low** | Style and length; no decision rests on it | An over-long reply; a joke that misses |

Rates get reported by severity, not only in total. Assignment 3 Part C asks which failure type is most dangerous in that deployment; the answer depends on the deployment, so argue it from this table.
Notes:
**28:00. About 2 minutes.** A wrong allergen answer is the example to say aloud: an overreach in a snack brand's bot is a safety issue, and the same mechanism in a video-schedule question is trivial. Severity attaches to the consequence, not the mechanism.

---
id: part3
layout: divider
part: 3
of: 4
bloom: marigold
kicker: Part 3
title: Measuring the rate on real transcripts
context: 120 MrFeast AI replies, generated on this desktop at the pinned configuration, with the retrieved document logged for each.
---
Notes:
**30:00.**

---
id: transcripts
kicker: Part 3 · The transcript set
title: The transcript set
bloom: marigold
component: TranscriptSet
---
Click 0: Twelve fan questions from the Lecture 13 benchmark, extended. Nine have an answer in the knowledge base. Three do not, and the correct reply is to say so and point to support.
Click 1: Each question was sent ten times at the pinned configuration. For every reply the app logged the question, the document the retriever picked, the document the question should have hit, and the reply. 120 rows.
Click 2: This is the evidence an auditor would ask for: not a summary, the rows.
Notes:
**30:15. About 3 minutes.** The set is generated before class with the Generate button (about three minutes with both models loaded); the date and configuration pills on the slide say when and with what. If the badge says Illustrative, the generation has not been run and the written fallback is showing. Say which it is.

Prompt version is v5-rag: the approved facts were taken out of the system prompt and the bot must answer from the retrieved document, which is how a RAG deployment actually works and is what makes retrieval failures possible.

---
id: keyfact
kicker: Part 3 · Live
title: The key-fact check, and how often it is wrong
bloom: turquoise
component: KeyFactCheck
votes: 20
---
Click 0: Each benchmark question has a key fact (Lecture 13): the one checkable part of the reference answer. A program looks for it in every reply.
Click 1: Run it. Replies without the key fact are flagged.
Click 2: Twenty flagged replies, one at a time. Vote: is this reply actually wrong? Some say "about a week" or "we don't ship abroad yet" and are correct. The program flagged a paraphrase.
Click 3: Precision of the check: of the flags you voted on, the share that were real failures. The check's error rate goes into the table next to its findings.
Notes:
**33:15. About 6 minutes.** Press → to run the check, → again to start the votes. Vote by hands, click the majority. Expect the string check to over-flag paraphrases (that is the Assignment 3 trap: a plain string check passes leaks and flags correct paraphrases). Then say the sentence: a detector's error rate belongs in the workpapers next to its findings. This is the third instrument the unit has checked, after Lecture 13's judge and Lecture 14's filter.

The model judge's verdicts (gemma3:12b, graded during generation) are the second detector; the slide shows its agreement with the room's votes on the same twenty.

---
id: split
kicker: Part 3 · Live
title: The failures, split by mechanism
bloom: turquoise
component: MechanismSplit
---
Click 0: Every failed reply, classified by the rules from the owners table. The classification is computed from the log, not assigned by hand.
Click 1: Retrieval failure: the retrieved document differs from the source document. Synthesis error: same document, wrong answer.
Click 2: Overreach: the three out-of-scope questions, replies that answered instead of declining.
Click 3: Citation fabrication: every cited section checked against the real section list. This count has its own denominator: replies that cited anything.
Notes:
**39:15. About 4 minutes.** Read each bar with its denominator. The sentence to land: "the split is computed." In Assignment 3 Part C the retrieved-document column is the key to the same computation, and the grading looks for computed splits with transcript ids, not asserted ones.

One honest caveat to say: the retriever here is keyword matching, which is why one question retrieves the wrong document every time. Real retrievers fail less often and less predictably; the audit method is the same.

---
id: ratetable
kicker: Part 3 · How to report it
title: The rate table
bloom: marigold
component: RateTable
---
Click 0: One table. A row per mechanism: count, denominator, rate, 95% interval from the bootstrap (Lecture 13), severity.
Click 1: The last row is the detector: the key-fact check's precision from the votes, and the judge's agreement with the room. A table without this row is a claim about the detector, not the system.
Click 2: Against it, the team's version: "Hallucination rate: 2%." Same system, same day.
Notes:
**43:15. About 3 minutes.** The intervals are real bootstrap resamples on the real set. Read one row completely, with the interval. Then the contrast on click 2. This table is the format Assignment 3 Part C expects.

---
id: finding
kicker: Part 3 · How to report it
title: The finding
bloom: marigold
component: Finding
---
Click 0: The finding, written in the structure from Lecture 3, with today's numbers filled in from the log.
Click 1: Condition: what was observed, with the counts. Criteria: the team's own claim and the approved-source policy.
Click 2: Cause: retrieval constrains what the model sees, not what it writes. Effect: fans receive wrong commitments and wrong safety information at the rates measured.
Click 3: Recommendations are controls, not accuracy targets: citation validation against the section list before a reply is shown; a decline when nothing is retrieved; the key-fact check in production monitoring, with its precision stated and rechecked.
Notes:
**46:15. About 3 minutes.** The slide composes the text from the live data. Read it as written; it is the model answer for the Part C verdict on "not possible by design," with Mira's numbers in place of these.

Say on click 3: Assignment 3 Part F wants launch conditions written as testable controls. These three are the shape.

---
id: part4
layout: divider
part: 4
of: 4
bloom: chartreuse
kicker: Part 4
title: Toxicity and representational bias
context: The same three fields, definition, denominator and detector, applied to two harder failures. The detector is where the problems are.
---
Notes:
**49:15.**

---
id: toxicity
kicker: Part 4 · Toxicity
title: Toxicity, defined
bloom: chartreuse
---
- **Toxicity** is output that is harassing, hateful, threatening, sexual, or that encourages self-harm. Platforms score it with a classifier that reads text and returns a number.
- MrFeast AI's harm categories from Lecture 14 cover two slices of it: **danger** (a challenge that could injure) and **brand** (statements put in the creator's mouth). A fan bot also gets "roast my roommate" requests, which is where harassment starts.
- **The hard part is context.** The same words are toxic or not depending on who says them to whom and why: quoting an insult to report it, reclaimed language inside a community, frank safety information. A classifier reads the words.
- So a toxicity score is a judgment, and a judgment is a rating. Lecture 13's rules apply: agreement with people, agreement with itself, and a known bias list.
Notes:
**49:30. About 3 minutes.** Define the word before anything else; this is a slide students will study from. Keep the examples at the pattern level. The point of the last bullet is that nothing new is needed to audit a toxicity dashboard: it is an LLM-as-judge with a different rubric.

---
id: scorers
kicker: Part 4 · Toxicity
title: Automated toxicity scorers have measured bias
bloom: chartreuse
component: DialectChart
badge: Published finding
source: Sap, Card, Gabriel, Choi and Smith (2019), "The Risk of Racial Bias in Hate Speech Detection," ACL. Davidson, Bhattacharya and Weber (2019) report the same pattern on their datasets.
finding[]: Tweets written in African American English, and tweets by self-identified African American users, were up to **two times as likely** to be labeled offensive by widely used hate-speech datasets and the classifiers trained on them, with content held comparable.
finding[]: The bias enters at annotation: when annotators were told the tweet's dialect, or asked to consider the writer's likely race, they labeled the same tweets offensive significantly less often.
finding[]: The reverse error also exists: hostility with no slur in it (veiled threats, dog whistles) is under-flagged, because the classifiers learned words.
---
Click 0: A published finding, not something measured here. The chart draws the paper's headline ratio.
Click 1: The classifier learned its labels from people, and the people labeled a dialect, not only the content. The model reproduces that.
Click 2: The consequence for an auditor: a toxicity dashboard is an instrument with a known false-positive pattern by dialect and a known false-negative pattern for implicit hostility. Its agreement table, by subgroup, belongs in the workpapers before its rate is believed.
Notes:
**52:30. About 3 minutes.** The numbers are the paper's, cited on the slide; "up to two times" is the abstract's own phrase. Do not generate dialect examples in the room. The audit sentence: the moderation score is a measuring instrument, and this is the instrument's known defect, which is a fairness finding about the detector before it is anything about the system.

---
id: representational
kicker: Part 4 · Representational bias
title: Representational bias, distinguished from allocation bias
bloom: chartreuse
---
| | Allocation bias (Unit 2) | Representational bias (today) |
|---|---|---|
| **What is unequal** | Who gets the loan, the job, the parole | How people are portrayed and how well they are served |
| **Where it shows** | A decision and its error rates by group (Lecture 9) | Generated text: what is said, how much, in what tone |
| **Three forms** | | **Stereotyped association**: generated challenges that assume a fan's interests from a name. **Differential quality of service**: shorter, vaguer or more refusing replies for some fans. **Defaults**: whose situation the bot treats as normal (shipping "inside the US" assumed) |
| **How it is measured** | Confusion matrices by group | **Counterfactual probing**: change one attribute, hold everything else fixed, measure the difference (clean, but artificial). **Aggregate statistics** over real traffic (realistic, but confounded). **Bias test suites** (portable, but gameable, Lecture 13) |
Notes:
**55:30. About 3 minutes.** The distinction is the slide. Unit 2 measured decisions; generated text has no decision to count, so the measurement moves to the text itself. The three forms are the vocabulary Assignment 3 does not require but the group engagements may.

---
id: nameswap
kicker: Part 4 · Live
title: Counterfactual probing by first name
bloom: turquoise
component: NameSwap
---
Click 0: One fan question, with a first name in front of it. Six names, two groups of three, chosen from the names used in employment audit studies. Ten replies per name, pinned configuration.
Click 1: Measured per reply: length in words, whether both key facts were stated, and whether the bot declined or redirected.
Click 2: Group A against group B: difference of means, with a bootstrap interval on the difference. The slide writes the finding sentence from the numbers.
Click 3: If the interval includes zero, the sentence says so: no difference detected on sixty replies, with the interval. That is a result, not a clean bill. If it excludes zero, the sentence names the magnitude and the form (differential quality of service).
Notes:
**58:30. About 6 minutes.** Press → to run (sixty replies, about ninety seconds; the grid fills as they stream). Say before the run what counts and what would be reported, so the criteria are fixed before the result (Lecture 14's rule). Two cautions to say aloud: a first name is a proxy for a demographic attribute, which is the method's known weakness; and a model this small on a question this narrow may show nothing, which the sentence then reports with its interval.

If the pill says REPLAY, the stored run from rehearsal plays.

---
id: humanlayer
kicker: Part 4 · Detectors and people
title: Automated detection has limits; design the human review layer
bloom: chartreuse
---
- Every detector today has a measured error rate: the key-fact check, the judge, the citation check, the toxicity scorer. **A detector's output is a list of places to look, not a conclusion.**
- **Stratified manual review.** Sample flagged replies and high-severity categories heavily, and sample the unflagged replies too. False negatives are only found in the unflagged set.
- **Double-rate a subsample** and report kappa (Lecture 13). Two reviewers who disagree on borderline replies are telling you the scoring rule is unclear.
- **Escalation criteria** written down: which findings go to whom, within what time.
- **Reviewer wellbeing** is an operational design item, not an aside: rotation, opt-outs, support, when the content reviewed is actually harmful.
Notes:
**64:30. About 3 minutes.** The first bullet is the synthesis of the unit: Lecture 13 judge, Lecture 14 filter, today's checks. Say the auditor's sentence pattern: "our check, whose precision we measured at X, flagged Y of N; manual review of a stratified sample of M confirmed the rates in Table 2." Against "the hallucination rate is 2%."

---
id: checklist
kicker: Close
title: Before you believe a failure rate
bloom: magenta
---
- The failure is defined relative to a named source of truth
- The denominator is stated, with the count
- The detector's precision was measured, and the number is next to the findings
- The split by mechanism was computed from the log, with transcript ids
- Severity is attached to each row
- Every rate has an interval
- The human review sample included unflagged items
- The configuration is pinned (model, prompt version, settings, knowledge-base version), so the run can be repeated

Assignment 3 Part C is graded against this list.
Notes:
**67:30. About 2 minutes.** Read it against the team's "2%". Next class: outputs can also fail by containing what should never have been in the system at all. Wednesday is privacy and leakage: where data gets out of an LLM application, and the control at each point.

---
id: close
kicker: Close
title: Today's audit chain
component: Close
bloom: magenta
compfull: 1
chain[]: Requirement | The app answers fan questions from the approved knowledge base and says so when the base does not cover the question.
chain[]: Control | Retrieval, plus a prompt line: "answer only from the retrieved document."
chain[]: Evidence | 120 logged replies with retrieved-document ids, the key-fact check with its measured precision, the computed split by mechanism, the rate table with intervals.
chain[]: Finding | The "cannot make things up" claim fails. Retrieval limits what the model reads, not what it writes; the rates and mechanisms are in the table, by severity.
takeaway: A failure rate is a definition, a denominator and a checked detector. Classify hallucinations by where the pipeline failed, because each mechanism has a different owner and a different fix.
next: L16 · Privacy, IP and data leakage in LLM applications
when: Next class
read[]: Survey excerpt on hallucination in language models, the definitions and taxonomy sections (Canvas)
read[]: Sap et al. (2019), "The Risk of Racial Bias in Hate Speech Detection," sections 1 and 2 (Canvas)
read[]: Assignment 3 Part C: classify every failure by mechanism and report a rate per type with its denominator
lecture: 15
---
Notes:
**69:30.** Close. Read the takeaway as written. The next slide of the course is Lecture 16 on Wednesday: the same logs, asked a different question, what is in them that should never have been there.
