"use strict";

const util = require("util");
const { Base, populateLocation, getLocation } = require("./index");
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
  
TerminatedPostcode.prototype.seedPostcodes = function (filePath,callback) {
  const csvColumns = [
    "postcode",
    "pc_compact",
    "year_terminated",
    "month_terminated",
    "eastings",
    "northings",
    "longitude",
    "latitude"
  ];

  const transform = row => {
    if (row[0] === "pcd") return null; //ignore header
    
    if (row[4].length === 0) return null;
    
    const finalRow = [];
    finalRow.push(row[2]); // postcode
    finalRow.push(row[2].replace(/\s/g, ""));		// pc_compact
    finalRow.push(parseInt(row[4].slice(0,4), 10)); //year_terminated
    finalRow.push(parseInt(row[4].slice(-2), 10)); //month_terminated
    
    const eastings = row[9];
    finalRow.push(eastings);                            // Eastings
    const northings = row[10];													
    finalRow.push(northings);			                      // Northings
    										  
    const country = row[14];
    const location = getLocation({
      eastings: eastings, 
      northings: northings, 
      country: country
    });

    finalRow.push(location.longitude);							// longitude
    finalRow.push(location.latitude);								// latitude
    
    return finalRow;
  };
  
  this._csvSeed({
    filepath: filePath, 
    columns: csvColumns.join(","), 
    transform: transform
  }, callback);
};
  
TerminatedPostcode.prototype._setupTable = function (filePath, callback) {
	const self = this;
	async.series([
		self._createRelation.bind(self),
		self.clear.bind(self),
		function seedData (cb) {
			self.seedPostcodes(filePath, cb);
		},
    self.populateLocation.bind(self),
		self.createIndexes.bind(self),
	], callback);
};

TerminatedPostcode.prototype.populateLocation = populateLocation;

module.exports = new TerminatedPostcode();
