import { query } from "./base";
import { Location } from "./boundaries_base";
import {
  CeremonialCountiesRegion,
  CeremonialCountiesRegions,
} from "./boundaries/index";

export interface BoundariesResult {
  longitude: string;
  latitude: string;
  localities: CeremonialCountiesRegions[];
}

export const inBoundaries = async (
  location: Location
): Promise<BoundariesResult> => {
  const ceremonialCounty = await CeremonialCountiesRegion.inBoundary(location);

  return {
    longitude: location.lng,
    latitude: location.lat,
    localities: [...ceremonialCounty],
  };
};
