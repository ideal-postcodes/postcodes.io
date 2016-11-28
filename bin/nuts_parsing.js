#!/usr/bin/env node

/*
 * TSV parsing to extract NUTS GSS codes
 *
 */

const async = require("async");
const argv = require('minimist')(process.argv.slice(2));
const fs = require("fs");
const csv = require("csv");

if (argv.h) {
	console.log(
`Commands:
- Specify files to distill as last arguments
- Code Index (e.g. E05008942) -i [Specify the position where the inner can be found, 0 indexed, default 0]
- Inner Code Index (e.g. UKN05) -ci [Specify the position where the inner code can be found, 0 indexed, default 4]
- Name Index -ni [Specify the position where the name can be found, 0 indexed, default 5]
- Skip first line --skip [Skip the first line, defaults to true]`);
	process.exit(0);
}

const codeIndex = argv.i || 0;
const innerCodeIndex = argv.ci || 4;
const nameIndex = argv.ni || 5;
const skipFirstLine = argv.skip === undefined ? true : argv.skip;

const files = argv._;
if (files.length === 0) {
	console.log("Please specifiy a file path or multiple paths");
	process.exit(0);
} else {
	files.forEach(file => {
		if (!fs.existsSync(file)) {
			console.log(file, "is not a valid file");
			process.exit(0);
		}
	});
}

const delimiter = "	";

const output = {};

const createCsvStream = file => {
	const transform = (row, index) => {
		if (index === 0 && skipFirstLine) return null;
		output[row[codeIndex]] = {
			code: row[innerCodeIndex],
			name: row[nameIndex]
		}
		return row;
	}

	return callback => {
		stream = csv()
			.from
			.stream(fs.createReadStream(file, { encoding: 'utf-8' }), {
				delimiter: delimiter
			})
			.transform(transform)
			.on('end', () => {
				callback();
			})
			.on('error', callback);
	}
};

async.series(files.map(file => {
	return createCsvStream(file);
}), error => {
	if (error) {
		console.log("An error occurred", error);
		console.log(error);
		process.exit(0);
	}
	console.log(JSON.stringify(output, 2, 2));
	process.exit(0);
});
