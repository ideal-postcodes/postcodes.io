"use strict";

const { extract, isPseudoCode } = require("./index");

/**
 * @module DataParser/icb
 *
 * Writes icb.json to stdout
 *
 * Notes:
 * - Pseudocodes are ignored
 * - ICB = Integrated Care Board
 */

const CODE_OFFSET = 0;
const VALUE_OFFSET = 2;

const transform = (row) => {
  const code = row[CODE_OFFSET];
  const value = row[VALUE_OFFSET];
  if (code === "ICB23CD") return []; // Skip header
  if (isPseudoCode(code)) return [];
  return [code, value];
};

const configs = [
  {
    file: "ICB Integrated Care Board names and codes UK as at 04_23.csv",
    transform,
    delimiter: ",",
  },
];

extract({ configs });
