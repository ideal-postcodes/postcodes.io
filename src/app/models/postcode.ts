import { isValid, validOutcode } from "postcode";
import { Outcode, OutcodeInterface, OutcodeTuple } from "./outcode";
import { QueryResult } from "pg";
import {
  query,
  ForeignColumn,
  RowExtract,
  Relationship,
  getClient,
  generateMethods,
  Relation,
  csvExtractor,
} from "./base";
import QueryStream from "pg-query-stream";
import { getConfig } from "../../config/config";
import { InvalidGeolocationError } from "../lib/errors";

const { defaults } = getConfig();
const extractOnspdVal = csvExtractor(
  require("../../../data/onspd_schema.json")
);

export interface PostcodeInterface {
  postcode: string;
  quality: number;
  eastings: number | null;
  northings: number | null;
  country: string;
  nhs_ha: string | null;
  longitude: number | null;
  latitude: number | null;
  european_electoral_region: string | null;
  primary_care_trust: string | null;
  region: string | null;
  lsoa: string | null;
  msoa: string | null;
  incode: string;
  outcode: string;
  parliamentary_constituency: string | null;
  admin_district: string | null;
  parish: string | null;
  admin_county: string | null;
  admin_ward: string | null;
  ced: string | null;
  ccg: string | null;
  nuts: string | null;
  codes: {
    admin_district: string;
    admin_county: string;
    admin_ward: string;
    parish: string;
    parliamentary_constituency: string;
    ccg: string;
    ccg_id: string;
    ced: string;
    nuts: string;
  };
}

export interface PostcodeTuple {
  id: number;
  postcode: string;
  pc_compact: string;
  quality: number;
  eastings: number;
  northings: number;
  country: string;
  nhs_ha: string;
  admin_county_id: string;
  admin_district_id: string;
  admin_ward_id: string;
  longitude: number;
  latitude: number;
  location: string;
  european_electoral_region: string;
  primary_care_trust: string;
  region: string;
  parish_id: string;
  lsoa: string;
  msoa: string;
  nuts_code: string;
  incode: string;
  outcode: string;
  ccg_code: string;
  ced_id: string;
  ccg_id: string;
  constituency_id: string;
  parliamentary_constituency: string;
  admin_district: string;
  parish: string;
  admin_county: string;
  admin_ward: string;
  ced: string;
  ccg: string;
  nuts: string;
}

const relation: Relation = {
  relation: "postcodes",
  schema: {
    id: "SERIAL PRIMARY KEY",
    postcode: `VARCHAR(10) COLLATE "C"`, // C Provides desirable ordering
    pc_compact: `VARCHAR(9) COLLATE "C"`, // for pc autocomplete & partials
    quality: "INTEGER",
    eastings: "INTEGER",
    northings: "INTEGER",
    country: "VARCHAR(255)",
    nhs_ha: "VARCHAR(255)",
    admin_county_id: "VARCHAR(32)",
    admin_district_id: "VARCHAR(32)",
    admin_ward_id: "VARCHAR(32)",
    longitude: "DOUBLE PRECISION",
    latitude: "DOUBLE PRECISION",
    location: "GEOGRAPHY(Point, 4326)",
    european_electoral_region: "VARCHAR(255)",
    primary_care_trust: "VARCHAR(255)",
    region: "VARCHAR(255)",
    parish_id: "VARCHAR(32)",
    lsoa: "VARCHAR(255)",
    msoa: "VARCHAR(255)",
    nuts_id: "VARCHAR(32)",
    incode: "VARCHAR(5)",
    outcode: "VARCHAR(5)",
    ccg_id: "VARCHAR(32)",
    ced_id: "VARCHAR(32)",
    constituency_id: "VARCHAR(32)",
  },
  indexes: [
    {
      unique: true,
      column: "postcode",
    },
    {
      unique: true,
      column: "pc_compact",
    },
    {
      unique: true,
      column: "pc_compact",
      opClass: "varchar_pattern_ops",
    },
    {
      type: "GIST",
      column: "location",
    },
    {
      column: "outcode",
    },
  ],
};

const methods = generateMethods(relation);

const relationships: Relationship[] = [
  {
    table: "districts",
    key: "admin_district_id",
    foreignKey: "code",
  },
  {
    table: "parishes",
    key: "parish_id",
    foreignKey: "code",
  },
  {
    table: "counties",
    key: "admin_county_id",
    foreignKey: "code",
  },
  {
    table: "wards",
    key: "admin_ward_id",
    foreignKey: "code",
  },
  {
    table: "ceds",
    key: "ced_id",
    foreignKey: "code",
  },
  {
    table: "ccgs",
    key: "ccg_id",
    foreignKey: "code",
  },
  {
    table: "constituencies",
    key: "constituency_id",
    foreignKey: "code",
  },
  {
    table: "nuts",
    key: "nuts_id",
    foreignKey: "code",
  },
];

const joinString: string = Object.freeze(
  relationships
    .map((r) => {
      return `
			LEFT OUTER JOIN ${r.table}
				ON postcodes.${r.key}=${r.table}.${r.foreignKey}
		`;
    })
    .join(" ")
);

const foreignColumns: ForeignColumn[] = [
  {
    field: "constituencies.name",
    as: "parliamentary_constituency",
  },
  {
    field: "districts.name",
    as: "admin_district",
  },
  {
    field: "parishes.name",
    as: "parish",
  },
  {
    field: "counties.name",
    as: "admin_county",
  },
  {
    field: "wards.name",
    as: "admin_ward",
  },
  {
    field: "ceds.name",
    as: "ced",
  },
  {
    field: "ccgs.ccg19cdh",
    as: "ccg_code",
  },
  {
    field: "ccgs.name",
    as: "ccg",
  },
  {
    field: "nuts.name",
    as: "nuts",
  },
  {
    field: "nuts.nuts_code",
    as: "nuts_code",
  },
];

const columnString: string = foreignColumns
  .map((elem) => `${elem.field} as ${elem.as}`)
  .join(",");

const idCache: Record<string, number[]> = {};

const findQuery = `
	SELECT
		postcodes.*, ${columnString}
	FROM
		postcodes
	${joinString}
	WHERE pc_compact=$1
`;

const find = async (postcode: string): Promise<PostcodeTuple | null> => {
  if (postcode == null) postcode = "";
  postcode = postcode.trim().toUpperCase();
  if (isValid(postcode)) return null;
  const result = await query<PostcodeTuple>(findQuery, [
    postcode.replace(/\s/g, ""),
  ]);
  if (result.rows.length === 0) return null;
  return result.rows[0];
};

const loadPostcodeIds = async (outcode?: string): Promise<any> => {
  const client = await getClient();

  const params: string[] = [];
  let countQuery = "SELECT count(id) FROM postcodes";
  let idQuery = "SELECT id FROM postcodes";

  if (outcode !== undefined) {
    countQuery += " WHERE outcode = $1";
    idQuery += " WHERE outcode = $1";
    params.push(outcode.replace(/\s/g, "").toUpperCase());
  }

  let count: number;

  try {
    const result = await client.query<{ count: number }>(countQuery, params);
    count = result.rows[0].count;
    if (count === 0) return null;
  } catch (error) {
    client.release();
    throw error;
  }

  return new Promise((resolve, reject) => {
    let i = 0;
    const idStore = new Array(count);
    client
      .query(new QueryStream(idQuery, params))
      .on("end", () => {
        idCache[outcode] = idStore;
        client.release();
        resolve(idStore);
      })
      .on("error", (error) => {
        client.release();
        reject(error);
      })
      .on("data", (data) => {
        idStore[i] = data.id;
        i++;
      });
  });
};

const random = async (outcode?: string): Promise<PostcodeTuple | null> => {
  let ids = idCache[outcode];
  if (!ids) ids = await loadPostcodeIds(outcode);
  return randomFromIds(ids);
};

const findByIdQuery = `
	SELECT
		postcodes.*, ${columnString}
	FROM
		postcodes
	${joinString}
	WHERE id=$1
`;

// Use an in memory array of IDs to retrieve random postcode
const randomFromIds = async (ids: number[]): Promise<PostcodeTuple> => {
  const length = ids.length;
  const randomId = ids[Math.floor(Math.random() * length)];
  const result = await query<PostcodeTuple>(findByIdQuery, [randomId]);
  if (result.rows.length === 0) return null;
  return result.rows[0];
};

interface SearchOptions {
  limit: string;
  postcode: string;
}

// Parses postcode search options, returns object with limit
const parseSearchOptions = (options: SearchOptions): { limit: number } => {
  let limit = parseInt(options.limit, 10);
  if (isNaN(limit) || limit < 1) limit = defaults.search.limit.DEFAULT;
  if (limit > defaults.search.limit.MAX) limit = defaults.search.limit.MAX;
  return { limit };
};

const whitespaceRe = /\s+/g;

/*
 *	Search for partial/complete postcode matches
 *  Search Methodology below:
 *  1) Check if string is feasible outcode, then search by that outcode
 *  2) Check if string is space separated, then perform space-sensitive search
 *  3) If above fail, perform space-insensitive search
 */
export const search = async (
  options: SearchOptions
): Promise<PostcodeTuple[]> => {
  const postcode = options.postcode.toUpperCase().trim();
  const pcCompact = postcode.replace(whitespaceRe, "");

  // Returns substring matches on postcode
  const extractPartialMatches = (r: PostcodeTuple[]): PostcodeTuple[] =>
    r.filter((p) => p.pc_compact.includes(pcCompact));

  // Parses and formats results, includes:
  // - returns null if empty array
  // - filters for partial postcode matches
  // - if full match detected, only return full match
  const parse = ({ rows }: QueryResult<PostcodeTuple>) => {
    const matches = extractPartialMatches(rows);
    if (matches.length === 0) return null;
    const exactMatches = matches.filter((r) => r.pc_compact === pcCompact);
    if (exactMatches.length > 0) return exactMatches;
    return matches;
  };

  if (validOutcode(postcode)) {
    const r = await searchPostcode({ ...options, query: `${postcode} ` });
    if (extractPartialMatches(r.rows).length > 0) return parse(r);
  }

  if (postcode.match(/^\w+\s+\w+$/)) {
    const r = await searchPostcode({
      ...options,
      query: postcode.split(/\s+/).join(" "),
    });
    if (extractPartialMatches(r.rows).length > 0) return parse(r);
  }

  const result = await searchPcCompact({ ...options, query: postcode });
  return parse(result);
};

interface PrivateSearchOptions extends SearchOptions {
  query: string;
}

const searchQuery = `
	SELECT
		postcodes.*, ${columnString}
	FROM
		postcodes
	${joinString}
	WHERE
		postcode >= $1
	ORDER BY
		postcode ASC
	LIMIT $2
`;

// Space sensitive search for postcode (uses postcode column/btree)
const searchPostcode = async (options: PrivateSearchOptions) => {
  const postcode = options.query;
  const { limit } = parseSearchOptions(options);
  return query<PostcodeTuple>(searchQuery, [postcode, limit]);
};

const pccompactSearchQuery = `
	SELECT
		postcodes.*, ${columnString}
	FROM
		postcodes
	${joinString}
	WHERE
		pc_compact >= $1
	ORDER BY
		pc_compact ASC
	LIMIT $2
`;

// Space insensitive search for postcode (uses pc_compact column/btree)
const searchPcCompact = (options: PrivateSearchOptions) => {
  const postcode = options.query;
  const { limit } = parseSearchOptions(options);
  return query<PostcodeTuple>(pccompactSearchQuery, [postcode, limit]);
};

const nearestPostcodeQuery = `
	SELECT
		postcodes.*,
		ST_Distance(
			location, ST_GeographyFromText('POINT(' || $1 || ' ' || $2 || ')')
		) AS distance,
		${columnString}
	FROM
		postcodes
	${joinString}
	WHERE
		ST_DWithin(
			location, ST_GeographyFromText('POINT(' || $1 || ' ' || $2 || ')'), $3
		)
	ORDER BY
		distance ASC, postcode ASC
	LIMIT $4
`;

interface NearestPostcodeTuple extends PostcodeTuple {
  distance: number;
}

interface NearestPostcodesOptions {
  longitude: string;
  latitude: string;
  limit?: string;
  radius?: string;
  widesearch?: boolean;
  wideSearch?: boolean;
}

const nearestPostcodes = async (
  options: NearestPostcodesOptions
): Promise<NearestPostcodeTuple[]> => {
  const DEFAULT_RADIUS = defaults.nearest.radius.DEFAULT;
  const MAX_RADIUS = defaults.nearest.radius.MAX;
  const DEFAULT_LIMIT = defaults.nearest.limit.DEFAULT;
  const MAX_LIMIT = defaults.nearest.limit.MAX;

  let limit = parseInt(options.limit, 10) || DEFAULT_LIMIT;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  const longitude = parseFloat(options.longitude);
  if (isNaN(longitude)) throw new InvalidGeolocationError();

  const latitude = parseFloat(options.latitude);
  if (isNaN(latitude)) throw new InvalidGeolocationError();

  let radius = options.radius ? parseFloat(options.radius) : DEFAULT_RADIUS;
  if (isNaN(radius)) radius = DEFAULT_RADIUS;
  if (radius > MAX_RADIUS) radius = MAX_RADIUS;
  // If a wideSearch query is requested, derive a suitable range which
  // guarantees postcode results over a much wider area
  if (options.wideSearch || options.widesearch) {
    if (limit > DEFAULT_LIMIT) limit = DEFAULT_LIMIT;
    const maxRange = await deriveMaxRange(options);
    const { rows } = await query<NearestPostcodeTuple>(nearestPostcodeQuery, [
      longitude,
      latitude,
      maxRange,
      limit,
    ]);
    if (rows.length === 0) return null;
    return rows;
  }

  const result = await query<NearestPostcodeTuple>(nearestPostcodeQuery, [
    longitude,
    latitude,
    radius,
    limit,
  ]);
  if (result.rows.length === 0) return null;
  return result.rows;
};

const nearestPostcodeCount = `
	SELECT
		ST_Distance(
			location, ST_GeographyFromText('POINT(' || $1 || ' ' || $2 || ')')
		) AS distance
	FROM
		postcodes
	WHERE
		ST_DWithin(
			location, ST_GeographyFromText('POINT(' || $1 || ' ' || $2 || ')'), $3
		)
	LIMIT $4
`;

const START_RANGE = 500; // 0.5km
const MAX_RANGE = 20000; // 20km
const SEARCH_LIMIT = 10;
const INCREMENT = 1000;

interface QueryBoundOptions extends NearestPostcodesOptions {
  lowerBound?: number;
  upperBound?: number;
}

const deriveMaxRange = async (
  options: NearestPostcodesOptions
): Promise<number> => {
  const queryBound = async (
    { longitude, latitude }: QueryBoundOptions,
    range: number
  ): Promise<number> => {
    const result = await query<NearestPostcodeTuple>(nearestPostcodeCount, [
      longitude,
      latitude,
      range,
      SEARCH_LIMIT,
    ]);
    return result.rowCount;
  };

  const params: QueryBoundOptions = { ...options };

  if (!params.lowerBound) {
    params.lowerBound = START_RANGE;
    const count = await queryBound(params, START_RANGE);
    if (count < SEARCH_LIMIT) return deriveMaxRange(params);
    return params.lowerBound;
  }

  if (!params.upperBound) {
    params.upperBound = MAX_RANGE;
    const count = await queryBound(params, MAX_RANGE);
    if (count === 0) return null;
    return deriveMaxRange(params);
  }

  params.lowerBound += INCREMENT;
  if (params.lowerBound > MAX_RANGE) return null;
  const c = await queryBound(params, params.lowerBound);
  if (c < SEARCH_LIMIT) return deriveMaxRange(params);
  return params.lowerBound;
};

const attributesQuery = [];
attributesQuery.push(`
	array(
		SELECT
			DISTINCT districts.name
		FROM
			postcodes
		LEFT OUTER JOIN
			districts ON postcodes.admin_district_id = districts.code
		WHERE
			outcode=$1 AND districts.name IS NOT NULL
	) as admin_district
`);

attributesQuery.push(`
	array(
		SELECT
			DISTINCT parishes.name
		FROM
			postcodes
		LEFT OUTER JOIN
			parishes ON postcodes.parish_id = parishes.code
		WHERE
			outcode=$1 AND parishes.name IS NOT NULL
	) as parish
`);

attributesQuery.push(`
	array(
		SELECT
			DISTINCT counties.name
		FROM
			postcodes
		LEFT OUTER JOIN
			counties ON postcodes.admin_county_id = counties.code
		WHERE
			outcode=$1 AND counties.name IS NOT NULL
	) as admin_county
`);

attributesQuery.push(`
	array(
		SELECT
			DISTINCT wards.name
		FROM
			postcodes
		LEFT OUTER JOIN
			wards ON postcodes.admin_ward_id = wards.code
		WHERE
			outcode=$1 AND wards.name IS NOT NULL
	) as admin_ward
`);

attributesQuery.push(`
	array(
		SELECT
			DISTINCT country
		FROM
			postcodes
		WHERE
			outcode=$1
	) as country
`);

const outcodeQuery = `
	SELECT
		outcode, avg(northings) as northings, avg(eastings) as eastings,
		avg(ST_X(location::geometry)) as longitude,
		avg(ST_Y(location::geometry)) as latitude,
		${attributesQuery.join(",")}
	FROM
		postcodes
	WHERE
		outcode=$1
	GROUP BY
		outcode
`;

const outcodeAttributes = [
  "admin_district",
  "parish",
  "admin_county",
  "admin_ward",
];

const toArray = (i: string[] | [null]) => {
  if (i.length === 1 && i[0] === null) return [];
  return i;
};

interface OutcodeTupleOutput {
  outcode: string;
  longitude: number | null;
  latitude: number | null;
  northings: number;
  eastings: number;
  admin_district: string[] | [null];
  parish: string[] | [null];
  admin_county: string[] | [null];
  admin_ward: string[] | [null];
  country: string[] | [null];
}

const findOutcode = async (o: string): Promise<OutcodeInterface | null> => {
  const outcode = o.trim().toUpperCase();

  if (validOutcode(outcode) && outcode !== "GIR") return null;

  const { rows } = await query<OutcodeTupleOutput>(outcodeQuery, [outcode]);
  if (rows.length === 0) return null;
  const result = rows[0];
  result.admin_county = toArray(result.admin_county);
  result.admin_district = toArray(result.admin_district);
  result.parish = toArray(result.parish);
  result.admin_ward = toArray(result.admin_ward);
  result.country = toArray(result.country);
  return result;
};

const toJson = function (
  p: PostcodeTuple
): PostcodeInterface | NearestPostcodeTuple {
  return {
    postcode: p.postcode,
    quality: p.quality,
    eastings: p.eastings,
    northings: p.northings,
    country: p.country,
    nhs_ha: p.nhs_ha,
    longitude: p.longitude,
    latitude: p.latitude,
    european_electoral_region: p.european_electoral_region,
    primary_care_trust: p.primary_care_trust,
    region: p.region,
    lsoa: p.lsoa,
    msoa: p.msoa,
    incode: p.incode,
    outcode: p.outcode,
    parliamentary_constituency: p.parliamentary_constituency,
    admin_district: p.admin_district,
    parish: p.parish,
    admin_county: p.admin_county,
    admin_ward: p.admin_ward,
    ced: p.ced,
    ccg: p.ccg,
    nuts: p.nuts,
    codes: {
      admin_district: p.admin_district_id,
      admin_county: p.admin_county_id,
      admin_ward: p.admin_ward_id,
      parish: p.parish_id,
      parliamentary_constituency: p.constituency_id,
      ccg: p.ccg_id,
      ccg_id: p.ccg_code,
      ced: p.ced_id,
      nuts: p.nuts_code,
    },
    // Insert distance if present
    //@ts-ignore
    ...(p.distance !== undefined && { distance: p.distance }),
  };
};

const setupTable = async (filepath: string) => {
  await methods.createRelation();
  await methods.clear();
  await seedPostcodes(filepath);
  await methods.populateLocation();
  await methods.createIndexes();
};

const seedPostcodes = async (filepath: string) => {
  const pcts = require("../../../data/pcts.json");
  const lsoa = require("../../../data/lsoa.json");
  const msoa = require("../../../data/msoa.json");
  const nhsHa = require("../../../data/nhsHa.json");
  const regions = require("../../../data/regions.json");
  const countries = require("../../../data/countries.json");
  const european_registers = require("../../../data/european_registers.json");

  const ONSPD_COL_MAPPINGS = Object.freeze([
    { column: "postcode", method: (row: RowExtract) => row.extract("pcds") },
    {
      column: "pc_compact",
      method: (row) => row.extract("pcds").replace(/\s/g, ""),
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
      method: (row) => {
        const northings = row.extract("osnrth1m");
        return northings === "" ? null : row.extract("lat");
      },
    },
    { column: "country", method: (row) => countries[row.extract("ctry")] },
    { column: "nhs_ha", method: (row) => nhsHa[row.extract("oshlthau")] },
    { column: "admin_county_id", method: (row) => row.extract("oscty") },
    { column: "admin_district_id", method: (row) => row.extract("oslaua") },
    { column: "admin_ward_id", method: (row) => row.extract("osward") },
    { column: "parish_id", method: (row) => row.extract("parish") },
    { column: "quality", method: (row) => row.extract("osgrdind") },
    { column: "constituency_id", method: (row) => row.extract("pcon") },
    {
      column: "european_electoral_region",
      method: (row) => european_registers[row.extract("eer")],
    },
    { column: "region", method: (row) => regions[row.extract("rgn")] },
    { column: "primary_care_trust", method: (row) => pcts[row.extract("pct")] },
    { column: "lsoa", method: (row) => lsoa[row.extract("lsoa11")] },
    { column: "msoa", method: (row) => msoa[row.extract("msoa11")] },
    { column: "nuts_id", method: (row) => row.extract("nuts") },
    { column: "incode", method: (row) => row.extract("pcds").split(" ")[1] },
    { column: "outcode", method: (row) => row.extract("pcds").split(" ")[0] },
    { column: "ced_id", method: (row) => row.extract("ced") },
    { column: "ccg_id", method: (row) => row.extract("ccg") },
  ]);

  await methods.csvSeed({
    filepath: [filepath],
    transform: (row: RowExtract) => {
      row.extract = (code: string) => extractOnspdVal(row, code); // Append csv extraction logic
      if (row.extract("pcd") === "pcd") return null; // Skip if header
      if (row.extract("doterm") && row.extract("doterm").length !== 0)
        return null; // Skip row if terminated
      return ONSPD_COL_MAPPINGS.map((elem) => elem.method(row));
    },
    columns: ONSPD_COL_MAPPINGS.map((elem) => elem.column),
  });
};

export const Postcode = {
  ...methods,
  find,
  random,
  search,
  searchPostcode,
  searchPcCompact,
  deriveMaxRange,
  findOutcode,
  toJson,
  setupTable,
  seedPostcodes,
  nearestPostcodes,
  loadPostcodeIds,
  randomFromIds,
  idCache,
};
