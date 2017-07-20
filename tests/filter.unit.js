"use strict"

const assert = require("chai").assert;
const filter = require("../config/filter.js");
const bulkPostcodeResult = require("./seed/bulk_postcode.json");
const bulkGeocodingResult = require("./seed/bulk_geocoding.json");
const cloneObject = o => JSON.parse(JSON.stringify(o));


describe("Filter middleware: ", () =>{
  // describe("checks for correct status/filter exists/filter not empty/no jsonApiResponse", () => {
  //   let request, response;

  //   beforeEach(() =>{
  //     request = {query: {filter:"fOo,bar,qUAlity,country"}};
  //     response = {
  //       jsonApiResponse:{
  //         result: [{
  //           query: {},
  //           result: {
  //             "quality" : "1",
  //             "longitude" : "453",
  //             "country": "United Kingdom"
  //           }
  //         }],
  //         status: 200
  //       }
  //     };
  //   });

  //   it ("invokes next if there's no jsonResponse", done => {
  //     delete response.jsonApiResponse;
  //     assert.notExists(response.jsonApiResponse);
  //     filter(request,response,done);
  //   });

  //   describe("Invokes next if there's no filter/it's empty string", () => {
  //     it ("Invokes next if there's no filter", done => {
  //       delete request.query.filter;
  //       assert.notExists(request.query.filter);
  //       filter(request,response,done);
  //     });

  //     it ("Invokes next if filter is an empty string", done => {
  //       request.query.filter = "";
  //       assert(request.query.filter === "");
  //       filter(request,response,done);
  //     });
  //   });

  //   it ("invokes next if status is not 200 ", done => {
  //     response.jsonApiResponse.status = 3321424;
  //     assert.notEqual(response.jsonApiResponse.status,200);
  //     filter(request,response,done);
  //   });

  //   it ("ignores attributes which are not whitelisted", done => {
  //     let result = response.jsonApiResponse.result;
  //     request.query.filter += ",notallowed";
  //     result = result.map(r => {
  //       r.result.notallowed = "bad";
  //       return r;
  //     });
  //     filter(request, response, () => {
  //       response.jsonApiResponse.result.forEach(r => {
  //         assert.isUndefined(r.result.notallowed);
  //       });
  //       done();
  //     });
  //   });
  // });

  describe("Bulk lookup postcodes: filters an array of results", () => {
    let request, response;

    beforeEach(() => {
      request = {
        query: {
          filter:"quALitY,foo,EaStings"
        }
      };
      response = { 
        jsonApiResponse : {
          "status": 200,
          "result": cloneObject(bulkPostcodeResult)
        }
      };
    });

    it ("returns empty results objects if no valid filters (none of the results are null)" , done => {
      request.query.filter = "inVaLidFilter,anotherInvaliDFILTER";
      assert.strictEqual(request.query.filter, "inVaLidFilter,anotherInvaliDFILTER");
      filter(request,response, () => {
        const expectedResult = [
          {"query": "M32 0JG", "result" : {}},
          {"query": "OX49 5NU", "result" : {}}
        ];
        assert.deepEqual(response.jsonApiResponse.result, expectedResult);
        done();
      });
    });

    it ("returns the right result array given only some filters (that have spaces in between commas) are correct (none of the results are null)", done => {
      request.query.filter = "posTCOde , foo,BaR,   eaSTings ";
      assert.strictEqual(request.query.filter, "posTCOde , foo,BaR,   eaSTings ");
      filter(request, response, () => {
        const expectedResult = [
          {
            "query": "M32 0JG", 
            "result": {
              "postcode": "M32 0JG",
              "eastings": 379988
            }
          },
          {
            "query": "OX49 5NU", 
            "result" : {
              "postcode": "OX49 5NU", 
              "eastings": 464447
            }
          }
        ];
        assert.deepEqual(response.jsonApiResponse.result, expectedResult);
        done();
      });
    });
    
    it ("returns the right result array given only some filters (that have spaces in between commas) are correct (some results are null)", done => {
      request.query.filter = "posTCOde , foo,BaR,   eaSTings ";
      response.jsonApiResponse.result[1].result = null;
      response.jsonApiResponse.result[1].query = "OX49 NU";
      assert.strictEqual(request.query.filter, "posTCOde , foo,BaR,   eaSTings ");
      filter(request, response, () => {
        const expectedResult = [
          {
            "query": "M32 0JG",
            "result" : {
              "postcode": "M32 0JG",
              "eastings": 379988
            }
          },
          {
            "query": "OX49 NU", 
            "result" : null
          }
        ];
        assert.deepEqual(response.jsonApiResponse.result, expectedResult);
        done();
      });
    });
  });
  
  describe("Bulk Reverse Geocoding filter", () => {
    let request, response;

    beforeEach(() => {
      request = {
        query: {
          filter: "quALitY,foo,EaStings"
        }
      };

      response = {
        jsonApiResponse: {
          "status": 200,
          "result": bulkGeocodingResult
        }
      };
    });

    it ("Works correctly for non null results", done => {
      filter(request, response, () => {
        assert.deepEqual(response.jsonApiResponse, {
          "status": 200,
          "result": [
            {
              "query": {
                "longitude": "0.629834723775309",
                "latitude": "51.7923246977375"
              },
              "result": [
                {
                  "quality": 1,
                  "eastings": 581459
                },
                {
                  "quality": 1,
                  "eastings": 581508
                }
              ]
            },
            {
              "query": {
                "longitude": "-2.49690382054704",
                "latitude": "53.5351312861402",
                "radius": "1000",
                "limit": "5"
              },
              "result": [
                {
                  "quality": 1,
                  "eastings": 367163
                },
                {
                  "quality": 1,
                  "eastings": 367155
                }
              ]
            }
          ]
        });
        done();
      })
    });
    it ("Works correctly for some results being null", done => {
      response = {
        jsonApiResponse: {
          "status": 200,
          "result": [
            {
              "query": {
                "longitude": "0",
                "latitude": "0"
              },
              "result": null
            },
            {
              "query": {
                "longitude": "-2.49690382054704",
                "latitude": "53.5351312861402",
                "radius": "1000",
                "limit": "5"
              },
              "result": [
                {
                  "postcode": "M46 9WU",
                  "quality": 1,
                  "eastings": 367163,
                  "northings": 404390
                },
                {
                  "postcode": "M46 9XF",
                  "quality": 1,
                  "eastings": 367155,
                  "northings": 404364
                }
              ]
            }
          ]
        }
      }
      filter(request, response, () => {
        assert.deepEqual(response.jsonApiResponse, {
          "status": 200,
          "result": [
            {
              "query": {
                "longitude": "0",
                "latitude": "0"
              },
              "result": null
            },
            {
              "query": {
                "longitude": "-2.49690382054704",
                "latitude": "53.5351312861402",
                "radius": "1000",
                "limit": "5"
              },
              "result": [
                {
                  "quality": 1,
                  "eastings": 367163
                },
                {
                  "quality": 1,
                  "eastings": 367155
                }
              ]
            }
          ]
        });
        done();
      });
    });
  });
});
