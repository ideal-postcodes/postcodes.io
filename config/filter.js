"use strict"

const jsonApiResponseFilter = (request,response,next) => {
  const jsonResponse = response.jsonApiResponse;
  if (!jsonResponse ||
      !request.query.filter ||
      jsonResponse.status !== 200) {
      return next();
    }

  const filterFunc = require("./filterGenerator")(request.query.filter);


  if (!Array.isArray(jsonResponse.result)) {
    jsonResponse.result = filterFunc (jsonResponse.result);
    return next();

  } else if (!Array.isArray(jsonResponse.result[0].result)){
    jsonResponse.result.forEach(element => {
      element.result = filterFunc(element.result);
    });
    return next();

  } else {
    jsonResponse.result.forEach( element => {
      element.result.forEach( (el,index,resultArray) => {
        resultArray[index] = filterFunc(resultArray[index]);
      } )
    })
    return next();
  }


}

module.exports = jsonApiResponseFilter;
