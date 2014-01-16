var logger = require("commonlog-bunyan"),
		streams = [];

module.exports = function (config) {
	if (config.log.stdout) {
		streams.push({
			stream: process.stdout
		})
	}

	if (config.log.file.length !== 0) {
		streams.push({
			path: config.log.file
		})
	}

	return logger.init({
		name: config.name
		streams: streams
	});
}