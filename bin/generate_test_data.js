#!/usr/bin/env node

var fs = require("fs");
var path = require("path");
var csv = require("csv")
var dataPath = process.argv[process.argv.length - 1]
var datasetSize = 5000;
var currentSize = 0;
var targetPath = path.join(__dirname, '../tests/seed/postcode.csv');

var stream = csv()
	.from.stream(fs.createReadStream(dataPath))
	.to.path(targetPath)
	.transform( function(row){
		if (row[4].length !== 0) {
			return null;
		}
		currentSize++;
	  return row;
	})
	.on('record', function () {
		if (currentSize === datasetSize) {
			stream.end();
		}
	})
	.on('end', function(count){
	  console.log("Completed dump. Stored at", path.join(__dirname, '/postcodes.csv'))
	  process.exit(0);
	})
	.on('error', function(error){
	  console.log(error.message);
	  process.exit(0);
	});