"use strict";

const fs = require("fs");
const pg = require("pg");
const copyFrom = require("pg-copy-streams").from;
const async = require("async");
const path = require("path");
const csv = require("csv");
const env = process.env.NODE_ENV || "development";
const defaults = require(path.join(__dirname, "../../config/config.js"))(env);
const config = defaults.postgres;

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

	pg.connect(config, (error, client, done) => {
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
	}

	for (let i = 0; i < this.indexes.length; i += 1) {
		indexExecution.push(returnInstruction(this.indexes[i]));
	}

	async.series(indexExecution.map(instruction => {
		return callback => this._query(instruction, callback)
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

	async.eachSeries(filepath, (filepath, cb) => {
		pg.connect(config, (error, client, done) => {
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

	this._query("drop schema public cascade", (error, result) => {
		if (error) return callback(error, null);
		this._query("create public schema", callback);
	});
};

Base.prototype._getClient = function (callback) {
	pg.connect(config, callback);
};

const dollarise = values => values.map((_, i) => `$${i + 1}`).join(", ");

module.exports = {
	connect: function (configObj, callback) {
		const cb = callback || function(){};
		pg.connect(config, cb);	
		return pg;
	},
	Base: Base
};
