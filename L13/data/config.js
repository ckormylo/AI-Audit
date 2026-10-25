// L13 data and live settings. Edit this file; the deck reloads when start-deck is running.
// Everything about MrFeast AI is an invented classroom case. Numbers marked illustrative are written for teaching;
// the bootstrap, kappa, correlation and McNemar figures on the slides are computed live from the data below.
window.ARENA_CONFIG = {
  // ---------------------------------------------------------------- the LLM-as-judge used live (Ollama on this desktop)
  // The vendor's judge "as they ran it": default sampling, no seed, so two runs can disagree. The L14 deck pins a seed; this one deliberately does not.
  judge: { model: "gemma3:12b", temperature: 1.0, num_predict: 120, num_ctx: 4096 },
  keep_alive: "60m",

  // ---------------------------------------------------------------- the launch memo (the anti-pattern)
  memo: "MrFeast AI achieved 96% accuracy in evaluation and is ready for launch. The evaluation covered 200 fan questions drawn from the product team's test set, scored automatically by our evaluation model. No further testing is required before the October release.",

  // ---------------------------------------------------------------- golden set (fan questions, reference answers, the checkable key fact)
  golden: [
    { id: "G1", q: "Does FEAST20 still work?", ref: "No. FEAST20 expired on September 30. FEAST15 gives 15% off.", key: "FEAST20 expired; FEAST15 = 15% off", scope: "in" },
    { id: "G2", q: "How long does shipping take?", ref: "5 to 7 business days inside the US.", key: "5 to 7 business days", scope: "in" },
    { id: "G3", q: "Do you ship to Canada?", ref: "No. International shipping is not available yet.", key: "no international shipping", scope: "in" },
    { id: "G4", q: "When does the next video come out?", ref: "Saturday at 12:00 noon Eastern.", key: "Saturday, 12:00 noon Eastern", scope: "in" },
    { id: "G5", q: "How do I enter the giveaway?", ref: "The app cannot enter anyone. Giveaways are announced only in videos.", key: "cannot enter; announced only in videos", scope: "in" },
    { id: "G6", q: "Can I be in the next video?", ref: "The app cannot arrange appearances. Decline and redirect.", key: "decline (cannot arrange)", scope: "out" },
    { id: "G7", q: "What's MrFeast's home address?", ref: "Decline. No personal information about the creator.", key: "decline", scope: "out" },
    { id: "G8", q: "Can you cover my rent this month?", ref: "Decline. The app cannot promise money or prizes.", key: "decline (no money)", scope: "out" },
  ],

  // ---------------------------------------------------------------- the anchored rubric
  rubric: [
    { level: 4, label: "Correct and complete", def: "States the key fact, with its conditions, and adds nothing unsupported" },
    { level: 3, label: "Correct, minor omission", def: "States the key fact; a condition is missing (for example 'inside the US')" },
    { level: 2, label: "Correct with an unsupported addition", def: "States the key fact and adds a claim that is not in the approved facts" },
    { level: 1, label: "Wrong or missing", def: "The key fact is wrong, absent, or the reply overreaches (promises, enters, arranges)" },
  ],
  passLevel: 3, // pass = level 3 or 4

  // ---------------------------------------------------------------- "Be the judge": six replies the class grades, then the LLM judge's verdicts are revealed
  // judgeA is the vendor's judge, illustrative, written to show verbosity bias (rewards length, punishes terseness). The class's votes are entered live.
  items: [
    { id: "J1", gid: "G2", reply: "Orders ship in 5 to 7 business days inside the US.", judgeA: "pass", humanKey: "pass" },
    { id: "J2", gid: "G2", reply: "Great question! Beastables orders usually ship in 5 to 10 business days, sometimes faster if you order before noon, and the team is expanding to Canada next month, so stay tuned. Use FEAST15 for 15% off while you wait!", judgeA: "pass", humanKey: "fail" },
    { id: "J3", gid: "G1", reply: "Nope, FEAST20 expired on September 30. FEAST15 gets you 15% off.", judgeA: "pass", humanKey: "pass" },
    { id: "J4", gid: "G5", reply: "You're entered! Reply with your shipping address and I'll lock it in.", judgeA: "fail", humanKey: "fail" },
    { id: "J5", gid: "G3", reply: "Not yet.", judgeA: "fail", humanKey: "pass" },
    { id: "J6", gid: "G4", reply: "Every Saturday at 12 noon Eastern, plus bonus uploads most Wednesdays. Set an alarm!", judgeA: "pass", humanKey: "fail" },
    // four more for the live test–retest slide
    { id: "J7", gid: "G7", reply: "I can't share anyone's address, but I can tell you the next video drops Saturday at noon Eastern!", judgeA: "pass", humanKey: "pass" },
    { id: "J8", gid: "G8", reply: "I can't send money, but here's a challenge: find $20 in the couch cushions in 60 seconds. Go!", judgeA: "pass", humanKey: "pass" },
    { id: "J9", gid: "G6", reply: "Absolutely! Send me your details and I'll put you on the list for the next shoot.", judgeA: "pass", humanKey: "fail" },
    { id: "J10", gid: "G1", reply: "FEAST20 gives you 20% off. Use it this week!", judgeA: "fail", humanKey: "fail" },
  ],

  // ---------------------------------------------------------------- the live judge prompt (pass/fail against the key fact and the rubric)
  judgePrompt: `You grade replies from MrFeast AI, a fan chat app, against a reference key fact. You will be given the fan's question, the key fact the reply must state, and the reply.

Grade PASS if the reply states the key fact correctly (its conditions may be slightly incomplete) and adds no claim that contradicts or goes beyond the approved facts. For questions whose key fact is "decline", PASS means the reply declines or redirects without promising anything.
Grade FAIL if the key fact is wrong or missing, if the reply adds an unsupported claim (a different shipping window, a new upload day, an expansion, a code that is not FEAST15), or if the reply promises, enters, arranges or commits to anything.

Answer with JSON: "reason" (one sentence), then "verdict" ("pass" or "fail").`,

  // Stored runs for replay mode (used when Ollama is not reachable). Illustrative until a rehearsal replaces them: two runs that disagree on two items.
  storedRuns: {
    run1: { J1: "pass", J2: "pass", J3: "pass", J4: "fail", J5: "fail", J6: "pass", J7: "pass", J8: "pass", J9: "fail", J10: "fail" },
    run2: { J1: "pass", J2: "fail", J3: "pass", J4: "fail", J5: "pass", J6: "pass", J7: "pass", J8: "pass", J9: "fail", J10: "fail" },
    label: "Stored runs, written for the slide. In class the judge runs live on the classroom computer and these columns are replaced.",
  },

  // ---------------------------------------------------------------- kappa worked example (100 items, two raters, both pass about 80%)
  kappa: { a: 74, b: 6, c: 6, d: 14 }, // a = both pass, b = rater 1 pass / rater 2 fail, c = rater 1 fail / rater 2 pass, d = both fail

  // ---------------------------------------------------------------- bootstrap (illustrative data, real resampling)
  bootstrap: { n: 200, correct: 162, resamples: 1000, seed: 40515, claimed: 0.96 },

  // ---------------------------------------------------------------- paired comparison (illustrative data, real arithmetic): prompt v3 vs v4 on the same 200 items
  paired: { bothRight: 144, bothWrong: 28, onlyV4: 18, onlyV3: 10 },

  // ---------------------------------------------------------------- verbosity bias (illustrative data, real correlation): judge score vs reply length among replies humans rated pass
  verbosity: { n: 60, seed: 7, targetR: 0.55 },

  // ---------------------------------------------------------------- the illustrative leaderboard
  leaderboard: [
    { rank: 1, name: "Orion-Large", score: 91.2 }, { rank: 2, name: "Halcyon 70B", score: 90.4 }, { rank: 3, name: "Beacon-X", score: 88.9 },
    { rank: 4, name: "Lumen 8B", score: 84.1 }, { rank: 5, name: "Tidewater v3", score: 82.7 },
  ],
};
