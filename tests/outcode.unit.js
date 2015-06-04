var path = require("path");
var async = require("async");
var assert = require("chai").assert;
var helper = require(__dirname + "/helper");
		
var Outcode = helper.Outcode;

describe("Outcode Model", function () {
	before(function (done) {
		this.timeout(0);
		helper.clearPostcodeDb(function (error, result) {
			if (error) return done(error);
			helper.seedPostcodeDb(function (error, result) {
				if (error) return done(error);
				done();
			});
		});
	});

	after(function (done) {
		helper.clearPostcodeDb(done);
	});

	describe("populateLocation", function () {
		before(function (done) {
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
		it ("generates a location using longitude and latitude", function (done) {
			var outcode = 'AA10';
			Outcode._create({ 
		    outcode: outcode,
		    longitude: -2.12002322052475,
		    latitude: 57.135241767364,
		    northings: 804931,
		    eastings: 392833,
		    admin_district: [ 'Aberdeen City' ],
		    parish: [],
		    admin_county: [],
		    admin_ward:[ 'Torry/Ferryhill'] }, 
		    function (error) {
		    	if (error) return done(error);
		    	Outcode.populateLocation(function (error) {
		    		if (error) return done(error);
		    		Outcode.find(outcode, function (error, outcode) {
		    			if (error) return done(error);
		    			assert.isNotNull(outcode.location);
		    			done();
		    		});
		    	});
	    });
		});
		it ("does not generate a location when northings = 0, eastings = 0", function (done) {
			var outcode = 'AA11';
			Outcode._create({ 
		    outcode: outcode,
		    longitude: -2.12002322052475,
		    latitude: 57.135241767364,
		    northings: 0,
		    eastings: 0,
		    admin_district: [ 'Aberdeen City' ],
		    parish: [],
		    admin_county: [],
		    admin_ward:[ 'Torry/Ferryhill'] }, 
		    function (error) {
		    	if (error) return done(error);
		    	Outcode.populateLocation(function (error) {
		    		if (error) return done(error);
		    		Outcode.find(outcode, function (error, outcode) {
		    			if (error) return done(error);
		    			assert.isNull(outcode.location);
		    			done();
		    		});
		    	});
	    });
		});
	});

	describe("seedData", function () {
		before(function (done) {
			Outcode._destroyRelation(function (error) {
				if (error) return error;
				Outcode._createRelation(done);
			});
		});
		after(function (done) {
			Outcode._setupTable(done);
		});
		it ("seeds outcode table", function (done) {
			this.timeout(0);
			var allOutcodes = function (callback) {
				return Outcode.all( function (error, result) {
					if (error) return done(error);
					return callback(result.rows);
				});
			}
			allOutcodes(function (outcodes) {
				assert.equal(outcodes.length, 0);
				Outcode.seedData(function (error) {
					if (error) return done(error);
					allOutcodes(function (outcodes) {
						assert.isTrue(outcodes.length > 0);
						done();
					});
				});
			});
		});
	});

	describe("_setupTable", function () {
		before(function (done) {
			Outcode._destroyRelation(done);
		});
		after(function (done) {
			Outcode._setupTable(done);
		});
		it ("creates and populates outcode table", function (done) {
			Outcode._setupTable(function (error) {
				if (error) return done(error);
				Outcode.all(function (error, outcodes) {
					if (error) return done(error);
					assert.isTrue(outcodes.rows.length > 0);
					done()
				});
			});
		});
	})

	describe("find", function () {
		before(function (done) {
			Outcode._setupTable(done);
		});
		after(function (done) {
			Outcode._setupTable(done);
		});
		it ("returns outcode", function (done) {
			var term = "AB10";
			Outcode.find(term, function (error, outcode) {
				if (error) return done(error);
				assert.equal(outcode.outcode, term);
				done();
			});
		});
		it ("returns null if not string", function (done) {
			var term;
			Outcode.find(term, function (error, outcode) {
				if (error) return done(error);
				assert.isNull(outcode);
				done();
			});
		});
		it ("returns null if outcode does not exist", function (done) {
			var term = "ZZ10";
			Outcode.find(term, function (error, outcode) {
				if (error) return done(error);
				assert.isNull(outcode);
				done();
			});
		});
		it ("is case insensitive", function (done) {
			var term = "ab10";
			Outcode.find(term, function (error, outcode) {
				if (error) return done(error);
				assert.equal(outcode.outcode, term.toUpperCase());
				done();
			});
		});
	});
});