import { query, generateMethods, Relation } from "./base";

const RETURN_GEOJSON = process.env.RETURN_GEOJSON || false;

export interface Seed {
  seedFile: string;
  columns: string[];
}

export interface Locality {
  id: number;
  name: string;
  geom?: string;
}

export interface Location {
  lng: string;
  lat: string;
}

const inBoundary = <T>(relation: Relation) => ({
  lng,
  lat,
}: Location): Promise<T[]> => {
  let idx;
  const columns = Object.keys(relation.schema);
  const geom = columns.filter((value, index) => {
    if (value === "geom") {
      idx = index;
      return true;
    }
    return false;
  });
  if (RETURN_GEOJSON) {
    if (idx) columns[idx] = `ST_AsGeoJSON(${geom[0]}) AS geom`;
  } else {
    columns.splice(idx, 1);
  }
  return query(
    `SELECT ${columns.join(", ")} FROM ${
      relation.relation
    } WHERE ST_Within(ST_GeomFromText('SRID=4326;POINT(${lng} ${lat})'), geom);`
  ).then((result) => {
    return result.rows;
  });
};

interface Count {
  count: string;
}

const count = ({ relation }: Relation) => async (): Promise<number> => {
  const result = await query<Count>(`SELECT count(*) FROM ${relation};`);
  return parseInt(result.rows[0].count, 10);
};

//TODO come up with return interface to keep some consistency
export const generateBoudariesMethods = <T>(relation: Relation, feed: Seed) => {
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
    inBoundary: inBoundary<T>(relation),
    count: count(relation),
  };
};
