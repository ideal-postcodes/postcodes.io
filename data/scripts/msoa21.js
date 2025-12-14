"use strict";

const { extract, isPseudoCode } = require("./index");

/**
 * @module DataParser/msoa21
 *
 * Writes msoa21.json to stdout
 *
 * Notes:
 * - Pseudocodes are ignored
 * - Combines England & Wales (MSOA) and Scotland (Intermediate Zones)
 * - Northern Ireland does not have MSOAs
 */

const transform = (row) => {
  const code = row[0];
  const value = row[1];
  // Skip headers from all files
  if (["MSOA21CD", "IZ22CD"].includes(code)) return [];
  if (isPseudoCode(code)) return [];
  return [code, value];
};

const configs = [
  {
    file: "MSOA (2021) names and codes EW as at 12_21.csv",
    transform,
    delimiter: ",",
  },
  {
    file: "MSOA (2021) IZ names and codes SC as at 12_24.csv",
    transform,
    delimiter: ",",
  },
];

extract({ configs });
