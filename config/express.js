var logger = require("commonlog-bunyan").logger,
		logStream, = {
			write: function (message, encoding) {
				logger.info(message.slice(0, -1));
			}
		};

module.exports = function (app, config) {

	app.use(express.logger({ stream: logStream }))
}