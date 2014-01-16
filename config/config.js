var path = require("path"),
		rootPath = path.normalize(__dirname + '/..');

module.exports = {
	development : {
		env : "development",
		log : {
			name : "postcodes.io",
			file : "",
			stdout : true
		}
	},
	test : {
		env : "test",
		log : {
			name : "postcodes.io",
			file : "",
			stdout : true
		}
	},
	production : {
		env : "production",
		log : {
			name : "postcodes.io",
			file : "",
			stdout : true
		}
	}
}