import { query } from "./base";
import { generateAttributeMethods } from "./attribute_base";

const relation = "nuts";

interface NutsDatumInterface {
  code: string;
  name: string;
}

type NutsData = Record<string, NutsDatumInterface>;

// Override Seed Data Method
const seed = async () => {
  const data = require(`../../../data/${relation}.json`) as NutsData;

  const inserts = Object.entries(data).map(([code, datum]) => {
    return query(
      `INSERT INTO ${relation} (code, name, nuts_code) VALUES ($1, $2, $3)`,
      [code, datum.name, datum.code]
    );
  });

  return Promise.all(inserts);
};

export const Nuts = generateAttributeMethods(
  {
    relation,
    schema: {
      nuts_code: "VARCHAR(32) NOT NULL",
    },
  },
  seed
);
