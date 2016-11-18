"use strict";

const path = require("path");
const env = process.env.NODE_ENV || "development";
const config = require(path.join(__dirname, "config/config"))(env);

if (env === "test" || process.env.PMX) {
	require('pmx').init({
		http : true
	});
}

const express = require("express");
const app = express();

require(path.join(__dirname, "/config/logger"))(app, config);
require(path.join(__dirname, "/config/db"))(config);
require(path.join(__dirname, "/config/express"))(app, config);
require(path.join(__dirname, "/config/routes"))(app);
require(path.join(__dirname, "/config/renderer"))(app);

const port = config.port || 8000;

const server = app.listen(port);

server.on("clientError", (error, socket) => {
	if (!socket.destroyed) {
		socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
	}
});

console.log("Postcode API listening on port", port);

exports = module.exports = app;
