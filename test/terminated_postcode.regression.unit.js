"use strict";

const async = require("async");
const assert = require("chai").assert;
const helper = require("./helper/index.js");
const TerminatedPostcode = helper.TerminatedPostcode;

const resetTerminatedPostcodeRelation = done => {
  async.series([
    helper.clearTerminatedPostcodesDb,
    helper.seedTerminatedPostcodeDb
  ], done);
};

describe("Terminated postcode data regression testing", function () {
  before(function(done) {
    this.timeout(0);
    resetTerminatedPostcodeRelation(done);
  });

  after(helper.clearTerminatedPostcodesDb);

  it ("contains correct data for AB115TP", done => {
		TerminatedPostcode.find("AB115TP", (error, result) => {
			if (error) return done(error);
			delete result.id;
			assert.deepEqual({
				postcode: 'AB11 5TP',
			  pc_compact: 'AB115TP',
			  year_terminated: 1996,
			  month_terminated: 7,
			  eastings: 394290,
			  northings: 806210,
			  longitude: -2.095999,
			  latitude: 57.146741,
			  location: '0101000020E6100000F296AB1F9BC400C0BDFDB968C8924C40',
			}, result);
			done();
		});
	});
	
  // Case: Does not contain geolocation
	// https://github.com/ideal-postcodes/postcodes.io/issues/197
	it ("contains correct data for AB113AG", done => {
		TerminatedPostcode.find("AB113AG", (error, result) => {
			if (error) return done(error);
			delete result.id;
			assert.deepEqual({
			  postcode: 'AB11 3AG',
			  pc_compact: 'AB113AG',
			  year_terminated: 1997,
			  month_terminated: 7,
			  eastings: null,
			  northings: null,
			  longitude: null,
			  latitude: null,
			  location: null,
			}, result);
			done();
		});
	});
});
