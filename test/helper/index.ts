import { join } from "path";
import { generateMethods, query } from "../../src/app/models/base";
import { getConfig as configFactory } from "../../src/config/config";
import * as AttributeBaseSuite from "./attribute_base.suite";
import * as Base from "../../src/app/models/base";
import { Postcode } from "../../src/app/models/postcode";
import removeDiacritics from "./remove_diacritics";

import { unaccent } from "../../src/app/lib/unaccent";
import * as errors from "../../src/app/lib/errors";
import * as string from "../../src/app/lib/string";
import * as timeout from "../../src/app/lib/timeout";

import app from "../../src/app";

const config = configFactory();

const postcodesioApplication = (cfg?: any) => app(cfg || config);

// Infers columns schema from columnData
const inferSchemaData = (columnData: any) => {
  const columnName = columnData.column_name;
  const collationName = columnData.collation_name;

  let dataType = columnData.data_type;
  if (columnName === "id") {
    dataType = "SERIAL PRIMARY KEY";
  }
  if (dataType === "USER-DEFINED" && columnName === "location") {
    dataType = "GEOGRAPHY(Point, 4326)";
  }
  if (dataType === "USER-DEFINED" && columnName === "bounding_polygon") {
    dataType = "GEOGRAPHY(Polygon, 4326)";
  }
  if (dataType === "integer" || dataType === "double precision") {
    dataType = dataType.toUpperCase();
  }

  if (dataType === "character varying") {
    dataType = `VARCHAR(${columnData.character_maximum_length})`;
  }

  if (collationName) {
    dataType = `${dataType} COLLATE "${collationName}"`;
  }
  return [columnName, dataType];
};

// sort index definition objects by their collumn names
// used to assert equality between infered index definitions and real index definitions
const sortByIndexColumns = (a: any, b: any) => {
  if (a.column === b.column) {
    return Object.keys(b).length - Object.keys(a).length;
  } else {
    return a.column < b.column ? -1 : 1;
  }
};

interface ImpliedIndex {
  unique?: boolean;
  type?: string;
  column?: string;
  opClass?: string;
}

// infers expected definition of javascript object that defines creation of an index
// for #createIndexes method
const inferIndexInfo = (indexDef: any) => {
  const impliedIndex: ImpliedIndex = {};

  if (indexDef.search("UNIQUE") !== -1) {
    impliedIndex.unique = true; //not specified unless is unique
  }

  const strippedDef = indexDef.replace(/.*USING\s/, "");
  const indexType = strippedDef.match(/\w*/)[0];

  if (indexType !== "btree") {
    impliedIndex.type = indexType.toUpperCase(); //not specified unless NOT a btree;
  }

  const indexInfo = strippedDef.match(/\(.*\)/)[0].slice(1, -1);

  const splittedIndexInfo = indexInfo.split(" ");

  impliedIndex.column = splittedIndexInfo[0]; //contains name of an indexed collumn

  if (splittedIndexInfo.length === 2) {
    impliedIndex.opClass = splittedIndexInfo[1]; // if two words, second word specifies
    // operation class, which is always
    // specified explicitly
  }
  return impliedIndex;
};

// Location with nearby postcodes to be used in lonlat test requests
const locationWithNearbyPostcodes = async function () {
  const postcodeWithNearbyPostcodes = "AB14 0LP";
  return Postcode.find(postcodeWithNearbyPostcodes);
};

function getCustomRelation() {
  const schema = {
    id: "serial PRIMARY KEY",
    somefield: "varchar(255)",
  };

  const relation: Base.Relation = {
    relation: `custom${Date.now()}`,
    schema,
    indexes: [],
  };

  return generateMethods(relation);
}

//Generates a random integer from 1 to max inclusive
const getRandom = (max: number) => Math.ceil(Math.random() * max);

const QueryTerminatedPostcode = `
	SELECT
		postcode
	FROM
		terminated_postcodes LIMIT 1
	OFFSET $1
`;

async function randomTerminatedPostcode() {
  const randomId = getRandom(8); // 9 terminated postcodes in the
  // testing database
  const result = await query(QueryTerminatedPostcode, [randomId]);
  return result.rows.length === 0 ? null : result.rows[0];
}

const randomPostcode = async () => {
  const { postcode } = await Postcode.random();
  return postcode;
};

const randomOutcode = async () => {
  const { outcode } = await Postcode.random();
  return outcode;
};

const randomLocation = async () => {
  const { longitude, latitude } = await Postcode.random();
  return { longitude, latitude };
};

const lookupRandomPostcode = async () => {
  return Postcode.random();
};

const seedPaths = {
  customRelation: join(__dirname, "../seed/customRelation.csv"),
};

// Methods
export * from "./setup";
// HTTP Helpers
export * from "./http";
// Type checking methods
export * from "./type_checking";
// PG helper methods
export * from "./pg";
//Models
export * from "../../src/app/models/index";

export {
  // Data
  configFactory,
  config,
  removeDiacritics,
  inferIndexInfo,
  inferSchemaData,
  sortByIndexColumns,
  randomOutcode,
  randomPostcode,
  randomTerminatedPostcode,
  randomLocation,
  getCustomRelation,
  lookupRandomPostcode,
  locationWithNearbyPostcodes,
  // Test suites
  AttributeBaseSuite,
  // Libs
  unaccent,
  errors,
  string,
  timeout,
  seedPaths,
  // Export pcio application factory
  postcodesioApplication,
};
