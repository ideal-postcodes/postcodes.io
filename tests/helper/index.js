var assert = require("chai").assert,
		csv = require("csv"),
		path = require("path"),
		randomString = require("random-string"),
		rootPath = path.join(__dirname, "../../"),
		util = require("util"),
		env = process.env.NODE_ENV || "development",
		config = require(rootPath + "/config/config")(env),
		Base = require(path.join(rootPath, "app/models")),
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
				Postcode.createIndexes(function (error, result) {
					if (error) return callback(error, null)
					callback(null, result);
				});
			});
		});
	});
}

function clearPostcodeDb(callback) {
	Postcode._destroyRelation(callback);
}

function randomPostcode() {
	var getRandom = function () {
		return Math.floor(Math.random() * testPostcodesLength);
	}
	return testPostcodes[getRandom()][0];
}

module.exports = {
	Base: Base,
	config: config,
	Postcode: Postcode,
	rootPath: rootPath,
	connectToDb: connectToDb,
	seedPostcodeDb: seedPostcodeDb,
	clearPostcodeDb: clearPostcodeDb,
	randomPostcode: randomPostcode,
	getCustomRelation: getCustomRelation,
	seedPaths: {
		customRelation: path.join(rootPath, "/tests/seed/customRelation.csv"),
		postcodes: path.join(rootPath, "/tests/seed/postcodes.csv")
	}
}

