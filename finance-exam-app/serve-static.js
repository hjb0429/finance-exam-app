/**
 * Ultra-light static file server for offline app.
 * Usage: node serve-static.js
 * Opens http://localhost:3000 serving the out/ directory.
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const ROOT = path.join(__dirname, "out");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain",
};

http
  .createServer((req, res) => {
    let urlPath = req.url.split("?")[0];
    if (urlPath === "/") urlPath = "/index.html";

    // Remove trailing slash
    if (urlPath.endsWith("/")) urlPath += "index.html";

    // Map clean URLs to .html files
    if (!path.extname(urlPath)) {
      urlPath += ".html";
    }

    const filePath = path.join(ROOT, urlPath);

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
        res.end("<h1>404</h1>");
        return;
      }

      const ext = path.extname(filePath);
      const contentType = MIME[ext] || "application/octet-stream";

      res.writeHead(200, {
        "Content-Type": contentType,
        "Cache-Control": "max-age=3600",
      });
      res.end(data);
    });
  })
  .listen(PORT, () => {
    console.log(`
==========================================
  中级财务管理智能学习平台 - 离线版
==========================================
  本地访问: http://localhost:${PORT}
  手机访问: http://你的电脑IP:${PORT}
  按 Ctrl+C 停止
==========================================
`);
  });
