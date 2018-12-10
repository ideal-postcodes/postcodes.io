"use strict"

const { assert } = require("chai");

const getCount = o => Object.keys(o).length;
const loadData = model => require(`../../data/${model.relation}.json`);

const rigCoreSpecs = model => {
  const data = loadData(model);
  const dataCount = getCount(data);

  describe(`${model.relation} model`, () => {
    // Rebuild table after tests
    after(function (done) {
      this.timeout(0);
      model._setupTable(done);
    });

    describe("seedData", () => {
      // Recreate clean table
      before(function (done) {
        model._destroyRelation((error) => {
          if (error) return done(error);
          model._createRelation(done);
        });
      });

      it ("loads correct data from data directory", function (done) {
        this.timeout(0);
        model.seedData(function (error) {
          if (error) return done(error);
          model._query(`SELECT count(*) FROM ${model.relation}` , (error, result) => {
            if (error) return done(error);
            assert.equal(result.rows[0].count, dataCount);
            done();
          });
        });
      });
    });

    describe("_setupTable", () => {
      it ("creates a table, associated indexes and populates with data", function (done) {
        this.timeout(0);
        model._setupTable(error => {
          if (error) return done(error);
          model._query(`SELECT count(*) FROM ${model.relation}` , (error, result) => {
            if (error) return done(error);
            assert.equal(result.rows[0].count, dataCount);
            done();
          });
        });
      });
    });
  });
};

module.exports = { rigCoreSpecs };

