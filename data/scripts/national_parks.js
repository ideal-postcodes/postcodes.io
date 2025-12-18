"use strict";

const { extract, isPseudoCode } = require("./index");

/**
 * @module DataParser/national_parks
 *
 * Writes national_parks.json to stdout
 *
 * Notes:
 * - Pseudocodes are ignored
 */

const CODE_OFFSET = 0;
const VALUE_OFFSET = 1;

const transform = (row) => {
  const code = row[CODE_OFFSET];
  const value = row[VALUE_OFFSET];
  if (code === "NPARK22CD") return []; // Skip header
  if (isPseudoCode(code)) return [];
  return [code, value];
};

const configs = [
  {
    file: "NPARK National Park names and codes GB as at 03_23.csv",
    transform,
    delimiter: ",",
  },
];

extract({ configs });
