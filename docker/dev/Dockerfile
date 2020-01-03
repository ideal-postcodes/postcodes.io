FROM mdillon/postgis:10

ARG PCIO_DB_NAME=postcodesiodb
ENV PCIO_DB_NAME $PCIO_DB_NAME

COPY init.sh /docker-entrypoint-initdb.d/init.sh
