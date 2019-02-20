"use strict";

const env = process.env.NODE_ENV || "development";
const favicon = require("serve-favicon");
const bodyParser = require("body-parser");
const express = require("express");
const { join } = require("path");
const cors = require("cors")({
	origin: "*",
	methods: "GET,POST,OPTIONS",
	allowedHeaders: "X-Requested-With, Content-Type, Accept, Origin"
});

module.exports = app => {
	app.enable("trust proxy");
	app.disable("x-powered-by");
  app.set("views", join(__dirname, "../app/views"));
  app.set("view engine", "ejs");

	// Should be handled by webserver in production
	if (env !== "production") {
		app.use(favicon("public/favicon.ico"));
    app.use(express.static(join(__dirname, "../public")));
	}
	app.use(cors);
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
};
