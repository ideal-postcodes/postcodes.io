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
	}
};
