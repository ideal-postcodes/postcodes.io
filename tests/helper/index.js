var	csv = require("csv"),
		util = require("util"),
		path = require("path"),
		OSPoint = require("ospoint"),
		assert = require("chai").assert,
		randomString = require("random-string"),
		rootPath = path.join(__dirname, "../../"),
		env = process.env.NODE_ENV || "development",
		Base = require(path.join(rootPath, "app/models")),
		config = require(path.join(rootPath + "/config/config"))(env),
		Postcode = require(path.join(rootPath, "app/models/postcode")),
		seedPostcodePath = path.join(rootPath, "tests/seed/postcode.csv"),
		testPostcodes, testPostcodesLength;

csv().from(seedPostcodePath).to.array(function (data, count) {
	testPostcodes = data;
	testPostcodesLength = count;
});

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

function randomPostcode() {
	return testPostcodes[getRandom(testPostcodesLength)][0];
}

function randomLocation() {
	var postcode = testPostcodes[getRandom(testPostcodesLength)]
	var ospoint = new OSPoint(postcode[3], postcode[2])
	return ospoint.toWGS84();
}

function lookupRandomPostcode(callback) {
	Postcode.random(function (error, result) {
		if (error) {
			throw error;
		}
		callback(result);
	});
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
	assert.property(o, "nhs_regional_ha");
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
	assert.property(o, "nhs_regional_ha");
}

module.exports = {
	Base: Base,
	config: config,
	rootPath: rootPath,
	Postcode: Postcode,
	connectToDb: connectToDb,
	randomPostcode: randomPostcode,
	randomLocation: randomLocation,
	seedPostcodeDb: seedPostcodeDb,
	clearPostcodeDb: clearPostcodeDb,
	isPostcodeObject: isPostcodeObject,
	getCustomRelation: getCustomRelation,
	isRawPostcodeObject: isRawPostcodeObject, 
	lookupRandomPostcode: lookupRandomPostcode,
	seedPaths: {
		postcodes: path.join(rootPath, "/tests/seed/postcodes.csv"),
		customRelation: path.join(rootPath, "/tests/seed/customRelation.csv")
	}
}

