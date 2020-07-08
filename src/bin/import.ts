const sourceFile = process.argv[2];

const message = `
Postcodes.io ONS Postcode Directory Import Script

This import script will populate temporary new tables with data from the
postcodes.io data repository or the ONSPD file found at ${sourceFile}

Once a table has been populated, any pre-existing tables will be swapped out
into an archived relation and the newly populated table swapped in. Should 
you experience any failures, you can swap back the archived table to restore
your previous dataset

Type 'YES' to continue
`;

//@ts-ignore
import { query } from "../app/models/base";
import { Postcode, TerminatedPostcode, Outcode } from "../app/models";
import { setupSupportTables } from "../app/lib/setup";

const source = process.argv[2];

if (!source) {
  console.log("Aborting Import. No source file specified");
  process.exit(1);
}

const createPostgisExtension = async () => {
  console.log("Enabling POSTGIS extension...");
  await query("CREATE EXTENSION IF NOT EXISTS postgis");
};

const setupTerminatedPostcodesTable = async () => {
  console.log("Building terminated postcodes table...");
  await TerminatedPostcode.destroyRelation();
  await TerminatedPostcode.setupTable(source);
};

const setupOutcodeTable = async () => {
  console.log("Building outcodes table...");
  await Outcode.destroyRelation();
  await Outcode.setupTable();
};

const setupPostcodesTable = async () => {
  console.log("Building postcodes table...");
  await Postcode.destroyRelation();
  await Postcode.setupTable(source);
};

const setupDataTables = async () => {
  console.log("Setting up support tables...");
  await setupSupportTables();
};

const run = async () => {
  try {
    const start = process.hrtime();
    await createPostgisExtension();
    await setupPostcodesTable();
    await setupTerminatedPostcodesTable();
    await setupDataTables();
    await setupOutcodeTable();
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
