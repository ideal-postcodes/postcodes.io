import { query } from "./base";
import { generateAttributeMethods } from "./attribute_base";

const relation = "ccgs";

interface CcgDatumInterface {
  ccg19cdh: string;
  name: string;
}

type CcgData = Record<string, CcgDatumInterface>;

// Override Seed Data Method
const seed = async () => {
  const ccgData = require(`../../../data/${relation}.json`) as CcgData;

  const inserts = Object.entries(ccgData).map(([code, ccgDatum]) => {
    return query(
      `INSERT INTO ${relation} (code, name, ccg19cdh) VALUES ($1, $2, $3)`,
      [code, ccgDatum.name, ccgDatum.ccg19cdh]
    );
  });

  return Promise.all(inserts);
};

export const Ccg = generateAttributeMethods(
  {
    relation,
    schema: {
      ccg19cdh: "VARCHAR(32) NULL UNIQUE",
    },
  },
  seed
);
