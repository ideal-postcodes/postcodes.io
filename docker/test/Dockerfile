FROM node:14-alpine AS base

RUN apk update && \
  apk upgrade && \
  apk add --no-cache openssl bash git

ENV DOCKERIZE_VERSION v0.6.1
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz

COPY docker/test/entrypoint.sh /usr/bin/
ENTRYPOINT ["entrypoint.sh"]

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm install

ADD . /app

CMD tail
