import {
  Relation,
  RowExtract,
  csvExtractor,
  generateMethods,
  query,
  _csvSeed,
} from "./base";
import Postcode from "postcode";

const extractOnspdVal = csvExtractor(
  require("../../../data/onspd_schema.json")
);

const relation: Relation = {
  relation: "terminated_postcodes",
  schema: {
    id: "SERIAL PRIMARY KEY",
    postcode: `VARCHAR(10) NOT NULL COLLATE "C"`,
    pc_compact: `VARCHAR(9) COLLATE "C"`,
    year_terminated: "INTEGER",
    month_terminated: "INTEGER",
    eastings: "INTEGER",
    northings: "INTEGER",
    longitude: "DOUBLE PRECISION",
    latitude: "DOUBLE PRECISION",
    location: "GEOGRAPHY(Point, 4326)",
  },
  indexes: [
    {
      unique: true,
      column: "pc_compact",
    },
  ],
};

interface TerminatedPostcodeTuple extends TerminatedPostcodeInterface {
  id: number;
  pc_compact: string;
  eastings: number;
  northings: number;
  location: string;
}

interface TerminatedPostcodeInterface {
  postcode: string;
  year_terminated: number;
  month_terminated: number;
  longitude: number;
  latitude: number;
}

const findQuery = `
	SELECT *
	FROM 
		terminated_postcodes 
	WHERE pc_compact=$1
`;

export const find = async (
  postcode: string
): Promise<TerminatedPostcodeTuple | null> => {
  if (postcode == null) postcode = "";
  postcode = postcode.trim().toUpperCase();
  if (!Postcode.isValid(postcode)) return null;
  const result = await query<TerminatedPostcodeTuple>(findQuery, [
    postcode.replace(/\s/g, ""),
  ]);
  if (result.rows.length === 0) return null;
  return result.rows[0];
};

/**
 * Turn terminated postcode data into json object
 */
export const toJson = (
  t: TerminatedPostcodeTuple
): TerminatedPostcodeInterface => {
  return {
    postcode: t.postcode,
    year_terminated: t.year_terminated,
    month_terminated: t.month_terminated,
    longitude: t.longitude,
    latitude: t.latitude,
  };
};

export const seedPostcodes = async (filepath: string) => {
  const ONSPD_COL_MAPPINGS = Object.freeze([
    { column: "postcode", method: (row: RowExtract) => row.extract("pcds") },
    {
      column: "pc_compact",
      method: (row) => row.extract("pcds").replace(/\s/g, ""),
    },
    {
      column: "year_terminated",
      method: (row) => row.extract("doterm").slice(0, 4),
    },
    {
      column: "month_terminated",
      method: (row) => row.extract("doterm").slice(-2),
    },
    { column: "eastings", method: (row) => row.extract("oseast1m") },
    { column: "northings", method: (row) => row.extract("osnrth1m") },
    {
      column: "longitude",
      method: (row) => {
        const eastings = row.extract("oseast1m");
        return eastings === "" ? null : row.extract("long");
      },
    },
    {
      column: "latitude",
      method: (row: RowExtract) => {
        const northings = row.extract("osnrth1m");
        return northings === "" ? null : row.extract("lat");
      },
    },
  ]);

  return methods.csvSeed({
    filepath: [filepath],
    transform: (row: RowExtract) => {
      if (row[0] === "pcd") return null; //ignore header
      if (row[4].length === 0) return null; // Skip if not terminated
      row.extract = (code: string) => extractOnspdVal(row, code); // Append extraction
      return ONSPD_COL_MAPPINGS.map((elem) => elem.method(row));
    },
    columns: ONSPD_COL_MAPPINGS.map((elem) => elem.column),
  });
};

const methods = generateMethods(relation);

export const setupTable = async (filepath: string) => {
  await methods.createRelation();
  await methods.clear();
  await seedPostcodes(filepath);
  await methods.populateLocation();
  await methods.createIndexes();
};

export const TerminatedPostcode = {
  ...methods,
  setupTable,
  seedPostcodes,
  toJson,
  find,
};
