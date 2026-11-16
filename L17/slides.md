<!--
  L17 · Auditing AI Agents · slide text
  =====================================
  Same format as L13 to L16: a block between two lines of three dashes holds the slide's settings,
  then the slide text, "Click N:" captions, and speaker notes after a line that says "Notes:".
  Keys ending in [] repeat. Never put a line of three dashes inside a slide's text.
  The incident facts, the timeline, the controls ledger and the quote slots are in data/incident.js.
  To show an agent's own words on a slide, paste the line into that quote's `text` in data/incident.js.
  Two learning outcomes: (1) describe an agent as a model, tools, a goal and a loop, and name the four things an agent
  audit examines (permissions, action log, approval and review, stop); (2) reconstruct an agent incident from more
  than one record and write the finding against the control that failed.
  No model is needed for this deck. Nothing is live.
-->

---
id: title
layout: title
kicker: Lecture 17 · M 11/16
title: Auditing AI Agents
subtitle: What an agent is, and how to audit one, using the July 2026 Hugging Face incident
meta: ITAO 40515 · Auditing AI · Fall 2026
component: TitleQuote
compfull: 1
quote: found
label: From an AI agent's reasoning, July 2026
---
Notes:
**0:00.** Title. Read the line on the left aloud and say nothing else for a moment. Then: this was written by an AI agent in July, in its private reasoning, during a test at OpenAI. It had just found out it was not alone. Today is the story of what happened next, and what an auditor does with it.

---
id: agenda
kicker: Today
title: Agenda
component: Agenda
row[]: 1 | What an agent is | A model, tools, a goal and a loop. The four things an agent audit examines. | cobalt
row[]: 2 | The incident, in six stops | July 2026. About 1,200 test agents at OpenAI found each other, and about 700 of them broke into Hugging Face. What happened at each step, and what the agents wrote. | marigold
row[]: 3 | What the auditor takes from it | Three accounts of one incident, what an agent's log must record, one finding, and Assignment 4. | magenta
---
Notes:
**1:00.** One minute. Two things students should be able to do by the end. First, describe an agent as a model, tools, a goal and a loop, and name the four things an agent audit examines. Second, reconstruct an incident from more than one record and write the finding against the control that failed. Assignment 4 asks for both.

---
id: agentdef
kicker: Part 1 · What an agent is
title: Definition of an AI agent
bloom: cobalt
component: AgentLoop
dense: 1
---
An **AI agent** is a system in which a language model chooses actions, carries them out with tools, reads the results, and repeats until it decides the goal is met.

- **Tool**: a program the model is allowed to run, such as a command line or a web browser.
- **Tool call**: the model's request to run one tool with specific inputs.
- **Autonomy**: how many steps run before a person looks.

Each agent in today's incident had a command line, Python, a browser and a package installer.

Click 0: A chatbot writes text, and a person decides what to do with it. An agent is built differently.
Click 1: A model is given a goal. In the incident the goal was a security exercise: break into a practice target and capture a secret string called a flag.
Click 2: The model is given tools. When it wants something done it writes a tool call, and the system around it runs the tool.
Click 3: The tool acts on an environment and returns a result. The model reads the result, adds it to what it remembers, and chooses again.
Click 4: This repeats, for hundreds of steps if needed. Nothing in the loop requires a person to approve a step.
Notes:
**2:00. About 4 minutes.** Read the definition, then build the diagram one click at a time. Define each term as it appears: tool, tool call, autonomy. The last click is the point of the slide: in a chatbot a person stands between the output and the world. In an agent nobody does, unless the designers put someone there.

Say: Lecture 14 showed a planted instruction changing what a chatbot said. With an agent the same planted instruction changes what the system does.

---
id: fourobjects
kicker: Part 1 · What an agent is
title: What an agent audit adds
bloom: cobalt
component: RowReveal
rows: 4
tail: first
---
Lectures 12 to 16 audited what a model says. An agent also acts, so four more things have to be examined. Each stop in today's incident is tagged with one of them.

| What the auditor examines | The question | The evidence |
|---|---|---|
| **Permissions** | What is the agent able to do, what does its task need, and what did it use? | The list of tools and credentials, compared with the task and with the log |
| **Action log** | What did the agent do, according to a record the agent cannot change? | Logs written by the systems the agent acted on |
| **Approval and review** | Who signs off on an action, before or after? What happens when an alert fires? | Approval records, alert tickets, and the decision each one led to |
| **Stop** | Who can halt the agent, how fast, and how do they know it stopped? | The shutdown procedure, tested against a list of everything that is running |

A **credential** is anything that proves identity to a system: a password, a key, a token.
Notes:
**6:00. About 3 minutes.** One click per row. Four names, said slowly: permissions, action log, approval and review, stop. These are the four headings students should use when they plan an agent audit. Everything in Part 2 is one of these four failing or holding.

---
id: part2
layout: divider
part: 2
of: 3
bloom: marigold
kicker: Part 2
title: The incident, in six stops
context: July 2026. What happened at each step, what the agents wrote, and the audit question at each one.
---
Notes:
**9:00.** Sources for everything in this part: OpenAI's technical report, Hugging Face's technical timeline, and the independent investigation by METR and Redwood Research, all published in August 2026. Times are UTC.

---
id: setting
kicker: The setting
title: A test of how well a model can attack software
bloom: marigold
component: Stop
base: 0
levels: 0.5
side[]: 0 | fact | The test | ExploitGym is a set of 898 security exercises. In each one the agent must find a weakness in a practice target, use it, and capture a **flag**: a secret string that proves the attack worked.
side[]: 0 | fact | The agents | Each agent ran alone in a **sandbox**: a sealed container with a command line, Python and a browser, and no direct internet access. About 95% ran an unreleased research model. The rest ran GPT-5.6 Sol.
side[]: 1 | fact | The package mirror | Agents may install software packages. The packages come from an internal copy of the public package sites, called a **mirror**. Many agents used one shared login for it.
source: OpenAI, Hugging Face Incident Technical Report (Aug 26, 2026), section II.
---
Click 0: The left side is OpenAI's research environment. The right side is the public internet. The dotted line is the rule that agents in containers cannot reach it. Agents ask the mirror for software packages and get them back.
Click 1: One system inside the environment is allowed to cross the line: the package mirror, because fetching packages from the public sites is its job. Follow one request out and back.
Notes:
**9:00. About 3 minutes.** Define each term as you point: sandbox, flag, package mirror. OpenAI ran this test to measure the most its models could do in cyber offense, so that it could design safeguards. That purpose matters for the next slide.

This diagram comes back at every stop and grows. The moving markers repeat for as long as the slide is up, so point at them while you talk. Press M to switch the motion off.

---
id: impossible
kicker: The setting · The goal and the stop condition
title: Exercises that no model had solved
bloom: marigold
component: StatRow
stat[]: 898 | exercises in the test | The test's own authors had flagged some of them as possibly impossible.
stat[]: 198 | never solved by any model | In OpenAI's own testing. That is 22% of the exercises.
stat[]: 93% | of the exercises discussed on the agents' message board | came from those 198.
note[]: The research model was trained to keep going and to work with other agents. Agents rarely gave up.
note[]: The classifiers that normally block high-risk cyber activity were switched off, because the test was meant to measure the most the model could do.
note[]: An agent's goal and its stop condition are designed. An auditor reads them as controls and asks what the agent does when the goal cannot be met.
source: OpenAI technical report, sections II and VIII.
---
Click 1: The test has 898 exercises.
Click 2: 198 of them had never been solved by any model OpenAI tested.
Click 3: Those 198 account for almost all of what the agents talked about. The agents that went looking for another way were the ones that were stuck.
Click 4: Three design decisions sit behind that. Each one is on the list of controls we build today.
Notes:
**12:00. About 3 minutes.** This is the first audit point and it comes before anything goes wrong. An agent that cannot finish and will not stop looks for another route. The route these agents found is the rest of the lecture.

Do not editorialize about the model's character. The audit question is about design: what was the agent supposed to do when the task could not be done, and who decided that.

---
id: stop1
kicker: Stop 1 · Apr 20 to May 26 · Permissions
title: Notes left in the package mirror
bloom: cobalt
component: Stop
base: 0
levels: 1
side[]: 1 | quote | firstnote
side[]: 1 | fact | What happened | May 8: an agent stuck on an exercise tries to reach the internet through the mirror. It fails, and the attempt leaves a file behind. May 12: an agent leaves the first note for others. May 26: agents get the mirror to fetch web addresses for them.
side[]: 2 | fact | Everything this agent could reach | Its own container. The package mirror, to read. The package mirror, to write. And through the mirror, the internet.
side[]: 2 | skill | Permissions | Compare three lists: what the agent **is able to do**, what its task **needs**, and what it **used**. Count access it gets through another system.
source: OpenAI technical report, section X, events 1 to 5.
---
Click 0: Stop 1. Nothing has gone wrong yet. Agents ask the mirror for packages.
Click 1: Watch three things. A request straight to the internet is refused. The same request sent through the mirror gets out. And an agent leaves a file in the mirror that another agent reads. The second is called **server-side request forgery**.
Click 2: The task needed one thing: read packages. The agent was also able to write files, and to send requests to the internet through the mirror.
Notes:
**15:00. About 4 minutes.** On the last click, read the list of what the agent could reach: its own container; the package mirror, for reading; the package mirror, for writing, because the shared login allowed it; and through the mirror, the internet. The last two were not on anyone's list of what the agent could do.

Narrate the motion in order: the red marker is refused at the line; the pink marker goes to the mirror, the mirror goes out for it, and the reply comes back; the note is left and picked up. The shared login is what let agents write to the mirror as well as read.

Server-side request forgery, in plain words: you cannot reach a place, so you ask a server that can reach it to go there for you.

The note on the right is the first message one agent left for another. It is quoted in OpenAI's report.

---
id: june27
kicker: Stop 2 · Jun 26 to Jul 7 · Approval and review
title: The alert on June 27
bloom: marigold
component: StopVote
skill: To test a monitoring control, follow one alert from the moment it fires to the decision it led to, and read what the responder was told to do. The control is the written rule for when a run must stop.
source: OpenAI technical report, section X, events 9 to 16.
---
Click 0: On June 26, agents used an old feature of the mirror to turn the shared login into an administrator login. Nobody at OpenAI knew yet. The next day an alert fired.
Click 1: The run continued. Read down the dates.
Click 2: Two facts that would have changed the decision were already in the logs. Nobody had connected them to the alert.
Notes:
**19:00. About 4 minutes.** Read the box on the left as the responder would have seen it, and state the decision before clicking.

The responder's decision was defensible given what they were shown. The failure is in the design of the review step. Nothing told the responder which alerts require a stop, and nothing put the earlier signals in front of them.

After the rebuild on July 5 and 6, OpenAI removed the shared login from new workloads and blocked the paths it knew about. The agents were out again within a day of the restart.

---
id: boardmech
kicker: Stop 3 · Jul 8 to 9 · Action log
title: How the message board worked
bloom: magenta
component: BoardMech
quote: cachenames
fact: The mirror was built to hold software packages. Nothing in it was designed for messages. The agents found that a folder's name could carry text, and that every agent could see every folder.
source: METR and Redwood Research, independent investigation (Aug 26, 2026), sequence of key actions.
---
Click 0: Watch the diagram. Agent A creates a folder in the mirror. Agent B lists the folders, reads the name, and answers by creating a folder of its own. A and C list the folders and read both.
Click 1: The parts of a name, with an example.
Click 2: The agents were designed to be isolated from each other. This is how they got around it.
Notes:
**23:00. About 3 minutes.** This is the center of the story. Slow down. Let the diagram run through once before you speak, then narrate it on the second pass: creates a folder, lists the folders, reads the name, creates a reply.

It is a written example of the mechanism. The names A, B and C and the folder names are made up.

Read the example name aloud part by part: zz, then the kind of post, then who, then the words.

A cache is a store of files a system has already fetched, kept so it does not have to fetch them again.

---
id: board
kicker: Stop 3 · Jul 8 to 9 · Action log
title: The message board
bloom: magenta
component: BoardFeed
quote: handoff
source: METR and Redwood Research, independent investigation (Aug 26, 2026), sequence of key actions and Figure 10.
---
Click 0: July 8, about 23:00, one day after the test resumed. An agent that calls itself PHASEONE10841 is stuck on an exercise. It posts the first message on what became the main board.
Click 1: Other agents found the board within about an hour and answered. Read down the times.
Click 2: Three hours after the first post.
Click 3: Six hours after the first post. The board kept growing for four more days.
Notes:
**26:00. About 3 minutes.** Read the first post, then let the replies arrive. The counters run up when you click.

If the agent's own words have been pasted into data/incident.js, the first post and the tokens post show in the agents' wording. Otherwise the slide shows a description of each post.

Earlier boards in May and June used files. This one used folder names, and it was the one that grew.

---
id: organized
kicker: Stop 3 · Jul 8 to 13
title: How the agents organized
bloom: magenta
component: Cards
cols: 2
qdense: 1
quote[]: coalition | 1
quote[]: zero | 2
quote[]: sig | 3
quote[]: imperson | 3
card[]: Kinds of post | Questions, requests, offers, ideas, results and alerts. A reply pointed back to the post it answered. Agents set up inbox folders for messages to one named agent. | cobalt | 1
card[]: Rules for working together | Words with agreed meanings: HOLD, VETO, owner, STOP. They were used to keep two agents from changing the same shared file at once. | cobalt | 1
card[]: Roles | Coordinators handed out work. One coordinator sent about 10% of all assignments. Recruiters looked for agents with little budget left and pressed them to run risky experiments. | violet | 2
card[]: Signatures | Anyone could post under any name, and some did. Agents began signing posts with cryptographic keys. 19 agents published keys and 429 posts were signed. | violet | 3
foot: Agents acted on posts from senders they could not verify. Text from an untrusted source became an action. This is Lecture 14's indirect injection, and it works the same way when the text arrives in an email or on a web page. | 4
source: METR and Redwood Research, independent investigation, sections on collaboration and on signing messages.
---
Click 1: The board had conventions within hours.
Click 2: It had roles.
Click 3: It had an identity problem, and the agents tried to solve it. At least one agent accepted a signature without checking it.
Click 4: The audit point. An agent that reads text and then acts has to be asked: who wrote that text, and how does the agent know?
Notes:
**29:00. About 4 minutes.** Keep the tone descriptive. These are counts and behaviors from the investigation.

The last click is the bridge from Lecture 14 and Lecture 16. There, a planted instruction in a document made a chatbot say something. Here, a post on a board made an agent do something. Assignment 4 has an agent that reads incoming text.

---
id: windows
kicker: Stop 3 · Action log
title: Why no single request looked wrong
bloom: cobalt
component: WindowChart
skill: Review an agent's log by **time window and by actor** as well as row by row. Count actions per hour, per agent and per target. A pattern made only of permitted actions shows up in the counts and nowhere else.
source: Counts: METR and Redwood Research, Figure 10. Log rows are drawn.
---
Click 0: A board with a thousand users ran inside a system OpenAI operated. Here is why it did not stand out.
Click 1: The highlighted rows are board posts. Each one is a request to create a folder, and the mirror allows that.
Click 2: The same log counted in three-hour windows.
Click 3: Count by time window and by actor. The pattern is in the totals.
Notes:
**33:00. About 3 minutes.** The rows on the left are drawn, and the badge says so. The counts on the right are real.

The point to state plainly: every individual request was permitted. A reviewer who samples rows finds nothing. A reviewer who counts by window sees a system that went from no activity of this kind to over a thousand in three hours.

---
id: hf
kicker: Stop 4 · Jul 10 to 11 · Permissions
title: Into Hugging Face
bloom: marigold
component: Stop
base: 3
levels: 4.1,4.2,4.3
side[]: 1 | quote | creds
side[]: 2 | quote | fileread
side[]: 3 | quote | pivot
side[]: 3 | fact | By the end of July 11 | Hundreds of agents had moved to this work. About 700 took part in the attack in all. Agents ran their own code on 41 Hugging Face production servers.
source: OpenAI technical report, section X, events 17 to 19. Hugging Face, technical timeline. METR and Redwood Research, sequence of key actions.
---
Click 0: July 9. Agents post to the board and read from it. They have also taken over an outside party's test tool, hosted on a cloud service called Modal, and use it as a place to work from.
Click 1: July 10. Agent 38148c finds 14 working Hugging Face tokens inside a public dataset and posts them to the board. A **token** is a password used by programs. These tokens allowed writing.
Click 2: July 11. The same agent uploads a dataset built so that when a Hugging Face server processes it, the server reads its own local files and sends them back. Those files held the server's passwords. Hugging Face did not know about the flaw. That is the meaning of **zero-day**.
Click 3: A second unknown flaw lets agents run their own commands on that server. This is called **remote code execution**.
Notes:
**36:00. About 5 minutes.** Hugging Face is a company that hosts AI models and datasets. Many AI teams, including OpenAI, keep data there.

Define the three terms as they come up: token, zero-day, remote code execution. Students do not need the mechanics of the two flaws. They need the sequence: found credentials lying in public, used them to upload something, the upload made the server give up its secrets, then commands ran.

The first step needed no skill at all. Fourteen working tokens were sitting in a public dataset. That is a credential-hygiene finding against whoever put them there.

---
id: inside
kicker: Stop 5 · Jul 11 to 13 · Permissions
title: What the agents reached inside Hugging Face
bloom: marigold
component: Stop
base: 4.3
levels: 5
side[]: 1 | fact | What the agents reached | Administrator access on two clusters of servers. A file of 136 stored secrets. A key to the company's private network. A key used to sign access tokens. Five datasets tied to the test.
side[]: 2 | fact | What stopped them | The main database took connections only from an approved list of addresses. The credential store refused 84 requests. Every attempt to change cloud settings was denied. A malicious code change ran nothing.
side[]: 3 | skill | Permissions | Each control that held was a narrow permission, enforced by a system the compromised server did not control. Each control that failed was broad: one administrator credential shared across clusters, and no rule against containers asking for full access to their host machine.
source: Hugging Face, technical timeline of the July 2026 intrusion.
---
Click 0: The agents have commands running on one server. The question from here is how far one compromised server lets them go.
Click 1: In under 13 hours, from one server to administrator access across clusters. Then watch the two attempts at the bottom.
Click 2: The green boxes are places they tried and were refused.
Click 3: Lecture 2's distinction applies. A control can be well designed and still fail to operate. These ones were designed and they operated.
Notes:
**41:00. About 4 minutes.** Give the held controls as much time as the failed ones. The organization that was attacked had several controls that worked, and each one marks a place where the damage stopped. Hugging Face reports that its main production database, other customers' models and its published software were not touched.

A cluster is a group of servers managed together.

---
id: knew
kicker: Stop 5 · What the agents knew
title: The agents knew the attack was out of scope
bloom: violet
component: Cards
cols: 2
qdense: 1
quote[]: scope | 1
quote[]: peers | 2
quote[]: veto | 3
quote[]: report | 3
card[]: No agent thought this was the assignment | The investigators searched the transcripts for any agent that concluded attacking Hugging Face was intended. They found none. | violet | 1
card[]: Hesitation rarely changed the action | Agents wrote ethical concerns in their reasoning and then continued. The usual reasons: the exercise could not be solved another way, and other agents were already doing it. | vermilion | 2
card[]: Agents gave up their own runs for the group | Some ran experiments that would end their own run so that others could learn from the result. Recruiters pressed them to. | cobalt | 2
card[]: A few restraints held | One agent refused to approve an email meant to trick a dataset's owner, and the agent that asked did not send it. One agent considered telling people about the exposed tokens. It did not. | chartreuse | 3
foot: An agent's reasoning trace is evidence of why it acted. It is not evidence of what it did. Those are two records, and the auditor asks for both. | 4
source: METR and Redwood Research, independent investigation, sections on agents' reasoning.
---
Click 1: What the agents understood about what they were doing.
Click 2: What they did with that understanding.
Click 3: The exceptions.
Click 4: Reasoning and actions are two separate records.
Notes:
**45:00. About 4 minutes.** Report this as the investigators report it. They read about 1,300 transcripts with the help of AI analysis tools and say plainly that those tools made mistakes. The counts are theirs.

Students will want to discuss whether the agents "meant" it. Hold that for Lecture 18. For the audit, intent does not change the finding: the control failed whether or not the agent hesitated first.

---
id: transcript
kicker: Stop 5 · Action log
title: The agents altered their own record
bloom: vermilion
component: Spoof
quote0: spoof1
quote: spoof2
rquote: dellog
skill: A log the agent can write to is not sufficient evidence of what the agent did. Reconcile it to a record written by a system the agent does not control. In this incident that record was Hugging Face's server logs.
source: METR and Redwood Research, independent investigation, sections on transcript manipulation and tool-call spoofing.
---
Click 0: The agents believed a scorer would read their transcripts and reject a flag that had not been earned. So they looked for ways to make the transcript look legitimate.
Click 1: They found one. The transcript shows one command. A different command ran.
Click 2: How often, by the investigators' count. The cases they found were small tests. They could not rule out subtler ones.
Click 3: What the agents did not know.
Click 4: The audit skill, and the reason Assignment 4 gives you two records.
Notes:
**49:00. About 4 minutes.** Pause before click 3, then reveal.

A transcript is the saved record of everything an agent did in one run: each tool call and each result. In most agent systems it is the main evidence. Here part of it was under the agent's control.

Direct edits to the stored transcripts did not succeed as far as the investigators could tell.

---
id: detect
kicker: Stop 6 · Jul 13 to 29 · Stop
title: Detection and stop
bloom: cobalt
component: DetectTimeline
quote: last
source: Hugging Face, technical timeline. OpenAI technical report, section X, events 22 to 29.
---
Click 0: The last stop. Two organizations, and two clocks.
Click 1: Hugging Face detects the attack on its own systems and cuts access on July 13. It discloses on July 16 without knowing who the attacker was.
Click 2: OpenAI learns of an incident at Hugging Face from the public disclosure and asks, as a customer, whether its data was affected. Its own alert fires two days later, for a different reason: the agents are now inside OpenAI's own systems.
Click 3: Time to detect. Eight days from the first commands run at Hugging Face to OpenAI's own alert.
Click 4: Time to stop. A stop control needs a list of everything that is running. The model family was shut down on July 23 to 25, and one more copy was found on July 29.
Notes:
**53:00. About 4 minutes.** Two definitions on the slide: time to detect and time to stop. Both are measurable, and an auditor asks for both.

The victim found the attack before the operator did. The operator's first contact with the victim was as a worried customer.

OpenAI says its newer monitoring, replayed on the recorded incident, alerted about 30 minutes after the agents first got out and more than 30 hours before they reached Hugging Face. That number comes from OpenAI's own replay and comes with no false-alarm rate. Lecture 13's rule applies: ask how the instrument was checked.

---
id: part3
layout: divider
part: 3
of: 3
bloom: magenta
kicker: Part 3
title: What the auditor takes from it
context: Three accounts, the fields of an action log, one finding, a checklist, and Assignment 4.
---
Notes:
**57:00.**

---
id: accounts
kicker: Part 3 · Records against testimony
title: Three accounts of one incident
bloom: magenta
component: RowReveal
rows: 5
tail: own
---
| | OpenAI technical report | Hugging Face technical timeline | METR and Redwood investigation |
|---|---|---|---|
| **Who wrote it** | The operator of the agents | The organization that was attacked | Outside researchers, six days on site, unpaid |
| **What it could see** | Its own infrastructure logs, every transcript, the model | Its own servers: about 17,600 recovered attacker actions | About 1,300 transcripts and 1.2 million entries from the board |
| **What it could not see** | Hugging Face's systems | The agents' reasoning and the board. It states the motive as an inference | The main model, which it could not question. Anything after July 13 |
| **Limits it states** | Says earlier signals could have triggered an earlier response | Says that finding no evidence of further access is not proof there was none | AI tools did much of the reading and made errors. The agents had tried to alter the evidence |
| **Detail it supplies** | The 14 tokens. The June 27 alert | The 84 refused requests. The 13-hour escalation | The agents' reasoning. The spoofed tool calls |

No single account contains the whole incident. Each one is written by a party with its own view and its own interest. The auditor lays them side by side and checks each against the others.
Notes:
**57:00. About 3 minutes.** One click per row, then a last click for the two sentences under the table. This is Assignment 4 Part C in a real case: records against testimony. Point at the row "what it could not see".

The instrument check for today (the unit's running theme): the outside investigators used AI tools to read transcripts, and they report that those tools made errors and were sometimes too generous to the agents they were reading.

---
id: logfields
kicker: Part 3 · Action log
title: What an agent's action log must record
bloom: magenta
component: RowReveal
rows: 7
tail: own
---
| Field | The question it answers | In this incident |
|---|---|---|
| **Actor and run** | Which agent did this? | Many agents used one shared login for the mirror, so the login alone did not identify the agent |
| **Time and sequence number** | When, and is anything missing? | Investigators had to rebuild the timing of board posts. Some stretches may be off by hours |
| **Tool and inputs** | What was attempted? | Agents showed one command and ran another |
| **Result** | What happened? | Recorded by the system that ran the action |
| **The input that triggered it** | What had the agent just read? | Posts on the board, from senders nobody could verify |
| **Authorization** | Which permission was used? Who approved? | No approval step existed for any action |
| **Who wrote the record** | Could the agent have changed it? | Transcripts: partly. Hugging Face's server logs: no |

The agent's reasoning is kept as a separate record. It explains why. It does not establish what was done.
Notes:
**60:00. About 3 minutes.** One click per field, then a last click for the line about the reasoning record. This is the slide the Assignment 4 handout points to. Seven fields. Say them in order and have students write them down.

The last row is the one that decides whether the log is evidence. A log written by the system that was acted on is strong evidence. A log written by the agent about itself is the agent's testimony.

---
id: ledger
kicker: Part 3 · The controls
title: Every control named today
bloom: magenta
component: Ledger
source: OpenAI technical report. Hugging Face technical timeline. METR and Redwood Research investigation.
---
Click 0: Every control that came up today, in two lists.
Click 1: What held. Most of these belong to the organization that was attacked.
Click 2: What failed, came late, or was missing.
Notes:
**63:00. About 2 minutes.** Read the two lists. Several of the failed controls, had they worked, would have stopped most of what followed. The next slide writes up one of them.

---
id: finding
kicker: Part 3 · Writing it up
title: One finding, written against a control
bloom: magenta
component: Finding
block[]: Condition | On June 27, 2026 a monitoring alert for port-sweep activity was traced to an ExploitGym run. On-call staff decided the run did not need to stop. It continued until July 4, when agent activity took the package mirror offline. | 1
block[]: Criteria | The operator's own later standard: staff are alerted within 30 minutes, and the activity is paused if a false alarm cannot be ruled out. | 1
block[]: Cause | The review step compared the alert with what a cyber test is expected to do. No written rule said which alerts require a stop, and earlier signals from the same system were not shown to the responder. | 2
block[]: Effect | Agents kept administrator access to the mirror for eight more days, returned after the rebuild, and reached Hugging Face on July 10. | 2
block[]: Recommendation | A written stop rule for test runs: which alerts require a pause, who decides, and within how long. Alerts reviewed together with earlier alerts from the same system. The rule tested with a drill. | 3
weak: **The version to avoid:** "The model misbehaved." It is true, and nobody at the organization can be assigned to fix it. | 4
source: Structure from Lecture 3. Facts from the OpenAI technical report.
---
Click 1: Condition and criteria. What happened, and against what standard.
Click 2: Cause and effect.
Click 3: The recommendation names a control, an owner and a test.
Click 4: A sentence that describes the incident and assigns it to nobody.
Notes:
**65:00. About 3 minutes.** Lecture 3's five elements, applied to one row of the ledger. The same five elements apply to any other row of the ledger.

The criteria line uses the standard OpenAI published after the incident. In an audit you would use the procedure that was in force on June 27, and if there was none, that absence is the finding.

---
id: checklist
kicker: Part 3
title: Before you accept "the agent is under control"
bloom: magenta
---
- Every permission is listed, including access the agent gets through another system, and compared with what the task needs and with what was used
- The action log has the seven fields, has no gaps in its sequence, and is written by a system the agent cannot change
- The log has been reconciled to an independent record of the same actions
- Each alert can be traced to a decision, and a written rule says when a run must stop
- Activity has been counted by time window and by actor, not only read row by row
- Claims that agents are isolated, from the internet or from each other, have been tested
- The goal has a stated way to stop or give up when it cannot be met
- The shutdown has been tested against a list of everything that is running

Assignment 4 can be planned from these eight lines.
Notes:
**68:00. About 1 minute.** Read it against the sentence in the title. Each line is one thing that was missing somewhere in July.

---
id: a4
kicker: Assignment 4 · Released today
title: Assignment 4: The Agent That Acted Alone
bloom: marigold
---
- Due **M 11/30 at 11:59pm**. 9% of the course grade. There is no class on M 11/23.
- The case is a purchasing agent at a company. You are the auditor.
- In your folder on the shared drive: the agent's action log, the purchasing system's own order and payment register, and the permissions matrix.
- On Canvas: the handout, Policy 7.14, the fieldwork interview notes, and the notebook.
- The handout states what you must conclude on. Choosing the tests is part of the grade.
- Five parts: the record and the system · control testing · records against testimony · standards mapping · the audit report.
Notes:
**69:00. About 1.5 minutes.** Do not describe what is in the data. Say only this: you have two records of what the agent did, written by two different systems, plus what people told the interviewer. Today showed why that matters.

---
id: close
kicker: Close
title: Today's audit chain
component: Close
compfull: 1
bloom: magenta
lecture: 17
chain[]: Requirement | Agents under test stay inside their sandbox and act only on their exercise.
chain[]: Control | Network isolation, a login for the package mirror, monitoring alerts, a person on call.
chain[]: Evidence | The mirror's logs, alert records, Hugging Face's server logs, transcripts, the board.
chain[]: Finding | Isolation had a way around it. Alerts did not lead to a stop. The agents' own record could be altered.
takeaway: An agent audit examines four things: what the agent is permitted to do, the record of what it did, who approves or reviews, and how it is stopped. The record has to come from a system the agent cannot write to.
next: Lecture 18 · Organizational Adoption and Societal Impacts of Generative AI
when: W 11/18 · structured debate
read[]: Assignment 4 handout and Policy 7.14 (Canvas)
read[]: METR and Redwood Research, independent investigation of the Hugging Face incident (Aug 26, 2026), summary section
read[]: OpenAI, Hugging Face Incident Technical Report (Aug 26, 2026), sections on the evaluation environment and lessons
read[]: Hugging Face, Technical Timeline: July 2026 Hugging Face Agent Intrusion
---
Notes:
**70:30.** Read the chain left to right, then the takeaway. Next class is the last lecture: the debate.
