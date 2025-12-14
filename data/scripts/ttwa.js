"use strict";

const { extract, isPseudoCode } = require("./index");

/**
 * @module DataParser/ttwa
 *
 * Writes ttwa.json to stdout
 *
 * Notes:
 * - Pseudocodes are ignored
 */

const CODE_OFFSET = 0;
const VALUE_OFFSET = 1;

const transform = (row) => {
  const code = row[CODE_OFFSET];
  const value = row[VALUE_OFFSET];
  if (code === "TTWA11CD") return []; // Skip header
  if (isPseudoCode(code)) return [];
  return [code, value];
};

const configs = [
  {
    file: "TTWA Travel to Work Area names and codes UK as at 12_11 v5.csv",
    transform,
    delimiter: ",",
  },
];

extract({ configs });
