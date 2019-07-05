"use strict";

const { extract } = require("./index");

/**
 * @module DataParser/nhsHa
 *
 * Writes nhsHa.json to stdout
 *
 * Notes:
 * - Raw TSV data is malformed and has inconsistent column counts requiring
 * `relax_column_count: true`
 */

const CODE_OFFSET = 0;
const VALUE_OFFSET = 2;

const transform = row => {
  const code = row[CODE_OFFSET];
  const value = row[VALUE_OFFSET];
  if (value === "HLTHAUNM") return []; // Escape if header
  return [code, value];
};

const parseOptions = { delimiter: "," };

const configs = [
  {
    file: "HLTHAU names and codes UK as at 04_19 (OSHLTHAU).csv",
    transform,
    parseOptions,
  },
];

extract({ configs });
