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

describe("Terminated postcode model", () => {
  let testTerminatedPostcode;
  before(function(done) {
    this.timeout(0);
    resetTerminatedPostcodeRelation(done);
  });

  beforeEach(done => {
    helper.randomTerminatedPostcode((err, result) => {
      testTerminatedPostcode = result.postcode;
      done();
    });
  });

  after(helper.clearTerminatedPostcodesDb);

  describe("#find", () => {
    it("should return a terminated postcode with right attributes", done => {
      TerminatedPostcode.find(testTerminatedPostcode, (error, result) => {
        if (error) return done(error);
        assert.equal(result.postcode, testTerminatedPostcode);
        helper.isRawTerminatedPostcodeObject(result);
        done();
      });
    });
    it("should return null for null/undefined terminated postcode search", done => {
      TerminatedPostcode.find(null, (error, result) => {
        if (error) return done(error);
        assert.isNull(result);
        done();
      });
    });
    it("returns null if invalid postcode", done => {
      TerminatedPostcode.find("1", (error, result) => {
        if (error) return done(error);
        assert.isNull(result);
        done();
      });
    });
    it("should be insensitive to space", done => {
      TerminatedPostcode.find(testTerminatedPostcode.replace(/\s/, ""), (error, result) => {
        if (error) return done(error);
        assert.equal(result.postcode, testTerminatedPostcode);
        done();
      });
    });
    it("should return null if postcode does not exist", done => {
      TerminatedPostcode.find("ID11QD", (error, result) => {
        if (error) return done(error);
        assert.isNull(result);
        done();
      });
    });
  });

  describe("#toJson", () => {
    it ("return an object with whitelisted attributes only", done => {
      TerminatedPostcode.find(testTerminatedPostcode, (error, result) => {
        if (error) return done(error);
        helper.isTerminatedPostcodeObject(TerminatedPostcode.toJson(result));
        done();
      });
    });
  });

  const assertRelationIsPopulated = done => {
    const query = `SELECT count(*) FROM ${TerminatedPostcode.relation}`;
    TerminatedPostcode._query(query, (error, result) => {
      if (error) return done(error);
      assert.isTrue(result.rows[0].count > 0);
      done();
    });
  }

  describe("#seedPostcodes", () => {
    before(function (done) {
      this.timeout(0);
      TerminatedPostcode.clear(error => {
        if (error) return done(error);
        TerminatedPostcode.seedPostcodes(helper.seedPostcodePath, done);
      });
    });

    after(function (done) {
      this.timeout(0);
      resetTerminatedPostcodeRelation(done);
    });

    it ("seeds terminated postcode table", assertRelationIsPopulated);
  });

  describe("#_setupTable", () => {
    before(function (done) {
      this.timeout(0);
      helper.clearTerminatedPostcodesDb(error => {
        if (error) return done(error);
        TerminatedPostcode._setupTable(helper.seedPostcodePath, done);
      });
    });

    after(function (done) {
      this.timeout(0);
      resetTerminatedPostcodeRelation(done);
    });

    it ("creates relation", done => {
      helper.listDatabaseRelations((error, result) => {
        if (error) return done(error);
        const relationName = TerminatedPostcode.relation;
        const test = r => r.Name === relationName && r.Type === "table";
        assert.isTrue(result.rows.some(test));
        done();
      });
    });
    it ("populates relation", assertRelationIsPopulated);
    it ("creates indexes", done => {
      helper.listDatabaseIndexes((error, result) => {
        if (error) return done(error);
        assert.isTrue(
          result.rows
            .filter(i => i.indrelid === TerminatedPostcode.relation)
            .length > 0
        );
        done();
      });
    });
  });
});
