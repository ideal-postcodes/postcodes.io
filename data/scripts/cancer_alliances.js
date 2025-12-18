"use strict";

const { extract, isPseudoCode } = require("./index");

/**
 * @module DataParser/cancer_alliances
 *
 * Writes cancer_alliances.json to stdout
 *
 * Notes:
 * - Pseudocodes are ignored
 */

const CODE_OFFSET = 0;
const VALUE_OFFSET = 1;

const transform = (row) => {
  const code = row[CODE_OFFSET];
  const value = row[VALUE_OFFSET];
  if (code === "CAL24CD") return []; // Skip header
  if (isPseudoCode(code)) return [];
  return [code, value];
};

const configs = [
  {
    file: "CAL Cancer Alliance names and codes EN as at 04_24.csv",
    transform,
    delimiter: ",",
  },
];

extract({ configs });
