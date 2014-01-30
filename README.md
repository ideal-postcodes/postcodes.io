[![Build Status](https://travis-ci.org/ideal-postcodes/postcodes.io.png)](https://travis-ci.org/ideal-postcodes/postcodes.io) 
[![Dependency Status](https://gemnasium.com/ideal-postcodes/postcodes.io.png)](https://gemnasium.com/ideal-postcodes/postcodes.io)

# Postcodes.io

**Fast, Easy to Use, and not-so-RESTful**

Open source postcode API server using [Codepoint Open](https://www.ordnancesurvey.co.uk/opendatadownload/products.html) addressing Data

Currently still a work in progress.

## Design & Intent for this Project

1. **Make this thing *FAST* on low-end [virtual] machines.** 
2. **Make it *EASY* to setup and deploy.** 
3. **Make API methods more *USEFUL* at the expense of being RESTFUL.** 

Contributions are welcome. Please ensure pull requests come with tests.

Something wrong? Please do create a Github issue and I'll take a look when I can.

## API Methods

As you can see, these methods aren't designed so much to be RESTful. It's designed to be **useful** with endpoints tailored to use cases I see most often in my day-to-day work.

The end result is less data fiddling as methods are tuned for a specific job and less documentation as the URIs are allowed to be more descriptive.

### GET postcodes.io/v1/postcodes

Requires a query parameter, q (e.g. /v1/postcodes?q=NG228TX). Returns a list of matching or nearest matching postcodes with associated data

### GET postcodes.io/v1/postcodes/:postcode 

Lookup a postcode, returning associated data.

### POST postcodes.io/v1/postcodes

Bulk postcode lookup by posting JSON array of postcodes.

### GET postcodes.io/v1/postcodes/:postcode/validate

Convenience method to validate a postcode against Ordance Survey's Data set. Returns True or False.

### GET postcodes.io/v1/postcodes/:postcode/autocomplete

Convenience method to autocomplete a postcode (default limit of 10). Returns an array of postcode strings.

### GET postcodes.io/v1/random/postcodes/:postcode 

Retrieve random postcode with associated data.

### GET postcodes.io/v1/random/postcodes?lonlat= (TODO)

Nearest postcodes within location specified.

## Requirements

- Node.js (>=0.10)
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

Import process takes about 5 minutes to complete. You need to have the [PostGIS extension availble for it to work](http://postgis.net/install).

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