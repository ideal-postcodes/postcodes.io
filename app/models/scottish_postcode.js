"use strict";

const { resolve } = require("path");
const Postcode = require("postcode");
const { series } = require("async");
const { Base, csvExtractor } = require("./base");
const smallUserExtractor = csvExtractor(
  require("../../data/spd_small_schema.json")
);
const largeUserExtractor = csvExtractor(
  require("../../data/spd_large_schema.json")
);

const TABLE_NAME = "scottish_postcodes";

const schema = {
  id: "SERIAL PRIMARY KEY",
  postcode: `VARCHAR(10) COLLATE "C"`, // C Provides desirable ordering
  pc_compact: `VARCHAR(9) COLLATE "C"`, // for pc autocomplete & partials
  scottish_constituency_id: "VARCHAR(32)",
};

const indexes = [
  {
    unique: true,
    column: "pc_compact",
  },
];

const relationships = [
  {
    table: "scottish_constituencies",
    key: "scottish_constituency_id",
    foreignKey: "code",
  },
];

const foreignColumns = [
  {
    field: "scottish_constituencies.name",
    as: "scottish_parliamentary_constituency",
  },
];

const toJoinString = () => {
  return relationships
    .map(
      (r) =>
        `LEFT OUTER JOIN ${r.table} ON ${TABLE_NAME}.${r.key}=${r.table}.${r.foreignKey}`
    )
    .join(" ");
};

const toColumnsString = () => {
  return foreignColumns.map(({ field, as }) => `${field} as ${as}`).join(",");
};

const findQuery = `
  SELECT 
    ${TABLE_NAME}.*, ${toColumnsString()} 
  FROM 
    ${TABLE_NAME} 
  ${toJoinString()} 
  WHERE pc_compact=$1 
`;

const SPD_COL_MAPPINGS = Object.freeze([
  { column: "postcode", method: (row) => row.extract("Postcode") },
  {
    column: "pc_compact",
    method: (row) => row.extract("Postcode").replace(/\s/g, ""),
  },
  {
    column: "scottish_constituency_id",
    method: (row) => row.extract("ScottishParliamentaryConstituency2014Code"),
  },
]);

const EXCEPTION_REGEX = /A$/;

/**
 * Validates and potentially mutates a CSV row for ingest
 *
 * Unfortunately SPD appends extra characters to some postcodes. This method returns null when these cases are met, unless the postcode ends in `A`.
 *
 * Postcodes suffixed with `A` are made valid and returned to the stream for ingest
 */
const clean = (row) => {
  const postcode = row[0];
  if (Postcode.isValid(postcode)) return row;
  // Reject if invalid postcide has a non-A suffix
  if (postcode.match(EXCEPTION_REGEX) === null) return null;
  row[0] = postcode.replace(EXCEPTION_REGEX, "");
  return row;
};

class ScottishPostcode extends Base {
  constructor() {
    super(TABLE_NAME, schema, indexes);
  }

  find(postcode, callback) {
    if (typeof postcode !== "string") return callback(null, null);
    postcode = postcode.replace(/\s+/g, "").toUpperCase();
    if (!Postcode.isValid(postcode)) return callback(null, null);
    this._query(findQuery, [postcode], (error, result) => {
      if (error) return callback(error, null);
      if (result.rows.length === 0) return callback(null, null);
      callback(null, result.rows[0]);
    });
  }

  toJson(record) {
    return {
      postcode: record.postcode,
      scottish_parliamentary_constituency:
        record.scottish_parliamentary_constituency,
      codes: {
        scottish_parliamentary_constituency: record.scottish_constituency_id,
      },
    };
  }

  /**
   * Seeds Scottish postcode directory - large or small
   *
   * @param options {object}
   * @param options.filepath - Path to SPD CSV file
   * @param options.extractor - CSV value extractor
   * @param callback
   * @returns {undefined}
   */
  seedPostcodes(options, callback) {
    const { extractor, filepath } = options;
    this._csvSeed(
      {
        filepath,
        transform: (row) => {
          clean(row);
          row.extract = (code) => extractor(row, code);
          if (row.extract("Postcode") === "Postcode") return null; // Skip if header
          if (row.extract("DateOfDeletion").length !== 0) return null; // Skip row if terminated
          return SPD_COL_MAPPINGS.map((elem) => elem.method(row));
        },
        columns: SPD_COL_MAPPINGS.map((elem) => elem.column).join(","),
      },
      callback
    );
  }

  _setupTable(directory, callback) {
    const largeUserFile = resolve(directory, "LargeUser.csv");
    const smallUserFile = resolve(directory, "SmallUser.csv");
    series(
      [
        this._createRelation.bind(this),
        this.clear.bind(this),
        (cb) =>
          this.seedPostcodes.call(
            this,
            { filepath: largeUserFile, extractor: largeUserExtractor },
            cb
          ),
        (cb) =>
          this.seedPostcodes.call(
            this,
            { filepath: smallUserFile, extractor: smallUserExtractor },
            cb
          ),
        this.createIndexes.bind(this),
      ],
      callback
    );
  }
}

module.exports = new ScottishPostcode();
