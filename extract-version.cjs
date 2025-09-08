console.log("Package.json properties extractor ...");

const pkg = require("./package.json");

let now = new Date(Date.now());
const offset = now.getTimezoneOffset()
now = new Date(now.getTime() - (offset * 60 * 1000))
now = now.toISOString().split('T')[0]

const infos = JSON.stringify({
    name: pkg.title ?? "",
    version: pkg.version ?? "",
    description: pkg.description ?? "",
    date: !pkg.date ? now : `${pkg.date.year}-${String(pkg.date.month).padStart(2, '0')}-${String(pkg.date.day).padStart(2, '0')}`,
});

const fs = require("fs");
fs.writeFile("./public/infos.json", infos, 'utf8', (err) => {
    if (err) {
        console.error("Error writing file:", err);
    } else {
        console.log("File written successfully");
    }
});