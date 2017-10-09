"use strict";

/**
 * @module OnsCodeUtils/nuts_diff
 *
 * Takes a base file and target file as 1st and 2nd args respectively for NUTS
 * codes
 *
 * Performs the following checks in the order below:
 * 1. Looks for attributes which exist on base file but not on target file
 * 2. For all "code" attributes on base file, compares the strings and looks for diff
 * 3. For all "name" attributes on base file, compares the strings and looks for diff
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
Listing CODES from: ${base}
that do not match ${target}
`);

console.log(JSON.stringify(baseAttributes.reduce((acc, code) => {
	const baseValue = baseData[code].code;
	if (targetData[code] === undefined) return acc;
	const targetValue = targetData[code].code;
	if (baseValue === targetValue) return acc;
	acc[code] = {
		"base code": baseValue,
		"target code": targetValue
	};
	return acc;
}, {}), 2, 2));

console.log(`
Listing NAMES from: ${base}
that do not match ${target}
`);

console.log(JSON.stringify(baseAttributes.reduce((acc, code) => {
	const baseValue = baseData[code].name;
	if (targetData[code] === undefined) return acc;
	const targetValue = targetData[code].name;
	if (baseValue === targetValue) return acc;
	acc[code] = {
		"base name": baseValue,
		"target name": targetValue
	};
	return acc;
}, {}), 2, 2));
