#!/usr/bin/env node

/*
 *
 * This script checks for missing ONS Codes in the ONS Postcode Directory
 *
 * To run: node data_points.js /path/to/postcode/directory.csv
 *
 * This parses every line of the directory returns result to stdout
 *
 */

var	fs = require("fs");
var path = require("path");
var csv = require("csv");
var argv = require('minimist')(process.argv.slice(2));

var codeTypes = ["nhsHa", "counties", "districts", "wards", "parishes", "constituencies", 
	"european_registers", "regions", "pcts", "lsoa", "msoa", "nuts", "ccgs"];

var typeOffset = {
	nhsHa: 12,
	counties: 5,
	districts: 6,
	wards: 7,
	parishes: 44,
	constituencies: 17,
	european_registers: 18,
	regions: 15,
	pcts: 21,
	lsoa: 42,
	msoa: 43,
	nuts: 22,
	ccgs: 46
};

var source = argv._[0];
if (!source || !fs.existsSync(source)) {
	console.log("Please specificy ONSPD Directory source file");
	process.exit(0);
}

var type = argv.type;
if (type) {
	if (!codeTypes.some(function (codeType) { return codeType === type })) {
		console.log("Please specify a valid code type using --type=", codeTypes);
		process.exit(0);
	} else {
		codeTypes = [type];
	}
}

// Load data sources
var data = {};
var missingData = {};
codeTypes.forEach(function (codeType) {
	missingData[codeType] = {};
	data[codeType] = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/") + codeType + ".json"));
});

var check = function (row, type) {
	var elem = row[typeOffset[type]];
	if (elem === "") {
		return;
	} else {
		if (typeof data[type][elem] === 'undefined') {
			if (typeof missingData[type][elem] !== 'number') {
				missingData[type][elem] = 0;
			} else {
				missingData[type][elem] += 1;
			}
		}
	}
};
			
var transform = function (row, index) {
	// Skip row if terminated postcode
	if (row[4].length !== 0) return null;
	
	codeTypes.forEach(function (codeType) {
		check(row, codeType);
	});
};

var stream = csv({delimiter: "	"})
	.from.stream(fs.createReadStream(source))
	.transform(transform)
	.on('end', function(count){
	  console.log(JSON.stringify(missingData, 2, 2));
	  process.exit(0);
	})
	.on('error', function(error){
	  console.log(error.message);
	  process.exit(0);
	});


