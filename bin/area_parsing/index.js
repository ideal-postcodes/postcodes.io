"use strict";

var fs = require("fs");
var parse = require("csv-parse");
var Iconv = require("iconv").Iconv;
var iconv = new Iconv('iso-8859-1', 'utf-8');
var path = require("path");

module.exports = function (options, callback) {
	var source = options.source;
	var extract = options.extract;
	var input = fs.createReadStream(source);
	var parser = parse({
		delimiter: "\t"
	});

	input
		.pipe(iconv)
		.pipe(parser)
		.on('data', function (row, index) {
			if (index === 0) return null;
			extract(row, index);
			return row;
		})
		.on('end', function(count){
		  return callback(null, count);
		})
		.on('error', callback);
};