<!--
  L13 · Evaluating LLM Outputs · slide text
  =========================================
  Same format as L12 and L14: a block between two lines of three dashes holds the slide's settings,
  then the slide text, "Click N:" captions, and speaker notes after a line that says "Notes:".
  Keys ending in [] repeat. \n is a line break. Never put a line of three dashes inside a slide's text.
  Data (benchmark items, replies, judge settings, worked-example numbers) is in data/config.js.
  "Illustrative" badges mark numbers written for teaching; the computations on those slides are real.
  Two learning outcomes drive the deck: (1) what a benchmark is, (2) how to build a high-quality benchmark of your own.
-->

---
id: title
layout: title
kicker: Lecture 13 · M 10/26
title: Evaluating LLM Outputs
subtitle: What a benchmark is, how to build a good one, and how to read the number it produces
meta: ITAO 40515 · Auditing AI · Fall 2026
component: TitleArena
compfull: 1
fan: How long does shipping take?
reply: Great question! Beastables orders usually ship in 5 to 10 business days, sometimes faster if you order before noon, and the team is expanding to Canada next month!
---
Notes:
**0:00.** Title. The reply on the left is wrong twice (5 to 10 days, Canada) and the vendor's automated grader scored it as correct. The class grades it later.

---
id: agenda
kicker: Today
title: Agenda
component: Agenda
row[]: 1 | What a benchmark is | A set of test inputs, reference answers and a scoring rule. Why public benchmarks are weak evidence for your task. | cobalt
row[]: 2 | How to build your own | Six steps to a benchmark you can defend, using MrFeast AI as the example. | violet
row[]: 3 | How to grade it | Most grading is done by a language model. A grader is a measuring instrument, and we check it. | marigold
row[]: 4 | How to report the number | An error bar on the accuracy, and the right way to compare two versions. | chartreuse
---
Notes:
**0:45.** One minute. Say the two things students should be able to do by the end: define a benchmark, and list the steps for building a good one. Assignment 3 Parts A and B apply all four parts to the Mira chatbot.

---
id: memo
kicker: Part 1 · What a benchmark is
title: The launch memo
bloom: vermilion
component: LaunchMemo
problem[]: One number, no range | How much would 96% move on a different 200 questions? Nobody checked. (Part 4)
problem[]: Graded by a model that was never checked | Does the automated grader agree with people? Nobody checked. (Part 3)
problem[]: Questions written by the product team | Do they look like what fans ask, and do they include questions the bot should refuse? Nobody checked. (Part 2)
problem[]: "Accuracy" was never defined | What counts as a correct free-text answer? Nobody wrote it down. (Part 2)
---
Click 0: Read the memo the way the AI Governance Committee would.
Click 1: There are four problems. Find them.
Click 2: Problem 1.
Click 3: Problem 2.
Click 4: Problem 3.
Click 5: Problem 4. The rest of today fixes each one.
Notes:
**1:45. About 5 minutes.** Take the four problems from the room before clicking them in. Each card names the part of today that fixes it.

---
id: standard
kicker: Part 1 · What a benchmark is
title: The three questions an auditor asks of any evidence
bloom: cobalt
---
| Question | Word | For an evaluation, it means |
|---|---|---|
| Does the evidence bear on the claim? | **Relevant** | The test questions come from real usage and cover the deployed task |
| Can the measurement be trusted and repeated? | **Reliable** | The grader was checked against people; running it again gives the same number |
| Is there enough of it for a claim this precise? | **Sufficient** | The sample is large enough that the range around the number supports what the memo says |

Same three words as Lecture 2. The memo fails all three. Assignment 3's rubric uses them by name.
Notes:
**6:45. About 3 minutes.** Read the right-hand column. This is the standard the whole lecture is organized around.

---
id: benchdef
kicker: Part 1 · What a benchmark is
title: What a benchmark is
bloom: cobalt
component: BenchmarkParts
---
Click 0: A benchmark has three parts.
Click 1: Test inputs: a fixed list of questions or tasks.
Click 2: Reference answers: what a correct response to each input is.
Click 3: A scoring rule: how a response is compared with the reference and turned into a score.
Click 4: Run a system on the inputs, apply the rule, and you get one number. That number is only as good as the three parts.
Click 5: Public benchmarks are built by others for a general task. Your own benchmark is built for your system and your task. Today you learn to build the second kind.
Notes:
**9:45. About 3 minutes.** This is the definition students must leave with. Say it twice. A benchmark is a fixed set of test inputs, with reference answers, and a scoring rule. Everything else today is about making each of the three parts good.

---
id: benchmarks
kicker: Part 1 · What a benchmark is
title: Public benchmarks are weak evidence for your task
bloom: cobalt
component: Leaderboard
badge: Illustrative
limit[]: Wrong task | A multi-subject exam score says nothing about whether this bot states the shipping window correctly.
limit[]: Contamination | The test questions are on the internet, so they may be in the training data. The score is inflated and you cannot check, because the training data is private.
limit[]: Teaching to the test | Once vendors compete on a benchmark, they tune models for it. The score rises; the ability may not. (Goodhart's law, Lecture 9.)
limit[]: Name is not the same as content | A benchmark called "reasoning" measures whatever its questions measure. The name is a claim.
snapshot: Also, the model behind the score changes. API models are updated without the version name changing, so last quarter's score may describe a model that no longer exists.
---
Click 0: A leaderboard ranks models by their scores on public benchmarks. Companies cite it because it is easy: "we chose the number 3 model."
Click 1: Wrong task.
Click 2: Contamination.
Click 3: Teaching to the test.
Click 4: The name is a claim.
Click 5: And the model may have changed since the score was measured.
Notes:
**12:45. About 4 minutes.** The leaderboard is invented (badge). The rule to say: a public benchmark score can help you choose which model to try. It cannot tell you whether your deployed system works. A launch memo that rests on a leaderboard rank is an audit finding.

---
id: part2
layout: divider
part: 2
of: 4
bloom: violet
kicker: Part 2
title: How to build your own benchmark
context: The test set, the reference answers, and the scoring rule, built for MrFeast AI.
---
Notes:
**16:45.**

---
id: golden
kicker: Part 2 · How to build your own benchmark
title: The items: test inputs and reference answers
bloom: violet
component: GoldenSet
---
Click 0: Eight items for MrFeast AI. Each row is a real fan question and a reference answer taken from the approved facts. A benchmark like this is often called a golden set.
Click 1: The key fact is the one checkable part of each reference answer. A program can check for it; a person checks the rest.
Click 2: The red rows are questions the bot must refuse. If your benchmark has none of these, it cannot catch the bot answering things it should not. The vendor's 200 questions had none.
Click 3: Who writes the items matters. Developers write questions the system already handles well, without meaning to. Have someone independent write or review them.
Click 4: A benchmark is a dataset. Sample from real usage with a privacy review (Lecture 7). Version it. Write it a datasheet (Lecture 4).
Notes:
**17:00. About 5 minutes.** The three red rows are the point of the slide: the vendor's benchmark could not measure overreach because it contained nothing the bot should refuse. Assignment 3's golden_set.csv has this structure, including a key_fact column.

---
id: steps
kicker: Part 2 · How to build your own benchmark
title: Six steps to a benchmark you can defend
bloom: violet
component: BuildSteps
step[]: Define the task and the source of truth | What the system is supposed to do, and which documents the correct answers come from. For MrFeast AI: answer fan questions from the approved facts, and decline everything else.
step[]: Collect inputs from real usage | Sample questions from the logs, with a privacy review. Not questions the team invents at a desk.
step[]: Cover the space on purpose | Question types, difficulty levels and edge cases, each with enough items. Include questions the system must refuse.
step[]: Write a reference answer and a key fact for each item | Grounded in the source of truth, with a citation. The key fact is the part a program can check.
step[]: Write the scoring rule before scoring | Binary where the key fact decides. An anchored scale where judgment is needed (next slide).
step[]: Get independent review, then version it | Someone outside the build team reviews the items. Give the set a version number and a datasheet, and keep it under change control.
---
Click 0: Six steps.
Click 1: Step 1.
Click 2: Step 2.
Click 3: Step 3.
Click 4: Step 4.
Click 5: Step 5.
Click 6: Step 6. This list is the answer to "how would you build a benchmark for this system."
Notes:
**22:00. About 5 minutes.** This is the second learning outcome, stated as a procedure. Walk each step with MrFeast AI as the example. Students should be able to reproduce the six steps for any system.

---
id: rubric
kicker: Part 2 · How to build your own benchmark
title: The scoring rule
bloom: violet
component: Rubric
---
Click 0: Binary scoring, correct or incorrect, when the key fact decides.
Click 1: An anchored scale when judgment is needed. Anchored means every level has a written definition. Pass is level 3 or 4.
Click 2: Without anchors, two careful raters disagree on every borderline reply. That shows up as low agreement in Part 3, and it is the scoring rule's fault.
Notes:
**27:00. About 3 minutes.** Read the four anchors. The class uses this scale on the next slides.

---
id: part3
layout: divider
part: 3
of: 4
bloom: marigold
kicker: Part 3
title: How to grade it
context: A language model that grades outputs is a measuring instrument. We check the instrument.
---
Notes:
**30:00.**

---
id: syllogism
kicker: Part 3 · How to grade it
title: A grader is a measuring instrument
bloom: marigold
---
- Most evaluations are graded by a language model that reads each reply and the scoring rule and outputs a score. This is called **LLM-as-judge**.
- A judge is a measuring instrument. Instruments need to be checked: does it agree with people, and does it agree with itself when run twice?
- Without those checks, "96%" describes the judge, not the chatbot.

**The method:** people grade a sample of the same replies; compute agreement. Then run the judge twice on the same replies; compute agreement again.
Notes:
**30:15. About 2 minutes.** Three lines and the method. The next three slides do it.

---
id: bethejudge
kicker: Part 3 · Exercise
title: Be the judge
bloom: marigold
component: BeTheJudge
---
Click 0: Six replies to benchmark questions. Grade each one pass or fail with the scoring rule.
Click 1: The vendor's judge graded the same six. Compare.
Notes:
**32:15. About 8 minutes.** Vote by hands, click the majority. Discussion items: J2 (long, wrong twice), J5 ("Not yet.", correct), J6 (correct plus a made-up upload day). Then click 1. Ask the room to name the pattern in the disagreements before the bias slide names it.

---
id: kappa
kicker: Part 3 · How to grade it
title: Measuring agreement: percent agreement and kappa
bloom: marigold
component: Kappa
badge: Worked example
---
Click 0: Two raters, 100 replies. Both pass about 80 of them.
Click 1: Percent agreement: they gave the same verdict on 88 of 100.
Click 2: By chance alone, two raters who each pass 80% would agree 68% of the time. So 88% is less impressive than it looks.
Click 3: Kappa = (0.88 − 0.68) / (1 − 0.68) = 0.625. Kappa is agreement beyond chance. 1 is perfect, 0 is no better than chance.
Click 4: The Landis and Koch bands are a common way to describe kappa. They are a convention, not a rule.
Notes:
**40:15. About 5 minutes.** Read the arithmetic off the slide. Then define test–retest: run the same judge twice on the same replies and compute kappa between the runs. That is the live slide after next.

---
id: biases
kicker: Part 3 · How to grade it
title: Four ways a judge goes wrong, and how to test each
bloom: marigold
---
| Bias | What it looks like | How to test for it |
|---|---|---|
| **Verbosity** | Longer replies score higher, correctness held constant | Plot judge score against reply length, using only replies people rated equally (Part 4) |
| **Position** | In side-by-side comparisons, the first (or second) reply wins too often | Swap the order and rerun |
| **Self-preference** | The judge favors replies from its own model family | Grade the same replies with a judge from another company |
| **Confidence** | A confident wrong reply beats a hedged right one | Rewrite hedged replies to sound confident, keep the content, regrade |

One of these was planted in the six replies you graded. Which one?
Notes:
**45:15. About 3 minutes.** Verbosity: J2 passed, J5 failed. Assignment 3 Part B asks for a hypothesis about Judge A and a test; this table is the list of candidates.

---
id: judgetwice
kicker: Part 3 · Live
title: Running a judge twice
bloom: turquoise
component: JudgeTwice
---
Click 0: Ten replies. The first verdict column is the vendor's judge, the same verdicts as the exercise. The next column is our own judge, a model on this desktop, grading each reply against its key fact.
Click 1: Run our judge again with the same settings. Highlighted rows are where it disagreed with itself.
Click 2: Three comparisons: the vendor's judge against the class, our judge against itself, our judge against the vendor's.
Notes:
**48:15. About 7 minutes.** Press → for run 1, → again for run 2. The vendor's judge column is fixed (the memo's grader). Our judge is gemma3:12b at default sampling, no seed, so it can disagree with itself. If both runs agree on all ten, say that ten items is a small sample and run a third time. If the pill says REPLAY, Ollama is not running and the stored runs play.

Two sentences to land: a judge that disagrees with itself cannot certify a number to a tenth of a percent; and two judges can disagree with each other, so "scored by our model" means nothing until you know which model and whether it was checked.

---
id: part4
layout: divider
part: 4
of: 4
bloom: chartreuse
kicker: Part 4
title: How to report the number
context: An error bar on the accuracy, and the right way to compare two versions.
---
Notes:
**55:15.**

---
id: bootstrap
kicker: Part 4 · How to report the number
title: Putting an error bar on the accuracy
bloom: chartreuse
component: Bootstrap
badge: Illustrative data, real resampling
---
Click 0: 200 graded transcripts, 162 correct. Accuracy 81%. How much would that move on a different 200?
Click 1: One bootstrap step: draw 200 transcripts at random, with replacement, and recompute accuracy. Some are drawn twice, some not at all.
Click 2: Repeat 1,000 times. The 1,000 accuracies form a distribution. The code is eight lines.
Click 3: The 2.5th and 97.5th percentiles are the 95% confidence interval. The memo's 96% is outside it.
Click 4: The interval narrows as the sample grows. To certify a number to a point, you need the sample size that makes the interval that narrow.
Notes:
**55:30. About 7 minutes.** The resampling is real, on an illustrative set of 200. Assignment 3 Part A asks for this interval on Mira's transcripts, and for the precision of the key-fact checker itself.

---
id: paired
kicker: Part 4 · How to report the number
title: Comparing two versions on the same items
bloom: chartreuse
component: Paired
badge: Illustrative data, real arithmetic
---
Click 0: Prompt v3 and prompt v4, run on the same 200 questions. 77% against 81%.
Click 1: 172 questions came out the same under both. Only the 28 where the versions differ carry information. These are the discordant pairs.
Click 2: 18 favor v4, 10 favor v3. McNemar's test on those 28 gives p ≈ 0.13. The four-point gap is consistent with no real difference.
Click 3: The wrong way: one run of each version, different questions or seeds, report the gap. Sampling noise alone produces gaps this size.
Notes:
**62:30. About 4 minutes.** Same items under both versions is a paired comparison. Lecture 14 uses it when prompt versions change.

---
id: verbosity
kicker: Part 4 · How to report the number
title: Testing for verbosity bias
bloom: chartreuse
component: Verbosity
badge: Illustrative data, real correlation
---
Click 0: Sixty replies that two people rated pass. For each, the judge's score against the reply's length in words.
Click 1: The correlation is computed from these points. Among replies people rated the same, the judge scores longer ones higher.
Click 2: Written as a finding: "Judge scores correlate with reply length among replies two human raters scored equally (r, n, Figure 4)." Testable, and it accuses no one.
Notes:
**66:30. About 3 minutes.** Holding human-rated quality fixed is what makes this a test of the judge rather than of the replies. Assignment 3 Part B wants this sentence about Judge A.

---
id: checklist
kicker: Close
title: Before you believe an evaluation number
bloom: magenta
---
- The benchmark items come from real usage and match the deployed task
- The benchmark is versioned and has a datasheet
- It includes items the system must refuse
- The scoring rule was written before scoring
- The grader was checked against people (agreement table attached) and against itself (test–retest)
- Every headline number has a confidence interval
- Any "A beats B" claim is a paired comparison on the same items
- Seeds and versions are recorded, so it can be rerun

The memo fails every line. This list is the rubric for Assignment 3 Part B.
Notes:
**69:30. About 3 minutes.** Read it against the memo. Next class: today measured normal behavior on cooperative questions. Wednesday the class tries to break the bot.

---
id: close
kicker: Close
title: Today's audit chain
component: Close
bloom: magenta
compfull: 1
chain[]: Requirement | The app answers fan questions correctly from the approved facts and declines what it cannot do.
chain[]: Control | A pre-launch evaluation: a benchmark, a grader, a headline number.
chain[]: Evidence | The benchmark and its datasheet, the grader's agreement table and test–retest, the confidence interval, the paired comparison.
chain[]: Finding | The 96% rests on a developer-written benchmark with no refusal items, graded by an unchecked judge, reported without an interval. Independent measurement gives a lower number with a wide range.
takeaway: A benchmark is a fixed set of test inputs, reference answers and a scoring rule. Build it from real usage, include what the system must refuse, write the scoring rule first, check the grader, and report the number with its range.
next: L14 · Prompt engineering and red-teaming
when: W 10/28
read[]: Instructor-selected critical piece on LLM benchmark validity (Canvas)
read[]: Assignment 3 Parts A and B: which of the vendor's six claims does today's toolkit test, and with which artifact? (discussion board)
lecture: 13
---
Notes:
**72:30.** Close. The takeaway line is the whole lecture in two sentences; read it as written.
