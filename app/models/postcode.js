"use strict";

const { inherits } = require("util");
const Pc = require("postcode");
const { series } = require("async");
const { Base, populateLocation, extractOnspdVal } = require("./base");
const QueryStream = require("pg-query-stream");
const { defaults } = require("../../config/config.js")();

const postcodeSchema = {
	"id": "SERIAL PRIMARY KEY",
	"postcode" : `VARCHAR(10) COLLATE "C"`,  // C Provides desirable ordering
	"pc_compact" : `VARCHAR(9) COLLATE "C"`, // for pc autocomplete & partials
	"quality" : "INTEGER",
	"eastings" : "INTEGER",
	"northings" : "INTEGER",
	"country" : "VARCHAR(255)",
	"nhs_ha" : "VARCHAR(255)",
	"admin_county_id" : "VARCHAR(32)",
	"admin_district_id" : "VARCHAR(32)",
	"admin_ward_id" : "VARCHAR(32)",
	"longitude" : "DOUBLE PRECISION",
	"latitude" : "DOUBLE PRECISION",
	"location" : "GEOGRAPHY(Point, 4326)",
	"european_electoral_region" : "VARCHAR(255)",
	"primary_care_trust" : "VARCHAR(255)",
	"region" : "VARCHAR(255)",
	"parish_id" : "VARCHAR(32)",
	"lsoa" : "VARCHAR(255)",
	"msoa" : "VARCHAR(255)",
	"nuts_id" : "VARCHAR(32)",
	"incode" : "VARCHAR(5)",
	"outcode" : "VARCHAR(5)",
	"ccg_id" : "VARCHAR(32)",
  "ced_id": "VARCHAR(32)",
	"constituency_id" : "VARCHAR(32)"
};

const indexes = [{
	unique: true,
	column: "postcode"
}, {
	unique: true,
	column: "pc_compact"
}, {
	unique: true,
	column: "pc_compact",
	opClass: "varchar_pattern_ops"
}, {
	type: "GIST",
	column: "location"
}, {
	column: "outcode"
}];

const relationships = [{
	table: "districts",
	key: "admin_district_id",
	foreignKey: "code"
},{
	table: "parishes",
	key: "parish_id",
	foreignKey: "code"
},{
	table: "counties",
	key: "admin_county_id",
	foreignKey: "code"
},{
	table: "wards",
	key: "admin_ward_id",
	foreignKey: "code"
},{
	table: "ceds",
	key: "ced_id",
	foreignKey: "code"
},{
	table: "ccgs",
	key: "ccg_id",
	foreignKey: "code"
},{
	table: "constituencies",
	key: "constituency_id",
	foreignKey: "code"
},{
	table: "nuts",
	key: "nuts_id",
	foreignKey: "code"
}];

const toJoinString = () => {
	return relationships.map(r => {
		return `
			LEFT OUTER JOIN ${r.table}
				ON postcodes.${r.key}=${r.table}.${r.foreignKey}
		`;
	}).join(" ");
};

const foreignColumns = [{
	field: "constituencies.name",
	as: "parliamentary_constituency"
},{
	field: "districts.name",
	as: "admin_district"
},{
	field: "parishes.name",
	as: "parish"
},{
	field: "counties.name",
	as: "admin_county"
}, {
	field: "wards.name",
	as: "admin_ward"
},{
	field: "ceds.name",
	as: "ced"
},{
	field: "ccgs.name",
	as: "ccg"
},{
	field: "nuts.name",
	as: "nuts"
},{
	field: "nuts.nuts_code",
	as: "nuts_code"
}];

const toColumnsString = () => {
	return foreignColumns.map(elem => {
		return `${elem.field} as ${elem.as}`;
	}).join(",");
};

function Postcode () {
	this.idCache = {};
	Base.call(this, "postcodes", postcodeSchema, indexes);
}

inherits(Postcode, Base);

const findQuery = `
	SELECT 
		postcodes.*, ${toColumnsString()} 
	FROM 
		postcodes 
	${toJoinString()} 
	WHERE pc_compact=$1 
`;

Postcode.prototype.find = function (postcode, callback) {
	if (typeof postcode !== "string") return callback(null, null);
	postcode = postcode.trim().toUpperCase();
	if (!new Pc(postcode).valid()) return callback(null, null);
	this._query(findQuery, [postcode.replace(/\s/g, "")], (error, result) => {
		if (error) return callback(error, null);
		if (result.rows.length === 0) return callback(null, null);
		callback(null, result.rows[0]);
	});
};

Postcode.prototype.getForeignColNames = function () {
	return foreignColumns.reduce((acc, curr) => {
		acc.push(curr.as);
		return acc;
	}, []);
};

Postcode.prototype.whitelistedAttributes = [
	"nhs_ha",
	"country",
	"quality",
	"postcode",
	"eastings",
	"latitude",
	"northings",
	"longitude",
	"admin_ward",
	"admin_county",
	"admin_district",
	"region",
	"parliamentary_constituency",
	"european_electoral_region",
	"parish",
	"lsoa",
	"msoa",
	"nuts",
	"ccg",
	"primary_care_trust",
	"incode",
	"outcode",
  "codes",
  "ced",
];

Postcode.prototype.loadPostcodeIds = function (type, callback) {
	if (typeof type === "function") {
		callback = type;
		type = "_all";
	}

	this._getClient((error, client, done) => {
		const cleanUp = (error, ids) => {
			done();
			if (callback) callback(error, ids);
		};
		if (error) return cleanUp(error);

		const params = [];
		let countQuery = "SELECT count(id) FROM postcodes";
		let idQuery = "SELECT id FROM postcodes";

		if (type !== "_all") {
			countQuery += " WHERE outcode = $1";
			idQuery += " WHERE outcode = $1";
			params.push(type.replace(/\s/g, "").toUpperCase());
		}

		client.query(countQuery, params, (error, result) => {
			if (error) return cleanUp(error);
			let i = 0;
			const count = result.rows[0].count;
			if (count === 0) return callback(null, null);
			const idStore = new Array(count);
			client.query(new QueryStream(idQuery, params))
				.on("end", () => {
					this.idCache[type] = idStore;
					cleanUp(null, idStore);
				})
				.on("error", cleanUp)
				.on("data", data => {
					idStore[i] = data.id;
					i++;
				});
		});
	});
};

Postcode.prototype.random = function (options, callback) {
	if (typeof options === "function") {
		callback = options;
		options = {};
	}

	const randomType = typeof options.outcode === "string" &&
		options.outcode.length ? options.outcode : "_all";
	const idCache = this.idCache[randomType];

	if (!idCache) {
		return this.loadPostcodeIds(randomType, (error, ids) => {
			if (error) return callback(error);
			return this.randomFromIds(ids, callback);
		});
	}

	return this.randomFromIds(idCache, callback);
};

const findByIdQuery = `
	SELECT 
		postcodes.*, ${toColumnsString()} 
	FROM 
		postcodes 
	${toJoinString()}
	WHERE id=$1
`;

// Use an in memory array of IDs to retrieve random postcode

Postcode.prototype.randomFromIds = function (ids, callback) {
	const length = ids.length;
	const randomId = ids[Math.floor(Math.random() * length)];
	this._query(findByIdQuery, [randomId], (error, result) => {
		if (error) return callback(error, null);
		if (result.rows.length === 0) return callback(null, null);
		callback(null, result.rows[0]);
	});
};

// Parses postcode search options, returns object with limit

const parseSearchOptions = options => {
	let limit = parseInt(options.limit, 10);
	if (isNaN(limit) || limit < 1) limit = defaults.search.limit.DEFAULT;
	if (limit > defaults.search.limit.MAX) limit = defaults.search.limit.MAX;
	return { limit: limit };
};

/*
 *	Search for partial/complete postcode matches
 *  Search Methodology below:
 *  1) Check if string is feasible outcode, then search by that outcode
 *  2) Check if string is space separated, then perform space-sensitive search
 *  3) If above fail, perform space-insensitive search
 */

const whitespaceRe = /\s+/g;

Postcode.prototype.search = function (options, callback) {
	const postcode = options.postcode.toUpperCase().trim();
	const pcCompact = postcode.replace(whitespaceRe, "");

	// Returns substring matches on postcode
	const extractPartialMatches = r => {
		return r.filter(r => r.pc_compact.includes(pcCompact));
	};

	// Inspects results for partial matches
	// - if no matches fallback to pc_compact search
	const inspectResult = (error, result) => {
		if (error) return callback(error);
		const matches = extractPartialMatches(result.rows);
		if (matches.length === 0) {
			options.query = postcode;
			return this.searchPcCompact(options, returnResult);
		}
		return returnResult(error, result);
	};

	// Parses and formats results, includes:
	// - returns null if empty array
	// - filters for partial postcode matches
	// - if full match detected, only return full match
	const returnResult = (error, result) => {
		if (error) return callback(error, null);
		const matches = extractPartialMatches(result.rows);
		if (matches.length === 0) return callback(null, null);
		const exactMatches = matches.filter(r => r.pc_compact === pcCompact);
		if (exactMatches.length > 0) return callback(null, exactMatches);
		return callback(null, matches);
	};

	if (Pc.validOutcode(postcode)) {
		options.query = postcode + " ";
		return this.searchPostcode(options, inspectResult);
	}

	if (postcode.match(/^\w+\s+\w+$/)) {
		options.query = postcode.split(/\s+/).join(" ");
		return this.searchPostcode(options, inspectResult);
	}

	options.query = postcode;
	return this.searchPcCompact(options, returnResult);
};

const	searchQuery = `
	SELECT 
		postcodes.*, ${toColumnsString()}
	FROM 
		postcodes
	${toJoinString()}
	WHERE 
		postcode >= $1 
	ORDER BY 
		postcode ASC 
	LIMIT $2
`;

// Space sensitive search for postcode (uses postcode column/btree)
Postcode.prototype.searchPostcode = function (options, callback) {
	const postcode = options.query;
	const limit = parseSearchOptions(options).limit;
	this._query(searchQuery, [postcode, limit], callback);
};

const	pccompactSearchQuery = `
	SELECT 
		postcodes.*, ${toColumnsString()}
	FROM 
		postcodes
	${toJoinString()}
	WHERE 
		pc_compact >= $1 
	ORDER BY 
		pc_compact ASC 
	LIMIT $2
`;

// Space insensitive search for postcode (uses pc_compact column/btree)
Postcode.prototype.searchPcCompact = function (options, callback) {
	const postcode = options.query;
	const limit = parseSearchOptions(options).limit;
	this._query(pccompactSearchQuery, [postcode, limit], callback);
};

const nearestPostcodeQuery = `
	SELECT 
		postcodes.*, 
		ST_Distance(
			location, ST_GeographyFromText('POINT(' || $1 || ' ' || $2 || ')')
		) AS distance,
		${toColumnsString()} 
	FROM 
		postcodes 
	${toJoinString()}
	WHERE 
		ST_DWithin(
			location, ST_GeographyFromText('POINT(' || $1 || ' ' || $2 || ')'), $3
		) 
	ORDER BY 
		distance ASC, postcode ASC 
	LIMIT $4
`;

Postcode.prototype.nearestPostcodes = function (params, callback) {
	const DEFAULT_RADIUS = defaults.nearest.radius.DEFAULT;
	const MAX_RADIUS = defaults.nearest.radius.MAX;
	const DEFAULT_LIMIT = defaults.nearest.limit.DEFAULT;
	const MAX_LIMIT = defaults.nearest.limit.MAX;

	let limit = parseInt(params.limit, 10) || DEFAULT_LIMIT;
	if (limit > MAX_LIMIT) limit = MAX_LIMIT;

	const longitude = parseFloat(params.longitude);
	if (isNaN(longitude)) return callback(new Error("Invalid longitude"), null);

	const latitude = parseFloat(params.latitude);
	if (isNaN(latitude)) return callback(new Error("Invalid latitude"), null);

	let radius = parseFloat(params.radius) || DEFAULT_RADIUS;
	if (radius > MAX_RADIUS) radius = MAX_RADIUS;

	const handleResult = (error, result) => {
		if (error) return callback(error, null);
		if (result.rows.length === 0) return callback(null, null);
		return callback(null, result.rows);
	};

	// If a wideSearch query is requested, derive a suitable range which
	// guarantees postcode results over a much wider area
	if (params.wideSearch || params.widesearch) {
		if (limit > DEFAULT_LIMIT) {
			limit = DEFAULT_LIMIT;
		}
		return this._deriveMaxRange(params, (error, maxRange) => {
			if (error) return callback(error);
			const params = [longitude, latitude, maxRange, limit];
			this._query(nearestPostcodeQuery, params, handleResult);
		});
	}

	const queryParams = [longitude, latitude, radius, limit];
	this._query(nearestPostcodeQuery, queryParams, handleResult);
};

const nearestPostcodeCount =  `
	SELECT 
		postcodes.*, 
		ST_Distance(
			location, ST_GeographyFromText('POINT(' || $1 || ' ' || $2 || ')')
		) AS distance  
	FROM 
		postcodes 
	WHERE 
		ST_DWithin(
			location, ST_GeographyFromText('POINT(' || $1 || ' ' || $2 || ')'), $3
		) 
	LIMIT $4 
`;

const START_RANGE = 500; // 0.5km
const MAX_RANGE = 20000; // 20km
const SEARCH_LIMIT = 10;
const INCREMENT = 1000;


Postcode.prototype._deriveMaxRange = function (params, callback) {
	const queryBound = (params, range, callback) => {
		const queryParams = [params.longitude, params.latitude, range, SEARCH_LIMIT];
		this._query(nearestPostcodeCount, queryParams, (error, result) => {
			if (error) return callback(error);
			return callback(null, result.rows.length);
		});
	};

	const handleResponse = (error, count) => {
		if (error) return callback(error);
		if (count < SEARCH_LIMIT) return this._deriveMaxRange(params, callback);
		return callback(null, params.lowerBound);
	};

	if (!params.lowerBound) {
		params.lowerBound = START_RANGE;
		queryBound(params, START_RANGE, handleResponse);
	} else if (!params.upperBound) {
		params.upperBound = MAX_RANGE;
		queryBound(params, MAX_RANGE, (error, count) => {
			if (count === 0) return callback(null, null);
			return this._deriveMaxRange(params, callback);
		});
	} else {
		params.lowerBound += INCREMENT;
		if (params.lowerBound > MAX_RANGE) return callback(null, null);
		queryBound(params, params.lowerBound, handleResponse);
	}
};

const attributesQuery = [];
attributesQuery.push(`
	array(
		SELECT 
			DISTINCT districts.name 
		FROM 
			postcodes 
		LEFT OUTER JOIN 
			districts ON postcodes.admin_district_id = districts.code 
		WHERE 
			outcode=$1 AND districts.name IS NOT NULL
	) as admin_district
`);

attributesQuery.push(`
	array(
		SELECT 
			DISTINCT parishes.name 
		FROM 
			postcodes 
		LEFT OUTER JOIN 
			parishes ON postcodes.parish_id = parishes.code 
		WHERE 
			outcode=$1 AND parishes.name IS NOT NULL
	) as parish
`);

attributesQuery.push(`
	array(
		SELECT 
			DISTINCT counties.name 
		FROM 
			postcodes 
		LEFT OUTER JOIN 
			counties ON postcodes.admin_county_id = counties.code 
		WHERE 
			outcode=$1 AND counties.name IS NOT NULL
	) as admin_county
`);

attributesQuery.push(`
	array(
		SELECT 
			DISTINCT wards.name 
		FROM 
			postcodes 
		LEFT OUTER JOIN 
			wards ON postcodes.admin_ward_id = wards.code 
		WHERE 
			outcode=$1 AND wards.name IS NOT NULL
	) as admin_ward
`);

attributesQuery.push(`
	array(
		SELECT 
			DISTINCT country 
		FROM 
			postcodes 
		WHERE
			outcode=$1
	) as country
`);

const outcodeQuery = `
	SELECT 
		outcode, avg(northings) as northings, avg(eastings) as eastings, 
		avg(ST_X(location::geometry)) as longitude, 
		avg(ST_Y(location::geometry)) as latitude, 
		${attributesQuery.join(",")} 
	FROM 
		postcodes 
	WHERE 
		outcode=$1 
	GROUP BY 
		outcode
`;


const outcodeAttributes = [
	"admin_district",
	"parish",
	"admin_county",
	"admin_ward"
];

Postcode.prototype.findOutcode = function (o, callback) {
	const outcode = o.trim().toUpperCase();

	if (!Pc.validOutcode(outcode) && outcode !== "GIR") {
		return callback(null, null);
	}

	this._query(outcodeQuery, [outcode], (error, result) => {
		if (error) return callback(error, null);
		if (result.rows.length === 0) return callback(null, null);
		const outcodeResult = result.rows[0];
		outcodeAttributes.forEach(attr => {
			if (outcodeResult[attr].length === 1 &&
					outcodeResult[attr][0] === null) {
				outcodeResult[attr] = [];
			}
		});
		return callback(null, outcodeResult);
	});
};

Postcode.prototype.toJson = function (address) {
	address.codes = {
		admin_district: address.admin_district_id,
		admin_county: address.admin_county_id,
		admin_ward: address.admin_ward_id,
		parish: address.parish_id,
		parliamentary_constituency: address.constituency_id,
		ccg: address.ccg_id,
    ced: address.ced_id,
		nuts: address.nuts_code
	};
	delete address.id;
	delete address.location;
	delete address.pc_compact;
	delete address.admin_district_id;
	delete address.admin_county_id;
	delete address.admin_ward_id;
	delete address.parish_id;
	delete address.ccg_id;
  delete address.ced_id;
	delete address.nuts_id;
	delete address.nuts_code;
	delete address.constituency_id;
	return address;
};

Postcode.prototype._setupTable = function (filepath, callback) {
	series([
		this._createRelation.bind(this),
		this.clear.bind(this),
		cb => this.seedPostcodes.call(this, filepath, cb),
		this.populateLocation.bind(this),
		this.createIndexes.bind(this),
	], callback);
};

Postcode.prototype.seedPostcodes = function (filepath, callback) {
	const pcts = require("../../data/pcts.json");
	const lsoa = require("../../data/lsoa.json");
	const msoa = require("../../data/msoa.json");
	const nhsHa = require("../../data/nhsHa.json");
	const regions = require("../../data/regions.json");
	const countries = require("../../data/countries.json");
	const european_registers = require("../../data/european_registers.json");

	const ONSPD_COL_MAPPINGS = Object.freeze([
		{ column: "postcode", method: row => row.extract("pcds") },
		{ column: "pc_compact", method: row => row.extract("pcds").replace(/\s/g, "") },
		{ column: "eastings", method: row => row.extract("oseast1m") },
		{ column: "northings", method: row => row.extract("osnrth1m") },
		{ 
			column: "longitude",
			method: row => {
        const eastings = row.extract("oseast1m");
				return eastings === "" ? null : row.extract("long");
			},
		},
		{
			column: "latitude",
			method: row => {
        const northings = row.extract("osnrth1m");
				return northings === "" ? null : row.extract("lat");
			},
		},
		{ column: "country", method: row => countries[row.extract("ctry")] },
		{ column: "nhs_ha", method: row => nhsHa[row.extract("oshlthau")] },
		{ column: "admin_county_id", method: row => row.extract("oscty") },
		{ column: "admin_district_id", method: row => row.extract("oslaua") },
		{ column: "admin_ward_id", method: row => row.extract("osward") },
		{ column: "parish_id", method: row => row.extract("parish") },
		{ column: "quality", method: row => row.extract("osgrdind") },
		{ column: "constituency_id", method: row => row.extract("pcon") },
		{ column: "european_electoral_region", method: row => european_registers[row.extract("eer")] },
		{ column: "region", method: row => regions[row.extract("rgn")] },
		{ column: "primary_care_trust", method: row => pcts[row.extract("pct")] },
		{ column: "lsoa", method: row => lsoa[row.extract("lsoa11")] },
		{ column: "msoa", method: row => msoa[row.extract("msoa11")] },
		{ column: "nuts_id", method: row => row.extract("nuts") },
		{ column: "incode", method: row => row.extract("pcds").split(" ")[1] },
		{ column: "outcode", method: row => row.extract("pcds").split(" ")[0] },
		{ column: "ced_id", method: row => row.extract("ced") },
		{ column: "ccg_id", method: row => row.extract("ccg") },
	]);

	this._csvSeed({ 
		filepath, 
		transform: row => {
			row.extract = code => extractOnspdVal(row, code); // Append csv extraction logic
			if (row.extract("pcd") === "pcd") return null; // Skip if header
			if (row.extract("doterm").length !== 0) return null; // Skip row if terminated
			return ONSPD_COL_MAPPINGS.map(elem => elem.method(row));
		},
		columns: ONSPD_COL_MAPPINGS.map(elem => elem.column).join(","),
	}, callback);
};

Postcode.prototype.populateLocation = populateLocation;

module.exports = new Postcode();
