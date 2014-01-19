var pg = require("pg"),
		conString;

// All models inherit from base
function Base () {

}

// To implement 'parameterised' queries
Base.prototype._query = function (query, callback) {
	if (!conString) {
		var err = new Error("Database connection not yet configured.");
		callback(err, null);
	}
	pg.connect(conString, function (error, client, done) {
		if (error) callback(error, null);
		client.query(query, function (error, result) {
			if (error) throw error;
			callback(null, result.rows);
			done();
		});
	});
}

module.exports = {
	// Connect to DB
	connect: function (config, callback) {
		var pgConfig = config.postgres;

		conString = ["pg://", pgConfig.user, ":", pgConfig.port, "@", pgConfig.host, "/", pgConfig.database];
			
		if (callback) {
			pg.connect(conString.join(""), callback);	
		} else {
			pg.connect(conString.join(""));	
			return pg;	
		}
	},
	Base: Base
};