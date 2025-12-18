"use strict";

const { extract, isPseudoCode } = require("./index");

/**
 * @module DataParser/nhs_regions
 *
 * Writes nhs_regions.json to stdout
 *
 * Notes:
 * - Pseudocodes are ignored
 */

const CODE_OFFSET = 0;
const VALUE_OFFSET = 2;

const transform = (row) => {
  const code = row[CODE_OFFSET];
  const value = row[VALUE_OFFSET];
  if (code === "NHSER24CD") return []; // Skip header
  if (isPseudoCode(code)) return [];
  return [code, value];
};

const configs = [
  {
    file: "NHSER NHS England Region names and codes EN as at 04_24.csv",
    transform,
    delimiter: ",",
  },
];

extract({ configs });
