
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const util = require("util");

const readDir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

async function getFiles(inputFolder) {
  let files = await readDir(inputFolder, { withFileTypes: true });
  let schemaFiles = files.filter((f) => {
    return (f.isFile() && path.extname(f.name) === ".json");
  });

  return schemaFiles;
}

async function computeHash(file) {
  let data = await readFile(file);
  let hash = crypto.createHash("sha256");
  return hash.update(data).digest("hex");
}

async function exportData(data, outFile) {
  await writeFile(outFile, JSON.stringify(data, null, 2));
}

module.exports = {
  computeHash,
  exportData,
  getFiles,
};
