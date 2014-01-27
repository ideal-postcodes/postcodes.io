var pg = require("pg"),
		config;

// All models inherit from base
// Requires schema and relation name
function Base (relation, schema) {
	this.relation = relation;
	this.schema = schema;
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
		if (error) callback(error, null);
		client.query(query, params, function (error, result) {
			if (error) throw error;
			callback(null, result);
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

Base.prototype._createRelation = function (callback) {
	var query = ["CREATE TABLE", this.relation].join(" "),
			columns = [],
			schema = this.schema;

	for (column in schema) {
		columns.push(column + " " + schema[column]);
	}

	query += " ( " + columns.join(", ") + " ) ";

	this._query(query, callback);
};

Base.prototype._destroyRelation = function (callback) {
	this._query("DROP TABLE " + this.relation, callback);
}

module.exports = {
	connect: function (configObj, callback) {
		config = configObj.postgres;
		if (callback) {
			pg.connect(config, callback);	
		} else {
			pg.connect(config);	
			return pg;	
		}
	},
	Base: Base
};

Base.prototype._csvSeed = function (filePath, columns, callback) {
	var query = "COPY " + this.relation + " (" + columns + ") FROM '" + filePath + "' DELIMITER ',' CSV";
	this._query(query, callback);
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