/*
 * This script checks for missing ONS Codes in the ONS Postcode Directory
 *
 * To run: find_missing.js /path/to/postcode/directory.csv
 * To specificy a single type for matches, use `--type=nhsHa`
 * This parses every line of the directory returns result to stdout
 */

// Drop csv library for fast-csv
//@ts-ignore
import { parse, transform } from "csv";

import { existsSync, createReadStream } from "fs";
import minimist from "minimist";
const argv = minimist(process.argv.slice(2));

// Maps postcodes.io code types to ONSPD labels
const onspdSchema = require("../../../data/onspd_schema.json");

type CodeType =
  | "nhsHa"
  | "counties"
  | "districts"
  | "wards"
  | "parishes"
  | "constituencies"
  | "european_registers"
  | "regions"
  | "pcts"
  | "lsoa"
  | "msoa"
  | "nuts"
  | "ccgs"
  | "ceds";

type CodeDict = Record<CodeType, string>;

const codeTypeToOnspd: CodeDict = {
  nhsHa: "oshlthau",
  counties: "oscty",
  districts: "oslaua",
  wards: "osward",
  parishes: "parish",
  constituencies: "pcon",
  european_registers: "eer",
  regions: "rgn",
  pcts: "pct",
  lsoa: "lsoa11",
  msoa: "msoa11",
  nuts: "nuts",
  ccgs: "ccg",
  ceds: "ced",
};

// List of types to be searched
let codeTypes: CodeType[] = Object.keys(codeTypeToOnspd) as CodeType[];

// Generate a dictionary of ONSPD types and their offsets in the CSV dataset
const typeOffset = codeTypes.reduce((offset: any, codeType: CodeType) => {
  offset[codeType] = onspdSchema
    .map((e: any) => e.code)
    .indexOf(codeTypeToOnspd[codeType]);
  return offset;
}, {});

// Retrieve ONSPD file
const source = argv._[0];
if (!source || !existsSync(source)) {
  console.log("Please specificy ONSPD Directory source file");
  process.exit(0);
}

// Retrieve optional type argument
const code = argv.type;
if (code) {
  if (!codeTypes.some((codeType) => codeType === code)) {
    console.log("Please specify a valid code type using --type=", codeTypes);
    process.exit(0);
  } else {
    codeTypes = [code];
  }
}

type MissingData = Record<CodeType, Record<string, number>>;

// Load data sources and initialise missing type stores
const data: any = {};
const missingData: MissingData = {} as MissingData;

codeTypes.forEach((codeType: CodeType) => {
  // Initialise missing data entry for each type
  missingData[codeType] = {};
  // Load known codes into data
  data[codeType] = require(`../../data/${codeType}.json`);
});

const check = (row: string[], codeType: CodeType) => {
  const elem = row[typeOffset[codeType]];
  if (elem === "") return;
  if (typeof data[codeType][elem] !== "undefined") return;
  // Initialise missing datapoint with count of 0
  if (typeof missingData[codeType][elem] !== "number")
    missingData[codeType][elem] = 0;
  missingData[codeType][elem] += 1;
};

export const run = () =>
  createReadStream(source)
    .pipe(parse({ delimiter: "," }))
    .on("data", (row: string[]): void => {
      if (row[4].length !== 0) return null; // Skip row if terminated postcode
      codeTypes.forEach((codeType) => check(row, codeType));
    })
    .on("end", () => {
      console.log(JSON.stringify(missingData, null, 2));
      process.exit(0);
    })
    .on("error", (error: any) => {
      console.log(error.message);
      process.exit(1);
    });
