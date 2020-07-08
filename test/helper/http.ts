import { assert } from "chai";

export const allowsCORS = (response: any): void => {
  assert.equal(response.headers["access-control-allow-origin"], "*");
};

export const validCorsOptions = (response: any): void => {
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
export const jsonpResponseBody = (text: string): JSON => {
  const result = text.match(/\(.*\)/);
  return JSON.parse(result[0].slice(1, result[0].length - 1));
};
