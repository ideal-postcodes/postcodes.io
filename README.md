[![Build Status](https://travis-ci.org/ideal-postcodes/postcodes.io.png)](https://travis-ci.org/ideal-postcodes/postcodes.io) 
[![Dependency Status](https://gemnasium.com/ideal-postcodes/postcodes.io.png)](https://gemnasium.com/ideal-postcodes/postcodes.io)

# Postcodes.io

Open source postcode API server using [Codepoint Open](https://www.ordnancesurvey.co.uk/opendatadownload/products.html) addressing Data

Currently still a work in progress.

Contributions are welcome. Please ensure pull requests come with tests.

Something wrong? Please do create a Github issue and I'll take a look when I can.

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

Update `config/config.js` with your Postgresql credentials. Note that in order to import Code, Postgresql user must also be superuser (at least when importing Codepoint Open to Postgresql).

**Import Codepoint Open Data**

Download Codepoint Open Data ([in CSV format here](https://www.ordnancesurvey.co.uk/opendatadownload/products.html)). Unzip the data locally. Navigate to `postcodes.io/` and run `importcpo` passing  directory containing the CSV data.

It should look something like this:

```bash
$ importcpo /path/to/data/codepo_gb/Data/CSV
```

Import process takes around 5 minutes to complete. You also the [PostGIS extension availble](http://postgis.net/install).

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