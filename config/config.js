var path = require("path"),
		rootPath = path.normalize(__dirname + '/..');

module.exports = {
	development : {
		env : "development",
		root: rootPath,
		log : {
			name : "postcodes.io",
			file : "",
			stdout : true
		}
	},
	test : {
		env : "test",
		root: rootPath,
		log : {
			name : "postcodes.io",
			file : "",
			stdout : true
		}
	},
	production : {
		env : "production",
		root: rootPath,
		log : {
			name : "postcodes.io",
			file : "",
			stdout : true
		}
	}
}