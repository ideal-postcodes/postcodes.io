import { query } from "./base";
import { Location } from "./boundaries_base";
import {
  CeremonialCountiesRegion,
  CeremonialCountiesRegions,
} from "./boundaries/index";

//TODO add return array types after making models
export interface BoundariesResult {
  longitude: string;
  latitude: string;
  localities: CeremonialCountiesRegions[];
}

//TODO test timing and compare with join option of query
export const inBoundaries = async (
  location: Location
): Promise<BoundariesResult> => {
  const ceremonialCounty = await CeremonialCountiesRegion.inBoundary(location);
  //TODO add other models

  return {
    longitude: location.lng,
    latitude: location.lat,
    localities: [...ceremonialCounty],
  };
};
