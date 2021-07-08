"use strict";

const { extract } = require("./index");

/**
 * @module DataParser/districts
 *
 * Writes districts.json to stdout
 *
 * Notes:
 * - Pseudocodes are ignored
 * - ONSPD May 2018: Older NI codes can be dropped as they are no longer found in the dataset
 */

const LA_UA_CODE_OFFSET = 0;
const LA_UA_VALUE_OFFSET = 1;

const LA_UA_NAMES_transform = (row) => {
  const code = row[LA_UA_CODE_OFFSET];
  const value = row[LA_UA_VALUE_OFFSET];
  if (code === "LAD19CD") return []; // Escape if header
  return [code, value];
};

const configs = [
  {
    file: "LA_UA names and codes UK as at 04_21.csv",
    transform: LA_UA_NAMES_transform,
    parseOptions: {
      delimiter: ",",
    },
    encoding: "utf8",
  },
];

extract({ configs });
