var Base = require("./index"),
		util = require("util");

function Postcode () {
	Base.call(this);
}

util.inherits(Postcode, Base);

Postcode.prototype._createDatabase = function (callback) {
	var query = "CREATE TABLE postcodes"
	this._query(query, callback);
}

module.exports = new Postcode();