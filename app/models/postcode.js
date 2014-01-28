var Base = require("./index").Base,
		fs = require("fs"),
		async = require("async"),
		util = require("util");

var postcodeSchema = {
	id: "SERIAL PRIMARY KEY",
	postcode : "VARCHAR(255)",
	positional_quality_indicator : "INTEGER",
	eastings : "INTEGER",
	northings : "INTEGER",
	country : "VARCHAR(255)",
	nhs_regional_ha : "VARCHAR(255)",
	nhs_ha : "VARCHAR(255)",
	admin_county : "VARCHAR(255)",
	admin_district : "VARCHAR(255)",
	admin_ward : "VARCHAR(255)",
};

var indexes = {
	"postcode_index" : "CREATE UNIQUE INDEX postcode_index ON postcodes (postcode)"
};

function Postcode () {
	Base.call(this, "postcodes", postcodeSchema);
}

util.inherits(Postcode, Base);

Postcode.prototype.getPostcode = function (postcode, callback) {
	
}

Postcode.prototype.seedPostcodes = function (filePath, callback) {
	var csvColumns = 	"postcode, positional_quality_indicator, eastings, northings," + 
									" country_code, nhs_regional_ha_code, nhs_ha_code, admin_county_code," +
									" admin_district_code, admin_ward_code",
			denormalisationData = JSON.parse(fs.readFileSync(__dirname + "/postcodeDenormData.json")),
			columnsToDenormalise = [4, 5, 6, 7, 8, 9];

	var transform = function (row, index) {
		columnsToDenormalise.forEach(function (elem) {
			row[elem] = denormalisationData[row[elem]];
		});
		return row;
	}
	this._csvSeed(filePath, csvColumns, transform, callback);
}

Postcode.prototype.createIndexes = function (callback) {
	var self = this,
			indexExecution = [];

	for (indexName in indexes) {
		indexExecution.push(function (callback) {
			self._query(indexes[indexName], callback);
		});
	}		
	async.series(indexExecution, callback);
}

Postcode.prototype.destroyIndexes = function (callback) {
	var self = this,
			indexExecution = [];

	for (indexName in indexes) {
		indexExecution.push(function (callback) {
			self._query("DROP INDEX IF EXISTS " + indexName, callback);
		});
	}		
	async.series(indexExecution, callback);
}

module.exports = new Postcode();
