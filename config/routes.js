var path = require("path")

// Load controllers
var pagesController = require(path.join(__dirname, "../app/controllers/pages_controller"));

module.exports = function (app) {
	app.get("/", pagesController.home);
}