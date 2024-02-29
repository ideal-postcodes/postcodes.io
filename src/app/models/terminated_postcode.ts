import { parse } from "@fast-csv/parse";
import { createReadStream } from "fs";
import { from } from "pg-copy-streams";
import { format } from "@fast-csv/format";
import { Relation, generateMethods, query, _csvSeed, pool } from "./base";
import {
  relation as postcodeRelation,
  PostcodeTuple,
  firstLine,
} from "./postcode";
import { isValid } from "postcode";

const relation: Relation = {
  ...postcodeRelation,
  relation: "terminated_postcodes",
};

interface TerminatedPostcodeTuple extends PostcodeTuple {}

interface TerminatedPostcodeInterface {
  postcode: string;
  year_terminated: number;
  month_terminated: number;
  longitude: number;
  latitude: number;
}

const findQuery = `SELECT * FROM terminated_postcodes WHERE pc_compact=$1`;

export const find = async (
  postcode: string
): Promise<TerminatedPostcodeTuple | null> => {
  if (postcode == null) postcode = "";
  postcode = postcode.trim().toUpperCase();
  if (!isValid(postcode)) return null;
  const result = await query<TerminatedPostcodeTuple>(findQuery, [
    postcode.replace(/\s/g, ""),
  ]);
  if (result.rows.length === 0) return null;
  return result.rows[0];
};

/**
 * Turn terminated postcode data into json object
 */
export const toJson = (
  t: TerminatedPostcodeTuple
): TerminatedPostcodeInterface => {
  return {
    postcode: t.postcode,
    // Get first 4 characters
    year_terminated: parseInt(t.date_of_termination.slice(0, 4), 10),
    // Get last 2 characters
    month_terminated: parseInt(t.date_of_termination.slice(-2), 10),
    longitude: t.longitude,
    latitude: t.latitude,
  };
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
        if (row.date_of_termination === "") return null;
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

const methods = generateMethods(relation);

export const setupTable = async (filepath: string) => {
  await methods.createRelation();
  await methods.clear();
  await seedPostcodes(filepath);
  await methods.populateLocation();
  await methods.createIndexes();
};

export const TerminatedPostcode = {
  ...methods,
  setupTable,
  seedPostcodes,
  toJson,
  find,
};
