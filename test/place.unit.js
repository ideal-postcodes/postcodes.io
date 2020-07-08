"use strict";

const fs = require("fs");
const { assert } = require("chai");
const parse = require("csv-parse/lib/sync");
const helper = require(`./helper/index`);
const seedPathDirectory = `${__dirname}/seed/places/`;
const seedFilePath = `${__dirname}/seed/places/HY20.csv`;
const { Place } = helper;
const { query } = require("../src/app/models/base");

console.log("Seed Directory");
console.log("Seed Directory");
console.log("Seed Directory");
console.log("Seed Directory");
console.log(__dirname);
console.log(seedPathDirectory);

const TYPE_OFFSET = 6; // Specifies type column on place.csv files

const countPlacesTestSeedData = (seedFilePath) => {
  return parse(fs.readFileSync(seedFilePath)).filter(
    (row) => row[TYPE_OFFSET] === "populatedPlace"
  ).length;
};

const placesEntriesCount = countPlacesTestSeedData(seedFilePath);

describe("Place Model", () => {
  let testPostcode, testOutcode;

  before(async function () {
    this.timeout(0);
    await helper.clearPostcodeDb();
    await helper.seedPostcodeDb();
  });

  after(async () => helper.clearPostcodeDb());

  describe("#setupTable", () => {
    before(async () => {
      await Place.destroyRelation();
      await Place.setupTable(seedPathDirectory);
    });

    describe("#_createRelation", () => {
      it(`creates a relation that matches ${Place.relation.relation} schema`, async () => {
        const q = `
					SELECT 
						column_name, data_type, character_maximum_length
					FROM
						INFORMATION_SCHEMA.COLUMNS 
					WHERE
						table_name = '${Place.relation.relation}'
				`;
        const result = await query(q);
        const schema = result.rows.reduce((impliedSchema, columnInfo) => {
          const [columnName, dataType] = helper.inferSchemaData(columnInfo);
          impliedSchema[columnName] = dataType;
          return impliedSchema;
        }, {});
        assert.deepEqual(schema, Place.relation.schema);
      });
    });

    describe("#seedData", () => {
      it("loads correct data from data directory", async () => {
        const q = `SELECT count(*) FROM ${Place.relation.relation}`;
        const result = await query(q);
        assert.equal(result.rows[0].count, placesEntriesCount);
      });
    });

    describe("#populateLocation", () => {
      it("populates location collumn with geohashes", async () => {
        const q = `SELECT location FROM ${Place.relation.relation}`;
        const result = await query(q);
        result.rows.forEach((row) => assert.equal(row.location.length, 50));
      });
    });

    describe("#generateSearchFields", () => {
      it(`correctly allocates (name_1/name_2)_search fields`, async () => {
        const q = `
					SELECT
						name_1, name_1_search, name_2, name_2_search
					FROM 
						${Place.relation.relation}
				`;
        const sanitizeName = (name) => {
          const sanitizedName = name
            .replace(/-/g, " ")
            .replace("'", "")
            .toLowerCase();
          return helper.removeDiacritics(sanitizedName);
        };

        const result = await query(q);
        ["name_1", "name_2"].forEach((nameField) => {
          for (let i = 0; i < placesEntriesCount; i++) {
            const name = result.rows[i][nameField];
            const searchName = result.rows[i][`${nameField}_search`];
            if (name === null) {
              assert.isNull(searchName);
            } else {
              assert.equal(searchName, sanitizeName(name));
            }
          }
        });
      });
    });

    describe("#generateTsSearchFields", () => {
      it("generates appropriate tsvector search fields from (name_1/name_2) field", async () => {
        const q = `
					SELECT
						name_1, name_1_search_ts, to_tsvector('simple', name_1) as ts_name_1,
						name_2, name_2_search_ts, to_tsvector('simple', name_2) as ts_name_2
				  FROM ${Place.relation.relation}
			  `;
        const result = await query(q);
        ["name_1", "name_2"].forEach((name_field) => {
          for (let i = 0; i < placesEntriesCount; i++) {
            const ts_field_name = result.rows[i][`${name_field}_search_ts`];
            const correct_ts_name = result.rows[i][`ts_${name_field}`];
            assert.equal(ts_field_name, correct_ts_name);
          }
        });
      });
    });

    describe("#createIndexes", () => {
      it("generates indexes that matches to what's been specified", async () => {
        const impliedIndexesArr = [];
        const result = await query(
          `select indexdef from pg_indexes where tablename = '${Place.relation.relation}'`
        );
        result.rows.forEach((row) => {
          const indexDef = row.indexdef;
          const impliedIndexObj = helper.inferIndexInfo(indexDef);

          if (impliedIndexObj.column !== "id") {
            // id is always indexed
            impliedIndexesArr.push(impliedIndexObj);
          }
        });
        const impliedIndexes = impliedIndexesArr.sort(
          helper.sortByIndexColumns
        );
        const realIndexes = Place.relation.indexes.sort(
          helper.sortByIndexColumns
        );
        assert.deepEqual(impliedIndexes, realIndexes);
      });
    });
  });

  describe("#findByCode", () => {
    const testCode = "osgb4000000074559125";
    it("returns place by code", async () => {
      const result = await Place.findByCode(testCode);
      helper.isRawPlaceObject(result);
    });
    it("is case insensitive", async () => {
      const result = await Place.findByCode(testCode.toUpperCase());
      helper.isRawPlaceObject(result);
    });
    it("returns null if no match", async () => {
      const result = await Place.findByCode("12");
      assert.isNull(result);
    });
    it("returns null if code not string", async () => {
      const result = await Place.findByCode(12);
      assert.isNull(result);
    });
  });

  describe("contains", () => {
    let validPlace;
    before(async () => {
      validPlace = await Place.random();
    });

    it("returns a list of places which contain point", async () => {
      const places = await Place.contains({
        longitude: validPlace.longitude,
        latitude: validPlace.latitude,
      });
      assert.isTrue(places.length > 0);
      helper.isRawPlaceObject(places[0]);
      assert.isTrue(places.some((place) => place.code === validPlace.code));
    });
    it("orders results by distance", async () => {
      const places = await Place.contains({
        longitude: -3.2137291,
        latitude: 58.96804,
      });
      places
        .map((p) => p.distance)
        .reduce((acc, curr) => {
          assert.isTrue(curr >= acc);
          return curr;
        }, 0);
    });
    it("is sensitive to limit", async () => {
      const places = await Place.contains({
        longitude: -3.2137291,
        latitude: 58.96804,
        limit: 1,
      });
      assert.equal(places.length, 1);
      const result = places[0];
      helper.isRawPlaceObject(result);
    });
    it("uses default limit if invalid", async () => {
      await Place.contains({
        longitude: 0,
        latitude: 0,
        limit: "Foo",
      });
    });
    it("uses default limit greater than 100", async () => {
      await Place.contains({
        longitude: 0,
        latitude: 0,
        limit: 101,
      });
    });
    it("returns an error if invalid longitude", async () => {
      try {
        await Place.contains({
          longitude: "foo",
          latitude: 0,
        });
      } catch (error) {
        assert.match(error.message, /invalid\slongitude/i);
      }
    });
    it("returns an error if invalid latitude", async () => {
      try {
        await Place.contains({
          longitude: 0,
          latitude: "foo",
        });
      } catch (error) {
        assert.match(error.message, /invalid\slatitude/i);
      }
    });
  });

  describe("nearest", () => {
    let validPlace;
    before(async () => {
      validPlace = await Place.random();
    });

    it("returns a list of places which contain point", async () => {
      const places = await Place.nearest({
        longitude: validPlace.longitude,
        latitude: validPlace.latitude,
      });
      assert.isTrue(places.length > 0);
      assert.isTrue(places.length > 0);
      helper.isRawPlaceObject(places[0]);
      assert.isTrue(places.some((place) => place.code === validPlace.code));
    });
    it("orders results by distance", async () => {
      const places = await Place.nearest({
        longitude: -3.2137291,
        latitude: 58.96804,
      });
      places
        .map((p) => p.distance)
        .reduce((acc, curr) => {
          assert.isTrue(curr >= acc);
          return curr;
        }, 0);
    });
    it("is sensitive to limit", async () => {
      const places = await Place.nearest({
        longitude: -3.2137291,
        latitude: 58.96804,
        limit: 1,
      });
      assert.equal(places.length, 1);
      const result = places[0];
      helper.isRawPlaceObject(result);
    });
    it("uses default limit if invalid", async () => {
      await Place.nearest({
        longitude: 0,
        latitude: 0,
        limit: "Foo",
      });
    });
    it("uses default limit greater than 100", async () => {
      await Place.nearest({
        longitude: 0,
        latitude: 0,
        limit: 101,
      });
    });
    it("uses default radius if invalid", async () => {
      await Place.nearest({
        longitude: 0,
        latitude: 0,
        radius: "Foo",
      });
    });
    it("uses default limit greater than max default", async () => {
      await Place.nearest({
        longitude: 0,
        latitude: 0,
        radius: 1000000,
      });
    });
    it("returns an error if invalid longitude", async () => {
      try {
        await Place.nearest({
          longitude: "foo",
          latitude: 0,
        });
      } catch (error) {
        assert.match(error.message, /invalid\slongitude/i);
      }
    });
    it("returns an error if invalid latitude", async () => {
      try {
        await Place.nearest({
          longitude: 0,
          latitude: "foo",
        });
      } catch (error) {
        assert.match(error.message, /invalid\sgeometry/i);
      }
    });
  });

  describe("toJson", () => {
    it("formats place object for public consumption", async () => {
      const testCode = "osgb4000000074559125";
      const place = await Place.findByCode(testCode);
      helper.isRawPlaceObject(place);
      const formatted = Place.toJson(place);
      helper.isPlaceObject(formatted);
    });
  });

  describe("#random", () => {
    it("should return a random place", async () => {
      const place = await Place.random();
      helper.isRawPlaceObject(place);
    });
  });
});
