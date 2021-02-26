import { seedBoundariesDb, clearBoundariesDb } from "../helper";
import { assert } from "chai";

export const run = (model: any, location: any) => {
  const { relation } = model.relation;
  const { lng, lat } = location;

  describe(`${relation} Unit`, () => {
    before(async () => {
      await clearBoundariesDb();
      await seedBoundariesDb();
    });
    after(async () => clearBoundariesDb);
    it("Should feed data to database", async () => {
      const count = await model.count();
      assert.isAbove(count, 0);
    });
    it("Should find boundaries where point intercescts with it", async () => {
      const boundaries = await model.inBoundary(lng, lat);
      console.log(JSON.stringify(boundaries, null, 2));
    });
  });
};