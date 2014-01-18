var path = require("path"),
		extend = require('node.extend'),
		rootPath = path.normalize(__dirname + '/..'),
		config;

// Extend general config here (config that applies to all environments)
var defaultConfig = {
	root: rootPath,
	postgres: {
		user: "idealpostcodes",
		password: "",
		database: "postcodeio",
		host: "localhost",
		port: 5313
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
		env : "test"	
	},

	// Production env only config
	production : {
		env : "production",
		postgres: {
			user: "",
			password: "",
			database: "",
			host: "",
			port: 5313
		},
		log : {
			name : "postcodes.io",
			file : "/var/postcodesio/logs/production.log",
			stdout : true
		}
	}
}


module.exports = function (env) {
	if (config) return config;
	return config = extend(true, defaultConfig, envConfig[env]);
};

