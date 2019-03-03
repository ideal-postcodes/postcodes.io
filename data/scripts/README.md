# Postcodes.io GSS Codes

The ONS Postcode Directory (ONSPD) dataset associates postcodes with administrative areas using GSS codes.

Since the names corresponding with each GSS code are not included in the ONSPD data file, these codes are primarily extracted from the `Documents/` directory which accompanies each ONSPD release.

The `data/` directory documents and controls how GSS codes are extracted and stored for this project. Scripts in `data/` have the following functions:

- Stores scripts which describe and document how GSS names and codes are retrieved from ONSPD `Documents/` directory
- Documents special cases for code extraction (inside of extraction script)
- Documents any files missing from ONSPD's `Documents/` which are necessary to generate the complete code file (inside of extraction script)
- Stores generic file parsing and transformation procedures required for extraction scripts
- Stores utility methods for testing the final output of extraction scripts (e.g. diffing new and old output files, scanning for missing GSS codes)

## What are GSS Codes

In the United Kingdom, the Office for National Statistics maintains a series of codes to represent a wide range of geographical areas of the UK, for use in tabulating census and other statistical data. These codes are referred to as ONS codes or GSS codes referring to the Government Statistical Service of which ONS is part.

[Click here for more information about the coding system](https://en.wikipedia.org/wiki/ONS_coding_system)

## Extraction Method

Each `<GSS feature>.js` file in `data/scripts/` documents how each GSS file is generated. It includes:

- The name(s) of the file to parse e.g. `MSOA (2011) names and codes UK as at 12_12.txt`
- How csv/tsv rows for the above file(s) are transformed into a GSS code and value. This is passed into the `extract` method as the `transform` attribute
- Documentation on special cases for each file and how it is handled. (e.g. malformed csv, excluding pseudocodes)

Upon completion, each script will write a JSON file with the GSS codes (key) and names (value) stored as a JSON object. This file will be written to the `data/scripts/` directory. The output should also be written with the attributes in alphanumeric (ascii) order to assist in diffing new output files.

## Running the script

```
node data/scripts/<gss_code_type>.js -d path/to/onspd/documents/ [-c name_of_output_file]
```

## Transform Function

When specifying a file to `extract`, an accompanying `transform` function is required to reduce an array of strings (corresponding to a row of the input file) into an array containing two GSS elements: ["GSS Code", "Name corresponding to code"].

For instance,

```
["E8973829", "Merseyside"]

will be included in the JSON output:

{
	...truncated...
	"E8973829": "Merseyside",
	...truncated...
}

```

To skip a row, simply return an empty array `[]`. This escape can be used to ignore header rows or ignore specific codes altogether (e.g. pseudocodes).
