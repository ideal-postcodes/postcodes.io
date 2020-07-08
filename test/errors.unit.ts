import { assert } from "chai";
import { errors } from "./helper/index";
const { PostcodesioHttpError, InvalidJsonError, NotFoundError } = errors;

describe("Errors", () => {
  describe("PostcodesioHttpError", () => {
    it("instantiates with default attributes", () => {
      const e = new PostcodesioHttpError();
      assert.equal(e.name, "PostcodesioHttpError");
      assert.equal(e.status, 500);
      assert.include(e.humanMessage, "500 Server Error");
      assert.include(e.message, "500 Server Error");
    });

    it("instantiates with correct attributes", () => {
      const code = 401;
      const msg = "Foo";
      const e = new PostcodesioHttpError(code, msg);
      assert.equal(e.status, code);
      assert.equal(e.humanMessage, msg);
    });

    it("has toJSON method", () => {
      const e = new PostcodesioHttpError();
      const result = e.toJSON();
      assert.equal(result.status, e.status);
      assert.equal(result.error, e.humanMessage);
    });
  });

  describe("InvalidJsonError", () => {
    it("instantiates with correct attributes", () => {
      const e = new InvalidJsonError();
      assert.equal(e.status, 400);
      assert.include(e.humanMessage, "Invalid JSON submitted");
    });
  });

  describe("NotFoundError", () => {
    it("instantiates with correct attributes", () => {
      const e = new NotFoundError();
      assert.equal(e.status, 404);
      assert.include(e.humanMessage, "Resource not found");
    });
  });
});
