var Base = require("./index").Base,
		fs = require("fs"),
		pc = require("postcode"),
		async = require("async"),
		util = require("util");

var postcodeSchema = {
	id: "SERIAL PRIMARY KEY",
	postcode : "VARCHAR(255)",
	quality : "INTEGER",
	eastings : "INTEGER",
	northings : "INTEGER",
	country : "VARCHAR(255)",
	nhs_regional_ha : "VARCHAR(255)",
	nhs_ha : "VARCHAR(255)",
	admin_county : "VARCHAR(255)",
	admin_district : "VARCHAR(255)",
	admin_ward : "VARCHAR(255)"
};

var indexes = {
	"postcode_index" : "CREATE UNIQUE INDEX postcode_index ON postcodes (postcode)"
};

function Postcode () {
	Base.call(this, "postcodes", postcodeSchema);
}

util.inherits(Postcode, Base);

Postcode.prototype.find = function (postcode, callback) {
	postcode = new pc(postcode);
	this._query("SELECT * FROM " + this.relation + " WHERE postcode=$1", [postcode.normalise()], function(error, result) {
		if (error) return callback(error, null);
		if (result.rows.length === 0) {
			return callback(null, null);
		}
		callback(null, result.rows[0]);
	});
}

Postcode.prototype.seedPostcodes = function (filePath, callback) {
	var csvColumns = 	"postcode, quality, eastings, northings, country," + 
										" nhs_regional_ha, nhs_ha, admin_county, admin_district, admin_ward",
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

Postcode.prototype.toJson = function (address) {
	delete address.id;
	return address;
}

module.exports = new Postcode();
