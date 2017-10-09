"use strict";

exports.argv = () => require("minimist")(process.argv.slice(2));

const onspdOffsets = {
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

exports.onspdOffsets = onspdOffsets;

exports.onspdCodeTypes = Object.keys(onspdOffsets);
