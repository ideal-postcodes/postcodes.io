const source = process.argv[2];

import { query } from "../app/models/base";
import { Place } from "../app/models/index";

if (!source) {
  console.log("Aborting Import. No source directory specified");
  process.exit(1);
}

const createPostgisExtension = async () => {
  console.log("Enabling POSTGIS extension...");
  await query("CREATE EXTENSION IF NOT EXISTS postgis");
};

const createUnaccentExtension = async () => {
  console.log("Enabling UNACCENT extension...");
  await query("CREATE EXTENSION IF NOT EXISTS unaccent");
};

const setupPlaceTable = async () => {
  console.log("Building places table...");
  await Place.setupTable(source);
};

export const run = async () => {
  try {
    const start = process.hrtime();
    await createPostgisExtension();
    await createUnaccentExtension();
    await setupPlaceTable();
    console.log(
      `Finished import process in ${process.hrtime(start)[0]} seconds`
    );
    process.exit(0);
  } catch (error) {
    console.log(
      "Unable to complete import process due to error:",
      JSON.stringify(error, null, 2)
    );
    return process.exit(1);
  }
};
