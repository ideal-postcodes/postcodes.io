import { isValid, validOutcode } from "postcode";
import { createInterface } from "readline";
import { QueryResult } from "pg";
import { createReadStream } from "fs";
import { from } from "pg-copy-streams";
import { parse } from "@fast-csv/parse";
import { format } from "@fast-csv/format";
import { OutcodeInterface } from "./outcode";
import { query, getClient, generateMethods, Relation, pool } from "./base";
import QueryStream from "pg-query-stream";
import { getConfig } from "../../config/config";
import {
  InvalidGeolocationError,
  InvalidLimitError,
  InvalidRadiusError,
} from "../lib/errors";

const { defaults } = getConfig();

export interface PostcodeInterface {
  postcode: string;
  quality: number;
  eastings: number | null;
  northings: number | null;
  country: string;
  nhs_ha: string | null;
  date_of_introduction: string;
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
  pfa: string | null;
  codes: {
    admin_district: string;
    admin_county: string;
    admin_ward: string;
    parish: string;
    parliamentary_constituency: string;
    ccg: string | null;
    ccg_id: string;
    ced: string;
    nuts: string;
    lsoa: string | null;
    msoa: string | null;
    lau2: string | null;
    pfa: string | null;
  };
}

export interface PostcodeTuple {
  id: number;
  local_enterprise_partnership: string | null;
  local_enterprise_partnership_2: string | null;
  police_force_area: string | null;
  cancer_alliance: string | null;
  integrated_care_board_id: string | null;
  integrated_care_board: string | null;
  census_lsoa_2021: string | null;
  census_msoa_2021: string | null;
  county: string | null;
  county_electoral_division: string | null;
  ward: string | null;
  parish: string | null;
  health_area: string | null;
  nhs_er: string | null;
  country: string | null;
  region: string | null;
  standard_statistical_region: string | null;
  constituency: string | null;
  european_electoral_region: string | null;
  local_learning: string | null;
  travel_to_work_area: string | null;
  primary_care_trust: string | null;
  international_territorial_level: string | null;
  international_territorial_level_id: string | null;
  statistical_ward_2005: string | null;
  census_area_statistics: string | null;
  national_park: string | null;
  census_lsoa_2001: string | null;
  census_msoa_2001: string | null;
  census_oac_2001_supergroup: string | null;
  census_oac_2001_group: string | null;
  census_oac_2001_subgroup: string | null;
  census_oac_2011_supergroup: string | null;
  census_oac_2011_group: string | null;
  census_oac_2011_subgroup: string | null;
  local_authority: string | null;
  census_lsoa_2011: string | null;
  census_msoa_2011: string | null;
  ccg_id: string | null;
  ccg: string | null;
  built_up_area: string | null;
  built_up_area_subdivision: string | null;
  postcode: string;
  pc_compact: string;
  outcode: string;
  postcode_7: string;
  postcode_8: string;
  postcode_var: string;
  date_of_introduction: string;
  date_of_termination: string | null;
  county_code: string | null;
  county_electoral_division_code: string | null;
  local_authority_code: string | null;
  ward_code: string | null;
  parish_code: string | null;
  postcode_user: string | null;
  eastings: number | null;
  northings: number | null;
  positional_quality: number | null;
  health_area_code: string | null;
  nhs_er_code: string | null;
  country_code: string | null;
  region_code: string | null;
  standard_statistical_region_code: string | null;
  constituency_code: string | null;
  european_electoral_region_code: string | null;
  local_learning_code: string | null;
  travel_to_work_area_code: string | null;
  primary_care_trust_code: string | null;
  international_territorial_level_code: string | null;
  statistical_ward_2005_code: string | null;
  census_output_area_2001_code: string | null;
  census_area_statistics_code: string | null;
  national_park_code: string | null;
  census_lsoa_2001_code: string | null;
  census_msoa_2001_code: string | null;
  census_urban_rural_indicator_2001_code: string | null;
  census_oac_2001_code: string | null;
  census_oa_2011_code: string | null;
  census_lsoa_2011_code: string | null;
  census_msoa_2011_code: string | null;
  census_wz_2011_code: string | null;
  ccg_code: string | null;
  built_up_area_code: string | null;
  built_up_area_subdivision_code: string | null;
  census_urban_rural_indicator_2011_code: string | null;
  census_oac_2011_code: string | null;
  latitude: number;
  longitude: number;
  local_enterprise_partnership_code: string | null;
  local_enterprise_partnership_2_code: string | null;
  police_force_area_code: string | null;
  index_of_multiple_deprivation: number | null;
  cancer_alliance_code: string | null;
  integrated_care_board_code: string | null;
  census_oa_2021_code: string | null;
  census_lsoa_2021_code: string | null;
  census_msoa_2021_code: string | null;
  location: string | null;
}

export const relation: Relation = {
  relation: "postcodes",
  schema: {
    id: "SERIAL PRIMARY KEY",
    location: "GEOGRAPHY(Point, 4326)",
    postcode: `VARCHAR(10) COLLATE "C"`, // C Provides desirable ordering
    pc_compact: `VARCHAR(9) COLLATE "C"`, // for pc autocomplete & partials
    local_enterprise_partnership: "text",
    local_enterprise_partnership_2: "text",
    police_force_area: "text",
    cancer_alliance: "text",
    integrated_care_board_id: "text",
    integrated_care_board: "text",
    census_lsoa_2021: "text",
    census_msoa_2021: "text",
    county: "text",
    county_electoral_division: "text",
    ward: "text",
    parish: "text",
    health_area: "text",
    nhs_er: "text",
    country: "text",
    region: "text",
    standard_statistical_region: "text",
    constituency: "text",
    european_electoral_region: "text",
    local_learning: "text",
    travel_to_work_area: "text",
    primary_care_trust: "text",
    international_territorial_level: "text",
    international_territorial_level_id: "text",
    statistical_ward_2005: "text",
    census_area_statistics: "text",
    national_park: "text",
    census_lsoa_2001: "text",
    census_msoa_2001: "text",
    census_oac_2001_supergroup: "text",
    census_oac_2001_group: "text",
    census_oac_2001_subgroup: "text",
    census_oac_2011_supergroup: "text",
    census_oac_2011_group: "text",
    census_oac_2011_subgroup: "text",
    local_authority: "text",
    census_lsoa_2011: "text",
    census_msoa_2011: "text",
    ccg_id: "text",
    ccg: "text",
    built_up_area: "text",
    built_up_area_subdivision: "text",
    outcode: "text",
    postcode_7: "text",
    postcode_8: "text",
    postcode_var: "text",
    date_of_introduction: "text",
    date_of_termination: "text",
    county_code: "text",
    county_electoral_division_code: "text",
    local_authority_code: "text",
    ward_code: "text",
    parish_code: "text",
    postcode_user: "text",
    eastings: "INTEGER",
    northings: "INTEGER",
    positional_quality: "INTEGER",
    health_area_code: "text",
    nhs_er_code: "text",
    country_code: "text",
    region_code: "text",
    standard_statistical_region_code: "text",
    constituency_code: "text",
    european_electoral_region_code: "text",
    local_learning_code: "text",
    travel_to_work_area_code: "text",
    primary_care_trust_code: "text",
    international_territorial_level_code: "text",
    statistical_ward_2005_code: "text",
    census_output_area_2001_code: "text",
    census_area_statistics_code: "text",
    national_park_code: "text",
    census_lsoa_2001_code: "text",
    census_msoa_2001_code: "text",
    census_urban_rural_indicator_2001_code: "text",
    census_oac_2001_code: "text",
    census_oa_2011_code: "text",
    census_lsoa_2011_code: "text",
    census_msoa_2011_code: "text",
    census_wz_2011_code: "text",
    ccg_code: "text",
    built_up_area_code: "text",
    built_up_area_subdivision_code: "text",
    census_urban_rural_indicator_2011_code: "text",
    census_oac_2011_code: "text",
    latitude: "DOUBLE PRECISION",
    longitude: "DOUBLE PRECISION",
    local_enterprise_partnership_code: "text",
    local_enterprise_partnership_2_code: "text",
    police_force_area_code: "text",
    index_of_multiple_deprivation: "INTEGER",
    cancer_alliance_code: "text",
    integrated_care_board_code: "text",
    census_oa_2021_code: "text",
    census_lsoa_2021_code: "text",
    census_msoa_2021_code: "text",
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

const idCache: Record<string, number[]> = {};

const findQuery = `SELECT postcodes.* FROM postcodes WHERE pc_compact=$1`;

const find = async (postcode: string): Promise<PostcodeTuple | null> => {
  if (postcode == null) postcode = "";
  postcode = postcode.trim().toUpperCase();
  if (!isValid(postcode)) return null;
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
  if (outcode) {
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

const findByIdQuery = `SELECT postcodes.* FROM postcodes WHERE id=$1`;

// Use an in memory array of IDs to retrieve random postcode
const randomFromIds = async (ids: number[]): Promise<PostcodeTuple> => {
  const length = ids.length;
  const randomId = ids[Math.floor(Math.random() * length)];
  const result = await query<PostcodeTuple>(findByIdQuery, [randomId]);
  if (result.rows.length === 0) return null;
  return result.rows[0];
};

interface SearchOptions {
  limit?: string;
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
		postcodes.*
	FROM
		postcodes
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
		postcodes.*
	FROM
		postcodes
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
		) AS distance
	FROM
		postcodes
	WHERE
		ST_DWithin(
			location, ST_GeographyFromText('POINT(' || $1 || ' ' || $2 || ')'), $3
		)
	ORDER BY
		distance ASC, postcode ASC
	LIMIT $4
`;

export interface NearestPostcodeTuple extends PostcodeTuple {
  distance: number;
}

export interface NearestPostcodesOptions {
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

  let limit = DEFAULT_LIMIT;
  if (options.limit) {
    limit = parseInt(options.limit, 10);
    if (isNaN(limit)) throw new InvalidLimitError();
  }

  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  const longitude = parseFloat(options.longitude);
  if (isNaN(longitude)) throw new InvalidGeolocationError();

  const latitude = parseFloat(options.latitude);
  if (isNaN(latitude)) throw new InvalidGeolocationError();

  let radius = DEFAULT_RADIUS;
  if (options.radius) {
    radius = parseFloat(options.radius);
    if (isNaN(radius)) throw new InvalidRadiusError();
  }
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

const outcodeQuery = `
	SELECT
		outcode, avg(northings) as northings, avg(eastings) as eastings,
		avg(ST_X(location::geometry)) as longitude,
		avg(ST_Y(location::geometry)) as latitude,
    array_remove(array_agg(local_authority), NULL) as admin_district,
    array_remove(array_agg(parish), NULL) as parish,
    array_remove(array_agg(county), NULL) as admin_county,
    array_remove(array_agg(ward), NULL) as admin_ward,
    array_remove(array_agg(country), NULL) as country,
    array_remove(array_agg(constituency), NULL) as parliamentary_constituency
	FROM
		postcodes
	WHERE
		outcode=$1
	GROUP BY
		outcode
`;

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
  parliamentary_constituency: string[] | [null];
}

const findOutcode = async (o: string): Promise<OutcodeInterface | null> => {
  const outcode = o.trim().toUpperCase();

  if (!validOutcode(outcode) && outcode !== "GIR") return null;

  const { rows } = await query<OutcodeTupleOutput>(outcodeQuery, [outcode]);
  if (rows.length === 0) return null;
  const result = rows[0];
  result.admin_county = toArray(result.admin_county);
  result.admin_district = toArray(result.admin_district);
  result.parish = toArray(result.parish);
  result.admin_ward = toArray(result.admin_ward);
  result.country = toArray(result.country);
  result.parliamentary_constituency = toArray(
    result.parliamentary_constituency
  );
  return result;
};

const toJson = function (
  p: PostcodeTuple
): PostcodeInterface | NearestPostcodeTuple {
  //@ts-ignore
  return {
    postcode: p.postcode,
    quality: p.positional_quality,
    eastings: p.eastings,
    northings: p.northings,
    country: p.country,
    nhs_ha: p.nhs_er,
    longitude: p.longitude,
    latitude: p.latitude,
    european_electoral_region: p.european_electoral_region,
    primary_care_trust: p.primary_care_trust,
    region: p.region,
    lsoa: p.census_lsoa_2011,
    msoa: p.census_msoa_2011,
    incode: p.postcode.replace(/^.*\s+/, "").trim(),
    outcode: p.outcode,
    parliamentary_constituency: p.constituency,
    admin_district: p.local_authority,
    parish: p.parish,
    admin_county: p.county,
    date_of_introduction: p.date_of_introduction,
    admin_ward: p.ward,
    ced: p.county_electoral_division,
    ccg: p.ccg,
    nuts: p.international_territorial_level,
    pfa: p.police_force_area,
    codes: {
      admin_district: p.local_authority_code,
      admin_county: p.county_code,
      admin_ward: p.ward_code,
      parish: p.parish_code,
      parliamentary_constituency: p.constituency_code,
      ccg: p.ccg_id,
      ccg_id: p.ccg_code,
      ced: p.county_electoral_division_code,
      nuts: p.international_territorial_level_code,
      lsoa: p.census_lsoa_2021_code,
      msoa: p.census_msoa_2021_code,
      lau2: p.international_territorial_level_id,
      pfa: p.police_force_area_code,
    },
    // Insert distance if present
    // @ts-ignore
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

export const firstLine = async (filepath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const input = createReadStream(filepath);
    // Create a readline interface
    const rl = createInterface({ input, crlfDelay: Infinity });
    // Read the first line
    rl.once("line", (line) => {
      // Close the readline interface and file stream
      rl.close();
      input.close();
      resolve(line);
    });
    rl.on("error", (err) => {
      reject(err);
    });
  });
};

const seedPostcodes = async (filepath: string) => {
  const headers = await firstLine(filepath);
  const q = `COPY ${relation.relation} (${headers}) FROM STDIN DELIMITER ',' CSV HEADER`;
  const client = await pool.connect();
  const pgStream = client.query(from(q));
  const parser = parse<PostcodeTuple, PostcodeTuple>({
    headers: true,
  });

  return new Promise((resolve, reject) => {
    createReadStream(filepath, { encoding: "utf8" })
      .pipe(parser)
      .pipe(format())
      .transform((row: PostcodeTuple): PostcodeTuple | null => {
        if (row.date_of_termination !== "") return null;
        if (row.eastings === null) {
          row.longitude = null;
          row.latitude = null;
        }
        return row;
      })
      .pipe(pgStream)
      .on("finish", () => resolve(undefined))
      .on("error", (err: any) => reject(err));
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
