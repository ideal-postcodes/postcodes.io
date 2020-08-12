import {
  ForeignColumn,
  Relationship,
  getClient,
  _csvSeed,
  csvExtractor,
  generateMethods,
  query,
  Relation,
} from "./base";

import { readdirSync, statSync } from "fs";
// @ts-ignore
import OSPoint from "ospoint";
// @ts-ignore
import QueryStream from "pg-query-stream";
import escapeRegex from "escape-string-regexp";
import { unaccent } from "../lib/unaccent";
import { getConfig } from "../../config/config";
const { defaults } = getConfig();
const searchDefaults = defaults.placesSearch;
const nearestDefaults = defaults.placesNearest;
const containsDefaults = defaults.placesContained;

export interface PlaceInterface {
  code: number;
  longitude: number;
  latitude: number;
  eastings: number;
  northings: number;
  min_eastings: number;
  min_northings: number;
  max_eastings: number;
  max_northings: number;
  local_type: string;
  outcode: string;
  name_1: string;
  name_1_lang: string;
  name_2: string;
  name_2_lang: string;
  county_unitary: string;
  county_unitary_type: string;
  district_borough: string;
  district_borough_type: string;
  region: string;
  country: string;
}

interface PlaceTuple extends PlaceInterface {
  id: number;
  location: string;
  bounding_polygon: string;
  name_1_search: string;
  name_1_search_ts: string;
  name_2_search: string;
  name_2_search_ts: string;
}

const schema = {
  id: "SERIAL PRIMARY KEY",
  code: "VARCHAR(255)",
  longitude: "DOUBLE PRECISION",
  latitude: "DOUBLE PRECISION",
  location: "GEOGRAPHY(Point, 4326)",
  eastings: "INTEGER",
  northings: "INTEGER",
  min_eastings: "INTEGER",
  min_northings: "INTEGER",
  max_eastings: "INTEGER",
  max_northings: "INTEGER",
  bounding_polygon: "GEOGRAPHY(Polygon, 4326)",
  local_type: "VARCHAR(128)",
  outcode: "VARCHAR(5)",
  name_1: "VARCHAR(128)",
  name_1_lang: "VARCHAR(10)",
  name_1_search: "VARCHAR(128)",
  name_1_search_ts: "tsvector",
  name_2: "VARCHAR(128)",
  name_2_lang: "VARCHAR(10)",
  name_2_search: "VARCHAR(128)",
  name_2_search_ts: "tsvector",
  county_unitary: "VARCHAR(128)",
  county_unitary_type: "VARCHAR(128)",
  district_borough: "VARCHAR(128)",
  district_borough_type: "VARCHAR(128)",
  region: "VARCHAR(32)",
  country: "VARCHAR(16)",
};

const indexes = [
  {
    unique: true,
    column: "code",
  },
  {
    column: "name_1_search",
    opClass: "varchar_pattern_ops",
  },
  {
    column: "name_1_search_ts",
    type: "GIN",
  },
  {
    column: "name_2_search",
    opClass: "varchar_pattern_ops",
  },
  {
    column: "name_2_search_ts",
    type: "GIN",
  },
  {
    type: "GIST",
    column: "location",
  },
  {
    type: "GIST",
    column: "bounding_polygon",
  },
];

const relation: Relation = {
  relation: "places",
  schema,
  indexes,
};

const methods = generateMethods(relation);

const returnAttributes = `*, ST_AsText(bounding_polygon) AS polygon`;

const findByCodeQuery = `
	SELECT 
		${returnAttributes} 
	FROM 
		places 
	WHERE 
		code=$1
`;

// Return place by `code`
const findByCode = async (code: string): Promise<PlaceTuple | null> => {
  if (typeof code !== "string") return null;
  const result = await query<PlaceTuple>(findByCodeQuery, [code.toLowerCase()]);
  if (result.rowCount === 0) return null;
  return result.rows[0];
};

interface SearchOptions {
  name?: string;
  limit?: number;
}
/**
 * Executes a name search for a place. For now this delegates straight to
 * prefixQuery
 * This method will also:
 * - Check validity inbound query
 * - Format inbound query (e.g. lowercase, replace \' and \-)
 */
const search = async ({
  name,
  limit = searchDefaults.limit.DEFAULT,
}: SearchOptions): Promise<PlaceTuple[] | null> => {
  if (name === undefined) return null;
  if (name.length === 0) return null;

  const searchTerm = name
    .toLowerCase()
    .trim()
    .replace(/'/g, "")
    .replace(/-/g, " ");

  if (limit < 1) limit = searchDefaults.limit.DEFAULT;
  if (limit > searchDefaults.limit.MAX) limit = searchDefaults.limit.MAX;

  const searchOptions = { name: searchTerm, limit };
  const termsResult = await termsSearch(searchOptions);
  if (termsResult !== null) return termsResult;
  // first do terms search, if that fails or does not find anything
  return await prefixSearch(searchOptions);
};

// Replacing postgres unaccent due to indexing issues
// https://stackoverflow.com/questions/28899042/unaccent-preventing-index-usage-in-postgres/28899610#28899610
const searchQuery = `
	SELECT 
		${returnAttributes} 
	FROM
		places 
	WHERE
		name_1_search ~ $1
		OR name_2_search ~ $1
	LIMIT $2
`;

/**
 * Search method which will produce a fast prefix search for places. Inputs are
 * unchecked and so cannot be exposed directly as an HTTP endpoint
 * +ve fast on exact prefix matches (good for autocomplete)
 * +ve fast on exact name matches
 * -ve does not support terms matching (e.g. out of order or missing terms)
 * -ve does not support fuzzy matching (e.g. typos)
 */
const prefixSearch = async (
  options: SearchOptions
): Promise<PlaceTuple[] | null> => {
  const regex = `^${unaccent(escapeRegex(options.name))}.*`;
  const limit = options.limit;
  const result = await query(searchQuery, [regex, limit]);
  if (result.rows.length === 0) return null;
  return result.rows;
};

const termsSearchQuery = `
	SELECT 
		${returnAttributes} 
	FROM
		places
	WHERE
		name_1_search_ts @@ phraseto_tsquery('simple', $1)
		OR name_2_search_ts @@ phraseto_tsquery('simple', $1)
	ORDER BY GREATEST(
		ts_rank_cd(name_1_search_ts, phraseto_tsquery('simple', $1), 1), 
		coalesce(ts_rank_cd(name_2_search_ts, phraseto_tsquery('simple', $1), 1), 0)
	) DESC
	LIMIT $2
`;

/**
 * Search method which will match terms. Inputs are unchecked and so cannot
 * be exposed directly as an HTTP endpoint
 * +ve supports terms matching (e.g. out of order, missing terms, one term misspelt)
 * -ve does not support fuzzy matching (e.g. typos)
 * -ve no partial query matching
 */
const termsSearch = async ({
  name,
  limit,
}: SearchOptions): Promise<PlaceTuple[] | null> => {
  const result = await query(termsSearchQuery, [name, limit]);
  if (result.rows.length === 0) return null;
  return result.rows;
};

let idCache: void | number[];

// Retrieve random place
const random = async (): Promise<PlaceTuple> => {
  if (!idCache) idCache = await loadPlaceIds();
  const result = await loadPlaceIds();
  return randomFromIds(idCache);
};

interface Ids {
  id: number;
}

const loadPlaceIds = async (): Promise<number[]> => {
  const result = await query<Ids>(`SELECT id FROM ${relation.relation}`);
  return result.rows.map((r) => r.id);
};

const findByIdQuery = `
	SELECT 
		${returnAttributes} 
	FROM 
		places 
	WHERE 
		id=$1
`;

const randomFromIds = async (ids: number[]): Promise<PlaceTuple> => {
  const length = ids.length;
  const randomId = ids[Math.floor(Math.random() * length)];
  const result = await query(findByIdQuery, [randomId]);
  if (result.rows.length === 0) return null;
  return result.rows[0];
};

interface PlaceDistanceTuple extends PlaceTuple {
  distance: number;
}

// Returns places that are contained by specified geolocation
const containsQuery = `
	SELECT 
		${returnAttributes}, 
		ST_Distance(
			location, ST_GeographyFromText('POINT(' || $1 || ' ' || $2 || ')')
		) AS distance  
	FROM 
		places 
	WHERE 
		ST_Intersects(
			bounding_polygon,
			ST_GeographyFromText('SRID=4326;POINT(' || $1 || ' ' || $2 || ')')
		) 
	ORDER BY 
		distance ASC
	LIMIT 
		$3 
`;

interface ContainsOptions {
  longitude: string;
  latitude: string;
  limit?: string;
}

const contains = async (
  options: ContainsOptions
): Promise<PlaceDistanceTuple[] | null> => {
  const longitude = parseFloat(options.longitude);
  if (isNaN(longitude)) throw new Error("Invalid longitude");

  const latitude = parseFloat(options.latitude);
  if (isNaN(latitude)) throw new Error("Invalid latitude");

  let limit = parseInt(options.limit, 10) || containsDefaults.limit.DEFAULT;
  if (limit > containsDefaults.limit.MAX)
    limit = containsDefaults.limit.DEFAULT;

  const result = await query<PlaceDistanceTuple>(containsQuery, [
    longitude,
    latitude,
    limit,
  ]);
  if (result.rows.length === 0) return null;
  return result.rows;
};

// Returns nearest places with polygons that intersect geolocation incl. radius
const nearestQuery = `
	SELECT 
		${returnAttributes}, 
		ST_Distance(
			bounding_polygon, ST_GeographyFromText('POINT(' || $1 || ' ' || $2 || ')')
		) AS distance 
	FROM 
		places 
	WHERE 
		ST_DWithin(
			bounding_polygon, ST_GeographyFromText('POINT(' || $1 || ' ' || $2 || ')'), $3
		) 
	ORDER BY 
		distance ASC, name_1 ASC 
	LIMIT $4 
`;

interface NearestOptions extends ContainsOptions {
  radius?: string;
}

const nearest = async (
  options: NearestOptions
): Promise<PlaceDistanceTuple[] | null> => {
  const longitude = parseFloat(options.longitude);
  if (isNaN(longitude)) throw new Error("Invalid longitude");

  const latitude = parseFloat(options.latitude);
  if (isNaN(latitude)) new Error("Invalid latitude");

  let limit = parseInt(options.limit, 10) || nearestDefaults.limit.DEFAULT;
  if (limit > nearestDefaults.limit.MAX) limit = nearestDefaults.limit.DEFAULT;

  let radius = parseFloat(options.radius) || nearestDefaults.radius.DEFAULT;
  if (radius > nearestDefaults.radius.MAX) radius = nearestDefaults.radius.MAX;

  const result = await query<PlaceDistanceTuple>(nearestQuery, [
    longitude,
    latitude,
    radius,
    limit,
  ]);
  if (result.rows.length === 0) return null;
  return result.rows;
};

const toJson = (place: PlaceTuple): PlaceInterface => {
  return {
    code: place.code,
    name_1: place.name_1,
    name_1_lang: place.name_1_lang,
    name_2: place.name_2,
    name_2_lang: place.name_2_lang,
    local_type: place.local_type,
    outcode: place.outcode,
    county_unitary: place.county_unitary,
    county_unitary_type: place.county_unitary_type,
    district_borough: place.district_borough,
    district_borough_type: place.district_borough_type,
    region: place.region,
    country: place.country,
    longitude: place.longitude,
    latitude: place.latitude,
    eastings: place.eastings,
    northings: place.northings,
    min_eastings: place.min_eastings,
    min_northings: place.min_northings,
    max_eastings: place.max_eastings,
    max_northings: place.max_northings,
  };
};

const csvColumns = {
  code: 0,
  names_uri: 1,
  name_1: 2,
  name_1_lang: 3,
  name_2: 4,
  name_2_lang: 5,
  type: 6,
  local_type: 7,
  eastings: 8,
  northings: 9,
  most_detail_view_res: 10,
  least_detail_view_res: 11,
  min_eastings: 12,
  min_northings: 13,
  max_eastings: 14,
  max_northings: 15,
  outcode: 16,
  postcode_district_uri: 17,
  populated_place: 18,
  populated_place_uri: 19,
  populated_place_type: 20,
  district_borough: 21,
  district_borough_uri: 22,
  district_borough_type: 23,
  county_unitary: 24,
  county_unitary_uri: 25,
  county_unitary_type: 26,
  region: 27,
  region_uri: 28,
  country: 29,
  country_uri: 30,
  related_spatial_object: 31,
  same_as_dbpedia: 32,
  same_as_geonames: 33,
};

// Populates places table given OS data directory
const setupTable = async (directory: string) => {
  await query("CREATE EXTENSION IF NOT EXISTS unaccent");
  await methods.createRelation();
  await methods.clear();
  await seedData(directory);
  await populateLocation();
  await generateSearchFields();
  await generateTsSearchFields();
  await methods.createIndexes();
};

// Pipe OS places data into places table
const seedData = async (directory: string) => {
  if (!statSync(directory).isDirectory())
    throw new Error("Data directory should be supplied for OS places update");

  const typeIndex = csvColumns.type;
  const columnWhitelist = [
    "id",
    "location",
    "bounding_polygon",
    "name_1_search",
    "name_1_search_ts",
    "name_2_search",
    "name_2_search_ts",
  ];
  const columns = Object.keys(relation.schema).filter(
    (col) => columnWhitelist.indexOf(col) === -1
  );

  const typeRegex = /^.*\//;
  const parseOsgb = (val: string) => parseInt(val, 10) || "";
  const transformExceptions = {
    northings: parseOsgb,
    eastings: parseOsgb,
    min_eastings: parseOsgb,
    min_northings: parseOsgb,
    max_eastings: parseOsgb,
    max_northings: parseOsgb,
    county_unitary_type: (val: string) => val.replace(typeRegex, ""),
    district_borough_type: (val: string) => val.replace(typeRegex, ""),
  };

  const transform = (row: string[]) => {
    // Skip if not a "place"
    if (row[typeIndex] !== "populatedPlace") return null;
    const northings = row[csvColumns.northings];
    const eastings = row[csvColumns.eastings];
    let location: any;
    if (northings.length * eastings.length === 0) {
      location = {
        longitude: "",
        latitude: "",
      };
    } else {
      location = new OSPoint("" + northings, "" + eastings).toWGS84();
    }
    return columns.map((colName: string) => {
      if (colName === "latitude") return location.latitude;
      if (colName === "longitude") return location.longitude;
      //@ts-ignore
      const columnIndex = csvColumns[colName];
      const value = row[columnIndex];
      //@ts-ignore
      const exception = transformExceptions[colName];
      return exception ? exception(value) : value;
    });
  };

  const files = readdirSync(directory)
    .filter((f: string) => f.match(/\.csv$/))
    .map((f: string) => `${directory}${f}`);
  return methods.csvSeed({ filepath: files, transform, columns });
};

// Generates folded search fields name_*_search
const generateSearchFields = async () => {
  const updates = ["name_1", "name_2"].map((field) =>
    query(`
      UPDATE 
        ${relation.relation} 
      SET 
        ${field}_search=replace(
          replace(
            lower(
              unaccent(${field})
            ), 
          '-', ' ')
        , '''', '')
    `)
  );
  return Promise.all(updates);
};

const generateTsSearchFields = async () => {
  const updates = ["name_1", "name_2"].map((field) =>
    query(`
      UPDATE 
        ${relation.relation} 
      SET 
        ${field}_search_ts=to_tsvector('simple', ${field})
    `)
  );
  return Promise.all(updates);
};

const generatePolygonQuery = (place: PlaceTuple): string => {
  const locations = [];
  if (
    place.min_eastings *
      place.min_northings *
      place.max_eastings *
      place.max_northings ===
    0
  )
    return;
  const initialLocation = new OSPoint(
    "" + place.min_northings,
    "" + place.min_eastings
  ).toWGS84();
  locations.push(initialLocation);
  locations.push(
    new OSPoint("" + place.max_northings, "" + place.min_eastings).toWGS84()
  );
  locations.push(
    new OSPoint("" + place.max_northings, "" + place.max_eastings).toWGS84()
  );
  locations.push(
    new OSPoint("" + place.min_northings, "" + place.max_eastings).toWGS84()
  );
  locations.push(initialLocation);
  return `
						UPDATE 
							${relation.relation} 
						SET 
							bounding_polygon=ST_GeogFromText('SRID=4326;
							POLYGON((${locations.map((l) => `${l.longitude} ${l.latitude}`).join(",")}))') 
						WHERE 
							id=${place.id} 
					`;
};

const createPolygons = () => {
  return new Promise(async (resolve, reject) => {
    const client = await getClient();
    const updateBuffer: string[] = [];
    const cleanup = (error: any) => {
      client.release();
      throw error;
    };

    const drainBuffer = async (done?: boolean) => {
      stream.pause();
      for (const update of updateBuffer) {
        await query(update);
      }
      updateBuffer.length = 0;
      if (stream.isPaused()) stream.resume();
      if (done) {
        client.release();
        resolve();
      }
    };

    const streamQuery = new QueryStream(`
      SELECT 
        id, min_eastings, min_northings, max_eastings, max_northings 
      FROM 
        ${relation.relation}
    `);

    const stream = client.query(streamQuery);
    stream
      .on("data", (place: PlaceTuple) => {
        updateBuffer.push(generatePolygonQuery(place));
        if (updateBuffer.length > 1000) drainBuffer();
      })
      .on("error", cleanup)
      .on("end", () => drainBuffer(true));
  });
};

const createLocations = async () =>
  query(`
    UPDATE 
      ${relation.relation} 
    SET 
      location=ST_GeogFromText(
        'SRID=4326;POINT(' || longitude || ' ' || latitude || ')'
      ) 
    WHERE 
      northings!=0 
      AND eastings!=0
  `);

// Generates location data including centroid and bounding box
const populateLocation = async () => {
  await createPolygons();
  await createLocations();
};

export const Place = {
  ...methods,
  populateLocation,
  seedData,
  setupTable,
  toJson,
  contains,
  random,
  search,
  findByCode,
  nearest,
  prefixSearch,
  termsSearch,
};
