"use strict";

const { join } = require("path");
const rootPath = join(__dirname, "../");
const defaults = require("./defaults");
const defaultEnv = process.env.NODE_ENV || "development";

const config = {

	/*
	* Development Environment (Default) Configuration Object ($ node server.js)
	* 
	* This is the default environment. i.e. it's the environment config when the
	* server is booted up with `$ node server.js`
	*
	* The only action you need to take here is to add your Postgres credentials.
	* You also need to create the database yourself and pass in the database name.
	* Note that the specified user needs to be a superuser for the import process.
	* You may reduce user privileges after you've imported postcode data
	*
	*/ 

	development : {
		env : "development",
		root: rootPath,
		googleAnalyticsKey: "",
		postgres: {
			user: "postcodesio",
			password: "password",
			database: "postcodesiodb",	// Database name
			host: "localhost",
			port: 5432
		},
		log : {
      name : "postcodes.io",
      file: "stdout",
		}
	},

	/*
	* Test Environment (Optional, if you want to npm test)
	* 
	* Do not use the same Postgres credentials for the test database as your production
	* or development environments as this environment needs to reset the postcode table
	*
	*/ 

	test: {
		env : "test",
		root: rootPath,
		googleAnalyticsKey: "",
		postgres: {
			user: "postcodesio",
			password: "password",
			database: "postcodeio_testing",
			host: "localhost",
			port: 5432
		},
		log: {
			name : "postcodes.io",
      file: join(rootPath, "/test.log"),
		}
	},

	/*
	* Production Environment Configuration Object
	* 
	* This is the production environment. `$ NODE_ENV=production node server.js`
	*
	*/ 

	production : {
		env : "production",
		root: rootPath,
		googleAnalyticsKey: "",
		postgres: {
			user: "postcodesio",
			password: "password",
			database: "postcodesiodb",
			host: "localhost",
			port: 5432
		},
		log : {
			name : "postcodes.io",
      file: "extreme", // Use pino.extreme
		}
	}
};

module.exports = env => {
  const environment = env || defaultEnv;

	const cfg = config[environment];

	cfg.defaults = defaults;

	if (process.env.PORT) {
		cfg.port = process.env.PORT;
	}

	if (process.env.MAPBOX_PUBLIC_KEY || !cfg.mapBoxKey) {
		cfg.mapBoxKey = process.env.MAPBOX_PUBLIC_KEY || "";	
	}

	if (process.env.POSTGRES_USER) {
		cfg.postgres.user = process.env.POSTGRES_USER;
	}

	if (process.env.POSTGRES_PASSWORD) {
		cfg.postgres.password = process.env.POSTGRES_PASSWORD;
	}

	if (process.env.POSTGRES_DATABASE) {
		cfg.postgres.database = process.env.POSTGRES_DATABASE;
	}	

	if (process.env.POSTGRES_HOST) {
		cfg.postgres.host = process.env.POSTGRES_HOST;
	}

	if (process.env.POSTGRES_PORT) {
		cfg.postgres.port = process.env.POSTGRES_PORT;
	}

	return cfg;
};
