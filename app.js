"use strict";

const path = require("path");
const express = require("express");

exports = module.exports = config => {
	const app = express();
	require(path.join(__dirname, "/config/logger"))(app, config);
	require(path.join(__dirname, "/config/db"))(config);
	require(path.join(__dirname, "/config/express"))(app, config);
	require(path.join(__dirname, "/config/routes"))(app);
	require(path.join(__dirname, "/config/renderer"))(app);
	return app;
};
