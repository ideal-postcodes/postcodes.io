var path = require("path"),
		extend = require('node.extend'),
		rootPath = path.normalize(__dirname + '/..'),
		config;

// Extend general config here (config that applies to all environments)
var defaultConfig = {
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
};

// Extend environment specific config here, overrides above if clash
var envConfig = {
	// Development env only config
	development : {
		env : "development"
	},

	// Test env only config
	test: {
		env : "test",
		log: {
			stdout: false
		}
	},

	// Production env only config
	production : {
		env : "production",
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
	if (config) return config;
	return config = extend(true, defaultConfig, envConfig[environment]);
};

