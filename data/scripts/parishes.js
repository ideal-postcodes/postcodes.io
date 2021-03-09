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
  if (value === "PARNCP18NM") return []; // Escape if header
  return [code, value];
};

const appendMissing = {
  E43000234: "Three Rivers, unparished area",
  E43000097: "Lancaster, unparished area",
  E43000135: "Waveney, unparished area",
  E43000245: "Swindon, unparished area",
};

const parseOptions = { delimiter: "," };

const configs = [
  {
    file: "Parish_NCP names and codes EW as at 12_20.csv",
    transform,
    parseOptions,
  },
];

extract({
  configs,
  appendMissing,
});
