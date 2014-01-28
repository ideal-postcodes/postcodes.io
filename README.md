[![Build Status](https://travis-ci.org/ideal-postcodes/postcodes.io.png)](https://travis-ci.org/ideal-postcodes/postcodes.io) 
[![Code Climate](https://codeclimate.com/repos/52d88d51e30ba078f9001b29/badges/f5840d2160a8a2772f6c/gpa.png)](https://codeclimate.com/repos/52d88d51e30ba078f9001b29/feed)
[![Dependency Status](https://gemnasium.com/ideal-postcodes/postcodes.io.png)](https://gemnasium.com/ideal-postcodes/postcodes.io)

# Postcodes.io

Open source postcode API server using [Codepoint Open](https://www.ordnancesurvey.co.uk/opendatadownload/products.html) addressing Data

A work in progress

## Requirements

- Node.js (>=0.10)
- Postgres with PostGIS extension

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

Download Codepoint Open Data ([link here](https://www.ordnancesurvey.co.uk/opendatadownload/products.html)) and run the following commands in postcodes.io/ to seed your database with postcode data

```bash
$ preparedb # Creates required relations in your specified DB path

$ importcpo /path/to/csv/data/ # Point to a local copy of Codepoint Open CSV Data folder
```

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