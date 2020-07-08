import { Request, Response, Next } from "../types/express";
import { TerminatedPostcode } from "../models/terminated_postcode";
import Pc from "postcode";
import { InvalidPostcodeError, TPostcodeNotFoundError } from "../lib/errors";

export const show = async (
  request: Request,
  response: Response,
  next: Next
) => {
  try {
    const { postcode } = request.params;
    if (!new Pc(postcode.trim()).valid()) throw new InvalidPostcodeError();

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
