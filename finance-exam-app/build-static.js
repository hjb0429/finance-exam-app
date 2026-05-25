/**
 * Build static offline version.
 * 1. Backs up API routes (needed for PDF upload in dev mode)
 * 2. Builds static export
 * 3. Restores API routes
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const API_DIR = path.join(__dirname, "src", "app", "api");
const API_BACKUP = path.join(__dirname, "src", "app", "_api_backup");

// Step 1: Clear Next.js cache and move API routes out of the way
const nextDir = path.join(__dirname, ".next");
if (fs.existsSync(nextDir)) {
  fs.rmSync(nextDir, { recursive: true, force: true });
  console.log("Cleared .next cache...");
}

if (fs.existsSync(API_DIR)) {
  fs.renameSync(API_DIR, API_BACKUP);
  console.log("Moved API routes to backup...");
}

try {
  // Step 2: Build
  console.log("Building static export...");
  execSync("npx next build", { stdio: "inherit", cwd: __dirname });

  console.log("\nStatic build complete!");
  console.log("Output: " + path.join(__dirname, "out"));
  console.log("\nOpen out/index.html in any browser to use the app.");
} finally {
  // Step 3: Restore API routes
  if (fs.existsSync(API_BACKUP)) {
    fs.renameSync(API_BACKUP, API_DIR);
    console.log("Restored API routes.");
  }
}
