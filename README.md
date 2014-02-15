[![Build Status](https://travis-ci.org/ideal-postcodes/postcodes.io.png)](https://travis-ci.org/ideal-postcodes/postcodes.io) 
[![Dependency Status](https://gemnasium.com/ideal-postcodes/postcodes.io.png)](https://gemnasium.com/ideal-postcodes/postcodes.io)

# Postcodes.io

Open source postcode API server using Codepoint Open and ONS addressing Data

Contributions and Github issues are welcome.

Documentation can be found at [postcodes.io](http://postcodes.io)

## Requirements

- Node 0.10
- Postgres (>9.1) with PostGIS extension

## Installation

**Download it**
```bash
$ git clone https://github.com/ideal-postcodes/postcodes.io.git

$ cd postcodes.io/

$ npm install
```

**Configure it**

Update `config/config.js` with your Postgresql credentials. Note that in order to import Code, Postgresql user must also be superuser for the import process.

**Import ONS Postcode Data**

Download the lastest Office for National Statistics postcode lookup dataset ([in CSV format here](https://geoportal.statistics.gov.uk/geoportal/catalog/main/home.page)). Unzip the data locally. Navigate to `postcodes.io/` and run `importons` passing the path to the CSV data.

It should look something like this:

```bash
$ importons /path/to/data/ONSPD/Data/data.csv
```

Import process takes around 10 minutes to complete. You also the [PostGIS extension availble](http://postgis.net/install).

**Run it**

```
node server.js
```

## Testing

```
npm test
```

## License 

MIT