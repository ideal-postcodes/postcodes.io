"use strict";

const { extract, isPseudoCode } = require("./index");

/**
 * @module DataParser/ruc11
 *
 * Writes ruc11.json to stdout
 *
 * Notes:
 * - RUC = Rural Urban Classification (2011)
 * - Covers Great Britain
 */

const CODE_OFFSET = 0;
const VALUE_OFFSET = 1;

const transform = (row) => {
  const code = row[CODE_OFFSET];
  const value = row[VALUE_OFFSET];
  if (code === "RU11IND") return []; // Skip header
  return [code, value];
};

const configs = [
  {
    file: "RUC11 Rural Urban (2011) Indicator names and codes GB as at 12_16.csv",
    transform,
    delimiter: ",",
  },
];

extract({ configs });
