"use strict";

const {extract} = require("./index");

/**
 * @module DataParser/parishes
 *
 * Writes parishes.json to stdout
 *
 * Notes:
 * - Manually add 4 missing GSS parish codes
 */

const CODE_OFFSET = 0;
const VALUE_OFFSET = 1;

const transform = row => {
	const code = row[CODE_OFFSET];
	const value = row[VALUE_OFFSET];
	if (code === "PAR15CD") return []; // Escape if header
	return [code, value];
};

const UNPARISHED_CODE_OFFSET = 0;
const UNPARISHED_VALUE_OFFSET = 1;

const unparishedTransform = row => {
	const code = row[UNPARISHED_CODE_OFFSET];
	const value = row[UNPARISHED_VALUE_OFFSET];
	if (code === "NCP16CD") return []; // Escape if header
	return [code, value];
};


const appendMissing = {
	"E43000234": "Three Rivers, unparished area",
	"E43000097": "Lancaster, unparished area",
	"E43000135": "Waveney, unparished area",
	"E43000245": "Swindon, unparished area"
};

const configs = [
	{
		file: "Parish LAD names and codes UK as at 12_16.txt",
		transform
	},
	{
		file: "Unparished areas names and codes EN as at 05_17.txt",
		transform: unparishedTransform
	}
];

extract({ 
	configs,
	appendMissing
});
