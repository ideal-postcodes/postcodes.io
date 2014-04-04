[![Build Status](https://travis-ci.org/ideal-postcodes/postcodes.io.png)](https://travis-ci.org/ideal-postcodes/postcodes.io) 
[![Dependency Status](https://gemnasium.com/ideal-postcodes/postcodes.io.png)](https://gemnasium.com/ideal-postcodes/postcodes.io)

# Postcodes.io

Open source postcode API server using Codepoint Open and ONS Postcode Data.

Contributions and Github issues are welcome.

Documentation can be found at [postcodes.io](http://postcodes.io)

## Requirements

- Node 0.10
- Postgres (>= 9.1) with PostGIS extension

## Installation

**Download it**
```bash
$ git clone https://github.com/ideal-postcodes/postcodes.io.git

$ cd postcodes.io/

$ npm install && npm link
```

**Configure Postgres**

Ensure you have Postgres and with [PostGIS extension availble](http://postgis.net/install). Create a new database and a super user.

Update `config/config.js` with the above Postgres credentials. Pass in a postgresql superuser for the import process  (you can swap this with a user with reduced privileges later). You may update the config object for the development environment for simplicity.

**Import ONS Postcode Data**

Download the latest Office for National Statistic's "Postcode Lookup Dataset" ([in CSV here](https://geoportal.statistics.gov.uk/geoportal/catalog/main/home.page)). Unzip the data locally. Navigate to `postcodes.io/` and run `importons` passing the path to the CSV data.

It should look something like this:

```bash
$ importons /path/to/data/ONSPD/Data/data.csv
```

The import process takes around 10 minutes to complete. 

**Run it**

```
node server.js

// Default environment is development (NODE_ENV=development)
```



## Testing

```
npm test
```

## License 

MIT