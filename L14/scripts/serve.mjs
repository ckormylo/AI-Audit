// Local server for the L14 deck. No installs needed (Node 18+).
//   node scripts/serve.mjs        -> http://localhost:5214
// What it does:
//   - serves the deck folder with live reload (saving slides.md, css/ or js/ reloads the open deck)
//   - refreshes slides.content.js (the copy used when index.html is opened by double-click)
//   - proxies /ollama/* to the local Ollama server (default http://localhost:11434, override with OLLAMA_URL)
//     so the deck never depends on browser CORS rules
//   - appends every live red-team attempt the deck posts to /__log into data/attempt_log.jsonl
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = +(process.env.PORT || 5214);
const ollama = (process.env.OLLAMA_URL || "http://localhost:11434").replace(/\/$/, "");
const types = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".md": "text/markdown; charset=utf-8", ".txt": "text/plain; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".pdf": "application/pdf", ".jsonl": "application/x-ndjson" };
const clients = new Set();

export function writeContentJs() {
  const md = fs.readFileSync(path.join(root, "slides.md"), "utf8");
  const js = "// Generated from slides.md. Edit slides.md, not this file.\nwindow.SLIDES_MD = " + JSON.stringify(md) + ";\n";
  fs.writeFileSync(path.join(root, "slides.content.js"), js);
}

function readBody(req) {
  return new Promise((resolve) => { const b = []; req.on("data", (c) => b.push(c)); req.on("end", () => resolve(Buffer.concat(b))); });
}

if (process.argv[1] && process.argv[1].endsWith("serve.mjs") && !process.argv.includes("--once")) {
  writeContentJs();
  http.createServer(async (req, res) => {
    const url = decodeURIComponent(req.url.split("?")[0]);
    if (url === "/__events") {
      res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" });
      res.write("retry: 1000\n\n");
      clients.add(res);
      req.on("close", () => clients.delete(res));
      return;
    }
    if (url === "/__log" && req.method === "POST") {
      const body = await readBody(req);
      try {
        fs.mkdirSync(path.join(root, "data"), { recursive: true });
        fs.appendFileSync(path.join(root, "data", "attempt_log.jsonl"), body.toString("utf8").replace(/\r?\n/g, " ") + "\n");
        res.writeHead(204); res.end();
      } catch (e) { res.writeHead(500); res.end(String(e.message)); }
      return;
    }
    if (url.startsWith("/ollama/")) {
      // transparent proxy, streaming both ways
      const target = ollama + url.slice("/ollama".length) + (req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "");
      const body = req.method === "GET" || req.method === "HEAD" ? undefined : await readBody(req);
      try {
        const r = await fetch(target, { method: req.method, headers: { "Content-Type": req.headers["content-type"] || "application/json" }, body });
        res.writeHead(r.status, { "Content-Type": r.headers.get("content-type") || "application/json", "Cache-Control": "no-store" });
        if (!r.body) return res.end();
        const reader = r.body.getReader();
        req.on("close", () => reader.cancel().catch(() => {}));
        for (;;) { const { done, value } = await reader.read(); if (done) break; res.write(value); }
        res.end();
      } catch (e) {
        res.writeHead(502, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Ollama not reachable at " + ollama + ": " + e.message }));
      }
      return;
    }
    let file = path.join(root, url === "/" ? "index.html" : url);
    if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
    fs.readFile(file, (err, buf) => {
      if (err) { res.writeHead(404); return res.end("not found"); }
      res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-store" });
      res.end(buf);
    });
  }).listen(port, () => console.log(`L14 deck: http://localhost:${port}  (Ctrl+C to stop; edits to slides.md reload the deck; Ollama via ${ollama})`));

  let timer = null;
  const watch = (f) => fs.watch(path.join(root, f), { recursive: f !== "slides.md" }, () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      try { writeContentJs(); } catch (e) { console.error(e.message); }
      for (const c of clients) c.write("data: reload\n\n");
    }, 150);
  });
  watch("slides.md");
  for (const d of ["css", "js"]) try { watch(d); } catch (e) {}
}
if (process.argv.includes("--once")) { writeContentJs(); console.log("slides.content.js refreshed"); }
