var pg = require("pg");
var copyFrom = require("pg-copy-streams").from;
var async = require("async");
var path = require("path");
var csv = require("csv");
var env = process.env.NODE_ENV || "development";
var defaults = require(path.join(__dirname, "../../config/config.js"))(env);
var config = defaults.postgres;

// All models inherit from base
// Requires schema and relation name
function Base (relation, schema, indexes) {
	this.relation = relation;
	this.schema = schema;
	this.indexes = indexes;
}

// To implement 'parameterised' queries
Base.prototype._query = function (query, params, callback) {
	if (typeof params === "function") {
		callback = params;
		params = [];
	}

	if (!config) {
		var err = new Error("Database connection not yet configured.");
		callback(err, null);
	}
	pg.connect(config, function (error, client, done) {
		if (error) return callback(error, null);
		client.query(query, params, function (error, result) {
			callback(error, result);
			done();
		});
	});
}

Base.prototype._create = function (newRecord, callback) {
	var query = ["INSERT INTO", this.relation],
			cols = [], 
			values = [];

	for (col in newRecord) {
		if (!this.schema[col]) return callback(new Error("Could not create record.", col, "does not exist"), null);
		cols.push(col);
		values.push(newRecord[col]);
	}
	
	query.push("(" + cols.join(", ") + ")");
	query.push("VALUES (" + dollarise(values) + ")");
	this._query(query.join(" "), values,callback);
};

Base.prototype.all = function (callback) {
	this._query("SELECT * FROM " + this.relation, callback);
}

Base.prototype.clear = function (callback) {
	this._query("DELETE FROM " + this.relation, callback);
}

Base.prototype._createRelation = function (callback) {
	var query = ["CREATE TABLE IF NOT EXISTS", this.relation].join(" "),
			columns = [],
			schema = this.schema;

	for (column in schema) {
		columns.push(column + " " + schema[column]);
	}

	query += " ( " + columns.join(", ") + " ) ";

	this._query(query, callback);
};

Base.prototype._destroyRelation = function (callback) {
	this._query("DROP TABLE IF EXISTS " + this.relation + " CASCADE", callback);
}

Base.prototype.createIndexes = function (callback) {
	var self = this;
	var indexExecution = [];
	var	returnInstruction = function (index) {
			var instruction = ["CREATE"];
			if (index.unique) {
				instruction.push("UNIQUE INDEX");
			} else {
				instruction.push("INDEX");
			}
			instruction.push("ON " + self.relation);
			instruction.push("USING " + (index.type || "BTREE"));
			instruction.push("(");
			instruction.push(index.column);
			if (index.opClass) {
				instruction.push(index.opClass);
			}
			instruction.push(")");
			return instruction.join(" ");
		}

	for (var i = 0; i < this.indexes.length; i += 1) {
		indexExecution.push(returnInstruction(this.indexes[i]));
	}

	async.series(indexExecution.map(function (instruction) {
			return function (callback) {
				self._query(instruction, callback);
			}
	}), callback);
}

Base.prototype._csvSeed = function (filePath, columns, transform, callback) {
	if (arguments.length !== 4) throw new Error("Insufficient number of arguments specified");

	transform = transform || function (row, index) {return row;};

	var query = "COPY " + this.relation + " (" + columns + ") FROM STDIN DELIMITER ',' CSV",
			pgStream;

	pg.connect(config, function (error, client, done) {
		pgStream = client.query(copyFrom(query));
		csv().from.path(filePath).transform(transform).pipe(pgStream);
		pgStream.on("end", function () {
			done();
			return callback();
		});
		pgStream.on("error", function (error) {
			done();
			return callback(error);
		});
	});
}

Base.prototype._destroyAll = function (callback) {
	if (process.env.NODE_ENV !== "test") {
		throw new Error("Tried to wipe database outside of testing environment. " + 
										"Now go stand in a corner and think about what you've done");
	}
	this._query("drop schema public cascade", function (error, result) {
		if (error) return callback(error, null);
		this._query("create public schema", callback);
	});
}

var dollarise = function (values) {
	var result = [];
	values.forEach(function (elem, index) {
		result.push("$" + index + 1);
	});
	return result.join(", ");
}

module.exports = {
	connect: function (configObj, callback) {
		var cb = callback || function(){};
		// config = configObj.postgres;
		pg.connect(config, cb);	
		return pg;
	},
	Base: Base
};

