module.exports = {
	nearest: {
		radius: {
			DEFAULT: 100,
			MAX: 2000
		},
		limit: {
			DEFAULT: 10,
			MAX: 100
		}
	},
	search: {
		limit: {
			DEFAULT: 10,
			MAX: 100
		}
	},
	bulkGeocode: {
		geolocations: {
			MAX: 100
		}
	},
	bulkLookups: {
		postcodes: {
			MAX: 100
		}
	},
	nearestOutcodes: {
		radius: {
			DEFAULT: 5000,
			MAX: 25000
		},
		limit: {
			DEFAULT: 10,
			MAX: 100
		}
	},
	placesSearch: {
		limit: {
			DEFAULT: 10,
			MAX: 100
		}
	},
	placesContained: {
		limit: {
			DEFAULT: 10,
			MAX: 100
		}
	},
	placesNearest: {
		limit: {
			DEFAULT: 10,
			MAX: 100
		},
		radius: {
			DEFAULT: 1000,
			MAX: 10000
		}
	},
	filterableAttributes: [
		"postcode",
		"quality",
		"eastings",
		"northings",
		"country",
		"nhs_ha",
		"longitude",
		"latitude",
		"parliamentary_constituency",
		"european_electoral_region",
		"primary_care_trust",
		"region",
		"lsoa",
		"msoa",
		"incode",
		"outcode",
		"codes",
		"admin_district",
		"parish",
		"admin_county",
		"admin_ward",
		"ccg",
		"nuts"
	]
};
