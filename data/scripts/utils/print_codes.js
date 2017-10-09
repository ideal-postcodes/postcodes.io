"use strict";

const fs = require("fs");
const path = require("path");
const parse = require("csv").parse;
const utils = require("./index.js");
const argv = utils.argv();

const {onspdOffsets, onspdCodeTypes} = utils;

// Retrieve code type and file path
const codeType = argv.t;

if (!onspdCodeTypes.includes(codeType)) throw `Invalid code type (-t) ${codeType}`;

const onspdFilePath = argv.f;
if (!fs.existsSync(onspdFilePath)) throw `Invalid file path (-f) ${onspdFilePath}`;

const parser = parse({ delimiter: "," });
const offset = onspdOffsets[codeType];
const outputFilePath = path.join(__dirname, "output/", `${codeType}.json`);

let count = 0;
const increment = () => {
	count += 1;
	if (count % 100000 === 0) console.log(`Lines read: ${count}`);
};

console.log(`
	Reading from ${onspdFilePath}
	Extracting code "${codeType}"
	Writing to ${outputFilePath}
`);

const codes = new Set();
fs.createReadStream(onspdFilePath)
	.pipe(parser)
	.on("data", row => {
		if (row[4].length !== 0) return; // Skip row if terminated postcode
		codes.add(row[offset]);
		increment();
	})
	.on("end", () => {
		fs.writeFileSync(outputFilePath, Array.from(codes), { encoding: "UTF8" });
	  process.exit(0);
	})
	.on("error", error => {
		console.log(error.message);
	  process.exit(1);
	});
