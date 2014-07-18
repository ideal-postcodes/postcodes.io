var path = require("path");
var logger = require("commonlog-bunyan");
var env = process.env.NODE_ENV || "development";
var config = require(path.join(__dirname, "../../config", "config.js"))(env);

exports.home = function (request, response) {
	response.render("pages/home", {
		ga: config.googleAnalyticsKey
	});
}

exports.documentation = function (request, response) {
	response.render("pages/documentation", {
		ga: config.googleAnalyticsKey
	});
}

exports.about = function (request, response) {
	response.render("pages/about", {
		ga: config.googleAnalyticsKey
	});
}