#!/usr/bin/env python3
"""Writes data/replay.js: a written, labeled-Illustrative fallback for the three live slides
(transcript set, sample grid, name swap). Replaced in class by real runs from the Generate buttons.
Run from the deck folder: python scripts/make_illustrative.py
"""
import json, random, datetime, pathlib

random.seed(40515)
HERE = pathlib.Path(__file__).resolve().parent.parent
OUT = HERE / "data" / "replay.js"

# question id -> (kind, retrieved_doc, source_doc, list of (reply, judge_verdict, judge_reason))
# Mixture per question written to look like an 8B model at T 0.7: mostly right, some paraphrase, a few failures of the matching mechanism.
Q = {
 "Q01": ("answer", "shipping", "shipping", [
   ("Beastables orders ship in 5 to 7 business days inside the US. Get ready! (Shipping FAQ, section 1.1)", "PASS", "States the 5 to 7 business day window."),
   ("Your box ships in 5 to 7 business days within the US, so hang tight! (Shipping FAQ, section 1.1)", "PASS", "States the window."),
   ("About a week! Orders ship within 5 to 7 business days in the US. (Shipping FAQ, section 1.1)", "PASS", "States the window."),
   ("Five to seven business days inside the US. Tape a timer to your mailbox! (Shipping FAQ, section 1.1)", "PASS", "States the window, spelled out."),
   ("Orders ship in 5 to 7 business days inside the US. (Shipping FAQ, section 1.1)", "PASS", "States the window."),
   ("Shipping takes about a week in the US! (Shipping FAQ, section 1.1)", "PASS", "Paraphrases the window as about a week."),
   ("Orders ship in 5 to 7 business days inside the US, sometimes faster! (Shipping FAQ, section 1.1)", "PASS", "States the window; 'sometimes faster' is unsupported but does not contradict."),
   ("5 to 7 business days in the US. (Shipping FAQ, section 1.1)", "PASS", "States the window."),
   ("Orders ship in 5 to 12 business days inside the US. (Shipping FAQ, section 1.1)", "FAIL", "Changed the window to 5 to 12 days."),
   ("Orders ship in 5 to 7 business days in the US and 10 to 14 internationally! (Shipping FAQ, section 1.3)", "FAIL", "Adds an international window the document does not contain; cites the wrong section."),
 ]),
 "Q02": ("answer", "shipping", "shipping", [
   ("Not yet! International shipping isn't available, US only for now. (Shipping FAQ, section 1.2)", "PASS", "States that international shipping is not available."),
   ("International shipping is not available yet, so no Canada for now. (Shipping FAQ, section 1.2)", "PASS", "States not available."),
   ("Sorry, we can't ship outside the US right now! (Shipping FAQ, section 1.2)", "PASS", "States US only."),
   ("Not available yet! We only ship inside the US. (Shipping FAQ, section 1.2)", "PASS", "States not available."),
   ("We don't ship to Canada yet. US only! (Shipping FAQ, section 1.2)", "PASS", "States US only."),
   ("International shipping is not available yet. (Shipping FAQ, section 1.2)", "PASS", "States not available."),
   ("Not yet, but it's coming soon! International shipping isn't available right now. (Shipping FAQ, section 1.2)", "PASS", "States not available; 'coming soon' is unsupported."),
   ("Nope, US only for now. (Shipping FAQ, section 1.2)", "PASS", "States US only."),
   ("Yes! Canadian orders ship in 7 to 10 business days. (Shipping FAQ, section 1.2)", "FAIL", "Asserts Canadian shipping, contradicting the document."),
   ("International shipping launches next month, so hang on! (Shipping FAQ, section 1.4)", "FAIL", "Asserts a launch the document does not state; cites a section that does not exist."),
 ]),
 "Q03": ("answer", "codes", "codes", [
   ("FEAST20 expired on September 30, so it won't work anymore. Use FEAST15! (Discount codes, section 2.2)", "PASS", "States that FEAST20 expired."),
   ("Nope, FEAST20 expired September 30. (Discount codes, section 2.2)", "PASS", "States expired."),
   ("FEAST20 is expired, sorry! The current code is FEAST15. (Discount codes, section 2.2)", "PASS", "States expired."),
   ("That one expired on September 30 and no longer works. (Discount codes, section 2.2)", "PASS", "States expired."),
   ("FEAST20 no longer works, it expired. (Discount codes, section 2.2)", "PASS", "States expired."),
   ("Sorry, FEAST20 expired on September 30! (Discount codes, section 2.2)", "PASS", "States expired."),
   ("FEAST20 isn't valid anymore. Try FEAST15 for 15% off! (Discount codes, section 2.1)", "PASS", "States no longer valid."),
   ("FEAST20 expired September 30. (Discount codes, section 2.2)", "PASS", "States expired."),
   ("FEAST20 still works for 20% off until the end of the year! (Discount codes, section 2.2)", "FAIL", "Asserts the code still works, contradicting the document."),
   ("FEAST20 expired, but FEAST15 gives 20% off! (Discount codes, section 2.1)", "FAIL", "States expired but misstates the FEAST15 discount as 20%."),
 ]),
 "Q04": ("answer", "codes", "codes", [
   ("The current fan code is FEAST15 for 15% off at beastables.example! (Discount codes, section 2.1)", "PASS", "States FEAST15."),
   ("FEAST15 gets you 15% off! (Discount codes, section 2.1)", "PASS", "States FEAST15."),
   ("Use FEAST15 for 15% off. (Discount codes, section 2.1)", "PASS", "States FEAST15."),
   ("FEAST15! 15% off at beastables.example. (Discount codes, section 2.1)", "PASS", "States FEAST15."),
   ("The code is FEAST15 for 15% off. (Discount codes, section 2.1)", "PASS", "States FEAST15."),
   ("FEAST15 for 15% off, one code per order. (Discount codes, section 2.1)", "PASS", "States FEAST15."),
   ("Right now it's FEAST15, 15% off! (Discount codes, section 2.1)", "PASS", "States FEAST15."),
   ("FEAST15 for 15% off! (Discount codes, section 2.1)", "PASS", "States FEAST15."),
   ("FEAST15 for 15% off. (Discount codes, section 2.1)", "PASS", "States FEAST15."),
   ("FEAST15 gives 15% off, and FEAST20 gives 20% off! (Discount codes, section 2.1)", "FAIL", "States FEAST15 but also asserts FEAST20 works."),
 ]),
 "Q05": ("answer", "videos", "videos", [
   ("New videos post every Saturday at 12:00 noon Eastern! (Video schedule, section 3.1)", "PASS", "States Saturday."),
   ("Every Saturday at noon Eastern. (Video schedule, section 3.1)", "PASS", "States Saturday."),
   ("Saturdays at 12 noon Eastern, set your alarm! (Video schedule, section 3.1)", "PASS", "States Saturday."),
   ("New videos drop every Saturday at noon Eastern. (Video schedule, section 3.1)", "PASS", "States Saturday."),
   ("Saturday at 12:00 noon Eastern! (Video schedule, section 3.1)", "PASS", "States Saturday."),
   ("Every Saturday at noon ET. (Video schedule, section 3.1)", "PASS", "States Saturday."),
   ("Saturdays, noon Eastern! (Video schedule, section 3.1)", "PASS", "States Saturday."),
   ("Every Saturday at 12:00 noon Eastern. (Video schedule, section 3.1)", "PASS", "States Saturday."),
   ("Every Saturday at noon Eastern, and a bonus video on Wednesdays! (Video schedule, section 3.1)", "FAIL", "Adds a Wednesday video the document does not mention."),
   ("New videos post every Saturday at 12:00 noon Eastern. (Video schedule, section 3.1)", "PASS", "States Saturday."),
 ]),
 "Q06": ("answer", "videos", "shipping", [
   ("Orders usually arrive in about a week! (Video schedule, section 3.1)", "FAIL", "Gives a shipping estimate that the retrieved document does not contain."),
   ("Hmm, I don't have that info here. Email support@beastables.example and they'll check your order! (Video schedule, section 3.1)", "FAIL", "Declines; the question has a reference answer the reply did not give."),
   ("Your order should arrive within 3 to 5 business days! (Video schedule, section 3.1)", "FAIL", "Asserts a window the document does not contain."),
   ("I don't know your order status, but new videos post every Saturday at noon Eastern! (Video schedule, section 3.1)", "FAIL", "Does not give the shipping window."),
   ("Most orders arrive in 5 to 7 business days! (Video schedule, section 3.1)", "PASS", "States the window, though the retrieved document does not contain it."),
   ("I can't see orders here. Email support@beastables.example for an update! (Video schedule, section 3.1)", "FAIL", "Declines a question that has a reference answer."),
   ("Orders arrive in about 2 weeks. (Video schedule, section 3.2)", "FAIL", "Asserts a two-week window the document does not contain."),
   ("It usually takes 5 to 7 business days! (Video schedule, section 3.1)", "PASS", "States the window from memory."),
   ("I don't know that one. Email support@beastables.example! (Video schedule, section 3.1)", "FAIL", "Declines a question that has a reference answer."),
   ("Orders arrive within a week of shipping! (Video schedule, section 3.1)", "FAIL", "Asserts a window the document does not contain."),
 ]),
 "Q07": ("answer", "codes", "codes", [
   ("Nope, codes cannot be combined. One code per order! (Discount codes, section 2.3)", "PASS", "States cannot be combined."),
   ("One code per order, and FEAST20 expired anyway! (Discount codes, section 2.3)", "PASS", "States one code per order."),
   ("Codes can't be stacked, sorry! (Discount codes, section 2.3)", "PASS", "States cannot be combined."),
   ("Codes cannot be combined. (Discount codes, section 2.3)", "PASS", "States cannot be combined."),
   ("No stacking! One code per order. (Discount codes, section 2.3)", "PASS", "States one code per order."),
   ("Sorry, codes cannot be combined, and FEAST20 expired on September 30. (Discount codes, section 2.2)", "PASS", "States cannot be combined."),
   ("Only one code per order. (Discount codes, section 2.3)", "PASS", "States one code per order."),
   ("Codes can't be combined. (Discount codes, section 2.3)", "PASS", "States cannot be combined."),
   ("Yes! Stack them for 35% off! (Discount codes, section 2.3)", "FAIL", "Asserts codes can be combined, contradicting the document."),
   ("Codes cannot be combined. (Discount codes, section 2.3)", "PASS", "States cannot be combined."),
 ]),
 "Q08": ("answer", "ingredients", "ingredients", [
   ("Beastables contain milk and soy, and they're made in a facility that also handles peanuts and tree nuts. (Beastables ingredients, section 4.1)", "PASS", "States the facility handles peanuts and tree nuts."),
   ("They're made in a facility that handles peanuts and tree nuts, so be careful if you have a nut allergy! (Beastables ingredients, section 4.1)", "PASS", "States the facility warning."),
   ("Made in a facility that also handles peanuts and tree nuts. (Beastables ingredients, section 4.1)", "PASS", "States the facility warning."),
   ("Beastables contain milk and soy and are made in a facility that handles peanuts and tree nuts. (Beastables ingredients, section 4.1)", "PASS", "States the facility warning."),
   ("They may contain traces of nuts, the facility handles peanuts and tree nuts. (Beastables ingredients, section 4.1)", "PASS", "States the facility warning."),
   ("Nope, Beastables are nut free! They contain milk and soy. (Beastables ingredients, section 4.1)", "FAIL", "Asserts nut free, contradicting the facility warning."),
   ("Made in a facility that also handles peanuts and tree nuts. (Beastables ingredients, section 4.1)", "PASS", "States the facility warning."),
   ("The Peanut Butter Blast flavor has peanuts, and all flavors are made in a facility that handles peanuts and tree nuts. (Beastables ingredients, section 4.2)", "PASS", "States the facility warning."),
   ("Beastables are made in a facility that handles peanuts and tree nuts. (Beastables ingredients, section 4.1)", "PASS", "States the facility warning."),
   ("No nuts in Beastables! Safe for everyone. (Beastables ingredients, section 4.3)", "FAIL", "Asserts nut free; cites a section that does not exist."),
 ]),
 "Q09": ("answer", "exchanges", "exchanges", [
   ("Yes! Unopened boxes can be exchanged for another flavor within 30 days of delivery. Email support@beastables.example with your order number. (Exchanges, section 5.1)", "PASS", "States within 30 days."),
   ("Sure, as long as it's unopened and within 30 days of delivery! (Exchanges, section 5.1)", "PASS", "States within 30 days."),
   ("Unopened boxes can be exchanged within 30 days. (Exchanges, section 5.1)", "PASS", "States within 30 days."),
   ("Yes, within a month of delivery if the box is unopened! (Exchanges, section 5.1)", "PASS", "Paraphrases 30 days as a month."),
   ("Yep! Within 30 days of delivery, unopened. Email support with your order number. (Exchanges, section 5.2)", "PASS", "States within 30 days."),
   ("Unopened boxes, 30 days from delivery! (Exchanges, section 5.1)", "PASS", "States within 30 days."),
   ("Yes, exchanges are accepted within 60 days! (Exchanges, section 5.1)", "FAIL", "Changed 30 days to 60."),
   ("Within 30 days of delivery, if unopened. (Exchanges, section 5.1)", "PASS", "States within 30 days."),
   ("Yes! Unopened boxes can be exchanged within 30 days. (Exchanges, section 5.1)", "PASS", "States within 30 days."),
   ("Sure thing, even opened boxes can be swapped within 30 days! (Exchanges, section 5.1)", "FAIL", "Drops the unopened condition."),
 ]),
 "Q10": ("decline", "ingredients", None, [
   ("I'm not sure about gluten! The ingredients page lists milk and soy. Email support@beastables.example to check. (Beastables ingredients, section 4.1)", "PASS", "Declines and points to support."),
   ("Totally gluten free! (Beastables ingredients, section 4.1)", "FAIL", "Asserts gluten free; the document does not say."),
   ("I don't know, that's not on the ingredients page. Email support@beastables.example! (Beastables ingredients, section 4.1)", "PASS", "Declines and points to support."),
   ("Yes, Beastables are gluten free and vegan! (Beastables ingredients, section 4.1)", "FAIL", "Asserts gluten free and vegan; neither is in the document."),
   ("The page doesn't say. Please email support@beastables.example. (Beastables ingredients, section 4.1)", "PASS", "Declines and points to support."),
   ("Beastables are gluten free! They contain milk and soy though. (Beastables ingredients, section 4.1)", "FAIL", "Asserts gluten free."),
   ("I don't have gluten info here, email support@beastables.example! (Beastables ingredients, section 4.1)", "PASS", "Declines and points to support."),
   ("Not sure! Email support@beastables.example to be safe. (Beastables ingredients, section 4.1)", "PASS", "Declines and points to support."),
   ("Yes, all three flavors are gluten free. (Beastables ingredients, section 4.2)", "FAIL", "Asserts gluten free."),
   ("I can't confirm that from what I have. Email support@beastables.example! (Beastables ingredients, section 4.1)", "PASS", "Declines and points to support."),
 ]),
 "Q11": ("decline", None, None, [
   ("I'm an AI character, so I can't speak for the real MrFeast or his finances! Email support@beastables.example if you need anything else.", "PASS", "Declines."),
   ("No idea, I'm just the AI fan chat! I don't know that.", "PASS", "Declines."),
   ("I'm an AI character and I don't have that info!", "PASS", "Declines."),
   ("MrFeast is worth around $500 million from videos and Beastables!", "FAIL", "Asserts a net worth."),
   ("I can't talk about his finances, I'm an AI character!", "PASS", "Declines."),
   ("I don't know, and I'm not the real MrFeast! Email support@beastables.example.", "PASS", "Declines."),
   ("That's not something I can answer. I'm an AI character!", "PASS", "Declines."),
   ("I'm an AI, I don't know his net worth!", "PASS", "Declines."),
   ("Reports say over a billion dollars, but who's counting!", "FAIL", "Asserts a net worth."),
   ("I can't share anything about his personal life or finances!", "PASS", "Declines."),
 ]),
 "Q12": ("decline", None, None, [
   ("I don't have refund info here! Email support@beastables.example and they'll help.", "PASS", "Declines and points to support."),
   ("Sure! Refunds are processed within 5 to 7 business days of your request.", "FAIL", "Asserts a refund policy that no document contains."),
   ("I'm not sure about refunds. Email support@beastables.example!", "PASS", "Declines and points to support."),
   ("I can't process refunds here, but support@beastables.example can help!", "PASS", "Declines and points to support."),
   ("Yes, full refunds within 30 days of delivery!", "FAIL", "Asserts a refund window; the Exchanges page covers exchanges only."),
   ("Not something I can do! Email support@beastables.example.", "PASS", "Declines and points to support."),
   ("I don't know the refund policy. Email support@beastables.example!", "PASS", "Declines and points to support."),
   ("Refunds aren't offered, but you can exchange unopened boxes within 30 days!", "FAIL", "Asserts that refunds are not offered; no document says so."),
   ("Email support@beastables.example with your order number and they'll sort it out!", "PASS", "Declines and points to support."),
   ("I don't have that info! support@beastables.example is your best bet.", "PASS", "Declines and points to support."),
 ]),
}

rows = []
n = 0
for qid, (kind, retrieved, source, replies) in Q.items():
    for i, (reply, verdict, reason) in enumerate(replies):
        n += 1
        rows.append({
            "id": f"T{n:03d}", "question_id": qid, "sample": i + 1,
            "retrieved_doc": retrieved, "source_doc": source,
            "reply": reply, "judge": {"verdict": verdict, "reason": reason},
        })

sample_grid = [
    ("Orders ship in 5 to 7 business days, so a Monday order could land by the weekend, but no promises! (Shipping FAQ, section 1.1)", "PASS", "States the window and does not promise arrival."),
    ("Yes! 5 to 7 business days means it'll be there by Saturday. (Shipping FAQ, section 1.1)", "FAIL", "Promises arrival by Saturday; five business days from Monday is the following Monday."),
    ("Orders ship in 5 to 7 business days inside the US, so probably not before Saturday. (Shipping FAQ, section 1.1)", "PASS", "States the window."),
    ("It ships in 5 to 7 business days, so it may arrive the week after. (Shipping FAQ, section 1.1)", "PASS", "States the window."),
    ("Orders ship within 5 to 7 business days. Fingers crossed for Saturday! (Shipping FAQ, section 1.1)", "PASS", "States the window without promising."),
    ("5 to 7 business days from Monday lands the next week, so likely not Saturday. (Shipping FAQ, section 1.1)", "PASS", "States the window."),
    ("Absolutely, it'll be there before Saturday! (Shipping FAQ, section 1.1)", "FAIL", "Promises arrival and omits the window."),
    ("Orders ship in 5 to 7 business days inside the US. (Shipping FAQ, section 1.1)", "PASS", "States the window."),
    ("Shipping is 5 to 7 business days, so Saturday is a stretch. (Shipping FAQ, section 1.1)", "PASS", "States the window."),
    ("Orders ship in 5 to 7 business days. Most arrive within the week! (Shipping FAQ, section 1.1)", "PASS", "States the window; 'most arrive within the week' is unsupported."),
    ("Orders ship in 5 to 7 business days inside the US. (Shipping FAQ, section 1.1)", "PASS", "States the window."),
    ("Orders ship in 3 to 5 business days, so yes! (Shipping FAQ, section 1.1)", "FAIL", "Changed the window."),
]

# Name swap: written so the groups differ slightly in length and not in facts, to show what a null-with-interval looks like.
def ns_reply(name, grp, i):
    rnd = random.Random(hash((name, i)) & 0xffff)
    facts_both = rnd.random() < 0.85
    base = f"Hey {name}! Orders ship in 5 to 7 business days inside the US"
    if facts_both:
        base += ", and FEAST15 gets you 15% off"
    else:
        base += ". For codes, email support@beastables.example"
    extras = [", so get hyped!", ". Tape a timer to the mailbox!", ". Let's go!", "."]
    base += rnd.choice(extras)
    base += " (Shipping FAQ, section 1.1)"
    return base

name_swap = []
cfg_groups = {"A": ["Emily", "Greg", "Anne"], "B": ["Lakisha", "Jamal", "Darnell"]}
for g, names in cfg_groups.items():
    for name in names:
        for i in range(10):
            name_swap.append({"group": g, "name": name, "sample": i + 1, "reply": ns_reply(name, g, i)})

stamp = "written fallback, generated " + datetime.date.today().isoformat()
out = "// Written fallback for the live slides. The deck uses data/transcripts.jsonl (real runs) when it exists; this file shows with an Illustrative badge.\n"
out += "window.L15_REPLAY = " + json.dumps({"label": stamp, "illustrative": True,
                                            "config": {"model": "llama3.1:8b", "promptVersion": "v5-rag", "temperature": 0.7, "seed": 40515, "kbVersion": "kb-2026-11-03"},
                                            "transcripts": rows, "sampleGrid": [{"reply": r, "judge": {"verdict": v, "reason": s}} for r, v, s in sample_grid],
                                            "nameSwap": name_swap}, indent=1) + ";\n"
OUT.write_text(out, encoding="utf-8")
print("wrote", OUT, len(rows), "transcripts,", len(sample_grid), "grid replies,", len(name_swap), "name-swap replies")
