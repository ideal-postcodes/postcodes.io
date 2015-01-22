var path = require("path");
var bsyslog = require("bunyan-syslog");
var rootPath = path.join(__dirname, '../');
var defaults = {
	nearest: {
		radius: {
			DEFAULT: 100,
			MAX: 5000
		},
		limit: {
			DEFAULT: 10,
			MAX: 100
		}
	},
	search: {
		limit: {
			DEFAULT: 10,
			MAX: 100
		}
	},
	bulkGeocode: {
		geolocations: {
			MAX: 100
		}
	},
	bulkLookups: {
		postcodes: {
			MAX: 100
		}
	}
};

var config = {

	/*
	* Development Environment (Default) Configuration Object ($ node server.js)
	* 
	* This is the default environment. i.e. it's the environment config when the
	* server is booted up with `$ node server.js`
	*
	* The only action you need to take here is to add your Postgres credentials.
	* You also need to create the database yourself and pass in the database name.
	* Note that the specified user needs to be a superuser for the import process
	* (`$ importons`). You may reduce user privileges after you've imported 
	* postcode data
	*
	*/ 

	development : {
		env : "development",
		root: rootPath,
		defaults: defaults,
		postgres: {
			user: "postcodesio",
			password: "password",
			database: "postcodesiodb",	// Database name
			host: "localhost",
			port: 5432
		},
		log : {
			name : "postcodes.io",
			streams: [{
				stream: process.stdout
			}]
		}
	},

	/*
	* Test Environment (Optional, if you want to npm test)
	* 
	* Do not use the same Postgres credentials for the test database as your production
	* or development environments as this environment needs to reset the postcode table
	*
	*/ 

	test: {
		env : "test",
		root: rootPath,
		defaults: defaults,
		postgres: {
			user: "postcodesio",
			password: "password",
			database: "postcodeio_testing",
			host: "localhost",
			port: 5432
		},
		log: {
			name : "postcodes.io",
			streams: [{
				path : path.join(rootPath, "/logs/test.log")	
			}]
		}
	},

	/*
	* Production Environment Configuration Object
	* 
	* This is the production environment. `$ NODE_ENV=production node server.js`
	*
	*/ 

	production : {
		env : "production",
		root: rootPath,
		defaults: defaults,
		postgres: {
			user: "postcodesio",
			password: "password",
			database: "postcodesiodb",
			host: "localhost",
			port: 5432
		},
		log : {
			name : "postcodes.io",
			streams: [{
				path : path.join(rootPath, "/logs/production.log")	
			}]
		}
	}
};

module.exports = function (environment) {
	return config[environment] || config["development"];
};
