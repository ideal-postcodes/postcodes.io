"use strict";

const Pc = require("postcode")
const path = require("path");
const async = require("async");
const assert = require("chai").assert;
const helper = require(`${__dirname}/helper`);

const Postcode = helper.Postcode;

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

	//after(helper.clearPostcodeDb);

	describe("#search", () => {
		it ("returns single result if exact match", done => {
			Postcode.search({postcode: testPostcode}, (error, result) => {
				if (error) return done(error);
				assert.equal(result.length, 1);
				assert.equal(result[0].postcode, testPostcode);
				done();
			});
		});

		it ("should return a list of candidate postcodes for given search term", done => {
			testPostcode = testPostcode.slice(0, 2);
			Postcode.search({postcode: testPostcode}, (error, result) => {
				if (error) return done(error);
				assert.notEqual(result.length, 0);
				result.forEach(p => helper.isRawPostcodeObjectWithFC(p));
				done();
			});
		});
		it ("should be case insensitive", done => {
			testPostcode = testPostcode.slice(0, 2).toLowerCase();
			Postcode.search({postcode: testPostcode}, (error, result) => {
				if (error) return done(error);
				assert.notEqual(result.length, 0);
				result.forEach(p => helper.isRawPostcodeObjectWithFC(p));
				done();
			});
		});
		it ("should work regardless of spaces", done => {
			testPostcode = testPostcode.slice(0, 4).replace(" ", "");
			Postcode.search({postcode: testPostcode}, (error, result) => {
				if (error) return done(error);
				assert.notEqual(result.length, 0);
				result.forEach(p => helper.isRawPostcodeObjectWithFC(p));
				done();
			});
		});
		it ("filters out unreasonable results", done => {
			// i.e. "A0" should not produces matches beginning "A1"
			testPostcode = "A0"
			Postcode.search({postcode: testPostcode}, (error, result) => {
				if (error) return done(error);
				assert.isNull(result);
				done();
			});
		});

		describe("ordering", () => {
			it ("returns M1 < M11 for 'M1'", done => {
				const postcode = "M1";
				Postcode.search({postcode: postcode}, (error, result) => {
					if (error) return done(error);
					assert.equal(result.length, 2);
					assert.equal(result[0].postcode, "M1 1AD");
					assert.equal(result[1].postcode, "M11 1AA");
					done();
				});
			});
			it ("returns M1 < M11 for 'M1 '", done => {
				const postcode = "M1 ";
				Postcode.search({postcode: postcode}, (error, result) => {
					if (error) return done(error);
					assert.equal(result.length, 2);
					assert.equal(result[0].postcode, "M1 1AD");
					assert.equal(result[1].postcode, "M11 1AA");
					done();
				});
			});
			it ("returns M1 < M11 for 'M1 1'", done => {
				const postcode = "M1 1";
				Postcode.search({postcode: postcode}, (error, result) => {
					if (error) return done(error);
					assert.equal(result.length, 2);
					assert.equal(result[0].postcode, "M1 1AD");
					assert.equal(result[1].postcode, "M11 1AA");
					done();
				});
			});
			it ("returns M11 for 'M11'", done => {
				const postcode = "M11";
				Postcode.search({postcode: postcode}, (error, result) => {
					if (error) return done(error);
					assert.equal(result.length, 1);
					assert.equal(result[0].postcode, "M11 1AA");
					done();
				});
			});
			it ("returns M11 for 'M11 '", done => {
				const postcode = "M11 ";
				Postcode.search({postcode: postcode}, (error, result) => {
					if (error) return done(error);
					assert.equal(result.length, 1);
					assert.equal(result[0].postcode, "M11 1AA");
					done();
				});
			});
			it ("returns SE1 < SE1P for 'SE1'", done => {
				const postcode = "SE1";
				Postcode.search({postcode: postcode}, (error, result) => {
					if (error) return done(error);
					assert.equal(result.length, 2);
					assert.equal(result[0].postcode, "SE1 9ZZ");
					assert.equal(result[1].postcode, "SE1P 5ZZ");
					done();
				});
			});
			it ("returns SE1 for 'SE1 '", done => {
				const postcode = "SE1 ";
				Postcode.search({postcode: postcode}, (error, result) => {
					if (error) return done(error);
					assert.equal(result.length, 2);
					assert.equal(result[0].postcode, "SE1 9ZZ");
					assert.equal(result[1].postcode, "SE1P 5ZZ");
					done();
				});
			});
			it ("returns SE1 for 'SE1 9'", done => {
				const postcode = "SE1 9";
				Postcode.search({postcode: postcode}, (error, result) => {
					if (error) return done(error);
					assert.equal(result.length, 1);
					assert.equal(result[0].postcode, "SE1 9ZZ");
					done();
				});
			});
			it ("returns SE1P for 'SE1P'", done => {
				const postcode = "SE1P";
				Postcode.search({postcode: postcode}, (error, result) => {
					if (error) return done(error);
					assert.equal(result.length, 1);
					assert.equal(result[0].postcode, "SE1P 5ZZ");
					done();
				});
			});
			it ("returns SE1P for 'SE1P '", done => {
				const postcode = "SE1P ";
				Postcode.search({postcode: postcode}, (error, result) => {
					if (error) return done(error);
					assert.equal(result.length, 1);
					assert.equal(result[0].postcode, "SE1P 5ZZ");
					done();
				});
			});
		});

		describe("sensible outcode matching", () => {
			it ("returns strict outcode matches first", done => {
				testOutcode = "AB1";
				Postcode.search({postcode: testOutcode}, (error, result) => {
					if (error) return done(error);
					assert.equal(result[0].outcode, testOutcode);
					result.forEach(pc => assert.include(pc.outcode, testOutcode));
					done();
				});
			});
			it ("returns no matches if invalid outcode", done => {
				testOutcode = "AA1";
				Postcode.search({postcode: testOutcode}, (error, result) => {
					if (error) return done(error);
					assert.isNull(result);
					done();
				});
			});
		});

		describe("when space delineated", () => {
			it ("is sensitive to space in postcode search", done => {
				testOutcode = "AB1 9";
				Postcode.search({postcode: testOutcode}, (error, result) => {
					if (error) return done(error);
					assert.equal(result[0].outcode, "AB1");
					done();
				});
			});
			it ("returns next closest postcodes if invalid outcode", done => {
				testOutcode = "AA1 9";
				Postcode.search({postcode: testOutcode}, (error, result) => {
					if (error) return done(error);
					assert.isNull(result);
					done();
				});
			});
		});

		describe("deterministic ordering", () => {
			it ("ASCIIbetially sorts queries", done => {
				testPostcode = testPostcode.slice(0, 2);
				Postcode.search({postcode: testPostcode}, (error, result) => {
					result.reduce((acc, postcode) => {
						if (acc) assert.isTrue(postcode.postcode > acc.postcode);
						return postcode;
					}, null);
					done();
				});
			});
		});
		describe("limit", () => {
			it ("is sensitive to limit", done => {
				const query = "A";
				async.parallel([2,3].map(limit => {
					return cb => {
						Postcode.search({postcode: query, limit: limit}, (error, result) => {
							assert.equal(result.length, limit);
							cb(error, result);
						});
					}
				}), (error, results) => {
					if (error) return done(error);
					results.forEach(result => {
						result.forEach(p => helper.isRawPostcodeObjectWithFC(p));
					});
					done();
				});
			});
			it ("returns a default maximum number of results", done => {
				const query = "A";
				Postcode.search({postcode: query, limit: 1000}, (error, result) => {
					if (error) return done(error);
					assert.equal(result.length, helper.config.defaults.search.limit.MAX);
					result.forEach(p => helper.isRawPostcodeObjectWithFC(p));
					done();
				});
			});
			it ("returns 10 postcodes by default", done => {
				const query = "A";
				Postcode.search({postcode: query}, (error, result) => {
					if (error) return done(error);
					assert.equal(result.length,
						helper.config.defaults.search.limit.DEFAULT);
					result.forEach(p => helper.isRawPostcodeObjectWithFC(p));
					done();
				});
			});
			it ("uses default limit if limit < 1", done => {
				const query = "A";
				Postcode.search({postcode: query, limit: 0}, (error, result) => {
					if (error) return done(error);
					assert.equal(result.length,
						helper.config.defaults.search.limit.DEFAULT);
					result.forEach(p => helper.isRawPostcodeObjectWithFC(p));
					done();
				});
			});
			it ("uses default limit if invalid limit supplied", done => {
				const query = "A";
				Postcode.search({postcode: query, limit: "limit"}, (error, result) => {
					if (error) return done(error);
					assert.equal(result.length,
						helper.config.defaults.search.limit.DEFAULT);
					result.forEach(p => helper.isRawPostcodeObjectWithFC(p));
					done();
				});
			});
		});
	});
});
