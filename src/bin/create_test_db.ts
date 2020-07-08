import {
  Postcode,
  District,
  Parish,
  County,
  Ccg,
  Constituency,
  ScottishConstituency,
  ScottishPostcode,
  Nuts,
  Ward,
  Outcode,
  Place,
  TerminatedPostcode,
  Ced,
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
  await District.destroyRelation();
  await Parish.destroyRelation();
  await Nuts.destroyRelation();
  await County.destroyRelation();
  await Constituency.destroyRelation();
  await ScottishConstituency.destroyRelation();
  await Ccg.destroyRelation();
  await Ward.destroyRelation();
  await Outcode.destroyRelation();
  await Ced.destroyRelation();
};

const seed = async (): Promise<unknown> => {
  if (NO_RELOAD_DB) return null;
  console.log("Creating postcode");
  await Postcode.setupTable(seedPostcodePath);
  await TerminatedPostcode.setupTable(seedPostcodePath);
  console.log("Creating place");
  await Place.setupTable(seedPlacesPath);
  await ScottishPostcode.setupTable(seedScotlandPostcodePath);
  await District.setupTable();
  await Parish.setupTable();
  await Nuts.setupTable();
  await County.setupTable();
  await Constituency.setupTable();
  await ScottishConstituency.setupTable();
  await Ccg.setupTable();
  await Ward.setupTable();
  console.log("Created outcode table");
  await Outcode.setupTable();
  await Ced.setupTable();
};

export const run = async () => {
  try {
    console.log("Wiping test database...");
    await clear();
    console.log("Done.");
    console.log("Recreating test database...");
    await seed();
    console.log("Done Seed.");
    process.exit(0);
  } catch (error) {
    handleError(error);
  }
};
