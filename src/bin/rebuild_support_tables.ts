import { Outcode } from "../app/models/outcode";
import { setupSupportTables } from "../app/lib/setup";

export const run = async () => {
  try {
    console.log("Rebuilding data tables");
    await setupSupportTables();
    console.log("Done");
    console.log("Rebuilding outcodes table");
    await Outcode.setupTable();
    console.log("Done");
    console.log("Completed rebuild");
    process.exit(0);
  } catch (e) {
    console.log("An error occurred:", e);
    process.exit(1);
  }
};
