"use strict";

const assert = require("chai").assert;
const helper = require("./helper/index");
const Postcode = helper.Postcode;

describe("Postcode data regression testing", function () {
  before(async function () {
    this.timeout(0);
    await helper.clearPostcodeDb();
    await helper.seedPostcodeDb();
  });

  after(async () => helper.clearPostcodeDb());

  // Ordinary case
  it("contains correct data for AB123BS", async () => {
    const result = await Postcode.find("AB123BS");
    delete result.id;
    assert.deepEqual(
      {
        postcode: "AB12 3BS",
        pc_compact: "AB123BS",
        quality: 1,
        eastings: 395299,
        northings: 804021,
        country: "Scotland",
        nhs_ha: "Grampian",
        admin_county_id: "S99999999",
        admin_district_id: "S12000033",
        admin_ward_id: "S13002847",
        longitude: -2.079282,
        latitude: 57.127089,
        location: "0101000020E6100000B24AE9995EA200C03657CD7344904C40",
        european_electoral_region: "Scotland",
        primary_care_trust: "Aberdeen City Community Health Partnership",
        region: null,
        parish_id: "S99999999",
        lsoa: "Cove North - 05",
        msoa: "Cove North",
        nuts_id: "S31000944",
        incode: "3BS",
        outcode: "AB12",
        ccg_id: "S03000012",
        ced: null,
        ced_id: "S99999999",
        constituency_id: "S14000002",
        parliamentary_constituency: "Aberdeen South",
        admin_district: "Aberdeen City",
        parish: null,
        admin_county: null,
        admin_ward: "Kincorth/Nigg/Cove",
        ccg: "Aberdeen City Community Health Partnership",
        ccg_code: "012",
        nuts: "Aberdeen City and Aberdeenshire",
        nuts_code: "UKM50",
      },
      result
    );
  });

  it("returns correct data for SE1P5ZZ", async () => {
    const result = await Postcode.find("SE1P5ZZ");
    delete result.id;
    assert.deepEqual(
      {
        postcode: "SE1P 5ZZ",
        pc_compact: "SE1P5ZZ",
        quality: 1,
        eastings: 533378,
        northings: 178838,
        country: "England",
        nhs_ha: "London",
        admin_county_id: "E99999999",
        admin_district_id: "E09000028",
        admin_ward_id: "E05011104",
        longitude: -0.080152,
        latitude: 51.492762,
        location: "0101000020E61000008080B56AD784B4BF145B41D312BF4940",
        european_electoral_region: "London",
        primary_care_trust: "Southwark",
        region: "London",
        parish_id: "E43000218",
        lsoa: "Southwark 006E",
        msoa: "Southwark 006",
        nuts_id: "E05011104",
        incode: "5ZZ",
        outcode: "SE1P",
        ccg_id: "E38000171",
        ced: null,
        ced_id: "E99999999",
        constituency_id: "E14000553",
        parliamentary_constituency: "Bermondsey and Old Southwark",
        admin_district: "Southwark",
        parish: "Southwark, unparished area",
        admin_county: null,
        admin_ward: "London Bridge & West Bermondsey",
        ccg: "NHS Southwark",
        ccg_code: "08Q",
        nuts: "Lewisham and Southwark",
        nuts_code: "UKI44",
      },
      result
    );
  });

  // Case: Does not contain geolocation
  // https://github.com/ideal-postcodes/postcodes.io/issues/197
  it("contains correct data for JE24WD", async () => {
    const result = await Postcode.find("JE24WD");
    delete result.id;
    assert.deepEqual(
      {
        postcode: "JE2 4WD",
        pc_compact: "JE24WD",
        quality: 9,
        eastings: null,
        northings: null,
        country: "Channel Islands",
        nhs_ha: "Jersey Health Authority",
        admin_county_id: "L99999999",
        admin_district_id: "L99999999",
        admin_ward_id: "L99999999",
        longitude: null,
        latitude: null,
        location: null,
        european_electoral_region: null,
        primary_care_trust: "(pseudo) Channel Islands",
        region: null,
        parish_id: "L99999999",
        lsoa: null,
        msoa: null,
        nuts_id: "L99999999",
        incode: "4WD",
        outcode: "JE2",
        ccg_id: "L99999999",
        ced: null,
        ced_id: "L99999999",
        constituency_id: "L99999999",
        parliamentary_constituency: null,
        admin_district: null,
        parish: null,
        admin_county: null,
        admin_ward: null,
        ccg: null,
        ccg_code: null,
        nuts: null,
        nuts_code: null,
      },
      result
    );
  });
});
