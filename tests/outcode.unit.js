"use strict";

const path = require("path");
const async = require("async");
const assert = require("chai").assert;
const helper = require("./helper");
		
const Outcode = helper.Outcode;

describe("Outcode Model", () => {
	before(function (done) {
		this.timeout(0);
		helper.clearPostcodeDb((error, result) => {
			if (error) return done(error);
			helper.seedPostcodeDb((error, result) => {
				if (error) return done(error);
				done();
			});
		});
	});

	after(function (done) {
		helper.clearPostcodeDb(done);
	});

	describe("populateLocation", () => {
		before(done => {
			Outcode._destroyRelation(function (error) {
				if (error) return done(error);
				Outcode._createRelation(function (error) {
					if (error) return done(error);
					Outcode.seedData(done);
				});
			});
		});

		after(function (done) { 
			Outcode._setupTable(done);
		});

		it ("generates a location using longitude and latitude", done => {
			const outcode = 'AA10';
			const record = { 
		    outcode: outcode,
		    longitude: -2.12002322052475,
		    latitude: 57.135241767364,
		    northings: 804931,
		    eastings: 392833,
		    admin_district: [ 'Aberdeen City' ],
		    parish: [],
		    admin_county: [],
		    admin_ward:[ 'Torry/Ferryhill'] 
		  };

			Outcode._create(record, error => {
	    	if (error) return done(error);
	    	Outcode.populateLocation(error => {
	    		if (error) return done(error);
	    		Outcode.find(outcode, (error, outcode) => {
	    			if (error) return done(error);
	    			assert.isNotNull(outcode.location);
	    			done();
	    		});
	    	});
	    });
		});
		it ("does not generate a location when northings = 0, eastings = 0", done => {
			const outcode = 'AA11';
			const record = { 
		    outcode: outcode,
		    longitude: -2.12002322052475,
		    latitude: 57.135241767364,
		    northings: 0,
		    eastings: 0,
		    admin_district: [ 'Aberdeen City' ],
		    parish: [],
		    admin_county: [],
		    admin_ward:[ 'Torry/Ferryhill'] 
		  };
			Outcode._create(record, error => {
	    	if (error) return done(error);
	    	Outcode.populateLocation((error) => {
	    		if (error) return done(error);
	    		Outcode.find(outcode, (error, outcode) => {
	    			if (error) return done(error);
	    			assert.isNull(outcode.location);
	    			done();
	    		});
	    	});
	    });
		});
	});

	describe("seedData", () => {
		before(done => {
			Outcode._destroyRelation(error => {
				if (error) return error;
				Outcode._createRelation(done);
			});
		});

		after(function (done) {
			Outcode._setupTable(done);
		});

		it ("seeds outcode table", function (done) {
			this.timeout(0);
			const allOutcodes = callback => {
				return Outcode.all((error, result) => {
					if (error) return done(error);
					return callback(result.rows);
				});
			};
			allOutcodes(outcodes => {
				assert.equal(outcodes.length, 0);
				Outcode.seedData(error => {
					if (error) return done(error);
					allOutcodes(outcodes => {
						assert.isTrue(outcodes.length > 0);
						done();
					});
				});
			});
		});
	});

	describe("_setupTable", () => {
		before(function (done) {
			Outcode._destroyRelation(done);
		});

		after(function (done) {
			Outcode._setupTable(done);
		});

		it ("creates and populates outcode table", done => {
			Outcode._setupTable(error => {
				if (error) return done(error);
				Outcode.all((error, outcodes) => {
					if (error) return done(error);
					assert.isTrue(outcodes.rows.length > 0);
					done()
				});
			});
		});
	})

	describe("find", () => {
		before(function (done) {
			Outcode._setupTable(done);
		});

		after(function (done) {
			Outcode._setupTable(done);
		});

		it ("returns outcode", done => {
			const term = "AB10";
			Outcode.find(term, (error, outcode) => {
				if (error) return done(error);
				assert.equal(outcode.outcode, term);
				done();
			});
		});
		it ("returns null if not string", done => {
			let term;
			Outcode.find(term, (error, outcode) => {
				if (error) return done(error);
				assert.isNull(outcode);
				done();
			});
		});
		it ("returns null if outcode does not exist", done => {
			const term = "ZZ10";
			Outcode.find(term, (error, outcode) => {
				if (error) return done(error);
				assert.isNull(outcode);
				done();
			});
		});
		it ("is case insensitive", done => {
			const term = "ab10";
			Outcode.find(term, (error, outcode) => {
				if (error) return done(error);
				assert.equal(outcode.outcode, term.toUpperCase());
				done();
			});
		});
		it ("is space insensitive", done => {
			const term = " AB 10 ";
			Outcode.find(term, (error, outcode) => {
				if (error) return done(error);
				assert.equal(outcode.outcode, term.replace(/\s/g, ""));
				done();
			});
		});
	});
	
	describe("nearest", () => {
		let params;

		beforeEach(() => {
			params = {
				longitude: -2.09301393644196,
				latitude: 57.1392691975667
			};
		});

		it ("returns a list of nearby outcodes", done => {
			Outcode.nearest(params, function (error, outcodes) {
				if (error) return done(error);
				assert.isTrue(outcodes.length > 0);
				outcodes.forEach(o => helper.isRawOutcodeObject(o));
				done();
			});
		});
		it ("is sensitive to limit", done => {
			params.limit = 1;
			Outcode.nearest(params, (error, outcodes) => {
				if (error) return done(error);
				assert.equal(outcodes.length, 1);
				outcodes.forEach(o => helper.isRawOutcodeObject(o));
				done();
			});
		});
		it ("is sensitive to radius", done => {
			params.radius = 1000;
			Outcode.nearest(params, (error, outcodes) => {
				if (error) return done(error);
				params.radius = 25000;
				Outcode.nearest(params, (error, newOutcodes) => {
					if (error) return done(error);
					assert.isTrue(newOutcodes.length > outcodes.length);
					done();
				});
			});
		});
		it ("raises an error if invalid longitude", done => {
			params.longitude = "foo";
			Outcode.nearest(params, (error, outcodes) => {
				assert.isNotNull(error);
				assert.match(error.message, /invalid\slongitude/i);
				done();
			});
		});
		it ("raises an error if invalid latitude", done => {
			params.latitude = "foo";
			Outcode.nearest(params, (error, outcodes) => {
				assert.isNotNull(error);
				assert.match(error.message, /invalid\slatitude/i);
				done();
			});
		});
	});
});
