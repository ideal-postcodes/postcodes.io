"use strict";

const {extract, isPseudoCode} = require("./index");

/**
 * @module DataParser/districts
 *
 * Writes districts.json to stdout
 * 
 * Notes:
 * - Pseudocodes are ignored
 * - Some etnries in "Parish LAD names and codes UK as at 12_15.txt" lack a district (1)
 * - NI codes (/95\w/) are drawn from an older file not found in the ONSPD 
 * Document files: LA_UA names and codes UK as at 12_14.txt : Can be retrieved from 
 * https://data.england.nhs.uk/dataset/ods-data-supplied-by-the-office-of-national-statistics/resource/a7157e08-2cd4-42d1-9a9f-3647e7dea078
 * 
 * - Pertinent codes for NI are:
 * 95A	Derry
 * 95B	Limavady
 * 95C	Coleraine
 * 95D	Ballymoney
 * 95E	Moyle
 * 95F	Larne
 * 95G	Ballymena
 * 95H	Magherafelt
 * 95I	Cookstown
 * 95J	Strabane
 * 95K	Omagh
 * 95L	Fermanagh
 * 95M	Dungannon
 * 95N	Craigavon
 * 95O	Armagh
 * 95P	Newry and Mourne
 * 95Q	Banbridge
 * 95R	Down
 * 95S	Lisburn
 * 95T	Antrim
 * 95U	Newtownabbey
 * 95V	Carrickfergus
 * 95W	North Down
 * 95X	Ards
 * 95Y	Castlereagh
 * 95Z	Belfast
 */

const NI_CODE_OFFSET = 0;
const NI_VALUE_OFFSET = 1;

const niCodeRegex = /^95\w$/;

const NI_transform = row => {
	const code = row[NI_CODE_OFFSET];
	const value = row[NI_VALUE_OFFSET];
	if (code === "LAD14CD") return []; // Escape if header
	console.log(code);
	if (!code.match(niCodeRegex)) return []; // Escape if not NI code
	return [code, value];
};

const LA_UA_CODE_OFFSET = 0;
const LA_UA_VALUE_OFFSET = 1;

const LA_UA_NAMES_transform = row => {
	const code = row[LA_UA_CODE_OFFSET];
	const value = row[LA_UA_VALUE_OFFSET];
	if (code === "LAD16CD") return []; // Escape if header
	return [code, value];
};

const PARISH_LAD_CODE_OFFSET = 2;
const PARISH_LAD_VALUE_OFFSET = 3;

const PARISH_LAD_NAMES_transform = row => {
	const code = row[PARISH_LAD_CODE_OFFSET];
	const value = row[PARISH_LAD_VALUE_OFFSET];
	if (code === "LAD15CD") return []; // Escape if header
	if (isPseudoCode(code)) return [];
	if (code.length * value.length === 0) return []; // See note 2
	return [code, value];
};

const configs = [
	{
		file: "LA_UA names and codes UK as at 02_16.txt",
		transform: LA_UA_NAMES_transform
	},
	{
		file: "Parish LAD names and codes UK as at 12_15.txt",
		transform: PARISH_LAD_NAMES_transform
	},
	{
		file: "LA_UA names and codes UK as at 12_14 v2.txt",
		transform: NI_transform
	}
];

extract({ configs });
