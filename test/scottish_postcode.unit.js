"use strict";

const { readFileSync } = require("fs");
const { series } = require("async");
const { assert } = require("chai");
const parse = require("csv-parse/lib/sync");
const {
  ScottishPostcode,
  ScottishConstituency,
  clearScottishPostcodeDb,
  inferSchemaData,
  clearPostcodeDb,
  seedPostcodeDb,
} = require("./helper");
const { resolve } = require("path");
const seedFilePath = resolve(`${__dirname}/seed/`);

describe("Scottish Postcode Model", () => {
  const testPostcodeLarge = "ML11 0GH";
  const testPostcodeSmall = "G82 1JW";

  before(function(done) {
    this.timeout(0);
    series([clearPostcodeDb, seedPostcodeDb], done);
  });

  after(clearPostcodeDb);

  describe("#setupTable", () => {
    before(function(done) {
      this.timeout(0);
      ScottishPostcode._destroyRelation(error => {
        if (error) return done(error);
        ScottishPostcode._setupTable(seedFilePath, done);
      });
    });

    after(function(done) {
      this.timeout(0);
      ScottishPostcode._destroyRelation(error => {
        if (error) return done(error);
        ScottishPostcode._setupTable(seedFilePath, done);
      });
    });

    describe("#_createRelation", () => {
      it(`creates a relation that matches ${ScottishPostcode.relation} schema`, done => {
        const query = `
          SELECT 
            column_name, data_type, character_maximum_length, collation_name
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE table_name = '${ScottishPostcode.relation}'
        `;
        ScottishPostcode._query(query, (error, result) => {
          if (error) return done(error);
          const impliedSchema = {};
          result.rows.forEach(columnInfo => {
            let columnName, dataType;
            [columnName, dataType] = inferSchemaData(columnInfo);
            impliedSchema[columnName] = dataType;
          });
          assert.deepEqual(impliedSchema, ScottishPostcode.schema);
          done();
        });
      });
    });

    describe("#seedData", () => {
      it("loads correct data from data directory", done => {
        const query = `SELECT count(*) FROM ${ScottishPostcode.relation}`;
        ScottishPostcode._query(query, (error, result) => {
          if (error) return done(error);
          assert.isTrue(result.rows[0].count > 0);
          done();
        });
      });
    });
  });

  describe("#toJson", () => {
    it("formats a postcode object", () => {
      const postcode = {
        scottish_constituency_id: "foo",
        scottish_parliamentary_constituency: "bar",
        id: "id",
        pc_compact: "pc_compact",
        postcode: "postcode",
      };
      const formatted = ScottishPostcode.toJson(
        JSON.parse(JSON.stringify(postcode))
      );
      assert.deepEqual(formatted, {
        postcode: "postcode",
        scottish_parliamentary_constituency: "bar",
        codes: {
          scottish_parliamentary_constituency: "foo",
        },
      });
    });
  });

  describe("#find", () => {
    it("should return postcode with the right attributes for large user", done => {
      ScottishPostcode.find(testPostcodeLarge, (error, result) => {
        if (error) return done(error);
        assert.deepEqual(result, {
          id: result.id,
          pc_compact: "ML110GH",
          postcode: "ML11 0GH",
          scottish_constituency_id: "S16000090",
          scottish_parliamentary_constituency: "Clydesdale",
        });
        done();
      });
    });

    it("should return postcode with the right attributes for small users", done => {
      ScottishPostcode.find(testPostcodeSmall, (error, result) => {
        if (error) return done(error);
        assert.deepEqual(result, {
          id: result.id,
          pc_compact: "G821JW",
          postcode: "G82 1JW",
          scottish_constituency_id: "S16000096",
          scottish_parliamentary_constituency: "Dumbarton",
        });
        done();
      });
    });

    it("should return null for null/undefined postcode search", done => {
      ScottishPostcode.find(null, (error, result) => {
        if (error) return done(error);
        assert.isNull(result);
        done();
      });
    });

    it("returns null if invalid postcode", done => {
      ScottishPostcode.find("1", (error, result) => {
        if (error) return done(error);
        assert.isNull(result);
        done();
      });
    });

    it("should be insensitive to space", done => {
      ScottishPostcode.find(
        testPostcodeLarge.replace(/\s/, ""),
        (error, result) => {
          if (error) return done(error);
          assert.equal(result.postcode, testPostcodeLarge);
          done();
        }
      );
    });

    it("should return null if postcode does not exist", done => {
      ScottishPostcode.find("ID11QD", (error, result) => {
        if (error) return done(error);
        assert.isNull(result);
        done();
      });
    });
  });
});
