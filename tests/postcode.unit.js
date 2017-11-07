"use strict";

const fs = require("fs");
const path = require("path");
const async = require("async");
const assert = require("chai").assert;
const parse = require('csv-parse/lib/sync');
const helper = require(`${__dirname}/helper`);
const seedFilePath = `${__dirname}/seed/postcode.csv`;
const Postcode = helper.Postcode;

/**
 * Counts number of postcode records if
 * - not headers
 * - not terminated
 * @param  {string} seedFilePath - path to CSV file
 * @return {number}
 */
const postcodeRecordCount = seedFilePath => {
	return parse(fs.readFileSync(seedFilePath))
		.filter(row => row[0] !== "pcd" && row[4].length === 0)
		.length
};

const postcodeEntriesCount = postcodeRecordCount(seedFilePath);

describe("Postcode Model", function () {
	let testPostcode, testOutcode;

	before(function (done) {
		this.timeout(0);
		async.series([
			helper.clearPostcodeDb,
			helper.seedPostcodeDb
		], done);
	});

	beforeEach(done => {
		helper.lookupRandomPostcode(result => {
			testPostcode = result.postcode;
			testOutcode = result.outcode;
			done();
		});
	});

	after(helper.clearPostcodeDb);
	
	describe("#setupTable", function () {
		before(function (done) {
			this.timeout(0);
			Postcode._destroyRelation(function (error) {
				if (error) return done(error);
				Postcode._setupTable(seedFilePath, done);
			});
		});

		after(function (done) {
			this.timeout(0);
			Postcode._destroyRelation(function (error) {
				if (error) return done(error);
				Postcode._setupTable(seedFilePath, done);
			});
		});

		describe("#_createRelation", () => {
			it (`creates a relation that matches ${Postcode.relation} schema`, done => {
				const query = `
					SELECT 
						column_name, data_type, character_maximum_length, collation_name
					FROM INFORMATION_SCHEMA.COLUMNS 
					WHERE table_name = '${Postcode.relation}'
				`;
				Postcode._query(query, (error, result) => {
					if (error) return done(error);
					const impliedSchema = {};
					result.rows.forEach(columnInfo => {
						let columnName, dataType;
						[columnName, dataType] = helper.inferSchemaData(columnInfo);
						impliedSchema[columnName] = dataType;
					});
					assert.deepEqual(impliedSchema, Postcode.schema);
					done();
				});
			});
		});

		describe("#seedData", () => {
			it ("loads correct data from data directory", done => {
				const query = `SELECT count(*) FROM ${Postcode.relation}`;
				Postcode._query(query, (error, result) => {
					if (error) return done(error);
					assert.equal(result.rows[0].count, postcodeEntriesCount);
					done();
				});
			});
		});
		
		describe("#populateLocation", () => {
			it ("populates location collumn with geohashes", done => {
				const query = `SELECT location from ${Postcode.relation}`;
				Postcode._query(query, (error, result) => {
					if (error) return done(error);
					result.rows.forEach(row => assert.equal(row.location.length, 50));
					done();
				});
			});
		});

		describe("#createIndexes", () => {
			it ("generates indexes that matches to what's been specified", done => {
				const query = `
					SELECT indexdef 
					FROM pg_indexes 
					WHERE tablename = '${Postcode.relation}'
				`;
				Postcode._query(query, (error,  result) => {
					if (error) return done(error);
					const dbIndexes = result.rows
						.map(row => helper.inferIndexInfo(row.indexdef))
						.filter(r => r.column !== "id")
					const byIndexColumns = helper.sortByIndexColumns;
					assert.deepEqual(dbIndexes.sort(byIndexColumns),
														Postcode.indexes.sort(byIndexColumns));
					done();
				});
			});
		});
	});

	describe("#toJson", () => {
		it ("formats an address object", () => {
			const address = {
				other: "other",
				admin_district_id: "admin_district_id",
				admin_county_id: "admin_county_id",
				admin_ward_id: "admin_ward_id",
				parish_id: "parish_id",
				ccg_id: "ccg_id",
				nuts_code: "nuts_code",
				id: "id",
				location: "location",
				pc_compact: "pc_compact",
				admin_district_id: "admin_district_id",
				admin_county_id: "admin_county_id",
				admin_ward_id: "admin_ward_id",
				parish_id: "parish_id",
				ccg_id: "ccg_id",
				nuts_id: "nuts_id",
				nuts_code: "nuts_code"
			};
			const formatted = Postcode.toJson(JSON.parse(JSON.stringify(address)));
			assert.equal(formatted.other, address.other)
			assert.property(formatted, "codes");
			assert.equal(formatted.codes.admin_district, address.admin_district_id);
			assert.equal(formatted.codes.admin_county, address.admin_county_id);
			assert.equal(formatted.codes.admin_ward, address.admin_ward_id);
			assert.equal(formatted.codes.parish, address.parish_id);
			assert.equal(formatted.codes.ccg, address.ccg_id);
			assert.equal(formatted.codes.nuts, address.nuts_code);
			assert.notProperty(formatted, "id");
			assert.notProperty(formatted, "location");
			assert.notProperty(formatted, "pc_compact");
			assert.notProperty(formatted, "admin_district_id");
			assert.notProperty(formatted, "admin_county_id");
			assert.notProperty(formatted, "admin_ward_id");
			assert.notProperty(formatted, "parish_id");
			assert.notProperty(formatted, "ccg_id");
			assert.notProperty(formatted, "nuts_id");
			assert.notProperty(formatted, "nuts_code");
		});
	});

	describe("#find", () => {
		it ("should return postcode with the right attributes", done => {
			Postcode.find(testPostcode, (error, result) => {
				if (error) return done(error);
				assert.equal(result.postcode, testPostcode);
				helper.isRawPostcodeObjectWithFC(result);
				done();
			});
		});
		it ("should return null for null/undefined postcode search", done => {
			Postcode.find(null, (error, result) => {
				if (error) return done(error);
				assert.isNull(result);
				done()
			});
		});
		it ("returns null if invalid postcode", done => {
			Postcode.find("1", (error, result) => {
				if (error) return done(error);
				assert.isNull(result);
				done()
			});
		})
		it ("should be insensitive to space", done => {
			Postcode.find(testPostcode.replace(/\s/, ""), (error, result) => {
				if (error) return done(error);
				assert.equal(result.postcode, testPostcode);
				done();
			});
		});
		it ("should return null if postcode does not exist", done => {
			Postcode.find("ID11QD", (error, result) => {
				if (error) return done(error);
				assert.isNull(result);
				done();
			});
		});
	});

	describe("loadPostcodeIds", () => {
		it ("loads a complete array of postcode IDs", done => {
			Postcode.postcodeIds = undefined;
			Postcode.loadPostcodeIds(error => {
				if (error) return done(error);
				assert.isArray(Postcode.idCache['_all']);
				assert.isTrue(Postcode.idCache['_all'].length > 0);
				done();
			});
		});
		it ("loads IDs by outcode if specified", done => {
			Postcode.postcodeIds = undefined;
			const outcode = "AB10"
			Postcode.loadPostcodeIds(outcode, error => {
				if (error) return done(error);
				assert.isArray(Postcode.idCache[outcode]);
				assert.isTrue(Postcode.idCache[outcode].length > 0);
				done();
			});
		});
	});

	describe("#random", () => {
		it ("should return a random postcode", done => {
			Postcode.random((error, postcode) => {
				if (error) return done(error);
				helper.isRawPostcodeObjectWithFC(postcode);
				done();
			});
		});
		describe("Outcode filter", () => {
			it ("returns random postcode for within an outcode", done => {
				var outcode = "AB10";
				Postcode.random({outcode: outcode}, (error, postcode) => {
					if (error) return done(error);
					helper.isRawPostcodeObjectWithFC(postcode);
					assert.equal(postcode.outcode, outcode);
					done();
				});
			});
			it ("is case and space insensitive", done => {
				var outcode = "aB 10 ";
				Postcode.random({outcode: outcode}, (error, postcode) => {
					if (error) return done(error);
					helper.isRawPostcodeObjectWithFC(postcode);
					assert.equal(postcode.outcode, "AB10");
					done();
				});
			});
			it ("caches requests", done => {
				var outcode = "AB12";
				Postcode.random({outcode: outcode}, (error, postcode) => {
					if (error) return done(error);
					helper.isRawPostcodeObjectWithFC(postcode);
					assert.isTrue(Postcode.idCache[outcode].length > 0);
					done();
				});
			})
			it ("returns null if invalid outcode", done => {
				var outcode = "BOGUS";
				Postcode.random({outcode: outcode}, (error, postcode) => {
					if (error) return done(error);
					assert.isNull(postcode);
					done();
				});
			});
		});
	});

	describe("#randomFromIds", () => {
		before(function (done) {
			Postcode.loadPostcodeIds(done);
		});
		it ("should return a random postcode using an in memory ID store", function (done) {
			Postcode.randomFromIds(Postcode.idCache['_all'], function (error, postcode) {
				if (error) return done(error);
				helper.isRawPostcodeObjectWithFC(postcode);
				done();
			});
		});
	});

	describe("#findOutcode", () => {
		it ("should return the outcode with the right attributes", done => {
			Postcode.findOutcode(testOutcode, (error, result) => {
				if (error) return done(error);
				assert.equal(result.outcode, testOutcode);
				assert.property(result, "northings");
				assert.property(result, "eastings");
				assert.property(result, "longitude");
				assert.property(result, "latitude");
				assert.isArray(result["admin_ward"]);
				assert.isArray(result["admin_district"]);
				assert.isArray(result["admin_county"]);
				assert.isArray(result["parish"]);
				assert.isArray(result["country"]);
				done();
			});
		});
		it ("should return null if no matching outcode", done => {
			Postcode.findOutcode("EZ12", (error, result) => {
				if (error) return done(error);
				assert.equal(result, null);
				done();
			});
		});
		it ("should return null if invalid outcode", done => {
			Postcode.findOutcode("1", (error, result) => {
				if (error) return done(error);
				assert.equal(result, null);
				done();
			});
		});
		it ("should return null if girobank outcode", done => {
			Postcode.findOutcode("GIR", (error, result) => {
				if (error) return done(error);
				assert.equal(result, null);
				done();
			});
		});
		it ("should return null for a plausible but non-existent postcode", done => {
			Postcode.findOutcode("EJ12", (error, result) => {
				if (error) return done(error);
				assert.equal(result, null);
				done();
			});
		});
		it ("should be insensitive to space", done => {
			Postcode.findOutcode(testOutcode + "    ", (error, result) => {
				if (error) return done(error);
				assert.equal(result.outcode, testOutcode);
				assert.property(result, "northings");
				assert.property(result, "eastings");
				assert.property(result, "longitude");
				assert.property(result, "latitude");
				done();
			});
		});
		it ("should be insensitive to case", function (done) {
			Postcode.findOutcode(testOutcode.toLowerCase(), (error, result) => {
				if (error) return done(error);
				assert.equal(result.outcode, testOutcode);
				assert.property(result, "northings");
				assert.property(result, "eastings");
				assert.property(result, "longitude");
				assert.property(result, "latitude");
				done();
			});
		});
	});

	describe("#_deriveMaxRange", () => {
		let postcode, location;

		beforeEach(done => {
			helper.locationWithNearbyPostcodes((error, postcode) => {
				if (error) return done(error);
				location = postcode;
				done();
			});
		});

		it ("returns start range if many postcodes nearby", function (done) {
			Postcode._deriveMaxRange(location, (error, result) => {
				if (error) return done(error);
				assert.equal(result, 500);
				done();
			});
		});

		it ("returns null if nearest postcode is outside of max range", done => {
			location = {
				longitude: -0.12466272904588,
				latitude: 51.4998404539774
			};
			Postcode._deriveMaxRange(location, (error, result) => {
				if (error) return done(error);
				assert.isNull(result);
				done();
			});
		});

		it ("returns a range which has at least 10 postcodes", done => {
			location = {
				longitude: -2.12659411941741,
				latitude: 57.2465923827836
			};
			Postcode._deriveMaxRange(location, (error, range) => {
				if (error) return done(error);
				assert.isNumber(range);
				assert.isTrue(range > 500);
				done();
			});
		});
	});

	describe("#nearestPostcodes", function () {
		let location;

		beforeEach(done => {
			helper.locationWithNearbyPostcodes((error, postcode) => {
				if (error) return done(error);
				location = postcode;
				done();
			});
		});

		it ("should return a list of nearby postcodes", done => {
			const params = location;
			Postcode.nearestPostcodes(params, (error, postcodes) => {
				if (error) return done(error);
				assert.isArray(postcodes);
				postcodes.forEach(p => helper.isRawPostcodeObjectWithFCandDistance(p));
				done();
			});
		});
		it ("should be sensitive to limit", done => {
			const params = {
				longitude: location.longitude,
				latitude: location.latitude,
				limit: 1
			}
			Postcode.nearestPostcodes(params, (error, postcodes) => {
				if (error) return done(error);
				assert.isArray(postcodes);
				assert.equal(postcodes.length, 1);
				postcodes.forEach(p => helper.isRawPostcodeObjectWithFCandDistance(p));
				done();
			});
		});
		it ("should be sensitive to distance param", done => {
			const nearby = {
				longitude: location.longitude,
				latitude: location.latitude,
			};
			const farAway = {
				longitude: location.longitude,
				latitude: location.latitude,
				radius: 1000
			};
			Postcode.nearestPostcodes(nearby, (error, postcodes) => {
				if (error) return done(error);
				Postcode.nearestPostcodes(farAway, (error, farawayPostcodes) => {
					if (error) return done(error);
					assert.isTrue(farawayPostcodes.length >= postcodes.length);
					done();
				});
			});
		});
		it ("should default limit to 10 if invalid", done => {
			const params = {
				longitude: location.longitude,
				latitude: location.latitude,
				limit: "Bogus"
			};
			Postcode.nearestPostcodes(params, (error, postcodes) => {
				if (error) return done(error);
				assert.isTrue(postcodes.length <= 10);
				done();
			});
		});
		it ("should default radius to 100 if invalid", done => {
			const nearby = {
				longitude: location.longitude,
				latitude: location.latitude,
				radius: "BOGUS"
			};
			const farAway = {
				longitude: location.longitude,
				latitude: location.latitude,
				radius: 1000
			};

			Postcode.nearestPostcodes(nearby, (error, postcodes) => {
				if (error) return done(error);
				Postcode.nearestPostcodes(farAway, (error, farawayPostcodes) => {
					if (error) return done(error);
					assert.isTrue(farawayPostcodes.length >= postcodes.length);
					done();
				});
			});
		});
		it ("should raise an error if invalid longitude", done => {
			const params = {
				longitude: "Bogus",
				latitude: location.latitude,
			};
			Postcode.nearestPostcodes(params, (error, postcodes) => {
				assert.isNotNull(error);
				assert.match(error.message, /invalid longitude/i);
				done();
			});
		});
		it ("should raise an error if invalid latitude", done => {
			const params = {
				longitude: location.longitude,
				latitude: "Bogus",
			};
			Postcode.nearestPostcodes(params, (error, postcodes) => {
				assert.isNotNull(error);
				assert.match(error.message, /invalid latitude/i);
				done();
			});
		});
		describe("Wide Search", () => {
			let params;
			beforeEach(() => {
				params = {
					longitude: -2.12659411941741,
					latitude: 57.2465923827836
				};
			});
			it ("performs an incremental search if flag is passed", done => {
				Postcode.nearestPostcodes(params, (error, postcodes) => {
					if (error) return done(error);
					assert.isNull(postcodes);
					params.wideSearch = true;
					Postcode.nearestPostcodes(params, (error, postcodes) => {
						if (error) return done(error);
						assert.equal(postcodes.length, 10);
						done();
					});
				});
			});
			it ("performs an incremental search if 'widesearch' flag is passed", done => {
				Postcode.nearestPostcodes(params, (error, postcodes) => {
					if (error) return done(error);
					assert.isNull(postcodes);
					params.widesearch = true;
					Postcode.nearestPostcodes(params, (error, postcodes) => {
						if (error) return done(error);
						assert.equal(postcodes.length, 10);
						done();
					});
				});
			});
			it ("returns null if point is too far from nearest postcode", done => {
				params = {
					longitude: 0,
					latitude: 0,
					wideSearch: true
				};
				Postcode.nearestPostcodes(params, (error, postcodes) => {
					if (error) return done(error);
					assert.isNull(postcodes);
					done();
				});
			});
			it ("resets limit to a maximum of 10 if it is exceeded", done => {
				params.wideSearch = true;
				params.limit = 20;
				Postcode.nearestPostcodes(params, (error, postcodes) => {
					if (error) return done(error);
					assert.equal(postcodes.length, 10);
					done();
				});
			});
			it ("maintains limit if less than 10", done => {
				const limit = 2;
				params.wideSearch = true;
				params.limit = limit;
				Postcode.nearestPostcodes(params, (error, postcodes) => {
					if (error) return done(error);
					assert.equal(postcodes.length, limit);
					done();
				});
			});
		});
	});
});
