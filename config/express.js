"use strict";

const favicon = require("serve-favicon");
const bodyParser = require("body-parser");
const express = require("express");
const path = require("path");
const cors = require("cors")({
	origin: "*",
	methods: "GET,POST,OPTIONS",
	allowedHeaders: "X-Requested-With, Content-Type, Accept, Origin"
});

module.exports = (app, config) => {
	app.enable("trust proxy");
 	app.disable("x-powered-by");
	app.set("views", path.join(config.root, "app/views"));
  app.set("view engine", "jade");

	// Should be handled by webserver in production
	if (config.env !== "production") {
		app.use(favicon("public/favicon.ico"));
		app.use(express.static(path.join(config.root, "/public")));
	}
	app.use(cors);
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
};
