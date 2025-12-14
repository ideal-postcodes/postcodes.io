#!/bin/bash

# Generate seed postcodes.csv from ONSPD file
# Usage: ./generate_seed_postcodes.sh <input_onspd.csv> [output_postcodes.csv]

set -e

if [ $# -lt 1 ]; then
    echo "Usage: $0 <input_onspd.csv> [output_postcodes.csv]"
    exit 1
fi

INPUT_FILE="$1"
OUTPUT_FILE="${2:-postcode.csv}"

if [ ! -f "$INPUT_FILE" ]; then
    echo "Error: Input file '$INPUT_FILE' not found"
    exit 1
fi

# Write header
head -1 "$INPUT_FILE" > "$OUTPUT_FILE"

# Append all AB1 postcodes and specific postcodes
# Using awk for efficiency - matches AB1 at start of line or specific postcodes
awk -F',' 'NR > 1 {
    # Check if first field starts with "AB1 or AB1
    if ($1 ~ /^"?AB1/) {
        print
    }
    # Check for specific postcodes (with or without quotes, various spacing)
    else if ($1 ~ /^"?SE1P ?5ZZ"?$/ ||
             $1 ~ /^"?SE1 +9ZZ"?$/ ||
             $1 ~ /^"?JE2 +4WD"?$/ ||
             $1 ~ /^"?M11 +1AA"?$/ ||
             $1 ~ /^"?M1 +1AD"?$/ ||
             $1 ~ /^"?SE1 +2DL"?$/) {
        print
    }
}' "$INPUT_FILE" >> "$OUTPUT_FILE"

echo "Generated $OUTPUT_FILE"
wc -l "$OUTPUT_FILE"
