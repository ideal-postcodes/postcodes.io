var logger = require("commonlog-bunyan");

module.exports = function (config) {
	return logger.init({
		name: config.log.name,
		streams: config.log.streams
	});
}