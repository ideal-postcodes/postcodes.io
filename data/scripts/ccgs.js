"use strict";

const { extract, isPseudoCode } = require("./index");

/**
 * @module DataParser/ccgs
 *
 * Writes ccgs.json to stdout
 *
 * Notes:
 * - Pseudocodes are ignored
 * - "CCG" suffix is dropped from values
 */

const CODE_OFFSET = 0;
const SECOND_CODE_OFFSET = 1;
const VALUE_OFFSET = 2;

const ccgRegex = /\sCCG$/;

const transform = (row) => {
  const code = row[CODE_OFFSET];
  const second_code = row[SECOND_CODE_OFFSET];
  const value = row[VALUE_OFFSET];
  if (code === "CCG19CD") return []; // Escape if header
  if (isPseudoCode(code)) return [];
  return [
    code,
    {
      ccg19cdh: second_code,
      name: value.replace(ccgRegex, "").trim(),
    },
  ];
};

const configs = [
  {
    file: "CCG names and codes UK as at 04_21.csv",
    transform,
    parseOptions: {
      delimiter: ",",
    },
    encoding: "utf8",
  },
];

extract({ configs });
