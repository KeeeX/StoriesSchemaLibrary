#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const yargs = require("yargs");
const storiesService = require("./services/stories");
const utilHelper = require("./services/util");

const argv = yargs
  .usage("Usage: $0 -e [account_email] -p [password] -i [input_folder] -o [output_file]")
  .alias("c", "community")
  .alias("e", "email")
  .alias("p", "password")
  .alias("i", "input")
  .alias("o", "output")
  .alias("h", "help")
  .alias("v", "version")
  .describe("c", "Configuration file in JSON format")
  .demandOption(["c", "e", "p"])
  .help()
  .epilog("Copyright 2019 KeeeX SAS")
  .argv;

// Get absolute path of input folder
let inputFolder = argv.input || "jsonSchema";
inputFolder = path.isAbsolute(inputFolder)
  ? inputFolder
  : path.join(process.cwd(), inputFolder);

// Get absolute path of output file
let outputFile = argv.output || "schema_idx.json";
outputFile = path.isAbsolute(outputFile)
  ? outputFile
  : path.join(process.cwd(), outputFile);

let hashFile = path.join(process.cwd(), "hash.json");

storiesService.init({
  email: argv.email,
  password: argv.password
})
  .then(async () => {
    if (!fs.existsSync(hashFile)) {
      await utilHelper.exportData({}, hashFile);
    }
    let hashes = require(hashFile);

    if (!fs.existsSync(outputFile)) {
      await utilHelper.exportData({}, outputFile);
    }
    let schemaIdxs = require(outputFile);

    let files = await utilHelper.getFiles(inputFolder);

    for (let i = 0; i < files.length; i++) {
      let file = files[i];
      let filePath = path.join(inputFolder, file.name);
      let basename = path.basename(file.name);

      // Check if this file is already processed
      let hash = await utilHelper.computeHash(filePath);
      if (hashes[basename] && hashes[basename] === hash) {
        continue;
      }

      // Get Chain IDX of the schema
      let schemaIdx = null;
      if (schemaIdxs[basename]) {
        schemaIdx = schemaIdxs[basename][0];
      } else {
        schemaIdxs[basename] = [];
      }

      // Create or update schema
      let idx = schemaIdx
        ? await storiesService.updateSchema(schemaIdx, filePath)
        : await storiesService.createSchema(argv.community, filePath);

      // Update locale information for later use
      hashes[basename] = hash;
      schemaIdxs[basename].push(idx);
    }

    // Export data
    await utilHelper.exportData(hashes, hashFile);
    await utilHelper.exportData(schemaIdxs, outputFile);
  })
  .catch((error) => {
    console.log(error);
  });
