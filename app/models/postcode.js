var Base = require("./index"),
		util = require("util");

var postcodeSchema = {
	id: "integer PRIMARY KEY",
	postcode : "varchar"
	positional_quality_indicator : "varchar"
	eastings : "varchar"
	northings : "varchar"
	country_code : "varchar"
	nhs_regional_ha_code : "varchar"
	nhs_ha_code : "varchar"
	admin_county_code : "varchar"
	admin_district_code : "varchar"
	admin_ward_code : "varchar"
}

function Postcode () {
	Base.call(this);
	this.relation = "postcodes";
	this.schema = postcodeSchema;
}

util.inherits(Postcode, Base);

module.exports = new Postcode();


