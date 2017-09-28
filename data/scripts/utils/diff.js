"use strict";

/**
 * @module OnsCodeUtils/diff
 *
 * Takes a base file and target file as 1st and 2nd args respectively
 *
 * Performs the following checks in the order below:
 * 1. Looks for attributes which exist on base file but not on target file
 * 2. For all attributes on base file, compares the strings and looks for diff
 *
 * Prints output to console
 * 
 */

const path = require("path");
const utils = require("./index.js");
const argv = utils.argv();

const base = path.resolve(argv._[0]);
const target = path.resolve(argv._[1]);

const baseData = require(path.resolve(base));
const targetData = require(path.resolve(target));

const baseAttributes = Object.keys(baseData);
const targetAttributes = new Set(Object.keys(targetData));

console.log(`
Listing codes which exist on: ${base}
but not on ${target}
`);

const missingCodes = baseAttributes.filter(attr => !targetAttributes.has(attr));

if (missingCodes.length) {
	console.log(JSON.stringify(missingCodes, 2, 2));
} else {
	console.log("No missing codes found");
}

console.log(`
Listing codes values from: ${base}
that do not match ${target}
`);

const misMatchedValues = baseAttributes.reduce((acc, code) => {
	const baseValue = baseData[code];
	const targetValue = targetData[code];
	if (targetValue === undefined) return acc;
	if (baseValue === targetValue) return acc;
	acc[code] = {
		"base value": baseValue,
		"target value": targetValue
	};
	return acc;
}, {});

console.log(JSON.stringify(misMatchedValues, 2, 2));
