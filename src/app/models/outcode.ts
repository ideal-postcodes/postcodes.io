import { generateMethods, query } from "./base";
import { Postcode } from "./postcode";
import Config from "../../config/config";
const { defaults } = Config();

export interface OutcodeTuple extends OutcodeInterface {
  id: number;
  location: string;
}

export interface OutcodeInterface {
  outcode: string;
  longitude: number | null;
  latitude: number | null;
  northings: number;
  eastings: number;
  admin_district: string[];
  parish: string[];
  admin_county: string[];
  admin_ward: string[];
  country: string[];
}

const relation = {
  relation: "outcodes",
  schema: {
    id: "SERIAL PRIMARY KEY",
    outcode: "VARCHAR(5)",
    longitude: "DOUBLE PRECISION",
    latitude: "DOUBLE PRECISION",
    location: "GEOGRAPHY(Point, 4326)",
    northings: "INTEGER",
    eastings: "INTEGER",
    admin_district: "VARCHAR(255)[]",
    parish: "VARCHAR(255)[]",
    admin_county: "VARCHAR(255)[]",
    admin_ward: "VARCHAR(255)[]",
    country: "VARCHAR(255)[]",
  },
  indexes: [
    {
      unique: true,
      column: "outcode",
    },
    {
      type: "GIST",
      column: "location",
    },
  ],
};

const methods = generateMethods(relation);

const seedData = async () => {
  const { rows } = await query<{ outcode: string }>(
    "SELECT DISTINCT outcode FROM postcodes"
  );
  for (const { outcode } of rows) {
    const o = await Postcode.findOutcode(outcode);
    if (o === null) continue;
    await methods.create<Omit<OutcodeTuple, "id" | "location">>({
      ...o,
      northings: Math.round(o.northings),
      eastings: Math.round(o.eastings),
    });
  }
};

const setupTable = async () => {
  await methods.destroyRelation();
  await methods.createRelation();
  await seedData();
  await methods.populateLocation();
  await methods.createIndexes();
};

const find = async (outcode?: string): Promise<OutcodeTuple | null> => {
  if (!outcode) return null;
  const result = await query(
    `SELECT * FROM ${relation.relation} WHERE outcode=$1`,
    [outcode.toUpperCase().replace(/\s/g, "")]
  );
  if (result.rows.length === 0) return null;
  return result.rows[0];
};

const toJson = (o: OutcodeTuple): OutcodeInterface => {
  return {
    outcode: o.outcode,
    longitude: o.longitude,
    latitude: o.latitude,
    northings: o.northings,
    eastings: o.eastings,
    admin_district: o.admin_district,
    parish: o.parish,
    admin_county: o.admin_county,
    admin_ward: o.admin_ward,
    country: o.country,
  };
};

interface NearestOptions {
  longitude: string;
  latitude: string;
  limit?: string;
  radius?: string;
}

const nearest = async (params: NearestOptions) => {
  const DEFAULT_RADIUS = defaults.nearestOutcodes.radius.DEFAULT;
  const MAX_RADIUS = defaults.nearestOutcodes.radius.MAX;
  const DEFAULT_LIMIT = defaults.nearestOutcodes.limit.DEFAULT;
  const MAX_LIMIT = defaults.nearestOutcodes.limit.MAX;

  let limit = parseInt(params.limit, 10) || DEFAULT_LIMIT;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  const longitude = parseFloat(params.longitude);
  if (isNaN(longitude)) throw new Error("Invalid longitude");

  const latitude = parseFloat(params.latitude);
  if (isNaN(latitude)) throw new Error("Invalid latitude");

  let radius = parseFloat(params.radius) || DEFAULT_RADIUS;
  if (radius > MAX_RADIUS) radius = MAX_RADIUS;

  const nearestOutcodeQuery = `
		SELECT 
			*, 
			ST_Distance(
				location, ST_GeographyFromText('POINT(' || $1 || ' ' || $2 || ')')
			) AS distance 
		FROM 
			${relation.relation} 
		WHERE 
			ST_DWithin(
				location, ST_GeographyFromText('POINT(' || $1 || ' ' || $2 || ')')
			, $3) 
		ORDER BY distance 
		LIMIT $4
	`;

  const result = await query(nearestOutcodeQuery, [
    longitude,
    latitude,
    radius,
    limit,
  ]);
  if (result.rows.length === 0) return null;
  return result.rows;
};

export const Outcode = {
  ...methods,
  nearest,
  toJson,
  find,
  setupTable,
  seedData,
};
