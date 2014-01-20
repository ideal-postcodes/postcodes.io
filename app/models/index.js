var pg = require("pg"),
		config;

// All models inherit from base
function Base () {

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

Base.prototype._createDatabase = function (callback) {
	var query = "CREATE TABLE"
	this._query(query, callback);
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