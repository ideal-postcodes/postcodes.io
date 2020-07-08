import {
  ForeignColumn,
  Relationship,
  RowExtract,
  _csvSeed,
  csvExtractor,
  generateMethods,
  query,
  Relation,
} from "./base";
import { resolve } from "path";
import Postcode from "postcode";

const smallUserExtractor = csvExtractor(
  require("../../../data/spd_small_schema.json")
);
const largeUserExtractor = csvExtractor(
  require("../../../data/spd_large_schema.json")
);

const relation: Relation = {
  relation: "scottish_postcodes",
  schema: {
    id: "SERIAL PRIMARY KEY",
    postcode: `VARCHAR(10) COLLATE "C"`, // C Provides desirable ordering
    pc_compact: `VARCHAR(9) COLLATE "C"`, // for pc autocomplete & partials
    scottish_constituency_id: "VARCHAR(32)",
  },
  indexes: [
    {
      unique: true,
      column: "pc_compact",
    },
  ],
};

const methods = generateMethods(relation);

const relationships: Relationship[] = [
  {
    table: "scottish_constituencies",
    key: "scottish_constituency_id",
    foreignKey: "code",
  },
];

const foreignColumns: ForeignColumn[] = [
  {
    field: "scottish_constituencies.name",
    as: "scottish_parliamentary_constituency",
  },
];

const joinString: Readonly<string> = Object.freeze(
  relationships
    .map(
      (r) =>
        `LEFT OUTER JOIN ${r.table} ON ${relation.relation}.${r.key}=${r.table}.${r.foreignKey}`
    )
    .join(" ")
);

const columnString: Readonly<string> = Object.freeze(
  foreignColumns.map(({ field, as }) => `${field} as ${as}`).join(",")
);

const findQuery = `
  SELECT 
    ${relation.relation}.*, ${columnString} 
  FROM 
    ${relation.relation} 
  ${joinString} 
  WHERE pc_compact=$1 
`;

const SPD_COL_MAPPINGS = Object.freeze([
  { column: "postcode", method: (row: RowExtract) => row.extract("Postcode") },
  {
    column: "pc_compact",
    method: (row) => row.extract("Postcode").replace(/\s/g, ""),
  },
  {
    column: "scottish_constituency_id",
    method: (row) => row.extract("ScottishParliamentaryConstituency2014Code"),
  },
]);

interface ScottishPostcodeTuple {
  id: number;
  postcode: string;
  pc_compact: string;
  scottish_constituency_id: string;
  scottish_parliamentary_constituency: string;
}

interface ScottishPostcodeInterface {
  postcode: string;
  scottish_parliamentary_constituency: string;
  codes: Codes;
}

interface Codes {
  scottish_parliamentary_constituency: string;
}

const find = async (
  postcode: string
): Promise<ScottishPostcodeTuple | null> => {
  if (postcode == null) postcode = "";
  postcode = postcode.replace(/\s+/g, "").toUpperCase();
  if (!Postcode.isValid(postcode)) return null;
  const result = await query<ScottishPostcodeTuple>(findQuery, [postcode]);
  if (result.rows.length === 0) return null;
  return result.rows[0];
};

const toJson = ({
  postcode,
  scottish_parliamentary_constituency,
  scottish_constituency_id,
}: ScottishPostcodeTuple): ScottishPostcodeInterface => ({
  postcode,
  scottish_parliamentary_constituency,
  codes: {
    scottish_parliamentary_constituency: scottish_constituency_id,
  },
});

interface SeedPostcodesOptions {
  extractor: any;
  filepath: string;
}
/**
 * Seeds Scottish postcode directory - large or small
 */
const seedPostcodes = ({ extractor, filepath }: SeedPostcodesOptions) => {
  return methods.csvSeed({
    filepath: [filepath],
    transform: (row: RowExtract) => {
      row.extract = (code: string) => extractor(row, code);
      if (row.extract("Postcode") === "Postcode") return null; // Skip if header
      if (row.extract("DateOfDeletion").length !== 0) return null; // Skip row if terminated
      return SPD_COL_MAPPINGS.map((elem) => elem.method(row));
    },
    columns: SPD_COL_MAPPINGS.map((elem) => elem.column),
  });
};

const setupTable = async (directory: string) => {
  const largeUserFile = resolve(directory, "LargeUser.csv");
  const smallUserFile = resolve(directory, "SmallUser.csv");
  await methods.createRelation();
  await methods.clear();
  await seedPostcodes({
    filepath: largeUserFile,
    extractor: largeUserExtractor,
  });
  await seedPostcodes({
    filepath: smallUserFile,
    extractor: smallUserExtractor,
  });
  await methods.createIndexes();
};

export const ScottishPostcode = {
  ...methods,
  find,
  setupTable,
  toJson,
};
