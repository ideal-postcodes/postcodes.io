"use strict";

const async = require("async");
const { join, resolve } = require("path");
const NO_RELOAD_DB = !!process.env.NO_RELOAD_DB;
const seedPostcodePath = resolve(__dirname, "../seed/postcode.csv");
const seedPlacesPath = join(__dirname, "../seed/places/");
const seedScotlandPostcodePath = resolve(__dirname, "../seed/");

const {
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
} = require("../../src/app/models/index");

/**
 * Clears the test database
 * - Skips if PRESERVE_DB
 * @param  {function} callback
 * @return {undefined}
 */
const clearTestDb = async () => {
  if (process.env.PRESERVE_DB !== undefined) return null;
  return Promise.all([
    (async () => await Postcode.destroyRelation())(),
    (async () => await TerminatedPostcode.destroyRelation())(),
    (async () => await Place.destroyRelation())(),
    (async () => await ScottishPostcode.destroyRelation())(),
    (async () => await District.destroyRelation())(),
    (async () => await Parish.destroyRelation())(),
    (async () => await Nuts.destroyRelation())(),
    (async () => await County.destroyRelation())(),
    (async () => await Constituency.destroyRelation())(),
    (async () => await ScottishConstituency.destroyRelation())(),
    (async () => await Ccg.destroyRelation())(),
    (async () => await Ward.destroyRelation())(),
    (async () => await Outcode.destroyRelation())(),
    (async () => await Ced.destroyRelation())(),
  ]);
};

const seedTerminatedPostcodeDb = (callback) => {
  if (NO_RELOAD_DB) return null;
  return TerminatedPostcode.setupTable(seedPostcodePath);
};

const seedPostcodeDb = async () => {
  if (NO_RELOAD_DB) return null;
  return Promise.all([
    (async () => await Postcode.setupTable(seedPostcodePath))(),
    (async () => await TerminatedPostcode.setupTable(seedPostcodePath))(),
    (async () => await Place.setupTable(seedPlacesPath))(),
    (async () => await ScottishPostcode.setupTable(seedScotlandPostcodePath))(),
    (async () => await District.setupTable())(),
    (async () => await Parish.setupTable())(),
    (async () => await Nuts.setupTable())(),
    (async () => await County.setupTable())(),
    (async () => await Constituency.setupTable())(),
    (async () => await ScottishConstituency.setupTable())(),
    (async () => await Ccg.setupTable())(),
    (async () => await Ward.setupTable())(),
    (async () => await Outcode.setupTable())(),
    (async () => await Ced.setupTable())(),
  ]);
};

// Clear terminated onspd table
const clearTerminatedPostcodesDb = async () => {
  if (NO_RELOAD_DB) return null;
  return TerminatedPostcode.destroyRelation();
};

// Clear ONSPD table
const clearPostcodeDb = async () => {
  if (NO_RELOAD_DB) return null;
  await Postcode.destroyRelation();
};

// Clear SPD Table
const clearScottishPostcodeDb = async () => {
  if (NO_RELOAD_DB) return null;
  return ScottishPostcode.destroyRelation();
};

const seedScottishPostcodeDb = async () => {
  if (NO_RELOAD_DB) return null;
  const postcode = await ScottishPostcode.setupTable(seedScotlandPostcodePath);
  const constituency = await ScottishConstituency.setupTable();
  return [postcode, constituency];
};

module.exports = {
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
