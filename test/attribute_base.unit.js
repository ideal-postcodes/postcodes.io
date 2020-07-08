"use strict";

const { assert } = require("chai");
const {
  generateAttributeMethods,
} = require("../src/app/models/attribute_base");
const { query, dollarise } = require("../src/app/models/index");

const relation = "customattribute";

const customAttribute = generateAttributeMethods({ relation });

describe("AttributeBase model", () => {
  describe("_createRelation", () => {
    after(async () => {
      await customAttribute.destroyRelation();
    });

    it("creates a relation with the correct default attributes", async () => {
      const record = {
        code: "foo",
        name: "bar",
      };
      await customAttribute.createRelation();
      const result = await query(
        `
          INSERT INTO ${relation}
            (${Object.keys(record).join(", ")})
          VALUES
            (${dollarise(Object.values(record))})
          RETURNING *
        `,
        Object.values(record)
      );
      assert.equal(result.rows.length, 1);
      assert.equal(result.rows[0].code, "foo");
      assert.equal(result.rows[0].name, "bar");
    });
  });
});
