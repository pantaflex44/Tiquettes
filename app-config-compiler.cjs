let now = new Date(Date.now());
const offset = now.getTimezoneOffset();
now = new Date(now.getTime() - (offset * 60 * 1000));
let nowFull = now.toISOString();
now = nowFull.split('T')[0];
console.log(`[${nowFull}] App config compilation...`);

const fs = require("fs");
function writeFile(filepath, data) {
    fs.writeFile(filepath, typeof data !== 'string' ? JSON.stringify(data, null, 4) : data, 'utf8', (err) => {
        let message = [`- "${filepath}":`];
        if (err) {
            message.push("Error writing file:", err);
        } else {
            message.push("Updated.");
        }
        console.log(message.join(' '));
    });
}


const appConfig = require('./app-config.json');
let pkg = require('./package-base.json');


let version = "1.0.0";
let versions = Object.keys(appConfig.changelog ?? {});
if (versions.length > 0) version = versions[0];
let versionDate = appConfig.changelog[version]?.date ?? "";
console.log(`Last release: v${version} ${versionDate}`);
pkg = {
    ...pkg,
    name: appConfig.name,
    title: appConfig.title,
    description: appConfig.description,
    keywords: appConfig.keywords,
    author: appConfig.author,
    license: appConfig.license,
    homepage: appConfig.homepage,
    repository: appConfig.repository,
    version
};
writeFile("./package.json", pkg);

const infos = {
    name: pkg.title ?? "",
    version: pkg.version ?? "",
    date: versionDate,
    description: pkg.description ?? "",
    license: pkg.license ?? "",
    author: pkg.author ?? "",
    repository: pkg.repository?.url ?? "",
    homepage: pkg.homepage ?? "",
};
writeFile("./public/infos.json", infos);


let changelog = `# ChangeLog - Build ${version} Update ${nowFull}\n\n`;

function printChangeLogAction(action) {
    if (action.text) {
        changelog += "\n";
        changelog += `- `;

        if (action.from?.name) {
            if (action.from?.link) {
                changelog += `[[${action.from.name}](${action.from.link})]`;
            } else {
                changelog += `[${action.from.name}]`;
            }
            changelog += ` `;
        }

        changelog += `${action.text}`;
    }
}

function scanChangeLogAction(type, title) {
    if (Array.isArray(type)) {
        changelog += `\n\n### ${title}\n`;
        type.forEach(action => printChangeLogAction(action));
    }
}

Object.keys(appConfig.changelog ?? {}).forEach(version => {
    const entry = appConfig.changelog[version];
    changelog += `## [${version}]`;
    if (entry.date) changelog += ` - ${entry.date}`;

    scanChangeLogAction(entry.actions?.patches, "Corrections");
    scanChangeLogAction(entry.actions?.updates, "Modifications");
    scanChangeLogAction(entry.actions?.adds, "Ajouts");

    changelog += "\n\n\n";
});

writeFile("./CHANGELOG.md", changelog);