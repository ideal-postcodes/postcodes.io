#!/bin/bash

DATABASE_NAME="boundary_testing"
USERNAME="postcodesio"
PSQL="psql --username=$POSTGRES_USER $DATABASE_NAME"
DATA_PATH=$1
PGSHIP="shp2pgsql -s 27700:4326 -G"

echo "Loading boundaries from" DATA_PATH

echo "Enabling Postgis"

$PSQL -d $DATABASE_NAME -c "CREATE EXTENSION IF NOT EXISTS postgis;"

echo "Enabling Unaccent Extension"

$PSQL -d $DATABASE_NAME -c "CREATE EXTENSION IF NOT EXISTS unaccent;"

SHAPE_FILES=(
	"county_electoral_division_region"
	"county_region"
	"district_borough_unitary_region"
	"district_borough_unitary_ward_region"
	"european_region_region"
	"greater_london_const_region"
	"high_water_polyline"
	"parish_region"
	"scotland_and_wales_const_region"
	"scotland_and_wales_region_region"
	"unitary_electoral_division_region"
	"westminster_const_region"
)

for i in "${SHAPE_FILES[@]}"
do
	echo "Inserting boundary for $i"
	TABLE="public."$i
	$PGSHIP $DATA_PATH$i $TABLE | $PSQL > /dev/null
done
