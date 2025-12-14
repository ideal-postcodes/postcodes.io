"use strict";

const { extract, isPseudoCode } = require("./index");

/**
 * @module DataParser/lsoa21
 *
 * Writes lsoa21.json to stdout
 *
 * Notes:
 * - Pseudocodes are ignored
 * - Combines England & Wales (LSOA), Scotland (Data Zones), and Northern Ireland (Super Data Zones)
 */

const transform = (row) => {
  const code = row[0];
  const value = row[1];
  // Skip headers from all files
  if (["LSOA21CD", "DZ22CD", "SDZ21CD"].includes(code)) return [];
  if (isPseudoCode(code)) return [];
  return [code, value];
};

const configs = [
  {
    file: "LSOA (2021) names and codes EW as at 12_21.csv",
    transform,
    delimiter: ",",
  },
  {
    file: "LSOA (2021) DZ names and codes SC as at 12_24.csv",
    transform,
    delimiter: ",",
  },
  {
    file: "LSOA (2021) SDZ names and codes NI as at 03_21.csv",
    transform,
    delimiter: ",",
  },
];

extract({ configs });
