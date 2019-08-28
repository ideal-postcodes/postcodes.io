"use strict";

const pages = require("../app/controllers/pages_controller");
const utils = require("../app/controllers/utils_controller");
const places = require("../app/controllers/places_controller");
const outcodes = require("../app/controllers/outcodes_controller");
const postcodes = require("../app/controllers/postcodes_controller");
const scottishPostcodes = require("../app/controllers/scottish_postcodes_controller");
const terminatedPostcodes = require("../app/controllers/terminated_postcodes_controller");

module.exports = app => {
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
