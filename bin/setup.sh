DATABASE_NAME="postcodesiodb"
USERNAME="postcodesio"
LATEST=`cat latest`

echo "Postcodes.io Database Setup Script"

# Gather user credentials with superuser privileges
echo "In order to create, setup and download your database we need Postgres user credentials with superuser privileges to carry out some operations.\n"
read -p "Please provide your Postgres Username: [leave blank if your default user has superuser privileges] " POSTGRES_USER
if [ -z "$POSTGRES_USER" ];
then
	PSQL="psql"
else
	PSQL="psql --username=$POSTGRES_USER"
fi

# Create postgres user
# With thanks to Erwin Brandstetter (http://stackoverflow.com/questions/8092086/create-postgresql-role-user-if-it-doesnt-exist)

echo "Creating new user $USERNAME if it does not already exist..."

$PSQL --quiet --command="DO
\$body\$
BEGIN
   IF NOT EXISTS (
      SELECT *
      FROM   pg_catalog.pg_user
      WHERE  usename = '$USERNAME') THEN

      CREATE ROLE $USERNAME LOGIN PASSWORD '';
   END IF;
END
\$body\$"

echo "Done\n"

sleep 1

# Create Database

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
echo "Dowloading latest ONS dataset and importing to Postgresql...\n"

wget -O - $LATEST | gunzip -c | $PSQL -v ON_ERROR_STOP=1 --quiet $DATABASE_NAME
echo "Done\n"
