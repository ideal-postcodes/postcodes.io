"use strict";

const fs = require("fs");
const pg = require("pg");
const copyFrom = require("pg-copy-streams").from;
const async = require("async");
const csv = require("csv");
const defaults = require("../../config/config")();
const config = defaults.postgres;

// Instantiate postgres client pool
const pool = pg.Pool(config);

// All models inherit from base
// Requires schema and relation name
function Base (relation, schema, indexes) {
	this.relation = relation;
	this.schema = schema;
	this.indexes = indexes;
}

Base.prototype._query = function (query, params, callback) {
	if (typeof params === "function") {
		callback = params;
		params = [];
	}

	if (!config) {
		return callback(
			new Error("Database connection not yet configured."), 
			null
		);
	}

	pool.connect((error, client, done) => {
		if (error) return callback(error, null);
		client.query(query, params, (error, result) => {
			callback(error, result);
			done();
		});
	});
};

Base.prototype._create = function (newRecord, callback) {
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
	
	query.push(`(${ cols.join(", ") })`);
	query.push(`VALUES (${ dollarise(values) })`);
	this._query(query.join(" "), values, callback);
};

Base.prototype.all = function (callback) {
	this._query(`SELECT * FROM ${this.relation}`, callback);
};

Base.prototype.clear = function (callback) {
	this._query(`DELETE FROM ${this.relation}`, callback);
};

Base.prototype._createRelation = function (callback) {
	const query = [`CREATE TABLE IF NOT EXISTS ${this.relation}`];
	const columns = [];
	const schema = this.schema;

	for (let column in schema) {
		columns.push(column + " " + schema[column]);
	}

	query.push(`(${ columns.join(", ") })`);

	this._query(query.join(" "), callback);
};

Base.prototype._destroyRelation = function (callback) {
	this._query(`DROP TABLE IF EXISTS ${this.relation} CASCADE`, callback);
};

Base.prototype.createIndexes = function (callback) {
	const indexExecution = [];
	const returnInstruction = index => {
		const instruction = ["CREATE"];
		if (index.unique) {
			instruction.push("UNIQUE INDEX");
		} else {
			instruction.push("INDEX");
		}
		instruction.push(`ON ${this.relation}`);
		instruction.push(`USING ${(index.type || "BTREE")}`);
		if (index.opClass) {
			instruction.push(`(${index.column} ${index.opClass})`);	
		} else {
			instruction.push(`(${index.column})`);
		}
		return instruction.join(" ");
	};

	for (let i = 0; i < this.indexes.length; i += 1) {
		indexExecution.push(returnInstruction(this.indexes[i]));
	}

	async.series(indexExecution.map(instruction => {
		return callback => this._query(instruction, callback);
	}), callback);
};

Base.prototype._csvSeed = function (options, callback) {
	let filepath = options.filepath;
	if (Array.isArray(options.filepath)) {
		filepath = options.filepath;
	} else {
		filepath = [options.filepath];
	}
	const columns = options.columns;
	const transform = options.transform || (row => row);
	const query = `COPY ${this.relation} (${columns}) FROM STDIN DELIMITER ',' CSV`;

	async.eachLimit(filepath, 5, (filepath, cb) => {
		pool.connect((error, client, done) => {
			const pgStream = client.query(copyFrom(query))
				.on("end", () => {
					done();
					return cb();
				})
				.on("error", error => {
					done();
					return cb(error);
				});
			fs.createReadStream(filepath, {encoding: "utf8"})
				.pipe(csv.parse())
				.pipe(csv.transform(transform))
				.pipe(csv.stringify())
				.pipe(pgStream);
		});
	}, callback);
};

Base.prototype._destroyAll = function (callback) {
	if (process.env.NODE_ENV !== "test") {
		return callback(
			`Aborting. Tried to wipe database outside of testing environment`
		);
	}

	this._query("drop schema public cascade", (error) => {
		if (error) return callback(error, null);
		this._query("create public schema", callback);
	});
};

Base.prototype._getClient = function (callback) {
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

		const args = [(error) => {
			if (error) return callback(error);
			// Restore model name
			Model.relation = originalName;
			async.forEachSeries([
				// Drop existing archived table
				`DROP TABLE IF EXISTS ${archivedName}`,
				// Designate current table as archived table
				`ALTER TABLE IF EXISTS ${originalName} RENAME TO ${archivedName}`,
				// Swap in new table
				`ALTER TABLE ${tempName} RENAME TO ${originalName}`,
			], Model._query.bind(Model), callback);
		}];

		if (sourceFile) args.unshift(sourceFile);

		Model._setupTable.apply(Model, args);
	};
};

const toTempName = name => `${name}_temp`;
const toArchiveName = name => `${name}_archived`;

const indexCache = {};
let ONSPD_CSV_SCHEMA;

/**
 * Returns the index location of an ONSPD param, -1 if not found
 * @param  {string} code ONSPD column code e.g. `pcd`
 * @return {number}
 */
const indexFor = code => {
	if (indexCache[code] !== undefined) return indexCache[code];
	if (ONSPD_CSV_SCHEMA === undefined) ONSPD_CSV_SCHEMA = require("../../data/onspd_schema.json");
	indexCache[code] = ONSPD_CSV_SCHEMA.reduce((result, elem, i) => {
		if (elem.code === code) return i;
		return result;
	}, -1);
	return indexCache[code];
};

/**
 * Extracts the value for `code` from an ONSPD CSV record
 * @param  {string[]} row
 * @param  {string} code
 * @return {string}
 */
const extractOnspdVal = exports.extractOnspdVal = (row, code) => row[indexFor(code)];

module.exports = {
	Base,
	populateLocation,
	setupWithTableSwap,
	toTempName,
	toArchiveName,
	extractOnspdVal,
};
