var assert = require("chai").assert,
		path = require("path"),
		rootPath = path.join(__dirname, "../../");

var env = process.env.NODE_ENV || "development",
		config = require(rootPath + "/config/config")(env);

module.exports = {
	rootPath: rootPath,
	config: config
}