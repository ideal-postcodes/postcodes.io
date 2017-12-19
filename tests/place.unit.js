"use strict";

const fs = require("fs");
const path = require("path");
const async = require("async");
const assert = require("chai").assert;
const parse = require('csv-parse/lib/sync');
const helper = require(`${__dirname}/helper`);
const env = process.env.NODE_ENV || "development";
const configPath = path.join(__dirname, "../config/config.js");
const seedPathDirectory = `${__dirname}/seed/places/`;
const seedFilePath = `${__dirname}/seed/places/HY20.csv`;
const Place = helper.Place;

const TYPE_OFFSET = 6; // Specifies type column on place.csv files

const countPlacesTestSeedData = seedFilePath => {
	return parse(fs.readFileSync(seedFilePath))
		.filter(row => row[TYPE_OFFSET] === "populatedPlace")
		.length;
};

const placesEntriesCount = countPlacesTestSeedData(seedFilePath);

describe("Place Model", () => {
	let testPostcode, testOutcode;

	before(function (done) {
		this.timeout(0);
		async.series([
			helper.clearPostcodeDb,
			helper.seedPostcodeDb
		], done);
	});

	after(helper.clearPostcodeDb);
	
	describe("#setupTable", () => {
		before(done => {
			Place._destroyRelation(error => {
				if (error) return done(error);
				Place._setupTable(seedPathDirectory, done);
			});
		});

		describe("#_createRelation", () => {
			it (`creates a relation that matches ${Place.relation} schema`, done => {
				const query = `
					SELECT 
						column_name, data_type, character_maximum_length
					FROM
						INFORMATION_SCHEMA.COLUMNS 
					WHERE
						table_name = '${Place.relation}'
				`;
				Place._query(query, (error, result) => {
					if (error) return done(error);
					const schema = result.rows.reduce((impliedSchema, columnInfo) => {
						const [columnName, dataType] = helper.inferSchemaData(columnInfo);
						impliedSchema[columnName] = dataType;
						return impliedSchema;
					}, {});
					assert.deepEqual(schema, Place.schema);
					done();
				});
			});
		});
		
		describe("#seedData", () => {
			it ("loads correct data from data directory", function (done) {
				const query = `SELECT count(*) FROM ${Place.relation}`;
				Place._query(query, function (error, result) {
					if (error) return done(error);
					assert.equal(result.rows[0].count, placesEntriesCount);
					done();
				});
			});
		});

		describe("#populateLocation", () => {
			it ("populates location collumn with geohashes", done => {
				const query = `SELECT location FROM ${Place.relation}`;
				Place._query(query, (error, result) => {
					if (error) return done(error);
					result.rows.forEach(row => assert.equal(row.location.length, 50));
					done();
				});
			});
		});

		describe("#generateSearchFields", () => {
			it (`correctly allocates (name_1/name_2)_search fields`, done => {
				const query = `
					SELECT
						name_1, name_1_search, name_2, name_2_search
					FROM 
						${Place.relation}
				`;
				const sanitizeName = name => {
					const sanitizedName = name.replace(/-/g, ' ')
																		.replace("'", '')
																		.toLowerCase();
					return helper.removeDiacritics(sanitizedName);
				};

				Place._query(query, (error, result) => {										 
					if (error) return done(error);
					['name_1', 'name_2'].forEach(nameField => {
						for (let i = 0; i < placesEntriesCount; i++) {
							const name = result.rows[i][nameField]
							const searchName = result.rows[i][`${nameField}_search`];
							if (name === null) {
								assert.isNull(searchName);
							} else {
								assert.equal(searchName, sanitizeName(name));
							}
						}
					});
					done();
				});
			});
		});

		describe("#generateTsSearchFields", () => {
			it("generates appropriate tsvector search fields from (name_1/name_2) field", done => {
				const query = `
					SELECT
						name_1, name_1_search_ts, to_tsvector('simple', name_1) as ts_name_1,
						name_2, name_2_search_ts, to_tsvector('simple', name_2) as ts_name_2
				  FROM ${Place.relation}
			  `;
				Place._query(query, (error, result) => {
					if (error) return done(error);
					['name_1', 'name_2'].forEach(name_field => {
						for (let i = 0; i < placesEntriesCount; i++) {
							const ts_field_name = result.rows[i][`${name_field}_search_ts`];
							const correct_ts_name = result.rows[i][`ts_${name_field}`];
							assert.equal(ts_field_name, correct_ts_name);
						}
					});
					done();
				});
			});
		});

		describe("#createIndexes", () => {
			it ("generates indexes that matches to what's been specified", done => {
				const impliedIndexesArr = [];
				Place._query(`select indexdef from pg_indexes where tablename = '${Place.relation}'`, (err, result) => {
					result.rows.forEach(row => {
						const indexDef = row.indexdef;
						const impliedIndexObj = helper.inferIndexInfo(indexDef);
						
						if (impliedIndexObj.column !== "id") { // id is always indexed
						impliedIndexesArr.push(impliedIndexObj);
						}
					});
					const impliedIndexes = impliedIndexesArr.sort(helper.sortByIndexColumns);
					const realIndexes = Place.indexes.sort(helper.sortByIndexColumns);
					assert.deepEqual(impliedIndexes, realIndexes);
					done();
				});
			});
		});
	});
	
	describe("#findByCode", () => {
		const testCode = "osgb4000000074559125";
		it ("returns place by code", done => {
			Place.findByCode(testCode, (error, result) => {
				if (error) return done(error);
				helper.isRawPlaceObject(result);
				done();
			});
		});
		it ("is case insensitive", done => {
			Place.findByCode(testCode.toUpperCase(), (error, result) => {
				if (error) return done(error);
				helper.isRawPlaceObject(result);
				done();
			});
		});
		it ("returns null if no match", done => {
			Place.findByCode("12", (error, result) => {
				if (error) return done(error);
				assert.isNull(result);
				done();
			});
		});
		it ("returns null if code not string", done => {
			Place.findByCode(12, (error, result) => {
				if (error) return done(error);
				assert.isNull(result);
				done();
			});
		});
	});
	
	describe("contains", () => {
		let validPlace;
		before(done => {
			Place.random((error, place) => {
				if (error) return done(error);
				validPlace = place;
				done();
			});
		});
	
		it ("returns a list of places which contain point", done => {
			Place.contains({
				longitude: validPlace.longitude,
				latitude: validPlace.latitude
			}, (error, places) => {
				if (error) return done(error);
				assert.isTrue(places.length > 0);
				helper.isRawPlaceObject(places[0]);
				assert.isTrue(places.some(place => place.code === validPlace.code));
				done();
			});
		});
		it ("orders results by distance", done => {
			Place.contains({
				longitude: -3.2137291,
				latitude: 58.96804
			}, (error, places) => {
				if (error) return done(error);
				places.map(p => p.distance).reduce((acc, curr) => {
					assert.isTrue(curr >= acc);
					return curr;
				}, 0);
				done();
			});
		});
		it ("is sensitive to limit", done => {
			Place.contains({
				longitude: -3.2137291,
				latitude: 58.96804,
				limit: 1
			}, (error, places) => {
				if (error) return done(error);
				assert.equal(places.length, 1);
				const result = places[0];
				helper.isRawPlaceObject(result);
				done();
			});
		});
		it ("uses default limit if invalid", done => {
			Place.contains({
				longitude: 0,
				latitude: 0,
				limit: "Foo"
			}, error => {
				assert.isNull(error);
				done();
			});
		});
		it ("uses default limit greater than 100", done => {
			Place.contains({
				longitude: 0,
				latitude: 0,
				limit: 101
			}, error => {
				assert.isNull(error);
				done();
			});
		});
		it ("returns an error if invalid longitude", done => {
			Place.contains({
				longitude: "foo",
				latitude: 0
			}, error => {
				assert.match(error.message, /invalid\slongitude/i);
				done();
			});
		});
		it ("returns an error if invalid latitude", done => {
			Place.contains({
				longitude: 0,
				latitude: "foo"
			}, error => {
				assert.match(error.message, /invalid\slatitude/i);
				done();
			});
		});
	});
	
	describe("nearest", () => {
		let validPlace;
		before(done => {
			Place.random((error, place) => {
				if (error) return done(error);
				validPlace = place;
				done();
			});
		});
	
		it ("returns a list of places which contain point", done => {
			Place.nearest({
				longitude: validPlace.longitude,
				latitude: validPlace.latitude
			}, (error, places) => {
				if (error) return done(error);
				assert.isTrue(places.length > 0);
				assert.isTrue(places.length > 0);
				helper.isRawPlaceObject(places[0]);
				assert.isTrue(places.some(place => place.code === validPlace.code));
				done();
			});
		});
		it ("orders results by distance", done => {
			Place.nearest({
				longitude: -3.2137291,
				latitude: 58.96804
			}, (error, places) => {
				if (error) return done(error);
				places.map(p => p.distance).reduce((acc, curr) => {
					assert.isTrue(curr >= acc);
					return curr;
				}, 0);
				done();
			});
		});
		it ("is sensitive to limit", done => {
			Place.nearest({
				longitude: -3.2137291,
				latitude: 58.96804,
				limit: 1
			}, (error, places) => {
				if (error) return done(error);
				assert.equal(places.length, 1);
				const result = places[0];
				helper.isRawPlaceObject(result);
				done();
			});
		});
		it ("uses default limit if invalid", done => {
			Place.nearest({
				longitude: 0,
				latitude: 0,
				limit: "Foo"
			}, error => {
				assert.isNull(error);
				done();
			});
		});
		it ("uses default limit greater than 100", done => {
			Place.nearest({
				longitude: 0,
				latitude: 0,
				limit: 101
			}, error => {
				assert.isNull(error);
				done();
			});
		});
		it ("uses default radius if invalid", done => {
			Place.nearest({
				longitude: 0,
				latitude: 0,
				radius: "Foo"
			}, error => {
				assert.isNull(error);
				done();
			});
		});
		it ("uses default limit greater than max default", done => {
			Place.nearest({
				longitude: 0,
				latitude: 0,
				radius: 1000000
			}, error => {
				assert.isNull(error);
				done();
			});
		});
		it ("returns an error if invalid longitude", done => {
			Place.nearest({
				longitude: "foo",
				latitude: 0
			}, error => {
				assert.match(error.message, /invalid\slongitude/i);
				done();
			});
		});
		it ("returns an error if invalid latitude", done => {
			Place.nearest({
				longitude: 0,
				latitude: "foo"
			}, error => {
				assert.match(error.message, /invalid\slatitude/i);
				done();
			});
		});
	});
	
	describe("toJson", () => {
		it ("formats place object for public consumption", done => {
			const testCode = "osgb4000000074559125";
			Place.findByCode(testCode, (error, place) => {
				if (error) return done(error);
				helper.isRawPlaceObject(place);
				const formatted = Place.toJson(place);
				helper.isPlaceObject(formatted);
				done();
			});
		});
	});
	
	describe("#random", () => {
		it ("should return a random place", done => {
			Place.random((error, place) => {
				if (error) return done(error);
				helper.isRawPlaceObject(place);
				done();
			});
		});
	});
});
