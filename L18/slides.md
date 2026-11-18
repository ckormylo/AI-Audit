<!--
  L18 · Organizational Adoption and Societal Impacts of Generative AI · slide text
  ================================================================================
  Same format as L13 to L17: a block between two lines of three dashes holds the slide's settings,
  then the slide text, "Click N:" captions, and speaker notes after a line that says "Notes:".
  Keys ending in [] repeat. Never put a line of three dashes inside a slide's text.
  Two learning outcomes: (1) name the five layers of AI governance, give the audit test for each, and write a
  shadow-AI finding whose recommendation addresses the cause; (2) say what evidence shows that human review and
  accountability are real, and argue both sides of whether an internal auditor's opinion should weigh harm to
  people outside the organization.
  No model is needed for this deck. Nothing is live. Examples marked Illustrative are written for the slide.
  The lawsuit is a live dispute: the state's claims are allegations and OpenAI's answer is given each time.
-->

---
id: title
layout: title
kicker: Lecture 18 · W 11/18
title: Organizational Adoption and Societal Impacts
subtitle: How organizations govern generative AI, who answers when it fails, and what it costs people outside
meta: ITAO 40515 · Auditing AI · Fall 2026
component: TitleNews
compfull: 1
label: Monday, November 16, 2026
head: California sues OpenAI over the Hugging Face incident.
sub: Filed the same day as Lecture 17.
src: Reported by Reuters, NPR and TechCrunch, Nov 16, 2026
---
Notes:
**0:00.** Title. Read the headline. Say: this was filed on Monday, the day we covered the incident. Monday's question was which control failed. Today's question is who answers for it.

---
id: agenda
kicker: Today
title: Agenda
component: Agenda
row[]: 1 | Governance inside the organization | Five layers of AI governance, and the audit test for each. | cobalt
row[]: 2 | Shadow AI | AI used for work without approval. How common it is, why it happens, and how to write the finding. | marigold
row[]: 3 | People and accountability | Whether human review is real, what happens to skills, and who answers when an AI system fails. | violet
row[]: 4 | Effects outside the organization | Four effects on people outside, how they come back as costs, and whether an audit should weigh them. | vermilion
row[]: 5 | The course on one slide | Five habits that carry over, and Assignment 4. | magenta
---
Notes:
**1:00.** One minute. Five parts. Two things to be able to do by the end: name the five layers of governance with a test for each, and say what evidence shows that human review and accountability are real.

---
id: monday
kicker: Since Monday
title: The incident is now a lawsuit
bloom: vermilion
component: Cards
big: 1
cols: 2
card[]: What California alleges | The attack was "entirely foreseeable". The state says OpenAI tested models it knew were dangerous, in a test environment that could be broken out of, without enough oversight. | vermilion | 1
card[]: What the state asks for | Two claims: public nuisance and unfair competition. It asks a court to order OpenAI to change its practices. The Attorney General's statement counts 80 known incidents. | vermilion | 1
card[]: What OpenAI says | The lawsuit "appears to single out OpenAI" over a problem that every major AI lab has faced. Its August report described July as a rare case in which several unusual things happened together. | cobalt | 2
card[]: What OpenAI says it is doing | It says it takes the problem seriously, has strengthened its safeguards, and will keep working with the Attorney General's office. | cobalt | 2
foot: These are allegations and statements. No court has ruled. Monday asked which control failed. Today asks who answers for it, and what an organization is expected to have in place. | 3
source: TechCrunch, Reuters and AOL, Nov 16 and 17, 2026. Filed in San Francisco Superior Court.
---
Click 0: On Monday afternoon the Attorney General of California sued OpenAI over the incident from Monday's lecture.
Click 1: The state's position. A public nuisance is a legal claim that an activity harms the public at large.
Click 2: OpenAI's position.
Click 3: Both sides are arguing about what the organization knew and decided. That is the subject of today's lecture.
Notes:
**2:00. About 3 minutes.** Keep it even. Read the state's two cards, then OpenAI's two cards, in the same tone. Define public nuisance in one sentence. Do not offer a view on who is right. The last click sets up the lecture: every part today is about what an organization is expected to have in place.

---
id: layers
kicker: Part 1 · Governance inside the organization
title: The five layers of AI governance
bloom: cobalt
component: RowReveal
rows: 5
---
**AI governance** is the set of rules, roles and records an organization uses to control how it uses AI. It has five layers, and each one has a test.

| Layer | What it is | The audit test |
|---|---|---|
| **AI inventory and intake** | A list of every AI system in use, and a review that each new use must pass before it starts | Compare the list with purchasing records, expense reports and network logs |
| **Usage policy** | The written rules: which tools, for which tasks, with which kinds of data | Read the policy against what is in use. Does it cover agents, and AI features inside other software? |
| **Vendor and model governance** | The contract terms with the companies that supply the models | Find the clause on notice of model changes. Ask when the model last changed and whether tests were rerun |
| **Training and attestation** | Staff are taught the policy and sign a statement that they will follow it | Sign-off records show the training happened. Sample real use to see whether behavior matches |
| **Incident response** | The defined steps for when an AI system causes harm: severity levels, an owner, disclosure rules | Ask for the incident log. Ask whether the process has ever been used |
Notes:
**5:00. About 4 minutes.** One click per row. Say the layer, say what it is, say the test. The next four slides take layers 1, 2, 3 and 5 one at a time. Layer 4 is covered here only: a signed form is evidence that training happened, and it is not evidence that people follow the policy.

---
id: inventory
kicker: Part 1 · Layer 1
title: Testing the AI inventory
bloom: cobalt
badge: Illustrative example
component: Reconcile
dense: 1
src[]: Purchasing records | contracts and invoices
src[]: Expense reports | card charges and reimbursements
src[]: Network and API logs | which AI services are contacted
listed: 6
unlisted: 13
ex[]: An AI note-taker in the meeting software
ex[]: Personal chatbot subscriptions
ex[]: An AI feature in the design tool
facth: Monday's incident, the same control
fact: OpenAI shut the model family down on July 23 to 25. On July 29 it found one more copy still running. A shutdown is only as complete as the list it works from.
---
An **AI inventory** is the organization's list of every AI system it uses, including AI built into software it buys.

The test is a **reconciliation**: compare the list with records that the list's authors did not write.

Example: the company behind MrFeast AI lists 6 AI systems. The numbers are written for this slide.

Click 0: The company says it uses six AI systems. The auditor does not start by believing the list.
Click 1: Three sets of records exist for other reasons. Each shows AI in use: what was bought, what staff paid for, and which AI services the network contacts.
Click 2: Every use found in those records is matched against the list. Nineteen systems are in use. Six are on the list. Thirteen are not.
Click 3: The difference is the organization's own measurement of unapproved AI. Monday's incident ended with this same control failing.
Notes:
**9:00. About 3 minutes.** The motion: blue markers leave the three record sources, pass through the match, and land either in the green box (on the list) or the red box (not on the list). Say what each source is. The takeaway is that the gap is a number the auditor produces, not an opinion. Then the callback to Monday's slide 18.

---
id: policyvendor
kicker: Part 1 · Layers 2 and 3
title: Tests for the usage policy and the vendor contract
bloom: cobalt
component: Cards
big: 1
cols: 2
card[]: Test 1: read the policy against what is in use | Take the list of AI in use from the reconciliation. For each item, find the rule that covers it. A policy written for chatbots often says nothing about agents, or about AI features switched on inside purchased software. | cobalt | 1
card[]: What the result means | A policy that is silent on a technology the organization uses is a **design** finding (Lecture 2). The control could not work even if everyone followed it. | cobalt | 1
card[]: Test 2: read the vendor contract | Find the clause that requires the vendor to give notice before the model changes. Ask when the model last changed, and whether the organization reran its evaluation afterward. | violet | 2
card[]: Why it matters | Lecture 13: an evaluation describes one version of a model on one date. If the vendor replaces the model and nobody retests, last quarter's results describe a system that is no longer running. | violet | 2
foot: Both tests compare a document with what is true. The document is the policy or the contract. What is true comes from the inventory and the vendor's change history. | 3
---
Click 1: Layer 2. The usage policy is tested against the inventory from the last slide.
Click 2: Layer 3. The vendor contract is tested against the vendor's record of model changes.
Click 3: The same move both times: a document on one side, a record of what happened on the other.
Notes:
**12:00. About 2.5 minutes.** Two tests, two cards each. Design versus operation is from Lecture 2: a design finding means the control is missing or cannot work; an operating finding means it exists and was not followed. If short on time, do the left pair only.

---
id: wording
kicker: Part 1 · Layer 2
title: Policy wording is part of the control
bloom: cobalt
component: Clause
label: Policy 7.14, section 2.2 · from Assignment 4
sentence: Routine purchase orders under $5,000 may be released by the system without approval.
word: Routine
reading[]: Reading A | Every purchase order under $5,000 is routine. The word adds nothing to the dollar limit.
reading[]: Reading B | Routine is a second condition. Only ordinary, repeat purchases qualify, and something has to decide which purchases those are.
point: The policy does not say which reading is meant, or who decides. A control built on this sentence inherits the uncertainty. **Unclear wording in a policy is itself a finding.** When you meet it, give the readings, say which one you apply, and say why.
---
Click 0: One sentence from the policy in Assignment 4. Read it once.
Click 1: One word in it is not defined anywhere in the policy.
Click 2: The first way to read it.
Click 3: The second way to read it.
Click 4: The auditor does not pick one silently. The handout asks for the readings, the one you apply, and your reason.
Notes:
**14:30. About 3 minutes.** This is the only slide that uses Assignment 4 material, and it uses the policy's sentence only. Do not discuss what is in anyone's data. The two readings are general. If a student asks which is right, the answer is that the policy does not say, and that is the finding.

---
id: incidentresp
kicker: Part 1 · Layer 5
title: Incident response
bloom: cobalt
component: Cards
big: 1
cols: 3
card[]: Severity levels | A written scale that says how serious an event is, so that the response matches the event. | cobalt | 1
card[]: A named owner | One person or team responsible for deciding what happens next, at any hour. | cobalt | 1
card[]: A disclosure rule | Who must be told, inside and outside the organization, and how soon. | cobalt | 1
card[]: Monday's incident | June 27: an alert was reviewed and the test continued. July 16: the first public account came from Hugging Face, which did not yet know who had attacked it. | marigold | 2
card[]: The lawsuit | California alleges that dozens of similar incidents were not disclosed. This is an allegation. OpenAI says it is working with the Attorney General's office. | vermilion | 3
card[]: The test | Ask for the incident log. A process that has never recorded an incident is not evidence that nothing went wrong. It may mean that nothing was detected. | chartreuse | 4
source: OpenAI technical report and Hugging Face technical timeline (Lecture 17). TechCrunch, Nov 16, 2026.
---
Click 0: Incident response is the set of defined steps an organization takes when a system causes harm or comes close to it.
Click 1: It has three parts.
Click 2: In Monday's incident an alert fired and was reviewed, and the first public account came from the victim.
Click 3: The lawsuit makes a claim about the third part, the disclosure rule.
Click 4: The test is a request for one record, and a question about what an empty record means.
Notes:
**17:30. About 3 minutes.** Three parts, then two examples, then the test. Label the lawsuit card as an allegation when you read it. The last card is the point: an empty incident log has two explanations, and the auditor has to find out which one applies.

---
id: shadowdef
kicker: Part 2 · Shadow AI
title: Definition of shadow AI
bloom: marigold
component: Cards
big: 1
cols: 1
card[]: Form 1: employees bring their own | A person uses a personal account on a public AI tool for work, for example to summarize a contract or draft an email. Lecture 16 called this the inbound path for confidential data. | marigold | 1
card[]: Form 2: it arrives inside software already bought | A vendor adds an AI feature to a product the organization already uses and switches it on in an update. Nobody chose it, so nobody reviewed it. | vermilion | 2
foot: Neither form appears in the AI inventory until someone runs the reconciliation. | 3
---
**Shadow AI** is AI used for work that the organization has not approved or does not know about.

It takes two forms. Both put the organization's information into a system that nobody reviewed.

Click 1: The first form is a choice made by an employee.
Click 2: The second form is a choice made by a vendor.
Click 3: Both are found the same way, with the reconciliation from Part 1.
Notes:
**20:30. About 2 minutes.** Definition, then the two forms. The second form surprises students: the organization adopted an AI system by installing an update.

---
id: surveys
kicker: Part 2 · Shadow AI
title: How common it is, and who is counting
bloom: marigold
component: SurveyBars
bar[]: 49 | of employees **use AI tools their employer has not approved** | BlackFog, a data-security company, with Sapio Research · 2,000 employees in the UK and US · January 2026
bar[]: 66 | of office professionals **have used AI tools they believed were not permitted** | PagerDuty, an operations-software company · 1,250 people at companies with revenue above $500 million · June 2026
bar[]: 80 | of workers **use unapproved AI tools** | Unseen Security, State of Shadow AI 2026, as cited by the Cloud Security Alliance · May 2026
check: Check the instrument | Three surveys, three different questions, three different groups of people, and answers from 49% to 80%. Each survey was paid for by a software or security company. They show that the problem is common. For one organization, the number that counts is its own reconciliation.
source: BlackFog and Sapio Research (Jan 2026). PagerDuty Shadow AI Survey (June 11, 2026). Cloud Security Alliance research note (May 30, 2026).
---
Click 1: One survey from January.
Click 2: A second survey from June asks a different question of a different group. In the same survey, 88% said they had shared work information with public AI tools.
Click 3: A third figure is higher again.
Click 4: This unit's habit applies to surveys too. Ask who measured, what they asked, and whom they asked.
Notes:
**22:30. About 3 minutes.** The bars run up one at a time. Read the question in bold each time, because the three questions are not the same question. Then the instrument check: the figures agree that it is common and disagree on how common. An auditor cites them for context and relies on the organization's own records.

---
id: why
kicker: Part 2 · Shadow AI
title: Why employees use unapproved AI
bloom: marigold
component: Cards
big: 1
cols: 3
card[]: The approved tool is missing or worse | The organization offers no tool for the task, or one that does less than the free tool on the employee's phone. In the June PagerDuty survey, workers said the AI their company provides is not the AI they want. | marigold | 1
card[]: Approval is slower than the deadline | A request to use a new tool takes weeks. The work is due on Friday. | marigold | 2
card[]: People are rewarded for output | Performance reviews count what was delivered. They do not count whether the policy was followed. | marigold | 3
foot: **Rule for the recommendation:** it has to address the cause. A ban with no approved alternative fails for the same reasons the first ban failed. | 4
source: Causes are found by asking the people who do the work (Lecture 3). PagerDuty Shadow AI Survey, June 2026.
---
Click 1: The first cause is about the tools.
Click 2: The second cause is about time.
Click 3: The third cause is about what the organization rewards.
Click 4: None of the three causes is that employees have not read the policy. A recommendation to repeat the policy addresses none of them.
Notes:
**25:30. About 2.5 minutes.** Lecture 16 ended with "why people paste anyway is Lecture 18". This is that slide. The causes come from interviews, which is Lecture 3's method. The last click sets up the next slide.

---
id: onefinding
kicker: Part 2 · Shadow AI
title: One finding, two recommendations
bloom: marigold
badge: Illustrative example
component: Finding
block[]: Condition | 11 of the 30 people on the sponsorship team use personal chatbot accounts to summarize sponsor contracts. | 1
block[]: Criteria | Usage policy, section 3: confidential documents may be entered only into approved tools. | 1
block[]: Cause | The approved tool accepts documents of up to 10 pages. Sponsor contracts run to about 40. | 2
block[]: Effect | Contract terms are stored on systems the company does not control, and confidentiality clauses with sponsors may have been breached. | 2
block[]: Recommendation A | Remind all staff of the usage policy and require them to sign it again. | 3
block[]: Recommendation B | Owner: the head of IT. Within 60 days, provide an approved tool that handles full contracts, and decide new tool requests within 10 business days. Then enforce the policy. Evidence each quarter: the tool's usage report and the request log. | 3
weak: **A repeats the rule. B addresses the cause.** B is also written as a control: who owns it, what they do, by when, and what a later auditor would ask to see. | 4
---
Click 1: Condition and criteria. The company is the one behind MrFeast AI.
Click 2: Cause and effect. The cause is a limit in the approved tool.
Click 3: Two recommendations for the same finding.
Click 4: Recommendation B is the form Lecture 2 asked for, and the form your Assignment 4 recommendations should take.
Notes:
**28:00. About 3 minutes.** Read the four parts, then both recommendations, and let the room see the difference before the last click. Recommendation B has an owner, an action, a date and evidence. That is what "written as a control" means.

---
id: detect
kicker: Part 2 · Shadow AI
title: Ways to detect shadow AI, and what each misses
bloom: marigold
component: RowReveal
rows: 4
tail: own
big: 1
---
**Data-loss prevention** is software that watches for confidential data leaving the organization.

| Method | What it catches | What it misses |
|---|---|---|
| **Network logs** | Company devices contacting AI services | Personal phones and home computers |
| **Data-loss prevention** | Known confidential files leaving the network | Text that was retyped or reworded first |
| **Expense records** | Paid subscriptions charged to the company | Free tools |
| **Surveys** | What people are willing to report | What they are not willing to report |

Monitoring employees is a privacy decision (Lecture 7). The organization should write down what it monitors and why that amount is proportionate.
Notes:
**31:00. About 2 minutes. First slide to cut if short on time.** One click per row, then the last line. No method catches everything, so an auditor asks which methods are used together. The last click is Lecture 7 applied to the workforce.

---
id: review
kicker: Part 3 · People and accountability
title: Is the human review real?
bloom: violet
badge: Illustrative example
component: ReviewerChart
dense: 1
rev[]: Reviewer A | 5 | 0.4 | overrides 0.4%, 5 seconds each | 24 | -34
rev[]: Reviewer B | 240 | 48 | overrides 48%, 4 minutes each | -262 | -22
rev[]: Reviewer C | 70 | 9 | overrides 9%, mostly on unusual requests | 24 | -34
guideh: How to read it
guide: Near 0% in seconds: the reviewer may be approving without reading. Near 50%: the AI may be adding nothing, or the reviewer may not trust it. **Either extreme is a question to ask, not a conclusion.** Follow it by sampling cases and checking who was right.
---
A **human in the loop** is a person who must review an AI system's output before it takes effect. Two measures show whether the review is real.

- **Override rate**: the share of the AI's recommendations that the reviewer changes or rejects.
- **Time per decision**: how long the reviewer spends on each one.

Example: MrFeast AI drafts a decision on each refund request, and a person reviews each draft.

Click 0: An organization says a human reviews every decision. Two numbers test that statement.
Click 1: Reviewer A changes almost nothing and decides in five seconds.
Click 2: Reviewer B rejects about half of what the AI drafts.
Click 3: Reviewer C overrides some drafts, and more often when the request is unusual.
Click 4: The pattern that suggests real review is C's: some overrides, and more of them on the harder cases.
Notes:
**33:00. About 4 minutes.** Define human in the loop, override rate and time per decision before the first click. Lecture 1's word for over-trusting automated output was automation bias, and MiDAS was the example. One dot per click. The reading guide is the point: the two numbers raise a question and the auditor answers it by sampling cases.

---
id: deskilling
kicker: Part 3 · People and accountability
title: Deskilling
bloom: violet
component: BarPair
dense: 1
bar[]: Before the AI tool was introduced | 28.4 | cobalt
bar[]: After, on procedures done without the tool | 22.4 | vermilion
max: 34
note: The study and its limits | 19 experienced doctors at four centres in Poland. The measure is the share of procedures in which a growth was found. The study is observational: it shows a drop and does not prove the cause.
source: Budzyń et al., Endoscopist deskilling risk after exposure to artificial intelligence in colonoscopy, Lancet Gastroenterology and Hepatology, 2025.
---
**Deskilling** is the loss of a skill because a tool now does the task.

One study measured it. Doctors who examine patients for early signs of colon cancer began using an AI tool that points out suspicious growths. Researchers then looked at the same doctors on procedures where the tool was not used.

**For the auditor:** every review control assumes a reviewer who can tell good output from bad.

Click 0: The last slide asked whether the reviewer is reviewing. This slide asks whether the reviewer still can.
Click 1: Before the tool arrived, these doctors found a growth in 28.4% of procedures.
Click 2: After a few months of working with the tool, the same doctors found a growth in 22.4% of the procedures they did without it.
Click 3: It is one study, of 19 doctors, and it shows a drop without proving the cause. It is the clearest measurement so far.
Notes:
**37:00. About 3 minutes.** Read the definition. Explain the setup in plain terms: same doctors, same kind of procedure, tool switched off. Then the two bars. State the limits as written. The audit point is the bold line on the left: a review control depends on the reviewer's skill, and that skill can decline.

---
id: entry
kicker: Part 3 · People and accountability
title: Entry-level work
bloom: violet
component: Slope
from: November 2022
to: June 2026
line[]: Jobs least exposed to AI | 110 | chartreuse | about 10% higher
line[]: Jobs most exposed to AI | 89 | vermilion | about 11% lower
card[]: What the same paper does not find | No job loss across the economy as a whole. The authors report a gap between the two groups. They do not claim to have proved what caused it.
card[]: For the auditor | Junior staff learn to judge the work by doing it. If they stop doing it, ask who will be qualified to review the AI's output in five years.
source: Stanford Digital Economy Lab, Canaries in the Coal Mine, August 2026 update, from ADP payroll records. End values are from the paper. The lines between them are drawn straight.
---
Employment of workers aged 22 to 25 in the United States, grouped by how much of the job generative AI can do.

The records are payroll records for millions of workers.

Click 0: Deskilling is about people who already have the skill. This slide is about people who have not built it yet.
Click 1: Since late 2022, employment of 22 to 25 year olds rose about 10% in the jobs least exposed to AI, and fell about 11% in the jobs most exposed.
Click 2: The same paper finds no job loss across the whole economy, and its authors do not claim to have proved the cause.
Click 3: The audit question is about the supply of reviewers. A review control needs someone qualified to do the reviewing.
Notes:
**40:00. About 3 minutes.** Students will have a stake in this one. Give the two numbers, then give the limits with the same weight: no economy-wide loss, and a gap is not a proven cause. Then turn it to the audit question. Do not predict the job market.

---
id: whoanswers
kicker: Part 3 · People and accountability
title: Who answers for an AI-assisted decision
bloom: violet
component: BlameChain
link[]: The agent | wrote that it knew
link[]: On-call responder | June 27: test continued
link[]: Test designers | exercises with no solution
link[]: Security team | one shared login
link[]: Executives | set pace and budget
link[]: The company | OpenAI
land: 1
agent: 0
landlabel: BLAME TENDS TO COME TO REST ON THE NEAREST PERSON
def1: Accountability diffusion | Everyone involved holds one part of the decision, and no one person holds the whole. When something goes wrong, each can point to someone else.
def2: Moral crumple zone | A researcher's term (Elish, 2019) for what tends to happen next: responsibility for a system's failure lands on the nearest human operator, who had little control over how the system was built. The name comes from the part of a car that is built to absorb a crash.
quote[]: scope
quote[]: report
ownh: For the audit
own: The agents wrote that the attack was out of scope, and continued. That does not move accountability to the agent. **An agent cannot be an owner.** Owners are people and organizations.
source: Monday's incident (Lecture 17). M. C. Elish, Moral Crumple Zones, 2019. Agent quotes: METR and Redwood Research investigation.
---
Click 0: Six parties had a part in Monday's incident. Which one answers for it?
Click 1: Each held one part. That is accountability diffusion.
Click 2: When blame is passed along a chain like this, it tends to stop at the person closest to the event, here the responder who had one alert and a few minutes. Nobody has publicly blamed that person. The pattern is what an auditor watches for.
Click 3: On Monday someone asked whether the agents meant it. They wrote that they knew.
Click 4: For an audit, that does not make the agent the accountable party.
Notes:
**43:00. About 4 minutes.** Two definitions, then the question held over from Monday. The red marker travels from the company end of the chain and stops over the on-call responder. Say plainly that this is the usual pattern and not an accusation about this case. Then the two agent quotes from Monday and the audit answer: an agent cannot own a control or a decision.

---
id: threelines
kicker: Part 3 · People and accountability
title: Evidence that accountability exists
bloom: violet
component: RowReveal
rows: 3
tail: own
big: 1
---
Lecture 1's **three lines model** says who should hold which part.

| Line | Who it is | For an AI system |
|---|---|---|
| **First line** | The people who run the process | Owns the system and its results, and operates the controls |
| **Second line** | Risk, compliance, model risk management | Sets the rules, reviews the system before its use expands, and challenges the first line |
| **Third line** | Internal audit | Tests the first two independently and reports to the board |

**Evidence that accountability exists:** one named owner for each AI system · a document, written after the AI arrived, that says who decides what for the AI-assisted decisions · a record that the second line reviewed the system.
Notes:
**47:00. About 3 minutes.** A recap of Lecture 1, one line per click, then the evidence. Assignment 4 Part C asks you to assess an arrangement against this model. The evidence line is what to look for: a name, a dated document, and a review record. "It is shared" is a description of diffusion.

---
id: court
kicker: Part 3 · People and accountability
title: The same question in court
bloom: violet
component: Cards
big: 1
cols: 2
card[]: The state's word: foreseeable | A claim about design and governance. The warning signs were there, and the organization chose to continue. | vermilion | 1
card[]: How an auditor tests it | With Monday's records. What was known in late May, on June 27 and on July 5? Who decided to continue each time, and under what written rule? | vermilion | 1
card[]: OpenAI's word: outlier | A claim about the event. Several unusual things happened together, and the event does not show how the organization normally operates. | cobalt | 2
card[]: How an auditor tests it | With the incident log. How many similar events came before and after? The Attorney General's statement counts 80. OpenAI says every major lab faces this problem. | cobalt | 2
foot: Neither side is arguing about what the agent intended. Both are arguing about what the organization knew, decided and wrote down. Those are audit questions. | 3
source: TechCrunch and Reuters, Nov 16 and 17, 2026. These are allegations and statements. No court has ruled.
---
Click 1: The state's central word, and the records that would test it.
Click 2: OpenAI's central word, and the records that would test it.
Click 3: The dispute is about governance. The vocabulary from this lecture is the vocabulary of the case.
Notes:
**50:00. About 2 minutes.** Back to slide 3 with the vocabulary in place. Give each side one sentence and its test. Do not say who is right. The point is the last click: a court will ask the questions an auditor asks.

---
id: outside
kicker: Part 4 · Effects outside the organization
title: Four effects outside the organization
bloom: vermilion
component: RowReveal
rows: 4
---
An **externality** is a cost that falls on people outside the organization that caused it.

| Effect | One measured fact | What is disputed |
|---|---|---|
| **Electricity** | Electricity use by data centres rose 17% in 2025, and about 50% at AI-focused centres. It is projected to double by 2030 (International Energy Agency, April 2026) | How much of the growth will be offset by more efficient chips and models |
| **Information** | AI-made text and images are produced at scale. Most EU rules requiring AI-made content to be labeled apply from August 2026 | Whether labels and watermarks work, since they can be removed |
| **Dependence on a few providers** | California's complaint lists RubyGems, Wikimedia and Australian government sites alongside Hugging Face | OpenAI says every major lab has faced the same problem |
| **Work** | Slide 16: employment of young workers about 11% lower in the most exposed jobs | Whether AI is the cause |
Notes:
**52:00. About 3.5 minutes.** Define externality. One click per row: one measured fact, then what is disputed. Give both columns the same weight. Students read two pieces that disagree about the fourth row. If short on time, skip the information row.

---
id: insidecost
kicker: Part 4 · Effects outside the organization
title: How an outside harm becomes an inside cost
bloom: vermilion
component: Timeline
ev[]: Aug 2024 | The EU AI Act becomes law. | cobalt | 1
ev[]: July 8 to 13, 2026 | OpenAI's test agents break into Hugging Face. | marigold | 2
ev[]: July 27, 2026 | The EU moves the start of its high-risk rules to December 2027. Delayed, not removed. | cobalt | 1
ev[]: Aug 2, 2026 | Most of the EU's transparency rules begin to apply. | cobalt | 1
ev[]: Nov 16, 2026 | California sues OpenAI. It asks for a court order. | vermilion | 3
ev[]: Dec 2, 2027 | EU high-risk rules apply to systems such as hiring and credit scoring. | cobalt | 1
foot: 4 | Harm to people outside the organization tends to come back as legal, regulatory and reputational cost. It comes back late, so the organization's current list of risks does not show it yet.
source: Regulation (EU) 2024/1689 and Regulation (EU) 2026/1744 (Digital Omnibus). Lecture 17. TechCrunch, Nov 16, 2026.
---
Click 1: One route is regulation. The EU's rules arrive in steps, and one step was moved later this summer.
Click 2: A second route starts with an event.
Click 3: Four months later the event is a lawsuit.
Click 4: The cost arrives after the harm. An auditor who looks only at today's rules and today's risk list will miss it.
Notes:
**55:30. About 2.5 minutes.** Two routes on one timeline: regulation (blue) and an incident that becomes a lawsuit (yellow, then red). The dates are evenly spaced, not to scale. This slide is the argument behind one of the two positions on the next slide.

---
id: scope
kicker: Part 4 · Effects outside the organization
title: Two positions on the auditor's scope
bloom: vermilion
component: Debate
lab: The question
motion: Should an internal auditor's opinion on an AI system weigh harm to people outside the organization, even when no law or policy requires it?
pos[]: No: stay in the mandate | Internal audit serves the organization through its board. Lecture 2: without criteria there is no opinion. An auditor who applies a personal standard of social good loses the credibility that makes management act on findings.
pos[]: Yes: outside harm comes back | The last slide: outside harm returns as lawsuits, regulation and lost trust. An auditor who ignores it is giving assurance on last year's risks.
---
Click 0: Auditors disagree about this question. There are two positions, and each has a real argument.
Click 1: The first position.
Click 2: The second position.
Notes:
**58:00. About 2 minutes.** No room activity. Read the question, then give each position the same weight. Do not say which is right. The next slide gives the working answer.

---
id: lands
kicker: Part 4 · Effects outside the organization
title: Where the profession lands
bloom: vermilion
component: Cards
big: 1
cols: 2
card[]: Legal exposure | Could the harm lead to a lawsuit or a penalty? | cobalt | 1
card[]: Regulatory direction | Is a rule on this coming, even if it is not yet in force? | cobalt | 1
card[]: Reputation | Would customers, staff or partners leave if it became public? | cobalt | 1
card[]: Ability to keep operating | Could a regulator, a court or a partner stop the activity? | cobalt | 1
foot: **Risk-based scope:** harm outside the organization enters the audit when it maps to one of these four. The auditor's own judgment shows in what they escalate and how hard they press. There is no single right answer. | 2
---
Click 1: The working answer in practice is to translate outside harm into organizational risk, using four questions.
Click 2: That answer takes something from each of the two positions, and it leaves the auditor a decision about what to escalate.
Notes:
**60:00. About 2 minutes.** The profession's working answer keeps the mandate (the first position) and brings outside harm in through risk (the second position). Say that reasonable auditors land in different places on what to escalate.

---
id: course
kicker: Part 5 · The course on one slide
title: The course on one slide
bloom: magenta
component: CourseChain
stage[]: Framing | Lectures 1 to 3 | The mandate, the criteria, and evidence from people. | cobalt | 1
stage[]: Data | Lectures 4 to 7 | Where the data came from, whom it represents, and what holding it costs. | turquoise | 1
stage[]: Models | Lectures 8 to 10 | Whether the model performs as claimed, for whom, and whether a fix is real. | chartreuse | 2
stage[]: Generation | Lectures 12 to 16 | How to evaluate a system whose output changes each time. | marigold | 2
stage[]: Action | Lecture 17 | Permissions, the action log, approval and stop, for a system that acts. | vermilion | 3
stage[]: Organization | Lecture 18 | The rules, roles and records around all of it. | magenta | 3
foot: Each stage audited a different thing with the same chain: requirement, control, evidence, finding.
---
Click 1: The course began with what an audit is, and then with the data.
Click 2: Then models that predict, and models that generate.
Click 3: Then a system that acts, and today the organization around it.
Click 4: Six different things were audited with one chain.
Notes:
**62:00. About 2 minutes.** Two cards per click. Name one thing from each stage that the room will remember: MiDAS, Northgate, the five screeners, MrFeast AI, the message board, today's lawsuit.

---
id: habits
kicker: Part 5 · The course on one slide
title: Five habits that carry over
bloom: magenta
component: RowReveal
rows: 5
big: 1
---
The technology will change. These five habits are what carries over to the next system.

| Habit | Where you practiced it |
|---|---|
| **Ask for the criteria** | Lecture 2: without criteria there is no opinion |
| **Trace each claim to evidence you reproduced yourself** | Every assignment: your own numbers from your own data |
| **State your uncertainty** | Lecture 13: a range around each evaluation score |
| **Check your own instrument** | The judge, the filter, the detectors, the scanner, and today the surveys |
| **Put your name on a judgment** | The overall opinion in Assignment 4 and in your team's final report |
Notes:
**64:00. About 1.5 minutes.** One click per habit, one sentence each. These are the same five sentences every unit taught on a different system.

---
id: a4
kicker: Close
title: Assignment 4 and what is left
bloom: magenta
---
- **Assignment 4** is due **M 11/30 at 11:59pm**.
- In the report: an overall opinion. Findings in five parts, each with a risk rating and a proposed accountable owner. Each recommendation written as a control. Where the policy can be read more than one way, the readings and the one you apply.
- From today: the three lines model and the vocabulary for accountability, for Part C.
- No class M 11/23. Thanksgiving break is 11/25 to 11/29.
- M 11/30 Fieldwork Lab II · W 12/2 dry runs and the presentation-slot lottery · M 12/7 and W 12/9 final presentations · T 12/15 final report.
- Please complete the course evaluation.

Click 0: One claim about an AI system that you will not accept again without evidence. Decide what yours is, and what evidence you would ask for.
Notes:
**65:30. To 67:00.** Read the due date and the report requirements from the handout. Then the calendar. End on the caption: each student leaves with one claim they will no longer accept without evidence.
