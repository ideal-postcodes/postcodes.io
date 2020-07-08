import { Relation, query } from "../../src/app/models/base";
import { assert } from "chai";

const getCount = (o: any) => Object.keys(o).length;
const loadData = (relation: Relation) =>
  require(`../../data/${relation.relation}.json`);

export const rigCoreSpecs = (model: any) => {
  const { relation } = model;
  const data = loadData(relation);
  const dataCount = getCount(data);

  describe(`${relation.relation} model`, () => {
    // Rebuild table after tests
    after(async function () {
      this.timeout(0);
      await model.setupTable();
    });

    describe("seedData", () => {
      before(async () => {
        await model.destroyRelation();
        await model.createRelation();
      });

      it("loads correct data from data directory", async function () {
        this.timeout(0);
        await model.seedData();
        const { rows } = await query(
          `SELECT count(*) FROM ${model.relation.relation}`
        );
        assert.equal(rows[0].count, dataCount);
      });
    });

    describe("setupTable", () => {
      it("creates a table, associated indexes and populates with data", async function () {
        this.timeout(0);
        await model.setupTable();
        const { rows } = await query(
          `SELECT count(*) FROM ${model.relation.relation}`
        );
        assert.equal(rows[0].count, dataCount);
      });
    });
  });
};
