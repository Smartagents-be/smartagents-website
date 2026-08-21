import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import { createServer } from 'node:http';
import { createLiveReload } from './live-reload.mjs';

const rootDir = resolve(process.cwd(), "dist");
const host = "127.0.0.1";
const port = Number(process.env.PORT || 8000);

// `npm run dev` passes --watch: rebuild on save and reload the open page.
// `npm run serve` serves dist exactly as it will be deployed.
const watching = process.argv.includes("--watch");
const liveReload = watching ? createLiveReload({ repoRoot: process.cwd() }) : null;

// dist/_redirects is Cloudflare's routing table, and the language fallback lives
// in it: an unprefixed URL resolves to the default language. Without this,
// `/training/` would 404 here while working in production. Only the three shapes
// the file uses are implemented: an exact path, a trailing splat, and the
// same-path 200 rewrite that serves a file in place instead of redirecting.
let redirectCache = { mtime: 0, rules: [] };

function redirectRules() {
    const file = join(rootDir, "_redirects");
    if (!existsSync(file)) return [];

    const mtime = statSync(file).mtimeMs;
    if (mtime === redirectCache.mtime) return redirectCache.rules;

    const rules = readFileSync(file, "utf8")
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.startsWith("/"))
        .map((line) => {
            const [from, to, status] = line.split(/\s+/);
            return { from, to, status: Number(status) || 302 };
        });

    redirectCache = { mtime, rules };
    return rules;
}

// First match wins, and nothing after it is considered.
function matchRedirect(pathname) {
    for (const rule of redirectRules()) {
        if (rule.from.endsWith("/*")) {
            const prefix = rule.from.slice(0, -1);
            if (pathname.startsWith(prefix)) {
                return { ...rule, to: rule.to.replace(":splat", pathname.slice(prefix.length)) };
            }
        } else if (rule.from === pathname) {
            return rule;
        }
    }

    return null;
}

const contentTypes = {
    ".avif": "image/avif",
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".json": "application/json; charset=utf-8",
    ".pdf": "application/pdf",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".txt": "text/plain; charset=utf-8",
    ".webp": "image/webp",
    ".xml": "application/xml; charset=utf-8"
};

const server = createServer((req, res) => {
    if (liveReload?.handle(req, res)) return;

    const requestUrl = new URL(req.url || "/", `http://${host}:${port}`);
    const requestPath = decodeURIComponent(requestUrl.pathname);

    const rule = matchRedirect(requestPath);
    if (rule && rule.status !== 200) {
        // Cloudflare carries the query string across a redirect.
        const location = `${rule.to}${requestUrl.search}`;
        res.writeHead(rule.status, { "Location": location, "Cache-Control": "no-store" });
        res.end();
        return;
    }

    const pathname = rule ? rule.to : requestPath;
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

    if (liveReload && extname(filePath) === ".html") {
        const body = liveReload.inject(readFileSync(filePath, "utf8"));
        res.writeHead(200, {
            "Content-Type": contentType,
            "Content-Length": Buffer.byteLength(body),
            "Cache-Control": "no-store"
        });
        res.end(body);
        return;
    }

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
    liveReload?.start();
});
