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
} = require("../../app/models/index.js");

/**
 * Clears the test database
 * - Skips if PRESERVE_DB
 * @param  {function} callback
 * @return {undefined}
 */
const clearTestDb = callback => {
  if (process.env.PRESERVE_DB !== undefined) return callback(null);
  async.parallel(
    [
      Postcode,
      TerminatedPostcode,
      District,
      Parish,
      Nuts,
      County,
      Constituency,
      ScottishConstituency,
      Ccg,
      Ward,
      Outcode,
      Place,
      Ced,
    ].map(m => m._destroyRelation.bind(m)),
    callback
  );
};

const seedTerminatedPostcodeDb = callback => {
  if (NO_RELOAD_DB) return callback(null);
  TerminatedPostcode._setupTable(seedPostcodePath, callback);
};

const seedPostcodeDb = callback => {
  if (NO_RELOAD_DB) return callback(null);
  async.series(
    [
      cb => Postcode._setupTable(seedPostcodePath, cb),
      cb => TerminatedPostcode._setupTable(seedPostcodePath, cb),
      cb => Place._setupTable(seedPlacesPath, cb),
      cb => ScottishPostcode._setupTable(seedScotlandPostcodePath, cb),
    ].concat(
      [
        District,
        Parish,
        Nuts,
        County,
        Constituency,
        ScottishConstituency,
        Ccg,
        Ward,
        Outcode,
        Ced,
      ].map(m => m._setupTable.bind(m))
    ),
    callback
  );
};

// Clear terminated onspd table
const clearTerminatedPostcodesDb = callback => {
  if (NO_RELOAD_DB) return callback(null);
  TerminatedPostcode._destroyRelation(callback);
};

// Clear ONSPD table
const clearPostcodeDb = callback => {
  if (NO_RELOAD_DB) return callback(null);
  Postcode._destroyRelation(callback);
};

// Clear SPD Table
const clearScottishPostcodeDb = callback => {
  if (NO_RELOAD_DB) return callback(null);
  ScottishPostcode._destroyRelation(callback);
};

module.exports = {
  clearTestDb,
  seedPostcodePath,
  seedTerminatedPostcodeDb,
  seedPostcodeDb,
  seedScotlandPostcodePath,
  clearTerminatedPostcodesDb,
  clearPostcodeDb,
  clearScottishPostcodeDb,
};
