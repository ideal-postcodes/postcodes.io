var logger = require("commonlog-bunyan").logger;
var morgan = require("morgan");
var favicon = require("static-favicon");
var bodyParser = require("body-parser");
var express = require("express");
var path = require("path");

module.exports = function (app, config) {
	app.enable('trust proxy');
	app.disable('x-powered-by');
	app.set('views', path.join(config.root, 'app/views'));
  app.set('view engine', 'jade');

	// Should be handled by webserver in production
	if (config.env !== "production") {
		app.use(favicon("public/favicon.ico"));
		app.use(express.static(path.join(config.root, '/public')));
	}
	
	app.use(bodyParser());
}