var	fs = require("fs"),
		util = require("util"),
		Pc = require("postcode"),
		async = require("async"),
		OSPoint = require("ospoint"),
		Base = require("./index").Base;

var postcodeSchema = {
	id: "SERIAL PRIMARY KEY",
	postcode : "VARCHAR(10)",
	pc_compact : "VARCHAR(9)",
	quality : "INTEGER",
	eastings : "INTEGER",
	northings : "INTEGER",
	country : "VARCHAR(255)",
	nhs_regional_ha : "VARCHAR(255)",
	nhs_ha : "VARCHAR(255)",
	admin_county : "VARCHAR(255)",
	admin_district : "VARCHAR(255)",
	admin_ward : "VARCHAR(255)",
	longitude : "DOUBLE PRECISION",
	latitude : "DOUBLE PRECISION",
	location : "GEOGRAPHY(Point, 4326)"
};

var indexes = {
	"postcode_index" : "CREATE UNIQUE INDEX postcode_index ON postcodes (postcode)",
	"pc_compact_index" : "CREATE UNIQUE INDEX pc_compact_index ON postcodes (pc_compact)",
	"location_index" : "CREATE INDEX location_index ON postcodes USING GIST (location)"
};

function Postcode () {
	Base.call(this, "postcodes", postcodeSchema);
}

util.inherits(Postcode, Base);

Postcode.prototype.find = function (postcode, callback) {
	postcode = new Pc(postcode);

	if (!postcode.valid()) {
		return callback(null, null);
	}

	this._query("SELECT * FROM " + this.relation + " WHERE postcode=$1", [postcode.normalise()], function(error, result) {
		if (error) return callback(error, null);
		if (result.rows.length === 0) {
			return callback(null, null);
		}
		callback(null, result.rows[0]);
	});
}

Postcode.prototype.random = function (callback) {
	var query = "SELECT * FROM postcodes OFFSET random() * (SELECT count(postcode) from postcodes) LIMIT 1";
	this._query(query, function (error, result) {
		if (error) return callback(error, null);
		if (result.rows.length === 0) {
			return callback(null, null);
		}
		callback(null, result.rows[0]);
	});
}

Postcode.prototype.seedPostcodes = function (filePath, callback) {
	var csvColumns = 	"postcode, quality, eastings, northings, country, nhs_regional_ha, nhs_ha," + 
										" admin_county, admin_district, admin_ward, longitude, latitude",
			denormalisationData = JSON.parse(fs.readFileSync(__dirname + "/postcodeDenormData.json")),
			columnsToDenormalise = [4, 5, 6, 7, 8, 9],
			location;

	var transform = function (row, index) {
		// Replace codes with data (denormalisation process)
		columnsToDenormalise.forEach(function (elem) {
			row[elem] = denormalisationData[row[elem]];
		});

		// Translate Northings and Eastings to longitude and latitude
		location = new OSPoint("" + row[3] , "" + row[2]).toWGS84();
		row.push(location.longitude);
		row.push(location.latitude);

		return row;
	}
	this._csvSeed(filePath, csvColumns, transform, callback);
}

Postcode.prototype.createIndexes = function (callback) {
	var self = this,
			indexExecution = [];

	for (indexName in indexes) {
		indexExecution.push(indexes[indexName]);
	}	

	async.series(indexExecution.map(function (instruction) {
			return function (callback) {
				self._query(instruction, callback);
			}
	}), callback);
}

Postcode.prototype.destroyIndexes = function (callback) {
	var self = this,
			indexExecution = [];

	for (indexName in indexes) {
		indexExecution.push("DROP INDEX IF EXISTS " + indexName);
	}	

	async.series(indexExecution.map(function (instruction) {
		return function (callback) {
			self._query(instruction, callback);
		};
	}), callback);	
}

Postcode.prototype.search = function (postcode, options, callback) {
	var limit;
	if (typeof options === 'function') {
		callback = options;
		limit = 10;
	} else {
		limit = options.limit || 10;
	}
	
	var	query = "SELECT * FROM postcodes WHERE postcode ~ $1 LIMIT " + limit,
			re = "^" + postcode.toUpperCase().replace(/\s/, "\\s") + ".*";
			
	this._query(query, [re], function (error, result) {
		if (error) return callback(error, null);
		if (result.rows.length === 0) {
			return callback(null, null);
		}
		return callback(null, result.rows);
	});
}

Postcode.prototype.toJson = function (address) {
	delete address.id;
	return address;
}

module.exports = new Postcode();
