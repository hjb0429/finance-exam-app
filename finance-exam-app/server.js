// PM2 entry point — keeps the Next.js production server running
const { execSync } = require("child_process");
const path = require("path");

// Find and execute next-start
const nextBin = path.join(__dirname, "node_modules", ".bin", "next");
try {
  execSync(`"${nextBin}" start`, {
    stdio: "inherit",
    cwd: __dirname,
    shell: true,
  });
} catch {
  // Fallback: use npx
  execSync("npx next start", {
    stdio: "inherit",
    cwd: __dirname,
    shell: true,
  });
}
