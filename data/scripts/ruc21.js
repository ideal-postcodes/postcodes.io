"use strict";

const { extract, isPseudoCode } = require("./index");

/**
 * @module DataParser/ruc21
 *
 * Writes ruc21.json to stdout
 *
 * Notes:
 * - RUC = Rural Urban Classification (2021)
 * - Combines England & Wales and Scotland files
 */

// England & Wales: RUC21IND, RUC21DESC
const transformEW = (row) => {
  const code = row[0];
  const value = row[1];
  if (code === "RUC21IND") return []; // Skip header
  return [code, value];
};

// Scotland: RUC21IND, RUC21DESC
const transformSC = (row) => {
  const code = row[0];
  const value = row[1];
  if (code === "RUC21IND") return []; // Skip header
  return [code, value];
};

const configs = [
  {
    file: "RUC21 Rural Urban (2021) Indicator names and codes EW as at 05_25.csv",
    transform: transformEW,
    delimiter: ",",
  },
  {
    file: "RUC21 Rural Urban (2021) Indicator names and codes SC as at 05_25.csv",
    transform: transformSC,
    delimiter: ",",
  },
];

extract({ configs });
