import { Handler } from "../types/express";
import { TerminatedPostcode } from "../models/terminated_postcode";
import { isValid } from "postcode";
import { InvalidPostcodeError, TPostcodeNotFoundError } from "../lib/errors";

export const show: Handler = async (request, response, next) => {
  try {
    const { postcode } = request.params;

    if (isValid(postcode.trim())) throw new InvalidPostcodeError();

    const result = await TerminatedPostcode.find(postcode);

    if (!result) throw new TPostcodeNotFoundError();

    response.jsonApiResponse = {
      status: 200,
      result: TerminatedPostcode.toJson(result),
    };
    next();
  } catch (error) {
    next(error);
  }
};
