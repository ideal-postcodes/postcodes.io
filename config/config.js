var path = require("path"),
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
			file : "",
			stdout : true
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
			file : "",
			stdout : false
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
			file : "/var/postcodesio/logs/production.log",
			stdout : true
		}
	}
};

module.exports = function (environment) {
	return config[environment];
};