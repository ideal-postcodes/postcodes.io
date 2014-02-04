var path = require("path");

module.exports = function (config) {
	var Base = require(path.join(__dirname, "../app/models"));
	return Base.connect(config);
}