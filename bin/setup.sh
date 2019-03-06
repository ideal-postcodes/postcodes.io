#!/usr/bin/env bash

set -o errexit
set -o errtrace
set -o nounset 
set -o pipefail

LATEST=`cat latest`

echo "Postcodes.io Database Setup Script"
echo "----------------------------------"
echo ""
echo "In order to create, setup and download your database we need Postgresql user credentials with superuser privileges to carry out some operations.\n"
echo "Your Postgresql user credentials will be used to:"
echo "- Create a new database"
echo "- Create a new Postgresql user and password for the new database. If user already exists this step is skipped"
echo "- Stream the latest pg_dump (at $LATEST) to your newly created database"
echo "- Apply read-only privileges for the new user to the new database"
echo ""


read -p "Postgresql Superuser (for database creation) [default: postgres]:" POSTGRES_SUPERUSER
POSTGRES_SUPERUSER=${POSTGRES_SUPERUSER:-postgres}

read -p "New Database Username (for readonly access) [default: postcodesio]:" POSTGRES_USER
POSTGRES_USER=${POSTGRES_USER:-postcodesio}

read -p "Password for new user [default: secret]:" POSTGRES_PASSWORD
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-secret}

read -p "Postgresql Host [default: localhost]:" POSTGRES_HOST
POSTGRES_HOST=${POSTGRES_HOST:-localhost}

read -p "Database Name [default: postcodesiodb]:" POSTGRES_DB
POSTGRES_DB=${POSTGRES_DB:-postcodesiodb}

read -p "Postgresql Port: [default: 5432]:" POSTGRES_PORT
POSTGRES_PORT=${POSTGRES_PORT:-5432}

PSQL="psql --username=$POSTGRES_SUPERUSER --host=$POSTGRES_HOST --port=$POSTGRES_PORT"

# Create postgres user
# With thanks to Erwin Brandstetter (http://stackoverflow.com/questions/8092086/create-postgresql-role-user-if-it-doesnt-exist)
echo "\nCreating new user $POSTGRES_USER if it does not already exist..."

$PSQL --quiet --command="DO
\$body\$
BEGIN
   IF NOT EXISTS (
      SELECT *
      FROM   pg_catalog.pg_user
      WHERE  usename = '$POSTGRES_USER') THEN

      CREATE ROLE $POSTGRES_USER LOGIN PASSWORD '$POSTGRES_PASSWORD';
   END IF;
END
\$body\$"

echo "Done\n"

sleep 1

# Create Database
echo "Creating new database called $POSTGRES_DB..."
if createdb -p $POSTGRES_PORT -h $POSTGRES_HOST -U $POSTGRES_SUPERUSER $POSTGRES_DB
then
	echo "Done\n"
else
	echo "Failed to create database. Please check the error message and take action"
	exit 1
fi

sleep 1

# Download and install
echo "Dowloading latest dataset and importing to Postgresql\n"
echo "Please wait a few minutes for this operation to finish...\n"
wget -O - $LATEST | gunzip -c | $PSQL --dbname=$POSTGRES_DB -v ON_ERROR_STOP=1 --quiet
echo "Done\n"

# Grant Permissions on App User
echo "Granting read (SELECT) permissions on new user..."

COMMAND="GRANT CONNECT ON DATABASE $POSTGRES_DB TO $POSTGRES_USER; \
GRANT SELECT ON ALL TABLES IN SCHEMA public TO $POSTGRES_USER; \
"
if echo $COMMAND | $PSQL --dbname=$POSTGRES_DB
then
	echo "Done\n"
else
	echo "Failed to grant privileges. Please check the error message and take action"
	exit 1
fi

echo "Database setup is complete"
echo ""
echo "Run the API server with the right database credentials to proceed:"
echo "POSTGRES_USER=$POSTGRES_USER POSTGRES_DB=$POSTGRES_DB POSTGRES_PASSWORD=$POSTGRES_PASSWORD POSTGRES_HOST=$POSTGRES_HOST npm start"
echo "Alternatively update those credentials in your .env file"
