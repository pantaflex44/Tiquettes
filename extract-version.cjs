const pkg = require("./package.json");
const infos = JSON.stringify({
    name: pkg.title,
    version: pkg.version,
    description: pkg.description
});

const fs = require("fs");
fs.writeFile("./public/infos.json", infos, 'utf8', (err) => {
    if (err) {
        console.error("Error writing file:", err);
    } else {
        console.log("File written successfully");
    }
});