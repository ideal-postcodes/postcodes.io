#!/usr/bin/env node

"use strict";

const sourceDirectory = process.argv[2];

const message = `
Postcodes.io Scottish Postcode Directory (SPD) Import Script

This import script will populate the scottish_postcodes relation from the 
Scottish Postcode Directory small and large user files found at
${sourceDirectory}

Note that the unzipped SPD directoy should contain both LargeUser.csv
and SmallUser.csv files

Type 'YES' to continue
`;

const prompt = require("prompt");
const { series } = require("async");
const { ScottishPostcode } = require("../app/models/index.js");

if (!sourceDirectory) {
  console.log("Aborting Import. No source directory specified");
  return process.exit(1);
}

prompt.start();

prompt.get([{ message, name: "confirmation" }], (error, result) => {
  if (error) {
    console.log(error);
    return process.exit(1);
  }

  if (result.confirmation !== "YES") {
    console.log("You have opted to cancel the import process");
    return process.exit(0);
  }

  const start = process.hrtime();

  console.log("Importing postcodes...");
  ScottishPostcode._setupTable(sourceDirectory, error => {
    if (error) {
      console.log(
        "Unable to complete import process due to error:",
        JSON.stringify(error, null, 2)
      );
      return process.exit(1);
    }
    console.log(
      `Finished import process in ${process.hrtime(start)[0]} seconds`
    );
    process.exit(0);
  });
});
