/**
 * Health check: pings the server every 60s. If down 3 times in a row, restarts pm2.
 * Run: node health-check.js  (runs forever as a watchdog)
 */
const http = require("http");
const { execSync } = require("child_process");

const URL = "http://localhost:3000/home";
const CHECK_INTERVAL = 60_000; // 1 minute
const MAX_FAILURES = 3;

let failures = 0;

function check() {
  const req = http.get(URL, (res) => {
    if (res.statusCode === 200) {
      if (failures > 0) {
        console.log(`${new Date().toLocaleTimeString()}  Server recovered (${failures} failures)`);
      }
      failures = 0;
    } else {
      failures++;
      console.log(`${new Date().toLocaleTimeString()}  Bad status: ${res.statusCode} (${failures}/${MAX_FAILURES})`);
    }
    res.resume();
  });

  req.on("error", () => {
    failures++;
    console.log(`${new Date().toLocaleTimeString()}  Unreachable (${failures}/${MAX_FAILURES})`);

    if (failures >= MAX_FAILURES) {
      console.log("Restarting server...");
      try {
        execSync("cd /d \"D:\\中级财务管理考试app\\finance-exam-app\" && pm2 restart finance-exam", {
          stdio: "inherit",
          shell: true,
        });
      } catch {}
      failures = 0;
    }
  });

  req.setTimeout(10_000, () => {
    req.destroy();
    failures++;
    if (failures >= MAX_FAILURES) {
      console.log("Timeout - restarting...");
      try {
        execSync("cd /d \"D:\\中级财务管理考试app\\finance-exam-app\" && pm2 restart finance-exam", {
          stdio: "inherit",
          shell: true,
        });
      } catch {}
      failures = 0;
    }
  });
}

console.log("Health check watchdog started. Checking every", CHECK_INTERVAL / 1000, "s");
check(); // Check immediately
setInterval(check, CHECK_INTERVAL);
