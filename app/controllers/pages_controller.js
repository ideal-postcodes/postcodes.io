var logger = require("commonlog-bunyan");

exports.home = function (request, response) {
	response.render("pages/home");
}

exports.documentation = function (request, response) {
	response.render("pages/documentation");
}

exports.about = function (request, response) {
	response.render("pages/about");
}