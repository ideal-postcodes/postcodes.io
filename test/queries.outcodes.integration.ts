// Contract tests for api/app/queries/outcodes.ts.

import { describe, expect, it } from "vitest";
import { find, nearest, toJson } from "../api/app/queries/outcodes";

const ANCHOR = { longitude: "-2.096923", latitude: "57.14959" };

describe("queries/outcodes (contract)", () => {
  describe("find()", () => {
    it("returns aggregated row for a known outcode", async () => {
      expect(await find("AB10")).toEqual({
        admin_county: [],
        admin_district: ["Aberdeen City"],
        admin_ward: [
          "Airyhall/Broomhill/Garthdee",
          "George St/Harbour",
          "Hazlehead/Queens Cross/Countesswells",
          "Kincorth/Nigg/Cove",
          "Midstocket/Rosemount",
          "Torry/Ferryhill",
        ],
        country: ["Scotland"],
        eastings: 392783,
        latitude: 57.13538820731707,
        longitude: -2.1208672500000016,
        northings: 804950,
        outcode: "AB10",
        parish: [],
        parliamentary_constituency: ["Aberdeen North", "Aberdeen South"],
      });
    });
    it("normalises whitespace and case", async () => {
      expect(await find("  ab 10  ")).toEqual({
        admin_county: [],
        admin_district: ["Aberdeen City"],
        admin_ward: [
          "Airyhall/Broomhill/Garthdee",
          "George St/Harbour",
          "Hazlehead/Queens Cross/Countesswells",
          "Kincorth/Nigg/Cove",
          "Midstocket/Rosemount",
          "Torry/Ferryhill",
        ],
        country: ["Scotland"],
        eastings: 392783,
        latitude: 57.13538820731707,
        longitude: -2.1208672500000016,
        northings: 804950,
        outcode: "AB10",
        parish: [],
        parliamentary_constituency: ["Aberdeen North", "Aberdeen South"],
      });
    });
    it("returns null for an unknown outcode", async () => {
      expect(await find("ZZ99")).toBeNull();
    });
    it("returns null for nullish input", async () => {
      expect(await find(undefined)).toBeNull();
      expect(await find("")).toBeNull();
    });
  });

  describe("nearest()", () => {
    it("returns ordered outcodes near the anchor", async () => {
      expect(await nearest({ ...ANCHOR, radius: "5000", limit: "5" })).toEqual([
        {
          admin_county: [],
          admin_district: ["Aberdeen City"],
          admin_ward: ["George St/Harbour", "Torry/Ferryhill"],
          country: ["Scotland"],
          distance: 1161.81043416,
          eastings: 394470,
          latitude: 57.13937505705227,
          longitude: -2.0930223534072896,
          northings: 805392,
          outcode: "AB11",
          parish: [],
          parliamentary_constituency: ["Aberdeen South"],
        },
        {
          admin_county: [],
          admin_district: ["Aberdeen City"],
          admin_ward: [
            "Airyhall/Broomhill/Garthdee",
            "George St/Harbour",
            "Hazlehead/Queens Cross/Countesswells",
            "Kincorth/Nigg/Cove",
            "Midstocket/Rosemount",
            "Torry/Ferryhill",
          ],
          country: ["Scotland"],
          distance: 2145.35910528,
          eastings: 392783,
          latitude: 57.13538820731707,
          longitude: -2.1208672500000016,
          northings: 804950,
          outcode: "AB10",
          parish: [],
          parliamentary_constituency: ["Aberdeen North", "Aberdeen South"],
        },
        {
          admin_county: [],
          admin_district: ["Aberdeen City"],
          admin_ward: [
            "Dyce/Bucksburn/Danestone",
            "Hilton/Woodside/Stockethill",
            "Kingswells/Sheddocksley/Summerhill",
            "Midstocket/Rosemount",
            "Northfield/Mastrick North",
          ],
          country: ["Scotland"],
          distance: 3800.53314933,
          eastings: 390619,
          latitude: 57.16001172951876,
          longitude: -2.156721596879061,
          northings: 807696,
          outcode: "AB16",
          parish: [],
          parliamentary_constituency: ["Aberdeen North"],
        },
        {
          admin_county: [],
          admin_district: ["Aberdeen City", "Aberdeenshire"],
          admin_ward: [
            "Airyhall/Broomhill/Garthdee",
            "Dyce/Bucksburn/Danestone",
            "Hazlehead/Queens Cross/Countesswells",
            "Kingswells/Sheddocksley/Summerhill",
            "Lower Deeside",
            "Midstocket/Rosemount",
            "Westhill and District",
          ],
          country: ["Scotland"],
          distance: 4590.96852268,
          eastings: 389841,
          latitude: 57.137619008992885,
          longitude: -2.1694916160071984,
          northings: 805205,
          outcode: "AB15",
          parish: [],
          parliamentary_constituency: [
            "Aberdeen North",
            "Aberdeen South",
            "West Aberdeenshire and Kincardine",
          ],
        },
      ]);
    });
    it("returns null when no outcodes within radius", async () => {
      expect(
        await nearest({ longitude: "-30", latitude: "50", radius: "100" })
      ).toBeNull();
    });
    it("clamps limit to MAX", async () => {
      const rows = await nearest({ ...ANCHOR, radius: "50000", limit: "9999" });
      expect(rows?.length ?? null).toBe(7);
    });
    it("rejects non-numeric latitude", async () => {
      await expect(nearest({ longitude: "0", latitude: "x" })).rejects.toThrow(
        "PostcodesIO HTTP Error: 400 Invalid longitude/latitude submitted"
      );
    });
  });
  describe("toJson()", () => {
    it("shapes a known outcode row into the public JSON response", async () => {
      const row = await find("AB10");
      expect(row && toJson(row)).toEqual({
        admin_county: [],
        admin_district: ["Aberdeen City"],
        admin_ward: [
          "Airyhall/Broomhill/Garthdee",
          "George St/Harbour",
          "Hazlehead/Queens Cross/Countesswells",
          "Kincorth/Nigg/Cove",
          "Midstocket/Rosemount",
          "Torry/Ferryhill",
        ],
        country: ["Scotland"],
        eastings: 392783,
        latitude: 57.13538820731707,
        longitude: -2.1208672500000016,
        northings: 804950,
        outcode: "AB10",
        parish: [],
        parliamentary_constituency: ["Aberdeen North", "Aberdeen South"],
      });
    });
  });
});
