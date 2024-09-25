"use strict";

const { extract } = require("./index");

/**
 * @module DataParser/wards
 *
 * Writes wards.json to stdout
 */

const CODE_OFFSET = 0;
const VALUE_OFFSET = 1;

const transform = (row) => {
  const code = row[CODE_OFFSET];
  const value = row[VALUE_OFFSET];
  if (code === "WD22CD") return []; // Escape if header
  return [code, value];
};

const appendMissing = {
  W05001616: "Bedlinog and Trelewis",
  W05001617: "Cyfarthfa",
  W05001618: "Dowlais and Pant",
  W05001619: "Gurnos",
  W05001620: "Merthyr Vale",
  W05001621: "Park",
  W05001622: "Penydarren",
  W05001623: "Plymouth",
  W05001624: "Town",
  W05001625: "Treharris",
  W05001626: "Vaynor",
  S13002608: "An Taobh Siar agus Nis",
};

const configs = [
  {
    file: "Ward names and codes UK as at 05_24.csv",
    transform,
    parseOptions: {
      delimiter: ",",
    },
    encoding: "utf8",
  },
];

extract({ configs, appendMissing });
