"use strict";
const isObject = o => Object.prototype.toString.call(o) === "[object Object]";
const isArray = o => Object.prototype.toString.call(o) === "[object Array]";

const objFilter = (obj, filterArray) => { //fuilters an object with valid filters in the filterArray returns an Object
  return filterArray.reduce((acc,curr) => {
   if (obj[curr]) acc[curr] = obj[curr];
   return acc;
 } , {});
}

const arrFilter = (arr, filterArray) => { //filters an array of objects with objFilter returns an Array
  return arr.map(obj => objFilter(obj,filterArray));
}

const filter = (jsonResultProp, filterArray) => {
  if (jsonResultProp === null) return null;
  if (isObject(jsonResultProp)) {
    return objFilter(jsonResultProp, filterArray);
  } else if (isArray(jsonResultProp)) {
    return arrFilter(jsonResultProp, filterArray);
  }
};

const requiresFilter = (request, response) => {
  const jsonResponse = response.jsonApiResponse;
  return (jsonResponse && request.query.filter && jsonResponse.status === 200);
}

const filterArray = request => {
  return request.query.filter.replace(/\s/g, "")
                             .toLowerCase()
                             .split(",");
}
//=========================================================
const filterMiddleware = (request, response, next) => {

  if (!requiresFilter(request, response)) return next();
  
  const filteredArray = filterArray(request, next);
  
  const resultData = response.jsonApiResponse.result;
        
  resultData.forEach(obj => {
    obj.result = filter(obj.result, filteredArray); //obj.result either an object or an array
  })
  
  return next();
  
}

//============================================================

module.exports = filterMiddleware;
