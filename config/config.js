var path = require("path"),
		rootPath = path.normalize(__dirname + '/..');

module.exports = {
	development : {
		env : "development",
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
	},
	test : {
		env : "test",
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
	},
	production : {
		env : "production",
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
	}
}