const source = process.argv[2];

import { ScottishPostcode } from "../app/models/index";

if (!source) {
  console.log("Aborting Import. No source directory specified");
  process.exit(1);
}

export const run = async () => {
  try {
    const start = process.hrtime();
    console.log("Importing postcodes...");
    await ScottishPostcode.setupTable(source);
    console.log(
      `Finished import process in ${process.hrtime(start)[0]} seconds`
    );
    process.exit(0);
  } catch (error) {
    console.log(
      "Unable to complete import process due to error:",
      JSON.stringify(error, null, 2)
    );
    process.exit(1);
  }
};
