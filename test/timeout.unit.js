"use strict";

const { assert } = require("chai");
const helper = require("./helper/index");
const { startTimer } = helper.timeout;

describe("startTimer", () => {
  it("returns a timeout object", () => {
    const timer = startTimer(100);
    assert.isFalse(timer.timedOut);
    assert.isDefined(timer.id);
  });
  it("times out after an interval", (done) => {
    const timer = startTimer(100);
    assert.isFalse(timer.timedOut);
    setTimeout(() => {
      assert.isTrue(timer.timedOut);
      done();
    }, 200);
  });
  it("it does not if interval set to 0", () => {
    const timer = startTimer(0);
    assert.isFalse(timer.timedOut);
    assert.isUndefined(timer.id);
  });
});
