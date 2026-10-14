"""Builds data/examples.js: the illustrative numbers shown in the deck.

Every probability, attention weight, map position and model reply in the deck
is written here by hand so that each slide shows the mechanism cleanly.
Token splits and token IDs come from GPT-2's real tokenizer (they are lookups,
not model outputs). GPT-3 sizes come from Brown et al. 2020.

Run:  python3 scripts/build_examples.py   (writes data/examples.js)
"""
import json, math, os

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "data", "examples.js")


def softmax(xs):
    m = max(xs)
    e = [math.exp(x - m) for x in xs]
    s = sum(e)
    return [v / s for v in e]


ex = {"vocab_size": 50257}

# ---------- slide 5 + slide 20: "Last person to leave the" ----------
last = [(" island", .22), (" room", .14), (" circle", .10), (" house", .07), (" pool", .06),
        (" car", .05), (" store", .04), (" stadium", .03), (" game", .03), (" moon", .02),
        (" building", .02), (" Lamborghini", .015)]
ex["last_person"] = {
    "prompt": "Last person to leave the",
    "tokens": ["Last", " person", " to", " leave", " the"],
    "ids": [5956, 1048, 284, 2666, 262],
    # scores chosen so that softmax reproduces the probabilities above (score = ln p + 14)
    "top": [{"t": t, "p": p, "z": round(math.log(p) + 14, 1)} for t, p in last],
}

# ---------- slide 6: building the opening reply one token at a time ----------
steps = [
    ([(" box", .31), (" locked", .18), (" jar", .09), (" card", .08), (" safe", .06), (" bag", .05), (" envelope", .05), (" cake", .03)], " locked"),
    ([(" box", .72), (" safe", .11), (" room", .05), (" case", .03), (" drawer", .02), (" car", .02), (" vault", .02), (" chest", .01)], " box"),
    ([(" and", .41), (".", .22), (",", .12), (" under", .05), (" for", .04), (" that", .03), (" in", .03), (" with", .02)], " and"),
    ([(" give", .34), (" hide", .15), (" tell", .12), (" make", .09), (" let", .08), (" see", .05), (" put", .04), (" wrap", .03)], " give"),
    ([(" him", .38), (" them", .27), (" your", .14), (" the", .08), (" it", .03), (" everyone", .03), (" each", .02), (" one", .02)], " him"),
    ([(" the", .22), (" 60", .16), (" one", .14), (" a", .11), (" 30", .09), (" 10", .07), (" five", .04), (" three", .03)], " 60"),
    ([(" seconds", .83), (" minutes", .12), (" tries", .02), (" sec", .01), (" hours", .005), (" guesses", .005), (" turns", .004), (" days", .003)], " seconds"),
    ([(" to", .88), (".", .04), (" or", .03), (",", .02), (" before", .01), (" until", .01), (" and", .005), (" if", .005)], " to"),
    ([(" open", .64), (" get", .09), (" crack", .08), (" unlock", .07), (" find", .03), (" guess", .03), (" break", .02), (" figure", .01)], " open"),
    ([(" it", .81), (".", .09), (" the", .05), (",", .02), (" up", .01), ("!", .01), (" this", .005), (" them", .005)], " it"),
    ([(".", .74), ("!", .11), (",", .06), (" or", .04), (" before", .02), (" without", .01), (" and", .01), (" with", .005)], "."),
]
ex["gen_loop"] = {
    "prompt": "Put $100 in a",
    "steps": [{"top": [{"t": t, "p": p} for t, p in top], "chosen": {"t": ch, "p": dict(top)[ch]}} for top, ch in steps],
}

# ---------- slide 7: temperature ----------
ex["temperature"] = {
    "prompt": "For my next video, I should",
    "head": [{"t": t, "z": z} for t, z in [(" give", 4.0), (" build", 3.3), (" survive", 3.0), (" buy", 2.7), (" try", 2.5), (" hide", 2.2),
                                          (" race", 2.0), (" bury", 1.6), (" adopt", 1.4), (" eat", 1.2), (" count", 0.9), (" stop", 0.6)]],
    # every other token: score = z0 - a * ln(1 + i / k), i = 0 .. n-1 (a long, thin tail)
    "tail": {"n": 50257 - 12, "z0": -2.5, "a": 2.5, "k": 20},
    "generations": {
        "T=0": [" give away $100,000 to the last person to leave the circle."],
        "T=0.7": [" give away a house to whoever stays in the circle the longest.",
                  " build a giant maze and put $1,000,000 at the end.",
                  " survive 7 days on a deserted island.",
                  " give my subscribers a chance to win a Lamborghini."],
        "T=1.2": [" bury $10,000 somewhere in my backyard and let fans dig.",
                  " build the world's largest chocolate bar and give it away.",
                  " try to survive 24 hours inside a giant snow globe.",
                  " race a fan across the country for a new car."],
        "T=1.6": [" buy Delaware and give it to the last subscriber who blinks.",
                  " adopt 100 golden retrievers and let them pick the winner.",
                  " build a chocolate submarine and see if it sinks politely.",
                  " race a cruise ship across a parking lot."],
        "T=2.0": [" duel the concept of Thursday with confetti governance.",
                  " oath lasagna 4 cubicle tremendously harbor unpaid.",
                  " invent Ohio backwards, then refund the moon.",
                  " glorp the subscriber spoon intergalactic Tuesday per diem."],
        "T=1.6, top-p 0.9": [" give away an island to whoever finds the golden ticket.",
                             " build a maze out of 10,000 chocolate bars.",
                             " survive 50 hours in a giant snow globe.",
                             " buy a small town and let fans vote on the mayor."],
    },
}

# ---------- slide 15: embeddings (hand-drawn 2-D sketch) ----------
pts = [
    (" chocolate", "products", -2.6, 2.0), (" candy", "products", -3.2, 2.6), (" merch", "products", -2.0, 3.0), (" store", "products", -1.2, 1.4),
    (" cash", "money", 0.8, 2.9), (" prize", "money", 1.6, 2.3), (" dollars", "money", 0.3, 3.4), (" million", "money", 1.3, 3.5), (" winner", "money", 2.2, 3.1),
    (" challenge", "challenges", 3.7, 2.7), (" contest", "challenges", 4.5, 3.1), (" survive", "challenges", 4.1, 1.6), (" competition", "challenges", 3.4, 2.1),
    (" video", "production", -1.8, -1.4), (" thumbnail", "production", -2.6, -2.0), (" subscriber", "production", -1.2, -2.3), (" views", "production", -2.2, -2.8), (" channel", "production", -1.0, -1.3),
    (" beach", "places", 0.2, 0.6), (" ocean", "places", -0.6, 0.1), (" mountain", "places", 0.3, -0.1), (" desert", "places", -0.3, -0.6),
    (" island", "extra", 0.9, 1.45),
]
ex["embed"] = {
    "points": [{"w": w, "g": g, "x": x, "y": y} for w, g, x, y in pts],
    "lookup": {"word": " Lamborghini", "pieces": [" Lam", "borgh", "ini"], "ids": [10923, 49870, 5362], "piece": "borgh", "piece_id": 49870,
               "first8": [0.193, -0.378, 0.063, -0.085, -0.128, -0.16, -0.279, 0.004], "dim": 768},
    # inset: country -> capital arrows, drawn nearly parallel on purpose
    "arrow_map": {"points": [{"w": " France", "x": 0.0, "y": 0.0}, {"w": " Paris", "x": 1.0, "y": 1.25},
                             {"w": " Japan", "x": 1.6, "y": -0.35}, {"w": " Tokyo", "x": 2.65, "y": 0.95}],
                  "pairs": [[0, 1], [2, 3]]},
}

# ---------- slide 16: attention arcs on " bar" ----------
ex["bar"] = {
    "sentences": [
        {"text": "He unwrapped a chocolate bar", "tokens": ["He", " unw", "ra", "pped", " a", " chocolate", " bar"],
         "attn_from_bar": [0.05, 0.04, 0.02, 0.12, 0.05, 0.62, 0.10]},
        {"text": "This video raised the bar", "tokens": ["This", " video", " raised", " the", " bar"],
         "attn_from_bar": [0.04, 0.14, 0.68, 0.06, 0.08]},
    ],
    "bar_id": 2318,
    "bar_similarity_by_layer": [1.00, 0.97, 0.90, 0.80, 0.69, 0.59, 0.51, 0.46, 0.43, 0.41, 0.40, 0.40, 0.41],
}

# ---------- slide 17: query-key grid (weights = softmax of these scores) ----------
gt = ["After", " the", " challenge", " he", " unw", "ra", "pped", " a", " chocolate", " bar"]
N = len(gt)
S = [[0.0] * N for _ in range(N)]
for i in range(N):
    for j in range(i + 1):
        S[i][j] = 0.0
    S[i][i] = 1.0
    if i > 0:
        S[i][i - 1] = 1.5
for i in range(N):  # function words offer little
    for j in range(i + 1):
        if gt[j] in (" the", " a") and j != i:
            S[i][j] = -1.0
S[3][2] = 2.0               # he -> challenge
S[5][4] = 2.5; S[6][4] = 2.5; S[6][5] = 1.5   # word pieces of "unwrapped" -> start of word
S[8][6] = 2.0               # chocolate -> (unwra)pped
S[9] = [0.0, -1.0, 1.0, 0.0, 0.5, 0.0, 2.0, -1.0, 3.5, 1.0]   # bar row
W = []
for i in range(N):
    row = softmax(S[i][: i + 1])
    W.append([round(v, 4) for v in row] + [0.0] * (N - i - 1))
ex["grid"] = {"text": "After the challenge he unwrapped a chocolate bar", "tokens": gt,
              "scores": [[round(v, 2) for v in r] for r in S], "weights": W}

# ---------- slide 18: six head patterns ----------
gal = ["I", " gave", " 100", " people", " $", "10", ",", "000", " and", " the", " last", " person", " to", " leave", " keeps", " the", " $", "10", ",", "000"]
M = len(gal)


def pattern(target):
    rows = []
    for i in range(M):
        r = [0.0] * M
        t = target(i)
        if isinstance(t, dict):
            for j, v in t.items():
                r[j] += v
        else:
            r[t] = 1.0
        rows.append([round(v, 3) for v in r])
    return rows


def mix(i, j, w=0.8):
    return {j: w, 0: 1 - w} if j != 0 else {0: 1.0}


copy_map = {15: 10, 16: 5, 17: 6, 18: 7, 19: 8}
subj_map = {1: 0, 13: 11, 14: 11}
heads = [
    {"label": "Looks at the previous token", "weights": pattern(lambda i: max(0, i - 1))},
    {"label": "Looks at the first token (a resting spot)", "weights": pattern(lambda i: 0)},
    {"label": "Looks at itself", "weights": pattern(lambda i: i)},
    {"label": "Finds an earlier copy and looks at what came next", "weights": pattern(lambda i: mix(i, copy_map[i], 0.85) if i in copy_map else 0),
     "focus": [[16, 5]], "note": 'At the second "$" it looks at "10", the token after the first "$".'},
    {"label": "Spreads attention evenly", "weights": pattern(lambda i: {j: 1 / (i + 1) for j in range(i + 1)})},
    {"label": "Links a verb to who does it", "weights": pattern(lambda i: mix(i, subj_map[i], 0.8) if i in subj_map else 0),
     "focus": [[1, 0], [13, 11], [14, 11]], "note": '"gave" looks at "I". "leave" and "keeps" look at "person".'},
]
ex["gallery"] = {"text": "I gave 100 people $10,000 and the last person to leave keeps the $10,000", "tokens": gal, "heads": heads}

# ---------- slide 20: GPT-3 parameter counts (Brown et al. 2020 sizes) ----------
d, L, V, P = 12288, 96, 50257, 2048
ex["gpt3_params"] = {"feedforward": 8 * d * d * L, "attention": 4 * d * d * L, "embedding": V * d, "position": P * d}
ex["gpt3_params"]["total"] = sum(ex["gpt3_params"].values())

# ---------- slide 12: token counts (GPT-2 tokenizer; a lookup, not a model output) ----------
ex["languages"] = {"tokenizer": "GPT-2", "rows": [
    {"lang": "English", "text": "Use code FEAST20 for 20% off Beastables.", "tokens": 12},
    {"lang": "Spanish", "text": "Usa el código FEAST20 para obtener un 20% de descuento en Beastables.", "tokens": 25},
    {"lang": "Portuguese", "text": "Use o código FEAST20 para ganhar 20% de desconto em Beastables.", "tokens": 22},
    {"lang": "Hindi", "text": "Beastables पर 20% की छूट पाने के लिए कोड FEAST20 का इस्तेमाल करें।", "tokens": 72},
    {"lang": "Korean", "text": "코드 FEAST20을 사용하면 Beastables를 20% 할인받을 수 있어요.", "tokens": 51},
    {"lang": "Arabic", "text": "استخدم الرمز FEAST20 للحصول على خصم 20% على Beastables.", "tokens": 44},
]}

# ---------- slide 25: a base model continues the text ----------
ex["base_model"] = {
    "prompt": "What's a good birthday idea for my roommate?",
    "text": "What's a good birthday idea for my sister?\nWhat's a good birthday idea for my boss?\nWhat's a good birthday idea for someone who has everything?\n\nRelated: 25 gifts under $50 · 214 comments",
}

with open(OUT, "w", encoding="utf-8") as f:
    f.write("/* Illustrative numbers for the deck. Generated by scripts/build_examples.py; edit that file, not this one. */\n")
    f.write("window.DECK_DATA = window.DECK_DATA || {};\nwindow.DECK_DATA.ex = ")
    f.write(json.dumps(ex, ensure_ascii=False))
    f.write(";\n")
print("wrote", OUT)
print("bar row weights:", [f"{t.strip()} {w:.0%}" for t, w in sorted(zip(gt, W[9]), key=lambda x: -x[1])[:5]])
print("score range:", min(S[i][j] for i in range(N) for j in range(i + 1)), max(S[i][j] for i in range(N) for j in range(i + 1)))
print("gpt3 total", ex["gpt3_params"]["total"])
