"use strict";

const {
  Postcode,
  TerminatedPostcode,
} = require("../../app/models/index.js");
const { assert } = require("chai");

// Retrieve object size
const len = o => Object.keys(o).length;

// Dedupes contents of array
const dedupe = a => [...new Set(a)];

/**
 * Returns a function to be passed to an iterator. Checks props exist
 * in object o
 *
 * @param {Object} o
 * @returns {Function}
 */
const checkProps = o => (prop) => assert.property(o, prop);

/**
 * Returns a function to be passed to an iterator. Checks props
 * do no exist in object o
 *
 * @param {Object} o
 * @returns {Function}
 */
const checkNotProps = o => (prop) => assert.notProperty(o, prop);


/**
 * Definition of place type
 * public methods should be publicly available
 */
const placeType = {
  public: [
		"code",
		"longitude",
		"latitude",
		"eastings",
		"northings",
		"min_eastings",
		"min_northings",
		"max_eastings",
		"max_northings",
		"local_type",
		"outcode",
		"name_1",
		"name_1_lang",
		"name_2",
		"name_2_lang",
		"county_unitary",
		"county_unitary_type",
		"district_borough",
		"district_borough_type",
		"region",
		"country"
	],
  private: [
		"id",
		"location",
		"name_1_search",
		"name_1_search_ts",
		"name_2_search",
		"name_2_search_ts",
		"bounding_polygon",
		"polygon"
  ],
};

const isRawPlaceObject = o => {
	placeType.public.forEach(checkProps(o));
	placeType.private.forEach(checkProps(o));
};

const isPlaceObject = o => {
	placeType.public.forEach(checkProps(o));
	placeType.private.forEach(checkNotProps(o));
};

const outcodeType = {
  private: ["id", "location"],
  public: [
		"eastings",
		"latitude",
		"northings",
		"longitude",
		"admin_ward",
		"admin_county",
		"admin_district",
		"parish",
		"outcode",
		"country"
  ],
};
const isOutcodeObject = o => {
	outcodeType.public.forEach(checkProps(o));
	outcodeType.private.forEach(checkNotProps(o));
};

const isRawOutcodeObject = o => {
	outcodeType.public.forEach(checkProps(o))
	outcodeType.private.forEach(checkProps(o))
};

const rawPostcodeAttributes = Object.keys(Postcode.schema);
const postcodeAttributes = Postcode.whitelistedAttributes;

//baseObject is the main template of an object
//additionalArr is an array of extra attributes on the postcode object
//blackListedAttr is an array of attributes that Postcode object not supposed to have
const isObject = (o, requiredAttr, additionalAttr = [], blacklist = []) => {
  const whitelist = dedupe(requiredAttr.concat(additionalAttr));
  whitelist.forEach(checkProps(o));
  blacklist.forEach(checkNotProps(o));
	assert.equal(len(o), whitelist.length);
};

const isPostcodeObject = (o, additionalAttr = [], blacklist = []) => {
	isObject(o, postcodeAttributes, additionalAttr, blacklist);
};

const isPostcodeWithDistanceObject = o => isPostcodeObject(o, ["distance"]);

//raw Object is the one that only has properties specified in the schema
const isRawPostcodeObject = (o, additionalAttr, blacklist) => {
	isObject(o, rawPostcodeAttributes, additionalAttr, blacklist);
};

const isRawPostcodeObjectWithFC = (o, additionalAttr, blacklist) => {
	isRawPostcodeObject(o, Postcode.getForeignColNames().concat(additionalAttr || []), blacklist);
};

const isRawPostcodeObjectWithFCandDistance = o => isRawPostcodeObjectWithFC(o, ["distance"]);

const terminatedPostcodeAttributes = TerminatedPostcode.whitelistedAttributes;
const rawTerminatedPostcodeAttributes = Object.keys(TerminatedPostcode.schema);

const isTerminatedPostcodeObject = o => {
	terminatedPostcodeAttributes.forEach(attr => assert.property(o, attr));
	assert.equal(Object.keys(o).length, terminatedPostcodeAttributes.length);
};

const isRawTerminatedPostcodeObject = o => {
	rawTerminatedPostcodeAttributes.forEach(attr => assert.property(o, attr));
	assert.equal(Object.keys(o).length, rawTerminatedPostcodeAttributes.length);
};

module.exports = {
  isRawOutcodeObject,
  isRawPostcodeObject,
  isRawPostcodeObjectWithFC,
  isRawPostcodeObjectWithFCandDistance,
  isPlaceObject,
  isPostcodeObject,
  isTerminatedPostcodeObject,
  isRawTerminatedPostcodeObject,
  isRawPlaceObject,
  isPostcodeWithDistanceObject,
  isOutcodeObject,
};

