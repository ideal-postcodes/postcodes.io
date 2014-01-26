var pg = require("pg"),
		config;

// All models inherit from base
// Requires schema and relation name
function Base (relation, schema) {
	this.relation = relation;
	this.schema = schema;
}

// To implement 'parameterised' queries
Base.prototype._query = function (query, callback) {
	if (!config) {
		var err = new Error("Database connection not yet configured.");
		callback(err, null);
	}
	pg.connect(config, function (error, client, done) {
		if (error) callback(error, null);
		client.query(query, function (error, result) {
			if (error) throw error;
			callback(null, result.rows);
			done();
		});
	});
}

Base.prototype._create = function () {};
Base.prototype._read = function () {};
Base.prototype._update = function () {};
Base.prototype._destroy = function () {};

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


