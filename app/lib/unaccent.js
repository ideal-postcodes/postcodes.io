"use strict";

// A map of Welsh characters containing diacritics that need to be unaccented
// Handles circumflex, grave and acute accents for all vowels (+y)
const accentMap = new Map([
	["Ŵ", "W"],
	["ŵ", "w"],
	["Ô", "O"],
	["ô", "o"],
	["Ù", "U"],
	["ù", "u"],
	["À", "A"],
	["à", "a"],
	["Ì", "I"],
	["ì", "i"],
	["Ò", "O"],
	["ò", "o"],
	["Â", "A"],
	["â", "a"],
	["È", "E"],
	["è", "e"],
	["Ê", "E"],
	["ê", "e"],
	["Î", "I"],
	["î", "i"],
	["Ŷ", "Y"],
	["ŷ", "y"],
	["Û", "U"],
	["û", "u"],
	["Á", "A"], 
	["á", "a"]
]);

// Mimicking postgres unaccent function
// Necessary because indexes do not work if unaccent function is involved
// https://stackoverflow.com/questions/28899042/unaccent-preventing-index-usage-in-postgres/28899610#28899610
const unaccent = str => {
  let char;
	for (let i = 0; i < str.length; i++) {
		char = str[i];
		if (accentMap.has(char)) str = str.replace(char, accentMap.get(char));
	}
	return str;
};

module.exports = unaccent;
