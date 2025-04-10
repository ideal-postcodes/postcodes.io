const { extract } = require("./index");

/**
 * @module DataParser/nuts
 *
 * Writes nuts.json to stdout
 *
 * Notes:
 * - Data extraction for nuts has the additional complexity of requiring
 * a NUTS code. E.g.
 *
 * Nuts output:
 * {
 * ...
 * 	"E05009046": {
 * 		"code": "UKC14",
 * 		"name": "Durham CC"
 * 	},
 * 	...
 * }
 */

// Example input from Feb 2025 release:
//
// ITL125CD,ITL125NM,ITL225CD,ITL225NM,ITL325CD,ITL325NM,LAU125CD,LAU125NM,LAD24CD,LAD24NM,,,,,,,
// TLC,North East (England),TLC3,Tees Valley,TLC31,Hartlepool and Stockton-on-Tees,E06000001,Hartlepool,E06000001,Hartlepool,,,,,,,
//
// 0    , ITL125CD           , TLC
// 1    , ITL125NM           , North East (England)
// 2    , ITL225CD           , TLC3
// 3    , ITL225NM           , Tees Valley
// 4    , ITL325CD           , TLC31
// 5    , ITL325NM           , Hartlepool and Stockton-on-Tees
// 6    , LAU125CD           , E0600001
// 7    , LAU125NM           , Hartlepool
// 8    , LAD24CD            , E0600001
// 9    , LAD24NM            , Hartlepool

const CODE_OFFSET = 6;
const NUTS_CODE_OFFSET = 4;
const VALUE_OFFSET = 7;

const transform = (row) => {
  const code = row[CODE_OFFSET];
  const nutsCode = row[NUTS_CODE_OFFSET];
  const value = row[VALUE_OFFSET];
  if (value === "LAU125NM") return []; // Escape if header
  return [
    code,
    {
      code: nutsCode,
      name: value,
    },
  ];
};

const configs = [
  {
    file: "ITL125_ITL225_ITL325_LAU125_LAD24_UK_LU.csv",
    transform,
    parseOptions: {
      delimiter: ",",
    },
    encoding: "utf8",
  },
];

extract({ configs });
