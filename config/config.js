var path = require("path"),
		bsyslog = require("bunyan-syslog"),
		rootPath = path.join(__dirname, '../');

var config = {
	development : {
		env : "development",
		root: rootPath,
		postgres: {
			user: "postgres",
			password: "",
			database: "postcodeio",
			host: "localhost",
			port: 5432
		},
		log : {
			name : "postcodes.io",
			streams: [{
				path : path.join(rootPath, "/logs/development.log")	
			}, {
				stream: process.stdout
			}]
		}
	},

	test: {
		env : "test",
		root: rootPath,
		postgres: {
			user: "postgres",
			password: "",
			database: "postcodeio_test",
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

	production : {
		env : "production",
		root: rootPath,
		postgres: {
			user: "",
			password: "",
			database: "",
			host: "",
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
	return config[environment];
};