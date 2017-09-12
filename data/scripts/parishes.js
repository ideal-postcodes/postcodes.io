"use strict";

const {extract} = require("./index");

/**
 * @module DataParser/parishes
 *
 * Writes parishes.json to stdout
 *
 * Notes:
 * - An external data file from ONS is required to extract "unparished areas"
 * http://geoportal.statistics.gov.uk/datasets/1ed0ac3004b6430fb0c54e6694a490cb_0
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

const ONS_UNPARISHED_CODE_OFFSET = 0;
const ONS_UNPARISHED_VALUE_OFFSET = 1;

const onsUnparishedTransform = row => {
	const code = row[ONS_UNPARISHED_CODE_OFFSET];
	const value = row[ONS_UNPARISHED_VALUE_OFFSET];
	if (code === "NCP16CD") return []; // Escape if header
	return [code, value];
};

const configs = [
	{
		file: "Parish LAD names and codes UK as at 12_15.txt",
		transform
	},
	{
		file: "Unparished areas names and codes EN as at 12_16.txt",
		transform: unparishedTransform
	},
	{
		file: "NonCivil_Parished_Areas_to_Local_Authority_Districts_December_2016_Lookups_in_England.csv",
		transform: onsUnparishedTransform,
		delimiter: ","
	}
];

extract({ configs });
