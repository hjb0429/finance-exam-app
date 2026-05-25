/**
 * Build a single standalone HTML file that works entirely offline.
 * No server, no WiFi, no dependencies — just open the file on any device.
 *
 * Usage: node build-single-html.js
 * Output: out/app.html
 */
const fs = require("fs");
const path = require("path");

const STORE_PATH = path.join(__dirname, "data", "store.json");
const GUIDES_PATH = path.join(__dirname, "data", "guides.json");
const TEMPLATE_PATH = path.join(__dirname, "src", "standalone", "template.html");
const OUT_PATH = path.join(__dirname, "out", "app.html");

// Read data
const store = JSON.parse(fs.readFileSync(STORE_PATH, "utf-8"));
const guides = JSON.parse(fs.readFileSync(GUIDES_PATH, "utf-8"));

// Extract what we need to minimize file size
const chapters = store.chapters.map((ch) => ({
  id: ch.id,
  title: ch.title,
  order: ch.order,
}));

const sections = store.sections.map((s) => ({
  id: s.id,
  chapterId: s.chapterId,
  title: s.title,
  order: s.order,
}));

const knowledgePoints = store.knowledgePoints.map((kp) => ({
  id: kp.id,
  sectionId: kp.sectionId,
  title: kp.title,
  content: kp.content,
  masteryLevel: kp.masteryLevel,
}));

const questions = store.questions.map((q) => ({
  id: q.id,
  knowledgePointId: q.knowledgePointId,
  type: q.type,
  stem: q.stem,
  options: q.options,
  answer: q.answer,
  analysis: q.analysis,
  difficulty: q.difficulty,
}));

const dataJson = JSON.stringify({
  chapters,
  sections,
  knowledgePoints,
  questions,
  guides,
});

console.log(`Data JSON: ${(dataJson.length / 1024).toFixed(1)} KB`);

// Read template and inject data
let template = fs.readFileSync(TEMPLATE_PATH, "utf-8");
template = template.replace("__DATA_JSON__", dataJson);

// Write output
const outDir = path.dirname(OUT_PATH);
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(OUT_PATH, template, "utf-8");
console.log(`Output: ${OUT_PATH} (${(template.length / 1024).toFixed(1)} KB)`);
