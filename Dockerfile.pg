FROM mdillon/postgis:10-alpine

COPY latest /tmp/latest

RUN mkdir -p /docker-entrypoint-initdb.d/ && \
    apk add --no-cache curl && \
    curl -o /docker-entrypoint-initdb.d/_postcodesiodata.sql.gz $(cat /tmp/latest) 

