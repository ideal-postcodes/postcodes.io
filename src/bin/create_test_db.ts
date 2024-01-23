import {
  Postcode,
  ScottishConstituency,
  ScottishPostcode,
  Outcode,
  Place,
  TerminatedPostcode,
} from "../app/models/index";

const handleError = (error?: any) => {
  if (!error) return;
  console.log(error);
  console.log(`Error stopped test environment creation: ${error.message}`);
  process.exit(1);
};

import { join, resolve } from "path";

const NO_RELOAD_DB = !!process.env.NO_RELOAD_DB;
const seedPostcodePath = resolve(__dirname, "../../test/seed/postcode.csv");
const seedPlacesPath = join(__dirname, "../../test/seed/places/");
const seedScotlandPostcodePath = resolve(__dirname, "../../test/seed/");

// Clear ONSPD table
const clear = async (): Promise<unknown> => {
  if (NO_RELOAD_DB) return null;
  await Postcode.destroyRelation();
  await TerminatedPostcode.destroyRelation();
  await Place.destroyRelation();
  await ScottishPostcode.destroyRelation();
  await ScottishConstituency.destroyRelation();
  await Outcode.destroyRelation();
};

const seed = async (): Promise<unknown> => {
  if (NO_RELOAD_DB) return null;
  console.log("Creating postcodes relation");
  await Postcode.setupTable(seedPostcodePath);
  await TerminatedPostcode.setupTable(seedPostcodePath);
  console.log("Creating places releation");
  await Place.setupTable(seedPlacesPath);
  await ScottishPostcode.setupTable(seedScotlandPostcodePath);
  await ScottishConstituency.setupTable();
  await Outcode.setupTable();
  console.log("Created outcodes relation");
};

export const run = async () => {
  try {
    console.log("Wiping test database...");
    await clear();
    console.log("Done");
    console.log("Recreating test database...");
    await seed();
    console.log("Completed seeding");
    process.exit(0);
  } catch (error) {
    handleError(error);
  }
};
