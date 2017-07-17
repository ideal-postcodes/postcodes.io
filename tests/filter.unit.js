"use strict"

const assert = require("chai").assert;
const filter = require("../config/filter.js");


describe("Filter middleware: ", () =>{
  describe("checks for correct status/filter exists/filter not empty/no jsonApiResponse", () => {
    let request, response;

    beforeEach(() =>{
      request = {query: {filter:"fOo,bar,qUAlity,country"}};
      response = {jsonApiResponse:{
        result: {"quality" : "1",
                  "longitude" : "453",
                  "country": "United Kingdom"},
        status: 200
      }}
    });

    it ("invokes next if there's no jsonResponse", done => {
      delete response.jsonApiResponse;
      assert.notExists(response.jsonApiResponse);
      filter(request,response,done);
    });
    describe("Invokes next if there's no filter/it's empty string", () => {
      it ("Invokes next if there's no filter", done => {
        delete request.query.filter;
        assert.notExists(request.query.filter);
        filter(request,response,done);

      });
      it ("Invokes next if filter is an empty string", done => {
        request.query.filter = "";
        assert(request.query.filter === "");
        filter(request,response,done);
      })
    });
    it ("invokes next if status is not 200 ", done => {
      response.jsonApiResponse.status = 3321424;
      assert.notEqual(response.jsonApiResponse.status,200);
      filter(request,response,done);
    });
  })
  describe("Simplest responses: filters results that are a single object ONLY", () =>{
    describe("Check that filter implementation is correct", () => {
      let request, response;

      beforeEach(() =>{
        request = {query: {filter:"fOo,bar,qUAlity,country"}};
        response = {jsonApiResponse:{
          result: {"quality" : "1",
                    "longitude" : "453",
                    "country": "United Kingdom"},
          status: 200
        }}
      });
      it ("if no valid filters, result object is empty", done => {
        request.query.filter="invalid,filteer";
        assert.strictEqual(request.query.filter, "invalid,filteer");
        filter(request,response, () => {
          assert.deepEqual(response.jsonApiResponse.result, {});
          done();
        });
      });
      it ("Works correctly whether filters are Upper/Lower cased", done => {
        request.query.filter="fOo,qUAlity,country";
        assert.strictEqual(request.query.filter, "fOo,qUAlity,country");
        filter(request,response, () => {
          assert.deepEqual(response.jsonApiResponse.result,
            {"quality" : "1",
            "country": "United Kingdom"
          });
          done();})
      });
      it ("Works correctly whether filters have spaces before/after commas ", done => {
        request.query.filter=" fOo ,  qUAlity   ,     country";
        assert.strictEqual(request.query.filter, " fOo ,  qUAlity   ,     country");
        filter(request,response, () => {
          assert.deepEqual(response.jsonApiResponse.result,
            {"quality" : "1",
            "country": "United Kingdom"
          });
          done();})
      });
    })
  })
  describe("Bulk lookup postcodes: filters an array of results", () => {
    let request, response
    beforeEach( () => {
      request = {query: {filter:"quALitY,foo,EaStings"}};
      response = { jsonApiResponse : {
        "status": 200,
        "result": [
            {
                "query": "M32 0JG",
                "result": {
                    "postcode": "M32 0JG",
                    "quality": 1,
                    "eastings": 379988,
                    "northings": 395476,
                    "codes": {
                        "admin_district": "E08000009",
                    }
                }
            },
            {
                "query": "OX49 5NU",
                "result": {
                    "postcode": "OX49 5NU",
                    "quality": 1,
                    "eastings": 464447,
                    "northings": 195647,
                    "codes": {
                        "admin_district": "E07000179",
                    }
                }
            }
        ]
      }

      }
    })

    it ("returns empty results objects if no valid filters" , done => {
      request.query.filter = "inVaLidFilter,anotherInvaliDFILTER";
      assert.strictEqual(request.query.filter, "inVaLidFilter,anotherInvaliDFILTER");
      filter(request,response, () => {
        assert.deepEqual(response.jsonApiResponse.result, [{"query": "M32 0JG", "result" : {}},{"query": "OX49 5NU", "result" : {}}]);
        done();
      })

    });
    it ("returns the right result array given only some filters are correct", done => {
      request.query.filter = "posTCOde,foo,BaR,eaSTings";
      assert.strictEqual(request.query.filter, "posTCOde,foo,BaR,eaSTings");
      filter(request, response, () => {
        assert.deepEqual(response.jsonApiResponse.result, [{"query": "M32 0JG", "result" : {"postcode": "M32 0JG","eastings": 379988}},
        {"query": "OX49 5NU", "result" : {"postcode": "OX49 5NU", "eastings": 464447}}]);
        done();
      } )
    });

  })

  describe("Bulk reverse geocoding", () => {
    let request, response;
    beforeEach(() => {
      request = {query: {filter:"quALitY,foo,EaStings"}};
      response = {jsonApiResponse: {
          "status": 200,
          "result": [
              {
                  "query": {
                      "longitude": "0.629834723775309",
                      "latitude": "51.7923246977375"
                  },
                  "result": [
                      {
                          "postcode": "CM8 1EF",
                          "quality": 1,
                          "eastings": 581459,
                          "northings": 213679
                      },
                      {
                          "postcode": "CM8 1EU",
                          "quality": 1,
                          "eastings": 581508,
                          "northings": 213652
                      }
                  ]
              }
          ]
      }}
    })
    it ("results is an array of empty objects if no valid filter", done => {
      request.query.filter = "inVaLidFilter,anotherInvaliDFILTER";
      assert.strictEqual(request.query.filter, "inVaLidFilter,anotherInvaliDFILTER");
      filter(request,response, () => {
        assert.deepEqual(response.jsonApiResponse, {
            "status": 200,
            "result": [
                {
                    "query": {
                        "longitude": "0.629834723775309",
                        "latitude": "51.7923246977375"
                    },
                    "result": [{},{}]
                }
            ]
        });
      })
      done();
    });
    it ("exhibits the correct behaviour for a single query given some filters are valid", done => {
      request.query.filter = "NOrThings,foo,QUAlity";
      assert.strictEqual(request.query.filter, "NOrThings,foo,QUAlity");
      filter(request,response, () => {
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
                            "northings": 213679
                        },
                        {
                            "quality": 1,
                            "northings": 213652
                        }
                    ]
                }
            ]
        });
        done();
      })

    })

  it ("handles correctly ?filter=1 2 or 3");
  it ("exhibits the correct behaviour for multiple queries given some filters are valid", done => {
    request.query.filter = "NOrThings,foo,QUAlity";
    assert.strictEqual(request.query.filter, "NOrThings,foo,QUAlity");
    response.jsonApiResponse = {
        "status": 200,
        "result": [
            {
                "query": {
                    "longitude": "0.629834723775309",
                    "latitude": "51.7923246977375"
                },
                "result": [
                    {
                        "postcode": "CM8 1EF",
                        "quality": 1,
                        "eastings": 581459,
                        "northings": 213679
                    },
                    {
                        "postcode": "CM8 1EU",
                        "quality": 1,
                        "eastings": 581508,
                        "northings": 213652
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
    filter(request,response, () => {
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
                          "northings": 213679
                      },
                      {
                          "quality": 1,
                          "northings": 213652
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
                          "northings": 404390
                      },
                      {
                          "quality": 1,
                          "northings": 404364
                      }
                  ]
              }
          ]
      });
      done();
    })

  });
});
  describe("Nearest Postcodes filter", () => {
    let request,response;
    beforeEach(() => {
      request = {query: {filter:"quALitY,foo,EaStings"}};
      response = { jsonApiResponse : {
          "status": 200,
          "result": [
              {
                  "postcode": "N1 0UT",
                  "quality": 1,
                  "eastings": 530369,
                  "northings": 183760,
                  "country": "England"
              },
              {
                  "postcode": "N1 0UR",
                  "quality": 1,
                  "eastings": 530368,
                  "northings": 183763,
                  "country": "England"
              }
          ]
      }}
    })
    it("Works correctly for the nearest postcodes query", done => {
      request.query.filter = "NOrThings, foo, QUAlity";
      assert.strictEqual(request.query.filter, "NOrThings, foo, QUAlity");
      filter(request,response, () => {
        assert.deepEqual(response.jsonApiResponse, {
            "status": 200,
            "result": [
                {
                    "quality": 1,
                    "northings": 183760
                },
                {
                    "quality": 1,
                    "northings": 183763
                }
            ]
        })
        done();
      })
    })
  });
})
