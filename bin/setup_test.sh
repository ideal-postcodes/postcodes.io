DATABASE_NAME="postcodeio_testing"
USERNAME="postcodesio"
LATEST=`cat latest`

echo "Postcodes.io Database Setup Script"

# Gather user credentials with superuser privileges

if [ -z "$POSTGRES_USER" ];
then
	echo "In order to create, setup and download your database we need Postgres user credentials with superuser privileges to carry out some operations.\n"
	read -p "Please provide your Postgres Username:" POSTGRES_USER
fi

PSQL="psql --username=$POSTGRES_USER"

# CREATE POSTGRES USER
# With thanks to Erwin Brandstetter (http://stackoverflow.com/questions/8092086/create-postgresql-role-user-if-it-doesnt-exist)
echo "Creating new user $USERNAME if it does not already exist..."

$PSQL -d template1 --quiet --command="DO
\$body\$
BEGIN
   IF NOT EXISTS (
      SELECT *
      FROM   pg_catalog.pg_user
      WHERE  usename = '$USERNAME') THEN

      CREATE ROLE $USERNAME LOGIN PASSWORD 'password';
   END IF;
END
\$body\$"

echo "Done\n"

# CREATE DATABASE
echo "Creating new database called $DATABASE_NAME..."
if [ -z "$POSTGRES_USER" ];
then
	if createdb -O $USERNAME $DATABASE_NAME
	then
		echo "Done\n"
	else
		echo "Failed to create database. Please check the error message and take action"
		exit 1
	fi
else
	if createdb -U $POSTGRES_USER -O $USERNAME $DATABASE_NAME
	then
		echo "Done\n"
	else
		echo "Failed to create database. Please check the error message and take action"
		exit 1
	fi
fi

sleep 1

# Download and install
echo "Enabling Postgis"

$PSQL -d $DATABASE_NAME -c "CREATE EXTENSION IF NOT EXISTS postgis;"

echo "Enabling Unaccent Extension"

$PSQL -d $DATABASE_NAME -c "CREATE EXTENSION IF NOT EXISTS unaccent;"
