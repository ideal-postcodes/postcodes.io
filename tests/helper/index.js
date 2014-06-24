var	csv = require("csv");
var util = require("util");
var path = require("path");
var OSPoint = require("ospoint");
var assert = require("chai").assert;
var randomString = require("random-string");
var rootPath = path.join(__dirname, "../../");
var env = process.env.NODE_ENV || "development";
var Base = require(path.join(rootPath, "app/models"));
var config = require(path.join(rootPath + "/config/config"))(env);
var Postcode = require(path.join(rootPath, "app/models/postcode"));
var seedPostcodePath = path.join(rootPath, "tests/seed/postcode.csv");

var CSV_INDEX = {
	postcode: 2,
	northings: 10,
	eastings: 9
};

// Location with nearby postcodes to be used in lonlat test requests


var locationWithNearbyPostcodes = function (callback) {
	var postcodeWithNearbyPostcodes = "AB14 0LP";
	Postcode.find(postcodeWithNearbyPostcodes, function (error, result) {
		if (error) return callback(error, null);
		return callback(null, result);
	});
}

function getCustomRelation () {
	var relationName = randomString({
			  length: 8,
			  numeric: false,
			  letters: true,
			  special: false
			}),
			schema = {
				"id" : "serial PRIMARY KEY",
				"somefield": "varchar(255)"
			};

	function CustomRelation() {
		Base.Base.call(this, relationName, schema);
	}

	util.inherits(CustomRelation, Base.Base);

	return new CustomRelation();
}

function connectToDb () {
	return Base.connect(config);
}

function seedPostcodeDb (callback) {
	Postcode._createRelation(function (error, result) {
		if (error) return callback(error, null)
		Postcode.clear(function (error, result) {
			if (error) return callback(error, null)
			Postcode.seedPostcodes(seedPostcodePath, function (error, result) {
				if (error) return callback(error, null)
				Postcode.populateLocation(function (error, result) {
					if (error) throw error;
					Postcode.createIndexes(function (error, result) {
						if (error) return callback(error, null)
						callback(null, result);
					});
				});
			});
		});
	});
}

function clearPostcodeDb(callback) {
	Postcode._destroyRelation(callback);
}

var getRandom = function (max) {
	return Math.floor(Math.random() * max);
}

function randomPostcode(callback) {
	Postcode.random(function (error, result) {
		callback(error, result.postcode);
	});
}

function randomOutcode(callback) {
	return Postcode.random(function (error, result) {
		callback(error, result.outcode)
	});
}

function randomLocation(callback) {
	return Postcode.random(function (error, result) {
		callback(error, {
			longitude: result.longitude,
			latitude: result.latitude
		})
	});
}

function lookupRandomPostcode(callback) {
	Postcode.random(function (error, result) {
		if (error) {
			throw error;
		}
		callback(result);
	});
}

function jsonpResponseBody (response) {
	// Rough regex to extract json object
	var result = response.text.match(/\(.*\)/);
	return JSON.parse(result[0].slice(1, result[0].length - 1));
}

function allowsCORS (response) {
	assert.equal(response.headers["access-control-allow-origin"], "*");
}

function validCorsOptions(response) {
	assert.equal(response.headers["access-control-allow-origin"], "*");
	assert.equal(response.headers["access-control-allow-methods"], "GET,POST");
	assert.equal(response.headers["access-control-allow-headers"], "X-Requested-With,Content-Type");	
}

function isPostcodeObject(o) {
	assert.notProperty(o, "id");
	assert.property(o, "nhs_ha");
	assert.property(o, "country");
	assert.property(o, "quality");
	assert.property(o, "postcode");
	assert.property(o, "eastings");
	assert.property(o, "latitude");
	assert.property(o, "northings");
	assert.property(o, "longitude");
	assert.property(o, "admin_ward");
	assert.notProperty(o, "location");
	assert.property(o, "admin_county");
	assert.notProperty(o, "pc_compact");
	assert.property(o, "admin_district");
	assert.property(o, "parliamentary_constituency");
	assert.property(o, "european_electoral_region");
	assert.property(o, "parish");
	assert.property(o, "lsoa");
	assert.property(o, "msoa");
	assert.property(o, "nuts");
	assert.property(o, "ccg");
	assert.property(o, "primary_care_trust");
	assert.property(o, "incode");
	assert.property(o, "outcode");
}

function isRawPostcodeObject(o) {
	assert.property(o, "id");
	assert.property(o, "nhs_ha");
	assert.property(o, "country");
	assert.property(o, "quality");
	assert.property(o, "postcode");
	assert.property(o, "eastings");
	assert.property(o, "latitude");
	assert.property(o, "location");
	assert.property(o, "northings");
	assert.property(o, "longitude");
	assert.property(o, "pc_compact");
	assert.property(o, "admin_ward");
	assert.property(o, "admin_county");
	assert.property(o, "admin_district");
	assert.property(o, "parliamentary_constituency");
	assert.property(o, "european_electoral_region");
	assert.property(o, "parish");
	assert.property(o, "lsoa");
	assert.property(o, "msoa");
	assert.property(o, "nuts");
	assert.property(o, "ccg");
	assert.property(o, "primary_care_trust");
	assert.property(o, "incode");
	assert.property(o, "outcode");
}

module.exports = {
	Base: Base,
	config: config,
	rootPath: rootPath,
	Postcode: Postcode,
	allowsCORS: allowsCORS,
	connectToDb: connectToDb,
	randomOutcode: randomOutcode,
	randomPostcode: randomPostcode,
	randomLocation: randomLocation,
	seedPostcodeDb: seedPostcodeDb,
	clearPostcodeDb: clearPostcodeDb,
	validCorsOptions: validCorsOptions,
	isPostcodeObject: isPostcodeObject,
	jsonpResponseBody: jsonpResponseBody,
	getCustomRelation: getCustomRelation,
	isRawPostcodeObject: isRawPostcodeObject, 
	lookupRandomPostcode: lookupRandomPostcode,
	locationWithNearbyPostcodes: locationWithNearbyPostcodes,
	seedPaths: {
		postcodes: path.join(rootPath, "/tests/seed/postcodes.csv"),
		customRelation: path.join(rootPath, "/tests/seed/customRelation.csv")
	}
}

