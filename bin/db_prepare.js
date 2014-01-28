#!/usr/bin/env node

var env = process.env.NODE_ENV || "development",
		fs = require("fs"),
		path = require("path"),
		config = require(path.join(__dirname, "../config/config"))(env),
		Base = require(path.join(__dirname, "../app/models")),
		Postcode = require(path.join(__dirname, "../app/models/postcode.js")),
		pg = Base.connect(config);

Postcode._destroyRelation(function (error, result) {
	if (error) throw error;
	console.log("Dropped Postcode database");
	Postcode._createRelation(function (error, result) {
		if (error) throw error;
		console.log("Created new Postcode database");
		process.exit(0);
	});
});