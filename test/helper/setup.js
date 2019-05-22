"use strict";

const async = require("async");
const { join, resolve } = require("path");
const NO_RELOAD_DB = !!process.env.NO_RELOAD_DB;
const seedPostcodePath = resolve(__dirname, "../seed/postcode.csv");
const seedPlacesPath = join(__dirname, "../seed/places/")

const {
  Postcode,
  District,
  Parish,
  County,
  Ccg,
  Constituency,
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
	async.parallel([
    Postcode,
    TerminatedPostcode,
    District,
    Parish,
    Nuts,
    County,
    Constituency,
    Ccg,
    Ward,
    Outcode,
    Place,
    Ced,
  ].map(m => m._destroyRelation.bind(m)), callback);
};

const seedTerminatedPostcodeDb = callback => {
	if (NO_RELOAD_DB) return callback(null);
  TerminatedPostcode._setupTable(seedPostcodePath, callback);
}


const seedPostcodeDb = callback => {
	if (NO_RELOAD_DB) return callback(null);
  async.series([
    cb => Postcode._setupTable(seedPostcodePath, cb),
    cb => TerminatedPostcode._setupTable(seedPostcodePath, cb),
    cb => Place._setupTable(seedPlacesPath, cb),
  ].concat([
    District,
    Parish,
    Nuts,
    County,
    Constituency,
    Ccg,
    Ward,
    Outcode,
    Ced,
  ].map(m => m._setupTable.bind(m))), callback);
};

const clearTerminatedPostcodesDb = callback => {
	if (NO_RELOAD_DB) return callback(null);
	TerminatedPostcode._destroyRelation(callback);
};

// Runs before each test to clear test database
const clearPostcodeDb = callback => {
	if (NO_RELOAD_DB) return callback(null);
	Postcode._destroyRelation(callback);
};

module.exports = {
  clearTestDb,
  seedPostcodePath,
  seedTerminatedPostcodeDb,
  seedPostcodeDb,
  clearTerminatedPostcodesDb,
  clearPostcodeDb,
};

