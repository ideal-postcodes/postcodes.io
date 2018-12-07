#!/usr/bin/env node

const {
  setupSupportTables,
  setupOutcodeTable,
} = require("../app/lib/setup.js");

const main = async () => {
  try {
    console.log("Rebuilding data tables");
    await setupSupportTables();
    console.log("Done");
    console.log("Rebuilding outcodes table");
    await setupOutcodeTable();
    console.log("Done");
		console.log("Completed rebuild");
		process.exit(0);
  } catch (e) {
		console.log("An error occurred:", error);
		process.exit(1);
  }
};

main();

