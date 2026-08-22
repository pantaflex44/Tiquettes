let now = new Date(Date.now());
const offset = now.getTimezoneOffset();
now = new Date(now.getTime() - offset * 60 * 1000);
const nowFull = now.toISOString();
now = nowFull.split("T")[0];
console.log(`[${nowFull}] Sitemap generator...`);

const fs = require("node:fs");
function writeFile(filepath, data) {
    fs.writeFile(
        filepath,
        typeof data !== "string" ? JSON.stringify(data, null, 4) : data,
        "utf8",
        (err) => {
            const message = [`- "${filepath}":`];
            if (err) {
                message.push("Error writing file:", err);
            } else {
                message.push("Updated.");
            }
            console.log(message.join(" "));
        },
    );
}

const appConfig = require("./app-config.json");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${appConfig.homepage}</loc>
        <lastmod>${nowFull}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1</priority>
    </url>
</urlset>`;
writeFile('./public/sitemap.xml', sitemap);

const url = new URL(appConfig.homepage);
const robots = `User-agent: *
Allow: /
Allow: ${url.pathname}
Allow: ${url.pathname}infos.json

Sitemap: ${url.href}/sitemap.xml`;
writeFile('./public/robots.txt', robots);
