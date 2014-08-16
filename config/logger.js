var morgan = require("morgan");
var Logger = require("commonlog-bunyan");

/**
 * Sets up node-bunyan logger and logging in middleware
 */

module.exports = function (app, config) {
	Logger.init({
		name: config.log.name,
		streams: config.log.streams
	});

	var logStream = {
		write: function (message, encoding) {
			Logger.logger.info(message.slice(0, -1));
		}
	} 

	app.use(morgan("combined", { stream: logStream }));
}