var express = require("express");
var app = express();
var path = require("path");
var env = process.env.NODE_ENV || "development";

// Load in config
var config = require(path.join(__dirname, "config/config"))(env);

// Load DB connection
require(path.join(__dirname, "config/db"))(config);

// Start logging
require(path.join(__dirname, "/config/logger"))(app, config);

// Configure Express
require(path.join(__dirname, "/config/express"))(app, config);

// Load in Routes
require(path.join(__dirname, "/config/routes"))(app);

// Load in Response Renderer
require(path.join(__dirname, "/config/renderer"))(app);

var port = config.port || 8000;
app.listen(port);
console.log("Postcode API listening on port", port);

exports = module.exports = app;