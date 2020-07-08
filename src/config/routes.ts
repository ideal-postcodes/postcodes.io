import { Express } from "express";
import * as pages from "../app/controllers/pages_controller";
import * as utils from "../app/controllers/utils_controller";
import * as places from "../app/controllers/places_controller";
import * as outcodes from "../app/controllers/outcodes_controller";
import * as postcodes from "../app/controllers/postcodes_controller";
import * as scottishPostcodes from "../app/controllers/scottish_postcodes_controller";
import * as terminatedPostcodes from "../app/controllers/terminated_postcodes_controller";

export const routes = (app: Express): void => {
  app.get("/", pages.home);
  app.get("/ping", utils.ping);
  app.get("/about", pages.about);
  app.get("/docs", pages.documentation);
  app.get("/explore", pages.explore);

  app.get("/postcodes", postcodes.query);
  app.post("/postcodes", postcodes.bulk);
  app.get("/postcodes/:postcode", postcodes.show);
  app.get("/postcodes/:postcode/nearest", postcodes.nearest);
  app.get("/postcodes/:postcode/validate", postcodes.valid);
  app.get("/postcodes/:postcode/autocomplete", postcodes.autocomplete);
  app.get("/postcodes/lon/:longitude/lat/:latitude", postcodes.lonlat);
  app.get("/postcodes/lat/:latitude/lon/:longitude", postcodes.lonlat);

  app.get("/outcodes", outcodes.query);
  app.get("/outcodes/:outcode", outcodes.showOutcode);
  app.get("/outcodes/:outcode/nearest", outcodes.nearest);

  app.get("/places", places.query);
  app.get("/places/:id", places.show);
  // Todo: Query for geolocation contained in polygon (geolocation contained in polygon)
  // Todo: Query for geolocation near polygon (radius intersects polygon)

  app.get("/random/places", places.random);
  app.get("/random/postcodes", postcodes.random);

  app.get("/terminated_postcodes/:postcode", terminatedPostcodes.show);

  app.get("/scotland/postcodes/:postcode", scottishPostcodes.show);
};
