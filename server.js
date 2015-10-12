"use strict";

var path = require("path");
var env = process.env.NODE_ENV || "development";
var config = require(path.join(__dirname, "config/config"))(env);

if (env === "test" || process.env.PMX) {
	require('pmx').init({
		http : true
	});
}

var express = require("express");
var app = express();

require(path.join(__dirname, "/config/logger"))(app, config);
require(path.join(__dirname, "/config/db"))(config);
require(path.join(__dirname, "/config/express"))(app, config);
require(path.join(__dirname, "/config/routes"))(app);
require(path.join(__dirname, "/config/renderer"))(app);

var port = config.port || 8000;
app.listen(port);
console.log("Postcode API listening on port", port);

exports = module.exports = app;
