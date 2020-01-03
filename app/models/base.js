"use strict";

const fs = require("fs");
const { Pool } = require("pg");
const { from } = require("pg-copy-streams");
const async = require("async");
const csv = require("csv");
const defaults = require("../../config/config")();
const config = defaults.postgres;

// Instantiate postgres client pool
const pool = new Pool(config);

// All models inherit from base
// Requires schema and relation name
function Base(relation, schema, indexes) {
  this.relation = relation;
  this.schema = schema;
  this.indexes = indexes;
}

Base.prototype._query = function(query, params, callback) {
  if (typeof params === "function") {
    callback = params;
    params = [];
  }

  if (!config) {
    return callback(new Error("Database connection not yet configured."), null);
  }

  pool.connect((error, client, done) => {
    if (error) return callback(error, null);
    client.query(query, params, (error, result) => {
      callback(error, result);
      done();
    });
  });
};

Base.prototype._create = function(newRecord, callback) {
  const query = [`INSERT INTO ${this.relation}`];
  const cols = [];
  const values = [];

  for (let col in newRecord) {
    if (!this.schema[col]) {
      return callback(
        new Error("Could not create record.", col, "does not exist"),
        null
      );
    }
    cols.push(col);
    values.push(newRecord[col]);
  }

  query.push(`(${cols.join(", ")})`);
  query.push(`VALUES (${dollarise(values)})`);
  this._query(query.join(" "), values, callback);
};

Base.prototype.all = function(callback) {
  this._query(`SELECT * FROM ${this.relation}`, callback);
};

Base.prototype.clear = function(callback) {
  this._query(`DELETE FROM ${this.relation}`, callback);
};

Base.prototype._createRelation = function(callback) {
  const query = [`CREATE TABLE IF NOT EXISTS ${this.relation}`];
  const columns = [];
  const schema = this.schema;

  for (let column in schema) {
    columns.push(column + " " + schema[column]);
  }

  query.push(`(${columns.join(", ")})`);

  this._query(query.join(" "), callback);
};

Base.prototype._destroyRelation = function(callback) {
  this._query(`DROP TABLE IF EXISTS ${this.relation} CASCADE`, callback);
};

/**
 * Build  SQL string to generate index
 *
 * @param index {IndexConfigurationObject}
 * @param relation {string}
 * @returns {string}
 */
const generateInstruction = (index, relation) => {
  const { unique, type, column, opClass } = index;
  return `
    CREATE ${unique ? "UNIQUE INDEX" : "INDEX"} 
    ON ${relation} 
    USING ${type || "BTREE"} 
    (${column} ${opClass || ""})
  `;
};

/**
 * Generate index given instances internal array of IndexConfigurationObjects
 *
 * @param callback
 * @returns {undefined}
 */
Base.prototype.createIndexes = function(callback) {
  async.series(
    this.indexes
      .map(index => generateInstruction(index, this.relation))
      .map(instruction => cb => this._query(instruction, cb)),
    callback
  );
};

Base.prototype._csvSeed = function(options, callback) {
  let filepath = options.filepath;
  if (Array.isArray(options.filepath)) {
    filepath = options.filepath;
  } else {
    filepath = [options.filepath];
  }
  const columns = options.columns;
  const transform = options.transform || (row => row);
  const query = `COPY ${this.relation} (${columns}) FROM STDIN DELIMITER ',' CSV`;

  async.eachLimit(
    filepath,
    5,
    (filepath, cb) => {
      pool.connect((error, client, done) => {
        const pgStream = client
          .query(from(query))
          .on("end", () => {
            done();
            return cb();
          })
          .on("error", error => {
            done();
            return cb(error);
          });
        fs.createReadStream(filepath, { encoding: "utf8" })
          .pipe(csv.parse())
          .pipe(csv.transform(transform))
          .pipe(csv.stringify())
          .pipe(pgStream);
      });
    },
    callback
  );
};

Base.prototype._destroyAll = function(callback) {
  if (process.env.NODE_ENV !== "test") {
    return callback(
      `Aborting. Tried to wipe database outside of testing environment`
    );
  }

  this._query("drop schema public cascade", error => {
    if (error) return callback(error, null);
    this._query("create public schema", callback);
  });
};

Base.prototype._getClient = function(callback) {
  pool.connect(callback);
};

const dollarise = values => values.map((_, i) => `$${i + 1}`).join(", ");

function populateLocation(callback) {
  /* jshint validthis: true */
  const query = `
		UPDATE 
			${this.relation} 
		SET 
			location=ST_GeogFromText(
				'SRID=4326;POINT(' || longitude || ' ' || latitude || ')'
			) 
		WHERE 
			northings!=0 
			AND EASTINGS!=0
	`;
  this._query(query, callback);
}

/**
 * Wraps a model and returns a function that when invoked:
 * - Creates a temporary name for the Model relation
 * - Builds model table with `_setupTable`
 * - Drop any existing archived table associated with model
 * - Rename existing table (if exists) to archived table
 * - Rename new table to active current
 * @param  {Object} Model
 * @return {Function}
 */
const setupWithTableSwap = (Model, sourceFile) => {
  return callback => {
    const originalName = Model.relation;
    const tempName = toTempName(originalName);
    const archivedName = toArchiveName(originalName);

    // Create and populate new relation under temporary name
    Model.relation = tempName;

    const args = [
      error => {
        if (error) return callback(error);
        // Restore model name
        Model.relation = originalName;
        async.forEachSeries(
          [
            // Drop existing archived table
            `DROP TABLE IF EXISTS ${archivedName}`,
            // Designate current table as archived table
            `ALTER TABLE IF EXISTS ${originalName} RENAME TO ${archivedName}`,
            // Swap in new table
            `ALTER TABLE ${tempName} RENAME TO ${originalName}`,
          ],
          Model._query.bind(Model),
          callback
        );
      },
    ];

    if (sourceFile) args.unshift(sourceFile);

    Model._setupTable.apply(Model, args);
  };
};

const toTempName = name => `${name}_temp`;
const toArchiveName = name => `${name}_archived`;

/**
 * Returns a function that extracts a CSV value for a given code
 * @param schema - Defines where to find CSV value given code
 */
const csvExtractor = schema => {
  const cache = {};

  /**
   * Returns the index location of an given param, -1 if not found
   * @param  {string} code column code e.g. `pcd`
   * @return {number}
   */
  const indexFor = code => {
    if (cache[code] !== undefined) return cache[code];
    cache[code] = schema.reduce((result, elem, i) => {
      if (elem.code === code) return i;
      return result;
    }, -1);
    return cache[code];
  };

  /**
   * Extracts the value for `code` from an CSV record defined by `schema`
   * @param  {string[]} row
   * @param  {string} code
   * @return {string}
   */
  return (row, code) => row[indexFor(code)];
};

module.exports = {
  Base,
  populateLocation,
  setupWithTableSwap,
  toTempName,
  toArchiveName,
  csvExtractor,
};
