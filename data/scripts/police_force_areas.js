const { extract } = require("./index");

/**
 * @module DataParser/pfa
 *
 * Writes pfa.json to stdout
 */

const CODE_OFFSET = 0;
const VALUE_OFFSET = 1;

const transform = (row) => {
  const code = row[CODE_OFFSET];
  const value = row[VALUE_OFFSET];
  if (value === "PFA15CD") return []; // Escape if header
  return [code, value];
};

const parseOptions = { delimiter: "," };

const configs = [
  {
    file: "PFA names and codes GB as at 12_15.csv",
    transform,
    parseOptions,
  },
];

extract({ configs, appendMissing: {} });
