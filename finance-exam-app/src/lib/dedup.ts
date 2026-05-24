/**
 * Deduplicate chapters by title (keep the one with more content).
 */
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "store.json");
const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));

// Track seen chapter titles
const seenChapters = new Map<number, number>(); // oldId -> keptId
const chaptersToRemove: number[] = [];

for (let i = 0; i < data.chapters.length; i++) {
  const ch = data.chapters[i];
  const existing = [...seenChapters.entries()].find(
    ([, title]) => title === ch.title
  );
  if (existing) {
    // Duplicate - keep the one with more sections
    const existingCh = data.chapters.find((c: { id: number }) => c.id === existing[0]);
    const existingSections = data.sections.filter(
      (s: { chapterId: number }) => s.chapterId === existing[0]
    ).length;
    const newSections = data.sections.filter(
      (s: { chapterId: number }) => s.chapterId === ch.id
    ).length;

    if (newSections > existingSections) {
      // Remove the old one, keep the new one
      chaptersToRemove.push(existing[0]);
      seenChapters.delete(existing[0]);
      seenChapters.set(ch.id, ch.title);
    } else {
      chaptersToRemove.push(ch.id);
    }
  } else {
    seenChapters.set(ch.id, ch.title);
  }
}

console.log(`Chapters to remove: ${chaptersToRemove.length}`);
console.log(`Chapters before: ${data.chapters.length}`);

// Remove duplicates and their related data
for (const chId of chaptersToRemove) {
  data.chapters = data.chapters.filter((c: { id: number }) => c.id !== chId);

  // Find sections to remove
  const sectionIds = data.sections
    .filter((s: { chapterId: number }) => s.chapterId === chId)
    .map((s: { id: number }) => s.id);

  // Find KPs to remove
  const kpIds = data.knowledgePoints
    .filter((kp: { sectionId: number }) => sectionIds.includes(kp.sectionId))
    .map((kp: { id: number }) => kp.id);

  // Remove questions for these KPs
  data.questions = data.questions.filter(
    (q: { knowledgePointId: number }) => !kpIds.includes(q.knowledgePointId)
  );

  // Remove KPs
  data.knowledgePoints = data.knowledgePoints.filter(
    (kp: { sectionId: number }) => !sectionIds.includes(kp.sectionId)
  );

  // Remove sections
  data.sections = data.sections.filter(
    (s: { chapterId: number }) => s.chapterId !== chId
  );
}

console.log(`Chapters after: ${data.chapters.length}`);
console.log(`Questions: ${data.questions.length}`);
console.log(`Knowledge points: ${data.knowledgePoints.length}`);

fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
console.log("Dedup complete!");
