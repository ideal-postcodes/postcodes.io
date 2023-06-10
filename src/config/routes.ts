import express from "express";
import { Express } from "express";
import * as pages from "../app/controllers/pages_controller";
import * as utils from "../app/controllers/utils_controller";
import * as places from "../app/controllers/places_controller";
import * as outcodes from "../app/controllers/outcodes_controller";
import * as postcodes from "../app/controllers/postcodes_controller";
import * as scottishPostcodes from "../app/controllers/scottish_postcodes_controller";
import * as terminatedPostcodes from "../app/controllers/terminated_postcodes_controller";
import { getConfig } from "./config";

export const routes = (app: Express): void => {
  const router = express.Router();
  router.get("/", pages.home);
  router.get("/ping", utils.ping);
  router.get("/ready", utils.ready);
  router.get("/about", pages.about);
  router.get("/docs", pages.documentation);

  router.get("/postcodes", postcodes.query);
  router.post("/postcodes", postcodes.bulk);
  router.get("/postcodes/:postcode", postcodes.show);
  router.get("/postcodes/:postcode/nearest", postcodes.nearest);
  router.get("/postcodes/:postcode/validate", postcodes.valid);
  router.get("/postcodes/:postcode/autocomplete", postcodes.autocomplete);
  router.get("/postcodes/lon/:longitude/lat/:latitude", postcodes.lonlat);
  router.get("/postcodes/lat/:latitude/lon/:longitude", postcodes.lonlat);

  router.get("/outcodes", outcodes.query);
  router.get("/outcodes/:outcode", outcodes.showOutcode);
  router.get("/outcodes/:outcode/nearest", outcodes.nearest);

  router.get("/places", places.query);
  router.get("/places/:id", places.show);
  // Todo: Query for geolocation contained in polygon (geolocation contained in polygon)
  // Todo: Query for geolocation near polygon (radius intersects polygon)

  router.get("/random/places", places.random);
  router.get("/random/postcodes", postcodes.random);

  router.get("/terminated_postcodes/:postcode", terminatedPostcodes.show);

  router.get("/scotland/postcodes/:postcode", scottishPostcodes.show);

  const { urlPrefix } = getConfig();
  app.use(urlPrefix, router);
};
