const {
  NEAREST_RADIUS_DEFAULT,
  NEAREST_RADIUS_MAX,
  NEAREST_LIMIT_DEFAULT,
  NEAREST_LIMIT_MAX,
  SEARCH_LIMIT_DEFAULT,
  SEARCH_LIMIT_MAX,
  BULKGEOCODE_GEOLOCATIONS_MAX,
  BULKGEOCODE_GEOLOCATIONS_ASYNC_LIMIT,
  BULKGEOCODE_GEOLOCATIONS_TIMEOUT,
  BULKLOOKUPS_POSTCODES_MAX,
  BULKLOOKUPS_POSTCODES_ASYNC_LIMIT,
  BULKLOOKUPS_POSTCODES_TIMEOUT,
  NEARESTOUTCODES_RADIUS_DEFAULT,
  NEARESTOUTCODES_RADIUS_MAX,
  NEARESTOUTCODES_LIMIT_DEFAULT,
  NEARESTOUTCODES_LIMIT_MAX,
  PLACESSEARCH_LIMIT_DEFAULT,
  PLACESSEARCH_LIMIT_MAX,
  PLACESCONTAINED_LIMIT_DEFAULT,
  PLACESCONTAINED_LIMIT_MAX,
  PLACESNEAREST_LIMIT_DEFAULT,
  PLACESNEAREST_LIMIT_MAX,
  PLACESNEAREST_RADIUS_DEFAULT,
  PLACESNEAREST_RADIUS_MAX,
} = process.env;

const { parseEnv } = require("../app/lib/env");

module.exports = {
  nearest: {
    radius: {
      DEFAULT: parseEnv(NEAREST_RADIUS_DEFAULT, 100),
      MAX: parseEnv(NEAREST_RADIUS_MAX, 2000),
    },
    limit: {
      DEFAULT: parseEnv(NEAREST_LIMIT_DEFAULT, 10),
      MAX: parseEnv(NEAREST_LIMIT_MAX, 100),
    },
  },
  search: {
    limit: {
      DEFAULT: parseEnv(SEARCH_LIMIT_DEFAULT, 10),
      MAX: parseEnv(SEARCH_LIMIT_MAX, 100),
    },
  },
  bulkGeocode: {
    geolocations: {
      MAX: parseEnv(BULKGEOCODE_GEOLOCATIONS_MAX, 100), // Maximum number of geolocations per request
      ASYNC_LIMIT: parseEnv(BULKGEOCODE_GEOLOCATIONS_ASYNC_LIMIT, null), // Maximum number of parallel DB queries per request
      TIMEOUT: parseEnv(BULKGEOCODE_GEOLOCATIONS_TIMEOUT, 30000), // Maximum interval to run a single bulk request
    },
  },
  bulkLookups: {
    postcodes: {
      MAX: parseEnv(BULKLOOKUPS_POSTCODES_MAX, 100), // Maximum number of postcodes per request
      ASYNC_LIMIT: parseEnv(BULKLOOKUPS_POSTCODES_ASYNC_LIMIT, null), // Maximum number of parallel DB queries per request
      TIMEOUT: parseEnv(BULKLOOKUPS_POSTCODES_TIMEOUT, 30000), // Maximum interval to run a single bulk request
    },
  },
  nearestOutcodes: {
    radius: {
      DEFAULT: parseEnv(NEARESTOUTCODES_RADIUS_DEFAULT, 5000),
      MAX: parseEnv(NEARESTOUTCODES_RADIUS_MAX, 25000),
    },
    limit: {
      DEFAULT: parseEnv(NEARESTOUTCODES_LIMIT_DEFAULT, 10),
      MAX: parseEnv(NEARESTOUTCODES_LIMIT_MAX, 100),
    },
  },
  placesSearch: {
    limit: {
      DEFAULT: parseEnv(PLACESSEARCH_LIMIT_DEFAULT, 10),
      MAX: parseEnv(PLACESSEARCH_LIMIT_MAX, 100),
    },
  },
  placesContained: {
    limit: {
      DEFAULT: parseEnv(PLACESCONTAINED_LIMIT_DEFAULT, 10),
      MAX: parseEnv(PLACESCONTAINED_LIMIT_MAX, 100),
    },
  },
  placesNearest: {
    limit: {
      DEFAULT: parseEnv(PLACESNEAREST_LIMIT_DEFAULT, 10),
      MAX: parseEnv(PLACESNEAREST_LIMIT_MAX, 100),
    },
    radius: {
      DEFAULT: parseEnv(PLACESNEAREST_RADIUS_DEFAULT, 1000),
      MAX: parseEnv(PLACESNEAREST_RADIUS_MAX, 10000),
    },
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
    "nuts",
    "ced",
  ],
};
