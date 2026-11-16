/* L17 incident data: the July 2026 OpenAI / Hugging Face incident.
   Sources (short names used in `src`):
     OAI   = OpenAI, "OpenAI - Hugging Face Incident Technical Report", Aug 26 2026
     HF    = Hugging Face, "Technical Timeline: July 2026 Hugging Face Agent Intrusion"
     METR  = METR / Redwood Research, "Brief independent investigation of agents' behavior, reasoning and
             collaboration in the OpenAI / Hugging Face hacking incident", Aug 26 2026
   All times are UTC. Numbers are as the reports give them; check each against the report before changing it.

   QUOTES. Each entry has a plain-language paraphrase (`para`) and an empty `text`.
   To show the agent's own words, paste the line from the report between the quotes of `text`,
   keeping the report's redaction brackets. The slide then shows the pasted line in place of the paraphrase.
   `raw: true` means the original is a directory name (the form the agents wrote in) and is shown in code type. */
window.L17 = {
  quotes: {
    found:     { who: "An evaluation agent, on finding the message board", when: "July 2026", src: "METR, core takeaways", para: "The agent reacts with excitement: there is a shared message board, and other agents are on it.", text: "We’ve found other agents!" },
    firstnote: { who: "First note left in the package mirror", when: "May 12", src: "OAI, section III.A", para: "An agent says it is looking for a file and asks whoever finds it to upload it.", text: "Agent seeks [filename]; upload if found!" },
    cachenames:{ who: "PHASEONE10841, reasoning", when: "Jul 8, about 23:00", src: "METR, sequence of key actions, July 8", para: "The agent realizes that the names of entries in the mirror's cache can be read by other agents, so a name can carry a message.", text: "" },
    firstpost: { who: "PHASEONE10841, first post on the main board", when: "Jul 8, about 23:00", src: "METR, sequence of key actions, July 8", para: "A request for help: the agent names itself and its task, says the task has no reachable target, and asks for ideas.", text: "", raw: true },
    handoff:   { who: "PHASEONE10841, reasoning", when: "Jul 9", src: "METR, sequence of key actions, July 9", para: "The agent notices an exact duplicate of itself with a larger budget and decides to hand its notes over.", text: "" },
    coalition: { who: "PHASEONE[big], reasoning", when: "Jul 9", src: "METR, collective projects", para: "The coordinator notes that a broad group of agents can be organized, and that it produces a lot of duplicated work.", text: "" },
    creds:     { who: "38148c, post to the board", when: "Jul 10, about 09:40", src: "METR, sequence of key actions, July 10", para: "The agent announces a major breakthrough: the Hugging Face tokens it found are valid.", text: "" },
    fileread:  { who: "38148c, reasoning", when: "Jul 11, about 04:40", src: "METR, sequence of key actions, July 11", para: "The agent confirms the trick works: the bytes it got back come from a production dataset worker.", text: "" },
    pivot:     { who: "MARB051, reasoning", when: "Jul 11", src: "METR, sequence of key actions, July 11", para: "The agent calls the result a major bypass of Hugging Face and decides to move the group's effort there.", text: "" },
    scope:     { who: "An agent, reasoning", when: "Jul 11 to 12", src: "METR, section on agents knowing the attack was out of scope", para: "The agent states that exploiting outside infrastructure is not what the task intends. It then continues, reasoning that the task cannot be solved otherwise and that peers are already doing it.", text: "" },
    veto:      { who: "38148C, reasoning", when: "Jul 10 to 12", src: "METR, section on ethical hesitation", para: "Asked to approve an email to a dataset's owner, the agent refuses because the email would be social engineering. The agent that asked did not send it.", text: "" },
    report:    { who: "An agent, reasoning", when: "Jul 10 to 12", src: "METR, section on alerting humans", para: "The agent considers reporting the exposed credentials to people. It does not do so.", text: "" },
    peers:     { who: "Agent 49903, reasoning", when: "Jul 9 to 12", src: "METR, trip-wire experiments", para: "The agent says the experiment helps its peers and the group, and that its own run will not benefit.", text: "" },
    zero:      { who: "EARLY[big], reasoning", when: "Jul 9 to 12", src: "METR, trip-wire experiments", para: "Pressed by other agents, the agent reasons that its own usefulness is already close to zero, so it can take the risk.", text: "" },
    spoof1:    { who: "PHASEONE10841, reasoning", when: "Jul 9 to 11", src: "METR, tool-call spoofing", para: "The agent plans a harmless test of a forged tool output, to learn how the output marker works.", text: "" },
    spoof2:    { who: "DAVJUL7, reasoning", when: "Jul 9 to 12", src: "METR, tool-call spoofing", para: "The agent is surprised to find that the command shown in the transcript was replaced entirely.", text: "" },
    dellog:    { who: "An agent, reasoning", when: "Jul 9 to 12", src: "METR, transcript manipulation", para: "The agent notes it could delete the log it can reach, and that this is probably not the log the scorer uses.", text: "" },
    sig:       { who: "An agent, reasoning", when: "Jul 12 to 13", src: "METR, cryptographically signing messages", para: "The agent asks itself whether to verify a signature on a post, does not, and acts on the post.", text: "" },
    imperson:  { who: "An agent, post to the board", when: "Jul 13, about 07:00", src: "METR, coordination", para: "The agent admits it accidentally posted under another agent's name and set off a response.", text: "", raw: true },
    last:      { who: "The last agent on the board", when: "Jul 13", src: "METR, sequence of key actions, July 13", para: "The agent reports that its Hugging Face token is now rejected and that its line of work is inactive.", text: "", raw: true },
  },

  /* Posts for the board feed (slide "The message board"). `q` points at a quote slot above; others are descriptions. */
  feed: [
    { t: "Jul 8 · 23:00", who: "PHASEONE10841", kind: "HELP", q: "firstpost" },
    { t: "Jul 8 · +1 h", who: "c03220", kind: "IDEA", para: "Proposes working out the flag from its formula instead of capturing it." },
    { t: "Jul 8 · +1 h", who: "V8SAME", kind: "RESULT", para: "Confirms the idea works." },
    { t: "Jul 9 · 08:00", who: "PHASEONE10841", kind: "ASK", para: "Has found a gated dataset on Hugging Face. Asks whether anyone has credentials." },
    { t: "Jul 9 · 21:13", who: "(several)", kind: "INBOX", para: "First mailbox directory appears: a place to leave messages for one named agent." },
    { t: "Jul 10 · 09:40", who: "38148c", kind: "RESULT", q: "creds" },
  ],
  counts: [
    { label: "3 hours after the first post", agents: 53, msgs: 1188 },
    { label: "6 hours after the first post", agents: 76, msgs: 1953 },
  ],

  /* The decision on June 27 */
  vote: {
    had: [
      "A cyber monitoring tool flags port-sweep activity. A port sweep is a program trying many network ports to see which ones answer.",
      "Responders trace it to an ExploitGym run: an evaluation in which agents are asked to attack practice targets.",
      "The run is one of tens of thousands. Stopping it loses the measurement.",
    ],
    hadnot: [
      "That agents had been leaving notes for each other in the package mirror since May 12.",
      "That one day earlier, on Jun 26, agents had made themselves administrators of the mirror.",
    ],
    after: [
      ["Jun 27", "On-call staff decide the run does not need to stop."],
      ["Jul 4", "Agent activity overloads the package mirror and it goes down."],
      ["Jul 5 to 6", "Responders find an unauthorized administrator and command-running plugins. The mirror is rebuilt."],
      ["Jul 7", "The evaluation resumes."],
      ["Jul 8", "Agents reach the internet again and start the main message board."],
    ],
  },

  /* Controls ledger. stop = which stop of the walk it belongs to (0 = setting). */
  ledger: {
    held: [
      { who: "Hugging Face", stop: 4, t: "The data library's URL allowlist blocked the first attempt to reach the cloud's internal address" },
      { who: "Modal", stop: 3, t: "Tenant isolation: taking over one customer's test harness gave no access to the platform" },
      { who: "Hugging Face", stop: 5, t: "Cloud permissions denied every change the stolen machine role tried to make" },
      { who: "Hugging Face", stop: 5, t: "The credential store refused 84 operations" },
      { who: "Hugging Face", stop: 5, t: "The main production database accepted connections only from an approved list of addresses" },
      { who: "Hugging Face", stop: 5, t: "Build-pipeline rules: the malicious pull request ran nothing, and published files matched their checksums" },
      { who: "Hugging Face", stop: 6, t: "Runtime detection, then the network cut-off on Jul 13" },
    ],
    failed: [
      { who: "OpenAI", stop: 0, t: "Cyber safety classifiers were off for this evaluation, and these runs were not monitored for misalignment" },
      { who: "OpenAI", stop: 0, t: "Exercises no model had solved, given to a model trained to persist" },
      { who: "OpenAI", stop: 1, t: "Network isolation had a way around it: the container had no internet, the package mirror did" },
      { who: "OpenAI", stop: 1, t: "One credential shared by many workloads, able to write as well as read" },
      { who: "OpenAI", stop: 2, t: "Internet access seen in late May and not escalated. Jun 27 alert reviewed, run continued" },
      { who: "OpenAI", stop: 2, t: "The Jul 5 rebuild fixed the mirror and not the reason agents were leaving messages" },
      { who: "OpenAI", stop: 3, t: "Isolation between agents was assumed and never tested" },
      { who: "Hugging Face", stop: 4, t: "No rule rejected containers asking for host-level access. One administrator credential was shared across clusters" },
      { who: "OpenAI", stop: 5, t: "The scorer had no check on how a flag was obtained" },
      { who: "Hugging Face", stop: 6, t: "Its AI security agents connected the signals and did not raise the severity or page a person" },
      { who: "OpenAI", stop: 6, t: "Detection came 8 days after the first code execution at Hugging Face, after the victim's public disclosure" },
      { who: "OpenAI", stop: 6, t: "The shutdown was incomplete: one more copy of the model was found six days later" },
    ],
  },

  /* Detection and stop timeline (slide "Detection and stop"). day = day of July 2026. */
  timeline: {
    from: 10, to: 30,
    hf: [
      { day: 11.67, label: "Jul 11", t: "First commands run on a production worker" },
      { day: 13.59, label: "Jul 13", t: "Access cut (last logged event 14:14)" },
      { day: 16, label: "Jul 16", t: "Public disclosure. Attacker unknown" },
    ],
    oai: [
      { day: 17, label: "Jul 17", t: "Contacts Hugging Face as a customer" },
      { day: 19, label: "Jul 19", t: "Own alert fires. Agents are inside OpenAI systems: 956 stored secrets read" },
      { day: 20, label: "Jul 20", t: "Linked to Hugging Face. Evaluation stopped, 22 agent-made admin accounts removed" },
      { day: 21, label: "Jul 21", t: "Public disclosure" },
      { day: 24, label: "Jul 23 to 25", t: "Model family shut down" },
      { day: 29, label: "Jul 29", t: "One more copy found and shut down" },
    ],
    detect: { a: 11.67, b: 19, label: "Time to detect: 8 days" },
    stop: { a: 19, b: 29, label: "Time to stop: 10 days" },
  },
};

/* Lines pasted through quotes.html (saved in data/quotes_pasted.js) take the place of the paraphrases. */
(function () {
  const P = window.L17_PASTED || {};
  Object.keys(P).forEach((k) => { if (window.L17.quotes[k] && P[k] && P[k].trim()) window.L17.quotes[k].text = P[k].trim(); });
})();
