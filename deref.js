#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const yargs = require("yargs");
const $RefParser = require("json-schema-ref-parser");

const utilHelper = require("./services/util");

const argv = yargs
  .usage("Usage: $0 -i [input_folder] -o [output_file]")
  .alias("i", "input")
  .alias("o", "output")
  .alias("h", "help")
  .alias("v", "version")
  .demandOption(["o"])
  .help()
  .epilog("Copyright 2019 KeeeX SAS")
  .argv;

// Get absolute path of input folder
let inputFolder = argv.input || "jsonSchema";
inputFolder = path.isAbsolute(inputFolder)
  ? inputFolder
  : path.join(process.cwd(), inputFolder);

// Get absolute path of output folder
let outputFolder = argv.output;
outputFolder = path.isAbsolute(outputFolder)
  ? outputFolder
  : path.join(process.cwd(), outputFolder);
fs.existsSync(outputFolder) || fs.mkdirSync(outputFolder);

utilHelper.getFiles(inputFolder)
  .then(async (files) => {
    for (let i = 0; i < files.length; i++) {
      let file = files[i];
      let filePath = path.join(inputFolder, file.name);
      let schema = await $RefParser.dereference(filePath);

      let outputPath = path.join(outputFolder, file.name);
      await utilHelper.exportData(schema, outputPath);
    }
  })
  .catch((error) => {
    console.log(error);
  });
