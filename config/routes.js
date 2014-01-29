var path = require("path")

// Load controllers
var pagesController = require(path.join(__dirname, "../app/controllers/pages_controller")),
		postcodesController = require(path.join(__dirname, "../app/controllers/postcodes_controller"));

module.exports = function (app) {
	app.get("/", pagesController.home);
	app.get("/about", pagesController.about)
	app.get("/docs", pagesController.documentation);

	app.post("/v1/postcodes", postcodesController.bulk);
	app.get("/v1/random/postcodes", postcodesController.random);
	app.get("/v1/postcodes/:postcode", postcodesController.show);
	app.get("/v1/postcodes/:postcode/valid", postcodesController.valid);	

	// Search
	// app.get("/v1/postcodes")

	// Longitude latitude
	// app.get("/v1/postcodes")

	// Bulk longitude latitude
	// app.post("/v1/postcodes")
}