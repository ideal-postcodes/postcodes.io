var	csv = require("csv");
var util = require("util");
var path = require("path");
var OSPoint = require("ospoint");
var assert = require("chai").assert;
var randomString = require("random-string");
var rootPath = path.join(__dirname, "../../");
var env = process.env.NODE_ENV || "development";
var NO_RELOAD_DB = !!process.env.NO_RELOAD_DB;
var Base = require(path.join(rootPath, "app/models"));
var config = require(path.join(rootPath + "/config/config"))(env);
var seedPostcodePath = path.join(rootPath, "tests/seed/postcode.csv");

// Load models
var Postcode = require(path.join(rootPath, "app/models/postcode"));
var District = require(path.join(rootPath, "app/models/district"));


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
};

function seedPostcodeDb (callback) {
	if (NO_RELOAD_DB) {
		return callback(null);
	}
	Postcode._setupTable(seedPostcodePath, function (error) {
		if (error) return callback(error, null);
		District._setupTable(function (error) {
			if (error) return callback(error);
			return callback(null);
		});
	});
}

function clearPostcodeDb(callback, force) {
	if (NO_RELOAD_DB) {
		return callback(null);
	}
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
	var nonProperties = ["id", "location", "pc_compact"];

	nonProperties.forEach(function (prop) {
		assert.notProperty(o, prop);
	});

	var properties = ["nhs_ha","country","quality","postcode","eastings","latitude",
		"northings","longitude","admin_ward","admin_county","admin_district",
		"parliamentary_constituency","european_electoral_region","parish","lsoa",
		"msoa","nuts","ccg","primary_care_trust","incode","outcode"];

	properties.forEach(function (prop) {
		assert.property(o, prop);
	});
}

function isRawPostcodeObject(o) {
	var properties = ["id", "nhs_ha", "country", "quality", "postcode", "eastings", "latitude", "location", 
	"northings",  "longitude", "pc_compact", "admin_ward", "admin_county", "admin_district",
	"parliamentary_constituency", "european_electoral_region", "parish", "lsoa", "msoa",
	"nuts", "ccg", "primary_care_trust", "incode", "outcode"]

	properties.forEach(function (prop) {
		assert.property(o, prop);
	});
}

function testOutcode(o) {
	var properties = ["longitude", "latitude", "northings", "eastings", "admin_ward", 
	"admin_district", "admin_county", "parish"];

	properties.forEach(function (prop) {
		assert.property(o, prop);
	});
}

module.exports = {
	Base: Base,
	config: config,
	rootPath: rootPath,
	Postcode: Postcode,
	District: District,
	allowsCORS: allowsCORS,
	connectToDb: connectToDb,
	testOutcode: testOutcode,
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

