"use strict";

const { extract, isPseudoCode } = require("./index");

/**
 * @module DataParser/lep
 *
 * Writes lep.json to stdout
 *
 * Notes:
 * - LEP = Local Enterprise Partnership
 * - England only
 */

const CODE_OFFSET = 0;
const VALUE_OFFSET = 1;

const transform = (row) => {
  const code = row[CODE_OFFSET];
  const value = row[VALUE_OFFSET];
  if (code === "LEP21CD") return []; // Skip header
  if (isPseudoCode(code)) return [];
  return [code, value];
};

const configs = [
  {
    file: "LEP Local Enterprise Partnership names and codes EN as at 04_21 v2.csv",
    transform,
    delimiter: ",",
  },
];

extract({ configs });
