import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import { createServer } from 'node:http';

const rootDir = resolve(process.cwd(), "dist");
const host = "127.0.0.1";
const port = Number(process.env.PORT || 8000);

const contentTypes = {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".txt": "text/plain; charset=utf-8",
    ".webp": "image/webp",
    ".xml": "application/xml; charset=utf-8"
};

const server = createServer((req, res) => {
    const requestUrl = new URL(req.url || "/", `http://${host}:${port}`);
    const pathname = decodeURIComponent(requestUrl.pathname);
    const safePath = normalize(pathname).replace(/^(\.\.[/\\])+/, "");
    let filePath = join(rootDir, safePath);

    if (!filePath.startsWith(rootDir)) {
        res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Forbidden");
        return;
    }

    if (pathname.endsWith("/")) {
        filePath = join(rootDir, safePath, "index.html");
    }

    if (!existsSync(filePath) && !extname(filePath)) {
        const htmlPath = `${filePath}.html`;
        if (existsSync(htmlPath)) {
            filePath = htmlPath;
        }
    }

    if (!existsSync(filePath)) {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Not found");
        return;
    }

    const stats = statSync(filePath);
    if (stats.isDirectory()) {
        filePath = join(filePath, "index.html");
    }

    if (!existsSync(filePath)) {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Not found");
        return;
    }

    const contentType = contentTypes[extname(filePath)] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    const fileStream = createReadStream(filePath);
    fileStream.on("error", (err) => {
        console.error(`Error reading ${filePath}:`, err.message);
        if (!res.headersSent) {
            res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        }
        res.end("Internal server error");
    });
    fileStream.pipe(res);
});

server.listen(port, host, () => {
    console.log(`Serving dist at http://${host}:${port}`);
});
