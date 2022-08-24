"use strict";

const { extract } = require("./index");

/**
 * @module DataParser/parishes
 *
 * Writes parishes.json to stdout
 *
 * Notes:
 * - Manually add 4 missing GSS parish codes
 */

const CODE_OFFSET = 0;
const VALUE_OFFSET = 1;

const transform = (row) => {
  const code = row[CODE_OFFSET];
  const value = row[VALUE_OFFSET];
  if (value === "PAR21CD") return []; // Escape if header
  return [code, value];
};

const parseOptions = { delimiter: "," };

const configs = [
  {
    file: "PAR_DEC_2021_EW_NC.csv",
    transform,
    parseOptions,
  },
];

extract({ configs });
