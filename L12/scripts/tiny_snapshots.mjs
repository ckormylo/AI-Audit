// Runs the tiny model in Node with the same seed as the slide, and saves loss + samples at
// steps 0, 300 and 3000 to data/tiny_snapshots.js (used for the PDF and as a fallback in class).
import fs from "node:fs"; import path from "node:path"; import { fileURLToPath } from "node:url"; import vm from "node:vm";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ctx = { window: {}, globalThis: {} }; ctx.self = ctx;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, "data/tiny_corpus.js"), "utf8"), ctx);
vm.runInContext(fs.readFileSync(path.join(root, "js/tinymodel.js"), "utf8"), ctx);
const corpus = ctx.window.DECK_DATA.tinyCorpus;
const m = ctx.self.TinyModel(corpus, 12);
const snaps = {}, losses = [];
const marks = [0, 300, 3000];
const t0 = Date.now();
for (let s = 0; s <= 3000; s++) {
  if (marks.includes(s)) snaps[s] = m.sample(6, 0.8, 70);
  if (s === 3000) break;
  const L = m.trainStep(32, s < 1500 ? 0.004 : 0.002);
  if (s % 25 === 0) losses.push([s, +L.toFixed(3)]);
}
console.log("ms", Date.now() - t0, "params", m.params);
for (const k of marks) console.log(k, snaps[k]);
fs.writeFileSync(path.join(root, "data/tiny_snapshots.js"), "// Saved from scripts/tiny_snapshots.mjs (seed 12). Same code and seed as the live slide.\nwindow.DECK_DATA=window.DECK_DATA||{};window.DECK_DATA.tinySnap=" + JSON.stringify({ snaps, losses }) + ";\n");
