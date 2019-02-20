"use strict";

const fs = require("fs");
const util = require("util");
const async = require("async");
const OSPoint = require("ospoint");
const { Base } = require("./base");
const QueryStream = require("pg-query-stream");
const escapeRegex = require("escape-string-regexp");
const { defaults } = require("../../config/config")();
const searchDefaults = defaults.placesSearch;
const nearestDefaults = defaults.placesNearest;
const containsDefaults = defaults.placesContained;
const unaccent = require("../lib/unaccent");

const placeSchema = {
	"id": "SERIAL PRIMARY KEY",
	"code": "VARCHAR(255)",
	"longitude" : "DOUBLE PRECISION",
	"latitude" : "DOUBLE PRECISION",
	"location" : "GEOGRAPHY(Point, 4326)",
	"eastings" : "INTEGER",
	"northings" : "INTEGER",
	"min_eastings" : "INTEGER",
	"min_northings" : "INTEGER",
	"max_eastings" : "INTEGER",
	"max_northings" : "INTEGER",
	"bounding_polygon": "GEOGRAPHY(Polygon, 4326)",
	"local_type": "VARCHAR(128)",
	"outcode": "VARCHAR(5)",
	"name_1": "VARCHAR(128)",
	"name_1_lang": "VARCHAR(10)",
	"name_1_search": "VARCHAR(128)",
	"name_1_search_ts": "tsvector",
	"name_2": "VARCHAR(128)",
	"name_2_lang": "VARCHAR(10)",
	"name_2_search": "VARCHAR(128)",
	"name_2_search_ts": "tsvector",
	"county_unitary": "VARCHAR(128)",
	"county_unitary_type": "VARCHAR(128)",
	"district_borough": "VARCHAR(128)",
	"district_borough_type": "VARCHAR(128)",
	"region": "VARCHAR(32)",
	"country": "VARCHAR(16)"
};

const indexes = [{
	unique: true,
	column: "code"
}, {
	column: "name_1_search",
	opClass: "varchar_pattern_ops"
}, {
	column: "name_1_search_ts",
	type: "GIN"
}, {
	column: "name_2_search",
	opClass: "varchar_pattern_ops"
}, {
	column: "name_2_search_ts",
	type: "GIN"
}, {
	type: "GIST",
	column: "location"
}, {
	type: "GIST",
	column: "bounding_polygon"
}];

function Place () {
	this.idCache = [];
	Base.call(this, "places", placeSchema, indexes);
}

util.inherits(Place, Base);

const returnAttributes = `*, ST_AsText(bounding_polygon) AS polygon`;

const findByCodeQuery = `
	SELECT 
		${returnAttributes} 
	FROM 
		places 
	WHERE 
		code=$1
`;

// Return place by `code`
Place.prototype.findByCode = function (code, callback) {
	if (typeof code !== "string") return callback(null, null);
	this._query(findByCodeQuery, [code.toLowerCase()], (error, result) => {
		if (error) return callback(error);
		if (result.rowCount === 0) return callback(null, null);
		return callback(null, result.rows[0]);
	});
};

/**
 * Executes a name search for a place. For now this delegates straight to
 * prefixQuery
 * This method will also:
 * - Check validity inbound query
 * - Format inbound query (e.g. lowercase, replace \' and \-)
 * @param  {object}   options 
 * @param  {string}   options.name  - Search query
 * @param  {number}   options.limit - Maximum number of results to return
 * @param  {Function} callback		  - Callback accepting 2 args, error and
 * results
 * @return {undefined}
 */
Place.prototype.search = function (options, callback) {
	const name = options.name;
	if (!name || name.length === 0) return callback(null, null);
	const searchTerm = name
		.toLowerCase()
		.trim()
		.replace(/'/g,"")
		.replace(/-/g, " ");

	let limit = options.limit || searchDefaults.limit.DEFAULT;
	if (typeof limit !== "number" || limit < 0) limit = searchDefaults.limit.DEFAULT; 
	if (limit > searchDefaults.limit.MAX) limit = searchDefaults.limit.MAX;
	
	const searchOptions = {
		name: searchTerm,
		limit: limit
	};
	
	this._termsSearch(searchOptions, (error, result) => {
		if (error) return callback(error);	
		if (result !== null) return callback(null, result);
		// first do terms search, if that fails or does not find anything
		return this._prefixSearch(searchOptions, callback);
	});
};

// Replacing postgres unaccent due to indexing issues
// https://stackoverflow.com/questions/28899042/unaccent-preventing-index-usage-in-postgres/28899610#28899610
const searchQuery = `
	SELECT 
		${returnAttributes} 
	FROM
		places 
	WHERE
		name_1_search ~ $1
		OR name_2_search ~ $1
	LIMIT $2
`;

/**
 * Search method which will produce a fast prefix search for places. Inputs are
 * unchecked and so cannot be exposed directly as an HTTP endpoint
 * +ve fast on exact prefix matches (good for autocomplete)
 * +ve fast on exact name matches
 * -ve does not support terms matching (e.g. out of order or missing terms)
 * -ve does not support fuzzy matching (e.g. typos)
 * @param  {object}   options 
 * @param  {string}   options.name  - Search query
 * @param  {number}   options.limit - Maximum number of results to return
 * @param  {Function} callback - Maximum number of results to return
 * @return {undefined}
 */
Place.prototype._prefixSearch = function (options, callback) {
	const regex = `^${unaccent(escapeRegex(options.name))}.*`;
	const limit = options.limit;
	this._query(searchQuery, [regex, limit], (error, result) => {
		if (error) return callback(error);
		if (result.rows.length === 0) return callback(null, null);
		return callback(null, result.rows);
	});
};

const termsSearchQuery = `
	SELECT 
		${returnAttributes} 
	FROM
		places
	WHERE
		name_1_search_ts @@ phraseto_tsquery('simple', $1)
		OR name_2_search_ts @@ phraseto_tsquery('simple', $1)
	ORDER BY GREATEST(
		ts_rank_cd(name_1_search_ts, phraseto_tsquery('simple', $1), 1), 
		coalesce(ts_rank_cd(name_2_search_ts, phraseto_tsquery('simple', $1), 1), 0)
	) DESC
	LIMIT $2
`;

/**
 * Search method which will match terms. Inputs are unchecked and so cannot
 * be exposed directly as an HTTP endpoint
 * +ve supports terms matching (e.g. out of order, missing terms, one term misspelt)
 * -ve does not support fuzzy matching (e.g. typos)
 * -ve no partial query matching
 * @param  {object}   options 
 * @param  {string}   options.name  - Search query
 * @param  {number}   options.limit - Maximum number of results to return
 * @param  {Function} callback - Maximum number of results to return
 * @return {undefined}
 */
Place.prototype._termsSearch = function (options, callback) {
	const name = options.name;
	const limit = options.limit;
	this._query(termsSearchQuery, [name, limit], (error, result) => {
		if (error) return callback(error);
		if (result.rows.length === 0) return callback(null, null);
		return callback(null, result.rows);
	});
};

// Retrieve random place
Place.prototype.random = function (callback) {
	if (!this.idCache || this.idCache.length === 0) {
		return this.loadPlaceIds((error, ids) => {
			if (error) return callback(error);
			return this.randomFromIds(ids, callback);
		});
	}
	return this.randomFromIds(this.idCache, callback);
};

Place.prototype.loadPlaceIds = function (callback) {
	this._query(`SELECT id FROM ${this.relation}`, (error, result) => {
		if (error) return callback(error);
		const ids = result.rows.map(r => r.id);
		this.idCache = ids;
		return callback(null, this.idCache);
	});
};

const findByIdQuery = `
	SELECT 
		${returnAttributes} 
	FROM 
		places 
	WHERE 
		id=$1
`;

Place.prototype.randomFromIds = function (ids, callback) {
	const length = ids.length;
	const randomId = ids[Math.floor(Math.random() * length)];
	this._query(findByIdQuery, [randomId], (error, result) => {
		if (error) return callback(error, null);
		if (result.rows.length === 0) return callback(null, null);
		callback(null, result.rows[0]);
	});
};

// Returns places that are contained by specified geolocation
const containsQuery = `
	SELECT 
		${returnAttributes}, 
		ST_Distance(
			location, ST_GeographyFromText('POINT(' || $1 || ' ' || $2 || ')')
		) AS distance  
	FROM 
		places 
	WHERE 
		ST_Intersects(
			bounding_polygon,
			ST_GeographyFromText('SRID=4326;POINT(' || $1 || ' ' || $2 || ')')
		) 
	ORDER BY 
		distance ASC
	LIMIT 
		$3 
`;

Place.prototype.contains = function (options, callback) {
	const longitude = parseFloat(options.longitude);
	if (isNaN(longitude)) return callback(new Error("Invalid longitude"), null);
	const latitude = parseFloat(options.latitude);
	if (isNaN(latitude)) return callback(new Error("Invalid latitude"), null);
	let limit = parseInt(options.limit, 10) || containsDefaults.limit.DEFAULT;
	if (limit > containsDefaults.limit.MAX) {
		limit = containsDefaults.limit.DEFAULT;
	}
	const params = [longitude, latitude, limit];
	this._query(containsQuery, params, (error, result) => {
		if (error) return callback(error, null);
		if (result.rows.length === 0) return callback(null, null);
		return callback(null, result.rows);
	});
};

// Returns nearest places with polygons that intersect geolocation incl. radius
const nearestQuery = `
	SELECT 
		${returnAttributes}, 
		ST_Distance(
			bounding_polygon, ST_GeographyFromText('POINT(' || $1 || ' ' || $2 || ')')
		) AS distance 
	FROM 
		places 
	WHERE 
		ST_DWithin(
			bounding_polygon, ST_GeographyFromText('POINT(' || $1 || ' ' || $2 || ')'), $3
		) 
	ORDER BY 
		distance ASC, name_1 ASC 
	LIMIT $4 
`;

Place.prototype.nearest = function (options, callback) {
	const longitude = parseFloat(options.longitude);
	if (isNaN(longitude)) return callback(new Error("Invalid longitude"), null);
	const latitude = parseFloat(options.latitude);
	if (isNaN(latitude)) return callback(new Error("Invalid latitude"), null);
	let limit = parseInt(options.limit, 10) || nearestDefaults.limit.DEFAULT;
	if (limit > nearestDefaults.limit.MAX) limit = nearestDefaults.limit.DEFAULT;
	let radius = parseFloat(options.radius) || nearestDefaults.radius.DEFAULT;
	if (radius > nearestDefaults.radius.MAX) radius = nearestDefaults.radius.MAX;
	const params = [longitude, latitude, radius, limit];
	this._query(nearestQuery, params, (error, result) => {
		if (error) return callback(error, null);
		if (result.rows.length === 0) return callback(null, null);
		return callback(null, result.rows);
	});
};

// Format place object

const whitelistedAttributes = [
	"code",
	"name_1",
	"name_1_lang",
	"name_2",
	"name_2_lang",
	"local_type",
	"outcode",
	"county_unitary",
	"county_unitary_type",
	"district_borough",
	"district_borough_type",
	"region",
	"country",
	"longitude",
	"latitude",
	"eastings",
	"northings",
	"min_eastings",
	"min_northings",
	"max_eastings",
	"max_northings"
];

Place.prototype.toJson = function (place) {
	const result = {};
	whitelistedAttributes.forEach(attr => result[attr] = place[attr]);
	return result;
};

const csvColumns = {
	code: 0,
	names_uri: 1,
	name_1: 2,
	name_1_lang: 3,
	name_2: 4,
	name_2_lang: 5,
	type: 6,
	local_type: 7,
	eastings: 8,
	northings: 9,
	most_detail_view_res: 10,
	least_detail_view_res: 11,
	min_eastings: 12,
	min_northings: 13,
	max_eastings: 14,
	max_northings: 15,
	outcode: 16,
	postcode_district_uri: 17,
	populated_place: 18,
	populated_place_uri: 19,
	populated_place_type: 20,
	district_borough: 21,
	district_borough_uri: 22,
	district_borough_type: 23,
	county_unitary: 24,
	county_unitary_uri: 25,
	county_unitary_type: 26,
	region: 27,
	region_uri: 28,
	country: 29,
	country_uri: 30,
	related_spatial_object: 31,
	same_as_dbpedia: 32,
	same_as_geonames: 33
};

// Populates places table given OS data directory
Place.prototype._setupTable = function (directory, callback) {
	const self = this;
	async.series([
		function (callback) {
			self._query("CREATE EXTENSION IF NOT EXISTS unaccent", callback);
		},
		self._createRelation.bind(self),
		self.clear.bind(self),
		function seedData (cb) {
			self.seedData(directory, cb);
		},
		self.populateLocation.bind(self),
		self.generateSearchFields.bind(self),
		self.generateTsSearchFields.bind(self),
		self.createIndexes.bind(self),
	], callback);
};

// Pipe OS places data into places table
Place.prototype.seedData = function (directory, callback) {
	if (!fs.statSync(directory).isDirectory()) {
		return callback(
			new Error("Data directory should be supplied for OS places update")
		);
	}
	const typeIndex = csvColumns.type;
	const columnWhitelist = [
		"id",
		"location",
		"bounding_polygon",
		"name_1_search",
		"name_1_search_ts",
		"name_2_search",
		"name_2_search_ts"
	];
	const columns = Object.keys(placeSchema)
		.filter(col => columnWhitelist.indexOf(col) === -1);
	const typeRegex = /^.*\//;
	const parseOsgb = val => parseInt(val, 10) || "";
	const transformExceptions = {
		northings: parseOsgb,
		eastings: parseOsgb,
		min_eastings: parseOsgb,
		min_northings: parseOsgb,
		max_eastings: parseOsgb,
		max_northings: parseOsgb,
		county_unitary_type: val => val.replace(typeRegex, ""),
		district_borough_type: val => val.replace(typeRegex, "")
	};

	const transform = row => {
		// Skip if not a "place"
		if (row[typeIndex] !== "populatedPlace") return null;
		const northings = row[csvColumns.northings];
		const eastings = row[csvColumns.eastings];
		let location;
		if (northings.length * eastings.length === 0) {
			location = {
				longitude: "",
				latitude: ""
			};
		} else {
			location = new OSPoint("" + northings, "" + eastings).toWGS84();
		}
		return columns.map(colName => {
			if (colName === "latitude") return location.latitude;
			if (colName === "longitude") return location.longitude;
			const columnIndex = csvColumns[colName];
			const value = row[columnIndex];
			const exception = transformExceptions[colName];
			return (exception ? exception(value) : value);
		});
	};

	const files = fs.readdirSync(directory)
		.filter(f => f.match(/\.csv$/))
		.map(f => `${directory}${f}`);

	this._csvSeed({
		filepath: files,
		transform: transform,
		columns: columns.join(",")
	}, callback);
};

// Generates folded search fields name_*_search
Place.prototype.generateSearchFields = function (callback) {
	async.series(["name_1", "name_2"].map(field => {
		return callback => {
			this._query(`
				UPDATE 
					${this.relation} 
				SET 
					${field}_search=replace(
						replace(
							lower(
								unaccent(${field})
							), 
						'-', ' ')
					, '''', '')
			`, callback);
		};
	}), callback);
};

Place.prototype.generateTsSearchFields = function (callback) {
	async.series(["name_1", "name_2"].map(field => {
		return callback => {
			this._query(`
				UPDATE 
					${this.relation} 
				SET 
					${field}_search_ts=to_tsvector('simple', ${field})
			`, callback);
		};
	}), callback);
};

// Generates location data including centroid and bounding box 
Place.prototype.populateLocation = function (callback) {
	const self = this;
	async.series([
		function createPolygons (callback) {
			self._getClient((error, client, done) => {
				const updateBuffer = [];
				const cleanup = (error, result) => {
					done();
					callback(error, result);
				};
				const drainBuffer = callback => {
					stream.pause();
					async.each(updateBuffer, self._query.bind(self), error => {
						if (error) return cleanup(error);
						updateBuffer.length = 0;
						if (stream.isPaused()) stream.resume();
						if (callback) callback();
					});
				};
				const streamQuery = new QueryStream(`
					SELECT 
						id, min_eastings, min_northings, max_eastings, max_northings 
					FROM 
						${self.relation}
				`);
				const stream = client.query(streamQuery);
				stream.on("data", place => {
					const locations = [];
					if (place.min_eastings * place.min_northings * 
						place.max_eastings * place.max_northings === 0) return;
					const initialLocation = new OSPoint("" + place.min_northings, 
						"" + place.min_eastings).toWGS84();
					locations.push(initialLocation);
					locations.push((new OSPoint("" + place.max_northings, 
						"" + place.min_eastings).toWGS84()));
					locations.push((new OSPoint("" + place.max_northings, 
						"" + place.max_eastings).toWGS84()));
					locations.push((new OSPoint("" + place.min_northings, 
						"" + place.max_eastings).toWGS84()));
					locations.push(initialLocation); 
					updateBuffer.push(`
						UPDATE 
							${self.relation} 
						SET 
							bounding_polygon=ST_GeogFromText('SRID=4326;
							POLYGON((${
								locations.map(l => `${l.longitude} ${l.latitude}`).join(",")
							}))') 
						WHERE 
							id=${place.id} 
					`);
					if (updateBuffer.length > 1000) drainBuffer();
				})
				.on("error", cleanup)
				.on("end", () => drainBuffer(cleanup));
			});
		},
		function createLocations (callback) {
			const query = `
				UPDATE 
					${self.relation} 
				SET 
					location=ST_GeogFromText(
						'SRID=4326;POINT(' || longitude || ' ' || latitude || ')'
					) 
				WHERE 
					northings!=0 
					AND eastings!=0
			`;
			self._query(query, callback);
		}
	], callback);
};

module.exports = new Place();
