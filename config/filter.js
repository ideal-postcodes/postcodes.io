"use strict";

const env = process.env.NODE_ENV || "development";
const config = require("../config/config")(env);
const whitelistedAttributes = new Set(config.defaults.filterableAttributes);

const isObject = o => Object.prototype.toString.call(o) === "[object Object]";
const isArray = o => Object.prototype.toString.call(o) === "[object Array]";

const objFilter = (obj, filterArray) => { //filters an object with valid filters in the filterArray returns an Object
  return filterArray.reduce((acc,curr) => {
   if (obj[curr]) acc[curr] = obj[curr];
   return acc;
 } , {});
};

const arrFilter = (arr, filterArray) => { //filters an array of objects with objFilter returns an Array
  return arr.map(obj => objFilter(obj,filterArray));
};

const requiresFilter = (request, response) => {
  const jsonResponse = response.jsonApiResponse;
  return (jsonResponse && request.query.filter && jsonResponse.status === 200);
};

const filterArray = request => {
  return request.query.filter.replace(/\s/g, "")
                             .toLowerCase()
                             .split(",")
                             .filter(e => whitelistedAttributes.has(e));
};

const bulkFilter = (request, response, next) => {
  if (!requiresFilter(request, response)) return next();
  const filteredArray = filterArray(request);
  const resultData = response.jsonApiResponse.result;
  
  resultData.forEach(obj => {
    if (obj.result) obj.result = objFilter(obj.result, filteredArray);
  })
  return next();
}

const queryFilter = (request, response, next) => {
  if (!requiresFilter(request, response)) return next();
  const filteredArray = filterArray(request);
  const resultData = response.jsonApiResponse;
  
  resultData.result = arrFilter(resultData.result, filteredArray);
  return next();
}

module.exports = {
  query: queryFilter,
  bulk: bulkFilter
}



