import { generateBoudariesMethods, Seed, Locality } from "../boundaries_base";

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

export interface CeremonialCountiesRegions extends Locality {
  description: string;
}

export const CeremonialCountiesRegion = generateBoudariesMethods<CeremonialCountiesRegions>(
  relation,
  feed
);
