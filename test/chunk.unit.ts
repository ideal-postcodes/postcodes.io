import { assert } from "chai";
import { chunk } from "../src/app/lib/chunk";

describe("chunk", () => {
  it("chunks arrays", () => {
    assert.deepEqual(chunk([1, 1, 1, 2, 2, 2, 3, 3, 3], 3), [
      [1, 1, 1],
      [2, 2, 2],
      [3, 3, 3],
    ]);
    assert.deepEqual(chunk([1, 1, 1, 2, 2, 2, 3, 3], 3), [
      [1, 1, 1],
      [2, 2, 2],
      [3, 3],
    ]);
    assert.deepEqual(chunk([1, 1], 3), [[1, 1]]);
  });
});
