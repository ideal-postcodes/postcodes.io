"use strict";

const path = require("path");
const controllerPath = path.join(__dirname, "../app/controllers");
const pages = require(path.join(controllerPath, "/pages_controller"));
const utils = require(path.join(controllerPath, "/utils_controller"));
const places = require(path.join(controllerPath, "/places_controller"));
const outcodes = require(path.join(controllerPath, "/outcodes_controller"));
const postcodes = require(path.join(controllerPath, "/postcodes_controller"));
const terminatedPostcodes = require(path.join(controllerPath, "/terminated_postcodes_controller"));

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
};
