import request from "supertest";
import { assert } from "chai";
import * as helper from "./helper/index";
const app = helper.postcodesioApplication();

/**
 * E2E test for exact postcode response validation
 *
 * Tests that the API response for a known postcode (AB10 1AB from seed data)
 * exactly matches the expected values derived from the ONSPD CSV and lookup tables.
 *
 * This test validates:
 * - All top-level fields have correct values
 * - All codes have correct GSS code mappings
 * - Lookup table joins work correctly (districts, wards, constituencies, etc.)
 * - New fields (lsoa21, msoa21, lsoa11, msoa11, etc.) are populated correctly
 */
describe("Postcodes E2E", function () {
  before(async function () {
    this.timeout(0);
    await helper.clearPostcodeDb();
    await helper.seedPostcodeDb();
  });

  after(async () => helper.clearPostcodeDb());

  describe("GET /postcodes/:postcode", function () {
    it("returns exact expected response for AB10 1AB", function (done) {
      const expectedResponse: Record<string, unknown> = {
        postcode: "AB10 1AB",
        quality: 1,
        eastings: 394235,
        northings: 806529,
        country: "Scotland",
        nhs_ha: "Grampian",
        longitude: -2.096923,
        latitude: 57.14959,
        european_electoral_region: "Scotland",
        primary_care_trust: "Aberdeen City Community Health Partnership",
        region: null,
        lsoa: "George Street - 02",
        msoa: "George Street",
        incode: "1AB",
        outcode: "AB10",
        parliamentary_constituency: "Aberdeen South",
        parliamentary_constituency_2024: "Aberdeen South",
        admin_district: "Aberdeen City",
        parish: null,
        admin_county: null,
        date_of_introduction: "201106",
        admin_ward: "George St/Harbour",
        ced: null,
        ccg: "Aberdeen City Community Health Partnership",
        nuts: "Aberdeen City",
        pfa: "Scotland",
        // New fields (Nov 2025)
        nhs_region: null,
        ttwa: "Aberdeen",
        national_park: null,
        bua: null,
        icb: null,
        cancer_alliance: null,
        lsoa11: "George Street - 02",
        msoa11: "George Street",
        lsoa21: "George Street - 02",
        msoa21: "George Street",
        oa21: "S00136377",
        ruc11: "(Scotland) Large Urban Area",
        ruc21: "Large Urban Areas",
        lep1: null,
        lep2: null,
        codes: {
          admin_district: "S12000033",
          admin_county: "S99999999",
          admin_ward: "S13002842",
          parish: "S99999999",
          parliamentary_constituency: "S14000061",
          parliamentary_constituency_2024: "S14000061",
          ccg: "S03000012",
          ccg_id: "012",
          ced: "S99999999",
          nuts: "TLM50",
          lsoa: "S01013627",
          msoa: "S02002541",
          lau2: "S30000026",
          pfa: "S23000009",
          // New codes (Nov 2025)
          nhs_region: "S99999999",
          ttwa: "S22000047",
          national_park: "S99999999",
          bua: "S99999999",
          icb: "S99999999",
          cancer_alliance: "S99999999",
          lsoa11: "S01006646",
          msoa11: "S02001261",
          lsoa21: "S01013627",
          msoa21: "S02002541",
          oa21: "S00136377",
          ruc11: "1",
          ruc21: "1",
          lep1: "S99999999",
          lep2: null,
        },
      };

      request(app)
        .get("/postcodes/AB10%201AB")
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function (error, response) {
          if (error) return done(error);
          assert.equal(response.body.status, 200);
          assert.deepEqual(response.body.result, expectedResponse);
          done();
        });
    });

    it("returns exact expected response for SE1P 5ZZ", function (done) {
      const expectedResponse: Record<string, unknown> = {
        postcode: "SE1P 5ZZ",
        quality: 1,
        eastings: 533378,
        northings: 178838,
        country: "England",
        nhs_ha: "London",
        longitude: -0.080126,
        latitude: 51.492763,
        european_electoral_region: "London",
        primary_care_trust: "Southwark",
        region: "London",
        lsoa: "Southwark 006E",
        msoa: "Southwark 006",
        incode: "5ZZ",
        outcode: "SE1P",
        parliamentary_constituency: "Bermondsey and Old Southwark",
        parliamentary_constituency_2024: "Bermondsey and Old Southwark",
        admin_district: "Southwark",
        parish: "Southwark, unparished area",
        admin_county: null,
        date_of_introduction: "201008",
        admin_ward: "London Bridge & West Bermondsey",
        ced: null,
        ccg: "NHS South East London",
        nuts: "Southwark",
        pfa: "Metropolitan Police",
        // New fields (Nov 2025)
        nhs_region: "London",
        ttwa: "London",
        national_park: "England (non-National Park)",
        bua: "Southwark",
        icb: "NHS South East London Integrated Care Board",
        cancer_alliance: "South East London",
        lsoa11: "Southwark 006E",
        msoa11: "Southwark 006",
        lsoa21: "Southwark 006E",
        msoa21: "Southwark 006",
        oa21: "E00020027",
        ruc11: "(England/Wales) Urban major conurbation",
        ruc21: "Urban: Nearer to a major town or city",
        lep1: "London",
        lep2: null,
        codes: {
          admin_district: "E09000028",
          admin_county: "E99999999",
          admin_ward: "E05011104",
          parish: "E43000218",
          parliamentary_constituency: "E14001085",
          parliamentary_constituency_2024: "E14001085",
          ccg: "E38000244",
          ccg_id: "72Q",
          ced: "E99999999",
          nuts: "TLI44",
          lsoa: "E01003979",
          msoa: "E02000812",
          lau2: "E09000028",
          pfa: "E23000001",
          // New codes (Nov 2025)
          nhs_region: "E40000003",
          ttwa: "E30000234",
          national_park: "E65000001",
          bua: "E63012110",
          icb: "E54000030",
          cancer_alliance: "E56000010",
          lsoa11: "E01003979",
          msoa11: "E02000812",
          lsoa21: "E01003979",
          msoa21: "E02000812",
          oa21: "E00020027",
          ruc11: "A1",
          ruc21: "UN1",
          lep1: "E37000051",
          lep2: null,
        },
      };

      request(app)
        .get("/postcodes/SE1P%205ZZ")
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function (error, response) {
          if (error) return done(error);
          assert.equal(response.body.status, 200);
          assert.deepEqual(response.body.result, expectedResponse);
          done();
        });
    });
  });
});
