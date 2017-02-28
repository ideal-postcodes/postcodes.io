"use strict";

const morgan = require("morgan");
const Logger = require("commonlog-bunyan");

/**
 * Sets up node-bunyan logger and logging in middleware
 */

module.exports = (app, config) => {
	Logger.init({
		name: config.log.name,
		streams: config.log.streams
	});

	const logStream = {
		write: message => {
			Logger.logger.info(message.slice(0, -1));
		}
	};

	app.use(morgan("combined", { stream: logStream }));
};
