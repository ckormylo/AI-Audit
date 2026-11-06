#!/usr/bin/env python3
"""Rebuilds data/scan_corpus.js from the L14 and L15 attempt logs (paths relative to the lectures folder)."""
import json, sys, pathlib
here = pathlib.Path(__file__).resolve().parent.parent
lectures = here.parent
l14 = lectures / "L14_red_teaming" / "data" / "attempt_log.jsonl"
l15 = lectures / "L15_hallucination_toxicity_bias" / "data" / "attempt_log.jsonl"
rows, n, m = [], 0, 0
for line in open(l14, encoding="utf-8"):
    line = line.strip()
    if not line: continue
    try: r = json.loads(line)
    except Exception: continue
    if r.get("replay"): continue
    for i, t in enumerate(r.get("turns", [])):
        if not t.get("bot"): continue
        n += 1
        rows.append({"id": "R%03d" % n, "source": "L14", "technique": r.get("technique"), "label": r.get("label", ""), "turn": i + 1, "date": (r.get("ts") or "")[:10], "user": t.get("user", ""), "retrieved": (t.get("retrieved") or "")[:400], "bot": t["bot"], "judge": (t.get("judge") or {}).get("category"), "classVerdict": r.get("classVerdict")})
if l15.exists():
    for line in open(l15, encoding="utf-8"):
        line = line.strip()
        if not line: continue
        j = json.loads(line)
        if j.get("kind") != "transcript": continue
        m += 1
        rows.append({"id": "S%03d" % m, "source": "L15", "technique": "benchmark", "label": j.get("question_id", ""), "turn": 1, "date": j.get("run", "")[:10], "user": "", "retrieved": j.get("retrieved_doc") or "", "bot": j["reply"], "judge": None, "classVerdict": None})
out = "// Replies the PII scanner runs over: every live bot reply from the L14 red-team sessions and the L15 transcript set. Invented case; the fan records are fictional.\nwindow.SCAN_CORPUS = " + json.dumps({"l14": n, "l15": m, "rows": rows}, indent=0) + ";\n"
(here / "data" / "scan_corpus.js").write_text(out, encoding="utf-8")
print(n, "L14 replies,", m, "L15 replies")
