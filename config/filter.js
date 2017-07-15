"use strict"

const jsonApiResponseFilter = (request,response,next) => {
  const jsonResponse = response.jsonApiResponse;
  if (!jsonResponse ||
      !request.query.filter ||
      jsonResponse.status !== 200) {
      return next();
    }

  const filterAsSet = new Set (request.query.filter.toLowerCase().split(","))

  if (!Array.isArray(jsonResponse.result)) {
    jsonResponse.result = Object.keys(jsonResponse.result).reduce((acc,curr) => {
      if (filterAsSet.has(curr)) acc[curr] = jsonResponse.result[curr];
      return acc;
    } , {})
    return next();
  }


}

module.exports = jsonApiResponseFilter;
