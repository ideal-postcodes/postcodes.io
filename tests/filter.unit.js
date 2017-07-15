"use strict"

const assert = require("chai").assert;
const filter = require("../config/filter.js");


describe("Filter middleware: ", () =>{
  describe("checks for correct status/filter exists/filter not empty", () => {
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
      it ("Invokes next if filter is empty string", done => {
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
  describe("filters results that are a single object ONLY", () =>{
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
    })
  })
  describe("filters an array of results", () => {

  })
})
