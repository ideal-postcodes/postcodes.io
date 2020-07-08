"use strict";

const { assert } = require("chai");

const allowsCORS = (response) => {
  assert.equal(response.headers["access-control-allow-origin"], "*");
};

const validCorsOptions = (response) => {
  allowsCORS(response);
  assert.equal(
    response.headers["access-control-allow-methods"],
    "GET,POST,OPTIONS"
  );
  assert.equal(
    response.headers["access-control-allow-headers"],
    "X-Requested-With, Content-Type, Accept, Origin"
  );
};

// Rough regex to extract json object
const jsonpResponseBody = (text) => {
  const result = text.match(/\(.*\)/);
  return JSON.parse(result[0].slice(1, result[0].length - 1));
};

module.exports = {
  allowsCORS,
  validCorsOptions,
  jsonpResponseBody,
};
