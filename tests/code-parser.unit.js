"use strict";

const path = require("path");
const assert = require("chai").assert;
const {extract} = require("../data/scripts/index.js");

describe("ONS Code Extraction", () => {
	it ("returns an error if no data directory provided", done => {
		extract({
			configs: [], 
			done: (error, result) => {
				assert.match(error.message, /please specify a data path/i);
				done();
			}
		});
	});

	describe("with valid data directory", () => {
		let argv;

		before(() => {
			// Overwrite argv to point to correct data directory
			argv = process.argv;
			process.argv = process.argv.slice();
			process.argv.push("-d");
			process.argv.push(path.join(__dirname, "./seed/ons_codes"));
		});

		after(() => {
			// Restore argv
			process.argv = argv;
		});

		describe("extract", () => {

			it ("returns error if invalid file present", done => {
				extract({
					configs: [{
						file: "foo"
					}, {
						file: "bar"
					}], 
					done: (error, result) => {
						assert.match(error.message, /files cannot be resolved/i);
						done();
					}
				});
			});

			it ("extracts data for given files", done => {
				const transform = row => {
					const keyIndex = 0;
					const valueIndex = 3;
					if (row[keyIndex] === "CTRY12CD") return []; // Escape if header
					return [row[keyIndex], row[valueIndex]];
				};

				extract({
					configs: [{
						transform,
						file: "countries.txt",
						parseOptions: {
							relax_column_count: true
						}
					}], 
					done: (error, result) => {
						assert.isNull(error);
						assert.equal(result.size, 6);
						assert.equal(result.get("E92000001"), "England");
						done();
					}
				});
			});
		});
	});
});
