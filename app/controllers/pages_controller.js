"use strict";

const config = require("../../config/config")();

exports.home = (request, response) => {
	response.render("pages/home", {
		ga: config.googleAnalyticsKey
	});
};

exports.documentation = (request, response) => {
	response.render("pages/documentation", {
		ga: config.googleAnalyticsKey
	});
};

exports.about = (request, response) => {
	response.render("pages/about", {
		ga: config.googleAnalyticsKey
	});
};

exports.explore = (request, response) => {
	response.render("pages/explore", {
		ga: config.googleAnalyticsKey,
		mapBoxKey: config.mapBoxKey
	});
};
