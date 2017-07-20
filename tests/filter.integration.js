"use strict";

const async = require("async");
const assert = require("chai").assert;
const expect = require("chai").expect;
const app = require("../server");
const request = require("supertest");
const helper = require("./helper/index.js");

describe("Filter method", function () {
	let testPostcode;

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
			done();	
		});
	});

	after(helper.clearPostcodeDb);

	describe("Bulk postcode lookup", () => {
    it ("filteres by filter attributes", done => {
			let filter = "postcode";
      request(app)
        .post("/postcodes")
        .query({
          filter: filter
        })
        .send({
          postcodes: [testPostcode, testPostcode]
        })
        .expect(200)
        .end((error, response) => {
          if (error) return done(error);
					response.body.result.forEach(resultObj => {
						assert.exists(resultObj.result["postcode"]);
						assert.isTrue(Object.keys(resultObj.result).length === 1);
					})
          done();
        });
    });
    it ("filters by attribute array", done => {
			let filter = "postcode,country";
      request(app)
        .post("/postcodes")
        .query({
          filter: filter
        })
        .send({
          postcodes: [testPostcode, testPostcode]
        })
        .expect(200)
        .end((error, response) => {
          if (error) return done(error);
					response.body.result.forEach(resultObj => {
						assert.exists(resultObj.result["postcode"]);
						assert.exists(resultObj.result["country"]);
						assert.isTrue(Object.keys(resultObj.result).length === 2);
						
					})
          done();
        });
    });
    it ("returns empty object if no matching filters", done => {
			let filter = "definitely,nota,matchingfilter";
      request(app)
        .post("/postcodes")
        .query({
          filter: filter
        })
        .send({
          postcodes: [testPostcode, testPostcode]
        })
        .expect(200)
        .end((error, response) => {
          if (error) return done(error);
					response.body.result.forEach(resultObj => {
						assert.isObject(resultObj.result);
						expect(resultObj.result).to.be.empty;
					})
          done();
        });
    });
    it ("returns null on postcode not found", done => {
			let filter = "quaLity,postcode,Bar";
      request(app)
        .post("/postcodes")
        .query({
          filter: filter
        })
        .send({
          postcodes: ["OX49 NU", testPostcode]
        })
        .expect(200)
        .end((error, response) => {
          if (error) return done(error);
					assert.isTrue(response.body.result[0].result === null);
					assert.exists(response.body.result[1].result["postcode"]);
					assert.exists(response.body.result[1].result["quality"]);
					assert.isTrue(Object.keys(response.body.result[1].result).length === 2);
          done();
        });
    });
    it ("is case/whitespace insensitive", done => {
			let filter = "   quALiTy,    PostcodE,   Bar";
      request(app)
        .post("/postcodes")
        .query({
          filter: filter
        })
        .send({
          postcodes: [testPostcode, testPostcode]
        })
        .expect(200)
        .end((error, response) => {
          if (error) return done(error);
					assert.exists(response.body.result[0].result["postcode"]);
					assert.exists(response.body.result[0].result["quality"]);
					assert.exists(response.body.result[1].result["postcode"]);
					assert.exists(response.body.result[1].result["quality"]);
					assert.isTrue(Object.keys(response.body.result[0].result).length === 2);
					assert.isTrue(Object.keys(response.body.result[1].result).length === 2);
          done();
        });
    });
  });
  
  describe("Bulk geolocation lookup", () => {
		let location;
		
		beforeEach(done => {
			helper.randomLocation((error, result) => {
				if (error) return done(error);
				location = result;
				done();
			});
		});
		
    it ("filters by a single attribute", done => {
			let filter = "country";
      request(app)
        .post("/postcodes")
        .query({
          filter: filter
        })
        .send({geolocations: [location,location]})
        .expect(200)
        .end((error, response) => {
          if (error) return done(error);
					response.body.result.forEach(obj => {
						obj.result.forEach(obj => {
							assert.isTrue(Object.keys(obj).length === 1);
							assert.exists(obj["country"]);
						})
					})
          done();
        });
    });
		it ("filters by multiple attributes", done => {
			let filter = "country,northings";
      request(app)
        .post("/postcodes")
        .query({
          filter: filter
        })
        .send({geolocations: [location, location]})
        .expect(200)
        .end((error, response) => {
          if (error) return done(error);
					response.body.result.forEach(obj => {
						obj.result.forEach(obj => {
							assert.isTrue(Object.keys(obj).length === 2);
							assert.exists(obj["country"]);
							assert.exists(obj["northings"]);
						})
					})
          done();
        });
    });
		it ("returns null on postcodes not found and is case/whitespace insensitive", done => {
			let filter = "coUntRY, nOrThings   , B22ar";
      request(app)
        .post("/postcodes")
        .query({
          filter: filter
        })
        .send({geolocations: [{"longitude":  0, "latitude": 0}, location]})
        .expect(200)
        .end((error, response) => {
          if (error) return done(error);
					assert.isTrue(response.body.result[0].result === null);
					response.body.result[1].result.forEach(obj => {
						assert.isTrue(Object.keys(obj).length === 2);
						assert.exists(obj["country"]);
						assert.exists(obj["northings"]);
					})
          done();
        });
    });
  });
});
