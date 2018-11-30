"use strict";

const util = require("util");
const { Base, populateLocation, extractOnspdVal } = require("./base");
const async = require("async");
const Pc = require("postcode");

const TerminatedPostcodeSchema = {
  "id": "SERIAL PRIMARY KEY", 
  "postcode": `VARCHAR(10) NOT NULL COLLATE "C"`,
  "pc_compact" : `VARCHAR(9) COLLATE "C"`,
  "year_terminated" : "INTEGER",
  "month_terminated": "INTEGER",
  "eastings" : "INTEGER",
  "northings" : "INTEGER",
  "longitude" : "DOUBLE PRECISION",
  "latitude" : "DOUBLE PRECISION",
  "location" : "GEOGRAPHY(Point, 4326)"
};

const indexes = [{
  unique: true,
  column: "pc_compact"
}];

function TerminatedPostcode () {
  this.idCache = {};
  Base.call(this, "terminated_postcodes", TerminatedPostcodeSchema, indexes);
}

util.inherits(TerminatedPostcode, Base);

const findQuery = `
	SELECT *
	FROM 
		terminated_postcodes 
	WHERE pc_compact=$1
`;

TerminatedPostcode.prototype.find = function (postcode, callback) {
	if (typeof postcode !== "string") return callback(null, null);
	postcode = postcode.trim().toUpperCase();
	if (!new Pc(postcode).valid()) return callback(null, null);
	this._query(findQuery, [postcode.replace(/\s/g, "")], (error, result) => {
		if (error) return callback(error, null);
		if (result.rows.length === 0) return callback(null, null);
		callback(null, result.rows[0]);
	});
};

TerminatedPostcode.prototype.whitelistedAttributes = [
  "postcode", "year_terminated", "month_terminated", "longitude", "latitude"
];

/**
 * Turn terminated postcode data into json object
 * @param  {Object} terminatedPostcode - Raw instance of terminated postcode data
 * @return {Object}                    - Terminated postcode object containing only whitelisted attributes 
 */
 TerminatedPostcode.prototype.toJson = function (terminatedPostcode) {
   return this.whitelistedAttributes.reduce((acc, attr) => {
     acc[attr] = terminatedPostcode[attr];
     return acc;
   }, {});
  };
  
TerminatedPostcode.prototype.seedPostcodes = function (filepath, callback) {
  const ONSPD_COL_MAPPINGS = Object.freeze([
    { column: "postcode", method: row => row.extract("pcds") },
    { column: "pc_compact", method: row => row.extract("pcds").replace(/\s/g, "") },
    { column: "year_terminated", method: row => row.extract("doterm").slice(0,4) },
    { column: "month_terminated", method: row => row.extract("doterm").slice(-2) },
    { column: "eastings", method: row => row.extract("oseast1m") },
    { column: "northings", method: row => row.extract("osnrth1m") },
    { 
      column: "longitude",
      method: row => {
        const eastings = row.extract("oseast1m");
				return eastings === "" ? null : row.extract("long");
      },
    },
    {
      column: "latitude",
      method: row => {
        const northings = row.extract("osnrth1m");
				return northings === "" ? null : row.extract("lat");
      },
    }
  ]);

  this._csvSeed({
    filepath, 
    transform: row => {
      if (row[0] === "pcd") return null; //ignore header
      if (row[4].length === 0) return null; // Skip if not terminated
      row.extract = code => extractOnspdVal(row, code); // Append extraction
      return ONSPD_COL_MAPPINGS.map(elem => elem.method(row));
    },
    columns: ONSPD_COL_MAPPINGS.map(elem => elem.column).join(","), 
  }, callback);
};
  
TerminatedPostcode.prototype._setupTable = function (filePath, callback) {
	async.series([
		this._createRelation.bind(this),
		this.clear.bind(this),
		cb => this.seedPostcodes(filePath, cb),
    this.populateLocation.bind(this),
		this.createIndexes.bind(this),
	], callback);
};

TerminatedPostcode.prototype.populateLocation = populateLocation;

module.exports = new TerminatedPostcode();
