DATABASE_NAME="postcodesiodb"
USERNAME="postcodesio"
LATEST=`cat latest`

echo "Postcodes.io Database Setup Script"

# Gather user credentials with superuser privileges
echo "In order to create, setup and download your database we need Postgres user credentials with superuser privileges to carry out some operations.\n"
read -p "Please provide your Postgres Username: " POSTGRES_USER
PSQL="psql --username=$POSTGRES_USER"

# Create postgres user
# With thanks to Erwin Brandstetter (http://stackoverflow.com/questions/8092086/create-postgresql-role-user-if-it-doesnt-exist)

echo "Creating new user $USERNAME if it does not already exist..."

$PSQL -d $DATABASE_NAME --quiet --command="DO
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

sleep 1

# Create Database
echo "Creating new database called $DATABASE_NAME..."
if createdb -U $POSTGRES_USER $DATABASE_NAME
then
	echo "Done\n"
else
	echo "Failed to create database. Please check the error message and take action"
	exit 1
fi

# Grant Permissions on App User
$PSQL --command "GRANT SELECT ON ALL TABLES IN SCHEMA public TO postcodesio;"


sleep 1

# Download and install
echo "Dowloading latest ONS dataset and importing to Postgresql...\n"

wget -O - $LATEST | gunzip -c | $PSQL -v ON_ERROR_STOP=1 --quiet $DATABASE_NAME
echo "Done\n"
