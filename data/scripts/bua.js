"use strict";

const { extract, isPseudoCode } = require("./index");

/**
 * @module DataParser/bua
 *
 * Writes bua.json to stdout
 *
 * Notes:
 * - Pseudocodes are ignored
 * - BUA = Built-up Area
 */

const CODE_OFFSET = 0;
const VALUE_OFFSET = 1;

const transform = (row) => {
  const code = row[CODE_OFFSET];
  const value = row[VALUE_OFFSET];
  if (code === "BUA24CD") return []; // Skip header
  if (isPseudoCode(code)) return [];
  return [code, value];
};

const configs = [
  {
    file: "BUA Built Up Area names and codes EW as at 04_24.csv",
    transform,
    delimiter: ",",
  },
];

extract({ configs });
