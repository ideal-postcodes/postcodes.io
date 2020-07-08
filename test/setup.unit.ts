import { assert } from "chai";
import {
  setupSupportTables,
  setupOutcodeTable,
  SUPPORT_TABLES,
} from "../src/app/lib/setup";
import {
  listDatabaseRelations,
  clearPostcodeDb,
  seedPostcodeDb,
  Outcode,
} from "./helper/index";

const clearSupportTables = () => {
  return Promise.all(SUPPORT_TABLES.map((m) => m.destroyRelation()));
};

describe("Setup methods", () => {
  before(async function () {
    this.timeout(0);
    await clearPostcodeDb();
    await seedPostcodeDb();
  });

  after(async () => clearPostcodeDb());

  describe("setupSupportTables", () => {
    before(async () => {
      await clearSupportTables();
    });

    after(async function () {
      this.timeout(0);
      await setupSupportTables();
    });

    it("creates support tables", async function () {
      this.timeout(0);
      const existing = await listDatabaseRelations();
      SUPPORT_TABLES.forEach(({ relation }) => {
        assert.isFalse(
          existing.rows.some(({ Name }) => Name === relation.relation)
        );
      });
      await setupSupportTables();
      const created = await listDatabaseRelations();
      SUPPORT_TABLES.forEach(({ relation }) => {
        assert.isTrue(
          created.rows.some(({ Name }) => Name === relation.relation)
        );
      });
    });
  });

  describe("setupOutcodeTable", () => {
    before(async () => Outcode.destroyRelation());

    it("creates outcode table", async () => {
      const existing = await listDatabaseRelations();
      assert.isFalse(existing.rows.some(({ Name }) => Name === "outcodes"));
      await setupOutcodeTable();
      const created = await listDatabaseRelations();
      assert.isTrue(created.rows.some(({ Name }) => Name === "outcodes"));
    });
  });
});
