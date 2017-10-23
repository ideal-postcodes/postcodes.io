"use strict";

const util = require("util");
const path = require("path");
const async = require("async");
const OSPoint = require("ospoint");
const assert = require("chai").assert;
const randomString = require("random-string");
const rootPath = path.join(__dirname, "../../");
const env = process.env.NODE_ENV || "development";
const NO_RELOAD_DB = !!process.env.NO_RELOAD_DB;
const Base = require(path.join(rootPath, "app/models"));
const config = require(path.join(rootPath + "/config/config"))(env);
const seedPostcodePath = path.join(rootPath, "tests/seed/postcode.csv");
const seedPlacesPath = path.join(rootPath, "tests/seed/places/")

// Load models
const AttributeBase = require(path.join(rootPath, "app/models/attribute_base"));
const Postcode = require(path.join(rootPath, "app/models/postcode"));
const District = require(path.join(rootPath, "app/models/district"));
const Parish = require(path.join(rootPath, "app/models/parish"));
const County = require(path.join(rootPath, "app/models/county"));
const Ccg = require(path.join(rootPath, "app/models/ccg"));
const Constituency = require(path.join(rootPath, "app/models/constituency"));
const Nuts = require(path.join(rootPath, "app/models/nuts"));
const Ward = require(path.join(rootPath, "app/models/ward"));
const Outcode = require(path.join(rootPath, "app/models/outcode"));
const Place = require(path.join(rootPath, "app/models/place"));
const TerminatedPostcode = require(path.join(rootPath, "app/models/terminated_postcode"));

const CSV_INDEX = {
	postcode: 2,
	northings: 10,
	eastings: 9
};

// Location with nearby postcodes to be used in lonlat test requests


const locationWithNearbyPostcodes = function (callback) {
	const postcodeWithNearbyPostcodes = "AB14 0LP";
	Postcode.find(postcodeWithNearbyPostcodes, function (error, result) {
		if (error) return callback(error, null);
		return callback(null, result);
	});
}

function getCustomRelation () {
	const relationName = randomString({
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

function seedTerminatedPostcodeDb (callback) {
	if (NO_RELOAD_DB) {
		return callback(null);
	}
	const instructions = [];
	instructions.push(function (callback) {
		TerminatedPostcode._setupTable(seedPostcodePath, callback);
	});
	async.series(instructions, callback);
}


function seedPostcodeDb (callback) {
	if (NO_RELOAD_DB) {
		return callback(null);
	}

	const instructions = [];
	instructions.push(function (callback) {
		Postcode._setupTable(seedPostcodePath, callback);
	});
	instructions.push(function (callback) {
		TerminatedPostcode._setupTable(seedPostcodePath, callback);
	});
	instructions.push(District._setupTable.bind(District));
	instructions.push(Parish._setupTable.bind(Parish));
	instructions.push(Nuts._setupTable.bind(Nuts));
	instructions.push(County._setupTable.bind(County));
	instructions.push(Constituency._setupTable.bind(Constituency));
	instructions.push(Ccg._setupTable.bind(Ccg));
	instructions.push(Ward._setupTable.bind(Ward));
	instructions.push(Outcode._setupTable.bind(Outcode));
	instructions.push(function (callback) {
		Place._setupTable(seedPlacesPath, callback);
	});

	async.series(instructions, callback);
}

function clearTerminatedPostcodesDb(callback, force) {
	if (NO_RELOAD_DB) {
		return callback(null);
	}
	TerminatedPostcode._destroyRelation(callback);
}

// Runs before each test to clear test database
function clearPostcodeDb(callback, force) {
	if (NO_RELOAD_DB) {
		return callback(null);
	}
	Postcode._destroyRelation(callback);
}

//Generates a random integer from 1 to max inclusive
const getRandom = function (max) {
	return Math.ceil(Math.random() * max);
}

const QueryTerminatedPostcode = `
	SELECT
		postcode
	FROM
		terminated_postcodes LIMIT 1
	OFFSET $1
`;


function randomTerminatedPostcode (callback) {
	const randomId = getRandom(8); // 9 terminated postcodes in the
																 // testing database
	TerminatedPostcode._query(QueryTerminatedPostcode, [randomId], (error, result) => {
		if (error) return callback(error, null);
		if (result.rows.length === 0) return callback(null, null);
		callback(null, result.rows[0]);
	});
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
	const result = response.text.match(/\(.*\)/);
	return JSON.parse(result[0].slice(1, result[0].length - 1));
}

function allowsCORS (response) {
	assert.equal(response.headers["access-control-allow-origin"], "*");
}

function validCorsOptions(response) {
	assert.equal(response.headers["access-control-allow-origin"],
		"*");
	assert.equal(response.headers["access-control-allow-methods"],
		"GET,POST,OPTIONS");
	assert.equal(response.headers["access-control-allow-headers"],
		"X-Requested-With, Content-Type, Accept, Origin");
}

function isRawPlaceObject(o) {
	[
		"id",
		"code",
		"longitude",
		"latitude",
		"location",
		"eastings",
		"northings",
		"min_eastings",
		"min_northings",
		"max_eastings",
		"max_northings",
		"bounding_polygon",
		"local_type",
		"outcode",
		"name_1",
		"name_1_lang",
		"name_1_search",
		"name_1_search_ts",
		"name_2",
		"name_2_lang",
		"name_2_search",
		"name_2_search_ts",
		"county_unitary",
		"county_unitary_type",
		"district_borough",
		"district_borough_type",
		"region",
		"country",
		"polygon"
	].forEach(prop => assert.property(o, prop));
}

function isPlaceObject(o) {
	[
		"code",
		"longitude",
		"latitude",
		"eastings",
		"northings",
		"min_eastings",
		"min_northings",
		"max_eastings",
		"max_northings",
		"local_type",
		"outcode",
		"name_1",
		"name_1_lang",
		"name_2",
		"name_2_lang",
		"county_unitary",
		"county_unitary_type",
		"district_borough",
		"district_borough_type",
		"region",
		"country"
	].forEach(prop => assert.property(o, prop));

	[
		"id",
		"location",
		"name_1_search",
		"name_1_search_ts",
		"name_2_search",
		"name_2_search_ts",
		"bounding_polygon",
		"polygon"
	].forEach(prop => assert.notProperty(o, prop));
}

const rawPostcodeAttributes = Object.keys(Postcode.schema);
const postcodeAttributes = Postcode.whitelistedAttributes;


//baseObject is the main template of an object
//additionalArr is an array of extra attributes on the postcode object
//blackListedAttr is an array of attributes that Postcode object not supposed to have
function isSomeObject(o, baseObjectAttr, additionalAttr, blackListedAttr) {
	if (!additionalAttr) additionalAttr = [];
	if (!blackListedAttr) blackListedAttr = [];

	const whiteBaseObjAttr = baseObjectAttr.reduce((acc,curr) => {
		if (!blackListedAttr.includes(curr)) {acc.push(curr)}
		return acc;
	}, []);
	whiteBaseObjAttr.forEach(attr => assert.property(o, attr));
	if (additionalAttr) {
		additionalAttr.forEach(attr => assert.property(o, attr));
	}
	const expectedObjLen = whiteBaseObjAttr.length + additionalAttr.length;
	assert.equal(Object.keys(o).length, expectedObjLen);
}

function isPostcodeObject(o, additionalAttr, blackListedAttr) {
	if (!additionalAttr) additionalAttr = [];
	if (!blackListedAttr) blackListedAttr = [];
	isSomeObject(o, postcodeAttributes, additionalAttr, blackListedAttr);
}

function isPostcodeWithDistanceObject(o) {
	isPostcodeObject(o, ["distance"]);
}
//raw Object is the one that only has properties specified in the schema
function isRawPostcodeObject(o, additionalAttr, blackListedAttr) {
	if (!additionalAttr) additionalAttr = [];
	if (!blackListedAttr) blackListedAttr = [];
	isSomeObject(o, rawPostcodeAttributes, additionalAttr, blackListedAttr);
}

function isRawPostcodeObjectWithFC(o, additionalAttr, blackListedAttr) {
	if (!additionalAttr) additionalAttr = [];
	if (!blackListedAttr) blackListedAttr = [];
	isRawPostcodeObject(o, Postcode.getForeignColNames().concat(additionalAttr), blackListedAttr);
}

function isRawPostcodeObjectWithFCandDistance(o) {
	isRawPostcodeObjectWithFC(o, ["distance"])
}

const terminatedPostcodeAttributes = TerminatedPostcode.whitelistedAttributes;
const rawTerminatedPostcodeAttributes = Object.keys(TerminatedPostcode.schema);

function isTerminatedPostcodeObject(o) {
	terminatedPostcodeAttributes.forEach(attr => assert.property(o, attr));
	assert.equal(Object.keys(o).length, terminatedPostcodeAttributes.length);
}

function isRawTerminatedPostcodeObject(o) {
	rawTerminatedPostcodeAttributes.forEach(attr => assert.property(o, attr));
	assert.equal(Object.keys(o).length, rawTerminatedPostcodeAttributes.length);
}

function isOutcodeObject(o) {
	["id", "location"].forEach(prop => assert.notProperty(o, prop));

	[
		"eastings",
		"latitude",
		"northings",
		"longitude",
		"admin_ward",
		"admin_county",
		"admin_district",
		"parish",
		"outcode",
		"country"
	].forEach(prop => assert.property(o, prop));
}

function isRawOutcodeObject(o) {
	[
		"id",
		"eastings",
		"latitude",
		"location",
		"northings",
		"longitude",
		"admin_ward",
		"admin_county",
		"admin_district",
		"parish",
		"outcode",
		"country"
	].forEach(prop => assert.property(o, prop))
}

function testOutcode(o) {
	[
		"longitude",
		"latitude",
		"northings",
		"eastings",
		"admin_ward",
		"admin_district",
		"admin_county",
		"parish",
		"country"
	].forEach(prop => assert.property(o, prop));
}

// Credit: https://www.peterbe.com/plog/select-all-relations-in-postgresql
const databaseRelationsQuery = `
	SELECT
		c.relname as "Name",
		CASE c.relkind WHEN 'r' THEN 'table'
		WHEN 'v' THEN 'view'
		WHEN 'm' THEN 'materialized view'
		WHEN 'i' THEN 'index'
		WHEN 'S' THEN 'sequence'
		WHEN 's' THEN 'special'
		WHEN 'f' THEN 'foreign table' END as "Type"
	FROM pg_catalog.pg_class c
			 LEFT JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
	WHERE c.relkind IN ('r','v','m','S','f','')
				AND n.nspname <> 'pg_catalog'
				AND n.nspname <> 'information_schema'
				AND n.nspname !~ '^pg_toast'
		AND pg_catalog.pg_table_is_visible(c.oid);
`;

// List relations in database
function listDatabaseRelations(cb) {
	Base.Base.prototype._query(databaseRelationsQuery, cb);
}

// Credit: https://stackoverflow.com/questions/6777456/list-all-index-names-column-names-and-its-table-name-of-a-postgresql-database
const databaseIndexesQuery = `
	SELECT i.relname as indname,
	       i.relowner as indowner,
	       idx.indrelid::regclass,
	       am.amname as indam,
	       idx.indkey,
	       ARRAY(
	       SELECT pg_get_indexdef(idx.indexrelid, k + 1, true)
	       FROM generate_subscripts(idx.indkey, 1) as k
	       ORDER BY k
	       ) as indkey_names,
	       idx.indexprs IS NOT NULL as indexprs,
	       idx.indpred IS NOT NULL as indpred
	FROM   pg_index as idx
	JOIN   pg_class as i
	ON     i.oid = idx.indexrelid
	JOIN   pg_am as am
	ON     i.relam = am.oid
	JOIN   pg_namespace as ns
	ON     ns.oid = i.relnamespace
	AND    ns.nspname = ANY(current_schemas(false));
`;

// Lists indexes in database
function listDatabaseIndexes(cb) {
	Base.Base.prototype._query(databaseIndexesQuery, cb);
}

module.exports = {
	// Data
	config: config,
	rootPath: rootPath,
	seedPostcodePath: seedPostcodePath,

	// Methods

	allowsCORS: allowsCORS,
	testOutcode: testOutcode,
	randomOutcode: randomOutcode,
	isPlaceObject: isPlaceObject,
	randomPostcode: randomPostcode,
	randomTerminatedPostcode: randomTerminatedPostcode,
	randomLocation: randomLocation,
	seedPostcodeDb: seedPostcodeDb,
	seedTerminatedPostcodeDb: seedTerminatedPostcodeDb,
	clearPostcodeDb: clearPostcodeDb,
	clearTerminatedPostcodesDb: clearTerminatedPostcodesDb,
	isOutcodeObject: isOutcodeObject,
	validCorsOptions: validCorsOptions,
	isPostcodeObject: isPostcodeObject,
	isTerminatedPostcodeObject: isTerminatedPostcodeObject,
	isRawTerminatedPostcodeObject: isRawTerminatedPostcodeObject,
	isRawPlaceObject: isRawPlaceObject,
	isPostcodeWithDistanceObject: isPostcodeWithDistanceObject,
	jsonpResponseBody: jsonpResponseBody,
	getCustomRelation: getCustomRelation,
	isRawOutcodeObject: isRawOutcodeObject,
	isRawPostcodeObject: isRawPostcodeObject,
	isRawPostcodeObjectWithFC: isRawPostcodeObjectWithFC,
	isRawPostcodeObjectWithFCandDistance: isRawPostcodeObjectWithFCandDistance,
	lookupRandomPostcode: lookupRandomPostcode,
	listDatabaseRelations: listDatabaseRelations,
	listDatabaseIndexes: listDatabaseIndexes,
	locationWithNearbyPostcodes: locationWithNearbyPostcodes,

	// Models
	Base: Base,
	AttributeBase: AttributeBase,
	Postcode: Postcode,
	District: District,
	Parish: Parish,
	County: County,
	Ccg: Ccg,
	Constituency: Constituency,
	Nuts: Nuts,
	Ward: Ward,
	Outcode: Outcode,
	Place: Place,
	TerminatedPostcode: TerminatedPostcode,
	seedPaths: {
		postcodes: path.join(rootPath, "/tests/seed/postcodes.csv"),
		customRelation: path.join(rootPath, "/tests/seed/customRelation.csv")
	}
};
