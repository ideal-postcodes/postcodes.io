"use strict";

const path = require("path");
const env = process.env.NODE_ENV || "development";
const config = require(path.join(__dirname, "config/config"))(env);

if (env === "test" || process.env.PMX) {
	require("pmx").init({
		http : true
	});
}

const app = require(path.join(__dirname, "app.js"))(config);

const port = config.port || 8000;

const server = app.listen(port);

server.on("clientError", (error, socket) => {
	if (!socket.destroyed) {
		socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
	}
});

console.log("Postcode API listening on port", port);

module.exports = app;
