import { generateBoudariesMethods, Seed } from "../boundaries_base";
import { Relation, query } from "../base";

const seedFile = "boundary_line_ceremonial_counties_region";
const feed: Seed = {
  seedFile,
  columns: ["name", "description", "geom"],
};

const relation: Relation = {
  relation: "ceremonial_counties_region",
  schema: {
    id: "SERIAL PRIMARY KEY",
    name: "VARCHAR(255)",
    description: "VARCHAR(255)",
    geom: "GEOMETRY",
  },
  indexes: [
    {
      unique: true,
      column: "name",
    },
    {
      type: "GIST",
      column: "geom",
    },
  ],
};

export interface CeremonialCountiesRegions {
  id: number;
  name: string;
  description: string;
  geom: string; //TODO check if we have string or other data type in this case for queries return
}

const first = async (): Promise<CeremonialCountiesRegions> => {
  console.log(
    `SELECT name, description, ST_AsGeoJSON(ST_Transform(geom,4326))::json AS feature FROM ${relation.relation} LIMIT 1 OFFSET 0;`
  );
  const result = await query<CeremonialCountiesRegions>(
    `SELECT name, description, ST_AsGeoJSON(ST_Transform(geom,4326))::json AS feature FROM ${relation.relation} LIMIT 1 OFFSET 0;`
  );
  return result.rows[0];
};

const methods = generateBoudariesMethods(relation, feed);

export const CeremonialCountiesRegion = {
  ...methods,
  first,
};
