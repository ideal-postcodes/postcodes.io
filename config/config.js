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
			file : path.join(rootPath, "/logs/development.log"),
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
			file : path.join(rootPath, "/logs/test.log"),
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
			file : path.join(rootPath, "/logs/production.log"),
			stdout : true
		}
	}
};

module.exports = function (environment) {
	return config[environment];
};