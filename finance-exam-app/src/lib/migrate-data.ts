/**
 * Migrate existing data from store.json to Prisma/SQLite database.
 * Run: npx tsx src/lib/migrate-data.ts
 */
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  const storePath = path.join(process.cwd(), "data", "store.json");
  if (!fs.existsSync(storePath)) {
    console.log("No store.json found, skipping migration.");
    return;
  }

  const store = JSON.parse(fs.readFileSync(storePath, "utf-8"));
  console.log(`Found: ${store.chapters.length} chapters, ${store.questions.length} questions`);

  // Clear existing data
  await prisma.quizAttempt.deleteMany();
  await prisma.userProgress.deleteMany();
  await prisma.question.deleteMany();
  await prisma.knowledgePoint.deleteMany();
  await prisma.section.deleteMany();
  await prisma.chapter.deleteMany();
  console.log("Cleared existing data.");

  // Import chapters, sections, KPs, and questions
  for (const ch of store.chapters) {
    const chapter = await prisma.chapter.create({
      data: { title: ch.title, order: ch.order },
    });

    const chSections = store.sections.filter(
      (s: { chapterId: number }) => s.chapterId === ch.id
    );

    for (const sec of chSections) {
      const section = await prisma.section.create({
        data: {
          chapterId: chapter.id,
          title: sec.title,
          order: sec.order,
        },
      });

      const kps = store.knowledgePoints.filter(
        (kp: { sectionId: number }) => kp.sectionId === sec.id
      );

      for (const kp of kps) {
        const knowledgePoint = await prisma.knowledgePoint.create({
          data: {
            sectionId: section.id,
            title: kp.title,
            content: kp.content,
            masteryLevel: kp.masteryLevel || "unlearned",
          },
        });

        const questions = store.questions.filter(
          (q: { knowledgePointId: number }) => q.knowledgePointId === kp.id
        );

        for (const q of questions) {
          await prisma.question.create({
            data: {
              knowledgePointId: knowledgePoint.id,
              type: q.type,
              stem: q.stem,
              options: JSON.stringify(q.options),
              answer: q.answer,
              analysis: q.analysis || "",
              difficulty: q.difficulty || 1,
            },
          });
        }
      }
    }
    console.log(`  ✓ ${ch.title} (${chSections.length} sections)`);
  }

  console.log(`\nMigration complete!`);
  console.log(`  Chapters: ${await prisma.chapter.count()}`);
  console.log(`  Sections: ${await prisma.section.count()}`);
  console.log(`  Knowledge Points: ${await prisma.knowledgePoint.count()}`);
  console.log(`  Questions: ${await prisma.question.count()}`);

  await prisma.$disconnect();
}

main().catch(console.error);
