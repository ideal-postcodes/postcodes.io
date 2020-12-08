import { join, resolve } from "path";
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
  Lsoa,
  Msoa,
} from "../../src/app/models/index";
import { QueryResult } from "pg";

const NO_RELOAD_DB = !!process.env.NO_RELOAD_DB;
const seedPostcodePath = resolve(__dirname, "../seed/postcode.csv");
const seedPlacesPath = join(__dirname, "../seed/places/");
const seedScotlandPostcodePath = resolve(__dirname, "../seed/");

/**
 * Clears the test database
 * - Skips if PRESERVE_DB
 * @param  {function} callback
 * @return {undefined}
 */
const clearTestDb = async (): Promise<any[] | null> => {
  if (process.env.PRESERVE_DB !== undefined) return null;
  return Promise.all([
    Postcode.destroyRelation(),
    TerminatedPostcode.destroyRelation(),
    Place.destroyRelation(),
    ScottishPostcode.destroyRelation(),
    District.destroyRelation(),
    Parish.destroyRelation(),
    Nuts.destroyRelation(),
    County.destroyRelation(),
    Constituency.destroyRelation(),
    ScottishConstituency.destroyRelation(),
    Ccg.destroyRelation(),
    Ward.destroyRelation(),
    Lsoa.destroyRelation(),
    Msoa.destroyRelation(),
    Outcode.destroyRelation(),
    Ced.destroyRelation(),
  ]);
};

const seedTerminatedPostcodeDb = async (): Promise<void | null> => {
  if (NO_RELOAD_DB) return null;
  return TerminatedPostcode.setupTable(seedPostcodePath);
};

const seedPostcodeDb = async (): Promise<any[] | null> => {
  if (NO_RELOAD_DB) return null;
  return Promise.all([
    Postcode.setupTable(seedPostcodePath),
    TerminatedPostcode.setupTable(seedPostcodePath),
    Place.setupTable(seedPlacesPath),
    ScottishPostcode.setupTable(seedScotlandPostcodePath),
    District.setupTable(),
    Parish.setupTable(),
    Nuts.setupTable(),
    County.setupTable(),
    Constituency.setupTable(),
    ScottishConstituency.setupTable(),
    Ccg.setupTable(),
    Ward.setupTable(),
    Lsoa.setupTable(),
    Msoa.setupTable(),
    Outcode.setupTable(),
    Ced.setupTable(),
  ]);
};

// Clear terminated onspd table
const clearTerminatedPostcodesDb = async (): Promise<QueryResult<
  any
> | null> => {
  if (NO_RELOAD_DB) return null;
  return TerminatedPostcode.destroyRelation();
};

// Clear ONSPD table
const clearPostcodeDb = async (): Promise<QueryResult<any> | null> => {
  if (NO_RELOAD_DB) return null;
  await Postcode.destroyRelation();
};

// Clear SPD Table
const clearScottishPostcodeDb = async (): Promise<QueryResult<any> | null> => {
  if (NO_RELOAD_DB) return null;
  return ScottishPostcode.destroyRelation();
};

const seedScottishPostcodeDb = async (): Promise<any[] | null> => {
  if (NO_RELOAD_DB) return null;
  const postcode = await ScottishPostcode.setupTable(seedScotlandPostcodePath);
  const constituency = await ScottishConstituency.setupTable();
  return [postcode, constituency];
};

export {
  clearTestDb,
  seedPostcodePath,
  seedTerminatedPostcodeDb,
  seedPostcodeDb,
  seedScottishPostcodeDb,
  seedScotlandPostcodePath,
  clearTerminatedPostcodesDb,
  clearPostcodeDb,
  clearScottishPostcodeDb,
};
