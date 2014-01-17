var path = require("path")

// Load controllers
var pagesController = require(path.join(__dirname, "../app/controllers/pages_controller")),
		postcodesController = require(path.join(__dirname, "../app/controllers/postcodes_controller"));

module.exports = function (app) {
	app.get("/", pagesController.home);
	app.get("/docs", pagesController.documentation);
	app.get("/about", pagesController.about)

	app.get("/postcodes/:postcode", postcodesController.show);
}