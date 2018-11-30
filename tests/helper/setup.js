"use strict";

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

const async = require("async");

/**
 * Clears the test database
 * - Skips if PRESERVE_DB
 * @param  {function} callback
 * @return {undefined}
 */
const clearTestDb = callback => {
	if (process.env.PRESERVE_DB !== undefined) return callback(null);
	const instructions = [];
	instructions.push(Postcode._destroyRelation.bind(Postcode));
	instructions.push(TerminatedPostcode._destroyRelation.bind(TerminatedPostcode));
	instructions.push(District._destroyRelation.bind(District));
	instructions.push(Parish._destroyRelation.bind(Parish));
	instructions.push(Nuts._destroyRelation.bind(Nuts));
	instructions.push(County._destroyRelation.bind(County));
	instructions.push(Constituency._destroyRelation.bind(Constituency));
	instructions.push(Ccg._destroyRelation.bind(Ccg));
	instructions.push(Ward._destroyRelation.bind(Ward));
	instructions.push(Outcode._destroyRelation.bind(Outcode));
	instructions.push(Place._destroyRelation.bind(Place));
	instructions.push(Ced._destroyRelation.bind(Ced));
	async.series(instructions, callback);
};

module.exports = {
  clearTestDb,
};

