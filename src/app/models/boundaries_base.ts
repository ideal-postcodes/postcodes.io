import { query, generateMethods, Relation } from "./base";

export interface Seed {
  seedFile: string;
  columns: string[];
}

const inBoundary = (relation: Relation) => (lng: string, lat: string) => {
  const columns = Object.keys(relation.schema);
  console.log(
    `SELECT id, name, description, ST_AsGeoJSON(geom) FROM ${
      relation.relation
    } WHERE ST_Intersects(geom, ST_Point(${lng}, ${lat})) AS t(${columns.join(
      ","
    )});`
  );
  return query(
    `SELECT id, name, description, ST_AsGeoJSON(geom) FROM ${relation.relation} WHERE ST_Intersects(geom, ST_Point("${lng}", "${lat}"));`
  );
};

interface Count {
  count: string;
}

const count = ({ relation }: Relation) => async (): Promise<number> => {
  const result = await query<Count>(`SELECT count(*) FROM ${relation};`);
  return parseInt(result.rows[0].count, 10);
};

const version = async () => query("SELECT PostGIS_version();");

//TODO come up with return interface to keep some consistency
export const generateBoudariesMethods = (relation: Relation, feed: Seed) => {
  const methods = generateMethods(relation);
  const seed = async (filePathOverride?: string) => {
    const { seedFile, columns } = feed;
    const filepath = filePathOverride || seedFile;
    methods.csvSeed({
      filepath: [filepath],
      // TODO check if we need to add tranform
      columns,
    });
  };
  const setupTable = async (filePathOverride?: string) => {
    await methods.createRelation();
    await methods.clear();
    await seed(filePathOverride);
    await methods.createIndexes();
  };

  return {
    ...methods,
    //add override methods
    setupTable,
    inBoundary: inBoundary(relation),
    count: count(relation),
    version,
  };
};
