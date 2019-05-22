"use strict";

const { assert } = require("chai");
const util = require("util");
const { AttributeBase } = require("./helper");

function CustomAttribute() {
  AttributeBase.call(this, "customattribute");
}

util.inherits(CustomAttribute, AttributeBase);

const customAttribute = new CustomAttribute();

describe("AttributeBase model", () => {
  describe("_createRelation", () => {
    after(done => {
      customAttribute._query(`DROP TABLE ${customAttribute.relation}`, done);
    });

    it("creates a relation with the correct default attributes", done => {
      customAttribute._createRelation(error => {
        if (error) return done(error);
        const query = `INSERT INTO ${
          customAttribute.relation
        } (code, name) VALUES ($1, $2) RETURNING *`;
        customAttribute._query(query, ["foo", "bar"], (error, result) => {
          if (error) return done(error);
          assert.equal(result.rows.length, 1);
          assert.equal(result.rows[0].code, "foo");
          assert.equal(result.rows[0].name, "bar");
          done();
        });
      });
    });
  });
});
