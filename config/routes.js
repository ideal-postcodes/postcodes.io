var path = require("path");
var pagesController = require(path.join(__dirname, "../app/controllers/pages_controller"));
var postcodesController = require(path.join(__dirname, "../app/controllers/postcodes_controller"));
var outcodesController = require(path.join(__dirname, "../app/controllers/outcodes_controller"));
var utilsController = require(path.join(__dirname, "../app/controllers/utils_controller"));

module.exports = function (app) {
	app.get("/", pagesController.home);
	app.get("/ping", utilsController.ping);
	app.get("/about", pagesController.about);
	app.get("/docs", pagesController.documentation);
	app.get("/explore", pagesController.explore);
	app.get("/random/postcodes", postcodesController.random);
	app.get("/postcodes", postcodesController.query);
	app.post("/postcodes", postcodesController.bulk);
	app.get("/postcodes/lon/:longitude/lat/:latitude", postcodesController.lonlat);
	app.get("/postcodes/lat/:latitude/lon/:longitude", postcodesController.lonlat);
	app.get("/postcodes/:postcode", postcodesController.show);
	app.get("/postcodes/:postcode/nearest", postcodesController.nearest);
	app.get("/postcodes/:postcode/validate", postcodesController.valid);
	app.get("/postcodes/:postcode/autocomplete", postcodesController.autocomplete);	

	app.get("/outcodes", outcodesController.query);
	app.get("/outcodes/:outcode", outcodesController.showOutcode);
	app.get("/outcodes/:outcode/nearest", outcodesController.nearest);
};