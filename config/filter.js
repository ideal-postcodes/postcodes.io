"use strict";

const config = require("../config/config")();
const whitelistedAttributes = new Set(config.defaults.filterableAttributes);

const isObject = o => Object.prototype.toString.call(o) === "[object Object]";
const isArray = o => Object.prototype.toString.call(o) === "[object Array]";

/**
 * Filters an object with valid filters in the filterArray returns an Object
 * @param  {Object} obj           - Source object to be filtered
 * @param  {string[]} filterArray - List of attributes to be returned in result
 * @return {Object}               - Filtered source object
 */
const objFilter = (obj, filterArray) => { 
	return filterArray.reduce((acc,curr) => {
	 if (obj[curr] !== undefined) acc[curr] = obj[curr];
	 return acc;
 }, {});
};

/**
 * Filters an array of objects with objFilter returns an Array
 * @param  {Object[]} arr         - Array of objects to be filtered
 * @param  {string[]} filterArray - Array of attributes to be returned
 * @return {Object[]}             - Original object without filtered attributes
 */
const arrFilter = (arr, filterArray) => { 
	return arr.map(obj => objFilter(obj,filterArray));
};

/**
 * Test if query response requires filtering
 * @param  {Object} request  - Express request instance
 * @param  {Object} response - Express response instance
 * @return {boolean}         - Returns true if result requires filter
 */
const requiresFilter = (request, response) => {
	const jsonResponse = response.jsonApiResponse;
	return (jsonResponse && request.query.filter && jsonResponse.status === 200);
};

/**
 * Extracts an array of filterable attributes from request.query.filter and 
 * elimates any attributes if not part of whitelist
 * @param  {Object} request - Express request instance
 * @return {string[]}       - Array of filterable attributes
 */
const filterArray = request => {
	return request.query.filter.replace(/\s/g, "")
	 .toLowerCase()
	 .split(",")
	 .filter(e => whitelistedAttributes.has(e));
};

/**
 * Filters(mutates) response result objects for the POST /postcodes route, 
 * detects whether query is a bulk postcode or geolocation request and 
 * filters response accordingly
 * @param  {Object} response        - Express response instance
 * @param  {string[]} filteredArray - List of filterable attributes
 * @return {undefined}
 */
const postRequestFilter = (response, filteredArray) => {
	response.jsonApiResponse.result.forEach(obj => {
		if (isObject(obj.result)) {
			obj.result = objFilter(obj.result, filteredArray);
		} else if (isArray(obj.result)) {
			obj.result = arrFilter(obj.result, filteredArray);
		}
	});
};

const filterMapper = {
	"/postcodes": postRequestFilter
};

/**
 * Express middleware which applies a response filter to whitelisted routes
 * @param  {Object}   request  - Express request instance
 * @param  {Object}   response - Express response instance
 * @param  {Function} next
 * @return {undefined}
 */
const filterResponse = (request, response, next) => {
	if (!requiresFilter(request, response)) return next();
	const filteredArray = filterArray(request);
	const filter = filterMapper[request.route.path];
	
	if (filter) filter(response, filteredArray);
	return next();
};

module.exports = filterResponse;
