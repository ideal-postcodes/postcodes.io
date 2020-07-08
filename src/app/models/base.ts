import { createReadStream } from "fs";
import { Pool, PoolClient, QueryResult } from "pg";
import { from } from "pg-copy-streams";
// @ts-ignore
import csv = require("csv");
import config from "../../config/config";
const defaults = config();

// Instantiate postgres client pool
const pool = new Pool(defaults.postgres);

export type Schema = Record<string, string>;

export interface Index {
  unique?: boolean;
  column: string;
  opClass?: string;
  type?: string;
}

// All models inherit from base
// Requires schema and relation name
export interface Relation {
  relation: string;
  schema: Schema;
  indexes: Index[];
}

export interface Relationship {
  table: string;
  key: string;
  foreignKey: string;
}

export interface ForeignColumn {
  field: string;
  as: string;
}

export const query = async <T = any>(
  text: string,
  values?: (string | number)[]
): Promise<QueryResult<T>> => {
  let client;
  try {
    client = await pool.connect();
  } catch (error) {
    throw error;
  }

  const options = { text, ...(values && { values }) };

  try {
    const result = await client.query(options);
    return result;
  } catch (error) {
    throw error;
  } finally {
    if (client && client.release) client.release();
  }
};

export const _create = ({ relation }: Relation) => <
  T = Record<string, string | number>
>(
  newRecord: T
) => {
  return query(
    `
    INSERT INTO ${relation}
      (${Object.keys(newRecord).join(", ")})
    VALUES
      (${dollarise(Object.values(newRecord))})
  `,
    Object.values(newRecord)
  );
};

export const _all = ({ relation }: Relation) => () =>
  query(`SELECT * FROM ${relation}`);

export const _clear = ({ relation }: Relation) => () =>
  query(`DELETE FROM ${relation}`);

export const _createRelation = ({ relation, schema }: Relation) => () =>
  query(`CREATE TABLE IF NOT EXISTS
    ${relation} 
    (
      ${Object.entries(schema)
        .map(([column, dataType]) => `${column} ${dataType}`)
        .join(", ")}
    )
  `);

export const _destroyRelation = ({ relation }: Relation) => () =>
  query(`DROP TABLE IF EXISTS ${relation} CASCADE`);

/**
 * Build SQL string to generate index
 */
const generateInstruction = (index: Index, relation: string) => {
  const { unique, type, column, opClass } = index;
  return `
    CREATE ${unique ? "UNIQUE INDEX" : "INDEX"} 
    ON ${relation} 
    USING ${type || "BTREE"} 
    (${column} ${opClass ? opClass : ""})
  `;
};

/**
 * Generate index given instances internal array of IndexConfigurationObjects
 */
export const _createIndexes = ({
  relation,
  indexes,
}: Relation) => async (): Promise<void> => {
  for (const index of indexes) {
    await query(generateInstruction(index, relation));
  }
};

type Transform = (row: string[]) => string[];

interface CsvSeedOptions {
  filepath: string[];
  columns: string[];
  transform?: Transform;
}

const DEFAULT_TRANSFORM = (row: string[]) => row;

export const _csvSeed = ({ relation }: Relation) => async ({
  filepath,
  columns,
  transform = DEFAULT_TRANSFORM,
}: CsvSeedOptions) => {
  const q = `COPY ${relation} (${columns}) FROM STDIN DELIMITER ',' CSV`;
  const updates = filepath.map(
    (f) =>
      new Promise((resolve, reject) => {
        pool.connect((error: Error, client: PoolClient, done: any) => {
          const pgStream = client
            .query(from(q))
            .on("end", () => {
              done();
              resolve();
            })
            .on("error", (pgError) => {
              done();
              reject(pgError);
            });
          createReadStream(f, { encoding: "utf8" })
            .pipe(csv.parse())
            .pipe(csv.transform(transform))
            .pipe(csv.stringify())
            .pipe(pgStream);
        });
      })
  );
  for (const update of updates) {
    await update;
  }
};

export const destroyAll = async () => {
  if (process.env.NODE_ENV !== "test") {
    throw `Aborting. Tried to wipe database outside of testing environment`;
  }

  await query("DROP SCHEMA public CASCADE");
  return query("CREATE PUBLIC SCHEMA");
};

export const getClient = () => pool.connect();

export const dollarise = (values: unknown[]): string =>
  values.map((_, i) => `$${i + 1}`).join(", ");

export const _populateLocation = ({ relation }: Relation) => () =>
  query(`
		UPDATE 
			${relation} 
		SET 
			location=ST_GeogFromText(
				'SRID=4326;POINT(' || longitude || ' ' || latitude || ')'
			) 
		WHERE 
			northings!=0 
			AND EASTINGS!=0
	`);

interface CsvRowDefinition {
  code: string;
  description: string;
}

interface EmptyRowDefinition {}

const isCsvSchema = (
  elem: CsvRowDefinition | EmptyRowDefinition
): elem is CsvRowDefinition => elem.hasOwnProperty("code");

/**
 * Returns a function that extracts a CSV value for a given code
 */
export const csvExtractor = (
  schema: (CsvRowDefinition | EmptyRowDefinition)[]
) => {
  const cache: Record<string, number> = {};

  /**
   * Returns the index location of an given param, -1 if not found
   */
  const indexFor = (code: string): number => {
    if (cache[code] !== undefined) return cache[code];
    cache[code] = schema.reduce<number>((result, elem, i) => {
      if (isCsvSchema(elem) && elem.code === code) return i;
      return result;
    }, -1);
    return cache[code];
  };

  /**
   * Extracts the value for `code` from an CSV record defined by `schema`
   */
  return (row: string[], code: string): string => row[indexFor(code)];
};

export interface RowExtract extends Array<string> {
  extract: any;
}

export const generateMethods = (relation: Relation) => {
  return {
    create: _create(relation),
    all: _all(relation),
    clear: _clear(relation),
    csvSeed: _csvSeed(relation),
    populateLocation: _populateLocation(relation),
    createRelation: _createRelation(relation),
    destroyRelation: _destroyRelation(relation),
    createIndexes: _createIndexes(relation),
    relation,
  };
};
