import { Handler } from "../types/express";
import { ScottishPostcode } from "../models/scottish_postcode";
import { Postcode } from "../models/postcode";
import Pc from "postcode";
import {
  InvalidPostcodeError,
  PostcodeNotFoundError,
  PostcodeNotInSpdError,
} from "../lib/errors";

export const show: Handler = async (request, response, next) => {
  try {
    const { postcode } = request.params;
    if (!Pc.isValid(postcode.trim())) throw new InvalidPostcodeError();

    const result = await ScottishPostcode.find(postcode);
    if (!result) {
      const pResult = await Postcode.find(postcode);
      if (!pResult) throw new PostcodeNotFoundError();
      throw new PostcodeNotInSpdError();
    }
    response.jsonApiResponse = {
      status: 200,
      result: ScottishPostcode.toJson(result),
    };
    next();
  } catch (error) {
    next(error);
  }
};
