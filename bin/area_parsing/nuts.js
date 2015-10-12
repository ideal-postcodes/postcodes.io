"use strict";

var fs = require("fs");
var path = require("path");
var onsParser = require("./index.js");
var argv = require("minimist")(process.argv.slice(2));
var source = argv._[0];
var output = {};

var handleError = function (error) {
	console.log("An error occurred");
		console.log(error);
		process.exit(0);
}

onsParser({
	source: source,
	extract: function (row) {
		var id = row[0];
		if (id === 'LAU215CD') return;
		var nutsCode = row[0];
		var nutsName = row[1];
		output[id] = {
			code: id,
			name: nutsName
		};
	}
}, function (error, result) {
	if (error) return handleError(error);
	fs.writeFile(path.join(__dirname, "output/nuts2.json"), JSON.stringify(output,2,2), {
		encoding: "utf8"
	}, function (error) {
		if (error) return handleError(error);
		console.log("Completed parse");
		process.exit(0);
	});
});