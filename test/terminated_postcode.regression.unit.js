"use strict";

const async = require("async");
const assert = require("chai").assert;
const helper = require("./helper/index");
const TerminatedPostcode = helper.TerminatedPostcode;

const resetTerminatedPostcodeRelation = async () => {
  await helper.clearTerminatedPostcodesDb();
  await helper.seedTerminatedPostcodeDb();
};

describe("Terminated postcode data regression testing", function () {
  before(async function () {
    this.timeout(0);
    await resetTerminatedPostcodeRelation();
  });

  after(async () => helper.clearTerminatedPostcodesDb());

  it("contains correct data for AB115TP", async () => {
    const result = await TerminatedPostcode.find("AB115TP");
    delete result.id;
    assert.deepEqual(
      {
        postcode: "AB11 5TP",
        pc_compact: "AB115TP",
        year_terminated: 1996,
        month_terminated: 7,
        eastings: 394290,
        northings: 806210,
        longitude: -2.095999,
        latitude: 57.146741,
        location: "0101000020E6100000F296AB1F9BC400C0BDFDB968C8924C40",
      },
      result
    );
  });

  // Case: Does not contain geolocation
  // https://github.com/ideal-postcodes/postcodes.io/issues/197
  it("contains correct data for AB113AG", async () => {
    const result = await TerminatedPostcode.find("AB113AG");
    delete result.id;
    assert.deepEqual(
      {
        postcode: "AB11 3AG",
        pc_compact: "AB113AG",
        year_terminated: 1997,
        month_terminated: 7,
        eastings: null,
        northings: null,
        longitude: null,
        latitude: null,
        location: null,
      },
      result
    );
  });
});
